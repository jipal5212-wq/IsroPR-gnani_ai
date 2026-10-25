import { getDb } from '../db/db.js';

const STOP_WORDS = new Set([
  // English
  'what', 'when', 'where', 'which', 'who', 'whom', 'whose', 'why', 'how',
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
  'do', 'does', 'did', 'the', 'a', 'an', 'and', 'or', 'but', 'if', 'because',
  'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against',
  'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
  'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under',
  'again', 'further', 'then', 'once', 'here', 'there', 'all', 'any', 'both',
  'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not',
  'only', 'own', 'same', 'so', 'than', 'too', 'very', 'can', 'will', 'just',
  'should', 'now', 'tell', 'me', 'details', 'status', 'please', 'give', 'know',
  // Hindi (Devanagari)
  'की', 'का', 'के', 'को', 'में', 'पर', 'से', 'ने', 'है', 'हैं', 'था', 'थी', 'थे',
  'कब', 'कहाँ', 'कहा', 'कैसे', 'क्या', 'क्यों', 'और', 'या', 'तो', 'भी', 'ही',
  'हुई', 'हुआ', 'हुए', 'कर', 'रहा', 'रही', 'रहे', 'बारे', 'बताओ', 'बताइए',
  'इस', 'उस', 'यह', 'वह', 'मुझे', 'अपनी', 'अपने', 'अपना', 'कितना', 'कितने', 'कितनी',
  'कौन', 'कौनसा', 'कौनसी', 'होगा', 'होगी', 'होंगे', 'सकते', 'सकता', 'सकती', 'बता',
  // Hinglish
  'kya', 'kab', 'kaise', 'kaha', 'kahan', 'kyun', 'kyon', 'kisne', 'kisko', 'batao',
  'bataiye', 'hai', 'hain', 'tha', 'thi', 'the', 'hoga', 'hogi', 'honge', 'hua',
  'hui', 'hue', 'raha', 'rahi', 'rahe', 'karo', 'kare', 'karna', 'kitna', 'kitne',
  'kitni', 'aur', 'par', 'se', 'me', 'mein', 'ko', 'ka', 'ki', 'ke', 'ye', 'yeh',
  'wo', 'woh', 'apna', 'apni', 'apne', 'tum', 'aap', 'hum', 'kuch', 'koi',
  // Kannada
  'ಮತ್ತು', 'ಇದು', 'ಈ', 'ಆ', 'ಅಲ್ಲಿ', 'ಇಲ್ಲಿ', 'ಯಾವಾಗ', 'ಹೇಗೆ', 'ಏನು', 'ಯಾರು', 'ಎಲ್ಲಿ',
  'ಬಗ್ಗೆ', 'ಹೇಳಿ', 'ಮಾಡಿ', 'ಆಗಿದೆ', 'ಆಯಿತು', 'ಇದೆ', 'ಇದ್ದಾರೆ', 'ಎಂದು',
  // Tamil
  'மற்றும்', 'இது', 'இந்த', 'அந்த', 'எப்போது', 'எப்படி', 'என்ன', 'எங்கு', 'யார்', 'பற்றி',
  'சொல்லுங்கள்', 'சொல்லுங்க', 'சொல்ல', 'செய்தது', 'உள்ளது', 'இருந்தது', 'ஆகிய',
  // Telugu
  'మరియు', 'ఇది', 'ఈ', 'ఆ', 'ఎప్పుడు', 'ఎలా', 'ఏమి', 'ఎక్కడ', 'ఎవరు', 'గురించి',
  'చెప్పండి', 'చేసింది', 'ఉంది', 'అయింది', 'అయినది', 'ఉన్నాయి',
  // Bengali
  'এবং', 'এটি', 'এই', 'সেই', 'কবে', 'কিভাবে', 'কী', 'কোথায়', 'কে', 'সম্পর্কে',
  'বলুন', 'বলো', 'করেছিল', 'হয়েছে', 'আছে', 'ছিল'
]);

const MISSION_EXPANSIONS = {
  // Kannada
  'ಚಂದ್ರಯಾನ': ['Chandrayaan', 'Vikram', 'Pragyan', 'Lunar', 'South Pole'],
  'ಪ್ರಜ್ಞಾನ್': ['Pragyan', 'rover', 'Chandrayaan-3'],
  'ವಿಕ್ರಮ್': ['Vikram', 'lander', 'Chandrayaan-3'],
  'ಲ್ಯಾಂಡಿಂಗ್': ['landing', 'touchdown', 'August 23'],
  'ಇಳಿಯಿತು': ['landing', 'touchdown', 'August 23'],
  'ಗಗನ್‌ಯಾನ್': ['Gaganyaan', 'crew', 'astronaut', 'human spaceflight'],
  'ಗಗನ್ಯಾನ್': ['Gaganyaan', 'crew', 'astronaut', 'human spaceflight'],
  'ವ್ಯೋಮಮಿತ್ರ': ['Vyommitra', 'robot', 'Gaganyaan'],
  'ಎಲ್‌ವಿಎಂ': ['LVM3', 'Launch Vehicle Mark-3', 'Bahubali'],
  'ಎಲ್‌ವಿಎಂ3': ['LVM3', 'Launch Vehicle Mark-3', 'Bahubali'],
  'ಆದಿತ್ಯ': ['Aditya', 'Aditya-L1', 'Lagrange', 'Halo orbit', 'Sun'],
  'ಅಗ್ನಿಕುಲ್': ['Agnikul', 'Agnibaan', 'Agnilet', 'Dhanush'],
  'ಅಗ್ನಿಬಾಣ': ['Agnibaan', 'Agnikul', 'Dhanush'],
  'ಸ್ಕೈರೂಟ್': ['Skyroot', 'Vikram-S'],
  'ಉಡಾವಣೆ': ['launch', 'timeline'],
  'ಉಪಗ್ರಹ': ['satellite', 'payload'],
  'ರಾಕೆಟ್': ['rocket', 'launch vehicle'],

  // Tamil
  'சந்திரயான்': ['Chandrayaan', 'Vikram', 'Pragyan', 'Lunar', 'South Pole'],
  'விக்ரம்': ['Vikram', 'lander', 'Chandrayaan-3'],
  'பிரக்யான்': ['Pragyan', 'rover', 'Chandrayaan-3'],
  'தரையிறங்கியது': ['landing', 'touchdown', 'August 23'],
  'தரையிறக்கம்': ['landing', 'touchdown', 'August 23'],
  'ககன்யான்': ['Gaganyaan', 'crew', 'astronaut', 'human spaceflight'],
  'வியோமித்ரா': ['Vyommitra', 'robot', 'Gaganyaan'],
  'எல்விஎம்': ['LVM3', 'Launch Vehicle Mark-3', 'Bahubali'],
  'ஆதித்யா': ['Aditya', 'Aditya-L1', 'Lagrange', 'Sun'],
  'அக்னிகுல்': ['Agnikul', 'Agnibaan', 'Agnilet', 'Dhanush'],
  'அக்னிபான்': ['Agnibaan', 'Agnikul', 'Dhanush'],
  'ராக்கெட்': ['rocket', 'launch vehicle'],

  // Telugu
  'చంద్రయాన్': ['Chandrayaan', 'Vikram', 'Pragyan', 'Lunar', 'South Pole'],
  'విక్రమ్': ['Vikram', 'lander', 'Chandrayaan-3'],
  'ప్రగ్యాన్': ['Pragyan', 'rover', 'Chandrayaan-3'],
  'ల్యాండ్': ['landing', 'touchdown', 'August 23'],
  'ల్యాండింగ్': ['landing', 'touchdown', 'August 23'],
  'గగన్‌యాన్': ['Gaganyaan', 'crew', 'astronaut', 'human spaceflight'],
  'వ్యోమమిత్ర': ['Vyommitra', 'robot', 'Gaganyaan'],
  'ఎల్‌విఎమ్': ['LVM3', 'Launch Vehicle Mark-3', 'Bahubali'],
  'ఆదిత్య': ['Aditya', 'Aditya-L1', 'Lagrange', 'Sun'],
  'అగ్నికుల్': ['Agnikul', 'Agnibaan', 'Agnilet', 'Dhanush'],
  'అగ్నిబాణ్': ['Agnibaan', 'Agnikul', 'Dhanush'],
  'రాకెట్': ['rocket', 'launch vehicle'],

  // Bengali
  'চন্দ্রযান': ['Chandrayaan', 'Vikram', 'Pragyan', 'Lunar', 'South Pole'],
  'বিক্রম': ['Vikram', 'lander', 'Chandrayaan-3'],
  'প্রজ্ঞান': ['Pragyan', 'rover', 'Chandrayaan-3'],
  'ল্যান্ডিং': ['landing', 'touchdown', 'August 23'],
  'গগনযান': ['Gaganyaan', 'crew', 'astronaut', 'human spaceflight'],
  'ব্যোমমিত্র': ['Vyommitra', 'robot', 'Gaganyaan'],
  'এলভিএম': ['LVM3', 'Launch Vehicle Mark-3', 'Bahubali'],
  'আদিত্য': ['Aditya', 'Aditya-L1', 'Lagrange', 'Sun'],
  'অগ্নিকুল': ['Agnikul', 'Agnibaan', 'Agnilet', 'Dhanush'],
  'অগ্নিবাণ': ['Agnibaan', 'Agnikul', 'Dhanush'],
  'রকেট': ['rocket', 'launch vehicle'],
  'चंद्रयान': ['Chandrayaan', 'Vikram', 'Pragyan', 'Lunar', 'South Pole'],
  'chandrayaan': ['Chandrayaan', 'Vikram', 'Pragyan', 'Lunar', 'South Pole'],
  'प्रज्ञान': ['Pragyan', 'rover', 'Chandrayaan-3', 'LIBS'],
  'pragyan': ['Pragyan', 'rover', 'Chandrayaan-3'],
  'विक्रम': ['Vikram', 'lander', 'Chandrayaan-3'],
  'vikram': ['Vikram', 'lander', 'Chandrayaan-3'],
  'लैंडिंग': ['landing', 'touchdown', 'soft-land', 'August 23'],
  'landing': ['touchdown', 'Chandrayaan-3', 'August 23'],
  'चांद': ['Moon', 'Lunar', 'Chandrayaan'],
  'moon': ['Moon', 'Lunar', 'Chandrayaan-3'],

  // Gaganyaan & Human Spaceflight
  'गगनयान': ['Gaganyaan', 'crew', 'astronaut', 'human spaceflight', 'HLVM3', 'Vyommitra'],
  'gaganyaan': ['Gaganyaan', 'crew', 'astronaut', 'human spaceflight', 'HLVM3', 'Vyommitra'],
  'व्योममित्र': ['Vyommitra', 'humanoid', 'robot', 'Gaganyaan'],
  'vyommitra': ['Vyommitra', 'humanoid', 'robot', 'Gaganyaan'],
  'अंतरिक्षयात्री': ['astronaut', 'Gaganyaan', 'Prashanth Nair'],
  'astronaut': ['Gaganyaan', 'Prashanth Nair', 'crew'],

  // Launch Vehicles
  'एलवीएम': ['LVM3', 'Launch Vehicle Mark-3', 'Bahubali', 'payload', 'CE-20'],
  'एलवीएम3': ['LVM3', 'Launch Vehicle Mark-3', 'Bahubali', 'payload', 'CE-20'],
  'lvm': ['LVM3', 'Launch Vehicle Mark-3', 'Bahubali'],
  'lvm3': ['LVM3', 'Launch Vehicle Mark-3', 'Bahubali', 'payload', 'capacity', 'GTO'],
  'बाहुबली': ['Bahubali', 'LVM3'],
  'bahubali': ['Bahubali', 'LVM3'],
  'पीएसएलवी': ['PSLV', 'Polar Satellite Launch Vehicle', 'workhorse'],
  'pslv': ['PSLV', 'Polar Satellite Launch Vehicle', 'workhorse'],
  'एसएसएलवी': ['SSLV', 'Small Satellite Launch Vehicle'],
  'sslv': ['SSLV', 'Small Satellite Launch Vehicle'],
  'रॉकेट': ['rocket', 'launch vehicle', 'LVM3', 'PSLV', 'Agnibaan'],
  'rocket': ['rocket', 'launch vehicle', 'LVM3', 'PSLV', 'Agnibaan'],
  'लॉन्च': ['launch', 'timeline', 'schedule'],
  'launch': ['launch', 'timeline', 'schedule'],
  'क्षमता': ['capacity', 'payload', 'GTO', 'LEO', 'tonnes'],
  'वजन': ['mass', 'weight', 'tonnes', 'kg', 'payload'],

  // Aditya & Sun
  'आदित्य': ['Aditya', 'Aditya-L1', 'Lagrange', 'Halo orbit', 'Sun', 'Solar'],
  'aditya': ['Aditya', 'Aditya-L1', 'Lagrange', 'Halo orbit', 'Sun', 'Solar'],
  'सूर्य': ['Sun', 'Solar', 'Aditya-L1'],
  'sun': ['Sun', 'Solar', 'Aditya-L1'],

  // Navigation
  'एनवीएस': ['NVS-01', 'NavIC', 'atomic clock', 'Rubidium', 'L1'],
  'nvs': ['NVS-01', 'NavIC', 'atomic clock', 'Rubidium', 'L1'],
  'नाविक': ['NavIC', 'NVS-01', 'constellation', 'navigation'],
  'navic': ['NavIC', 'NVS-01', 'constellation', 'navigation'],

  // Startups
  'अग्निकुल': ['Agnikul', 'Agnibaan', 'Agnilet', '3D', 'printed', 'Dhanush'],
  'agnikul': ['Agnikul', 'Agnibaan', 'Agnilet', '3D', 'printed', 'Dhanush'],
  'अग्निबाण': ['Agnibaan', 'Agnikul', 'Dhanush', 'May 30 2024'],
  'agnibaan': ['Agnibaan', 'Agnikul', 'Dhanush', 'May 30 2024'],
  'स्काईरूट': ['Skyroot', 'Vikram-S', 'Prarambh', 'Vikram-1'],
  'skyroot': ['Skyroot', 'Vikram-S', 'Prarambh', 'Vikram-1'],
  'पिक्सेल': ['Pixxel', 'hyperspectral', 'satellite', 'Anand', 'Shakuntala'],
  'pixxel': ['Pixxel', 'hyperspectral', 'satellite'],

  // Space Station & Sample Return
  'स्टेशन': ['Bharatiya Antariksh Station', 'BAS', 'space station', '2028', '2035'],
  'station': ['Bharatiya Antariksh Station', 'BAS', 'space station', '2028', '2035'],
  'बास': ['Bharatiya Antariksh Station', 'BAS'],
  'bas': ['Bharatiya Antariksh Station', 'BAS'],

  // Leaders
  'सोमनाथ': ['Somanath', 'ISRO Chairman', 'Chief'],
  'somanath': ['Somanath', 'ISRO Chairman', 'Chief'],
  'somnath': ['Somanath', 'ISRO Chairman', 'Chief'],
  'चेयरमैन': ['Chairman', 'Somanath', 'ISRO'],
  'chairman': ['Chairman', 'Somanath', 'ISRO'],

  // Mars & Others
  'मंगलयान': ['Mangalyaan', 'Mars Orbiter Mission', 'MOM'],
  'mangalyaan': ['Mangalyaan', 'Mars Orbiter Mission', 'MOM']
};

export function retrieveContext(query, limit = 4, lang = 'en-IN') {
  if (!query || typeof query !== 'string') {
    return { knowledge: [], stories: [] };
  }

  const db = getDb();
  // Extract alphanumeric tokens preserving Unicode letters (\p{L}), Indic vowels/marks (\p{M}), and numbers (\p{N})
  const rawTokens = query.replace(/[^\p{L}\p{M}\p{N}\s]/gu, ' ').trim().split(/\s+/).filter(t => t.length > 1);

  // Filter stop words for higher precision
  let contentTokens = rawTokens.filter(t => !STOP_WORDS.has(t.toLowerCase()));
  if (contentTokens.length === 0) {
    contentTokens = rawTokens;
  }

  // Expand with transliterated / synonymous domain keywords
  const expanded = [];
  for (const t of contentTokens) {
    const lower = t.toLowerCase();
    if (MISSION_EXPANSIONS[lower]) {
      expanded.push(...MISSION_EXPANSIONS[lower]);
    }
  }

  const allSearchTokens = Array.from(new Set([...contentTokens, ...expanded]));
  if (allSearchTokens.length === 0) {
    return { knowledge: [], stories: [] };
  }

  // 1. Search knowledge base using SQLite FTS5 BM25 ranking
  const ftsQuery = allSearchTokens.map(t => `"${t}"*`).join(' OR ');

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
    // Fallback to LIKE if FTS expression has syntax quirk
    const primaryToken = contentTokens[0] || allSearchTokens[0];
    knowledgeEntries = db.prepare(`
      SELECT id, title, body, category, source_url, as_of
      FROM knowledge
      WHERE title LIKE ? OR body LIKE ?
      LIMIT ?
    `).all(`%${primaryToken}%`, `%${primaryToken}%`, limit);
  }

  // 2. Query stories table for relevant mission context
  const searchKeywords = allSearchTokens.slice(0, 5);
  let storyMatches = [];

  for (const kw of searchKeywords) {
    const matches = db.prepare(`
      SELECT s.id, s.title, s.summary, s.category, s.facts_as_of, s.sources, st.body as trans_body
      FROM stories s
      LEFT JOIN story_translations st ON st.story_id = s.id AND st.lang = ?
      WHERE s.published = 1 AND (s.title LIKE ? OR s.summary LIKE ? OR s.id LIKE ? OR (st.body IS NOT NULL AND st.body LIKE ?))
      LIMIT 2
    `).all(lang, `%${kw}%`, `%${kw}%`, `%${kw.toLowerCase()}%`, `%${kw}%`);

    if (matches.length > 0) {
      storyMatches = matches;
      break;
    }
  }

  return {
    knowledge: knowledgeEntries,
    stories: storyMatches.map(s => ({
      id: s.id,
      title: s.title,
      summary: s.summary,
      trans_body: s.trans_body || null,
      category: s.category,
      facts_as_of: s.facts_as_of,
      sources: JSON.parse(s.sources || '[]')
    }))
  };
}

