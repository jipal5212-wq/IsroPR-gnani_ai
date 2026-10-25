# Architecture Decision Records — ISRO's PR

> Every significant technical decision is logged here with context and rationale.

---

## ADR-001: Persistent Memory System

- **Date**: 2026-10-25
- **Status**: ✅ Accepted
- **Decision**: Use `.agents/` directory for persistent AI memory
- **Context**: User needs the AI to maintain long-term project knowledge across multiple conversations
- **Rationale**: Antigravity automatically loads `.agents/AGENTS.md` and `.agents/rules/` files at the start of every conversation, making it the ideal location for persistent memory
- **Structure**:
  - `.agents/AGENTS.md` → High-level project summary (auto-loaded)
  - `.agents/rules/` → Behavioral rules (auto-loaded)
  - `.agents/memory/` → Detailed logs and decision records

---

<!-- Future ADRs go below -->
