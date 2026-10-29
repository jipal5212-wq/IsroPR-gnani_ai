# NVS-03 NavIC Mission — Execution Plan & Story Documentation

> **Mission**: NVS-03 (Navigation Satellite - 3) aboard GSLV-F18  
> **Category**: `upcoming-ongoing` ("Upcoming / Ongoing Missions")  
> **Launch Date**: 30 October 2026, 23:51 IST (Sriharikota)  
> **Voice Talent**: `Shivani` (`timbre-v3.0` via Gnani TTS API)  
> **Audio Standard**: 24,000 Hz, 16-bit Mono PCM WAV, Seamlessly Concatenated Chunks  
> **Cover Art**: Authentic GSLV-F18 on Sriharikota Launchpad (`data/covers/nvs-03-cover.jpg`)  

---

## 1. Mission Overview & Narrative Architecture

### The Historical Genesis: Kargil 1999
In 1999 during the Kargil War, Indian commanders desperately needed precise enemy and troop coordinates on rugged Himalayan heights. The US restricted access to precision GPS. That critical denial ignited India's determination for strategic sovereignty, birthing **NavIC** (*Navigation with Indian Constellation*).

### The Crisis: Depleted Constellation & NVS-02 Failure
- NavIC requires a minimum of **7 operational satellites** (at least 4 for basic positioning fix). Today, only 3 operational satellites remain active in orbit.
- On **29 January 2025**, GSLV-F15 successfully injected **NVS-02** into Geosynchronous Transfer Orbit (GTO). However, the satellite's liquid apogee engine never fired due to loose electrical connector contacts failing to trigger the **pyro valve** for oxidiser flow. The ₹300+ crore satellite was stranded uselessly in transfer orbit.

### The Daring 51-Year First: Pre-actuating Pyro Valves
To eliminate the single-point connector failure that doomed NVS-02, ISRO made an unprecedented decision in its 51-year satellite history: **pre-firing the pyro valves on the ground before launch**. The downstream latch valve now holds the oxidiser and fuel until orbital insertion commands are sent.

### The Weather Challenge: Cyclone Arnab
Sriharikota faced relentless coastal rainfall and gale winds from Cyclone Arnab in late October 2026, forcing round-the-clock environmental monitoring inside the Mobile Service Tower (MST).

---

## 2. The 14 Studio Audio Chunks (Hindi with Emotion Markup)

| Chunk | Title | Emotion / Prosody Markers | Key Focus |
|:-----:|:------|:--------------------------|:----------|
| **1** | कारगिल से शुरू होती है ये कहानी | `<exhales>`, `<slow>`, `<sniffles>` | 1999 Kargil GPS denial; the seed of indigenous navigation |
| **2** | NavIC क्या है, और क्यों ज़रूरी है | `<slow>`, `<exhales>` | NavIC 1,500 km range, border soldiers to fishing boats |
| **3** | NavIC की मुश्किल, कम होते satellites | `<exhales>`, `<slow>`, `<sniffles>` | 7 satellite requirement, IRNSS-1H shield fail, 3 left |
| **4** | GSLV rocket को समझते हैं | `<slow>`, `<exhales>` | GSLV 3-stage rocket, 50m tall, 420 tonnes lift-off weight |
| **5** | NVS-02 की कहानी, जब सब ठीक था फिर भी हार गए | `<exhales>`, `<slow>`, `<sniffles>` | 29 Jan 2025, perfect launch but engine never fired in orbit |
| **6** | क्या हुआ था असल में NVS-02 में | `<slow>`, `<exhales>`, `<sniffles>` | Apex Committee finding: pyro valve connector contact separation |
| **7** | Pyro Valve क्या होता है, आसान भाषा में | `<exhales>`, `<slow>` | Explaining one-time explosive actuator valve like cylinder seal |
| **8** | ISRO का बड़ा फ़ैसला, 51 साल में पहली बार | `<slow>`, `<exhales>`, `<sniffles>` | Ground pre-firing pyro valves; bold engineering accountability |
| **9** | Open Valve का नया ख़तरा | `<exhales>`, `<slow>` | Latch valve pressure risk, rocket vibrations, safety checks |
| **10** | NVS-03 satellite के बारे में जानते हैं | `<slow>`, `<exhales>` | 2,250 kg mass, Rubidium atomic clock made in Ahmedabad SAC |
| **11** | Cyclone Arnab और ISRO की challenge | `<slow>`, `<exhales>`, `<sniffles>` | Late Oct Bay of Bengal cyclone, Sriharikota launchpad grit |
| **12** | Launch के बाद क्या होगा | `<exhales>`, `<slow>` | Flight sequence, GTO release, LAM burns to geostationary slot |
| **13** | इस mission का असर आगे तक जाएगा | `<slow>`, `<exhales>` | Restoring NavIC constellation, phones, defence, maritime safety |
| **14** | आख़िरी बात, एक देश की उम्मीद | `<exhales>`, `<slow>`, `<sniffles>`, `<soft>` | 30 Oct night launch, scientists' grit, national self-reliance |

---

## 3. Cloudflare WAF Protection & Anti-Throttling Architecture

```
[Chunk Synthesis Request] 
      │
      ▼
[Pacing Delay: 3,000ms] ──> [Gnani API endpoint: api.vachana.ai]
      │                               │
      │ ◄── HTTP 200 (Success) ───────┘
      │
      ├───> Strip 44-byte WAV header ──> Accumulate PCM Buffer
      │
    If Error (403 / 500 / Timeout):
      ├──> Backoff 8,000ms
      └──> Max 3 retries (Immediate fail-safe notification if blocked)
```

1. **Character Budget**: Each of the 14 chunks is 450–600 characters, well within the 700-character ceiling to prevent HTTP 500 errors.
2. **Pacing**: Minimum 3.0s sleep after every successful synthesis.
3. **Seamless Concatenation**: PCM bytes are extracted by skipping the standard 44-byte WAV header (`wav.slice(44)` or `data` chunk offset) and combined into a single continuous stream. A recalculated 44-byte RIFF header is prepended.

---

## 4. UI Implementation: "Upcoming / Ongoing Missions"

1. **Database Schema & Seeding**:
   - Story ID: `nvs-03`
   - Category: `upcoming-ongoing`
   - Badge: `UPCOMING / ONGOING MISSION` • `OCT 30 LAUNCH`
   - Cover Path: `nvs-03-cover.jpg`
   - Audio Path: `/media/audio/stories/nvs-03/hi-IN.wav`
2. **Frontend UI**:
   - Add `Upcoming / Ongoing` tab to the category bar.
   - Add a highlighted spotlight section in `web/index.html` showcasing the imminent GSLV-F18 / NVS-03 launch with live countdown styling, glowing badge, and instant podcast player button.
   - Card styling with custom badges: "ISRO NavIC Constellation", "Live Countdown / Next Launch".
3. **Spotify Player Integration**:
   - `web/js/spotify-player.js` recognizing `nvs-03` for dynamic playback and timeline sync.

---

## 5. Verification Checklist

- [ ] Gnani TTS API pre-flight check succeeds without Cloudflare 403.
- [ ] All 14 chunks synthesized with emotion tags preserved.
- [ ] Master WAV `hi-IN.wav` generated without audio glitches or header corruption.
- [ ] Cover image placed at `data/covers/nvs-03-cover.jpg`.
- [ ] Database re-seeded with `nvs-03` under `upcoming-ongoing`.
- [ ] Frontend displays "Upcoming / Ongoing Missions" section and tab with highlight.
- [ ] Automated tests pass (`npm test`).
- [ ] Git commit and push to `origin/main`.
- [ ] Production Vercel deployment verified.
