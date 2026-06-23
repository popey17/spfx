import { DAILY_HEARTS } from '../followThePath/gameConfig';
import { parseDateOverrideFromUrl } from '../followThePath/playerProgressTypes';
import type { LeaderboardData } from './leaderboardTypes';

/**
 * First calendar day (inclusive) when Users.LeaderBoardData is synced (top-50 / LOBT top-10 status).
 * Leaderboard display (top 20 individual / top 5 LOBT) always runs regardless of this date.
 * YYYY-MM-DD, Asia/Singapore.
 */
export const LEADERBOARD_DATA_SYNC_START_DATE = '2026-08-01';

/** @deprecated Use LEADERBOARD_DATA_SYNC_START_DATE */
export const LEADERBOARD_CALCULATION_START_DATE = LEADERBOARD_DATA_SYNC_START_DATE;

export function getLeaderboardCalendarDayKey(referenceDate: Date = new Date()): string {
  const dateOverride = parseDateOverrideFromUrl();
  if (dateOverride) {
    return dateOverride;
  }

  return new Intl.DateTimeFormat('en-CA', {
    timeZone: DAILY_HEARTS.timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(referenceDate);
}

export function isLeaderBoardDataSyncEnabled(referenceDate: Date = new Date()): boolean {
  return getLeaderboardCalendarDayKey(referenceDate) >= LEADERBOARD_DATA_SYNC_START_DATE;
}

/** @deprecated Use isLeaderBoardDataSyncEnabled */
export function isLeaderboardCalculationEnabled(referenceDate: Date = new Date()): boolean {
  return isLeaderBoardDataSyncEnabled(referenceDate);
}

/**
 * Logs whether Users.LeaderBoardData sync should run and returns true on or after the start date.
 * Display rankings are not gated — only database sync is.
 */
export function logLeaderBoardDataSyncGate(referenceDate: Date = new Date()): boolean {
  const today = getLeaderboardCalendarDayKey(referenceDate);

  if (today < LEADERBOARD_DATA_SYNC_START_DATE) {
    console.log(
      `[Leaderboard] LeaderBoardData sync skipped — today (${today}) is before ${LEADERBOARD_DATA_SYNC_START_DATE}. Display rankings still load.`
    );
    return false;
  }

  console.log(
    `[Leaderboard] LeaderBoardData sync runs — today (${today}) is on or after ${LEADERBOARD_DATA_SYNC_START_DATE}.`
  );
  return true;
}

/** @deprecated Use logLeaderBoardDataSyncGate */
export function logLeaderboardCalculationGate(referenceDate: Date = new Date()): boolean {
  return logLeaderBoardDataSyncGate(referenceDate);
}

export function createEmptyLeaderboardData(): LeaderboardData {
  return {
    individual: [],
    lobt: []
  };
}

/** @deprecated Use createEmptyLeaderboardData() */
export const EMPTY_LEADERBOARD_DATA: LeaderboardData = createEmptyLeaderboardData();
