// Spotify-style Global Audio Engine & Persistent Background Player
import { formatDuration, getActiveLang } from './common.js';

let audio = null;
let state = {
  storyId: 'chandrayaan-3',
  title: 'Chandrayaan-3: 15 Minutes of Terror & The South Pole Triumph',
  subtitle: 'ISRO Official Outreach • Lunar Landing Podcast',
  coverSrc: '',
  audioSrc: '/media/audio/stories/chandrayaan-3/hi-IN.wav',
  duration: 180,
  currentTime: 0,
  isPlaying: false,
  playbackRate: 1
};

const listeners = new Set();

export function getAudioState() {
  return state;
}

export function subscribeAudioState(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notifyState() {
  for (const fn of listeners) {
    try { fn(state); } catch (e) { console.error('Listener err:', e); }
  }
}

export function initGlobalPlayer() {
  if (!audio) {
    // Check if an audio element already exists
    let existing = document.getElementById('isro-global-audio');
    if (!existing) {
      existing = document.createElement('audio');
      existing.id = 'isro-global-audio';
      existing.preload = 'metadata';
      document.body.appendChild(existing);
    }
    audio = existing;

    // Load saved state or default
    const saved = localStorage.getItem('isro_player_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        state = { ...state, ...parsed, isPlaying: false };
      } catch (e) {}
    }

    // Determine default audio src based on active language
    const lang = getActiveLang();
    const langCode = lang.includes('-') ? lang : `${lang}-IN`;
    state.audioSrc = `/media/audio/stories/chandrayaan-3/${langCode}.wav`;
    if (!audio.src) {
      audio.src = state.audioSrc;
    }

    setupAudioListeners();
  }

  injectSpotifyBar();
  setupSpaNavigation();
  updateBarUI();
}

function setupAudioListeners() {
  audio.addEventListener('play', () => {
    state.isPlaying = true;
    notifyState();
    updateBarUI();
  });

  audio.addEventListener('pause', () => {
    state.isPlaying = false;
    notifyState();
    updateBarUI();
  });

  audio.addEventListener('timeupdate', () => {
    state.currentTime = audio.currentTime;
    state.duration = audio.duration || state.duration || 180;
    notifyState();
    updateTimelineUI();
  });

  audio.addEventListener('ended', () => {
    state.isPlaying = false;
    state.currentTime = 0;
    audio.currentTime = 0;
    notifyState();
    updateBarUI();
  });

  audio.addEventListener('loadedmetadata', () => {
    if (audio.duration && !isNaN(audio.duration)) {
      state.duration = audio.duration;
    }
    notifyState();
    updateTimelineUI();
  });
}

export async function playStory(storyId = 'chandrayaan-3', lang = null) {
  const activeLang = lang || getActiveLang();
  const langCode = activeLang.includes('-') ? activeLang : `${activeLang}-IN`;
  const audioFile = `${langCode}.wav`;
  const audioUrl = `/media/audio/stories/${storyId}/${audioFile}`;

  state.storyId = storyId;
  state.audioSrc = audioUrl;
  state.title = 'Chandrayaan-3: 15 Minutes of Terror & The South Pole Triumph';
  state.subtitle = langCode.startsWith('hi') 
    ? 'इसरो आधिकारिक ऑडियो पॉडकास्ट • 3 मिनट' 
    : 'ISRO Official Outreach • 3 Min Podcast';

  if (!audio.src || !audio.src.includes(audioFile)) {
    audio.src = audioUrl;
  }

  try {
    await audio.play();
    state.isPlaying = true;
  } catch (err) {
    console.log('Play prevented or deferred:', err.message);
  }

  // Save state
  localStorage.setItem('isro_player_state', JSON.stringify({
    storyId: state.storyId,
    title: state.title,
    subtitle: state.subtitle,
    currentTime: audio.currentTime
  }));

  notifyState();
  updateBarUI();
}

export function togglePlay() {
  if (!audio) return;
  if (audio.paused) {
    audio.play().catch(e => console.log('Play error:', e.message));
  } else {
    audio.pause();
  }
}

export function seek(seconds) {
  if (!audio) return;
  audio.currentTime = Math.max(0, Math.min(seconds, audio.duration || state.duration));
}

export function skip(deltaSeconds) {
  if (!audio) return;
  audio.currentTime = Math.max(0, Math.min(audio.currentTime + deltaSeconds, audio.duration || state.duration));
}

export function setPlaybackSpeed(speed) {
  if (!audio) return;
  audio.playbackRate = speed;
  state.playbackRate = speed;
  notifyState();
  updateBarUI();
}

function injectSpotifyBar() {
  if (document.getElementById('spotify-player-bar')) return;

  const isDedicatedStoryPage = window.location.pathname.includes('story.html') || window.location.pathname.startsWith('/story/');

  const bar = document.createElement('div');
  bar.id = 'spotify-player-bar';
  bar.className = 'spotify-player-bar';
  bar.setAttribute('role', 'region');
  bar.setAttribute('aria-label', 'Persistent Audio Player');
  if (isDedicatedStoryPage) {
    bar.style.display = 'none';
  }

  bar.innerHTML = `
    <!-- Left: Track info -->
    <div class="sp-track-info">
      <div class="sp-thumb-wrap">
        <img src="/media/covers/chandrayaan-3-navcam.png?v=navcam_20230827" alt="Chandrayaan-3 Poster" class="sp-thumb-img" onerror="this.src='/media/covers/chandrayaan-3-cover.jpg';" />
        <div class="sp-thumb-fallback" style="display: none;"><img src="/images/isropr-logo.jpg" alt="IsroPR" style="width: 100%; height: 100%; object-fit: cover;"></div>
      </div>
      <div class="sp-meta">
        <a href="/story.html?id=chandrayaan-3" class="sp-title" id="sp-track-title">Chandrayaan-3: 15 Minutes of Terror</a>
        <span class="sp-subtitle" id="sp-track-subtitle">ISRO Outreach • 3 Min Audio Story</span>
      </div>
      <div class="sp-equalizer" id="sp-equalizer" title="Playing">
        <span></span><span></span><span></span>
      </div>
    </div>

    <!-- Center: Playback Controls & Timeline -->
    <div class="sp-center">
      <div class="sp-controls">
        <button id="sp-btn-skip-back" class="sp-ctrl-btn" title="Skip back 15s" aria-label="Skip back 15 seconds">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 19l-9-7 9-7v14zM22 19l-9-7 9-7v14z"/><text x="11.5" y="16" font-size="7.5" fill="currentColor">15</text></svg>
        </button>

        <button id="sp-btn-play-pause" class="sp-play-main" title="Play or Pause" aria-label="Play">
          <svg id="sp-icon-play" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          <svg id="sp-icon-pause" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style="display: none;"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
        </button>

        <button id="sp-btn-skip-fwd" class="sp-ctrl-btn" title="Skip forward 15s" aria-label="Skip forward 15 seconds">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 19l9-7-9-7v14zM2 19l9-7-9-7v14z"/><text x="6" y="16" font-size="7.5" fill="currentColor">15</text></svg>
        </button>
      </div>

      <div class="sp-timeline">
        <span id="sp-cur-time" class="sp-time">0:00</span>
        <div class="sp-slider-wrap">
          <input type="range" id="sp-seek-slider" min="0" max="100" value="0" step="0.1" class="sp-seek-slider" aria-label="Seek track position" />
        </div>
        <span id="sp-total-time" class="sp-time">3:00</span>
      </div>
    </div>

    <!-- Right: Speed & Fullscreen -->
    <div class="sp-right">
      <button id="sp-speed-toggle" class="sp-speed-pill" title="Playback speed">1x</button>
      <a href="/story.html?id=chandrayaan-3" class="sp-expand-link" title="Open Full Audio View" aria-label="Full Story View">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
      </a>
    </div>
  `;

  document.body.appendChild(bar);
  document.body.classList.add('has-spotify-bar');

  // Attach controls
  const playBtn = document.getElementById('sp-btn-play-pause');
  const backBtn = document.getElementById('sp-btn-skip-back');
  const fwdBtn = document.getElementById('sp-btn-skip-fwd');
  const seekSlider = document.getElementById('sp-seek-slider');
  const speedBtn = document.getElementById('sp-speed-toggle');

  playBtn.addEventListener('click', togglePlay);
  backBtn.addEventListener('click', () => skip(-15));
  fwdBtn.addEventListener('click', () => skip(15));

  seekSlider.addEventListener('input', (e) => {
    if (!audio) return;
    const dur = audio.duration || state.duration || 180;
    const target = (parseFloat(e.target.value) / 100) * dur;
    seek(target);
  });

  const speeds = [0.75, 1, 1.25, 1.5];
  speedBtn.addEventListener('click', () => {
    const curIdx = speeds.indexOf(state.playbackRate);
    const nextIdx = (curIdx + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIdx]);
  });
}

function updateBarUI() {
  const isDedicatedStoryPage = window.location.pathname.includes('story.html') || window.location.pathname.startsWith('/story/');
  const bar = document.getElementById('spotify-player-bar');
  if (bar) {
    bar.style.display = isDedicatedStoryPage ? 'none' : 'flex';
  }

  const iconPlay = document.getElementById('sp-icon-play');
  const iconPause = document.getElementById('sp-icon-pause');
  const eq = document.getElementById('sp-equalizer');
  const speedBtn = document.getElementById('sp-speed-toggle');
  const titleEl = document.getElementById('sp-track-title');
  const subtitleEl = document.getElementById('sp-track-subtitle');

  if (iconPlay && iconPause) {
    iconPlay.style.display = state.isPlaying ? 'none' : 'block';
    iconPause.style.display = state.isPlaying ? 'block' : 'none';
  }

  if (eq) {
    eq.style.display = state.isPlaying ? 'inline-flex' : 'none';
  }

  if (speedBtn) {
    speedBtn.textContent = `${state.playbackRate}x`;
  }

  if (titleEl && state.title) titleEl.textContent = state.title;
  if (subtitleEl && state.subtitle) subtitleEl.textContent = state.subtitle;

  // Sync card play buttons across the page
  document.querySelectorAll('.card-play-fab, .btn-listen-instant').forEach(btn => {
    if (state.isPlaying) {
      btn.classList.add('playing');
    } else {
      btn.classList.remove('playing');
    }
  });
}

function updateTimelineUI() {
  const curEl = document.getElementById('sp-cur-time');
  const totalEl = document.getElementById('sp-total-time');
  const slider = document.getElementById('sp-seek-slider');

  if (curEl) curEl.textContent = formatDuration(state.currentTime);
  if (totalEl) totalEl.textContent = formatDuration(state.duration);

  if (slider && state.duration > 0) {
    const pct = (state.currentTime / state.duration) * 100;
    slider.value = pct;
  }
}

/**
 * Client-Side SPA Shell Navigation:
 * Intercepts internal link clicks so navigation between Library, Space Chat,
 * About, and Story views never interrupts background audio playback!
 */
function setupSpaNavigation() {
  document.addEventListener('click', async (e) => {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('data:') || href.startsWith('mailto:') || href.startsWith('/admin')) {
      return; // External or non-nav link
    }

    // Do not intercept if new tab requested
    if (link.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey) return;

    // Same-page anchor clicks (e.g. href="#audio-stories")
    if (href.startsWith('#')) {
      const targetId = href.substring(1);
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        try {
          history.pushState(null, '', href);
        } catch (_) {}
      }
      return;
    }

    e.preventDefault();
    await navigateSpa(href);
  });

  window.addEventListener('popstate', async () => {
    await navigateSpa(window.location.pathname + window.location.search + window.location.hash, false);
  });
}

async function navigateSpa(url, push = true) {
  try {
    const [pathOnly, targetHash] = url.split('#');
    const cleanPath = pathOnly || '/';

    const res = await fetch(cleanPath);
    if (!res.ok) {
      window.location.href = url;
      return;
    }

    const htmlText = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, 'text/html');

    // Update document title
    if (doc.title) document.title = doc.title;

    // Swap <main> content with smooth cross-fade
    const currentMain = document.querySelector('main');
    const newMain = doc.querySelector('main');
    if (currentMain && newMain) {
      currentMain.style.transition = 'opacity 0.15s ease, transform 0.15s ease';
      currentMain.style.opacity = '0';
      currentMain.style.transform = 'translateY(4px)';
      await new Promise(r => setTimeout(r, 140));

      newMain.style.opacity = '0';
      newMain.style.transform = 'translateY(4px)';
      newMain.style.transition = 'opacity 0.22s cubic-bezier(0.16, 1, 0.3, 1), transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)';
      currentMain.replaceWith(newMain);
      requestAnimationFrame(() => {
        newMain.style.opacity = '1';
        newMain.style.transform = 'translateY(0)';
      });
    }

    // Update active nav links
    const newNavLinks = doc.querySelectorAll('.nav-links a');
    const currentNavLinks = document.querySelectorAll('.nav-links a');
    currentNavLinks.forEach((l, idx) => {
      if (newNavLinks[idx]) {
        l.className = newNavLinks[idx].className;
      }
    });

    if (push) {
      window.history.pushState(null, '', url);
    }

    // If targetHash exists, scroll directly to that element; otherwise top
    if (targetHash) {
      setTimeout(() => {
        const targetEl = document.getElementById(targetHash);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 180);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Re-initialize view scripts
    if (cleanPath.includes('/chat.html')) {
      const { initChat } = await import('./chat.js');
      initChat();
    } else if (cleanPath.includes('/story.html')) {
      const { initPlayer } = await import('./player.js');
      initPlayer();
    } else if (cleanPath === '/' || cleanPath.endsWith('/index.html') || cleanPath === '') {
      const { initLibrary } = await import('./library.js');
      initLibrary();
    }

    // Ensure Spotify bar remains synced
    injectSpotifyBar();
    updateBarUI();
  } catch (err) {
    console.error('SPA navigation failed, falling back to full load:', err);
    window.location.href = url;
  }
}
