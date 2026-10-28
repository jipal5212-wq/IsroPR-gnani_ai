import { URLSearchParams } from 'node:url';
import { ENV } from '../config.js';

// In-memory TTL cache for search queries (1 hour TTL)
const searchCache = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// Space mission domain terms mapping for English search optimization
const TERM_TRANSLATIONS = {
  // Kannada
  'ಚಂದ್ರಯಾನ': 'Chandrayaan',
  'ಪ್ರಜ್ಞಾನ್': 'Pragyan',
  'ವಿಕ್ರಮ್': 'Vikram',
  'ಲ್ಯಾಂಡಿಂಗ್': 'landing',
  'ಗಗನ್‌ಯಾನ್': 'Gaganyaan',
  'ಗಗನ್ಯಾನ್': 'Gaganyaan',
  'ವ್ಯೋಮಮಿತ್ರ': 'Vyommitra',
  'ಎಲ್‌ವಿಎಂ': 'LVM3',
  'ಎಲ್‌ವಿಎಂ3': 'LVM3',
  'ಆದಿತ್ಯ': 'Aditya-L1',
  'ಅಗ್ನಿಕುಲ್': 'Agnikul Cosmos',
  'ಅಗ್ನಿಬಾಣ': 'Agnibaan',
  'ಸ್ಕೈರೂಟ್': 'Skyroot Aerospace',
  'ಉಡಾವಣೆ': 'launch',
  'ಉಪಗ್ರಹ': 'satellite',
  'ರಾಕೆಟ್': 'rocket',

  // Tamil
  'சந்திரயான்': 'Chandrayaan',
  'விக்ரம்': 'Vikram',
  'பிரக்யான்': 'Pragyan',
  'தரையிறங்கியது': 'landing',
  'ககன்யான்': 'Gaganyaan',
  'வியோமித்ரா': 'Vyommitra',
  'எல்விஎம்': 'LVM3',
  'ஆதித்யா': 'Aditya-L1',
  'அக்னிகுல்': 'Agnikul Cosmos',
  'அக்னிபான்': 'Agnibaan',
  'ராக்கெட்': 'rocket',

  // Telugu
  'చంద్రయాన్': 'Chandrayaan',
  'విక్రమ్': 'Vikram',
  'ప్రగ్యాన్': 'Pragyan',
  'ల్యాండ్': 'landing',
  'గగన్‌యాన్': 'Gaganyaan',
  'వ్యోమమిత్ర': 'Vyommitra',
  'ఎల్‌విఎమ్': 'LVM3',
  'ఆదిత్య': 'Aditya-L1',
  'అగ్నికుల్': 'Agnikul Cosmos',
  'అగ్నిబాణ్': 'Agnibaan',
  'రాకెట్': 'rocket',

  // Bengali
  'চন্দ্রযান': 'Chandrayaan',
  'বিক্রম': 'Vikram',
  'প্রজ্ঞান': 'Pragyan',
  'ল্যান্ডিং': 'landing',
  'গগনযান': 'Gaganyaan',
  'ব্যোমমিত্র': 'Vyommitra',
  'এলভিএম': 'LVM3',
  'আদিত্য': 'Aditya-L1',
  'অগ্নিকুল': 'Agnikul Cosmos',
  'অগ্নিবাণ': 'Agnibaan',
  'রকেট': 'rocket',

  // Hindi
  'चंद्रयान': 'Chandrayaan',
  'प्रज्ञान': 'Pragyan',
  'विक्रम': 'Vikram',
  'लैंडिंग': 'landing',
  'गगनयान': 'Gaganyaan',
  'व्योममित्र': 'Vyommitra',
  'एलवीएम': 'LVM3',
  'आदित्य': 'Aditya-L1',
  'अग्निकुल': 'Agnikul Cosmos',
  'अग्निबाण': 'Agnibaan',
  'स्काईरूट': 'Skyroot Aerospace',
  'रॉकेट': 'rocket',
  'उपग्रह': 'satellite',
  'निसार': 'NISAR',
  'शुक्रयान': 'Shukrayaan',
  'स्पेडेक्स': 'SPADEX'
};

/**
 * Reformulate query for optimal search engine retrieval:
 * Converts Indic script or Hinglish queries into clear, targeted space search queries.
 */
export function buildOptimizedSearchQuery(userQuery) {
  if (!userQuery || typeof userQuery !== 'string') return 'ISRO space missions';

  const clean = userQuery.trim();
  const words = clean.split(/\s+/);
  const translatedTerms = [];

  for (const w of words) {
    const lower = w.toLowerCase().replace(/[^\p{L}\p{M}\p{N}]/gu, '');
    if (TERM_TRANSLATIONS[lower]) {
      translatedTerms.push(TERM_TRANSLATIONS[lower]);
    } else if (TERM_TRANSLATIONS[w]) {
      translatedTerms.push(TERM_TRANSLATIONS[w]);
    }
  }

  // If we matched Indic space terms, construct targeted search
  if (translatedTerms.length > 0) {
    const unique = Array.from(new Set(translatedTerms));
    const isroPrefix = unique.some(t => t.toLowerCase().includes('isro')) ? '' : 'ISRO ';
    return `${isroPrefix}${unique.join(' ')} update`;
  }

  // Remove common polite filler words in English/Hinglish
  const cleanedEnglish = clean
    .replace(/\b(can you tell me|what is the|when was the|please tell me|details about|what about|kya hai|batao|bataiye)\b/gi, ' ')
    .replace(/[?!.,;]/g, ' ')
    .trim();

  // Add ISRO context if not already mentioned and query looks space related
  if (!/isro|nasa|space|rocket|satellite|chandrayaan|gaganyaan|aditya|agnikul|skyroot|pixxel|nisar/i.test(cleanedEnglish)) {
    return `ISRO ${cleanedEnglish}`;
  }

  return cleanedEnglish;
}

/**
 * Search DuckDuckGo Lite (no API key required, highly reliable)
 */
export async function searchDuckDuckGoLite(query, maxResults = 4) {
  try {
    const res = await fetch('https://lite.duckduckgo.com/lite/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      body: new URLSearchParams({ q: query }).toString(),
      signal: AbortSignal.timeout(9000)
    });

    if (!res.ok) return [];

    const html = await res.text();
    const results = [];

    // Match each result row:
    // Link: <a rel="nofollow" href="..." class='result-link'>...</a> or <a class='result-link' href="...">...</a>
    // Snippet: <td class='result-snippet'>...</td>
    const linkRegex = /<a\s+[^>]*href=['"]([^'"]+)['"][^>]*class=['"]result-link['"][^>]*>([\s\S]*?)<\/a>|<a\s+[^>]*class=['"]result-link['"][^>]*href=['"]([^'"]+)['"][^>]*>([\s\S]*?)<\/a>/gi;
    const snippetRegex = /<td\s+[^>]*class=['"]result-snippet['"][^>]*>([\s\S]*?)<\/td>/gi;

    const links = [];
    let linkMatch;
    while ((linkMatch = linkRegex.exec(html)) !== null) {
      const rawUrl = linkMatch[1] || linkMatch[3];
      const rawTitle = linkMatch[2] || linkMatch[4] || '';
      links.push({ url: rawUrl, title: rawTitle });
    }

    const snippets = [];
    let snippetMatch;
    while ((snippetMatch = snippetRegex.exec(html)) !== null) {
      snippets.push(snippetMatch[1]);
    }

    for (let i = 0; i < Math.min(links.length, maxResults * 2); i++) {
      let url = links[i].url;
      if (url.includes('uddg=')) {
        try {
          const parsed = new URL(url, 'https://lite.duckduckgo.com');
          url = decodeURIComponent(parsed.searchParams.get('uddg'));
        } catch {}
      }

      // Filter out internal duckduckgo links
      if (!url.startsWith('http') || url.includes('duckduckgo.com/')) continue;

      const title = links[i].title
        .replace(/<[^>]+>/g, '')
        .replace(/&#x27;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .trim();

      const snippet = (snippets[i] ? snippets[i] : '')
        .replace(/<[^>]+>/g, '')
        .replace(/&#x27;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/\s+/g, ' ')
        .trim();

      if (title && url) {
        results.push({
          title,
          snippet: snippet || title,
          url,
          source: 'Web (Live)'
        });
        if (results.length >= maxResults) break;
      }
    }

    return results;
  } catch (err) {
    console.warn('DuckDuckGo Lite search error:', err.message);
    return [];
  }
}

/**
 * Search Wikipedia (structured, high-accuracy encyclopedic facts)
 */
export async function searchWikipedia(query, maxResults = 3) {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json&srlimit=${maxResults}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'IsroPR/1.0 (https://isropr.org; contact@isropr.org)' },
      signal: AbortSignal.timeout(9000)
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (!data?.query?.search) return [];

    return data.query.search.map(item => ({
      title: item.title,
      snippet: item.snippet
        .replace(/<[^>]+>/g, '')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&amp;/g, '&')
        .trim(),
      url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/\s+/g, '_'))}`,
      source: 'Wikipedia'
    })).filter(item => item.snippet.length > 20);
  } catch (err) {
    console.warn('Wikipedia search error:', err.message);
    return [];
  }
}

/**
 * Optional Tavily API Search (if TAVILY_API_KEY is configured)
 */
async function searchTavily(query, maxResults = 3) {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: 'basic',
        include_answer: true,
        max_results: maxResults
      }),
      signal: AbortSignal.timeout(6000)
    });

    if (!res.ok) return null;
    const data = await res.json();
    const results = [];

    if (data.answer) {
      results.push({
        title: 'Tavily Summary',
        snippet: data.answer,
        url: 'https://isro.gov.in',
        source: 'Tavily'
      });
    }

    if (Array.isArray(data.results)) {
      for (const item of data.results) {
        results.push({
          title: item.title,
          snippet: item.content,
          url: item.url,
          source: 'Tavily'
        });
      }
    }

    return results;
  } catch (err) {
    console.warn('Tavily search error:', err.message);
    return null;
  }
}

/**
 * Main Web Search Entrypoint for RAG:
 * Combines query reformulation, caching, multi-provider search (Tavily -> DDG -> Wikipedia),
 * and deduplication.
 */
export async function searchWebForRag(userQuery, lang = 'en-IN', maxResults = 4) {
  if (!userQuery || typeof userQuery !== 'string') return [];

  const searchQuery = buildOptimizedSearchQuery(userQuery);
  const cacheKey = `${lang}:${searchQuery.toLowerCase()}`;

  // Check cache
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.results;
  }

  let results = [];

  // 1. Try Tavily if configured
  const tavilyResults = await searchTavily(searchQuery, maxResults);
  if (tavilyResults && tavilyResults.length > 0) {
    results = tavilyResults;
  }

  // 2. If no Tavily or Tavily empty, use DuckDuckGo Lite
  if (results.length === 0) {
    results = await searchDuckDuckGoLite(searchQuery, maxResults);
  }

  // 3. If still sparse (< 2 results), augment with Wikipedia
  if (results.length < 2) {
    const wikiResults = await searchWikipedia(searchQuery, 3);
    for (const w of wikiResults) {
      if (!results.some(r => r.url === w.url)) {
        results.push(w);
      }
    }
  }

  // Limit to maxResults
  const finalResults = results.slice(0, maxResults);

  // Store in cache
  searchCache.set(cacheKey, {
    results: finalResults,
    timestamp: Date.now()
  });

  return finalResults;
}
