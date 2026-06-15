/* eslint-disable @typescript-eslint/no-var-requires */
const bgUrl: string = require('./assets/img_bg.png');
const characterUrl: string = require('./assets/img_character.png');
const coinUrl: string = require('./assets/img_coin.png');
const shieldUrl: string = require('./assets/img_shield.png');
const menuBgUrl: string = require('./assets/img_menuBg.png');
const speechBubbleUrl: string = require('./assets/img_Bubble.png');
const buttonBgUrl: string = require('./assets/button Bg.png');
const buttonCornerUrl: string = require('./assets/buttonCorner.png');
const coinSoundUrl: string = require('./assets/sound/coin.mp3');
const crushSoundUrl: string = require('./assets/sound/crush.mp3');
const alarmSoundUrl: string = require('./assets/sound/alarm.mp3');
const correctSoundUrl: string = require('./assets/sound/correct.mp3');
const menuMusicUrl: string = require('./assets/sound/msinMenu.mp3');
const gameOverSoundUrl: string = require('./assets/sound/game0ver02.mp3');
const gameMusicUrl: string = require('./assets/sound/gameMusic01.mp3');
const obstacleUrls: string[] = [
  require('./assets/a.png'),
  require('./assets/b.png'),
  require('./assets/c.png'),
  require('./assets/d.png'),
  require('./assets/e.png')
];

type GameState = 'waiting' | 'playing' | 'paused' | 'question' | 'gameover';

interface Question {
  level: number;
  scenario: string;
  prompt: string;
  options: string[];
  correctIndex: number;
}

interface SpriteMeta {
  width: number;
  height: number;
}

interface ObstacleEntity {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  spriteIndex: number;
}

interface CoinEntity {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}

interface ShieldEntity {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}

interface LoadedAssets {
  background: HTMLImageElement;
  character: HTMLImageElement;
  coin: HTMLImageElement;
  shield: HTMLImageElement;
  menuBackground: HTMLImageElement;
  speechBubble: HTMLImageElement;
  buttonBackground: HTMLImageElement;
  buttonCorner: HTMLImageElement;
  obstacles: HTMLImageElement[];
  obstacleMeta: SpriteMeta[];
  characterMeta: SpriteMeta;
  coinMeta: SpriteMeta;
  shieldMeta: SpriteMeta;
  speechBubbleMeta: SpriteMeta;
}

const DESIGN_WIDTH = 1920;
const DESIGN_HEIGHT = 1080;
const DESIGN_ASPECT = DESIGN_WIDTH / DESIGN_HEIGHT;
const LEGACY_HEIGHT = 450;
const SCALE = DESIGN_HEIGHT / LEGACY_HEIGHT;

const s = (value: number): number => Math.round(value * SCALE);
const FONT_FAMILY = 'Francois One';
const menuFont = (size: number): string => s(size) + 'px "' + FONT_FAMILY + '", sans-serif';

// =============================================================================
// SHARED MENU PANEL — same frame for welcome + question (1920×1080 design px)
// =============================================================================
const MENU_PANEL = {
  width: 1487,
  height: 874,
  paddingTop: 133,
  paddingBottom: 99,
};

// =============================================================================
// WELCOME MENU LAYOUT — adjust font sizes and element positions here
// All values are 1920×1080 design pixels unless marked (scaled)
// =============================================================================
const WELCOME_MENU = {
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

  speechBubbleOffsetX: 200,
  speechBubbleOffsetY: 70,
  speechBubbleWidth: 150
};

// =============================================================================
// GAME OVER MENU LAYOUT — same panel style as welcome menu
// =============================================================================
const GAME_OVER_MENU = {
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
const PAUSE_MENU = {
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
const QUESTION_POPUP = {
  shieldSize: 280,
  shieldTopOffset: -100,

  badgeOffsetY: 140,
  badgeFontSize: 18,
  badgePaddingX: 60,
  badgeHeight: 60,

  scenarioFontSize: 20,
  scenarioGapBelowBadge: 60,
  scenarioLineHeight: 50,
  scenarioWidthInset: 300,

  promptFontSize: 20,
  promptGapBelowScenario: 60,

  horizontalPadding: 100,
  answerButtonGap: 24,
  answerButtonHeight: 200,
  answerButtonBottomOffset: 30,
  answerButtonFontSize: 14,
  answerButtonLineHeight: 40,
  answerButtonRadius: 0,
  answerButtonCornerInset: 0,
  answerButtonCornerArm: 14,
  answerButtonPaddingX: 80,
  answerButtonHorizontalInset: 0
};

// =============================================================================
// PAUSE CONFIRM DIALOG — small overlay when leaving pause to main menu
// =============================================================================
const PAUSE_CONFIRM = {
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
const MENU_BACKDROP = {
  blurPx: 6,
  overlayColor: 'rgba(0, 0, 0, 0.2)'
};

// Button bg nine-slice insets (source image pixels, 1206×341)
const BUTTON_BG_NATIVE = { width: 1206, height: 341 };
const BUTTON_BG_SLICES = {
  left: 125,
  right: 125,
  top: 56,
  bottom: 56
};

const font = menuFont;

const PLAYER_X = 0;
const PLAYER_HEIGHT = s(84);
const PLAYER_SPEED = s(5);
const SCROLL_SPEED = s(4);
const COIN_DISPLAY_SIZE = s(104);
const SHIELD_DISPLAY_SIZE = s(104);
const MAX_LIVES = 3;
const OBSTACLE_DISPLAY_SCALE = 1; // 2× previous ~50% native render size
const COLLISION_SCALE = 0.72; // collision area is smaller than the rendered sprite
const HUD_HEIGHT = s(52);
const HUD_PADDING = s(16);
const PAUSE_BTN_SIZE = s(40);
const HEART_SIZE = s(22);
const HUD_COIN_SIZE = s(24);
const SHOW_OBSTACLE_HITBOXES = true;
const BEST_SCORE_STORAGE_KEY = 'followThePathBestScore';
const WELCOME_ACCENT = '#F57C00';
const WELCOME_PANEL_FILL = 'rgba(28, 32, 42, 0.9)';
const MUSIC_VOLUME = 0.35;
const SFX_VOLUME = 0.7;

const SHIELD_SPAWN_INTERVAL_MS = 30000;
const DEBUG_SPAWN_SHIELD_FIRST = true; // TODO: set false before release — first shield spawns immediately
const SPAWN_RETRY_DELAY_MS = 200;
const SPAWN_POSITION_ATTEMPTS = 16;
const SPAWN_SEPARATION = s(12);
const QUESTIONS_PER_LEVEL = 4;
const MAX_QUESTION_LEVEL = 3;
const OBSTACLE_SPAWN_MIN_MS = 800;
const OBSTACLE_SPAWN_MAX_MS = 1800;
const OBSTACLE_PENALTY_SPAWN_MIN_MS = 500;
const OBSTACLE_PENALTY_SPAWN_MAX_MS = 1000;

// TODO: replace with SharePoint list lookup
const DUMMY_SHAREPOINT_BEST_SCORE = 128;

const QUESTIONS: Question[] = [
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

const OBSTACLE_NATIVE: SpriteMeta[] = [
  { width: 220, height: 161 },
  { width: 194, height: 149 },
  { width: 167, height: 136 },
  { width: 184, height: 154 },
  { width: 160, height: 189 }
];

const CHARACTER_SPRITE_NATIVE: SpriteMeta = { width: 393, height: 241 };
const CHARACTER_HITBOX_NATIVE: SpriteMeta = { width: 317, height: 241 };
// Rear thruster glow sits on the left of the sprite; hitbox covers the ship body only.
const CHARACTER_HITBOX_OFFSET_X_NATIVE: number =
  CHARACTER_SPRITE_NATIVE.width - CHARACTER_HITBOX_NATIVE.width;

const MOVEMENT_KEYS: Record<string, number> = {
  ArrowUp: -1,
  ArrowDown: 1,
  w: -1,
  W: -1,
  s: 1,
  S: 1
};

const PREVENT_DEFAULT_KEYS: Record<string, boolean> = {
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
  Enter: true
};

/**
 * Self-contained 2D endless runner that mounts a canvas inside a target element.
 * Designed for SPFx web parts: call `new EndlessRunnerGame(domElement)` from `render()`.
 */
export interface EndlessRunnerGameOptions {
  fullscreenLayout?: boolean;
}

export class EndlessRunnerGame {
  private readonly _container: HTMLDivElement;
  private readonly _viewport: HTMLDivElement;
  private readonly _canvas: HTMLCanvasElement;
  private readonly _ctx: CanvasRenderingContext2D;
  private readonly _boundKeyDown: (event: KeyboardEvent) => void;
  private readonly _boundKeyUp: (event: KeyboardEvent) => void;
  private readonly _boundResize: () => void;
  private readonly _boundGameLoop: (timestamp: number) => void;
  private readonly _boundPointerDown: (event: PointerEvent) => void;
  private readonly _boundClick: (event: MouseEvent) => void;
  private readonly _boundUnlockAudio: () => void;
  private readonly _playerWidth: number;
  private _resizeObserver: ResizeObserver | undefined;

  private _animationFrameId: number = 0;
  private _lastTimestamp: number = 0;
  private _state: GameState = 'waiting';
  private _score: number = 0;
  private _lives: number = MAX_LIVES;
  private _playerY: number = 0;
  private _movement: number = 0;
  private _obstacles: ObstacleEntity[] = [];
  private _coins: CoinEntity[] = [];
  private _shields: ShieldEntity[] = [];
  private _nextObstacleAt: number = 0;
  private _nextCoinAt: number = 0;
  private _nextShieldAt: number = 0;
  private _currentLevel: number = 1;
  private _activeQuestionInLevelIndex: number = 0;
  private _answeredInLevel: boolean[] = [false, false, false, false];
  private _allQuestionsComplete: boolean = false;
  private _obstaclePenalty: number = 0;
  private _selectedAnswerIndex: number = 0;
  private readonly _fullscreenLayout: boolean;
  private _assets: LoadedAssets | undefined;
  private readonly _menuMusic: HTMLAudioElement;
  private readonly _gameMusic: HTMLAudioElement;
  private readonly _coinSound: HTMLAudioElement;
  private readonly _crushSound: HTMLAudioElement;
  private readonly _alarmSound: HTMLAudioElement;
  private readonly _correctSound: HTMLAudioElement;
  private readonly _gameOverSound: HTMLAudioElement;
  private _backdropCanvas: HTMLCanvasElement | undefined;
  private _bestScore: number = 0;
  private _disposed: boolean = false;
  private _lastCanvasPressAt: number = 0;
  private _showPauseMainMenuConfirm: boolean = false;
  private _audioUnlocked: boolean = false;

  constructor(target: HTMLElement, options: EndlessRunnerGameOptions = {}) {
    this._bestScore = this._loadBestScore();
    this._fullscreenLayout = options.fullscreenLayout === true;
    this._playerWidth = Math.round(
      PLAYER_HEIGHT * (CHARACTER_SPRITE_NATIVE.width / CHARACTER_SPRITE_NATIVE.height)
    );

    this._boundKeyDown = this._onKeyDown.bind(this);
    this._boundKeyUp = this._onKeyUp.bind(this);
    this._boundResize = this._resizeCanvas.bind(this);
    this._boundGameLoop = this._gameLoop.bind(this);
    this._boundPointerDown = this._onPointerDown.bind(this);
    this._boundClick = this._onClick.bind(this);
    this._boundUnlockAudio = this._unlockAudio.bind(this);
    this._menuMusic = this._createAudio(menuMusicUrl, MUSIC_VOLUME, true);
    this._gameMusic = this._createAudio(gameMusicUrl, MUSIC_VOLUME, true);
    this._coinSound = this._createAudio(coinSoundUrl, SFX_VOLUME, false);
    this._crushSound = this._createAudio(crushSoundUrl, SFX_VOLUME, false);
    this._alarmSound = this._createAudio(alarmSoundUrl, SFX_VOLUME, false);
    this._correctSound = this._createAudio(correctSoundUrl, SFX_VOLUME, false);
    this._gameOverSound = this._createAudio(gameOverSoundUrl, SFX_VOLUME, false);
    this._ensureGameFont();

    if (this._fullscreenLayout) {
      this._applyFullscreenPageLayout(target);
    }

    this._container = document.createElement('div');
    this._container.style.cssText = this._fullscreenLayout
      ? 'position:fixed;top:0;left:0;width:100vw;height:100vh;display:flex;justify-content:center;align-items:center;overflow:hidden;background:#0a1628;z-index:9999;'
      : 'position:relative;width:100%;display:flex;justify-content:center;align-items:center;overflow:hidden;';

    this._viewport = document.createElement('div');
    this._viewport.style.cssText = 'position:relative;overflow:hidden;flex-shrink:0;';

    this._canvas = document.createElement('canvas');
    this._canvas.style.cssText = 'display:block;width:100%;height:100%;cursor:default;touch-action:none;';
    this._canvas.setAttribute('tabindex', '0');
    this._canvas.setAttribute('role', 'application');
    this._canvas.setAttribute('aria-label', 'Follow the Path endless runner game');

    const context = this._canvas.getContext('2d');
    if (!context) {
      throw new Error('Unable to acquire 2D canvas context.');
    }
    this._ctx = context;

    this._viewport.appendChild(this._canvas);
    this._container.appendChild(this._viewport);
    target.innerHTML = '';
    target.appendChild(this._container);

    this._resizeCanvas();
    this._playerY = this._playableCenterY();
    this._scheduleSpawns(0);

    window.addEventListener('keydown', this._boundKeyDown);
    window.addEventListener('keyup', this._boundKeyUp);
    window.addEventListener('resize', this._boundResize);
    this._canvas.addEventListener('pointerdown', this._boundPointerDown);
    this._canvas.addEventListener('click', this._boundClick);

    if (typeof ResizeObserver !== 'undefined') {
      this._resizeObserver = new ResizeObserver(this._boundResize);
      this._resizeObserver.observe(target);
    }

    this._animationFrameId = window.requestAnimationFrame(this._boundGameLoop);
    this._bindAudioUnlockListeners();
    this._tryAutoplayMenuMusic();
    this._loadAssets().catch(() => {
      // Sprites fall back to primitive shapes if asset loading fails.
    });
  }

  public dispose(): void {
    if (this._disposed) {
      return;
    }
    this._disposed = true;

    window.cancelAnimationFrame(this._animationFrameId);
    window.removeEventListener('keydown', this._boundKeyDown);
    window.removeEventListener('keyup', this._boundKeyUp);
    window.removeEventListener('resize', this._boundResize);
    this._canvas.removeEventListener('pointerdown', this._boundPointerDown);
    this._canvas.removeEventListener('click', this._boundClick);
    this._removeAudioUnlockListeners();
    this._resizeObserver?.disconnect();
    this._stopAllMusic();
    this._restorePageLayout();

    if (this._container.parentElement) {
      this._container.parentElement.removeChild(this._container);
    }
  }

  private _playableTop(): number {
    return HUD_HEIGHT;
  }

  private _playableHeight(): number {
    return this._canvas.height - HUD_HEIGHT;
  }

  private _playableCenterY(): number {
    return this._playableTop() + (this._playableHeight() - PLAYER_HEIGHT) / 2;
  }

  private _loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Failed to load image: ' + url));
      image.src = url;
    });
  }

  private _loadAssets(): Promise<void> {
    return Promise.all([
      this._loadImage(bgUrl),
      this._loadImage(characterUrl),
      this._loadImage(coinUrl),
      this._loadImage(shieldUrl),
      this._loadImage(menuBgUrl),
      this._loadImage(speechBubbleUrl),
      this._loadImage(buttonBgUrl),
      this._loadImage(buttonCornerUrl),
      Promise.all(obstacleUrls.map((url) => this._loadImage(url)))
    ]).then(([background, character, coin, shield, menuBackground, speechBubble, buttonBackground, buttonCorner, obstacles]) => {
      this._assets = {
        background,
        character,
        coin,
        shield,
        menuBackground,
        speechBubble,
        buttonBackground,
        buttonCorner,
        obstacles,
        obstacleMeta: OBSTACLE_NATIVE,
        characterMeta: CHARACTER_SPRITE_NATIVE,
        coinMeta: { width: 172, height: 171 },
        shieldMeta: { width: 172, height: 171 },
        speechBubbleMeta: { width: 600, height: 321 }
      };
    });
  }

  private _applyFullscreenPageLayout(target: HTMLElement): void {
    target.style.cssText =
      'width:100%;min-height:0;padding:0;margin:0;overflow:visible;background:transparent;';

    let element: HTMLElement | null = target.parentElement;
    while (element && element !== document.body) {
      element.style.maxWidth = 'none';
      element.style.width = '100%';
      element.style.padding = '0';
      element.style.margin = '0';
      element = element.parentElement;
    }

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.margin = '0';
    document.body.style.background = '#0a1628';

    const pageHeader = document.getElementById('spSiteHeader');
    if (pageHeader) {
      pageHeader.style.display = 'none';
    }

    const commandBar = document.querySelector('[data-automation-id="pageCommandBar"]') as HTMLElement | null;
    if (commandBar) {
      commandBar.style.display = 'none';
    }
  }

  private _restorePageLayout(): void {
    if (!this._fullscreenLayout) {
      return;
    }

    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    document.body.style.margin = '';
    document.body.style.background = '';

    const pageHeader = document.getElementById('spSiteHeader');
    if (pageHeader) {
      pageHeader.style.display = '';
    }

    const commandBar = document.querySelector('[data-automation-id="pageCommandBar"]') as HTMLElement | null;
    if (commandBar) {
      commandBar.style.display = '';
    }
  }

  private _getAvailableSize(): { width: number; height: number } {
    if (this._fullscreenLayout) {
      return {
        width: window.innerWidth,
        height: window.innerHeight
      };
    }

    const parent = this._container.parentElement;
    const width = parent?.clientWidth || 0;

    if (width <= 0) {
      const fallbackWidth = Math.min(window.innerWidth, 960);
      return {
        width: fallbackWidth,
        height: fallbackWidth / DESIGN_ASPECT
      };
    }

    return {
      width,
      height: width / DESIGN_ASPECT
    };
  }

  private _resizeCanvas(): void {
    const available = this._getAvailableSize();
    const viewportAspect = available.width / available.height;

    let displayWidth: number;
    let displayHeight: number;

    if (viewportAspect > DESIGN_ASPECT) {
      displayHeight = available.height;
      displayWidth = displayHeight * DESIGN_ASPECT;
    } else {
      displayWidth = available.width;
      displayHeight = displayWidth / DESIGN_ASPECT;
    }

    if (this._fullscreenLayout) {
      this._container.style.height = '100vh';
    } else {
      this._container.style.height = displayHeight + 'px';
    }

    this._viewport.style.width = displayWidth + 'px';
    this._viewport.style.height = displayHeight + 'px';

    this._canvas.width = DESIGN_WIDTH;
    this._canvas.height = DESIGN_HEIGHT;
    this._clampPlayer();
  }

  private _canvasPointFromClient(clientX: number, clientY: number): { x: number; y: number } {
    const rect = this._canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * (this._canvas.width / rect.width),
      y: (clientY - rect.top) * (this._canvas.height / rect.height)
    };
  }

  private _isPointInRect(
    x: number,
    y: number,
    rect: { x: number; y: number; width: number; height: number }
  ): boolean {
    return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
  }

  private _handleCanvasPress(clientX: number, clientY: number): boolean {
    const now = performance.now();
    if (now - this._lastCanvasPressAt < 300) {
      return false;
    }

    const point = this._canvasPointFromClient(clientX, clientY);

    if (this._state === 'waiting') {
      if (this._isPointInRect(point.x, point.y, this._getStartButtonBounds())) {
        this._lastCanvasPressAt = now;
        this._startGame();
        return true;
      }
      return false;
    }

    if (this._state === 'gameover') {
      if (this._isPointInRect(point.x, point.y, this._getGameOverButtonBounds(0))) {
        this._lastCanvasPressAt = now;
        this._startGame();
        return true;
      }

      if (this._isPointInRect(point.x, point.y, this._getGameOverButtonBounds(1))) {
        this._lastCanvasPressAt = now;
        this._goToMainMenu();
        return true;
      }

      return false;
    }

    if (this._state === 'question') {
      const question = this._getCurrentQuestion();
      if (!question) {
        return false;
      }

      for (let i = 0; i < question.options.length; i++) {
        if (this._isPointInRect(point.x, point.y, this._getAnswerButtonBounds(i))) {
          this._lastCanvasPressAt = now;
          this._handleAnswer(i);
          return true;
        }
      }
      return false;
    }

    if (this._state === 'paused') {
      if (this._showPauseMainMenuConfirm) {
        if (this._isPointInRect(point.x, point.y, this._getPauseConfirmButtonBounds(0))) {
          this._lastCanvasPressAt = now;
          this._showPauseMainMenuConfirm = false;
          return true;
        }

        if (this._isPointInRect(point.x, point.y, this._getPauseConfirmButtonBounds(1))) {
          this._lastCanvasPressAt = now;
          this._showPauseMainMenuConfirm = false;
          this._goToMainMenu();
          return true;
        }

        return false;
      }

      if (this._isPointInRect(point.x, point.y, this._getPauseMenuButtonBounds(0))) {
        this._lastCanvasPressAt = now;
        this._resumeFromPause();
        return true;
      }

      if (this._isPointInRect(point.x, point.y, this._getPauseMenuButtonBounds(1))) {
        this._lastCanvasPressAt = now;
        this._showPauseMainMenuConfirm = true;
        return true;
      }

      const pauseBounds = this._getPauseButtonBounds();
      if (
        point.x >= pauseBounds.x &&
        point.x <= pauseBounds.x + pauseBounds.size &&
        point.y >= pauseBounds.y &&
        point.y <= pauseBounds.y + pauseBounds.size
      ) {
        this._lastCanvasPressAt = now;
        this._resumeFromPause();
        return true;
      }

      return false;
    }

    if (this._state !== 'playing') {
      return false;
    }

    const pauseBounds = this._getPauseButtonBounds();

    if (
      point.x >= pauseBounds.x &&
      point.x <= pauseBounds.x + pauseBounds.size &&
      point.y >= pauseBounds.y &&
      point.y <= pauseBounds.y + pauseBounds.size
    ) {
      this._lastCanvasPressAt = now;
      this._togglePause();
      return true;
    }

    return false;
  }

  private _onPointerDown(event: PointerEvent): void {
    this._unlockAudio();
    if (this._handleCanvasPress(event.clientX, event.clientY)) {
      event.preventDefault();
    }
  }

  private _onClick(event: MouseEvent): void {
    this._unlockAudio();
    if (this._handleCanvasPress(event.clientX, event.clientY)) {
      event.preventDefault();
    }
  }

  private _onKeyDown(event: KeyboardEvent): void {
    this._unlockAudio();
    if (PREVENT_DEFAULT_KEYS[event.key]) {
      event.preventDefault();
    }

    if (event.key === 'p' || event.key === 'P') {
      if (this._state === 'playing') {
        this._togglePause();
      } else if (this._state === 'paused' && !this._showPauseMainMenuConfirm) {
        this._resumeFromPause();
      }
      return;
    }

    if (event.key === ' ') {
      if (this._state === 'waiting') {
        this._startGame();
      }
      return;
    }

    if (this._state === 'question') {
      if (event.key === 'ArrowLeft') {
        this._selectedAnswerIndex = 0;
        return;
      }

      if (event.key === 'ArrowRight') {
        this._selectedAnswerIndex = 1;
        return;
      }

      if (event.key === 'ArrowUp') {
        this._selectedAnswerIndex = 0;
        return;
      }

      if (event.key === 'ArrowDown') {
        this._selectedAnswerIndex = 1;
        return;
      }

      if (event.key === 'Enter') {
        this._handleAnswer(this._selectedAnswerIndex);
        return;
      }

      if (event.key === '1' || event.key === 'Numpad1') {
        this._handleAnswer(0);
        return;
      }

      if (event.key === '2' || event.key === 'Numpad2') {
        this._handleAnswer(1);
        return;
      }

      return;
    }

    if (this._state !== 'playing') {
      return;
    }

    const direction = MOVEMENT_KEYS[event.key];
    if (direction !== undefined) {
      this._movement = direction;
    }
  }

  private _onKeyUp(event: KeyboardEvent): void {
    const direction = MOVEMENT_KEYS[event.key];
    if (direction !== undefined && this._movement === direction) {
      this._movement = 0;
    }
  }

  private _resumeFromPause(): void {
    if (this._state !== 'paused') {
      return;
    }

    this._showPauseMainMenuConfirm = false;
    this._state = 'playing';
    this._lastTimestamp = 0;
    this._resumeGameMusic();
    this._canvas.focus();
  }

  private _togglePause(): void {
    if (this._state === 'playing') {
      this._state = 'paused';
      this._movement = 0;
      this._showPauseMainMenuConfirm = false;
      this._pauseGameMusic();
      return;
    }

    if (this._state === 'paused') {
      this._resumeFromPause();
    }
  }

  private _goToMainMenu(): void {
    this._state = 'waiting';
    this._movement = 0;
    this._showPauseMainMenuConfirm = false;
    this._obstacles = [];
    this._coins = [];
    this._shields = [];
    this._startMenuMusic();
    this._canvas.focus();
  }

  private _startGame(): void {
    this._state = 'playing';
    this._score = 0;
    this._lives = MAX_LIVES;
    this._playerY = this._playableCenterY();
    this._movement = 0;
    this._obstacles = [];
    this._coins = [];
    this._shields = [];
    this._currentLevel = 1;
    this._activeQuestionInLevelIndex = 0;
    this._answeredInLevel = [false, false, false, false];
    this._allQuestionsComplete = false;
    this._obstaclePenalty = 0;
    this._selectedAnswerIndex = 0;
    this._lastTimestamp = 0;
    this._scheduleSpawns(performance.now());
    this._startGameMusic();
    this._canvas.focus();
  }

  private _scheduleSpawns(now: number): void {
    this._nextObstacleAt = now + this._randomBetween(OBSTACLE_SPAWN_MIN_MS, OBSTACLE_SPAWN_MAX_MS);
    this._nextCoinAt = now + this._randomBetween(500, 1200);
    this._nextShieldAt = DEBUG_SPAWN_SHIELD_FIRST ? now : now + SHIELD_SPAWN_INTERVAL_MS;
  }

  private _gameLoop(timestamp: number): void {
    if (this._disposed) {
      return;
    }

    const delta = this._lastTimestamp ? timestamp - this._lastTimestamp : 16;
    this._lastTimestamp = timestamp;

    if (this._state === 'playing') {
      this._update(delta, timestamp);
    }

    this._draw();
    this._animationFrameId = window.requestAnimationFrame(this._boundGameLoop);
  }

  private _update(delta: number, timestamp: number): void {
    const frameScale = delta / 16.67;

    if (this._movement !== 0) {
      this._playerY += this._movement * PLAYER_SPEED * frameScale;
      this._clampPlayer();
    }

    this._spawnEntities(timestamp);
    this._moveEntities(frameScale);
    this._cleanupEntities();
    this._checkCollisions();
  }

  private _clampPlayer(): void {
    const minY = this._playableTop();
    const maxY = this._playableTop() + this._playableHeight() - PLAYER_HEIGHT;

    if (this._playerY < minY) {
      this._playerY = minY;
    } else if (this._playerY > maxY) {
      this._playerY = maxY;
    }
  }

  private _spawnEntities(timestamp: number): void {
    if (!this._assets) {
      return;
    }

    if (timestamp >= this._nextObstacleAt) {
      if (this._trySpawnObstacle()) {
        this._nextObstacleAt = timestamp + this._getObstacleSpawnDelay();
      } else {
        this._nextObstacleAt = timestamp + SPAWN_RETRY_DELAY_MS;
      }
    }

    if (timestamp >= this._nextCoinAt) {
      const spawnX = DESIGN_WIDTH + COIN_DISPLAY_SIZE;
      const maxY = this._playableTop() + this._playableHeight() - COIN_DISPLAY_SIZE;
      const spawnY = this._findNonOverlappingY(
        spawnX,
        COIN_DISPLAY_SIZE,
        COIN_DISPLAY_SIZE,
        this._playableTop(),
        maxY
      );

      if (spawnY !== undefined) {
        this._coins.push({
          x: spawnX,
          y: spawnY,
          width: COIN_DISPLAY_SIZE,
          height: COIN_DISPLAY_SIZE,
          speed: SCROLL_SPEED
        });
        this._nextCoinAt = timestamp + this._randomBetween(500, 1200);
      } else {
        this._nextCoinAt = timestamp + SPAWN_RETRY_DELAY_MS;
      }
    }

    if (timestamp >= this._nextShieldAt) {
      const spawnX = DESIGN_WIDTH + SHIELD_DISPLAY_SIZE;
      const maxY = this._playableTop() + this._playableHeight() - SHIELD_DISPLAY_SIZE;
      const spawnY = this._findNonOverlappingY(
        spawnX,
        SHIELD_DISPLAY_SIZE,
        SHIELD_DISPLAY_SIZE,
        this._playableTop(),
        maxY
      );

      if (spawnY !== undefined) {
        this._shields.push({
          x: spawnX,
          y: spawnY,
          width: SHIELD_DISPLAY_SIZE,
          height: SHIELD_DISPLAY_SIZE,
          speed: SCROLL_SPEED
        });
        this._nextShieldAt = timestamp + SHIELD_SPAWN_INTERVAL_MS;
      } else {
        this._nextShieldAt = timestamp + SPAWN_RETRY_DELAY_MS;
      }
    }
  }

  private _rectsOverlap(
    a: { x: number; y: number; width: number; height: number },
    b: { x: number; y: number; width: number; height: number },
    separation: number = 0
  ): boolean {
    return (
      a.x < b.x + b.width + separation &&
      a.x + a.width + separation > b.x &&
      a.y < b.y + b.height + separation &&
      a.y + a.height + separation > b.y
    );
  }

  private _findNonOverlappingY(
    spawnX: number,
    width: number,
    height: number,
    minY: number,
    maxY: number
  ): number | undefined {
    if (minY > maxY) {
      return undefined;
    }

    const existingRects = [
      ...this._obstacles,
      ...this._coins,
      ...this._shields
    ];

    for (let attempt = 0; attempt < SPAWN_POSITION_ATTEMPTS; attempt++) {
      const y = this._randomBetween(minY, maxY);
      const candidate = { x: spawnX, y, width, height };
      const overlaps = existingRects.some((rect) =>
        this._rectsOverlap(candidate, rect, SPAWN_SEPARATION)
      );

      if (!overlaps) {
        return y;
      }
    }

    return undefined;
  }

  private _moveEntities(frameScale: number): void {
    for (let i = 0; i < this._obstacles.length; i++) {
      this._obstacles[i].x -= this._obstacles[i].speed * frameScale;
    }

    for (let j = 0; j < this._coins.length; j++) {
      this._coins[j].x -= this._coins[j].speed * frameScale;
    }

    for (let k = 0; k < this._shields.length; k++) {
      this._shields[k].x -= this._shields[k].speed * frameScale;
    }
  }

  private _cleanupEntities(): void {
    this._obstacles = this._obstacles.filter((obstacle) => obstacle.x + obstacle.width > 0);
    this._coins = this._coins.filter((coin) => coin.x + coin.width > 0);
    this._shields = this._shields.filter((shield) => shield.x + shield.width > 0);
  }

  private _getCollisionRect(
    x: number,
    y: number,
    width: number,
    height: number,
    scale: number = COLLISION_SCALE
  ): { x: number; y: number; width: number; height: number } {
    const collisionWidth = width * scale;
    const collisionHeight = height * scale;

    return {
      x: x + (width - collisionWidth) / 2,
      y: y + (height - collisionHeight) / 2,
      width: collisionWidth,
      height: collisionHeight
    };
  }

  private _getPlayerHitbox(): { x: number; y: number; width: number; height: number } {
    const scale = PLAYER_HEIGHT / CHARACTER_SPRITE_NATIVE.height;
    const x = PLAYER_X + CHARACTER_HITBOX_OFFSET_X_NATIVE * scale;
    const y = this._playerY;
    const width = CHARACTER_HITBOX_NATIVE.width * scale;
    const height = CHARACTER_HITBOX_NATIVE.height * scale;

    return this._getCollisionRect(x, y, width, height);
  }

  private _checkCollisions(): void {
    const hitbox = this._getPlayerHitbox();
    const playerLeft = hitbox.x;
    const playerRight = hitbox.x + hitbox.width;
    const playerTop = hitbox.y;
    const playerBottom = hitbox.y + hitbox.height;

    for (let i = 0; i < this._obstacles.length; i++) {
      const obstacle = this._obstacles[i];
      const obstacleHitbox = this._getCollisionRect(
        obstacle.x,
        obstacle.y,
        obstacle.width,
        obstacle.height
      );

      if (
        playerRight > obstacleHitbox.x &&
        playerLeft < obstacleHitbox.x + obstacleHitbox.width &&
        playerBottom > obstacleHitbox.y &&
        playerTop < obstacleHitbox.y + obstacleHitbox.height
      ) {
        this._obstacles.splice(i, 1);
        this._playSfx(this._crushSound);
        this._lives--;

        if (this._lives <= 0) {
          this._state = 'gameover';
          this._saveBestScore();
          this._stopAllMusic();
          this._playSfx(this._gameOverSound);
        }
        return;
      }
    }

    for (let j = this._coins.length - 1; j >= 0; j--) {
      const coin = this._coins[j];
      const coinCenterX = coin.x + coin.width / 2;
      const coinCenterY = coin.y + coin.height / 2;
      const closestX = this._clamp(coinCenterX, playerLeft, playerRight);
      const closestY = this._clamp(coinCenterY, playerTop, playerBottom);
      const dx = coinCenterX - closestX;
      const dy = coinCenterY - closestY;
      const hitRadius = (coin.width / 2) * COLLISION_SCALE;

      if (dx * dx + dy * dy < hitRadius * hitRadius) {
        this._score++;
        this._coins.splice(j, 1);
        this._playSfx(this._coinSound);
      }
    }

    for (let k = this._shields.length - 1; k >= 0; k--) {
      const shield = this._shields[k];
      const shieldCenterX = shield.x + shield.width / 2;
      const shieldCenterY = shield.y + shield.height / 2;
      const closestX = this._clamp(shieldCenterX, playerLeft, playerRight);
      const closestY = this._clamp(shieldCenterY, playerTop, playerBottom);
      const dx = shieldCenterX - closestX;
      const dy = shieldCenterY - closestY;
      const hitRadius = (shield.width / 2) * COLLISION_SCALE;

      if (dx * dx + dy * dy < hitRadius * hitRadius) {
        this._shields.splice(k, 1);
        this._showQuestion();
        return;
      }
    }
  }

  private _getObstacleSpawnDelay(): number {
    if (this._obstaclePenalty > 0) {
      return this._randomBetween(OBSTACLE_PENALTY_SPAWN_MIN_MS, OBSTACLE_PENALTY_SPAWN_MAX_MS);
    }

    return this._randomBetween(OBSTACLE_SPAWN_MIN_MS, OBSTACLE_SPAWN_MAX_MS);
  }

  private _trySpawnObstacle(): boolean {
    if (!this._assets) {
      return false;
    }

    const spriteIndex = this._randomBetween(0, this._assets.obstacles.length - 1);
    const native = this._assets.obstacleMeta[spriteIndex];
    const height = Math.round(native.height * OBSTACLE_DISPLAY_SCALE);
    const width = Math.round(native.width * OBSTACLE_DISPLAY_SCALE);
    const spawnX = DESIGN_WIDTH + width;
    const maxY = this._playableTop() + this._playableHeight() - height;
    const spawnY = this._findNonOverlappingY(spawnX, width, height, this._playableTop(), maxY);

    if (spawnY === undefined) {
      return false;
    }

    this._obstacles.push({
      x: spawnX,
      y: spawnY,
      width,
      height,
      speed: SCROLL_SPEED,
      spriteIndex
    });
    return true;
  }

  private _applyWrongAnswerPenalty(): void {
    this._obstaclePenalty += 1;
  }

  private _pickUnansweredQuestionIndex(): number | undefined {
    const unanswered: number[] = [];

    for (let i = 0; i < QUESTIONS_PER_LEVEL; i++) {
      if (!this._answeredInLevel[i]) {
        unanswered.push(i);
      }
    }

    if (unanswered.length === 0) {
      return undefined;
    }

    return unanswered[this._randomBetween(0, unanswered.length - 1)];
  }

  private _getCurrentQuestion(): Question | undefined {
    if (this._allQuestionsComplete) {
      return undefined;
    }

    const globalIndex =
      (this._currentLevel - 1) * QUESTIONS_PER_LEVEL + this._activeQuestionInLevelIndex;
    return QUESTIONS[globalIndex];
  }

  private _isCurrentLevelComplete(): boolean {
    return this._answeredInLevel.every((answered) => answered);
  }

  private _advanceToNextLevelIfComplete(): void {
    if (!this._isCurrentLevelComplete()) {
      return;
    }

    this._currentLevel += 1;

    if (this._currentLevel > MAX_QUESTION_LEVEL) {
      this._allQuestionsComplete = true;
      return;
    }

    this._answeredInLevel = [false, false, false, false];
  }

  private _resumePlaying(): void {
    this._state = 'playing';
    this._lastTimestamp = 0;
    this._canvas.focus();
  }

  private _showQuestion(): void {
    if (this._allQuestionsComplete) {
      return;
    }

    const questionIndex = this._pickUnansweredQuestionIndex();
    if (questionIndex === undefined) {
      return;
    }

    this._activeQuestionInLevelIndex = questionIndex;
    this._state = 'question';
    this._movement = 0;
    this._selectedAnswerIndex = 0;
    this._canvas.focus();
  }

  private _handleAnswer(selectedIndex: number): void {
    const question = this._getCurrentQuestion();
    if (!question) {
      return;
    }

    if (selectedIndex === question.correctIndex) {
      this._answeredInLevel[this._activeQuestionInLevelIndex] = true;
      this._obstaclePenalty = 0;
      this._advanceToNextLevelIfComplete();
      this._playSfx(this._correctSound);
      this._resumePlaying();
      return;
    }

    this._applyWrongAnswerPenalty();
    this._playSfx(this._alarmSound);
    this._resumePlaying();
  }

  private _createAudio(url: string, volume: number, loop: boolean): HTMLAudioElement {
    const audio = new Audio(url);
    audio.preload = 'auto';
    audio.volume = volume;
    audio.loop = loop;
    return audio;
  }

  private _playSfx(source: HTMLAudioElement): void {
    const sound = source.cloneNode(true) as HTMLAudioElement;
    sound.volume = source.volume;
    sound.play().catch(() => {
      // Browsers may block audio until the player interacts.
    });
  }

  private _bindAudioUnlockListeners(): void {
    const options: AddEventListenerOptions = { capture: true, passive: true };
    document.addEventListener('pointerdown', this._boundUnlockAudio, options);
    document.addEventListener('keydown', this._boundUnlockAudio, options);
  }

  private _removeAudioUnlockListeners(): void {
    const options: AddEventListenerOptions = { capture: true };
    document.removeEventListener('pointerdown', this._boundUnlockAudio, options);
    document.removeEventListener('keydown', this._boundUnlockAudio, options);
  }

  private _tryAutoplayMenuMusic(): void {
    if (this._state !== 'waiting') {
      return;
    }

    const attempt = (): void => {
      this._menuMusic.muted = true;
      this._menuMusic.play().catch(() => {
        // Blocked until the player interacts — unlock listeners will retry.
      });
    };

    if (this._menuMusic.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      attempt();
      return;
    }

    this._menuMusic.addEventListener('canplaythrough', attempt, { once: true });
  }

  private _unlockAudio(): void {
    const wasUnlocked = this._audioUnlocked;
    this._audioUnlocked = true;
    this._menuMusic.muted = false;
    this._menuMusic.volume = MUSIC_VOLUME;
    this._gameMusic.muted = false;
    this._gameMusic.volume = MUSIC_VOLUME;

    if (!wasUnlocked) {
      this._removeAudioUnlockListeners();
    }

    this._resumeMusicForCurrentState();
  }

  private _resumeMusicForCurrentState(): void {
    if (this._state === 'waiting') {
      this._ensureMenuMusicPlaying();
      return;
    }

    if (this._state === 'playing' && this._gameMusic.paused) {
      this._gameMusic.play().catch(() => {
        // Browsers may block audio until the player interacts.
      });
    }
  }

  private _ensureMenuMusicPlaying(): void {
    if (this._state !== 'waiting') {
      return;
    }

    this._stopGameMusic();
    this._menuMusic.muted = false;
    this._menuMusic.volume = MUSIC_VOLUME;

    if (!this._menuMusic.paused) {
      return;
    }

    this._menuMusic.play().catch(() => {
      // Browsers may block audio until the player interacts.
    });
  }

  private _startMenuMusic(): void {
    this._stopGameMusic();
    this._menuMusic.muted = false;
    this._menuMusic.volume = MUSIC_VOLUME;
    this._menuMusic.currentTime = 0;
    this._menuMusic.play().catch(() => {
      // Browsers may block audio until the player interacts.
    });
  }

  private _stopMenuMusic(): void {
    this._menuMusic.pause();
    this._menuMusic.currentTime = 0;
  }

  private _startGameMusic(): void {
    this._stopMenuMusic();
    this._gameMusic.muted = false;
    this._gameMusic.volume = MUSIC_VOLUME;
    this._gameMusic.currentTime = 0;
    this._gameMusic.play().catch(() => {
      // Browsers may block audio until the player interacts.
    });
  }

  private _pauseGameMusic(): void {
    this._gameMusic.pause();
  }

  private _resumeGameMusic(): void {
    if (this._state !== 'playing') {
      return;
    }

    this._gameMusic.play().catch(() => {
      // Browsers may block audio until the player interacts.
    });
  }

  private _stopGameMusic(): void {
    this._gameMusic.pause();
    this._gameMusic.currentTime = 0;
  }

  private _stopAllMusic(): void {
    this._stopMenuMusic();
    this._stopGameMusic();
  }

  private _draw(): void {
    const width = DESIGN_WIDTH;
    const height = DESIGN_HEIGHT;

    if (this._assets) {
      this._drawBackground();
    } else {
      this._ctx.fillStyle = '#0a1628';
      this._ctx.fillRect(0, 0, width, height);
    }

    if (this._state === 'waiting') {
      this._canvas.style.cursor = 'pointer';
      this._drawWelcomeScreen();
    } else if (this._state === 'gameover') {
      this._canvas.style.cursor = 'pointer';
      this._drawGameOverScreen();
    } else {
      this._canvas.style.cursor = this._state === 'paused' ? 'pointer' : 'default';
      this._drawPlayer();
      this._drawObstacles();
      this._drawCoins();
      this._drawShields();
      this._drawHud();
    }

    if (this._state === 'paused') {
      this._drawPauseScreen();
    } else if (this._state === 'question') {
      this._drawQuestionScreen();
    }
  }

  private _drawBackground(): void {
    if (!this._assets) {
      return;
    }

    this._ctx.drawImage(
      this._assets.background,
      0,
      0,
      DESIGN_WIDTH,
      DESIGN_HEIGHT
    );
  }

  private _drawPlayer(): void {
    if (this._assets) {
      this._ctx.drawImage(
        this._assets.character,
        PLAYER_X,
        this._playerY,
        this._playerWidth,
        PLAYER_HEIGHT
      );
    } else {
      this._ctx.fillStyle = '#2196F3';
      this._ctx.fillRect(PLAYER_X, this._playerY, this._playerWidth, PLAYER_HEIGHT);
    }

    const hitbox = this._getPlayerHitbox();
    this._ctx.strokeStyle = '#FF0000';
    this._ctx.lineWidth = s(2);
    this._ctx.strokeRect(hitbox.x, hitbox.y, hitbox.width, hitbox.height);
  }

  private _drawObstacles(): void {
    for (let i = 0; i < this._obstacles.length; i++) {
      const obstacle = this._obstacles[i];

      if (this._assets) {
        this._ctx.drawImage(
          this._assets.obstacles[obstacle.spriteIndex],
          obstacle.x,
          obstacle.y,
          obstacle.width,
          obstacle.height
        );
      } else {
        this._ctx.fillStyle = '#E53935';
        this._ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      }

      if (SHOW_OBSTACLE_HITBOXES) {
        const obstacleHitbox = this._getCollisionRect(
          obstacle.x,
          obstacle.y,
          obstacle.width,
          obstacle.height
        );
        this._ctx.strokeStyle = '#39FF14';
        this._ctx.lineWidth = s(2);
        this._ctx.strokeRect(
          obstacleHitbox.x,
          obstacleHitbox.y,
          obstacleHitbox.width,
          obstacleHitbox.height
        );
      }
    }
  }

  private _drawCoins(): void {
    for (let i = 0; i < this._coins.length; i++) {
      const coin = this._coins[i];

      if (this._assets) {
        this._ctx.drawImage(
          this._assets.coin,
          coin.x,
          coin.y,
          coin.width,
          coin.height
        );
      } else {
        this._ctx.fillStyle = '#FFEB3B';
        this._ctx.beginPath();
        this._ctx.arc(coin.x + coin.width / 2, coin.y + coin.height / 2, coin.width / 2, 0, Math.PI * 2);
        this._ctx.fill();
      }
    }
  }

  private _drawShields(): void {
    for (let i = 0; i < this._shields.length; i++) {
      const shield = this._shields[i];

      if (this._assets) {
        this._ctx.drawImage(
          this._assets.shield,
          shield.x,
          shield.y,
          shield.width,
          shield.height
        );
      } else {
        this._ctx.fillStyle = '#00BCD4';
        this._ctx.beginPath();
        this._ctx.moveTo(shield.x + shield.width / 2, shield.y);
        this._ctx.lineTo(shield.x + shield.width, shield.y + shield.height * 0.55);
        this._ctx.lineTo(shield.x + shield.width / 2, shield.y + shield.height);
        this._ctx.lineTo(shield.x, shield.y + shield.height * 0.55);
        this._ctx.closePath();
        this._ctx.fill();
      }
    }
  }

  private _applyHudTextShadow(): void {
    this._ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    this._ctx.shadowBlur = s(4);
    this._ctx.shadowOffsetX = s(1);
    this._ctx.shadowOffsetY = s(1);
  }

  private _clearHudTextShadow(): void {
    this._ctx.shadowColor = 'transparent';
    this._ctx.shadowBlur = 0;
    this._ctx.shadowOffsetX = 0;
    this._ctx.shadowOffsetY = 0;
  }

  private _drawHud(): void {
    const hudCenterY = HUD_HEIGHT / 2;

    this._applyHudTextShadow();
    this._ctx.fillStyle = '#FFFFFF';
    this._ctx.font = font(18);
    this._ctx.textAlign = 'left';
    this._ctx.textBaseline = 'middle';

    const livesLabel = 'LIVES LEFT:';
    this._ctx.fillText(livesLabel, HUD_PADDING, hudCenterY);

    const heartsStartX = HUD_PADDING + this._ctx.measureText(livesLabel).width + s(10);
    for (let i = 0; i < MAX_LIVES; i++) {
      this._drawHeart(heartsStartX + i * (HEART_SIZE + s(8)), hudCenterY - HEART_SIZE / 2, i < this._lives);
    }

    this._drawScoreHud(hudCenterY);
    this._drawPauseButton();
    this._clearHudTextShadow();
  }

  private _drawScoreHud(centerY: number): void {
    const pauseBounds = this._getPauseButtonBounds();
    const scoreAreaRight = pauseBounds.x - s(14);
    const scoreLabel = 'SCORE:';
    const scoreValue = String(this._score);

    this._ctx.font = font(18);
    const labelWidth = this._ctx.measureText(scoreLabel).width;
    const valueWidth = this._ctx.measureText(scoreValue).width;
    const coinGap = s(6);
    const groupWidth = labelWidth + coinGap + HUD_COIN_SIZE + coinGap + valueWidth;
    let x = scoreAreaRight - groupWidth;

    this._ctx.fillStyle = '#FFFFFF';
    this._ctx.textAlign = 'left';
    this._ctx.textBaseline = 'middle';
    this._ctx.fillText(scoreLabel, x, centerY);
    x += labelWidth + coinGap;

    if (this._assets) {
      this._ctx.drawImage(
        this._assets.coin,
        x,
        centerY - HUD_COIN_SIZE / 2,
        HUD_COIN_SIZE,
        HUD_COIN_SIZE
      );
    } else {
      this._ctx.fillStyle = '#FFEB3B';
      this._ctx.beginPath();
      this._ctx.arc(x + HUD_COIN_SIZE / 2, centerY, HUD_COIN_SIZE / 2, 0, Math.PI * 2);
      this._ctx.fill();
    }

    x += HUD_COIN_SIZE + coinGap;
    this._ctx.fillStyle = '#FFFFFF';
    this._ctx.fillText(scoreValue, x, centerY);
  }

  private _getPauseButtonBounds(): { x: number; y: number; size: number } {
    return {
      x: DESIGN_WIDTH - HUD_PADDING - PAUSE_BTN_SIZE,
      y: (HUD_HEIGHT - PAUSE_BTN_SIZE) / 2,
      size: PAUSE_BTN_SIZE
    };
  }

  private _drawPauseButton(): void {
    const bounds = this._getPauseButtonBounds();
    const centerX = bounds.x + bounds.size / 2;
    const centerY = bounds.y + bounds.size / 2;
    const radius = bounds.size / 2;

    this._ctx.beginPath();
    this._ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    this._ctx.fillStyle = '#F57C00';
    this._ctx.fill();
    this._ctx.strokeStyle = '#FFB74D';
    this._ctx.lineWidth = s(2);
    this._ctx.stroke();

    this._ctx.fillStyle = '#FFFFFF';
    const barWidth = s(4);
    const barHeight = s(16);
    const barGap = s(5);
    const barsTop = centerY - barHeight / 2;

    this._ctx.fillRect(centerX - barGap / 2 - barWidth, barsTop, barWidth, barHeight);
    this._ctx.fillRect(centerX + barGap / 2, barsTop, barWidth, barHeight);
  }

  private _drawHeart(x: number, y: number, filled: boolean): void {
    const size = HEART_SIZE;
    const ctx = this._ctx;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(size / 24, size / 24);

    ctx.beginPath();
    ctx.moveTo(12, 6);
    ctx.bezierCurveTo(12, 2, 8, 0, 5, 0);
    ctx.bezierCurveTo(0, 0, 0, 7, 0, 7);
    ctx.bezierCurveTo(0, 11, 3, 15, 12, 21);
    ctx.bezierCurveTo(21, 15, 24, 11, 24, 7);
    ctx.bezierCurveTo(24, 7, 24, 0, 19, 0);
    ctx.bezierCurveTo(16, 0, 12, 2, 12, 6);
    ctx.closePath();

    if (filled) {
      ctx.fillStyle = '#E53935';
      ctx.fill();
    } else {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = s(2);
      ctx.stroke();
    }

    ctx.restore();
  }

  private _loadBestScore(): number {
    try {
      const stored = window.localStorage.getItem(BEST_SCORE_STORAGE_KEY);
      if (!stored) {
        return 0;
      }
      const parsed = parseInt(stored, 10);
      return isNaN(parsed) ? 0 : parsed;
    } catch {
      return 0;
    }
  }

  private _saveBestScore(): void {
    if (this._score <= this._bestScore) {
      return;
    }

    this._bestScore = this._score;
    try {
      window.localStorage.setItem(BEST_SCORE_STORAGE_KEY, String(this._bestScore));
    } catch {
      // Ignore storage failures in locked-down SharePoint environments.
    }
  }

  private _getSharePointBestScore(): number {
    return DUMMY_SHAREPOINT_BEST_SCORE;
  }

  private _ensureGameFont(): void {
    const fontLinkId = 'follow-the-path-francois-one';
    if (document.getElementById(fontLinkId)) {
      return;
    }

    const link = document.createElement('link');
    link.id = fontLinkId;
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Francois+One&display=swap';
    document.head.appendChild(link);
  }

  private _getMenuPanelBounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: (DESIGN_WIDTH - MENU_PANEL.width) / 2,
      y: (DESIGN_HEIGHT - MENU_PANEL.height) / 2,
      width: MENU_PANEL.width,
      height: MENU_PANEL.height
    };
  }

  private _getMenuContentBounds(panel: {
    x: number;
    y: number;
    width: number;
    height: number;
  }): { x: number; y: number; width: number; height: number; bottom: number } {
    const y = panel.y + MENU_PANEL.paddingTop;
    const height = panel.height - MENU_PANEL.paddingTop - MENU_PANEL.paddingBottom;

    return {
      x: panel.x,
      y,
      width: panel.width,
      height,
      bottom: y + height
    };
  }

  private _drawMenuBackdrop(): void {
    if (!this._backdropCanvas) {
      this._backdropCanvas = document.createElement('canvas');
      this._backdropCanvas.width = DESIGN_WIDTH;
      this._backdropCanvas.height = DESIGN_HEIGHT;
    }

    const bufferCtx = this._backdropCanvas.getContext('2d');
    if (!bufferCtx) {
      return;
    }

    bufferCtx.drawImage(this._canvas, 0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);

    this._ctx.save();
    this._ctx.filter = 'blur(' + MENU_BACKDROP.blurPx + 'px)';
    this._ctx.drawImage(this._backdropCanvas, 0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);
    this._ctx.restore();

    this._ctx.fillStyle = MENU_BACKDROP.overlayColor;
    this._ctx.fillRect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);
  }

  private _drawMenuPanelBackground(panel: { x: number; y: number; width: number; height: number }): void {
    if (this._assets?.menuBackground) {
      this._ctx.drawImage(
        this._assets.menuBackground,
        panel.x,
        panel.y,
        panel.width,
        panel.height
      );
      return;
    }

    this._roundRectPath(panel.x, panel.y, panel.width, panel.height, s(16));
    this._ctx.fillStyle = WELCOME_PANEL_FILL;
    this._ctx.fill();
    this._ctx.strokeStyle = WELCOME_ACCENT;
    this._ctx.lineWidth = s(2);
    this._ctx.stroke();
  }

  private _getWelcomePanelBounds(): { x: number; y: number; width: number; height: number } {
    return this._getMenuPanelBounds();
  }

  private _getStartButtonBounds(): { x: number; y: number; width: number; height: number } {
    const panel = this._getWelcomePanelBounds();
    const content = this._getMenuContentBounds(panel);
    const buttonWidth = Math.min(WELCOME_MENU.startButtonWidth, content.width - WELCOME_MENU.descriptionWidthInset);

    return {
      x: panel.x + (panel.width - buttonWidth) / 2,
      y: content.bottom - WELCOME_MENU.startButtonHeight - WELCOME_MENU.startButtonBottomOffset,
      width: buttonWidth,
      height: WELCOME_MENU.startButtonHeight
    };
  }

  private _getGameOverButtonBounds(index: number): { x: number; y: number; width: number; height: number } {
    const panel = this._getMenuPanelBounds();
    const content = this._getMenuContentBounds(panel);
    const totalWidth = GAME_OVER_MENU.buttonWidth * 2 + GAME_OVER_MENU.buttonGap;
    const startX = panel.x + (panel.width - totalWidth) / 2;
    const y = content.bottom - GAME_OVER_MENU.buttonHeight - GAME_OVER_MENU.buttonBottomOffset;

    return {
      x: startX + index * (GAME_OVER_MENU.buttonWidth + GAME_OVER_MENU.buttonGap),
      y,
      width: GAME_OVER_MENU.buttonWidth,
      height: GAME_OVER_MENU.buttonHeight
    };
  }

  private _getPauseMenuButtonBounds(index: number): { x: number; y: number; width: number; height: number } {
    const panel = this._getMenuPanelBounds();
    const content = this._getMenuContentBounds(panel);
    const totalWidth = PAUSE_MENU.buttonWidth * 2 + PAUSE_MENU.buttonGap;
    const startX = panel.x + (panel.width - totalWidth) / 2;
    const y = content.bottom - PAUSE_MENU.buttonHeight - PAUSE_MENU.buttonBottomOffset;

    return {
      x: startX + index * (PAUSE_MENU.buttonWidth + PAUSE_MENU.buttonGap),
      y,
      width: PAUSE_MENU.buttonWidth,
      height: PAUSE_MENU.buttonHeight
    };
  }

  private _drawMenuButton(
    bounds: { x: number; y: number; width: number; height: number },
    label: string,
    fontSize: number,
    selected: boolean = false
  ): void {
    this._drawStyledButton(bounds, selected);

    this._ctx.font = menuFont(fontSize);
    this._ctx.fillStyle = '#FFFFFF';
    this._ctx.textAlign = 'center';
    this._ctx.textBaseline = 'middle';
    this._ctx.fillText(label, bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  }

  private _drawStyledButton(
    bounds: { x: number; y: number; width: number; height: number },
    selected: boolean = false
  ): void {
    if (this._assets?.buttonBackground) {
      this._drawNineSliceButtonBg(this._assets.buttonBackground, bounds.x, bounds.y, bounds.width, bounds.height);
    } else if (this._assets?.buttonCorner) {
      this._ctx.fillStyle = 'rgba(18, 22, 30, 0.95)';
      this._ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
      this._drawButtonCornerImages(bounds);
    } else {
      this._ctx.fillStyle = 'rgba(18, 22, 30, 0.95)';
      this._ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
      this._drawCornerBrackets(bounds.x, bounds.y, bounds.width, bounds.height, s(10), WELCOME_ACCENT);
    }

    if (selected) {
      this._ctx.fillStyle = 'rgba(245, 124, 0, 0.22)';
      this._ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
    }
  }

  private _drawNineSliceButtonBg(
    image: HTMLImageElement,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    const iw = image.width;
    const ih = image.height;
    const slSrc = BUTTON_BG_SLICES.left;
    const srSrc = BUTTON_BG_SLICES.right;
    const stSrc = BUTTON_BG_SLICES.top;
    const sbSrc = BUTTON_BG_SLICES.bottom;
    const cwSrc = iw - slSrc - srSrc;
    const chSrc = ih - stSrc - sbSrc;

    const sl = (slSrc / iw) * width;
    const sr = (srSrc / iw) * width;
    const st = (stSrc / ih) * height;
    const sb = (sbSrc / ih) * height;
    const dw = Math.max(0, width - sl - sr);
    const dh = Math.max(0, height - st - sb);

    const ctx = this._ctx;

    ctx.drawImage(image, 0, 0, slSrc, stSrc, x, y, sl, st);
    ctx.drawImage(image, slSrc, 0, cwSrc, stSrc, x + sl, y, dw, st);
    ctx.drawImage(image, iw - srSrc, 0, srSrc, stSrc, x + width - sr, y, sr, st);
    ctx.drawImage(image, 0, stSrc, slSrc, chSrc, x, y + st, sl, dh);
    ctx.drawImage(image, slSrc, stSrc, cwSrc, chSrc, x + sl, y + st, dw, dh);
    ctx.drawImage(image, iw - srSrc, stSrc, srSrc, chSrc, x + width - sr, y + st, sr, dh);
    ctx.drawImage(image, 0, ih - sbSrc, slSrc, sbSrc, x, y + height - sb, sl, sb);
    ctx.drawImage(image, slSrc, ih - sbSrc, cwSrc, sbSrc, x + sl, y + height - sb, dw, sb);
    ctx.drawImage(image, iw - srSrc, ih - sbSrc, srSrc, sbSrc, x + width - sr, y + height - sb, sr, sb);
  }

  private _drawButtonCornerImages(bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  }): void {
    if (!this._assets) {
      return;
    }

    const image = this._assets.buttonCorner;
    const size = Math.min(
      (image.width / BUTTON_BG_NATIVE.width) * bounds.width,
      (image.height / BUTTON_BG_NATIVE.height) * bounds.height
    );

    this._drawButtonCornerAt(bounds.x, bounds.y + bounds.height - size, size, false, false);
    this._drawButtonCornerAt(bounds.x + bounds.width - size, bounds.y + bounds.height - size, size, true, false);
    this._drawButtonCornerAt(bounds.x, bounds.y, size, false, true);
    this._drawButtonCornerAt(bounds.x + bounds.width - size, bounds.y, size, true, true);
  }

  private _drawButtonCornerAt(
    x: number,
    y: number,
    size: number,
    flipX: boolean,
    flipY: boolean
  ): void {
    if (!this._assets) {
      return;
    }

    const ctx = this._ctx;
    ctx.save();
    ctx.translate(x + (flipX ? size : 0), y + (flipY ? size : 0));
    ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
    ctx.drawImage(this._assets.buttonCorner, 0, 0, size, size);
    ctx.restore();
  }

  private _roundRectPath(x: number, y: number, width: number, height: number, radius: number): void {
    const r = Math.min(radius, width / 2, height / 2);
    this._ctx.beginPath();
    this._ctx.moveTo(x + r, y);
    this._ctx.lineTo(x + width - r, y);
    this._ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    this._ctx.lineTo(x + width, y + height - r);
    this._ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    this._ctx.lineTo(x + r, y + height);
    this._ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    this._ctx.lineTo(x, y + r);
    this._ctx.quadraticCurveTo(x, y, x + r, y);
    this._ctx.closePath();
  }

  private _drawCornerBrackets(
    x: number,
    y: number,
    width: number,
    height: number,
    arm: number,
    color: string
  ): void {
    const ctx = this._ctx;
    ctx.strokeStyle = color;
    ctx.lineWidth = s(2);

    ctx.beginPath();
    ctx.moveTo(x, y + arm);
    ctx.lineTo(x, y);
    ctx.lineTo(x + arm, y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x + width - arm, y);
    ctx.lineTo(x + width, y);
    ctx.lineTo(x + width, y + arm);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x, y + height - arm);
    ctx.lineTo(x, y + height);
    ctx.lineTo(x + arm, y + height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x + width - arm, y + height);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x + width, y + height - arm);
    ctx.stroke();
  }

  private _drawWrappedText(
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
    font: string,
    color: string,
    align: CanvasTextAlign
  ): number {
    this._ctx.font = font;
    this._ctx.fillStyle = color;
    this._ctx.textAlign = align;
    this._ctx.textBaseline = 'top';

    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let i = 0; i < words.length; i++) {
      const testLine = line ? line + ' ' + words[i] : words[i];
      const metrics = this._ctx.measureText(testLine);

      if (metrics.width > maxWidth && line) {
        this._ctx.fillText(line, x, currentY);
        line = words[i];
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }

    if (line) {
      this._ctx.fillText(line, x, currentY);
      currentY += lineHeight;
    }

    return currentY;
  }

  private _drawArrowKeyHints(centerX: number, y: number): void {
    const keySize = s(WELCOME_MENU.arrowKeySize);
    const gap = s(WELCOME_MENU.arrowKeyGap);
    const totalWidth = keySize * 2 + gap;
    const startX = centerX - totalWidth / 2;

    for (let i = 0; i < 2; i++) {
      const keyX = startX + i * (keySize + gap);
      this._roundRectPath(keyX, y, keySize, keySize, s(6));
      this._ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      this._ctx.fill();
      this._ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      this._ctx.lineWidth = s(1);
      this._ctx.stroke();

      this._ctx.fillStyle = '#FFFFFF';
      this._ctx.beginPath();
      if (i === 0) {
        this._ctx.moveTo(keyX + keySize / 2, y + s(7));
        this._ctx.lineTo(keyX + keySize / 2 - s(7), y + s(18));
        this._ctx.lineTo(keyX + keySize / 2 + s(7), y + s(18));
      } else {
        this._ctx.moveTo(keyX + keySize / 2, y + s(21));
        this._ctx.lineTo(keyX + keySize / 2 - s(7), y + s(10));
        this._ctx.lineTo(keyX + keySize / 2 + s(7), y + s(10));
      }
      this._ctx.closePath();
      this._ctx.fill();
    }

    this._ctx.font = menuFont(WELCOME_MENU.arrowHintsFontSize);
    this._ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    this._ctx.textAlign = 'center';
    this._ctx.textBaseline = 'top';
    this._ctx.fillText('Use arrow keys to control the spaceship', centerX, y + keySize + s(8));
  }

  private _drawSpeechBubble(x: number, y: number, width: number): void {
    if (!this._assets) {
      return;
    }

    const aspect = this._assets.speechBubbleMeta.height / this._assets.speechBubbleMeta.width;
    const height = Math.round(width * aspect);
    this._ctx.drawImage(this._assets.speechBubble, x, y, width, height);
  }

  private _drawWelcomeMascot(): void {
    const shipHeight = s(WELCOME_MENU.mascotShipHeight);
    const shipWidth = Math.round(shipHeight * (CHARACTER_SPRITE_NATIVE.width / CHARACTER_SPRITE_NATIVE.height));
    const shipX = s(WELCOME_MENU.mascotShipLeftOffset);
    const shipY = DESIGN_HEIGHT - shipHeight - s(WELCOME_MENU.mascotShipBottomOffset);

    if (this._assets) {
      this._ctx.drawImage(this._assets.character, shipX, shipY, shipWidth, shipHeight);
    }

    const bubbleWidth = Math.min(s(WELCOME_MENU.speechBubbleWidth), DESIGN_WIDTH * 0.42);
    const bubbleX = shipX - bubbleWidth + s(20) + s(WELCOME_MENU.speechBubbleOffsetX);
    const bubbleY = shipY - s(WELCOME_MENU.speechBubbleOffsetY);
    this._drawSpeechBubble(bubbleX, bubbleY, bubbleWidth);
  }

  private _drawWelcomeScreen(): void {
    this._drawMenuBackdrop();

    const panel = this._getWelcomePanelBounds();
    const content = this._getMenuContentBounds(panel);
    const centerX = panel.x + panel.width / 2;

    this._drawMenuPanelBackground(panel);

    this._ctx.fillStyle = '#FFFFFF';
    this._ctx.textAlign = 'center';
    this._ctx.textBaseline = 'top';
    this._ctx.font = menuFont(WELCOME_MENU.titleFontSize);
    this._ctx.fillText('FOLLOW THE PATH', centerX, content.y + WELCOME_MENU.titleOffsetY);

    const descriptionBottom = this._drawWrappedText(
      'Guide your Wreckoon through the obstacles & answer each question as they increase in difficulty.',
      centerX,
      content.y + WELCOME_MENU.descriptionOffsetY,
      content.width - WELCOME_MENU.descriptionWidthInset,
      s(WELCOME_MENU.descriptionLineHeight),
      menuFont(WELCOME_MENU.descriptionFontSize),
      'rgba(255, 255, 255, 0.9)',
      'center'
    );

    this._ctx.font = menuFont(WELCOME_MENU.bestScoreFontSize);
    this._ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    this._ctx.textAlign = 'center';
    this._ctx.fillText('Best score: ' + this._bestScore, centerX, descriptionBottom + WELCOME_MENU.bestScoreGap);

    const button = this._getStartButtonBounds();
    this._drawMenuButton(button, 'START GAME', WELCOME_MENU.startButtonFontSize);

    this._drawArrowKeyHints(centerX, content.bottom - WELCOME_MENU.arrowHintsBottomOffset);
    this._drawWelcomeMascot();
  }

  private _drawGameOverMascot(): void {
    const shipHeight = s(GAME_OVER_MENU.mascotShipHeight);
    const shipWidth = Math.round(shipHeight * (CHARACTER_SPRITE_NATIVE.width / CHARACTER_SPRITE_NATIVE.height));
    const shipX = s(GAME_OVER_MENU.mascotShipLeftOffset);
    const shipY = DESIGN_HEIGHT - shipHeight - s(GAME_OVER_MENU.mascotShipBottomOffset);

    if (this._assets) {
      this._ctx.drawImage(this._assets.character, shipX, shipY, shipWidth, shipHeight);
    }

    const bubbleWidth = Math.min(s(GAME_OVER_MENU.speechBubbleWidth), DESIGN_WIDTH * 0.42);
    const bubbleX = shipX - bubbleWidth + s(20) + s(GAME_OVER_MENU.speechBubbleOffsetX);
    const bubbleY = shipY - s(GAME_OVER_MENU.speechBubbleOffsetY);
    this._drawSpeechBubble(bubbleX, bubbleY, bubbleWidth);
  }

  private _drawGameOverScreen(): void {
    this._drawMenuBackdrop();

    const panel = this._getMenuPanelBounds();
    const content = this._getMenuContentBounds(panel);
    const centerX = panel.x + panel.width / 2;

    this._drawMenuPanelBackground(panel);

    this._ctx.fillStyle = '#FFFFFF';
    this._ctx.textAlign = 'center';
    this._ctx.textBaseline = 'top';
    this._ctx.font = menuFont(GAME_OVER_MENU.titleFontSize);
    const titleY = content.y + GAME_OVER_MENU.titleOffsetY;
    this._ctx.fillText('GAME OVER', centerX, titleY);

    this._drawMenuButton(this._getGameOverButtonBounds(0), 'TRY AGAIN', GAME_OVER_MENU.buttonFontSize);
    this._drawMenuButton(this._getGameOverButtonBounds(1), 'MAIN MENU', GAME_OVER_MENU.buttonFontSize);

    const buttonTop = this._getGameOverButtonBounds(0).y;
    const bestScoreY =
      buttonTop -
      GAME_OVER_MENU.scoreAboveButtonsOffset -
      GAME_OVER_MENU.bestScoreFontSize;
    const scoreY =
      bestScoreY - GAME_OVER_MENU.scoreLineGap - GAME_OVER_MENU.scoreFontSize;

    this._ctx.font = menuFont(GAME_OVER_MENU.scoreFontSize);
    this._ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    this._ctx.fillText('Score: ' + this._score, centerX, scoreY);

    this._ctx.font = menuFont(GAME_OVER_MENU.bestScoreFontSize);
    this._ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    this._ctx.fillText('Best score: ' + this._getSharePointBestScore(), centerX, bestScoreY);

    this._drawGameOverMascot();
  }

  private _getQuestionPanelBounds(): { x: number; y: number; width: number; height: number } {
    return this._getMenuPanelBounds();
  }

  private _getAnswerButtonBounds(index: number): { x: number; y: number; width: number; height: number } {
    const panel = this._getQuestionPanelBounds();
    const content = this._getMenuContentBounds(panel);
    const sidePadding =
      QUESTION_POPUP.horizontalPadding + QUESTION_POPUP.answerButtonHorizontalInset;
    const availableWidth = content.width - sidePadding * 2;
    const buttonWidth = (availableWidth - QUESTION_POPUP.answerButtonGap) / 2;
    const buttonsTop =
      content.bottom - QUESTION_POPUP.answerButtonHeight - QUESTION_POPUP.answerButtonBottomOffset;
    const startX = panel.x + sidePadding;

    return {
      x: startX + index * (buttonWidth + QUESTION_POPUP.answerButtonGap),
      y: buttonsTop,
      width: buttonWidth,
      height: QUESTION_POPUP.answerButtonHeight
    };
  }

  private _drawMenuBadge(centerX: number, y: number, label: string): number {
    this._ctx.font = menuFont(QUESTION_POPUP.badgeFontSize);
    const textWidth = this._ctx.measureText(label).width;
    const badgeWidth = textWidth + QUESTION_POPUP.badgePaddingX;
    const badgeHeight = QUESTION_POPUP.badgeHeight;
    const badgeX = centerX - badgeWidth / 2;

    this._ctx.fillStyle = WELCOME_ACCENT;
    this._ctx.fillRect(badgeX, y, badgeWidth, badgeHeight);

    this._ctx.fillStyle = '#FFFFFF';
    this._ctx.textAlign = 'center';
    this._ctx.textBaseline = 'middle';
    this._ctx.fillText(label, centerX, y + badgeHeight / 2);

    return y + badgeHeight;
  }

  private _drawPauseMascot(): void {
    const shipHeight = s(PAUSE_MENU.mascotShipHeight);
    const shipWidth = Math.round(shipHeight * (CHARACTER_SPRITE_NATIVE.width / CHARACTER_SPRITE_NATIVE.height));
    const shipX = s(PAUSE_MENU.mascotShipLeftOffset);
    const shipY = DESIGN_HEIGHT - shipHeight - s(PAUSE_MENU.mascotShipBottomOffset);

    if (this._assets) {
      this._ctx.drawImage(this._assets.character, shipX, shipY, shipWidth, shipHeight);
    }

    const bubbleWidth = Math.min(s(PAUSE_MENU.speechBubbleWidth), DESIGN_WIDTH * 0.42);
    const bubbleX = shipX - bubbleWidth + s(20) + s(PAUSE_MENU.speechBubbleOffsetX);
    const bubbleY = shipY - s(PAUSE_MENU.speechBubbleOffsetY);
    this._drawSpeechBubble(bubbleX, bubbleY, bubbleWidth);
  }

  private _drawPauseScreen(): void {
    this._drawMenuBackdrop();

    const panel = this._getMenuPanelBounds();
    const content = this._getMenuContentBounds(panel);
    const centerX = panel.x + panel.width / 2;

    this._drawMenuPanelBackground(panel);

    this._ctx.fillStyle = '#FFFFFF';
    this._ctx.textAlign = 'center';
    this._ctx.textBaseline = 'top';
    this._ctx.font = menuFont(PAUSE_MENU.titleFontSize);
    const titleY = content.y + PAUSE_MENU.titleOffsetY;
    this._ctx.fillText('PAUSED', centerX, titleY);

    this._drawMenuButton(this._getPauseMenuButtonBounds(0), 'CONTINUE', PAUSE_MENU.buttonFontSize);
    this._drawMenuButton(this._getPauseMenuButtonBounds(1), 'MAIN MENU', PAUSE_MENU.buttonFontSize);

    const buttonTop = this._getPauseMenuButtonBounds(0).y;
    const subtitleY = buttonTop - PAUSE_MENU.subtitleAboveButtonsOffset - PAUSE_MENU.subtitleFontSize;

    this._ctx.font = menuFont(PAUSE_MENU.subtitleFontSize);
    this._ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    this._ctx.fillText('PRESS P OR CLICK CONTINUE TO CONTINUE', centerX, subtitleY);

    this._drawPauseMascot();

    if (this._showPauseMainMenuConfirm) {
      this._drawPauseConfirmDialog();
    }
  }

  private _getPauseConfirmPanelBounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: (DESIGN_WIDTH - PAUSE_CONFIRM.width) / 2,
      y: (DESIGN_HEIGHT - PAUSE_CONFIRM.height) / 2,
      width: PAUSE_CONFIRM.width,
      height: PAUSE_CONFIRM.height
    };
  }

  private _getPauseConfirmButtonBounds(index: number): { x: number; y: number; width: number; height: number } {
    const panel = this._getPauseConfirmPanelBounds();
    const totalWidth = PAUSE_CONFIRM.buttonWidth * 2 + PAUSE_CONFIRM.buttonGap;
    const startX = panel.x + (panel.width - totalWidth) / 2;
    const y = panel.y + panel.height - PAUSE_CONFIRM.buttonHeight - PAUSE_CONFIRM.buttonBottomOffset;

    return {
      x: startX + index * (PAUSE_CONFIRM.buttonWidth + PAUSE_CONFIRM.buttonGap),
      y,
      width: PAUSE_CONFIRM.buttonWidth,
      height: PAUSE_CONFIRM.buttonHeight
    };
  }

  private _drawPauseConfirmDialog(): void {
    this._ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    this._ctx.fillRect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);

    const panel = this._getPauseConfirmPanelBounds();
    this._drawMenuPanelBackground(panel);

    const centerX = panel.x + panel.width / 2;
    this._ctx.fillStyle = '#FFFFFF';
    this._ctx.textAlign = 'center';
    this._ctx.textBaseline = 'top';
    this._ctx.font = menuFont(PAUSE_CONFIRM.messageFontSize);
    this._ctx.fillText('RETURN TO MAIN MENU?', centerX, panel.y + PAUSE_CONFIRM.messageOffsetY);

    this._drawMenuButton(this._getPauseConfirmButtonBounds(0), 'NO', PAUSE_CONFIRM.buttonFontSize);
    this._drawMenuButton(this._getPauseConfirmButtonBounds(1), 'YES', PAUSE_CONFIRM.buttonFontSize);
  }

  private _drawPowerShieldBadge(centerX: number, y: number): number {
    return this._drawMenuBadge(centerX, y, 'POWER SHIELD');
  }

  private _drawWrappedTextInRect(
    text: string,
    rect: { x: number; y: number; width: number; height: number },
    fontStyle: string,
    color: string,
    lineHeight: number,
    horizontalPadding: number = 24
  ): void {
    this._ctx.font = fontStyle;
    this._ctx.fillStyle = color;
    this._ctx.textAlign = 'center';
    this._ctx.textBaseline = 'top';

    const words = text.split(' ');
    const lines: string[] = [];
    let line = '';

    for (let i = 0; i < words.length; i++) {
      const testLine = line ? line + ' ' + words[i] : words[i];
      if (this._ctx.measureText(testLine).width > rect.width - horizontalPadding * 2 && line) {
        lines.push(line);
        line = words[i];
      } else {
        line = testLine;
      }
    }

    if (line) {
      lines.push(line);
    }

    const totalHeight = lines.length * lineHeight;
    let currentY = rect.y + (rect.height - totalHeight) / 2;

    for (let j = 0; j < lines.length; j++) {
      this._ctx.fillText(lines[j], rect.x + rect.width / 2, currentY);
      currentY += lineHeight;
    }
  }

  private _drawAnswerButton(
    bounds: { x: number; y: number; width: number; height: number },
    label: string,
    selected: boolean
  ): void {
    this._drawStyledButton(bounds, selected);
    this._drawWrappedTextInRect(
      label,
      bounds,
      menuFont(QUESTION_POPUP.answerButtonFontSize),
      '#FFFFFF',
      QUESTION_POPUP.answerButtonLineHeight,
      QUESTION_POPUP.answerButtonPaddingX
    );
  }

  private _drawQuestionScreen(): void {
    const panel = this._getQuestionPanelBounds();
    const content = this._getMenuContentBounds(panel);
    const centerX = panel.x + panel.width / 2;
    const question = this._getCurrentQuestion();

    if (!question) {
      return;
    }

    this._drawMenuBackdrop();

    this._drawMenuPanelBackground(panel);

    if (this._assets) {
      this._ctx.drawImage(
        this._assets.shield,
        centerX - QUESTION_POPUP.shieldSize / 2,
        panel.y + QUESTION_POPUP.shieldTopOffset,
        QUESTION_POPUP.shieldSize,
        QUESTION_POPUP.shieldSize
      );
    }

    const badgeBottom = this._drawPowerShieldBadge(centerX, panel.y + QUESTION_POPUP.badgeOffsetY);

    const scenarioBottom = this._drawWrappedText(
      question.scenario,
      centerX,
      badgeBottom + QUESTION_POPUP.scenarioGapBelowBadge,
      content.width - QUESTION_POPUP.scenarioWidthInset,
      QUESTION_POPUP.scenarioLineHeight,
      menuFont(QUESTION_POPUP.scenarioFontSize),
      '#FFFFFF',
      'center'
    );

    this._ctx.fillStyle = '#FFFFFF';
    this._ctx.textAlign = 'center';
    this._ctx.textBaseline = 'top';
    this._ctx.font = menuFont(QUESTION_POPUP.promptFontSize);
    this._ctx.fillText(question.prompt, centerX, scenarioBottom + QUESTION_POPUP.promptGapBelowScenario);

    for (let i = 0; i < question.options.length; i++) {
      this._drawAnswerButton(
        this._getAnswerButtonBounds(i),
        question.options[i],
        i === this._selectedAnswerIndex
      );
    }
  }

  private _randomBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private _clamp(value: number, min: number, max: number): number {
    if (value < min) {
      return min;
    }
    if (value > max) {
      return max;
    }
    return value;
  }
}
