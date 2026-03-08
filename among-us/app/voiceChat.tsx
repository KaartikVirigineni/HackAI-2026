"use client";

import { useState, useEffect } from "react";
import {
  LiveKitRoom,
  ParticipantLoop,
  ParticipantTile,
  ControlBar,
  RoomAudioRenderer,
  useTracks,
  ConnectionState,
  ParticipantContext,
  TrackToggle,
  DisconnectButton
} from "@livekit/components-react";
import { Track } from "livekit-client";
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
  const tracks = useTracks([Track.Source.Microphone]);
  return (
    <div className="grid grid-cols-2 gap-2">
      {tracks.map((track) => (
        <CustomParticipantTile
          key={track.participant.identity}
          trackRef={track}
        />
      ))}
    </div>
  );
}

function CustomParticipantTile({ trackRef }: { trackRef: any }) {
  const [isLocallyMuted, setIsLocallyMuted] = useState(false);
  const isLocal = trackRef.participant.isLocal;

  // We can't actually mute the track natively via components-react easily without digging into the track object, 
  // but we can set the volume to 0 to "mute" them locally if they are not the local user.
  useEffect(() => {
    if (!isLocal && trackRef.publication?.track) {
      const audioTrack = trackRef.publication.track as any;
      if (audioTrack.setVolume) {
        audioTrack.setVolume(isLocallyMuted ? 0 : 1);
      }
    }
  }, [isLocallyMuted, trackRef.publication, isLocal]);

  return (
    <div
      className={`relative !bg-cyber-dark/60 !border !border-cyber-blue/20 !rounded-lg !p-1 !h-20 overflow-hidden cursor-pointer hover:border-cyber-blue/50 transition-colors ${isLocallyMuted && !isLocal ? 'opacity-50' : ''}`}
      onClick={() => {
        if (!isLocal) {
          setIsLocallyMuted(!isLocallyMuted);
        }
      }}
      title={isLocal ? "You" : (isLocallyMuted ? "Unmute user" : "Mute user locally")}
    >
      <ParticipantTile
        trackRef={trackRef}
        className="w-full h-full [&>.lk-participant-metadata]:opacity-100" // Ensure name is always visible
      />
      {/* Mute Overlay Icon */}
      {isLocallyMuted && !isLocal && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-none rounded-lg">
          <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        </div>
      )}
    </div>
  );
}