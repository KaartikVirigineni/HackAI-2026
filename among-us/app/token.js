import { AccessToken } from "livekit-server-sdk";

// Reading configuration from your .env automatically
const apiKey = process.env.LIVEKIT_API_KEY;
const apiSecret = process.env.LIVEKIT_API_SECRET;

if (!apiKey || !apiSecret) {
  console.error("Missing LIVEKIT_API_KEY or LIVEKIT_API_SECRET in .env file!");
  process.exit(1);
}

const at = new AccessToken(apiKey, apiSecret, {
  identity: "test_agent_007",
});

at.addGrant({
  roomJoin: true,
  room: "cyberarena-room",
});

(async () => {
  console.log("=== Generated LiveKit JWT Token ===");
  console.log(await at.toJwt());
  console.log("===================================");
})();
console.log("===================================");
