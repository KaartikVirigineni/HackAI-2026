"use client";

import React, { useEffect, useRef, useState } from 'react';
// @ts-expect-error - Socket.io exports are bugged in this Next.js TS config.
import { io } from 'socket.io-client';
import { useSearchParams } from 'next/navigation';
import { GameEngine } from '@/components/game/Engine';
import { TaskManager } from '@/components/game/TaskManager';
import { MissionDebrief } from '@/components/game/MissionDebrief';
import { TouchControls } from '@/components/game/TouchControls';
import { GameAudio } from '@/components/game/GameAudio';
import { updateUserPoints } from '@/app/actions/user';

export default function PhishingPier() {
  const searchParams = useSearchParams();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const audioRef = useRef<GameAudio | null>(null);

  const [controlPercent, setControlPercent] = useState(50);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [socket, setSocket] = useState<any>(null);
  const [players, setPlayers] = useState<Record<string, { role?: string, team?: string, isGhost?: boolean, x: number, y: number, color: string, name: string, tasks?: Record<string, {x: number, y: number, isComplete: boolean}> }>>({});
  const [activeEffects, setActiveEffects] = useState<Record<string, boolean>>({});
  const [bodies, setBodies] = useState<{x: number, y: number, id: string}[]>([]);
  const [meetingState, setMeetingState] = useState<{ active: boolean; reason?: string; votes?: Record<string, string>; ejectedMsg?: string; voteResults?: Record<string, {name: string, color: string}[]> } | null>(null);
  const [gameOver, setGameOver] = useState<{ winner: string; reason: string; eloGained?: number; bonusStr?: string } | null>(null);
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
  const [blueProgress, setBlueProgress] = useState(0);

  // Sabotage State
  const [sabotageCooldowns, setSabotageCooldowns] = useState<Record<string, number>>({});
  const [logicBomb, setLogicBomb] = useState<{active: boolean, endTime: number, defusers: string[]}>({active: false, endTime: 0, defusers: []});
  const [droppedPackets, setDroppedPackets] = useState<Record<string, boolean>>({}); // for latency spike
  const pointsAwardedRef = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
       const now = Date.now();
       if (lastMeetingTime > 0) {
          const elapsedMeeting = now - lastMeetingTime;
          const cooldownSecs = Math.max(0, 60 - Math.floor(elapsedMeeting / 1000));
          setBridgeCooldown(cooldownSecs);
       }
    }, 1000);
    return () => clearInterval(interval);
  }, [lastMeetingTime]);

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

    newSocket.on('players', (playersData: Record<string, { role?: string, team?: string, isGhost?: boolean, x: number, y: number, color: string, name: string, tasks?: Record<string, {x: number, y: number, isComplete: boolean}> }>) => {
      setPlayers(playersData);
    });

    newSocket.on('game_status_update', (data: { status: 'lobby' | 'playing', hostId: string | null}) => {
      setGameStatus(data.status);
      setHostId(data.hostId);
    });

    // Dedicated reset event from server — clears game over and returns all clients to lobby cleanly
    newSocket.on('game_reset', (data: { hostId: string | null }) => {
       setGameOver(null);
       setIsTasking(false);
       setMeetingState(null);
       setBlueProgress(0);
       setControlPercent(50);
       setTimeRemainingStr('');
       setGameStartTime(null);
       setHostId(data.hostId);
       setGameStatus('lobby');
       pointsAwardedRef.current = false;
    });

    newSocket.on('game_started', (data?: { elapsedTime: number, durationLimit: number }) => {
       setGameStatus('playing');
       if (data && data.elapsedTime !== undefined) {
          setGameStartTime(Date.now() - data.elapsedTime);
          setGameDurationLimit(data.durationLimit);
       }
       audioRef.current?.gameStart();
    });

    newSocket.on('effects_update', (effects: Record<string, boolean>) => {
      setActiveEffects(effects);
      if (!effects.latency_spike) {
         setDroppedPackets({}); // clear dropped packets when latency spike ends
      }
    });

    newSocket.on('sabotage_cooldowns', (cds: Record<string, number>) => {
       setSabotageCooldowns(cds);
    });

    newSocket.on('logic_bomb_started', (lb: {active: boolean, endTime: number, defusers: string[]}) => {
       setLogicBomb(lb);
       audioRef.current?.startLogicBombTick();
    });

    newSocket.on('logic_bomb_updated', (defusers: string[]) => {
       setLogicBomb(prev => ({...prev, defusers}));
    });

    newSocket.on('logic_bomb_defused', () => {
       setLogicBomb({active: false, endTime: 0, defusers: []});
       audioRef.current?.bombDefused();
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    newSocket.on('sync_state', (state: any) => {
       if (state.timeRemainingStr) {
          setTimeRemainingStr(state.timeRemainingStr);
       }
       if (state.blueTeamProgress !== undefined) {
          setBlueProgress(state.blueTeamProgress);
       }
       if (state.controlPercent !== undefined) {
          setControlPercent(state.controlPercent);
       }
       if (state.gameStartTime !== undefined) {
          setGameStartTime(state.gameStartTime);
       }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    newSocket.on('bodies', (bodiesData: any[]) => {
      setBodies(bodiesData);
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    newSocket.on('meeting_started', (data: any) => {
      setMeetingState({ active: true, reason: data.reason, votes: {} });
      audioRef.current?.emergencyMeeting();
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    newSocket.on('vote_update', (votes: any) => {
      setMeetingState(prev => prev ? { ...prev, votes } : null);
      audioRef.current?.voteCast();
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
      audioRef.current?.stopLogicBombTick();
      audioRef.current?.stopFootsteps();
      if (data.winner === 'blue') {
        audioRef.current?.victory();
      } else {
        audioRef.current?.defeat();
      }
    });

    newSocket.on('join_error', (msg: string) => {
      setJoinError(msg);
      setJoined(false);
    });

    newSocket.on('error', (msg: string) => {
       alert(msg); // Significant enough to alert for now
    });

    // Check win condition and award points
    newSocket.on('game_over', (data: { winner: string; reason: string; eloGained?: number; bonusStr?: string }) => {
      if (!pointsAwardedRef.current && newSocket.id) {
         setPlayers(currentPlayers => {
            const myPlayer = currentPlayers[newSocket.id];
            if (myPlayer && myPlayer.team === data.winner) {
               updateUserPoints(username, 1000).catch(console.error);
               pointsAwardedRef.current = true;
            }
            return currentPlayers;
         });
      }
    });

    newSocket.on('game_created', (data: { roomId: string }) => {
      setTeamCode(data.roomId);
      setJoined(true);
    });

    newSocket.on('joined_room', (data: { roomId: string }) => {
      setTeamCode(data.roomId);
      setJoined(true);
    });

    if (!audioRef.current) {
      audioRef.current = new GameAudio();
    }

    // Web Audio API requires a user gesture to resume a suspended AudioContext
    const handleUserGesture = () => {
       audioRef.current?.resume();
    };
    window.addEventListener('pointerdown', handleUserGesture, { once: true });
    window.addEventListener('keydown', handleUserGesture, { once: true });

    if (canvasRef.current) {
      engineRef.current = new GameEngine(canvasRef.current, newSocket, (isMoving) => {
        audioRef.current?.tickMovement(isMoving);
      });
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
      window.removeEventListener('pointerdown', handleUserGesture);
      window.removeEventListener('keydown', handleUserGesture);
      engineRef.current?.stop();
      audioRef.current?.destroy();
      audioRef.current = null;
      newSocket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // CLIENT SIDE TIMER TICKER
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (gameStatus === 'playing' && gameStartTime) {
       interval = setInterval(() => {
          const now = Date.now();
          const elapsed = now - gameStartTime;
          const remaining = Math.max(0, (gameDurationLimit || 300000) - elapsed);
          const minutes = Math.floor(remaining / 60000);
          const seconds = Math.floor((remaining % 60000) / 1000);
          const newTimeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
          setTimeRemainingStr(newTimeStr);
       }, 500); // 500ms for smoother update
    }
    return () => clearInterval(interval);
  }, [gameStatus, gameStartTime, gameDurationLimit]);

  // CLIENT SIDE BLUE PROGRESS CALCULATION (Fallback & Responsiveness)
  useEffect(() => {
     let total = 0;
     let complete = 0;
     Object.values(players).forEach(p => {
        if (p.team === 'blue' && p.tasks) {
           const tasks = Object.values(p.tasks);
           total += tasks.length;
           complete += tasks.filter((t: any) => t.isComplete).length;
        }
     });
     if (total > 0) {
        setBlueProgress((complete / total) * 100);
     }
  }, [players]);

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
  const uiScramble = isBlue && activeEffects.ui_scramble;
  const powerCut = isBlue && activeEffects.power_cut;

  const scrambleString = (str: string) => {
     if (!uiScramble) return str;
     return str.split('').map(() => Math.random() > 0.5 ? '0x' + Math.floor(Math.random()*256).toString(16).toUpperCase() : '?').join('').substring(0, Math.max(str.length, 4));
  };

  // Calculate task proximity — use engine's predicted position for accuracy
  const nearTaskKeys: string[] = [];
  if (localPlayer && !localPlayer.isGhost && localPlayer.tasks) {
    // Prefer engine's locally-predicted position over server-reported position
    const engineLocalPlayer = socket && engineRef.current ? engineRef.current.players[socket.id] : null;
    const checkX = engineLocalPlayer?.x ?? localPlayer.x;
    const checkY = engineLocalPlayer?.y ?? localPlayer.y;
    Object.keys(localPlayer.tasks).forEach((taskKey) => {
      const task = localPlayer.tasks![taskKey];
      if (!task.isComplete) {
        const dxSum = task.x - checkX;
        const dySum = task.y - checkY;
        if (Math.sqrt(dxSum*dxSum + dySum*dySum) < 160) nearTaskKeys.push(taskKey); // Slightly wider radius
      }
    });
  }

  // Calculate bridge call proximity (map center 1024,1024) — also use engine position
  const isNearBridge = localPlayer && !localPlayer.isGhost && (() => {
    const engineLocalPlayer = socket && engineRef.current ? engineRef.current.players[socket.id] : null;
    const checkX = engineLocalPlayer?.x ?? localPlayer.x;
    const checkY = engineLocalPlayer?.y ?? localPlayer.y;
    const dx = 1024 - checkX;
    const dy = 1024 - checkY;
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
              onKeyDown={(e) => {
                if (e.key === 'Enter' && teamCode.trim() !== '') {
                   setJoinError(null);
                   if (socket) {
                     const username = localStorage.getItem("cybermates_username");
                     socket.emit('join_game', { username, teamCode: teamCode.trim() });
                   }
                }
              }}
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
            <button 
              onClick={() => window.location.href = '/home'}
              className="w-full mt-6 py-2 text-cyber-blue/60 hover:text-cyber-blue text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              ABORT OPERATION & RETURN HOME
            </button>
          </div>
        </div>
      )}

      {/* Pre-Game Lobby Overlay */}
      {joined && gameStatus === 'lobby' && (
        <div className="absolute inset-0 z-40 bg-black/90 flex flex-col items-center justify-center p-8 backdrop-blur-sm">
           <button 
             onClick={() => window.location.href = '/home'}
             className="absolute top-8 left-8 text-cyber-blue/60 hover:text-cyber-blue text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
           >
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
             RETURN HOME
           </button>
           <h1 className="text-5xl font-bold mb-4 text-cyber-blue animate-pulse-slow text-glow-blue">PRE-GAME LOBBY</h1>
           <p className="text-xl text-gray-300 mb-8 border-b border-gray-700 pb-4">Lobby Code: <span className="text-white font-bold tracking-widest bg-cyber-dark p-2 border border-gray-600 rounded select-all">{teamCode}</span></p>
           
           <div className="flex flex-col md:flex-row gap-4 md:gap-8 w-full max-w-7xl h-auto md:h-[40rem]">
              {/* Mission Debrief Section */}
              <div className="flex-[2] bg-cyber-darker border border-cyber-blue rounded p-6 overflow-y-auto box-glow-blue thin-scrollbar">
                 <MissionDebrief />
              </div>

              {/* Connected Players List */}
              <div className="flex-1 bg-cyber-darker border border-cyber-green rounded p-6 overflow-y-auto box-glow-green flex flex-col">
                  <h2 className="text-xl md:text-2xl text-cyber-green mb-4 md:mb-6 font-bold border-b border-green-800 pb-2">Agents Connected ({Object.keys(players).length}/8)</h2>
                 <div className="grid grid-cols-1 gap-3 md:gap-4 flex-1 content-start">
                    {Object.entries(players).map(([id, p]) => (
                       <div key={id} className={`flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded border border-gray-700 bg-cyber-dark ${id === socket?.id ? 'ring-2 ring-white' : ''}`}>
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
              <div className="w-full md:w-80 flex flex-col justify-center items-center bg-cyber-darker border border-cyber-blue rounded p-6 box-glow-blue">
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
      {joined && gameStatus === 'playing' && (
        <div className="absolute top-4 w-full px-8 flex flex-col items-center z-40 gap-3">
          {/* Main Control Bar */}
          <div className="w-full max-w-2xl h-8 bg-cyber-dark rounded-full border border-cyber-green overflow-hidden flex relative box-glow-green">
            <div 
              className="h-full bg-cyber-red transition-all duration-500 ease-in-out"
              style={{ width: `${100 - controlPercent}%` }}
            />
            <div 
              className="h-full bg-cyber-blue transition-all duration-500 ease-in-out"
              style={{ width: `${controlPercent}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center font-bold text-white drop-shadow-md mix-blend-difference text-xs">
               APT CONTROL {100 - controlPercent}% | {controlPercent}% ADMIN UPTIME
            </div>
          </div>

          {/* Blue Team Integrity (Task Progress) */}
          <div className="w-full max-w-xl flex flex-col items-center">
             <div className="w-full h-3 bg-cyber-darker border border-blue-900 rounded-full overflow-hidden relative">
                <div 
                   className="h-full bg-blue-500 transition-all duration-1000 ease-in-out shadow-[0_0_10px_rgba(59,130,246,0.8)]"
                   style={{ width: `${blueProgress}%` }}
                />
             </div>
             <div className="text-[10px] text-blue-400 font-bold tracking-widest mt-1">BLUE TEAM SYSTEM INTEGRITY: {Math.floor(blueProgress)}%</div>
          </div>
          
          <div className="bg-black/80 border border-cyber-green px-6 py-2 rounded text-2xl font-bold text-cyber-green text-glow-green tracking-widest mt-2">
            TIMER: {timeRemainingStr || '5:00'}
          </div>
        </div>
      )}

      {joined && gameStatus === 'playing' && (
        <div className={`absolute right-12 bottom-12 flex flex-col gap-4 z-40 ${blurUI ? 'blur-sm' : ''} ${disableHover ? 'pointer-events-none opacity-50' : ''}`}>
          {socket && players[socket.id] && (
          <>
            <div className="bg-cyber-darker/95 border border-cyber-green p-5 rounded-xl text-sm shadow-[0_0_20px_rgba(0,255,102,0.2)] backdrop-blur-xl w-72 relative transition-all">
              {isLocked && (
                 <div className="absolute inset-0 bg-cyber-red/90 z-20 flex flex-col items-center justify-center text-red-100 font-bold text-xl border-2 border-red-500 rounded-xl">
                    <span className="text-4xl mb-2">🔒</span>
                    TERMINAL LOCKED
                 </div>
              )}
              <h3 className="text-white font-display font-bold mb-3 uppercase border-b border-green-700/50 pb-2 tracking-widest text-glow-green">Terminal Access</h3>
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

              {isBlue && isNearBridge && logicBomb.active && (
                 <button 
                  onMouseDown={() => socket.emit('defuse_logic_bomb', true)}
                  onMouseUp={() => socket.emit('defuse_logic_bomb', false)}
                  onMouseLeave={() => socket.emit('defuse_logic_bomb', false)}
                  onTouchStart={() => socket.emit('defuse_logic_bomb', true)}
                  onTouchEnd={() => socket.emit('defuse_logic_bomb', false)}
                  className={`w-full mt-4 text-white font-bold py-3 px-4 rounded transition-colors border animate-pulse ${logicBomb.defusers.includes(socket.id) ? 'bg-blue-600 border-blue-400 box-glow-blue' : 'bg-red-900 hover:bg-red-700 border-red-500 box-glow-red'}`}
                 >
                   {logicBomb.defusers.includes(socket.id) ? 'DEFUSING...' : 'HOLD TO DEFUSE BOMB'}
                 </button>
              )}

              {!isBlue && !isTasking && !players[socket.id].isGhost && (
                 <button 
                  onClick={() => setIsTasking(true)}
                  className="w-full mt-4 bg-red-900 hover:bg-red-800 text-white font-bold py-2 px-4 rounded transition-colors border border-red-500 box-glow-red"
                 >
                   ACCESS TERMINAL
                 </button>
              )}

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
                {activeEffects.ui_scramble && <p className="text-cyber-green font-bold animate-pulse">- UI ENCRYPTED</p>}
                {activeEffects.latency_spike && <p className="text-cyber-red font-bold animate-pulse">- LATENCY HIGH</p>}
                {activeEffects.power_cut && <p className="text-gray-500 font-bold animate-pulse">- BLACKOUT</p>}
                {activeEffects.ceo_fraud_cooldown && <p className="text-cyber-red font-bold animate-pulse">- CEO FRAUD ACTIVE</p>}
                {activeEffects.total_lockdown && <p className="text-cyber-blue font-bold animate-pulse">- SYSTEM LOCKDOWN</p>}
              </div>
            )}
          </>
        )}
      </div>

      )}
      
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

        {logicBomb.active && (
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 z-30 bg-black/90 border-2 border-red-600 p-8 text-center animate-pulse box-glow-red rounded-lg min-w-[300px]">
            <h2 className="text-4xl font-bold text-red-500 tracking-widest text-glow-red mb-2">LOGIC BOMB</h2>
            <div className="text-5xl text-white font-mono font-bold">{Math.max(0, Math.ceil((logicBomb.endTime - Date.now()) / 1000))}s</div>
            <p className="text-red-400 mt-2 text-sm">Requires 2 unique Blue classes at Core to defuse!</p>
            <p className="text-gray-400 mt-1 text-xs">Defusers: {logicBomb.defusers.length}/2</p>
          </div>
        )}

        <div className="relative inline-block">
          <canvas 
            ref={canvasRef} 
            width={1024} 
            height={768} 
            style={{ maskImage: powerCut ? 'radial-gradient(circle 120px at center, black 60%, transparent 100%)' : 'none', WebkitMaskImage: powerCut ? 'radial-gradient(circle 120px at center, black 60%, transparent 100%)' : 'none' }}
            className={`border border-cyber-green bg-cyber-darker rounded-lg box-glow-green z-20 relative ${blurUI ? 'blur-sm' : ''} ${showGlitch ? 'animate-bounce' : ''}`}
          />
          {/* Virtual joystick for touchscreen / mobile */}
          <TouchControls
            engineRef={engineRef}
            isVisible={joined && gameStatus === 'playing' && !isTasking}
          />
        </div>
      </div>

      {isTasking && localPlayer && localPlayer.role && socket && (
        <TaskManager 
          role={localPlayer.role}  
          socket={socket} 
          activeEffects={activeEffects}
          nearTaskKeys={nearTaskKeys}
          sabotageCooldowns={sabotageCooldowns}
          droppedPackets={droppedPackets}
          setDroppedPackets={setDroppedPackets}
          playerTasks={localPlayer.tasks}
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


