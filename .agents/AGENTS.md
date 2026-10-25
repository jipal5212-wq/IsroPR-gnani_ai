# ISRO's PR — Project Intelligence File

> This file is automatically loaded every conversation. It serves as persistent memory for the AI agent.

## 🏷️ Project Identity

- **Project Name**: ISRO's PR (Public Relations / Publicity & Outreach Platform)
- **Owner**: Ashish Kumar Pal
- **Created**: 2026-10-25
- **Status**: 🟡 Planning Phase

---

## 📌 Key Decisions Log

| # | Date | Decision | Rationale |
|---|------|----------|-----------|
| 1 | 2026-10-25 | Project initialized with persistent memory system | Long-term context preservation across sessions |
| 2 | 2026-10-25 | Adopted 3-layer memory architecture | Layer 1: static AGENTS.md (auto-loaded), Layer 2: dynamic session logs, Layer 3: agentmemory MCP server |
| 3 | 2026-10-25 | Installed `agentmemory` (rohitg00/agentmemory, ⭐29.9k) | Best-in-class open-source memory with MCP, BM25 search, knowledge graphs |
| 4 | 2026-10-25 | Git initialized (local only) | Version control for all project files including memory |

---

## 🏗️ Architecture Overview

- **Stack**: TBD (to be decided with user)
- **Hosting**: TBD
- **Database**: TBD

### Memory Architecture (3-Layer)
```
Layer 1 (Static/Auto-loaded):
  └── .agents/AGENTS.md, .agents/rules/*.md

Layer 2 (Dynamic/On-demand):
  └── .agents/memory/session-log.md
  └── .agents/memory/tech-decisions.md
  └── .agents/memory/project-index.json

Layer 3 (MCP Deep Search):
  └── agentmemory server (BM25 + vector search)
  └── Knowledge graph + cross-session recall
```

---

## 📂 File Map

| File/Folder | Purpose |
|-------------|---------|
| `plan.md` | Project planning document (empty — needs user input) |
| `.agents/AGENTS.md` | This file — persistent AI memory (auto-loaded) |
| `.agents/rules/project-rules.md` | Coding standards & project rules (auto-loaded) |
| `.agents/memory/session-log.md` | Detailed chronological session logs |
| `.agents/memory/tech-decisions.md` | Architecture Decision Records (ADRs) |
| `.agents/memory/memory-config.md` | Memory system configuration docs |
| `.agents/memory/project-index.json` | Machine-readable file map |
| `.gitignore` | Git ignore rules |

---

## 🧩 Installed Extensions

| Extension | Source | Purpose |
|-----------|--------|---------|
| agentmemory | `rohitg00/agentmemory` (⭐29.9k) | MCP-based persistent memory with search & knowledge graphs |

---

## 🚨 Important Notes & Gotchas

- Project is brand new (as of 2026-10-25), currently in planning phase.
- User prefers the AI to remember everything long-term and avoid confusion.
- agentmemory needs to be started with `npx @agentmemory/agentmemory` before use.
- Run `npx @agentmemory/agentmemory connect antigravity` to wire it to this IDE.

---

## 🔗 External Links & Resources

- GitHub: Not yet connected (local repo only)
- agentmemory docs: https://agent-memory.dev

---

## 📋 Current Task Tracker

| Task | Status | Notes |
|------|--------|-------|
| Set up persistent memory | ✅ Done | 3-layer system created |
| Install agentmemory | ✅ Done | `npx @agentmemory/agentmemory@latest` installed |
| Connect agentmemory to IDE | 🔄 In Progress | Run `connect antigravity` |
| Define project scope | ⬜ Pending | Need user input on what "ISRO's PR" will be |
| Choose tech stack | ⬜ Pending | Waiting for requirements |
| Fill out plan.md | ⬜ Pending | Needs project scope first |

---

## 🛑 Boundaries

### Always:
- Read this file at session start
- Update session-log.md after significant work
- Use conventional commit messages

### Ask First:
- Before installing new packages
- Before changing architecture decisions

### Never:
- Commit secrets, API keys, or .env files
- Delete memory files without explicit permission
- Guess project requirements — ask the user
