import { SPHttpClient, type SPHttpClientResponse } from '@microsoft/sp-http';
import type { WebPartContext } from '@microsoft/sp-webpart-base';

import { readUserProfileFromListItem, USERS_LIST_CONFIG } from '../followThePath/playerProgressTypes';
import type { ILeaderboardService } from './ILeaderboardService';
import { LOBT_LIST_CONFIG, type LobtTypeRow } from './lobtListConfig';
import { buildIndividualRanking, buildLobtRankingFromTotals, resolveUserLeaderboardStatus } from './leaderboardRanking';
import type { LeaderboardData, UserLeaderBoardData, UsersListRow } from './leaderboardTypes';
import {
  LEADERBOARD_USER_INDIVIDUAL_TOP_LIMIT,
  LEADERBOARD_USER_LOBT_TOP_LIMIT
} from './leaderboardTypes';

export interface SharePointLeaderboardServiceOptions {
  /** Users list — player names and XP. Defaults to Users. */
  usersListTitle?: string;
  /** LOBT reference list — department types. Defaults to LOBT. */
  lobtListTitle?: string;
  /** Maximum rows for the individual tab. Defaults to 20. */
  topCount?: number;
  /** Maximum rows for the LOBT tab. Defaults to 5. */
  lobtTopCount?: number;
}

interface IListQueryOptions {
  listTitle: string;
  select: string;
  expand?: string;
  filter?: string;
  orderBy?: string;
  top?: number;
}

/**
 * Loads leaderboard rankings without reading the full Users list.
 * - Individual tab: one query for top N users by TotalXP.
 * - LOBT tab: read LOBT types, then one filtered Users query per LOBT to sum XP.
 */
export class SharePointLeaderboardService implements ILeaderboardService {
  private readonly _context: WebPartContext;
  private readonly _usersListTitle: string;
  private readonly _lobtListTitle: string;
  private readonly _topCount: number;
  private readonly _lobtTopCount: number;

  public constructor(context: WebPartContext, options: SharePointLeaderboardServiceOptions = {}) {
    this._context = context;
    this._usersListTitle = options.usersListTitle || USERS_LIST_CONFIG.listTitle;
    this._lobtListTitle = options.lobtListTitle || LOBT_LIST_CONFIG.listTitle;
    this._topCount = options.topCount ?? 20;
    this._lobtTopCount = options.lobtTopCount ?? 5;
  }

  public async loadLeaderboard(): Promise<LeaderboardData> {
    const lobtTypes = await this._fetchActiveLobtTypes();
    lobtTypes.forEach((lobt, index) => {
    });

    const individualRows = await this._fetchIndividualTopUsers();
    individualRows.forEach((row, index) => {
    });

    const lobtTotals = await this._sumXpByLobtTypes(lobtTypes);
    lobtTotals.forEach((total, index) => {
    });

    return {
      individual: buildIndividualRanking(individualRows, this._topCount),
      lobt: buildLobtRankingFromTotals(lobtTotals, this._lobtTopCount)
    };
  }

  /** Resolve whether the signed-in user is in the individual top 50 and LOBT top 10. */
  public async loadUserLeaderboardStatus(email: string, userLobt: string): Promise<UserLeaderBoardData> {
    const lobtTypes = await this._fetchActiveLobtTypes();
    const individualRows = await this._fetchIndividualTopUsers(LEADERBOARD_USER_INDIVIDUAL_TOP_LIMIT);
    const lobtTotals = await this._sumXpByLobtTypes(lobtTypes);

    return resolveUserLeaderboardStatus(
      email,
      userLobt,
      individualRows,
      lobtTotals,
      LEADERBOARD_USER_INDIVIDUAL_TOP_LIMIT,
      LEADERBOARD_USER_LOBT_TOP_LIMIT
    );
  }

  private async _fetchActiveLobtTypes(): Promise<LobtTypeRow[]> {
    const fields = LOBT_LIST_CONFIG.fields;
    const filter = `${fields.status} eq '${this._escapeODataString(LOBT_LIST_CONFIG.activeStatus)}'`;
    const items = await this._fetchListItems({
      listTitle: this._lobtListTitle,
      select: [fields.id, fields.title, fields.status, fields.orderNo].join(','),
      filter,
      orderBy: `${fields.orderNo} asc`,
      top: 500
    });

    const rows: LobtTypeRow[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const title = String(item[fields.title] || '').trim();
      if (!title) {
        continue;
      }

      rows.push({
        id: this._toNumber(item[fields.id]),
        title,
        orderNo: this._toNumber(item[fields.orderNo])
      });
    }

    return rows;
  }

  private async _fetchIndividualTopUsers(topCount: number = this._topCount): Promise<UsersListRow[]> {
    const fields = USERS_LIST_CONFIG.fields;
    // TotalXP is calculated — SharePoint cannot $orderby it, so fetch and sort client-side.
    const select = [
      fields.id,
      fields.title,
      fields.email,
      `${fields.lobt}/Title`,
      fields.totalXp,
      fields.miniQuestXp,
      fields.masteryQuestXp,
      fields.game1Level1Xp,
      fields.game1Level2Xp,
      fields.game1Level3Xp
    ].join(',');

    const items = await this._fetchListItems({
      listTitle: this._usersListTitle,
      select,
      expand: fields.lobt,
      top: 5000
    });

    const rows = items.map((item) => this._toUsersListRow(item));
    rows.sort((a, b) => b.totalXp - a.totalXp || a.title.localeCompare(b.title));
    return rows.slice(0, topCount);
  }

  private async _sumXpByLobtTypes(
    lobtTypes: LobtTypeRow[]
  ): Promise<Array<{ lobt: string; xp: number; orderNo: number; playerCount: number }>> {
    const totals: Array<{ lobt: string; xp: number; orderNo: number; playerCount: number }> = [];

    for (let i = 0; i < lobtTypes.length; i++) {
      const lobtType = lobtTypes[i];
      const summary = await this._sumXpForLobt(lobtType);
      totals.push({
        lobt: lobtType.title,
        xp: summary.totalXp,
        orderNo: lobtType.orderNo,
        playerCount: summary.userCount
      });
    }

    return totals;
  }

  private async _sumXpForLobt(lobtType: LobtTypeRow): Promise<{ totalXp: number; userCount: number }> {
    const fields = USERS_LIST_CONFIG.fields;
    const escapedTitle = this._escapeODataString(lobtType.title);
    const queryAttempts: IListQueryOptions[] = [
      {
        listTitle: this._usersListTitle,
        select: fields.totalXp,
        filter: `${fields.lobt}Id eq ${lobtType.id}`,
        top: 5000
      },
      {
        listTitle: this._usersListTitle,
        select: fields.totalXp,
        filter: `${fields.lobt}/Id eq ${lobtType.id}`,
        expand: fields.lobt,
        top: 5000
      },
      {
        listTitle: this._usersListTitle,
        select: fields.totalXp,
        filter: `${fields.lobt}/Title eq '${escapedTitle}'`,
        expand: fields.lobt,
        top: 5000
      }
    ];

    let lastError: string | undefined;

    for (let i = 0; i < queryAttempts.length; i++) {
      try {
        const items = await this._fetchListItems(queryAttempts[i]);

        let totalXp = 0;
        for (let j = 0; j < items.length; j++) {
          totalXp += this._toNumber(items[j][fields.totalXp]);
        }

        return {
          totalXp,
          userCount: items.length
        };
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error);
        console.warn(
          '[Leaderboard] LOBT user query failed.',
          { lobt: lobtType.title, query: queryAttempts[i] },
          lastError
        );
      }
    }

    console.warn(`[Leaderboard] Could not sum XP for LOBT "${lobtType.title}".`, lastError);
    return { totalXp: 0, userCount: 0 };
  }

  private async _fetchListItems(options: IListQueryOptions): Promise<Array<Record<string, unknown>>> {
    const items: Array<Record<string, unknown>> = [];
    let nextUrl = this._buildListItemsUrl(options);

    while (nextUrl) {
      const response: SPHttpClientResponse = await this._context.spHttpClient.get(
        nextUrl,
        SPHttpClient.configurations.v1
      );

      if (!response.ok) {
        throw new Error(await this._readSharePointError(response, `Failed to load list "${options.listTitle}".`));
      }

      const payload = (await response.json()) as {
        value?: Array<Record<string, unknown>>;
        '@odata.nextLink'?: string;
        'odata.nextLink'?: string;
      };

      if (payload.value && payload.value.length > 0) {
        items.push(...payload.value);
      }

      nextUrl = payload['@odata.nextLink'] || payload['odata.nextLink'] || '';
    }

    return items;
  }

  private _buildListItemsUrl(options: IListQueryOptions): string {
    const listTitle = this._escapeODataString(options.listTitle);
    let url =
      `${this._context.pageContext.web.absoluteUrl}` +
      `/_api/web/lists/getbytitle('${listTitle}')/items` +
      `?$select=${encodeURIComponent(options.select)}`;

    if (options.filter) {
      url += `&$filter=${encodeURIComponent(options.filter)}`;
    }

    if (options.orderBy) {
      url += `&$orderby=${encodeURIComponent(options.orderBy)}`;
    }

    if (options.expand) {
      url += `&$expand=${encodeURIComponent(options.expand)}`;
    }

    url += `&$top=${options.top || 200}`;
    return url;
  }

  private _toUsersListRow(item: Record<string, unknown>): UsersListRow {
    const profile = readUserProfileFromListItem(item);

    return {
      id: profile.listItemId || 0,
      title: profile.title,
      email: profile.email,
      lobt: profile.lobt,
      totalXp: profile.totalXp
    };
  }

  private async _readSharePointError(response: SPHttpClientResponse, fallback: string): Promise<string> {
    try {
      const text = await response.text();
      if (!text) {
        return `${fallback} (HTTP ${response.status})`;
      }

      const payload = JSON.parse(text) as { error?: { message?: { value?: string } } };
      const message = payload.error?.message?.value;
      return message ? `${fallback} ${message}` : `${fallback} ${text}`;
    } catch {
      return `${fallback} (HTTP ${response.status})`;
    }
  }

  private _toNumber(value: unknown): number {
    const parsed = typeof value === 'number' ? value : parseInt(String(value), 10);
    return isNaN(parsed) ? 0 : parsed;
  }

  private _escapeODataString(value: string): string {
    return value.replace(/'/g, "''");
  }
}
