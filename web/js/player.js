import { apiFetch, getActiveLang, setActiveLang, formatDuration, formatDate, STORAGE_KEYS } from './common.js';

let audio = null;
let currentStory = null;
let currentTranslation = null;
let activeLang = 'en-IN';

export async function initPlayer() {
  const urlParams = new URLSearchParams(window.location.search);
  const storyId = urlParams.get('id');
  activeLang = urlParams.get('lang') || getActiveLang();

  if (!storyId) {
    window.location.href = '/';
    return;
  }

  await loadStoryDetails(storyId, activeLang);
  setupPlayerControls();
}

async function loadStoryDetails(storyId, lang) {
  try {
    const data = await apiFetch(`/api/stories/${storyId}?lang=${lang}`);
    currentStory = data.story;
    currentTranslation = data.translation;

    renderStoryHeader(data.story, data.availableLangs, lang);
    renderAudioPlayer(data.translation, data.story);
    renderTranscript(data.translation);
    renderUpNext(data.upNext, lang);
  } catch (err) {
    document.getElementById('player-content').innerHTML = `
      <div style="text-align: center; padding: 4rem 1rem;">
        <h2>Story not found</h2>
        <p style="color: var(--text-muted); margin-top: 0.5rem;">${err.message}</p>
        <a href="/" class="btn-primary" style="margin-top: 1.5rem;">Return to Library</a>
      </div>
    `;
  }
}

function renderStoryHeader(story, availableLangs, currentLang) {
  document.title = `${story.title} — IsroPR`;

  const titleEl = document.getElementById('story-title');
  const summaryEl = document.getElementById('story-summary');
  const metaEl = document.getElementById('story-meta-bar');
  const langSelectEl = document.getElementById('story-lang-select');

  if (titleEl) titleEl.textContent = story.title;
  if (summaryEl) summaryEl.textContent = story.summary;

  if (metaEl) {
    metaEl.innerHTML = `
      <span class="story-badge-cat">${story.category}</span>
      ${story.facts_as_of ? `<span>Verified as of: ${formatDate(story.facts_as_of)}</span>` : ''}
      ${story.sources && story.sources.length ? `
        <a href="${story.sources[0]}" target="_blank" rel="noopener noreferrer" style="color: var(--accent-cyan); text-decoration: none;">
          Official Source ↗
        </a>
      ` : ''}
    `;
  }

  // Language selector
  if (langSelectEl) {
    langSelectEl.innerHTML = '';
    const allLangs = [
      { code: 'en-IN', label: 'English' },
      { code: 'hi-IN', label: 'हिन्दी (Hindi)' },
      { code: 'ta-IN', label: 'தமிழ் (Tamil)' },
      { code: 'te-IN', label: 'తెలుగు (Telugu)' },
      { code: 'bn-IN', label: 'বাংলা (Bengali)' }
    ];

    for (const l of allLangs) {
      const opt = document.createElement('option');
      opt.value = l.code;
      const hasAudio = availableLangs.some(a => a.lang === l.code && a.audio_ready);
      opt.textContent = `${l.label} ${hasAudio ? '🎧' : '📖'}`;
      if (l.code === currentLang) opt.selected = true;
      langSelectEl.appendChild(opt);
    }

    langSelectEl.onchange = (e) => {
      const newLang = e.target.value;
      setActiveLang(newLang);
      const currentTime = audio ? audio.currentTime : 0;
      window.location.href = `/story.html?id=${story.id}&lang=${newLang}&seek=${Math.floor(currentTime)}`;
    };
  }
}

function renderAudioPlayer(translation, story) {
  const playerContainer = document.getElementById('audio-player-container');
  if (!playerContainer) return;

  if (!translation || !translation.audio_path || translation.audio_status !== 'ready') {
    playerContainer.innerHTML = `
      <div style="background: var(--bg-card); padding: 1.5rem; border-radius: var(--radius-lg); border: 1px solid var(--border-subtle); text-align: center;">
        <p style="color: var(--text-muted); font-size: 0.95rem;">
          🎧 Audio is currently generating for this language. You can read the complete transcript below!
        </p>
      </div>
    `;
    return;
  }

  audio = new Audio(translation.audio_path);
  audio.preload = 'none';

  // Restore saved playback speed
  const savedSpeed = parseFloat(localStorage.getItem(STORAGE_KEYS.PLAYBACK_SPEED) || '1');
  audio.playbackRate = savedSpeed;

  playerContainer.innerHTML = `
    <div class="space-player-box" id="player-box">
      <div class="player-controls-row">
        <button id="btn-skip-back" class="player-btn-secondary" title="Skip back 15s" aria-label="Skip back 15 seconds">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 19l-9-7 9-7v14zM22 19l-9-7 9-7v14z"/><text x="12" y="16" font-size="8" fill="currentColor">15</text></svg>
        </button>

        <button id="btn-play-pause" class="player-btn-main" title="Play or Pause" aria-label="Play">
          <svg id="icon-play" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          <svg id="icon-pause" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style="display: none;"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
        </button>

        <button id="btn-skip-forward" class="player-btn-secondary" title="Skip forward 15s" aria-label="Skip forward 15 seconds">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 19l9-7-9-7v14zM2 19l9-7-9-7v14z"/><text x="6" y="16" font-size="8" fill="currentColor">15</text></svg>
        </button>

        <div class="player-timeline">
          <span id="player-current-time" class="time-label">0:00</span>
          <input type="range" id="player-seek" min="0" max="100" value="0" step="0.1" class="seek-slider" aria-label="Audio progress bar" />
          <span id="player-total-time" class="time-label">${formatDuration(translation.audio_duration_sec)}</span>
        </div>

        <div class="player-speed-toggle">
          <button id="btn-speed" class="speed-btn">${savedSpeed}x</button>
        </div>
      </div>
    </div>
  `;

  // Media Session API for lock screen controls per spec 6.2
  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: story.title,
      artist: 'IsroPR (Official Outreach)',
      album: 'IsroPR Audio Stories'
    });

    navigator.mediaSession.setActionHandler('play', () => audio.play());
    navigator.mediaSession.setActionHandler('pause', () => audio.pause());
    navigator.mediaSession.setActionHandler('seekbackward', () => { audio.currentTime = Math.max(0, audio.currentTime - 15); });
    navigator.mediaSession.setActionHandler('seekforward', () => { audio.currentTime = Math.min(audio.duration, audio.currentTime + 15); });
  }

  setupAudioEvents(translation);
}

function setupAudioEvents(translation) {
  const playBtn = document.getElementById('btn-play-pause');
  const iconPlay = document.getElementById('icon-play');
  const iconPause = document.getElementById('icon-pause');
  const skipBackBtn = document.getElementById('btn-skip-back');
  const skipFwdBtn = document.getElementById('btn-skip-forward');
  const seekSlider = document.getElementById('player-seek');
  const currentTimeEl = document.getElementById('player-current-time');
  const totalTimeEl = document.getElementById('player-total-time');
  const speedBtn = document.getElementById('btn-speed');

  playBtn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play();
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

  skipBackBtn.addEventListener('click', () => {
    audio.currentTime = Math.max(0, audio.currentTime - 15);
  });

  skipFwdBtn.addEventListener('click', () => {
    audio.currentTime = Math.min(audio.duration || 9999, audio.currentTime + 15);
  });

  audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    seekSlider.value = pct;
    currentTimeEl.textContent = formatDuration(audio.currentTime);
  });

  audio.addEventListener('loadedmetadata', () => {
    totalTimeEl.textContent = formatDuration(audio.duration);
    // Check if URL requested a seek position
    const seekParam = new URLSearchParams(window.location.search).get('seek');
    if (seekParam) {
      audio.currentTime = parseFloat(seekParam);
    }
  });

  seekSlider.addEventListener('input', (e) => {
    if (!audio.duration) return;
    const targetTime = (e.target.value / 100) * audio.duration;
    audio.currentTime = targetTime;
  });

  // Speed cycler: 0.75x -> 1x -> 1.25x -> 1.5x -> 0.75x
  const speeds = [0.75, 1, 1.25, 1.5];
  speedBtn.addEventListener('click', () => {
    const curIdx = speeds.indexOf(audio.playbackRate);
    const nextIdx = (curIdx + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    audio.playbackRate = nextSpeed;
    speedBtn.textContent = `${nextSpeed}x`;
    localStorage.setItem(STORAGE_KEYS.PLAYBACK_SPEED, nextSpeed);
  });
}

function renderTranscript(translation) {
  const container = document.getElementById('transcript-container');
  if (!container) return;

  if (!translation || !translation.body) {
    container.innerHTML = `<p style="color: var(--text-dim);">No transcript available yet in this language.</p>`;
    return;
  }

  // Split into paragraphs
  const paragraphs = translation.body.split(/\n\s*\n/).filter(p => p.trim());
  const html = paragraphs.map(p => `<p class="transcript-p">${p.trim()}</p>`).join('');
  container.innerHTML = html;
}

function renderUpNext(upNextList, lang) {
  const container = document.getElementById('up-next-grid');
  if (!container || !upNextList || !upNextList.length) return;

  container.innerHTML = upNextList.map(s => `
    <a href="/story.html?id=${s.id}&lang=${lang}" class="up-next-card">
      <div class="up-next-info">
        <span class="story-badge-cat" style="display:inline-block; margin-bottom: 0.35rem;">${s.category}</span>
        <h4 style="color: var(--text-main); font-size: 0.95rem; margin-bottom: 0.25rem;">${s.title}</h4>
        <p style="color: var(--text-muted); font-size: 0.8rem; line-height: 1.4;">${s.summary.slice(0, 90)}...</p>
      </div>
    </a>
  `).join('');
}

function setupPlayerControls() {
  const toggleBtn = document.getElementById('btn-toggle-transcript');
  const transcriptWrap = document.getElementById('transcript-wrapper');
  if (toggleBtn && transcriptWrap) {
    toggleBtn.addEventListener('click', () => {
      const isHidden = transcriptWrap.style.display === 'none';
      transcriptWrap.style.display = isHidden ? 'block' : 'none';
      toggleBtn.textContent = isHidden ? 'Hide Transcript' : 'View Transcript';
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPlayer);
} else {
  initPlayer();
}
