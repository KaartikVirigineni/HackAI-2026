"use client";

import { useState, useEffect } from "react";
import {
  LiveKitRoom,
  useParticipants,
  ControlBar,
  RoomAudioRenderer,
  ConnectionState
} from "@livekit/components-react";
import "@livekit/components-styles";

export default function VoiceChat({ roomName = "cyberarena-room", username: propUsername }: { roomName?: string, username?: string }) {
  const [username] = useState(() => propUsername || "agent_" + Math.floor(Math.random() * 1000));
  const [token, setToken] = useState("");

  const [tokenVersion, setTokenVersion] = useState(0);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const resp = await fetch(`/api/livekit?room=${roomName}&username=${username}&v=${tokenVersion}`);
        const data = await resp.json();
        if (isMounted) {
          setToken(data.token);
        }
      } catch (e) {
        console.error("TOKEN_FETCH_FAILURE:", e);
      }
    })();
    return () => { isMounted = false; };
  }, [roomName, username, tokenVersion]);

  if (token === "") {
    return <div className="text-cyber-blue font-orbitron text-center p-4 text-xs animate-pulse">Establishing Secure Uplink...</div>;
  }

  return (
    <LiveKitRoom
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      token={token}
      connect={true}
      audio={true}
      video={false}
      data-lk-theme="default"
      className="flex flex-col h-full overflow-hidden bg-cyber-darker/40"
    >
      <div className="flex flex-col gap-2 p-2 h-full">
        {/* Connection Status & Refresh */}
        <div className="flex justify-between items-center px-2 py-1 border-b border-cyber-blue/10">
          <div className="flex flex-col">
            <span className="text-[10px] font-orbitron text-cyber-blue/50 uppercase">Room: {roomName.split('-').pop()}</span>
            <ConnectionState className="text-[10px] font-orbitron text-cyber-green" />
          </div>
          <button
            onClick={() => {
              setToken("");
              setTokenVersion(v => v + 1);
            }}
            className="text-[9px] font-orbitron text-cyber-blue border border-cyber-blue/30 px-1.5 py-0.5 rounded hover:bg-cyber-blue/10 transition-all uppercase"
            title="Force refresh secure uplink"
          >
            Refresh
          </button>
        </div>

        {/* Custom Participant List */}
        <div className="flex-1 overflow-y-auto min-h-[120px] scrollbar-hide">
          <ParticipantLoopWrapper />
        </div>

        {/* Compact Controls */}
        <div className="mt-auto pt-2 border-t border-cyber-blue/10">
          <ControlBar
            variation="minimal"
            controls={{
              microphone: true,
              screenShare: false,
              camera: false,
              chat: false,
              leave: true
            }}
          />
        </div>
      </div>
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}

function ParticipantLoopWrapper() {
  const participants = useParticipants();
  return (
    <div className="flex flex-col gap-2">
      {participants.map((p) => (
        <CustomParticipantTile
          key={p.identity}
          participant={p}
        />
      ))}
    </div>
  );
}

import { Participant } from "livekit-client";

function CustomParticipantTile({ participant }: { participant: Participant }) {
  const isLocal = participant.isLocal;
  const username = participant.name || participant.identity || "Unknown";
  const isSpeaking = participant.isSpeaking;

  return (
    <div
      className={`relative group flex items-center justify-between bg-cyber-dark/40 border border-cyber-blue/20 rounded-lg p-3 transition-all hover:border-cyber-blue/50 ${isSpeaking ? 'ring-1 ring-cyber-green/50 shadow-[0_0_10px_rgba(0,255,157,0.1)]' : ''}`}
    >
      <div className="flex items-center gap-3">
        {/* Connection status indicator */}
        <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-cyber-green animate-pulse' : 'bg-gray-600'}`}></div>
        
        <div className="flex flex-col">
          <span className={`text-xs font-orbitron font-bold tracking-wider ${isLocal ? 'text-cyber-blue' : 'text-gray-200'}`}>
            {username}
            {isLocal && (
              <span className="ml-2 text-[8px] bg-cyber-blue/20 text-cyber-blue px-1 rounded border border-cyber-blue/30 uppercase">You</span>
            )}
          </span>
          <span className="text-[9px] text-gray-500 uppercase font-mono">
            {participant.isMicrophoneEnabled ? "Mic Active" : "No Mic"}
          </span>
        </div>
      </div>

      {/* Mic Status Icon */}
      <div className="opacity-60">
         {participant.isMicrophoneEnabled ? (
            <svg className="w-4 h-4 text-cyber-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
         ) : (
            <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
         )}
      </div>
    </div>
  );
}