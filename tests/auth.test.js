import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../server/index.js';
import { getDb } from '../server/db/db.js';
import bcrypt from 'bcryptjs';

let server;
let baseUrl;

test.before(async () => {
  // Ensure an admin user exists for test
  const db = getDb();
  const passwordHash = await bcrypt.hash('testpass123', 10);
  db.prepare(`
    INSERT INTO admins (email, password_hash)
    VALUES ('testadmin@isropr.in', ?)
    ON CONFLICT(email) DO UPDATE SET password_hash = excluded.password_hash
  `).run(passwordHash);

  // Start test server on random port
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

test('Public endpoint /api/languages returns enabled languages', async () => {
  const res = await fetch(`${baseUrl}/api/languages`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data.languages));
  assert.ok(data.languages.some(l => l.code === 'en-IN'));
  assert.ok(data.languages.some(l => l.code === 'hi-IN'));
});

test('Protected endpoint /api/admin/me returns 401 without auth', async () => {
  const res = await fetch(`${baseUrl}/api/admin/me`);
  assert.equal(res.status, 401);
  const data = await res.json();
  assert.ok(data.error);
});

test('Admin login fails with invalid credentials', async () => {
  const res = await fetch(`${baseUrl}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'testadmin@isropr.in', password: 'wrongpassword' })
  });
  assert.equal(res.status, 401);
  const data = await res.json();
  assert.equal(data.error, 'Invalid email or password');
});

test('Admin login succeeds with valid credentials and sets session cookie', async () => {
  const res = await fetch(`${baseUrl}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'testadmin@isropr.in', password: 'testpass123' })
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.ok, true);
  assert.equal(data.admin.email, 'testadmin@isropr.in');

  // Verify Set-Cookie header is present
  const setCookie = res.headers.get('set-cookie');
  assert.ok(setCookie, 'set-cookie header should be returned');
  assert.ok(setCookie.includes('space_admin_session='));

  // Extract cookie
  const cookieValue = setCookie.split(';')[0];

  // Test authenticated request to /api/admin/me
  const meRes = await fetch(`${baseUrl}/api/admin/me`, {
    headers: { Cookie: cookieValue }
  });

  assert.equal(meRes.status, 200);
  const meData = await meRes.json();
  assert.equal(meData.admin.email, 'testadmin@isropr.in');

  // Test authenticated request to /api/admin/stats
  const statsRes = await fetch(`${baseUrl}/api/admin/stats`, {
    headers: { Cookie: cookieValue }
  });

  assert.equal(statsRes.status, 200);
  const statsData = await statsRes.json();
  assert.ok(statsData.counts);
});
