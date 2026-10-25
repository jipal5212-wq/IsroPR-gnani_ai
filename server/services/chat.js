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

  // 3. Assemble Prompt
  const langMeta = ALL_LANGUAGES.find(l => l.code === detectedLang) || { name: 'English', defaultVoice: 'Pranav' };

  const systemPrompt = `You are "Space Buddy", a friendly and knowledgeable AI assistant for Space Bharat, dedicated to making citizens space-aware about ISRO, Indian space missions, and Indian space startups.

STRICT GUIDELINES:
1. Answer ONLY from the provided Context below.
2. If the context does not contain enough information to answer the question, politely say you don't have that information yet and suggest checking the official ISRO portal at isro.gov.in. Do NOT guess or extrapolate facts.
3. Respond in ${langMeta.name} (${detectedLang}).
4. Keep the tone friendly, enthusiastic, and conversational.
5. Length limit: ${inputType === 'voice' ? 'under 70 words (concise for audio listening)' : 'under 120 words'}.
6. When giving dates, specifications, or mission timelines, cite the "as of" date provided in the context.
7. Never invent launch dates, specifications, or numbers.
8. Output plain text ONLY. No markdown, no asterisks, no bullet points, and no emojis, because the response may be spoken aloud.
9. You are an AI assistant, never claim to be human.

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

  // 5. If voice input, synthesize TTS voice note
  let audioUrl = null;
  let audioHash = null;

  if (inputType === 'voice') {
    try {
      const voice = langMeta.defaultVoice || 'Pranav';
      const ttsResult = await synthesizeSpeech({
        text: replyText,
        lang: detectedLang,
        voice
      });

      audioHash = ttsResult.hash;
      audioUrl = `/media/audio/chat/${path.basename(ttsResult.filePath)}`;
    } catch (err) {
      console.warn('Voice reply synthesis failed, continuing with text only:', err.message);
    }
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
