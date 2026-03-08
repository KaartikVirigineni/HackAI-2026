import React, { useState, useEffect, useRef } from 'react';

// 1. Auditor A
export const ForensicLogAnalysis: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [logs] = useState([
    "AUTH SUCCESS: local_admin (192.168.1.5)",
    "DB_QUERY: req_latency=45ms",
    "AUTH SUCCESS: guest_user (10.0.0.44)",
    "CRITICAL: UNAUTHORIZED ACCESS (RU_IP: 194.55.2.1)",
    "PING: heartbeat_ok",
    "FILE_DOWNLOAD: report_q3.pdf"
  ]);

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-xl font-bold text-blue-500">Forensic Log Analysis</h3>
      <p className="text-sm">Highlight the unauthorized access attempt from a non-standard IP:</p>
      <div className="bg-black p-4 font-mono text-xs overflow-y-auto h-48 border border-green-500">
        {logs.map((log, i) => (
          <div 
            key={i} 
            className="cursor-pointer hover:bg-white/20 p-1 mb-1 transition-colors"
            onClick={() => {
              if (log.includes("UNAUTHORIZED")) onComplete();
              else alert("Standard log. Keep looking.");
            }}
          >
            {`[${new Date().toISOString()}] ${log}`}
          </div>
        ))}
      </div>
    </div>
  );
};

// 2. Auditor B
export const SpfDkimVerification: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [selectedLock, setSelectedLock] = useState<number | null>(null);
  const [locks, setLocks] = useState([{ id: 1, type: 'Square', matched: false }, { id: 2, type: 'Circle', matched: false }, { id: 3, type: 'Triangle', matched: false }]);
  const [keys] = useState([{ id: 1, type: 'Triangle' }, { id: 2, type: 'Square' }, { id: 3, type: 'Circle' }]);
  const [selectedKey, setSelectedKey] = useState<number | null>(null);

  useEffect(() => {
    if (selectedLock !== null && selectedKey !== null) {
      const lock = locks.find(l => l.id === selectedLock);
      const key = keys.find(k => k.id === selectedKey);
      if (lock && key && lock.type === key.type) {
        setLocks(prev => prev.map(l => l.id === selectedLock ? { ...l, matched: true } : l));
      } else {
        alert("Verification Failed!");
      }
      setSelectedLock(null);
      setSelectedKey(null);
    }
  }, [selectedLock, selectedKey]);

  useEffect(() => {
    if (locks.every(l => l.matched)) onComplete();
  }, [locks, onComplete]);

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-xl font-bold text-blue-500">SPF/DKIM Verification</h3>
      <p className="text-sm">Select a Key, then select its matching Lock.</p>
      
      <div className="flex justify-between items-center mb-4">
        <div className="flex flex-col gap-2">
          <p className="text-center font-bold">KEYS</p>
          {keys.map(k => (
            <button 
              key={k.id} 
              className={`p-4 border-2 ${selectedKey === k.id ? 'border-yellow-400 bg-yellow-400/20' : 'border-blue-500 bg-gray-800'}`}
              onClick={() => setSelectedKey(k.id)}
            >
              {k.type}
            </button>
          ))}
        </div>
        <div className="text-2xl font-bold text-gray-500">→</div>
        <div className="flex flex-col gap-2">
          <p className="text-center font-bold">INBOX LOCKS</p>
          {locks.map(l => (
            <button 
              key={l.id} 
              className={`p-4 border-2 ${l.matched ? 'border-green-500 bg-green-500/20' : (selectedLock === l.id ? 'border-red-400' : 'border-gray-500 bg-gray-900')}`}
              onClick={() => !l.matched && setSelectedLock(l.id)}
              disabled={l.matched}
            >
              {l.matched ? 'VERIFIED' : l.type + ' Lock'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// 3. Gatekeeper A
export const TrafficRerouting: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  // Simplified Pipe Dream: 3 pipes must be aligned horizontally (-)
  const [pipes, setPipes] = useState([90, 0, 270]); // rotation in degrees

  const rotatePipe = (index: number) => {
    setPipes(prev => {
      const next = [...prev];
      next[index] = (next[index] + 90) % 360;
      return next;
    });
  };

  useEffect(() => {
    if (pipes.every(p => p === 0 || p === 180)) {
      onComplete();
    }
  }, [pipes, onComplete]);

  return (
    <div className="flex flex-col gap-4 items-center">
      <h3 className="text-xl font-bold text-blue-500">Traffic Rerouting</h3>
      <p className="text-sm text-center">Rotate the pipes to connect the Clean Traffic line.</p>
      <div className="flex items-center gap-1 mt-4">
        <div className="bg-green-500 text-black px-2 py-1 font-bold">IN</div>
        {pipes.map((rot, i) => (
          <div 
            key={i}
            className="w-16 h-16 bg-gray-800 border-2 border-slate-600 flex items-center justify-center cursor-pointer hover:bg-gray-700"
            onClick={() => rotatePipe(i)}
          >
            <div className="w-full h-4 bg-green-400 transition-transform duration-200" style={{ transform: `rotate(${rot}deg)` }} />
          </div>
        ))}
        <div className="bg-green-500 text-black px-2 py-1 font-bold">OUT</div>
      </div>
    </div>
  );
};

// 4. Gatekeeper B
export const DecryptionKeyGen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [val, setVal] = useState("");
  // Pattern: powers of 2 (2, 4, 8, 16, 32)
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-xl font-bold text-blue-500">Decryption Key Gen</h3>
      <p className="text-sm">Solve the mathematical sequence to generate the key:</p>
      <div className="text-3xl font-mono tracking-widest text-center text-yellow-300 bg-black p-4 rounded border border-yellow-500/50">
        2, 4, 8, 16, ?
      </div>
      <input 
        type="number" 
        className="bg-gray-800 border-2 border-blue-500 p-4 text-center text-2xl font-mono focus:outline-none"
        placeholder="Enter next number..."
        value={val}
        onChange={(e) => {
          setVal(e.target.value);
          if (e.target.value === "32") {
            onComplete();
          }
        }}
        autoFocus
      />
    </div>
  );
};

// 5. Responder A
export const PatchManagement: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [moles, setMoles] = useState(Array(9).fill(false));
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (score >= 5) {
      onComplete();
      return;
    }
    const interval = setInterval(() => {
      setMoles(prev => {
        const next = [...prev];
        const randIdx = Math.floor(Math.random() * 9);
        next[randIdx] = true;
        // Auto hide after 1 sec
        setTimeout(() => {
          setMoles(current => {
            const arr = [...current];
            arr[randIdx] = false;
            return arr;
          });
        }, 1200);
        return next;
      });
    }, 800);
    return () => clearInterval(interval);
  }, [score, onComplete]);

  return (
    <div className="flex flex-col gap-4 items-center">
      <h3 className="text-xl font-bold text-blue-500">Patch Management</h3>
      <p className="text-sm">Click vulnerabilities (Red) to patch them. Target: 5</p>
      <p className="font-bold text-green-400">Patched: {score}/5</p>
      <div className="grid grid-cols-3 gap-2 bg-gray-900 p-4 border-2 border-gray-700 rounded-lg">
        {moles.map((isVuln, i) => (
          <button
            key={i}
            className={`w-16 h-16 rounded-full border-4 transition-colors ${isVuln ? 'bg-red-500 border-red-300' : 'bg-green-900 border-green-700'}`}
            onClick={() => {
              if (isVuln) {
                setMoles(prev => { const n = [...prev]; n[i] = false; return n; });
                setScore(s => s + 1);
              }
            }}
          />
        ))}
      </div>
    </div>
  );
};

// 6. Responder B
export const MalwareReverseEngineering: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const targetSeq = ['↑', '↓', '←', '→', '↑'];
  const answerSeq = ['↑', '→', '←', '↓', '↑']; // reverse
  const [inputSeq, setInputSeq] = useState<string[]>([]);

  useEffect(() => {
    if (inputSeq.length === answerSeq.length) {
      if (inputSeq.every((val, i) => val === answerSeq[i])) {
        onComplete();
      } else {
        alert("Sequence failed. Resetting payload.");
        setInputSeq([]);
      }
    }
  }, [inputSeq, answerSeq, onComplete]);

  return (
    <div className="flex flex-col gap-4 items-center">
      <h3 className="text-xl font-bold text-blue-500">Malware Reverse Engineering</h3>
      <p className="text-sm">Memorize the sequence, then enter it in REVERSE.</p>
      
      <div className="flex gap-2 p-4 bg-black border border-red-500 mb-4 rounded items-center justify-center w-full">
        {targetSeq.map((dir, i) => <span key={i} className="text-3xl text-red-500 font-bold">{dir}</span>)}
      </div>

      <div className="flex gap-2">
         {['↑', '↓', '←', '→'].map(dir => (
           <button 
             key={dir} 
             className="w-14 h-14 bg-gray-800 border-2 border-blue-500 text-2xl hover:bg-blue-900 transition-colors"
             onClick={() => setInputSeq(prev => [...prev, dir])}
           >
             {dir}
           </button>
         ))}
      </div>
      
      <div className="mt-4 flex gap-2 h-10 items-center justify-center">
        {inputSeq.map((dir, i) => <span key={i} className="text-2xl text-blue-400">{dir}</span>)}
      </div>
    </div>
  );
};
