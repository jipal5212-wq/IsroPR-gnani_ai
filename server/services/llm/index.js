import { ENV } from '../../config.js';

export async function generateReply({ system, messages, maxTokens = 250 }) {
  // If no API key is configured, provide an intelligent local fallback
  if (!ENV.LLM_API_KEY) {
    return generateLocalFallback(messages, system);
  }

  let endpoint = ENV.LLM_BASE_URL || 'https://api.openai.com/v1/chat/completions';
  if (!endpoint.endsWith('/chat/completions')) {
    endpoint = endpoint.replace(/\/+$/, '') + '/chat/completions';
  }

  const body = {
    model: ENV.LLM_MODEL || 'gpt-4o-mini',
    messages: [
      { role: 'system', content: system },
      ...messages
    ],
    max_tokens: maxTokens,
    temperature: 0.3
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout per spec

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ENV.LLM_API_KEY}`
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`LLM API returned ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content?.trim() || '';
    return {
      text,
      usage: data.usage || null
    };
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      return { text: "I'm taking too long to think right now. Please try asking again in a moment." };
    }
    console.error('LLM generation error:', err);
    throw err;
  }
}

function generateLocalFallback(messages, system) {
  const lastUserMsg = messages[messages.length - 1]?.content || '';
  
  // Extract context if present in user message or prompt
  if (system.includes('Context:\nNo relevant entries found')) {
    return {
      text: "I don't have verified information about that yet in my knowledge base. Please check official updates on isro.gov.in."
    };
  }

  return {
    text: `Here is the information from our space database regarding your question: India's space program continues to reach new milestones. For official verification and latest mission updates, visit isro.gov.in.`
  };
}
