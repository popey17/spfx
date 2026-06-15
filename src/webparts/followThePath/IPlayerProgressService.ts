import type { GameSessionResult, PlayerProgressRecord } from './playerProgressTypes';

export interface IPlayerProgressService {
  /** Load saved progress for the signed-in SharePoint user. */
  loadForCurrentUser(): Promise<PlayerProgressRecord>;

  /**
   * Persist progress after a game ends.
   * Implementations should upsert the user's list item.
   */
  saveAfterGame(session: GameSessionResult): Promise<void>;
}
