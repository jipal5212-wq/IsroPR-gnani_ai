import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { ENV, DIRS } from '../../config.js';

export function computeAudioHash(text, voice, lang, model = 'timbre-v2.5') {
  return crypto.createHash('sha256').update(`${text}|${voice}|${lang}|${model}`).digest('hex');
}

export async function synthesizeSpeech({ text, lang, voice, targetPath }) {
  const hash = computeAudioHash(text, voice, lang);
  const finalPath = targetPath || path.join(DIRS.AUDIO_CHAT, `${hash}.wav`);

  // Check if audio already exists in cache
  if (fs.existsSync(finalPath) && fs.statSync(finalPath).size > 100) {
    return {
      filePath: finalPath,
      hash,
      cached: true
    };
  }

  // Ensure target directory exists
  fs.mkdirSync(path.dirname(finalPath), { recursive: true });

  // If no Gnani API key, generate a silent or simulated audio placeholder for local dev/testing
  if (!ENV.GNANI_API_KEY) {
    // Write a dummy WAV header byte sequence so player can test
    fs.writeFileSync(finalPath, Buffer.from([0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x41, 0x56, 0x45]));
    return {
      filePath: finalPath,
      hash,
      simulated: true
    };
  }

  const endpoint = `${ENV.GNANI_BASE_URL}/api/v1/tts/inference`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 18000); // 18s timeout

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key-ID': ENV.GNANI_API_KEY
      },
      body: JSON.stringify({
        text,
        voice: voice || 'Pranav',
        model: 'timbre-v2.5',
        language: lang,
        speed: 1,
        audio_config: {
          encoding: 'linear_pcm',
          container: 'wav',
          num_channels: 1,
          sample_rate: 24000,
          sample_width: 2
        }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gnani TTS error ${res.status}: ${err}`);
    }

    const arrayBuffer = await res.arrayBuffer();
    fs.writeFileSync(finalPath, Buffer.from(arrayBuffer));

    return {
      filePath: finalPath,
      hash,
      cached: false
    };
  } catch (err) {
    clearTimeout(timeoutId);
    console.error('Gnani TTS error:', err);
    throw err;
  }
}
