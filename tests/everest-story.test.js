import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { getDb } from '../server/db/db.js';

test('EVEREST story exists in database with category startup', () => {
  const db = getDb();
  const story = db.prepare("SELECT * FROM stories WHERE id = 'everest-indian-ffsc'").get();
  assert.ok(story, 'Everest story should exist in stories table');
  assert.equal(story.category, 'startup');
  assert.equal(story.published, 1);
});

test('EVEREST story has translations across all 7 Indian languages', () => {
  const db = getDb();
  const translations = db.prepare("SELECT lang, audio_status, audio_path FROM story_translations WHERE story_id = 'everest-indian-ffsc'").all();
  const requiredLangs = ['en-IN', 'hi-IN', 'ta-IN', 'te-IN', 'bn-IN', 'kn-IN', 'ml-IN'];
  
  for (const lang of requiredLangs) {
    const found = translations.find(t => t.lang === lang);
    assert.ok(found, `Translation for ${lang} must exist`);
    assert.equal(found.audio_status, 'ready');
  }
});

test('EVEREST audio files exist on disk for all 7 languages', () => {
  const requiredLangs = ['en-IN', 'hi-IN', 'ta-IN', 'te-IN', 'bn-IN', 'kn-IN', 'ml-IN'];
  const baseDir = path.resolve(process.cwd(), 'data/audio/stories/everest-ffsc');
  
  for (const lang of requiredLangs) {
    const filePath = path.join(baseDir, `${lang}.mp3`);
    assert.ok(fs.existsSync(filePath), `Audio file ${filePath} must exist`);
    const stat = fs.statSync(filePath);
    assert.ok(stat.size > 100000, `Audio file ${filePath} must have realistic size (>100KB), got ${stat.size}`);
  }
});

test('index.html contains no duplicate telemetry or play badges', () => {
  const html = fs.readFileSync(path.resolve(process.cwd(), 'web/index.html'), 'utf8');
  
  // Single live telemetry banner
  const telemetryMatches = html.match(/id="live-telemetry-banner"/g) || [];
  assert.equal(telemetryMatches.length, 1, 'Exactly 1 live telemetry banner must exist');

  // Exactly 1 shelf-plays per story
  const storyIds = ['everest-indian-ffsc', 'chandrayaan-3', 'nvs-03', 'mangalyaan'];
  for (const id of storyIds) {
    const shelfPlays = (html.match(new RegExp(`class="shelf-plays"\\s+data-story-id="${id}"`, 'g')) || []).length;
    assert.equal(shelfPlays, 1, `Exactly 1 shelf-plays span for ${id}`);

    const cardPills = (html.match(new RegExp(`card-play-count"\\s+data-story-id="${id}"`, 'g')) || []).length;
    assert.equal(cardPills, 1, `Exactly 1 card-play-count pill for ${id} in stories grid`);
  }
});

test('All 4 stories have authentic Malayalam (ml-IN) translations and studio audio', () => {
  const db = getDb();
  const storyIds = ['chandrayaan-3', 'mangalyaan', 'nvs-03', 'everest-indian-ffsc'];
  
  for (const id of storyIds) {
    const row = db.prepare("SELECT * FROM story_translations WHERE story_id = ? AND lang = 'ml-IN'").get(id);
    assert.ok(row, `Malayalam translation for ${id} must exist in DB`);
    assert.ok(row.body.length > 2000, `Malayalam body for ${id} must be full narrative (>2000 chars), got ${row.body.length}`);
    assert.equal(row.audio_status, 'ready');

    const folder = id === 'everest-indian-ffsc' ? 'everest-ffsc' : id;
    const mp3File = path.resolve(`data/audio/stories/${folder}/ml-IN.mp3`);
    assert.ok(fs.existsSync(mp3File), `Audio file ${mp3File} must exist`);
    const stat = fs.statSync(mp3File);
    assert.ok(stat.size > 1000000, `Audio file for ${id} (ml-IN) must be full studio MP3 (>1MB), got ${stat.size}`);

    // Ensure Malayalam audio is genuinely different from English audio (not a dummy copy)
    const enFile = path.resolve(`data/audio/stories/${folder}/en-IN.mp3`);
    if (fs.existsSync(enFile)) {
      const enStat = fs.statSync(enFile);
      assert.notEqual(stat.size, enStat.size, `Malayalam audio size for ${id} must differ from English audio`);
    }
  }
});

test('Frontend player state and language switching are fully synchronized', () => {
  const spotifyPlayerJs = fs.readFileSync(path.resolve(process.cwd(), 'web/js/spotify-player.js'), 'utf8');
  const libraryJs = fs.readFileSync(path.resolve(process.cwd(), 'web/js/library.js'), 'utf8');
  const playerJs = fs.readFileSync(path.resolve(process.cwd(), 'web/js/player.js'), 'utf8');

  // Verify state.lang is tracked in spotify-player.js
  assert.ok(spotifyPlayerJs.includes("lang: 'en-IN'"), "spotify-player.js state must track lang");
  assert.ok(spotifyPlayerJs.includes("state.lang = langCode"), "playStory must update state.lang");
  assert.ok(spotifyPlayerJs.includes("v=ml2"), "playStory audio URL must include ?v=ml2 cache buster");

  // Verify library.js checks audioState.lang === currentLang
  assert.ok(libraryJs.includes("audioState.lang === currentLang"), "library.js click handlers must verify language match");

  // Verify player.js checks st.lang !== activeLang
  assert.ok(playerJs.includes("st.lang !== activeLang"), "player.js play button must verify language match");
});

