import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import type { WebPartContext } from '@microsoft/sp-webpart-base';

import type { IPlayerProgressService } from './IPlayerProgressService';
import {
  buildFollowThePathProgressFromSession,
  createDefaultPlayerProgress,
  followThePathProgressToRecord,
  readFollowThePathProgressFromListItem,
  SHARED_PLAYER_LIST_CONFIG,
  writeFollowThePathProgressToBody,
  type GameSessionResult,
  type PlayerProgressRecord
} from './playerProgressTypes';

export interface SharePointPlayerProgressServiceOptions {
  listTitle?: string;
}

/**
 * Reads/writes a shared per-user row in SharePoint.
 * Shared columns: UserEmail, TotalXp, TotalCoins.
 * Follow the Path uses its own prefixed columns (see SHARED_PLAYER_LIST_CONFIG.followThePath).
 * Other games add their own column groups — this service only touches FTP + shared fields.
 */
export class SharePointPlayerProgressService implements IPlayerProgressService {
  private readonly _context: WebPartContext;
  private readonly _listTitle: string;
  private _listItemId: number | undefined;
  private _totalXp: number = 0;
  private _totalCoins: number = 0;

  public constructor(context: WebPartContext, options: SharePointPlayerProgressServiceOptions = {}) {
    this._context = context;
    this._listTitle = options.listTitle || SHARED_PLAYER_LIST_CONFIG.listTitle;
  }

  public async loadForCurrentUser(): Promise<PlayerProgressRecord> {
    const userEmail = this._context.pageContext.user.email;

    if (!userEmail) {
      return createDefaultPlayerProgress();
    }

    const item = await this._fetchUserListItem(userEmail);

    if (!item) {
      this._listItemId = undefined;
      this._totalXp = 0;
      this._totalCoins = 0;
      return createDefaultPlayerProgress();
    }

    const shared = SHARED_PLAYER_LIST_CONFIG.sharedFields;
    this._listItemId = this._toOptionalId(item[shared.id]);
    this._totalXp = this._toNumber(item[shared.totalXp]);
    this._totalCoins = this._toNumber(item[shared.totalCoins]);

    const followThePath = readFollowThePathProgressFromListItem(item);
    return followThePathProgressToRecord(followThePath, this._totalXp, this._totalCoins);
  }

  public async saveAfterGame(session: GameSessionResult): Promise<void> {
    const userEmail = this._context.pageContext.user.email;

    if (!userEmail) {
      return;
    }

    await this._ensureUserListItemLoaded(userEmail);

    const shared = SHARED_PLAYER_LIST_CONFIG.sharedFields;
    const followThePath = buildFollowThePathProgressFromSession(session);
    const newTotalXp = this._totalXp + session.xpGainedThisSession;
    const newTotalCoins = this._totalCoins + session.coinsCollected;

    const body: Record<string, string | number | boolean> = {
      [shared.userEmail]: userEmail,
      [shared.totalXp]: newTotalXp,
      [shared.totalCoins]: newTotalCoins,
      ...writeFollowThePathProgressToBody(followThePath)
    };

    if (this._listItemId !== undefined) {
      await this._patchListItem(this._listItemId, body);
      this._totalXp = newTotalXp;
      this._totalCoins = newTotalCoins;
      return;
    }

    await this._createListItem(body);
    this._totalXp = newTotalXp;
    this._totalCoins = newTotalCoins;
  }

  private async _ensureUserListItemLoaded(userEmail: string): Promise<void> {
    if (this._listItemId !== undefined) {
      return;
    }

    const item = await this._fetchUserListItem(userEmail);
    const shared = SHARED_PLAYER_LIST_CONFIG.sharedFields;

    if (!item) {
      this._totalXp = 0;
      this._totalCoins = 0;
      return;
    }

    this._listItemId = this._toOptionalId(item[shared.id]);
    this._totalXp = this._toNumber(item[shared.totalXp]);
    this._totalCoins = this._toNumber(item[shared.totalCoins]);
  }

  private _getSelectFields(): string[] {
    const shared = SHARED_PLAYER_LIST_CONFIG.sharedFields;
    const ftp = SHARED_PLAYER_LIST_CONFIG.followThePath;

    return [
      shared.id,
      shared.userEmail,
      shared.totalXp,
      shared.totalCoins,
      ftp.highScore,
      ftp.level,
      ftp.levelXp,
      ftp.earnedQuestions,
      ftp.freeModeUnlocked
    ];
  }

  private async _fetchUserListItem(userEmail: string): Promise<Record<string, unknown> | undefined> {
    const shared = SHARED_PLAYER_LIST_CONFIG.sharedFields;
    const filter = encodeURIComponent(`${shared.userEmail} eq '${this._escapeODataString(userEmail)}'`);
    const select = encodeURIComponent(this._getSelectFields().join(','));
    const url =
      `${this._context.pageContext.web.absoluteUrl}` +
      `/_api/web/lists/getbytitle('${this._escapeODataString(this._listTitle)}')/items` +
      `?$filter=${filter}&$select=${select}&$top=1`;

    const response: SPHttpClientResponse = await this._context.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1
    );

    if (!response.ok) {
      throw new Error('Failed to load player progress from SharePoint list.');
    }

    const payload = (await response.json()) as { value?: Array<Record<string, unknown>> };
    return payload.value && payload.value.length > 0 ? payload.value[0] : undefined;
  }

  private async _createListItem(body: Record<string, string | number | boolean>): Promise<void> {
    const shared = SHARED_PLAYER_LIST_CONFIG.sharedFields;
    const url =
      `${this._context.pageContext.web.absoluteUrl}` +
      `/_api/web/lists/getbytitle('${this._escapeODataString(this._listTitle)}')/items`;

    const response = await this._context.spHttpClient.post(url, SPHttpClient.configurations.v1, {
      headers: {
        Accept: 'application/json;odata=nometadata',
        'Content-type': 'application/json;odata=nometadata',
        'odata-version': ''
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error('Failed to create player progress list item.');
    }

    const created = (await response.json()) as Record<string, unknown>;
    this._listItemId = this._toOptionalId(created[shared.id]);
  }

  private async _patchListItem(itemId: number, body: Record<string, string | number | boolean>): Promise<void> {
    const url =
      `${this._context.pageContext.web.absoluteUrl}` +
      `/_api/web/lists/getbytitle('${this._escapeODataString(this._listTitle)}')/items(${itemId})`;

    const response = await this._context.spHttpClient.post(url, SPHttpClient.configurations.v1, {
      headers: {
        Accept: 'application/json;odata=nometadata',
        'Content-type': 'application/json;odata=nometadata',
        'odata-version': '',
        'IF-MATCH': '*',
        'X-HTTP-Method': 'MERGE'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error('Failed to update player progress list item.');
    }
  }

  private _toNumber(value: unknown): number {
    const parsed = typeof value === 'number' ? value : parseInt(String(value), 10);
    return isNaN(parsed) ? 0 : parsed;
  }

  private _toOptionalId(value: unknown): number | undefined {
    if (typeof value === 'number' && !isNaN(value)) {
      return value;
    }

    const parsed = parseInt(String(value), 10);
    return isNaN(parsed) ? undefined : parsed;
  }

  private _escapeODataString(value: string): string {
    return value.replace(/'/g, "''");
  }
}
