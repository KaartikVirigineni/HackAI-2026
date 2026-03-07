"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import VoiceChat from "@/app/voiceChat";
import { generateCyberQuestion } from "@/app/actions/gemini";
export default function LearnPage() {
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadInitialQuestion = async () => {
      const q = await generateCyberQuestion();
      setCurrentQuestion(q);
      setIsLoading(false);
    };
    loadInitialQuestion();
  }, []);

  const generateNewQuestion = async () => {
    setIsLoading(true);
    const q = await generateCyberQuestion();
    setCurrentQuestion(q);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-cyber-dark font-inter text-gray-200 selection:bg-cyber-blue selection:text-cyber-dark pb-20">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 opacity-10 pointer-events-none">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 243, 255, 0.2) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(0, 243, 255, 0.2) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />
        <div className="absolute top-0 left-0 w-96 h-96 bg-cyber-blue rounded-full mix-blend-screen filter blur-[150px] opacity-20"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyber-green rounded-full mix-blend-screen filter blur-[150px] opacity-10"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-4 mb-12">
          <Link href="/home" className="text-cyber-blue hover:text-glow-blue transition-all bg-cyber-darker border border-cyber-blue/30 rounded-lg p-2.5 filter flex items-center justify-center shadow-[0_0_15px_rgba(0,243,255,0.1)] hover:border-cyber-blue/60">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold font-orbitron tracking-widest text-cyber-blue uppercase text-glow-blue">
            Training Ground
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Voice Chat */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-cyber-darker/80 border border-cyber-blue/30 rounded-xl p-6 backdrop-blur-md shadow-[0_0_20px_rgba(0,243,255,0.05)] sticky top-8">
              <h2 className="text-xl font-orbitron font-bold text-cyber-blue mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                Comm Channel
              </h2>
              <p className="text-sm text-gray-400 mb-6">Coordinate with other agents to solve cyber problems together.</p>
              
              <div className="border border-cyber-blue/20 rounded-xl p-1 bg-cyber-dark/50">
                <VoiceChat roomName="training-room" />
              </div>
            </div>
          </div>

          {/* Right Column: Discussion Question */}
          <div className="lg:col-span-8 flex flex-col justify-center">
            <div className="bg-cyber-darker/60 border border-cyber-green/30 rounded-2xl p-8 md:p-12 backdrop-blur-xl shadow-[0_0_50px_rgba(0,255,100,0.05)] relative overflow-hidden group min-h-[400px] flex flex-col">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyber-green/10 rounded-full mix-blend-screen filter blur-[80px] pointer-events-none group-hover:bg-cyber-green/20 transition-all duration-700"></div>
              
              <div className="flex justify-between items-center mb-8 border-b border-cyber-green/20 pb-6 relative z-10">
                <h2 className="text-2xl pt-2 font-orbitron font-bold text-cyber-green tracking-wider uppercase flex items-center gap-3 text-glow-green">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                  Active Directive
                </h2>
                <button 
                  onClick={generateNewQuestion}
                  className="bg-cyber-dark border border-cyber-green text-cyber-green px-5 py-2.5 rounded-lg font-orbitron text-sm font-bold uppercase tracking-wider hover:bg-cyber-green hover:text-cyber-dark hover:box-glow-green shadow-[0_0_15px_rgba(0,255,100,0.1)] transition-all duration-300 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  Reroll
                </button>
              </div>

              <div className="flex-1 flex items-center justify-center py-10 relative z-10">
                {isLoading ? (
                  <div className="flex flex-col items-center gap-4">
                    <span className="animate-spin h-10 w-10 border-4 border-cyber-green border-t-transparent rounded-full"></span>
                    <p className="text-cyber-green animate-pulse font-orbitron tracking-widest uppercase text-sm">Contacting HQ...</p>
                  </div>
                ) : (
                  <p suppressHydrationWarning className="text-3xl md:text-4xl lg:text-5xl font-inter text-center leading-tight text-white font-semibold">
                    {currentQuestion}
                  </p>
                )}
              </div>
              
              <div className="mt-8 pt-6 border-t border-cyber-green/20 flex items-center justify-center gap-3 text-sm text-cyber-green/70 font-mono tracking-wider relative z-10">
                <span className="animate-pulse flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-green opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-cyber-green"></span>
                </span>
                Discuss the answer over the secure comm channel
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
