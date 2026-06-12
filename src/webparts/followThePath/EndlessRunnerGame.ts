/* eslint-disable @typescript-eslint/no-var-requires */
const bgUrl: string = require('./assets/img_bg.png');
const characterUrl: string = require('./assets/img_character.png');
const coinUrl: string = require('./assets/img_coin.png');
const obstacleUrls: string[] = [
  require('./assets/a.png'),
  require('./assets/b.png'),
  require('./assets/c.png'),
  require('./assets/d.png'),
  require('./assets/e.png')
];

type GameState = 'waiting' | 'playing' | 'paused' | 'gameover';

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

interface LoadedAssets {
  background: HTMLImageElement;
  character: HTMLImageElement;
  coin: HTMLImageElement;
  obstacles: HTMLImageElement[];
  obstacleMeta: SpriteMeta[];
  characterMeta: SpriteMeta;
  coinMeta: SpriteMeta;
}

const PLAYER_X = 50;
const PLAYER_HEIGHT = 84;
const CANVAS_HEIGHT = 450;
const PLAYER_SPEED = 5;
const SCROLL_SPEED = 4;
const COIN_DISPLAY_SIZE = 104;
const MAX_LIVES = 3;
const OBSTACLE_SCALE_MIN = 42;
const OBSTACLE_SCALE_MAX = 58;
const HUD_HEIGHT = 52;
const HUD_PADDING = 16;
const PAUSE_BTN_SIZE = 40;
const HEART_SIZE = 22;
const HUD_COIN_SIZE = 24;
const SHOW_OBSTACLE_HITBOXES = true;
const BEST_SCORE_STORAGE_KEY = 'followThePathBestScore';
const WELCOME_ACCENT = '#F57C00';
const WELCOME_PANEL_FILL = 'rgba(28, 32, 42, 0.9)';

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
  w: true,
  W: true,
  s: true,
  S: true,
  ' ': true,
  p: true,
  P: true
};

/**
 * Self-contained 2D endless runner that mounts a canvas inside a target element.
 * Designed for SPFx web parts: call `new EndlessRunnerGame(domElement)` from `render()`.
 */
export class EndlessRunnerGame {
  private readonly _container: HTMLDivElement;
  private readonly _canvas: HTMLCanvasElement;
  private readonly _ctx: CanvasRenderingContext2D;
  private readonly _boundKeyDown: (event: KeyboardEvent) => void;
  private readonly _boundKeyUp: (event: KeyboardEvent) => void;
  private readonly _boundResize: () => void;
  private readonly _boundGameLoop: (timestamp: number) => void;
  private readonly _boundMouseDown: (event: MouseEvent) => void;
  private readonly _playerWidth: number;

  private _animationFrameId: number = 0;
  private _lastTimestamp: number = 0;
  private _state: GameState = 'waiting';
  private _score: number = 0;
  private _lives: number = MAX_LIVES;
  private _playerY: number = 0;
  private _movement: number = 0;
  private _obstacles: ObstacleEntity[] = [];
  private _coins: CoinEntity[] = [];
  private _nextObstacleAt: number = 0;
  private _nextCoinAt: number = 0;
  private _assets: LoadedAssets | undefined;
  private _bestScore: number = 0;
  private _disposed: boolean = false;

  constructor(target: HTMLElement) {
    this._bestScore = this._loadBestScore();
    this._playerWidth = Math.round(
      PLAYER_HEIGHT * (CHARACTER_SPRITE_NATIVE.width / CHARACTER_SPRITE_NATIVE.height)
    );

    this._boundKeyDown = this._onKeyDown.bind(this);
    this._boundKeyUp = this._onKeyUp.bind(this);
    this._boundResize = this._resizeCanvas.bind(this);
    this._boundGameLoop = this._gameLoop.bind(this);
    this._boundMouseDown = this._onMouseDown.bind(this);

    this._container = document.createElement('div');
    this._container.style.cssText = 'position:relative;width:100%;height:' + CANVAS_HEIGHT + 'px;overflow:hidden;';

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

    this._container.appendChild(this._canvas);
    target.innerHTML = '';
    target.appendChild(this._container);

    this._resizeCanvas();
    this._playerY = this._playableCenterY();
    this._scheduleSpawns(0);

    window.addEventListener('keydown', this._boundKeyDown);
    window.addEventListener('keyup', this._boundKeyUp);
    window.addEventListener('resize', this._boundResize);
    this._canvas.addEventListener('mousedown', this._boundMouseDown);

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
      Promise.all(obstacleUrls.map((url) => this._loadImage(url)))
    ]).then(([background, character, coin, obstacles]) => {
      this._assets = {
        background,
        character,
        coin,
        obstacles,
        obstacleMeta: OBSTACLE_NATIVE,
        characterMeta: CHARACTER_SPRITE_NATIVE,
        coinMeta: { width: 172, height: 171 }
      };
    });
  }

  private _resizeCanvas(): void {
    const width = this._container.clientWidth || this._container.parentElement?.clientWidth || 640;
    this._canvas.width = width;
    this._canvas.height = CANVAS_HEIGHT;
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
      return;
    }

    if (this._state === 'paused') {
      this._state = 'playing';
      this._lastTimestamp = 0;
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
    this._lastTimestamp = 0;
    this._scheduleSpawns(performance.now());
    this._canvas.focus();
  }

  private _scheduleSpawns(now: number): void {
    this._nextObstacleAt = now + this._randomBetween(800, 1800);
    this._nextCoinAt = now + this._randomBetween(500, 1200);
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
      const scale = this._randomBetween(OBSTACLE_SCALE_MIN, OBSTACLE_SCALE_MAX) / 100;
      const height = Math.round(native.height * scale);
      const width = Math.round(native.width * scale);
      const maxY = this._playableTop() + this._playableHeight() - height;

      this._obstacles.push({
        x: this._canvas.width + width,
        y: this._randomBetween(this._playableTop(), maxY),
        width,
        height,
        speed: SCROLL_SPEED + this._randomBetween(0, 2),
        spriteIndex
      });

      this._nextObstacleAt = timestamp + this._randomBetween(800, 1800);
    }

    if (timestamp >= this._nextCoinAt) {
      const maxY = this._playableTop() + this._playableHeight() - COIN_DISPLAY_SIZE;

      this._coins.push({
        x: this._canvas.width + COIN_DISPLAY_SIZE,
        y: this._randomBetween(this._playableTop(), maxY),
        width: COIN_DISPLAY_SIZE,
        height: COIN_DISPLAY_SIZE,
        speed: SCROLL_SPEED
      });

      this._nextCoinAt = timestamp + this._randomBetween(500, 1200);
    }
  }

  private _moveEntities(frameScale: number): void {
    for (let i = 0; i < this._obstacles.length; i++) {
      this._obstacles[i].x -= this._obstacles[i].speed * frameScale;
    }

    for (let j = 0; j < this._coins.length; j++) {
      this._coins[j].x -= this._coins[j].speed * frameScale;
    }
  }

  private _cleanupEntities(): void {
    this._obstacles = this._obstacles.filter((obstacle) => obstacle.x + obstacle.width > 0);
    this._coins = this._coins.filter((coin) => coin.x + coin.width > 0);
  }

  private _getPlayerHitbox(): { x: number; y: number; width: number; height: number } {
    const scale = PLAYER_HEIGHT / CHARACTER_SPRITE_NATIVE.height;
    return {
      x: PLAYER_X + CHARACTER_HITBOX_OFFSET_X_NATIVE * scale,
      y: this._playerY,
      width: CHARACTER_HITBOX_NATIVE.width * scale,
      height: CHARACTER_HITBOX_NATIVE.height * scale
    };
  }

  private _checkCollisions(): void {
    const hitbox = this._getPlayerHitbox();
    const playerLeft = hitbox.x;
    const playerRight = hitbox.x + hitbox.width;
    const playerTop = hitbox.y;
    const playerBottom = hitbox.y + hitbox.height;

    for (let i = 0; i < this._obstacles.length; i++) {
      const obstacle = this._obstacles[i];
      if (
        playerRight > obstacle.x &&
        playerLeft < obstacle.x + obstacle.width &&
        playerBottom > obstacle.y &&
        playerTop < obstacle.y + obstacle.height
      ) {
        this._obstacles.splice(i, 1);
        this._lives--;

        if (this._lives <= 0) {
          this._state = 'gameover';
          this._saveBestScore();
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
      const hitRadius = coin.width / 2;

      if (dx * dx + dy * dy < hitRadius * hitRadius) {
        this._score++;
        this._coins.splice(j, 1);
      }
    }
  }

  private _draw(): void {
    const width = this._canvas.width;
    const height = this._canvas.height;

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
      this._drawHud();
    }

    if (this._state === 'paused') {
      this._drawOverlay('Paused', 'Press P or click the pause button to resume');
    } else if (this._state === 'gameover') {
      this._drawOverlay('Game Over', 'Score: ' + this._score + ' — Press SPACE to retry');
    }
  }

  private _drawBackground(): void {
    if (!this._assets) {
      return;
    }

    const image = this._assets.background;
    const canvasWidth = this._canvas.width;
    const canvasHeight = this._canvas.height;
    const imageRatio = image.width / image.height;
    const canvasRatio = canvasWidth / canvasHeight;

    let sourceX = 0;
    let sourceY = 0;
    let sourceWidth = image.width;
    let sourceHeight = image.height;

    if (imageRatio > canvasRatio) {
      sourceWidth = image.height * canvasRatio;
      sourceX = (image.width - sourceWidth) / 2;
    } else {
      sourceHeight = image.width / canvasRatio;
      sourceY = (image.height - sourceHeight) / 2;
    }

    this._ctx.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      canvasWidth,
      canvasHeight
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
    this._ctx.lineWidth = 2;
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
        this._ctx.strokeStyle = '#39FF14';
        this._ctx.lineWidth = 2;
        this._ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
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

  private _applyHudTextShadow(): void {
    this._ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    this._ctx.shadowBlur = 4;
    this._ctx.shadowOffsetX = 1;
    this._ctx.shadowOffsetY = 1;
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
    this._ctx.font = 'bold 18px Segoe UI, Tahoma, sans-serif';
    this._ctx.textAlign = 'left';
    this._ctx.textBaseline = 'middle';

    const livesLabel = 'LIVES LEFT:';
    this._ctx.fillText(livesLabel, HUD_PADDING, hudCenterY);

    const heartsStartX = HUD_PADDING + this._ctx.measureText(livesLabel).width + 10;
    for (let i = 0; i < MAX_LIVES; i++) {
      this._drawHeart(heartsStartX + i * (HEART_SIZE + 8), hudCenterY - HEART_SIZE / 2, i < this._lives);
    }

    this._drawScoreHud(hudCenterY);
    this._drawPauseButton();
    this._clearHudTextShadow();
  }

  private _drawScoreHud(centerY: number): void {
    const pauseBounds = this._getPauseButtonBounds();
    const scoreAreaRight = pauseBounds.x - 14;
    const scoreLabel = 'SCORE:';
    const scoreValue = String(this._score);

    this._ctx.font = 'bold 18px Segoe UI, Tahoma, sans-serif';
    const labelWidth = this._ctx.measureText(scoreLabel).width;
    const valueWidth = this._ctx.measureText(scoreValue).width;
    const coinGap = 6;
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
      x: this._canvas.width - HUD_PADDING - PAUSE_BTN_SIZE,
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
    this._ctx.lineWidth = 2;
    this._ctx.stroke();

    this._ctx.fillStyle = '#FFFFFF';
    const barWidth = 4;
    const barHeight = 16;
    const barGap = 5;
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
      ctx.lineWidth = 2;
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

  private _getWelcomePanelBounds(): { x: number; y: number; width: number; height: number } {
    const width = this._canvas.width;
    const height = this._canvas.height;
    const panelWidth = Math.min(width - 48, 620);
    const panelHeight = Math.min(height - 40, 310);

    return {
      x: (width - panelWidth) / 2,
      y: Math.max(12, (height - panelHeight) / 2 - 8),
      width: panelWidth,
      height: panelHeight
    };
  }

  private _getStartButtonBounds(): { x: number; y: number; width: number; height: number } {
    const panel = this._getWelcomePanelBounds();
    const buttonWidth = Math.min(220, panel.width - 80);
    const buttonHeight = 44;

    return {
      x: panel.x + (panel.width - buttonWidth) / 2,
      y: panel.y + panel.height - 98,
      width: buttonWidth,
      height: buttonHeight
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
    ctx.lineWidth = 2;

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
    const keySize = 28;
    const gap = 8;
    const totalWidth = keySize * 2 + gap;
    const startX = centerX - totalWidth / 2;

    for (let i = 0; i < 2; i++) {
      const keyX = startX + i * (keySize + gap);
      this._roundRectPath(keyX, y, keySize, keySize, 6);
      this._ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      this._ctx.fill();
      this._ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      this._ctx.lineWidth = 1;
      this._ctx.stroke();

      this._ctx.fillStyle = '#FFFFFF';
      this._ctx.beginPath();
      if (i === 0) {
        this._ctx.moveTo(keyX + keySize / 2, y + 7);
        this._ctx.lineTo(keyX + keySize / 2 - 7, y + 18);
        this._ctx.lineTo(keyX + keySize / 2 + 7, y + 18);
      } else {
        this._ctx.moveTo(keyX + keySize / 2, y + 21);
        this._ctx.lineTo(keyX + keySize / 2 - 7, y + 10);
        this._ctx.lineTo(keyX + keySize / 2 + 7, y + 10);
      }
      this._ctx.closePath();
      this._ctx.fill();
    }

    this._ctx.font = '13px Segoe UI, Tahoma, sans-serif';
    this._ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    this._ctx.textAlign = 'center';
    this._ctx.textBaseline = 'top';
    this._ctx.fillText('Use arrow keys to control the spaceship', centerX, y + keySize + 8);
  }

  private _drawSpeechBubble(x: number, y: number, width: number): void {
    const height = 58;
    const tailHeight = 10;

    this._roundRectPath(x, y, width, height, 10);
    this._ctx.fillStyle = '#1E88E5';
    this._ctx.fill();

    this._ctx.beginPath();
    this._ctx.moveTo(x + 24, y + height);
    this._ctx.lineTo(x + 36, y + height + tailHeight);
    this._ctx.lineTo(x + 48, y + height);
    this._ctx.closePath();
    this._ctx.fill();

    this._ctx.font = '11px Segoe UI, Tahoma, sans-serif';
    this._ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    this._ctx.textAlign = 'left';
    this._ctx.textBaseline = 'top';
    this._ctx.fillText('To be', x + 12, y + 10);

    this._ctx.font = 'bold 14px Segoe UI, Tahoma, sans-serif';
    this._ctx.fillText('ACCOUNTABLE', x + 12, y + 24);

    this._ctx.font = '10px Segoe UI, Tahoma, sans-serif';
    this._ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    this._ctx.fillText('Own your actions, understand your impact', x + 12, y + 42);
  }

  private _drawWelcomeMascot(): void {
    const shipHeight = 110;
    const shipWidth = Math.round(shipHeight * (CHARACTER_SPRITE_NATIVE.width / CHARACTER_SPRITE_NATIVE.height));
    const shipX = 18;
    const shipY = this._canvas.height - shipHeight - 10;

    if (this._assets) {
      this._ctx.drawImage(this._assets.character, shipX, shipY, shipWidth, shipHeight);
    }

    const bubbleWidth = Math.min(250, this._canvas.width * 0.42);
    const bubbleX = shipX + shipWidth - 20;
    const bubbleY = shipY - 52;
    this._drawSpeechBubble(bubbleX, bubbleY, bubbleWidth);
  }

  private _drawWelcomeScreen(): void {
    const panel = this._getWelcomePanelBounds();
    const centerX = panel.x + panel.width / 2;

    this._roundRectPath(panel.x, panel.y, panel.width, panel.height, 16);
    this._ctx.fillStyle = WELCOME_PANEL_FILL;
    this._ctx.fill();
    this._ctx.strokeStyle = WELCOME_ACCENT;
    this._ctx.lineWidth = 2;
    this._ctx.stroke();
    this._drawCornerBrackets(panel.x + 10, panel.y + 10, panel.width - 20, panel.height - 20, 18, WELCOME_ACCENT);

    this._ctx.fillStyle = '#FFFFFF';
    this._ctx.textAlign = 'center';
    this._ctx.textBaseline = 'top';
    this._ctx.font = 'bold 28px Segoe UI, Tahoma, sans-serif';
    this._ctx.fillText('FOLLOW THE PATH', centerX, panel.y + 24);

    const descriptionBottom = this._drawWrappedText(
      'Guide your Wreckoon through the obstacles & answer each question as they increase in difficulty.',
      centerX,
      panel.y + 68,
      panel.width - 48,
      20,
      '15px Segoe UI, Tahoma, sans-serif',
      'rgba(255, 255, 255, 0.9)',
      'center'
    );

    this._ctx.font = '14px Segoe UI, Tahoma, sans-serif';
    this._ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    this._ctx.textAlign = 'center';
    this._ctx.fillText('Best score: ' + this._bestScore, centerX, descriptionBottom + 14);

    const button = this._getStartButtonBounds();
    this._roundRectPath(button.x, button.y, button.width, button.height, 8);
    this._ctx.fillStyle = 'rgba(18, 22, 30, 0.95)';
    this._ctx.fill();
    this._ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    this._ctx.lineWidth = 1;
    this._ctx.stroke();
    this._drawCornerBrackets(button.x + 6, button.y + 6, button.width - 12, button.height - 12, 10, WELCOME_ACCENT);

    this._ctx.font = 'bold 16px Segoe UI, Tahoma, sans-serif';
    this._ctx.fillStyle = '#FFFFFF';
    this._ctx.textAlign = 'center';
    this._ctx.textBaseline = 'middle';
    this._ctx.fillText('START GAME', button.x + button.width / 2, button.y + button.height / 2);

    this._drawArrowKeyHints(centerX, panel.y + panel.height - 52);
    this._drawWelcomeMascot();
  }

  private _drawOverlay(title: string, subtitle: string): void {
    const width = this._canvas.width;
    const height = this._canvas.height;

    this._ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    this._ctx.fillRect(0, HUD_HEIGHT, width, height - HUD_HEIGHT);

    this._ctx.fillStyle = '#FFFFFF';
    this._ctx.textAlign = 'center';
    this._ctx.textBaseline = 'middle';
    this._ctx.font = 'bold 34px Segoe UI, Tahoma, sans-serif';
    this._ctx.fillText(title, width / 2, height / 2 - 18);

    this._ctx.font = '18px Segoe UI, Tahoma, sans-serif';
    this._ctx.fillText(subtitle, width / 2, height / 2 + 22);
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
