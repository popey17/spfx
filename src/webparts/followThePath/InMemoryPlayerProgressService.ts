import type { IPlayerProgressService } from './IPlayerProgressService';
import {
  buildFollowThePathProgressFromSession,
  createDefaultPlayerProgress,
  followThePathProgressToRecord,
  type GameSessionResult,
  type PlayerProgressRecord
} from './playerProgressTypes';

/** Local fallback when SharePoint progress is unavailable (e.g. workbench). */
export class InMemoryPlayerProgressService implements IPlayerProgressService {
  private _record: PlayerProgressRecord = createDefaultPlayerProgress();

  public async loadForCurrentUser(): Promise<PlayerProgressRecord> {
    return {
      ...this._record,
      earnedQuestionSlots: [...this._record.earnedQuestionSlots]
    };
  }

  public async saveAfterGame(session: GameSessionResult): Promise<void> {
    const totalXp = this._record.totalXp + session.xpGainedThisSession;
    const totalCoins = this._record.totalCoins + session.coinsCollected;
    const game = buildFollowThePathProgressFromSession(session);
    this._record = followThePathProgressToRecord(game, totalXp, totalCoins);
  }
}
