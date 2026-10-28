import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import app from '../server/index.js';
import { DIRS } from '../server/config.js';
import { getDb } from '../server/db/db.js';

let server;
let baseUrl;

test.before(async () => {
  const db = getDb();
  db.prepare("DELETE FROM story_translations WHERE story_id IN ('chandrayaan-3-lunar-landing', 'draft-no-trans')").run();
  db.prepare("DELETE FROM stories WHERE id IN ('chandrayaan-3-lunar-landing', 'draft-no-trans')").run();

  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('Only single Chandrayaan-3 story exists in public stories list', async () => {
  const res = await fetch(`${baseUrl}/api/stories`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(data.stories.some(s => s.id === 'chandrayaan-3'), 'Chandrayaan-3 must exist in stories library');
});

test('Chandrayaan-3 plays continuous single unified audio track in one go', async () => {
  const res = await fetch(`${baseUrl}/api/stories/chandrayaan-3?lang=hi-IN`);
  assert.equal(res.status, 200);
  const data = await res.json();

  assert.ok(data.story, 'Story must be present');
  assert.equal(data.story.id, 'chandrayaan-3');
  assert.equal(data.parts, undefined, 'Parts must NOT be exposed to users in API');

  assert.ok(data.translation, 'Translation must be present');
  assert.equal(data.translation.audio_status, 'ready');
  assert.ok(data.translation.audio_path.endsWith('.wav'), 'Audio path must be a WAV file');
  assert.equal(data.translation.audio_duration_sec, 180, 'Audio duration must be 180 seconds (3 mins continuous in one go)');

  // Verify master continuous track exists on disk
  const masterPath = path.join(DIRS.AUDIO_STORIES, 'chandrayaan-3', 'hi-IN.wav');
  assert.ok(fs.existsSync(masterPath), 'Master hi-IN.wav continuous track must exist');
  const masterStat = fs.statSync(masterPath);
  assert.ok(masterStat.size > 15000000, 'Master track must be ~15.8MB (all 5 parts merged in one go)');
});

test('Continuous master audio stream returns 200 with full audio length', async () => {
  const res = await fetch(`${baseUrl}/media/audio/stories/chandrayaan-3/hi-IN.wav`);
  assert.equal(res.status, 200, 'Streaming hi-IN.wav should return 200');
  assert.equal(res.headers.get('content-type'), 'audio/wav', 'Content type should be audio/wav');
  const buf = await res.arrayBuffer();
  assert.ok(buf.byteLength > 15000000, 'Streamed continuous track size must be ~15.8MB');
});
