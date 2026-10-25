# Architecture Decision Records — Space Bharat (ISRO PR)

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

## ADR-002: Podcast-Style Multilingual Storytelling Engine

- **Date**: 2026-10-25
- **Status**: ✅ Accepted
- **Decision**: Pre-synthesize and store mission stories using **Gnani Timbre v2.5** TTS in regional Indian languages (English, Hindi, Tamil, Telugu, Bengali) with rich podcast narrative style.
- **Context**: Make every Indian citizen space-aware without losing interest. Traditional news reports are dry and technical.
- **Rationale**: Stories are written like dramatic, gripping audio documentaries (the 15 minutes of terror of Chandrayaan-3, cryogenic upper stage engineering of LVM3, private rocket manufacturing by Agnikul). Audio is generated once, hashed, cached, and playable instantly without latency or per-stream API costs.

---

## ADR-003: WhatsApp-Style Conversational "Space Buddy" (RAG + Voice Parity)

- **Date**: 2026-10-25
- **Status**: ✅ Accepted
- **Decision**: Design conversational AI as a warm, human-friendly WhatsApp companion with strict voice-in/voice-out parity and verified RAG grounding.
- **Context**: Citizens have doubts about mission timelines, launch dates (LVM3, Gaganyaan, NVS-01), rocket specifications, and Indian space startups. They should be able to ask via text or voice in their mother tongue.
- **Rationale**:
  - Voice notes sent by users receive audio voice notes in return; text queries receive text responses.
  - UI mimics WhatsApp voice note bubbles (green circular play/pause button, animated voice amplitude waveforms, duration counter, and double checkmarks).
  - Persona is a knowledgeable, enthusiastic friend—not a dry corporate bot.
  - Grounded in SQLite FTS5 BM25 search over verified ISRO facts: dates and specs always include "as of" dates and official sources, with strict zero-hallucination guardrails.
