import { DAILY_HEARTS } from './gameConfig';

let _serverTimeSkewMs = 0;
let _dateOverride: string | undefined;
let _initialized = false;

/** ?date=YYYY-MM-DD — treat this calendar day as "today" for daily hearts and stats. */
export function parseDateOverrideFromUrl(): string | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const raw = new URLSearchParams(window.location.search).get('date');
  if (!raw) {
    return undefined;
  }

  const trimmed = raw.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    console.warn('[FollowThePath] Ignoring invalid date URL parameter:', raw);
    return undefined;
  }

  console.warn('[FollowThePath] Date override active:', trimmed);
  return trimmed;
}

export function formatCalendarDateInGameTimezone(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: DAILY_HEARTS.timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
}

/**
 * Align daily resets to SharePoint server time (via clock skew from the SP Date header).
 * Optional ?date=YYYY-MM-DD overrides the calendar day for QA.
 */
export function initGameDateContext(options: {
  serverTime: Date;
  clientTimeAtFetch: Date;
  dateOverride?: string;
}): void {
  _serverTimeSkewMs = options.serverTime.getTime() - options.clientTimeAtFetch.getTime();
  _dateOverride = options.dateOverride;
  _initialized = true;
}

export function isGameDateContextInitialized(): boolean {
  return _initialized;
}

export function getSharePointReferenceNow(): Date {
  if (!_initialized) {
    return new Date();
  }

  return new Date(Date.now() + _serverTimeSkewMs);
}

/** Calendar day key (YYYY-MM-DD) in the game timezone, based on SharePoint server clock. */
export function getDailyHeartsDayKey(fallbackNow: Date = new Date()): string {
  if (_dateOverride) {
    return _dateOverride;
  }

  if (_initialized) {
    return formatCalendarDateInGameTimezone(getSharePointReferenceNow());
  }

  return formatCalendarDateInGameTimezone(fallbackNow);
}

/** @internal Test helper */
export function resetGameDateContextForTests(): void {
  _serverTimeSkewMs = 0;
  _dateOverride = undefined;
  _initialized = false;
}
