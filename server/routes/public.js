import express from 'express';
import { getDb, getSetting } from '../db/db.js';
import { ALL_LANGUAGES, CATEGORIES } from '../config.js';
import { publicLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

// GET /api/languages
router.get('/languages', publicLimiter, (req, res) => {
  const enabledCodes = getSetting('enabled_languages', ['en-IN', 'hi-IN', 'ta-IN', 'te-IN', 'bn-IN']);
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
           s.facts_as_of, s.sources, s.duration_hint_min, s.created_at,
           t.audio_status, t.audio_path, t.audio_duration_sec,
           (CASE WHEN t.body IS NOT NULL AND length(t.body) > 0 THEN 1 ELSE 0 END) as has_translation,
           (CASE WHEN t.audio_status = 'ready' AND t.audio_path IS NOT NULL THEN 1 ELSE 0 END) as audio_ready
    FROM stories s
    LEFT JOIN story_translations t ON t.story_id = s.id AND t.lang = ?
    WHERE s.published = 1
  `;
  const params = [lang];

  if (category && category !== 'all') {
    sql += ` AND s.category = ?`;
    params.push(category);
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

export default router;
