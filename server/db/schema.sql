-- IsroPR SQLite Database Schema
-- ISRO PR & Public Awareness Platform

PRAGMA foreign_keys = ON;

-- 1. Admins table
CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Stories table
CREATE TABLE IF NOT EXISTS stories (
    id TEXT PRIMARY KEY, -- slug e.g. chandrayaan-3
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('isro', 'startup', 'legacy', 'explainer', 'upcoming-ongoing')),
    cover_path TEXT,
    published INTEGER DEFAULT 0 CHECK(published IN (0, 1)),
    pinned INTEGER DEFAULT 0 CHECK(pinned IN (0, 1)),
    facts_as_of TEXT,
    sources TEXT DEFAULT '[]', -- JSON array of URLs
    duration_hint_min INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Story Translations table
CREATE TABLE IF NOT EXISTS story_translations (
    story_id TEXT NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    lang TEXT NOT NULL,
    body TEXT NOT NULL,
    voice TEXT NOT NULL,
    reviewed INTEGER DEFAULT 0 CHECK(reviewed IN (0, 1)),
    review_note TEXT,
    audio_status TEXT DEFAULT 'none' CHECK(audio_status IN ('none', 'queued', 'generating', 'ready', 'failed')),
    audio_path TEXT,
    audio_hash TEXT,
    audio_duration_sec REAL DEFAULT 0,
    audio_error TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (story_id, lang)
);

-- 4. Knowledge Base table
CREATE TABLE IF NOT EXISTS knowledge (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    source_url TEXT NOT NULL,
    as_of TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. Full Text Search 5 for Knowledge Base
CREATE VIRTUAL TABLE IF NOT EXISTS knowledge_fts USING fts5(
    title,
    body,
    content='knowledge',
    content_rowid='id'
);

-- Triggers to keep knowledge_fts synchronized with knowledge table
CREATE TRIGGER IF NOT EXISTS knowledge_ai AFTER INSERT ON knowledge BEGIN
    INSERT INTO knowledge_fts(rowid, title, body) VALUES (new.id, new.title, new.body);
END;

CREATE TRIGGER IF NOT EXISTS knowledge_ad AFTER DELETE ON knowledge BEGIN
    INSERT INTO knowledge_fts(knowledge_fts, rowid, title, body) VALUES('delete', old.id, old.title, old.body);
END;

CREATE TRIGGER IF NOT EXISTS knowledge_au AFTER UPDATE ON knowledge BEGIN
    INSERT INTO knowledge_fts(knowledge_fts, rowid, title, body) VALUES('delete', old.id, old.title, old.body);
    INSERT INTO knowledge_fts(rowid, title, body) VALUES (new.id, new.title, new.body);
END;

-- 6. Chat Sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
    id TEXT PRIMARY KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_seen_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    lang_pref TEXT DEFAULT 'en-IN'
);

-- 7. Chat Messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
    input_type TEXT DEFAULT 'text' CHECK(input_type IN ('text', 'voice')),
    lang TEXT NOT NULL,
    text TEXT NOT NULL,
    audio_path TEXT,
    audio_hash TEXT,
    sources TEXT, -- JSON array of source objects
    status TEXT DEFAULT 'ok' CHECK(status IN ('ok', 'error', 'refused')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 8. Audio and Background Jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL CHECK(type IN ('tts_story', 'tts_chat')),
    payload TEXT NOT NULL, -- JSON
    status TEXT DEFAULT 'queued' CHECK(status IN ('queued', 'running', 'done', 'failed')),
    attempts INTEGER DEFAULT 0,
    error TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    finished_at DATETIME
);

-- 9. System Settings table
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL -- JSON
);

-- 10. Admin Audit Log table
CREATE TABLE IF NOT EXISTS admin_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_email TEXT,
    action TEXT NOT NULL,
    target TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_stories_published ON stories(published);
CREATE INDEX IF NOT EXISTS idx_stories_category ON stories(category);
CREATE INDEX IF NOT EXISTS idx_story_translations_status ON story_translations(audio_status);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_last_seen ON chat_sessions(last_seen_at);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
