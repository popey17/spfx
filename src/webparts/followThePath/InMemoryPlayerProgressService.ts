import type { IPlayerProgressService } from './IPlayerProgressService';
import {
  buildFollowThePathProgressFromSession,
  createDefaultPlayerProgress,
  createDefaultUserProfile,
  followThePathProgressToRecord,
  USERS_LIST_CONFIG,
  writeUserTotalsToBody,
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
      market: input.market,
      busu: input.busu
    };
    return this._profile;
  }

  public async saveAfterGame(session: GameSessionResult): Promise<void> {
    const game = buildFollowThePathProgressFromSession(session);

    if (this._profile) {
      const fields = USERS_LIST_CONFIG.fields;
      const usersBody = writeUserTotalsToBody(
        this._profile,
        session.coinsCollected,
        session.xpGainedInLevel,
        session.completedLevel
      );
      this._profile = {
        ...this._profile,
        totalCoin: Number(usersBody[fields.totalCoin]),
        totalXp: Number(usersBody[fields.totalXp]),
        game1Level1Xp: Number(usersBody[fields.game1Level1Xp]),
        game1Level2Xp: Number(usersBody[fields.game1Level2Xp]),
        game1Level3Xp: Number(usersBody[fields.game1Level3Xp])
      };
    }

    const totalXp = this._profile?.totalXp || 0;
    const totalCoins = this._profile?.totalCoin || 0;

    this._record = followThePathProgressToRecord(game, totalXp, totalCoins, {
      usersListItemId: this._profile?.listItemId,
      game1DataListItemId: this._record.game1DataListItemId
    });
  }
}
