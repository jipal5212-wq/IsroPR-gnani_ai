import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import app from '../server/index.js';

let server;
let baseUrl;

test.before(async () => {
  server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  baseUrl = `http://127.0.0.1:${port}`;
});

test.after(async () => {
  if (server) {
    await new Promise(resolve => server.close(resolve));
  }
});

test('NVS-03 exists in public stories list under upcoming-ongoing category', async () => {
  const res = await fetch(`${baseUrl}/api/stories?category=upcoming-ongoing`);
  assert.equal(res.status, 200);
  const data = await res.json();
  const nvsStory = data.stories.find(s => s.id === 'nvs-03');
  assert.ok(nvsStory, 'NVS-03 must be listed in upcoming-ongoing category');
  assert.equal(nvsStory.category, 'upcoming-ongoing');
  assert.equal(nvsStory.cover_path, 'nvs-03-cover.jpg');
});

test('NVS-03 returns ready audio status and continuous audio for hi-IN', async () => {
  const res = await fetch(`${baseUrl}/api/stories/nvs-03?lang=hi-IN`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.story.id, 'nvs-03');
  assert.equal(data.translation.audio_status, 'ready');
  assert.ok(data.translation.audio_path.includes('/media/audio/stories/nvs-03/hi-IN.wav'));
});

test('NVS-03 cover image and audio file exist on disk and have valid sizes', () => {
  const coverPath = path.resolve('data/covers/nvs-03-cover.jpg');
  assert.ok(fs.existsSync(coverPath), 'Cover image must exist at data/covers/nvs-03-cover.jpg');
  assert.ok(fs.statSync(coverPath).size > 100000, 'Cover image must be valid size (>100KB)');

  const audioPath = path.resolve('data/audio/stories/nvs-03/hi-IN.wav');
  assert.ok(fs.existsSync(audioPath), 'Master WAV audio must exist at data/audio/stories/nvs-03/hi-IN.wav');
  assert.ok(fs.statSync(audioPath).size > 20000000, 'Master WAV audio should be ~24MB');
});

