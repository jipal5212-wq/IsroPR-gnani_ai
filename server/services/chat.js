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

  // 2. Hinglish / Romanized Hindi patterns
  const hinglishRegex = /\b(kya|kab|kaise|kaisa|kaisi|kaha|kahan|kyun|kyon|kisne|kisko|kiske|kiska|kiski|batao|bataiye|bata|boliye|bolo|hai|hain|tha|thi|the|hoga|hogi|honge|hona|hua|hui|hue|raha|rahi|rahe|karo|kare|karna|karenge|kitna|kitne|kitni|achha|achhi|namaste|dhanyawad|shukriya|aur|par|pe|se|me|mein|ko|ka|ki|ke|ye|yeh|wo|woh|apna|apni|apne|tum|aap|hum|kuch|koi|kaun|kaunsa|kaunsi|jaise|bhi|toh|wala|wali|wale|bhejo|sunao)\b/i;
  if (hinglishRegex.test(clean)) {
    return 'hi-IN';
  }

  // 3. Explicit English query patterns
  const englishRegex = /\b(what|when|where|why|how|who|which|is|are|was|were|can|could|will|would|tell|explain|give|describe|payload|capacity|specifications|launch|orbit|rocket|satellite|mission|details|status|about)\b/i;
  if (englishRegex.test(clean)) {
    return 'en-IN';
  }

  // 4. If user explicitly chose a non-English language on UI, honor it
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

  // 2. Retrieve context from Knowledge Base (FTS5) & Stories in requested language
  const { knowledge, stories } = retrieveContext(queryText, 4, detectedLang);

  // Format context block
  let contextBlock = '';
  const sources = [];

  if (knowledge.length > 0) {
    contextBlock += '--- Knowledge Base Entries ---\n';
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

  if (!contextBlock) {
    contextBlock = 'No relevant entries found in the verified knowledge base.';
  }

  // 3. Assemble Prompt with warm, patient, empathetic WhatsApp persona (Shivani)
  const langMeta = ALL_LANGUAGES.find(l => l.code === detectedLang) || { name: 'English', defaultVoice: 'Shivani' };

  const systemPrompt = `You are "Space Buddy", voiced by Shivani on IsroPR — a warm, patient, empathetic, and knowledgeable friend chatting on WhatsApp about Indian space exploration, ISRO, and rising Indian space tech startups.

CRITICAL LANGUAGE REQUIREMENT:
- You MUST reply strictly in ${langMeta.name} (${detectedLang}).
- If the user asks in Hindi (whether in Devanagari or Romanized Hinglish), you MUST respond entirely in clear, natural Hindi using Devanagari script.
- If the user asks in Tamil, you MUST respond in Tamil.
- If the user asks in Telugu, you MUST respond in Telugu.
- If the user asks in Bengali, you MUST respond in Bengali.
- If the user asks in English, you MUST respond in English.
- NEVER default to English if the user asked in an Indian language!

HOW TO TALK:
1. Talk like a warm, patient, empathetic friend chatting on WhatsApp — welcoming, calm, kind, and helpful, with an empathy-first tone! Never sound like a formal corporate robot or a cold generic AI.
2. If this is a voice reply, talk exactly like sending a quick, comforting, friendly voice note (concise, clear, easy to listen to, under 70 words). If text, keep it under 110 words.
3. Answer ONLY using the facts from the Context below. If the information isn't in the context, be kind, patient, and honest: say you don't have verified details on that yet and recommend checking official ISRO updates at isro.gov.in.
4. When mentioning dates or technical specifications (like rocket stages, payloads, or launch timelines), mention the verified "as of" date naturally in conversation.
5. Output plain text ONLY: no asterisks, no hashtags, no markdown symbols, no bullet points, and no emojis (since your answer will be converted into spoken audio via TTS).
6. Never invent or guess dates, specs, or numbers.
7. If asked who you are, say you are Space Buddy, voiced by Shivani on IsroPR, dedicated to making India space-aware.

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
    contextData: { knowledge, stories }
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
    JSON.stringify(sources)
  );

  return {
    transcript: queryText,
    replyText,
    audioUrl,
    sources,
    lang: detectedLang
  };
}

