import React, { useState, useEffect, useRef } from 'react';

// 1. Author A
export const BehavioralProfiling: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [selectedWord, setSelectedWord] = useState('');
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-xl font-bold text-red-500">Behavioral Profiling</h3>
      <p className="text-sm">Target Interest: "Coffee Lover". Complete the Phishing Template:</p>
      
      <div className="bg-gray-800 p-4 font-mono text-sm leading-8 border border-red-500">
        "Hello User, your recent order for <span className="inline-block min-w-[100px] border-b-2 border-red-400 text-yellow-300 text-center">{selectedWord || '_____'}</span> has been delayed."
      </div>
      
      <div className="grid grid-cols-2 gap-2 mt-4">
        {["Office Supplies", "Starbucks Voucher", "Tax Return", "IT Policy Update"].map(word => (
          <button 
            key={word}
            className="bg-gray-700 hover:bg-gray-600 p-2 border border-slate-500 transition-colors"
            onClick={() => {
              setSelectedWord(word);
              if (word === "Starbucks Voucher") {
                setTimeout(onComplete, 500);
              } else {
                alert("Target unlikely to click. Profiling mismatched.");
                setSelectedWord('');
              }
            }}
          >
            {word}
          </button>
        ))}
      </div>
    </div>
  );
};

// 2. Author B
export const PayloadObfuscation: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  // Simplified "Snake" maze. A grid where hovering a "wall" fails, must hover the "path" from Start to End.
  const [failed, setFailed] = useState(false);
  
  if (failed) {
    return (
      <div className="flex flex-col items-center gap-4">
        <h3 className="text-xl font-bold text-red-500">Payload Obfuscation</h3>
        <p className="text-red-400">AV Scanner Triggered!</p>
        <button className="bg-gray-800 p-2 border" onClick={() => setFailed(false)}>Retry Compile</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-xl font-bold text-red-500">Payload Obfuscation</h3>
      <p className="text-sm">Carefully move the mouse cursor from START to payload DROP without touching the AV Walls (Red).</p>
      
      <div className="relative w-80 h-80 bg-red-900 border-2 border-red-500" onMouseLeave={() => setFailed(true)}>
         {/* Safe Path */}
         <div className="absolute top-0 left-0 w-20 h-full bg-slate-900" onMouseEnter={(e) => e.stopPropagation()} />
         <div className="absolute top-32 left-0 w-full h-20 bg-slate-900" onMouseEnter={(e) => e.stopPropagation()} />
         <div className="absolute top-0 right-0 w-20 h-full bg-slate-900" onMouseEnter={(e) => e.stopPropagation()} />
         
         <div className="absolute top-2 left-2 bg-green-500 text-black px-2 py-1 font-bold text-xs pointer-events-none">START</div>
         
         <div 
           className="absolute bottom-2 right-2 bg-yellow-500 text-black px-4 py-2 font-bold cursor-pointer hover:bg-yellow-400"
           onMouseEnter={(e) => e.stopPropagation()}
           onClick={() => onComplete()}
         >
           DROP
         </div>
         
         {/* Red Walls (Fail zones) */}
         <div className="absolute top-0 left-20 w-60 h-32 bg-red-500/20" onMouseEnter={() => setFailed(true)} />
         <div className="absolute top-52 left-20 w-40 h-28 bg-red-500/20" onMouseEnter={() => setFailed(true)} />
      </div>
    </div>
  );
};

// 3. Cloner A
export const CertificateForgery: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [serial, setSerial] = useState("");
  const [issuer, setIssuer] = useState("");
  const [timer, setTimer] = useState(15);
  const targetSerial = "04:8A:2F:9B";
  const targetIssuer = "GlobalSign Fake CA";

  useEffect(() => {
    if (timer <= 0) {
      alert("Certificate Expired. Generator Timeout.");
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
export const DOMManipulation: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
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
export const PortScanning: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
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
            alert("HoneyPot Triggered! Scanner Reset.");
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
export const CredentialHarvester: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
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
