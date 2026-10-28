# IsroPR — Project Intelligence File

> This file is automatically loaded every conversation. It serves as persistent memory for the AI agent.

## 🏷️ Project Identity

- **Project Name**: IsroPR (ISRO Public Relations & Outreach Platform)
- **Owner**: Ashish Kumar Pal
- **Created**: 2026-10-25
- **Status**: 🟢 Active Development — Full Stack Operational

---

## 📌 Key Decisions Log

| # | Date | Decision | Rationale |
|---|------|----------|-----------|
| 1 | 2026-10-25 | Project initialized with persistent memory system | Long-term context preservation across sessions |
| 2 | 2026-10-25 | Adopted 3-layer memory architecture | Layer 1: static AGENTS.md, Layer 2: dynamic session logs, Layer 3: agentmemory MCP server |
| 3 | 2026-10-25 | Full Stack Implementation per `plan.md` | Node.js 20+, Express, SQLite (`better-sqlite3` with WAL & FTS5), Gnani AI (Timbre v2.5 TTS & Prisma v2.5 STT), Vanilla ES modules |
| 4 | 2026-10-25 | Native SQLite FTS5 for RAG | Deterministic, rapid BM25 keyword retrieval with zero external vector database dependencies |
| 5 | 2026-10-25 | Single admin account with CLI creation | Secure bcrypt (cost 12) hashing with 8-hour HttpOnly JWT session cookie |
| 6 | 2026-10-25 | Light, human editorial UI/UX & WhatsApp Web chat | Clean, accessible design avoiding generic dark "AI" neon; authentic WhatsApp Web look for conversational chat |
| 7 | 2026-10-25 | Official Vachana AI (Gnani) STT/TTS & Resilient RAG Voice Output | Real studio speech synthesis via X-API-Key-ID, Indic Unicode \p{M} token preservation, dual text + voice note response |
| 8 | 2026-10-25 | Rebranding to IsroPR & Admin Relocation to Footer | Renamed platform to IsroPR across all surfaces; moved admin access to subtle bottom footer to prevent public distraction; updated official description citing ISRO & indianspaceflight.in |
| 9 | 2026-10-25 | Multilingual Language Auto-Detection & RAG Precision | Auto-detect query script (Devanagari, Tamil, Telugu, etc.), Hinglish and English syntax; match response language strictly in text and Gnani Timbre voice notes; filter Indic & English stop-words |
| 10 | 2026-10-25 | 6 Core Languages Support (English, Hindi, Tamil, Telugu, Bengali, Kannada) | Enabled universal voice recognition via Gnani Prisma STT `indic-auto`; automated language detection across native scripts & Romanized syntax; consistent female voice `Shivani` across all 6 languages; seeded Kannada podcast stories |
| 11 | 2026-10-26 | Live Internet Web RAG Search Integration | Upgraded RAG engine with multi-provider web retrieval (DuckDuckGo Lite, Wikipedia, optional Tavily), Indic query reformulation, in-memory TTL caching, and live web source citations for realistic OpenAI & fallback responses |
| 12 | 2026-10-26 | Mission Disambiguation (NVS-03) & Source Link Sanitization | Disambiguated sub-mission variants (NVS-03 vs NVS-01); sanitized knowledge URLs replacing 404 links with active canonical ISRO/Wiki pages; prioritized query-matching sources |
| 13 | 2026-10-27 | Chandrayaan-3 Unified Audio & One-Go Playback | Consolidated studio audio into a single seamless continuous 3:00 minute track in `chandrayaan-3`; purged all duplicate Chandrayaan entries; plays in one go with clean podcast controls without exposing split part UI to users |
| 14 | 2026-10-27 | Spotify-Style Audio Experience & Background Playback | Pruned other stories to keep solely Chandrayaan-3; completely removed transcripts; added small creative play buttons on cards; persistent bottom Spotify dock bar with client-side SPA navigation so audio plays seamlessly in background while exploring chat or other pages |
| 15 | 2026-10-27 | Monumental Spotlight Hero & 25-Artifact Visual Archive | Elevated IsroPR in big bold spotlight hero typography; curated & downloaded 25 authentic high-res historic images of ISRO missions (Gaganyaan, Mangalyaan, Chandrayaan, launchers) and private startups (Agnikul, Skyroot, Pixxel, Bellatrix, Digantara); built gapless bento grid with category filters, live search, and full keyboard-navigable lightbox modal |
| 16 | 2026-10-27 | Pure Audio Storytelling Centerpiece & Attention-Catching Cards | Removed 25-image gallery to focus 100% on ISRO audio narratives; designed high-attention podcast cards with dynamic soundwave equalizers, category pills, duration tags, multi-language chips, and glowing active states; added smooth scroll and cross-fade SPA transitions |
| 17 | 2026-10-27 | Creative Bat Mascot Logo & Resilient Audio Stories Navigation | Transformed user's IsroPR cricket bat anime artwork into high-definition circular celestial emblem badge; added as official site logo, mascot badge, and favicon; fixed smooth-scroll anchor navigation to #audio-stories across homepage and SPA transitions |
| 18 | 2026-10-27 | Strict Case-Sensitive IsroPR, Logo in 'O', & Minimal Hero | Embedded the circular bat mascot logo inside the 'O' of IsroPR (`Isr[O]PR`) as an interactive play button that triggers the top-rated Chandrayaan-3 podcast; centered "Explore Glory of Space India" and concise tagline beneath; removed cluttered hero pills and stats strip for a focused landing page |
| 19 | 2026-10-27 | Authentic Pragyan NavCam Lunar Poster & Museum Framing | Replaced CGI graphics with authentic Aug 27, 2023 Pragyan Rover NavCam photograph of 4m south pole crater and official ISRO insignia; framed at 380px with pure black backing, telemetry caption strip, and zero dark gradient overlays |
| 20 | 2026-10-27 | Anti-"AI Rich" Editorial Dignity & Architectural Grid | Purged generic multi-color neon aurora blur blobs and pulsing halos; implemented subtle scientific grid backdrop; rendered solid deep ISRO navy typography; transformed chatbot banner into dignified ISRO Knowledge Desk |
| 21 | 2026-10-27 | Space Chat Rebranding & Pure Lightweight Landing Page | Renamed all references from "Space Buddy" to "Space Chat"; eliminated all emojis (mic, headphone, satellite, flag, speech bubble) across HTML and JS; purged heavy bottom knowledge desk teaser card to keep the landing page ultra-light, focused strictly on multilingual audio stories and seamless background playback |
| 22 | 2026-10-27 | Creative Multilingual Audio Highlight Capsule & Native Chips | Highlighted "Audio Narration across 6 Indian Languages" in an interactive hero capsule featuring a live oscillating soundwave equalizer, 'Studio Voiced' badge, and 6 interactive native script chips (EN, हिन्दी, தமிழ், తెలుగు, বাংলা, ಕನ್ನಡ) that switch narration and sync playback on the fly |
| 23 | 2026-10-29 | GitHub Repo & Vercel Production Deployment | Published repository to `jipal5212-wq/IsroPR-gnani_ai`; deployed unified full-stack serverless + global Edge CDN on Vercel at `https://isropr.vercel.app` with production secrets synced |

---

## 🏗️ Architecture Overview

- **Runtime**: Node.js 24 (ESM)
- **Web Server**: Express with Helmet (custom CSP), cookie-parser, and express-rate-limit
- **Database**: SQLite (`better-sqlite3`) with WAL journal mode, FTS5 virtual table, and sync triggers
- **Speech Stack**:
  - Text-to-Speech: Gnani Timbre v3.0 (`https://api.vachana.ai/api/v1/tts/inference` in wav container, voice: `Shivani`)
  - Speech-to-Text: Gnani Prisma v2.5 (`https://api.vachana.ai/stt/v3` with `indic-auto` automatic language recognition)
  - Conversational AI: OpenAI-compatible LLM adapter with resilient RAG grounded fallback in all 6 languages
- **Frontend**: Plain HTML5, Vanilla CSS with custom glassmorphism & cosmic theme, ES modules

---

## 📂 File Map

| File/Folder | Purpose |
|-------------|---------|
| `server/index.js` | Express app entrypoint, Helmet CSP, media streaming, retention cleanup |
| `server/config.js` | Environment configuration, folder paths, and language metadata |
| `server/db/schema.sql` | 10 tables, FTS5 index, sync triggers, and performance indexes |
| `server/db/db.js` | SQLite connection manager with WAL mode and settings initializer |
| `server/db/seed.js` | Seeding script with 3 rich multilingual stories in 6 languages and verified ISRO facts |
| `server/routes/public.js` | Public library endpoints (`/api/stories`, `/api/languages`) |
| `server/routes/chat.js` | WhatsApp-style Space Buddy chat (`/api/chat/text`, `/api/chat/voice`) |
| `server/routes/admin.js` | Protected admin API for stories, translations, audio queue, and settings |
| `server/middleware/` | Auth check (`requireAdmin`), rate limiters, Multer file uploads |
| `server/services/` | RAG retrieval, Web search, LLM adapter, Gnani STT/TTS clients, audio helpers |
| `server/services/websearch.js` | Multi-provider live web search (DDG Lite, Wikipedia, Tavily) with Indic reformulation and TTL cache |
| `server/cli/create-admin.js` | Admin user creation CLI (`npm run admin:create`) |
| `data/covers/` | Authentic high-resolution space mission posters (Pragyan NavCam crater photo) |
| `web/index.html` | Public library homepage with category & language filters |
| `web/story.html` | Audio story player with speed controls, 15s skipping, and transcript |
| `web/chat.html` | WhatsApp-style Space Buddy conversational voice & text chat |
| `web/about.html` | Mission overview, Gnani AI voice stack attribution, and principles |
| `web/admin/` | Admin console (Login, Dashboard, Story Editor, Knowledge Base, Chats, Settings) |
| `scripts/backup.sh` | Shell backup script with timestamped database & audio snapshots |
| `tests/` | Automated test suite (DB, Auth, Stories CRUD, RAG retrieval) |

---

## 📋 Current Task Tracker

| Task | Status | Notes |
|------|--------|-------|
| Set up persistent memory | ✅ Done | 3-layer system operational |
| Database & Schema | ✅ Done | SQLite WAL + FTS5 full-text search with triggers |
| Auth & Admin CLI | ✅ Done | `admin:create` with bcrypt cost 12 & HttpOnly JWT |
| Stories & Multilingual Audio Queue | ✅ Done | Background worker + Gnani Timbre TTS client |
| WhatsApp-style Space Buddy Chat | ✅ Done | Text + Voice note recording with RAG citations |
| Admin Console Pages | ✅ Done | Login, Dashboard, Story Editor, Knowledge, Chats, Settings |
| Sample Content Seeding | ✅ Done | Chandrayaan-3, Agnikul Cosmos, LVM3 stories seeded in 6 languages |
| Automated Test Suite | ✅ Done | 20 tests passing across schema, auth, CRUD, internet RAG, link sanitization, and 5-part audio |
| Gnani AI & OpenAI Integration | ✅ Done | Live Vachana TTS/STT verified; dual text + voice note responses active |
| Multilingual Auto-Detection & Accuracy | ✅ Done | Auto-detects query language, matches response in same language & audio |
| 6 Core Languages (inc. Kannada) & Voice Model | ✅ Done | Universal voice recognition (`indic-auto`), 6 languages (EN, HI, TA, TE, BN, KN), female voice `Shivani` |
| Live Internet Web RAG Search | ✅ Done | Multi-provider live web search (DDG Lite, Wikipedia, Tavily), Indic query reformulation, web citations |
| Chandrayaan-3 5-Part Sequential Audio Sync | ✅ Done | Integrated 5 studio WAV files, removed duplicate Chandrayaan entries, auto-sequential playback & transcript sync |
| Spotify-Style Player & Background Audio | ✅ Done | Kept exclusively Chandrayaan-3, removed transcript, added floating play FABs, and persistent bottom dock with SPA navigation |
| Monumental Hero & 25+ Historic Space Archive | ✅ Done | Big IsroPR spotlight title, 25 authentic high-res images, gapless bento grid, startup showcase, keyboard lightbox |
| Bat Mascot Logo & Audio Stories Navigation | ✅ Done | Transformed bat artwork to circular emblem logo across headers, mascot badges, and favicons; fixed smooth scroll navigation to #audio-stories |
| Authentic NavCam Poster & Anti-AI Slop Aesthetic | ✅ Done | Pragyan rover crater poster active; clean architectural grid, solid navy IsroPR, ISRO Knowledge Desk card |

---

## 🛑 Boundaries

### Always:
- Read this file at session start
- Update `session-log.md` after significant work
- Use conventional commit messages

### Ask First:
- Before installing new packages
- Before changing architecture decisions

### Never:
- Commit secrets, API keys, or `.env` files
- Delete memory files without explicit permission
- Guess project requirements — check `plan.md` or ask the user
