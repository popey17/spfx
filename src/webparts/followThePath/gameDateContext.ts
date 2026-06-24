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

/** Milliseconds until the next daily heart reset (midnight in the game timezone). */
export function getMsUntilNextDailyHeartReset(fallbackNow: Date = new Date()): number {
  const now = _initialized ? getSharePointReferenceNow() : fallbackNow;
  const timeString = new Intl.DateTimeFormat('en-GB', {
    timeZone: DAILY_HEARTS.timeZone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(now);
  const segments = timeString.split(':');
  const hour = parseInt(segments[0] || '0', 10) % 24;
  const minute = parseInt(segments[1] || '0', 10);
  const second = parseInt(segments[2] || '0', 10);
  const msElapsedToday = ((hour * 60 + minute) * 60 + second) * 1000;

  return 24 * 60 * 60 * 1000 - msElapsedToday;
}

export function formatCountdownHms(remainingMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (value: number): string => (value < 10 ? '0' + value : String(value));

  return pad(hours) + ':' + pad(minutes) + ':' + pad(seconds);
}

/** @internal Test helper */
export function resetGameDateContextForTests(): void {
  _serverTimeSkewMs = 0;
  _dateOverride = undefined;
  _initialized = false;
}
