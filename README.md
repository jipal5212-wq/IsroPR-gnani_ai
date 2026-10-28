# 🛰️ IsroPR (Official Public Relations & Outreach Platform)

> Dedicated to public space awareness and education across India.
> Multilingual Voice Narration powered by [Gnani AI](https://gnani.ai/) · Official facts cited from [ISRO](https://isro.gov.in/) and [indianspaceflight.in](https://www.indianspaceflight.in/).

---

## 🌟 Highlights & Features

- 🎧 **Multilingual Audio Library**: Browse and stream stories across Indian languages (English, हिन्दी, தமிழ், తెలుగు, বাংলা) with high-definition audio narration.
- 💬 **Space Chat**: WhatsApp-style voice and text assistant answering questions exclusively from verified official knowledge base facts (FTS5 BM25 search).
- 🎙️ **Voice Notes**: Hold-to-record voice notes with automatic speech-to-text (STT) and voice replies (TTS).
- 🔐 **Admin Control Center**: Comprehensive story authoring, translation tabs, sentence word counter, audio generation queue, knowledge base curator, and chat activity monitor.
- ⚡ **Light & Sovereign Stack**: Built with Node.js, Express, SQLite (`better-sqlite3` with WAL & FTS5), and vanilla ES modules. Zero bloated frameworks, single-deployable unit.

---

## 🏗️ Architecture

```
space-bharat/
├── server/
│   ├── index.js                 # Express server with Helmet, rate limiting & static routes
│   ├── config.js                # App configuration, directories & language voices
│   ├── db/
│   │   ├── schema.sql           # SQLite schema, FTS5 table, triggers & indexes
│   │   ├── db.js                # Connection manager with WAL mode
│   │   └── seed.js              # Sample stories & knowledge base seeding
│   ├── routes/
│   │   ├── public.js            # Stories & languages endpoints
│   │   ├── chat.js              # Sessions, text & voice chat endpoints
│   │   └── admin.js             # Auth, story CRUD, knowledge & jobs endpoints
│   ├── middleware/              # Auth guard, rate limiters, Multer uploads
│   ├── services/
│   │   ├── gnani/               # STT (Prisma v2.5) & TTS (Timbre v2.5) clients
│   │   ├── llm/                 # LLM provider adapter with fallback
│   │   ├── rag.js               # SQLite FTS5 BM25 retrieval
│   │   ├── audio.js             # ffmpeg helpers & sentence splitters
│   │   └── jobs.js              # Background audio generation queue worker
│   └── cli/
│       └── create-admin.js      # CLI tool to create admin credentials (bcrypt cost 12)
├── web/                         # Frontend client
│   ├── index.html               # Public library homepage
│   ├── story.html               # Audio player with speed control & transcript
│   ├── chat.html                # WhatsApp-style Space Chat
│   ├── about.html               # Mission, voice stack & principles
│   ├── admin/                   # Admin console pages
│   ├── css/                     # Cosmic stylesheets (style.css & admin.css)
│   └── js/                      # Modular client logic (player, chat, library, admin)
└── data/                        # Persistent storage (spacebharat.db, audio, uploads)
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy the example environment file:
```bash
cp .env.example .env
```
*(Optional: add your `GNANI_API_KEY` and `LLM_API_KEY` to `.env` for production speech and LLM endpoints).*

### 3. Seed Sample Stories & Knowledge Facts
```bash
npm run seed
```

### 4. Create an Admin Account
```bash
npm run admin:create -- --email admin@spacebharat.in --password yourpassword
```

### 5. Run the Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser!

---

## 🧪 Testing

Run the automated test suite:
```bash
npm test
```
Verifies SQLite schema, settings, authentication cookies, protected routes, story CRUD, publishing constraints, and FTS5 retrieval.

---

## 🛡️ Security & Privacy

- **Zero API Keys in Browser**: All keys (`GNANI_API_KEY`, `LLM_API_KEY`, `JWT_SECRET`) reside strictly in server environment variables.
- **Admin Session Hardening**: HttpOnly, SameSite=Strict session cookies with bcrypt password hashing (cost 12).
- **Rate Limiting**: Public endpoints (60 req/min), chat text (20 req/min), voice notes (5 req/min), and admin login (5 attempts per 15 min).
- **No Hallucination Policy**: Space Chat only answers from verified database facts, always displaying citations and "as of" dates.

---

## 📄 License
ISC © Ashish Kumar Pal
