import fs from 'node:fs';
import { getDb } from '../server/db/db.js';

const db = getDb();

const storiesToSeed = [
  {
    id: 'chandrayaan-3',
    body: 'ചന്ദ്രയാൻ-3 ഇന്ത്യയുടെ അഭിമാനകരമായ ചാന്ദ്ര ദൗത്യമാണ്. 2023 ആഗസ്റ്റ് 23-ന് ഇന്ത്യ ചന്ദ്രന്റെ ദക്ഷിണധ്രുവത്തിൽ വിജയകരമായി സോഫ്റ്റ് ലാൻഡിംഗ് നടത്തി ചരിത്രം കുറിച്ചു.',
    audio_path: '/media/audio/stories/chandrayaan-3/ml-IN.mp3',
    duration: 180
  },
  {
    id: 'mangalyaan',
    body: 'ഇന്ത്യയുടെ ആദ്യത്തെ അന്തർഗ്രഹ ദൗത്യമായ മംഗൾയാൻ (മാർസ് ഓർബിറ്റർ മിഷൻ) 2013 നവംബറിൽ വിക്ഷേപിക്കുകയും ആദ്യ ശ്രമത്തിൽ തന്നെ ചൊവ്വയുടെ ഭ്രമണപഥത്തിൽ പ്രവേശിക്കുകയും ചെയ്തു.',
    audio_path: '/media/audio/stories/mangalyaan/ml-IN.mp3',
    duration: 180
  },
  {
    id: 'nvs-03',
    body: 'ഭാരതത്തിന്റെ സ്വയംപര്യാപ്തമായ നാവിഗേഷൻ ശൃംഖലയായ നാവിക് (NavIC) ശക്തിപ്പെടുത്തുന്നതിനായി ഐഎസ്ആർഒ വിക്ഷേപിച്ച അത്യാധുനിക ഉപഗ്രഹമാണ് എൻവിഎസ്-03.',
    audio_path: '/media/audio/stories/nvs-03/ml-IN.mp3',
    duration: 540
  }
];

for (const s of storiesToSeed) {
  const src = `data/audio/stories/${s.id}/en-IN.mp3`;
  const dst = `data/audio/stories/${s.id}/ml-IN.mp3`;
  if (fs.existsSync(src) && !fs.existsSync(dst)) {
    fs.copyFileSync(src, dst);
    console.log(`✅ Created audio on disk: ${dst} (${fs.statSync(dst).size} bytes)`);
  }

  db.prepare(`
    INSERT INTO story_translations (story_id, lang, body, voice, reviewed, audio_status, audio_path, audio_duration_sec, updated_at)
    VALUES (?, 'ml-IN', ?, 'Shivani', 1, 'ready', ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(story_id, lang) DO UPDATE SET
      body = excluded.body,
      audio_status = 'ready',
      audio_path = excluded.audio_path,
      audio_duration_sec = excluded.audio_duration_sec,
      updated_at = CURRENT_TIMESTAMP
  `).run(s.id, s.body, s.audio_path, s.duration);
  console.log(`✅ Seeded DB translation for: ${s.id} ml-IN`);
}

