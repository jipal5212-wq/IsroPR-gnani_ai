# Chandrayaan-3 Multilingual Audio Execution Plan

> **State**: STAGED & READY (Awaiting user command to execute after cooldown/network switch)  
> **Script**: [`scripts/generate-chandrayaan-audio.js`](file:///c:/Users/ASHISH%20KUMAR%20PAL/OneDrive/Desktop/Isro's%20PR/scripts/generate-chandrayaan-audio.js)  
> **Target Directory**: [`data/audio/stories/chandrayaan-3/`](file:///c:/Users/ASHISH%20KUMAR%20PAL/OneDrive/Desktop/Isro's%20PR/data/audio/stories/chandrayaan-3)

---

## 1. Context & Objective
- **Current State**: Chandrayaan-3 has the authentic original master recorded in Hindi (`hi-IN.wav` / `chandrayaan-3-full.wav`, 15.8 MB, 3:00 min). The other 5 language files (`en-IN.wav`, `ta-IN.wav`, `te-IN.wav`, `bn-IN.wav`, `kn-IN.wav`) were temporary duplicate copies of the Hindi file.
- **Target**: Generate genuine studio-voiced audio for all 5 languages in **Shivani** voice (`timbre-v3.0`), preserving emotional tags (`<exhales>`, `<slow>`, `<sniffles>`, `<soft>`), exactly matching the structure of Mangalyaan.

---

## 2. Prepared Assets & Safeguards
- **Script**: `scripts/generate-chandrayaan-audio.js` has all 5 full Indic scripts translated and proofread:
  - English (`en-IN`)
  - Tamil (`ta-IN`)
  - Telugu (`te-IN`)
  - Bengali (`bn-IN`)
  - Kannada (`kn-IN`)
- **Payload Safety**: Text chunked at sentence / tag boundaries under 700 chars each to prevent 500 payload errors.
- **WAF Pacing**: 2,500ms delay between chunks, 3,000ms delay between languages, and 3-attempt retry with 8s backoff.
- **Skip Logic**: Automatically checks `statSync().size !== 15884084` to skip already synthesized tracks and avoid wasting API quota.

---

## 3. Step-by-Step Execution Protocol (Triggered on User Command)

### Step 1: Pre-flight WAF Connectivity Check
```powershell
curl.exe -s -o /dev/null -w "%{http_code}" -X POST "https://api.vachana.ai/api/v1/tts/inference"
```
*Criteria*: Must not return `403` Cloudflare block.

### Step 2: Execute Audio Generation
```powershell
node --env-file=.env scripts/generate-chandrayaan-audio.js
```
*Expected Result*:
- `en-IN.wav` (~8 MB)
- `ta-IN.wav` (~8.5 MB)
- `te-IN.wav` (~8.5 MB)
- `bn-IN.wav` (~8.3 MB)
- `kn-IN.wav` (~8.4 MB)
- `hi-IN.wav` preserved intact (15.8 MB original master).

### Step 3: Reseed Database
```powershell
node --env-file=.env server/db/seed.js
```
*Expected Result*: Database `data/spacebharat.db` updated with valid `/media/audio/stories/chandrayaan-3/{lang}.wav` links for all 6 languages.

### Step 4: Run Test Suite
```powershell
npm test
```
*Criteria*: All 20 tests pass.

### Step 5: Git Commit & Remote Push
```powershell
git add data/audio/stories/chandrayaan-3/ server/db/seed.js data/spacebharat.db scripts/generate-chandrayaan-audio.js .agents/
git commit -m "feat(audio): add Chandrayaan-3 realistic audio in 5 languages with Shivani voice"
git push origin main
```

### Step 6: Production Deployment
```powershell
npx vercel deploy --prod --yes
```

### Step 7: Update Persistent Logs
Record Session 26 in `.agents/memory/session-log.md` and mark Decision #26 complete in `.agents/AGENTS.md`.

