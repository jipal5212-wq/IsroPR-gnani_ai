import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs';
import path from 'node:path';
import { ENV } from '../config.js';

const execAsync = promisify(exec);

// Split text into readable chunks under maxChars at sentence boundaries
export function splitIntoSentences(text, maxChars = 400) {
  if (!text || text.length <= maxChars) return [text.trim()];

  // Regex to split on full stops, question marks, exclamation marks, or Indian danda (।)
  const sentences = text.match(/[^.!?।\n]+[.!?।\n]+|[^.!?।\n]+$/g) || [text];
  const chunks = [];
  let current = '';

  for (const s of sentences) {
    if ((current + ' ' + s).trim().length <= maxChars) {
      current = (current + ' ' + s).trim();
    } else {
      if (current) chunks.push(current);
      current = s.trim();
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

// Convert uploaded audio to WAV 16kHz Mono for STT
export async function convertToWav16kMono(inputPath, outputPath) {
  try {
    const cmd = `"${ENV.FFMPEG_PATH}" -y -i "${inputPath}" -ar 16000 -ac 1 -c:a pcm_s16le "${outputPath}"`;
    await execAsync(cmd);
    return outputPath;
  } catch (err) {
    // If ffmpeg is not available, return original input path as fallback
    console.warn(`ffmpeg conversion bypassed: ${err.message}`);
    return inputPath;
  }
}

// Clean up temporary files safely
export function safeUnlink(filePath) {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (e) {
    console.warn(`Could not unlink temp file: ${filePath}`);
  }
}
