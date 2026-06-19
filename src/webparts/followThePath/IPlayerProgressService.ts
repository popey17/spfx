import type {
  GameSessionResult,
  PlayerSession,
  UserProfileRecord,
  UserRegistrationInput
} from './playerProgressTypes';

export interface DailyHeartsUpdate {
  heartsRemaining: number;
  heartsDay: string;
}

export interface IPlayerProgressService {
  /** Load user profile (Users list) and game progress (Game1Data list). */
  loadSession(): Promise<PlayerSession>;

  /** Create a new row in the Users list for first-time players. */
  registerUser(input: UserRegistrationInput): Promise<UserProfileRecord>;

  /** Persist Users totals and Game1Data after a completed game session. */
  saveAfterGame(session: GameSessionResult): Promise<void>;

  /** Persist daily hearts immediately after a life is lost. */
  saveDailyHearts(update: DailyHeartsUpdate): Promise<void>;
}
