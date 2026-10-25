import { apiFetch, getActiveLang, setActiveLang, formatDuration } from './common.js';
import { AudioRecorder } from './recorder.js';

let isRecording = false;
let recorder = null;
let currentLang = 'en-IN';

export async function initChat() {
  currentLang = getActiveLang();
  setupLanguageSelector();
  setupComposer();
  await loadHistory();
}

function setupLanguageSelector() {
  const select = document.getElementById('chat-lang-select');
  if (!select) return;

  select.value = currentLang;
  select.addEventListener('change', (e) => {
    currentLang = e.target.value;
    setActiveLang(currentLang);
  });
}

async function loadHistory() {
  // Check sessionStorage first for instantaneous restore
  const cached = sessionStorage.getItem('space_chat_history');
  if (cached) {
    try {
      const messages = JSON.parse(cached);
      renderMessages(messages);
      return;
    } catch (e) {}
  }

  try {
    const res = await apiFetch('/api/chat/history');
    if (res.messages && res.messages.length > 0) {
      renderMessages(res.messages);
      sessionStorage.setItem('space_chat_history', JSON.stringify(res.messages));
    } else {
      // Welcome message
      addBotBubble({
        text: "Namaste! I am Space Buddy, your AI companion for ISRO and Indian space missions. You can type or tap the microphone to ask me anything about Chandrayaan, Gaganyaan, Aditya-L1, or Indian space startups!",
        sources: []
      });
    }
  } catch (err) {
    console.warn('Could not load history:', err);
  }
}

function renderMessages(messages) {
  const container = document.getElementById('chat-messages');
  if (!container) return;
  container.innerHTML = '';
  for (const msg of messages) {
    if (msg.role === 'user') {
      addUserBubble({
        text: msg.text,
        inputType: msg.input_type
      });
    } else {
      addBotBubble({
        text: msg.text,
        audioUrl: msg.audio_path,
        sources: msg.sources || []
      });
    }
  }
  scrollToBottom();
}

function setupComposer() {
  const form = document.getElementById('chat-form');
  const input = document.getElementById('chat-text-input');
  const micBtn = document.getElementById('btn-mic');
  const recordingIndicator = document.getElementById('recording-indicator');
  const recordTimer = document.getElementById('record-timer');

  // Text send
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;

      input.value = '';
      addUserBubble({ text, inputType: 'text' });
      showTypingIndicator();

      try {
        const res = await apiFetch('/api/chat/text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text, lang: currentLang })
        });

        hideTypingIndicator();
        addBotBubble({
          text: res.replyText,
          sources: res.sources
        });
        saveToSessionStorage();
      } catch (err) {
        hideTypingIndicator();
        addBotBubble({
          text: `Sorry, I encountered an issue: ${err.message}. Please try again.`
        });
      }
    });
  }

  // Voice recording (Hold or click to toggle)
  if (micBtn) {
    recorder = new AudioRecorder({
      onStart: () => {
        isRecording = true;
        micBtn.classList.add('recording');
        if (recordingIndicator) recordingIndicator.style.display = 'flex';
      },
      onTick: (secs) => {
        if (recordTimer) recordTimer.textContent = `0:${secs < 10 ? '0' : ''}${secs}`;
      },
      onStop: async (blob, duration) => {
        isRecording = false;
        micBtn.classList.remove('recording');
        if (recordingIndicator) recordingIndicator.style.display = 'none';

        if (!blob || blob.size < 100) return;

        // Optimistically add user voice bubble
        addUserBubble({
          text: 'Voice note...',
          inputType: 'voice'
        });
        showTypingIndicator();

        try {
          const formData = new FormData();
          formData.append('audio', blob, 'note.webm');
          formData.append('lang', currentLang);

          const res = await fetch('/api/chat/voice', {
            method: 'POST',
            body: formData
          });

          const data = await res.json();
          hideTypingIndicator();

          if (!res.ok) {
            throw new Error(data.error || 'Failed to process voice message');
          }

          // Update user's voice note with transcript
          const lastUserText = document.querySelector('.msg-bubble-user:last-child .msg-text');
          if (lastUserText && data.transcript) {
            lastUserText.textContent = `🎙️ "${data.transcript}"`;
          }

          addBotBubble({
            text: data.replyText,
            audioUrl: data.audioUrl,
            sources: data.sources
          });
          saveToSessionStorage();
        } catch (err) {
          hideTypingIndicator();
          addBotBubble({
            text: `Voice processing error: ${err.message}. Please try again.`
          });
        }
      },
      onError: (err) => {
        isRecording = false;
        micBtn.classList.remove('recording');
        if (recordingIndicator) recordingIndicator.style.display = 'none';
        alert(`Microphone permission denied or unavailable: ${err.message}`);
      }
    });

    micBtn.addEventListener('click', () => {
      if (!isRecording) {
        recorder.start();
      } else {
        recorder.stop();
      }
    });
  }
}

function addUserBubble({ text, inputType }) {
  const container = document.getElementById('chat-messages');
  if (!container) return;

  const bubble = document.createElement('div');
  bubble.className = 'msg-row msg-user';
  bubble.innerHTML = `
    <div class="msg-bubble msg-bubble-user">
      <div class="msg-text">${inputType === 'voice' ? '🎙️ ' : ''}${escapeHtml(text)}</div>
      <div class="msg-time">${getTimeString()}</div>
    </div>
  `;
  container.appendChild(bubble);
  scrollToBottom();
}

function addBotBubble({ text, audioUrl, sources = [] }) {
  const container = document.getElementById('chat-messages');
  if (!container) return;

  const bubble = document.createElement('div');
  bubble.className = 'msg-row msg-bot';

  let audioPlayerHtml = '';
  if (audioUrl) {
    audioPlayerHtml = `
      <div class="chat-audio-player">
        <audio controls src="${audioUrl}" preload="none" class="chat-inline-audio"></audio>
      </div>
    `;
  }

  let sourcesHtml = '';
  if (sources && sources.length > 0) {
    sourcesHtml = `
      <div class="msg-sources">
        ${sources.map(s => `
          <a href="${s.url}" target="_blank" rel="noopener noreferrer" class="source-chip" title="${s.title}">
            Source: ${s.title.slice(0, 24)}... (as of ${s.as_of || 'verified'})
          </a>
        `).join('')}
      </div>
    `;
  }

  bubble.innerHTML = `
    <div class="bot-avatar">🛰️</div>
    <div class="msg-bubble msg-bubble-bot">
      ${audioPlayerHtml}
      <div class="msg-text">${escapeHtml(text)}</div>
      ${sourcesHtml}
      <div class="msg-time">${getTimeString()}</div>
    </div>
  `;
  container.appendChild(bubble);
  scrollToBottom();
}

function showTypingIndicator() {
  const container = document.getElementById('chat-messages');
  if (!container) return;

  const existing = document.getElementById('typing-indicator');
  if (existing) return;

  const indicator = document.createElement('div');
  indicator.id = 'typing-indicator';
  indicator.className = 'msg-row msg-bot';
  indicator.innerHTML = `
    <div class="bot-avatar">🛰️</div>
    <div class="msg-bubble msg-bubble-bot typing-dots">
      <span></span><span></span><span></span>
    </div>
  `;
  container.appendChild(indicator);
  scrollToBottom();
}

function hideTypingIndicator() {
  const indicator = document.getElementById('typing-indicator');
  if (indicator) indicator.remove();
}

function scrollToBottom() {
  const container = document.getElementById('chat-messages');
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
}

function getTimeString() {
  const d = new Date();
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function saveToSessionStorage() {
  // Collect DOM messages
  const rows = document.querySelectorAll('.msg-row:not(#typing-indicator)');
  const messages = [];
  rows.forEach(r => {
    const isUser = r.classList.contains('msg-user');
    const textEl = r.querySelector('.msg-text');
    const audioEl = r.querySelector('audio');
    if (textEl) {
      messages.push({
        role: isUser ? 'user' : 'assistant',
        text: textEl.textContent.trim(),
        audio_path: audioEl ? audioEl.getAttribute('src') : null
      });
    }
  });
  sessionStorage.setItem('space_chat_history', JSON.stringify(messages));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initChat);
} else {
  initChat();
}
