/**
 * generate-nvs03-audio.js
 * Generates Shivani voice audio for NVS-03 NavIC story in Hindi (hi-IN)
 * across the 14 chunks provided by user, preserving all emotion tags (<exhales>, <slow>, <sniffles>, <soft>).
 * Combines all chunks into a seamless 24,000Hz 16-bit Mono master WAV.
 *
 * Run: node --env-file=.env scripts/generate-nvs03-audio.js
 */
import { synthesizeSpeech } from '../server/services/gnani/tts.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync, writeFileSync, readFileSync, existsSync, rmSync, statSync, copyFileSync } from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, '../data/audio/stories/nvs-03');
mkdirSync(OUT_DIR, { recursive: true });

const chunks = JSON.parse(readFileSync(path.join(__dirname, 'nvs03-chunks.json'), 'utf8'));

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

async function generate() {
  console.log(`🚀 Starting NVS-03 Audio Generation (14 Chunks, Shivani voice, timbre-v3.0)...`);
  console.log(`📁 Target Directory: ${OUT_DIR}`);
  console.log(`🛡️  Pacing delay: 3000ms between calls (Cloudflare WAF safe)`);

  const pcmBuffers = [];
  const tempFiles = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const chunkNum = chunk.num;
    const tmpPath = path.join(OUT_DIR, `.tmp-nvs03-chunk-${chunkNum}.wav`);
    tempFiles.push(tmpPath);

    console.log(`\n🎙️  [Chunk ${chunkNum}/14] "${chunk.title}" (${chunk.text.length} chars)`);

    let success = false;
    let attempts = 0;

    while (!success && attempts < 3) {
      attempts++;
      try {
        await synthesizeSpeech({
          text: chunk.text,
          lang: 'hi-IN',
          voice: 'Shivani',
          model: 'timbre-v3.0',
          targetPath: tmpPath
        });

        const wavBuf = readFileSync(tmpPath);
        const pcm = extractPcm(wavBuf);
        pcmBuffers.push(pcm);
        console.log(`   ✅ Chunk ${chunkNum} synthesized successfully: ${pcm.length} PCM bytes`);
        success = true;

        // Strict pacing delay to keep Cloudflare happy
        if (i < chunks.length - 1) {
          console.log(`   ⏳ Pacing pause 3.0s...`);
          await new Promise(r => setTimeout(r, 3000));
        }
      } catch (err) {
        console.error(`   ⚠️ Chunk ${chunkNum} failed (Attempt ${attempts}/3): ${err.message}`);
        
        // Check if blocked by Cloudflare WAF or Auth
        if (err.message && (err.message.includes('403') || err.message.includes('blocked') || err.message.includes('401'))) {
          console.error(`\n🚨 CRITICAL ERROR: Cloudflare WAF block or Authentication failure!`);
          console.error(`   Message: ${err.message}`);
          console.error(`   Halting execution to prevent IP ban. Please provide a new Gnani API key.`);
          process.exit(2);
        }

        if (attempts < 3) {
          console.log(`   ⏳ Backing off for 8 seconds before retry...`);
          await new Promise(r => setTimeout(r, 8000));
        } else {
          console.error(`   ❌ Chunk ${chunkNum} permanently failed after 3 attempts.`);
          process.exit(1);
        }
      }
    }
  }

  // Cleanup temporary files
  tempFiles.forEach(f => rmSync(f, { force: true }));

  console.log(`\n🔨 Concatenating ${pcmBuffers.length} PCM segments...`);
  const combinedPcm = Buffer.concat(pcmBuffers);
  const header = buildWavHeader(combinedPcm.length);
  const finalWav = Buffer.concat([header, combinedPcm]);

  const finalHiPath = path.join(OUT_DIR, 'hi-IN.wav');
  const backupFull = path.join(OUT_DIR, 'nvs-03-full.wav');

  writeFileSync(finalHiPath, finalWav);
  writeFileSync(backupFull, finalWav);

  const durationSec = Math.round(combinedPcm.length / (24000 * 2));
  const sizeMB = (finalWav.length / (1024 * 1024)).toFixed(2);

  console.log(`\n✨ ======================================================== ✨`);
  console.log(`🎉 NVS-03 Master Audio Generated Successfully!`);
  console.log(`   Output: ${finalHiPath}`);
  console.log(`   Size: ${sizeMB} MB (${finalWav.length} bytes)`);
  console.log(`   Estimated Duration: ${Math.floor(durationSec / 60)}m ${durationSec % 60}s (${durationSec} seconds)`);
  console.log(`✨ ======================================================== ✨`);
}

generate().catch(err => {
  console.error('Fatal Audio Generation Error:', err);
  process.exit(1);
});
