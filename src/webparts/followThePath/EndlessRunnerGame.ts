/* eslint-disable @typescript-eslint/no-var-requires */
const bgUrl: string = require('./assets/img_bg.png');
const characterUrl: string = require('./assets/img_character.png');
const coinUrl: string = require('./assets/img_coin.png');
const coinSimpleUrl: string = require('./assets/img_coinSimple.png');
const pizzaUrl: string = require('./assets/img_pizza.png');
const shieldUrl: string = require('./assets/img_shield.png');
const menuBgUrl: string = require('./assets/img_menuBg.png');
const speechBubbleUrl: string = require('./assets/img_Bubble.png');
const buttonBgUrl: string = require('./assets/buttonBg.png');
const buttonCornerUrl: string = require('./assets/buttonCorner.png');
const pauseBtnUrl: string = require('./assets/img_pauseBtn.png');
const arrowUpUrl: string = require('./assets/img_arrowUp.png');
const starUrl: string = require('./assets/img_star.png');
const levelPassRaccoonUrl: string = require('./assets/img_lvlpassRacoon.png');
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

import {
  type GameState,
  type Question,
  type ObstacleEntity,
  type CoinEntity,
  type ShieldEntity,
  type ExplosionParticle,
  type ExplosionFlash,
  type ConfettiParticle,
  type LoadedAssets,
  DESIGN_WIDTH,
  DESIGN_HEIGHT,
  DESIGN_ASPECT,
  s,
  menuFont,
  MENU_PANEL,
  WELCOME_MENU,
  getWelcomeMenuLayout,
  GAME_OVER_MENU,
  PAUSE_MENU,
  QUESTION_POPUP,
  ANSWER_FEEDBACK_MS,
  ANSWER_CORRECT_TINT,
  ANSWER_WRONG_TINT,
  COUNTDOWN_MS,
  COUNTDOWN,
  LEVEL_INTRO,
  LEVEL_COMPLETE,
  HIT_GHOST_MODE_MS,
  GHOST_MODE_PULSE,
  GOD_MODE_HOLO_RING,
  GOD_MODE_WIND,
  EXPLOSION,
  CONFETTI,
  PAUSE_CONFIRM,
  MENU_BACKDROP,
  BUTTON_BG_NATIVE,
  BUTTON_BG_SLICES,
  font,
  PLAYER_X,
  PLAYER_HEIGHT,
  PLAYER_SPEED,
  PLAYER_FLOAT,
  SCROLL_SPEED,
  COIN_DISPLAY_SIZE,
  PIZZA_DISPLAY_SCALE,
  SHIELD_DISPLAY_SIZE,
  MAX_LIVES,
  OBSTACLE_DISPLAY_SCALE,
  COLLISION_SCALE,
  HUD_HEIGHT,
  HUD_PADDING,
  PAUSE_BTN_SIZE,
  HEART_SIZE,
  HUD_COIN_SIZE,
  UI_COIN_NATIVE,
  HUD,
  PAUSE_BTN_NATIVE,
  ARROW_KEY_NATIVE,
  STAR_NATIVE,
  LEVEL_PASS_RACCOON_NATIVE,
  MOBILE_CONTROLS,
  SHOW_OBSTACLE_HITBOXES,
  WELCOME_ACCENT,
  WELCOME_PANEL_FILL,
  MUSIC_VOLUME,
  SFX_VOLUME,
  SHIELD_SPAWN_INTERVAL_MS,
  GAME_SPEED_INITIAL,
  GAME_SPEED_INCREMENT,
  GAME_SPEED_MAX,
  DEBUG_SPAWN_SHIELD_FIRST,
  DEBUG_FORCE_FREE_MODE,
  DEBUG_SHOW_LEVEL_COMPLETE_AT_START,
  SPAWN_RETRY_DELAY_MS,
  SPAWN_POSITION_ATTEMPTS,
  SPAWN_SEPARATION,
  QUESTIONS_PER_LEVEL,
  MAX_QUESTION_LEVEL,
  OBSTACLE_SPAWN_MIN_MS,
  OBSTACLE_SPAWN_MAX_MS,
  OBSTACLE_PENALTY_SPAWN_MIN_MS,
  OBSTACLE_PENALTY_SPAWN_MAX_MS,
  CHEAT_CODE_GOD,
  CHEAT_CODE_RICH,
  CHEAT_CODE_TURBO,
  CHEAT_CODE_PIZZA,
  CHEAT_CODE_CLEAR,
  CHEAT_CODE_BUFFER_MAX,
  CHEAT_TURBO_MULTIPLIER,
  CHEAT_MAGNET_RADIUS,
  CHEAT_MAGNET_SPEED,
  QUESTIONS,
  OBSTACLE_NATIVE,
  CHARACTER_SPRITE_NATIVE,
  CHARACTER_HITBOX_NATIVE,
  CHARACTER_HITBOX_OFFSET_X_NATIVE,
  MOVEMENT_KEYS,
  PREVENT_DEFAULT_KEYS
} from './gameConfig';

import type { IPlayerProgressService } from './IPlayerProgressService';
import {
  createEmptyEarnedQuestionSlots,
  createDefaultPlayerProgress,
  type PlayerProgressRecord
} from './playerProgressTypes';


/**
 * Self-contained 2D endless runner that mounts a canvas inside a target element.
 * Designed for SPFx web parts: call `new EndlessRunnerGame(domElement)` from `render()`.
 */
export interface EndlessRunnerGameOptions {
  fullscreenLayout?: boolean;
  progressService?: IPlayerProgressService;
  playerProgress?: PlayerProgressRecord;
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
  private readonly _boundPointerUp: (event: PointerEvent) => void;
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
  private _touchMovement: number = 0;
  private _mobileControlPointerId: number | undefined;
  private readonly _mobileControlsEnabled: boolean;
  private _obstacles: ObstacleEntity[] = [];
  private _coins: CoinEntity[] = [];
  private _shields: ShieldEntity[] = [];
  private _explosionParticles: ExplosionParticle[] = [];
  private _explosionFlashes: ExplosionFlash[] = [];
  private _confettiParticles: ConfettiParticle[] = [];
  private _nextObstacleAt: number = 0;
  private _nextCoinAt: number = 0;
  private _nextShieldAt: number = 0;
  private _spawnClockMs: number = 0;
  private _gameSpeedMultiplier: number = GAME_SPEED_INITIAL;
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
  private _xpEarnedSlots: boolean[] = createEmptyEarnedQuestionSlots();
  private _freeModeUnlocked: boolean = false;
  private _freeModeDifficulty: number = 1;
  private readonly _progressService: IPlayerProgressService | undefined;
  private _activeProgressLevel: number = 1;
  private _sessionXpByLevel: number[] = [0, 0, 0];
  private _sessionProgressSaved: boolean = false;
  private _sessionProgressSaving: boolean = false;
  private _disposed: boolean = false;
  private _lastCanvasPressAt: number = 0;
  private _showPauseMainMenuConfirm: boolean = false;
  private _answerFeedback: { index: number; correct: boolean } | undefined;
  private _answerFeedbackTimerId: number | undefined;
  private _countdownEndsAt: number = 0;
  private _levelIntroEndsAt: number = 0;
  private _levelStartScore: number = 0;
  private _ghostModeEndsAt: number = 0;
  private _cheatCodeBuffer: string = '';
  private _cheatGodMode: boolean = false;
  private _cheatMagnetCoins: boolean = false;
  private _cheatTurbo: boolean = false;
  private _cheatPizzaParty: boolean = false;
  private _pendingPizzaConfetti: boolean = false;
  private _audioUnlocked: boolean = false;

  constructor(target: HTMLElement, options: EndlessRunnerGameOptions = {}) {
    this._progressService = options.progressService;
    this._applyPlayerProgress(options.playerProgress ?? createDefaultPlayerProgress());
    this._fullscreenLayout = options.fullscreenLayout === true;
    this._playerWidth = Math.round(
      PLAYER_HEIGHT * (CHARACTER_SPRITE_NATIVE.width / CHARACTER_SPRITE_NATIVE.height)
    );
    this._mobileControlsEnabled = this._detectMobileControls();

    this._boundKeyDown = this._onKeyDown.bind(this);
    this._boundKeyUp = this._onKeyUp.bind(this);
    this._boundResize = this._resizeCanvas.bind(this);
    this._boundGameLoop = this._gameLoop.bind(this);
    this._boundPointerDown = this._onPointerDown.bind(this);
    this._boundPointerUp = this._onPointerUp.bind(this);
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

    document.addEventListener('keydown', this._boundKeyDown, true);
    document.addEventListener('keyup', this._boundKeyUp, true);
    window.addEventListener('resize', this._boundResize);
    this._canvas.addEventListener('pointerdown', this._boundPointerDown);
    this._canvas.addEventListener('pointerup', this._boundPointerUp);
    this._canvas.addEventListener('pointercancel', this._boundPointerUp);
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
    this._clearAnswerFeedbackTimer();

    window.cancelAnimationFrame(this._animationFrameId);
    document.removeEventListener('keydown', this._boundKeyDown, true);
    document.removeEventListener('keyup', this._boundKeyUp, true);
    window.removeEventListener('resize', this._boundResize);
    this._canvas.removeEventListener('pointerdown', this._boundPointerDown);
    this._canvas.removeEventListener('pointerup', this._boundPointerUp);
    this._canvas.removeEventListener('pointercancel', this._boundPointerUp);
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
      this._loadImage(coinSimpleUrl),
      this._loadImage(pizzaUrl),
      this._loadImage(shieldUrl),
      this._loadImage(menuBgUrl),
      this._loadImage(speechBubbleUrl),
      this._loadImage(buttonBgUrl),
      this._loadImage(buttonCornerUrl),
      this._loadImage(pauseBtnUrl),
      this._loadImage(arrowUpUrl),
      this._loadImage(starUrl),
      this._loadImage(levelPassRaccoonUrl),
      Promise.all(obstacleUrls.map((url) => this._loadImage(url)))
    ]).then(([background, character, coin, coinSimple, pizza, shield, menuBackground, speechBubble, buttonBackground, buttonCorner, pauseButton, arrowUp, star, levelPassRaccoon, obstacles]) => {
      this._assets = {
        background,
        character,
        coin,
        coinSimple,
        pizza,
        shield,
        menuBackground,
        speechBubble,
        buttonBackground,
        buttonCorner,
        pauseButton,
        arrowUp,
        star,
        levelPassRaccoon,
        obstacles,
        obstacleMeta: OBSTACLE_NATIVE,
        characterMeta: CHARACTER_SPRITE_NATIVE,
        coinMeta: { width: 172, height: 171 },
        coinSimpleMeta: UI_COIN_NATIVE,
        pizzaMeta: { width: 172, height: 171 },
        shieldMeta: { width: 172, height: 171 },
        pauseButtonMeta: PAUSE_BTN_NATIVE,
        arrowUpMeta: ARROW_KEY_NATIVE,
        starMeta: STAR_NATIVE,
        levelPassRaccoonMeta: LEVEL_PASS_RACCOON_NATIVE,
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
      if (this._freeModeUnlocked) {
        const difficultyButtons = WELCOME_MENU.freeMode.difficulty.labels.length;
        for (let i = 0; i < difficultyButtons; i++) {
          if (this._isPointInRect(point.x, point.y, this._getWelcomeDifficultyButtonBounds(i))) {
            this._lastCanvasPressAt = now;
            this._freeModeDifficulty = i + 1;
            return true;
          }
        }
      }

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
      if (this._answerFeedback) {
        return false;
      }

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

    if (this._state === 'countdown' || this._state === 'levelIntro' || this._state === 'levelComplete') {
      if (this._state === 'levelComplete') {
        if (this._isPointInRect(point.x, point.y, this._getLevelCompleteProceedButtonBounds())) {
          this._lastCanvasPressAt = now;
          this._proceedFromLevelComplete();
          return true;
        }
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

    if (this._handleMobileControlPointerDown(event)) {
      event.preventDefault();
      return;
    }

    if (this._handleCanvasPress(event.clientX, event.clientY)) {
      event.preventDefault();
    }
  }

  private _onPointerUp(event: PointerEvent): void {
    if (this._mobileControlPointerId === event.pointerId) {
      this._clearTouchMovement();
    }
  }

  private _onClick(event: MouseEvent): void {
    this._unlockAudio();
    if (this._handleCanvasPress(event.clientX, event.clientY)) {
      event.preventDefault();
    }
  }

  private _isEscapeKey(event: KeyboardEvent): boolean {
    return event.key === 'Escape' || event.key === 'Esc' || event.code === 'Escape' || event.keyCode === 27;
  }

  private _onKeyDown(event: KeyboardEvent): void {
    this._unlockAudio();

    if (this._isEscapeKey(event)) {
      if (this._state === 'paused') {
        event.preventDefault();
        event.stopPropagation();

        if (this._showPauseMainMenuConfirm) {
          this._showPauseMainMenuConfirm = false;
        } else {
          this._resumeFromPause();
        }
      }

      return;
    }

    if (PREVENT_DEFAULT_KEYS[event.key]) {
      event.preventDefault();
    }

    if (event.key === 'p' || event.key === 'P') {
      if (this._state === 'playing') {
        this._togglePause();
        return;
      }

      if (this._state === 'paused' && !this._showPauseMainMenuConfirm) {
        this._handlePauseCheatInput(event);
      }

      return;
    }

    if (this._state === 'paused' && !this._showPauseMainMenuConfirm) {
      this._handlePauseCheatInput(event);
      return;
    }

    if (this._state === 'levelIntro' || this._state === 'countdown' || this._state === 'levelComplete') {
      if (this._state === 'levelComplete' && (event.key === ' ' || event.key === 'Enter')) {
        this._proceedFromLevelComplete();
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
      if (this._answerFeedback) {
        return;
      }

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
    this._cheatCodeBuffer = '';
    this._movement = 0;
    this._clearTouchMovement();

    if (this._cheatPizzaParty) {
      this._pendingPizzaConfetti = true;
    }

    this._startCountdown();
  }

  private _togglePause(): void {
    if (this._state === 'playing') {
      this._state = 'paused';
      this._movement = 0;
      this._clearTouchMovement();
      this._showPauseMainMenuConfirm = false;
      this._cheatCodeBuffer = '';
      this._pauseGameMusic();
      this._canvas.focus();
      return;
    }

    if (this._state === 'paused') {
      this._resumeFromPause();
    }
  }

  private _goToMainMenu(): void {
    this._finalizeGameSession();
    this._state = 'waiting';
    this._movement = 0;
    this._clearTouchMovement();
    this._showPauseMainMenuConfirm = false;
    this._resetCheats();
    this._obstacles = [];
    this._coins = [];
    this._shields = [];
    this._explosionParticles = [];
    this._explosionFlashes = [];
    this._confettiParticles = [];
    this._startMenuMusic();
    this._canvas.focus();
  }

  private _startGame(): void {
    this._score = 0;
    this._lives = MAX_LIVES;
    this._playerY = this._playableCenterY();
    this._movement = 0;
    this._clearTouchMovement();
    this._resetCheats();
    this._obstacles = [];
    this._coins = [];
    this._shields = [];
    this._explosionParticles = [];
    this._explosionFlashes = [];
    this._confettiParticles = [];
    if (this._freeModeUnlocked) {
      this._currentLevel = this._freeModeDifficulty;
      this._allQuestionsComplete = false;
      const speedByLevel = WELCOME_MENU.freeMode.difficulty.speedByLevel;
      const speedIndex = Math.max(0, Math.min(this._freeModeDifficulty - 1, speedByLevel.length - 1));
      this._gameSpeedMultiplier = speedByLevel[speedIndex] ?? GAME_SPEED_INITIAL;
    } else {
      this._currentLevel = this._getProgressLevel();
      this._allQuestionsComplete = false;
      this._gameSpeedMultiplier = GAME_SPEED_INITIAL;
    }
    this._activeQuestionInLevelIndex = 0;
    this._answeredInLevel = [false, false, false, false];
    this._obstaclePenalty = 0;
    this._ghostModeEndsAt = 0;
    this._activeProgressLevel = this._getProgressLevel();
    this._sessionXpByLevel = [0, 0, 0];
    this._sessionProgressSaved = false;
    this._sessionProgressSaving = false;
    this._selectedAnswerIndex = 0;
    this._lastTimestamp = 0;
    this._levelStartScore = 0;
    this._spawnClockMs = 0;
    this._scheduleSpawns(0);
    this._startGameMusic();
    this._canvas.focus();

    if (DEBUG_SHOW_LEVEL_COMPLETE_AT_START) {
      this._score = 100;
      this._sessionXpByLevel[this._currentLevel - 1] = 100;
      this._answeredInLevel = [true, true, true, true];
      this._showLevelCompleteScreen();
      return;
    }

    if (LEVEL_INTRO.enabled && LEVEL_INTRO.showOnGameStart) {
      this._startLevelIntro();
    } else {
      this._state = 'playing';
    }
  }

  private _scheduleSpawns(spawnClockMs: number): void {
    this._nextObstacleAt = spawnClockMs + this._randomBetween(OBSTACLE_SPAWN_MIN_MS, OBSTACLE_SPAWN_MAX_MS);
    this._nextCoinAt = spawnClockMs + this._randomBetween(500, 1200);
    this._nextShieldAt = DEBUG_SPAWN_SHIELD_FIRST ? spawnClockMs : spawnClockMs + this._getQuestionSpawnIntervalMs();
  }

  private _getEffectiveSpeedMultiplier(): number {
    const cheatMultiplier = this._cheatTurbo ? CHEAT_TURBO_MULTIPLIER : 1;
    return this._gameSpeedMultiplier * cheatMultiplier;
  }

  private _getQuestionSpawnIntervalMs(): number {
    return SHIELD_SPAWN_INTERVAL_MS * this._gameSpeedMultiplier;
  }

  private _increaseGameSpeedAfterQuestion(): void {
    this._gameSpeedMultiplier = Math.min(
      GAME_SPEED_MAX,
      this._gameSpeedMultiplier + GAME_SPEED_INCREMENT
    );
  }

  private _gameLoop(timestamp: number): void {
    if (this._disposed) {
      return;
    }

    const delta = this._lastTimestamp ? timestamp - this._lastTimestamp : 16;
    this._lastTimestamp = timestamp;

    if (this._state === 'playing') {
      this._update(delta, timestamp);
    } else if (this._state === 'levelIntro' && timestamp >= this._levelIntroEndsAt) {
      this._startCountdown();
    } else if (this._state === 'countdown' && timestamp >= this._countdownEndsAt) {
      this._resumePlaying();
      this._resumeGameMusic();
    }

    if (this._explosionParticles.length > 0 || this._explosionFlashes.length > 0) {
      this._updateExplosions(delta, timestamp);
    }

    if (this._confettiParticles.length > 0) {
      this._updateConfetti(delta);
    }

    this._draw(timestamp);
    this._animationFrameId = window.requestAnimationFrame(this._boundGameLoop);
  }

  private _update(delta: number, timestamp: number): void {
    const speedMultiplier = this._getEffectiveSpeedMultiplier();
    const frameScale = (delta / 16.67) * speedMultiplier;
    this._spawnClockMs += delta * speedMultiplier;

    if (this._movement !== 0) {
      this._playerY += this._movement * PLAYER_SPEED * frameScale;
      this._clampPlayer();
    } else if (this._touchMovement !== 0) {
      this._playerY += this._touchMovement * PLAYER_SPEED * frameScale;
      this._clampPlayer();
    }

    this._spawnEntities(this._spawnClockMs);
    this._moveEntities(frameScale);
    if (this._cheatMagnetCoins) {
      this._attractCoins(frameScale);
    }
    this._cleanupEntities();
    this._checkCollisions(timestamp);
  }

  private _getCollisionCenter(
    a: { x: number; y: number; width: number; height: number },
    b: { x: number; y: number; width: number; height: number }
  ): { x: number; y: number } {
    const left = Math.max(a.x, b.x);
    const right = Math.min(a.x + a.width, b.x + b.width);
    const top = Math.max(a.y, b.y);
    const bottom = Math.min(a.y + a.height, b.y + b.height);

    return {
      x: (left + right) / 2,
      y: (top + bottom) / 2
    };
  }

  private _spawnExplosion(x: number, y: number, timestamp: number): void {
    this._explosionFlashes.push({ x, y, startedAt: timestamp });

    for (let i = 0; i < EXPLOSION.particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = s(this._randomBetween(EXPLOSION.minSpeed, EXPLOSION.maxSpeed));
      const color = EXPLOSION.colors[this._randomBetween(0, EXPLOSION.colors.length - 1)];

      this._explosionParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: s(this._randomBetween(EXPLOSION.minRadius, EXPLOSION.maxRadius)),
        color,
        lifeMs: EXPLOSION.lifetimeMs,
        maxLifeMs: EXPLOSION.lifetimeMs
      });
    }
  }

  private _updateExplosions(delta: number, timestamp: number): void {
    const frameScale = delta / 16.67;
    const gravity = s(EXPLOSION.gravity) * frameScale;

    for (let i = this._explosionParticles.length - 1; i >= 0; i--) {
      const particle = this._explosionParticles[i];
      particle.x += particle.vx * frameScale;
      particle.y += particle.vy * frameScale;
      particle.vy += gravity;
      particle.lifeMs -= delta;

      if (particle.lifeMs <= 0) {
        this._explosionParticles.splice(i, 1);
      }
    }

    for (let j = this._explosionFlashes.length - 1; j >= 0; j--) {
      if (timestamp - this._explosionFlashes[j].startedAt >= EXPLOSION.flashLifetimeMs) {
        this._explosionFlashes.splice(j, 1);
      }
    }
  }

  private _isGhostModeActive(timestamp: number): boolean {
    return timestamp < this._ghostModeEndsAt;
  }

  private _isCheatGodModeActive(): boolean {
    return this._cheatGodMode;
  }

  private _activateGhostMode(timestamp: number): void {
    this._ghostModeEndsAt = timestamp + HIT_GHOST_MODE_MS;
  }

  private _resetCheats(): void {
    this._cheatCodeBuffer = '';
    this._cheatGodMode = false;
    this._cheatMagnetCoins = false;
    this._cheatTurbo = false;
    this._cheatPizzaParty = false;
    this._pendingPizzaConfetti = false;
    this._confettiParticles = [];
  }

  private _getCollectibleImage(): HTMLImageElement | undefined {
    if (!this._assets) {
      return undefined;
    }

    return this._cheatPizzaParty ? this._assets.pizza : this._assets.coin;
  }

  private _getUiCoinDrawRect(
    slotX: number,
    slotY: number,
    slotSize: number
  ): { x: number; y: number; width: number; height: number } {
    const meta = this._assets?.coinSimpleMeta ?? UI_COIN_NATIVE;
    const aspect = meta.width / meta.height;

    if (aspect >= 1) {
      const width = slotSize;
      const height = slotSize / aspect;
      return {
        x: slotX,
        y: slotY + (slotSize - height) / 2,
        width,
        height
      };
    }

    const height = slotSize;
    const width = slotSize * aspect;
    return {
      x: slotX + (slotSize - width) / 2,
      y: slotY,
      width,
      height
    };
  }

  private _drawUiCoinIcon(x: number, y: number, size: number): boolean {
    if (!this._assets?.coinSimple) {
      return false;
    }

    const drawRect = this._getUiCoinDrawRect(x, y, size);
    this._ctx.drawImage(
      this._assets.coinSimple,
      drawRect.x,
      drawRect.y,
      drawRect.width,
      drawRect.height
    );
    return true;
  }

  private _getCollectibleDrawRect(
    slotX: number,
    slotY: number,
    slotSize: number
  ): { x: number; y: number; width: number; height: number } {
    if (!this._cheatPizzaParty) {
      return { x: slotX, y: slotY, width: slotSize, height: slotSize };
    }

    const drawSize = Math.round(slotSize * PIZZA_DISPLAY_SCALE);
    const offset = (slotSize - drawSize) / 2;

    return {
      x: slotX + offset,
      y: slotY + offset,
      width: drawSize,
      height: drawSize
    };
  }

  private _spawnConfetti(): void {
    this._confettiParticles = [];

    for (let i = 0; i < CONFETTI.particleCount; i++) {
      const width = s(this._randomBetween(CONFETTI.minWidth, CONFETTI.maxWidth));
      const height = s(this._randomBetween(CONFETTI.minHeight, CONFETTI.maxHeight));
      const color = CONFETTI.colors[this._randomBetween(0, CONFETTI.colors.length - 1)];

      this._confettiParticles.push({
        x: Math.random() * DESIGN_WIDTH,
        y: -height - Math.random() * DESIGN_HEIGHT * 0.35,
        vx: this._randomBetween(-s(CONFETTI.swayAmplitude), s(CONFETTI.swayAmplitude)),
        vy: s(this._randomBetween(CONFETTI.minFallSpeed, CONFETTI.maxFallSpeed)),
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: this._randomBetween(CONFETTI.minSwaySpeed, CONFETTI.maxSwaySpeed) * (Math.random() < 0.5 ? -1 : 1),
        width,
        height,
        color,
        lifeMs: CONFETTI.lifetimeMs,
        maxLifeMs: CONFETTI.lifetimeMs
      });
    }
  }

  private _updateConfetti(delta: number): void {
    const frameScale = delta / 16.67;

    for (let i = this._confettiParticles.length - 1; i >= 0; i--) {
      const particle = this._confettiParticles[i];
      particle.x += particle.vx * frameScale;
      particle.y += particle.vy * frameScale;
      particle.rotation += particle.rotationSpeed * frameScale;
      particle.lifeMs -= delta;

      if (particle.lifeMs <= 0 || particle.y > DESIGN_HEIGHT + particle.height) {
        this._confettiParticles.splice(i, 1);
      }
    }
  }

  private _handlePauseCheatInput(event: KeyboardEvent): void {
    if (event.key.length !== 1 || !/^[a-zA-Z]$/.test(event.key)) {
      return;
    }

    this._cheatCodeBuffer = (this._cheatCodeBuffer + event.key).slice(-CHEAT_CODE_BUFFER_MAX);
    const lower = this._cheatCodeBuffer.toLowerCase();
    const godCode = CHEAT_CODE_GOD;
    const richCode = CHEAT_CODE_RICH;
    const turboCode = CHEAT_CODE_TURBO;
    const pizzaCode = CHEAT_CODE_PIZZA;
    const clearCode = CHEAT_CODE_CLEAR;

    if (lower.length >= clearCode.length && lower.slice(lower.length - clearCode.length) === clearCode) {
      this._resetCheats();
      return;
    }

    if (lower.length >= pizzaCode.length && lower.slice(lower.length - pizzaCode.length) === pizzaCode) {
      this._cheatPizzaParty = true;
      this._cheatCodeBuffer = '';
      return;
    }

    if (lower.length >= godCode.length && lower.slice(lower.length - godCode.length) === godCode) {
      this._cheatGodMode = true;
      this._cheatCodeBuffer = '';
      return;
    }

    if (lower.length >= richCode.length && lower.slice(lower.length - richCode.length) === richCode) {
      this._cheatMagnetCoins = true;
      this._cheatCodeBuffer = '';
      return;
    }

    if (lower.length >= turboCode.length && lower.slice(lower.length - turboCode.length) === turboCode) {
      this._cheatTurbo = true;
      this._cheatCodeBuffer = '';
    }
  }

  private _attractCoins(frameScale: number): void {
    const hitbox = this._getPlayerHitbox();
    const playerCenterX = hitbox.x + hitbox.width / 2;
    const playerCenterY = hitbox.y + hitbox.height / 2;
    const magnetRadiusSq = CHEAT_MAGNET_RADIUS * CHEAT_MAGNET_RADIUS;
    const speed = CHEAT_MAGNET_SPEED * frameScale;

    for (let j = 0; j < this._coins.length; j++) {
      const coin = this._coins[j];
      const coinCenterX = coin.x + coin.width / 2;
      const coinCenterY = coin.y + coin.height / 2;
      const dx = playerCenterX - coinCenterX;
      const dy = playerCenterY - coinCenterY;
      const distSq = dx * dx + dy * dy;

      if (distSq > magnetRadiusSq || distSq < 1) {
        continue;
      }

      const dist = Math.sqrt(distSq);
      const move = Math.min(speed, dist);
      coin.x += (dx / dist) * move;
      coin.y += (dy / dist) * move;
    }
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

  private _spawnEntities(gameTimeMs: number): void {
    if (!this._assets) {
      return;
    }

    if (gameTimeMs >= this._nextObstacleAt) {
      if (this._trySpawnObstacle()) {
        this._nextObstacleAt = gameTimeMs + this._getObstacleSpawnDelay();
      } else {
        this._nextObstacleAt = gameTimeMs + SPAWN_RETRY_DELAY_MS;
      }
    }

    if (gameTimeMs >= this._nextCoinAt) {
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
        this._nextCoinAt = gameTimeMs + this._randomBetween(500, 1200);
      } else {
        this._nextCoinAt = gameTimeMs + SPAWN_RETRY_DELAY_MS;
      }
    }

    if (gameTimeMs >= this._nextShieldAt) {
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
        this._nextShieldAt = gameTimeMs + this._getQuestionSpawnIntervalMs();
      } else {
        this._nextShieldAt = gameTimeMs + SPAWN_RETRY_DELAY_MS;
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

  private _checkCollisions(timestamp: number): void {
    const hitbox = this._getPlayerHitbox();
    const playerLeft = hitbox.x;
    const playerRight = hitbox.x + hitbox.width;
    const playerTop = hitbox.y;
    const playerBottom = hitbox.y + hitbox.height;
    const ghostModeActive = this._isGhostModeActive(timestamp);
    const cheatGodModeActive = this._isCheatGodModeActive();

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
        if (ghostModeActive && !cheatGodModeActive) {
          continue;
        }

        this._obstacles.splice(i, 1);
        const impact = this._getCollisionCenter(hitbox, obstacleHitbox);
        this._spawnExplosion(impact.x, impact.y, timestamp);

        if (cheatGodModeActive) {
          return;
        }

        this._playSfx(this._crushSound);
        this._lives--;
        this._activateGhostMode(timestamp);

        if (this._lives <= 0) {
          this._state = 'gameover';
          this._finalizeGameSession();
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

  private _showLevelCompleteScreen(): void {
    this._state = 'levelComplete';
    this._movement = 0;
    this._clearTouchMovement();
    this._pauseGameMusic();
    this._canvas.focus();
  }

  private _getLevelCoinsEarned(): number {
    return Math.max(0, this._score - this._levelStartScore);
  }

  private _getLevelXpEarned(): number {
    const levelIndex = this._currentLevel - 1;
    return this._sessionXpByLevel[levelIndex] !== undefined ? this._sessionXpByLevel[levelIndex] : 0;
  }

  private _proceedFromLevelComplete(): void {
    if (this._state !== 'levelComplete') {
      return;
    }

    if (this._freeModeUnlocked) {
      this._allQuestionsComplete = true;
      this._finalizeGameSession();
      this._goToMainMenu();
      return;
    }

    if (this._currentLevel >= MAX_QUESTION_LEVEL) {
      this._allQuestionsComplete = true;
      this._finalizeGameSession();
      this._goToMainMenu();
      return;
    }

    this._currentLevel += 1;
    this._lives = MAX_LIVES;
    this._answeredInLevel = [false, false, false, false];
    this._levelStartScore = this._score;
    this._obstacles = [];
    this._coins = [];
    this._shields = [];
    this._spawnClockMs = 0;
    this._scheduleSpawns(0);

    if (LEVEL_INTRO.enabled && LEVEL_INTRO.showOnLevelAdvance) {
      this._startLevelIntro();
    } else {
      this._startCountdown();
    }
  }

  private _startLevelIntro(): void {
    this._state = 'levelIntro';
    this._movement = 0;
    this._clearTouchMovement();
    this._lastTimestamp = 0;
    this._levelIntroEndsAt = performance.now() + LEVEL_INTRO.durationMs;
    this._canvas.focus();
  }

  private _startCountdown(): void {
    this._state = 'countdown';
    this._movement = 0;
    this._clearTouchMovement();
    this._lastTimestamp = 0;
    this._countdownEndsAt = performance.now() + COUNTDOWN_MS;
    this._canvas.focus();
  }

  private _resumePlaying(): void {
    if (this._pendingPizzaConfetti) {
      this._pendingPizzaConfetti = false;
      this._spawnConfetti();
    }

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
    this._clearTouchMovement();
    this._selectedAnswerIndex = 0;
    this._answerFeedback = undefined;
    this._clearAnswerFeedbackTimer();
    this._canvas.focus();
  }

  private _clearAnswerFeedbackTimer(): void {
    if (this._answerFeedbackTimerId !== undefined) {
      window.clearTimeout(this._answerFeedbackTimerId);
      this._answerFeedbackTimerId = undefined;
    }
  }

  private _handleAnswer(selectedIndex: number): void {
    if (this._answerFeedback) {
      return;
    }

    const question = this._getCurrentQuestion();
    if (!question) {
      return;
    }

    const correct = selectedIndex === question.correctIndex;
    this._selectedAnswerIndex = selectedIndex;
    this._answerFeedback = { index: selectedIndex, correct };
    this._increaseGameSpeedAfterQuestion();

    if (correct) {
      this._answeredInLevel[this._activeQuestionInLevelIndex] = true;
      this._awardXpForCorrectAnswer();
      this._obstaclePenalty = 0;
      this._playSfx(this._correctSound);
    } else {
      this._applyWrongAnswerPenalty();
      this._playSfx(this._alarmSound);
    }

    this._clearAnswerFeedbackTimer();
    this._answerFeedbackTimerId = window.setTimeout(() => {
      this._answerFeedbackTimerId = undefined;
      this._answerFeedback = undefined;

      if (correct && this._isCurrentLevelComplete()) {
        this._showLevelCompleteScreen();
      } else {
        this._startCountdown();
      }
    }, ANSWER_FEEDBACK_MS);
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

  private _draw(timestamp: number = 0): void {
    const width = DESIGN_WIDTH;
    const height = DESIGN_HEIGHT;

    if (this._assets) {
      this._drawBackground();
      this._drawConfetti();
    } else {
      this._ctx.fillStyle = '#0a1628';
      this._ctx.fillRect(0, 0, width, height);
    }

    if (this._state === 'waiting') {
      this._canvas.style.cursor = 'pointer';
      this._drawWelcomeScreen(timestamp);
    } else if (this._state === 'gameover') {
      this._canvas.style.cursor = 'pointer';
      this._drawGameOverScreen();
    } else {
      this._canvas.style.cursor =
        this._state === 'paused' || this._state === 'levelComplete' ? 'pointer' : 'default';
      this._drawPlayer(timestamp);
      this._drawObstacles();
      this._drawCoins();
      this._drawShields();
      this._drawHud();

      if (this._state === 'playing' && this._mobileControlsEnabled) {
        this._drawMobileControls();
      }
    }

    if (this._state !== 'waiting') {
      this._drawExplosions(timestamp);
    }

    if (this._state === 'paused') {
      this._drawPauseScreen();
    } else if (this._state === 'question') {
      this._drawQuestionScreen();
    } else if (this._state === 'levelIntro') {
      this._drawLevelIntroScreen();
    } else if (this._state === 'levelComplete') {
      this._drawLevelCompleteScreen();
    } else if (this._state === 'countdown') {
      this._drawCountdownOverlay(timestamp);
    }
  }

  private _getCountdownValue(timestamp: number): number {
    const remainingMs = this._countdownEndsAt - timestamp;
    return Math.max(1, Math.ceil(remainingMs / 1000));
  }

  private _getCurrentLevelName(): string {
    const levelIndex = Math.max(0, Math.min(this._currentLevel - 1, HUD.levelNames.length - 1));
    return HUD.levelNames[levelIndex] ?? HUD.levelNames[0];
  }

  private _getLevelIntroLayout(): {
    centerX: number;
    levelNumberY: number;
    levelNameY: number;
    arrowHintsY: number;
  } {
    const centerX = DESIGN_WIDTH / 2;
    const levelNumberHeight = s(LEVEL_INTRO.levelNumberFontSize) * 1.15;
    const levelNameHeight = s(LEVEL_INTRO.levelNameFontSize) * 1.1;
    const arrowBlockHeight =
      s(LEVEL_INTRO.arrowKeySize) +
      s(LEVEL_INTRO.instructionGapBelowKeys) +
      s(LEVEL_INTRO.arrowHintsFontSize) * 1.35;
    const stackHeight =
      levelNumberHeight +
      s(LEVEL_INTRO.levelNameGap) +
      levelNameHeight +
      s(LEVEL_INTRO.arrowHintsGapBelowName) +
      arrowBlockHeight;
    const stackTop = DESIGN_HEIGHT / 2 + s(LEVEL_INTRO.stackOffsetY) - stackHeight / 2;

    return {
      centerX,
      levelNumberY: stackTop,
      levelNameY: stackTop + levelNumberHeight + s(LEVEL_INTRO.levelNameGap),
      arrowHintsY:
        stackTop +
        levelNumberHeight +
        s(LEVEL_INTRO.levelNameGap) +
        levelNameHeight +
        s(LEVEL_INTRO.arrowHintsGapBelowName)
    };
  }

  private _drawLevelIntroScreen(): void {
    this._drawMenuBackdrop();

    const panel = this._getMenuPanelBounds();
    this._drawMenuPanelBackground(panel);

    const layout = this._getLevelIntroLayout();
    const levelName = this._getCurrentLevelName();

    this._ctx.fillStyle = '#FFFFFF';
    this._ctx.textAlign = 'center';
    this._ctx.textBaseline = 'top';
    this._ctx.font = menuFont(LEVEL_INTRO.levelNumberFontSize);
    this._ctx.fillText(LEVEL_INTRO.levelNumberText(this._currentLevel), layout.centerX, layout.levelNumberY);

    this._ctx.font = menuFont(LEVEL_INTRO.levelNameFontSize);
    this._ctx.fillText(levelName, layout.centerX, layout.levelNameY);

    this._drawArrowKeyHints(layout.centerX, layout.arrowHintsY, {
      keySize: LEVEL_INTRO.arrowKeySize,
      gap: LEVEL_INTRO.arrowKeyGap,
      fontSize: LEVEL_INTRO.arrowHintsFontSize,
      instructionGap: LEVEL_INTRO.instructionGapBelowKeys,
      instructionText: LEVEL_INTRO.instructionText
    });
  }

  private _getLevelCompleteProceedButtonBounds(): { x: number; y: number; width: number; height: number } {
    const panel = this._getMenuPanelBounds();
    const content = this._getMenuContentBounds(panel);

    return {
      x: panel.x + (panel.width - LEVEL_COMPLETE.proceedButtonWidth) / 2,
      y: content.bottom - LEVEL_COMPLETE.proceedButtonHeight - LEVEL_COMPLETE.proceedButtonBottomOffset,
      width: LEVEL_COMPLETE.proceedButtonWidth,
      height: LEVEL_COMPLETE.proceedButtonHeight
    };
  }

  private _getLevelCompleteLayout(): {
    centerX: number;
    starY: number;
    titleY: number;
    headlineY: number;
    rewardsY: number;
  } {
    const centerX = DESIGN_WIDTH / 2;
    const button = this._getLevelCompleteProceedButtonBounds();
    const stackShift = s(LEVEL_COMPLETE.stackOffsetY);

    const starHeight = s(LEVEL_COMPLETE.starSize);
    const titleHeight = s(LEVEL_COMPLETE.titleFontSize) * 1.2;
    const headlineHeight = s(LEVEL_COMPLETE.headlineFontSize) * 1.15;
    const rewardsHeight = s(LEVEL_COMPLETE.rewardsFontSize) * 1.3;

    const rewardsBottom =
      button.y - s(LEVEL_COMPLETE.rewardsGapAboveProceedButton) + stackShift;
    const rewardsY = rewardsBottom - rewardsHeight;
    const headlineY = rewardsY - s(LEVEL_COMPLETE.headlineGapBelow) - headlineHeight;
    const titleY = headlineY - s(LEVEL_COMPLETE.titleGapBelow) - titleHeight;
    const starY = titleY - s(LEVEL_COMPLETE.starGapBelow) - starHeight;

    return {
      centerX,
      starY,
      titleY,
      headlineY,
      rewardsY
    };
  }

  private _drawLevelCompleteRewards(centerX: number, y: number): void {
    const coinsEarned = this._getLevelCoinsEarned();
    const xpEarned = this._getLevelXpEarned();
    const coinIconSize = s(LEVEL_COMPLETE.coinIconSize);
    const centerY =
      y + s(LEVEL_COMPLETE.rewardsFontSize) * LEVEL_COMPLETE.rewardsBaselineFactor;

    this._ctx.font = menuFont(LEVEL_COMPLETE.rewardsFontSize);
    this._ctx.fillStyle = LEVEL_COMPLETE.rewardsColor;
    this._ctx.textAlign = 'left';
    this._ctx.textBaseline = 'middle';

    const coinsText = String(coinsEarned);
    const xpText = LEVEL_COMPLETE.xpRewardPrefix + xpEarned + LEVEL_COMPLETE.xpRewardSuffix;
    let totalWidth = 0;

    if (LEVEL_COMPLETE.showCoinReward) {
      totalWidth +=
        this._ctx.measureText(LEVEL_COMPLETE.coinRewardPrefix).width +
        coinIconSize +
        s(4) +
        this._ctx.measureText(coinsText).width;
    }
    if (LEVEL_COMPLETE.showCoinReward && LEVEL_COMPLETE.showXpReward) {
      totalWidth += s(LEVEL_COMPLETE.rewardsGapBetweenCoinAndXp);
    }
    if (LEVEL_COMPLETE.showXpReward) {
      totalWidth += this._ctx.measureText(xpText).width;
    }

    let x = centerX - totalWidth / 2;

    if (LEVEL_COMPLETE.showCoinReward) {
      this._ctx.fillText(LEVEL_COMPLETE.coinRewardPrefix, x, centerY);
      x += this._ctx.measureText(LEVEL_COMPLETE.coinRewardPrefix).width;

      if (!this._drawUiCoinIcon(x, centerY - coinIconSize / 2, coinIconSize)) {
        this._ctx.fillStyle = '#FFEB3B';
        this._ctx.beginPath();
        this._ctx.arc(x + coinIconSize / 2, centerY, coinIconSize / 2, 0, Math.PI * 2);
        this._ctx.fill();
      }
      x += coinIconSize + s(4);
      this._ctx.fillText(coinsText, x, centerY);
      x += this._ctx.measureText(coinsText).width;
    }

    if (LEVEL_COMPLETE.showCoinReward && LEVEL_COMPLETE.showXpReward) {
      x += s(LEVEL_COMPLETE.rewardsGapBetweenCoinAndXp);
    }

    if (LEVEL_COMPLETE.showXpReward) {
      this._ctx.fillText(xpText, x, centerY);
    }
  }

  private _drawLevelCompleteMascot(panel: { x: number; y: number; width: number; height: number }): void {
    if (!LEVEL_COMPLETE.showMascot || !this._assets?.levelPassRaccoon) {
      return;
    }

    const mascotHeight = s(LEVEL_COMPLETE.mascotHeight);
    const aspect =
      this._assets.levelPassRaccoonMeta.height / this._assets.levelPassRaccoonMeta.width;
    const mascotWidth = Math.round(mascotHeight / aspect);
    const x =
      panel.x +
      panel.width -
      mascotWidth -
      s(LEVEL_COMPLETE.mascotRightOffset);
    const y =
      panel.y +
      panel.height -
      mascotHeight -
      s(LEVEL_COMPLETE.mascotBottomOffset);

    this._ctx.drawImage(this._assets.levelPassRaccoon, x, y, mascotWidth, mascotHeight);
  }

  private _drawLevelCompleteScreen(): void {
    this._drawMenuBackdrop();

    const panel = this._getMenuPanelBounds();
    this._drawMenuPanelBackground(panel);

    const layout = this._getLevelCompleteLayout();
    const starSize = s(LEVEL_COMPLETE.starSize);

    if (this._assets?.star) {
      this._ctx.drawImage(
        this._assets.star,
        layout.centerX - starSize / 2,
        layout.starY,
        starSize,
        starSize
      );
    }

    this._ctx.textAlign = 'center';
    this._ctx.textBaseline = 'top';
    this._ctx.font = menuFont(LEVEL_COMPLETE.titleFontSize);
    this._ctx.fillStyle = LEVEL_COMPLETE.titleColor;
    this._ctx.fillText(LEVEL_COMPLETE.titleText, layout.centerX, layout.titleY);

    this._ctx.font = menuFont(LEVEL_COMPLETE.headlineFontSize);
    this._ctx.fillStyle = LEVEL_COMPLETE.headlineColor;
    this._ctx.fillText(LEVEL_COMPLETE.headlineText, layout.centerX, layout.headlineY);

    this._drawLevelCompleteRewards(layout.centerX, layout.rewardsY);

    this._drawMenuButton(
      this._getLevelCompleteProceedButtonBounds(),
      LEVEL_COMPLETE.proceedButtonText,
      LEVEL_COMPLETE.proceedButtonFontSize
    );

    this._drawLevelCompleteMascot(panel);
  }

  private _drawCountdownOverlay(timestamp: number): void {
    this._ctx.fillStyle = COUNTDOWN.overlayColor;
    this._ctx.fillRect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);

    this._ctx.fillStyle = '#FFFFFF';
    this._ctx.font = menuFont(COUNTDOWN.fontSize);
    this._ctx.textAlign = 'center';
    this._ctx.textBaseline = 'middle';
    this._ctx.fillText(String(this._getCountdownValue(timestamp)), DESIGN_WIDTH / 2, DESIGN_HEIGHT / 2);
  }

  private _drawConfetti(): void {
    for (let i = 0; i < this._confettiParticles.length; i++) {
      const particle = this._confettiParticles[i];
      const alpha = Math.max(0, particle.lifeMs / particle.maxLifeMs);

      this._ctx.save();
      this._ctx.globalAlpha = alpha * 0.9;
      this._ctx.translate(particle.x, particle.y);
      this._ctx.rotate(particle.rotation);
      this._ctx.fillStyle = particle.color;
      this._ctx.fillRect(-particle.width / 2, -particle.height / 2, particle.width, particle.height);
      this._ctx.restore();
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

  private _drawExplosions(timestamp: number): void {
    for (let i = 0; i < this._explosionFlashes.length; i++) {
      const flash = this._explosionFlashes[i];
      const progress = (timestamp - flash.startedAt) / EXPLOSION.flashLifetimeMs;
      const radius = s(EXPLOSION.flashMaxRadius) * progress;
      const alpha = 1 - progress;

      this._ctx.save();
      this._ctx.globalAlpha = alpha * 0.55;
      this._ctx.fillStyle = '#FFF3C4';
      this._ctx.beginPath();
      this._ctx.arc(flash.x, flash.y, radius, 0, Math.PI * 2);
      this._ctx.fill();

      this._ctx.globalAlpha = alpha * 0.35;
      this._ctx.fillStyle = '#FF9800';
      this._ctx.beginPath();
      this._ctx.arc(flash.x, flash.y, radius * 0.65, 0, Math.PI * 2);
      this._ctx.fill();
      this._ctx.restore();
    }

    for (let j = 0; j < this._explosionParticles.length; j++) {
      const particle = this._explosionParticles[j];
      const alpha = Math.max(0, particle.lifeMs / particle.maxLifeMs);

      this._ctx.save();
      this._ctx.globalAlpha = alpha;
      this._ctx.fillStyle = particle.color;
      this._ctx.beginPath();
      this._ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      this._ctx.fill();
      this._ctx.restore();
    }
  }

  private _getGhostModePulseOpacity(timestamp: number): number {
    const { minOpacity, maxOpacity, periodMs } = GHOST_MODE_PULSE;
    const midpoint = (minOpacity + maxOpacity) / 2;
    const amplitude = (maxOpacity - minOpacity) / 2;
    const phase = (timestamp / periodMs) * Math.PI * 2;

    return midpoint + amplitude * Math.sin(phase);
  }

  private _getPlayerFloatOffset(timestamp: number): { x: number; y: number } {
    const timeSeconds = timestamp / 1000;
    const xPeriodSeconds = PLAYER_FLOAT.periodXMs / 1000;
    const yPeriodSeconds = PLAYER_FLOAT.periodYMs / 1000;

    return {
      x: Math.sin((timeSeconds * Math.PI * 2) / xPeriodSeconds) * s(PLAYER_FLOAT.amplitudeX),
      y:
        Math.sin((timeSeconds * Math.PI * 2) / yPeriodSeconds + PLAYER_FLOAT.yPhase) *
        s(PLAYER_FLOAT.amplitudeY)
    };
  }

  private _drawGodModeHoloRing(drawX: number, drawY: number): void {
    const centerX = drawX + this._playerWidth / 2 + s(GOD_MODE_HOLO_RING.offsetX);
    const centerY = drawY + s(GOD_MODE_HOLO_RING.offsetY);
    const radiusX = s(GOD_MODE_HOLO_RING.radiusX);
    const radiusY = s(GOD_MODE_HOLO_RING.radiusY);

    this._ctx.save();
    this._ctx.translate(centerX, centerY);
    this._ctx.globalAlpha = GOD_MODE_HOLO_RING.opacity;

    const gradient = this._ctx.createLinearGradient(-radiusX, 0, radiusX, 0);
    gradient.addColorStop(0, 'rgba(255, 235, 59, 0.95)');
    gradient.addColorStop(0.5, 'rgba(255, 193, 7, 0.9)');
    gradient.addColorStop(1, 'rgba(255, 235, 59, 0.95)');

    this._ctx.strokeStyle = gradient;
    this._ctx.lineWidth = s(GOD_MODE_HOLO_RING.lineWidth);
    this._ctx.beginPath();
    this._ctx.ellipse(0, 0, radiusX, radiusY, 0, 0, Math.PI * 2);
    this._ctx.stroke();

    const innerRadiusX = radiusX * GOD_MODE_HOLO_RING.innerScale;
    const innerRadiusY = radiusY * GOD_MODE_HOLO_RING.innerScale;
    this._ctx.globalAlpha = GOD_MODE_HOLO_RING.innerOpacity;
    this._ctx.beginPath();
    this._ctx.ellipse(0, 0, innerRadiusX, innerRadiusY, 0, 0, Math.PI * 2);
    this._ctx.stroke();
    this._ctx.restore();
  }

  private _drawGodModeAngledWind(timestamp: number, drawX: number, drawY: number): void {
    const centerX = drawX + this._playerWidth / 2;
    const centerY = drawY + PLAYER_HEIGHT / 2;
    const angle = GOD_MODE_WIND.angleRadians;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const streakLen = s(GOD_MODE_WIND.streakLength);
    const halfLen = streakLen / 2;
    const cycle = streakLen * 2;
    const travel = (timestamp * GOD_MODE_WIND.speed) % cycle;

    this._ctx.save();
    this._ctx.lineCap = 'round';

    for (let i = 0; i < GOD_MODE_WIND.streakCount; i++) {
      const spreadX = s(GOD_MODE_WIND.spreadX);
      const spreadY = s(GOD_MODE_WIND.spreadY);
      const offsetX = ((i - (GOD_MODE_WIND.streakCount - 1) / 2) / GOD_MODE_WIND.streakCount) * spreadX;
      const offsetY = ((i * 17) % GOD_MODE_WIND.streakCount / GOD_MODE_WIND.streakCount - 0.5) * spreadY;
      const baseX = centerX + offsetX;
      const baseY = centerY + offsetY;
      const drift = ((travel + i * (cycle / GOD_MODE_WIND.streakCount)) % cycle) - halfLen;
      const x1 = baseX + cos * (drift - halfLen);
      const y1 = baseY + sin * (drift - halfLen);
      const x2 = baseX + cos * (drift + halfLen);
      const y2 = baseY + sin * (drift + halfLen);
      const lineGradient = this._ctx.createLinearGradient(x1, y1, x2, y2);

      lineGradient.addColorStop(0, GOD_MODE_WIND.colorFade);
      lineGradient.addColorStop(0.5, GOD_MODE_WIND.color);
      lineGradient.addColorStop(1, GOD_MODE_WIND.colorFade);

      this._ctx.strokeStyle = lineGradient;
      this._ctx.lineWidth = s(GOD_MODE_WIND.streakWidth);
      this._ctx.beginPath();
      this._ctx.moveTo(x1, y1);
      this._ctx.lineTo(x2, y2);
      this._ctx.stroke();
    }

    this._ctx.restore();
  }

  private _drawPlayer(timestamp: number): void {
    const cheatGodModeActive = this._isCheatGodModeActive();
    const ghostModeActive = this._isGhostModeActive(timestamp);
    const floatOffset = this._getPlayerFloatOffset(timestamp);
    const drawX = PLAYER_X + floatOffset.x;
    const drawY = this._playerY + floatOffset.y;

    if (cheatGodModeActive) {
      this._drawGodModeAngledWind(timestamp, drawX, drawY);
    }

    if (ghostModeActive) {
      this._ctx.save();
      this._ctx.globalAlpha = this._getGhostModePulseOpacity(timestamp);
    }

    if (this._assets) {
      this._ctx.drawImage(
        this._assets.character,
        drawX,
        drawY,
        this._playerWidth,
        PLAYER_HEIGHT
      );
    } else {
      this._ctx.fillStyle = '#2196F3';
      this._ctx.fillRect(drawX, drawY, this._playerWidth, PLAYER_HEIGHT);
    }

    if (ghostModeActive) {
      this._ctx.restore();
    }

    if (cheatGodModeActive) {
      this._drawGodModeHoloRing(drawX, drawY);
    }

    if (SHOW_OBSTACLE_HITBOXES) {
      const hitbox = this._getPlayerHitbox();
      this._ctx.strokeStyle = '#FF0000';
      this._ctx.lineWidth = s(2);
      this._ctx.strokeRect(hitbox.x, hitbox.y, hitbox.width, hitbox.height);
    }
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
    const collectible = this._getCollectibleImage();

    for (let i = 0; i < this._coins.length; i++) {
      const coin = this._coins[i];

      if (collectible) {
        const drawRect = this._getCollectibleDrawRect(coin.x, coin.y, coin.width);
        this._ctx.drawImage(
          collectible,
          drawRect.x,
          drawRect.y,
          drawRect.width,
          drawRect.height
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

    const livesLabel = HUD.livesLabel;
    this._ctx.fillText(livesLabel, HUD_PADDING, hudCenterY);

    const heartsStartX = HUD_PADDING + this._ctx.measureText(livesLabel).width + s(10);
    for (let i = 0; i < MAX_LIVES; i++) {
      this._drawHeart(heartsStartX + i * (HEART_SIZE + s(8)), hudCenterY - HEART_SIZE / 2, i < this._lives);
    }

    this._drawLevelHud(hudCenterY);
    this._drawScoreHud(hudCenterY);
    this._drawPauseButton();
    this._clearHudTextShadow();
  }

  private _drawLevelHud(centerY: number): void {
    const levelName = this._getCurrentLevelName();
    const levelText = HUD.levelText(this._currentLevel, levelName);

    this._ctx.font = font(HUD.levelFontSize);
    this._ctx.fillStyle = '#FFFFFF';
    this._ctx.textAlign = 'center';
    this._ctx.textBaseline = 'middle';
    this._ctx.fillText(levelText, DESIGN_WIDTH / 2, centerY);
  }

  private _drawScoreHud(centerY: number): void {
    const pauseBounds = this._getPauseButtonBounds();
    const scoreAreaRight = pauseBounds.x - s(14);
    const scoreLabel = HUD.scoreLabel;
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
      if (!this._drawUiCoinIcon(x, centerY - HUD_COIN_SIZE / 2, HUD_COIN_SIZE)) {
        this._ctx.fillStyle = '#FFEB3B';
        this._ctx.beginPath();
        this._ctx.arc(x + HUD_COIN_SIZE / 2, centerY, HUD_COIN_SIZE / 2, 0, Math.PI * 2);
        this._ctx.fill();
      }
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

  private _detectMobileControls(): boolean {
    if (!MOBILE_CONTROLS.enabled) {
      return false;
    }

    if (MOBILE_CONTROLS.forceEnable) {
      return true;
    }

    if (typeof window === 'undefined') {
      return false;
    }

    return (
      window.matchMedia('(pointer: coarse)').matches ||
      window.matchMedia('(hover: none)').matches ||
      navigator.maxTouchPoints > 0
    );
  }

  private _clearTouchMovement(): void {
    this._touchMovement = 0;
    this._mobileControlPointerId = undefined;
  }

  private _getMobileControlButtonSize(): number {
    return s(MOBILE_CONTROLS.buttonSize);
  }

  private _getMobileDownButtonBounds(): { x: number; y: number; width: number; height: number } {
    const size = this._getMobileControlButtonSize();
    const x = s(MOBILE_CONTROLS.marginX);
    const y = DESIGN_HEIGHT - s(MOBILE_CONTROLS.marginBottom) - size;

    return { x, y, width: size, height: size };
  }

  private _getMobileUpButtonBounds(): { x: number; y: number; width: number; height: number } {
    const down = this._getMobileDownButtonBounds();
    const size = down.width;

    return {
      x: down.x,
      y: down.y - size - s(MOBILE_CONTROLS.buttonGap),
      width: size,
      height: size
    };
  }

  private _handleMobileControlPointerDown(event: PointerEvent): boolean {
    if (!this._mobileControlsEnabled || this._state !== 'playing') {
      return false;
    }

    const point = this._canvasPointFromClient(event.clientX, event.clientY);

    if (this._isPointInRect(point.x, point.y, this._getMobileUpButtonBounds())) {
      this._touchMovement = -1;
      this._mobileControlPointerId = event.pointerId;
      this._canvas.setPointerCapture(event.pointerId);
      return true;
    }

    if (this._isPointInRect(point.x, point.y, this._getMobileDownButtonBounds())) {
      this._touchMovement = 1;
      this._mobileControlPointerId = event.pointerId;
      this._canvas.setPointerCapture(event.pointerId);
      return true;
    }

    return false;
  }

  private _drawMobileControls(): void {
    this._drawMobileControlButton(this._getMobileUpButtonBounds(), 'up', this._touchMovement === -1);
    this._drawMobileControlButton(this._getMobileDownButtonBounds(), 'down', this._touchMovement === 1);
  }

  private _drawMobileControlButton(
    bounds: { x: number; y: number; width: number; height: number },
    direction: 'up' | 'down',
    pressed: boolean
  ): void {
    const radius = s(12);
    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;

    this._roundRectPath(bounds.x, bounds.y, bounds.width, bounds.height, radius);
    this._ctx.fillStyle = pressed ? MOBILE_CONTROLS.fillPressedColor : MOBILE_CONTROLS.fillColor;
    this._ctx.fill();
    this._ctx.strokeStyle = pressed ? MOBILE_CONTROLS.borderPressedColor : MOBILE_CONTROLS.borderColor;
    this._ctx.lineWidth = s(2);
    this._ctx.stroke();

    const arrowHeight = bounds.height * 0.22;
    const arrowHalfWidth = bounds.width * 0.2;

    this._ctx.fillStyle = MOBILE_CONTROLS.arrowColor;
    this._ctx.beginPath();

    if (direction === 'up') {
      this._ctx.moveTo(centerX, centerY - arrowHeight);
      this._ctx.lineTo(centerX - arrowHalfWidth, centerY + arrowHeight * 0.35);
      this._ctx.lineTo(centerX + arrowHalfWidth, centerY + arrowHeight * 0.35);
    } else {
      this._ctx.moveTo(centerX, centerY + arrowHeight);
      this._ctx.lineTo(centerX - arrowHalfWidth, centerY - arrowHeight * 0.35);
      this._ctx.lineTo(centerX + arrowHalfWidth, centerY - arrowHeight * 0.35);
    }

    this._ctx.closePath();
    this._ctx.fill();
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

    if (this._assets?.pauseButton) {
      this._ctx.drawImage(this._assets.pauseButton, bounds.x, bounds.y, bounds.size, bounds.size);
      return;
    }

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

  private _applyPlayerProgress(record: PlayerProgressRecord): void {
    this._bestScore = record.highScore;
    this._freeModeUnlocked = record.freeModeUnlocked;
    this._xpEarnedSlots = createEmptyEarnedQuestionSlots();

    for (let i = 0; i < record.earnedQuestionSlots.length && i < this._xpEarnedSlots.length; i++) {
      this._xpEarnedSlots[i] = record.earnedQuestionSlots[i] === true;
    }

    if (!this._freeModeUnlocked && this._xpEarnedSlots.every((earned) => earned)) {
      this._freeModeUnlocked = true;
    }

    if (DEBUG_FORCE_FREE_MODE) {
      this._freeModeUnlocked = true;
    }
  }

  private _finalizeGameSession(): void {
    if (this._sessionProgressSaved || this._sessionProgressSaving || !this._progressService) {
      return;
    }

    const newHighScore = Math.max(this._bestScore, this._score);
    this._bestScore = newHighScore;

    const sessionXpGained =
      this._sessionXpByLevel[this._activeProgressLevel - 1] !== undefined
        ? this._sessionXpByLevel[this._activeProgressLevel - 1]
        : 0;
    let xpGainedThisSession = 0;
    for (let i = 0; i < this._sessionXpByLevel.length; i++) {
      xpGainedThisSession += this._sessionXpByLevel[i];
    }

    this._sessionProgressSaving = true;

    this._progressService
      .saveAfterGame({
        coinsCollected: this._score,
        highScore: newHighScore,
        level: this._getProgressLevel(),
        xpGainedInLevel: sessionXpGained,
        xpGainedThisSession,
        earnedQuestionSlots: [...this._xpEarnedSlots],
        freeModeUnlocked: this._freeModeUnlocked
      })
      .then(() => {
        this._sessionProgressSaved = true;
        this._sessionXpByLevel = [0, 0, 0];
        this._sessionProgressSaving = false;
      })
      .catch((error: unknown) => {
        this._sessionProgressSaving = false;
        console.error('[FollowThePath] Failed to save player progress to SharePoint.', error);
      });
  }

  private _getGlobalQuestionIndex(level?: number, slotIndex?: number): number {
    const questionLevel = level ?? this._currentLevel;
    const questionSlot = slotIndex ?? this._activeQuestionInLevelIndex;
    return (questionLevel - 1) * QUESTIONS_PER_LEVEL + questionSlot;
  }

  private _getProgressLevel(): number {
    for (let level = 1; level <= MAX_QUESTION_LEVEL; level++) {
      const start = (level - 1) * QUESTIONS_PER_LEVEL;

      for (let q = 0; q < QUESTIONS_PER_LEVEL; q++) {
        if (!this._xpEarnedSlots[start + q]) {
          return level;
        }
      }
    }

    return MAX_QUESTION_LEVEL;
  }

  private _awardXpForCorrectAnswer(): void {
    if (this._freeModeUnlocked) {
      return;
    }

    const globalIndex = this._getGlobalQuestionIndex();

    if (this._xpEarnedSlots[globalIndex]) {
      return;
    }

    this._xpEarnedSlots[globalIndex] = true;

    if (this._xpEarnedSlots.every((earned) => earned)) {
      this._freeModeUnlocked = true;
      this._allQuestionsComplete = true;
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
    const menuLayout = getWelcomeMenuLayout(this._freeModeUnlocked);
    const buttonWidth = Math.min(menuLayout.startButtonWidth, content.width - WELCOME_MENU.descriptionWidthInset);
    let y: number;

    if (this._freeModeUnlocked) {
      const layout = this._getWelcomeContentLayout();
      const bestScoreBlockHeight = s(WELCOME_MENU.bestScoreFontSize) * 1.2;
      y =
        layout.bestScoreY +
        bestScoreBlockHeight +
        WELCOME_MENU.freeMode.difficulty.startButtonGapBelowBestScore;
    } else {
      y = content.bottom - menuLayout.startButtonHeight - WELCOME_MENU.standard.startButtonBottomOffset;
    }

    return {
      x: panel.x + (panel.width - buttonWidth) / 2,
      y,
      width: buttonWidth,
      height: menuLayout.startButtonHeight
    };
  }

  private _getWelcomeDescriptionText(): string {
    return 'Guide your Wreckoon through the obstacles & answer each question as they increase in difficulty.';
  }

  private _measureWrappedTextHeight(
    text: string,
    maxWidth: number,
    lineHeight: number,
    fontStyle: string
  ): number {
    this._ctx.font = fontStyle;
    const words = text.split(' ');
    let line = '';
    let lines = 1;

    for (let i = 0; i < words.length; i++) {
      const testLine = line ? line + ' ' + words[i] : words[i];
      const metrics = this._ctx.measureText(testLine);

      if (metrics.width > maxWidth && line) {
        line = words[i];
        lines++;
      } else {
        line = testLine;
      }
    }

    return lines * lineHeight;
  }

  private _getWelcomeContentLayout(): {
    centerX: number;
    descriptionBottom: number;
    difficultyTitleY: number;
    difficultyButtonsY: number;
    bestScoreY: number;
  } {
    const panel = this._getWelcomePanelBounds();
    const content = this._getMenuContentBounds(panel);
    const centerX = panel.x + panel.width / 2;
    const menuLayout = getWelcomeMenuLayout(this._freeModeUnlocked);
    const descriptionTop = content.y + menuLayout.descriptionOffsetY;
    const descriptionHeight = this._measureWrappedTextHeight(
      this._getWelcomeDescriptionText(),
      content.width - WELCOME_MENU.descriptionWidthInset,
      s(WELCOME_MENU.descriptionLineHeight),
      menuFont(WELCOME_MENU.descriptionFontSize)
    );
    const descriptionBottom = descriptionTop + descriptionHeight;

    if (!this._freeModeUnlocked) {
      return {
        centerX,
        descriptionBottom,
        difficultyTitleY: 0,
        difficultyButtonsY: 0,
        bestScoreY: descriptionBottom + WELCOME_MENU.standard.bestScoreGap
      };
    }

    const difficulty = WELCOME_MENU.freeMode.difficulty;
    const difficultyTitleY = descriptionBottom + difficulty.titleGapBelowDescription;
    const difficultyButtonsY =
      difficultyTitleY +
      s(difficulty.titleFontSize) * 1.2 +
      difficulty.titleGapBelow;
    const bestScoreY =
      difficultyButtonsY + difficulty.buttonHeight + difficulty.gapBelowButtons;

    return {
      centerX,
      descriptionBottom,
      difficultyTitleY,
      difficultyButtonsY,
      bestScoreY
    };
  }

  private _getWelcomeDifficultyButtonBounds(index: number): { x: number; y: number; width: number; height: number } {
    const layout = this._getWelcomeContentLayout();
    const difficulty = WELCOME_MENU.freeMode.difficulty;
    const buttonCount = difficulty.labels.length;
    const totalWidth = difficulty.buttonWidth * buttonCount + difficulty.buttonGap * (buttonCount - 1);
    const startX = layout.centerX - totalWidth / 2;

    return {
      x: startX + index * (difficulty.buttonWidth + difficulty.buttonGap),
      y: layout.difficultyButtonsY,
      width: difficulty.buttonWidth,
      height: difficulty.buttonHeight
    };
  }

  private _drawWelcomeDifficultyButton(
    bounds: { x: number; y: number; width: number; height: number },
    label: string,
    selected: boolean
  ): void {
    if (selected) {
      this._ctx.fillStyle = WELCOME_ACCENT;
      this._ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
    } else {
      this._ctx.fillStyle = 'rgba(18, 22, 30, 0.95)';
      this._ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
      this._ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
      this._ctx.lineWidth = s(1);
      this._ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
    }

    this._ctx.font = menuFont(WELCOME_MENU.freeMode.difficulty.buttonFontSize);
    this._ctx.fillStyle = '#FFFFFF';
    this._ctx.textAlign = 'center';
    this._ctx.textBaseline = 'middle';
    this._ctx.fillText(label, bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
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
    const layout = this._getPauseMenuLayout();
    const button = index === 0 ? layout.resumeButton : layout.mainMenuButton;

    return button;
  }

  private _getPauseMenuLayout(): {
    centerX: number;
    iconY: number;
    titleY: number;
    subtitleY: number;
    resumeButton: { x: number; y: number; width: number; height: number };
    mainMenuButton: { x: number; y: number; width: number; height: number };
  } {
    const centerX = DESIGN_WIDTH / 2;
    const stackCenterY = DESIGN_HEIGHT / 2 + s(PAUSE_MENU.stackOffsetY);
    const buttonWidth = s(PAUSE_MENU.buttonWidth);
    const buttonHeight = s(PAUSE_MENU.buttonHeight);
    const buttonX = centerX - buttonWidth / 2;
    const iconHeight = s(PAUSE_MENU.iconBarHeight);
    const titleBlockHeight = s(PAUSE_MENU.titleFontSize) * 1.15;
    const subtitleBlockHeight = PAUSE_MENU.showSubtitle ? s(PAUSE_MENU.subtitleFontSize) * 1.35 : 0;

    let stackHeight =
      iconHeight +
      s(PAUSE_MENU.titleGapBelowIcon) +
      titleBlockHeight +
      s(PAUSE_MENU.titleGapBelow) +
      buttonHeight;

    if (PAUSE_MENU.showSubtitle) {
      stackHeight += s(PAUSE_MENU.subtitleGapBelow) + subtitleBlockHeight;
    }

    if (PAUSE_MENU.showMainMenuButton) {
      stackHeight += s(PAUSE_MENU.buttonGap) + buttonHeight;
    }

    let y = stackCenterY - stackHeight / 2;
    const iconY = y;
    y += iconHeight + s(PAUSE_MENU.titleGapBelowIcon);
    const titleY = y;
    y += titleBlockHeight + s(PAUSE_MENU.titleGapBelow);

    const subtitleY = y;
    if (PAUSE_MENU.showSubtitle) {
      y += subtitleBlockHeight + s(PAUSE_MENU.subtitleGapBelow);
    }

    const resumeButton = {
      x: buttonX,
      y,
      width: buttonWidth,
      height: buttonHeight
    };

    const mainMenuButton = {
      x: buttonX,
      y: y + buttonHeight + s(PAUSE_MENU.buttonGap),
      width: buttonWidth,
      height: buttonHeight
    };

    return {
      centerX,
      iconY,
      titleY,
      subtitleY,
      resumeButton,
      mainMenuButton
    };
  }

  private _drawPauseIcon(centerX: number, y: number): void {
    const barWidth = s(PAUSE_MENU.iconBarWidth);
    const barHeight = s(PAUSE_MENU.iconBarHeight);
    const barGap = s(PAUSE_MENU.iconBarGap);
    const totalWidth = barWidth * 2 + barGap;
    const leftX = centerX - totalWidth / 2;
    const radius = Math.min(barWidth / 2, s(4));

    this._ctx.fillStyle = PAUSE_MENU.iconColor;
    this._roundRectPath(leftX, y, barWidth, barHeight, radius);
    this._ctx.fill();
    this._roundRectPath(leftX + barWidth + barGap, y, barWidth, barHeight, radius);
    this._ctx.fill();
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
    selected: boolean = false,
    feedback?: 'correct' | 'wrong'
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

    if (feedback === 'correct') {
      this._ctx.fillStyle = ANSWER_CORRECT_TINT;
      this._ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
    } else if (feedback === 'wrong') {
      this._ctx.fillStyle = ANSWER_WRONG_TINT;
      this._ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
    } else if (selected) {
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

  private _drawArrowKeyHints(
    centerX: number,
    y: number,
    options: {
      keySize?: number;
      gap?: number;
      fontSize?: number;
      instructionGap?: number;
      instructionText?: string;
    } = {}
  ): void {
    const keySize = s(options.keySize ?? WELCOME_MENU.arrowKeySize);
    const gap = s(options.gap ?? WELCOME_MENU.arrowKeyGap);
    const fontSize = options.fontSize ?? WELCOME_MENU.arrowHintsFontSize;
    const instructionGap = s(options.instructionGap ?? 8);
    const instructionText = options.instructionText ?? 'Use arrow keys to control the spaceship';
    const totalWidth = keySize * 2 + gap;
    const startX = centerX - totalWidth / 2;

    for (let i = 0; i < 2; i++) {
      const keyX = startX + i * (keySize + gap);
      const direction = i === 0 ? 'up' : 'down';

      if (this._assets?.arrowUp) {
        this._drawArrowKeyHintImage(keyX, y, keySize, direction);
      } else {
        this._drawArrowKeyHintFallback(keyX, y, keySize, direction);
      }
    }

    this._ctx.font = menuFont(fontSize);
    this._ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    this._ctx.textAlign = 'center';
    this._ctx.textBaseline = 'top';
    this._ctx.fillText(instructionText, centerX, y + keySize + instructionGap);
  }

  private _drawArrowKeyHintImage(x: number, y: number, size: number, direction: 'up' | 'down'): void {
    const image = this._assets?.arrowUp;
    if (!image) {
      return;
    }

    this._ctx.save();
    if (direction === 'down') {
      this._ctx.translate(x + size / 2, y + size / 2);
      this._ctx.scale(1, -1);
      this._ctx.drawImage(image, -size / 2, -size / 2, size, size);
    } else {
      this._ctx.drawImage(image, x, y, size, size);
    }
    this._ctx.restore();
  }

  private _drawArrowKeyHintFallback(x: number, y: number, size: number, direction: 'up' | 'down'): void {
    this._roundRectPath(x, y, size, size, s(6));
    this._ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    this._ctx.fill();
    this._ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    this._ctx.lineWidth = s(1);
    this._ctx.stroke();

    this._ctx.fillStyle = '#FFFFFF';
    this._ctx.beginPath();
    if (direction === 'up') {
      this._ctx.moveTo(x + size / 2, y + s(7));
      this._ctx.lineTo(x + size / 2 - s(7), y + s(18));
      this._ctx.lineTo(x + size / 2 + s(7), y + s(18));
    } else {
      this._ctx.moveTo(x + size / 2, y + s(21));
      this._ctx.lineTo(x + size / 2 - s(7), y + s(10));
      this._ctx.lineTo(x + size / 2 + s(7), y + s(10));
    }
    this._ctx.closePath();
    this._ctx.fill();
  }

  private _drawSpeechBubble(x: number, y: number, width: number): void {
    if (!this._assets) {
      return;
    }

    const aspect = this._assets.speechBubbleMeta.height / this._assets.speechBubbleMeta.width;
    const height = Math.round(width * aspect);
    this._ctx.drawImage(this._assets.speechBubble, x, y, width, height);
  }

  private _getWelcomeMascotFloatOffset(timestamp: number): { x: number; y: number } {
    const timeSeconds = timestamp / 1000;
    const xPeriodSeconds = WELCOME_MENU.mascotFloatPeriodXMs / 1000;
    const yPeriodSeconds = WELCOME_MENU.mascotFloatPeriodYMs / 1000;

    return {
      x: Math.sin((timeSeconds * Math.PI * 2) / xPeriodSeconds) * s(WELCOME_MENU.mascotFloatAmplitudeX),
      y: Math.sin((timeSeconds * Math.PI * 2) / yPeriodSeconds + Math.PI / 3) * s(WELCOME_MENU.mascotFloatAmplitudeY)
    };
  }

  private _drawWelcomeMascot(timestamp: number): void {
    const shipHeight = s(WELCOME_MENU.mascotShipHeight);
    const shipWidth = Math.round(shipHeight * (CHARACTER_SPRITE_NATIVE.width / CHARACTER_SPRITE_NATIVE.height));
    const floatOffset = this._getWelcomeMascotFloatOffset(timestamp);
    const shipX = s(WELCOME_MENU.mascotShipLeftOffset) + floatOffset.x;
    const shipY = DESIGN_HEIGHT - shipHeight - s(WELCOME_MENU.mascotShipBottomOffset) + floatOffset.y;

    if (this._assets) {
      this._ctx.drawImage(this._assets.character, shipX, shipY, shipWidth, shipHeight);
    }

    const bubbleWidth = Math.min(s(WELCOME_MENU.speechBubbleWidth), DESIGN_WIDTH * 0.42);
    const bubbleX = shipX - bubbleWidth + s(20) + s(WELCOME_MENU.speechBubbleOffsetX);
    const bubbleY = shipY - s(WELCOME_MENU.speechBubbleOffsetY);
    this._drawSpeechBubble(bubbleX, bubbleY, bubbleWidth);
  }

  private _drawWelcomeScreen(timestamp: number): void {
    this._drawMenuBackdrop();

    const panel = this._getWelcomePanelBounds();
    const content = this._getMenuContentBounds(panel);
    const layout = this._getWelcomeContentLayout();
    const menuLayout = getWelcomeMenuLayout(this._freeModeUnlocked);

    this._drawMenuPanelBackground(panel);

    this._ctx.fillStyle = '#FFFFFF';
    this._ctx.textAlign = 'center';
    this._ctx.textBaseline = 'top';
    this._ctx.font = menuFont(WELCOME_MENU.titleFontSize);
    this._ctx.fillText('FOLLOW THE PATH', layout.centerX, content.y + menuLayout.titleOffsetY);

    this._drawWrappedText(
      this._getWelcomeDescriptionText(),
      layout.centerX,
      content.y + menuLayout.descriptionOffsetY,
      content.width - WELCOME_MENU.descriptionWidthInset,
      s(WELCOME_MENU.descriptionLineHeight),
      menuFont(WELCOME_MENU.descriptionFontSize),
      'rgba(255, 255, 255, 0.9)',
      'center'
    );

    if (this._freeModeUnlocked) {
      const difficulty = WELCOME_MENU.freeMode.difficulty;
      this._ctx.font = menuFont(difficulty.titleFontSize);
      this._ctx.fillStyle = '#FFFFFF';
      this._ctx.fillText(difficulty.title, layout.centerX, layout.difficultyTitleY);

      for (let i = 0; i < difficulty.labels.length; i++) {
        this._drawWelcomeDifficultyButton(
          this._getWelcomeDifficultyButtonBounds(i),
          difficulty.labels[i],
          this._freeModeDifficulty === i + 1
        );
      }
    }

    this._ctx.font = menuFont(WELCOME_MENU.bestScoreFontSize);
    this._ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    this._ctx.textAlign = 'center';
    this._ctx.fillText('Best score: ' + this._bestScore, layout.centerX, layout.bestScoreY);

    const button = this._getStartButtonBounds();
    this._drawMenuButton(button, 'START GAME', WELCOME_MENU.startButtonFontSize);

    this._drawArrowKeyHints(layout.centerX, content.bottom - menuLayout.arrowHintsBottomOffset);
    this._drawWelcomeMascot(timestamp);
  }

  private _drawGameOverMascot(): void {
    const shipHeight = s(GAME_OVER_MENU.mascotShipHeight);
    const shipWidth = Math.round(shipHeight * (CHARACTER_SPRITE_NATIVE.width / CHARACTER_SPRITE_NATIVE.height));
    const shipX = s(GAME_OVER_MENU.mascotShipLeftOffset);
    const shipY = DESIGN_HEIGHT - shipHeight - s(GAME_OVER_MENU.mascotShipBottomOffset);

    if (this._assets) {
      this._ctx.drawImage(this._assets.character, shipX, shipY, shipWidth, shipHeight);
    }
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
    this._ctx.fillText('Best score: ' + this._bestScore, centerX, bestScoreY);

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

  private _drawPauseScreen(): void {
    this._drawMenuBackdrop();

    const panel = this._getMenuPanelBounds();
    this._drawMenuPanelBackground(panel);

    const layout = this._getPauseMenuLayout();

    this._drawPauseIcon(layout.centerX, layout.iconY);

    this._ctx.fillStyle = PAUSE_MENU.titleColor;
    this._ctx.textAlign = 'center';
    this._ctx.textBaseline = 'top';
    this._ctx.font = menuFont(PAUSE_MENU.titleFontSize);
    this._ctx.fillText(PAUSE_MENU.titleText, layout.centerX, layout.titleY);

    if (PAUSE_MENU.showSubtitle) {
      this._ctx.font = menuFont(PAUSE_MENU.subtitleFontSize);
      this._ctx.fillStyle = PAUSE_MENU.subtitleColor;
      this._ctx.fillText(PAUSE_MENU.subtitleText, layout.centerX, layout.subtitleY);
    }

    this._drawMenuButton(layout.resumeButton, PAUSE_MENU.resumeButtonText, PAUSE_MENU.buttonFontSize);

    if (PAUSE_MENU.showMainMenuButton) {
      this._drawMenuButton(layout.mainMenuButton, PAUSE_MENU.mainMenuButtonText, PAUSE_MENU.buttonFontSize);
    }

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
    this._ctx.fillStyle = PAUSE_CONFIRM.overlayColor;
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
    selected: boolean,
    feedback?: 'correct' | 'wrong'
  ): void {
    this._drawStyledButton(bounds, selected, feedback);
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
      let feedback: 'correct' | 'wrong' | undefined;
      if (this._answerFeedback?.index === i) {
        feedback = this._answerFeedback.correct ? 'correct' : 'wrong';
      }

      this._drawAnswerButton(
        this._getAnswerButtonBounds(i),
        question.options[i],
        i === this._selectedAnswerIndex,
        feedback
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
