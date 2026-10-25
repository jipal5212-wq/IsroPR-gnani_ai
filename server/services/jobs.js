import path from 'node:path';
import fs from 'node:fs';
import { getDb } from '../db/db.js';
import { DIRS } from '../config.js';
import { synthesizeSpeech, computeAudioHash } from './gnani/tts.js';
import { splitIntoSentences } from './audio.js';

let isRunning = false;
let workerTimer = null;

export function startJobWorker(intervalMs = 3000) {
  if (workerTimer) return;
  workerTimer = setInterval(processNextJob, intervalMs);
  if (workerTimer.unref) {
    workerTimer.unref();
  }
  console.log('⚡ Audio job worker initialized');
}

export function stopJobWorker() {
  if (workerTimer) {
    clearInterval(workerTimer);
    workerTimer = null;
  }
}

async function processNextJob() {
  if (isRunning) return;
  const db = getDb();

  // Find next queued job
  const job = db.prepare(`
    SELECT * FROM jobs 
    WHERE status = 'queued' 
    ORDER BY id ASC LIMIT 1
  `).get();

  if (!job) return;

  isRunning = true;
  db.prepare(`UPDATE jobs SET status = 'running' WHERE id = ?`).run(job.id);

  try {
    const payload = JSON.parse(job.payload);

    if (job.type === 'tts_story') {
      await processStoryAudioJob(payload, db);
    }

    db.prepare(`
      UPDATE jobs 
      SET status = 'done', finished_at = CURRENT_TIMESTAMP, error = null 
      WHERE id = ?
    `).run(job.id);
  } catch (err) {
    console.error(`Audio job #${job.id} failed:`, err);
    db.prepare(`
      UPDATE jobs 
      SET status = 'failed', error = ?, attempts = attempts + 1, finished_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(err.message, job.id);
  } finally {
    isRunning = false;
  }
}

async function processStoryAudioJob({ storyId, lang }, db) {
  const translation = db.prepare(`
    SELECT * FROM story_translations WHERE story_id = ? AND lang = ?
  `).get(storyId, lang);

  if (!translation || !translation.body) {
    throw new Error(`Translation for story ${storyId} (${lang}) not found or empty`);
  }

  db.prepare(`UPDATE story_translations SET audio_status = 'generating' WHERE story_id = ? AND lang = ?`)
    .run(storyId, lang);

  const hash = computeAudioHash(translation.body, translation.voice, lang);
  const storyDir = path.join(DIRS.AUDIO_STORIES, storyId);
  fs.mkdirSync(storyDir, { recursive: true });
  const finalFilePath = path.join(storyDir, `${lang}.mp3`);

  // Synthesize speech
  const ttsResult = await synthesizeSpeech({
    text: translation.body,
    lang,
    voice: translation.voice,
    targetPath: finalFilePath
  });

  // Estimate duration: approx 150 words per minute
  const wordCount = translation.body.trim().split(/\s+/).length;
  const estDurationSec = Math.max(5, Math.round((wordCount / 150) * 60));

  const audioPublicUrl = `/media/audio/stories/${storyId}/${lang}.mp3`;

  db.prepare(`
    UPDATE story_translations 
    SET audio_status = 'ready', audio_path = ?, audio_hash = ?, audio_duration_sec = ?, audio_error = null, updated_at = CURRENT_TIMESTAMP
    WHERE story_id = ? AND lang = ?
  `).run(audioPublicUrl, hash, estDurationSec, storyId, lang);
}
