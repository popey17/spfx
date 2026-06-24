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
const heartUrl: string = require('./assets/img_heart.png');
const heartLostUrl: string = require('./assets/img_heartLost.png');
const storeBgUrl: string = require('./assets/img_storeBg.png');
const levelPassRaccoonUrl: string = require('./assets/img_lvlpassRacoon.png');
const backBtnUrl: string = require('./assets/img_back.png');
const muteBtnUrl: string = require('./assets/img_mute.png');
const soundBtnUrl: string = require('./assets/img_sound.png');
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
  SCREEN_BACKGROUND,
  s,
  menuFont,
  MENU_PANEL,
  MENU_BG_NATIVE,
  WELCOME_MENU,
  getWelcomeMenuLayout,
  HOME_BUTTON,
  BACK_BTN_NATIVE,
  MUTE_BUTTON,
  MUTE_BTN_NATIVE,
  AUDIO_MENU,
  GAME_OVER_MENU,
  PAUSE_MENU,
  QUESTION_POPUP,
  ANSWER_FEEDBACK_MS,
  ANSWER_CORRECT_TINT,
  ANSWER_WRONG_TINT,
  WRONG_ANSWER_SCREEN_SHAKE,
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
  MENU_BUTTON_HOVER,
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
  QUESTION_INTERVAL_MS,
  SHIELD_SPAWN_MIN_MS,
  SHIELD_SPAWN_MAX_MS,
  POWER_SHIELD_DURATION_MS,
  POWER_SHIELD_BLINK,
  GAME_SPEED_INITIAL,
  GAME_SPEED_INCREMENT,
  GAME_SPEED_MAX,
  DEBUG_SPAWN_SHIELD_FIRST,
  DEBUG_AUTO_COLLECT_SHIELDS,
  DEBUG_FORCE_FREE_MODE,
  DEBUG_FORCE_ZERO_HEARTS,
  MAIN_SHOP_MENU,
  GAME_OVER_SHOP_MENU,
  SHOP_MENU_LAYOUT,
  STORE_BG_NATIVE,
  type ShopMenuConfig,
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
  createDefaultGameAchievementData,
  applyAchievementSessionUpdate,
  getLevelXpFromSlots,
  getResumeLevelFromProgress,
  getDailyHeartsDayKey,
  resolveDailyHearts,
  type GameAchievementData,
  type PlayerProgressRecord
} from './playerProgressTypes';
import { formatCountdownHms, getMsUntilNextDailyHeartReset } from './gameDateContext';
import { redirectToHomePage } from './registrationRedirect';


/**
 * Self-contained 2D endless runner that mounts a canvas inside a target element.
 * Designed for SPFx web parts: call `new EndlessRunnerGame(domElement)` from `render()`.
 */
export interface EndlessRunnerGameOptions {
  fullscreenLayout?: boolean;
  progressService?: IPlayerProgressService;
  playerProgress?: PlayerProgressRecord;
  questions?: Question[];
}

export class EndlessRunnerGame {
  private readonly _container: HTMLDivElement;
  private readonly _displayCanvas: HTMLCanvasElement;
  private readonly _displayCtx: CanvasRenderingContext2D;
  private _canvas: HTMLCanvasElement;
  private _ctx: CanvasRenderingContext2D;
  private readonly _overlayCanvas: HTMLCanvasElement;
  private readonly _overlayCtx: CanvasRenderingContext2D;
  private readonly _boundKeyDown: (event: KeyboardEvent) => void;
  private readonly _boundKeyUp: (event: KeyboardEvent) => void;
  private readonly _boundResize: () => void;
  private readonly _boundGameLoop: (timestamp: number) => void;
  private readonly _boundPointerDown: (event: PointerEvent) => void;
  private readonly _boundPointerUp: (event: PointerEvent) => void;
  private readonly _boundPointerMove: (event: PointerEvent) => void;
  private readonly _boundPointerLeave: (event: PointerEvent) => void;
  private readonly _boundClick: (event: MouseEvent) => void;
  private readonly _boundUnlockAudio: () => void;
  private readonly _boundVisualViewportResize: (() => void) | undefined;
  private readonly _playerWidth: number;
  private _resizeObserver: ResizeObserver | undefined;
  private _styleOverrides: Array<{ element: HTMLElement; property: string; value: string }> = [];
  private _layoutTarget: HTMLElement | undefined;
  private _layoutTargetStyle = '';

  private _animationFrameId: number = 0;
  private _lastTimestamp: number = 0;
  private _state: GameState = 'waiting';
  private _score: number = 0;
  private _dailyHeartsRemaining: number = MAX_LIVES;
  private _dailyHeartsDay: string = getDailyHeartsDayKey();
  private _heartsSaving: boolean = false;
  private _shopPurchaseSaving: boolean = false;
  private _shopMessage: string | undefined;
  private _shopMessageEndsAt: number = 0;
  private _totalCoins: number = 0;
  private _gameOverShowsShop: boolean = false;
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
  private _questionTimerMs: number = 0;
  private _shieldTimerMs: number = 0;
  private _nextShieldSpawnDelayMs: number = SHIELD_SPAWN_MIN_MS;
  private _powerShieldRemainingMs: number = 0;
  private _grantPowerShieldOnResume: boolean = false;
  private _spawnClockMs: number = 0;
  private _gameSpeedMultiplier: number = GAME_SPEED_INITIAL;
  private _currentLevel: number = 1;
  private _activeQuestionInLevelIndex: number = 0;
  /** Whether each level question slot has been shown and answered (correct or wrong). */
  private _answeredInLevel: boolean[] = [false, false, false, false];
  private _allQuestionsComplete: boolean = false;
  private _obstaclePenalty: number = 0;
  private _selectedAnswerIndex: number = 0;
  private readonly _fullscreenLayout: boolean;
  private _assets: LoadedAssets | undefined;
  private _screenBackgroundImage: HTMLImageElement | undefined;
  private _displayBackdropScratch: HTMLCanvasElement | undefined;
  private _gameAreaCss = { x: 0, y: 0, width: 0, height: 0 };
  private _devicePixelRatio: number = 1;
  private readonly _menuMusic: HTMLAudioElement;
  private readonly _gameMusic: HTMLAudioElement;
  private readonly _coinSound: HTMLAudioElement;
  private readonly _crushSound: HTMLAudioElement;
  private readonly _alarmSound: HTMLAudioElement;
  private readonly _correctSound: HTMLAudioElement;
  private readonly _gameOverSound: HTMLAudioElement;
  private _bestScore: number = 0;
  private _xpEarnedSlots: boolean[] = createEmptyEarnedQuestionSlots();
  private _freeModeUnlocked: boolean = false;
  private _isFreePlaySession: boolean = false;
  private readonly _progressService: IPlayerProgressService | undefined;
  private readonly _questions: Question[];
  private _sessionXpByLevel: number[] = [0, 0, 0];
  private _xpEarnedSlotsAtLastSave: boolean[] = createEmptyEarnedQuestionSlots();
  private _xpEarnedSlotsXpBaseline: boolean[] = createEmptyEarnedQuestionSlots();
  private _savedResumeLevel: number = 1;
  private _sessionProgressSaved: boolean = false;
  private _sessionProgressSaving: boolean = false;
  private _coinsPersistedScore: number = 0;
  private _achievementData: GameAchievementData = createDefaultGameAchievementData();
  private _sessionHeartsLost: number = 0;
  private _disposed: boolean = false;
  private _lastCanvasPressAt: number = 0;
  private _pointerCanvasX: number | undefined;
  private _pointerCanvasY: number | undefined;
  private _menuFocusIndex: number = 0;
  private _showPauseMainMenuConfirm: boolean = false;
  private _answerFeedback: { index: number; correct: boolean } | undefined;
  private _answerFeedbackTimerId: number | undefined;
  private _screenShakeEndsAt: number = 0;
  private _countdownEndsAt: number = 0;
  private _resetQuestionTimerOnResume: boolean = true;
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
  private _musicEnabled: boolean = true;
  private _sfxEnabled: boolean = true;
  private _audioMenuOpen: boolean = false;
  private _audioMenuHoverTarget: 'music' | 'sfx' | null = null;

  constructor(target: HTMLElement, options: EndlessRunnerGameOptions = {}) {
    this._progressService = options.progressService;
    this._questions = options.questions ?? QUESTIONS;
    this._applyPlayerProgress(options.playerProgress ?? createDefaultPlayerProgress());
    this._fullscreenLayout = options.fullscreenLayout === true;
    this._playerWidth = Math.round(
      PLAYER_HEIGHT * (CHARACTER_SPRITE_NATIVE.width / CHARACTER_SPRITE_NATIVE.height)
    );
    this._mobileControlsEnabled = this._detectMobileControls();

    this._boundKeyDown = this._onKeyDown.bind(this);
    this._boundKeyUp = this._onKeyUp.bind(this);
    this._boundResize = this._resizeCanvas.bind(this);
    this._boundVisualViewportResize =
      typeof window !== 'undefined' && window.visualViewport
        ? this._resizeCanvas.bind(this)
        : undefined;
    this._boundGameLoop = this._gameLoop.bind(this);
    this._boundPointerDown = this._onPointerDown.bind(this);
    this._boundPointerUp = this._onPointerUp.bind(this);
    this._boundPointerMove = this._onPointerMove.bind(this);
    this._boundPointerLeave = this._onPointerLeave.bind(this);
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
      this._layoutTarget = target;
      this._applyFullscreenPageLayout(target);
    }

    this._container = document.createElement('div');
    this._container.style.cssText = this._fullscreenLayout
      ? 'position:fixed;inset:0;width:100dvw;height:100dvh;max-width:100vw;max-height:100vh;overflow:hidden;background:' +
        SCREEN_BACKGROUND.fallbackColor +
        ';z-index:9999;'
      : 'position:relative;width:100%;min-height:100dvh;overflow:hidden;background:' +
        SCREEN_BACKGROUND.fallbackColor +
        ';';

    this._displayCanvas = document.createElement('canvas');
    this._displayCanvas.style.cssText =
      'display:block;width:100%;height:100%;cursor:default;touch-action:none;outline:none;border:none;';
    this._displayCanvas.setAttribute('tabindex', '0');
    this._displayCanvas.setAttribute('role', 'application');
    this._displayCanvas.setAttribute('aria-label', 'Follow the Path endless runner game');

    const displayContext = this._displayCanvas.getContext('2d');
    if (!displayContext) {
      throw new Error('Unable to acquire display 2D canvas context.');
    }
    this._displayCtx = displayContext;

    this._canvas = document.createElement('canvas');
    this._canvas.width = DESIGN_WIDTH;
    this._canvas.height = DESIGN_HEIGHT;

    const context = this._canvas.getContext('2d', { alpha: true });
    if (!context) {
      throw new Error('Unable to acquire 2D canvas context.');
    }
    this._ctx = context;

    this._overlayCanvas = document.createElement('canvas');
    this._overlayCanvas.width = DESIGN_WIDTH;
    this._overlayCanvas.height = DESIGN_HEIGHT;

    const overlayContext = this._overlayCanvas.getContext('2d', { alpha: true });
    if (!overlayContext) {
      throw new Error('Unable to acquire overlay 2D canvas context.');
    }
    this._overlayCtx = overlayContext;

    this._container.appendChild(this._displayCanvas);
    target.innerHTML = '';
    target.appendChild(this._container);

    this._resizeCanvas();
    this._playerY = this._playableCenterY();
    this._scheduleSpawns(0);

    document.addEventListener('keydown', this._boundKeyDown, true);
    document.addEventListener('keyup', this._boundKeyUp, true);
    window.addEventListener('resize', this._boundResize);
    if (this._boundVisualViewportResize && window.visualViewport) {
      window.visualViewport.addEventListener('resize', this._boundVisualViewportResize);
      window.visualViewport.addEventListener('scroll', this._boundVisualViewportResize);
    }
    this._displayCanvas.addEventListener('pointerdown', this._boundPointerDown);
    this._displayCanvas.addEventListener('pointerup', this._boundPointerUp);
    this._displayCanvas.addEventListener('pointercancel', this._boundPointerUp);
    this._displayCanvas.addEventListener('pointermove', this._boundPointerMove);
    this._displayCanvas.addEventListener('pointerleave', this._boundPointerLeave);
    this._displayCanvas.addEventListener('click', this._boundClick);

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

    if (DEBUG_FORCE_ZERO_HEARTS) {
      this._applyDebugHeartsOverride();
      this._openShop();
    }
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
    if (this._boundVisualViewportResize && window.visualViewport) {
      window.visualViewport.removeEventListener('resize', this._boundVisualViewportResize);
      window.visualViewport.removeEventListener('scroll', this._boundVisualViewportResize);
    }
    this._displayCanvas.removeEventListener('pointerdown', this._boundPointerDown);
    this._displayCanvas.removeEventListener('pointerup', this._boundPointerUp);
    this._displayCanvas.removeEventListener('pointercancel', this._boundPointerUp);
    this._displayCanvas.removeEventListener('pointermove', this._boundPointerMove);
    this._displayCanvas.removeEventListener('pointerleave', this._boundPointerLeave);
    this._displayCanvas.removeEventListener('click', this._boundClick);
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
    this._loadImage(bgUrl)
      .then((background) => {
        this._screenBackgroundImage = background;
      })
      .catch((error: unknown) => {
        console.warn('[FollowThePath] Failed to load screen background.', error);
      });

    return Promise.all([
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
      this._loadImage(heartUrl),
      this._loadImage(heartLostUrl),
      this._loadImage(storeBgUrl),
      this._loadImage(levelPassRaccoonUrl),
      this._loadImage(backBtnUrl),
      this._loadImage(muteBtnUrl),
      this._loadImage(soundBtnUrl),
      Promise.all(obstacleUrls.map((url) => this._loadImage(url)))
    ]).then(([character, coin, coinSimple, pizza, shield, menuBackground, speechBubble, buttonBackground, buttonCorner, pauseButton, arrowUp, star, heart, heartLost, storeBackground, levelPassRaccoon, backButton, muteButton, soundButton, obstacles]) => {
      this._assets = {
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
        heart,
        heartLost,
        storeBackground,
        levelPassRaccoon,
        backButton,
        muteButton,
        soundButton,
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
        storeBackgroundMeta: STORE_BG_NATIVE,
        levelPassRaccoonMeta: LEVEL_PASS_RACCOON_NATIVE,
        backButtonMeta: BACK_BTN_NATIVE,
        muteButtonMeta: MUTE_BTN_NATIVE,
        soundButtonMeta: MUTE_BTN_NATIVE,
        speechBubbleMeta: { width: 600, height: 321 }
      };
    });
  }

  private _pushStyleOverride(element: HTMLElement, property: string, value: string): void {
    const previous = element.style.getPropertyValue(property);
    element.style.setProperty(property, value);
    this._styleOverrides.push({ element, property, value: previous });
  }

  private _restoreStyleOverrides(): void {
    for (let i = this._styleOverrides.length - 1; i >= 0; i--) {
      const override = this._styleOverrides[i];
      if (override.value) {
        override.element.style.setProperty(override.property, override.value);
      } else {
        override.element.style.removeProperty(override.property);
      }
    }

    this._styleOverrides = [];
  }

  private _applyFullscreenPageLayout(target: HTMLElement): void {
    this._layoutTargetStyle = target.style.cssText;
    target.style.cssText =
      'width:100%;min-height:0;padding:0;margin:0;overflow:visible;background:transparent;';

    let element: HTMLElement | null = target.parentElement;
    while (element && element !== document.body) {
      this._pushStyleOverride(element, 'max-width', element.style.getPropertyValue('max-width'));
      this._pushStyleOverride(element, 'width', element.style.getPropertyValue('width'));
      this._pushStyleOverride(element, 'padding', element.style.getPropertyValue('padding'));
      this._pushStyleOverride(element, 'margin', element.style.getPropertyValue('margin'));
      element.style.maxWidth = 'none';
      element.style.width = '100%';
      element.style.padding = '0';
      element.style.margin = '0';
      element = element.parentElement;
    }

    this._pushStyleOverride(document.documentElement, 'overflow', document.documentElement.style.overflow);
    this._pushStyleOverride(document.body, 'overflow', document.body.style.overflow);
    this._pushStyleOverride(document.body, 'margin', document.body.style.margin);
    this._pushStyleOverride(document.body, 'background', document.body.style.background);
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.margin = '0';
    document.body.style.background = SCREEN_BACKGROUND.fallbackColor;

    const hideSelectors = [
      '#spSiteHeader',
      '#SuiteNavWrapper',
      '#sp-appBar',
      '[data-automation-id="pageCommandBar"]',
      '[data-automation-id="pageHeader"]'
    ];

    for (let i = 0; i < hideSelectors.length; i++) {
      const node = document.querySelector(hideSelectors[i]) as HTMLElement | null;
      if (node) {
        this._pushStyleOverride(node, 'display', node.style.display);
        node.style.display = 'none';
      }
    }

    const canvasZone = target.closest('[data-automation-id="CanvasZone"]') as HTMLElement | null;
    if (canvasZone) {
      this._pushStyleOverride(canvasZone, 'padding', canvasZone.style.padding);
      canvasZone.style.padding = '0';
    }
  }

  private _restorePageLayout(): void {
    if (!this._fullscreenLayout) {
      return;
    }

    if (this._layoutTarget) {
      this._layoutTarget.style.cssText = this._layoutTargetStyle;
    }

    this._restoreStyleOverrides();
  }

  private _getViewportSize(): { width: number; height: number } {
    const visualViewport = window.visualViewport;
    const width = visualViewport?.width ?? window.innerWidth;
    const height = visualViewport?.height ?? window.innerHeight;

    return {
      width: Math.max(1, width),
      height: Math.max(1, height)
    };
  }

  private _getAvailableSize(): { width: number; height: number } {
    const viewport = this._getViewportSize();

    if (this._fullscreenLayout) {
      return viewport;
    }

    const parent = this._container.parentElement;
    if (parent) {
      const rect = parent.getBoundingClientRect();
      const width = rect.width > 0 ? rect.width : viewport.width;
      const height = rect.height > 0 ? rect.height : viewport.height;

      return {
        width: Math.max(1, width),
        height: Math.max(1, height)
      };
    }

    return viewport;
  }

  private _fitDesignToViewport(
    availableWidth: number,
    availableHeight: number
  ): { width: number; height: number } {
    const viewportAspect = availableWidth / availableHeight;

    if (viewportAspect > DESIGN_ASPECT) {
      return {
        width: availableHeight * DESIGN_ASPECT,
        height: availableHeight
      };
    }

    return {
      width: availableWidth,
      height: availableWidth / DESIGN_ASPECT
    };
  }

  private _resizeCanvas(): void {
    const available = this._getAvailableSize();
    const fitted = this._fitDesignToViewport(available.width, available.height);
    const dpr = window.devicePixelRatio || 1;

    if (this._fullscreenLayout) {
      this._container.style.width = '100dvw';
      this._container.style.height = '100dvh';
      this._container.style.maxWidth = '100vw';
      this._container.style.maxHeight = '100vh';
    } else {
      this._container.style.width = '100%';
      this._container.style.height = available.height + 'px';
    }

    this._devicePixelRatio = dpr;
    this._displayCanvas.width = Math.max(1, Math.round(available.width * dpr));
    this._displayCanvas.height = Math.max(1, Math.round(available.height * dpr));
    this._displayCanvas.style.width = available.width + 'px';
    this._displayCanvas.style.height = available.height + 'px';

    this._gameAreaCss = {
      x: (available.width - fitted.width) / 2,
      y: (available.height - fitted.height) / 2,
      width: fitted.width,
      height: fitted.height
    };

    this._canvas.width = DESIGN_WIDTH;
    this._canvas.height = DESIGN_HEIGHT;
    this._overlayCanvas.width = DESIGN_WIDTH;
    this._overlayCanvas.height = DESIGN_HEIGHT;
    this._clampPlayer();
  }

  private _canvasPointFromClient(clientX: number, clientY: number): { x: number; y: number } {
    const rect = this._displayCanvas.getBoundingClientRect();
    const localX = clientX - rect.left;
    const localY = clientY - rect.top;
    const area = this._gameAreaCss;

    return {
      x: ((localX - area.x) / area.width) * DESIGN_WIDTH,
      y: ((localY - area.y) / area.height) * DESIGN_HEIGHT
    };
  }

  private _isPointInRect(
    x: number,
    y: number,
    rect: { x: number; y: number; width: number; height: number }
  ): boolean {
    return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
  }

  private _resetMenuFocus(): void {
    this._menuFocusIndex = 0;
  }

  private _isMenuNavigationState(): boolean {
    return (
      this._state === 'waiting' ||
      this._state === 'gameover' ||
      this._state === 'paused' ||
      this._state === 'levelComplete' ||
      this._state === 'question' ||
      this._state === 'shop'
    );
  }

  private _getMenuButtonCount(): number {
    if (this._state === 'waiting') {
      return 1;
    }

    if (this._state === 'gameover') {
      return this._getGameOverMenuButtonCount();
    }

    if (this._state === 'paused') {
      if (this._showPauseMainMenuConfirm) {
        return 2;
      }

      return PAUSE_MENU.showMainMenuButton ? 2 : 1;
    }

    if (this._state === 'levelComplete') {
      return this._isFinalLevelCompleteScreen() ? 2 : 1;
    }

    if (this._state === 'question') {
      return this._getCurrentQuestion()?.options.length ?? 0;
    }

    if (this._state === 'shop') {
      return MAIN_SHOP_MENU.buyOptions.length + 1;
    }

    return 0;
  }

  private _getMenuButtonBounds(index: number): { x: number; y: number; width: number; height: number } | undefined {
    if (this._state === 'waiting') {
      return index === 0 ? this._getStartButtonBounds() : undefined;
    }

    if (this._state === 'gameover') {
      return this._getGameOverMenuButtonBounds(index);
    }

    if (this._state === 'paused') {
      if (this._showPauseMainMenuConfirm) {
        return index === 0 || index === 1 ? this._getPauseConfirmButtonBounds(index) : undefined;
      }

      return this._getPauseMenuButtonBounds(index);
    }

    if (this._state === 'levelComplete') {
      const bounds = this._getLevelCompleteButtonBounds(index);
      return bounds.width > 0 && bounds.height > 0 ? bounds : undefined;
    }

    if (this._state === 'question') {
      return this._getAnswerButtonBounds(index);
    }

    if (this._state === 'shop') {
      const buyCount = MAIN_SHOP_MENU.buyOptions.length;

      if (index < buyCount) {
        return this._getShopPriceButtonBounds(MAIN_SHOP_MENU, index);
      }

      if (index === buyCount) {
        return this._getShopFooterButtonBounds(MAIN_SHOP_MENU);
      }

      return undefined;
    }

    return undefined;
  }

  private _getHoveredMenuButtonIndex(): number {
    if (
      this._pointerCanvasX === undefined ||
      this._pointerCanvasY === undefined ||
      !this._isMenuNavigationState()
    ) {
      return -1;
    }

    const count = this._getMenuButtonCount();

    for (let i = 0; i < count; i++) {
      const bounds = this._getMenuButtonBounds(i);

      if (bounds && this._isPointInRect(this._pointerCanvasX, this._pointerCanvasY, bounds)) {
        return i;
      }
    }

    return -1;
  }

  private _getMenuButtonInteraction(index: number): {
    focused: boolean;
    hovered: boolean;
    highlighted: boolean;
  } {
    const focused =
      this._state === 'question' ? this._selectedAnswerIndex === index : this._menuFocusIndex === index;
    const hovered = this._getHoveredMenuButtonIndex() === index;

    return {
      focused,
      hovered,
      highlighted: focused || hovered
    };
  }

  private _activateMenuButton(index: number): void {
    if (this._state === 'waiting') {
      this._tryStartGame();
      return;
    }

    if (this._state === 'gameover') {
      if (this._gameOverShowsShop) {
        const buyCount = GAME_OVER_SHOP_MENU.buyOptions.length;

        if (index < buyCount) {
          this._tryShopPurchase(GAME_OVER_SHOP_MENU, index, () => {
            if (this._dailyHeartsRemaining > 0) {
              this._continueGameAfterLifePurchase();
            }
          });
          return;
        }

        if (index === buyCount) {
          this._goToMainMenu();
        }

        return;
      }

      if (index === 0) {
        this._tryStartGame();
      } else if (index === 1) {
        this._goToMainMenu();
      }

      return;
    }

    if (this._state === 'paused') {
      if (this._showPauseMainMenuConfirm) {
        if (index === 0) {
          this._showPauseMainMenuConfirm = false;
        } else if (index === 1) {
          this._showPauseMainMenuConfirm = false;
          this._goToMainMenu();
        }

        return;
      }

      if (index === 0) {
        this._resumeFromPause();
      } else if (index === 1) {
        this._closeAudioMenu();
        this._showPauseMainMenuConfirm = true;
        this._resetMenuFocus();
      }

      return;
    }

    if (this._state === 'levelComplete') {
      if (this._isFinalLevelCompleteScreen()) {
        if (index === 0) {
          this._playAgainFromLevelComplete();
        } else if (index === 1) {
          this._goToMainMenuFromLevelComplete();
        }
      } else {
        this._proceedFromLevelComplete();
      }

      return;
    }

    if (this._state === 'question' && !this._answerFeedback) {
      this._handleAnswer(index);
    }

    if (this._state === 'shop') {
      const buyCount = MAIN_SHOP_MENU.buyOptions.length;

      if (index < buyCount) {
        this._tryShopPurchase(MAIN_SHOP_MENU, index, () => {
          if (this._dailyHeartsRemaining > 0) {
            this._tryStartGame();
          }
        });
        return;
      }

      if (index === buyCount) {
        this._closeShop();
      }

      return;
    }
  }

  private _handleMenuKeyboard(event: KeyboardEvent): boolean {
    if (!this._isMenuNavigationState()) {
      return false;
    }

    if (this._state === 'question' && this._answerFeedback) {
      return false;
    }

    const count = this._getMenuButtonCount();

    if (count <= 0) {
      return false;
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();

      if (this._state === 'question') {
        this._selectedAnswerIndex = (this._selectedAnswerIndex - 1 + count) % count;
      } else {
        this._menuFocusIndex = (this._menuFocusIndex - 1 + count) % count;
      }

      return true;
    }

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();

      if (this._state === 'question') {
        this._selectedAnswerIndex = (this._selectedAnswerIndex + 1) % count;
      } else {
        this._menuFocusIndex = (this._menuFocusIndex + 1) % count;
      }

      return true;
    }

    if (event.key === 'Tab') {
      event.preventDefault();

      if (this._state === 'question') {
        this._selectedAnswerIndex = event.shiftKey
          ? (this._selectedAnswerIndex - 1 + count) % count
          : (this._selectedAnswerIndex + 1) % count;
      } else {
        this._menuFocusIndex = event.shiftKey
          ? (this._menuFocusIndex - 1 + count) % count
          : (this._menuFocusIndex + 1) % count;
      }

      return true;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const index = this._state === 'question' ? this._selectedAnswerIndex : this._menuFocusIndex;
      this._activateMenuButton(index);
      return true;
    }

    if (this._state === 'question') {
      if (event.key === '1' || event.key === 'Numpad1') {
        event.preventDefault();
        this._handleAnswer(0);
        return true;
      }

      if (event.key === '2' || event.key === 'Numpad2') {
        event.preventDefault();
        this._handleAnswer(1);
        return true;
      }
    }

    return false;
  }

  private _updatePointerPosition(clientX: number, clientY: number): void {
    const point = this._canvasPointFromClient(clientX, clientY);
    this._pointerCanvasX = point.x;
    this._pointerCanvasY = point.y;

    const hoveredIndex = this._getHoveredMenuButtonIndex();

    if (hoveredIndex >= 0) {
      if (this._state === 'question') {
        this._selectedAnswerIndex = hoveredIndex;
      } else {
        this._menuFocusIndex = hoveredIndex;
      }
    }

    if (this._audioMenuOpen) {
      this._audioMenuHoverTarget = null;
      if (this._isPointInRect(point.x, point.y, this._getAudioToggleBounds('music'))) {
        this._audioMenuHoverTarget = 'music';
      } else if (this._isPointInRect(point.x, point.y, this._getAudioToggleBounds('sfx'))) {
        this._audioMenuHoverTarget = 'sfx';
      }
    } else {
      this._audioMenuHoverTarget = null;
    }
  }

  private _clearPointerPosition(): void {
    this._pointerCanvasX = undefined;
    this._pointerCanvasY = undefined;
  }

  private _getButtonHoverScale(timestamp: number, highlighted: boolean): number {
    if (!highlighted) {
      return 1;
    }

    return (
      MENU_BUTTON_HOVER.baseScale +
      Math.sin(timestamp * MENU_BUTTON_HOVER.pulseSpeed) * MENU_BUTTON_HOVER.pulseAmplitude
    );
  }

  private _drawWithButtonHoverTransform(
    bounds: { x: number; y: number; width: number; height: number },
    timestamp: number,
    highlighted: boolean,
    draw: (drawBounds: { x: number; y: number; width: number; height: number }) => void
  ): void {
    if (!highlighted) {
      draw(bounds);
      return;
    }

    const lift = s(MENU_BUTTON_HOVER.liftPx);
    const drawBounds = {
      x: bounds.x,
      y: bounds.y - lift,
      width: bounds.width,
      height: bounds.height
    };
    const centerX = drawBounds.x + drawBounds.width / 2;
    const centerY = drawBounds.y + drawBounds.height / 2;
    const scale = this._getButtonHoverScale(timestamp, true);

    this._ctx.save();
    this._ctx.translate(centerX, centerY);
    this._ctx.scale(scale, scale);
    this._ctx.translate(-centerX, -centerY);
    draw(drawBounds);
    this._ctx.restore();
  }

  private _handleCanvasPress(clientX: number, clientY: number): boolean {
    const now = performance.now();
    if (now - this._lastCanvasPressAt < 300) {
      return false;
    }

    const point = this._canvasPointFromClient(clientX, clientY);

    if (this._handleAudioControlPress(point, now)) {
      return true;
    }

    if (this._state === 'waiting' || this._state === 'shop') {
      if (this._isPointInRect(point.x, point.y, this._getHomeButtonBounds())) {
        this._lastCanvasPressAt = now;
        redirectToHomePage();
        return true;
      }
    }

    if (this._state === 'shop') {
      const buyCount = MAIN_SHOP_MENU.buyOptions.length;

      for (let i = 0; i < buyCount; i++) {
        if (this._isPointInRect(point.x, point.y, this._getShopPriceButtonBounds(MAIN_SHOP_MENU, i))) {
          this._lastCanvasPressAt = now;
          this._tryShopPurchase(MAIN_SHOP_MENU, i, () => {
            if (this._dailyHeartsRemaining > 0) {
              this._tryStartGame();
            }
          });
          return true;
        }
      }

      if (this._isPointInRect(point.x, point.y, this._getShopFooterButtonBounds(MAIN_SHOP_MENU))) {
        this._lastCanvasPressAt = now;
        this._closeShop();
        return true;
      }

      return false;
    }

    if (this._state === 'waiting') {
      if (this._isPointInRect(point.x, point.y, this._getStartButtonBounds())) {
        this._lastCanvasPressAt = now;
        this._tryStartGame();
        return true;
      }
      return false;
    }

    if (this._state === 'gameover') {
      const count = this._getGameOverMenuButtonCount();

      for (let i = 0; i < count; i++) {
        const bounds = this._getGameOverMenuButtonBounds(i);
        if (bounds && this._isPointInRect(point.x, point.y, bounds)) {
          this._lastCanvasPressAt = now;
          this._activateMenuButton(i);
          return true;
        }
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
        this._closeAudioMenu();
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
        const count = this._getMenuButtonCount();

        for (let i = 0; i < count; i++) {
          const bounds = this._getLevelCompleteButtonBounds(i);

          if (bounds.width > 0 && bounds.height > 0 && this._isPointInRect(point.x, point.y, bounds)) {
            this._lastCanvasPressAt = now;
            this._activateMenuButton(i);
            return true;
          }
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

  private _onPointerMove(event: PointerEvent): void {
    this._updatePointerPosition(event.clientX, event.clientY);
  }

  private _onPointerLeave(): void {
    this._clearPointerPosition();
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

    if (this._handleMenuKeyboard(event)) {
      return;
    }

    if (this._isEscapeKey(event)) {
      if (this._audioMenuOpen) {
        event.preventDefault();
        event.stopPropagation();
        this._closeAudioMenu();
        return;
      }

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

    this._startCountdown(false);
  }

  private _togglePause(): void {
    if (this._state === 'playing') {
      this._state = 'paused';
      this._movement = 0;
      this._clearTouchMovement();
      this._showPauseMainMenuConfirm = false;
      this._resetMenuFocus();
      this._cheatCodeBuffer = '';
      this._pauseGameMusic();
      this._displayCanvas.focus();
      return;
    }

    if (this._state === 'paused') {
      this._resumeFromPause();
    }
  }

  private _goToMainMenu(skipProgressSave: boolean = false): void {
    this._closeAudioMenu();
    this._gameOverShowsShop = false;
    if (!skipProgressSave) {
      this._savePlayerProgress(true).catch(() => {
        // Error already logged in _savePlayerProgress.
      });
    }
    this._state = 'waiting';
    this._movement = 0;
    this._clearTouchMovement();
    this._showPauseMainMenuConfirm = false;
    this._resetCheats();
    this._powerShieldRemainingMs = 0;
    this._grantPowerShieldOnResume = false;
    this._resetMenuFocus();
    this._obstacles = [];
    this._coins = [];
    this._shields = [];
    this._explosionParticles = [];
    this._explosionFlashes = [];
    this._confettiParticles = [];
    this._startMenuMusic();
    this._displayCanvas.focus();
  }

  private _applyDebugHeartsOverride(): void {
    if (DEBUG_FORCE_ZERO_HEARTS) {
      this._dailyHeartsRemaining = 0;
    }
  }

  private _tryStartGame(): void {
    this._refreshDailyHearts();

    if (this._dailyHeartsRemaining <= 0) {
      this._openShop();
      return;
    }

    this._startGame();
  }

  private _openShop(): void {
    this._state = 'shop';
    this._resetMenuFocus();
    this._refreshShopCoinBalance();
    this._displayCanvas.focus();
  }

  private _closeShop(): void {
    this._state = 'waiting';
    this._resetMenuFocus();
    this._startMenuMusic();
    this._displayCanvas.focus();
  }

  private _canPurchaseShopOption(menu: ShopMenuConfig, index: number): boolean {
    const option = menu.buyOptions[index];

    if (!option) {
      return false;
    }

    if (this._totalCoins < option.price) {
      return false;
    }

    return this._dailyHeartsRemaining + option.hearts <= MAX_LIVES;
  }

  private _showShopInsufficientCoinsMessage(): void {
    this._shopMessage = SHOP_MENU_LAYOUT.insufficientCoinsMessage;
    this._shopMessageEndsAt =
      performance.now() + SHOP_MENU_LAYOUT.insufficientCoinsMessageDurationMs;
  }

  private _clearShopMessageIfExpired(timestamp: number): void {
    if (this._shopMessage && timestamp >= this._shopMessageEndsAt) {
      this._shopMessage = undefined;
    }
  }

  private _tryShopPurchase(menu: ShopMenuConfig, index: number, onSuccess?: () => void): void {
    const option = menu.buyOptions[index];

    if (!option || this._shopPurchaseSaving) {
      return;
    }

    if (this._totalCoins < option.price) {
      this._showShopInsufficientCoinsMessage();
      return;
    }

    if (this._dailyHeartsRemaining + option.hearts > MAX_LIVES) {
      return;
    }

    const nextHearts = Math.min(MAX_LIVES, this._dailyHeartsRemaining + option.hearts);
    const coinCost = option.price;

    if (DEBUG_FORCE_ZERO_HEARTS) {
      this._totalCoins = Math.max(0, this._totalCoins - coinCost);
      this._applyDebugHeartsOverride();
      return;
    }

    this._shopPurchaseSaving = true;

    this._progressService
      ?.saveShopPurchase({
        heartsRemaining: nextHearts,
        heartsDay: this._dailyHeartsDay,
        coinCost
      })
      .then((newTotalCoin) => {
        this._dailyHeartsRemaining = nextHearts;
        this._totalCoins = newTotalCoin;
        this._shopPurchaseSaving = false;
        onSuccess?.();
      })
      .catch((error: unknown) => {
        this._shopPurchaseSaving = false;
        console.error('[FollowThePath] Failed to save shop purchase.', error);

        const message = error instanceof Error ? error.message : String(error);
        if (message.indexOf('Insufficient coins') >= 0) {
          this._showShopInsufficientCoinsMessage();
        }

        this._progressService
          ?.loadSession()
          .then((session) => {
            this._totalCoins = session.progress.totalCoins;
          })
          .catch(() => {
            // Keep local UI unchanged if refresh fails.
          });
      });
  }

  private _refreshDailyHearts(): void {
    const previousDay = this._dailyHeartsDay;
    const hearts = resolveDailyHearts(this._dailyHeartsRemaining, this._dailyHeartsDay);
    this._dailyHeartsRemaining = hearts.heartsRemaining;
    this._dailyHeartsDay = hearts.heartsDay;
    this._applyDebugHeartsOverride();

    if (!DEBUG_FORCE_ZERO_HEARTS && hearts.heartsDay !== previousDay) {
      this._saveDailyHearts();
    }
  }

  private _loseLife(): void {
    if (!this._isFreePlaySession) {
      this._sessionHeartsLost += 1;
    }

    this._dailyHeartsRemaining = Math.max(0, this._dailyHeartsRemaining - 1);
    this._applyDebugHeartsOverride();
    this._saveDailyHearts();
  }

  private _handleOutOfHearts(): void {
    this._resetMenuFocus();
    this._gameOverShowsShop = true;
    this._state = 'gameover';
    this._movement = 0;
    this._clearTouchMovement();
    this._stopAllMusic();
    this._playSfx(this._gameOverSound);

    this._savePlayerProgress(true)
      .then(() => {
        this._refreshShopCoinBalance();
      })
      .catch(() => {
        // Error already logged in _savePlayerProgress.
      });
  }

  /** Resume the current run after buying lives from the in-game shop (no restart). */
  private _continueGameAfterLifePurchase(): void {
    if (this._dailyHeartsRemaining <= 0) {
      return;
    }

    this._gameOverShowsShop = false;
    this._resetMenuFocus();
    this._closeAudioMenu();
    this._sessionProgressSaved = false;
    this._movement = 0;
    this._clearTouchMovement();
    this._activateGhostMode(performance.now());
    this._startCountdown(false);
  }

  private _refreshShopCoinBalance(): void {
    if (!this._progressService) {
      return;
    }

    this._progressService
      .refreshSpendableCoins()
      .then((totalCoin) => {
        this._totalCoins = totalCoin;
      })
      .catch((error: unknown) => {
        console.error('[FollowThePath] Failed to refresh shop coin balance.', error);
      });
  }

  private _startGame(): void {
    this._closeAudioMenu();
    this._gameOverShowsShop = false;
    this._isFreePlaySession = this._freeModeUnlocked;
    this._sessionHeartsLost = 0;
    this._resetMenuFocus();
    this._score = 0;
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
    this._screenShakeEndsAt = 0;
    this._xpEarnedSlots = this._copyEarnedQuestionSlots(this._xpEarnedSlotsAtLastSave);
    this._xpEarnedSlotsXpBaseline = this._copyEarnedQuestionSlots(this._xpEarnedSlotsAtLastSave);
    this._currentLevel = getResumeLevelFromProgress(this._xpEarnedSlotsAtLastSave, this._savedResumeLevel);
    this._allQuestionsComplete = false;
    this._gameSpeedMultiplier = GAME_SPEED_INITIAL;
    this._answeredInLevel = [false, false, false, false];
    this._activeQuestionInLevelIndex = 0;
    this._obstaclePenalty = 0;
    this._ghostModeEndsAt = 0;
    this._powerShieldRemainingMs = 0;
    this._grantPowerShieldOnResume = false;
    this._questionTimerMs = 0;
    this._shieldTimerMs = 0;
    this._nextShieldSpawnDelayMs = DEBUG_SPAWN_SHIELD_FIRST
      ? 0
      : this._randomBetween(SHIELD_SPAWN_MIN_MS, SHIELD_SPAWN_MAX_MS);
    this._sessionXpByLevel = [0, 0, 0];
    this._sessionProgressSaved = false;
    this._sessionProgressSaving = false;
    this._coinsPersistedScore = 0;
    this._selectedAnswerIndex = 0;
    this._lastTimestamp = 0;
    this._levelStartScore = 0;
    this._spawnClockMs = 0;
    this._scheduleSpawns(0);
    this._startGameMusic();
    this._displayCanvas.focus();
    this._saveAchievementsOnGameStart();

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
  }

  private _getEffectiveSpeedMultiplier(): number {
    const cheatMultiplier = this._cheatTurbo ? CHEAT_TURBO_MULTIPLIER : 1;
    return this._gameSpeedMultiplier * cheatMultiplier;
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
    this._presentFrame();
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
    this._updateQuestionTimer(delta);
    this._updateShieldSpawns(delta);
    this._updatePowerShieldTimer(delta);
    this._checkCollisions(timestamp);
  }

  private _updateQuestionTimer(delta: number): void {
    if (!this._hasRemainingQuestionsInCurrentLevel()) {
      return;
    }

    this._questionTimerMs += delta;

    if (this._questionTimerMs >= QUESTION_INTERVAL_MS) {
      this._questionTimerMs = 0;
      this._showQuestion();
    }
  }

  private _updateShieldSpawns(delta: number): void {
    this._shieldTimerMs += delta;

    if (this._shieldTimerMs < this._nextShieldSpawnDelayMs) {
      return;
    }

    this._shieldTimerMs = 0;
    this._nextShieldSpawnDelayMs = this._randomBetween(SHIELD_SPAWN_MIN_MS, SHIELD_SPAWN_MAX_MS);

    if (!this._trySpawnShieldCollectible()) {
      this._shieldTimerMs = this._nextShieldSpawnDelayMs - SPAWN_RETRY_DELAY_MS;
    }
  }

  private _trySpawnShieldCollectible(): boolean {
    const spawnX = DESIGN_WIDTH + SHIELD_DISPLAY_SIZE;
    const maxY = this._playableTop() + this._playableHeight() - SHIELD_DISPLAY_SIZE;
    const spawnY = this._findNonOverlappingY(
      spawnX,
      SHIELD_DISPLAY_SIZE,
      SHIELD_DISPLAY_SIZE,
      this._playableTop(),
      maxY
    );

    if (spawnY === undefined) {
      return false;
    }

    this._shields.push({
      x: spawnX,
      y: spawnY,
      width: SHIELD_DISPLAY_SIZE,
      height: SHIELD_DISPLAY_SIZE,
      speed: SCROLL_SPEED
    });

    return true;
  }

  private _updatePowerShieldTimer(delta: number): void {
    if (this._powerShieldRemainingMs <= 0) {
      return;
    }

    this._powerShieldRemainingMs = Math.max(0, this._powerShieldRemainingMs - delta);
  }

  private _isPowerShieldActive(): boolean {
    return this._powerShieldRemainingMs > 0;
  }

  private _grantPowerShield(playSound: boolean = true): void {
    this._powerShieldRemainingMs = POWER_SHIELD_DURATION_MS;

    if (playSound) {
      this._playSfx(this._correctSound);
    }
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
    if (DEBUG_AUTO_COLLECT_SHIELDS && this._shields.length > 0) {
      this._shields.splice(0, this._shields.length);
      this._grantPowerShield();
      return;
    }

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

        if (this._isPowerShieldActive()) {
          this._powerShieldRemainingMs = 0;
          this._playSfx(this._correctSound);
          return;
        }

        this._playSfx(this._crushSound);
        this._loseLife();
        this._activateGhostMode(timestamp);

        if (this._dailyHeartsRemaining <= 0) {
          this._handleOutOfHearts();
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
        this._grantPowerShield();
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
    this._loseLife();
  }

  private _triggerWrongAnswerScreenShake(): void {
    this._screenShakeEndsAt = performance.now() + WRONG_ANSWER_SCREEN_SHAKE.durationMs;
  }

  private _getScreenShakeOffset(timestamp: number): { x: number; y: number } {
    if (timestamp >= this._screenShakeEndsAt) {
      return { x: 0, y: 0 };
    }

    const remaining = this._screenShakeEndsAt - timestamp;
    const intensity =
      (remaining / WRONG_ANSWER_SCREEN_SHAKE.durationMs) *
      s(WRONG_ANSWER_SCREEN_SHAKE.amplitude);

    return {
      x: (Math.random() * 2 - 1) * intensity,
      y: (Math.random() * 2 - 1) * intensity
    };
  }

  private _pickUnansweredQuestionIndex(): number | undefined {
    const remaining: number[] = [];

    for (let i = 0; i < QUESTIONS_PER_LEVEL; i++) {
      if (!this._answeredInLevel[i]) {
        remaining.push(i);
      }
    }

    if (remaining.length === 0) {
      return undefined;
    }

    return remaining[this._randomBetween(0, remaining.length - 1)];
  }

  private _getCurrentQuestion(): Question | undefined {
    if (this._allQuestionsComplete) {
      return undefined;
    }

    const globalIndex =
      (this._currentLevel - 1) * QUESTIONS_PER_LEVEL + this._activeQuestionInLevelIndex;
    return this._questions[globalIndex];
  }

  private _isCurrentLevelComplete(): boolean {
    return this._answeredInLevel.every((attempted) => attempted);
  }

  private _showLevelCompleteScreen(): void {
    if (!this._isFreePlaySession) {
      const levelIndex = this._currentLevel - 1;
      const xpEarned = this._getLevelXpRewardForLevel(this._currentLevel);

      if (xpEarned > 0) {
        this._sessionXpByLevel[levelIndex] = xpEarned;
      }

      this._saveAchievements({
        markLevelPassed: this._currentLevel,
        markCompleteTheGame: this._currentLevel >= MAX_QUESTION_LEVEL,
        markFlawlessCampaignComplete:
          this._currentLevel >= MAX_QUESTION_LEVEL && this._sessionHeartsLost === 0,
        coinsCollected: 0
      });
    }

    this._state = 'levelComplete';
    this._movement = 0;
    this._clearTouchMovement();
    this._resetMenuFocus();
    this._pauseGameMusic();
    this._displayCanvas.focus();
  }

  private _getLevelXpRewardForLevel(level: number): number {
    if (this._isFreePlaySession) {
      return 0;
    }

    return Math.max(
      0,
      getLevelXpFromSlots(this._xpEarnedSlots, level) -
        getLevelXpFromSlots(this._xpEarnedSlotsXpBaseline, level)
    );
  }

  private _copyEarnedQuestionSlots(source: boolean[]): boolean[] {
    const copy = createEmptyEarnedQuestionSlots();

    for (let i = 0; i < copy.length; i++) {
      copy[i] = source[i] === true;
    }

    return copy;
  }

  private _getLevelCoinsEarned(): number {
    return Math.max(0, this._score - this._levelStartScore);
  }

  private _getLevelXpEarned(): number {
    const levelIndex = this._currentLevel - 1;
    const sessionXp = this._sessionXpByLevel[levelIndex];

    if (sessionXp > 0) {
      return sessionXp;
    }

    return this._getLevelXpRewardForLevel(this._currentLevel);
  }

  private _isFinalLevelCompleteScreen(): boolean {
    return this._state === 'levelComplete' && this._currentLevel >= MAX_QUESTION_LEVEL;
  }

  private _finalizeLevelThreeCampaignCompletion(): void {
    this._allQuestionsComplete = true;

    if (!this._isFreePlaySession && this._xpEarnedSlots.every((earned) => earned)) {
      this._freeModeUnlocked = true;
    }

    this._savedResumeLevel = 1;
    this._xpEarnedSlotsAtLastSave = this._copyEarnedQuestionSlots(this._xpEarnedSlots);
    this._xpEarnedSlotsXpBaseline = this._copyEarnedQuestionSlots(this._xpEarnedSlotsAtLastSave);
  }

  private _goToMainMenuFromLevelComplete(): void {
    if (!this._isFinalLevelCompleteScreen()) {
      return;
    }

    this._finalizeLevelThreeCampaignCompletion();
    this._savePlayerProgress(true, 1).catch(() => {
      // Error already logged in _savePlayerProgress.
    });
    this._goToMainMenu(true);
  }

  private _playAgainFromLevelComplete(): void {
    if (!this._isFinalLevelCompleteScreen()) {
      return;
    }

    this._finalizeLevelThreeCampaignCompletion();
    this._savePlayerProgress(true, 1).catch(() => {
      // Error already logged in _savePlayerProgress.
    });
    this._refreshDailyHearts();

    if (this._dailyHeartsRemaining <= 0) {
      this._goToMainMenu(true);
      this._openShop();
      return;
    }

    this._startGame();
  }

  private _proceedFromLevelComplete(): void {
    if (this._state !== 'levelComplete' || this._isFinalLevelCompleteScreen()) {
      return;
    }

    if (!this._isFreePlaySession) {
      this._savePlayerProgress(false).catch(() => {
        // Error already logged in _savePlayerProgress.
      });
    }

    this._currentLevel += 1;
    this._answeredInLevel = [false, false, false, false];
    this._levelStartScore = this._score;
    this._obstacles = [];
    this._coins = [];
    this._shields = [];
    this._powerShieldRemainingMs = 0;
    this._grantPowerShieldOnResume = false;
    this._questionTimerMs = 0;
    this._shieldTimerMs = 0;
    this._nextShieldSpawnDelayMs = this._randomBetween(SHIELD_SPAWN_MIN_MS, SHIELD_SPAWN_MAX_MS);
    this._spawnClockMs = 0;
    this._scheduleSpawns(0);

    if (this._isFreePlaySession) {
      this._savePlayerProgress(false).catch(() => {
        // Error already logged in _savePlayerProgress.
      });
    }

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
    this._displayCanvas.focus();
  }

  private _startCountdown(resetQuestionTimer: boolean = true): void {
    this._resetQuestionTimerOnResume = resetQuestionTimer;
    this._state = 'countdown';
    this._movement = 0;
    this._clearTouchMovement();
    this._lastTimestamp = 0;
    this._countdownEndsAt = performance.now() + COUNTDOWN_MS;
    this._displayCanvas.focus();
  }

  private _resumePlaying(): void {
    if (this._pendingPizzaConfetti) {
      this._pendingPizzaConfetti = false;
      this._spawnConfetti();
    }

    if (this._grantPowerShieldOnResume) {
      this._grantPowerShieldOnResume = false;
      this._grantPowerShield(false);
    }

    this._state = 'playing';

    if (this._resetQuestionTimerOnResume) {
      this._questionTimerMs = 0;
    }

    this._resetQuestionTimerOnResume = true;
    this._lastTimestamp = 0;
    this._displayCanvas.focus();
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
    this._menuFocusIndex = 0;
    this._answerFeedback = undefined;
    this._clearAnswerFeedbackTimer();
    this._displayCanvas.focus();
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
    this._answeredInLevel[this._activeQuestionInLevelIndex] = true;

    if (correct) {
      this._awardXpForCorrectAnswer();
      this._obstaclePenalty = 0;
      this._grantPowerShieldOnResume = true;
      this._playSfx(this._correctSound);
      this._saveAchievements({
        incrementCorrectAnswers: 1,
        coinsCollected: 0
      });
    } else {
      this._applyWrongAnswerPenalty();
      this._triggerWrongAnswerScreenShake();
      this._playSfx(this._alarmSound);
    }

    this._clearAnswerFeedbackTimer();
    this._answerFeedbackTimerId = window.setTimeout(() => {
      this._answerFeedbackTimerId = undefined;
      this._answerFeedback = undefined;

      if (!correct && this._dailyHeartsRemaining <= 0) {
        this._handleOutOfHearts();
      } else if (this._isCurrentLevelComplete()) {
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
    if (this._isSfxMuted() || !this._audioUnlocked) {
      return;
    }

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
    this._applyMusicMuteState();

    if (!wasUnlocked) {
      this._removeAudioUnlockListeners();
    }

    this._resumeMusicForCurrentState();
  }

  private _resumeMusicForCurrentState(): void {
    if (this._isMusicMuted()) {
      return;
    }

    if (this._state === 'waiting') {
      this._ensureMenuMusicPlaying();
      return;
    }

    if (this._state === 'playing' && this._gameMusic.paused) {
      this._applyMusicMuteState();
      this._gameMusic.play().catch(() => {
        // Browsers may block audio until the player interacts.
      });
    }
  }

  private _ensureMenuMusicPlaying(): void {
    if (this._state !== 'waiting' || this._isMusicMuted()) {
      return;
    }

    this._stopGameMusic();
    this._applyMusicMuteState();

    if (!this._menuMusic.paused) {
      return;
    }

    this._menuMusic.play().catch(() => {
      // Browsers may block audio until the player interacts.
    });
  }

  private _startMenuMusic(): void {
    this._stopGameMusic();
    this._applyMusicMuteState();

    if (this._isMusicMuted()) {
      return;
    }

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
    this._applyMusicMuteState();

    if (this._isMusicMuted()) {
      return;
    }

    this._gameMusic.currentTime = 0;
    this._gameMusic.play().catch(() => {
      // Browsers may block audio until the player interacts.
    });
  }

  private _pauseGameMusic(): void {
    this._gameMusic.pause();
  }

  private _resumeGameMusic(): void {
    if (this._state !== 'playing' || this._isMusicMuted()) {
      return;
    }

    this._applyMusicMuteState();
    this._gameMusic.play().catch(() => {
      // Browsers may block audio until the player interacts.
    });
  }

  private _isMusicMuted(): boolean {
    return !this._musicEnabled;
  }

  private _isSfxMuted(): boolean {
    return !this._sfxEnabled;
  }

  private _applyMusicMuteState(): void {
    const shouldMute = this._isMusicMuted() || !this._audioUnlocked;
    this._menuMusic.muted = shouldMute;
    this._gameMusic.muted = shouldMute;

    if (!shouldMute) {
      this._menuMusic.volume = MUSIC_VOLUME;
      this._gameMusic.volume = MUSIC_VOLUME;
    }
  }

  private _setMusicEnabled(enabled: boolean): void {
    const wasMusicMuted = this._isMusicMuted();
    this._musicEnabled = enabled;

    if (this._isMusicMuted()) {
      if (!wasMusicMuted) {
        this._menuMusic.pause();
        this._gameMusic.pause();
      }
    }

    this._applyMusicMuteState();

    if (!this._isMusicMuted() && wasMusicMuted) {
      this._resumeMusicForCurrentState();
    }
  }

  private _setSfxEnabled(enabled: boolean): void {
    this._sfxEnabled = enabled;
  }

  private _closeAudioMenu(): void {
    this._audioMenuOpen = false;
    this._audioMenuHoverTarget = null;
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
    this._drawContentLayer(timestamp);
    this._drawOverlayLayer(timestamp);
  }

  private _drawContentLayer(timestamp: number = 0): void {
    const shake = this._getScreenShakeOffset(timestamp);
    this._ctx.save();
    if (shake.x !== 0 || shake.y !== 0) {
      this._ctx.translate(shake.x, shake.y);
    }

    this._ctx.clearRect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);

    if (this._assets) {
      this._drawConfetti();
    }

    if (
      this._state !== 'waiting' &&
      this._state !== 'shop' &&
      this._state !== 'gameover'
    ) {
      this._drawPlayer(timestamp);
      this._drawObstacles();
      this._drawCoins();
      this._drawShields();
      this._drawHud();

      if (this._state === 'playing' && this._mobileControlsEnabled) {
        this._drawMobileControls();
      }

      this._drawExplosions(timestamp);
    }

    this._ctx.restore();
  }

  private _drawOverlayLayer(timestamp: number = 0): void {
    const contentCanvas = this._canvas;
    const contentCtx = this._ctx;
    this._canvas = this._overlayCanvas;
    this._ctx = this._overlayCtx;

    const shake = this._getScreenShakeOffset(timestamp);
    this._ctx.save();
    if (shake.x !== 0 || shake.y !== 0) {
      this._ctx.translate(shake.x, shake.y);
    }

    this._ctx.clearRect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);

    if (this._state === 'waiting') {
      this._displayCanvas.style.cursor =
        this._isHomeButtonHovered() ||
        this._isAudioControlHovered() ||
        this._getHoveredMenuButtonIndex() >= 0
          ? 'pointer'
          : 'default';
      this._drawWelcomeScreen(timestamp);
    } else if (this._state === 'shop') {
      this._displayCanvas.style.cursor =
        this._isHomeButtonHovered() ||
        this._isAudioControlHovered() ||
        this._getHoveredMenuButtonIndex() >= 0
          ? 'pointer'
          : 'default';
      this._drawMainShopScreen(timestamp);
      this._drawHomeButton(timestamp);
    } else if (this._state === 'gameover') {
      this._displayCanvas.style.cursor = this._getHoveredMenuButtonIndex() >= 0 ? 'pointer' : 'default';
      this._drawGameOverScreen(timestamp);
    } else {
      this._displayCanvas.style.cursor = 'default';
    }

    if (this._state === 'paused') {
      this._displayCanvas.style.cursor =
        this._isAudioControlHovered() || this._getHoveredMenuButtonIndex() >= 0 ? 'pointer' : 'default';
      this._drawPauseScreen(timestamp);
    } else if (this._state === 'question') {
      this._displayCanvas.style.cursor = this._getHoveredMenuButtonIndex() >= 0 ? 'pointer' : 'default';
      this._drawQuestionScreen(timestamp);
    } else if (this._state === 'levelIntro') {
      this._drawLevelIntroScreen();
    } else if (this._state === 'levelComplete') {
      this._displayCanvas.style.cursor = this._getHoveredMenuButtonIndex() >= 0 ? 'pointer' : 'default';
      this._drawLevelCompleteScreen(timestamp);
    } else if (this._state === 'countdown') {
      this._drawCountdownOverlay(timestamp);
    }

    if (!this._isMuteButtonVisible() && this._audioMenuOpen) {
      this._closeAudioMenu();
    }

    if (this._isMuteButtonVisible()) {
      this._drawMuteButton(timestamp);
    }

    if (this._audioMenuOpen) {
      this._drawAudioMenuDropdown();
    }

    this._ctx.restore();
    this._canvas = contentCanvas;
    this._ctx = contentCtx;
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

  private _getLevelCompleteButtonBounds(index: number): {
    x: number;
    y: number;
    width: number;
    height: number;
  } {
    const panel = this._getMenuPanelBounds();
    const content = this._getMenuContentBounds(panel);

    if (this._isFinalLevelCompleteScreen()) {
      const buttonWidth = LEVEL_COMPLETE.finalLevelButtonWidth;
      const buttonHeight = LEVEL_COMPLETE.finalLevelButtonHeight;
      const gap = LEVEL_COMPLETE.finalLevelButtonGap;
      const totalWidth = buttonWidth * 2 + gap;
      const startX = panel.x + (panel.width - totalWidth) / 2;
      const y = content.bottom - buttonHeight - LEVEL_COMPLETE.proceedButtonBottomOffset;

      return {
        x: startX + index * (buttonWidth + gap),
        y,
        width: buttonWidth,
        height: buttonHeight
      };
    }

    if (index !== 0) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    return {
      x: panel.x + (panel.width - LEVEL_COMPLETE.proceedButtonWidth) / 2,
      y: content.bottom - LEVEL_COMPLETE.proceedButtonHeight - LEVEL_COMPLETE.proceedButtonBottomOffset,
      width: LEVEL_COMPLETE.proceedButtonWidth,
      height: LEVEL_COMPLETE.proceedButtonHeight
    };
  }

  private _getLevelCompleteDescriptionHeight(): number {
    return this._measureWrappedTextHeight(
      LEVEL_COMPLETE.descriptionText(this._currentLevel),
      s(LEVEL_COMPLETE.titleMaxWidth),
      s(LEVEL_COMPLETE.titleLineHeight),
      menuFont(LEVEL_COMPLETE.titleFontSize)
    );
  }

  private _getLevelCompleteLayout(): {
    centerX: number;
    starY: number;
    titleY: number;
    headlineY: number;
    rewardsY: number;
  } {
    const centerX = DESIGN_WIDTH / 2;
    const button = this._getLevelCompleteButtonBounds(0);
    const stackShift = s(LEVEL_COMPLETE.stackOffsetY);

    const starHeight = s(LEVEL_COMPLETE.starSize);
    const titleHeight = this._getLevelCompleteDescriptionHeight();
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
    const showXpReward = LEVEL_COMPLETE.showXpReward && xpEarned > 0;
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
    if (LEVEL_COMPLETE.showCoinReward && showXpReward) {
      totalWidth += s(LEVEL_COMPLETE.rewardsGapBetweenCoinAndXp);
    }
    if (showXpReward) {
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

    if (LEVEL_COMPLETE.showCoinReward && showXpReward) {
      x += s(LEVEL_COMPLETE.rewardsGapBetweenCoinAndXp);
    }

    if (showXpReward) {
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

  private _drawLevelCompleteScreen(timestamp: number = 0): void {
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
    this._drawWrappedText(
      LEVEL_COMPLETE.descriptionText(this._currentLevel),
      layout.centerX,
      layout.titleY,
      s(LEVEL_COMPLETE.titleMaxWidth),
      s(LEVEL_COMPLETE.titleLineHeight),
      menuFont(LEVEL_COMPLETE.titleFontSize),
      LEVEL_COMPLETE.titleColor,
      'center'
    );

    this._ctx.font = menuFont(LEVEL_COMPLETE.headlineFontSize);
    this._ctx.fillStyle = LEVEL_COMPLETE.headlineColor;
    this._ctx.fillText(LEVEL_COMPLETE.headlineText(this._currentLevel), layout.centerX, layout.headlineY);

    this._drawLevelCompleteRewards(layout.centerX, layout.rewardsY);

    if (this._isFinalLevelCompleteScreen()) {
      this._drawMenuButton(
        this._getLevelCompleteButtonBounds(0),
        LEVEL_COMPLETE.playAgainButtonText,
        LEVEL_COMPLETE.proceedButtonFontSize,
        timestamp,
        this._getMenuButtonInteraction(0)
      );
      this._drawMenuButton(
        this._getLevelCompleteButtonBounds(1),
        LEVEL_COMPLETE.mainMenuButtonText,
        LEVEL_COMPLETE.proceedButtonFontSize,
        timestamp,
        this._getMenuButtonInteraction(1)
      );
    } else {
      this._drawMenuButton(
        this._getLevelCompleteButtonBounds(0),
        LEVEL_COMPLETE.proceedButtonText,
        LEVEL_COMPLETE.proceedButtonFontSize,
        timestamp,
        this._getMenuButtonInteraction(0)
      );
    }

    this._drawLevelCompleteMascot(panel);
  }

  private _drawCountdownOverlay(timestamp: number): void {
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

    if (this._isPowerShieldActive()) {
      this._drawPowerShieldAura(drawX, drawY, timestamp);
    }

    if (SHOW_OBSTACLE_HITBOXES) {
      const hitbox = this._getPlayerHitbox();
      this._ctx.strokeStyle = '#FF0000';
      this._ctx.lineWidth = s(2);
      this._ctx.strokeRect(hitbox.x, hitbox.y, hitbox.width, hitbox.height);
    }
  }

  private _getPowerShieldPulseOpacity(timestamp: number): number {
    const { minOpacity, maxOpacity, periodMs } = POWER_SHIELD_BLINK;
    const midpoint = (minOpacity + maxOpacity) / 2;
    const amplitude = (maxOpacity - minOpacity) / 2;
    const phase = (timestamp / periodMs) * Math.PI * 2;

    return midpoint + amplitude * Math.sin(phase);
  }

  private _drawPowerShieldAura(drawX: number, drawY: number, timestamp: number): void {
    const size = Math.round(SHIELD_DISPLAY_SIZE * 0.72);
    const shieldX = drawX + (this._playerWidth - size) / 2;
    const shieldY = drawY - size * 0.18;
    const remainingMs = this._powerShieldRemainingMs;
    const isWarning = remainingMs <= POWER_SHIELD_BLINK.warningMs;

    this._ctx.save();
    this._ctx.globalAlpha = isWarning ? this._getPowerShieldPulseOpacity(timestamp) : 0.92;

    if (this._assets) {
      this._ctx.drawImage(this._assets.shield, shieldX, shieldY, size, size);
    } else {
      this._ctx.fillStyle = '#4FC3F7';
      this._ctx.beginPath();
      this._ctx.moveTo(shieldX + size / 2, shieldY);
      this._ctx.lineTo(shieldX + size, shieldY + size * 0.55);
      this._ctx.lineTo(shieldX + size / 2, shieldY + size);
      this._ctx.lineTo(shieldX, shieldY + size * 0.55);
      this._ctx.closePath();
      this._ctx.fill();
    }

    this._ctx.restore();
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
      this._drawHeart(heartsStartX + i * (HEART_SIZE + s(8)), hudCenterY - HEART_SIZE / 2, i < this._dailyHeartsRemaining);
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
    const x = DESIGN_WIDTH - s(MOBILE_CONTROLS.marginX) - size;
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
      this._displayCanvas.setPointerCapture(event.pointerId);
      return true;
    }

    if (this._isPointInRect(point.x, point.y, this._getMobileDownButtonBounds())) {
      this._touchMovement = 1;
      this._mobileControlPointerId = event.pointerId;
      this._displayCanvas.setPointerCapture(event.pointerId);
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

  private _drawHeart(x: number, y: number, filled: boolean, size: number = HEART_SIZE): void {
    const image = filled ? this._assets?.heart : this._assets?.heartLost;

    if (image) {
      this._ctx.drawImage(image, x, y, size, size);
      return;
    }

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
    this._totalCoins = record.totalCoins;
    this._freeModeUnlocked = record.freeModeUnlocked;
    this._xpEarnedSlots = createEmptyEarnedQuestionSlots();

    for (let i = 0; i < record.earnedQuestionSlots.length && i < this._xpEarnedSlots.length; i++) {
      this._xpEarnedSlots[i] = record.earnedQuestionSlots[i] === true;
    }

    this._xpEarnedSlotsAtLastSave = this._copyEarnedQuestionSlots(this._xpEarnedSlots);
    this._savedResumeLevel = record.level || 1;

    if (!this._freeModeUnlocked && this._xpEarnedSlots.every((earned) => earned)) {
      this._freeModeUnlocked = true;
    }

    if (DEBUG_FORCE_FREE_MODE) {
      this._freeModeUnlocked = true;
    }

    const hearts = resolveDailyHearts(record.heartsRemaining, record.heartsDay);
    this._dailyHeartsRemaining = hearts.heartsRemaining;
    this._dailyHeartsDay = hearts.heartsDay;
    this._achievementData = record.achievements || createDefaultGameAchievementData();
    this._applyDebugHeartsOverride();
  }

  private _saveDailyHearts(): void {
    if (DEBUG_FORCE_ZERO_HEARTS || this._heartsSaving || !this._progressService) {
      return;
    }

    this._heartsSaving = true;

    this._progressService
      .saveDailyHearts({
        heartsRemaining: this._dailyHeartsRemaining,
        heartsDay: this._dailyHeartsDay
      })
      .then(() => {
        this._heartsSaving = false;
      })
      .catch((error: unknown) => {
        this._heartsSaving = false;
        console.error('[FollowThePath] Failed to save daily hearts to SharePoint.', error);
      });
  }

  private _savePlayerProgress(endOfSession: boolean, resumeLevelOverride?: number): Promise<void> {
    if (this._sessionProgressSaving || !this._progressService) {
      return Promise.resolve();
    }

    if (endOfSession && this._sessionProgressSaved) {
      return Promise.resolve();
    }

    const newHighScore = Math.max(this._bestScore, this._score);
    this._bestScore = newHighScore;
    const coinDelta = Math.max(0, this._score - this._coinsPersistedScore);

    let xpGainedThisSession = 0;
    for (let i = 0; i < this._sessionXpByLevel.length; i++) {
      xpGainedThisSession += this._sessionXpByLevel[i];
    }

    const resumeLevel = resumeLevelOverride ?? this._getSavedResumeLevel();

    this._sessionProgressSaving = true;

    const achievementUpdate = {
      coinsCollected: coinDelta
    };

    return this._progressService
      .saveAfterGame({
        coinsCollected: coinDelta,
        highScore: newHighScore,
        level: resumeLevel,
        xpGainedInLevel: this._getLevelXpEarned(),
        xpGainedThisSession,
        earnedQuestionSlots: [...this._xpEarnedSlots],
        freeModeUnlocked: this._freeModeUnlocked,
        heartsRemaining: this._dailyHeartsRemaining,
        heartsDay: this._dailyHeartsDay,
        achievementUpdate
      })
      .then(() => {
        this._coinsPersistedScore = this._score;
        this._totalCoins += coinDelta;
        this._xpEarnedSlotsAtLastSave = this._copyEarnedQuestionSlots(this._xpEarnedSlots);
        this._xpEarnedSlotsXpBaseline = this._copyEarnedQuestionSlots(this._xpEarnedSlotsAtLastSave);
        this._savedResumeLevel = resumeLevel;
        if (coinDelta > 0) {
          this._achievementData = applyAchievementSessionUpdate(this._achievementData, achievementUpdate);
        }
        this._sessionProgressSaving = false;

        if (endOfSession) {
          this._sessionProgressSaved = true;
          this._sessionXpByLevel = [0, 0, 0];
        }
      })
      .catch((error: unknown) => {
        this._sessionProgressSaving = false;
        console.error('[FollowThePath] Failed to save player progress to SharePoint.', error);
      });
  }

  private _saveAchievementsOnGameStart(): void {
    this._saveAchievements({
      markFirstPlay: !this._achievementData.firstTimePlay,
      incrementPlayCount: true,
      markReplayAfterCompleted: this._freeModeUnlocked,
      isReplayed: this._freeModeUnlocked,
      coinsCollected: 0
    });
  }

  private _saveAchievements(update: {
    markFirstPlay?: boolean;
    incrementPlayCount?: boolean;
    incrementCorrectAnswers?: number;
    markLevelPassed?: number;
    markCompleteTheGame?: boolean;
    isReplayed?: boolean;
    markReplayAfterCompleted?: boolean;
    markFlawlessCampaignComplete?: boolean;
    coinsCollected: number;
  }): void {
    if (!this._progressService) {
      this._achievementData = applyAchievementSessionUpdate(this._achievementData, update);
      return;
    }

    this._progressService
      .saveAchievements(update)
      .then(() => {
        this._achievementData = applyAchievementSessionUpdate(this._achievementData, update);
      })
      .catch((error: unknown) => {
        console.error('[FollowThePath] Failed to save achievement progress.', error);
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

  /** Level written to Game1Data — current run level in free mode, campaign progress otherwise. */
  private _getSavedResumeLevel(): number {
    if (this._freeModeUnlocked) {
      // Free mode: after passing the advanced (level 3) run, next session starts from level 1.
      if (this._state === 'levelComplete' && this._currentLevel >= MAX_QUESTION_LEVEL) {
        return 1;
      }

      return this._currentLevel;
    }

    return this._getProgressLevel();
  }

  private _hasRemainingQuestionsInCurrentLevel(): boolean {
    if (this._allQuestionsComplete) {
      return false;
    }

    return this._answeredInLevel.some((attempted) => !attempted);
  }

  private _awardXpForCorrectAnswer(): void {
    if (this._isFreePlaySession) {
      return;
    }

    const globalIndex = this._getGlobalQuestionIndex();

    if (this._xpEarnedSlots[globalIndex]) {
      return;
    }

    this._xpEarnedSlots[globalIndex] = true;

    if (this._xpEarnedSlots.every((earned) => earned)) {
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

  private _isMenuBackdropVisible(): boolean {
    return (
      this._state === 'waiting' ||
      this._state === 'shop' ||
      this._state === 'gameover' ||
      this._state === 'paused' ||
      this._state === 'levelComplete' ||
      this._state === 'question' ||
      this._state === 'levelIntro' ||
      this._state === 'countdown'
    );
  }

  private _getMenuBackdropOverlayColor(): string {
    if (this._usesConfirmOverlayBackdrop()) {
      return PAUSE_CONFIRM.overlayColor;
    }

    return MENU_BACKDROP.overlayColor;
  }

  private _usesConfirmOverlayBackdrop(): boolean {
    return (
      (this._state === 'paused' && this._showPauseMainMenuConfirm) ||
      this._state === 'shop' ||
      (this._state === 'gameover' && this._gameOverShowsShop)
    );
  }

  private _presentFrame(): void {
    const ctx = this._displayCtx;
    const width = this._displayCanvas.width;
    const height = this._displayCanvas.height;
    const dpr = this._devicePixelRatio;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, width, height);
    this._drawScreenBackground(ctx, width, height);

    const area = this._gameAreaCss;
    const destX = Math.round(area.x * dpr);
    const destY = Math.round(area.y * dpr);
    const destWidth = Math.max(1, Math.round(area.width * dpr));
    const destHeight = Math.max(1, Math.round(area.height * dpr));

    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(this._canvas, 0, 0, DESIGN_WIDTH, DESIGN_HEIGHT, destX, destY, destWidth, destHeight);

    if (this._isMenuBackdropVisible()) {
      this._drawScreenMenuBackdrop(ctx, width, height, dpr);
    }

    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(this._overlayCanvas, 0, 0, DESIGN_WIDTH, DESIGN_HEIGHT, destX, destY, destWidth, destHeight);
  }

  private _drawScreenBackground(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    if (this._screenBackgroundImage) {
      const image = this._screenBackgroundImage;
      const imageWidth = image.naturalWidth || image.width;
      const imageHeight = image.naturalHeight || image.height;
      const scale = Math.max(width / imageWidth, height / imageHeight);
      const drawWidth = imageWidth * scale;
      const drawHeight = imageHeight * scale;
      const drawX = (width - drawWidth) / 2;
      const drawY = (height - drawHeight) / 2;

      ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
      return;
    }

    ctx.fillStyle = SCREEN_BACKGROUND.fallbackColor;
    ctx.fillRect(0, 0, width, height);
  }

  private _drawScreenMenuBackdrop(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    dpr: number
  ): void {
    const overlayColor = this._getMenuBackdropOverlayColor();
    const blurPx = MENU_BACKDROP.blurPx * dpr;

    let scratch = this._displayBackdropScratch;
    if (!scratch) {
      scratch = document.createElement('canvas');
      this._displayBackdropScratch = scratch;
    }

    if (scratch.width !== width || scratch.height !== height) {
      scratch.width = width;
      scratch.height = height;
    }

    const scratchContext = scratch.getContext('2d');
    if (scratchContext) {
      scratchContext.clearRect(0, 0, width, height);
      scratchContext.drawImage(this._displayCanvas, 0, 0);

      ctx.save();
      ctx.filter = 'blur(' + blurPx + 'px)';
      ctx.drawImage(scratch, 0, 0);
      ctx.restore();
    }

    ctx.fillStyle = overlayColor;
    ctx.fillRect(0, 0, width, height);
  }

  private _getMenuPanelBackgroundBounds(panel: {
    x: number;
    y: number;
    width: number;
    height: number;
  }): { x: number; y: number; width: number; height: number } {
    const widthScale = panel.width / MENU_PANEL.width;
    const heightScale = panel.height / MENU_PANEL.height;
    const bgWidth = MENU_BG_NATIVE.width * widthScale;
    const bgHeight = MENU_BG_NATIVE.height * heightScale;

    return {
      x: panel.x + (panel.width - bgWidth) / 2,
      y: panel.y + (panel.height - bgHeight) / 2,
      width: bgWidth,
      height: bgHeight
    };
  }

  private _drawMenuPanelBackground(panel: { x: number; y: number; width: number; height: number }): void {
    if (this._assets?.menuBackground) {
      const background = this._getMenuPanelBackgroundBounds(panel);
      this._ctx.drawImage(
        this._assets.menuBackground,
        background.x,
        background.y,
        background.width,
        background.height
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
    const startButtonBottomOffset =
      'startButtonBottomOffset' in menuLayout
        ? menuLayout.startButtonBottomOffset
        : WELCOME_MENU.standard.startButtonBottomOffset;

    return {
      x: panel.x + (panel.width - buttonWidth) / 2,
      y: content.bottom - menuLayout.startButtonHeight - startButtonBottomOffset,
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
    const bestScoreGap =
      'bestScoreGap' in menuLayout ? menuLayout.bestScoreGap : WELCOME_MENU.standard.bestScoreGap;

    return {
      centerX,
      descriptionBottom,
      bestScoreY: descriptionBottom + bestScoreGap
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
    timestamp: number = 0,
    interaction: { focused: boolean; hovered: boolean; highlighted: boolean } = {
      focused: false,
      hovered: false,
      highlighted: false
    }
  ): void {
    this._drawWithButtonHoverTransform(bounds, timestamp, interaction.highlighted, (drawBounds) => {
      this._drawStyledButton(drawBounds, interaction.focused, undefined, interaction.hovered);
      this._ctx.font = menuFont(fontSize);
      this._ctx.fillStyle = '#FFFFFF';
      this._ctx.textAlign = 'center';
      this._ctx.textBaseline = 'middle';
      this._ctx.fillText(label, drawBounds.x + drawBounds.width / 2, drawBounds.y + drawBounds.height / 2);
    });
  }

  private _drawStyledButton(
    bounds: { x: number; y: number; width: number; height: number },
    selected: boolean = false,
    feedback?: 'correct' | 'wrong',
    hovered: boolean = false
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
      this._ctx.fillStyle = `rgba(245, 124, 0, ${MENU_BUTTON_HOVER.focusOverlayAlpha})`;
      this._ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
    } else if (hovered) {
      this._ctx.fillStyle = `rgba(245, 124, 0, ${MENU_BUTTON_HOVER.hoverOverlayAlpha})`;
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

  private _getHomeButtonBounds(): { x: number; y: number; width: number; height: number } {
    const x = s(HOME_BUTTON.marginX);
    const y = s(HOME_BUTTON.marginY);
    const iconSize = s(HOME_BUTTON.iconSize);
    const gap = s(HOME_BUTTON.gap);
    const pad = s(HOME_BUTTON.hitPadding);

    this._ctx.font = menuFont(HOME_BUTTON.fontSize);
    const textWidth = this._ctx.measureText(HOME_BUTTON.label).width;
    const height = Math.max(iconSize, s(HOME_BUTTON.fontSize) * 1.2);

    return {
      x: x - pad,
      y: y - pad,
      width: iconSize + gap + textWidth + pad * 2,
      height: height + pad * 2
    };
  }

  private _isHomeButtonHovered(): boolean {
    if (
      (this._state !== 'waiting' && this._state !== 'shop') ||
      this._pointerCanvasX === undefined ||
      this._pointerCanvasY === undefined
    ) {
      return false;
    }

    return this._isPointInRect(this._pointerCanvasX, this._pointerCanvasY, this._getHomeButtonBounds());
  }

  private _getWelcomeMuteButtonBounds(): { x: number; y: number; width: number; height: number } {
    const iconSize = s(MUTE_BUTTON.iconSize);
    const pad = s(MUTE_BUTTON.hitPadding);
    const x = DESIGN_WIDTH - s(MUTE_BUTTON.marginX) - iconSize;

    return {
      x: x - pad,
      y: s(MUTE_BUTTON.marginY) - pad,
      width: iconSize + pad * 2,
      height: iconSize + pad * 2
    };
  }

  private _getPauseMuteButtonBounds(): { x: number; y: number; width: number; height: number } {
    const panel = this._getMenuPanelBounds();
    const iconSize = s(PAUSE_MENU.muteButtonSize);
    const pad = s(PAUSE_MENU.muteButtonHitPadding);
    const x = panel.x + panel.width - s(PAUSE_MENU.muteButtonInsetX) - iconSize;
    const y = panel.y + s(PAUSE_MENU.muteButtonInsetY);

    return {
      x: x - pad,
      y: y - pad,
      width: iconSize + pad * 2,
      height: iconSize + pad * 2
    };
  }

  private _getMuteButtonBounds(): { x: number; y: number; width: number; height: number } {
    if (this._state === 'paused') {
      return this._getPauseMuteButtonBounds();
    }

    return this._getWelcomeMuteButtonBounds();
  }

  private _isMuteButtonVisible(): boolean {
    if (this._state === 'paused' && this._showPauseMainMenuConfirm) {
      return false;
    }

    return this._state === 'waiting' || this._state === 'shop' || this._state === 'paused';
  }

  private _isAudioControlHovered(): boolean {
    return this._isMuteButtonHovered() || this._audioMenuHoverTarget !== null;
  }

  private _getAudioMenuPanelHeight(): number {
    return (
      s(AUDIO_MENU.paddingY) * 2 +
      s(AUDIO_MENU.rowHeight) * 2 +
      s(AUDIO_MENU.rowGap)
    );
  }

  private _getAudioMenuDropdownBounds(): { x: number; y: number; width: number; height: number } {
    const muteBounds = this._getMuteButtonBounds();
    const pad =
      this._state === 'paused' ? s(PAUSE_MENU.muteButtonHitPadding) : s(MUTE_BUTTON.hitPadding);
    const iconSize =
      this._state === 'paused' ? s(PAUSE_MENU.muteButtonSize) : s(MUTE_BUTTON.iconSize);
    const anchorRight = muteBounds.x + pad + iconSize;
    const anchorBottom = muteBounds.y + pad + iconSize;
    const width = s(AUDIO_MENU.panelWidth);
    const height = this._getAudioMenuPanelHeight();

    return {
      x: Math.max(s(MUTE_BUTTON.marginX), anchorRight - width),
      y: anchorBottom + s(AUDIO_MENU.gapBelowButton),
      width,
      height
    };
  }

  private _getAudioMenuRowY(rowIndex: number): number {
    const panel = this._getAudioMenuDropdownBounds();
    return panel.y + s(AUDIO_MENU.paddingY) + rowIndex * (s(AUDIO_MENU.rowHeight) + s(AUDIO_MENU.rowGap));
  }

  private _getAudioToggleBounds(target: 'music' | 'sfx'): { x: number; y: number; width: number; height: number } {
    const panel = this._getAudioMenuDropdownBounds();
    const rowIndex = target === 'music' ? 0 : 1;
    const rowY = this._getAudioMenuRowY(rowIndex);
    const toggleWidth = s(AUDIO_MENU.toggle.width);
    const toggleHeight = s(AUDIO_MENU.toggle.height);

    return {
      x: panel.x + panel.width - s(AUDIO_MENU.paddingX) - toggleWidth,
      y: rowY + (s(AUDIO_MENU.rowHeight) - toggleHeight) / 2,
      width: toggleWidth,
      height: toggleHeight
    };
  }

  private _handleAudioControlPress(point: { x: number; y: number }, now: number): boolean {
    if (!this._isMuteButtonVisible()) {
      return false;
    }

    if (this._audioMenuOpen) {
      if (this._isPointInRect(point.x, point.y, this._getAudioToggleBounds('music'))) {
        this._lastCanvasPressAt = now;
        this._setMusicEnabled(!this._musicEnabled);
        return true;
      }

      if (this._isPointInRect(point.x, point.y, this._getAudioToggleBounds('sfx'))) {
        this._lastCanvasPressAt = now;
        this._setSfxEnabled(!this._sfxEnabled);
        return true;
      }

      if (this._isPointInRect(point.x, point.y, this._getMuteButtonBounds())) {
        this._lastCanvasPressAt = now;
        this._closeAudioMenu();
        return true;
      }

      if (this._isPointInRect(point.x, point.y, this._getAudioMenuDropdownBounds())) {
        return true;
      }

      this._closeAudioMenu();
      return false;
    }

    if (this._isPointInRect(point.x, point.y, this._getMuteButtonBounds())) {
      this._lastCanvasPressAt = now;
      this._audioMenuOpen = true;
      this._audioMenuHoverTarget = null;
      return true;
    }

    return false;
  }

  private _isMuteButtonHovered(): boolean {
    if (
      !this._isMuteButtonVisible() ||
      this._pointerCanvasX === undefined ||
      this._pointerCanvasY === undefined
    ) {
      return false;
    }

    return this._isPointInRect(this._pointerCanvasX, this._pointerCanvasY, this._getMuteButtonBounds());
  }

  private _drawMuteButton(timestamp: number): void {
    const bounds = this._getMuteButtonBounds();
    const hovered = this._isMuteButtonHovered();
    const pad =
      this._state === 'paused' ? s(PAUSE_MENU.muteButtonHitPadding) : s(MUTE_BUTTON.hitPadding);
    const iconSize =
      this._state === 'paused' ? s(PAUSE_MENU.muteButtonSize) : s(MUTE_BUTTON.iconSize);
    const image =
      this._musicEnabled && this._sfxEnabled ? this._assets?.soundButton : this._assets?.muteButton;

    this._drawWithButtonHoverTransform(bounds, timestamp, hovered, (drawBounds) => {
      const iconX = drawBounds.x + pad;
      const iconY = drawBounds.y + pad;

      if (image) {
        this._ctx.drawImage(image, iconX, iconY, iconSize, iconSize);
      }
    });
  }

  private _drawAudioToggleSwitch(
    bounds: { x: number; y: number; width: number; height: number },
    enabled: boolean
  ): void {
    const toggle = AUDIO_MENU.toggle;
    const radius = Math.min(s(toggle.borderRadius), bounds.height / 2);

    this._ctx.fillStyle = enabled ? toggle.trackOn : toggle.trackOff;
    this._roundRectPath(bounds.x, bounds.y, bounds.width, bounds.height, radius);
    this._ctx.fill();

    const knobDiameter = s(toggle.knobDiameter);
    const inset = s(toggle.inset);
    const knobY = bounds.y + (bounds.height - knobDiameter) / 2;
    const knobX = enabled
      ? bounds.x + bounds.width - inset - knobDiameter
      : bounds.x + inset;

    this._ctx.fillStyle = toggle.knobColor;
    this._ctx.beginPath();
    this._ctx.arc(knobX + knobDiameter / 2, knobY + knobDiameter / 2, knobDiameter / 2, 0, Math.PI * 2);
    this._ctx.fill();
  }

  private _drawAudioMenuDropdown(): void {
    const panel = this._getAudioMenuDropdownBounds();
    const radius = s(AUDIO_MENU.borderRadius);

    this._ctx.fillStyle = AUDIO_MENU.background;
    this._roundRectPath(panel.x, panel.y, panel.width, panel.height, radius);
    this._ctx.fill();

    this._ctx.strokeStyle = AUDIO_MENU.borderColor;
    this._ctx.lineWidth = s(AUDIO_MENU.borderWidth);
    this._roundRectPath(panel.x, panel.y, panel.width, panel.height, radius);
    this._ctx.stroke();

    const rows: Array<{ target: 'music' | 'sfx'; label: string; enabled: boolean }> = [
      { target: 'music', label: AUDIO_MENU.labelMusic, enabled: this._musicEnabled },
      { target: 'sfx', label: AUDIO_MENU.labelSound, enabled: this._sfxEnabled }
    ];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowY = this._getAudioMenuRowY(i);
      const labelX = panel.x + s(AUDIO_MENU.paddingX);
      const labelY = rowY + s(AUDIO_MENU.rowHeight) / 2;

      this._ctx.fillStyle = AUDIO_MENU.textColor;
      this._ctx.font = menuFont(AUDIO_MENU.fontSize);
      this._ctx.textAlign = 'left';
      this._ctx.textBaseline = 'middle';
      this._ctx.fillText(row.label, labelX, labelY);

      this._drawAudioToggleSwitch(this._getAudioToggleBounds(row.target), row.enabled);
    }
  }

  private _getGameOverMenuButtonCount(): number {
    if (!this._gameOverShowsShop) {
      return 2;
    }

    return GAME_OVER_SHOP_MENU.buyOptions.length + 1;
  }

  private _getGameOverMenuButtonBounds(
    index: number
  ): { x: number; y: number; width: number; height: number } | undefined {
    if (!this._gameOverShowsShop) {
      return index === 0 || index === 1 ? this._getGameOverButtonBounds(index) : undefined;
    }

    const buyCount = GAME_OVER_SHOP_MENU.buyOptions.length;
    if (index < buyCount) {
      return this._getShopPriceButtonBounds(GAME_OVER_SHOP_MENU, index);
    }

    if (index === buyCount) {
      return this._getShopFooterButtonBounds(GAME_OVER_SHOP_MENU);
    }

    return undefined;
  }

  private _getShopRowTopY(menu: ShopMenuConfig, index: number): number {
    const panel = this._getMenuPanelBounds();
    const content = this._getMenuContentBounds(panel);

    return (
      content.y +
      menu.rowsStartOffsetY +
      index * (menu.rowHeight + menu.rowGap)
    );
  }

  private _getShopPriceButtonBounds(
    menu: ShopMenuConfig,
    index: number
  ): { x: number; y: number; width: number; height: number } {
    const panel = this._getMenuPanelBounds();
    const centerX = panel.x + panel.width / 2;
    const rowTop = this._getShopRowTopY(menu, index);
    const rowWidth = s(menu.rowWidth);
    const buttonWidth = s(menu.priceButtonWidth);
    const buttonHeight = s(menu.priceButtonHeight);

    return {
      x: centerX + rowWidth / 2 - buttonWidth,
      y: rowTop + (s(menu.rowHeight) - buttonHeight) / 2,
      width: buttonWidth,
      height: buttonHeight
    };
  }

  private _getShopFooterButtonBounds(menu: ShopMenuConfig): {
    x: number;
    y: number;
    width: number;
    height: number;
  } {
    const panel = this._getMenuPanelBounds();
    const centerX = panel.x + panel.width / 2;

    return {
      x: centerX - menu.footerButtonWidth / 2,
      y: panel.y + panel.height - menu.footerButtonBottomOffset - menu.footerButtonHeight,
      width: menu.footerButtonWidth,
      height: menu.footerButtonHeight
    };
  }

  private _drawShopContent(menu: ShopMenuConfig, timestamp: number): void {
    const panel = this._getMenuPanelBounds();
    const content = this._getMenuContentBounds(panel);
    const centerX = panel.x + panel.width / 2;

    this._ctx.fillStyle = '#FFFFFF';
    this._ctx.textAlign = 'center';
    this._ctx.textBaseline = 'top';
    this._ctx.font = menuFont(menu.titleFontSize);
    this._ctx.fillText(menu.titleText, centerX, content.y + menu.titleOffsetY);

    this._ctx.font = menuFont(menu.subtitleFontSize);
    this._ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    this._ctx.fillText(menu.subtitleText, centerX, content.y + menu.subtitleOffsetY);

    this._clearShopMessageIfExpired(timestamp);
    if (this._shopMessage) {
      this._ctx.font = menuFont(SHOP_MENU_LAYOUT.insufficientCoinsMessageFontSize);
      this._ctx.fillStyle = SHOP_MENU_LAYOUT.insufficientCoinsMessageColor;
      this._ctx.fillText(
        this._shopMessage,
        centerX,
        content.y + SHOP_MENU_LAYOUT.insufficientCoinsMessageOffsetY
      );
    }

    for (let i = 0; i < menu.buyOptions.length; i++) {
      this._drawShopRow(menu, i, timestamp, i);
    }

    this._drawMenuButton(
      this._getShopFooterButtonBounds(menu),
      menu.footerButtonText,
      menu.footerButtonFontSize,
      timestamp,
      this._getMenuButtonInteraction(menu.buyOptions.length)
    );

    this._drawMenuPanelCoinBalance(panel);
  }

  private _drawMenuPanelCoinBalance(panel: { x: number; y: number; width: number; height: number }): void {
    const iconSize = s(SHOP_MENU_LAYOUT.coinBalanceIconSize);
    const marginX = s(SHOP_MENU_LAYOUT.coinBalanceMarginX);
    const marginY = s(SHOP_MENU_LAYOUT.coinBalanceMarginY);
    const gap = s(SHOP_MENU_LAYOUT.coinBalanceGap);
    const coinText = String(this._totalCoins);

    this._ctx.font = menuFont(SHOP_MENU_LAYOUT.coinBalanceFontSize);
    const textWidth = this._ctx.measureText(coinText).width;
    const rightX = panel.x + panel.width - marginX;
    const topY = panel.y + marginY;
    const centerY = topY + iconSize / 2;
    const textX = rightX - textWidth;
    const iconX = textX - gap - iconSize;

    if (!this._drawUiCoinIcon(iconX, topY, iconSize)) {
      this._ctx.fillStyle = '#FFEB3B';
      this._ctx.beginPath();
      this._ctx.arc(iconX + iconSize / 2, centerY, iconSize / 2, 0, Math.PI * 2);
      this._ctx.fill();
    }

    this._ctx.fillStyle = SHOP_MENU_LAYOUT.coinBalanceColor;
    this._ctx.textAlign = 'left';
    this._ctx.textBaseline = 'middle';
    this._ctx.fillText(coinText, textX, centerY);
  }

  private _drawMainShopScreen(timestamp: number): void {
    const panel = this._getMenuPanelBounds();
    this._drawMenuPanelBackground(panel);
    this._drawShopContent(MAIN_SHOP_MENU, timestamp);
  }

  private _drawShopRow(
    menu: ShopMenuConfig,
    index: number,
    timestamp: number,
    interactionIndex: number
  ): void {
    const option = menu.buyOptions[index];
    const panel = this._getMenuPanelBounds();
    const centerX = panel.x + panel.width / 2;
    const rowTop = this._getShopRowTopY(menu, index);
    const rowWidth = s(menu.rowWidth);
    const rowLeft = centerX - rowWidth / 2;
    const rowCenterY = rowTop + s(menu.rowHeight) / 2;
    const heartSize = s(menu.heartIconSize);
    const heartX = rowLeft;
    const heartY = rowCenterY - heartSize / 2;

    this._drawHeart(heartX, heartY, true, heartSize);

    this._ctx.font = menuFont(menu.quantityFontSize);
    this._ctx.fillStyle = '#FFFFFF';
    this._ctx.textAlign = 'left';
    this._ctx.textBaseline = 'middle';
    this._ctx.fillText(
      menu.quantityPrefix + option.hearts,
      heartX + heartSize + s(menu.heartToQuantityGap),
      rowCenterY
    );

    this._drawShopPriceButton(
      menu,
      this._getShopPriceButtonBounds(menu, index),
      option.price,
      timestamp,
      this._getMenuButtonInteraction(interactionIndex),
      this._canPurchaseShopOption(menu, index)
    );
  }

  private _drawShopPriceButton(
    menu: ShopMenuConfig,
    bounds: { x: number; y: number; width: number; height: number },
    price: number,
    timestamp: number,
    interaction: { focused: boolean; hovered: boolean; highlighted: boolean },
    enabled: boolean
  ): void {
    this._drawWithButtonHoverTransform(bounds, timestamp, interaction.highlighted && enabled, (drawBounds) => {
      this._ctx.save();
      this._ctx.globalAlpha = enabled ? 1 : menu.priceButtonDisabledAlpha;

      if (this._assets?.storeBackground) {
        this._ctx.drawImage(
          this._assets.storeBackground,
          drawBounds.x,
          drawBounds.y,
          drawBounds.width,
          drawBounds.height
        );
      } else {
        this._ctx.fillStyle = menu.priceButtonColor;
        this._ctx.fillRect(drawBounds.x, drawBounds.y, drawBounds.width, drawBounds.height);
      }

      if (interaction.highlighted && enabled) {
        this._ctx.fillStyle = `rgba(255, 255, 255, ${MENU_BUTTON_HOVER.hoverOverlayAlpha})`;
        this._ctx.fillRect(drawBounds.x, drawBounds.y, drawBounds.width, drawBounds.height);
      }

      const coinSize = s(menu.priceCoinIconSize);
      const priceText = String(price);
      this._ctx.font = menuFont(menu.priceFontSize);
      const textWidth = this._ctx.measureText(priceText).width;
      const gap = s(menu.priceCoinGap);
      const contentWidth = coinSize + gap + textWidth;
      let contentX = drawBounds.x + (drawBounds.width - contentWidth) / 2;
      const centerY = drawBounds.y + drawBounds.height / 2;

      if (!this._drawUiCoinIcon(contentX, centerY - coinSize / 2, coinSize)) {
        this._ctx.fillStyle = '#FFEB3B';
        this._ctx.beginPath();
        this._ctx.arc(contentX + coinSize / 2, centerY, coinSize / 2, 0, Math.PI * 2);
        this._ctx.fill();
      }

      contentX += coinSize + gap;
      this._ctx.fillStyle = '#FFFFFF';
      this._ctx.textAlign = 'left';
      this._ctx.textBaseline = 'middle';
      this._ctx.fillText(priceText, contentX, centerY);
      this._ctx.restore();
    });
  }

  private _drawHomeButton(timestamp: number): void {
    const bounds = this._getHomeButtonBounds();
    const hovered = this._isHomeButtonHovered();
    const pad = s(HOME_BUTTON.hitPadding);
    const iconSize = s(HOME_BUTTON.iconSize);
    const gap = s(HOME_BUTTON.gap);

    this._drawWithButtonHoverTransform(bounds, timestamp, hovered, (drawBounds) => {
      const iconX = drawBounds.x + pad;
      const iconY = drawBounds.y + (drawBounds.height - iconSize) / 2;

      if (this._assets?.backButton) {
        this._ctx.drawImage(this._assets.backButton, iconX, iconY, iconSize, iconSize);
      }

      this._ctx.font = menuFont(HOME_BUTTON.fontSize);
      this._ctx.fillStyle = '#FFFFFF';
      this._ctx.textAlign = 'left';
      this._ctx.textBaseline = 'middle';
      this._ctx.fillText(
        HOME_BUTTON.label,
        iconX + iconSize + gap,
        drawBounds.y + drawBounds.height / 2
      );
    });
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

  private _drawHeartRefillCounter(
    panel: { x: number; y: number; width: number; height: number },
    contentY: number
  ): void {
    const cfg = WELCOME_MENU.heartRefillCounter;
    const heartSize = s(cfg.heartIconSize);
    const pillHeight = s(cfg.height);
    const paddingX = s(cfg.paddingX);
    const gapAfterHeart = s(cfg.gapAfterHeart);
    const gapAfterLabel = s(cfg.gapAfterLabel);
    const marginX = s(cfg.marginX);
    const timerText = formatCountdownHms(getMsUntilNextDailyHeartReset());

    this._ctx.font = menuFont(cfg.labelFontSize);
    const labelWidth = this._ctx.measureText(cfg.labelText).width;

    this._ctx.font = 'bold ' + menuFont(cfg.timerFontSize);
    const timerWidth = this._ctx.measureText(timerText).width;

    const contentWidth = heartSize + gapAfterHeart + labelWidth + gapAfterLabel + timerWidth;
    const pillWidth = contentWidth + paddingX * 2;
    const pillX = panel.x + panel.width - marginX - pillWidth;
    const y = contentY + s(cfg.offsetY);

    this._ctx.fillStyle = cfg.backgroundColor;
    this._ctx.strokeStyle = cfg.borderColor;
    this._ctx.lineWidth = s(cfg.borderWidth);
    this._roundRectPath(pillX, y, pillWidth, pillHeight, pillHeight / 2);
    this._ctx.fill();
    this._ctx.stroke();

    let x = pillX + paddingX;
    const centerY = y + pillHeight / 2;

    this._drawHeart(x, centerY - heartSize / 2, true, heartSize);
    x += heartSize + gapAfterHeart;

    this._ctx.textAlign = 'left';
    this._ctx.textBaseline = 'middle';
    this._ctx.font = menuFont(cfg.labelFontSize);
    this._ctx.fillStyle = cfg.labelColor;
    this._ctx.fillText(cfg.labelText, x, centerY);
    x += labelWidth + gapAfterLabel;

    this._ctx.font = 'bold ' + menuFont(cfg.timerFontSize);
    this._ctx.fillStyle = cfg.timerColor;
    this._ctx.fillText(timerText, x, centerY);
  }

  private _drawWelcomeScreen(timestamp: number): void {
    const panel = this._getWelcomePanelBounds();
    const content = this._getMenuContentBounds(panel);
    const layout = this._getWelcomeContentLayout();
    const menuLayout = getWelcomeMenuLayout(this._freeModeUnlocked);

    this._drawMenuPanelBackground(panel);

    this._drawHeartRefillCounter(panel, content.y);

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

    this._ctx.font = menuFont(WELCOME_MENU.bestScoreFontSize);
    this._ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    this._ctx.textAlign = 'center';
    this._ctx.fillText('Best score: ' + this._bestScore, layout.centerX, layout.bestScoreY);

    const button = this._getStartButtonBounds();
    this._drawMenuButton(
      button,
      'START GAME',
      WELCOME_MENU.startButtonFontSize,
      timestamp,
      this._getMenuButtonInteraction(0)
    );

    this._drawArrowKeyHints(layout.centerX, content.bottom - menuLayout.arrowHintsBottomOffset, {
      instructionText: 'Use arrow keys to navigate · Enter to select'
    });
    this._drawWelcomeMascot(timestamp);
    if (this._state !== 'shop') {
      this._drawHomeButton(timestamp);
    }
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

  private _drawGameOverScreen(timestamp: number = 0): void {
    const panel = this._getMenuPanelBounds();
    this._drawMenuPanelBackground(panel);

    if (this._gameOverShowsShop) {
      this._drawShopContent(GAME_OVER_SHOP_MENU, timestamp);
      return;
    }

    const content = this._getMenuContentBounds(panel);
    const centerX = panel.x + panel.width / 2;

    this._ctx.fillStyle = '#FFFFFF';
    this._ctx.textAlign = 'center';
    this._ctx.textBaseline = 'top';
    this._ctx.font = menuFont(GAME_OVER_MENU.titleFontSize);
    const titleY = content.y + GAME_OVER_MENU.titleOffsetY;
    this._ctx.fillText('GAME OVER', centerX, titleY);

    const scoreAnchorY = this._getGameOverButtonBounds(0).y;
    const bestScoreY =
      scoreAnchorY -
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

    this._drawMenuButton(
      this._getGameOverButtonBounds(0),
      'TRY AGAIN',
      GAME_OVER_MENU.buttonFontSize,
      timestamp,
      this._getMenuButtonInteraction(0)
    );
    this._drawMenuButton(
      this._getGameOverButtonBounds(1),
      'MAIN MENU',
      GAME_OVER_MENU.buttonFontSize,
      timestamp,
      this._getMenuButtonInteraction(1)
    );

    this._drawMenuPanelCoinBalance(panel);
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

  private _drawPauseScreen(timestamp: number = 0): void {
    if (this._showPauseMainMenuConfirm) {
      this._drawPauseConfirmDialog(timestamp);
      return;
    }

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

    this._drawMenuButton(
      layout.resumeButton,
      PAUSE_MENU.resumeButtonText,
      PAUSE_MENU.buttonFontSize,
      timestamp,
      this._getMenuButtonInteraction(0)
    );

    if (PAUSE_MENU.showMainMenuButton) {
      this._drawMenuButton(
        layout.mainMenuButton,
        PAUSE_MENU.mainMenuButtonText,
        PAUSE_MENU.buttonFontSize,
        timestamp,
        this._getMenuButtonInteraction(1)
      );
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

  private _drawPauseConfirmDialog(timestamp: number = 0): void {
    const panel = this._getPauseConfirmPanelBounds();
    this._drawMenuPanelBackground(panel);

    const centerX = panel.x + panel.width / 2;
    this._ctx.fillStyle = '#FFFFFF';
    this._ctx.textAlign = 'center';
    this._ctx.textBaseline = 'top';
    this._ctx.font = menuFont(PAUSE_CONFIRM.messageFontSize);
    this._ctx.fillText('RETURN TO MAIN MENU?', centerX, panel.y + PAUSE_CONFIRM.messageOffsetY);

    this._drawMenuButton(
      this._getPauseConfirmButtonBounds(0),
      'NO',
      PAUSE_CONFIRM.buttonFontSize,
      timestamp,
      this._getMenuButtonInteraction(0)
    );
    this._drawMenuButton(
      this._getPauseConfirmButtonBounds(1),
      'YES',
      PAUSE_CONFIRM.buttonFontSize,
      timestamp,
      this._getMenuButtonInteraction(1)
    );
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
    interaction: { focused: boolean; hovered: boolean; highlighted: boolean },
    timestamp: number,
    feedback?: 'correct' | 'wrong'
  ): void {
    this._drawWithButtonHoverTransform(bounds, timestamp, interaction.highlighted && !feedback, (drawBounds) => {
      this._drawStyledButton(drawBounds, interaction.focused, feedback, interaction.hovered);
      this._drawWrappedTextInRect(
        label,
        drawBounds,
        menuFont(QUESTION_POPUP.answerButtonFontSize),
        '#FFFFFF',
        QUESTION_POPUP.answerButtonLineHeight,
        QUESTION_POPUP.answerButtonPaddingX
      );
    });
  }

  private _drawQuestionScreen(timestamp: number = 0): void {
    const panel = this._getQuestionPanelBounds();
    const content = this._getMenuContentBounds(panel);
    const centerX = panel.x + panel.width / 2;
    const question = this._getCurrentQuestion();

    if (!question) {
      return;
    }

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
        this._getMenuButtonInteraction(i),
        timestamp,
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
