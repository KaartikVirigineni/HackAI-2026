# 🔐 CrashOut

## 🔗Links
Devpost: https://devpost.com/software/cyberarena
Youtube: https://www.youtube.com/watch?v=0Ccadf0KqAI

> **Master Cybersecurity Through Play** — A gamified, multiplayer cybersecurity education platform built for the next generation of defenders.

CrashOut is a real-time, cyberpunk-themed web application that teaches cybersecurity through interactive gameplay, live trivia challenges, AI-powered mentoring, and a co-op Phishing Pier simulation. Compete on the global leaderboard, earn ranks, and level up your security knowledge.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎯 **Live Trivia** | 5-question rapid-fire cybersecurity quiz with real-time scoring and a mission debrief screen |
| 📖 **Intel Briefing (Learn)** | AI-generated cybersecurity lessons with adaptive difficulty, MCQ checkpoints, and markdown rendering |
| 🤖 **Gemini AI Mentor** | Chat with a Gemini-powered AI tutor — upload your syllabus for personalized exam prep |
| 🎙️ **Voice Chat** | LiveKit-powered real-time voice rooms with public and private party modes |
| 🕵️ **Phishing Pier** | Multiplayer Among-Us-style social deduction game where APT vs Admin teams battle for network control |
| 🏆 **Global Leaderboard** | Rankings update live after every trivia session with dynamic rank progression |
| 👤 **Agent Profile** | Manage credentials, view rank/points, and update account settings |

---

## 🏅 Rank System

Points earned through trivia unlock new agent ranks:

| Rank | Points Required |
|---|---|
| Recruit | 0 |
| Specialist | 1,000 |
| Operative | 2,500 |
| Cyber Agent | 5,000 |
| Elite Sentinel | 10,000 |
| Ghost Protocol | 20,000 |

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org) (App Router, Server Actions)
- **Database:** MongoDB via Mongoose
- **AI:** Google Gemini API
- **Voice Chat:** [LiveKit](https://livekit.io)
- **Real-Time Multiplayer:** Socket.IO
- **Styling:** Tailwind CSS v4 (cyberpunk theme)
- **Auth:** bcryptjs + localStorage session

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in the root with the following:

```env
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_google_gemini_api_key
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
NEXT_PUBLIC_LIVEKIT_URL=wss://your-livekit-server-url
```

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
app/
├── page.tsx              # Login page
├── register/             # Registration page
├── home/                 # Home dashboard + leaderboard
├── learn/                # AI lesson + voice chat lobby
├── trivia/               # Live trivia game
├── chat/                 # Gemini AI Mentor chatbot
├── cybermates/           # Phishing Pier multiplayer game
├── profile/              # Agent profile & settings
├── voiceChat.tsx         # LiveKit voice chat component
├── actions/              # Server actions (auth, user, profile)
├── api/
│   ├── learn/            # Gemini lesson generation
│   ├── trivia/           # Gemini trivia generation
│   ├── chat/             # Gemini chat endpoint
│   └── livekit/          # LiveKit token generation
└── lib/
    ├── mongodb.ts         # DB connection + User schema
    └── aiProvider.ts      # Gemini API wrapper
```

---

## 📜 License

MIT — built for HackAI.
