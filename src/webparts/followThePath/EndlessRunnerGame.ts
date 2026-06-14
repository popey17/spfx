/* eslint-disable @typescript-eslint/no-var-requires */
const bgUrl: string = require('./assets/img_bg.png');
const characterUrl: string = require('./assets/img_character.png');
const coinUrl: string = require('./assets/img_coin.png');
const shieldUrl: string = require('./assets/img_shield.png');
const menuBgUrl: string = require('./assets/img_menuBg.png');
const coinSoundUrl: string = require('./assets/sound/coin.mp3');
const crushSoundUrl: string = require('./assets/sound/crush.mp3');
const gameMusic01Url: string = require('./assets/sound/gameMusic01.mp3');
const obstacleUrls: string[] = [
  require('./assets/a.png'),
  require('./assets/b.png'),
  require('./assets/c.png'),
  require('./assets/d.png'),
  require('./assets/e.png')
];

type GameState = 'waiting' | 'playing' | 'paused' | 'question' | 'gameover';

interface Question {
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
  obstacles: HTMLImageElement[];
  obstacleMeta: SpriteMeta[];
  characterMeta: SpriteMeta;
  coinMeta: SpriteMeta;
  shieldMeta: SpriteMeta;
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

  startButtonWidth: 320,
  startButtonHeight: 100,
  startButtonBottomOffset: 100,
  startButtonFontSize: 16,
  startButtonRadius: 8,
  startButtonCornerInset: 6,
  startButtonCornerArm: 10,

  arrowHintsBottomOffset: 56,
  arrowHintsFontSize: 13,
  arrowKeySize: 28,
  arrowKeyGap: 8,

  mascotShipHeight: 150,
  mascotShipBottomOffset: 5,
  mascotShipLeftOffset: 18,
  speechBubbleWidth: 100,
  speechBubbleOffsetY: 52
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
// MENU BACKDROP — blur + dim when welcome or question popup is shown
// =============================================================================
const MENU_BACKDROP = {
  blurPx: 6,
  overlayColor: 'rgba(0, 0, 0, 0.2)'
};

const font = menuFont;

const PLAYER_X = s(50);
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

const QUESTIONS: Question[] = [
  {
    scenario:
      'YOU NOTICE A CONFIGURATION CHANGE YOU MADE LAST WEEK MAY BE AFFECTING SYSTEM PERFORMANCE. NO INCIDENTS HAVE BEEN REPORTED YET.',
    prompt: 'WHAT DO YOU DO?',
    options: [
      'Assume monitoring tools will catch serious problems',
      'Flag it to your team and investigate the potential impact immediately'
    ],
    correctIndex: 1
  },
  {
    scenario:
      'YOU SPOT AN ERROR IN A REPORT BEFORE IT IS SENT TO STAKEHOLDERS. NOBODY ELSE HAS NOTICED IT YET.',
    prompt: 'WHAT DO YOU DO?',
    options: [
      'Leave it and hope nobody notices',
      'Fix it and let the team know right away'
    ],
    correctIndex: 1
  },
  {
    scenario:
      'A DEADLINE IS AT RISK BECAUSE OF A TASK YOU OWN. THE TEAM IS COUNTING ON YOU TO DELIVER ON TIME.',
    prompt: 'WHAT DO YOU DO?',
    options: [
      'Stay quiet and try to catch up alone',
      'Escalate early and propose a recovery plan'
    ],
    correctIndex: 1
  },
  {
    scenario:
      "YOU COMMITTED TO AN ACTION IN LAST WEEK'S MEETING BUT A BLOCKER IS STOPPING YOU FROM PROGRESSING.",
    prompt: 'WHAT DO YOU DO?',
    options: [
      'Wait until the next meeting to mention it',
      'Follow up on your commitment and communicate the blocker'
    ],
    correctIndex: 1
  },
  {
    scenario:
      'A PROJECT SETBACK JUST HAPPENED AND THE TEAM IS LOOKING FOR A WAY FORWARD.',
    prompt: 'WHAT DO YOU DO?',
    options: [
      'Focus on who caused the problem',
      'Review what happened, learn, and agree next steps'
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
export class EndlessRunnerGame {
  private readonly _container: HTMLDivElement;
  private readonly _viewport: HTMLDivElement;
  private readonly _canvas: HTMLCanvasElement;
  private readonly _ctx: CanvasRenderingContext2D;
  private readonly _boundKeyDown: (event: KeyboardEvent) => void;
  private readonly _boundKeyUp: (event: KeyboardEvent) => void;
  private readonly _boundResize: () => void;
  private readonly _boundGameLoop: (timestamp: number) => void;
  private readonly _boundMouseDown: (event: MouseEvent) => void;
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
  private _questionIndex: number = 0;
  private _selectedAnswerIndex: number = 0;
  private readonly _fullscreenLayout: boolean;
  private _assets: LoadedAssets | undefined;
  private readonly _music: HTMLAudioElement;
  private readonly _coinSound: HTMLAudioElement;
  private readonly _crushSound: HTMLAudioElement;
  private _backdropCanvas: HTMLCanvasElement | undefined;
  private _bestScore: number = 0;
  private _disposed: boolean = false;

  constructor(target: HTMLElement) {
    this._bestScore = this._loadBestScore();
    this._fullscreenLayout = this._detectFullscreenLayout();
    this._playerWidth = Math.round(
      PLAYER_HEIGHT * (CHARACTER_SPRITE_NATIVE.width / CHARACTER_SPRITE_NATIVE.height)
    );

    this._boundKeyDown = this._onKeyDown.bind(this);
    this._boundKeyUp = this._onKeyUp.bind(this);
    this._boundResize = this._resizeCanvas.bind(this);
    this._boundGameLoop = this._gameLoop.bind(this);
    this._boundMouseDown = this._onMouseDown.bind(this);
    this._music = this._createAudio(gameMusic01Url, MUSIC_VOLUME, true);
    this._coinSound = this._createAudio(coinSoundUrl, SFX_VOLUME, false);
    this._crushSound = this._createAudio(crushSoundUrl, SFX_VOLUME, false);
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
    this._canvas.style.cssText = 'display:block;width:100%;height:100%;cursor:default;';
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
    this._canvas.addEventListener('mousedown', this._boundMouseDown);

    if (typeof ResizeObserver !== 'undefined') {
      this._resizeObserver = new ResizeObserver(this._boundResize);
      this._resizeObserver.observe(target);
    }

    this._animationFrameId = window.requestAnimationFrame(this._boundGameLoop);
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
    this._canvas.removeEventListener('mousedown', this._boundMouseDown);
    this._resizeObserver?.disconnect();
    this._stopMusic();
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
      Promise.all(obstacleUrls.map((url) => this._loadImage(url)))
    ]).then(([background, character, coin, shield, menuBackground, obstacles]) => {
      this._assets = {
        background,
        character,
        coin,
        shield,
        menuBackground,
        obstacles,
        obstacleMeta: OBSTACLE_NATIVE,
        characterMeta: CHARACTER_SPRITE_NATIVE,
        coinMeta: { width: 172, height: 171 },
        shieldMeta: { width: 172, height: 171 }
      };
    });
  }

  private _detectFullscreenLayout(): boolean {
    const path = window.location.pathname.toLowerCase();
    const params = new URLSearchParams(window.location.search);

    return (
      path.indexOf('follow-the-path') !== -1 ||
      params.get('env') === 'WebView' ||
      params.get('layout') === 'fullscreen'
    );
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
    return {
      width: parent?.clientWidth || window.innerWidth,
      height: window.innerHeight
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

  private _canvasPointFromEvent(event: MouseEvent): { x: number; y: number } {
    const rect = this._canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (this._canvas.width / rect.width),
      y: (event.clientY - rect.top) * (this._canvas.height / rect.height)
    };
  }

  private _isPointInRect(
    x: number,
    y: number,
    rect: { x: number; y: number; width: number; height: number }
  ): boolean {
    return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
  }

  private _onMouseDown(event: MouseEvent): void {
    const point = this._canvasPointFromEvent(event);

    if (this._state === 'waiting') {
      if (this._isPointInRect(point.x, point.y, this._getStartButtonBounds())) {
        this._startGame();
      }
      return;
    }

    if (this._state === 'question') {
      const question = this._getCurrentQuestion();
      for (let i = 0; i < question.options.length; i++) {
        if (this._isPointInRect(point.x, point.y, this._getAnswerButtonBounds(i))) {
          this._handleAnswer(i);
          return;
        }
      }
      return;
    }

    if (this._state !== 'playing' && this._state !== 'paused') {
      return;
    }

    const pauseBounds = this._getPauseButtonBounds();

    if (
      point.x >= pauseBounds.x &&
      point.x <= pauseBounds.x + pauseBounds.size &&
      point.y >= pauseBounds.y &&
      point.y <= pauseBounds.y + pauseBounds.size
    ) {
      this._togglePause();
    }
  }

  private _onKeyDown(event: KeyboardEvent): void {
    if (PREVENT_DEFAULT_KEYS[event.key]) {
      event.preventDefault();
    }

    if (event.key === 'p' || event.key === 'P') {
      if (this._state === 'playing' || this._state === 'paused') {
        this._togglePause();
      }
      return;
    }

    if (event.key === ' ') {
      if (this._state === 'waiting' || this._state === 'gameover') {
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

  private _togglePause(): void {
    if (this._state === 'playing') {
      this._state = 'paused';
      this._movement = 0;
      this._pauseMusic();
      return;
    }

    if (this._state === 'paused') {
      this._state = 'playing';
      this._lastTimestamp = 0;
      this._resumeMusic();
      this._canvas.focus();
    }
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
    this._questionIndex = 0;
    this._selectedAnswerIndex = 0;
    this._lastTimestamp = 0;
    this._scheduleSpawns(performance.now());
    this._startMusic();
    this._canvas.focus();
  }

  private _scheduleSpawns(now: number): void {
    this._nextObstacleAt = now + this._randomBetween(800, 1800);
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
      const spriteIndex = this._randomBetween(0, this._assets.obstacles.length - 1);
      const native = this._assets.obstacleMeta[spriteIndex];
      const height = Math.round(native.height * OBSTACLE_DISPLAY_SCALE);
      const width = Math.round(native.width * OBSTACLE_DISPLAY_SCALE);
      const spawnX = DESIGN_WIDTH + width;
      const maxY = this._playableTop() + this._playableHeight() - height;
      const spawnY = this._findNonOverlappingY(spawnX, width, height, this._playableTop(), maxY);

      if (spawnY !== undefined) {
        this._obstacles.push({
          x: spawnX,
          y: spawnY,
          width,
          height,
          speed: SCROLL_SPEED,
          spriteIndex
        });
        this._nextObstacleAt = timestamp + this._randomBetween(800, 1800);
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
          this._stopMusic();
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

  private _getCurrentQuestion(): Question {
    const index = Math.min(this._questionIndex, QUESTIONS.length - 1);
    return QUESTIONS[index];
  }

  private _showQuestion(): void {
    this._state = 'question';
    this._movement = 0;
    this._selectedAnswerIndex = 0;
    this._canvas.focus();
  }

  private _handleAnswer(selectedIndex: number): void {
    const question = this._getCurrentQuestion();

    if (selectedIndex === question.correctIndex) {
      this._questionIndex = Math.min(this._questionIndex + 1, QUESTIONS.length - 1);
      this._state = 'playing';
      this._lastTimestamp = 0;
      this._canvas.focus();
      return;
    }
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

  private _startMusic(): void {
    this._music.currentTime = 0;
    this._music.play().catch(() => {
      // Browsers may block audio until the player interacts.
    });
  }

  private _pauseMusic(): void {
    this._music.pause();
  }

  private _resumeMusic(): void {
    if (this._state !== 'playing') {
      return;
    }

    this._music.play().catch(() => {
      // Browsers may block audio until the player interacts.
    });
  }

  private _stopMusic(): void {
    this._music.pause();
    this._music.currentTime = 0;
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
      this._drawWelcomeScreen();
    } else {
      this._drawPlayer();
      this._drawObstacles();
      this._drawCoins();
      this._drawShields();
      this._drawHud();
    }

    if (this._state === 'paused') {
      this._drawOverlay('Paused', 'Press P or click the pause button to resume');
    } else if (this._state === 'question') {
      this._drawQuestionScreen();
    } else if (this._state === 'gameover') {
      this._drawOverlay('Game Over', 'Score: ' + this._score + ' — Press SPACE to retry');
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
    const height = s(58);
    const tailHeight = s(10);

    this._roundRectPath(x, y, width, height, s(10));
    this._ctx.fillStyle = '#1E88E5';
    this._ctx.fill();

    this._ctx.beginPath();
    this._ctx.moveTo(x + s(24), y + height);
    this._ctx.lineTo(x + s(36), y + height + tailHeight);
    this._ctx.lineTo(x + s(48), y + height);
    this._ctx.closePath();
    this._ctx.fill();

    this._ctx.font = font(11);
    this._ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    this._ctx.textAlign = 'left';
    this._ctx.textBaseline = 'top';
    this._ctx.fillText('To be', x + s(12), y + s(10));

    this._ctx.font = font(14);
    this._ctx.fillText('ACCOUNTABLE', x + s(12), y + s(24));

    this._ctx.font = font(10);
    this._ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    this._ctx.fillText('Own your actions, understand your impact', x + s(12), y + s(42));
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
    const bubbleX = shipX + shipWidth - s(20);
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
    this._roundRectPath(button.x, button.y, button.width, button.height, s(WELCOME_MENU.startButtonRadius));
    this._ctx.fillStyle = 'rgba(18, 22, 30, 0.95)';
    this._ctx.fill();
    this._ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    this._ctx.lineWidth = s(1);
    this._ctx.stroke();
    this._drawCornerBrackets(
      button.x + s(WELCOME_MENU.startButtonCornerInset),
      button.y + s(WELCOME_MENU.startButtonCornerInset),
      button.width - s(WELCOME_MENU.startButtonCornerInset * 2),
      button.height - s(WELCOME_MENU.startButtonCornerInset * 2),
      s(WELCOME_MENU.startButtonCornerArm),
      WELCOME_ACCENT
    );

    this._ctx.font = menuFont(WELCOME_MENU.startButtonFontSize);
    this._ctx.fillStyle = '#FFFFFF';
    this._ctx.textAlign = 'center';
    this._ctx.textBaseline = 'middle';
    this._ctx.fillText('START GAME', button.x + button.width / 2, button.y + button.height / 2);

    this._drawArrowKeyHints(centerX, content.bottom - WELCOME_MENU.arrowHintsBottomOffset);
    this._drawWelcomeMascot();
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

  private _drawPowerShieldBadge(centerX: number, y: number): number {
    const label = 'POWER SHIELD';
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
    this._roundRectPath(bounds.x, bounds.y, bounds.width, bounds.height, QUESTION_POPUP.answerButtonRadius);
    this._ctx.fillStyle = selected ? 'rgba(245, 124, 0, 0.22)' : 'rgba(18, 22, 30, 0.95)';
    this._ctx.fill();
    this._ctx.strokeStyle = selected ? WELCOME_ACCENT : 'rgba(255, 255, 255, 0.2)';
    this._ctx.lineWidth = selected ? 2 : 1;
    this._ctx.stroke();
    this._drawCornerBrackets(
      bounds.x + QUESTION_POPUP.answerButtonCornerInset,
      bounds.y + QUESTION_POPUP.answerButtonCornerInset,
      bounds.width - QUESTION_POPUP.answerButtonCornerInset * 2,
      bounds.height - QUESTION_POPUP.answerButtonCornerInset * 2,
      QUESTION_POPUP.answerButtonCornerArm,
      WELCOME_ACCENT
    );
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

  private _drawOverlay(title: string, subtitle: string): void {
    const width = DESIGN_WIDTH;
    const height = DESIGN_HEIGHT;

    this._ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    this._ctx.fillRect(0, HUD_HEIGHT, width, height - HUD_HEIGHT);

    this._ctx.fillStyle = '#FFFFFF';
    this._ctx.textAlign = 'center';
    this._ctx.textBaseline = 'middle';
    this._ctx.font = font(34);
    this._ctx.fillText(title, width / 2, height / 2 - s(18));

    this._ctx.font = font(18);
    this._ctx.fillText(subtitle, width / 2, height / 2 + s(22));
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
