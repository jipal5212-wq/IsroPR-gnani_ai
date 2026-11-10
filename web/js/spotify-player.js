// Spotify-style Global Audio Engine & Persistent Background Player
import { formatDuration, getActiveLang } from './common.js';

export const STORY_COVERS = {
  'chandrayaan-3': '/media/covers/chandrayaan-3-cover.jpg',
  'mangalyaan': '/media/covers/mangalyaan-cover.jpg',
  'nvs-03': '/media/covers/nvs-03-cover.jpg',
  'everest-indian-ffsc': '/media/covers/everest-ffsc-cover.jpg?v=3'
};

export const STORY_DURATIONS = {
  'chandrayaan-3': 180,
  'mangalyaan': 180,
  'nvs-03': 540,
  'everest-indian-ffsc': 624
};

let audio = null;
let state = {
  storyId: 'chandrayaan-3',
  lang: 'en-IN',
  title: 'Chandrayaan-3: 15 Minutes of Terror & The South Pole Triumph',
  subtitle: 'ISRO Official Outreach • Lunar Landing Podcast',
  coverSrc: STORY_COVERS['chandrayaan-3'],
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
    if (!state.coverSrc) {
      state.coverSrc = STORY_COVERS[state.storyId] || '/media/covers/chandrayaan-3-cover.jpg';
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

let lastRecordedPlay = { storyId: null, timestamp: 0 };

function recordStoryPlayback(storyId) {
  if (!storyId) return;
  const now = Date.now();
  // Strictly prevent duplicate triggers: ignore if called again for the same story within 2 seconds
  if (lastRecordedPlay.storyId === storyId && (now - lastRecordedPlay.timestamp) < 2000) {
    return;
  }
  lastRecordedPlay = { storyId, timestamp: now };

  fetch(`/api/stories/${storyId}/play`, { method: 'POST' })
    .then(r => r.json())
    .then(data => {
      if (data && data.play_count !== undefined) {
        const count = Number(data.play_count);
        const playText = count === 1 ? '🎧 1 play' : `🎧 ${count.toLocaleString()} plays`;
        const pillText = count === 1 ? '1 play' : `${count.toLocaleString()} plays`;

        // Update shelf plays
        document.querySelectorAll(`.shelf-plays[data-story-id="${storyId}"]`).forEach(el => {
          el.innerHTML = playText;
        });

        // Update story card pill (preserving headphone SVG icon)
        document.querySelectorAll(`.card-play-count[data-story-id="${storyId}"]`).forEach(el => {
          el.innerHTML = `
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>
            ${pillText}
          `;
          el.setAttribute('title', `${count.toLocaleString()} listens recorded`);
        });

        // Update dedicated story page play count
        const pagePlayEl = document.getElementById('story-play-count');
        if (pagePlayEl && state.storyId === storyId) {
          pagePlayEl.textContent = `${count.toLocaleString()}`;
        }
      }
      if (data && data.totalPlays !== undefined) {
        const playsEl = document.getElementById('telemetry-plays');
        const playsLabel = document.getElementById('telemetry-plays-label');
        if (playsEl) {
          playsEl.textContent = Number(data.totalPlays).toLocaleString();
        }
        if (playsLabel) {
          playsLabel.textContent = Number(data.totalPlays) === 1 ? 'Audio Listen' : 'Audio Listens';
        }
      }
    })
    .catch(() => {});
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
    if (audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
      state.duration = audio.duration;
    } else if (!state.duration) {
      state.duration = STORY_DURATIONS[state.storyId] || 180;
    }
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
    if (audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
      state.duration = audio.duration;
    } else {
      state.duration = STORY_DURATIONS[state.storyId] || 180;
    }
    notifyState();
    updateTimelineUI();
  });

  audio.addEventListener('error', (e) => {
    console.warn('Audio playback error, attempting fallback:', e);
    // If specific language failed, fallback to English narration
    if (state.audioSrc && !state.audioSrc.includes('en-IN')) {
      const fallbackSrc = state.audioSrc.replace(/\/[a-z]{2}-IN\.(mp3|wav)/i, '/en-IN.mp3');
      if (fallbackSrc !== state.audioSrc) {
        state.audioSrc = fallbackSrc;
        audio.src = fallbackSrc;
        audio.load();
        audio.play().catch(() => {});
        return;
      }
    }
    state.isPlaying = false;
    notifyState();
    updateBarUI();
  });
}

let currentPlaySession = 0;

export async function playStory(storyId = 'chandrayaan-3', lang = null, metadata = {}) {
  const sessionId = ++currentPlaySession;

  const activeLang = lang || getActiveLang();
  const langCode = activeLang.includes('-') ? activeLang : `${activeLang}-IN`;
  const audioFolder = storyId === 'everest-indian-ffsc' ? 'everest-ffsc' : storyId;
  const audioExt = (storyId === 'everest-indian-ffsc' || storyId === 'mangalyaan' || !langCode.startsWith('hi')) ? 'mp3' : 'wav';
  
  let audioUrl = metadata.audioPath || `/media/audio/stories/${audioFolder}/${langCode}.${audioExt}`;
  if (!audioUrl.includes('?')) {
    audioUrl += '?v=ml2';
  } else {
    audioUrl = audioUrl.replace(/(\?|&)v=[^&]*/, '$1v=ml2');
  }

  // Immediately silence and reset any currently playing audio so there is zero overlap
  if (audio) {
    try {
      audio.pause();
    } catch (_) {}
  }

  state.storyId = storyId;
  state.lang = langCode;
  state.audioSrc = audioUrl;

  const defaultDuration = (storyId === 'nvs-03') 
    ? (langCode.startsWith('ml') ? 374 : langCode.startsWith('en') ? 510 : 540)
    : (storyId === 'everest-indian-ffsc')
      ? (langCode.startsWith('hi') ? 624 : langCode.startsWith('ta') ? 520 : langCode.startsWith('kn') ? 514 : langCode.startsWith('te') ? 481 : langCode.startsWith('bn') ? 478 : langCode.startsWith('en') ? 436 : 397)
      : (storyId === 'mangalyaan')
        ? (langCode.startsWith('ml') ? 154 : 180)
        : (storyId === 'chandrayaan-3')
          ? (langCode.startsWith('ml') ? 192 : 180)
          : (STORY_DURATIONS[storyId] || 180);
  const targetDuration = metadata.duration || defaultDuration;

  // Set duration strictly to the target story's duration, NOT the previous story's duration
  state.duration = targetDuration;
  state.currentTime = 0;

  if (metadata.title) {
    state.title = metadata.title;
  } else if (storyId === 'mangalyaan') {
    state.title = "Mangalyaan: India's Historic Journey to Mars";
  } else if (storyId === 'nvs-03') {
    state.title = 'NVS-03: NavIC Constellation & The Pyro Valve Gambit';
  } else if (storyId === 'everest-indian-ffsc') {
    state.title = 'EVEREST: The Indian FFSC';
  } else {
    state.title = 'Chandrayaan-3: 15 Minutes of Terror & The South Pole Triumph';
  }

  if (metadata.subtitle) {
    state.subtitle = metadata.subtitle;
  } else if (storyId === 'everest-indian-ffsc') {
    state.subtitle = langCode.startsWith('hi')
      ? 'एस्ट्रोबेस स्पेस • भारत का पहला फुल-फ्लो रॉकेट इंजन (10 मिनट)'
      : langCode.startsWith('ta')
      ? 'ஆஸ்ட்ரோபேஸ் ஸ்பேஸ் • இந்தியாவின் முதல் எஃப்.எஃப்.எஸ்.சி எஞ்சின்'
      : langCode.startsWith('te')
      ? 'ఆస్ట్రోబేస్ స్పేస్ • భారతదేశపు మొదటి ఎఫ్.ఎఫ్.ఎస్.సి ఇంజిన్'
      : langCode.startsWith('bn')
      ? 'অ্যাস্ট্রোবেস স্পেস • ভারতের প্রথম ফুল-ফ্লো রকেট ইঞ্জিন'
      : langCode.startsWith('kn')
      ? 'ಆಸ್ಟ್ರೋಬೇಸ್ ಸ್ಪೇಸ್ • ಭಾರತದ ಮೊದಲ ಎಫ್.ಎಫ್.ಎಸ್.ಸಿ ಎಂಜಿನ್'
      : (langCode.startsWith('ml')
          ? 'ആസ്ട്രോബേസ് • ഇന്ത്യയുടെ ആദ്യ എഫ്.എഫ്.എസ്.സി എഞ്ചിൻ (7 മിനിറ്റ്)'
          : 'Astrobase Space • India\'s First FFSC Methalox Rocket Engine');
  } else if (storyId === 'mangalyaan') {
    state.subtitle = langCode.startsWith('hi') 
      ? 'इसरो आधिकारिक ऑडियो पॉडकास्ट • मंगलयान' 
      : (langCode.startsWith('ml')
          ? 'ഐ.എസ്.ആർ.ഒ ഔദ്യോഗിക ഓഡിയോ പോഡ്കാസ്റ്റ് • മംഗൾയാൻ (3 മിനിറ്റ്)'
          : 'ISRO Official Outreach • Mars Orbiter Mission');
  } else if (storyId === 'nvs-03') {
    state.subtitle = langCode.startsWith('hi') 
      ? 'इसरो आधिकारिक ऑडियो पॉडकास्ट • 9 मिनट' 
      : (langCode.startsWith('ml')
          ? 'ഐ.എസ്.ആർ.ഒ ഔദ്യോഗിക ഓഡിയോ പോഡ്കാസ്റ്റ് • നാവിക് എൻവിഎസ്-03 (9 മിനിറ്റ്)'
          : `ISRO Official Outreach • GSLV-F18 / NavIC (${langCode.split('-')[0].toUpperCase()})`);
  } else {
    state.subtitle = langCode.startsWith('hi') 
      ? 'इसरो आधिकारिक ऑडियो पॉडकास्ट • 3 मिनट' 
      : (langCode.startsWith('ml')
          ? 'ഐ.എസ്.ആർ.ഒ ഔദ്യോഗിക ഓഡിയോ പോഡ്കാസ്റ്റ് • ചന്ദ്രയാൻ-3 (3 മിനിറ്റ്)'
          : 'ISRO Official Outreach • 3 Min Podcast');
  }

  // Resolve cover image for chosen story
  if (metadata.coverSrc || metadata.cover) {
    state.coverSrc = metadata.coverSrc || metadata.cover;
  } else {
    state.coverSrc = STORY_COVERS[storyId] || `/media/covers/${storyId}-cover.jpg`;
  }

  // Update full view link
  const expandLink = document.querySelector('.sp-expand-link');
  if (expandLink) {
    expandLink.href = `/story.html?id=${storyId}`;
  }

  // Immediately notify UI so all cards, bars, and titles update in 0ms
  notifyState();
  updateBarUI();
  updateTimelineUI();

  // Load new audio source cleanly
  audio.src = audioUrl;
  audio.currentTime = 0;
  audio.load();

  try {
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      await playPromise;
    }
    // If user clicked another story while loading, discard this session
    if (sessionId !== currentPlaySession) return;
    state.isPlaying = true;
    notifyState();
    updateBarUI();

    // Record real playback metrics on backend (single call, debounced)
    if (!metadata.isLanguageSwitch) {
      recordStoryPlayback(storyId);
    }
  } catch (err) {
    if (sessionId !== currentPlaySession) return;
    if (err.name !== 'AbortError') {
      console.warn('Play prevented or deferred:', err.message);
    }
  }

  // Save state
  localStorage.setItem('isro_player_state', JSON.stringify({
    storyId: state.storyId,
    lang: state.lang,
    title: state.title,
    subtitle: state.subtitle,
    coverSrc: state.coverSrc,
    currentTime: 0
  }));
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
    <!-- Top Live Progress Bar for Mobile / Mini Mode -->
    <div class="sp-mini-progress-track" aria-hidden="true">
      <div class="sp-mini-progress-fill" id="sp-mini-progress-fill" style="width: 0%;"></div>
    </div>

    <!-- Left: Track info -->
    <div class="sp-track-info">
      <a href="/story.html?id=${state.storyId}" class="sp-thumb-wrap" title="View story details">
        <img src="${state.coverSrc || STORY_COVERS[state.storyId] || '/media/covers/chandrayaan-3-cover.jpg'}" alt="${state.title || 'Space Mission'} Poster" class="sp-thumb-img" onerror="this.src='/images/isropr-logo.jpg';" />
      </a>
      <div class="sp-meta">
        <a href="/story.html?id=${state.storyId}" class="sp-title" id="sp-track-title">${state.title || 'Chandrayaan-3: 15 Minutes of Terror'}</a>
        <span class="sp-subtitle" id="sp-track-subtitle">${state.subtitle || 'ISRO Outreach • 3 Min Audio Story'}</span>
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
        <span id="sp-total-time" class="sp-time">${formatDuration(state.duration || 180)}</span>
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

  // Always show image of current thing playing
  const thumbImg = document.querySelector('.sp-thumb-img');
  const targetCover = state.coverSrc || STORY_COVERS[state.storyId] || '/media/covers/chandrayaan-3-cover.jpg';
  if (thumbImg) {
    if (!thumbImg.src.endsWith(targetCover)) {
      thumbImg.src = targetCover;
    }
    thumbImg.alt = `${state.title || 'Space Mission'} Artwork`;
  }

  // Update links to point to currently playing story
  const currentStoryLinks = document.querySelectorAll('.sp-expand-link, .sp-title, .sp-thumb-wrap');
  currentStoryLinks.forEach(el => {
    if (el && el.tagName === 'A') {
      el.href = `/story.html?id=${state.storyId}`;
    }
  });

  // Sync card and shelf play buttons across the page
  document.querySelectorAll('.card-play-fab, .btn-listen-instant, .shelf-play-fab, .station-card').forEach(btn => {
    const btnStoryId = btn.dataset.storyId || btn.closest('[data-story-id]')?.dataset.storyId;
    if (state.isPlaying && btnStoryId === state.storyId) {
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
  const miniFill = document.getElementById('sp-mini-progress-fill');

  if (curEl) curEl.textContent = formatDuration(state.currentTime);
  if (totalEl) totalEl.textContent = formatDuration(state.duration);

  if (state.duration > 0) {
    const pct = (state.currentTime / state.duration) * 100;
    if (slider) slider.value = pct;
    if (miniFill) miniFill.style.width = `${pct}%`;
  }
}

/**
 * Client-Side SPA Shell Navigation:
 * Intercepts internal link clicks so navigation between Library, Space Chat,
 * and Story views never interrupts background audio playback!
 */
let isNavScrolling = false;
let navScrollTimeout = null;
let spaNavigationInitialized = false;
let isNavigating = false;

export function lockNavScroll(duration = 1200) {
  isNavScrolling = true;
  if (navScrollTimeout) clearTimeout(navScrollTimeout);
  navScrollTimeout = setTimeout(() => {
    isNavScrolling = false;
  }, duration);
}

export function isNavClickScrolling() {
  return isNavScrolling;
}

export function updateActiveNavLinks(targetUrl) {
  const currentPath = targetUrl?.pathname || window.location.pathname;
  const currentHash = targetUrl?.hash || window.location.hash;
  const isHome = currentPath === '/' || currentPath.endsWith('/index.html') || currentPath === '';

  const navLinks = document.querySelectorAll('.nav-links a');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    try {
      const linkUrl = new URL(href, window.location.origin);
      const linkPath = linkUrl.pathname;
      const linkHash = linkUrl.hash;

      let isActive = false;
      if (isHome) {
        if (currentHash === '#upcoming-missions') {
          isActive = linkHash === '#upcoming-missions';
        } else if (currentHash === '#audio-stories') {
          isActive = linkHash === '#audio-stories';
        } else {
          isActive = (linkPath === '/' || linkPath.endsWith('/index.html')) && !linkHash;
        }
      } else {
        isActive = (currentPath === linkPath || (currentPath.endsWith('/chat.html') && linkPath.endsWith('/chat.html'))) && !linkHash;
      }

      if (isActive) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    } catch (_) {}
  });
}

function setupSpaNavigation() {
  if (spaNavigationInitialized) return;
  spaNavigationInitialized = true;

  document.addEventListener('click', async (e) => {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href || href.startsWith('data:') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:') || href.startsWith('/admin')) {
      return; // Non-SPA link
    }

    // Do not intercept if new tab requested or modifier pressed
    if (link.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey) return;

    let targetUrl;
    try {
      targetUrl = new URL(href, window.location.href);
    } catch (_) {
      return;
    }

    // Only intercept same origin links
    if (targetUrl.origin !== window.location.origin) return;

    const currentUrl = new URL(window.location.href);
    const isCurrentHome = currentUrl.pathname === '/' || currentUrl.pathname.endsWith('/index.html') || currentUrl.pathname === '';
    const isTargetHome = targetUrl.pathname === '/' || targetUrl.pathname.endsWith('/index.html') || targetUrl.pathname === '';

    // Case 1: Same page anchor navigation (e.g. #audio-stories, /#upcoming-missions from home)
    if (isCurrentHome && isTargetHome && targetUrl.search === currentUrl.search) {
      e.preventDefault();
      lockNavScroll(1200);
      updateActiveNavLinks(targetUrl);

      if (targetUrl.hash) {
        const targetId = targetUrl.hash.substring(1);
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          const headerHeight = document.querySelector('.site-header')?.offsetHeight || 72;
          const rect = targetEl.getBoundingClientRect();
          const targetTop = window.scrollY + rect.top - headerHeight - 16;
          window.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
          try {
            history.pushState(null, '', targetUrl.hash);
          } catch (_) {}
          return;
        }
      } else {
        // User clicked Library or brand logo while on home: smoothly scroll top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        try {
          history.pushState(null, '', '/');
        } catch (_) {}
        return;
      }
    }

    // Case 2: Cross-page or query navigation
    e.preventDefault();
    if (isNavigating) return;
    lockNavScroll(1500);
    updateActiveNavLinks(targetUrl);
    await navigateSpa(targetUrl.pathname + targetUrl.search + targetUrl.hash, true);
  });

  window.addEventListener('popstate', async () => {
    const currentUrl = new URL(window.location.href);
    const targetHash = currentUrl.hash ? currentUrl.hash.substring(1) : '';
    const isHomePage = currentUrl.pathname === '/' || currentUrl.pathname.endsWith('/index.html') || currentUrl.pathname === '';
    const hasStoriesGrid = !!document.getElementById('stories-grid');

    if (isHomePage && hasStoriesGrid && targetHash) {
      const targetEl = document.getElementById(targetHash);
      if (targetEl) {
        lockNavScroll(1200);
        const headerHeight = document.querySelector('.site-header')?.offsetHeight || 72;
        const rect = targetEl.getBoundingClientRect();
        const targetTop = window.scrollY + rect.top - headerHeight - 16;
        window.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
        updateActiveNavLinks(currentUrl);
        return;
      }
    }

    await navigateSpa(window.location.pathname + window.location.search + window.location.hash, false);
  });
}

async function navigateSpa(url, push = true) {
  if (isNavigating) return;
  isNavigating = true;

  try {
    const targetUrl = new URL(url, window.location.origin);
    const cleanPath = targetUrl.pathname + targetUrl.search;
    const targetHash = targetUrl.hash ? targetUrl.hash.substring(1) : '';

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

    // Immediately update navbar active state
    updateActiveNavLinks(targetUrl);

    // Sync active language selector on header
    const activeLang = getActiveLang();
    const mountedLangSelect = document.querySelector('.site-header .lang-select, #lang-select, #story-lang-select, #chat-lang-select');
    if (mountedLangSelect && activeLang) {
      mountedLangSelect.value = activeLang;
    }

    // Swap <main> content instantly without blank white flash or position jumping
    const currentMain = document.querySelector('main');
    const newMain = doc.querySelector('main');
    if (currentMain && newMain) {
      currentMain.replaceWith(newMain);

      // Snap scroll position directly to target
      if (targetHash) {
        const targetEl = newMain.querySelector('#' + targetHash);
        if (targetEl) {
          const headerHeight = document.querySelector('.site-header')?.offsetHeight || 72;
          const rect = targetEl.getBoundingClientRect();
          const targetTop = window.scrollY + rect.top - headerHeight - 16;
          window.scrollTo(0, Math.max(0, targetTop));
        } else {
          window.scrollTo(0, 0);
        }
      } else {
        window.scrollTo(0, 0);
      }
    }

    if (push) {
      window.history.pushState(null, '', url);
    }

    // Re-initialize view scripts
    if (targetUrl.pathname.includes('/chat.html')) {
      const { initChat } = await import('./chat.js');
      await initChat();
    } else if (targetUrl.pathname.includes('/story.html')) {
      const { initPlayer } = await import('./player.js');
      await initPlayer();
    } else if (targetUrl.pathname === '/' || targetUrl.pathname.endsWith('/index.html') || targetUrl.pathname === '') {
      const { initLibrary } = await import('./library.js');
      await initLibrary();
    }

    // Ensure Spotify bar remains synced and visible
    injectSpotifyBar();
    updateBarUI();
  } catch (err) {
    console.error('SPA navigation failed, falling back to full load:', err);
    window.location.href = url;
  } finally {
    isNavigating = false;
  }
}
