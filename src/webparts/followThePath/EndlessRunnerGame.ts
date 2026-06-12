type GameState = 'waiting' | 'playing' | 'gameover';

interface RectEntity {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}

interface CoinEntity {
  x: number;
  y: number;
  radius: number;
  speed: number;
}

const PLAYER_X = 50;
const PLAYER_SIZE = 40;
const CANVAS_HEIGHT = 400;
const PLAYER_SPEED = 5;
const SCROLL_SPEED = 4;
const COIN_RADIUS = 10;

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
  ' ': true
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

  private _animationFrameId: number = 0;
  private _lastTimestamp: number = 0;
  private _state: GameState = 'waiting';
  private _score: number = 0;
  private _playerY: number = 0;
  private _movement: number = 0;
  private _obstacles: RectEntity[] = [];
  private _coins: CoinEntity[] = [];
  private _nextObstacleAt: number = 0;
  private _nextCoinAt: number = 0;
  private _disposed: boolean = false;

  constructor(target: HTMLElement) {
    this._boundKeyDown = this._onKeyDown.bind(this);
    this._boundKeyUp = this._onKeyUp.bind(this);
    this._boundResize = this._resizeCanvas.bind(this);
    this._boundGameLoop = this._gameLoop.bind(this);

    this._container = document.createElement('div');
    this._container.style.cssText = 'position:relative;width:100%;height:' + CANVAS_HEIGHT + 'px;overflow:hidden;';

    this._canvas = document.createElement('canvas');
    this._canvas.style.cssText = 'display:block;width:100%;height:100%;';
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
    this._playerY = (this._canvas.height - PLAYER_SIZE) / 2;
    this._scheduleSpawns(0);

    window.addEventListener('keydown', this._boundKeyDown);
    window.addEventListener('keyup', this._boundKeyUp);
    window.addEventListener('resize', this._boundResize);

    this._animationFrameId = window.requestAnimationFrame(this._boundGameLoop);
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

    if (this._container.parentElement) {
      this._container.parentElement.removeChild(this._container);
    }
  }

  private _resizeCanvas(): void {
    const width = this._container.clientWidth || this._container.parentElement?.clientWidth || 640;
    this._canvas.width = width;
    this._canvas.height = CANVAS_HEIGHT;
    this._clampPlayer();
  }

  private _onKeyDown(event: KeyboardEvent): void {
    if (PREVENT_DEFAULT_KEYS[event.key]) {
      event.preventDefault();
    }

    if (event.key === ' ') {
      if (this._state === 'waiting' || this._state === 'gameover') {
        this._startGame();
      }
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

  private _startGame(): void {
    this._state = 'playing';
    this._score = 0;
    this._playerY = (this._canvas.height - PLAYER_SIZE) / 2;
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
    const maxY = this._canvas.height - PLAYER_SIZE;
    if (this._playerY < 0) {
      this._playerY = 0;
    } else if (this._playerY > maxY) {
      this._playerY = maxY;
    }
  }

  private _spawnEntities(timestamp: number): void {
    if (timestamp >= this._nextObstacleAt) {
      const height = this._randomBetween(30, 90);
      const width = this._randomBetween(30, 60);
      const maxY = this._canvas.height - height;

      this._obstacles.push({
        x: this._canvas.width + width,
        y: this._randomBetween(0, maxY),
        width,
        height,
        speed: SCROLL_SPEED + this._randomBetween(0, 2)
      });

      this._nextObstacleAt = timestamp + this._randomBetween(800, 1800);
    }

    if (timestamp >= this._nextCoinAt) {
      const maxY = this._canvas.height - COIN_RADIUS * 2;

      this._coins.push({
        x: this._canvas.width + COIN_RADIUS * 2,
        y: this._randomBetween(COIN_RADIUS, maxY + COIN_RADIUS),
        radius: COIN_RADIUS,
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
    this._coins = this._coins.filter((coin) => coin.x + coin.radius > 0);
  }

  private _checkCollisions(): void {
    const playerLeft = PLAYER_X;
    const playerRight = PLAYER_X + PLAYER_SIZE;
    const playerTop = this._playerY;
    const playerBottom = this._playerY + PLAYER_SIZE;

    for (let i = 0; i < this._obstacles.length; i++) {
      const obstacle = this._obstacles[i];
      if (
        playerRight > obstacle.x &&
        playerLeft < obstacle.x + obstacle.width &&
        playerBottom > obstacle.y &&
        playerTop < obstacle.y + obstacle.height
      ) {
        this._state = 'gameover';
        return;
      }
    }

    for (let j = this._coins.length - 1; j >= 0; j--) {
      const coin = this._coins[j];
      const closestX = this._clamp(coin.x, playerLeft, playerRight);
      const closestY = this._clamp(coin.y, playerTop, playerBottom);
      const dx = coin.x - closestX;
      const dy = coin.y - closestY;

      if (dx * dx + dy * dy < coin.radius * coin.radius) {
        this._score++;
        this._coins.splice(j, 1);
      }
    }
  }

  private _draw(): void {
    const ctx = this._ctx;
    const width = this._canvas.width;
    const height = this._canvas.height;

    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, width, height);

    this._drawPlayer();
    this._drawObstacles();
    this._drawCoins();
    this._drawHud();

    if (this._state === 'waiting') {
      this._drawOverlay('Press SPACE to Start', 'Use Arrow Keys or W/S to move');
    } else if (this._state === 'gameover') {
      this._drawOverlay('Game Over', 'Score: ' + this._score + ' — Press SPACE to retry');
    }
  }

  private _drawPlayer(): void {
    this._ctx.fillStyle = '#2196F3';
    this._ctx.fillRect(PLAYER_X, this._playerY, PLAYER_SIZE, PLAYER_SIZE);
  }

  private _drawObstacles(): void {
    this._ctx.fillStyle = '#E53935';
    for (let i = 0; i < this._obstacles.length; i++) {
      const obstacle = this._obstacles[i];
      this._ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    }
  }

  private _drawCoins(): void {
    this._ctx.fillStyle = '#FFEB3B';
    for (let i = 0; i < this._coins.length; i++) {
      const coin = this._coins[i];
      this._ctx.beginPath();
      this._ctx.arc(coin.x, coin.y, coin.radius, 0, Math.PI * 2);
      this._ctx.fill();
    }
  }

  private _drawHud(): void {
    this._ctx.fillStyle = '#FFFFFF';
    this._ctx.font = 'bold 20px Segoe UI, sans-serif';
    this._ctx.textAlign = 'left';
    this._ctx.textBaseline = 'top';
    this._ctx.fillText('Score: ' + this._score, 16, 16);
  }

  private _drawOverlay(title: string, subtitle: string): void {
    const width = this._canvas.width;
    const height = this._canvas.height;

    this._ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    this._ctx.fillRect(0, 0, width, height);

    this._ctx.fillStyle = '#FFFFFF';
    this._ctx.textAlign = 'center';
    this._ctx.textBaseline = 'middle';
    this._ctx.font = 'bold 32px Segoe UI, sans-serif';
    this._ctx.fillText(title, width / 2, height / 2 - 20);

    this._ctx.font = '18px Segoe UI, sans-serif';
    this._ctx.fillText(subtitle, width / 2, height / 2 + 24);
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
