"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserProfile, getLeaderboard } from "@/app/actions/user";

type UserProfile = {
  username: string;
  rank: string;
  points: number;
};

export default function CyberHome() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [leaderboard, setLeaderboard] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Basic auth check
    const agentUsername = localStorage.getItem("agentUsername");
    if (!agentUsername) {
      router.push("/");
      return;
    }

    async function loadData() {
      try {
        // Fetch current user
        const userRes = await getUserProfile(agentUsername as string);
        if (userRes.success && userRes.user) {
          setUser(userRes.user);
        }

        // Fetch leaderboard
        const leaderRes = await getLeaderboard();
        if (leaderRes.success && leaderRes.leaderboard) {
          setLeaderboard(leaderRes.leaderboard);
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cyber-dark text-cyber-blue font-orbitron">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 border-t-2 border-b-2 border-cyber-blue rounded-full animate-spin mb-4"></div>
          <p className="tracking-widest uppercase">Initializing Databank...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-cyber-dark text-gray-200 font-inter overflow-x-hidden selection:bg-cyber-blue selection:text-cyber-dark">
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
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyber-blue rounded-full mix-blend-screen filter blur-[150px] opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyber-green rounded-full mix-blend-screen filter blur-[150px] opacity-10"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Top Navbar */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
          
          {/* Empty div for flex spacing on desktop safely */}
          <div className="hidden md:block w-64"></div>

          {/* Center: Website Name */}
          <div className="flex-1 text-center w-full md:w-auto">
            <h1 className="text-4xl md:text-5xl font-bold font-orbitron tracking-widest text-cyber-blue text-glow-blue uppercase">
              CyberArena
            </h1>
            <div className="h-px w-32 bg-cyber-blue/50 mx-auto mt-2 box-glow-blue"></div>
          </div>

          {/* Right: User Profile Widget */}
          <div className="w-full md:w-64 bg-cyber-darker/80 border border-cyber-blue/30 p-4 rounded-xl backdrop-blur-md shadow-[0_0_15px_rgba(0,243,255,0.05)] transform transition hover:scale-105 hover:border-cyber-blue/60 duration-300">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cyber-blue/10 border border-cyber-blue/50 flex items-center justify-center text-cyber-blue font-bold text-lg shadow-[0_0_10px_rgba(0,243,255,0.2)]">
                  {user?.username.charAt(0).toUpperCase() || '?'}
                </div>
                <div>
                  <p className="font-orbitron font-bold text-sm text-white tracking-wider truncate max-w-[100px]">
                    {user?.username || 'Guest'}
                  </p>
                  <p className="text-xs text-cyber-blue mt-0.5 max-w-[100px] truncate">
                    {user?.rank || 'Recruit'}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => router.push('/profile')}
                  className="text-xs text-gray-400 hover:text-cyber-blue transition-colors bg-cyber-blue/10 p-1.5 rounded"
                  title="Profile Settings"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </button>
                <button 
                  onClick={() => {
                    localStorage.removeItem("agentUsername");
                    router.push("/");
                  }}
                  className="text-xs text-gray-400 hover:text-red-400 transition-colors bg-red-500/10 p-1.5 rounded"
                  title="Disconnect"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </button>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-cyber-blue/20">
              <p className="text-xs text-gray-400 uppercase tracking-widest font-orbitron mb-1">
                Total Credits
              </p>
              <div className="flex items-end gap-2 text-cyber-green text-glow-green">
                <span className="text-2xl font-bold font-mono leading-none">
                  {user?.points?.toLocaleString() || '0'}
                </span>
                <span className="text-sm font-bold mb-0.5">PTS</span>
              </div>
            </div>
          </div>
        </header>

        {/* Middle Section: Actions */}
        <div className="flex justify-center mb-20 relative">
          <div className="absolute inset-0 bg-cyber-blue rounded-full filter blur-[100px] opacity-10 animate-pulse w-64 h-64 mx-auto top-1/2 -translate-y-1/2"></div>
          
          <button 
            onClick={() => router.push('/learn')}
            className="relative group overflow-hidden rounded-2xl bg-cyber-darker border-2 border-cyber-blue p-8 sm:p-12 transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(0,243,255,0.4)] duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyber-blue/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="relative z-10 flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-cyber-blue/10 border border-cyber-blue flex items-center justify-center text-cyber-blue mb-2 group-hover:bg-cyber-blue group-hover:text-cyber-dark transition-colors duration-300">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold font-orbitron tracking-widest uppercase text-cyber-blue group-hover:text-glow-blue transition-all duration-300">
                Learn
              </h2>
              <p className="text-sm sm:text-base text-gray-400 max-w-xs text-center">
                Access training modules to boost your cyber skills and earn credits.
              </p>
            </div>
            
            {/* Animated corner borders */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyber-blue opacity-50 group-hover:opacity-100 transition-opacity m-2"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyber-blue opacity-50 group-hover:opacity-100 transition-opacity m-2"></div>
          </button>
        </div>

        {/* Bottom Section: Leaderboard */}
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-cyber-blue/50"></div>
            <h2 className="text-2xl font-orbitron font-bold tracking-widest text-cyber-blue uppercase flex items-center gap-3">
              <svg className="w-6 h-6 text-cyber-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              Global Leaderboard
            </h2>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-cyber-blue/50"></div>
          </div>
          
          <div className="bg-cyber-darker/60 backdrop-blur-sm border border-cyber-blue/30 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(0,243,255,0.05)]">
            <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-cyber-blue/20 bg-cyber-blue/5 text-xs font-orbitron tracking-widest uppercase text-gray-400">
              <div className="col-span-2 text-center">Rank</div>
              <div className="col-span-5">Agent</div>
              <div className="col-span-3">Class</div>
              <div className="col-span-2 text-right">Score</div>
            </div>
            
            <div className="max-h-[400px] overflow-y-auto cyber-scrollbar">
              {leaderboard.length > 0 ? (
                leaderboard.map((player, index) => (
                  <div 
                    key={index} 
                    className={`grid grid-cols-12 gap-4 px-6 py-4 items-center border-b border-cyber-blue/10 transition-colors hover:bg-cyber-blue/5 ${player.username === user?.username ? 'bg-cyber-blue/10 border-l-4 border-l-cyber-blue' : ''}`}
                  >
                    <div className="col-span-2 flex justify-center">
                      <span className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold font-mono text-sm ${
                        index === 0 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 box-glow-yellow' : 
                        index === 1 ? 'bg-gray-400/20 text-gray-300 border border-gray-400/50' : 
                        index === 2 ? 'bg-amber-700/20 text-amber-600 border border-amber-700/50' : 
                        'text-cyber-blue/70 bg-cyber-dark'
                      }`}>
                        #{index + 1}
                      </span>
                    </div>
                    
                    <div className="col-span-5 flex items-center gap-3">
                      <p className={`font-semibold font-inter max-w-[150px] truncate ${player.username === user?.username ? 'text-white' : 'text-gray-300'}`}>
                        {player.username}
                      </p>
                      {player.username === user?.username && (
                        <span className="text-[10px] bg-cyber-blue/20 text-cyber-blue px-2 py-0.5 rounded-full border border-cyber-blue/30 uppercase tracking-wider hidden sm:block">
                          You
                        </span>
                      )}
                    </div>
                    
                    <div className="col-span-3">
                      <span className="text-xs text-cyber-blue opacity-80 uppercase tracking-wider font-semibold">
                        {player.rank || 'Recruit'}
                      </span>
                    </div>
                    
                    <div className="col-span-2 text-right">
                      <span className="font-mono text-cyber-green font-bold text-sm sm:text-base">
                        {player.points?.toLocaleString() || '0'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-400 text-sm font-orbitron tracking-widest">
                  No data available in databanks.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
