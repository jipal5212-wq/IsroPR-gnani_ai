# Memory System Configuration — ISRO's PR

> This document configures the multi-layer memory architecture for the project.

## Layer 1: Static Context (Auto-loaded every session)

Files automatically loaded by Antigravity:
- `.agents/AGENTS.md` — Project identity, decisions, architecture, task tracker
- `.agents/rules/project-rules.md` — Coding standards, boundaries, workflow rules

## Layer 2: Dynamic Memory (On-demand)

Files read when needed:
- `.agents/memory/session-log.md` — Chronological session history
- `.agents/memory/tech-decisions.md` — Architecture Decision Records (ADRs)
- `.agents/memory/project-index.json` — Auto-generated file map for quick navigation

## Layer 3: AgentMemory MCP Server (Deep Search)

When installed, agentmemory provides:
- `memory_store` — Save important observations
- `memory_recall` — Search past memories using BM25
- `memory_smart_search` — Hybrid search with knowledge graph
- Cross-session persistence via local SQLite/iii engine

### Integration Rules

1. At session start: Read Layer 1 files (automatic)
2. Before complex tasks: Check Layer 2 for related decisions/history
3. For recall across sessions: Use Layer 3 MCP tools
4. At session end: Update Layer 1 + Layer 2 with new decisions/progress
