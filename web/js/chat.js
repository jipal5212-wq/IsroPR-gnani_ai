import { apiFetch, getActiveLang, setActiveLang, formatDuration } from './common.js';
import { AudioRecorder } from './recorder.js';
import { initGlobalPlayer } from './spotify-player.js';

let isRecording = false;
let recorder = null;
let currentLang = 'en-IN';

export async function initChat() {
  initGlobalPlayer();
  currentLang = getActiveLang();
  await setupLanguageSelector();
  setupComposer();
  await loadHistory();
}

async function setupLanguageSelector() {
  const select = document.getElementById('chat-lang-select') || document.getElementById('lang-select');
  if (!select) return;

  try {
    const data = await apiFetch('/api/languages');
    if (data.languages && data.languages.length > 0) {
      select.innerHTML = '';
      for (const lang of data.languages) {
        const opt = document.createElement('option');
        opt.value = lang.code;
        opt.textContent = `${lang.nativeName} (${lang.name})`;
        if (lang.code === currentLang) opt.selected = true;
        select.appendChild(opt);
      }
    }
  } catch (err) {
    console.warn('Could not load dynamic languages list:', err);
  }

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
        text: "Namaste! I am Space Chat, your verified outreach desk for ISRO and Indian space missions. You can type or tap the microphone to ask anything about Chandrayaan, Gaganyaan, Aditya-L1, or Indian space tech startups.",
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
      if (/[\u0C80-\u0CFF]/.test(text)) {
        currentLang = 'kn-IN';
      } else if (/[\u0900-\u097F]/.test(text)) {
        currentLang = 'hi-IN';
      } else if (/[\u0B80-\u0BFF]/.test(text)) {
        currentLang = 'ta-IN';
      } else if (/[\u0C00-\u0C7F]/.test(text)) {
        currentLang = 'te-IN';
      } else if (/[\u0980-\u09FF]/.test(text)) {
        currentLang = 'bn-IN';
      }
      setActiveLang(currentLang);
      const langSelect = document.getElementById('chat-lang-select') || document.getElementById('lang-select');
      if (langSelect) langSelect.value = currentLang;

      addUserBubble({ text, inputType: 'text' });
      showTypingIndicator();

      try {
        const res = await apiFetch('/api/chat/text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text, lang: currentLang })
        });

        if (res.lang && res.lang !== currentLang) {
          currentLang = res.lang;
          setActiveLang(currentLang);
          const langSelect = document.getElementById('chat-lang-select') || document.getElementById('lang-select');
          if (langSelect) langSelect.value = currentLang;
        }

        hideTypingIndicator();
        addBotBubble({
          text: res.replyText,
          audioUrl: res.audioUrl,
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

        // Optimistically add user voice bubble with their local voice playback
        const userAudioUrl = URL.createObjectURL(blob);
        addUserBubble({
          text: 'Sending voice note...',
          inputType: 'voice',
          audioUrl: userAudioUrl
        });
        showTypingIndicator();

        try {
          const formData = new FormData();
          formData.append('audio', blob, 'recording.wav');
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

          if (data.lang && data.lang !== currentLang) {
            currentLang = data.lang;
            setActiveLang(currentLang);
            const langSelect = document.getElementById('chat-lang-select') || document.getElementById('lang-select');
            if (langSelect) langSelect.value = currentLang;
          }

          // Update user's voice note with transcript
          const userBubbles = document.querySelectorAll('.wa-bubble-user .msg-text');
          if (userBubbles.length > 0 && data.transcript) {
            const lastUserText = userBubbles[userBubbles.length - 1];
            lastUserText.textContent = `"${data.transcript}"`;
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

    micBtn.addEventListener('click', async () => {
      if (!isRecording) {
        try {
          await recorder.start();
        } catch (err) {
          console.error('Failed to start recorder:', err);
        }
      } else {
        await recorder.stop();
      }
    });
  }
}

function createWaVoicePlayer(audioUrl, durationHint = '0:20') {
  const container = document.createElement('div');
  container.className = 'wa-voice-note';

  const audio = new Audio(audioUrl);
  audio.preload = 'metadata';

  // 26 randomized waveform bar heights mimicking real voice audio amplitudes
  const heights = [6, 12, 18, 14, 22, 16, 10, 24, 18, 14, 20, 24, 16, 8, 14, 22, 18, 12, 20, 16, 12, 18, 14, 8, 12, 6];
  const barsHtml = heights.map((h, i) => `<div class="wa-bar" data-idx="${i}" style="height: ${h}px;"></div>`).join('');

  container.innerHTML = `
    <button type="button" class="wa-play-btn" aria-label="Play voice note">
      <svg class="icon-play" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
      <svg class="icon-pause" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="display: none;"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
    </button>
    <div class="wa-waveform-container">
      <div class="wa-bars-row">${barsHtml}</div>
      <div class="wa-meta-row">
        <span class="wa-time-label">0:00</span>
        <span>
          <span class="wa-total-label">${durationHint}</span>
          <span class="wa-ticks">✓✓</span>
        </span>
      </div>
    </div>
  `;

  const playBtn = container.querySelector('.wa-play-btn');
  const iconPlay = container.querySelector('.icon-play');
  const iconPause = container.querySelector('.icon-pause');
  const timeLabel = container.querySelector('.wa-time-label');
  const totalLabel = container.querySelector('.wa-total-label');
  const bars = container.querySelectorAll('.wa-bar');

  playBtn.addEventListener('click', () => {
    if (audio.paused) {
      // Pause any other playing voice notes on page
      document.querySelectorAll('audio').forEach(a => { if (a !== audio) a.pause(); });
      audio.play().catch(console.error);
    } else {
      audio.pause();
    }
  });

  audio.addEventListener('play', () => {
    iconPlay.style.display = 'none';
    iconPause.style.display = 'block';
  });

  audio.addEventListener('pause', () => {
    iconPlay.style.display = 'block';
    iconPause.style.display = 'none';
  });

  audio.addEventListener('loadedmetadata', () => {
    if (audio.duration && !isNaN(audio.duration)) {
      totalLabel.textContent = formatDuration(audio.duration);
    }
  });

  audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    timeLabel.textContent = formatDuration(audio.currentTime);
    const progressPct = audio.currentTime / audio.duration;
    const playedCount = Math.floor(progressPct * bars.length);
    bars.forEach((b, idx) => {
      b.classList.toggle('played', idx <= playedCount);
    });
  });

  audio.addEventListener('ended', () => {
    iconPlay.style.display = 'block';
    iconPause.style.display = 'none';
    bars.forEach(b => b.classList.remove('played'));
    timeLabel.textContent = '0:00';
  });

  return container;
}

function addUserBubble({ text, inputType, audioUrl }) {
  const container = document.getElementById('chat-messages');
  if (!container) return;

  const bubble = document.createElement('div');
  bubble.className = 'wa-msg-row msg-row wa-user msg-user';
  
  const innerBubble = document.createElement('div');
  innerBubble.className = 'wa-bubble msg-bubble wa-bubble-user msg-bubble-user';

  if (inputType === 'voice' && audioUrl) {
    innerBubble.appendChild(createWaVoicePlayer(audioUrl));
  }

  const textEl = document.createElement('div');
  textEl.className = 'msg-text';
  textEl.style.lineHeight = '1.45';
  textEl.textContent = text;
  innerBubble.appendChild(textEl);

  const timeEl = document.createElement('div');
  timeEl.className = 'wa-meta';
  timeEl.innerHTML = `<span class="wa-time">${getTimeString()}</span> <span class="wa-ticks">✓✓</span>`;
  innerBubble.appendChild(timeEl);

  bubble.appendChild(innerBubble);
  container.appendChild(bubble);
  scrollToBottom();
}

function addBotBubble({ text, audioUrl, sources = [] }) {
  const container = document.getElementById('chat-messages');
  if (!container) return;

  const bubble = document.createElement('div');
  bubble.className = 'wa-msg-row msg-row wa-bot msg-bot';

  const avatar = document.createElement('div');
  avatar.className = 'bot-avatar';
  avatar.style.cssText = 'width: 28px; height: 28px; border-radius: 50%; overflow: hidden; flex-shrink: 0; border: 1px solid #d1d7db;';
  avatar.innerHTML = '<img src="/images/isropr-logo.jpg" alt="Space Chat" style="width: 100%; height: 100%; object-fit: cover;">';
  bubble.appendChild(avatar);

  const innerBubble = document.createElement('div');
  innerBubble.className = 'wa-bubble msg-bubble wa-bubble-bot msg-bubble-bot';

  // If there's an audio note from Space Chat, render WhatsApp voice player!
  if (audioUrl) {
    innerBubble.appendChild(createWaVoicePlayer(audioUrl));
  }

  const textEl = document.createElement('div');
  textEl.className = 'msg-text';
  textEl.style.lineHeight = '1.45';
  textEl.textContent = text;
  innerBubble.appendChild(textEl);

  if (sources && sources.length > 0) {
    const sourcesEl = document.createElement('div');
    sourcesEl.className = 'msg-sources';
    sourcesEl.style.cssText = 'margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid #e2e8f0; display: flex; flex-wrap: wrap; gap: 0.35rem;';
    sourcesEl.innerHTML = sources.map(s => `
      <a href="${s.url}" target="_blank" rel="noopener noreferrer" class="source-chip" style="font-size: 0.72rem; background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; padding: 0.15rem 0.5rem; border-radius: 9999px; text-decoration: none;" title="${s.title}">
        Source: ${s.title.slice(0, 24)}... (as of ${s.as_of || 'verified'})
      </a>
    `).join('');
    innerBubble.appendChild(sourcesEl);
  }

  const timeEl = document.createElement('div');
  timeEl.className = 'wa-meta';
  timeEl.innerHTML = `<span class="wa-time">${getTimeString()}</span>`;
  innerBubble.appendChild(timeEl);

  bubble.appendChild(innerBubble);
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
  indicator.className = 'wa-msg-row msg-row wa-bot msg-bot';
  indicator.innerHTML = `
    <div style="width: 28px; height: 28px; border-radius: 50%; overflow: hidden; flex-shrink: 0; border: 1px solid #d1d7db;">
      <img src="/images/isropr-logo.jpg" alt="Space Chat" style="width: 100%; height: 100%; object-fit: cover;">
    </div>
    <div class="wa-bubble msg-bubble wa-bubble-bot typing-dots" style="padding: 0.6rem 0.85rem;">
      <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:#64748b; margin:0 2px;"></span>
      <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:#64748b; margin:0 2px;"></span>
      <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:#64748b; margin:0 2px;"></span>
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
