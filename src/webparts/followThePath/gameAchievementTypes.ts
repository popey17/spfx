import { getDailyHeartsDayKey } from './gameDateContext';

function getAchievementDayKey(): string {
  return getDailyHeartsDayKey();
}

/**
 * Game1Data list columns used for Follow the Path achievements (see Game1Data.csv).
 *
 * | FirstTimePlay            | Yes/No — true after the player starts their first run |
 * | PlayedCount              | Number — total times the player has started a run |
 * | RePlayAfterCompleted     | Yes/No — true after starting a run with free mode unlocked |
 * | DailyGameStatus          | Note — JSON array of daily stats (flat text) |
 * | FlawlessCampaignComplete | Yes/No — completed all 3 campaign levels without losing a heart |
 */
export const GAME_ACHIEVEMENT_LIST_FIELDS = {
  firstTimePlay: 'FirstTimePlay',
  playedCount: 'PlayedCount',
  rePlayAfterCompleted: 'RePlayAfterCompleted',
  dailyGameStatus: 'DailyGameStatus',
  flawlessCampaignComplete: 'FlawlessCampaignComplete'
} as const;

/** SharePoint $select fields for achievement columns on Game1Data. */
export function getGameAchievementSelectFields(): string[] {
  const fields = GAME_ACHIEVEMENT_LIST_FIELDS;
  return [
    fields.firstTimePlay,
    fields.playedCount,
    fields.rePlayAfterCompleted,
    fields.dailyGameStatus,
    fields.flawlessCampaignComplete
  ];
}

export const GAME_ACHIEVEMENT_CONFIG = {
  /** Keep this many calendar days of daily status history in the JSON blob. */
  dailyStatusHistoryDays: 90
} as const;

/** One calendar day's aggregated play stats (Singapore timezone, YYYY-MM-DD). */
export interface DailyGameStatusRecord {
  date: string;
  coinsCollected: number;
  playCount: number;
}

/** Achievement payload stored on the player's Game1Data row. */
export interface GameAchievementData {
  firstTimePlay: boolean;
  playedCount: number;
  rePlayAfterCompleted: boolean;
  dailyGameStatus: DailyGameStatusRecord[];
  flawlessCampaignComplete: boolean;
}

/** Session delta sent when persisting achievement fields. */
export interface AchievementSessionUpdate {
  /** Set when the player starts their first run ever. */
  markFirstPlay?: boolean;
  /** Increment PlayedCount and today's daily playCount (game start). */
  incrementPlayCount?: boolean;
  /** Set ActivityLog CompleteGameOnHardDifficulty when campaign level 3 is finished. */
  markCompleteTheGame?: boolean;
  /** Campaign level just passed (level 2 -> ActivityLog CompleteGameOnMediumDifficulty). */
  markLevelPassed?: number;
  /** Set ActivityLog ReplayCompletedPlanet on game start when replaying after completion. */
  isReplayed?: boolean;
  /** Set when the player starts a run after free mode is unlocked. */
  markReplayAfterCompleted?: boolean;
  /** Set when the player finishes all 3 campaign levels without losing a heart. */
  markFlawlessCampaignComplete?: boolean;
  /** Set Users list ActivityLog LoseAll3Lives when all daily hearts are lost. */
  markLoseAll3Lives?: boolean;
  /** Coins written on this save (delta since last save). */
  coinsCollected: number;
}

export function createDefaultGameAchievementData(): GameAchievementData {
  return {
    firstTimePlay: false,
    playedCount: 0,
    rePlayAfterCompleted: false,
    dailyGameStatus: [],
    flawlessCampaignComplete: false
  };
}

function toBoolean(value: unknown): boolean {
  return value === true || value === 1 || value === 'true' || value === '1';
}

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return isNaN(parsed) ? 0 : parsed;
}

function normalizeDailyGameStatusRecord(value: unknown): DailyGameStatusRecord | undefined {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const record = value as Record<string, unknown>;
  const date = String(record.date || '').trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return undefined;
  }

  return {
    date,
    coinsCollected: Math.max(0, toNumber(record.coinsCollected)),
    playCount: Math.max(0, toNumber(record.playCount))
  };
}

export function parseDailyGameStatusFromJson(value: string | undefined): DailyGameStatusRecord[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    const records: DailyGameStatusRecord[] = [];

    for (let i = 0; i < parsed.length; i++) {
      const record = normalizeDailyGameStatusRecord(parsed[i]);
      if (record) {
        records.push(record);
      }
    }

    return sortDailyGameStatus(records);
  } catch {
    return [];
  }
}

export function serializeDailyGameStatus(dailyGameStatus: DailyGameStatusRecord[]): string {
  return JSON.stringify(sortDailyGameStatus(dailyGameStatus));
}

export function readGameAchievementsFromListItem(item: Record<string, unknown>): GameAchievementData {
  const fields = GAME_ACHIEVEMENT_LIST_FIELDS;

  return {
    firstTimePlay: toBoolean(item[fields.firstTimePlay]),
    playedCount: Math.max(0, toNumber(item[fields.playedCount])),
    rePlayAfterCompleted: toBoolean(item[fields.rePlayAfterCompleted]),
    dailyGameStatus: parseDailyGameStatusFromJson(String(item[fields.dailyGameStatus] || '')),
    flawlessCampaignComplete: toBoolean(item[fields.flawlessCampaignComplete])
  };
}

export function writeGameAchievementsToBody(
  achievements: GameAchievementData
): Record<string, string | number | boolean> {
  const fields = GAME_ACHIEVEMENT_LIST_FIELDS;

  return {
    [fields.firstTimePlay]: achievements.firstTimePlay,
    [fields.playedCount]: achievements.playedCount,
    [fields.rePlayAfterCompleted]: achievements.rePlayAfterCompleted,
    [fields.dailyGameStatus]: serializeDailyGameStatus(achievements.dailyGameStatus),
    [fields.flawlessCampaignComplete]: achievements.flawlessCampaignComplete
  };
}

function sortDailyGameStatus(dailyGameStatus: DailyGameStatusRecord[]): DailyGameStatusRecord[] {
  return dailyGameStatus
    .slice()
    .sort((left, right) => left.date.localeCompare(right.date));
}

function trimDailyGameStatusHistory(
  dailyGameStatus: DailyGameStatusRecord[],
  maxDays: number = GAME_ACHIEVEMENT_CONFIG.dailyStatusHistoryDays
): DailyGameStatusRecord[] {
  const sorted = sortDailyGameStatus(dailyGameStatus);

  if (sorted.length <= maxDays) {
    return sorted;
  }

  return sorted.slice(sorted.length - maxDays);
}

function mergeDailyGameStatus(
  server: DailyGameStatusRecord[],
  session: DailyGameStatusRecord[]
): DailyGameStatusRecord[] {
  const byDate = new Map<string, DailyGameStatusRecord>();

  for (let i = 0; i < server.length; i++) {
    byDate.set(server[i].date, { ...server[i] });
  }

  for (let i = 0; i < session.length; i++) {
    const incoming = session[i];
    const existing = byDate.get(incoming.date);

    if (!existing) {
      byDate.set(incoming.date, { ...incoming });
      continue;
    }

    byDate.set(incoming.date, {
      date: incoming.date,
      coinsCollected: Math.max(existing.coinsCollected, incoming.coinsCollected),
      playCount: Math.max(existing.playCount, incoming.playCount)
    });
  }

  const merged: DailyGameStatusRecord[] = [];
  byDate.forEach((record) => {
    merged.push(record);
  });

  return trimDailyGameStatusHistory(merged);
}

function upsertDailyGameStatusForUpdate(
  dailyGameStatus: DailyGameStatusRecord[],
  update: AchievementSessionUpdate
): DailyGameStatusRecord[] {
  const hasActivity = update.coinsCollected > 0 || update.incrementPlayCount;

  if (!hasActivity) {
    return dailyGameStatus;
  }

  const date = getAchievementDayKey();
  const next = dailyGameStatus.slice();
  let record = next.filter((entry) => entry.date === date)[0];

  if (!record) {
    record = {
      date,
      coinsCollected: 0,
      playCount: 0
    };
    next.push(record);
  }

  record.coinsCollected += Math.max(0, update.coinsCollected);

  if (update.incrementPlayCount) {
    record.playCount += 1;
  }

  return trimDailyGameStatusHistory(next);
}

/** Apply an in-session achievement update to the current in-memory achievement state. */
export function applyAchievementSessionUpdate(
  current: GameAchievementData,
  update: AchievementSessionUpdate
): GameAchievementData {
  const next: GameAchievementData = {
    ...current,
    dailyGameStatus: current.dailyGameStatus.slice()
  };

  if (update.markFirstPlay) {
    next.firstTimePlay = true;
  }

  if (update.incrementPlayCount) {
    next.playedCount += 1;
  }

  if (update.markReplayAfterCompleted) {
    next.rePlayAfterCompleted = true;
  }

  if (update.markFlawlessCampaignComplete) {
    next.flawlessCampaignComplete = true;
  }

  next.dailyGameStatus = upsertDailyGameStatusForUpdate(next.dailyGameStatus, update);

  return next;
}

/** Combine session achievement data with the latest Game1Data row before saving. */
export function mergeGameAchievementsForSave(
  session: GameAchievementData,
  server: GameAchievementData | undefined
): GameAchievementData {
  if (!server) {
    return {
      ...session,
      dailyGameStatus: trimDailyGameStatusHistory(session.dailyGameStatus)
    };
  }

  return {
    firstTimePlay: server.firstTimePlay || session.firstTimePlay,
    playedCount: Math.max(server.playedCount, session.playedCount),
    rePlayAfterCompleted: server.rePlayAfterCompleted || session.rePlayAfterCompleted,
    flawlessCampaignComplete: server.flawlessCampaignComplete || session.flawlessCampaignComplete,
    dailyGameStatus: mergeDailyGameStatus(server.dailyGameStatus, session.dailyGameStatus)
  };
}
