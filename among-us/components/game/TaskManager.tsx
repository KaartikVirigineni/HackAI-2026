import React, { useState } from 'react';

import { 
  ForensicLogAnalysis, 
  SpfDkimVerification, 
  TrafficRerouting, 
  DecryptionKeyGen, 
  PatchManagement, 
  MalwareReverseEngineering,
  LogSieve,
  AclMatch,
  GeoFencing,
  ProcessKill,
  NodeIsolation,
  PriorityTriage,
  StringMatch,
  SignalToNoise,
  C2Heartbeat,
  EvidenceChain,
  HexHunt,
  PersistenceWipe,
  CriticalPatching,
  EntropyBoost,
  PortCloser,
  FeedScrubbing,
  APTAttribution,
  ThreatMap
} from './tasks/BlueTasks';

// RedTasks no longer rendered — Red roles now use Blue mini-games to "blend in"

interface TaskManagerProps {
  role: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  socket: any;
  activeEffects: Record<string, boolean>;
  sabotageCooldowns?: Record<string, number>;
  nearTaskKeys: string[];
  droppedPackets: Record<string, boolean>;
  setDroppedPackets: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  playerTasks?: Record<string, { isComplete: boolean; x: number; y: number }>; // Red team checks this for unlock
}

const TASK_INFO: Record<string, Record<string, string>> = {
  'The Author':         { A: 'Forensic Log Analysis [-6%]',     B: 'SPF/DKIM Verification [-8%]' },
  'The Cloner':         { A: 'Traffic Rerouting [-7%]',          B: 'Decryption Key Gen [-7%]' },
  'The Scout':          { A: 'Patch Management [-6%]',            B: 'Malware RE [-8%]' },
  'The Delivery Lead':  { A: 'SMTP Relay Setup [-6%]',            B: 'Botnet Sync [-8%]' },
  'The Auditor':       { A: 'Forensic Log Analysis [+7%]',     B: 'SPF/DKIM Verification [+8%]' },
  'The Gatekeeper':    { A: 'Traffic Rerouting [+7%]',          B: 'Decryption Key Gen [+9%]' },
  'The Incident Responder': { A: 'Patch Management [+8%]',     B: 'Malware RE [+8%]' },
  'The Trainer':       { A: 'Security Briefing [+5%]',          B: 'Phishing Simulation [+7%]' },
  'NetSec Operator':   { A: 'Log Sieve [+6%]',    B: 'ACL Match [+6%]',      C: 'Geo-Fencing [+6%]' },
  'CIRT Lead':         { A: 'Process Kill [+6%]', B: 'Node Isolation [+6%]', C: 'Priority Triage [+6%]' },
  'Detection Engineer':{ A: 'String Match [+6%]', B: 'Signal to Noise [+6%]',C: 'C2 Heartbeat [+6%]' },
  'DFIR Specialist':   { A: 'Evidence Chain [+6%]',B: 'Hex Hunt [+6%]',      C: 'Persistence Wipe [+6%]' },
  'SecOps Architect':  { A: 'Critical Patching [+6%]',B: 'Entropy Boost [+6%]',C: 'Port Closer [+6%]' },
  'CTI Analyst':       { A: 'Feed Scrubbing [+6%]',B: 'APT Attribution [+6%]',C: 'Threat Map [+6%]' }
};

// All 4 sabotage powers — every Red role unlocks ALL of these after completing 2 tasks
const ALL_RED_SABOTAGES: { type: string; name: string; desc: string }[] = [
  { type: 'logicBomb', name: 'Logic Bomb (Detonation)', desc: '45s countdown. Blue Team must have 2 different roles interact with the Core simultaneously to defuse.' },
  { type: 'uiScramble', name: 'UI Scramble (Log Encryption)', desc: 'For 20s, all Blue Team labels turn into 0x?? symbols.' },
  { type: 'latencySpike', name: 'Latency Spike (DDoS)', desc: 'For 20s, Blue Team must double-tap everything because the first tap is "dropped."' },
  { type: 'powerCut', name: 'Power Cut (Blackout)', desc: 'Reduces Blue Team vision to a small circle around their character for 20s.' },
];

export const TaskManager: React.FC<TaskManagerProps> = ({ role, socket, activeEffects, sabotageCooldowns = {}, nearTaskKeys, droppedPackets, setDroppedPackets, onClose, playerTasks = {} }) => {
  const [activeTaskKey, setActiveTaskKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const showError = (msg: string) => {
    setError(msg);
    setTimeout(() => setError(null), 3000);
  };

  const completeTask = (taskKey: string) => {
    socket.emit('task_complete', taskKey);
    onClose();
  };

  const triggerSabotage = (type: string) => {
    socket.emit('execute_sabotage', type);
    onClose();
  };

  const renderActiveTask = () => {
    if (activeTaskKey === 'A') {
      switch (role) {
        case 'The Author': return <ForensicLogAnalysis onComplete={() => completeTask('A')} onError={showError} />;
        case 'The Cloner': return <TrafficRerouting onComplete={() => completeTask('A')} onError={showError} />;
        case 'The Scout': return <PatchManagement onComplete={() => completeTask('A')} onError={showError} />;
        // Delivery Lead still TBD / Original logic
        case 'The Delivery Lead': return <div className="p-4 bg-red-900 border text-red-300 font-bold cursor-pointer hover:bg-red-700" onClick={() => completeTask('A')}>[Hold] SMTP Relay Override</div>;
        
        case 'The Auditor': return <ForensicLogAnalysis onComplete={() => completeTask('A')} onError={showError} />;
        case 'The Gatekeeper': return <TrafficRerouting onComplete={() => completeTask('A')} onError={showError} />;
        case 'The Incident Responder': return <PatchManagement onComplete={() => completeTask('A')} onError={showError} />;
        // Trainer still TBD / Original logic
        case 'The Trainer': return <div className="p-4 bg-blue-900 border text-blue-300 font-bold cursor-pointer hover:bg-blue-700" onClick={() => completeTask('A')}>[Spam] Send Briefings</div>;
        case 'NetSec Operator': return <LogSieve onComplete={() => completeTask('A')} onError={showError} />;
        case 'CIRT Lead': return <ProcessKill onComplete={() => completeTask('A')} onError={showError} />;
        case 'Detection Engineer': return <StringMatch onComplete={() => completeTask('A')} onError={showError} />;
        case 'DFIR Specialist': return <EvidenceChain onComplete={() => completeTask('A')} onError={showError} />;
        case 'SecOps Architect': return <CriticalPatching onComplete={() => completeTask('A')} onError={showError} />;
        case 'CTI Analyst': return <FeedScrubbing onComplete={() => completeTask('A')} onError={showError} />;
        default: return <div>Unknown Task A</div>;
      }
    } else if (activeTaskKey === 'B') {
      switch (role) {
        case 'The Author': return <SpfDkimVerification onComplete={() => completeTask('B')} onError={showError} />;
        case 'The Cloner': return <DecryptionKeyGen onComplete={() => completeTask('B')} onError={showError} />;
        case 'The Scout': return <MalwareReverseEngineering onComplete={() => completeTask('B')} onError={showError} />;
        // Delivery Lead still TBD / Original logic
        case 'The Delivery Lead': return <div className="p-4 bg-red-900 border text-red-300 font-bold cursor-pointer hover:bg-red-700" onClick={() => completeTask('B')}>[Sync] Botnet Targets</div>;

        case 'The Auditor': return <SpfDkimVerification onComplete={() => completeTask('B')} onError={showError} />;
        case 'The Gatekeeper': return <DecryptionKeyGen onComplete={() => completeTask('B')} onError={showError} />;
        case 'The Incident Responder': return <MalwareReverseEngineering onComplete={() => completeTask('B')} onError={showError} />;
        // Trainer still TBD / Original logic
        case 'The Trainer': return <div className="p-4 bg-blue-900 border text-blue-300 font-bold cursor-pointer hover:bg-blue-700" onClick={() => completeTask('B')}>[Identify] Vulnerable Bot</div>;
        case 'NetSec Operator': return <AclMatch onComplete={() => completeTask('B')} onError={showError} />;
        case 'CIRT Lead': return <NodeIsolation onComplete={() => completeTask('B')} onError={showError} />;
        case 'Detection Engineer': return <SignalToNoise onComplete={() => completeTask('B')} onError={showError} />;
        case 'DFIR Specialist': return <HexHunt onComplete={() => completeTask('B')} onError={showError} />;
        case 'SecOps Architect': return <EntropyBoost onComplete={() => completeTask('B')} onError={showError} />;
        case 'CTI Analyst': return <APTAttribution onComplete={() => completeTask('B')} onError={showError} />;
        default: return <div>Unknown Task B</div>;
      }
    } else if (activeTaskKey === 'C') {
      switch (role) {
         case 'NetSec Operator': return <GeoFencing onComplete={() => completeTask('C')} onError={showError} />;
         case 'CIRT Lead': return <PriorityTriage onComplete={() => completeTask('C')} onError={showError} />;
         case 'Detection Engineer': return <C2Heartbeat onComplete={() => completeTask('C')} onError={showError} />;
         case 'DFIR Specialist': return <PersistenceWipe onComplete={() => completeTask('C')} onError={showError} />;
         case 'SecOps Architect': return <PortCloser onComplete={() => completeTask('C')} onError={showError} />;
         case 'CTI Analyst': return <ThreatMap onComplete={() => completeTask('C')} onError={showError} />;
         default: return <div>Unknown Task C</div>;
      }
    }
    return null;
  };

  const RED_ROLES = ['The Author', 'The Cloner', 'The Scout', 'The Delivery Lead'];
  const isBluer = !RED_ROLES.includes(role);

  if (!isBluer && activeEffects.total_lockdown) {
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
        <div className="bg-cyber-darker border-4 border-cyber-red p-8 rounded-lg box-glow-red text-center w-full max-w-lg animate-pulse" style={{boxShadow: '0 0 50px rgba(239,68,68,0.5)'}}>
          <h2 className="text-4xl font-bold mb-4 text-white text-glow-red">TOTAL LOCKDOWN ACTIVE</h2>
          <p className="text-red-200 text-xl font-orbitron uppercase">System Frozen by Admins</p>
          <p className="text-red-300 mt-2 font-orbitron">Unable to execute payload...</p>
          <button 
            className="mt-8 bg-cyber-dark hover:bg-cyber-darker text-cyber-red font-bold py-2 px-8 rounded border border-cyber-red transition-colors"
            onClick={onClose}
          >
             DISCONNECT (CLOSE)
          </button>
        </div>
      </div>
    );
  }

  if (activeTaskKey === null && !isBluer) {
     const now = Date.now();

     // Count how many tasks this red player has completed
     const completedCount = Object.values(playerTasks).filter(t => t.isComplete).length;
     const tasksUnlocked = completedCount >= 2;

     const renderSabotageBtn = (type: string, name: string, desc: string) => {
        const cd = sabotageCooldowns[type] || 0;
        const isReady = tasksUnlocked && now >= cd;
        const left = (now >= cd) ? 0 : Math.ceil((cd - now) / 1000);
        return (
           <button 
             key={type}
             className={`p-4 text-left border-2 transition-colors ${
               !tasksUnlocked ? 'border-gray-800 bg-gray-950 text-gray-700 cursor-not-allowed opacity-50' :
               isReady ? 'border-red-500 bg-red-950 hover:bg-red-900 text-white' :
               'border-gray-700 bg-gray-900 text-gray-500 cursor-not-allowed'
             }`}
             onClick={() => isReady && triggerSabotage(type)}
             disabled={!isReady}
           >
             <div className="flex justify-between items-center">
                <span className="font-bold text-lg">{name}</span>
                {!tasksUnlocked && <span className="text-gray-600 text-xs font-mono">🔒 LOCKED</span>}
                {tasksUnlocked && !isReady && <span className="text-red-500 font-mono text-xl">{left}s</span>}
             </div>
             <div className="text-sm mt-1 text-gray-300">{desc}</div>
           </button>
        );
     };

     return (
       <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
         <div className="bg-cyber-darker border-2 border-red-600 p-6 rounded-lg box-glow-red w-full max-w-lg font-orbitron overflow-y-auto max-h-[90vh]">
           <h2 className="text-2xl font-bold mb-1 text-red-500 text-glow-red text-center">SABOTAGE TERMINAL</h2>
           <p className="text-center text-xs text-gray-500 mb-4 uppercase tracking-widest">{role}</p>

           {/* Task progress indicator */}
           <div className="bg-black border border-red-900 rounded p-3 mb-4">
             <div className="flex justify-between items-center mb-1">
               <span className="text-xs text-red-400 font-bold uppercase tracking-widest">Infiltration Tasks</span>
               <span className={`text-xs font-bold ${tasksUnlocked ? 'text-green-400' : 'text-yellow-400'}`}>
                 {completedCount}/2 {tasksUnlocked ? '✓ POWERS UNLOCKED' : '— Complete to unlock powers'}
               </span>
             </div>
             <div className="flex gap-2 mt-2">
               {Object.entries(TASK_INFO[role] || {}).map(([key, desc]) => {
                 const isDone = playerTasks[key]?.isComplete;
                 return (
                   <button
                     key={key}
                     disabled={isDone}
                     className={`flex-1 text-left text-xs px-3 py-2 border transition-colors ${
                       isDone ? 'border-green-700 bg-green-950 text-green-400 cursor-default' :
                       'border-red-700 bg-red-950 hover:bg-red-900 text-red-200 cursor-pointer'
                     }`}
                     onClick={() => !isDone && setActiveTaskKey(key)}
                   >
                     <div className="font-bold">{isDone ? '✓' : '▶'} Task {key}</div>
                     <div className="text-gray-400 text-[10px] mt-1 leading-tight">{desc.replace(/\[.*\]/, '').trim()}</div>
                   </button>
                 );
               })}
             </div>
           </div>

           {/* Sabotage powers section */}
           <div className="mb-4">
             <p className="text-xs text-red-400 font-bold uppercase tracking-widest mb-2">
               {tasksUnlocked ? 'Sabotage Powers' : '🔒 Sabotage Powers (complete 2 tasks to unlock)'}
             </p>
             <div className="flex flex-col gap-3">
               <button 
                  className="p-3 text-left border-2 border-orange-500 bg-orange-950 hover:bg-orange-900 text-white transition-colors"
                  onClick={onClose}
               >
                 <div className="font-bold">Fake Task (Blend In)</div>
                 <div className="text-sm mt-1 text-gray-300">Stand near a task node to look like Admin.</div>
               </button>
               {ALL_RED_SABOTAGES.map(s => renderSabotageBtn(s.type, s.name, s.desc))}
             </div>
           </div>

           <button 
             className="mt-2 bg-cyber-dark hover:bg-gray-800 text-gray-300 font-bold py-2 px-8 w-full rounded border border-gray-600 transition-colors"
             onClick={onClose}
           >
             CANCEL / CLOSE
           </button>
         </div>
       </div>
     );
  }

  if (activeTaskKey === null) {
    // Blue Team Task Rendering
    const isUiScrambled = activeEffects.ui_scramble;
    const isLatencySpike = activeEffects.latency_spike;

    const scrambleString = (str: string) => {
       if (!isUiScrambled) return str;
       return str.split('').map(() => Math.random() > 0.5 ? '0x' + Math.floor(Math.random()*256).toString(16).toUpperCase() : '?').join('').substring(0, Math.max(str.length, 4));
    };

    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="bg-cyber-darker border-2 border-cyber-green p-8 rounded-lg box-glow-green text-center w-full max-w-lg font-orbitron">
          <h2 className="text-3xl font-bold mb-6 text-cyber-green text-glow-green">
             {scrambleString("AVAILABLE DIRECTIVES")}
          </h2>
          
          <div className="flex flex-col gap-4">
            {Object.entries(TASK_INFO[role] || {}).map(([key, description]) => {
              const inRange = nearTaskKeys.includes(key);
              const isDropped = isLatencySpike && !droppedPackets[key];

              return (
                <button 
                  key={key}
                  className={`p-4 text-xl font-bold border-2 transition-colors relative overflow-hidden ${isBluer ? 'border-cyber-blue hover:bg-cyber-dark text-cyber-blue' : 'border-cyber-red hover:bg-cyber-dark text-cyber-red'} ${!inRange ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                  onClick={() => {
                     if (!inRange) return;
                     if (isDropped) {
                        setDroppedPackets(prev => ({...prev, [key]: true}));
                        return;
                     }
                     setActiveTaskKey(key);
                  }}
                  disabled={!inRange}
                >
                  {isDropped && droppedPackets[key] === undefined && (
                     <span className="absolute inset-0 flex items-center justify-center bg-red-900/80 text-white animate-pulse z-10 font-bold tracking-widest text-2xl" style={{ display: 'none' }}>
                        {/* Hidden initial state */}
                     </span>
                  )}
                  {isDropped && droppedPackets[key] === false && (
                      <span className="absolute inset-0 flex items-center justify-center bg-red-900/90 text-white z-10 font-bold tracking-widest text-2xl">
                        PACKET DROPPED
                     </span>
                  )}
                  {/* Since we set droppedPackets[key] = true, the next click works. If it isn't in droppedPackets yet but clicked, we need to show PACKET DROPPED visually.
                      Actually, let's just use droppedPackets to flag what HAS been clicked once. So if !droppedPackets[key], it's dropped.
                   */}
                  
                  {isLatencySpike && !droppedPackets[key] ? (
                     <span className="opacity-80">EXECUTE TASK ({key}): {scrambleString(description)}</span>
                  ) : (
                     <span className={activeEffects.latency_spike ? 'text-white' : ''}>EXECUTE TASK ({key}): {scrambleString(description)} {inRange ? '' : '[TOO FAR]'}</span>
                  )}
                </button>
              );
            })}
          </div>

          <button 
            className="mt-8 bg-cyber-dark hover:bg-gray-800 text-gray-300 font-bold py-2 px-8 rounded border border-gray-600 transition-colors"
            onClick={onClose}
          >
            CANCEL / CLOSE
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/95 font-orbitron overflow-hidden">
      <div className="bg-cyber-darker border border-cyber-green p-8 rounded-lg min-w-[500px] box-glow-green relative">
        {error && (
          <div className="absolute top-0 left-0 right-0 bg-red-600/90 text-white py-2 px-4 text-center font-bold animate-slide-down transform transition-all z-[60] border-b border-red-400">
            {error}
          </div>
        )}
        {renderActiveTask()}
        
        <button 
            className="mt-8 bg-cyber-dark hover:bg-gray-900 text-gray-300 font-bold p-2 w-full transition-colors border-t-2 border-gray-600"
            onClick={() => setActiveTaskKey(null)}
          >
            ABORT TASK
        </button>
      </div>
    </div>
  );
};
