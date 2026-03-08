import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';
import { GameState, mapConfig, ROLES, Team } from './app/lib/game-server/game';
import { openDb } from './app/lib/game-server/db';
import bcrypt from 'bcryptjs';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    
    // Auth endpoints handled by Next.js app/api directly, or we can handle them here.
    // Given the prompt was to merge Next.js and Socket.io, it's cleaner to let Next.js handle API routes
    // and just use this file for the WebSocket connection and Next.js entry point.
    handle(req, res, parsedUrl);
  });

  const io = new Server(server, {
    cors: {
      origin: "*", // allow all for dev
      methods: ["GET", "POST"]
    }
  });

  // Map of roomId -> GameState
  const games = new Map<string, GameState>();

  const getGame = (socketId: string) => {
    // Check which game this socket is part of
    for (const [roomId, game] of games.entries()) {
       if (game.players[socketId]) return { roomId, game };
    }
    return null;
  };

  io.on('connection', (socket) => {
    console.log('Player connected:', socket.id);
    
    socket.emit('map_config', mapConfig);

    socket.on('create_game', ({ username }) => {
      // Generate a random 4-letter code
      const roomId = Math.random().toString(36).substring(2, 6).toUpperCase();
      const game = new GameState(io, roomId);
      games.set(roomId, game);
      
      socket.join(roomId);
      
      // Assign role
      const teamRoles = Object.values(ROLES).filter((r) => r.team === 'red');
      const randomRole = teamRoles[Math.floor(Math.random() * teamRoles.length)];
      const roleKey = Object.keys(ROLES).find(k => ROLES[k] === randomRole)!;
      const role = { name: roleKey, team: 'red' as const };

      game.addPlayer(socket.id, role, username);
      
      socket.emit('game_created', { roomId });
      socket.emit('control_update', game.controlPercentage);
      
      io.to(roomId).emit('game_status_update', { status: game.gameStatus, hostId: game.hostId });
      io.to(roomId).emit('players', game.players);

      // Start tick loop for the room if it doesn't exist (tied to roomId logic, handled generically in a master loop)
    });

    socket.on('join_game', ({ username, teamCode }) => {
      if (!teamCode) {
         socket.emit('join_error', 'Team code is required to join a lobby.');
         return;
      }
      const roomId = teamCode.toUpperCase();
      const game = games.get(roomId);
      if (!game) {
         socket.emit('join_error', 'Lobby not found. Check the code and try again.');
         return;
      }

      const redCount = Object.values(game.players).filter(p => p.team === 'red').length;
      const blueCount = Object.values(game.players).filter(p => p.team === 'blue').length;
      const assignedTeam = blueCount <= redCount ? 'blue' : 'red';

      const teamRoles = Object.values(ROLES).filter((r: any) => r.team === assignedTeam);
      const randomRole = teamRoles[Math.floor(Math.random() * teamRoles.length)];
      const roleKey = Object.keys(ROLES).find(k => ROLES[k] === randomRole)!;
      const role = { name: roleKey, team: assignedTeam as Team };

      const success = game.addPlayer(socket.id, role, username);
      if (!success) {
        socket.emit('join_error', 'Lobby is full! Max limits reached (8 players).');
        return;
      }
      
      socket.join(roomId);
      socket.emit('joined_room', { roomId });
      socket.emit('control_update', game.controlPercentage);
      
      io.to(roomId).emit('game_status_update', { status: game.gameStatus, hostId: game.hostId });
      io.to(roomId).emit('players', game.players);

      if (game.gameStatus === 'playing' && game.stats.startTime) {
         socket.emit('game_started', { 
            elapsedTime: Date.now() - game.stats.startTime, 
            durationLimit: game.gameDurationLimit 
         });
      }
    });

    socket.on('disconnect', () => {
      console.log('Player disconnected:', socket.id);
      const session = getGame(socket.id);
      if (session) {
        session.game.removePlayer(socket.id);
        io.to(session.roomId).emit('game_status_update', { status: session.game.gameStatus, hostId: session.game.hostId });
        io.to(session.roomId).emit('players', session.game.players);
        
        if (Object.keys(session.game.players).length === 0) {
           games.delete(session.roomId);
        }
      }
    });

    socket.on('start_game_request', () => {
       const session = getGame(socket.id);
       if (session && socket.id === session.game.hostId && Object.keys(session.game.players).length >= 1) {
          session.game.startGame();
          io.to(session.roomId).emit('game_status_update', { status: session.game.gameStatus, hostId: session.game.hostId });
       }
    });

    socket.on('move', (pos) => {
      const session = getGame(socket.id);
      if (session) {
        session.game.updatePlayerPos(socket.id, pos.x, pos.y);
        io.to(session.roomId).emit('players', session.game.players);
      }
    });
    
    socket.on('task_complete', (taskKey) => {
      const session = getGame(socket.id);
      if (session) session.game.handleTask(socket.id, taskKey);
    });

    socket.on('force_end_game', () => {
      const session = getGame(socket.id);
      if (session && socket.id === session.game.hostId) {
         io.to(session.roomId).emit('game_over', { winner: 'blue', reason: 'Simulation Terminated by Host', eloGained: 0, bonusStr: '' });
         session.game.resetGame();
      }
    });

    socket.on('play_again_request', () => {
       const session = getGame(socket.id);
       if (session && socket.id === session.game.hostId) {
          session.game.resetGame();
       }
    });

    socket.on('bridge_call', () => {
      const session = getGame(socket.id);
      if (session) session.game.startMeeting(socket.id, 'Bridge Call Requested');
    });

    socket.on('report_body', () => { 
      const session = getGame(socket.id);
      if (session) session.game.startMeeting(socket.id, 'Compromised Terminal Found');
    });

    socket.on('submit_vote', (voteTargetId) => {
      const session = getGame(socket.id);
      if (session) session.game.handleVote(socket.id, voteTargetId);
    });
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});
