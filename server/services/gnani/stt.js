import fs from 'node:fs';
import { ENV } from '../../config.js';

export async function transcribeAudio({ audioFilePath, lang = 'en-IN' }) {
  if (!fs.existsSync(audioFilePath)) {
    throw new Error('Audio file does not exist');
  }

  const stat = fs.statSync(audioFilePath);
  if (stat.size < 100) {
    throw new Error('Audio note is too short or empty');
  }

  // If no Gnani API key, return a mock transcript for testing
  if (!ENV.GNANI_API_KEY) {
    return {
      transcript: "Tell me about Chandrayaan-3 mission status",
      detectedLanguage: lang || 'en-IN',
      confidence: 0.95,
      simulated: true
    };
  }

  const endpoint = `${ENV.GNANI_BASE_URL}/stt/v2.5`;
  const fileBuffer = fs.readFileSync(audioFilePath);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout per spec

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'audio/wav',
        'Authorization': `Bearer ${ENV.GNANI_API_KEY}`,
        'token': ENV.GNANI_API_KEY,
        'access-token': ENV.GNANI_API_KEY,
        'X-Language-Hint': lang,
        'language': lang
      },
      body: fileBuffer,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gnani STT error ${res.status}: ${err}`);
    }

    const data = await res.json();
    return {
      transcript: data.transcript || data.text || '',
      detectedLanguage: data.detected_language || lang,
      confidence: data.confidence || 1.0
    };
  } catch (err) {
    clearTimeout(timeoutId);
    console.error('Gnani STT error:', err);
    throw err;
  }
}
