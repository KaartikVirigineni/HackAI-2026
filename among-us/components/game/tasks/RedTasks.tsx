import React, { useState, useEffect, useRef } from 'react';

// 1. Author A — Spear-Phishing Construction (Type-Racer)
export const BehavioralProfiling: React.FC<{ onComplete: () => void, onError: (msg: string) => void }> = ({ onComplete, onError }) => {
  const sentences = [
    "Please review the Q3 port docking protocols attached.",
    "Your MFA token has expired. Click here to re-verify.",
    "IT Security: Mandatory VPN recertification required now.",
    "Payroll has updated your direct deposit. Confirm details.",
  ];
  const [target] = useState(() => sentences[Math.floor(Math.random() * sentences.length)]);
  const [typed, setTyped] = useState('');
  const [flagged, setFlagged] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTyped(val);

    // Detect typo: compare character by character
    for (let i = 0; i < val.length; i++) {
      if (val[i] !== target[i]) {
        setFlagged(true);
        onError('[BLUE ALERT] Phishing email flagged as spam! Suspicious sender pattern detected.');
        setTyped('');
        return;
      }
    }
    setFlagged(false);
    if (val === target) onComplete();
  };

  return (
    <div className="flex flex-col gap-4 font-mono">
      <h3 className="text-xl font-bold text-red-500">Spear-Phishing Construction</h3>
      <p className="text-xs text-gray-400">Type the phishing sentence EXACTLY. One typo = Spam Flag (Blue Team gets an alert).</p>

      <div className="bg-slate-900 border border-red-700 p-3 text-sm leading-7 tracking-wide">
        {target.split('').map((ch, i) => {
          let color = 'text-gray-400';
          if (i < typed.length) color = typed[i] === ch ? 'text-green-400' : 'text-red-500';
          return <span key={i} className={color}>{ch}</span>;
        })}
      </div>

      <input
        ref={inputRef}
        type="text"
        value={typed}
        onChange={handleChange}
        className={`bg-black border p-2 text-white outline-none w-full font-mono ${flagged ? 'border-red-600 animate-pulse' : 'border-slate-600 focus:border-yellow-500'}`}
        placeholder="Start typing..."
        spellCheck={false}
        autoComplete="off"
      />

      {flagged && <p className="text-red-400 text-xs animate-pulse">⚠ SPAM FLAG — Try again. Blue Team notified.</p>}
      <p className="text-xs text-gray-500">Progress: {typed.length}/{target.length} chars</p>
    </div>
  );
};

// 2. Author B — Shadow Mirroring (HSB Color Slider)
export const PayloadObfuscation: React.FC<{ onComplete: () => void, onError: (msg: string) => void }> = ({ onComplete, onError }) => {
  const [targetHSB] = useState(() => ({
    h: Math.floor(Math.random() * 360),
    s: Math.floor(40 + Math.random() * 50), // 40–90%
    b: Math.floor(40 + Math.random() * 50), // 40–90%
  }));
  const [h, setH] = useState(180);
  const [s, setS] = useState(50);
  const [b, setB] = useState(50);
  const [submitted, setSubmitted] = useState(false);

  const hsbToRgb = (hh: number, ss: number, bb: number) => {
    const s2 = ss / 100, v2 = bb / 100;
    const C = v2 * s2;
    const X = C * (1 - Math.abs(((hh / 60) % 2) - 1));
    const m = v2 - C;
    let r = 0, g = 0, b2 = 0;
    if (hh < 60)  { r = C; g = X; }
    else if (hh < 120) { r = X; g = C; }
    else if (hh < 180) { g = C; b2 = X; }
    else if (hh < 240) { g = X; b2 = C; }
    else if (hh < 300) { r = X; b2 = C; }
    else              { r = C; b2 = X; }
    return `rgb(${Math.round((r+m)*255)},${Math.round((g+m)*255)},${Math.round((b2+m)*255)})`;
  };

  const targetColor = hsbToRgb(targetHSB.h, targetHSB.s, targetHSB.b);
  const userColor   = hsbToRgb(h, s, b);

  const similarity = () => {
    const dh = Math.abs(h - targetHSB.h);
    const ds = Math.abs(s - targetHSB.s);
    const db = Math.abs(b - targetHSB.b);
    // Hue wraps around 360
    const hDiff = Math.min(dh, 360 - dh);
    const score = 100 - (hDiff / 1.8 + ds + db) / 3;
    return Math.max(0, Math.round(score));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const pct = similarity();
    if (pct >= 95) {
      onComplete();
    } else {
      onError(`[BLUE ALERT] Clone mismatch detected! CSS fingerprint divergence: ${100-pct}%. Domain blacklist scan initiated.`);
      setTimeout(() => setSubmitted(false), 1500);
    }
  };

  return (
    <div className="flex flex-col gap-4 font-mono">
      <h3 className="text-xl font-bold text-red-500">Shadow Mirroring</h3>
      <p className="text-xs text-gray-400">Match the target login-page CSS color exactly. Must be ≥95% accurate or Blue Team is alerted.</p>

      <div className="flex gap-4 items-stretch">
        <div className="flex-1 flex flex-col items-center gap-1">
          <div className="text-xs text-gray-500">TARGET</div>
          <div className="w-full h-20 rounded border-2 border-slate-600" style={{ background: targetColor }} />
        </div>
        <div className="flex-1 flex flex-col items-center gap-1">
          <div className="text-xs text-gray-500">YOUR CLONE</div>
          <div className="w-full h-20 rounded border-2 border-slate-600" style={{ background: userColor }} />
        </div>
      </div>

      <div className="flex flex-col gap-2 text-xs">
        {([['H (Hue)', h, setH, 0, 359] as const, ['S (Saturation)', s, setS, 0, 100] as const, ['B (Brightness)', b, setB, 0, 100] as const]).map(([label, val, setter, min, max]) => (
          <div key={label} className="flex flex-col gap-1">
            <span className="text-gray-400">{label}: <span className="text-yellow-400">{val}{label.startsWith('H') ? '°' : '%'}</span></span>
            <input type="range" min={min} max={max} value={val} onChange={e => setter(Number(e.target.value))}
              className="w-full accent-red-500" />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">Similarity: <span className={similarity() >= 95 ? 'text-green-400' : 'text-yellow-400'}>{similarity()}%</span></span>
        <button
          onClick={handleSubmit}
          disabled={submitted}
          className="bg-red-900 border border-red-500 hover:bg-red-800 text-white font-bold px-4 py-2 text-sm disabled:opacity-50"
        >DEPLOY CLONE</button>
      </div>
    </div>
  );
};

// 3. Cloner A
export const CertificateForgery: React.FC<{ onComplete: () => void, onError: (msg: string) => void }> = ({ onComplete, onError }) => {
  const [serial, setSerial] = useState("");
  const [issuer, setIssuer] = useState("");
  const [timer, setTimer] = useState(15);
  const targetSerial = "04:8A:2F:9B";
  const targetIssuer = "GlobalSign Fake CA";

  useEffect(() => {
    if (timer <= 0) {
      onError("Certificate Expired. Generator Timeout.");
      setTimer(15);
      setSerial("");
      setIssuer("");
      return;
    }
    const int = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(int);
  }, [timer]);

  useEffect(() => {
    if (serial === targetSerial && issuer === targetIssuer) {
      onComplete();
    }
  }, [serial, issuer, onComplete]);

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-xl font-bold text-red-500">Certificate Forgery</h3>
      <p className="text-sm">Clone the root certificate details quickly!</p>
      
      <div className="bg-gray-800 border p-4 font-mono text-sm text-green-400">
        ISSUER: {targetIssuer}<br/>
        SERIAL: {targetSerial}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs text-gray-400">Target Issuer</label>
        <input 
          type="text" 
          className="bg-black border border-slate-600 p-2 text-white outline-none focus:border-red-500 pattern-match"
          value={issuer} 
          onChange={(e) => setIssuer(e.target.value)}
          placeholder="GlobalSign..."
        />
        
        <label className="text-xs text-gray-400">Target Serial (incl. colons)</label>
        <input 
          type="text" 
          className="bg-black border border-slate-600 p-2 text-white outline-none focus:border-red-500"
          value={serial} 
          onChange={(e) => setSerial(e.target.value)}
          placeholder="00:00..."
        />
      </div>

      <div className="text-right text-red-400 font-bold text-2xl">
        00:{timer.toString().padStart(2, '0')}
      </div>
    </div>
  );
};

// 4. Cloner B
export const DOMManipulation: React.FC<{ onComplete: () => void, onError: (msg: string) => void }> = ({ onComplete, onError }) => {
  const [blocks, setBlocks] = useState([
    { id: 1, text: '<div class="hidden-payload">' },
    { id: 2, text: '<img src="trusted-logo.png" />' },
    { id: 3, text: '<button>Fake Login</button>' },
    { id: 4, text: '</div>' }
  ].sort(() => Math.random() - 0.5));

  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  useEffect(() => {
    const isCorrect = blocks[0].id === 1 && blocks[1].id === 3 && blocks[2].id === 4 && blocks[3].id === 2;
    if (isCorrect) onComplete();
  }, [blocks, onComplete]);

  const swap = (idx: number) => {
    if (selectedIdx === null) setSelectedIdx(idx);
    else {
      const newBlocks = [...blocks];
      const temp = newBlocks[selectedIdx];
      newBlocks[selectedIdx] = newBlocks[idx];
      newBlocks[idx] = temp;
      setBlocks(newBlocks);
      setSelectedIdx(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-xl font-bold text-red-500">DOM Manipulation</h3>
      <p className="text-sm">Rearrange blocks so the Fake Login is wrapped in 'hidden-payload', and the trusted image is outside.</p>
      
      <div className="flex flex-col gap-2 bg-gray-900 p-4 border-2 border-slate-700">
        {blocks.map((b, i) => (
          <div 
            key={b.id} 
            onClick={() => swap(i)}
            className={`p-3 font-mono text-sm cursor-pointer transition-colors border-l-4 ${selectedIdx === i ? 'bg-blue-900 border-blue-400' : 'bg-gray-800 border-slate-500 hover:bg-gray-700'}`}
          >
            {b.text}
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500">Click a block, then click another to swap their positions.</p>
    </div>
  );
};

// 5. Scout A
export const PortScanning: React.FC<{ onComplete: () => void, onError: (msg: string) => void }> = ({ onComplete, onError }) => {
  const [cards, setCards] = useState([
    { id: 1, val: 80, matched: false, flipped: false },
    { id: 2, val: 80, matched: false, flipped: false },
    { id: 3, val: 443, matched: false, flipped: false },
    { id: 4, val: 443, matched: false, flipped: false },
    { id: 5, val: 22, matched: false, flipped: false },
    { id: 6, val: 22, matched: false, flipped: false },
    { id: 7, val: 'HoneyPot', matched: false, flipped: false },
    { id: 8, val: 'HoneyPot', matched: false, flipped: false }
  ].sort(() => Math.random() - 0.5));
  
  const [flippedIds, setFlippedIds] = useState<number[]>([]);

  useEffect(() => {
    if (flippedIds.length === 2) {
      const [id1, id2] = flippedIds;
      const c1 = cards.find(c => c.id === id1);
      const c2 = cards.find(c => c.id === id2);
      
      if (c1?.val === 'HoneyPot' || c2?.val === 'HoneyPot') {
         setTimeout(() => {
            onError("HoneyPot Triggered! Scanner Reset.");
            setCards(cards.map(c => ({...c, flipped: false, matched: false})).sort(() => Math.random() - 0.5));
            setFlippedIds([]);
         }, 800);
         return;
      }

      if (c1?.val === c2?.val) {
        setCards(prev => prev.map(c => c.id === id1 || c.id === id2 ? { ...c, matched: true } : c));
        setFlippedIds([]);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(c => (!c.matched ? { ...c, flipped: false } : c)));
          setFlippedIds([]);
        }, 1000);
      }
    }
  }, [flippedIds, cards]);

  useEffect(() => {
    const matchedCount = cards.filter(c => c.matched && c.val !== 'HoneyPot').length;
    if (matchedCount === 6) { // 3 pairs of pure ports
      onComplete();
    }
  }, [cards, onComplete]);

  return (
    <div className="flex flex-col gap-4 items-center w-full">
      <h3 className="text-xl font-bold text-red-500">Port Scanning</h3>
      <p className="text-sm text-center">Match open ports. AVOID THE HONEYPOTS.</p>
      
      <div className="grid grid-cols-4 gap-2 w-full mt-4">
         {cards.map(c => (
           <div 
             key={c.id} 
             onClick={() => {
               if (!c.flipped && !c.matched && flippedIds.length < 2) {
                 setCards(prev => prev.map(x => x.id === c.id ? { ...x, flipped: true } : x));
                 setFlippedIds(prev => [...prev, c.id]);
               }
             }}
             className={`h-20 flex items-center justify-center font-bold text-lg cursor-pointer transition-all border-2 rounded ${c.flipped || c.matched ? (c.val === 'HoneyPot' ? 'bg-red-600 border-red-400' : 'bg-green-700 border-green-400 text-white') : 'bg-gray-800 border-slate-600'}`}
           >
             {c.flipped || c.matched ? c.val : '?'}
           </div>
         ))}
      </div>
    </div>
  );
};

// 6. Scout B
export const CredentialHarvester: React.FC<{ onComplete: () => void, onError: (msg: string) => void }> = ({ onComplete, onError }) => {
  const [packets, setPackets] = useState<{id: number, text: string, type: string, top: number}[]>([]);
  const [score, setScore] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let idCounter = 0;
    const interval = setInterval(() => {
      idCounter++;
      const isCredData = Math.random() < 0.3;
      setPackets(prev => [...prev, {
        id: idCounter,
        text: isCredData ? (Math.random() < 0.5 ? 'Username: Admin' : 'Password: password123') : `TCP/IP Payload [${Math.floor(Math.random()*9000)}]`,
        type: isCredData ? 'cred' : 'junk',
        top: -20
      }]);
    }, 800);

    const moveInterval = setInterval(() => {
      setPackets(prev => prev.map(p => ({...p, top: p.top + 5})).filter(p => p.top < 200));
    }, 50);

    return () => { clearInterval(interval); clearInterval(moveInterval); };
  }, []);

  useEffect(() => {
    if (score >= 4) onComplete();
  }, [score, onComplete]);

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-xl font-bold text-red-500">Credential Harvester</h3>
      <p className="text-sm">Click ONLY the Username/Password packets in the data stream. Harvesed: {score}/4</p>
      
      <div ref={containerRef} className="relative w-full h-48 bg-black border border-green-500 overflow-hidden font-mono text-xs">
        {packets.map(p => (
           <div 
             key={p.id} 
             className={`absolute left-4 px-2 py-1 cursor-crosshair hover:bg-white/20 transition-colors ${p.type === 'cred' ? 'text-yellow-400' : 'text-slate-500'}`}
             style={{ top: `${p.top}px` }}
             onClick={() => {
               if (p.type === 'cred') {
                 setScore(s => s + 1);
                 setPackets(prev => prev.filter(x => x.id !== p.id));
               } else {
                 setScore(Math.max(0, score - 1)); // penalty
               }
             }}
           >
             {`> ${p.text}`}
           </div>
        ))}
      </div>
    </div>
  );
};
