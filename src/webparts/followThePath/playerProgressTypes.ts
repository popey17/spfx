import {
  MAX_QUESTION_LEVEL,
  QUESTIONS_PER_LEVEL,
  TOTAL_QUESTION_COUNT,
  LEVEL_XP_REWARDS
} from './gameConfig';

/**
 * Users list — one row per player (profile + cross-game totals).
 * Game1Data list — Follow the Path progress, linked by Email.
 *
 * Users columns (SharePoint internal names — do not change the list):
 * | Title | Email | TotalCoin | MiniQuestXP | MasteryQuestXP |
 * | Game1Level1XP | Game1Level2XP | Game1Level3XP |
 * | Game2Level1XP | Game2Level2XP | Game2Level3XP |
 *
 * TotalXP is computed from level XP columns (not a separate list field).
 *
 * Game1Data columns:
 * | Email | FollowThePath_HighScore | FollowThePath_Level (Text) | FollowThePath_LevelXp |
 * | FollowThePath_EarnedQuestions | FTPFreeMode |
 */
export const USERS_LIST_CONFIG = {
  listTitle: 'Users',
  fields: {
    id: 'Id',
    title: 'Title',
    email: 'Email',
    totalCoin: 'TotalCoin',
    miniQuestXp: 'MiniQuestXP',
    masteryQuestXp: 'MasteryQuestXP',
    game1Level1Xp: 'Game1Level1XP',
    game1Level2Xp: 'Game1Level2XP',
    game1Level3Xp: 'Game1Level3XP',
    game2Level1Xp: 'Game2Level1XP',
    game2Level2Xp: 'Game2Level2XP',
    game2Level3Xp: 'Game2Level3XP'
  }
} as const;

export const GAME1_DATA_LIST_CONFIG = {
  listTitle: 'Game1Data',
  fields: {
    id: 'Id',
    email: 'Email',
    highScore: 'FollowThePath_HighScore',
    level: 'FollowThePath_Level',
    levelXp: 'FollowThePath_LevelXp',
    earnedQuestions: 'FollowThePath_EarnedQuestions',
    freeModeUnlocked: 'FTPFreeMode'
  }
} as const;

/** @deprecated Use USERS_LIST_CONFIG */
export const SHARED_PLAYER_LIST_CONFIG = USERS_LIST_CONFIG;

export interface UserProfileRecord {
  listItemId?: number;
  title: string;
  email: string;
  market: string;
  busu: string;
  totalCoin: number;
  totalXp: number;
  miniQuestXp: number;
  masteryQuestXp: number;
  game1Level1Xp: number;
  game1Level2Xp: number;
  game1Level3Xp: number;
  game2Level1Xp: number;
  game2Level2Xp: number;
  game2Level3Xp: number;
}

export interface FollowThePathProgressData {
  highScore: number;
  level: number;
  levelXp: number;
  earnedQuestionSlots: boolean[];
  freeModeUnlocked: boolean;
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
}

export interface PlayerSession {
  profile: UserProfileRecord | undefined;
  progress: PlayerProgressRecord;
  needsRegistration: boolean;
}

export interface UserRegistrationInput {
  title: string;
  email: string;
  market: string;
  busu: string;
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

export function createDefaultUserProfile(email: string, title: string = ''): UserProfileRecord {
  return {
    title: title || email,
    email,
    market: '',
    busu: '',
    totalCoin: 0,
    totalXp: 0,
    miniQuestXp: 0,
    masteryQuestXp: 0,
    game1Level1Xp: 0,
    game1Level2Xp: 0,
    game1Level3Xp: 0,
    game2Level1Xp: 0,
    game2Level2Xp: 0,
    game2Level3Xp: 0
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
  ids?: { usersListItemId?: number; game1DataListItemId?: number }
): PlayerProgressRecord {
  const earnedQuestionSlots = parseEarnedQuestionSlots(game.earnedQuestionSlots);
  const level = getProgressLevelFromSlots(earnedQuestionSlots);

  return {
    usersListItemId: ids?.usersListItemId,
    game1DataListItemId: ids?.game1DataListItemId,
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

export function computeUserTotalXp(profile: Pick<
  UserProfileRecord,
  | 'miniQuestXp'
  | 'masteryQuestXp'
  | 'game1Level1Xp'
  | 'game1Level2Xp'
  | 'game1Level3Xp'
  | 'game2Level1Xp'
  | 'game2Level2Xp'
  | 'game2Level3Xp'
>): number {
  return (
    profile.miniQuestXp +
    profile.masteryQuestXp +
    profile.game1Level1Xp +
    profile.game1Level2Xp +
    profile.game1Level3Xp +
    profile.game2Level1Xp +
    profile.game2Level2Xp +
    profile.game2Level3Xp
  );
}

export function readUserProfileFromListItem(item: Record<string, unknown>): UserProfileRecord {
  const fields = USERS_LIST_CONFIG.fields;

  const profile: UserProfileRecord = {
    listItemId: toOptionalId(item[fields.id]),
    title: String(item[fields.title] || ''),
    email: String(item[fields.email] || ''),
    market: '',
    busu: '',
    totalCoin: toNumber(item[fields.totalCoin]),
    totalXp: 0,
    miniQuestXp: toNumber(item[fields.miniQuestXp]),
    masteryQuestXp: toNumber(item[fields.masteryQuestXp]),
    game1Level1Xp: toNumber(item[fields.game1Level1Xp]),
    game1Level2Xp: toNumber(item[fields.game1Level2Xp]),
    game1Level3Xp: toNumber(item[fields.game1Level3Xp]),
    game2Level1Xp: toNumber(item[fields.game2Level1Xp]),
    game2Level2Xp: toNumber(item[fields.game2Level2Xp]),
    game2Level3Xp: toNumber(item[fields.game2Level3Xp])
  };

  profile.totalXp = computeUserTotalXp(profile);
  return profile;
}

export function readFollowThePathProgressFromListItem(
  item: Record<string, unknown>
): FollowThePathProgressData {
  const fields = GAME1_DATA_LIST_CONFIG.fields;
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
  const fields = GAME1_DATA_LIST_CONFIG.fields;
  const earnedQuestionSlots = parseEarnedQuestionSlots(game.earnedQuestionSlots);
  const level = getProgressLevelFromSlots(earnedQuestionSlots);

  return {
    [fields.highScore]: game.highScore,
    [fields.level]: String(level),
    [fields.levelXp]: getLevelXpFromSlots(earnedQuestionSlots, level),
    [fields.earnedQuestions]: serializeEarnedQuestionSlots(earnedQuestionSlots),
    [fields.freeModeUnlocked]: game.freeModeUnlocked || earnedQuestionSlots.every((earned) => earned)
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
): Record<string, string | number> {
  const fields = USERS_LIST_CONFIG.fields;
  const levelXp = getGame1LevelXpTotals(earnedQuestionSlots);

  return {
    [fields.totalCoin]: profile.totalCoin + coinsCollected,
    [fields.miniQuestXp]: profile.miniQuestXp,
    [fields.masteryQuestXp]: profile.masteryQuestXp,
    [fields.game1Level1Xp]: levelXp.game1Level1Xp,
    [fields.game1Level2Xp]: levelXp.game1Level2Xp,
    [fields.game1Level3Xp]: levelXp.game1Level3Xp,
    [fields.game2Level1Xp]: profile.game2Level1Xp,
    [fields.game2Level2Xp]: profile.game2Level2Xp,
    [fields.game2Level3Xp]: profile.game2Level3Xp
  };
}

export function writeUserRegistrationBody(input: UserRegistrationInput): Record<string, string | number> {
  const fields = USERS_LIST_CONFIG.fields;

  return {
    Title: input.title,
    [fields.email]: input.email,
    [fields.totalCoin]: 0,
    [fields.miniQuestXp]: 0,
    [fields.masteryQuestXp]: 0,
    [fields.game1Level1Xp]: 0,
    [fields.game1Level2Xp]: 0,
    [fields.game1Level3Xp]: 0,
    [fields.game2Level1Xp]: 0,
    [fields.game2Level2Xp]: 0,
    [fields.game2Level3Xp]: 0
  };
}

function toNumber(value: unknown): number {
  const parsed = typeof value === 'number' ? value : parseInt(String(value), 10);
  return isNaN(parsed) ? 0 : parsed;
}

function toOptionalId(value: unknown): number | undefined {
  if (typeof value === 'number' && !isNaN(value)) {
    return value;
  }

  const parsed = parseInt(String(value), 10);
  return isNaN(parsed) ? undefined : parsed;
}
