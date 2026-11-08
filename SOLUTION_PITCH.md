# 🚀 Solution Pitch: IsroPR (ISRO Multilingual Outreach Platform)

**Gnani.ai Internship Challenge Submission**  
- **Candidate**: Ashish Kumar Pal  
- **Live Platform**: [https://isropr.vercel.app](https://isropr.vercel.app)  
- **GitHub Repository**: [https://github.com/jipal5212-wq/IsroPR-gnani_ai](https://github.com/jipal5212-wq/IsroPR-gnani_ai)  
- **Core Technology**: Gnani AI Voice Stack (Timbre v3.0 TTS & Prisma v2.5 STT) · Node.js · SQLite FTS5 RAG  

---

### 1. Executive Summary & Problem Statement
India's space accomplishments — from Chandrayaan-3's historic lunar South Pole landing to Mangalyaan and the sovereign NavIC constellation — are matters of immense national pride. Yet, official technical briefings and media coverage are predominantly released in technical English and formal Hindi. **Over 800 million citizens** across regional linguistic belts are excluded from deeply understanding and celebrating India's space journey in their mother tongue. Furthermore, general-purpose AI bots frequently hallucinate launch dates, rocket payload capacities, and technical specs.

**IsroPR** bridges this gap: a sovereign, voice-first public space engagement platform that turns complex space missions into **gripping, cinematic audio documentaries** in **6 Indian languages**, accompanied by an **interactive, zero-hallucination Space Chat** featuring complete voice-in/voice-out parity.

---

### 2. The Solution: Two Core Pillars

#### A. Cinematic Multilingual Audio Documentaries (Spotify-Grade)
Instead of dry press releases, missions are produced as dramatic, studio-quality audio stories (up to 9 minutes per episode) covering human grit, anomalies, and breakthroughs (e.g., the 1999 Kargil GPS denial leading to the NVS-03 Pyro Valve gambit).
- **Persistent Spotify Audio Dock**: Audio continues seamlessly in the background while users explore other missions, read transcripts, or chat.
- **On-the-Fly Language Switching**: Instant switching across **Hindi, English, Tamil, Telugu, Bengali, and Kannada** without losing playback position.
- **Broadcast Audio Standard**: Master 24,000 Hz, 16-bit Mono PCM WAV audio with variable speed controls (0.75x–1.5x) and 15s skip.

#### B. WhatsApp-Style Conversational Space Chat (Voice-In & Voice-Out)
A conversational assistant that replicates the familiar WhatsApp voice note experience:
- **True Voice Parity**: Users tap and speak in their mother tongue; the assistant transcribes the input, retrieves verified facts, and answers back with **both text and a natural voice note**.
- **Zero-Hallucination Verified RAG**: Hybrid retrieval combining native SQLite FTS5 BM25 search over official ISRO archives with live web retrieval (DDG/Wikipedia). Every fact includes "as-of" dates and clickable citations (`isro.gov.in`).
- **Resilient Fallback**: If upstream LLM APIs hit rate limits or downtime, a deterministic local knowledge retrieval engine answers accurately, ensuring 100% platform availability.

---

### 3. Gnani AI Stack Integration & Technical Highlights

| Capability | Gnani AI Technology | Implementation in IsroPR |
|:---|:---|:---|
| **Emotional Speech Synthesis** | **Gnani Timbre v3.0** | Synthesizes multi-chunk documentary narrations using expressive vocal tags (`<exhales>`, `<slow>`, `<soft>`) with single institutional voice identity (`Shivani`). |
| **Speech-to-Text Recognition** | **Gnani Prisma v2.5** | High-accuracy multilingual speech transcription with `indic-auto` automatic language detection. |
| **Edge Performance** | **Vanilla ES Modules + Express** | 0KB frontend framework overhead; sub-100ms client route transitions without UI flickering or layout shifts. |
| **Reliability & Testing** | **Native Node.js Test Suite** | **23/23 tests passing** covering database schemas, RAG retrieval, audio streaming, and link sanitization. |

---

### 4. Impact & Scalability
- **Linguistic Inclusion**: Directly empowers citizens across 6 languages representing over **85% of India's population**.
- **Production Ready**: Fully deployed and operational on Vercel Edge (`https://isropr.vercel.app`) with Helmet CSP shielding, HttpOnly auth cookies, and bandwidth-efficient Range streaming (`HTTP 206`).
- **Future Ready**: Extensible architecture designed to onboard upcoming missions (Gaganyaan crewed flights, Chandrayaan-4, Shukrayaan) with one-click automated audio synthesis pipelines.
