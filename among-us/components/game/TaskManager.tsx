import React, { useState } from 'react';

import { 
  ForensicLogAnalysis, 
  SpfDkimVerification, 
  TrafficRerouting, 
  DecryptionKeyGen, 
  PatchManagement, 
  MalwareReverseEngineering 
} from './tasks/BlueTasks';

import {
  BehavioralProfiling,
  PayloadObfuscation,
  CertificateForgery,
  DOMManipulation,
  PortScanning,
  CredentialHarvester
} from './tasks/RedTasks';

interface TaskManagerProps {
  role: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  socket: any;
  activeEffects: Record<string, boolean>;
  nearTaskKeys: ('A'|'B')[];
  onClose: () => void;
}

const TASK_INFO: Record<string, {A: string, B: string}> = {
  'The Author': { A: 'Behavioral Profiling [-6%]', B: 'Payload Obfuscation [-8%]' },
  'The Cloner': { A: 'Certificate Forgery [-7%]', B: 'DOM Manipulation [-7%]' },
  'The Scout': { A: 'Port Scanning [-6%]', B: 'Credential Harvester [-8%]' },
  'The Delivery Lead': { A: 'SMTP Relay Setup [-6%]', B: 'Botnet Sync [-8%]' },
  'The Auditor': { A: 'Forensic Log Analysis [+7%]', B: 'SPF/DKIM Verification [+8%]' },
  'The Gatekeeper': { A: 'Traffic Rerouting [+7%]', B: 'Decryption Key Gen [+9%]' },
  'The Incident Responder': { A: 'Patch Management [+8%]', B: 'Malware RE [+8%]' },
  'The Trainer': { A: 'Security Briefing [+5%]', B: 'Phishing Simulation [+7%]' }
};

export const TaskManager: React.FC<TaskManagerProps> = ({ role, socket, activeEffects, nearTaskKeys, onClose }) => {
  const [activeTaskKey, setActiveTaskKey] = useState<'A' | 'B' | null>(null);

  const completeTask = (taskKey: 'A' | 'B') => {
    socket.emit('task_complete', taskKey);
    onClose();
  };

  const renderActiveTask = () => {
    if (activeTaskKey === 'A') {
      switch (role) {
        case 'The Author': return <BehavioralProfiling onComplete={() => completeTask('A')} />;
        case 'The Cloner': return <CertificateForgery onComplete={() => completeTask('A')} />;
        case 'The Scout': return <PortScanning onComplete={() => completeTask('A')} />;
        // Delivery Lead still TBD / Original logic
        case 'The Delivery Lead': return <div className="p-4 bg-red-900 border text-red-300 font-bold cursor-pointer hover:bg-red-700" onClick={() => completeTask('A')}>[Hold] SMTP Relay Override</div>;
        
        case 'The Auditor': return <ForensicLogAnalysis onComplete={() => completeTask('A')} />;
        case 'The Gatekeeper': return <TrafficRerouting onComplete={() => completeTask('A')} />;
        case 'The Incident Responder': return <PatchManagement onComplete={() => completeTask('A')} />;
        // Trainer still TBD / Original logic
        case 'The Trainer': return <div className="p-4 bg-blue-900 border text-blue-300 font-bold cursor-pointer hover:bg-blue-700" onClick={() => completeTask('A')}>[Spam] Send Briefings</div>;
        default: return <div>Unknown Task A</div>;
      }
    } else if (activeTaskKey === 'B') {
      switch (role) {
        case 'The Author': return <PayloadObfuscation onComplete={() => completeTask('B')} />;
        case 'The Cloner': return <DOMManipulation onComplete={() => completeTask('B')} />;
        case 'The Scout': return <CredentialHarvester onComplete={() => completeTask('B')} />;
        // Delivery Lead still TBD / Original logic
        case 'The Delivery Lead': return <div className="p-4 bg-red-900 border text-red-300 font-bold cursor-pointer hover:bg-red-700" onClick={() => completeTask('B')}>[Sync] Botnet Targets</div>;

        case 'The Auditor': return <SpfDkimVerification onComplete={() => completeTask('B')} />;
        case 'The Gatekeeper': return <DecryptionKeyGen onComplete={() => completeTask('B')} />;
        case 'The Incident Responder': return <MalwareReverseEngineering onComplete={() => completeTask('B')} />;
        // Trainer still TBD / Original logic
        case 'The Trainer': return <div className="p-4 bg-blue-900 border text-blue-300 font-bold cursor-pointer hover:bg-blue-700" onClick={() => completeTask('B')}>[Identify] Vulnerable Bot</div>;
        default: return <div>Unknown Task B</div>;
      }
    }
    return null;
  };

  const isBluer = ['The Auditor', 'The Gatekeeper', 'The Incident Responder', 'The Trainer'].includes(role);
  const isRed = !isBluer;

  if (isRed && activeEffects.total_lockdown) {
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

  if (activeTaskKey === null) {
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="bg-cyber-darker border-2 border-cyber-green p-8 rounded-lg box-glow-green text-center w-full max-w-lg font-orbitron">
          <h2 className="text-3xl font-bold mb-6 text-cyber-green text-glow-green">AVAILABLE DIRECTIVES</h2>
          
          <div className="flex flex-col gap-4">
            <button 
              className={`p-4 text-xl font-bold border-2 transition-colors ${isBluer ? 'border-cyber-blue hover:bg-cyber-dark text-cyber-blue' : 'border-cyber-red hover:bg-cyber-dark text-cyber-red'} ${!nearTaskKeys.includes('A') ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
              onClick={() => nearTaskKeys.includes('A') && setActiveTaskKey('A')}
              disabled={!nearTaskKeys.includes('A')}
            >
              EXECUTE TASK (A): {TASK_INFO[role]?.A || 'Unknown'} {nearTaskKeys.includes('A') ? '' : '[TOO FAR]'}
            </button>
            <button 
              className={`p-4 text-xl font-bold border-2 transition-colors ${isBluer ? 'border-cyber-blue hover:bg-cyber-dark text-cyber-blue' : 'border-orange-500 hover:bg-orange-900 text-orange-300'} ${!nearTaskKeys.includes('B') ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
              onClick={() => nearTaskKeys.includes('B') && setActiveTaskKey('B')}
              disabled={!nearTaskKeys.includes('B')}
            >
              EXECUTE TASK (B): {TASK_INFO[role]?.B || 'Unknown'} {nearTaskKeys.includes('B') ? '' : '[TOO FAR]'}
            </button>
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
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/95 font-orbitron">
      <div className="bg-cyber-darker border border-cyber-green p-8 rounded-lg min-w-[500px] box-glow-green">
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
