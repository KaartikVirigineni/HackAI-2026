import { Renderer } from './Renderer';

export class GameEngine {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  socket: any;
  renderer: Renderer;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  players: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  remoteTargets: Record<string, { x: number; y: number }>; // Target positions for interpolation
  bodies: {x: number, y: number, id: string}[];
  keys: { [key: string]: boolean };
  animationFrameId: number | null;
  localPlayerId: string | null;
  speed: number = 8;
  lastSendTime: number = 0; // Throttle: last time we sent move event
  sendInterval: number = 50; // Send at most 20 times/sec (50ms)
  mapConfig: {
    width: number;
    height: number;
    rooms?: {x: number, y: number, w: number, h: number, name: string}[];
    obstacles?: {x: number, y: number, w: number, h: number}[];
    table?: {x: number, y: number, w: number, h: number};
  } | null = null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(canvas: HTMLCanvasElement, socket: any) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.socket = socket;
    this.players = {};
    this.remoteTargets = {};
    this.bodies = [];
    this.keys = {};
    this.animationFrameId = null;
    this.localPlayerId = socket ? socket.id || null : null;
    this.renderer = new Renderer(this.ctx, canvas.width, canvas.height);

    if (this.socket) {
      this.socket.on('connect', () => {
        this.localPlayerId = this.socket!.id || null;
      });

      this.socket.on('players', (playersData: Record<string, { x: number, y: number, color: string, isGhost?: boolean, name?: string, tasks?: Record<string, {x: number, y: number, isComplete: boolean, color: string}> }>) => {
        // For remote players: update their TARGET position for interpolation
        // For local player: preserve our locally-predicted position (client-side prediction)
        for (const [id, data] of Object.entries(playersData)) {
          if (id === this.localPlayerId) {
            // Keep locally predicted position; only sync non-position data from server
            if (this.players[id]) {
              this.players[id] = { ...data, x: this.players[id].x, y: this.players[id].y };
            } else {
              // First time seeing ourselves — trust server position
              this.players[id] = { ...data };
            }
          } else {
            // Remote player: store target for interpolation
            this.remoteTargets[id] = { x: data.x, y: data.y };
            if (!this.players[id]) {
              // First time seeing this remote player — snap them in
              this.players[id] = { ...data };
            } else {
              // Update non-position data from server
              this.players[id] = { ...this.players[id], ...data, x: this.players[id].x, y: this.players[id].y };
            }
          }
        }
        // Remove players who disconnected
        for (const id of Object.keys(this.players)) {
          if (!playersData[id]) {
            delete this.players[id];
            delete this.remoteTargets[id];
          }
        }
      });

      this.socket.on('bodies', (bodiesData: {x: number, y: number, id: string}[]) => {
        this.bodies = bodiesData;
      });

      this.socket.on('map_config', (config: { width: number, height: number, rooms?: {x: number, y: number, w: number, h: number, name: string}[], obstacles?: {x: number, y: number, w: number, h: number}[], table?: {x: number, y: number, w: number, h: number} }) => {
        this.mapConfig = config;
        this.renderer.mapConfig = config;
      });
    }

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
  }

  start() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    this.loop();
  }

  setShowFullMap(showFullMap: boolean) {
     this.renderer.showFullMap = showFullMap;
  }

  stop() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  handleKeyDown(e: KeyboardEvent) {
    this.keys[e.key.toLowerCase()] = true;
  }

  handleKeyUp(e: KeyboardEvent) {
    this.keys[e.key.toLowerCase()] = false;
  }

  /** Interpolate remote players toward their server-reported target positions */
  interpolateRemotePlayers() {
    const lerpFactor = 0.25; // Higher = snappier, lower = smoother lag
    for (const [id, target] of Object.entries(this.remoteTargets)) {
      if (id === this.localPlayerId) continue;
      const p = this.players[id];
      if (!p) continue;
      p.x += (target.x - p.x) * lerpFactor;
      p.y += (target.y - p.y) * lerpFactor;
    }
  }

  update() {
    if (!this.localPlayerId || !this.players[this.localPlayerId]) return;

    let dx = 0;
    let dy = 0;

    if (this.keys['w'] || this.keys['arrowup']) dy -= this.speed;
    if (this.keys['s'] || this.keys['arrowdown']) dy += this.speed;
    if (this.keys['a'] || this.keys['arrowleft']) dx -= this.speed;
    if (this.keys['d'] || this.keys['arrowright']) dx += this.speed;

    // Normalize diagonal movement
    if (dx !== 0 && dy !== 0) {
      const length = Math.sqrt(dx * dx + dy * dy);
      dx = (dx / length) * this.speed;
      dy = (dy / length) * this.speed;
    }

    if (dx !== 0 || dy !== 0) {
      const localP = this.players[this.localPlayerId];
      const pSize = 15;

      if (this.mapConfig) {
        // Test X axis
        let newX = localP.x + dx;
        let newY = localP.y;
        let collisionX = false;
        newX = Math.max(pSize, Math.min(this.mapConfig.width - pSize, newX));
        if (this.mapConfig.obstacles) {
          for (const obs of this.mapConfig.obstacles) {
            if (newX + pSize > obs.x && newX - pSize < obs.x + obs.w &&
                newY + pSize > obs.y && newY - pSize < obs.y + obs.h) {
              collisionX = true; break;
            }
          }
        }
        if (!collisionX) localP.x = newX;

        // Test Y axis
        newX = localP.x;
        newY = localP.y + dy;
        let collisionY = false;
        newY = Math.max(pSize, Math.min(this.mapConfig.height - pSize, newY));
        if (this.mapConfig.obstacles) {
          for (const obs of this.mapConfig.obstacles) {
            if (newX + pSize > obs.x && newX - pSize < obs.x + obs.w &&
                newY + pSize > obs.y && newY - pSize < obs.y + obs.h) {
              collisionY = true; break;
            }
          }
        }
        if (!collisionY) localP.y = newY;
      } else {
        localP.x += dx;
        localP.y += dy;
      }

      // Throttle socket sends: only emit if enough time has passed
      const now = Date.now();
      if (this.socket && now - this.lastSendTime >= this.sendInterval) {
        this.socket.emit('move', { x: localP.x, y: localP.y });
        this.lastSendTime = now;
      }
    }

    // Always interpolate remote players every frame
    this.interpolateRemotePlayers();
  }

  loop() {
    this.update();
    this.renderer.render(this.players, this.localPlayerId, this.bodies);
    this.animationFrameId = requestAnimationFrame(this.loop.bind(this));
  }
}
