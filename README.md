# 🛰️ IsroPR — Multilingual Public Space Awareness Platform

<div align="center">

[![Live Demo](https://img.shields.io/badge/Live_Demo-isropr.vercel.app-00B4D8?style=for-the-badge&logo=vercel&logoColor=white)](https://isropr.vercel.app)
[![Node.js](https://img.shields.io/badge/Node.js-24.x-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![TTS Engine](https://img.shields.io/badge/Voice_AI-Gnani_AI_Timbre_v3.0-FF6B6B?style=for-the-badge)](https://gnani.ai/)
[![Database](https://img.shields.io/badge/Database-SQLite_FTS5-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Tests](https://img.shields.io/badge/Tests-23%2F23_Passing-brightgreen?style=for-the-badge)](https://github.com/jipal5212-wq/IsroPR-gnani_ai)
[![License](https://img.shields.io/badge/License-ISC-blue?style=for-the-badge)](LICENSE)

**Bringing India's space triumphs to 1.4 Billion citizens across 6 Indian languages.**  
*Cinematic Audio Narrations · Verified Facts · Zero-Hallucination Space AI Chat · Spotify-Grade Player*

[**Explore Live Platform 🚀**](https://isropr.vercel.app) · [**Architecture Docs 📖**](docs/ARCHITECTURE.md) · [**NVS-03 Deep Dive 🛰️**](docs/NVS-03-MISSION.md)

---

</div>

## 🌌 The Mission

India's space achievements — from Chandrayaan-3 landing on the lunar South Pole to Mangalyaan reaching Mars on its first attempt — inspire the entire world. However, scientific briefings and media outreach are overwhelmingly published in English and formal Hindi.

**Over 800 million citizens** across regional states miss out on the thrill, pride, and educational depth of India's space program in their mother tongue.

**IsroPR** solves this gap. It is a sovereign, fast, lightweight public awareness platform that presents every ISRO milestone as an **immersive, cinematic audio story** narrated in **6 Indian languages**, accompanied by a **WhatsApp-style conversational Space AI** that only answers with verified, cited facts.

---

## 🌟 Key Features

### 1. 🎙️ Cinematic Multilingual Audio Storytelling
- Deep, emotionally nuanced narrations powered by **Gnani AI's Timbre v3.0** engine using expressive vocal markers (`<exhales>`, `<slow>`, `<sniffles>`, `<soft>`).
- Full ~8–10 minute documentary episodes with historical context (e.g. from the 1999 Kargil GPS denial to the 2026 GSLV-F18 Pyro Valve gambit).
- Standardized broadcast audio: **24,000 Hz, 16-bit Mono PCM WAV**, seamlessly stitched into unified continuous tracks.

### 2. 🎵 Spotify-Inspired Audio Player
- **Persistent Bottom Player**: Plays audio uninterrupted across all page views.
- **Full Player Modal**: Displays mission artwork, dynamic waveform equalizer, full progress scrubber, and ±15s skip buttons.
- **On-the-Fly Language Switcher**: Switch narration language instantly (e.g. from Hindi to Tamil or Bengali) without losing your playback context or UI state.
- **Variable Speed Controls**: 0.75x, 1.0x, 1.25x, and 1.5x speeds.
- **Zero Audio Overlap**: Strict single-track audio lifecycle prevents conflicting playback.

### 3. 🛰️ Upcoming & Ongoing Missions Radar
- Real-time countdown and technical briefings for active launch campaigns (e.g. **NVS-03 NavIC Navigation Satellite** aboard **GSLV-F18**).
- Investigative explainers covering engineering breakthroughs — such as ISRO's historic 51-year first decision to pre-fire pyro valves on the ground to overcome the NVS-02 oxidiser valve anomaly.

### 4. 💬 Space Chat — Zero-Hallucination Verified AI
- WhatsApp-style chat interface with support for text and voice notes.
- **RAG (Retrieval-Augmented Generation)**: Grounded exclusively in verified ISRO facts, mission specs, and official press releases with live citations and timestamps.
- **Offline Resilient**: When external LLM APIs are unreachable, the platform automatically falls back to local **SQLite FTS5 BM25** search to provide accurate, verified facts instantly.

### 5. 🖼️ Space Heritage & Startup Gallery
- High-resolution authentic imagery spanning Aryabhata (1975) to Gaganyaan TV-D1, Chandrayaan-3 NavCam crater photos, and Indian space startups like Skyroot, Agnikul, Pixxel, and Bellatrix.

### 6. 📱 Responsive, Touch-First UI
- Designed from the ground up for mobile, tablet, and desktop screens with dark cosmic gradients, clear typography, and accessible touch targets.

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
│   ├── download-gallery.js   # Asset downloader for ISRO gallery photos
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
│   ├── story.html            # Dedicated story briefing & transcript reader
│   ├── chat.html             # WhatsApp-style Space AI chat
│   ├── css/                  # Responsive cosmic design tokens & stylesheets
│   └── js/                   # Modular client state, Spotify player, and audio hooks
└── vercel.json               # Edge routing, media rewrites & security headers
```

### Technology Highlights
- **Backend**: Node.js 24 + Express 5 (Native ES Modules, zero build steps).
- **Voice AI**: Gnani AI `timbre-v3.0` (Text-to-Speech) and `prisma-v2.5` (Speech-to-Text).
- **Database**: SQLite 3 via `better-sqlite3` with **FTS5** (Full-Text Search) and WAL journaling.
- **Frontend**: Vanilla HTML5, CSS3, ES6 JavaScript — ultra-lightweight, 0KB framework overhead, instant load times.
- **Security**: Strict Helmet headers, HttpOnly SameSite=Strict cookies, bcrypt (cost 12), and server-side secret shielding.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v20+ or v24+
- **npm** v10+

### 1. Clone the Repository
```bash
git clone https://github.com/jipal5212-wq/IsroPR-gnani_ai.git
cd IsroPR-gnani_ai
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
Copy the example environment configuration:
```bash
cp .env.example .env
```
*(Optional: Provide your `GNANI_API_KEY` for live audio synthesis or `OPENAI_API_KEY` for live LLM chat. The app runs fully with verified local fallbacks out of the box).*

### 4. Seed the Database
Populate missions, multi-language translations, and knowledge facts:
```bash
npm run seed
```

### 5. Start Local Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser!

---

## 🧪 Automated Test Suite

The project includes an end-to-end test suite powered by Node.js native test runner:

```bash
npm test
```

```
✔ Public endpoint /api/languages returns enabled languages
✔ Protected endpoint /api/admin/me returns 401 without auth
✔ Admin login fails with invalid credentials
✔ Admin login succeeds with valid credentials and sets session cookie
✔ Only single Chandrayaan-3 story exists in public stories list
✔ Chandrayaan-3 plays continuous single unified audio track in one go
✔ Continuous master audio stream returns 200 with full audio length
✔ Database initializes and has all expected tables
✔ Default settings are populated
✔ Settings can be updated and retrieved
✔ NVS-03 exists in public stories list under upcoming-ongoing category
✔ NVS-03 returns ready audio status and continuous audio for hi-IN
✔ NVS-03 cover image and audio file exist on disk and have valid sizes
✔ Web search query reformulator optimizes Indic and English queries
✔ Live internet search returns space results from web
✔ RAG retrieval retrieves both local SQLite FTS5 facts and live web context
✔ Source sanitizer fixes outdated ISRO links and prioritizes query-matching sources
✔ Chat turn generates accurate NVS-03 response and working source citations
✔ Admin can create a new story
✔ Admin can add English translation to the story
✔ Story cannot be published without English body text
✔ Publish story and fetch from public stories API
✔ Knowledge base CRUD and FTS5 retrieval works

ℹ tests 23
ℹ pass 23
ℹ fail 0
```

---

## 📡 REST API Reference

| Method | Endpoint | Description | Auth Required |
|:---|:---|:---|:---:|
| `GET` | `/api/languages` | List enabled Indic languages & categories | No |
| `GET` | `/api/stories?lang=&category=&q=` | Query published stories by language & filter | No |
| `GET` | `/api/stories/:id?lang=` | Get full story briefing, translation & audio | No |
| `POST` | `/api/chat` | Send question to Space AI (returns verified facts & audio) | No |
| `GET` | `/media/audio/stories/:id/:file` | Stream continuous master audio track with HTTP 206 range support | No |
| `POST` | `/api/admin/login` | Admin authentication (sets HttpOnly cookie) | No |
| `POST` | `/api/admin/stories` | Create/draft a new space mission story | Yes |
| `POST` | `/api/admin/stories/:id/generate-audio` | Trigger background audio synthesis queue | Yes |

---

## 🛡️ Security & Integrity

- **Zero Client-Side Keys**: API keys and secrets are never exposed to the frontend.
- **Strict Content Security**: Protected with `helmet` HTTP headers, CSP rules, and SameSite cookie policies.
- **Brute-Force & Rate Limiting**: Tiered rate limiters protect public endpoints (60 req/min), chat turns (20 req/min), and admin login (5 attempts per 15 min).
- **Verified Fact Grounding**: Chat responses are anchored to ISRO press documents, preventing hallucinations.

---

## 👨‍💻 Author & Acknowledgements

- **Developer**: Ashish Kumar Pal ([@jipal5212-wq](https://github.com/jipal5212-wq))
- **Live Deployment**: [https://isropr.vercel.app](https://isropr.vercel.app)
- **Speech Synthesis**: [Gnani.ai](https://gnani.ai/) Indic Voice AI.
- **Mission Telemetry & Data**: [ISRO Official Portal](https://isro.gov.in/) & [IndianSpaceFlight.in](https://www.indianspaceflight.in/).

---

<div align="center">
  <b>Dedicated to the scientists, engineers, and visionaries of the Indian Space Research Organisation (ISRO). 🚀🇮🇳</b>
</div>
