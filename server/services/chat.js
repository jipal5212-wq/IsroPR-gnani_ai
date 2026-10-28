import path from 'node:path';
import { getDb } from '../db/db.js';
import { retrieveContext } from './rag.js';
import { generateReply } from './llm/index.js';
import { transcribeAudio } from './gnani/stt.js';
import { synthesizeSpeech } from './gnani/tts.js';
import { convertToWav16kMono, safeUnlink } from './audio.js';
import { ALL_LANGUAGES, DIRS } from '../config.js';

export function detectQueryLanguage(text, userSelectedLang = 'en-IN') {
  if (!text || typeof text !== 'string') return userSelectedLang || 'en-IN';

  const clean = text.trim();
  if (!clean) return userSelectedLang || 'en-IN';

  // 1. Script checks (highest confidence)
  // Devanagari (Hindi, Marathi)
  if (/[\u0900-\u097F]/.test(clean)) return 'hi-IN';
  // Tamil
  if (/[\u0B80-\u0BFF]/.test(clean)) return 'ta-IN';
  // Telugu
  if (/[\u0C00-\u0C7F]/.test(clean)) return 'te-IN';
  // Bengali
  if (/[\u0980-\u09FF]/.test(clean)) return 'bn-IN';
  // Kannada
  if (/[\u0C80-\u0CFF]/.test(clean)) return 'kn-IN';
  // Malayalam
  if (/[\u0D00-\u0D7F]/.test(clean)) return 'ml-IN';
  // Gujarati
  if (/[\u0A80-\u0AFF]/.test(clean)) return 'gu-IN';
  // Gurmukhi / Punjabi
  if (/[\u0A00-\u0A7F]/.test(clean)) return 'pa-IN';

  // 2. Distinct Romanized Indic patterns (ordered before generic English, homographs like 'the', 'me' excluded)
  const kannadaRomanRegex = /\b(yaavaga|yaava|yaaru|enu|elli|hege|aithu|aagide|aaguttade|helu|heli|namaskara|dhanyavadagalu|bagge|maadi|anthare|ittu|iddare)\b/i;
  if (kannadaRomanRegex.test(clean)) {
    return 'kn-IN';
  }

  const tamilRomanRegex = /\b(eppothu|eppadi|enna|engu|yaar|solla|sollunga|vanakkam|paththi)\b/i;
  if (tamilRomanRegex.test(clean)) {
    return 'ta-IN';
  }

  const teluguRomanRegex = /\b(eppudu|ela|emi|ekkada|evaru|cheppandi|namaskaram|gurinchi)\b/i;
  if (teluguRomanRegex.test(clean)) {
    return 'te-IN';
  }

  const bengaliRomanRegex = /\b(kobe|kivabe|ki|kothay|ke|bolo|bolun|nomoshkar|shomporke)\b/i;
  if (bengaliRomanRegex.test(clean)) {
    return 'bn-IN';
  }

  const hinglishRegex = /\b(kya|kab|kaise|kaisa|kaisi|kaha|kahan|kyun|kyon|kisne|kisko|kiske|kiska|kiski|batao|bataiye|bata|boliye|bolo|hai|hain|tha|thi|hoga|hogi|honge|hona|hua|hui|hue|raha|rahi|rahe|karo|kare|karna|karenge|kitna|kitne|kitni|achha|achhi|namaste|dhanyawad|shukriya|mein|apna|apni|apne|kaun|kaunsa|kaunsi|jaise|bhi|toh|wala|wali|wale|bhejo|sunao)\b/i;
  if (hinglishRegex.test(clean)) {
    return 'hi-IN';
  }

  // 3. Explicit English query patterns
  const englishRegex = /\b(what|when|where|why|how|who|which|is|are|was|were|can|could|will|would|tell|explain|give|describe|payload|capacity|specifications|launch|orbit|rocket|satellite|mission|details|status|about)\b/i;
  if (englishRegex.test(clean)) {
    return 'en-IN';
  }

  // 8. If user explicitly chose a non-English language on UI, honor it
  if (userSelectedLang && userSelectedLang !== 'en-IN') {
    return userSelectedLang;
  }

  return 'en-IN';
}

export async function handleChatTurn({ sessionId, inputType, userText, audioFilePath, lang = 'en-IN' }) {
  const db = getDb();
  let queryText = userText;
  let detectedLang = lang;

  // 1. If voice input, transcribe first
  if (inputType === 'voice' && audioFilePath) {
    const wavPath = audioFilePath + '.wav';
    const convertedPath = await convertToWav16kMono(audioFilePath, wavPath);

    const sttResult = await transcribeAudio({
      audioFilePath: convertedPath,
      lang
    });

    queryText = sttResult.transcript;
    if (sttResult.detectedLanguage) {
      detectedLang = sttResult.detectedLanguage;
    }

    // Clean up temporary uploads right after transcription
    safeUnlink(audioFilePath);
    if (convertedPath !== audioFilePath) safeUnlink(convertedPath);

    if (!queryText || !queryText.trim()) {
      return {
        transcript: '',
        replyText: detectedLang === 'hi-IN'
          ? "माफ़ कीजिए, मुझे आपकी आवाज़ साफ़ सुनाई नहीं दी। कृपया फिर से बोलें या अपना प्रश्न लिखकर पूछें।"
          : "I couldn't hear that clearly. Try again or type your question.",
        audioUrl: null,
        sources: [],
        lang: detectedLang
      };
    }
  }

  // Detect script/language directly from query text
  detectedLang = detectQueryLanguage(queryText, detectedLang);

  // Ensure session exists in chat_sessions
  db.prepare(`
    INSERT OR IGNORE INTO chat_sessions (id, lang_pref) VALUES (?, ?)
  `).run(sessionId, detectedLang);

  // Save User Message to database
  db.prepare(`
    INSERT INTO chat_messages (session_id, role, input_type, lang, text)
    VALUES (?, 'user', ?, ?, ?)
  `).run(sessionId, inputType, detectedLang, queryText);

  // 2. Retrieve context from Knowledge Base (FTS5), Stories & Live Web Search
  const { knowledge, stories, webResults } = await retrieveContext(queryText, 4, detectedLang);

  // Format context block
  let contextBlock = '';
  const sources = [];

  if (knowledge.length > 0) {
    contextBlock += '--- Verified Knowledge Base Entries ---\n';
    for (const k of knowledge) {
      contextBlock += `Title: ${k.title}\nDetails: ${k.body}\nSource: ${k.source_url} (As of: ${k.as_of})\n\n`;
      sources.push({ title: k.title, url: k.source_url, as_of: k.as_of });
    }
  }

  if (stories.length > 0) {
    contextBlock += '--- IsroPR Stories ---\n';
    for (const s of stories) {
      contextBlock += `Story: ${s.title}\nSummary: ${s.summary}\n`;
      if (s.trans_body) {
        contextBlock += `Narrative (${detectedLang}): ${s.trans_body}\n`;
      }
      contextBlock += `Facts As Of: ${s.facts_as_of || 'Recent'}\n\n`;
      if (s.sources && s.sources[0]) {
        sources.push({ title: s.title, url: s.sources[0], as_of: s.facts_as_of || 'Recent' });
      }
    }
  }

  if (webResults && webResults.length > 0) {
    contextBlock += '--- Live Internet & Verified Web Context ---\n';
    for (const w of webResults) {
      contextBlock += `Title: ${w.title}\nWeb Summary: ${w.snippet}\nSource URL: ${w.url}\n\n`;
      if (!sources.some(s => s.url === w.url)) {
        sources.push({ title: w.title, url: w.url, as_of: 'Live Web' });
      }
    }
  }

  // Sanitize and rank sources by query relevance, resolving dead links
  const sanitizedSources = sanitizeSources(sources, queryText);

  if (!contextBlock) {
    contextBlock = 'No relevant entries found in the verified knowledge base or live web search.';
  }

  // 3. Assemble Prompt with warm, patient, empathetic WhatsApp persona (Shivani)
  const langMeta = ALL_LANGUAGES.find(l => l.code === detectedLang) || { name: 'English', defaultVoice: 'Shivani' };

  const systemPrompt = `You are "Space Chat", voiced by Shivani on IsroPR — a warm, patient, empathetic, and knowledgeable friend chatting on WhatsApp about Indian space exploration, ISRO, and rising Indian space tech startups.

CRITICAL LANGUAGE REQUIREMENT:
- You MUST reply strictly in ${langMeta.name} (${detectedLang}).
- If the user asks in English, you MUST respond in English.
- If the user asks in Hindi (whether in Devanagari or Romanized Hinglish), you MUST respond entirely in clear, natural Hindi using Devanagari script.
- If the user asks in Tamil, you MUST respond in Tamil using Tamil script.
- If the user asks in Telugu, you MUST respond in Telugu using Telugu script.
- If the user asks in Bengali, you MUST respond in Bengali using Bengali script.
- If the user asks in Kannada (whether in Kannada script or Romanized Kannada), you MUST respond in Kannada using Kannada script.
- NEVER default to English if the user asked in an Indian language!

HOW TO TALK:
1. Talk like a warm, patient, empathetic friend chatting on WhatsApp — welcoming, calm, kind, and helpful, with an empathy-first tone! Never sound like a formal corporate robot or a cold generic AI.
2. If this is a voice reply, talk exactly like sending a quick, comforting, friendly voice note (concise, clear, easy to listen to, under 70 words). If text, keep it under 110 words.
3. Ground your answers directly on the verified knowledge base and live web context provided below. Prioritize official ISRO sources, mission timelines, and verified updates. If the information is not in the context, be kind, patient, and honest: recommend checking official ISRO updates at isro.gov.in.
4. When mentioning dates or technical specifications (like rocket stages, payloads, or launch timelines), mention the verified details naturally in conversation.
5. Output plain text ONLY: no asterisks, no hashtags, no markdown symbols, no bullet points, and no emojis (since your answer will be converted into spoken audio via TTS).
6. Never invent or guess dates, specs, or numbers.
7. If asked who you are, say you are Space Chat, voiced by Shivani on IsroPR, dedicated to making India space-aware.

Context:
${contextBlock}`;

  // Get recent conversation history (last 4 turns)
  const recentTurns = db.prepare(`
    SELECT role, text FROM chat_messages 
    WHERE session_id = ? 
    ORDER BY id DESC LIMIT 4
  `).all(sessionId).reverse();

  const messages = recentTurns.map(m => ({
    role: m.role,
    content: m.text
  }));

  // Ensure current query is present
  if (messages.length === 0 || messages[messages.length - 1].content !== queryText) {
    messages.push({ role: 'user', content: queryText });
  }

  // 4. Generate LLM Answer
  const { text: rawReply } = await generateReply({
    system: systemPrompt,
    messages,
    maxTokens: inputType === 'voice' ? 120 : 250,
    detectedLang,
    contextData: { knowledge, stories, webResults }
  });

  const replyText = rawReply.replace(/[*#_~`]/g, '').trim();

  // 5. Synthesize TTS voice note for user response using Shivani in the detected language
  let audioUrl = null;
  let audioHash = null;

  try {
    const voice = 'Shivani';
    const ttsResult = await synthesizeSpeech({
      text: replyText,
      lang: detectedLang,
      voice,
      model: 'timbre-v3.0'
    });

    if (ttsResult && ttsResult.filePath) {
      audioHash = ttsResult.hash;
      audioUrl = `/media/audio/chat/${path.basename(ttsResult.filePath)}`;
    }
  } catch (err) {
    console.warn('Voice reply synthesis failed, continuing with text response:', err.message);
  }

  // Save Assistant reply to database
  db.prepare(`
    INSERT INTO chat_messages (session_id, role, input_type, lang, text, audio_path, audio_hash, sources, status)
    VALUES (?, 'assistant', ?, ?, ?, ?, ?, ?, 'ok')
  `).run(
    sessionId,
    inputType,
    detectedLang,
    replyText,
    audioUrl,
    audioHash,
    JSON.stringify(sanitizedSources)
  );

  return {
    transcript: queryText,
    replyText,
    audioUrl,
    sources: sanitizedSources,
    lang: detectedLang
  };
}

export function sanitizeSources(rawSources, userQuery) {
  if (!Array.isArray(rawSources)) return [];

  const URL_FIXES = {
    'https://www.isro.gov.in/GSLV-F12_NVS-01_Mission.html': 'https://www.isro.gov.in/GSLV_F12_Landingpage.html',
    'https://www.isro.gov.in/NavIC.html': 'https://www.isro.gov.in/SatelliteNavigationServices.html',
    'https://www.isro.gov.in/LaunchVehicles.html': 'https://www.isro.gov.in/Launchers.html',
    'https://www.isro.gov.in/LVM3_Overview.html': 'https://www.isro.gov.in/Launchers.html',
    'https://www.isro.gov.in/Vyommitra.html': 'https://www.isro.gov.in/Gaganyaan.html',
    'https://www.pixxel.space/': 'https://en.wikipedia.org/wiki/Pixxel',
    'https://www.pixxel.space': 'https://en.wikipedia.org/wiki/Pixxel'
  };

  const queryTerms = (userQuery || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(t => t.length > 1);

  const seenUrls = new Set();
  const cleaned = [];

  for (const s of rawSources) {
    if (!s || !s.url) continue;

    let url = s.url.trim();
    if (URL_FIXES[url]) {
      url = URL_FIXES[url];
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) continue;
    if (url.includes('duckduckgo.com/l/?')) continue;

    if (seenUrls.has(url)) continue;
    seenUrls.add(url);

    let score = 0;
    const titleLower = (s.title || '').toLowerCase();
    const urlLower = url.toLowerCase();

    for (const term of queryTerms) {
      if (titleLower.includes(term)) score += 3;
      if (urlLower.includes(term)) score += 2;
    }

    const mentions03 = /\b0?3\b/.test(userQuery);
    const mentions02 = /\b0?2\b/.test(userQuery);
    const mentions01 = /\b0?1\b/.test(userQuery);

    if (mentions03) {
      if (titleLower.includes('03') || titleLower.includes(' 3') || titleLower.includes('-3')) score += 6;
      if (titleLower.includes('01') || titleLower.includes(' 1') || titleLower.includes('-1')) score -= 6;
    } else if (mentions02) {
      if (titleLower.includes('02') || titleLower.includes(' 2') || titleLower.includes('-2')) score += 6;
      if (titleLower.includes('01') || titleLower.includes(' 1') || titleLower.includes('-1')) score -= 6;
    } else if (mentions01) {
      if (titleLower.includes('01') || titleLower.includes(' 1') || titleLower.includes('-1')) score += 6;
    }

    if (userQuery.toLowerCase().includes('nvs') && titleLower.includes('aditya')) {
      score -= 10;
    }
    if (userQuery.toLowerCase().includes('aditya') && titleLower.includes('nvs')) {
      score -= 10;
    }

    cleaned.push({
      title: s.title,
      url,
      as_of: s.as_of || 'verified',
      score
    });
  }

  cleaned.sort((a, b) => b.score - a.score);
  return cleaned.slice(0, 3).map(({ title, url, as_of }) => ({ title, url, as_of }));
}

