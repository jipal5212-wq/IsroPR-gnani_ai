import { getDb } from '../db/db.js';

export function retrieveContext(query, limit = 4) {
  if (!query || typeof query !== 'string') {
    return { knowledge: [], stories: [] };
  }

  const db = getDb();
  // Extract alphanumeric tokens for safe FTS5 query
  const tokens = query.replace(/[^\p{L}\p{N}\s]/gu, ' ').trim().split(/\s+/).filter(t => t.length > 1);

  if (tokens.length === 0) {
    return { knowledge: [], stories: [] };
  }

  const ftsQuery = tokens.map(t => `"${t}"*`).join(' OR ');

  let knowledgeEntries = [];
  try {
    knowledgeEntries = db.prepare(`
      SELECT k.id, k.title, k.body, k.category, k.source_url, k.as_of, rank
      FROM knowledge_fts fts
      JOIN knowledge k ON k.id = fts.rowid
      WHERE knowledge_fts MATCH ?
      ORDER BY rank
      LIMIT ?
    `).all(ftsQuery, limit);
  } catch (err) {
    // Fallback to LIKE if FTS fails
    knowledgeEntries = db.prepare(`
      SELECT id, title, body, category, source_url, as_of
      FROM knowledge
      WHERE title LIKE ? OR body LIKE ?
      LIMIT ?
    `).all(`%${tokens[0]}%`, `%${tokens[0]}%`, limit);
  }

  // Also query stories table for relevant mission context
  const storyMatches = db.prepare(`
    SELECT id, title, summary, category, facts_as_of, sources
    FROM stories
    WHERE published = 1 AND (title LIKE ? OR summary LIKE ?)
    LIMIT 2
  `).all(`%${tokens[0]}%`, `%${tokens[0]}%`);

  return {
    knowledge: knowledgeEntries,
    stories: storyMatches.map(s => ({
      ...s,
      sources: JSON.parse(s.sources || '[]')
    }))
  };
}
