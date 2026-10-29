import Database from 'better-sqlite3';
const db = new Database('data/spacebharat.db');
db.pragma('foreign_keys = OFF');
db.exec(`
  CREATE TABLE stories_new (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('isro', 'startup', 'legacy', 'explainer', 'upcoming-ongoing')),
    cover_path TEXT,
    published INTEGER DEFAULT 0 CHECK(published IN (0, 1)),
    pinned INTEGER DEFAULT 0 CHECK(pinned IN (0, 1)),
    facts_as_of TEXT,
    sources TEXT DEFAULT '[]',
    duration_hint_min INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  INSERT INTO stories_new SELECT * FROM stories;
  DROP TABLE stories;
  ALTER TABLE stories_new RENAME TO stories;
`);
db.pragma('foreign_keys = ON');
console.log('Stories table updated with upcoming-ongoing category check!');
