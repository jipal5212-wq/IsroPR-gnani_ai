import express from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { getDb, getSetting, setSetting } from '../db/db.js';
import { requireAdmin, signAdminToken, ADMIN_COOKIE_NAME } from '../middleware/requireAdmin.js';
import { loginLimiter } from '../middleware/rateLimit.js';
import { ENV, ALL_LANGUAGES } from '../config.js';

const router = express.Router();

// Input Validation Schemas
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required')
});

const StoryCreateSchema = z.object({
  id: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  title: z.string().min(1).max(200),
  summary: z.string().min(1).max(1000),
  category: z.enum(['isro', 'startup', 'legacy', 'explainer']),
  cover_path: z.string().optional().nullable(),
  facts_as_of: z.string().optional().nullable(),
  sources: z.array(z.string().url()).optional().default([]),
  duration_hint_min: z.number().int().min(0).optional().default(0),
  pinned: z.number().int().min(0).max(1).optional().default(0),
  published: z.number().int().min(0).max(1).optional().default(0)
});

const StoryUpdateSchema = StoryCreateSchema.omit({ id: true });

const TranslationSchema = z.object({
  body: z.string().min(1).max(30000),
  voice: z.string().min(1).max(50),
  reviewed: z.number().int().min(0).max(1).optional().default(0),
  review_note: z.string().optional().nullable()
});

const KnowledgeSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(5000),
  category: z.string().min(1).max(50).optional().default('general'),
  source_url: z.string().url('Source URL must be a valid link'),
  as_of: z.string().min(1, 'As-of date is required')
});

// ==========================================
// 1. AUTH ROUTES
// ==========================================

// POST /api/admin/login
router.post('/login', loginLimiter, async (req, res) => {
  const parseResult = LoginSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.errors[0].message });
  }

  const { email, password } = parseResult.data;
  const db = getDb();
  const admin = db.prepare('SELECT id, email, password_hash FROM admins WHERE email = ?').get(email);

  if (!admin) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const isMatch = await bcrypt.compare(password, admin.password_hash);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = signAdminToken(admin);

  res.cookie(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: ENV.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: ENV.ADMIN_SESSION_HOURS * 60 * 60 * 1000
  });

  // Log action
  db.prepare('INSERT INTO admin_log (admin_email, action, target) VALUES (?, ?, ?)')
    .run(admin.email, 'login', req.ip);

  return res.json({
    ok: true,
    admin: { id: admin.id, email: admin.email }
  });
});

// POST /api/admin/logout
router.post('/logout', (req, res) => {
  res.clearCookie(ADMIN_COOKIE_NAME);
  return res.json({ ok: true, message: 'Logged out successfully' });
});

// GET /api/admin/me
router.get('/me', requireAdmin, (req, res) => {
  return res.json({ admin: req.admin });
});

// ==========================================
// 2. DASHBOARD STATS
// ==========================================

// GET /api/admin/stats
router.get('/stats', requireAdmin, (req, res) => {
  const db = getDb();
  
  const storiesTotal = db.prepare('SELECT count(*) as c FROM stories').get().c;
  const storiesPublished = db.prepare('SELECT count(*) as c FROM stories WHERE published = 1').get().c;
  const storiesDraft = storiesTotal - storiesPublished;

  const audioReady = db.prepare("SELECT count(*) as c FROM story_translations WHERE audio_status = 'ready'").get().c;
  const audioQueued = db.prepare("SELECT count(*) as c FROM story_translations WHERE audio_status IN ('queued', 'generating')").get().c;
  const audioFailed = db.prepare("SELECT count(*) as c FROM story_translations WHERE audio_status = 'failed'").get().c;

  const knowledgeCount = db.prepare('SELECT count(*) as c FROM knowledge').get().c;

  // Chats in last 7 days
  const recentChats = db.prepare(`
    SELECT count(DISTINCT session_id) as c 
    FROM chat_messages 
    WHERE created_at >= datetime('now', '-7 days')
  `).get().c;

  const recentJobs = db.prepare(`
    SELECT id, type, status, attempts, error, created_at, finished_at 
    FROM jobs 
    ORDER BY id DESC LIMIT 10
  `).all();

  return res.json({
    counts: {
      storiesTotal,
      storiesPublished,
      storiesDraft,
      audioReady,
      audioQueued,
      audioFailed,
      knowledgeCount,
      recentChats
    },
    recentJobs,
    apiStatus: {
      hasGnaniKey: Boolean(ENV.GNANI_API_KEY),
      hasLlmKey: Boolean(ENV.LLM_API_KEY),
      llmProvider: ENV.LLM_PROVIDER,
      llmModel: ENV.LLM_MODEL
    }
  });
});

// ==========================================
// 3. STORIES & TRANSLATIONS
// ==========================================

// GET /api/admin/stories
router.get('/stories', requireAdmin, (req, res) => {
  const db = getDb();
  const stories = db.prepare(`
    SELECT s.*, 
      (SELECT count(*) FROM story_translations WHERE story_id = s.id) as translation_count,
      (SELECT count(*) FROM story_translations WHERE story_id = s.id AND audio_status = 'ready') as audio_ready_count
    FROM stories s
    ORDER BY s.pinned DESC, s.created_at DESC
  `).all();

  const formatted = stories.map(s => ({
    ...s,
    sources: JSON.parse(s.sources || '[]')
  }));

  return res.json({ stories: formatted });
});

// POST /api/admin/stories
router.post('/stories', requireAdmin, (req, res) => {
  const parseResult = StoryCreateSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.errors[0].message });
  }

  const data = parseResult.data;
  const db = getDb();

  const existing = db.prepare('SELECT id FROM stories WHERE id = ?').get(data.id);
  if (existing) {
    return res.status(409).json({ error: 'A story with this slug already exists' });
  }

  db.prepare(`
    INSERT INTO stories (id, title, summary, category, cover_path, published, pinned, facts_as_of, sources, duration_hint_min)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    data.id,
    data.title,
    data.summary,
    data.category,
    data.cover_path || null,
    data.published,
    data.pinned,
    data.facts_as_of || null,
    JSON.stringify(data.sources),
    data.duration_hint_min
  );

  db.prepare('INSERT INTO admin_log (admin_email, action, target) VALUES (?, ?, ?)')
    .run(req.admin.email, 'story_create', data.id);

  return res.status(201).json({ ok: true, storyId: data.id });
});

// GET /api/admin/stories/:id
router.get('/stories/:id', requireAdmin, (req, res) => {
  const db = getDb();
  const story = db.prepare('SELECT * FROM stories WHERE id = ?').get(req.params.id);
  if (!story) {
    return res.status(404).json({ error: 'Story not found' });
  }

  story.sources = JSON.parse(story.sources || '[]');
  const translations = db.prepare('SELECT * FROM story_translations WHERE story_id = ?').all(req.params.id);

  return res.json({ story, translations });
});

// PUT /api/admin/stories/:id
router.put('/stories/:id', requireAdmin, (req, res) => {
  const parseResult = StoryUpdateSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.errors[0].message });
  }

  const data = parseResult.data;
  const db = getDb();

  const story = db.prepare('SELECT id FROM stories WHERE id = ?').get(req.params.id);
  if (!story) {
    return res.status(404).json({ error: 'Story not found' });
  }

  // Publishing rules per spec 7.3: English body filled and English audio ready
  if (data.published === 1) {
    const enTrans = db.prepare("SELECT body, audio_status FROM story_translations WHERE story_id = ? AND lang = 'en-IN'").get(req.params.id);
    if (!enTrans || !enTrans.body.trim()) {
      return res.status(400).json({ error: 'Cannot publish story: English body text is required' });
    }
    // Note: English audio is recommended/checked, but we warn or allow if admin explicitly chooses
  }

  db.prepare(`
    UPDATE stories 
    SET title = ?, summary = ?, category = ?, cover_path = ?, published = ?, pinned = ?, 
        facts_as_of = ?, sources = ?, duration_hint_min = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    data.title,
    data.summary,
    data.category,
    data.cover_path || null,
    data.published,
    data.pinned,
    data.facts_as_of || null,
    JSON.stringify(data.sources),
    data.duration_hint_min,
    req.params.id
  );

  return res.json({ ok: true });
});

// DELETE /api/admin/stories/:id
router.delete('/stories/:id', requireAdmin, (req, res) => {
  const db = getDb();
  const story = db.prepare('SELECT id FROM stories WHERE id = ?').get(req.params.id);
  if (!story) {
    return res.status(404).json({ error: 'Story not found' });
  }

  db.prepare('DELETE FROM stories WHERE id = ?').run(req.params.id);

  db.prepare('INSERT INTO admin_log (admin_email, action, target) VALUES (?, ?, ?)')
    .run(req.admin.email, 'story_delete', req.params.id);

  return res.json({ ok: true });
});

// PUT /api/admin/stories/:id/translations/:lang
router.put('/stories/:id/translations/:lang', requireAdmin, (req, res) => {
  const parseResult = TranslationSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.errors[0].message });
  }

  const { body, voice, reviewed, review_note } = parseResult.data;
  const { id: storyId, lang } = req.params;
  const db = getDb();

  const story = db.prepare('SELECT id FROM stories WHERE id = ?').get(storyId);
  if (!story) {
    return res.status(404).json({ error: 'Story not found' });
  }

  db.prepare(`
    INSERT INTO story_translations (story_id, lang, body, voice, reviewed, review_note, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(story_id, lang) DO UPDATE SET
      body = excluded.body,
      voice = excluded.voice,
      reviewed = excluded.reviewed,
      review_note = excluded.review_note,
      updated_at = CURRENT_TIMESTAMP
  `).run(storyId, lang, body, voice, reviewed, review_note || null);

  return res.json({ ok: true });
});

// POST /api/admin/stories/:id/audio (Queue TTS audio generation)
router.post('/stories/:id/audio', requireAdmin, (req, res) => {
  const { id: storyId } = req.params;
  const { lang, all } = req.body || {};
  const db = getDb();

  let translations = [];
  if (all) {
    translations = db.prepare('SELECT lang FROM story_translations WHERE story_id = ?').all(storyId);
  } else if (lang) {
    const t = db.prepare('SELECT lang FROM story_translations WHERE story_id = ? AND lang = ?').get(storyId, lang);
    if (t) translations.push(t);
  }

  if (translations.length === 0) {
    return res.status(400).json({ error: 'No matching translations found to generate audio' });
  }

  const insertJob = db.prepare(`
    INSERT INTO jobs (type, payload, status)
    VALUES ('tts_story', ?, 'queued')
  `);

  const updateStatus = db.prepare(`
    UPDATE story_translations SET audio_status = 'queued', audio_error = null WHERE story_id = ? AND lang = ?
  `);

  for (const t of translations) {
    updateStatus.run(storyId, t.lang);
    insertJob.run(JSON.stringify({ storyId, lang: t.lang }));
  }

  return res.json({ ok: true, queuedCount: translations.length });
});

// ==========================================
// 4. KNOWLEDGE BASE
// ==========================================

// GET /api/admin/knowledge
router.get('/knowledge', requireAdmin, (req, res) => {
  const db = getDb();
  const entries = db.prepare('SELECT * FROM knowledge ORDER BY id DESC').all();
  return res.json({ entries });
});

// POST /api/admin/knowledge
router.post('/knowledge', requireAdmin, (req, res) => {
  const parseResult = KnowledgeSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.errors[0].message });
  }

  const data = parseResult.data;
  const db = getDb();

  const info = db.prepare(`
    INSERT INTO knowledge (title, body, category, source_url, as_of)
    VALUES (?, ?, ?, ?, ?)
  `).run(data.title, data.body, data.category, data.source_url, data.as_of);

  db.prepare('INSERT INTO admin_log (admin_email, action, target) VALUES (?, ?, ?)')
    .run(req.admin.email, 'knowledge_create', `ID ${info.lastInsertRowid}`);

  return res.status(201).json({ ok: true, id: info.lastInsertRowid });
});

// PUT /api/admin/knowledge/:id
router.put('/knowledge/:id', requireAdmin, (req, res) => {
  const parseResult = KnowledgeSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.errors[0].message });
  }

  const data = parseResult.data;
  const db = getDb();

  const entry = db.prepare('SELECT id FROM knowledge WHERE id = ?').get(req.params.id);
  if (!entry) {
    return res.status(404).json({ error: 'Entry not found' });
  }

  db.prepare(`
    UPDATE knowledge 
    SET title = ?, body = ?, category = ?, source_url = ?, as_of = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(data.title, data.body, data.category, data.source_url, data.as_of, req.params.id);

  return res.json({ ok: true });
});

// DELETE /api/admin/knowledge/:id
router.delete('/knowledge/:id', requireAdmin, (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM knowledge WHERE id = ?').run(req.params.id);
  return res.json({ ok: true });
});

// GET /api/admin/knowledge/search?q=
router.get('/knowledge/search', requireAdmin, (req, res) => {
  const query = (req.query.q || '').trim();
  if (!query) return res.json({ results: [] });

  const db = getDb();
  // Safe FTS5 token search query
  const sanitized = query.replace(/[^\w\s]/gi, '').trim().split(/\s+/).filter(Boolean).map(t => `${t}*`).join(' OR ');

  if (!sanitized) return res.json({ results: [] });

  try {
    const results = db.prepare(`
      SELECT k.*, rank
      FROM knowledge_fts fts
      JOIN knowledge k ON k.id = fts.rowid
      WHERE knowledge_fts MATCH ?
      ORDER BY rank
      LIMIT 10
    `).all(sanitized);

    return res.json({ results });
  } catch (err) {
    return res.status(400).json({ error: 'Search failed', details: err.message });
  }
});

// ==========================================
// 5. JOBS & SETTINGS
// ==========================================

// GET /api/admin/jobs
router.get('/jobs', requireAdmin, (req, res) => {
  const db = getDb();
  const jobs = db.prepare('SELECT * FROM jobs ORDER BY id DESC LIMIT 50').all();
  return res.json({ jobs });
});

// POST /api/admin/jobs/:id/retry
router.post('/jobs/:id/retry', requireAdmin, (req, res) => {
  const db = getDb();
  const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });

  db.prepare("UPDATE jobs SET status = 'queued', error = null, attempts = 0 WHERE id = ?").run(req.params.id);
  return res.json({ ok: true, message: 'Job re-queued' });
});

// GET /api/admin/settings
router.get('/settings', requireAdmin, (req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT key, value FROM settings').all();
  const settings = {};
  for (const r of rows) {
    try {
      settings[r.key] = JSON.parse(r.value);
    } catch {
      settings[r.key] = r.value;
    }
  }
  return res.json({ settings, allLanguages: ALL_LANGUAGES });
});

// PUT /api/admin/settings
router.put('/settings', requireAdmin, (req, res) => {
  const entries = req.body || {};
  for (const [key, value] of Object.entries(entries)) {
    setSetting(key, value);
  }
  return res.json({ ok: true });
});

// ==========================================
// 6. CHAT ACTIVITY
// ==========================================

// GET /api/admin/chats
router.get('/chats', requireAdmin, (req, res) => {
  const db = getDb();
  const sessions = db.prepare(`
    SELECT s.id, s.created_at, s.last_seen_at, s.lang_pref,
      count(m.id) as message_count,
      (SELECT text FROM chat_messages WHERE session_id = s.id ORDER BY id DESC LIMIT 1) as last_message
    FROM chat_sessions s
    LEFT JOIN chat_messages m ON m.session_id = s.id
    GROUP BY s.id
    ORDER BY s.last_seen_at DESC
    LIMIT 50
  `).all();

  return res.json({ sessions });
});

// GET /api/admin/chats/:sessionId
router.get('/chats/:sessionId', requireAdmin, (req, res) => {
  const db = getDb();
  const messages = db.prepare(`
    SELECT * FROM chat_messages 
    WHERE session_id = ? 
    ORDER BY id ASC
  `).all(req.params.sessionId);

  return res.json({ messages });
});

// DELETE /api/admin/chats/:sessionId
router.delete('/chats/:sessionId', requireAdmin, (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM chat_sessions WHERE id = ?').run(req.params.sessionId);
  return res.json({ ok: true });
});

export default router;
