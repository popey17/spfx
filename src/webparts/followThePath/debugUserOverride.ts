import { DEBUG_ALLOW_URL_USER_OVERRIDE } from './gameConfig';

/**
 * Debug-only: ?user=test@gmail.com or ?user=%22test@gmail.com%22
 * Returns undefined when the flag is off or the parameter is missing/invalid.
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
