"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateUserPoints } from "@/app/actions/user";

interface MCQOption {
  id: string;
  text: string;
}

interface TriviaQuestion {
  id: number;
  question: string;
  options: MCQOption[];
  correctOptionId: string;
  explanation: string;
}

const SECONDS_PER_QUESTION = 15;
const BASE_POINTS = 100;
const TIME_MULTIPLIER = 10;

export default function TriviaPage() {
  const router = useRouter();
  
  // Game State
  const [gameState, setGameState] = useState<'loading' | 'playing' | 'finished'>('loading');
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // Live Match State
  const [timeLeft, setTimeLeft] = useState(SECONDS_PER_QUESTION);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerResults, setAnswerResults] = useState<{
     question: string; 
     correct: boolean; 
     pointsEarned: number;
     explanation: string;
  }[]>([]);
  const [agentUsername, setAgentUsername] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'pending' | 'syncing' | 'synced' | 'failed'>('pending');
  const [newRank, setNewRank] = useState<string | null>(null);

  // Timer logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'playing' && selectedAnswer === null && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
             clearInterval(timer);
             handleTimeOut();
             return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState, selectedAnswer, timeLeft]);

  // Fetch Questions on mount
  useEffect(() => {
    const fetchTrivia = async () => {
      try {
        const res = await fetch("/api/trivia");
        if (!res.ok) throw new Error("Failed to initialize trivia data stream.");
        
        const data = await res.json() as TriviaQuestion[];
        if (Array.isArray(data) && data.length === 5) {
           setQuestions(data);
           setGameState('playing');
        } else {
           throw new Error("Received malformed trivia packet.");
        }
      } catch (err: any) {
        setError(err.message || "Unknown error generating trivia.");
      }
    };
    fetchTrivia();

    // Check auth
    const storedUsername = localStorage.getItem("agentUsername");
    if (storedUsername) {
       setAgentUsername(storedUsername);
    }
  }, []);

  // Sync points when game finishes
  useEffect(() => {
    if (gameState === 'finished' && agentUsername && score > 0 && syncStatus === 'pending') {
      const syncPoints = async () => {
        setSyncStatus('syncing');
        try {
          const res = await updateUserPoints(agentUsername, score);
          if (res.success) {
            setSyncStatus('synced');
            if (res.newRank) setNewRank(res.newRank);
          } else {
            setSyncStatus('failed');
          }
        } catch (err) {
          console.error("Failed to sync points:", err);
          setSyncStatus('failed');
        }
      };
      syncPoints();
    } else if (gameState === 'finished' && score === 0) {
       setSyncStatus('synced'); // Nothing to sync
    }
  }, [gameState, agentUsername, score, syncStatus]);

  const handleTimeOut = useCallback(() => {
     handleAnswerSubmission("TIMEOUT");
  }, [currentIndex, questions]);

  const handleAnswerSubmission = (optionId: string) => {
    if (selectedAnswer !== null) return; // Prevent double clicking
    setSelectedAnswer(optionId);
    
    setTimeout(() => {
       const currentQ = questions[currentIndex];
       const isCorrect = optionId === currentQ.correctOptionId;
       
       let pointsEarned = 0;
       if (isCorrect) {
          pointsEarned = BASE_POINTS + (timeLeft * TIME_MULTIPLIER);
          setScore(prev => prev + pointsEarned);
       }

       // Record result for debrief
       setAnswerResults(prev => [...prev, {
         question: currentQ.question,
         correct: isCorrect,
         pointsEarned,
         explanation: currentQ.explanation
       }]);

       // Move to next question or finish
       setTimeout(() => {
           if (currentIndex < questions.length - 1) {
              setCurrentIndex(prev => prev + 1);
              setSelectedAnswer(null);
              setTimeLeft(SECONDS_PER_QUESTION);
           } else {
              setGameState('finished');
           }
       }, 2000); // Wait 2s to show success/failure before advancing
       
    }, 500); // Small 500ms delay to simulate processing click
  };


  if (gameState === 'loading') {
    return (
      <div className="min-h-screen bg-cyber-dark font-inter flex flex-col justify-center items-center py-20 px-4 relative overflow-hidden">
        {/* Background Network */}
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: `linear-gradient(rgba(0, 243, 255, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 243, 255, 0.2) 1px, transparent 1px)`, backgroundSize: "50px 50px" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyber-blue rounded-full mix-blend-screen filter blur-[200px] opacity-20 animate-pulse-slow z-0"></div>
        
        <div className="relative z-10 flex flex-col items-center gap-8 text-center">
            {error ? (
              <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-8 backdrop-blur-lg">
                <span className="text-5xl mb-4 block">⚠️</span>
                <h2 className="font-orbitron text-red-500 text-xl font-bold tracking-widest uppercase mb-2">Simulation Corrupted</h2>
                <p className="text-red-400 text-sm max-w-sm">{error}</p>
                <button onClick={() => window.location.reload()} className="mt-8 px-6 py-2 border border-red-500/50 text-red-500 rounded hover:bg-red-500/10 font-orbitron transition-colors text-xs tracking-widest uppercase animate-pulse">Retry Connection</button>
              </div>
            ) : (
               <>
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-t-4 border-b-4 border-cyber-blue animate-spin duration-1000"></div>
                  <div className="absolute inset-3 rounded-full border-r-4 border-l-4 border-cyber-green animate-spin animate-reverse duration-700"></div>
                  <div className="absolute inset-6 rounded-full border-t-4 border-b-4 border-white opacity-50 animate-spin duration-500"></div>
                  <span className="text-4xl text-cyber-blue text-glow-blue animate-pulse">⚡</span>
                </div>
                <div className="space-y-4">
                  <h1 className="text-3xl font-orbitron font-bold text-cyber-blue tracking-widest uppercase text-glow-blue animate-pulse">
                    Initializing Live Fire
                  </h1>
                  <p className="text-cyber-green font-mono tracking-widest text-sm uppercase">
                    Generating dynamic security threats...
                  </p>
                </div>
              </>
            )}
        </div>
      </div>
    );
  }

  if (gameState === 'finished') {
    const perfectScore = questions.length * (BASE_POINTS + (SECONDS_PER_QUESTION * TIME_MULTIPLIER));
    const accuracy = (answerResults.filter(r => r.correct).length / questions.length) * 100;

    return (
       <div className="min-h-screen bg-cyber-dark font-inter py-12 px-4 sm:px-6 relative selection:bg-cyber-blue selection:text-cyber-dark">
        {/* Background Decor */}
        <div className="fixed inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: `linear-gradient(rgba(0, 243, 255, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 243, 255, 0.2) 1px, transparent 1px)`, backgroundSize: "50px 50px" }} />
        
        <div className="relative z-10 max-w-4xl mx-auto space-y-12 animate-fade-in-up">
           
           {/* Header */}
           <div className="text-center space-y-4">
              <h1 className="text-4xl sm:text-6xl font-orbitron font-bold text-white uppercase tracking-widest text-glow-blue drop-shadow-[0_0_15px_rgba(0,243,255,0.5)]">
                Mission Debrief
              </h1>
              <p className="text-cyber-blue/80 text-lg uppercase tracking-wider font-orbitron">
                Simulation Complete. Analyzing agent performance.
              </p>
           </div>

           {/* Score Card */}
           <div className="bg-cyber-darker/80 border border-cyber-blue/30 backdrop-blur-xl rounded-2xl p-8 sm:p-12 shadow-[0_0_50px_rgba(0,243,255,0.1)] flex flex-col md:flex-row items-center justify-around gap-8">
              <div className="text-center space-y-2">
                 <div className="text-sm font-orbitron text-gray-400 tracking-widest uppercase">Total Score</div>
                 <div className="text-6xl sm:text-7xl font-bold font-inter text-cyber-green text-glow-green">
                    {score.toLocaleString()}
                 </div>
                 <div className="text-xs text-cyber-green/50 font-mono pt-2">MAX POSSIBLE: {perfectScore.toLocaleString()}</div>
              </div>
              <div className="h-px w-full md:w-px md:h-32 bg-cyber-blue/20"></div>
              <div className="text-center space-y-2">
                 <div className="text-sm font-orbitron text-gray-400 tracking-widest uppercase">Accuracy Rating</div>
                 <div className={`text-5xl sm:text-6xl font-bold font-inter ${accuracy === 100 ? 'text-cyber-blue text-glow-blue' : accuracy >= 60 ? 'text-cyber-green text-glow-green' : 'text-red-500'}`}>
                    {accuracy}%
                 </div>
                  <div className="text-xs text-gray-500 font-mono pt-2">{answerResults.filter(r => r.correct).length} / {questions.length} CORRECT</div>
              </div>
           </div>

           {/* Sync Status Overlay / Indicator */}
           <div className="flex justify-center">
              <div className={`px-4 py-2 rounded-full border text-xs font-orbitron tracking-widest uppercase flex items-center gap-2 ${
                syncStatus === 'synced' ? 'bg-cyber-green/10 border-cyber-green text-cyber-green' :
                syncStatus === 'syncing' ? 'bg-cyber-blue/10 border-cyber-blue text-cyber-blue animate-pulse' :
                syncStatus === 'failed' ? 'bg-red-500/10 border-red-500 text-red-500' :
                'bg-gray-800 border-gray-700 text-gray-500'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  syncStatus === 'synced' ? 'bg-cyber-green box-glow-green' :
                  syncStatus === 'syncing' ? 'bg-cyber-blue' :
                  syncStatus === 'failed' ? 'bg-red-500' :
                  'bg-gray-600'
                }`}></div>
                {syncStatus === 'synced' ? 'Points Securely Uplinked' :
                 syncStatus === 'syncing' ? 'Syncing with Databank...' :
                 syncStatus === 'failed' ? 'Uplink Failed' :
                 'Awaiting Sync...'}
                {newRank && syncStatus === 'synced' && (
                  <span className="ml-2 border-l border-cyber-green/30 pl-2">RANK UP: {newRank}</span>
                )}
              </div>
           </div>

           {/* Explanations (Only show missed ones, or all if none missed) */}
           <div className="space-y-6">
              <h3 className="text-xl font-orbitron text-cyber-blue tracking-wider uppercase border-b border-cyber-blue/20 pb-4">
                {accuracy === 100 ? "Flawless Execution Highlights" : "Critical Vulnerabilities Identified (Missed Questions)"}
              </h3>
              
              <div className="space-y-4">
                 {answerResults.filter(r => accuracy === 100 || !r.correct).map((res, i) => (
                    <div key={i} className={`p-6 rounded-xl border bg-[#050A1F] ${res.correct ? 'border-cyber-green/30' : 'border-red-500/30'}`}>
                       <p className="text-white text-lg font-medium mb-4">{res.question}</p>
                       <div className={`p-4 rounded border-l-2 bg-cyber-dark ${res.correct ? 'border-cyber-green text-cyber-green/90' : 'border-red-500 text-red-400'}`}>
                         <span className="font-orbitron text-xs font-bold uppercase block mb-1">PAYLOAD DECRYPTED:</span>
                         {res.explanation}
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           {/* Return Buttons */}
           <div className="flex flex-col sm:flex-row justify-center gap-6 pt-8 pb-20">
              <button 
                onClick={() => window.location.reload()}
                className="px-8 py-4 bg-cyber-blue/10 border border-cyber-blue text-cyber-blue font-orbitron text-sm font-bold tracking-widest uppercase rounded hover:bg-cyber-blue hover:text-cyber-dark hover:box-glow-blue transition-all duration-300"
              >
                Re-Run Simulation
              </button>
              <button 
                onClick={() => router.push("/learn")}
                className="px-8 py-4 bg-cyber-dark border border-gray-600 text-gray-400 font-orbitron text-sm font-bold tracking-widest uppercase rounded hover:text-white hover:border-white transition-all duration-300"
              >
                Return to Training
              </button>
           </div>
        </div>
       </div>
    );
  }

  // PLAYING STATE
  const currentQ = questions[currentIndex];
  const isTimeCritical = timeLeft <= 5;

  return (
    <div className="min-h-screen bg-cyber-dark font-inter text-gray-200 selection:bg-cyber-blue selection:text-cyber-dark pb-20">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 opacity-10 pointer-events-none">
        <div 
          className="absolute inset-0"
          style={{ backgroundImage: `linear-gradient(rgba(0, 243, 255, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 243, 255, 0.2) 1px, transparent 1px)`, backgroundSize: "50px 50px" }}
        />
        <div className={`absolute top-0 left-0 w-[800px] h-[800px] rounded-full mix-blend-screen filter blur-[200px] transition-colors duration-1000 ${isTimeCritical ? 'bg-red-500/20' : 'bg-cyber-blue/10'}`}></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Top HUD */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12 bg-cyber-darker/60 backdrop-blur-md border border-cyber-blue/20 rounded-xl p-6 shadow-[0_0_30px_rgba(0,243,255,0.05)]">
           <div className="flex items-center gap-4 w-full md:w-auto">
             <Link href="/learn" className="text-gray-400 hover:text-cyber-blue transition-colors p-2 border border-gray-700 hover:border-cyber-blue/50 rounded flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
             </Link>
             <div className="space-y-1">
                <div className="font-orbitron font-bold text-cyber-blue tracking-widest uppercase text-sm">
                  Threat Simulation
                </div>
                <div className="flex gap-2">
                   {questions.map((_, i) => (
                      <div key={i} className={`h-1.5 w-6 sm:w-8 rounded-full transition-colors ${i < currentIndex ? 'bg-cyber-blue box-glow-blue' : i === currentIndex ? 'bg-white animate-pulse' : 'bg-gray-700'}`}></div>
                   ))}
                </div>
             </div>
           </div>

           <div className="flex items-center gap-8 md:gap-12 w-full md:w-auto justify-between md:justify-end">
              <div className="text-center">
                 <div className="text-[10px] font-orbitron text-cyber-blue/70 uppercase tracking-widest mb-1">Threat Level Score</div>
                 <div className="font-mono text-2xl font-bold text-white tracking-wider">{score.toLocaleString()}</div>
              </div>
              
              {/* Huge Timer */}
              <div className="flex items-center gap-4">
                 <div className={`text-[10px] font-orbitron uppercase tracking-widest text-right ${isTimeCritical ? 'text-red-500 animate-pulse' : 'text-cyber-green'}`}>
                    Time<br/>Remaining
                 </div>
                 <div className={`font-inter font-black text-5xl sm:text-6xl tabular-nums tracking-tighter transition-colors ${isTimeCritical ? 'text-red-500 text-glow-red animate-pulse' : 'text-cyber-green text-glow-green'}`}>
                    0:{timeLeft.toString().padStart(2, '0')}
                 </div>
              </div>
           </div>
        </div>

        {/* Question Area */}
        <div className="bg-[#050A1F]/80 backdrop-blur-xl border border-cyber-blue/30 rounded-2xl p-6 sm:p-12 shadow-[0_0_50px_rgba(0,243,255,0.05)] min-h-[500px] flex flex-col relative overflow-hidden">
           
           {/* Progress indicator string */}
           <div className="absolute top-0 right-0 p-4 font-mono text-cyber-blue/30 text-xs">
              SEQ {currentIndex + 1} // {questions.length}
           </div>

           <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold leading-snug text-white mt-8 mb-12">
              {currentQ.question}
           </h2>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-auto">
              {currentQ.options.map((opt) => {
                 const isSelected = selectedAnswer === opt.id;
                 const isAnswered = selectedAnswer !== null;
                 const isCorrect = opt.id === currentQ.correctOptionId;
                 
                 let btnStyle = "bg-cyber-darker border-cyber-blue/30 text-gray-300 hover:border-cyber-blue hover:bg-cyber-blue/10";
                 
                 if (isAnswered) {
                    if (isCorrect) {
                       btnStyle = "bg-cyber-green/20 border-cyber-green text-cyber-green shadow-[0_0_20px_rgba(0,255,157,0.3)] z-10 transform scale-[1.02] transition-all";
                    } else if (isSelected && !isCorrect) {
                       btnStyle = "bg-red-500/20 border-red-500 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)] z-10 transition-all";
                    } else {
                       btnStyle = "bg-cyber-dark border-gray-800 text-gray-600 opacity-40 scale-[0.98] transition-all";
                    }
                 }

                 return (
                    <button
                       key={opt.id}
                       onClick={() => handleAnswerSubmission(opt.id)}
                       disabled={isAnswered}
                       className={`
                         text-left p-6 rounded-xl border-2 transition-all duration-300 flex gap-4 items-center group
                         ${btnStyle}
                       `}
                    >
                       <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-orbitron font-bold text-xl border-2 transition-colors ${isAnswered ? 'border-transparent' : 'border-cyber-blue/50 text-cyber-blue group-hover:bg-cyber-blue group-hover:text-cyber-dark'}`}>
                         {opt.id}
                       </div>
                       <span className="text-lg leading-tight">{opt.text}</span>
                    </button>
                 );
              })}
           </div>
           
           {/* Timeout / Processing Overlay Message */}
           <div className={`absolute bottom-0 left-0 right-0 flex justify-center pb-8 transition-opacity duration-500 ${selectedAnswer ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
               <div className={`px-6 py-2 rounded-full font-orbitron font-bold tracking-widest uppercase text-sm backdrop-blur-md border ${selectedAnswer === "TIMEOUT" ? "bg-red-500/20 text-red-500 border-red-500" : "bg-cyber-dark text-white border-cyber-blue/30 shadow-lg"}`}>
                  {selectedAnswer === "TIMEOUT" ? "SYSTEM OVERRIDE: TIME EXPIRED" : "PROCESSING PAYLOAD..."}
               </div>
           </div>
        </div>

      </div>
    </div>
  );
}
