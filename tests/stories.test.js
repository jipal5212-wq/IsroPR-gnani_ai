import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../server/index.js';
import { getDb } from '../server/db/db.js';
import { retrieveContext } from '../server/services/rag.js';

let server;
let baseUrl;
let adminCookie;

test.before(async () => {
  const db = getDb();
  // Ensure idempotent state for test stories
  db.prepare("DELETE FROM stories WHERE id IN ('chandrayaan-3-lunar-landing', 'draft-no-trans')").run();
  db.prepare("DELETE FROM knowledge WHERE title = 'Aditya-L1 Solar Mission'").run();

  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });

  // Login as testadmin to get cookie
  const res = await fetch(`${baseUrl}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'testadmin@isropr.in', password: 'testpass123' })
  });
  const setCookie = res.headers.get('set-cookie');
  adminCookie = setCookie.split(';')[0];
});

test.after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('Admin can create a new story', async () => {
  const storyData = {
    id: 'chandrayaan-3-lunar-landing',
    title: 'Chandrayaan-3 Historic Lunar Landing',
    summary: 'India becomes the first nation to soft-land near the lunar South Pole with Vikram lander and Pragyan rover.',
    category: 'isro',
    facts_as_of: '2023-08-23',
    sources: ['https://www.isro.gov.in/Chandrayaan3.html'],
    duration_hint_min: 3,
    pinned: 1,
    published: 0
  };

  const res = await fetch(`${baseUrl}/api/admin/stories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: adminCookie
    },
    body: JSON.stringify(storyData)
  });

  assert.equal(res.status, 201);
  const data = await res.json();
  assert.equal(data.storyId, 'chandrayaan-3-lunar-landing');
});

test('Admin can add English translation to the story', async () => {
  const transData = {
    body: 'On August 23, 2023, India achieved a historic milestone in space exploration. The Vikram lander touched down safely on the Moon.',
    voice: 'Pranav',
    reviewed: 1,
    review_note: 'Verified against ISRO mission timeline.'
  };

  const res = await fetch(`${baseUrl}/api/admin/stories/chandrayaan-3-lunar-landing/translations/en-IN`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Cookie: adminCookie
    },
    body: JSON.stringify(transData)
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.ok, true);
});

test('Story cannot be published without English body text', async () => {
  // Create another draft story with no translation
  await fetch(`${baseUrl}/api/admin/stories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
    body: JSON.stringify({
      id: 'draft-no-trans',
      title: 'Empty Draft',
      summary: 'Summary here',
      category: 'isro'
    })
  });

  const res = await fetch(`${baseUrl}/api/admin/stories/draft-no-trans`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
    body: JSON.stringify({
      title: 'Empty Draft',
      summary: 'Summary here',
      category: 'isro',
      published: 1
    })
  });

  assert.equal(res.status, 400);
  const data = await res.json();
  assert.ok(data.error.includes('English body text is required'));
});

test('Publish story and fetch from public stories API', async () => {
  // Publish chandrayaan-3-lunar-landing
  const pubRes = await fetch(`${baseUrl}/api/admin/stories/chandrayaan-3-lunar-landing`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
    body: JSON.stringify({
      title: 'Chandrayaan-3 Historic Lunar Landing',
      summary: 'India becomes the first nation to soft-land near the lunar South Pole.',
      category: 'isro',
      facts_as_of: '2023-08-23',
      sources: ['https://www.isro.gov.in/Chandrayaan3.html'],
      published: 1,
      pinned: 1
    })
  });
  assert.equal(pubRes.status, 200);

  // Fetch via public API
  const publicRes = await fetch(`${baseUrl}/api/stories?lang=en-IN&category=isro`);
  assert.equal(publicRes.status, 200);
  const data = await publicRes.json();
  assert.ok(data.stories.some(s => s.id === 'chandrayaan-3-lunar-landing'));
});

test('Knowledge base CRUD and FTS5 retrieval works', async () => {
  // Add Knowledge entry
  const kbRes = await fetch(`${baseUrl}/api/admin/knowledge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
    body: JSON.stringify({
      title: 'Aditya-L1 Solar Mission',
      body: 'Aditya-L1 is Indias first solar observatory positioned at the Sun-Earth Lagrangian point L1, roughly 1.5 million km from Earth.',
      category: 'solar',
      source_url: 'https://www.isro.gov.in/Aditya_L1.html',
      as_of: '2024-01-06'
    })
  });
  assert.equal(kbRes.status, 201);

  // RAG retrieval test
  const retrieved = retrieveContext('Aditya solar observatory');
  assert.ok(retrieved.knowledge.length > 0);
  assert.equal(retrieved.knowledge[0].title, 'Aditya-L1 Solar Mission');
});
