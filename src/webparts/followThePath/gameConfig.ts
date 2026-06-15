export type GameState = 'waiting' | 'playing' | 'paused' | 'question' | 'countdown' | 'gameover';

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
  background: HTMLImageElement;
  character: HTMLImageElement;
  coin: HTMLImageElement;
  pizza: HTMLImageElement;
  shield: HTMLImageElement;
  menuBackground: HTMLImageElement;
  speechBubble: HTMLImageElement;
  buttonBackground: HTMLImageElement;
  buttonCorner: HTMLImageElement;
  obstacles: HTMLImageElement[];
  obstacleMeta: SpriteMeta[];
  characterMeta: SpriteMeta;
  coinMeta: SpriteMeta;
  pizzaMeta: SpriteMeta;
  shieldMeta: SpriteMeta;
  speechBubbleMeta: SpriteMeta;
}

export const DESIGN_WIDTH = 1920;
export const DESIGN_HEIGHT = 1080;
export const DESIGN_ASPECT = DESIGN_WIDTH / DESIGN_HEIGHT;
export const LEGACY_HEIGHT = 450;
export const SCALE = DESIGN_HEIGHT / LEGACY_HEIGHT;

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

// =============================================================================
// WELCOME MENU LAYOUT — adjust font sizes and element positions here
// All values are 1920×1080 design pixels unless marked (scaled)
// =============================================================================
export const WELCOME_MENU = {
  titleFontSize: 30,
  titleOffsetY: 0,

  descriptionFontSize: 12,
  descriptionOffsetY: 100,
  descriptionLineHeight: 14,
  descriptionWidthInset: 200,

  bestScoreFontSize: 10,
  bestScoreGap: 10,

  startButtonWidth: 350,
  startButtonHeight: 100,
  startButtonBottomOffset: 140,
  startButtonFontSize: 20,
  startButtonRadius: 0,
  startButtonCornerInset: 0,
  startButtonCornerArm: 10,

  arrowHintsBottomOffset: 110,
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
  speechBubbleWidth: 150
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
// PAUSE MENU LAYOUT — same panel style as game over / welcome menu
// =============================================================================
export const PAUSE_MENU = {
  titleFontSize: 30,
  titleOffsetY: 40,

  subtitleFontSize: 14,
  subtitleAboveButtonsOffset: 40,

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

export const COUNTDOWN_MS = 3000;
export const COUNTDOWN = {
  overlayColor: 'rgba(0, 0, 0, 0.35)',
  fontSize: 120
};

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
  width: 520,
  height: 280,
  messageFontSize: 16,
  messageOffsetY: 72,
  buttonWidth: 180,
  buttonHeight: 70,
  buttonGap: 24,
  buttonBottomOffset: 40,
  buttonFontSize: 14,
  buttonRadius: 0,
  buttonCornerInset: 0,
  buttonCornerArm: 10
};

// =============================================================================
// MENU BACKDROP — blur + dim when welcome or question popup is shown
// =============================================================================
export const MENU_BACKDROP = {
  blurPx: 6,
  overlayColor: 'rgba(0, 0, 0, 0.2)'
};

// Button bg nine-slice insets (source image pixels, 1206×341)
export const BUTTON_BG_NATIVE = { width: 1206, height: 341 };
export const BUTTON_BG_SLICES = {
  left: 125,
  right: 125,
  top: 56,
  bottom: 56
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
export const HEART_SIZE = s(22);
export const HUD_COIN_SIZE = s(24);
/** Debug collision outlines for the player (red) and obstacles (green). */
export const SHOW_OBSTACLE_HITBOXES = true;
export const XP_PER_QUESTION = 10;
export const XP_PER_LEVEL = 40;
export const WELCOME_ACCENT = '#F57C00';
export const WELCOME_PANEL_FILL = 'rgba(28, 32, 42, 0.9)';
export const MUSIC_VOLUME = 0.35;
export const SFX_VOLUME = 0.7;

export const SHIELD_SPAWN_INTERVAL_MS = 15000;
export const GAME_SPEED_INITIAL = 1;
export const GAME_SPEED_INCREMENT = 0.25;
export const GAME_SPEED_MAX = 2;
export const DEBUG_SPAWN_SHIELD_FIRST = false;
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
