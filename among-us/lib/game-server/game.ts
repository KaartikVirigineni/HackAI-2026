import { Server, Socket } from 'socket.io';

export const ROLES: Record<string, any> = {
  // RED TEAM
  'The Author': {
    team: 'red',
    A: { name: 'Behavioral Profiling', controlChange: -6, effect: 'blur_blue', duration: 15000 },
    B: { name: 'Payload Obfuscation', controlChange: -8, effect: 'slow_sandbox', duration: 20000 }
  },
  'The Cloner': {
    team: 'red',
    A: { name: 'Certificate Forgery', controlChange: -7, effect: 'invert_colors', duration: 20000 },
    B: { name: 'DOM Manipulation', controlChange: -7, effect: 'disable_hover', duration: 20000 }
  },
  'The Scout': {
    team: 'red',
    A: { name: 'Port Scanning', controlChange: -6, effect: 'fake_tasks', duration: 30000 },
    B: { name: 'Credential Harvester', controlChange: -8, effect: 'lock_terminal', duration: 15000 }
  },
  'The Delivery Lead': {
    team: 'red',
    A: { name: 'SMTP Relay Setup', controlChange: -6, effect: 'slow_audit', duration: 20000 },
    B: { name: 'Botnet Sync', controlChange: -8, effect: 'mute_alerts', duration: 15000 }
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

interface Player {
  x: number;
  y: number;
  name: string;
  role: string;
  team: string;
  color: string;
  isGhost: boolean;
  abilityCooldown: number;
  tasks: any;
}

export class GameState {
  io: Server;
  roomId: string;
  players: Record<string, Player>;
  bodies: any[];
  controlPercentage: number;
  activeEffects: Record<string, boolean>;
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
  taskHistory: any[];
  gameTimerId: NodeJS.Timeout | null;
  gameDurationLimit: number;

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
      lockdown_cooldown: false
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
    this.gameDurationLimit = 300000; // 5 minutes in ms
  }

  startGame() {
    if (this.gameStatus === 'playing') return;
    this.gameStatus = 'playing';
    this.stats.startTime = Date.now();
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
  }

  checkWinConditions() {
    if (this.gameStatus === 'lobby') return false;

    let blueAlive = 0;
    let redAlive = 0;

    for (const p of Object.values(this.players)) {
      if (!p.isGhost) {
        if (p.team === 'blue') blueAlive++;
        if (p.team === 'red') redAlive++;
      }
    }

    // Require at least 2 players to end the game by kill ratio
    if (Object.keys(this.players).length >= 2) {
      if (blueAlive === 0) {
        const elo = this.calculateElo('red');
        this.io.emit('game_over', { winner: 'red', reason: 'All Admins Defeated', ...elo });
        return true;
      } else if (redAlive === 0) {
        const elo = this.calculateElo('blue');
        this.io.emit('game_over', { winner: 'blue', reason: 'All APTs Ejected', ...elo });
        return true;
      }
    }

    // Control percentage can still end the game even with 1 player for testing
    if (this.controlPercentage >= 100) {
      const elo = this.calculateElo('blue');
      this.io.emit('game_over', { winner: 'blue', reason: 'Control reached 100%', ...elo });
      return true;
    } else if (this.controlPercentage <= 0) {
      const elo = this.calculateElo('red');
      this.io.emit('game_over', { winner: 'red', reason: 'Control reached 0%', ...elo });
      return true;
    }
    
    return false;
  }

  calculateElo(winner: string) {
    const eloGained = 20;
    const bonusStr = '';

    console.log(`[ELO_CALC] Team ${winner.toUpperCase()} Wins. Base +20. Total: +${eloGained}`);
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
    this.players = {}; 
    this.hostId = null;
    this.taskHistory = [];
    if (this.gameTimerId) {
       clearTimeout(this.gameTimerId);
       this.gameTimerId = null;
    }
  }

  addPlayer(socketId: string, role: any, name = 'Agent') {
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

    // Safe task coordinate logic: Pick a random room and spawn strictly inside it
    const taskACoords = this.getSafeCoordInRoom();
    const taskBCoords = this.getSafeCoordInRoom();

    this.players[socketId] = {
      x: spawnX,
      y: spawnY,
      name: name,
      role: role.name,
      team: role.team,
      color: playerColor,
      isGhost: false,
      abilityCooldown: 0,
      tasks: {
        A: { x: taskACoords.x, y: taskACoords.y, color: playerColor, isComplete: false },
        B: { x: taskBCoords.x, y: taskBCoords.y, color: playerColor, isComplete: false }
      }
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
  handleTask(socketId: string, taskType: 'A' | 'B') {
    if (this.gameStatus === 'lobby') return;
    const player = this.players[socketId];
    if (!player || player.isGhost || this.meeting.active) return;

    if (player.team === 'red' && this.activeEffects.total_lockdown) {
       console.log("[SYNERGY] Prevented Red task due to Total Lockdown");
       return; 
    }

    const roleData = ROLES[player.role];
    if (!roleData) return;

    const taskData = roleData[taskType]; // 'A' or 'B'
    if (!taskData) return;
    
    // Check if task is already complete
    if (player.tasks[taskType].isComplete) return;

    // Record task for Synergy
    this.taskHistory.push({ role: player.role, taskKey: taskType, time: Date.now() });
    this.checkSynergies();

    // Apply control change
    this.controlPercentage += taskData.controlChange;
    // ... mark as complete locally
    player.tasks[taskType].isComplete = true;
    
    // Set timeout to respawn task in new location after 10 seconds
    setTimeout(() => {
        const p = this.players[socketId];
        if (p && p.tasks && p.tasks[taskType]) {
            p.tasks[taskType].isComplete = false;
            const newCoords = this.getSafeCoordInRoom();
            p.tasks[taskType].x = newCoords.x;
            p.tasks[taskType].y = newCoords.y;
            this.io.to(this.roomId).emit('players', this.players);
        }
    }, 10000);

    // Clamp to 0-100
    this.controlPercentage = Math.max(0, Math.min(100, this.controlPercentage));
    
    if (this.controlPercentage < this.stats.lowestControl) {
      this.stats.lowestControl = this.controlPercentage;
    }

    if (taskData.controlChange < 0) {
       this.stats.hinderanceTimeMs += 5000; // rough tracking metric
    }

    // trigger effects/counters
    if (taskData.effect) {
      this.triggerEffect(taskData.effect, taskData.duration);
    }
    if (taskData.counter) {
      this.clearEffect(taskData.counter);
    }

    this.io.to(this.roomId).emit('control_update', this.controlPercentage);
    
    // Check win condition
    this.checkWinConditions();
  }

  startMeeting(callerSocketId: string, reason: string) {
    if (this.gameStatus === 'lobby' || this.meeting.active) return;
    
    const now = Date.now();
    if (this.stats.lastMeetingTime && now - this.stats.lastMeetingTime < 60000) return;

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
    const voteResults: Record<string, any[]>  = {}; // { 'targetId': ['voterId1', 'voterId2'] }
    
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
}
