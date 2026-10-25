import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { ENV, DIRS } from '../../config.js';

export function computeAudioHash(text, voice, lang, model = 'timbre-v2.5') {
  return crypto.createHash('sha256').update(`${text}|${voice}|${lang}|${model}`).digest('hex');
}

export async function synthesizeSpeech({ text, lang, voice, targetPath }) {
  const hash = computeAudioHash(text, voice, lang);
  const finalPath = targetPath || path.join(DIRS.AUDIO_CHAT, `${hash}.mp3`);

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

  // If no Gnani API key, generate a silent or simulated MP3 placeholder for local dev/testing
  if (!ENV.GNANI_API_KEY) {
    // Write a dummy MP3 header byte sequence so player can test
    fs.writeFileSync(finalPath, Buffer.from([0xFF, 0xFB, 0x90, 0x44, 0x00, 0x00, 0x00, 0x00]));
    return {
      filePath: finalPath,
      hash,
      simulated: true
    };
  }

  const endpoint = `${ENV.GNANI_BASE_URL}/tts/v2.5`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ENV.GNANI_API_KEY}`
      },
      body: JSON.stringify({
        text,
        language: lang,
        voice,
        format: 'mp3'
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
