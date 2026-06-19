import type { IPlayerProgressService, DailyHeartsUpdate, ShopPurchaseUpdate } from './IPlayerProgressService';
import {
  buildFollowThePathProgressFromSession,
  createDefaultPlayerProgress,
  createDefaultUserProfile,
  followThePathProgressToRecord,
  getGame1LevelXpTotals,
  computeUserTotalXp,
  resolveDailyHearts,
  type GameSessionResult,
  type PlayerSession,
  type UserProfileRecord,
  type UserRegistrationInput
} from './playerProgressTypes';

/** Local fallback when SharePoint progress is unavailable (e.g. workbench). */
export class InMemoryPlayerProgressService implements IPlayerProgressService {
  private _profile: UserProfileRecord | undefined;
  private _record = createDefaultPlayerProgress();

  public async loadSession(): Promise<PlayerSession> {
    return {
      profile: this._profile,
      progress: {
        ...this._record,
        earnedQuestionSlots: [...this._record.earnedQuestionSlots]
      },
      needsRegistration: !this._profile
    };
  }

  public async registerUser(input: UserRegistrationInput): Promise<UserProfileRecord> {
    this._profile = {
      ...createDefaultUserProfile(input.email, input.title),
      lobt: input.lobt,
      market: input.market
    };
    return this._profile;
  }

  public async saveAfterGame(session: GameSessionResult): Promise<void> {
    const game = buildFollowThePathProgressFromSession(session);
    const totalCoins = (this._profile?.totalCoin || 0) + session.coinsCollected;

    if (this._profile) {
      const levelXp = getGame1LevelXpTotals(game.earnedQuestionSlots);
      this._profile = {
        ...this._profile,
        totalCoin: totalCoins,
        game1Level1Xp: levelXp.game1Level1Xp,
        game1Level2Xp: levelXp.game1Level2Xp,
        game1Level3Xp: levelXp.game1Level3Xp
      };
      this._profile.totalXp = computeUserTotalXp(this._profile);
    }

    const totalXp = this._profile?.totalXp || 0;

    this._record = followThePathProgressToRecord(game, totalXp, totalCoins, {
      usersListItemId: this._profile?.listItemId,
      game1DataListItemId: this._record.game1DataListItemId
    });
  }

  public async saveDailyHearts(update: DailyHeartsUpdate): Promise<void> {
    const hearts = resolveDailyHearts(update.heartsRemaining, update.heartsDay);
    this._record = {
      ...this._record,
      heartsRemaining: hearts.heartsRemaining,
      heartsDay: hearts.heartsDay
    };
  }

  public async saveShopPurchase(update: ShopPurchaseUpdate): Promise<void> {
    const hearts = resolveDailyHearts(update.heartsRemaining, update.heartsDay);
    const nextCoins = Math.max(0, (this._profile?.totalCoin ?? this._record.totalCoins) - update.coinCost);

    if (this._profile) {
      this._profile = {
        ...this._profile,
        totalCoin: nextCoins
      };
      this._profile.totalXp = computeUserTotalXp(this._profile);
    }

    this._record = {
      ...this._record,
      heartsRemaining: hearts.heartsRemaining,
      heartsDay: hearts.heartsDay,
      totalCoins: nextCoins
    };
  }
}
