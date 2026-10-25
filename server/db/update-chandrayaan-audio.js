import { getDb } from './db.js';

export function updateChandrayaanAudio() {
  const db = getDb();

  // 1. Update 'chandrayaan' (user-created story)
  db.prepare(`
    UPDATE story_translations 
    SET audio_status = 'ready', 
        audio_path = '/media/audio/stories/chandrayaan/en-IN.wav', 
        audio_duration_sec = 39.0, 
        updated_at = CURRENT_TIMESTAMP 
    WHERE story_id = 'chandrayaan' AND lang = 'en-IN'
  `).run();

  const trans = db.prepare("SELECT body, voice FROM story_translations WHERE story_id = 'chandrayaan' AND lang = 'en-IN'").get();
  if (trans) {
    db.prepare(`
      INSERT INTO story_translations (story_id, lang, body, voice, reviewed, audio_status, audio_path, audio_duration_sec, updated_at)
      VALUES ('chandrayaan', 'hi-IN', ?, 'Nalini', 1, 'ready', '/media/audio/stories/chandrayaan/hi-IN.wav', 39.0, CURRENT_TIMESTAMP)
      ON CONFLICT(story_id, lang) DO UPDATE SET
        audio_status = 'ready',
        audio_path = '/media/audio/stories/chandrayaan/hi-IN.wav',
        audio_duration_sec = 39.0,
        updated_at = CURRENT_TIMESTAMP
    `).run(trans.body);
  }

  db.prepare(`
    UPDATE stories 
    SET summary = 'India becomes the first nation to land near the lunar South Pole with Vikram lander and Pragyan rover.',
        facts_as_of = '2023-08-23',
        sources = '["https://www.isro.gov.in/Chandrayaan3.html"]',
        duration_hint_min = 1,
        published = 1,
        pinned = 1
    WHERE id = 'chandrayaan'
  `).run();

  // 2. Also update 'chandrayaan-3' (seeded story)
  db.prepare(`
    UPDATE story_translations 
    SET audio_status = 'ready', 
        audio_path = '/media/audio/stories/chandrayaan-3/en-IN.wav', 
        audio_duration_sec = 39.0, 
        updated_at = CURRENT_TIMESTAMP 
    WHERE story_id = 'chandrayaan-3' AND lang = 'en-IN'
  `).run();

  db.prepare(`
    UPDATE story_translations 
    SET audio_status = 'ready', 
        audio_path = '/media/audio/stories/chandrayaan-3/hi-IN.wav', 
        audio_duration_sec = 39.0, 
        updated_at = CURRENT_TIMESTAMP 
    WHERE story_id = 'chandrayaan-3' AND lang = 'hi-IN'
  `).run();

  console.log('✅ Successfully linked generated-audio.wav to Chandrayaan-3 stories (both en-IN and hi-IN)!');
}

updateChandrayaanAudio();
