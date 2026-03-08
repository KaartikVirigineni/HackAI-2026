"use client";

import React, { useEffect, useRef, useState } from 'react';
// @ts-expect-error - Socket.io exports are bugged in this Next.js TS config.
import { io } from 'socket.io-client';
import { useSearchParams } from 'next/navigation';
import { GameEngine } from '@/components/game/Engine';
import { TaskManager } from '@/components/game/TaskManager';

export default function PhishingPier() {
  const searchParams = useSearchParams();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [controlPercent, setControlPercent] = useState(50);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [socket, setSocket] = useState<any>(null);
  const [players, setPlayers] = useState<Record<string, { role?: string, team?: string, isGhost?: boolean, x: number, y: number, color: string, name: string, tasks?: {A: {x: number, y: number, isComplete: boolean}, B: {x: number, y: number, isComplete: boolean}} }>>({});
  const [activeEffects, setActiveEffects] = useState<Record<string, boolean>>({});
  const [bodies, setBodies] = useState<{x: number, y: number, id: string}[]>([]);
  const [meetingState, setMeetingState] = useState<{ active: boolean; reason?: string; votes?: Record<string, string>; ejectedMsg?: string; voteResults?: Record<string, {name: string, color: string}[]> } | null>(null);
  const [gameOver, setGameOver] = useState<{ winner: string; reason: string; eloGained?: number; bonusStr?: string } | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [joined, setJoined] = useState(false);
  const [gameStatus, setGameStatus] = useState<'lobby' | 'playing'>('lobby');
  const [hostId, setHostId] = useState<string | null>(null);
  const [teamCode, setTeamCode] = useState('');
  const [isTasking, setIsTasking] = useState(false);
  const [meetingTimer, setMeetingTimer] = useState(30);
  const [showFullMap, setShowFullMap] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [gameStartTime, setGameStartTime] = useState<number | null>(null);
  const [gameDurationLimit, setGameDurationLimit] = useState<number | null>(null);
  const [lastMeetingTime, setLastMeetingTime] = useState<number>(0);
  const [timeRemainingStr, setTimeRemainingStr] = useState<string>('');
  const [bridgeCooldown, setBridgeCooldown] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
       const now = Date.now();
       if (gameStartTime && gameDurationLimit) {
          const elapsed = now - gameStartTime;
          const remainingMs = Math.max(0, gameDurationLimit - elapsed);
          const mins = Math.floor(remainingMs / 60000);
          const secs = Math.floor((remainingMs % 60000) / 1000);
          setTimeRemainingStr(`${mins}:${secs.toString().padStart(2, '0')}`);
       }
       if (lastMeetingTime > 0) {
          const elapsedMeeting = now - lastMeetingTime;
          const cooldownSecs = Math.max(0, 60 - Math.floor(elapsedMeeting / 1000));
          setBridgeCooldown(cooldownSecs);
       }
    }, 1000);
    return () => clearInterval(interval);
  }, [gameStartTime, gameDurationLimit, lastMeetingTime]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'm') {
        setShowFullMap(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setShowFullMap(showFullMap);
    }
  }, [showFullMap]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (meetingState?.active) {
      if (meetingTimer === 0) setMeetingTimer(30); // Initialize only if not already counting down
      interval = setInterval(() => {
        setMeetingTimer(prev => {
           if (prev <= 1) {
              clearInterval(interval);
              return 0;
           }
           return prev - 1;
        });
      }, 1000);
    } else {
       setMeetingTimer(0);
    }
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingState?.active]);

  useEffect(() => {
    let username = localStorage.getItem("cybermates_username");
    if (!username) {
      username = "Agent_" + Math.floor(Math.random() * 1000);
      localStorage.setItem("cybermates_username", username);
    }

    const newSocket = io();
    setSocket(newSocket);
    
    newSocket.on('control_update', (pct: number) => {
      setControlPercent(pct);
    });

    newSocket.on('players', (playersData: Record<string, { role?: string, team?: string, isGhost?: boolean, x: number, y: number, color: string, name: string, tasks?: {A: {x: number, y: number, isComplete: boolean}, B: {x: number, y: number, isComplete: boolean}} }>) => {
      setPlayers(playersData);
    });

    newSocket.on('game_status_update', (data: { status: 'lobby' | 'playing', hostId: string | null}) => {
      setGameStatus(data.status);
      setHostId(data.hostId);
    });

    newSocket.on('game_started', (data?: { elapsedTime: number, durationLimit: number }) => {
       setGameStatus('playing');
       if (data && data.elapsedTime !== undefined) {
          setGameStartTime(Date.now() - data.elapsedTime);
          setGameDurationLimit(data.durationLimit);
       }
    });

    newSocket.on('effects_update', (effects: Record<string, boolean>) => {
      setActiveEffects(effects);
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    newSocket.on('bodies', (bodiesData: any[]) => {
      setBodies(bodiesData);
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    newSocket.on('meeting_started', (data: any) => {
      setMeetingState({ active: true, reason: data.reason, votes: {} });
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    newSocket.on('vote_update', (votes: any) => {
      setMeetingState(prev => prev ? { ...prev, votes } : null);
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    newSocket.on('meeting_ended', (data: any) => {
      setMeetingState(prev => ({ 
         ...(prev || {}), 
         active: false, 
         ejectedMsg: data.message, 
         voteResults: data.voteResults,
         reason: prev?.reason || 'Meeting Concluded' 
      }));
      if (data.elapsedMeetingTime !== undefined) {
         setLastMeetingTime(Date.now() - data.elapsedMeetingTime);
      }
      setTimeout(() => setMeetingState(null), 10000); // clear after 10s
    });

    newSocket.on('game_over', (data: { winner: string; reason: string; eloGained?: number; bonusStr?: string }) => {
      setGameOver(data);
    });

    newSocket.on('join_error', (msg: string) => {
      setJoinError(msg);
      setJoined(false);
    });

    newSocket.on('game_created', (data: { roomId: string }) => {
      setTeamCode(data.roomId);
      setJoined(true);
    });

    newSocket.on('joined_room', (data: { roomId: string }) => {
      setTeamCode(data.roomId);
      setJoined(true);
    });

    if (canvasRef.current) {
      engineRef.current = new GameEngine(canvasRef.current, newSocket);
      engineRef.current.start();
    }

    // Auto-join or auto-create based on URL params
    const createParam = searchParams.get('create');
    const joinParam = searchParams.get('join');
    
    if (createParam === 'true') {
      newSocket.emit('create_game', { username });
    } else if (joinParam) {
      setTeamCode(joinParam);
      newSocket.emit('join_game', { username, teamCode: joinParam });
    }

    return () => {
      engineRef.current?.stop();
      newSocket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Check if player is near a body
  const localPlayer = socket ? players[socket.id] : null;
  const isNearBody = localPlayer && !localPlayer.isGhost && bodies.some(b => {
    const dx = b.x - localPlayer.x;
    const dy = b.y - localPlayer.y;
    return Math.sqrt(dx*dx + dy*dy) < 100;
  });

  // Handlers moved inline for creation vs joining

  if (gameOver) {
    return (
      <div className="w-screen h-screen bg-cyber-dark text-cyber-green font-orbitron flex flex-col items-center justify-center z-50 absolute inset-0">
        <h1 className={`text-6xl font-bold mb-4 ${gameOver.winner === 'red' ? 'text-cyber-red glow-red' : 'text-cyber-blue glow-blue'}`}>
          {gameOver.winner === 'red' ? 'APT VICTORY' : 'ADMIN VICTORY'}
        </h1>
        <p className="text-xl text-gray-300 mb-2">{gameOver.reason}</p>
        
        {gameOver.eloGained !== undefined && (
           <div className="bg-cyber-darker border border-cyber-green p-6 text-center mt-4 glow-green">
              <h2 className="text-2xl text-yellow-400 font-bold mb-2">MATCH RATING UPDATED</h2>
              <p className="text-3xl text-cyber-green">+{gameOver.eloGained} ELO SCG</p>
              {gameOver.bonusStr && <p className="text-sm text-yellow-300 mt-2">{gameOver.bonusStr}</p>}
           </div>
        )}

        <button onClick={() => window.location.reload()} className="mt-8 bg-cyber-dark border border-cyber-green p-4 rounded hover:bg-cyber-darker text-cyber-green transition-colors pointer-events-auto">Play Again</button>
      </div>
    );
  }

  const myTeam = localPlayer?.team;
  const isBlue = myTeam === 'blue';
  
  // Specific Effects applied to UI
  const showGlitch = isBlue && activeEffects.visual_noise;
  const isLocked = isBlue && activeEffects.lock_terminal;
  const blurUI = isBlue && activeEffects.blur_blue;
  const disableHover = isBlue && activeEffects.disable_hover;

  // Calculate task proximity
  const nearTaskKeys: ('A'|'B')[] = [];
  if (localPlayer && !localPlayer.isGhost && localPlayer.tasks) {
    if (!localPlayer.tasks.A.isComplete) {
      const dxSum = localPlayer.tasks.A.x - localPlayer.x;
      const dySum = localPlayer.tasks.A.y - localPlayer.y;
      if (Math.sqrt(dxSum*dxSum + dySum*dySum) < 120) nearTaskKeys.push('A');
    }
    if (!localPlayer.tasks.B.isComplete) {
      const dxSum = localPlayer.tasks.B.x - localPlayer.x;
      const dySum = localPlayer.tasks.B.y - localPlayer.y;
      if (Math.sqrt(dxSum*dxSum + dySum*dySum) < 120) nearTaskKeys.push('B');
    }
  }

  // Calculate bridge call proximity (map center 1024,1024)
  const isNearBridge = localPlayer && !localPlayer.isGhost && (() => {
    const dx = 1024 - localPlayer.x;
    const dy = 1024 - localPlayer.y;
    return Math.sqrt(dx*dx + dy*dy) < 150;
  })();

  return (
    <div className={`relative w-screen h-screen bg-cyber-dark text-cyber-green font-orbitron overflow-hidden flex flex-col items-center justify-center ${showGlitch ? 'animate-glitch opacity-90' : ''}`}>
      
      {!joined && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-cyber-darker border-2 border-cyber-green p-8 rounded-lg box-glow-green text-center w-full max-w-md">
            <h1 className="text-3xl font-bold mb-6 text-cyber-green text-glow-green">PHISHING PIER</h1>
            <p className="mb-4 text-gray-300">Create a new secure operation or join an existing bridge call.</p>
            
            {joinError && (
              <div className="bg-red-900 border border-red-500 text-red-200 p-3 mb-6 rounded text-sm animate-pulse">
                {joinError}
              </div>
            )}
            
            <button 
              onClick={() => {
                 setJoinError(null);
                 if (socket) {
                   const username = localStorage.getItem("cybermates_username");
                   socket.emit('create_game', { username });
                 }
              }}
              className="w-full font-bold py-3 mb-4 rounded bg-cyber-dark border border-cyber-blue hover:bg-cyber-darker text-cyber-blue box-glow-blue transition-all ease-in-out"
            >
              MAKE TEAM (CREATE LOBBY)
            </button>

            <div className="flex items-center my-4">
              <hr className="flex-1 border-gray-600" />
              <span className="px-4 text-gray-400 text-sm font-bold">OR</span>
              <hr className="flex-1 border-gray-600" />
            </div>

            <input 
              type="text" 
              placeholder="Enter Lobby Code" 
              value={teamCode}
              onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
              className="w-full bg-cyber-dark border border-cyber-green text-cyber-green p-3 rounded text-center text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-cyber-green mb-4"
            />
            <button 
              onClick={() => {
                 setJoinError(null);
                 if (socket && teamCode.trim() !== '') {
                   const username = localStorage.getItem("cybermates_username");
                   socket.emit('join_game', { username, teamCode: teamCode.trim() });
                 }
              }}
              disabled={!teamCode}
              className={`w-full font-bold py-3 rounded shadow-md transition-all ease-in-out ${!teamCode ? 'bg-cyber-dark text-gray-500 border-gray-600 cursor-not-allowed' : 'bg-cyber-dark border border-cyber-green hover:bg-cyber-darker text-cyber-green box-glow-green'}`}
            >
              JOIN TEAM
            </button>
          </div>
        </div>
      )}

      {/* Pre-Game Lobby Overlay */}
      {joined && gameStatus === 'lobby' && (
        <div className="absolute inset-0 z-40 bg-black/90 flex flex-col items-center justify-center p-8 backdrop-blur-sm">
           <h1 className="text-5xl font-bold mb-4 text-cyber-blue animate-pulse-slow text-glow-blue">PRE-GAME LOBBY</h1>
           <p className="text-xl text-gray-300 mb-8 border-b border-gray-700 pb-4">Lobby Code: <span className="text-white font-bold tracking-widest bg-cyber-dark p-2 border border-gray-600 rounded select-all">{teamCode}</span></p>
           
           <div className="flex gap-12 w-full max-w-4xl h-96">
              {/* Connected Players List */}
              <div className="flex-1 bg-cyber-darker border border-cyber-green rounded p-6 overflow-y-auto box-glow-green">
                 <h2 className="text-2xl text-cyber-green mb-6 font-bold border-b border-green-800 pb-2">Agents Connected ({Object.keys(players).length}/8)</h2>
                 <div className="grid grid-cols-2 gap-4">
                    {Object.entries(players).map(([id, p]) => (
                       <div key={id} className={`flex items-center gap-3 p-3 rounded border border-gray-700 bg-cyber-dark ${id === socket?.id ? 'ring-2 ring-white' : ''}`}>
                          <div className="w-6 h-6 rounded-full" style={{ backgroundColor: p.color, boxShadow: `0 0 10px ${p.color}` }} />
                          <div className="font-bold text-gray-300 truncate">
                             {id === socket?.id ? 'YOU' : p.name.toUpperCase()}
                          </div>
                          {id === hostId && <span className="ml-auto text-yellow-500 text-xs font-bold border border-yellow-500 px-2 rounded">HOST</span>}
                       </div>
                    ))}
                 </div>
              </div>

              {/* Host Controls */}
              <div className="w-80 flex flex-col justify-center items-center bg-cyber-darker border border-cyber-blue rounded p-6 box-glow-blue">
                 {socket?.id === hostId ? (
                   <>
                      <h3 className="text-xl text-yellow-400 font-bold mb-4 text-center">HOST CONTROLS</h3>
                      <p className="text-gray-400 text-sm text-center mb-6">You must wait for at least 4 personnel to start the simulation. The game will automatically start when 8 join.</p>
                      <button 
                         onClick={() => socket.emit('start_game_request')}
                         disabled={Object.keys(players).length < 4}
                         className={`w-full py-4 text-xl font-bold rounded border-2 transition-all ${Object.keys(players).length >= 4 ? 'bg-cyber-dark text-cyber-green border-cyber-green hover:bg-cyber-darker box-glow-green' : 'bg-cyber-darker text-gray-500 border-gray-700 cursor-not-allowed'}`}
                      >
                         START GAME
                      </button>
                   </>
                 ) : (
                   <div className="text-center">
                     <div className="text-6xl mb-4 animate-spin">⏳</div>
                     <h3 className="text-xl text-blue-400 font-bold">AWAITING HOST...</h3>
                     <p className="text-gray-500 mt-2">The Host can start the game once 4 players have connected.</p>
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* HUD: Control Bar & Timer */}
      <div className="absolute top-4 w-1/2 max-w-2xl flex flex-col items-center z-10">
        <div className="w-full h-8 bg-cyber-dark rounded-full border border-cyber-green overflow-hidden flex relative mb-2 box-glow-green">
          <div 
            className="h-full bg-cyber-red transition-all duration-500 ease-in-out"
            style={{ width: `${100 - controlPercent}%` }}
          />
          <div 
            className="h-full bg-cyber-blue transition-all duration-500 ease-in-out"
            style={{ width: `${controlPercent}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center font-bold text-white drop-shadow-md mix-blend-difference">
             APT {100 - controlPercent}% | {controlPercent}% ADMIN
             <span className="text-xs ml-4 font-normal">(Press M to toggle map)</span>
          </div>
        </div>
        
        {timeRemainingStr && (
          <div className="bg-black/80 border border-cyber-green px-6 py-2 rounded text-2xl font-bold text-cyber-green text-glow-green tracking-widest">
            {timeRemainingStr}
          </div>
        )}
      </div>

      <div className={`absolute right-8 bottom-8 flex flex-col gap-4 z-10 ${blurUI ? 'blur-sm' : ''} ${disableHover ? 'pointer-events-none opacity-50' : ''}`}>
        {socket && players[socket.id] && (
          <>
            <div className="bg-cyber-darker border border-cyber-green p-4 rounded-lg text-sm shadow-md box-glow-green w-64 relative">
              {isLocked && (
                 <div className="absolute inset-0 bg-cyber-red/80 z-20 flex items-center justify-center text-red-100 font-bold text-xl border-2 border-red-500">
                    TERMINAL LOCKED
                 </div>
              )}
              <h3 className="text-white font-bold mb-2 uppercase border-b border-green-700 pb-1">Terminal Access</h3>
              <p className="mb-1"><span className="text-gray-400">Class:</span> <span className="text-cyber-green font-bold">{players[socket.id].role}</span></p>
              <p className="mb-4"><span className="text-gray-400">Team:</span> <span className={players[socket.id].team === 'red' ? 'text-cyber-red font-bold' : 'text-cyber-blue font-bold'}>{players[socket.id].team?.toUpperCase()}</span></p>
              
              <button 
                onClick={() => setIsTasking(true)}
                disabled={isLocked || players[socket.id].isGhost}
                className="w-full bg-cyber-dark hover:bg-cyber-darker text-cyber-green font-bold py-2 px-4 rounded transition-colors mb-2 border border-cyber-green text-glow-green"
              >
                Access Tasks
              </button>

              {isNearBody && (
                <button 
                  onClick={() => socket.emit('report_body')}
                  className="w-full bg-yellow-900 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded transition-colors border border-yellow-500 mb-2 animate-pulse"
                >
                  REPORT COMPROMISED TERMINAL
                </button>
              )}

              <button 
                onClick={() => socket.emit('bridge_call')}
                disabled={players[socket.id].isGhost || !isNearBridge || bridgeCooldown > 0}
                className={`w-full font-bold py-2 px-4 rounded transition-colors border ${players[socket.id].isGhost || !isNearBridge || bridgeCooldown > 0 ? 'bg-cyber-darker text-gray-500 border-gray-600' : 'bg-orange-900 hover:bg-orange-700 text-white border-orange-500'}`}
              >
                {bridgeCooldown > 0 ? `Bridge Call Cooldown (${bridgeCooldown}s)` : isNearBridge ? 'Bridge Call / Meeting' : 'Bridge Call (Center Only)'}
              </button>

              {socket.id === hostId && (
                <button 
                  onClick={() => socket.emit('force_end_game')}
                  className="w-full bg-cyber-darker border border-cyber-red hover:bg-cyber-dark text-cyber-red mt-4 text-xs font-bold py-2 px-2 rounded transition-colors box-glow-red"
                >
                  HOST: FORCE END SIMULATION
                </button>
              )}
            </div>
            
            {/* Active Effects Panel */}
            {Object.values(activeEffects).some(v => v) && (
              <div className="bg-cyber-darker border border-yellow-500 p-2 rounded-lg text-xs shadow-md">
                <h4 className="text-yellow-500 font-bold mb-1">Active Alerts</h4>
                {activeEffects.blur_blue && <p className="text-gray-300">- Header Blurred</p>}
                {activeEffects.disable_hover && <p className="text-gray-300">- Previews Disabled</p>}
                {activeEffects.lock_terminal && <p className="text-gray-300">- System Locked</p>}
                {activeEffects.mute_alerts && <p className="text-gray-300">- Comms Muted</p>}
                {activeEffects.vision_buff && <p className="text-cyber-green">- Vision Enhanced</p>}
                {activeEffects.ceo_fraud_cooldown && <p className="text-cyber-red font-bold animate-pulse">- CEO FRAUD ACTIVE</p>}
                {activeEffects.total_lockdown && <p className="text-cyber-blue font-bold animate-pulse">- SYSTEM LOCKDOWN</p>}
              </div>
            )}
          </>
        )}
      </div>

      <div className="relative">
        {activeEffects.total_lockdown && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-cyber-darker border border-cyber-blue p-4 text-center animate-pulse box-glow-blue pointer-events-none">
            <h2 className="text-3xl font-bold text-cyber-blue tracking-widest text-glow-blue">TOTAL LOCKDOWN ACTIVE</h2>
            <p className="text-cyber-blue">Admins have frozen all APT activities!</p>
          </div>
        )}
        
        {activeEffects.ceo_fraud_cooldown && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-cyber-darker border border-cyber-red p-4 text-center animate-pulse pointer-events-none" style={{boxShadow: '0 0 15px rgba(255,0,60,0.5)'}}>
            <h2 className="text-3xl font-bold text-cyber-red tracking-widest" style={{textShadow: '0 0 10px rgba(255,0,60,0.5)'}}>CRITICAL: CEO FRAUD</h2>
            <p className="text-cyber-red">-10% Control Penalty Applied</p>
          </div>
        )}

        <canvas 
          ref={canvasRef} 
          width={1024} 
          height={768} 
          className={`border border-cyber-green bg-cyber-darker rounded-lg box-glow-green ${blurUI ? 'blur-sm' : ''} ${showGlitch ? 'animate-bounce' : ''}`}
        />
      </div>

      {isTasking && localPlayer && localPlayer.role && socket && (
        <TaskManager 
          role={localPlayer.role}  
          socket={socket} 
          activeEffects={activeEffects}
          nearTaskKeys={nearTaskKeys}
          onClose={() => setIsTasking(false)} 
        />
      )}

      {/* Meeting Overlay */}
      {meetingState && meetingState.active && (
        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-50 p-8">
          <h2 className="text-4xl text-cyber-red border-b border-cyber-red mb-2 pb-2 uppercase" style={{textShadow: '0 0 10px rgba(255,0,60,0.5)'}}>Bridge Call Active</h2>
          <div className="text-3xl text-orange-500 font-bold mb-4 font-orbitron animate-pulse">{meetingTimer}s REMAINING</div>
          <p className="text-yellow-400 mb-8 text-xl">Reason: {meetingState.reason}</p>
          
          <div className="flex gap-8 w-full max-w-4xl h-96">
            <div className="flex-1 border border-cyber-green bg-cyber-darker p-4 overflow-y-auto box-glow-green">
              <h3 className="text-cyber-green mb-4 font-bold border-b border-green-800 pb-2 text-glow-green">Select Player to Eject</h3>
              {Object.entries(players).map(([id, p]) => (
                <button 
                  key={id}
                  onClick={() => socket?.emit('submit_vote', id)}
                  disabled={p.isGhost || localPlayer?.isGhost || meetingState.votes?.[socket?.id || ''] !== undefined}
                  className={`block w-full text-left p-3 mb-2 rounded border focus:outline-none ${p.isGhost ? 'bg-cyber-darker text-gray-500 border-gray-700' : 'bg-cyber-dark text-white hover:bg-gray-800 border-gray-600'} ${meetingState.votes && meetingState.votes[socket?.id || ''] === id ? 'border-cyber-red bg-red-900/50' : ''}`}
                >
                  {id === socket?.id ? 'YOU ' : p.name ? p.name.toUpperCase() : 'USER_'} ({p.isGhost ? 'OBSERVER' : 'ALIVE'})
                  {/* Hidden vote counts */}
                </button>
              ))}
              <button 
                 onClick={() => socket?.emit('submit_vote', 'skip')}
                 disabled={localPlayer?.isGhost || meetingState.votes?.[socket?.id || ''] !== undefined}
                 className="block w-full text-left p-3 mt-4 rounded border bg-yellow-900 text-yellow-200 hover:bg-yellow-800 border-yellow-700"
              >
                SKIP VOTE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Meeting End Notification */}
      {meetingState && !meetingState.active && meetingState.ejectedMsg && (
        <div className="absolute inset-0 bg-black/95 flex items-center justify-center z-50">
          <div className="text-center w-full max-w-2xl p-8">
            <h2 className="text-5xl text-cyber-blue mb-8 font-bold animate-pulse text-glow-blue">{meetingState.ejectedMsg}</h2>
            
            {meetingState.voteResults && (
               <div className="bg-cyber-darker border border-cyber-green p-6 text-left box-glow-green overflow-y-auto max-h-96">
                  <h3 className="text-2xl text-cyber-green mb-4 border-b border-green-800 pb-2 text-glow-green">VOTE TALLY</h3>
                  {Object.entries(meetingState.voteResults).map(([target, voters]: [string, {name: string, color: string}[]]) => {
                     const targetName = target === 'skip' ? 'SKIPPED' : (players[target]?.name || 'UNKNOWN');
                     return (
                       <div key={target} className="mb-4 bg-cyber-dark p-4 rounded border border-gray-700">
                         <div className="text-xl text-white font-bold mb-2">{targetName} ({voters.length} votes)</div>
                         <div className="flex gap-2 flex-wrap">
                           {voters.map((v: {name: string, color: string}, idx: number) => (
                              <span key={idx} className="px-3 py-1 bg-cyber-darker rounded text-sm font-bold" style={{color: v.color, borderColor: v.color, borderWidth: '2px'}}>
                                {v.name}
                              </span>
                           ))}
                         </div>
                       </div>
                     )
                  })}
               </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};


