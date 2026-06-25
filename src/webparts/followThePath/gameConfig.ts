export type GameState =
  | 'waiting'
  | 'levelIntro'
  | 'playing'
  | 'paused'
  | 'question'
  | 'countdown'
  | 'levelComplete'
  | 'gameover'
  | 'shop';

export interface Question {
  level: number;
  scenario: string;
  prompt: string;
  options: string[];
  correctIndex: number;
}

export interface SpriteMeta {
  width: number;
  height: number;
}

export interface ObstacleEntity {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  spriteIndex: number;
}

export interface CoinEntity {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}

export interface ShieldEntity {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}

export interface ExplosionParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  lifeMs: number;
  maxLifeMs: number;
}

export interface ExplosionFlash {
  x: number;
  y: number;
  startedAt: number;
}

export interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  width: number;
  height: number;
  color: string;
  lifeMs: number;
  maxLifeMs: number;
}

export interface LoadedAssets {
  character: HTMLImageElement;
  coin: HTMLImageElement;
  coinSimple: HTMLImageElement;
  pizza: HTMLImageElement;
  shield: HTMLImageElement;
  menuBackground: HTMLImageElement;
  speechBubble: HTMLImageElement;
  buttonBackground: HTMLImageElement;
  buttonCorner: HTMLImageElement;
  pauseButton: HTMLImageElement;
  arrowUp: HTMLImageElement;
  star: HTMLImageElement;
  heart: HTMLImageElement;
  heartLost: HTMLImageElement;
  storeBackground: HTMLImageElement;
  levelPassRaccoon: HTMLImageElement;
  backButton: HTMLImageElement;
  muteButton: HTMLImageElement;
  soundButton: HTMLImageElement;
  obstacles: HTMLImageElement[];
  obstacleMeta: SpriteMeta[];
  characterMeta: SpriteMeta;
  coinMeta: SpriteMeta;
  coinSimpleMeta: SpriteMeta;
  pizzaMeta: SpriteMeta;
  shieldMeta: SpriteMeta;
  pauseButtonMeta: SpriteMeta;
  arrowUpMeta: SpriteMeta;
  starMeta: SpriteMeta;
  storeBackgroundMeta: SpriteMeta;
  levelPassRaccoonMeta: SpriteMeta;
  backButtonMeta: SpriteMeta;
  muteButtonMeta: SpriteMeta;
  soundButtonMeta: SpriteMeta;
  speechBubbleMeta: SpriteMeta;
}

export const DESIGN_WIDTH = 1920;
export const DESIGN_HEIGHT = 1080;
export const DESIGN_ASPECT = DESIGN_WIDTH / DESIGN_HEIGHT;
export const LEGACY_HEIGHT = 450;
export const SCALE = DESIGN_HEIGHT / LEGACY_HEIGHT;

/** Solid fallback while the screen background image loads. */
export const GAME_BACKGROUND_COLOR = '#0a1628';

/** Full-screen HTML backdrop shared by the page shell and the game viewport. */
export const SCREEN_BACKGROUND = {
  fallbackColor: GAME_BACKGROUND_COLOR,
  objectFit: 'cover' as const,
  objectPosition: 'center center'
};

export const s = (value: number): number => Math.round(value * SCALE);
export const FONT_FAMILY = 'Francois One';
export const menuFont = (size: number): string => s(size) + 'px "' + FONT_FAMILY + '", sans-serif';

// =============================================================================
// SHARED MENU PANEL — same frame for welcome + question (1920×1080 design px)
// =============================================================================
export const MENU_PANEL = {
  width: 1487,
  height: 874,
  paddingTop: 133,
  paddingBottom: 99,
};

/** Full menu background asset size (includes drop-shadow padding around the panel frame). */
export const MENU_BG_NATIVE = { width: 1568, height: 918 };

// =============================================================================
// WELCOME MENU LAYOUT — adjust font sizes and element positions here
// All values are 1920×1080 design pixels unless marked (scaled)
// =============================================================================
export const WELCOME_MENU = {
  titleFontSize: 30,
  descriptionFontSize: 12,
  descriptionLineHeight: 14,
  descriptionWidthInset: 200,
  bestScoreFontSize: 10,
  startButtonFontSize: 20,
  startButtonRadius: 0,
  startButtonCornerInset: 0,
  startButtonCornerArm: 10,

  arrowHintsFontSize: 12,
  arrowKeySize: 28,
  arrowKeyGap: 8,

  mascotShipHeight: 150,
  mascotShipBottomOffset: 30,
  mascotShipLeftOffset: -20,
  mascotFloatAmplitudeX: 14,
  mascotFloatAmplitudeY: 12,
  mascotFloatPeriodXMs: 3200,
  mascotFloatPeriodYMs: 4100,

  speechBubbleOffsetX: 200,
  speechBubbleOffsetY: 70,
  speechBubbleWidth: 150,

  /** Heart refill countdown pill shown at the top-right of the welcome screen. */
  heartRefillCounter: {
    offsetY: -8,
    marginX: 40,
    height: 24,
    paddingX: 8,
    heartIconSize: 12,
    labelText: 'Refill in',
    labelFontSize: 10,
    labelColor: 'rgba(255, 255, 255, 0.75)',
    timerFontSize: 10,
    timerColor: '#FFFFFF',
    backgroundColor: 'rgba(12, 14, 20, 0.92)',
    borderColor: 'rgba(200, 170, 110, 0.55)',
    borderWidth: 1,
    gapAfterHeart: 8,
    gapAfterLabel: 6
  },

  /** First-time / in-progress players (free mode not unlocked). */
  standard: {
    titleOffsetY: 80,
    descriptionOffsetY: 200,
    bestScoreGap: 60,
    startButtonWidth: 350,
    startButtonHeight: 100,
    startButtonBottomOffset: 200,
    arrowHintsBottomOffset: 160
  },

  /** Replay screen after all questions are complete. */
  freeMode: {
    titleOffsetY: 80,
    descriptionOffsetY: 200,
    bestScoreGap: 60,
    startButtonWidth: 350,
    startButtonHeight: 100,
    startButtonBottomOffset: 200,
    arrowHintsBottomOffset: 160
  }
};

export function getWelcomeMenuLayout(freeModeUnlocked: boolean): typeof WELCOME_MENU.standard | typeof WELCOME_MENU.freeMode {
  return freeModeUnlocked ? WELCOME_MENU.freeMode : WELCOME_MENU.standard;
}

// =============================================================================
// HOME BUTTON — top-left back link on the welcome screen
// =============================================================================
export const HOME_BUTTON = {
  marginX: 15,
  marginY: 15,
  iconSize: 30,
  fontSize: 14,
  gap: 10,
  hitPadding: 5,
  label: 'Back to Home'
};

export const BACK_BTN_NATIVE = { width: 160, height: 160 };

// =============================================================================
// MUTE BUTTON — top-right audio menu (welcome, pause, and in-game HUD)
// =============================================================================
export const MUTE_BUTTON = {
  marginX: 15,
  marginY: 15,
  iconSize: 30,
  hitPadding: 8
};

export const AUDIO_MENU = {
  panelWidth: 100,
  paddingX: 8,
  paddingY: 8,
  rowHeight: 18,
  rowGap: 8,
  gapBelowButton: 15,
  borderRadius: 5,
  fontSize: 12,
  labelMusic: 'Music',
  labelSound: 'Sound',
  background: '#111b2e',
  borderColor: '#E5A020',
  borderWidth: 2,
  textColor: '#FFFFFF',
  toggle: {
    width: 25,
    height: 15,
    knobDiameter: 12,
    borderRadius: 50,
    trackOff: '#3c4654',
    trackOn: '#F57C00',
    knobColor: '#FFFFFF',
    inset: 2
  }
} as const;

// =============================================================================
// DAILY HEARTS — persisted per player, reset each calendar day (SharePoint server clock)
// =============================================================================
export const DAILY_HEARTS = {
  /** IANA timezone used to determine when a new day starts. */
  timeZone: 'Asia/Singapore'
};
/** QA override: ?date=YYYY-MM-DD uses that calendar day instead of SharePoint server date. */

// =============================================================================
// SHARED SHOP LAYOUT — used by main-menu shop and game-over shop
// =============================================================================
export const SHOP_BUY_OPTIONS = [
  { hearts: 1, price: 10 },
  { hearts: 2, price: 20 },
  { hearts: 3, price: 30 }
] as const;

export const SHOP_MENU_LAYOUT = {
  titleFontSize: 30,
  titleOffsetY: 0,
  subtitleFontSize: 14,
  subtitleOffsetY: 80,
  buyOptions: SHOP_BUY_OPTIONS,
  rowWidth: 200,
  rowHeight: 56,
  rowGap: 40,
  rowsStartOffsetY: 150,
  heartIconSize: 20,
  heartToQuantityGap: 18,
  quantityFontSize: 18,
  quantityPrefix: 'X ',
  priceButtonWidth: 60,
  priceButtonHeight: 30,
  priceFontSize: 16,
  priceCoinIconSize: 15,
  priceCoinGap: 3,
  priceButtonColor: '#F57C00',
  priceButtonDisabledAlpha: 0.45,
  footerButtonWidth: 280,
  footerButtonHeight: 80,
  footerButtonBottomOffset: 140,
  footerButtonFontSize: 18,
  insufficientCoinsMessage: 'NOT ENOUGH COIN',
  insufficientCoinsMessageFontSize: 14,
  insufficientCoinsMessageOffsetY: 120,
  insufficientCoinsMessageDurationMs: 2500,
  insufficientCoinsMessageColor: '#FF5252',
  coinBalanceMarginX: 60,
  coinBalanceMarginY: 40,
  coinBalanceIconSize: 22,
  coinBalanceGap: 8,
  coinBalanceFontSize: 16,
  coinBalanceColor: '#FFFFFF'
} as const;

export type ShopMenuConfig = typeof SHOP_MENU_LAYOUT & {
  titleText: string;
  subtitleText: string;
  footerButtonText: string;
};

// =============================================================================
// MAIN SHOP — popup from welcome screen when player has no hearts
// =============================================================================
export const MAIN_SHOP_MENU: ShopMenuConfig = {
  ...SHOP_MENU_LAYOUT,
  titleText: 'OUT OF LIVES',
  subtitleText: 'BUY MORE TO CONTINUE PLAYING',
  footerButtonText: 'BACK'
};

export const STORE_BG_NATIVE = { width: 259, height: 130 };

// =============================================================================
// GAME OVER SHOP — shown after losing all hearts during a run
// =============================================================================
export const GAME_OVER_SHOP_MENU: ShopMenuConfig = {
  ...SHOP_MENU_LAYOUT,
  titleText: 'OUT OF LIVES',
  subtitleText: 'BUY MORE TO CONTINUE PLAYING',
  footerButtonText: 'MAIN MENU'
};

// =============================================================================
// GAME OVER MENU LAYOUT — same panel style as welcome menu
// =============================================================================
export const GAME_OVER_MENU = {
  titleFontSize: 30,
  titleOffsetY: 40,

  scoreFontSize: 20,
  bestScoreFontSize: 13,
  scoreLineGap: 40,
  scoreAboveButtonsOffset: 120,

  buttonWidth: 280,
  buttonHeight: 100,
  buttonGap: 24,
  buttonBottomOffset: 140,
  buttonFontSize: 18,
  buttonRadius: 0,
  buttonCornerInset: 0,
  buttonCornerArm: 10,

  mascotShipHeight: 150,
  mascotShipBottomOffset: 30,
  mascotShipLeftOffset: -20,

  speechBubbleOffsetX: 200,
  speechBubbleOffsetY: 70,
  speechBubbleWidth: 150
};

// =============================================================================
// PAUSE MENU LAYOUT — centered stack (icon → title → buttons)
// All values are 1920×1080 design pixels unless marked (scaled)
// =============================================================================
export const PAUSE_MENU = {
  /** Shift entire pause stack up/down from screen center (negative = higher). */
  stackOffsetY: 0,

  iconBarWidth: 14,
  iconBarHeight: 40,
  iconBarGap: 8,
  iconColor: '#FFFFFF',
  titleGapBelowIcon: 18,

  titleText: 'PAUSED',
  titleFontSize: 36,
  titleColor: '#FFFFFF',
  titleGapBelow: 20,

  subtitleText: 'PRESS ESC TO CONTINUE',
  subtitleFontSize: 14,
  subtitleColor: 'rgba(255, 255, 255, 0.85)',
  subtitleGapBelow: 32,
  showSubtitle: false,

  resumeButtonText: 'RESUME',
  mainMenuButtonText: 'MAIN MENU',
  showMainMenuButton: true,

  buttonWidth: 200,
  buttonHeight: 48,
  buttonGap: 20,
  buttonFontSize: 20,
  buttonCornerInset: 0,
  buttonCornerArm: 10,

  muteButtonSize: 30,
  muteButtonInsetX: 40,
  muteButtonInsetY: 35,
  muteButtonHitPadding: 6
};

// =============================================================================
// QUESTION POPUP LAYOUT — adjust font sizes and element positions here
// All values are 1920×1080 design pixels unless marked (scaled)
// =============================================================================
export const QUESTION_POPUP = {
  shieldSize: 280,
  shieldTopOffset: -100,

  badgeOffsetY: 140,
  badgeFontSize: 18,
  badgePaddingX: 60,
  badgeHeight: 60,

  scenarioFontSize: 18,
  scenarioGapBelowBadge: 45,
  scenarioLineHeight: 50,
  scenarioWidthInset: 300,

  promptFontSize: 18,
  promptGapBelowScenario: 45,

  horizontalPadding: 100,
  answerButtonGap: 24,
  answerButtonHeight: 200,
  answerButtonBottomOffset: 15,
  answerButtonFontSize: 14,
  answerButtonLineHeight: 40,
  answerButtonRadius: 0,
  answerButtonCornerInset: 0,
  answerButtonCornerArm: 14,
  answerButtonPaddingX: 80,
  answerButtonHorizontalInset: 0
};

export const ANSWER_FEEDBACK_MS = 600;
export const ANSWER_CORRECT_TINT = 'rgba(34, 197, 94, 0.55)';
export const ANSWER_WRONG_TINT = 'rgba(239, 68, 68, 0.55)';
export const WRONG_ANSWER_SCREEN_SHAKE = {
  durationMs: 600,
  amplitude: 14
};

export const COUNTDOWN_MS = 3000;
export const COUNTDOWN = {
  overlayColor: 'rgba(0, 0, 0, 0.35)',
  fontSize: 120
};

// =============================================================================
// LEVEL INTRO — shown at game start and when advancing to the next level
// =============================================================================
export const LEVEL_INTRO = {
  enabled: true,
  durationMs: 2500,
  showOnGameStart: true,
  showOnLevelAdvance: true,
  stackOffsetY: 0,
  levelNumberFontSize: 30,
  levelNameFontSize:36,
  levelNumberText: (level: number): string => 'LEVEL ' + level,
  levelNameGap: 12,
  arrowKeySize: 28,
  arrowKeyGap: 8,
  arrowHintsGapBelowName: 48,
  arrowHintsFontSize: 14,
  instructionText: 'Use arrow keys to control the spaceship',
  instructionGapBelowKeys: 10
};

// =============================================================================
// LEVEL COMPLETE — congrats popup when all questions in a level are answered
// Uses the same MENU_PANEL frame as welcome / question screens
// =============================================================================
const LEVEL_COMPLETE_COPY = [
  {
    description: "You've cleared the first checkpoint.",
    celebration: 'Great Start!'
  },
  {
    description: "The risks are getting more complex, but you're staying on course.",
    celebration: 'Awesome!'
  },
  {
    description: 'You stayed the course & took ownership when it mattered!',
    celebration: 'Congratulations!'
  }
] as const;

export const LEVEL_COMPLETE = {
  /** Nudge entire content stack up/down (negative = higher). */
  stackOffsetY: 0,
  starSize: 60,
  starGapBelow: 20,
  descriptionText: (level: number): string => {
    const index = Math.max(0, Math.min(level - 1, LEVEL_COMPLETE_COPY.length - 1));
    return LEVEL_COMPLETE_COPY[index].description;
  },
  titleFontSize: 16,
  titleMaxWidth: 900,
  titleLineHeight: 22,
  titleColor: 'rgba(255, 255, 255, 0.9)',
  titleGapBelow: 12,
  headlineText: (level: number): string => {
    const index = Math.max(0, Math.min(level - 1, LEVEL_COMPLETE_COPY.length - 1));
    return LEVEL_COMPLETE_COPY[index].celebration;
  },
  headlineFontSize: 32,
  headlineColor: '#FFFFFF',
  headlineGapBelow: 16,
  rewardsFontSize: 18,
  rewardsColor: '#FFFFFF',
  coinIconSize: 30,
  /** Multiplier for vertical alignment of rewards text baseline (higher = lower). */
  rewardsBaselineFactor: 0.48,
  showCoinReward: true,
  showXpReward: true,
  coinRewardPrefix: '+ ',
  xpRewardPrefix: '+ ',
  xpRewardSuffix: ' XP',
  /** Horizontal gap between coin reward and XP reward. */
  rewardsGapBetweenCoinAndXp: 16,
  /** Gap between rewards line and PROCEED button top. */
  rewardsGapAboveProceedButton: 28,
  proceedButtonText: 'PROCEED',
  playAgainButtonText: 'PLAY AGAIN',
  mainMenuButtonText: 'MAIN MENU',
  proceedButtonWidth: 300,
  proceedButtonHeight: 88,
  finalLevelButtonWidth: 280,
  finalLevelButtonHeight: 88,
  finalLevelButtonGap: 24,
  /** Distance from panel content bottom to PROCEED button bottom. */
  proceedButtonBottomOffset: 50,
  proceedButtonFontSize: 18,
  showMascot: true,
  mascotHeight: 190,
  mascotRightOffset: -10,
  mascotBottomOffset: 20
};

export const STAR_NATIVE = { width: 253, height: 240 };
export const LEVEL_PASS_RACCOON_NATIVE = { width: 664, height: 886 };

export const HIT_GHOST_MODE_MS = 3000;
export const GHOST_MODE_PULSE = {
  minOpacity: 0.5,
  maxOpacity: 0.8,
  periodMs: 600
};

export const GOD_MODE_HOLO_RING = {
  offsetX: 18,
  offsetY: -10,
  radiusX: 30,
  radiusY: 11,
  lineWidth: 4,
  innerScale: 0.72,
  opacity: 0.92,
  innerOpacity: 0.55
};

export const GOD_MODE_WIND = {
  angleRadians: -0.42,
  streakCount: 7,
  streakLength: 30,
  streakWidth: 2,
  spreadX: 56,
  spreadY: 76,
  speed: 0.14,
  color: 'rgba(0, 229, 255, 0.6)',
  colorFade: 'rgba(124, 77, 255, 0.15)'
};

export const EXPLOSION = {
  particleCount: 20,
  lifetimeMs: 550,
  flashLifetimeMs: 140,
  minSpeed: 3,
  maxSpeed: 9,
  minRadius: 2,
  maxRadius: 7,
  flashMaxRadius: 44,
  gravity: 0.12,
  colors: ['#FFFFFF', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722']
};

export const CONFETTI = {
  particleCount: 110,
  lifetimeMs: 3800,
  minWidth: 8,
  maxWidth: 18,
  minHeight: 12,
  maxHeight: 28,
  minFallSpeed: 2.2,
  maxFallSpeed: 6.8,
  minSwaySpeed: 0.04,
  maxSwaySpeed: 0.1,
  swayAmplitude: 2.4,
  colors: ['#FF5252', '#FFEB3B', '#69F0AE', '#40C4FF', '#E040FB', '#FF9800', '#FFFFFF']
};

// =============================================================================
// PAUSE CONFIRM DIALOG — small overlay when leaving pause to main menu
// =============================================================================
export const PAUSE_CONFIRM = {
  /** Full-screen dim behind the confirm panel (higher alpha = more opaque). */
  overlayColor: 'rgba(0, 0, 0, 0.75)',
  width: 700,
  height: 400,
  messageFontSize: 20,
  messageOffsetY: 120,
  buttonWidth: 180,
  buttonHeight: 60,
  buttonGap: 20,
  buttonBottomOffset: 120,
  buttonFontSize: 14,
  buttonRadius: 0,
  buttonCornerInset: 0,
  buttonCornerArm: 10
};

// =============================================================================
// MENU BACKDROP — full-screen dark blur when a menu overlay is open
// =============================================================================
export const MENU_BACKDROP = {
  blurPx: 6,
  overlayColor: 'rgba(0, 0, 0, 0.35)'
};

// Button bg nine-slice insets (source image pixels, 1206×341)
export const BUTTON_BG_NATIVE = { width: 1206, height: 341 };
export const BUTTON_BG_SLICES = {
  left: 125,
  right: 125,
  top: 56,
  bottom: 56
};

/** Hover / keyboard-focus animation for menu buttons. */
export const MENU_BUTTON_HOVER = {
  baseScale: 1.04,
  pulseAmplitude: 0.018,
  pulseSpeed: 0.009,
  liftPx: 0.5,
  focusOverlayAlpha: 0.24,
  hoverOverlayAlpha: 0.18
};

export const font = menuFont;

export const PLAYER_X = 0;
export const PLAYER_HEIGHT = s(84);
export const PLAYER_SPEED = s(5);
export const PLAYER_FLOAT = {
  amplitudeX: 3,
  amplitudeY: 7,
  periodXMs: 2800,
  periodYMs: 2200,
  yPhase: Math.PI / 3
};
export const SCROLL_SPEED = s(4);
export const COIN_DISPLAY_SIZE = s(104);
export const PIZZA_DISPLAY_SCALE = 0.5;
export const SHIELD_DISPLAY_SIZE = s(104);
export const MAX_LIVES = 3;
export const OBSTACLE_DISPLAY_SCALE = 1; // 2× previous ~50% native render size
export const COLLISION_SCALE = 0.72; // collision area is smaller than the rendered sprite
export const HUD_HEIGHT = s(52);
export const HUD_PADDING = s(16);
export const PAUSE_BTN_SIZE = s(40);
export const PAUSE_BTN_NATIVE = { width: 164, height: 164 };
export const MUTE_BTN_NATIVE = { width: 164, height: 164 };
export const ARROW_KEY_NATIVE = { width: 92, height: 92 };
export const HEART_SIZE = s(22);
export const HUD_COIN_SIZE = s(24);
export const UI_COIN_NATIVE = { width: 86, height: 86 };
/** In-game top bar labels and level display. */
export const HUD = {
  livesLabel: 'LIVES LEFT:',
  scoreLabel: 'SCORE:',
  levelFontSize: 18,
  /** Display names for question levels 1–3 (index 0 = level 1). */
  levelNames: ['EASY', 'MEDIUM', 'ADVANCED'] as const,
  levelText: (level: number, levelName: string): string => 'LEVEL ' + level + ': ' + levelName
};
/** On-screen up/down controls for touch devices (auto-detected). Anchored to the right edge. */
export const MOBILE_CONTROLS = {
  enabled: true,
  forceEnable: false,
  buttonSize: 80,
  marginX: 28,
  marginBottom: 36,
  buttonGap: 10,
  fillColor: 'rgba(28, 32, 42, 0.72)',
  fillPressedColor: 'rgba(245, 124, 0, 0.88)',
  borderColor: 'rgba(255, 255, 255, 0.55)',
  borderPressedColor: '#FFB74D',
  arrowColor: '#FFFFFF'
};
/** Debug collision outlines for the player (red) and obstacles (green). */
export const SHOW_OBSTACLE_HITBOXES = false;
/** Legacy per-question XP — no longer used for rewards but kept for compatibility. */
export const XP_PER_QUESTION = 0;
/** XP granted once per level when all questions in that level are completed. */
export const LEVEL_XP_REWARDS = [10, 10, 10] as const;
export const WELCOME_ACCENT = '#F57C00';
export const WELCOME_PANEL_FILL = 'rgba(28, 32, 42, 0.9)';
export const MUSIC_VOLUME = 0.35;
export const SFX_VOLUME = 0.7;

export const QUESTION_INTERVAL_MS = 15000;
export const SHIELD_SPAWN_MIN_MS = 5000;
export const SHIELD_SPAWN_MAX_MS = 7000;
/** Power shield duration after a correct answer or in-game shield pickup. */
export const POWER_SHIELD_DURATION_MS = 7000;
/** Blink the shield aura when remaining time is at or below this threshold. */
export const POWER_SHIELD_BLINK = {
  warningMs: 3000,
  minOpacity: 0.2,
  maxOpacity: 0.95,
  periodMs: 250
};
/** @deprecated Use SHIELD_SPAWN_MIN_MS / SHIELD_SPAWN_MAX_MS */
export const SHIELD_SPAWN_INTERVAL_MS = QUESTION_INTERVAL_MS;
export const GAME_SPEED_INITIAL = 1;
export const GAME_SPEED_INCREMENT = 0.25;
export const GAME_SPEED_MAX = 2;
export const DEBUG_SPAWN_SHIELD_FIRST = false;
/** Set true to auto-collect shield pickups and grant the power-up shield. */
export const DEBUG_AUTO_COLLECT_SHIELDS = false;
/** Set true to force free mode on the welcome screen (ignores SharePoint progress). */
export const DEBUG_FORCE_FREE_MODE = false;
/** Set true to show the level-complete congrats screen immediately when a game starts. */
export const DEBUG_SHOW_LEVEL_COMPLETE_AT_START = false;
/**
 * Set true to allow ?user=email@example.com as a fallback when ?email= is not set (debug / QA only).
 * Production flow uses ?email= from Register.aspx redirect.
 */
export const DEBUG_ALLOW_URL_USER_OVERRIDE = true;
/** Set true to skip Users list check and play with in-memory progress (local testing only). */
export const DEBUG_SKIP_USER_CHECK = false;
/** Set true to force 0 hearts and auto-open the main-menu shop (shop UI debugging). */
export const DEBUG_FORCE_ZERO_HEARTS = false;
export const SPAWN_RETRY_DELAY_MS = 200;
export const SPAWN_POSITION_ATTEMPTS = 16;
export const SPAWN_SEPARATION = s(12);
export const QUESTIONS_PER_LEVEL = 4;
export const MAX_QUESTION_LEVEL = 3;
export const TOTAL_QUESTION_COUNT = QUESTIONS_PER_LEVEL * MAX_QUESTION_LEVEL;
export const OBSTACLE_SPAWN_MIN_MS = 800;
export const OBSTACLE_SPAWN_MAX_MS = 1800;
export const OBSTACLE_PENALTY_SPAWN_MIN_MS = 500;
export const OBSTACLE_PENALTY_SPAWN_MAX_MS = 1000;

export const CHEAT_CODE_GOD = 'iamagod';
export const CHEAT_CODE_RICH = 'iamrich';
export const CHEAT_CODE_TURBO = 'turbo';
export const CHEAT_CODE_PIZZA = 'pizzaparty';
export const CHEAT_CODE_CLEAR = 'ihavesinned';
export const CHEAT_CODE_BUFFER_MAX = 20;
export const CHEAT_TURBO_MULTIPLIER = 4;
export const CHEAT_MAGNET_RADIUS = s(420);
export const CHEAT_MAGNET_SPEED = s(22);

export const QUESTIONS: Question[] = [
  {
    level: 1,
    scenario:
      'YOU NOTICE A CONFIGURATION CHANGE YOUR TEAMMATE MADE LAST WEEK MAY BE AFFECTING SYSTEM PERFORMANCE. NO INCIDENTS HAVE BEEN REPORTED YET.',
    prompt: 'WHAT DO YOU DO?',
    options: [
      'Assume monitoring tools will catch serious problems',
      'Flag it to your team and investigate the potential impact immediately'
    ],
    correctIndex: 1
  },
  {
    level: 1,
    scenario:
      'A TEAMMATE URGENTLY NEEDS ACCESS TO COMPLETE A TASK AND ASKS TO BORROW YOUR PASSWORD TEMPORARILY.',
    prompt: 'WHAT DO YOU DO?',
    options: [
      'Share it and change the password later',
      'Decline and direct them to request proper access'
    ],
    correctIndex: 1
  },
  {
    level: 1,
    scenario:
      'YOU REALISE YOU STILL HAVE PRODUCTION ACCESS FROM A PREVIOUS PROJECT, EVEN THOUGH YOU NO LONGER NEED IT.',
    prompt: 'WHAT DO YOU DO?',
    options: [
      'Request for the access to be removed',
      'Ignore it since you are not actively using it'
    ],
    correctIndex: 0
  },
  {
    level: 1,
    scenario:
      'A TEAMMATE SUGGESTS TEMPORARILY BYPASSING A MONITORING ALERT BECAUSE IT HAS BEEN "TRIGGERING TOO OFTEN."',
    prompt: 'WHAT DO YOU DO?',
    options: [
      'Investigate why the alert is triggering before making changes',
      'Turn it off and rely on manual checks'
    ],
    correctIndex: 0
  },
  {
    level: 2,
    scenario:
      'DURING DEPLOYMENT, A TEAMMATE SUGGESTS MAKING A QUICK PRODUCTION TWEAK OUTSIDE THE APPROVED CHANGE REQUEST SCOPE.',
    prompt: 'WHAT SHOULD YOU DO?',
    options: [
      'Make the change and update documentation later',
      'Reject the change and follow the approved process'
    ],
    correctIndex: 1
  },
  {
    level: 2,
    scenario: 'A TEAM WANTS TO DEPLOY MANUALLY BECAUSE THE CICD PIPELINE IS TEMPORARILY SLOW.',
    prompt: 'WHAT SHOULD YOU DO?',
    options: [
      'Use CICD unless a formal exemption exists',
      'Approve manual deployment to avoid delays'
    ],
    correctIndex: 0
  },
  {
    level: 2,
    scenario:
      'A SECURITY SCAN IDENTIFIES VULNERABILITIES THAT THE TEAM BELIEVES ARE "LOW RISK."',
    prompt: 'WHAT SHOULD YOU DO?',
    options: [
      'Ensure findings are assessed and remediated as required',
      'Proceed without remediation'
    ],
    correctIndex: 0
  },
  {
    level: 2,
    scenario:
      'YOU NOTICE RELEASE DOCUMENTATION DOES NOT CLEARLY MAP REQUIREMENTS TO CODE CHANGES AND TEST CASES.',
    prompt: 'WHAT SHOULD YOU DO?',
    options: [
      'Rely on verbal explanations instead',
      'Ensure proper traceability is completed before deployment'
    ],
    correctIndex: 1
  },
  {
    level: 3,
    scenario:
      'A PRODUCTION ISSUE OCCURS AFTER A DEPLOYMENT INVOLVING MULTIPLE TEAMS. YOUR TEAM\'S COMPONENT MAY HAVE CONTRIBUTED, BUT ROOT CAUSE IS NOT CONFIRMED.',
    prompt: 'WHAT SHOULD YOU DO?',
    options: [
      'Proactively raise potential impact and support investigation efforts',
      'Wait until investigations confirm involvement'
    ],
    correctIndex: 0
  },
  {
    level: 3,
    scenario:
      'A DEVELOPER PROPOSES REMOVING AN OLD VALIDATION STEP BECAUSE IT APPEARS REDUNDANT AND SLOWS PERFORMANCE.',
    prompt: 'WHAT SHOULD YOU DO?',
    options: [
      'Assess whether it acts as a hidden safeguard elsewhere in the system',
      'Remove it temporarily and monitor production'
    ],
    correctIndex: 0
  },
  {
    level: 3,
    scenario:
      'YOU NOTICE EXPERIENCED TEAM MEMBERS REGULARLY BYPASS SMALL PROCESS STEPS BECAUSE "NOTHING HAS GONE WRONG BEFORE."',
    prompt: 'WHAT SHOULD YOU DO?',
    options: [
      'Follow the process during audits',
      'Raise concerns and continue following established processes'
    ],
    correctIndex: 1
  },
  {
    level: 3,
    scenario:
      'A CRITICAL CUSTOMER ISSUE REQUIRES URGENT INTERVENTION, BUT PROPER ACCESS HAS NOT YET BEEN GRANTED.',
    prompt: 'WHAT SHOULD YOU DO?',
    options: [
      'Suppress alerts until patterns become clearer',
      'Escalate and investigate the abnormal behaviour'
    ],
    correctIndex: 1
  }
];

export const OBSTACLE_NATIVE: SpriteMeta[] = [
  { width: 220, height: 161 },
  { width: 194, height: 149 },
  { width: 167, height: 136 },
  { width: 184, height: 154 },
  { width: 160, height: 189 }
];

export const CHARACTER_SPRITE_NATIVE: SpriteMeta = { width: 393, height: 241 };
export const CHARACTER_HITBOX_NATIVE: SpriteMeta = { width: 317, height: 241 };
// Rear thruster glow sits on the left of the sprite; hitbox covers the ship body only.
export const CHARACTER_HITBOX_OFFSET_X_NATIVE: number =
  CHARACTER_SPRITE_NATIVE.width - CHARACTER_HITBOX_NATIVE.width;

export const MOVEMENT_KEYS: Record<string, number> = {
  ArrowUp: -1,
  ArrowDown: 1,
  w: -1,
  W: -1,
  s: 1,
  S: 1
};

export const PREVENT_DEFAULT_KEYS: Record<string, boolean> = {
  ArrowUp: true,
  ArrowDown: true,
  ArrowLeft: true,
  ArrowRight: true,
  w: true,
  W: true,
  s: true,
  S: true,
  ' ': true,
  p: true,
  Escape: true,
  Enter: true
};
