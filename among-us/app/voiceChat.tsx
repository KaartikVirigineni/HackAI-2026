"use client";

import { useState, useEffect } from "react";
import { LiveKitRoom, AudioConference } from "@livekit/components-react";
import "@livekit/components-styles";

export default function VoiceChat({ roomName = "cyberarena-room", username = "agent_" + Math.floor(Math.random() * 1000) }) {
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
    return <div className="text-cyber-blue font-orbitron text-center p-4">Connecting to Secure Comm Channel...</div>;
  }

  return (
    <LiveKitRoom
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      token={token}
      connect={true}
      audio={true}
      video={false}
      data-lk-theme="default"
    >
      <div className="bg-cyber-darker border border-cyber-blue-dim p-4 rounded-xl shadow-[0_0_15px_rgba(0,243,255,0.1)]">
        <h3 className="text-cyber-blue font-orbitron mb-4 text-center">Secure Comm Channel</h3>
        <AudioConference />
      </div>
    </LiveKitRoom>
  );
}