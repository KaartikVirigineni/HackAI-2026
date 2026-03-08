import { Renderer } from './Renderer';

export class GameEngine {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  socket: any;
  renderer: Renderer;
  players: Record<string, { x: number, y: number, color: string, isGhost?: boolean, name?: string, tasks?: Record<string, {x: number, y: number, isComplete: boolean, color: string}> }>;
  bodies: {x: number, y: number, id: string}[];
  keys: { [key: string]: boolean };
  animationFrameId: number | null;
  localPlayerId: string | null;
  speed: number = 5;
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
        // Keep smooth local prediction
        const myPlayerData = this.localPlayerId ? playersData[this.localPlayerId] : null;
        if (myPlayerData) {
           // const oldX = this.localPlayerId && this.players[this.localPlayerId]?.x;
           // const oldY = this.localPlayerId && this.players[this.localPlayerId]?.y;
        }
        
        this.players = playersData;

        if (this.localPlayerId && this.players[this.localPlayerId]) {
             // Basic implementation: trust server position loosely or snap immediately. Let's snap for now.
             // If we want smooth, we interpolate later.
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

  update() {
    if (!this.localPlayerId || !this.players[this.localPlayerId]) return;

    let dx = 0;
    let dy = 0;

    if (this.keys['w'] || this.keys['arrowup']) dy -= this.speed;
    if (this.keys['s'] || this.keys['arrowdown']) dy += this.speed;
    if (this.keys['a'] || this.keys['arrowleft']) dx -= this.speed;
    if (this.keys['d'] || this.keys['arrowright']) dx += this.speed;

    if (dx !== 0 || dy !== 0) {
      const localP = this.players[this.localPlayerId];
      
      const pSize = 15; // Player radius roughly
      
      if (this.mapConfig) {
         let newX = localP.x + dx;
         let newY = localP.y;
         
         // Test X
         let collisionX = false;
         newX = Math.max(pSize, Math.min(this.mapConfig.width - pSize, newX));
         if (this.mapConfig.obstacles) {
            for (const obs of this.mapConfig.obstacles) {
               if (newX + pSize > obs.x && newX - pSize < obs.x + obs.w && newY + pSize > obs.y && newY - pSize < obs.y + obs.h) {
                  collisionX = true; break;
               }
            }
         }
         if (!collisionX) localP.x = newX;

         // Test Y
         newX = localP.x; // Use updated or old X
         newY = localP.y + dy;
         let collisionY = false;
         newY = Math.max(pSize, Math.min(this.mapConfig.height - pSize, newY));
         if (this.mapConfig.obstacles) {
            for (const obs of this.mapConfig.obstacles) {
               if (newX + pSize > obs.x && newX - pSize < obs.x + obs.w && newY + pSize > obs.y && newY - pSize < obs.y + obs.h) {
                  collisionY = true; break;
               }
            }
         }
         if (!collisionY) localP.y = newY;
      } else {
         localP.x += dx;
         localP.y += dy;
      }

      if (this.socket) {
        this.socket.emit('move', { x: localP.x, y: localP.y });
      }
    }
  }

  loop() {
    this.update();
    this.renderer.render(this.players, this.localPlayerId, this.bodies);
    this.animationFrameId = requestAnimationFrame(this.loop.bind(this));
  }
}
