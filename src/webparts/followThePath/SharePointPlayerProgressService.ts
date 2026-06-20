import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import type { WebPartContext } from '@microsoft/sp-webpart-base';

import { MAX_LIVES } from './gameConfig';
import type { IPlayerProgressService, DailyHeartsUpdate, ShopPurchaseUpdate } from './IPlayerProgressService';
import {
  buildFollowThePathProgressFromSession,
  createDefaultFollowThePathProgress,
  createDefaultPlayerProgress,
  followThePathProgressToRecord,
  GAME1_DATA_LIST_CONFIG,
  readFollowThePathProgressFromListItem,
  readUserProfileFromListItem,
  isUserProfileComplete,
  USERS_LIST_CONFIG,
  writeFollowThePathProgressCreateBody,
  writeFollowThePathProgressToBody,
  writeUserRegistrationBody,
  writeUserTotalsToBody,
  writeUserCoinSpendBody,
  writeUserTotalPlayedGameCountIncrementBody,
  writeDailyHeartsToBody,
  getUsersListScalarSelectFieldsForGame1,
  getDailyHeartsDayKey,
  resolveDailyHearts,
  createEmptyEarnedQuestionSlots,
  serializeEarnedQuestionSlots,
  computeUserTotalXp,
  mergeFollowThePathProgressForSave,
  readGameAchievementsFromListItem,
  writeGameAchievementsToBody,
  applyAchievementSessionUpdate,
  mergeGameAchievementsForSave,
  getGameAchievementSelectFields,
  createDefaultGameAchievementData,
  type FollowThePathProgressData,
  type GameAchievementData,
  type GameSessionResult,
  type AchievementSessionUpdate,
  type PlayerSession,
  type UserProfileRecord,
  type UserRegistrationInput
} from './playerProgressTypes';

export interface SharePointPlayerProgressServiceOptions {
  usersListTitle?: string;
  game1DataListTitle?: string;
  /** Email for Users/Game1Data lookup (?email= URL param or signed-in user). */
  lookupEmail?: string;
}

/**
 * Users list: profile + cross-game totals (keyed by Email).
 * Game1Data list: Follow the Path progress (Email links to Users.Email).
 */
export class SharePointPlayerProgressService implements IPlayerProgressService {
  private readonly _context: WebPartContext;
  private readonly _usersListTitle: string;
  private readonly _game1DataListTitle: string;
  private readonly _lookupEmail: string;
  private _profile: UserProfileRecord | undefined;
  private _game1DataListItemId: number | undefined;
  private _achievementData: GameAchievementData = createDefaultGameAchievementData();

  public constructor(context: WebPartContext, options: SharePointPlayerProgressServiceOptions = {}) {
    this._context = context;
    this._usersListTitle = options.usersListTitle || USERS_LIST_CONFIG.listTitle;
    this._game1DataListTitle = options.game1DataListTitle || GAME1_DATA_LIST_CONFIG.listTitle;
    this._lookupEmail = options.lookupEmail || context.pageContext.user.email || '';
  }

  public async loadSession(): Promise<PlayerSession> {
    const email = this._getCurrentEmail();

    if (!email) {
      return {
        profile: undefined,
        progress: createDefaultPlayerProgress(),
        needsRegistration: true
      };
    }

    const userItem = await this._fetchUsersListItem(email);

    if (!userItem) {
      this._profile = undefined;
      this._game1DataListItemId = undefined;
      return {
        profile: undefined,
        progress: createDefaultPlayerProgress(),
        needsRegistration: true
      };
    }

    this._profile = readUserProfileFromListItem(userItem);
    const gameItem = await this._fetchGame1DataListItem(email);
    const followThePath = gameItem
      ? readFollowThePathProgressFromListItem(gameItem)
      : createDefaultFollowThePathProgress();
    this._achievementData = gameItem
      ? readGameAchievementsFromListItem(gameItem)
      : createDefaultGameAchievementData();

    this._game1DataListItemId = gameItem
      ? this._toOptionalId(gameItem[GAME1_DATA_LIST_CONFIG.fields.id])
      : undefined;

    return {
      profile: this._profile,
      progress: followThePathProgressToRecord(
        followThePath,
        this._profile.totalXp,
        this._profile.totalCoin,
        {
          usersListItemId: this._profile.listItemId,
          game1DataListItemId: this._game1DataListItemId
        },
        this._achievementData
      ),
      needsRegistration: !isUserProfileComplete(this._profile)
    };
  }

  public async registerUser(input: UserRegistrationInput): Promise<UserProfileRecord> {
    const created = await this._createListItem(this._usersListTitle, writeUserRegistrationBody(input));
    this._profile = {
      ...readUserProfileFromListItem(created),
      lobt: input.lobt,
      market: input.market
    };
    this._game1DataListItemId = undefined;

    await this._ensureGame1DataRow(input.email);

    return this._profile;
  }

  public async saveAfterGame(session: GameSessionResult): Promise<void> {
    const email = this._getCurrentEmail();

    if (!email) {
      return;
    }

    const serverSnapshot = await this._refreshLatestFromList(email);

    if (!this._profile) {
      return;
    }

    await this._ensureGame1DataRow(email);

    const sessionProgress = buildFollowThePathProgressFromSession(session);
    const followThePath = mergeFollowThePathProgressForSave(sessionProgress, serverSnapshot.progress);
    const sessionAchievements = session.achievementUpdate
      ? applyAchievementSessionUpdate(this._achievementData, session.achievementUpdate)
      : this._achievementData;
    const achievements = mergeGameAchievementsForSave(sessionAchievements, serverSnapshot.achievements);
    const usersBody = writeUserTotalsToBody(
      this._profile,
      followThePath.earnedQuestionSlots,
      session.coinsCollected
    );
    const gameBody = {
      ...writeFollowThePathProgressToBody(followThePath),
      ...writeGameAchievementsToBody(achievements)
    };

    if (this._profile.listItemId !== undefined) {
      await this._patchListItem(this._usersListTitle, this._profile.listItemId, usersBody);
    }

    if (this._game1DataListItemId !== undefined) {
      await this._patchListItem(this._game1DataListTitle, this._game1DataListItemId, gameBody);
    } else {
      const created = await this._createListItem(
        this._game1DataListTitle,
        {
          ...writeFollowThePathProgressCreateBody(followThePath, email),
          ...writeGameAchievementsToBody(achievements)
        }
      );
      this._game1DataListItemId = this._toOptionalId(created[GAME1_DATA_LIST_CONFIG.fields.id]);
    }

    this._profile = {
      ...this._profile,
      totalCoin: this._toNumber(usersBody[USERS_LIST_CONFIG.fields.totalCoin]),
      totalCoinEarned: this._toNumber(usersBody[USERS_LIST_CONFIG.fields.totalCoinEarned]),
      game1Level1Xp: this._toNumber(usersBody[USERS_LIST_CONFIG.fields.game1Level1Xp]),
      game1Level2Xp: this._toNumber(usersBody[USERS_LIST_CONFIG.fields.game1Level2Xp]),
      game1Level3Xp: this._toNumber(usersBody[USERS_LIST_CONFIG.fields.game1Level3Xp])
    };
    this._profile.totalXp = computeUserTotalXp(this._profile);
    this._achievementData = achievements;
  }

  public async saveAchievements(update: AchievementSessionUpdate): Promise<void> {
    const email = this._getCurrentEmail();

    if (!email || !this._profile) {
      return;
    }

    await this._ensureGame1DataRow(email);

    const serverSnapshot = await this._refreshLatestFromList(email);
    const serverFirstTimePlay = serverSnapshot.achievements?.firstTimePlay === true;
    const sessionAchievements = applyAchievementSessionUpdate(this._achievementData, update);
    const achievements = mergeGameAchievementsForSave(sessionAchievements, serverSnapshot.achievements);
    const gameBody = writeGameAchievementsToBody(achievements);

    if (
      update.markFirstPlay &&
      !serverFirstTimePlay &&
      this._profile.listItemId !== undefined
    ) {
      const usersBody = writeUserTotalPlayedGameCountIncrementBody(this._profile);
      await this._patchListItem(this._usersListTitle, this._profile.listItemId, usersBody);
      this._profile = {
        ...this._profile,
        totalPlayedGameCount: this._toNumber(usersBody[USERS_LIST_CONFIG.fields.totalPlayedGameCount])
      };
    }

    if (this._game1DataListItemId !== undefined) {
      await this._patchListItem(this._game1DataListTitle, this._game1DataListItemId, gameBody);
    } else {
      const created = await this._createListItem(this._game1DataListTitle, {
        Title: email,
        [GAME1_DATA_LIST_CONFIG.fields.email]: email,
        ...gameBody
      });
      this._game1DataListItemId = this._toOptionalId(created[GAME1_DATA_LIST_CONFIG.fields.id]);
    }

    this._achievementData = achievements;
  }

  public async saveDailyHearts(update: DailyHeartsUpdate): Promise<void> {
    const email = this._getCurrentEmail();

    if (!email) {
      return;
    }

    await this._ensureGame1DataRow(email);

    const resolved = resolveDailyHearts(update.heartsRemaining, update.heartsDay);
    const body = writeDailyHeartsToBody(resolved.heartsRemaining, resolved.heartsDay);

    if (this._game1DataListItemId !== undefined) {
      await this._patchListItem(this._game1DataListTitle, this._game1DataListItemId, body);
    }
  }

  public async saveShopPurchase(update: ShopPurchaseUpdate): Promise<number> {
    const email = this._getCurrentEmail();

    if (!email || !this._profile) {
      throw new Error('[FollowThePath] Cannot save shop purchase without a player profile.');
    }

    await this._ensureGame1DataRow(email);

    const userItem = await this._fetchUsersListItem(email);

    if (!userItem) {
      throw new Error('[FollowThePath] User row not found for shop purchase.');
    }

    const latestProfile = readUserProfileFromListItem(userItem);
    this._profile = {
      ...this._profile,
      ...latestProfile,
      listItemId: latestProfile.listItemId ?? this._profile.listItemId
    };

    if (latestProfile.totalCoin < update.coinCost) {
      throw new Error('[FollowThePath] Insufficient coins for shop purchase.');
    }

    const resolved = resolveDailyHearts(update.heartsRemaining, update.heartsDay);
    const heartsBody = writeDailyHeartsToBody(resolved.heartsRemaining, resolved.heartsDay);
    const coinBody = writeUserCoinSpendBody(latestProfile, update.coinCost);
    const newTotalCoin = this._toNumber(coinBody[USERS_LIST_CONFIG.fields.totalCoin]);

    if (this._profile.listItemId !== undefined) {
      await this._patchListItem(this._usersListTitle, this._profile.listItemId, coinBody);
    }

    if (this._game1DataListItemId !== undefined) {
      await this._patchListItem(this._game1DataListTitle, this._game1DataListItemId, heartsBody);
    }

    this._profile = {
      ...this._profile,
      totalCoin: newTotalCoin
    };
    this._profile.totalXp = computeUserTotalXp(this._profile);

    return newTotalCoin;
  }

  public async refreshSpendableCoins(): Promise<number> {
    const email = this._getCurrentEmail();

    if (!email) {
      return this._profile?.totalCoin ?? 0;
    }

    const userItem = await this._fetchUsersListItem(email);

    if (!userItem) {
      return this._profile?.totalCoin ?? 0;
    }

    const latestProfile = readUserProfileFromListItem(userItem);

    if (this._profile) {
      this._profile = {
        ...this._profile,
        totalCoin: latestProfile.totalCoin,
        totalCoinEarned: latestProfile.totalCoinEarned
      };
    }

    return latestProfile.totalCoin;
  }

  private async _refreshLatestFromList(email: string): Promise<{
    progress: FollowThePathProgressData | undefined;
    achievements: GameAchievementData | undefined;
  }> {
    const userItem = await this._fetchUsersListItem(email);

    if (!userItem) {
      this._profile = undefined;
      this._game1DataListItemId = undefined;
      this._achievementData = createDefaultGameAchievementData();
      return {
        progress: undefined,
        achievements: undefined
      };
    }

    this._profile = readUserProfileFromListItem(userItem);

    if (!isUserProfileComplete(this._profile)) {
      console.warn(
        '[FollowThePath] User profile is incomplete (LOBT and Market are required).',
        {
          email: this._profile.email,
          lobt: this._profile.lobt,
          market: this._profile.market
        }
      );
    }

    const gameItem = await this._fetchGame1DataListItem(email);

    if (!gameItem) {
      this._game1DataListItemId = undefined;
      this._achievementData = createDefaultGameAchievementData();
      return {
        progress: undefined,
        achievements: undefined
      };
    }

    this._game1DataListItemId = this._toOptionalId(gameItem[GAME1_DATA_LIST_CONFIG.fields.id]);
    this._achievementData = readGameAchievementsFromListItem(gameItem);

    return {
      progress: readFollowThePathProgressFromListItem(gameItem),
      achievements: this._achievementData
    };
  }

  private async _ensureGame1DataRow(email: string): Promise<void> {
    if (this._game1DataListItemId !== undefined) {
      return;
    }

    const gameItem = await this._fetchGame1DataListItem(email);

    if (gameItem) {
      this._game1DataListItemId = this._toOptionalId(gameItem[GAME1_DATA_LIST_CONFIG.fields.id]);
      return;
    }

    const fields = GAME1_DATA_LIST_CONFIG.fields;
    const emptySlots = createEmptyEarnedQuestionSlots();
    const heartsDay = getDailyHeartsDayKey();
    const created = await this._createListItem(this._game1DataListTitle, {
      Title: email,
      [fields.email]: email,
      [fields.highScore]: 0,
      [fields.level]: '1',
      [fields.levelXp]: 0,
      [fields.earnedQuestions]: serializeEarnedQuestionSlots(emptySlots),
      [fields.freeModeUnlocked]: false,
      [fields.heartsRemaining]: MAX_LIVES,
      [fields.heartsDay]: heartsDay,
      ...writeGameAchievementsToBody(createDefaultGameAchievementData())
    });
    this._game1DataListItemId = this._toOptionalId(created[fields.id]);
  }

  private _getUsersScalarSelectFields(): string[] {
    return getUsersListScalarSelectFieldsForGame1();
  }

  private async _fetchUsersListItem(email: string): Promise<Record<string, unknown> | undefined> {
    const baseItem = await this._fetchListItemByEmail(
      this._usersListTitle,
      USERS_LIST_CONFIG.fields.email,
      this._getUsersScalarSelectFields(),
      email
    );

    if (!baseItem) {
      return undefined;
    }

    const itemId = this._toOptionalId(baseItem[USERS_LIST_CONFIG.fields.id]);
    if (itemId === undefined) {
      return baseItem;
    }

    const profileFields = await this._fetchUsersProfileFields(itemId);
    return {
      ...baseItem,
      ...profileFields
    };
  }

  /**
   * Market is a lookup — it must use $expand. LOBT may be text or lookup depending on the list.
   */
  private async _fetchUsersProfileFields(itemId: number): Promise<Record<string, unknown>> {
    const fields = USERS_LIST_CONFIG.fields;
    const attempts: Array<{ select: string; expand: string }> = [
      {
        select: `${fields.lobt}/Title,${fields.market}/Title`,
        expand: `${fields.lobt},${fields.market}`
      },
      {
        select: `${fields.lobt},${fields.market}/Title`,
        expand: fields.market
      },
      {
        select: `${fields.market}/Title`,
        expand: fields.market
      }
    ];

    for (let i = 0; i < attempts.length; i++) {
      const attempt = attempts[i];
      const url =
        `${this._context.pageContext.web.absoluteUrl}` +
        `/_api/web/lists/getbytitle('${this._escapeODataString(this._usersListTitle)}')/items(${itemId})` +
        `?$select=${encodeURIComponent(attempt.select)}&$expand=${encodeURIComponent(attempt.expand)}`;

      const response: SPHttpClientResponse = await this._context.spHttpClient.get(
        url,
        SPHttpClient.configurations.v1
      );

      if (response.ok) {
        return (await response.json()) as Record<string, unknown>;
      }
    }

    console.warn('[FollowThePath] Could not read LOBT/Market for user profile.');
    return {};
  }

  private _getGame1DataSelectFields(): string[] {
    const fields = GAME1_DATA_LIST_CONFIG.fields;
    return [
      fields.id,
      fields.email,
      fields.highScore,
      fields.level,
      fields.levelXp,
      fields.earnedQuestions,
      fields.freeModeUnlocked,
      fields.heartsRemaining,
      fields.heartsDay,
      ...getGameAchievementSelectFields()
    ];
  }

  private async _fetchGame1DataListItem(email: string): Promise<Record<string, unknown> | undefined> {
    return this._fetchListItemByEmail(
      this._game1DataListTitle,
      GAME1_DATA_LIST_CONFIG.fields.email,
      this._getGame1DataSelectFields(),
      email
    );
  }

  private async _fetchListItemByEmail(
    listTitle: string,
    emailField: string,
    selectFields: string[],
    email: string
  ): Promise<Record<string, unknown> | undefined> {
    const trimmedEmail = email.trim();
    const filterExpressions: string[] = [
      `${emailField} eq '${this._escapeODataString(trimmedEmail)}'`
    ];

    const lowerEmail = trimmedEmail.toLowerCase();
    if (lowerEmail !== trimmedEmail) {
      filterExpressions.push(`${emailField} eq '${this._escapeODataString(lowerEmail)}'`);
    }

    const selectVariants: string[][] = [selectFields];

    // If a column in $select is invalid, retry with a minimal field set.
    const minimalSelect = [emailField, 'Id'];
    if (selectFields.join(',') !== minimalSelect.join(',')) {
      selectVariants.push(minimalSelect);
    }

    for (let f = 0; f < filterExpressions.length; f++) {
      for (let s = 0; s < selectVariants.length; s++) {
        const item = await this._queryListItemByFilter(
          listTitle,
          filterExpressions[f],
          selectVariants[s]
        );

        if (item) {
          if (s > 0) {
            // Enrich minimal row with the full field set when possible.
            const itemId = this._toOptionalId(item.Id);
            if (itemId !== undefined && selectFields.length > minimalSelect.length) {
              const enriched = await this._queryListItemById(listTitle, itemId, selectFields);
              if (enriched) {
                return enriched;
              }
            }
          }

          return item;
        }
      }
    }

    return undefined;
  }

  private async _queryListItemByFilter(
    listTitle: string,
    filterExpression: string,
    selectFields: string[]
  ): Promise<Record<string, unknown> | undefined> {
    const filter = encodeURIComponent(filterExpression);
    const select = encodeURIComponent(selectFields.join(','));
    const url =
      `${this._context.pageContext.web.absoluteUrl}` +
      `/_api/web/lists/getbytitle('${this._escapeODataString(listTitle)}')/items` +
      `?$filter=${filter}&$select=${select}&$top=1`;

    const response: SPHttpClientResponse = await this._context.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1
    );

    if (!response.ok) {
      if (response.status === 401 || response.status === 403 || response.status >= 500) {
        throw new Error(await this._readSharePointError(response, `Failed to load list "${listTitle}".`));
      }

      console.warn(
        '[FollowThePath] List filter query failed; trying next strategy.',
        await this._readSharePointError(response, `List "${listTitle}".`)
      );
      return undefined;
    }

    const payload = (await response.json()) as { value?: Array<Record<string, unknown>> };
    return payload.value && payload.value.length > 0 ? payload.value[0] : undefined;
  }

  private async _queryListItemById(
    listTitle: string,
    itemId: number,
    selectFields: string[]
  ): Promise<Record<string, unknown> | undefined> {
    const select = encodeURIComponent(selectFields.join(','));
    const url =
      `${this._context.pageContext.web.absoluteUrl}` +
      `/_api/web/lists/getbytitle('${this._escapeODataString(listTitle)}')/items(${itemId})` +
      `?$select=${select}`;

    const response: SPHttpClientResponse = await this._context.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1
    );

    if (!response.ok) {
      console.warn(
        '[FollowThePath] Could not load list item fields by id.',
        await this._readSharePointError(response, `List "${listTitle}".`)
      );
      return undefined;
    }

    return (await response.json()) as Record<string, unknown>;
  }

  private async _createListItem(
    listTitle: string,
    body: Record<string, string | number | boolean>
  ): Promise<Record<string, unknown>> {
    const url =
      `${this._context.pageContext.web.absoluteUrl}` +
      `/_api/web/lists/getbytitle('${this._escapeODataString(listTitle)}')/items`;

    const response = await this._context.spHttpClient.post(url, SPHttpClient.configurations.v1, {
      headers: {
        Accept: 'application/json;odata=nometadata',
        'Content-type': 'application/json;odata=nometadata',
        'odata-version': ''
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(await this._readSharePointError(response, `Failed to create list item in "${listTitle}".`));
    }

    return (await response.json()) as Record<string, unknown>;
  }

  private async _patchListItem(
    listTitle: string,
    itemId: number,
    body: Record<string, string | number | boolean>
  ): Promise<void> {
    const url =
      `${this._context.pageContext.web.absoluteUrl}` +
      `/_api/web/lists/getbytitle('${this._escapeODataString(listTitle)}')/items(${itemId})`;

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
      throw new Error(await this._readSharePointError(response, `Failed to update list item in "${listTitle}".`));
    }
  }

  private _getCurrentEmail(): string {
    return this._lookupEmail;
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
