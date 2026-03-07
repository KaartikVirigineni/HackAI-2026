"use client";

import { useState, useEffect } from "react";

export default function CyberLogin() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authText, setAuthText] = useState("");
  const [accessGranted, setAccessGranted] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setAuthText("Authenticating...");

    // Simulated auth sequence
    setTimeout(() => setAuthText("Scanning credentials..."), 1500);
    setTimeout(() => {
      setAuthText("Access Granted ✅");
      setAccessGranted(true);
    }, 3000);
    // Optional: reset after some time
    setTimeout(() => {
      setIsAuthenticating(false);
      setAccessGranted(false);
      setAuthText("");
    }, 5000);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-cyber-dark overflow-hidden font-inter selection:bg-cyber-blue selection:text-cyber-dark">
      {/* Dynamic Background: Grid/Network style */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 243, 255, 0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(0, 243, 255, 0.1) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
            transform: "perspective(500px) rotateX(60deg) translateY(-100px) translateZ(-200px)",
            transformOrigin: "top"
          }}
        />
        {/* Glowing orb accents */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyber-blue rounded-full mix-blend-screen filter blur-[128px] opacity-20 animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyber-green rounded-full mix-blend-screen filter blur-[128px] opacity-10 animate-float"></div>
      </div>

      {/* Main Login Panel */}
      <main className="relative z-10 w-full max-w-md p-8 sm:p-10 mx-4 border border-cyber-blue-dim bg-cyber-darker/80 backdrop-blur-xl rounded-2xl shadow-[0_0_50px_rgba(0,243,255,0.05)] before:absolute before:inset-0 before:rounded-2xl before:border before:border-cyber-blue/20 before:pointer-events-none">
        
        {/* Header / Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyber-dark border border-cyber-blue/50 mb-4 animate-float box-glow-blue">
            <span className="text-3xl">🔐</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-orbitron tracking-wider text-cyber-blue text-glow-blue mb-2 uppercase">
            CyberArena
          </h1>
          <p className="text-cyber-blue/70 text-sm tracking-widest uppercase font-semibold">
            Master Cybersecurity Through Play
          </p>
        </div>

        {/* Auth Interface */}
        {isAuthenticating ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-6">
            <div className="relative w-24 h-24 flex items-center justify-center">
              {/* Spinning border */}
              <div className={`absolute inset-0 rounded-full border-t-2 border-b-2 ${accessGranted ? 'border-cyber-green' : 'border-cyber-blue'} animate-spin`}></div>
              {/* Inner glow */}
              <div className={`w-16 h-16 rounded-full ${accessGranted ? 'bg-cyber-green text-cyber-green box-glow-green' : 'bg-cyber-blue text-cyber-blue box-glow-blue'} opacity-20 animate-pulse`}></div>
              <span className={`absolute text-2xl ${accessGranted ? 'text-cyber-green text-glow-green' : 'text-cyber-blue text-glow-blue'}`}>
                {accessGranted ? '🔓' : '🛡️'}
              </span>
            </div>
            
            <div className="h-8 flex items-center justify-center w-full">
              <p className={`font-orbitron font-bold tracking-widest uppercase text-center ${accessGranted ? 'text-cyber-green text-glow-green' : 'text-cyber-blue text-glow-blue animate-pulse'}`}>
                {authText}
              </p>
            </div>
            
            {/* Progress bar effect */}
            <div className="w-full h-1 bg-cyber-dark rounded-full overflow-hidden mt-4">
              <div 
                className={`h-full ${accessGranted ? 'bg-cyber-green' : 'bg-cyber-blue'} transition-all duration-[3000ms] ease-out`}
                style={{ width: accessGranted ? '100%' : '70%' }}
              ></div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Username Input */}
            <div className="space-y-2">
              <label className="block text-xs font-orbitron tracking-widest text-cyber-blue/80 uppercase">
                Agent ID
              </label>
              <div className="relative group">
                <input 
                  type="text" 
                  required
                  className="w-full bg-cyber-dark/50 border border-cyber-blue/30 rounded-lg px-4 py-3 text-cyber-blue placeholder-cyber-blue/30 focus:outline-none focus:border-cyber-blue focus:ring-1 focus:ring-cyber-blue transition-all duration-300 font-mono"
                  placeholder="Enter your username..."
                />
                <div className="absolute inset-0 border border-cyber-blue opacity-0 group-hover:opacity-50 pointer-events-none rounded-lg transition-opacity duration-300"></div>
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-orbitron tracking-widest text-cyber-blue/80 uppercase">
                  Passkey
                </label>
                <a href="#" className="text-xs text-cyber-blue/60 hover:text-cyber-blue transition-colors hover:text-glow-blue">
                  Forgot Password?
                </a>
              </div>
              <div className="relative group">
                <input 
                  type="password" 
                  required
                  className="w-full bg-cyber-dark/50 border border-cyber-blue/30 rounded-lg px-4 py-3 text-cyber-blue placeholder-cyber-blue/30 focus:outline-none focus:border-cyber-blue focus:ring-1 focus:ring-cyber-blue transition-all duration-300 font-mono"
                  placeholder="••••••••••••"
                />
                <div className="absolute inset-0 border border-cyber-blue opacity-0 group-hover:opacity-50 pointer-events-none rounded-lg transition-opacity duration-300"></div>
              </div>
            </div>

            {/* Login Button */}
            <button 
              type="submit"
              className="w-full relative group bg-cyber-dark border border-cyber-blue text-cyber-blue font-orbitron font-bold tracking-widest uppercase py-4 rounded-lg overflow-hidden transition-all duration-300 hover:text-cyber-dark hover:bg-cyber-blue hover:box-glow-blue"
            >
              <div className="absolute inset-0 w-full h-full bg-cyber-blue translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out -z-10"></div>
              <span className="relative z-10 flex items-center justify-center gap-2">
                Access System
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </span>
            </button>

            {/* Register Link */}
            <div className="text-center pt-4 border-t border-cyber-blue/10">
              <p className="text-sm text-cyber-blue/60">
                New agent?{" "}
                <a href="#" className="text-cyber-blue hover:text-cyber-blue-glow font-semibold transition-colors">
                  Create an account
                </a>
              </p>
            </div>
          </form>
        )}
      </main>

      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-cyber-blue opacity-30 m-8 rounded-tl-xl hidden sm:block"></div>
      <div className="absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-cyber-blue opacity-30 m-8 rounded-br-xl hidden sm:block"></div>
    </div>
  );
}
