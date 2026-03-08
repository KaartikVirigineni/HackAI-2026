import { Server } from 'socket.io';

export interface RoleTask {
  name: string;
  controlChange: number;
  effect?: string;
  duration?: number;
  counter?: string;
}

export type Team = 'red' | 'blue' | 'pending';

export interface Role {
  team: Team;
  A: RoleTask;
  B: RoleTask;
  C?: RoleTask;
  [key: string]: any;
}

export const ROLES: Record<string, Role> = {
  // RED TEAM
  'The Author': {
    team: 'red',
    A: { name: 'Forensic Log Analysis', controlChange: -6 },
    B: { name: 'SPF/DKIM Verification', controlChange: -8 }
  },
  'The Cloner': {
    team: 'red',
    A: { name: 'Certificate Forgery', controlChange: -7 },
    B: { name: 'DOM Manipulation', controlChange: -7 }
  },
  'The Scout': {
    team: 'red',
    A: { name: 'Port Scanning', controlChange: -6 },
    B: { name: 'Credential Harvester', controlChange: -8 }
  },
  
  // BLUE TEAM
  'The Auditor': {
    team: 'blue',
    A: { name: 'Forensic Log Analysis', controlChange: 7, counter: 'blur_blue' },
    B: { name: 'SPF/DKIM Verification', controlChange: 8, effect: 'shield', duration: 20000 }
  },
  'The Gatekeeper': {
    team: 'blue',
    A: { name: 'Traffic Rerouting', controlChange: 7, counter: 'disable_hover' },
    B: { name: 'Decryption Key Gen', controlChange: 9 }
  },
  'The Incident Responder': {
    team: 'blue',
    A: { name: 'Patch Management', controlChange: 8, counter: 'lock_terminal' },
    B: { name: 'Malware RE', controlChange: 8 }
  },
  'The Trainer': {
    team: 'blue',
    A: { name: 'Security Briefing', controlChange: 5, effect: 'vision_buff', duration: 30000 },
    B: { name: 'Phishing Simulation', controlChange: 7, effect: 'shield', duration: 20000 }
  },
  'NetSec Operator': {
    team: 'blue',
    A: { name: 'Log Sieve', controlChange: 6 },
    B: { name: 'ACL Match', controlChange: 6 },
    C: { name: 'Geo-Fencing', controlChange: 6 }
  },
  'CIRT Lead': {
    team: 'blue',
    A: { name: 'Process Kill', controlChange: 6 },
    B: { name: 'Node Isolation', controlChange: 6 },
    C: { name: 'Priority Triage', controlChange: 6 }
  },
  'Detection Engineer': {
    team: 'blue',
    A: { name: 'String Match', controlChange: 6 },
    B: { name: 'Signal to Noise', controlChange: 6 },
    C: { name: 'C2 Heartbeat', controlChange: 6 }
  },
  'DFIR Specialist': {
    team: 'blue',
    A: { name: 'Evidence Chain', controlChange: 6 },
    B: { name: 'Hex Hunt', controlChange: 6 },
    C: { name: 'Persistence Wipe', controlChange: 6 }
  },
  'SecOps Architect': {
    team: 'blue',
    A: { name: 'Critical Patching', controlChange: 6 },
    B: { name: 'Entropy Boost', controlChange: 6 },
    C: { name: 'Port Closer', controlChange: 6 }
  },
  'CTI Analyst': {
    team: 'blue',
    A: { name: 'Feed Scrubbing', controlChange: 6 },
    B: { name: 'APT Attribution', controlChange: 6 },
    C: { name: 'Threat Map', controlChange: 6 }
  }
};

export const mapConfig = {
  width: 2048,
  height: 2048,
  rooms: [
    { name: "Server Room", x: 200, y: 200, w: 500, h: 400 },
    { name: "Home Room", x: 700, y: 700, w: 648, h: 648 }, // Center is 1024, 1024
    { name: "Archives", x: 1400, y: 200, w: 400, h: 500 },
    { name: "Security Desk", x: 200, y: 1400, w: 500, h: 400 },
    { name: "Break Room", x: 1400, y: 1400, w: 400, h: 400 }
  ],
  obstacles: [
    // Boundaries
    { x: 0, y: 0, w: 2048, h: 30 },
    { x: 0, y: 2018, w: 2048, h: 30 },
    { x: 0, y: 0, w: 30, h: 2048 },
    { x: 2018, y: 0, w: 30, h: 2048 },
    // Between Server and Home Room
    { x: 700, y: 200, w: 40, h: 400 }, 
    { x: 200, y: 600, w: 400, h: 100 },
    // Between Archives and Home
    { x: 1348, y: 200, w: 52, h: 500 },
    { x: 1400, y: 700, w: 400, h: 40 },
    // Between Security and Home
    { x: 700, y: 1400, w: 40, h: 400 },
    { x: 200, y: 1360, w: 500, h: 40 },
    // Between Break and Home
    { x: 1348, y: 1400, w: 52, h: 400 },
    { x: 1400, y: 1360, w: 400, h: 40 },
    // Table bounds in middle
    { x: 924, y: 974, w: 200, h: 100 }
  ],
  table: { x: 924, y: 974, w: 200, h: 100 }
};

const PLAYER_COLORS = ['#ec4899', '#84cc16', '#06b6d4', '#8b5cf6', '#eab308', '#f97316', '#f8fafc', '#dc2626'];

export interface PlayerTask {
  x: number;
  y: number;
  color: string;
  isComplete: boolean;
}

interface Player {
  x: number;
  y: number;
  name: string;
  role: string;
  team: Team;
  color: string;
  isGhost: boolean;
  abilityCooldown: number;
  tasks: Record<string, PlayerTask>;
  charges?: number;
}

export interface TaskHistoryEntry {
  role: string;
  taskKey: string;
  time: number;
}

export class GameState {
  io: Server;
  roomId: string;
  players: Record<string, Player>;
  bodies: { x: number; y: number; color: string }[];
  controlPercentage: number;
  activeEffects: Record<string, boolean>;
  sabotageCooldowns: Record<string, number>;
  logicBomb: {
    active: boolean;
    endTime: number;
    defusers: string[];
  };
  meeting: {
    active: boolean;
    votes: Record<string, string>;
    timeoutId: NodeJS.Timeout | null;
  };
  stats: {
    startTime: number | null;
    lowestControl: number;
    hinderanceTimeMs: number;
    lastMeetingTime: number;
  };
  gameStatus: 'lobby' | 'playing';
  hostId: string | null;
  taskHistory: TaskHistoryEntry[];
  gameTimerId: NodeJS.Timeout | null;
  gameDurationLimit: number;
  syncIntervalId: NodeJS.Timeout | null;

  getGameState() {
    let timeRemainingStr = "";
    if (this.stats.startTime) {
      const elapsed = Date.now() - (this.stats.startTime + this.stats.hinderanceTimeMs);
      const remaining = Math.max(0, this.gameDurationLimit - elapsed);
      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      timeRemainingStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    let totalTasks = 0;
    let completedTasks = 0;
    for (const p of Object.values(this.players)) {
      if (p.team === 'blue') {
        const tasks = Object.values(p.tasks);
        totalTasks += tasks.length;
        completedTasks += tasks.filter((t: any) => t.isComplete).length;
      }
    }
    const blueTeamProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return {
      players: this.players,
      bodies: this.bodies,
      gameStatus: this.gameStatus,
      controlPercent: this.controlPercentage,
      blueTeamProgress: blueTeamProgress,
      activeEffects: this.activeEffects,
      timeRemainingStr: timeRemainingStr,
      gameStartTime: this.stats.startTime ? this.stats.startTime + this.stats.hinderanceTimeMs : null,
      logicBomb: this.logicBomb,
      meeting: this.meeting
    };
  }

  constructor(io: Server, roomId: string) {
    this.io = io;
    this.roomId = roomId;
    this.players = {};
    this.bodies = [];
    this.controlPercentage = 50; 
    this.activeEffects = {
      blur_blue: false,
      disable_hover: false,
      lock_terminal: false,
      mute_alerts: false,
      vision_buff: false,
      visual_noise: false,
      fake_tasks: false,
      slow_sandbox: false,
      slow_audit: false,
      shield: false,
      total_lockdown: false,
      ceo_fraud_cooldown: false,
      lockdown_cooldown: false,
      ui_scramble: false,
      latency_spike: false,
      power_cut: false
    };
    this.sabotageCooldowns = {
      logicBomb: 0,
      uiScramble: 0,
      latencySpike: 0,
      powerCut: 0
    };
    this.logicBomb = {
      active: false,
      endTime: 0,
      defusers: []
    };
    this.meeting = {
      active: false,
      votes: {}, // { voterSocketId: targetSocketId or 'skip' }
      timeoutId: null
    };
    this.stats = {
      startTime: null, // Set when game starts
      lowestControl: 50,
      hinderanceTimeMs: 0,
      lastMeetingTime: 0
    };
    this.gameStatus = 'lobby'; // 'lobby' or 'playing'
    this.hostId = null;
    this.taskHistory = [];
    this.gameTimerId = null;
    this.syncIntervalId = null;
    this.gameDurationLimit = 300000; // 5 minutes in ms
  }

  startGame() {
    if (this.gameStatus === 'playing') return;
    
    // Assign roles dynamically here based on total count
    const playerIds = Object.keys(this.players);
    const numPlayers = playerIds.length;
    
    if (numPlayers < 4) {
       console.log(`[GAME] Refusing to start game in room ${this.roomId}: insufficient players (${numPlayers}/4).`);
       this.io.to(this.roomId).emit('error', 'Strict 4-player minimum required to start.');
       return;
    }

    console.log(`[GAME] Starting simulation in room ${this.roomId} with ${numPlayers} agents.`);
    this.gameStatus = 'playing';
    this.stats.startTime = Date.now();
    this.stats.hinderanceTimeMs = 0; // Reset for new game
    
    // Assign roles dynamically here based on total count
    let numRed = 1; // Default
    if (numPlayers >= 7) { // 5-6 blue, 2 red = 7-8 players total
       numRed = 2;
    } else if (numPlayers >= 5) { // 4-5 blue, 1 red = 5-6 players total
       numRed = 1;
    }

    // Roles assignment
    const shuffledIds = [...playerIds].sort(() => 0.5 - Math.random());
    const redIds = shuffledIds.slice(0, numRed);
    const blueIds = shuffledIds.slice(numRed);

    const redRoles = Object.keys(ROLES).filter((k) => ROLES[k].team === 'red');
    const blueRoles = Object.keys(ROLES).filter((k) => ROLES[k].team === 'blue');

    const assignedRedRole = redRoles[Math.floor(Math.random() * redRoles.length)];

    redIds.forEach(id => {
       this.players[id].team = 'red';
       this.players[id].role = assignedRedRole;
       
       const roleConfig = ROLES[assignedRedRole];
       if (roleConfig) {
          for (const taskKey of Object.keys(roleConfig)) {
             if (taskKey !== 'team') {
                const coords = this.getSafeCoordInRoom();
                this.players[id].tasks[taskKey] = { x: coords.x, y: coords.y, color: this.players[id].color, isComplete: false };
             }
          }
       }
    });

    const shuffledBlueRoles = [...blueRoles].sort(() => 0.5 - Math.random());

    blueIds.forEach(id => {
       const roleKey = shuffledBlueRoles.length > 0 ? shuffledBlueRoles.shift()! : blueRoles[Math.floor(Math.random() * blueRoles.length)];
       this.players[id].team = 'blue';
       this.players[id].role = roleKey;

       const roleConfig = ROLES[roleKey];
       if (roleConfig) {
          for (const taskKey of Object.keys(roleConfig)) {
             if (taskKey !== 'team') {
                const coords = this.getSafeCoordInRoom();
                this.players[id].tasks[taskKey] = { x: coords.x, y: coords.y, color: this.players[id].color, isComplete: false };
             }
          }
       }
    });

    this.io.to(this.roomId).emit('players', this.players);

    this.io.to(this.roomId).emit('game_started', { 
       elapsedTime: 0, 
       durationLimit: this.gameDurationLimit 
    });

    this.gameTimerId = setTimeout(() => {
       if (this.gameStatus === 'playing') {
          console.log(`[GAME] Timer expired for room ${this.roomId}. Resolving win.`);
          // Determine winner based on control percentage (Admin favored on stall)
          const winner = this.controlPercentage >= 50 ? 'blue' : 'red';
          const elo = this.calculateElo(winner);
          this.io.to(this.roomId).emit('game_over', { winner, reason: 'Time Limit Exceeded (5 mins)', ...elo });
          this.resetGame();
       }
    }, this.gameDurationLimit);

    // Dynamic Sync Loop inside the game state to ensure it starts when the game starts
    if (this.syncIntervalId) clearInterval(this.syncIntervalId);
    this.syncIntervalId = setInterval(() => {
        this.io.to(this.roomId).emit('sync_state', this.getGameState());
    }, 1000);
  }

  checkWinConditions() {
    if (this.gameStatus === 'lobby') return false;

    const playerIds = Object.keys(this.players);
    const numPlayers = playerIds.length;
    let blueAlive = 0;
    let redAlive = 0;

    for (const p of Object.values(this.players)) {
      if (!p.isGhost) {
        if (p.team === 'blue') blueAlive++;
        if (p.team === 'red') redAlive++;
      }
    }

    // Require at least 2 players to end the game by kill ratio
    if (numPlayers >= 2) {
      if (blueAlive === 0) {
        const elo = this.calculateElo('red');
        this.io.to(this.roomId).emit('game_over', { winner: 'red', reason: 'All Admins Defeated', ...elo });
        this.resetGame();
        return true;
      } else if (redAlive === 0) {
        const elo = this.calculateElo('blue');
        this.io.to(this.roomId).emit('game_over', { winner: 'blue', reason: 'All APTs Ejected', ...elo });
        this.resetGame();
        return true;
      }
    }

    // Control percentage can still end the game even with 1 player for testing (retained for now but 4-player min enforced at start)
    if (this.controlPercentage >= 100) {
      const elo = this.calculateElo('blue');
      this.io.to(this.roomId).emit('game_over', { winner: 'blue', reason: 'Control reached 100%', ...elo });
      this.resetGame();
      return true;
    } else if (this.controlPercentage <= 0) {
      const elo = this.calculateElo('red');
      this.io.to(this.roomId).emit('game_over', { winner: 'red', reason: 'Control reached 0%', ...elo });
      this.resetGame();
      return true;
    }
    
    return false;
  }

  calculateElo(winner: Team) {
    const eloGained = 1000;
    const bonusStr = '';

    console.log(`[ELO_CALC] Team ${winner.toUpperCase()} Wins. Base +1000. Total: +${eloGained}`);
    return { eloGained, bonusStr };
  }

  getSafeCoordInRoom() {
     const room = mapConfig.rooms[Math.floor(Math.random() * mapConfig.rooms.length)];
     const padding = 40;
     return {
       x: room.x + padding + Math.random() * (room.w - padding * 2),
       y: room.y + padding + Math.random() * (room.h - padding * 2)
     };
  }

  checkSynergies() {
    const now = Date.now();
    // Keep only last 35 seconds of history
    this.taskHistory = this.taskHistory.filter(t => now - t.time <= 35000);

    // 1. CEO Fraud (Red): Scout A + Author B within 30s
    if (!this.activeEffects.ceo_fraud_cooldown) {
      const scoutA = this.taskHistory.find(t => t.role === 'The Scout' && t.taskKey === 'A');
      const authorB = this.taskHistory.find(t => t.role === 'The Author' && t.taskKey === 'B');
      if (scoutA && authorB && Math.abs(scoutA.time - authorB.time) <= 30000) {
        console.log("[SYNERGY] CEO Fraud Triggered! -10% Control");
        this.controlPercentage -= 10;
        this.triggerEffect('ceo_fraud_cooldown', 60000); // 1 min cooldown
      }
    }

    // 2. Total Lockdown (Blue): Auditor B + Gatekeeper B within 30s
    if (!this.activeEffects.lockdown_cooldown) {
      const auditorB = this.taskHistory.find(t => t.role === 'The Auditor' && t.taskKey === 'B');
      const gatekeeperB = this.taskHistory.find(t => t.role === 'The Gatekeeper' && t.taskKey === 'B');
      if (auditorB && gatekeeperB && Math.abs(auditorB.time - gatekeeperB.time) <= 30000) {
        console.log("[SYNERGY] Total Lockdown Triggered! Freezing Red for 10s");
        this.triggerEffect('total_lockdown', 10000);
        this.triggerEffect('lockdown_cooldown', 60000); // 1 min cooldown
      }
    }
  }

  // Helper to manage temporary effects
  triggerEffect(effectName: string, duration?: number) {
    this.activeEffects[effectName] = true;
    this.io.to(this.roomId).emit('effects_update', this.activeEffects);
    
    if (duration) {
      setTimeout(() => {
        this.activeEffects[effectName] = false;
        this.io.to(this.roomId).emit('effects_update', this.activeEffects);
      }, duration);
    }
  }

  clearEffect(effectName: string) {
    this.activeEffects[effectName] = false;
    this.io.to(this.roomId).emit('effects_update', this.activeEffects);
  }

  resetGame() {
    this.gameStatus = 'lobby';
    this.controlPercentage = 50;
    this.bodies = [];
    this.meeting = { active: false, votes: {}, timeoutId: null };
    this.stats = { startTime: null, lowestControl: 50, hinderanceTimeMs: 0, lastMeetingTime: 0 };
    for (const key of Object.keys(this.activeEffects)) {
       this.activeEffects[key] = false;
    }
    
    // Reset players instead of deleting them
    for (const id of Object.keys(this.players)) {
       this.players[id].team = 'pending';
       this.players[id].role = 'Awaiting Assignment...';
       this.players[id].isGhost = false;
       this.players[id].tasks = {};
       this.players[id].abilityCooldown = 0;
       this.players[id].charges = 0;
       console.log(`[RESET] Player ${this.players[id].name} (${id}) reset to pending.`);
    }

    console.log(`[GAME] Room ${this.roomId} reset to lobby state.`);

    this.taskHistory = [];
    if (this.gameTimerId) {
       clearTimeout(this.gameTimerId);
       this.gameTimerId = null;
    }
    if (this.syncIntervalId) {
       clearInterval(this.syncIntervalId);
       this.syncIntervalId = null;
    }
    
    // Use dedicated game_reset event so clients know definitively to return to lobby
    // This is separate from game_status_update to avoid race conditions with startGame
    this.io.to(this.roomId).emit('game_reset', { hostId: this.hostId });
    this.io.to(this.roomId).emit('game_status_update', { status: this.gameStatus, hostId: this.hostId });
    this.io.to(this.roomId).emit('players', this.players);
    this.io.to(this.roomId).emit('control_update', this.controlPercentage);
  }

  addPlayer(socketId: string, role: { name: string; team: Team }, name = 'Agent') {
    if (Object.keys(this.players).length >= 8) {
      return false;
    }

    if (!this.hostId) {
       this.hostId = socketId;
    }

    const usedColors = Object.values(this.players).map(p => p.color);
    const availableColors = PLAYER_COLORS.filter(c => !usedColors.includes(c));
    const playerColor = availableColors.length > 0 ? availableColors[0] : '#ffffff';

    // Safe spawn logic: Circle around the meeting table (1024, 1024)
    const spawnRadius = 160;
    const spawnAngle = Object.keys(this.players).length * (Math.PI / 4); // Evenly space up to 8
    const spawnX = 1024 + Math.cos(spawnAngle) * spawnRadius;
    const spawnY = 1024 + Math.sin(spawnAngle) * spawnRadius;

    // Tasks initialized empty. Will be populated on startGame when roles are assigned.
    const playerTasks: Record<string, any> = {};

    this.players[socketId] = {
      x: spawnX,
      y: spawnY,
      name: name,
      role: role.name,
      team: role.team,
      color: playerColor,
      isGhost: false,
      abilityCooldown: 0,
      tasks: playerTasks,
      charges: 0
    };

    // Auto-start if hit 8
    if (Object.keys(this.players).length >= 8) {
       this.startGame();
    }

    return true;
  }

  removePlayer(socketId: string) {
    delete this.players[socketId];
    if (this.hostId === socketId) {
       // Assign new host if possible
       const remaining = Object.keys(this.players);
       if (remaining.length > 0) {
          this.hostId = remaining[0];
       } else {
          this.hostId = null;
          this.gameStatus = 'lobby'; // Reset if everyone leaves
       }
    }
  }

  updatePlayerPos(socketId: string, x: number, y: number) {
    if (this.gameStatus === 'lobby' || this.meeting.active) return;

    if (this.players[socketId]) {
      // Basic server side clamp
      const newX = Math.max(20, Math.min(mapConfig.width - 20, x));
      const newY = Math.max(20, Math.min(mapConfig.height - 20, y));

      this.players[socketId].x = newX;
      this.players[socketId].y = newY;
    }
  }
  
  // Tasks mapping (team & effect mapped)
  handleTask(socketId: string, taskType: string) {
    if (this.gameStatus === 'lobby') return;
    const player = this.players[socketId];
    if (!player || player.isGhost || this.meeting.active) return;

    if (player.team === 'red' && this.activeEffects.total_lockdown) {
       console.log("[SYNERGY] Prevented Red task due to Total Lockdown");
       return; 
    }

    const roleData = ROLES[player.role];
    if (!roleData) return;

    const taskData = roleData[taskType]; // E.g. 'A', 'B', 'C'
    if (!taskData) return;
    
    // Check if task exists for this player and is already complete
    if (!player.tasks[taskType] || player.tasks[taskType].isComplete) return;

    // Record task for Synergy
    this.taskHistory.push({ role: player.role, taskKey: taskType, time: Date.now() });
    this.checkSynergies();

    // mark as complete and apply control shift
    player.tasks[taskType].isComplete = true;
    this.controlPercentage += taskData.controlChange;

    // Red team earns a sabotage charge for completing a task
    if (player.team === 'red') {
       player.charges = (player.charges || 0) + 1;
       console.log(`[CHARGES] ${player.name} earned a charge (${player.charges} total).`);
       // Notify red player of their updated charges
       this.io.to(this.roomId).emit('players', this.players);
    }
    
    // Clamp to 0-100
    this.controlPercentage = Math.max(0, Math.min(100, this.controlPercentage));
    
    if (this.controlPercentage < this.stats.lowestControl) {
      this.stats.lowestControl = this.controlPercentage;
    }

    if (taskData.controlChange < 0) {
       this.stats.hinderanceTimeMs += 5000;
    }

    // trigger effects/counters
    if (taskData.effect) {
      this.triggerEffect(taskData.effect, taskData.duration);
    }
    if (taskData.counter) {
      this.clearEffect(taskData.counter);
    }

    this.io.to(this.roomId).emit('control_update', this.controlPercentage);
    this.io.to(this.roomId).emit('players', this.players); // Emit immediately to update progress bar
    this.io.to(this.roomId).emit('sync_state', this.getGameState()); // Force sync update
    
    // Check win condition
    this.checkWinConditions();
  }

  startMeeting(callerSocketId: string, reason: string) {
    if (this.gameStatus === 'lobby' || this.meeting.active) return;
    
    const now = Date.now();
    // Reduce cooldown for testing
    if (this.stats.lastMeetingTime && now - this.stats.lastMeetingTime < 15000) return;

    const player = this.players[callerSocketId];
    if (!player || player.isGhost) return;

    const dx = 1024 - player.x;
    const dy = 1024 - player.y;
    if (Math.sqrt(dx*dx + dy*dy) > 150) return;

    this.stats.lastMeetingTime = now;
    this.meeting.active = true;
    this.meeting.votes = {};
    
    // Clear bodies
    this.bodies = [];
    this.io.to(this.roomId).emit('bodies', this.bodies);
    this.io.to(this.roomId).emit('players', this.players);
    this.io.to(this.roomId).emit('meeting_started', { reason, caller: callerSocketId });

    // 30 second timer
    this.meeting.timeoutId = setTimeout(() => {
      console.log("[MEETING] 30s Timer expired. Force resolving.");
      this.resolveMeeting();
    }, 30000);
  }

  handleVote(socketId: string, voteTargetId: string) {
    if (!this.meeting.active) return;
    const player = this.players[socketId];
    if (!player || player.isGhost) return;

    this.meeting.votes[socketId] = voteTargetId;

    // Check if everyone alive voted
    const alivePlayers = Object.keys(this.players).filter(id => !this.players[id].isGhost);
    if (Object.keys(this.meeting.votes).length >= alivePlayers.length) {
      this.resolveMeeting();
    } else {
      this.io.to(this.roomId).emit('vote_update', this.meeting.votes);
    }
  }

  resolveMeeting() {
    if (!this.meeting.active) return;
    this.meeting.active = false;
    
    if (this.meeting.timeoutId) {
      clearTimeout(this.meeting.timeoutId);
      this.meeting.timeoutId = null;
    }

    // Tally
    const tallies: Record<string, number> = {};
    const voteResults: Record<string, { id: string; name: string; color: string }[]>  = {}; // { 'targetId': [{ id, name, color }] }
    
    for (const [voterId, target] of Object.entries(this.meeting.votes)) {
      tallies[target] = (tallies[target] || 0) + 1;
      if (!voteResults[target]) voteResults[target] = [];
      if (this.players[voterId]) {
         voteResults[target].push({ id: voterId, name: this.players[voterId].name, color: this.players[voterId].color });
      }
    }

    let maxVotes = 0;
    let ejectedId: string | null = null;
    let tie = false;

    for (const [target, count] of Object.entries(tallies)) {
      if (target === 'skip') continue;
      if (count > maxVotes) {
        maxVotes = count;
        ejectedId = target;
        tie = false;
      } else if (count === maxVotes) {
        tie = true;
      }
    }

    const skipVotes = tallies['skip'] || 0;
    if (skipVotes >= maxVotes || tie || !ejectedId) {
      this.io.to(this.roomId).emit('meeting_ended', { 
         ejected: null, 
         message: "No one was ejected (Tie or Skipped).", 
         voteResults,
         elapsedMeetingTime: 0
      });
    } else {
      if (this.players[ejectedId]) {
        this.players[ejectedId].isGhost = true;
        const teamName = this.players[ejectedId].team === 'red' ? 'APT' : 'Admin';
        this.io.to(this.roomId).emit('meeting_ended', { 
          ejected: ejectedId, 
          message: `${this.players[ejectedId].name || 'Player'} was fired (${teamName}).`,
          voteResults,
          elapsedMeetingTime: 0
        });
      }
    }

    this.io.to(this.roomId).emit('players', this.players);
    this.checkWinConditions();
  }

  executeSabotage(socketId: string, sabotageType: string) {
    if (this.gameStatus === 'lobby' || this.meeting.active) return;
    const player = this.players[socketId];
    if (!player || player.isGhost || player.team !== 'red') return;

    // Server-side: require at least 2 completed tasks to use sabotage
    const completedTasks = Object.values(player.tasks).filter((t: any) => t.isComplete).length;
    if (completedTasks < 2) {
       console.log(`[SABOTAGE] ${player.name} tried to sabotage but only completed ${completedTasks}/2 tasks.`);
       return;
    }

    const now = Date.now();
    const cooldown = this.sabotageCooldowns[sabotageType] || 0;
    
    // Prevent if on cooldown
    if (now < cooldown) return;

    switch (sabotageType) {
       case 'logicBomb':
         // 2 minute cooldown for logic bomb
         this.sabotageCooldowns.logicBomb = now + 120000;
         this.logicBomb = {
            active: true,
            endTime: now + 45000,
            defusers: []
         };
         this.io.to(this.roomId).emit('logic_bomb_started', this.logicBomb);
         
         // Detonation
         setTimeout(() => {
            if (this.gameStatus === 'playing' && this.logicBomb.active) {
                const elo = this.calculateElo('red');
                this.io.to(this.roomId).emit('game_over', { winner: 'red', reason: 'Logic Bomb Detonated', ...elo });
                this.resetGame();
            }
         }, 45000);
         break;
       case 'uiScramble':
         this.sabotageCooldowns.uiScramble = now + 45000;
         this.triggerEffect('ui_scramble', 20000);
         break;
       case 'latencySpike':
         this.sabotageCooldowns.latencySpike = now + 45000;
         this.triggerEffect('latency_spike', 20000);
         break;
       case 'powerCut':
         this.sabotageCooldowns.powerCut = now + 45000;
         this.triggerEffect('power_cut', 20000);
         break;
    }
    
    this.io.to(this.roomId).emit('sabotage_cooldowns', this.sabotageCooldowns);
  }

  defuseLogicBomb(socketId: string, isDefusing: boolean) {
     if (this.gameStatus === 'lobby' || !this.logicBomb.active) return;
     const player = this.players[socketId];
     if (!player || player.isGhost || player.team !== 'blue') return;

     if (isDefusing) {
        if (!this.logicBomb.defusers.includes(socketId)) {
           this.logicBomb.defusers.push(socketId);
        }
     } else {
        this.logicBomb.defusers = this.logicBomb.defusers.filter(id => id !== socketId);
     }
     
     // Check defusal condition: At least 2 different Blue roles
     const rolesDefusing = new Set(this.logicBomb.defusers.map(id => this.players[id]?.role));
     
     if (rolesDefusing.size >= 2) {
        this.logicBomb.active = false;
        this.logicBomb.defusers = [];
        this.io.to(this.roomId).emit('logic_bomb_defused');
        console.log("[SABOTAGE] Logic Bomb Defused safely.");
     } else {
        this.io.to(this.roomId).emit('logic_bomb_updated', this.logicBomb.defusers);
     }
  }
}
