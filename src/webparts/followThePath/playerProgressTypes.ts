import { MAX_QUESTION_LEVEL, QUESTIONS_PER_LEVEL, TOTAL_QUESTION_COUNT, XP_PER_QUESTION } from './gameConfig';

/**
 * Shared SharePoint list — one row per user across ALL games on the site.
 * Each game has its own columns (prefixed). Other games add their own field group.
 *
 * | Display name                    | Internal name                    | Type             |
 * |---------------------------------|----------------------------------|------------------|
 * | Title                           | Title                            | Single line text |
 * | User Email                      | UserEmail                        | Single line text |
 * | Total XP                        | TotalXp                          | Number           |
 * | Total Coins                     | TotalCoins                       | Number           |
 * | FTP High Score                  | FollowThePath_HighScore          | Number           |
 * | FTP Level                       | FollowThePath_Level              | Number           |
 * | FTP Level XP                    | FollowThePath_LevelXp            | Number           |
 * | FTP Earned Questions            | FollowThePath_EarnedQuestions    | Single line text |
 * | FTP Free Mode                   | FTPFreeMode                      | Yes/No           |
 *
 * Example columns for another game (add when that game is built):
 * | Quiz High Score                 | SecurityQuiz_HighScore           | Number           |
 *
 * UserEmail identifies the current user (`pageContext.user.email`).
 * TotalXp and TotalCoins are cumulative across every game.
 */
export const SHARED_PLAYER_LIST_CONFIG = {
  listTitle: 'PlayerGameHub',
  sharedFields: {
    id: 'Id',
    userEmail: 'UserEmail',
    totalXp: 'TotalXp',
    totalCoins: 'TotalCoins'
  },
  followThePath: {
    highScore: 'FollowThePath_HighScore',
    level: 'FollowThePath_Level',
    levelXp: 'FollowThePath_LevelXp',
    earnedQuestions: 'FollowThePath_EarnedQuestions',
    freeModeUnlocked: 'FTPFreeMode'
  }
} as const;

/** @deprecated Use SHARED_PLAYER_LIST_CONFIG */
export const PLAYER_PROGRESS_LIST_CONFIG = SHARED_PLAYER_LIST_CONFIG;

export interface FollowThePathProgressData {
  highScore: number;
  level: number;
  levelXp: number;
  earnedQuestionSlots: boolean[];
  freeModeUnlocked: boolean;
}

/** Progress for this game, plus shared cross-game totals from the list. */
export interface PlayerProgressRecord {
  listItemId?: number;
  totalXp: number;
  totalCoins: number;
  highScore: number;
  level: number;
  levelXp: number;
  earnedQuestionSlots: boolean[];
  freeModeUnlocked: boolean;
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
}

export function createEmptyEarnedQuestionSlots(): boolean[] {
  const slots: boolean[] = [];
  for (let i = 0; i < TOTAL_QUESTION_COUNT; i++) {
    slots.push(false);
  }
  return slots;
}

export function createDefaultFollowThePathProgress(): FollowThePathProgressData {
  return {
    highScore: 0,
    level: 1,
    levelXp: 0,
    earnedQuestionSlots: createEmptyEarnedQuestionSlots(),
    freeModeUnlocked: false
  };
}

export function createDefaultPlayerProgress(): PlayerProgressRecord {
  const game = createDefaultFollowThePathProgress();
  return followThePathProgressToRecord(game, 0, 0);
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

export function getLevelXpFromSlots(earnedQuestionSlots: boolean[], level: number): number {
  const start = (level - 1) * QUESTIONS_PER_LEVEL;
  let xp = 0;

  for (let q = 0; q < QUESTIONS_PER_LEVEL; q++) {
    if (earnedQuestionSlots[start + q]) {
      xp += XP_PER_QUESTION;
    }
  }

  return xp;
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
  totalCoins: number
): PlayerProgressRecord {
  const earnedQuestionSlots = parseEarnedQuestionSlots(game.earnedQuestionSlots);
  const level = getProgressLevelFromSlots(earnedQuestionSlots);

  return {
    totalXp,
    totalCoins,
    highScore: game.highScore,
    level,
    levelXp: getLevelXpFromSlots(earnedQuestionSlots, level),
    earnedQuestionSlots,
    freeModeUnlocked: game.freeModeUnlocked || earnedQuestionSlots.every((earned) => earned)
  };
}

export function buildFollowThePathProgressFromSession(session: GameSessionResult): FollowThePathProgressData {
  const earnedQuestionSlots = parseEarnedQuestionSlots(session.earnedQuestionSlots);
  const level = getProgressLevelFromSlots(earnedQuestionSlots);

  return {
    highScore: session.highScore,
    level,
    levelXp: getLevelXpFromSlots(earnedQuestionSlots, level),
    earnedQuestionSlots,
    freeModeUnlocked: session.freeModeUnlocked
  };
}

export function readFollowThePathProgressFromListItem(
  item: Record<string, unknown>
): FollowThePathProgressData {
  const fields = SHARED_PLAYER_LIST_CONFIG.followThePath;
  const earnedQuestionSlots = parseEarnedQuestionSlotsFromJson(String(item[fields.earnedQuestions] || ''));

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
      earnedQuestionSlots.every((earned) => earned)
  };
}

export function writeFollowThePathProgressToBody(
  game: FollowThePathProgressData
): Record<string, string | number | boolean> {
  const fields = SHARED_PLAYER_LIST_CONFIG.followThePath;
  const earnedQuestionSlots = parseEarnedQuestionSlots(game.earnedQuestionSlots);
  const level = getProgressLevelFromSlots(earnedQuestionSlots);

  return {
    [fields.highScore]: game.highScore,
    [fields.level]: level,
    [fields.levelXp]: getLevelXpFromSlots(earnedQuestionSlots, level),
    [fields.earnedQuestions]: serializeEarnedQuestionSlots(earnedQuestionSlots),
    [fields.freeModeUnlocked]: game.freeModeUnlocked || earnedQuestionSlots.every((earned) => earned)
  };
}

function toNumber(value: unknown): number {
  const parsed = typeof value === 'number' ? value : parseInt(String(value), 10);
  return isNaN(parsed) ? 0 : parsed;
}
