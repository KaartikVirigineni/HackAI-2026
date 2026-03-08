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
  ParticipantContext
} from "@livekit/components-react";
import { Track } from "livekit-client";
import "@livekit/components-styles";

export default function VoiceChat({ roomName = "cyberarena-room", username: propUsername }: { roomName?: string, username?: string }) {
  const [username] = useState(() => propUsername || "agent_" + Math.floor(Math.random() * 1000));
  const [token, setToken] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch(`/api/livekit?room=${roomName}&username=${username}`);
        const data = await resp.json();
        setToken(data.token);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [roomName, username]);

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
        {/* Connection Status */}
        <div className="flex justify-between items-center px-2 py-1 border-b border-cyber-blue/10">
          <span className="text-[10px] font-orbitron text-cyber-blue/50 uppercase">Room: {roomName.split('-').pop()}</span>
          <ConnectionState className="text-[10px] font-orbitron text-cyber-green" />
        </div>

        {/* Custom Participant List */}
        <div className="flex-1 overflow-y-auto min-h-[120px] scrollbar-hide">
          <ParticipantLoopWrapper />
        </div>

        {/* Compact Controls */}
        <div className="mt-auto pt-2 border-t border-cyber-blue/10">
          <ControlBar 
            variation="minimal" 
            controls={{ microphone: true, screenShare: false, camera: false, chat: false, leave: true }} 
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
        <ParticipantTile 
          key={track.participant.identity}
          trackRef={track}
          className="!bg-cyber-dark/60 !border !border-cyber-blue/20 !rounded-lg !p-1 !h-20"
        />
      ))}
    </div>
  );
}