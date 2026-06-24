import type { IPlayerProgressService, DailyHeartsUpdate, ShopPurchaseUpdate } from './IPlayerProgressService';
import {
  buildFollowThePathProgressFromSession,
  createDefaultPlayerProgress,
  createDefaultUserProfile,
  followThePathProgressToRecord,
  mergeFollowThePathProgressForSave,
  getGame1LevelXpTotals,
  computeUserTotalXp,
  resolveDailyHearts,
  applyAchievementSessionUpdate,
  mergeGameAchievementsForSave,
  buildFollowThePathGameProgressUpdateFromSession,
  updateFollowThePathInUserGameData,
  USERS_TOTAL_PLAYED_GAME_COUNT_MAX,
  type AchievementSessionUpdate,
  type FollowThePathProgressData,
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
    const sessionProgress = buildFollowThePathProgressFromSession(session);
    const serverProgress: FollowThePathProgressData = {
      highScore: this._record.highScore,
      level: this._record.level,
      levelXp: this._record.levelXp,
      earnedQuestionSlots: this._record.earnedQuestionSlots,
      freeModeUnlocked: this._record.freeModeUnlocked,
      heartsRemaining: this._record.heartsRemaining,
      heartsDay: this._record.heartsDay
    };
    const game = mergeFollowThePathProgressForSave(sessionProgress, serverProgress);
    const coinsEarned = Math.max(0, session.coinsCollected);
    const totalCoin = (this._profile?.totalCoin || 0) + coinsEarned;
    const totalCoinEarned = (this._profile?.totalCoinEarned || 0) + coinsEarned;

    if (this._profile) {
      const levelXp = getGame1LevelXpTotals(game.earnedQuestionSlots);
      this._profile = {
        ...this._profile,
        totalCoin,
        totalCoinEarned,
        game1Level1Xp: Math.max(this._profile.game1Level1Xp, levelXp.game1Level1Xp),
        game1Level2Xp: Math.max(this._profile.game1Level2Xp, levelXp.game1Level2Xp),
        game1Level3Xp: Math.max(this._profile.game1Level3Xp, levelXp.game1Level3Xp)
      };
      this._profile.totalXp = computeUserTotalXp(this._profile);
    }

    const totalXp = this._profile?.totalXp || 0;
    const sessionAchievements = session.achievementUpdate
      ? applyAchievementSessionUpdate(this._record.achievements, session.achievementUpdate)
      : this._record.achievements;
    const achievements = mergeGameAchievementsForSave(sessionAchievements, this._record.achievements);

    this._record = followThePathProgressToRecord(game, totalXp, totalCoin, {
      usersListItemId: this._profile?.listItemId,
      game1DataListItemId: this._record.game1DataListItemId
    }, achievements);
  }

  public async saveAchievements(update: AchievementSessionUpdate): Promise<void> {
    const serverFirstTimePlay = this._record.achievements.firstTimePlay;
    const sessionAchievements = applyAchievementSessionUpdate(this._record.achievements, update);
    const achievements = mergeGameAchievementsForSave(sessionAchievements, this._record.achievements);

    if (update.markFirstPlay && !serverFirstTimePlay && this._profile) {
      this._profile = {
        ...this._profile,
        totalPlayedGameCount: Math.min(
          this._profile.totalPlayedGameCount + 1,
          USERS_TOTAL_PLAYED_GAME_COUNT_MAX
        )
      };
    }

    const gameProgressUpdate = buildFollowThePathGameProgressUpdateFromSession(update);

    if (gameProgressUpdate && this._profile) {
      this._profile = {
        ...this._profile,
        gameProgressJson: updateFollowThePathInUserGameData(this._profile.gameProgressJson, gameProgressUpdate)
      };
    }

    this._record = {
      ...this._record,
      achievements
    };
  }

  public async saveDailyHearts(update: DailyHeartsUpdate): Promise<void> {
    const hearts = resolveDailyHearts(update.heartsRemaining, update.heartsDay);
    this._record = {
      ...this._record,
      heartsRemaining: hearts.heartsRemaining,
      heartsDay: hearts.heartsDay
    };
  }

  public async saveShopPurchase(update: ShopPurchaseUpdate): Promise<number> {
    const latestCoin = this._profile?.totalCoin ?? this._record.totalCoins;

    if (latestCoin < update.coinCost) {
      throw new Error('[FollowThePath] Insufficient coins for shop purchase.');
    }

    const hearts = resolveDailyHearts(update.heartsRemaining, update.heartsDay);
    const newTotalCoin = Math.max(0, latestCoin - update.coinCost);

    if (this._profile) {
      this._profile = {
        ...this._profile,
        totalCoin: newTotalCoin
      };
      this._profile.totalXp = computeUserTotalXp(this._profile);
    }

    this._record = {
      ...this._record,
      heartsRemaining: hearts.heartsRemaining,
      heartsDay: hearts.heartsDay,
      totalCoins: newTotalCoin
    };

    return newTotalCoin;
  }

  public async refreshSpendableCoins(): Promise<number> {
    return this._profile?.totalCoin ?? this._record.totalCoins;
  }
}
