"use client";

import { useState } from "react";
import Link from "next/link";

import { registerAgent } from "@/app/actions/auth";

export default function CyberRegister() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [authText, setAuthText] = useState("");
  const [accessGranted, setAccessGranted] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);
    setAuthText("Registering Agent...");
    setError("");

    const formData = new FormData(e.target as HTMLFormElement);
    const result = await registerAgent(formData);

    if (result.error) {
      setError(result.error);
      setIsRegistering(false);
      return;
    }

    setAuthText("Encrypting credentials...");
    setTimeout(() => {
      setAuthText("Access Granted ✅");
      setAccessGranted(true);
    }, 1500);
    // Optional: reset after some time
    setTimeout(() => {
      setIsRegistering(false);
      setAccessGranted(false);
      setAuthText("");
    }, 4500);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-cyber-dark overflow-hidden font-inter selection:bg-cyber-blue selection:text-cyber-dark py-12">
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

      {/* Main Register Panel */}
      <main className="relative z-10 w-full max-w-md p-8 sm:p-10 mx-4 border border-cyber-blue-dim bg-cyber-darker/80 backdrop-blur-xl rounded-2xl shadow-[0_0_50px_rgba(0,243,255,0.05)] before:absolute before:inset-0 before:rounded-2xl before:border before:border-cyber-blue/20 before:pointer-events-none mt-8 sm:mt-0">
        
        {/* Header / Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-cyber-dark border border-cyber-blue/50 mb-3 animate-float box-glow-blue">
            <span className="text-2xl">🔐</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-orbitron tracking-wider text-cyber-blue text-glow-blue mb-2 uppercase">
            CyberArena
          </h1>
          <p className="text-cyber-blue/70 text-xs tracking-widest uppercase font-semibold">
            Join the CyberArena and master cybersecurity skills.
          </p>
        </div>

        {/* Auth Interface */}
        {isRegistering ? (
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
              <p className={`font-orbitron font-bold tracking-widest uppercase text-center text-sm sm:text-base ${accessGranted ? 'text-cyber-green text-glow-green' : 'text-cyber-blue text-glow-blue animate-pulse'}`}>
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
          <form onSubmit={handleRegister} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-lg text-center font-orbitron">
                {error}
              </div>
            )}
            
            {/* Username Input */}
            <div className="space-y-1 sm:space-y-2">
              <label className="block text-xs font-orbitron tracking-widest text-cyber-blue/80 uppercase">
                Username
              </label>
              <div className="relative group">
                <input 
                  type="text" 
                  name="username"
                  required
                  className="w-full bg-cyber-dark/50 border border-cyber-blue/30 rounded-lg px-4 py-2.5 sm:py-3 text-cyber-blue placeholder-cyber-blue/30 focus:outline-none focus:border-cyber-blue focus:ring-1 focus:ring-cyber-blue transition-all duration-300 font-mono text-sm"
                  placeholder="agent_name"
                />
                <div className="absolute inset-0 border border-cyber-blue opacity-0 group-hover:opacity-50 pointer-events-none rounded-lg transition-opacity duration-300"></div>
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-1 sm:space-y-2">
              <label className="block text-xs font-orbitron tracking-widest text-cyber-blue/80 uppercase">
                Email
              </label>
              <div className="relative group">
                <input 
                  type="email" 
                  name="email"
                  required
                  className="w-full bg-cyber-dark/50 border border-cyber-blue/30 rounded-lg px-4 py-2.5 sm:py-3 text-cyber-blue placeholder-cyber-blue/30 focus:outline-none focus:border-cyber-blue focus:ring-1 focus:ring-cyber-blue transition-all duration-300 font-mono text-sm"
                  placeholder="agent@cyberarena.net"
                />
                <div className="absolute inset-0 border border-cyber-blue opacity-0 group-hover:opacity-50 pointer-events-none rounded-lg transition-opacity duration-300"></div>
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1 sm:space-y-2">
              <label className="block text-xs font-orbitron tracking-widest text-cyber-blue/80 uppercase">
                Password
              </label>
              <div className="relative group">
                <input 
                  type="password" 
                  name="password"
                  required
                  className="w-full bg-cyber-dark/50 border border-cyber-blue/30 rounded-lg px-4 py-2.5 sm:py-3 text-cyber-blue placeholder-cyber-blue/30 focus:outline-none focus:border-cyber-blue focus:ring-1 focus:ring-cyber-blue transition-all duration-300 font-mono text-sm"
                  placeholder="••••••••••••"
                />
                <div className="absolute inset-0 border border-cyber-blue opacity-0 group-hover:opacity-50 pointer-events-none rounded-lg transition-opacity duration-300"></div>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-1 sm:space-y-2">
              <label className="block text-xs font-orbitron tracking-widest text-cyber-blue/80 uppercase">
                Confirm Password
              </label>
              <div className="relative group">
                <input 
                  type="password" 
                  name="confirmPassword"
                  required
                  className="w-full bg-cyber-dark/50 border border-cyber-blue/30 rounded-lg px-4 py-2.5 sm:py-3 text-cyber-blue placeholder-cyber-blue/30 focus:outline-none focus:border-cyber-blue focus:ring-1 focus:ring-cyber-blue transition-all duration-300 font-mono text-sm"
                  placeholder="••••••••••••"
                />
                <div className="absolute inset-0 border border-cyber-blue opacity-0 group-hover:opacity-50 pointer-events-none rounded-lg transition-opacity duration-300"></div>
              </div>
            </div>

            {/* T&C Checkbox */}
            <div className="flex items-center gap-3 pt-2">
              <input 
                type="checkbox" 
                id="terms"
                required
                className="w-4 h-4 rounded border-cyber-blue/30 bg-cyber-dark text-cyber-blue focus:ring-cyber-blue/50 focus:ring-offset-0 focus:ring-2 cursor-pointer appearance-none checked:bg-cyber-blue checked:border-transparent checked:before:content-['✓'] checked:before:text-cyber-dark checked:before:block checked:before:text-center checked:before:text-xs"
              />
              <label htmlFor="terms" className="text-xs text-cyber-blue/70 cursor-pointer select-none">
                I agree to the <span className="text-cyber-blue hover:text-cyber-blue-glow transition-colors">Terms & Conditions</span>
              </label>
            </div>

            {/* Register Button */}
            <button 
              type="submit"
              className="w-full relative group bg-cyber-dark border border-cyber-blue text-cyber-blue font-orbitron font-bold tracking-widest uppercase mt-4 py-3 sm:py-4 rounded-lg overflow-hidden transition-all duration-300 hover:text-cyber-dark hover:bg-cyber-blue hover:box-glow-blue"
            >
              <div className="absolute inset-0 w-full h-full bg-cyber-blue translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out -z-10"></div>
              <span className="relative z-10 flex items-center justify-center gap-2 text-sm sm:text-base">
                Create Account
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
              </span>
            </button>

            {/* Login Link */}
            <div className="text-center pt-4 border-t border-cyber-blue/10">
              <p className="text-xs sm:text-sm text-cyber-blue/60">
                Already have an account?{" "}
                <Link href="/" className="text-cyber-blue hover:text-cyber-blue-glow font-semibold transition-colors">
                  Log in
                </Link>
              </p>
            </div>
          </form>
        )}
      </main>

      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-cyber-blue opacity-30 m-8 rounded-tl-xl hidden md:block"></div>
      <div className="absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-cyber-blue opacity-30 m-8 rounded-br-xl hidden md:block"></div>
    </div>
  );
}
