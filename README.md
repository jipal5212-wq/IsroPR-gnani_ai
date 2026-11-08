# 🛰️ IsroPR — Multilingual Public Space Awareness Platform

<div align="center">

[![Live Demo](https://img.shields.io/badge/Live_Demo-isropr.vercel.app-00B4D8?style=for-the-badge&logo=vercel&logoColor=white)](https://isropr.vercel.app)
[![Challenge](https://img.shields.io/badge/Submission-Gnani.ai_Internship_Challenge-FF6B6B?style=for-the-badge)](SOLUTION_PITCH.md)
[![Voice AI](https://img.shields.io/badge/Voice_Stack-Gnani_AI_(Timbre_v3.0_%2B_Prisma)-0072CE?style=for-the-badge)](https://gnani.ai/)
[![Database](https://img.shields.io/badge/Database-SQLite_FTS5-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Tests](https://img.shields.io/badge/Tests-23%2F23_Passing-brightgreen?style=for-the-badge)](https://github.com/jipal5212-wq/IsroPR-gnani_ai)
[![Node.js](https://img.shields.io/badge/Node.js-24.x-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)

**Bringing India's space triumphs to 1.4 Billion citizens across 6 Indian languages.**  
*Cinematic Voice Documentaries · Zero-Hallucination Space AI · WhatsApp-Style Voice Parity · Spotify-Grade Player*

[**🚀 Live Platform (isropr.vercel.app)**](https://isropr.vercel.app) · [**📄 1-Page Solution Pitch**](SOLUTION_PITCH.md) · [**🛰️ NVS-03 Investigation**](docs/NVS-03-MISSION.md) · [**📖 Architecture**](docs/ARCHITECTURE.md)

---

</div>

> ### 📌 Gnani.ai Challenge Submission Note
> **Rule Compliance:** A complete, standalone **1-Page Solution Pitch** is provided directly below and also available as a printable markdown document at [**`SOLUTION_PITCH.md`**](SOLUTION_PITCH.md).

---

## 📄 1-Page Solution Pitch

### 🌌 The Vision
> *"If we truly want India to dominate the space sector, we need to inspire the next generation."*

India has achieved incredible milestones in space exploration — from Chandrayaan-3 touching down near the Moon's rugged South Pole to Mangalyaan reaching Mars on its maiden voyage and NavIC securing our sovereign skies. 

**But how many people truly know the untold stories behind these missions? And how many young minds are inspired to pursue careers in space science and engineering?**

I believe every great space mission has a story worth telling — and that story deserves to reach everyone, in their own mother tongue. **The next generation of Indian space scientists and engineers might need just one inspiring story to begin their journey.**

To contribute towards this vision, I built **IsroPR** — a voice-first, multilingual space storytelling platform powered by **Gnani.ai** designed to bring India's remarkable space achievements closer to 1.4 billion citizens.

---

### 🎯 What IsroPR Achieves

1. **Make India's space achievements accessible to a wider audience**: Replaces dry, technical text briefings with gripping, broadcast-quality audio documentaries (up to 9 minutes per episode) detailing the human grit, engineering heartbreaks, and victories.
2. **Break language barriers**: Empowers **over 800 million citizens** across regional linguistic belts by delivering authentic narrations and AI interactions across **6 Indian languages** (Hindi, English, Tamil, Telugu, Bengali, Kannada).
3. **Inspire the next generation**: Equips curious students and space enthusiasts with an interactive, **WhatsApp-style conversational Space Chat** featuring true voice-in/voice-out parity and verified, zero-hallucination facts.

---

### 🛠️ Two Core Pillars & Gnani.ai Stack Integration

#### 1. Cinematic Multilingual Audio Documentaries (Spotify-Grade)
- **Gnani Timbre v3.0 TTS**: Deep emotional synthesis using expressive voice markers (`<exhales>`, `<slow>`, `<soft>`) in studio 24kHz 16-bit Mono PCM WAV with single institutional voice dignity (`Shivani`).
- **Persistent Spotify Audio Dock**: Background playback continues uninterrupted across all page views, missions, and chat interactions with 15s skip, variable speeds (0.75x–1.5x), and live scrubbers.
- **On-the-Fly Language Switcher**: Switch narration language instantly (e.g., Hindi to Tamil or Kannada) without losing playback time.

#### 2. WhatsApp-Style Conversational Space Chat (Voice Parity)
- **Gnani Prisma v2.5 STT**: Real-time voice note transcription with `indic-auto` automatic language recognition.
- **Voice Parity**: Users speak in their mother tongue and receive both synchronized text and a natural, studio-voiced audio note in response.
- **Zero-Hallucination Verified RAG**: Native SQLite FTS5 BM25 search over official ISRO archives combined with live web retrieval. Every response cites verified sources (`isro.gov.in`) with automated offline fallback.

---

### 📊 Tech Stack & Performance Highlights
- **Architecture**: Node.js 24 + Express + SQLite FTS5 (0KB frontend framework overhead, instant sub-100ms transitions).
- **Test Suite**: **23/23 tests passing** (`npm test`) covering audio streaming, RAG retrieval, and language detection.
- **Live Deployment**: Production-ready on Vercel Edge at [`https://isropr.vercel.app`](https://isropr.vercel.app).

> *Note: More interesting future updates are coming to the IsroPR platform — including Gaganyaan crewed mission tracking, interactive orbital telemetry, and classroom outreach modules.*

---

## 🌟 Key Features Walkthrough

### 1. 🎙️ Cinematic Multilingual Audio Storytelling
- Deep, emotionally nuanced narrations powered by **Gnani AI's Timbre v3.0** engine using expressive vocal markers (`<exhales>`, `<slow>`, `<sniffles>`, `<soft>`).
- Full ~8–10 minute documentary episodes with historical context (e.g. from the 1999 Kargil GPS denial to the 2026 GSLV-F18 Pyro Valve gambit).
- Standardized broadcast audio: **24,000 Hz, 16-bit Mono PCM WAV**, seamlessly stitched into unified continuous tracks.

### 2. 🎵 Spotify-Inspired Audio Player
- **Persistent Bottom Player**: Plays audio uninterrupted across all page views and SPA navigation.
- **Full Player Modal**: Displays mission artwork, dynamic waveform equalizer, full progress scrubber, and ±15s skip buttons.
- **On-the-Fly Language Switcher**: Switch narration language instantly (e.g. from Hindi to Tamil or Bengali) without losing playback context or UI state.
- **Variable Speed Controls**: 0.75x, 1.0x, 1.25x, and 1.5x speeds.
- **Zero Audio Overlap**: Strict single-track audio lifecycle prevents conflicting playback.

### 3. 🛰️ Upcoming & Ongoing Missions Radar
- Real-time technical briefings for active launch campaigns (e.g. **NVS-03 NavIC Navigation Satellite** aboard **GSLV-F18**).
- Investigative explainers covering engineering breakthroughs — such as ISRO's historic 51-year first decision to pre-fire pyro valves on the ground to overcome the NVS-02 oxidiser valve anomaly.

### 4. 💬 Space Chat — Zero-Hallucination Verified AI
- WhatsApp-style chat interface with support for text and voice notes.
- **RAG (Retrieval-Augmented Generation)**: Grounded exclusively in verified ISRO facts, mission specs, and official press releases with live citations and timestamps.
- **Offline Resilient**: When external LLM APIs are unreachable, the platform automatically falls back to local **SQLite FTS5 BM25** search to provide accurate, verified facts instantly.

---

## 🗣️ Supported Languages & Voice Talents

All voice narrations are generated using state-of-the-art Indic speech synthesis:

| Language | Script | Voice Talent | Audio Duration (NVS-03) | Status |
|:---|:---|:---|:---:|:---:|
| **Hindi** | हिन्दी (`hi-IN`) | Shivani | **9m 00s** (540s) | ✅ Live |
| **English (India)** | English (`en-IN`) | Shivani | **8m 03s** (483s) | ✅ Live |
| **Tamil** | தமிழ் (`ta-IN`) | Shivani | **9m 48s** (588s) | ✅ Live |
| **Telugu** | తెలుగు (`te-IN`) | Shivani | **8m 55s** (535s) | ✅ Live |
| **Bengali** | বাংলা (`bn-IN`) | Shivani | **9m 14s** (554s) | ✅ Live |
| **Kannada** | ಕನ್ನಡ (`kn-IN`) | Shivani | **9m 10s** (550s) | ✅ Live |

---

## 🏗️ Architecture & Tech Stack

```
IsroPR-gnani_ai/
├── api/
│   └── index.js              # Serverless entrypoint for Vercel deployment
├── data/
│   ├── audio/stories/        # Master multi-language WAV audio tracks
│   ├── covers/               # Authentic mission cover artwork
│   ├── gallery/              # High-resolution ISRO & startup photo assets
│   └── spacebharat.db        # SQLite database (stories, translations, FTS5 index)
├── docs/
│   ├── ARCHITECTURE.md       # Full architectural specification & design choices
│   └── NVS-03-MISSION.md     # In-depth NVS-03 mission investigation & narrative
├── scripts/
│   ├── backup.sh             # Automated database backup utility
│   ├── generate-*-audio.js   # Multi-chunk TTS synthesis pipelines (Gnani AI)
│   └── nvs03-chunks.json     # 14-chunk structured Hindi narration script
├── server/
│   ├── index.js              # Express app with Helmet, CORS, and rate limiting
│   ├── config.js             # Environment parsing and voice mapping
│   ├── db/
│   │   ├── db.js             # better-sqlite3 instance with WAL mode
│   │   ├── schema.sql        # Database tables, triggers, and FTS5 virtual table
│   │   └── seed.js           # Multi-story seed script with verified facts
│   ├── middleware/           # Auth guard, Multer uploads, Rate-limiters
│   ├── routes/               # Modular Express routers (public, chat, admin)
│   └── services/             # Gnani TTS/STT, RAG retriever, LLM adapters
├── tests/                    # 23 automated unit and integration tests
├── web/                      # Vanilla ES Module client-side SPA
│   ├── index.html            # Main story library & mission radar
│   ├── story.html            # Dedicated story briefing & player view
│   ├── chat.html             # WhatsApp-style Space AI chat
│   ├── css/                  # Responsive cosmic design tokens & stylesheets
│   └── js/                   # Modular client state, Spotify player, and audio hooks
├── SOLUTION_PITCH.md         # Dedicated 1-page solution pitch for Gnani challenge
└── vercel.json               # Edge routing, media rewrites & security headers
```

### Technology Highlights
- **Backend**: Node.js 24 + Express 5 (Native ES Modules, zero build steps).
- **Voice AI**: Gnani AI `timbre-v3.0` (Text-to-Speech) and `prisma-v2.5` (Speech-to-Text).
- **Database**: SQLite 3 via `better-sqlite3` with **FTS5** (Full-Text Search) and WAL journaling.
- **Frontend**: Vanilla HTML5, CSS3, ES6 JavaScript — ultra-lightweight, 0KB framework overhead, instant load times.
- **Security**: Strict Helmet headers, HttpOnly SameSite=Strict cookies, bcrypt (cost 12), and server-side secret shielding.

---


## 👨‍💻 Author & Acknowledgements

- **Developer**: Ashish Kumar Pal ([@jipal5212-wq](https://github.com/jipal5212-wq))
- **Live Deployment**: [https://isropr.vercel.app](https://isropr.vercel.app)
- **Internship Challenge**: [Gnani.ai](https://gnani.ai/) AI/Voice Engineering Internship
- **Speech Synthesis**: [Gnani.ai](https://gnani.ai/) Indic Voice AI (Timbre v3.0 & Prisma v2.5)
- **Mission Telemetry & Data**: [ISRO Official Portal](https://isro.gov.in/) & [IndianSpaceFlight.in](https://www.indianspaceflight.in/)

---

<div align="center">
  <b>Dedicated to the scientists, engineers, and visionaries of the Indian Space Research Organisation (ISRO). 🚀🇮🇳</b>
</div>
