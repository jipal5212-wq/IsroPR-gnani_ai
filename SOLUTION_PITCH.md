# 🚀 Solution Pitch: IsroPR (ISRO Multilingual Outreach Platform)

**Gnani.ai Internship Challenge Submission**  
- **Candidate**: Ashish Kumar Pal  
- **Live Platform**: [https://isropr.vercel.app](https://isropr.vercel.app)  
- **GitHub Repository**: [https://github.com/jipal5212-wq/IsroPR-gnani_ai](https://github.com/jipal5212-wq/IsroPR-gnani_ai)  
- **Core Technology**: Gnani AI Voice Stack (Timbre v3.0 TTS & Prisma v2.5 STT) · Node.js · SQLite FTS5 RAG  

---

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
