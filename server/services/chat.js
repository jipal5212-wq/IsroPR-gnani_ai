import path from 'node:path';
import { getDb } from '../db/db.js';
import { retrieveContext } from './rag.js';
import { generateReply } from './llm/index.js';
import { transcribeAudio } from './gnani/stt.js';
import { synthesizeSpeech } from './gnani/tts.js';
import { convertToWav16kMono, safeUnlink } from './audio.js';
import { ALL_LANGUAGES, DIRS } from '../config.js';

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

    // Clean up temporary uploads right after transcription per spec 5.2
    safeUnlink(audioFilePath);
    if (convertedPath !== audioFilePath) safeUnlink(convertedPath);

    if (!queryText || !queryText.trim()) {
      return {
        transcript: '',
        replyText: "I couldn't hear that clearly. Try again or type your question.",
        audioUrl: null,
        sources: []
      };
    }
  }

  // Ensure session exists in chat_sessions
  db.prepare(`
    INSERT OR IGNORE INTO chat_sessions (id, lang_pref) VALUES (?, ?)
  `).run(sessionId, detectedLang);

  // Save User Message to database
  db.prepare(`
    INSERT INTO chat_messages (session_id, role, input_type, lang, text)
    VALUES (?, 'user', ?, ?, ?)
  `).run(sessionId, inputType, detectedLang, queryText);

  // 2. Retrieve context from Knowledge Base (FTS5) & Stories
  const { knowledge, stories } = retrieveContext(queryText);

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
    contextBlock += '--- Space Bharat Stories ---\n';
    for (const s of stories) {
      contextBlock += `Story: ${s.title}\nSummary: ${s.summary}\nFacts As Of: ${s.facts_as_of || 'Recent'}\n\n`;
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

  const systemPrompt = `You are "Space Buddy", voiced by Shivani — a warm, patient, empathetic, and knowledgeable friend chatting on WhatsApp about Indian space exploration, ISRO, and rising Indian space tech startups.

HOW TO TALK:
1. Talk like a warm, patient, empathetic friend chatting on WhatsApp — welcoming, calm, kind, and helpful, with an empathy-first tone! Never sound like a formal corporate robot or a cold generic AI.
2. If this is a voice reply, talk exactly like sending a quick, comforting, friendly voice note (concise, clear, easy to listen to, under 70 words). If text, keep it under 110 words.
3. Respond in ${langMeta.name} (${detectedLang}). If in Hindi or another Indian language, speak naturally, kindly, and conversationally.
4. Answer ONLY using the facts from the Context below. If the information isn't in the context, be kind, patient, and honest: say you don't have verified details on that yet and recommend checking official ISRO updates at isro.gov.in.
5. When mentioning dates or technical specifications (like rocket stages, payloads, or launch timelines), mention the verified "as of" date naturally in conversation.
6. Output plain text ONLY: no asterisks, no hashtags, no markdown symbols, no bullet points, and no emojis (since your answer will be converted into spoken audio via TTS).
7. Never invent or guess dates, specs, or numbers.
8. If asked who you are, say you are Space Buddy, voiced by Shivani, an AI friend dedicated to making India space-aware.

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
    maxTokens: inputType === 'voice' ? 120 : 250
  });

  const replyText = rawReply.replace(/[*#_~`]/g, '').trim();

  // 5. Synthesize TTS voice note for user response using Shivani (warm, patient, empathy-first female voice)
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
