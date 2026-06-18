import { DEBUG_ALLOW_URL_USER_OVERRIDE } from './gameConfig';

/**
 * Debug/QA fallback: ?user=test@gmail.com when ?email= is not set.
 * Requires DEBUG_ALLOW_URL_USER_OVERRIDE. Production uses ?email= instead.
 */
export function getDebugUserEmailFromUrl(): string | undefined {
  if (!DEBUG_ALLOW_URL_USER_OVERRIDE || typeof window === 'undefined') {
    return undefined;
  }

  const raw = new URLSearchParams(window.location.search).get('user');
  if (!raw) {
    return undefined;
  }

  const email = raw.trim().replace(/^["']+|["']+$/g, '');
  if (!email || email.indexOf('@') === -1) {
    console.warn('[FollowThePath] Ignoring invalid debug user URL parameter:', raw);
    return undefined;
  }

  console.warn('[FollowThePath] Debug user override active:', email);
  return email;
}
