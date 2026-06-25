import {
  MAX_QUESTION_LEVEL,
  MAX_LIVES,
  QUESTIONS_PER_LEVEL,
  TOTAL_QUESTION_COUNT,
  LEVEL_XP_REWARDS
} from './gameConfig';
import type { AchievementSessionUpdate, GameAchievementData } from './gameAchievementTypes';
import { createDefaultGameAchievementData } from './gameAchievementTypes';
import { getDailyHeartsDayKey } from './gameDateContext';
import type { UserLeaderBoardData } from '../leaderboard/leaderboardTypes';

export type { AchievementSessionUpdate, DailyGameStatusRecord, GameAchievementData } from './gameAchievementTypes';
export {
  applyAchievementSessionUpdate,
  createDefaultGameAchievementData,
  getGameAchievementSelectFields,
  mergeGameAchievementsForSave,
  readGameAchievementsFromListItem,
  writeGameAchievementsToBody
} from './gameAchievementTypes';
export { getDailyHeartsDayKey, parseDateOverrideFromUrl } from './gameDateContext';

/**
 * Users list — one row per player (profile + cross-game totals).
 * Game1Data list — Follow the Path progress, linked by Email.
 *
 * Users columns used by Follow the Path (SharePoint internal names):
 * | Title | Email | LOBT (Text or Lookup) | Market (Lookup — requires $expand) |
 * | TotalCoin | TotalCoinEarned | TotalXP (read-only) |
 * | TotalPlayedGameCount (internal name TotalPlayedGame) |
 * | MiniQuestXP | MasteryQuestXP |
 * | Game1Level1XP | Game1Level2XP | Game1Level3XP |
 * | LeaderBoardData (JSON — individual top 50 / LOBT top 10 status; synced on leaderboard open) |
 * | GameProgress (JSON — per-game stats, e.g. followThePath.played / correctAnswers; other keys preserved) |
 * | ActivityLog (JSON — cross-game milestone flags; only matching keys are set to true, existing keys preserved) |
 *
 * TotalCoin — spendable balance (increases on earn, decreases on spend e.g. shop).
 * TotalCoinEarned — lifetime coins earned; only ever increases.
 * TotalXP is read-only on the list — never written by this game.
 *
 * Game1Data columns:
 * | Email | FollowThePath_HighScore | FollowThePath_Level (Text) | FollowThePath_LevelXp |
 * | FollowThePath_EarnedQuestions | FTPFreeMode |
 * | FollowThePath_HeartsRemaining | FollowThePath_HeartsDay |
 * | FirstTimePlay | PlayedCount | RePlayAfterCompleted | DailyGameStatus (JSON) | FlawlessCampaignComplete |
 */
export const USERS_LIST_CONFIG = {
  listTitle: 'Users',
  fields: {
    id: 'Id',
    title: 'Title',
    email: 'Email',
    lobt: 'LOBT',
    market: 'Market',
    totalCoin: 'TotalCoin',
    totalCoinEarned: 'TotalCoinEarned',
    totalXp: 'TotalXP',
    miniQuestXp: 'MiniQuestXP',
    masteryQuestXp: 'MasteryQuestXP',
    game1Level1Xp: 'Game1Level1XP',
    game1Level2Xp: 'Game1Level2XP',
    game1Level3Xp: 'Game1Level3XP',
    /** Display name TotalPlayedGameCount; SharePoint StaticName is TotalPlayedGame. */
    totalPlayedGameCount: 'TotalPlayedGame',
    leaderBoardData: 'LeaderBoardData',
    /** Cross-game JSON blob (followThePath, complianceTower, etc.). Display name GameProgress. */
    gameProgress: 'GameProgress',
    /** Cross-game milestone flags shared by the portal. */
    activityLog: 'ActivityLog'
  }
} as const;

/** Maximum value allowed by the Users list TotalPlayedGameCount column. */
export const USERS_TOTAL_PLAYED_GAME_COUNT_MAX = 5;

/** Users scalar columns for Follow the Path (excludes LOBT/Market — loaded with $expand). */
export function getUsersListScalarSelectFieldsForGame1(): string[] {
  const fields = USERS_LIST_CONFIG.fields;
  return [
    fields.id,
    fields.title,
    fields.email,
    fields.totalCoin,
    fields.totalCoinEarned,
    fields.totalXp,
    fields.totalPlayedGameCount,
    fields.miniQuestXp,
    fields.masteryQuestXp,
    fields.game1Level1Xp,
    fields.game1Level2Xp,
    fields.game1Level3Xp,
    fields.leaderBoardData,
    fields.gameProgress,
    fields.activityLog
  ];
}

/** @deprecated Use getUsersListScalarSelectFieldsForGame1 — Market requires a separate $expand query. */
export function getUsersListSelectFieldsForGame1(): string[] {
  return getUsersListScalarSelectFieldsForGame1();
}

export const GAME1_DATA_LIST_CONFIG = {
  listTitle: 'Game1Data',
  fields: {
    id: 'Id',
    email: 'Email',
    highScore: 'FollowThePath_HighScore',
    level: 'FollowThePath_Level',
    levelXp: 'FollowThePath_LevelXp',
    earnedQuestions: 'FollowThePath_EarnedQuestions',
    freeModeUnlocked: 'FTPFreeMode',
    heartsRemaining: 'FollowThePath_HeartsRemaining',
    heartsDay: 'FollowThePath_HeartsDay'
  }
} as const;

/** @deprecated Use USERS_LIST_CONFIG */
export const SHARED_PLAYER_LIST_CONFIG = USERS_LIST_CONFIG;

export interface UserProfileRecord {
  listItemId?: number;
  title: string;
  email: string;
  lobt: string;
  market: string;
  totalCoin: number;
  totalCoinEarned: number;
  totalXp: number;
  miniQuestXp: number;
  masteryQuestXp: number;
  game1Level1Xp: number;
  game1Level2Xp: number;
  game1Level3Xp: number;
  totalPlayedGameCount: number;
  leaderBoardData?: UserLeaderBoardData;
  /** Raw Users list GameProgress JSON (followThePath stats merged in; other keys preserved). */
  gameProgressJson?: string;
  /** Raw Users list ActivityLog JSON (preserved except matching milestone flags). */
  activityLogJson?: string;
}

export interface FollowThePathProgressData {
  highScore: number;
  level: number;
  levelXp: number;
  earnedQuestionSlots: boolean[];
  freeModeUnlocked: boolean;
  heartsRemaining: number;
  heartsDay: string;
}

/** Progress for this game, plus shared cross-game totals from the Users list. */
export interface PlayerProgressRecord {
  usersListItemId?: number;
  game1DataListItemId?: number;
  totalXp: number;
  totalCoins: number;
  highScore: number;
  level: number;
  levelXp: number;
  earnedQuestionSlots: boolean[];
  freeModeUnlocked: boolean;
  heartsRemaining: number;
  heartsDay: string;
  achievements: GameAchievementData;
}

export interface PlayerSession {
  profile: UserProfileRecord | undefined;
  progress: PlayerProgressRecord;
  needsRegistration: boolean;
}

export interface UserRegistrationInput {
  title: string;
  email: string;
  lobt: string;
  market: string;
}

/** Payload sent to SharePoint after each completed game. */
export interface GameSessionResult {
  coinsCollected: number;
  highScore: number;
  level: number;
  xpGainedInLevel: number;
  xpGainedThisSession: number;
  earnedQuestionSlots: boolean[];
  freeModeUnlocked: boolean;
  heartsRemaining: number;
  heartsDay: string;
  achievementUpdate?: AchievementSessionUpdate;
}

export function resolveDailyHearts(
  heartsRemaining: number | undefined,
  heartsDay: string | undefined
): { heartsRemaining: number; heartsDay: string } {
  const today = getDailyHeartsDayKey();

  if (!heartsDay || heartsDay !== today) {
    return {
      heartsRemaining: MAX_LIVES,
      heartsDay: today
    };
  }

  const remaining =
    heartsRemaining === undefined || isNaN(heartsRemaining)
      ? MAX_LIVES
      : Math.max(0, Math.min(MAX_LIVES, heartsRemaining));

  return {
    heartsRemaining: remaining,
    heartsDay: today
  };
}

/** Apply daily heart rules when the game session opens (always full hearts for today). */
export function resolveDailyHeartsOnGameLoad(
  heartsRemaining: number | undefined,
  heartsDay: string | undefined
): { heartsRemaining: number; heartsDay: string } {
  const { heartsDay: todayKey } = resolveDailyHearts(heartsRemaining, heartsDay);

  return {
    heartsRemaining: MAX_LIVES,
    heartsDay: todayKey
  };
}

export function createEmptyEarnedQuestionSlots(): boolean[] {
  const slots: boolean[] = [];
  for (let i = 0; i < TOTAL_QUESTION_COUNT; i++) {
    slots.push(false);
  }
  return slots;
}

export function createDefaultFollowThePathProgress(): FollowThePathProgressData {
  const heartsDay = getDailyHeartsDayKey();
  return {
    highScore: 0,
    level: 1,
    levelXp: 0,
    earnedQuestionSlots: createEmptyEarnedQuestionSlots(),
    freeModeUnlocked: false,
    heartsRemaining: MAX_LIVES,
    heartsDay
  };
}

export function createDefaultUserProfile(email: string, title: string = ''): UserProfileRecord {
  return {
    title: title || email,
    email,
    lobt: '',
    market: '',
    totalCoin: 0,
    totalCoinEarned: 0,
    totalXp: 0,
    miniQuestXp: 0,
    masteryQuestXp: 0,
    game1Level1Xp: 0,
    game1Level2Xp: 0,
    game1Level3Xp: 0,
    totalPlayedGameCount: 0
  };
}

export function createDefaultPlayerProgress(): PlayerProgressRecord {
  const game = createDefaultFollowThePathProgress();
  return followThePathProgressToRecord(game, 0, 0);
}

export function isUserProfileComplete(profile: Pick<UserProfileRecord, 'lobt' | 'market'>): boolean {
  return profile.lobt.trim().length > 0 && profile.market.trim().length > 0;
}

function readListTextValue(item: Record<string, unknown>, ...keys: string[]): string {
  for (let i = 0; i < keys.length; i++) {
    const value = item[keys[i]];
    if (value === undefined || value === null) {
      continue;
    }

    if (typeof value === 'object' && !Array.isArray(value)) {
      const record = value as Record<string, unknown>;
      const nested = record.Title ?? record.Value ?? record.Label ?? record.title;
      if (nested !== undefined && nested !== null) {
        const text = String(nested).trim();
        if (text.length > 0) {
          return text;
        }
      }

      continue;
    }

    const text = String(value).trim();
    if (text.length > 0) {
      return text;
    }
  }

  return '';
}

export function getProgressLevelFromSlots(earnedQuestionSlots: boolean[]): number {
  for (let level = 1; level <= MAX_QUESTION_LEVEL; level++) {
    const start = (level - 1) * QUESTIONS_PER_LEVEL;
    for (let q = 0; q < QUESTIONS_PER_LEVEL; q++) {
      if (!earnedQuestionSlots[start + q]) {
        return level;
      }
    }
  }
  return MAX_QUESTION_LEVEL;
}

/** Level to start the next run — campaign uses unearned slots; free mode uses last saved level. */
export function getResumeLevelFromProgress(
  earnedQuestionSlots: boolean[],
  savedLevel: number
): number {
  const slots = parseEarnedQuestionSlots(earnedQuestionSlots);
  const campaignComplete = slots.every((earned) => earned);

  if (!campaignComplete) {
    return getProgressLevelFromSlots(slots);
  }

  const normalizedSavedLevel = typeof savedLevel === 'number' && !isNaN(savedLevel) ? savedLevel : 1;
  return Math.max(1, Math.min(MAX_QUESTION_LEVEL, normalizedSavedLevel || 1));
}

export function getLevelXpFromSlots(earnedQuestionSlots: boolean[], level: number): number {
  const start = (level - 1) * QUESTIONS_PER_LEVEL;
  let allEarned = true;

  for (let q = 0; q < QUESTIONS_PER_LEVEL; q++) {
    if (!earnedQuestionSlots[start + q]) {
      allEarned = false;
      break;
    }
  }

  if (!allEarned) {
    return 0;
  }

  const index = level - 1;
  return LEVEL_XP_REWARDS[index] ?? 0;
}

export function getTotalEarnedXpFromSlots(earnedQuestionSlots: boolean[]): number {
  let total = 0;

  for (let level = 1; level <= MAX_QUESTION_LEVEL; level++) {
    total += getLevelXpFromSlots(earnedQuestionSlots, level);
  }

  return total;
}

export function getGame1LevelXpTotals(earnedQuestionSlots: boolean[]): {
  game1Level1Xp: number;
  game1Level2Xp: number;
  game1Level3Xp: number;
} {
  return {
    game1Level1Xp: getLevelXpFromSlots(earnedQuestionSlots, 1),
    game1Level2Xp: getLevelXpFromSlots(earnedQuestionSlots, 2),
    game1Level3Xp: getLevelXpFromSlots(earnedQuestionSlots, 3)
  };
}

export function parseEarnedQuestionSlots(value: boolean[] | undefined): boolean[] {
  const slots = createEmptyEarnedQuestionSlots();

  if (!value) {
    return slots;
  }

  for (let i = 0; i < TOTAL_QUESTION_COUNT; i++) {
    slots[i] = value[i] === true;
  }

  return slots;
}

export function parseEarnedQuestionSlotsFromJson(value: string | undefined): boolean[] {
  const slots = createEmptyEarnedQuestionSlots();

  if (!value) {
    return slots;
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) {
      return slots;
    }

    for (let i = 0; i < TOTAL_QUESTION_COUNT; i++) {
      slots[i] = parsed[i] === true;
    }
  } catch {
    return slots;
  }

  return slots;
}

export function serializeEarnedQuestionSlots(earnedQuestionSlots: boolean[]): string {
  const normalized: boolean[] = [];
  for (let i = 0; i < TOTAL_QUESTION_COUNT; i++) {
    normalized.push(earnedQuestionSlots[i] === true);
  }
  return JSON.stringify(normalized);
}

export function followThePathProgressToRecord(
  game: FollowThePathProgressData,
  totalXp: number,
  totalCoins: number,
  ids?: { usersListItemId?: number; game1DataListItemId?: number },
  achievements: GameAchievementData = createDefaultGameAchievementData()
): PlayerProgressRecord {
  const earnedQuestionSlots = parseEarnedQuestionSlots(game.earnedQuestionSlots);
  const level = getResumeLevelFromProgress(earnedQuestionSlots, game.level);

  return {
    usersListItemId: ids?.usersListItemId,
    game1DataListItemId: ids?.game1DataListItemId,
    totalXp,
    totalCoins,
    highScore: game.highScore,
    level,
    levelXp: getTotalEarnedXpFromSlots(earnedQuestionSlots),
    earnedQuestionSlots,
    freeModeUnlocked: game.freeModeUnlocked || earnedQuestionSlots.every((earned) => earned),
    heartsRemaining: game.heartsRemaining,
    heartsDay: game.heartsDay,
    achievements
  };
}

export function buildFollowThePathProgressFromSession(session: GameSessionResult): FollowThePathProgressData {
  const earnedQuestionSlots = parseEarnedQuestionSlots(session.earnedQuestionSlots);
  const level = getResumeLevelFromProgress(earnedQuestionSlots, session.level);

  return {
    highScore: session.highScore,
    level,
    levelXp: getTotalEarnedXpFromSlots(earnedQuestionSlots),
    earnedQuestionSlots,
    freeModeUnlocked: session.freeModeUnlocked,
    heartsRemaining: session.heartsRemaining,
    heartsDay: session.heartsDay
  };
}

export function mergeEarnedQuestionSlots(a: boolean[], b: boolean[]): boolean[] {
  const merged = createEmptyEarnedQuestionSlots();

  for (let i = 0; i < merged.length; i++) {
    merged[i] = a[i] === true || b[i] === true;
  }

  return merged;
}

function resolveMergedResumeLevel(
  session: FollowThePathProgressData,
  server: FollowThePathProgressData | undefined,
  earnedQuestionSlots: boolean[]
): number {
  const freeMode = session.freeModeUnlocked || server?.freeModeUnlocked === true;
  const campaignComplete = earnedQuestionSlots.every((earned) => earned);

  // Free mode uses session.level as the resume pointer (can reset to 1 after passing level 3).
  if (freeMode && campaignComplete) {
    return Math.max(1, Math.min(MAX_QUESTION_LEVEL, session.level));
  }

  return getResumeLevelFromProgress(
    earnedQuestionSlots,
    Math.max(server?.level || 1, session.level)
  );
}

/** Combine in-session progress with the latest row from Game1Data before saving. */
export function mergeFollowThePathProgressForSave(
  session: FollowThePathProgressData,
  server: FollowThePathProgressData | undefined
): FollowThePathProgressData {
  if (!server) {
    return session;
  }

  const earnedQuestionSlots = mergeEarnedQuestionSlots(
    session.earnedQuestionSlots,
    server.earnedQuestionSlots
  );
  const hearts = resolveDailyHearts(session.heartsRemaining, session.heartsDay);

  return {
    highScore: Math.max(session.highScore, server.highScore),
    level: resolveMergedResumeLevel(session, server, earnedQuestionSlots),
    levelXp: getTotalEarnedXpFromSlots(earnedQuestionSlots),
    earnedQuestionSlots,
    freeModeUnlocked:
      session.freeModeUnlocked ||
      server.freeModeUnlocked ||
      earnedQuestionSlots.every((earned) => earned),
    heartsRemaining: hearts.heartsRemaining,
    heartsDay: hearts.heartsDay
  };
}

export function computeUserTotalXp(profile: Pick<
  UserProfileRecord,
  'miniQuestXp' | 'masteryQuestXp' | 'game1Level1Xp' | 'game1Level2Xp' | 'game1Level3Xp'
>): number {
  return (
    profile.miniQuestXp +
    profile.masteryQuestXp +
    profile.game1Level1Xp +
    profile.game1Level2Xp +
    profile.game1Level3Xp
  );
}

export function readUserProfileFromListItem(item: Record<string, unknown>): UserProfileRecord {
  const fields = USERS_LIST_CONFIG.fields;

  const profile: UserProfileRecord = {
    listItemId: toOptionalId(item[fields.id]),
    title: String(item[fields.title] || ''),
    email: String(item[fields.email] || ''),
    lobt: readListTextValue(item, fields.lobt, 'LOBT', 'lobt'),
    market: readListTextValue(item, fields.market, 'Market', 'market'),
    totalCoin: toNumber(item[fields.totalCoin]),
    totalCoinEarned: toNumber(item[fields.totalCoinEarned]),
    totalXp: 0,
    miniQuestXp: toNumber(item[fields.miniQuestXp]),
    masteryQuestXp: toNumber(item[fields.masteryQuestXp]),
    game1Level1Xp: toNumber(item[fields.game1Level1Xp]),
    game1Level2Xp: toNumber(item[fields.game1Level2Xp]),
    game1Level3Xp: toNumber(item[fields.game1Level3Xp]),
    totalPlayedGameCount: toNumber(item[fields.totalPlayedGameCount])
  };

  const rawTotalXp = item[fields.totalXp];
  profile.totalXp =
    rawTotalXp !== undefined && rawTotalXp !== null
      ? toNumber(rawTotalXp)
      : computeUserTotalXp(profile);

  profile.leaderBoardData = parseLeaderBoardDataFromJson(
    String(item[fields.leaderBoardData] || '')
  );

  profile.gameProgressJson = readJsonFieldText(item[fields.gameProgress]);
  profile.activityLogJson = readJsonFieldText(item[fields.activityLog]);

  return profile;
}

function readJsonFieldText(value: unknown): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed || undefined;
  }

  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return undefined;
    }
  }

  return undefined;
}

export function parseLeaderBoardDataFromJson(raw: string): UserLeaderBoardData | undefined {
  const trimmed = raw.trim();
  if (!trimmed) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(trimmed) as Partial<UserLeaderBoardData>;
    if (!parsed || typeof parsed !== 'object') {
      return undefined;
    }

    return {
      individual: {
        inTop50: parsed.individual?.inTop50 === true,
        rank: toOptionalRank(parsed.individual?.rank)
      },
      lobt: {
        inTop10: parsed.lobt?.inTop10 === true,
        rank: toOptionalRank(parsed.lobt?.rank),
        lobt: parsed.lobt?.lobt ? String(parsed.lobt.lobt) : undefined
      },
      checkedAt: String(parsed.checkedAt || '')
    };
  } catch {
    return undefined;
  }
}

export function serializeLeaderBoardData(data: UserLeaderBoardData): string {
  return JSON.stringify(data);
}

export function isLeaderBoardDataEqual(
  existing: UserLeaderBoardData | undefined,
  next: UserLeaderBoardData
): boolean {
  if (!existing) {
    return false;
  }

  return serializeLeaderBoardData(existing) === serializeLeaderBoardData(next);
}

export function writeLeaderBoardDataToBody(data: UserLeaderBoardData): Record<string, string> {
  return {
    [USERS_LIST_CONFIG.fields.leaderBoardData]: serializeLeaderBoardData(data)
  };
}

export function readFollowThePathProgressFromListItem(
  item: Record<string, unknown>
): FollowThePathProgressData {
  const fields = GAME1_DATA_LIST_CONFIG.fields;
  const earnedQuestionSlots = parseEarnedQuestionSlotsFromJson(String(item[fields.earnedQuestions] || ''));
  const hearts = resolveDailyHearts(
    toNumber(item[fields.heartsRemaining]),
    String(item[fields.heartsDay] || '')
  );

  return {
    highScore: toNumber(item[fields.highScore]),
    level: toNumber(item[fields.level]) || 1,
    levelXp: toNumber(item[fields.levelXp]),
    earnedQuestionSlots,
    freeModeUnlocked:
      item[fields.freeModeUnlocked] === true ||
      item[fields.freeModeUnlocked] === 1 ||
      item[fields.freeModeUnlocked] === 'true' ||
      item[fields.freeModeUnlocked] === '1' ||
      earnedQuestionSlots.every((earned) => earned),
    heartsRemaining: hearts.heartsRemaining,
    heartsDay: hearts.heartsDay
  };
}

export function writeFollowThePathProgressToBody(
  game: FollowThePathProgressData
): Record<string, string | number | boolean> {
  const fields = GAME1_DATA_LIST_CONFIG.fields;
  const earnedQuestionSlots = parseEarnedQuestionSlots(game.earnedQuestionSlots);
  const level = getResumeLevelFromProgress(earnedQuestionSlots, game.level);
  const hearts = resolveDailyHearts(game.heartsRemaining, game.heartsDay);

  return {
    [fields.highScore]: game.highScore,
    [fields.level]: String(level),
    [fields.levelXp]: getTotalEarnedXpFromSlots(earnedQuestionSlots),
    [fields.earnedQuestions]: serializeEarnedQuestionSlots(earnedQuestionSlots),
    [fields.freeModeUnlocked]: game.freeModeUnlocked || earnedQuestionSlots.every((earned) => earned),
    [fields.heartsRemaining]: hearts.heartsRemaining,
    [fields.heartsDay]: hearts.heartsDay
  };
}

export function writeDailyHeartsToBody(
  heartsRemaining: number,
  heartsDay: string
): Record<string, string | number> {
  const fields = GAME1_DATA_LIST_CONFIG.fields;
  const hearts = resolveDailyHearts(heartsRemaining, heartsDay);

  return {
    [fields.heartsRemaining]: hearts.heartsRemaining,
    [fields.heartsDay]: hearts.heartsDay
  };
}

export function writeFollowThePathProgressCreateBody(
  game: FollowThePathProgressData,
  email: string
): Record<string, string | number | boolean> {
  const fields = GAME1_DATA_LIST_CONFIG.fields;

  return {
    Title: email,
    [fields.email]: email,
    ...writeFollowThePathProgressToBody(game)
  };
}

export function writeUserTotalsToBody(
  profile: UserProfileRecord,
  earnedQuestionSlots: boolean[],
  coinsCollected: number
): Record<string, number> {
  const fields = USERS_LIST_CONFIG.fields;
  const levelXp = getGame1LevelXpTotals(earnedQuestionSlots);
  const coinsEarned = Math.max(0, coinsCollected);

  return {
    [fields.totalCoin]: profile.totalCoin + coinsEarned,
    [fields.totalCoinEarned]: profile.totalCoinEarned + coinsEarned,
    [fields.game1Level1Xp]: Math.max(profile.game1Level1Xp, levelXp.game1Level1Xp),
    [fields.game1Level2Xp]: Math.max(profile.game1Level2Xp, levelXp.game1Level2Xp),
    [fields.game1Level3Xp]: Math.max(profile.game1Level3Xp, levelXp.game1Level3Xp)
  };
}

/** Increment TotalPlayedGameCount on first Game 1 play (Users list). */
export function writeUserTotalPlayedGameCountIncrementBody(
  profile: UserProfileRecord
): Record<string, number> {
  const fields = USERS_LIST_CONFIG.fields;
  const nextCount = Math.min(USERS_TOTAL_PLAYED_GAME_COUNT_MAX, profile.totalPlayedGameCount + 1);

  return {
    [fields.totalPlayedGameCount]: nextCount
  };
}

export function parseUserGameDataJson(raw: string | undefined): Record<string, unknown> {
  if (!raw || !raw.trim()) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as unknown;

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }

    return { ...(parsed as Record<string, unknown>) };
  } catch {
    return {};
  }
}

/** followThePath stats stored under GameProgress.followThePath. */
export interface FollowThePathGameProgressUpdate {
  incrementPlayed?: boolean;
  incrementCorrectAnswers?: number;
}

function readFollowThePathGameProgress(data: Record<string, unknown>): Record<string, unknown> {
  const existing = data.followThePath;

  if (existing && typeof existing === 'object' && !Array.isArray(existing)) {
    return { ...(existing as Record<string, unknown>) };
  }

  return {};
}

/** Merge followThePath.played / correctAnswers into GameProgress, preserving all other keys. */
export function updateFollowThePathInUserGameProgress(
  raw: string | undefined,
  update: FollowThePathGameProgressUpdate
): string {
  const data = parseUserGameDataJson(raw);
  const followThePath = readFollowThePathGameProgress(data);

  if (update.incrementPlayed) {
    followThePath.played = Math.max(0, toNumber(followThePath.played)) + 1;
  }

  if (update.incrementCorrectAnswers && update.incrementCorrectAnswers > 0) {
    followThePath.correctAnswers =
      Math.max(0, toNumber(followThePath.correctAnswers)) + update.incrementCorrectAnswers;
  }

  return JSON.stringify({
    ...data,
    followThePath
  });
}

export function writeUserFollowThePathGameProgressBody(
  rawGameProgressJson: string | undefined,
  update: FollowThePathGameProgressUpdate
): Record<string, string> {
  return {
    [USERS_LIST_CONFIG.fields.gameProgress]: updateFollowThePathInUserGameProgress(rawGameProgressJson, update)
  };
}

export function buildFollowThePathGameProgressUpdateFromSession(
  update: AchievementSessionUpdate
): FollowThePathGameProgressUpdate | undefined {
  const gameProgressUpdate: FollowThePathGameProgressUpdate = {};

  if (update.incrementPlayCount) {
    gameProgressUpdate.incrementPlayed = true;
  }

  if (update.incrementCorrectAnswers && update.incrementCorrectAnswers > 0) {
    gameProgressUpdate.incrementCorrectAnswers = update.incrementCorrectAnswers;
  }

  if (!gameProgressUpdate.incrementPlayed && !gameProgressUpdate.incrementCorrectAnswers) {
    return undefined;
  }

  return gameProgressUpdate;
}

export const USER_ACTIVITY_LOG_MILESTONE_KEYS = {
  completeGameWithoutLosingLife: 'CompleteGameWithoutLosingLife',
  completeGameOnMediumDifficulty: 'CompleteGameOnMediumDifficulty',
  completeGameOnHardDifficulty: 'CompleteGameOnHardDifficulty',
  loseAll3Lives: 'LoseAll3Lives',
  replayCompletedPlanet: 'ReplayCompletedPlanet'
} as const;

/** Top-level ActivityLog milestone flags set when the player hits each event. */
export interface FollowThePathActivityLogUpdate {
  markLevelPassed?: number;
  markCompleteTheGame?: boolean;
  markFlawlessRun?: boolean;
  markLoseAll3Lives?: boolean;
  isReplayed?: boolean;
}

function setActivityLogMilestone(data: Record<string, unknown>, key: string): void {
  data[key] = true;
}

function applyActivityLogMilestones(
  data: Record<string, unknown>,
  update: FollowThePathActivityLogUpdate
): void {
  const keys = USER_ACTIVITY_LOG_MILESTONE_KEYS;

  if (update.markFlawlessRun) {
    setActivityLogMilestone(data, keys.completeGameWithoutLosingLife);
  }

  if (update.markLevelPassed === 2) {
    setActivityLogMilestone(data, keys.completeGameOnMediumDifficulty);
  }

  if (update.markCompleteTheGame) {
    setActivityLogMilestone(data, keys.completeGameOnHardDifficulty);
  }

  if (update.markLoseAll3Lives) {
    setActivityLogMilestone(data, keys.loseAll3Lives);
  }

  if (update.isReplayed === true) {
    setActivityLogMilestone(data, keys.replayCompletedPlanet);
  }
}

/** Set matching ActivityLog milestone flags to true, preserving all other keys. */
export function updateFollowThePathInUserActivityLog(
  raw: string | undefined,
  update: FollowThePathActivityLogUpdate
): string {
  const data = parseUserGameDataJson(raw);

  applyActivityLogMilestones(data, update);

  return JSON.stringify(data);
}

export function writeUserFollowThePathActivityLogBody(
  rawActivityLogJson: string | undefined,
  update: FollowThePathActivityLogUpdate
): Record<string, string> {
  return {
    [USERS_LIST_CONFIG.fields.activityLog]: updateFollowThePathInUserActivityLog(rawActivityLogJson, update)
  };
}

export function buildFollowThePathActivityLogUpdateFromSession(
  update: AchievementSessionUpdate
): FollowThePathActivityLogUpdate | undefined {
  const activityLogUpdate: FollowThePathActivityLogUpdate = {};

  if (update.markCompleteTheGame) {
    activityLogUpdate.markCompleteTheGame = true;
  }

  if (update.markLevelPassed && update.markLevelPassed >= 1 && update.markLevelPassed <= MAX_QUESTION_LEVEL) {
    activityLogUpdate.markLevelPassed = update.markLevelPassed;
  }

  if (update.markFlawlessCampaignComplete) {
    activityLogUpdate.markFlawlessRun = true;
  }

  if (update.isReplayed === true) {
    activityLogUpdate.isReplayed = true;
  }

  if (update.markLoseAll3Lives) {
    activityLogUpdate.markLoseAll3Lives = true;
  }

  if (
    !activityLogUpdate.markLevelPassed &&
    !activityLogUpdate.markCompleteTheGame &&
    !activityLogUpdate.markFlawlessRun &&
    !activityLogUpdate.markLoseAll3Lives &&
    !activityLogUpdate.isReplayed
  ) {
    return undefined;
  }

  return activityLogUpdate;
}

/** Deduct spendable coins only (TotalCoinEarned is never reduced). */
export function writeUserCoinSpendBody(
  profile: UserProfileRecord,
  coinCost: number
): Record<string, number> {
  const fields = USERS_LIST_CONFIG.fields;

  return {
    [fields.totalCoin]: Math.max(0, profile.totalCoin - Math.max(0, coinCost))
  };
}

export function writeUserRegistrationBody(input: UserRegistrationInput): Record<string, string | number> {
  const fields = USERS_LIST_CONFIG.fields;

  return {
    Title: input.title,
    [fields.email]: input.email,
    [fields.totalCoin]: 0,
    [fields.totalCoinEarned]: 0,
    [fields.miniQuestXp]: 0,
    [fields.masteryQuestXp]: 0,
    [fields.game1Level1Xp]: 0,
    [fields.game1Level2Xp]: 0,
    [fields.game1Level3Xp]: 0
  };
}

function toNumber(value: unknown): number {
  if (typeof value === 'number' && !isNaN(value)) {
    return value;
  }

  const parsed = parseInt(String(value).replace(/,/g, ''), 10);
  return isNaN(parsed) ? 0 : parsed;
}

function toOptionalId(value: unknown): number | undefined {
  if (typeof value === 'number' && !isNaN(value)) {
    return value;
  }

  const parsed = parseInt(String(value), 10);
  return isNaN(parsed) ? undefined : parsed;
}

function toOptionalRank(value: unknown): number | undefined {
  if (typeof value !== 'number' || isNaN(value) || value <= 0) {
    return undefined;
  }

  return value;
}
