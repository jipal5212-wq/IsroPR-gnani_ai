# ISRO's PR (Space Bharat) — Project Intelligence File

> This file is automatically loaded every conversation. It serves as persistent memory for the AI agent.

## 🏷️ Project Identity

- **Project Name**: Space Bharat (ISRO Public Relations & Outreach Platform)
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

---

## 🏗️ Architecture Overview

- **Runtime**: Node.js 24 (ESM)
- **Web Server**: Express with Helmet (custom CSP), cookie-parser, and express-rate-limit
- **Database**: SQLite (`better-sqlite3`) with WAL journal mode, FTS5 virtual table, and sync triggers
- **Speech Stack**:
  - Text-to-Speech: Gnani Timbre v2.5 (`en-IN`, `hi-IN`, `ta-IN`, `te-IN`, `bn-IN`)
  - Speech-to-Text: Gnani Prisma v2.5 with audio note format conversion
  - Conversational AI: OpenAI-compatible LLM adapter with safe offline fallback
- **Frontend**: Plain HTML5, Vanilla CSS with custom glassmorphism & cosmic theme, ES modules

---

## 📂 File Map

| File/Folder | Purpose |
|-------------|---------|
| `server/index.js` | Express app entrypoint, Helmet CSP, media streaming, retention cleanup |
| `server/config.js` | Environment configuration, folder paths, and language metadata |
| `server/db/schema.sql` | 10 tables, FTS5 index, sync triggers, and performance indexes |
| `server/db/db.js` | SQLite connection manager with WAL mode and settings initializer |
| `server/db/seed.js` | Seeding script with 2 rich multilingual stories and verified ISRO facts |
| `server/routes/public.js` | Public library endpoints (`/api/stories`, `/api/languages`) |
| `server/routes/chat.js` | WhatsApp-style Space Buddy chat (`/api/chat/text`, `/api/chat/voice`) |
| `server/routes/admin.js` | Protected admin API for stories, translations, audio queue, and settings |
| `server/middleware/` | Auth check (`requireAdmin`), rate limiters, Multer file uploads |
| `server/services/` | RAG retrieval, LLM adapter, Gnani STT/TTS clients, audio helpers |
| `server/cli/create-admin.js` | Admin user creation CLI (`npm run admin:create`) |
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
| Sample Content Seeding | ✅ Done | Chandrayaan-3 and Agnikul Cosmos stories seeded in 5 languages |
| Automated Test Suite | ✅ Done | 12 tests passing across schema, auth, and CRUD |

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
