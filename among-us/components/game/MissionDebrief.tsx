import React from 'react';

export function MissionDebrief() {
  return (
    <div className="text-gray-300 font-orbitron text-sm space-y-6">
      {/* Header */}
      <h2 className="text-2xl font-bold text-cyber-blue border-b border-cyber-blue pb-2 mb-4 text-glow-blue uppercase">
        Mission Debrief
      </h2>

      {/* The Objective */}
      <section>
        <h3 className="text-xl text-white font-bold mb-2 uppercase">The Objective</h3>
        <div className="space-y-3 bg-cyber-dark p-4 border border-gray-700 rounded">
          <p>
            <strong className="text-cyber-blue">Blue Team (Analysts):</strong> Reach 100% System Integrity. You must maintain at least 80% by the 5-minute mark to prevent a total breach.
          </p>
          <p>
            <strong className="text-cyber-red">Red Team (Infiltrators):</strong> Sabotage the grid. Win by letting the timer expire while Integrity is &lt; 80%, or by achieving System Dominance for 30 seconds.
          </p>
        </div>
      </section>

      {/* The Rules */}
      <section>
        <h3 className="text-xl text-white font-bold mb-2 uppercase">The Rules</h3>
        <ul className="list-disc pl-5 space-y-2 bg-cyber-dark p-4 border border-gray-700 rounded">
          <li><strong>Observe & Adapt:</strong> There are no tutorials. If a UI element is flashing Red, it needs fixing.</li>
          <li><strong>Trust, But Verify:</strong> Sabotage can only be cleared by specific roles. If someone is standing near a "broken" terminal and not fixing it, they might be Red.</li>
          <li><strong>The Dominance Bar:</strong> If the Red Team's active attacks outweigh your defenses, your Integrity progress freezes. Clear your alerts to start winning again.</li>
          <li>
            <strong>ADD'l:</strong> Keep in mind there are up to 6 workers and up to 2 imposters (4-5 blue team = 1 red team imposter), (6 blue team = 2 red team) and there is a percentage bar of completion for blue team when they reach 100% in their task they win but red team hinders them and they can punish them by having their attacks do debuffs and even do things like stop them from doing tasks, if they control a certain area they can remove functionality, maybe turn off lights, etc, take off the help (just to make sure that the members playing can find out how to do things even if it takes them time to learn) in a time limited game, if the time limit (5-mins) runs out and blue team has less than 80% control they lose, also red team can just straight up win the game if they have control for too long (when they have a higher input of tasks then the crewmates despite their larger numbers).
          </li>
        </ul>
      </section>

      {/* Role-Specific Mini-Game Logic */}
      <section>
        <h3 className="text-xl text-cyber-green font-bold mb-2 border-b border-green-800 pb-1 uppercase">🛠️ Role-Specific Mini-Game Logic</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="bg-cyber-dark p-3 border border-gray-700 rounded">
            <h4 className="text-lg font-bold text-white mb-1">1. NetSec Operator (Network Security)</h4>
            <ul className="text-xs space-y-1 list-disc pl-4 text-gray-400">
              <li><strong>Log Sieve (Traffic Analysis):</strong> Visual: 5 vertical bars representing data flow. One bar spikes and pulses Red. Task: Tap the spiking bar 3 times to "Throttle." (Randomize which bar spikes every 5–10 seconds).</li>
              <li><strong>ACL Match (Packet Filtering):</strong> Visual: A center "Port" with a shape (Triangle). Packets (various shapes) fly toward it. Task: Flick Triangles into the port and all other shapes away.</li>
              <li><strong>Geo-Fencing (Impossible Travel):</strong> Visual: A world map. Two dots blink in rapid succession (e.g., London then Sydney). A red "Lightning Bolt" connects them. Task: Tap the "Lightning Bolt" to sever the connection.</li>
            </ul>
          </div>

          <div className="bg-cyber-dark p-3 border border-gray-700 rounded">
            <h4 className="text-lg font-bold text-white mb-1">2. CIRT Lead (Incident Response)</h4>
            <ul className="text-xs space-y-1 list-disc pl-4 text-gray-400">
              <li><strong>Process Kill (Malware Cleanup):</strong> Visual: A grid of "Healthy" circular icons. One icon is a "Glitchy" square moving erratically. Task: Tap the Glitchy Square 5 times as it moves to "Delete" it.</li>
              <li><strong>Node Isolation (Containment):</strong> Visual: A web of connected dots. One dot turns Purple and begins "bleeding" color toward neighbors. Task: Swipe across the connection lines (the "links") to cut the infected node out of the web.</li>
              <li><strong>Priority Triage (Alert Handling):</strong> Visual: Three buttons: A pulsing Red Flame, a yellow Triangle, and a blue Circle. Task: Press in order: Flame &rarr; Triangle &rarr; Circle. Wrong order resets the task.</li>
            </ul>
          </div>

          <div className="bg-cyber-dark p-3 border border-gray-700 rounded">
            <h4 className="text-lg font-bold text-white mb-1">3. Detection Engineer (Threat Hunting)</h4>
            <ul className="text-xs space-y-1 list-disc pl-4 text-gray-400">
              <li><strong>String Match (Pattern Detection):</strong> Visual: A fast-moving "Waterfall" of green code text. A target snippet (e.g., 0x88ff) is displayed in a static box at the top. Task: Tap the snippet when it appears in the moving waterfall.</li>
              <li><strong>Signal to Noise (Frequency Analysis):</strong> Visual: Two wavy lines (Sine waves). One is your "Baseline," the other is "Jumpy." Task: Use a slider to adjust the frequency of your baseline until it perfectly overlaps the jumpy line.</li>
              <li><strong>C2 Heartbeat (Beacon Detection):</strong> Visual: A circular ring that pulses. A "Target Ring" expands and contracts rhythmically. Task: Tap the screen exactly when the two rings overlap 4 times in a row.</li>
            </ul>
          </div>

          <div className="bg-cyber-dark p-3 border border-gray-700 rounded">
            <h4 className="text-lg font-bold text-white mb-1">4. DFIR Specialist (Forensics)</h4>
            <ul className="text-xs space-y-1 list-disc pl-4 text-gray-400">
              <li><strong>Evidence Chain (Timeline Reconstruction):</strong> Visual: 3 static "Event Cards" (e.g., "Email Received," "File Opened," "System Encrypted"). Task: Drag and drop them into the correct 1-2-3 chronological order.</li>
              <li><strong>Hex Hunt (Artifact Recovery):</strong> Visual: A dark grid of numbers. Moving a "Light Circle" (your cursor) reveals hidden values. Task: Find the one value that matches the target "Gold Hex" shown in the corner.</li>
              <li><strong>Persistence Wipe (Registry Cleanup):</strong> Visual: A file tree (Folders). One folder has a "Bug" icon inside it deep in the sub-directories. Task: Navigate the folders (Click to open/back) to find the Bug and "Trash" it.</li>
            </ul>
          </div>

          <div className="bg-cyber-dark p-3 border border-gray-700 rounded">
            <h4 className="text-lg font-bold text-white mb-1">5. SecOps Architect (Hardening)</h4>
            <ul className="text-xs space-y-1 list-disc pl-4 text-gray-400">
              <li><strong>Critical Patching (Vulnerability Management):</strong> Visual: 3 "Pressure Gauges" with numbers: 9.8 (Red), 7.0 (Orange), 4.0 (Yellow). Task: Tap and hold the 9.8 gauge until it hits 0, then move to the next.</li>
              <li><strong>Entropy Boost (Credential Hardening):</strong> Visual: A combination lock with 4 tumblers. Task: Spin all 4 tumblers until they turn from Red to Green (representing high-entropy characters).</li>
              <li><strong>Port Closer (Attack Surface Reduction):</strong> Visual: A 3D server rack with 6 "Slots." Some slots have doors that are swinging open. Task: Tap the open doors to "Lock" them before a Red "Hand" reaches inside.</li>
            </ul>
          </div>

          <div className="bg-cyber-dark p-3 border border-gray-700 rounded">
            <h4 className="text-lg font-bold text-white mb-1">6. CTI Analyst (Threat Intelligence)</h4>
            <ul className="text-xs space-y-1 list-disc pl-4 text-gray-400">
              <li><strong>Feed Scrubbing (OSINT):</strong> Visual: A fast-moving ticker of headlines. Some are irrelevant (Weather, Sports); some mention "Cyber," "Breach," or the "Company Name." Task: Tap only the relevant "Threat" headlines.</li>
              <li><strong>APT Attribution (Group Profiling):</strong> Visual: A logo of a "Hacker Group" (e.g., a Bear) and 3 potential "Weapon" icons (e.g., a Phish hook, a Hammer, a Key). Task: Match the Bear to the Phish hook (based on group profile logic).</li>
              <li><strong>Threat Map (Global Monitoring):</strong> Visual: A digital globe. A specific region starts glowing and "Heating Up." Task: Tap and hold the glowing region to "Cool it down" before it explodes and triggers a global debuff.</li>
            </ul>
          </div>

        </div>
      </section>

      {/* Red Team Sabotage Logic */}
      <section>
        <h3 className="text-xl text-cyber-red font-bold mb-2 border-b border-red-900 pb-1 uppercase">🛑 Red Team: Sabotage & Deception Logic</h3>
        <div className="bg-red-900/20 p-4 border border-cyber-red rounded">
          <p className="mb-2 text-red-200">Red Team has a Sabotage UI with cooldowns. They must be at a "Terminal" to trigger these.</p>
          <ul className="list-disc pl-5 space-y-2 text-red-100/80">
            <li><strong>Logic Bomb (The Game Ender):</strong> Logic: Starts a 45s countdown. Blue Team must have 2 different roles (e.g., CIRT and NetSec) interact with the "Core" simultaneously to defuse.</li>
            <li><strong>UI Scramble (Log Encryption):</strong> Effect: For 20s, all Blue Team labels turn into 0x?? symbols.</li>
            <li><strong>Latency Spike (DDoS):</strong> Effect: For 20s, Blue Team must double-tap everything because the first tap is "dropped."</li>
            <li><strong>Power Cut (Blackout):</strong> Effect: Reduces Blue Team vision to a small circle around their character.</li>
            <li><strong>Fake Task (The Blend):</strong> Logic: Red can stand at any terminal. To Blue players, it looks like they are working, but the Integrity bar does not move.</li>
          </ul>
        </div>
      </section>

    </div>
  );
}
