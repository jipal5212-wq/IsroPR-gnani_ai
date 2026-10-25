import express from 'express';
import crypto from 'node:crypto';
import { getDb, getSetting } from '../db/db.js';
import { chatTextLimiter, chatVoiceLimiter } from '../middleware/rateLimit.js';
import { uploadChatAudio } from '../middleware/upload.js';
import { handleChatTurn } from '../services/chat.js';

const router = express.Router();
export const CHAT_COOKIE_NAME = 'space_chat_session';

// Helper to get or create anonymous chat session
function getOrCreateSession(req, res) {
  let sessionId = req.cookies?.[CHAT_COOKIE_NAME];
  const db = getDb();

  if (sessionId) {
    const existing = db.prepare('SELECT id, lang_pref FROM chat_sessions WHERE id = ?').get(sessionId);
    if (existing) {
      db.prepare('UPDATE chat_sessions SET last_seen_at = CURRENT_TIMESTAMP WHERE id = ?').run(sessionId);
      return existing;
    }
  }

  // Create new session
  sessionId = 'sess_' + crypto.randomBytes(16).toString('hex');
  const langPref = req.body?.lang || 'en-IN';
  db.prepare('INSERT INTO chat_sessions (id, lang_pref) VALUES (?, ?)').run(sessionId, langPref);

  res.cookie(CHAT_COOKIE_NAME, sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  });

  return { id: sessionId, lang_pref: langPref };
}

// POST /api/chat/session
router.post('/session', (req, res) => {
  const session = getOrCreateSession(req, res);
  return res.json({ ok: true, sessionId: session.id, langPref: session.lang_pref });
});

// GET /api/chat/history
router.get('/history', (req, res) => {
  const sessionId = req.cookies?.[CHAT_COOKIE_NAME];
  if (!sessionId) {
    return res.json({ messages: [] });
  }

  const db = getDb();
  const messages = db.prepare(`
    SELECT id, role, input_type, lang, text, audio_path, sources, status, created_at
    FROM chat_messages 
    WHERE session_id = ? 
    ORDER BY id ASC
  `).all(sessionId);

  const formatted = messages.map(m => ({
    ...m,
    sources: m.sources ? JSON.parse(m.sources) : null
  }));

  return res.json({ messages: formatted });
});

// POST /api/chat/text
router.post('/text', chatTextLimiter, async (req, res) => {
  const session = getOrCreateSession(req, res);
  const text = (req.body?.message || '').trim();
  const lang = req.body?.lang || session.lang_pref || 'en-IN';

  if (!text) {
    return res.status(400).json({ error: 'Message cannot be empty' });
  }

  if (text.length > 500) {
    return res.status(400).json({ error: 'Message exceeds 500 character limit' });
  }

  try {
    const reply = await handleChatTurn({
      sessionId: session.id,
      inputType: 'text',
      userText: text,
      lang
    });

    return res.json(reply);
  } catch (err) {
    console.error('Chat error:', err);
    return res.status(500).json({ error: 'Failed to process chat response' });
  }
});

// POST /api/chat/voice
router.post('/voice', chatVoiceLimiter, uploadChatAudio.single('audio'), async (req, res) => {
  const session = getOrCreateSession(req, res);
  const file = req.file;
  const lang = req.body?.lang || session.lang_pref || 'en-IN';

  if (!file) {
    return res.status(400).json({ error: 'No audio file uploaded' });
  }

  try {
    const reply = await handleChatTurn({
      sessionId: session.id,
      inputType: 'voice',
      audioFilePath: file.path,
      audioMime: file.mimetype,
      lang
    });

    return res.json(reply);
  } catch (err) {
    console.error('Voice chat error:', err);
    return res.status(500).json({ error: 'Failed to process voice response' });
  }
});

export default router;
