"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserProfile } from "@/app/actions/user";
import { updateUsername, updateEmail, updatePassword, deleteAccount } from "@/app/actions/profile";
import { useCyberAudio } from "@/app/hooks/useCyberAudio";

type UserProfile = {
  username: string;
  rank: string;
  points: number;
  createdAt?: string | Date;
};

export default function ProfilePage() {
  const router = useRouter();
  const { playHover } = useCyberAudio();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [activeModal, setActiveModal] = useState<"none" | "username" | "email" | "password" | "delete">("none");

  // Form states
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  // Status states
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const agentUsername = localStorage.getItem("agentUsername");
    if (!agentUsername) {
      router.push("/");
      return;
    }

    async function loadData() {
      try {
        const userRes = await getUserProfile(agentUsername as string);
        if (userRes.success && userRes.user) {
          setUser(userRes.user);
        } else {
          router.push("/");
        }
      } catch (err) {
        console.error("Failed to load user profile", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  const resetForms = () => {
    setNewUsername("");
    setNewEmail("");
    setCurrentPassword("");
    setNewPassword("");
    setError("");
    setSuccess("");
  };

  const openModal = (modalName: "none" | "username" | "email" | "password" | "delete") => {
    resetForms();
    setActiveModal(modalName);
  };

  const handleUpdateUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    const res = await updateUsername(user.username, newUsername);
    if (res.error) {
      setError(res.error);
    } else {
      setSuccess("Username updated successfully!");
      localStorage.setItem("agentUsername", newUsername);
      setUser({ ...user, username: newUsername });
      setTimeout(() => openModal("none"), 1500);
    }
    setIsSubmitting(false);
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    const res = await updateEmail(user.username, currentPassword, newEmail);
    if (res.error) {
      setError(res.error);
    } else {
      setSuccess("Email updated successfully!");
      setTimeout(() => openModal("none"), 1500);
    }
    setIsSubmitting(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    const res = await updatePassword(user.username, currentPassword, newPassword);
    if (res.error) {
      setError(res.error);
    } else {
      setSuccess("Password updated successfully!");
      setTimeout(() => openModal("none"), 1500);
    }
    setIsSubmitting(false);
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError("");
    setIsSubmitting(true);

    const res = await deleteAccount(user.username, currentPassword);
    if (res.error) {
      setError(res.error);
      setIsSubmitting(false);
    } else {
      localStorage.removeItem("agentUsername");
      router.push("/");
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cyber-dark text-cyber-blue font-orbitron">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 border-t-2 border-b-2 border-cyber-blue rounded-full animate-spin mb-4"></div>
          <p className="tracking-widest uppercase">Accessing Profile...</p>
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

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <button 
            onClick={() => router.push('/home')}
            onMouseEnter={playHover}
            className="flex items-center gap-2 text-cyber-blue hover:text-white transition-colors duration-300 group"
          >
            <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            <span className="font-orbitron uppercase tracking-widest text-sm">Return to Arena</span>
          </button>
          <h1 className="text-3xl font-bold font-orbitron tracking-widest text-cyber-blue text-glow-blue uppercase hidden sm:block">
            Agent Profile
          </h1>
        </header>

        {/* Profile Card */}
        <div className="bg-cyber-darker/80 border border-cyber-blue/30 rounded-2xl p-8 backdrop-blur-md shadow-[0_0_30px_rgba(0,243,255,0.05)] mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-8">
          <div className="w-32 h-32 rounded-full bg-cyber-blue/10 border-2 border-cyber-blue flex items-center justify-center shadow-[0_0_20px_rgba(0,243,255,0.3)] shrink-0">
            <span className="text-5xl font-bold text-cyber-blue font-orbitron">{user.username.charAt(0).toUpperCase()}</span>
          </div>
          
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-3xl font-bold text-white font-orbitron mb-2">{user.username}</h2>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mb-4">
              <span className="bg-cyber-blue/20 text-cyber-blue border border-cyber-blue/30 px-3 py-1 rounded-full text-xs uppercase tracking-widest font-bold">
                {user.rank || 'Recruit'}
              </span>
              <span className="text-cyber-green font-mono text-glow-green font-bold">
                {user.points?.toLocaleString() || '0'} PTS
              </span>
            </div>
            {user.createdAt && (
              <p className="text-cyber-blue/60 text-xs font-mono mb-4 uppercase tracking-wider">
                Agent Active Since: {new Date(user.createdAt).toLocaleDateString()}
              </p>
            )}
            <p className="text-gray-400 text-sm max-w-lg">
              Manage your agent credentials and databank access. Warning: Account deletion is permanent.
            </p>
          </div>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button 
            onClick={() => openModal("username")}
            onMouseEnter={playHover}
            className="bg-cyber-darker border border-cyber-blue/20 hover:border-cyber-blue/60 p-6 rounded-xl text-left transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,243,255,0.1)] group"
          >
            <h3 className="text-cyber-blue font-orbitron font-bold text-lg mb-2 group-hover:text-glow-blue transition-all">Change Username</h3>
            <p className="text-sm text-gray-500">Update your public agent callsign.</p>
          </button>

          <button 
            onClick={() => openModal("email")}
            onMouseEnter={playHover}
            className="bg-cyber-darker border border-cyber-blue/20 hover:border-cyber-blue/60 p-6 rounded-xl text-left transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,243,255,0.1)] group"
          >
            <h3 className="text-cyber-blue font-orbitron font-bold text-lg mb-2 group-hover:text-glow-blue transition-all">Change Email</h3>
            <p className="text-sm text-gray-500">Update the email address linked to your databank.</p>
          </button>

          <button 
            onClick={() => openModal("password")}
            onMouseEnter={playHover}
            className="bg-cyber-darker border border-cyber-blue/20 hover:border-cyber-blue/60 p-6 rounded-xl text-left transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,243,255,0.1)] group"
          >
            <h3 className="text-cyber-blue font-orbitron font-bold text-lg mb-2 group-hover:text-glow-blue transition-all">Change Password</h3>
            <p className="text-sm text-gray-500">Secure your account with a new access code.</p>
          </button>

          <button 
            onClick={() => openModal("delete")}
            onMouseEnter={playHover}
            className="bg-red-900/10 border border-red-500/20 hover:border-red-500/60 p-6 rounded-xl text-left transition-all duration-300 hover:shadow-[0_0_15px_rgba(239,68,68,0.15)] group"
          >
            <h3 className="text-red-400 font-orbitron font-bold text-lg mb-2 group-hover:text-red-300 transition-all">Terminiate Account</h3>
            <p className="text-sm text-gray-500">Permanently delete your profile and all associated data.</p>
          </button>
        </div>

      </div>

      {/* Modals */}
      {activeModal !== "none" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-cyber-dark border border-cyber-blue/50 rounded-2xl w-full max-w-md overflow-hidden shadow-[0_0_40px_rgba(0,243,255,0.15)] relative">
            
            {/* Modal Header */}
            <div className={`p-4 border-b flex justify-between items-center ${activeModal === 'delete' ? 'border-red-500/30 bg-red-500/5' : 'border-cyber-blue/30 bg-cyber-blue/5'}`}>
              <h3 className={`font-orbitron font-bold uppercase tracking-wider ${activeModal === 'delete' ? 'text-red-400' : 'text-cyber-blue'}`}>
                {activeModal === "username" && "Change Callsign"}
                {activeModal === "email" && "Update Comms Link"}
                {activeModal === "password" && "Reset Access Code"}
                {activeModal === "delete" && "DANGER: Terminate Agent"}
              </h3>
              <button onClick={() => openModal("none")} onMouseEnter={playHover} className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded text-red-400 text-sm font-mono">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-4 p-3 bg-cyber-green/10 border border-cyber-green/50 rounded text-cyber-green text-sm font-mono">
                  {success}
                </div>
              )}

              {/* Username Form */}
              {activeModal === "username" && (
                <form onSubmit={handleUpdateUsername} className="space-y-4">
                  <div>
                    <label className="block text-xs font-orbitron text-cyber-blue uppercase tracking-widest mb-1">New Callsign</label>
                    <input 
                      type="text" 
                      required
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="w-full bg-cyber-darker border border-cyber-blue/30 rounded pl-3 pr-4 py-2 text-white focus:outline-none focus:border-cyber-blue focus:shadow-[0_0_10px_rgba(0,243,255,0.2)] transition-all font-inter placeholder-gray-600"
                      placeholder="Enter new username"
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full mt-4 bg-cyber-blue text-cyber-dark font-orbitron font-bold uppercase tracking-widest py-3 rounded hover:bg-white transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? "Processing..." : "Confirm Override"}
                  </button>
                </form>
              )}

              {/* Email Form */}
              {activeModal === "email" && (
                <form onSubmit={handleUpdateEmail} className="space-y-4">
                  <div>
                    <label className="block text-xs font-orbitron text-cyber-blue uppercase tracking-widest mb-1">New Email</label>
                    <input 
                      type="email" 
                      required
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full bg-cyber-darker border border-cyber-blue/30 rounded pl-3 pr-4 py-2 text-white focus:outline-none focus:border-cyber-blue focus:shadow-[0_0_10px_rgba(0,243,255,0.2)] transition-all font-inter placeholder-gray-600"
                      placeholder="Enter new email"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-orbitron text-cyber-blue uppercase tracking-widest mb-1 mt-4">Current Password</label>
                    <input 
                      type="password" 
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-cyber-darker border border-cyber-blue/30 rounded pl-3 pr-4 py-2 text-white focus:outline-none focus:border-cyber-blue focus:shadow-[0_0_10px_rgba(0,243,255,0.2)] transition-all font-inter placeholder-gray-600"
                      placeholder="Verify identity"
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full mt-4 bg-cyber-blue text-cyber-dark font-orbitron font-bold uppercase tracking-widest py-3 rounded hover:bg-white transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? "Processing..." : "Confirm Override"}
                  </button>
                </form>
              )}

              {/* Password Form */}
              {activeModal === "password" && (
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-orbitron text-cyber-blue uppercase tracking-widest mb-1">Current Password</label>
                    <input 
                      type="password" 
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-cyber-darker border border-cyber-blue/30 rounded pl-3 pr-4 py-2 text-white focus:outline-none focus:border-cyber-blue focus:shadow-[0_0_10px_rgba(0,243,255,0.2)] transition-all font-inter placeholder-gray-600"
                      placeholder="Verify current identity"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-orbitron text-cyber-blue uppercase tracking-widest mb-1 mt-4">New Password</label>
                    <input 
                      type="password" 
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-cyber-darker border border-cyber-blue/30 rounded pl-3 pr-4 py-2 text-white focus:outline-none focus:border-cyber-blue focus:shadow-[0_0_10px_rgba(0,243,255,0.2)] transition-all font-inter placeholder-gray-600"
                      placeholder="Enter new access code"
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full mt-4 bg-cyber-blue text-cyber-dark font-orbitron font-bold uppercase tracking-widest py-3 rounded hover:bg-white transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? "Processing..." : "Confirm Override"}
                  </button>
                </form>
              )}

              {/* Delete Account Form */}
              {activeModal === "delete" && (
                <form onSubmit={handleDeleteAccount} className="space-y-4">
                  <p className="text-sm text-gray-300 mb-4 font-inter">
                    This action is <strong className="text-red-400">irreversible</strong>. By entering your password, you will permanently terminate your Agent status and purge all databanks.
                  </p>
                  <div>
                    <label className="block text-xs font-orbitron text-red-500 uppercase tracking-widest mb-1">Confirm Identity with Password</label>
                    <input 
                      type="password" 
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-cyber-darker border border-red-500/30 rounded pl-3 pr-4 py-2 text-white focus:outline-none focus:border-red-500 focus:shadow-[0_0_10px_rgba(239,68,68,0.2)] transition-all font-inter placeholder-gray-600"
                      placeholder="Enter password to confirm purge"
                    />
                  </div>
                  <button 
                    type="submit" 
                    onMouseEnter={playHover}
                    disabled={isSubmitting}
                    className="w-full mt-4 bg-red-600 text-white font-orbitron font-bold uppercase tracking-widest py-3 rounded hover:bg-red-500 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? "Purging..." : "Confirm Termination"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
