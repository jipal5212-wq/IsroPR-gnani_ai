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
      return { text: "I took a bit too long to process. Please ask again in a moment!" };
    }
    console.warn('LLM API error (falling back to verified RAG answer):', err.message);
    return generateLocalFallback(messages, system);
  }
}

function generateLocalFallback(messages, system) {
  if (system.includes('Context:\nNo relevant entries found')) {
    return {
      text: "I do not have verified details on that yet in our knowledge base. For official mission schedules, please check isro.gov.in."
    };
  }

  // Extract first details sentence from context if available
  const match = system.match(/Details:\s*([^\n]+)/);
  if (match && match[1]) {
    return {
      text: `Based on verified records: ${match[1].trim()}`
    };
  }

  const storyMatch = system.match(/Summary:\s*([^\n]+)/);
  if (storyMatch && storyMatch[1]) {
    return {
      text: `Here is the verified space record: ${storyMatch[1].trim()}`
    };
  }

  return {
    text: "India's space program continues to reach historic milestones. Chandrayaan-3 successfully soft-landed near the lunar South Pole on 23 August 2023. For official updates, visit isro.gov.in."
  };
}
