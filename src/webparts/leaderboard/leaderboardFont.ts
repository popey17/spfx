import { FONT_FAMILY } from '../followThePath/gameConfig';

const FONT_LINK_ID = 'follow-the-path-francois-one';

/** Loads Francois One from Google Fonts (shared link id with Follow the Path). */
export function ensureFrancoisOneFont(): void {
  if (typeof document === 'undefined' || document.getElementById(FONT_LINK_ID)) {
    return;
  }

  const link = document.createElement('link');
  link.id = FONT_LINK_ID;
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Francois+One&display=swap';
  document.head.appendChild(link);
}

export const LEADERBOARD_FONT_FAMILY = '"' + FONT_FAMILY + '", sans-serif';
