import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DIRS, ALL_LANGUAGES } from '../config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let dbInstance = null;

export function getDb() {
  if (dbInstance) {
    return dbInstance;
  }

  const db = new Database(DIRS.DB_FILE);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Apply schema
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schemaSql);

  // Initialize default settings if not already present
  const defaultLanguages = ALL_LANGUAGES.filter(l => l.listening).map(l => l.code);
  const defaultSettings = [
    { key: 'llm_provider', value: JSON.stringify('openai-compatible') },
    { key: 'llm_model', value: JSON.stringify('gpt-4o-mini') },
    { key: 'enabled_languages', value: JSON.stringify(defaultLanguages) },
    { key: 'chat_max_audio_sec', value: JSON.stringify(30) },
    { key: 'chat_retention_days', value: JSON.stringify(30) },
    { key: 'always_send_voice_replies', value: JSON.stringify(0) },
    { key: 'rate_limits', value: JSON.stringify({ publicRpm: 60, chatTextRpm: 20, chatVoiceRpm: 5, loginRpm: 5 }) }
  ];

  const insertSetting = db.prepare(`
    INSERT OR IGNORE INTO settings (key, value) VALUES (@key, @value)
  `);

  const setTransaction = db.transaction((settings) => {
    for (const setting of settings) {
      insertSetting.run(setting);
    }
  });

  setTransaction(defaultSettings);

  // On boot: reset any stuck running jobs to queued per spec (Section 7.4)
  db.prepare(`UPDATE jobs SET status = 'queued' WHERE status = 'running'`).run();

  dbInstance = db;
  return dbInstance;
}

export function getSetting(key, defaultValue = null) {
  const db = getDb();
  const row = db.prepare(`SELECT value FROM settings WHERE key = ?`).get(key);
  if (!row) return defaultValue;
  try {
    return JSON.parse(row.value);
  } catch {
    return row.value;
  }
}

export function setSetting(key, value) {
  const db = getDb();
  const jsonVal = typeof value === 'string' ? value : JSON.stringify(value);
  db.prepare(`INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`).run(key, jsonVal);
}

export default getDb;
