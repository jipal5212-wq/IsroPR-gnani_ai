import test from 'node:test';
import assert from 'node:assert/strict';
import { getDb, getSetting, setSetting } from '../server/db/db.js';

test('Database initializes and has all expected tables', () => {
  const db = getDb();
  assert.ok(db, 'Database instance should exist');

  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(r => r.name);
  const requiredTables = [
    'admins',
    'stories',
    'story_translations',
    'knowledge',
    'knowledge_fts',
    'chat_sessions',
    'chat_messages',
    'jobs',
    'settings',
    'admin_log'
  ];

  for (const table of requiredTables) {
    assert.ok(tables.includes(table), `Table ${table} must exist in database`);
  }
});

test('Default settings are populated', () => {
  const enabledLangs = getSetting('enabled_languages');
  assert.ok(Array.isArray(enabledLangs), 'Enabled languages should be an array');
  assert.ok(enabledLangs.includes('en-IN'), 'en-IN should be enabled');
  assert.ok(enabledLangs.includes('hi-IN'), 'hi-IN should be enabled');
});

test('Settings can be updated and retrieved', () => {
  setSetting('test_key', { hello: 'bharat' });
  const val = getSetting('test_key');
  assert.deepEqual(val, { hello: 'bharat' });
});
