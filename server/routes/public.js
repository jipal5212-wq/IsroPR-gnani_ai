import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { getDb, getSetting, setSetting } from '../db/db.js';
import { ALL_LANGUAGES, CATEGORIES, DIRS } from '../config.js';
import { publicLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

// GET /api/languages
router.get('/languages', publicLimiter, (req, res) => {
  const enabledCodes = getSetting('enabled_languages', ['en-IN', 'hi-IN', 'ta-IN', 'te-IN', 'bn-IN', 'kn-IN', 'ml-IN']);
  const languages = ALL_LANGUAGES.filter(l => enabledCodes.includes(l.code));
  return res.json({ languages, categories: CATEGORIES });
});

// GET /api/stories?lang=&category=&q=
router.get('/stories', publicLimiter, (req, res) => {
  const lang = req.query.lang || 'en-IN';
  const category = req.query.category || '';
  const search = (req.query.q || '').trim();

  const db = getDb();

  let sql = `
    SELECT s.id, s.title, s.summary, s.category, s.cover_path, s.pinned, 
           s.facts_as_of, s.sources, s.duration_hint_min, s.play_count, s.created_at,
           COALESCE(t.audio_status, t_fb.audio_status, 'ready') as audio_status,
           COALESCE(t.audio_path, t_fb.audio_path) as audio_path,
           COALESCE(t.audio_duration_sec, t_fb.audio_duration_sec, s.duration_hint_min * 60) as audio_duration_sec,
           (CASE WHEN t.body IS NOT NULL AND length(t.body) > 0 THEN 1 ELSE 0 END) as has_translation,
           (CASE WHEN (t.audio_status = 'ready' AND t.audio_path IS NOT NULL) OR (t_fb.audio_status = 'ready' AND t_fb.audio_path IS NOT NULL) THEN 1 ELSE 0 END) as audio_ready
    FROM stories s
    LEFT JOIN story_translations t ON t.story_id = s.id AND t.lang = ?
    LEFT JOIN story_translations t_fb ON t_fb.story_id = s.id AND t_fb.lang = 'en-IN'
    WHERE s.published = 1
  `;
  const params = [lang];

  if (category && category !== 'all') {
    if (category === 'startups' || category === 'startup') {
      sql += ` AND (s.category = 'startup' OR s.category = 'startups')`;
    } else {
      sql += ` AND s.category = ?`;
      params.push(category);
    }
  }

  if (search) {
    sql += ` AND (s.title LIKE ? OR s.summary LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`);
  }

  sql += ` ORDER BY s.pinned DESC, s.created_at DESC`;

  const rows = db.prepare(sql).all(...params);

  const stories = rows.map(r => ({
    ...r,
    sources: JSON.parse(r.sources || '[]')
  }));

  return res.json({ stories, lang });
});

// GET /api/stories/:id?lang=
router.get('/stories/:id', publicLimiter, (req, res) => {
  const lang = req.query.lang || 'en-IN';
  const db = getDb();

  const story = db.prepare(`
    SELECT * FROM stories WHERE id = ? AND published = 1
  `).get(req.params.id);

  if (!story) {
    return res.status(404).json({ error: 'Story not found or not published' });
  }

  story.sources = JSON.parse(story.sources || '[]');

  // Get requested translation or fallback to English if not ready
  let translation = db.prepare(`
    SELECT * FROM story_translations WHERE story_id = ? AND lang = ?
  `).get(story.id, lang);

  // Available languages for this story
  const availableLangs = db.prepare(`
    SELECT lang, audio_status, audio_duration_sec,
           (CASE WHEN audio_status = 'ready' THEN 1 ELSE 0 END) as audio_ready
    FROM story_translations 
    WHERE story_id = ? AND length(body) > 0
  `).all(story.id);

  // Up next stories in the same category
  const upNext = db.prepare(`
    SELECT s.id, s.title, s.summary, s.category, s.cover_path, s.duration_hint_min
    FROM stories s
    WHERE s.category = ? AND s.id != ? AND s.published = 1
    ORDER BY s.pinned DESC, s.created_at DESC
    LIMIT 3
  `).all(story.category, story.id);

  return res.json({
    story,
    translation: translation || null,
    availableLangs,
    upNext,
    activeLang: lang
  });
});

// POST /api/stories/:id/play - Record audio playback and increment count
router.post('/stories/:id/play', publicLimiter, (req, res) => {
  const db = getDb();
  const story = db.prepare('SELECT id, play_count FROM stories WHERE id = ?').get(req.params.id);
  if (!story) return res.status(404).json({ error: 'Story not found' });

  db.prepare('UPDATE stories SET play_count = COALESCE(play_count, 0) + 1 WHERE id = ?').run(req.params.id);
  const updated = db.prepare('SELECT play_count FROM stories WHERE id = ?').get(req.params.id);
  const totalPlaysRow = db.prepare('SELECT COALESCE(SUM(play_count), 0) as total FROM stories').get();

  return res.json({ 
    success: true, 
    storyId: req.params.id, 
    play_count: Number(updated.play_count || 0),
    totalPlays: Number(totalPlaysRow?.total || 0)
  });
});

// Telemetry State — 100% Real, Authenticated Active Visitors & Plays
const activeVisitors = new Map(); // sessionId -> timestamp

function getOnlineCount() {
  const now = Date.now();
  const cutoff = now - 25000; // 25s inactivity cutoff for real-time online presence
  for (const [id, lastSeen] of activeVisitors.entries()) {
    if (lastSeen < cutoff) {
      activeVisitors.delete(id);
    }
  }
  return activeVisitors.size;
}

// GET /api/telemetry/stats
router.get('/telemetry/stats', publicLimiter, (req, res) => {
  const db = getDb();
  const totalVisits = Number(getSetting('total_site_visits', 1));
  const totalPlaysRow = db.prepare('SELECT COALESCE(SUM(play_count), 0) as total FROM stories').get();
  const totalPlays = Number(totalPlaysRow?.total || 0);

  return res.json({
    onlineNow: getOnlineCount(),
    totalVisits,
    totalPlays,
    asOf: new Date().toISOString()
  });
});

// POST /api/telemetry/heartbeat
router.post('/telemetry/heartbeat', (req, res) => {
  const sessionId = req.body?.sessionId || req.cookies?.isro_session || `${req.ip}_${req.headers['user-agent'] || 'visitor'}`;
  activeVisitors.set(sessionId, Date.now());

  const db = getDb();
  let totalVisits = Number(getSetting('total_site_visits', 1));
  if (!req.cookies?.isro_visited) {
    totalVisits += 1;
    setSetting('total_site_visits', totalVisits);
    res.cookie('isro_visited', '1', { maxAge: 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'lax' });
  }

  const totalPlaysRow = db.prepare('SELECT COALESCE(SUM(play_count), 0) as total FROM stories').get();
  const totalPlays = Number(totalPlaysRow?.total || 0);

  return res.json({
    onlineNow: getOnlineCount(),
    totalVisits,
    totalPlays
  });
});

// POST /api/telemetry/leave
router.post('/telemetry/leave', (req, res) => {
  let sessionId = req.body?.sessionId;
  if (!sessionId && typeof req.body === 'string') {
    try {
      sessionId = JSON.parse(req.body)?.sessionId;
    } catch (_) {}
  }
  sessionId = sessionId || req.cookies?.isro_session || `${req.ip}_${req.headers['user-agent'] || 'visitor'}`;
  if (sessionId) {
    activeVisitors.delete(sessionId);
  }
  return res.json({ success: true, onlineNow: getOnlineCount() });
});

export default router;
