import { getDb } from '../db/db.js';

const MISSION_EXPANSIONS = {
  'चंद्रयान': ['Chandrayaan'],
  'chandrayaan': ['Chandrayaan'],
  'गगनयान': ['Gaganyaan'],
  'gaganyaan': ['Gaganyaan'],
  'आदित्य': ['Aditya'],
  'aditya': ['Aditya'],
  'इसरो': ['ISRO'],
  'isro': ['ISRO'],
  'प्रज्ञान': ['Pragyan'],
  'pragyan': ['Pragyan'],
  'विक्रम': ['Vikram'],
  'vikram': ['Vikram'],
  'अग्निकुल': ['Agnikul'],
  'agnikul': ['Agnikul'],
  'अग्निबाण': ['Agnibaan'],
  'agnibaan': ['Agnibaan'],
  'स्काईरूट': ['Skyroot'],
  'skyroot': ['Skyroot'],
  'पिक्सेल': ['Pixxel'],
  'pixxel': ['Pixxel'],
  'लैंडिंग': ['landing', 'touchdown'],
  'landing': ['touchdown'],
  'लॉन्च': ['launch', 'LVM3'],
  'रॉकेट': ['rocket', 'LVM3'],
  'rocket': ['LVM3', 'Agnibaan']
};

export function retrieveContext(query, limit = 4) {
  if (!query || typeof query !== 'string') {
    return { knowledge: [], stories: [] };
  }

  const db = getDb();
  // Extract alphanumeric tokens preserving Unicode letters (\p{L}), Indic vowels/marks (\p{M}), and numbers (\p{N})
  let tokens = query.replace(/[^\p{L}\p{M}\p{N}\s]/gu, ' ').trim().split(/\s+/).filter(t => t.length > 1);

  // Expand with transliterated / synonymous keywords
  const expanded = [];
  for (const t of tokens) {
    const lower = t.toLowerCase();
    if (MISSION_EXPANSIONS[lower]) {
      expanded.push(...MISSION_EXPANSIONS[lower]);
    }
  }
  tokens = Array.from(new Set([...tokens, ...expanded]));

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
