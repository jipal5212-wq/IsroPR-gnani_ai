/**
 * generate-nvs03-english-full.js
 * Synthesizes the complete 14-chunk English narration for NVS-03
 * using Gnani TTS API (voice: Shivani, lang: en-IN, model: timbre-v3.0)
 * with cinematic emotion tags (<exhales>, <slow>, <sniffles>, <soft>).
 * Combines all 14 chunks into a pristine 24,000Hz 16-bit Mono master WAV:
 * data/audio/stories/nvs-03/en-IN.wav
 */
import { synthesizeSpeech } from '../server/services/gnani/tts.js';
import { getDb } from '../server/db/db.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync, writeFileSync, readFileSync, rmSync, statSync } from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, '../data/audio/stories/nvs-03');
mkdirSync(OUT_DIR, { recursive: true });

const englishChunks = [
  {
    num: 1,
    title: "The Kargil Spark: 1999",
    text: "<exhales> The story begins in 1999. In the frozen heights of Kargil, the Indian armed forces were fighting a fierce battle. <slow> Military commanders urgently required precision satellite coordinates to pinpoint enemy positions and track our advancing troops. India approached the United States for access to GPS satellite data. And America said no. <sniffles> On that defining day, Indian leaders realized the perilous danger of depending on foreign technology. Someone else's system will always run on someone else's terms. <slow> Right then, a sovereign dream was planted: India must build its own satellite navigation constellation, independent of anyone's permission."
  },
  {
    num: 2,
    title: "What is NavIC & Why It Matters",
    text: "<slow> From that resolute conviction rose NavIC — Navigation with Indian Constellation. In simple words, India's sovereign GPS. <exhales> Covering the entire Indian subcontinent and extending 1,500 kilometers beyond our borders, NavIC guides a soldier at the frontiers, a farmer surveying fields, and commercial ships sailing the high seas. <slow> NavIC does not just show the way; it represents India's strategic autonomy. From national defence to disaster management, from fishing vessels to smartphones, it serves the entire nation."
  },
  {
    num: 3,
    title: "The Satellite Depletion Challenge",
    text: "<exhales> But the journey of NavIC has faced daunting hurdles. To function effectively, the constellation requires at least seven operational satellites. <slow> Over the years, early spacecraft completed their lifespans. IRNSS-1H was lost during launch when the rocket's protective heat shield failed to separate. <sniffles> Then came NVS-02. Recently, the government acknowledged in Parliament that only three satellites remain operational, whereas a minimum of four is necessary for independent positioning. India cannot yet rely fully on its indigenous GPS."
  },
  {
    num: 4,
    title: "Understanding the GSLV Heavy Lifter",
    text: "<slow> Now let us look at the rocket tasked with carrying NVS-03 into the cosmos: the GSLV, or Geosynchronous Satellite Launch Vehicle. <exhales> Standing 50 meters tall with three stages, its lift-off mass is approximately 420 tonnes — equivalent to a fully loaded passenger train ascending into the sky. <slow> This marks the 20th flight of GSLV. Its mandate is delivering heavy navigation and communication satellites into geosynchronous transfer orbit, from where the satellite's internal propulsion takes over."
  },
  {
    num: 5,
    title: "The Heartbreak of NVS-02",
    text: "<exhales> 29 January 2025. The GSLV-F15 rocket soared from Sriharikota, carrying NVS-02, a 2,235-kilogram navigation satellite. <slow> The launch vehicle performed flawlessly, deploying NVS-02 into its designated transfer orbit with pinpoint accuracy. The team celebrated. <sniffles> But then, the satellite had to ignite its own Liquid Apogee Motor to raise itself into final orbit. That engine never fired. NVS-02 was stranded in an incomplete orbit — hundreds of crores of rupees revolving silently, unusable."
  },
  {
    num: 6,
    title: "The Forensic Investigation",
    text: "<slow> ISRO immediately constituted an Apex Committee investigation. Weeks of meticulous telemetry analysis uncovered the root cause. <exhales> Oxidiser flow to the satellite engine was blocked by a single-use pyro valve. This valve is designed to open upon receiving an electrical firing pulse. <slow> The firing pulse was sent by the onboard computer, but it never reached the valve. Flight stresses had caused electrical connector contacts to separate. Both the primary and redundant lines failed. <sniffles> A single dislodged electrical contact doomed the entire mission."
  },
  {
    num: 7,
    title: "What is a Pyro Valve?",
    text: "<exhales> To understand what a pyro valve is, think of a sealed valve on a domestic gas cylinder. When closed, no propellant leaks. <slow> Inside a satellite, fuel and oxidiser tanks remain hermetically sealed during launch to prevent leaks. At the designated orbital moment, an electrical command ignites a miniature pyrotechnic charge that shears open the valve for good. <exhales> Once open, it can never be closed; it is strictly single-use. <slow> In NVS-02, that electrical firing command was lost at the severed connector junction."
  },
  {
    num: 8,
    title: "ISRO's 51-Year First Gamble",
    text: "<slow> Facing NVS-03, ISRO engineers confronted a critical choice: follow standard protocol and risk repeat failure, or break the mould? <exhales> ISRO made an unprecedented decision never before taken in its 51-year satellite launch history. <slow> For NVS-03, engineers pre-fired the pyro valves open on the ground before launch! The electrical pulse that failed in NVS-02 will never even be needed in space — the oxidiser line is already open. <sniffles> This daring decision embodies engineering courage at its finest — sleepless nights distilled into fearless innovation."
  },
  {
    num: 9,
    title: "The Downstream Latch Valve Challenge",
    text: "<exhales> Yet pre-opening the valve introduced new technical challenges. <slow> With the pyro valve permanently open, propellants rest directly against the downstream latch valve. Mission success now hinges on that latch valve opening reliably in space. <exhales> Furthermore, intense launch vibrations could theoretically risk propellant leakage across seals. <slow> ISRO engineers conducted exhaustive ground qualifications — vibration endurance tests, shock trials, and seal verification — before granting full flight clearance."
  },
  {
    num: 10,
    title: "The Indigenous Ahmedabad Atomic Clock",
    text: "<slow> Weighing approximately 2,250 kilograms, NVS-03 carries a sovereign technological milestone: an indigenous Rubidium atomic clock engineered by SAC Ahmedabad. <exhales> The atomic clock is the beating heart of a navigation satellite. Even a microsecond drift results in a 300-meter ground deviation. <slow> NVS-03 broadcasts on civilian L1 and L5 frequencies as well as high-security S-band channels, serving both consumer smartphones and national defence forces."
  },
  {
    num: 11,
    title: "Defying Cyclone Arnab",
    text: "<slow> Amidst final preparations, another formidable obstacle arose: Cyclone Arnab. <exhales> In late October, a deep depression over the Bay of Bengal intensified into Cyclone Arnab, bringing heavy rainfall and fierce gusts to the Sriharikota coast. <sniffles> The launch vehicle and satellite remained secure inside the Mobile Service Tower while technicians worked tirelessly around the clock to manage humidity control, electrical shielding, and pad readiness under severe weather."
  },
  {
    num: 12,
    title: "Orbital Deployment & LAM Burns",
    text: "<exhales> When GSLV-F18 lifts off from Sriharikota, it will deliver NVS-03 into geosynchronous transfer orbit. <slow> Then the true mission begins. The satellite's Liquid Apogee Motor will perform three orbital burns. With the pyro valve already open, fuel will flow seamlessly to circularize the orbit at 36,000 kilometers above Earth. <slow> At that altitude, solar arrays will deploy and telemetry signals from ISRO will reach ground stations."
  },
  {
    num: 13,
    title: "Restoring the Sovereign Constellation",
    text: "<slow> A successful NVS-03 mission restores NavIC to four operational satellites — the baseline threshold for independent 3D positioning. <exhales> It paves the way for NVS-04, 05, and 06. <slow> This launch proves that ISRO does not retreat from setbacks, but engineers deeper solutions. It secures navigation for every citizen's mobile phone, every civil aircraft, and every soldier guarding our frontiers."
  },
  {
    num: 14,
    title: "A Nation's Unyielding Faith",
    text: "<exhales> When the rocket ascends into the night sky, it carries far more than a navigation satellite. <slow> It carries years of resilience from engineers who refused to give up after NVS-02, and the brilliance of scientists who turned setback into triumph. <sniffles> It carries India's sovereign dream born in 1999. <slow> In that fiery moment, a beacon of light will illuminate Sriharikota, carrying the aspirations of 1.4 billion citizens. <soft> Because this is not just a rocket launch — it is India's unyielding belief in itself."
  }
];

function buildWavHeader(pcmByteLength) {
  const numChannels = 1;
  const sampleRate = 24000;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = pcmByteLength;
  const riffSize = 36 + dataSize;

  const buf = Buffer.alloc(44);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(riffSize, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);       // PCM
  buf.writeUInt16LE(numChannels, 22);
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(byteRate, 28);
  buf.writeUInt16LE(blockAlign, 32);
  buf.writeUInt16LE(bitsPerSample, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(dataSize, 40);
  return buf;
}

function extractPcm(wavBuffer) {
  const dataIdx = wavBuffer.indexOf(Buffer.from('data'));
  if (dataIdx === -1) return wavBuffer.slice(44);
  return wavBuffer.slice(dataIdx + 8);
}

async function generateEnglishFull() {
  console.log(`🚀 Generating Full 14-Chunk English Narration for NVS-03...`);
  console.log(`🎙️ Voice: Shivani | Language: en-IN | Model: timbre-v3.0`);
  console.log(`🛡️ Safe Pacing: 3000ms delay between chunks`);

  const pcmBuffers = [];
  const tempFiles = [];

  for (let i = 0; i < englishChunks.length; i++) {
    const chunk = englishChunks[i];
    const tmpPath = path.join(OUT_DIR, `.tmp-en-chunk-${chunk.num}.wav`);
    tempFiles.push(tmpPath);

    console.log(`\n🎙️  [Chunk ${chunk.num}/14] "${chunk.title}" (${chunk.text.length} chars)`);
    let success = false;
    let attempts = 0;

    while (!success && attempts < 3) {
      attempts++;
      try {
        await synthesizeSpeech({
          text: chunk.text,
          lang: 'en-IN',
          voice: 'Shivani',
          model: 'timbre-v3.0',
          targetPath: tmpPath
        });

        const wavBuf = readFileSync(tmpPath);
        const pcm = extractPcm(wavBuf);
        pcmBuffers.push(pcm);
        console.log(`   ✅ Chunk ${chunk.num} synthesized: ${pcm.length} PCM bytes (~${Math.round(pcm.length / (24000 * 2))}s)`);
        success = true;

        if (i < englishChunks.length - 1) {
          console.log(`   ⏳ Pacing pause 3.0s...`);
          await new Promise(r => setTimeout(r, 3000));
        }
      } catch (err) {
        console.error(`   ⚠️ Attempt ${attempts}/3 failed: ${err.message}`);
        if (attempts < 3) {
          console.log(`   ⏳ Backing off 6s...`);
          await new Promise(r => setTimeout(r, 6000));
        } else {
          throw err;
        }
      }
    }
  }

  // Cleanup temp files
  tempFiles.forEach(f => rmSync(f, { force: true }));

  console.log(`\n🔨 Concatenating 14 English PCM segments...`);
  const combinedPcm = Buffer.concat(pcmBuffers);
  const header = buildWavHeader(combinedPcm.length);
  const finalWav = Buffer.concat([header, combinedPcm]);

  const finalEnPath = path.join(OUT_DIR, 'en-IN.wav');
  writeFileSync(finalEnPath, finalWav);

  const durationSec = Math.round(combinedPcm.length / (24000 * 2));
  const sizeMB = (finalWav.length / (1024 * 1024)).toFixed(2);

  console.log(`\n✨ ======================================================== ✨`);
  console.log(`🎉 NVS-03 Master English Audio Generated Successfully!`);
  console.log(`   Output: ${finalEnPath}`);
  console.log(`   Size: ${sizeMB} MB (${finalWav.length} bytes)`);
  console.log(`   Duration: ${Math.floor(durationSec / 60)}m ${durationSec % 60}s (${durationSec} seconds)`);
  console.log(`✨ ======================================================== ✨`);

  // Update SQLite Database
  const db = getDb();
  const fullEnglishText = englishChunks.map(c => c.text).join('\n\n');
  db.prepare(`
    UPDATE story_translations
    SET body = ?, audio_path = '/media/audio/stories/nvs-03/en-IN.wav', audio_status = 'ready', audio_duration_sec = ?
    WHERE story_id = 'nvs-03' AND lang = 'en-IN'
  `).run(fullEnglishText, durationSec);

  console.log(`💾 Updated database: story_translations (nvs-03, en-IN) -> ${durationSec}s`);
}

generateEnglishFull().catch(err => {
  console.error('Fatal generation error:', err);
  process.exit(1);
});

