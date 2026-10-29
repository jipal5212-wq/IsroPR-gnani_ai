import { apiFetch, getActiveLang, setActiveLang, formatDuration, formatDate, STORAGE_KEYS } from './common.js';
import { 
  initGlobalPlayer, 
  playStory, 
  togglePlay, 
  seek, 
  skip, 
  setPlaybackSpeed, 
  getAudioState, 
  subscribeAudioState,
  STORY_DURATIONS 
} from './spotify-player.js';

let activeStoryId = 'chandrayaan-3';
let activeLang = 'en-IN';
let unsubscribe = null;

const STORY_FAST_CACHE = {
  'nvs-03': {
    id: 'nvs-03',
    title: 'NVS-03: NavIC Constellation & The Pyro Valve Gambit',
    summary: "From the 1999 Kargil GPS denial to the heartbreak of NVS-02's oxidiser valve glitch — hear how ISRO took a daring, 51-year first gamble on GSLV-F18 to secure India's sovereign navigation system in the skies.",
    cover_path: 'nvs-03-cover.jpg',
    category: 'upcoming-ongoing',
    duration_hint_min: 9,
    sources: ['https://www.isro.gov.in/NVS-03.html']
  },
  'mangalyaan': {
    id: 'mangalyaan',
    title: "Mangalyaan: India's First Mission to Mars",
    summary: "Relive India's historic Mars Orbiter Mission narrated in authentic Indian voices. How ISRO reached Mars on its maiden voyage with groundbreaking frugality.",
    cover_path: 'mangalyaan-cover.jpg',
    category: 'isro',
    duration_hint_min: 3,
    sources: ['https://www.isro.gov.in/MOM.html']
  },
  'chandrayaan-3': {
    id: 'chandrayaan-3',
    title: 'Chandrayaan-3: 15 Minutes of Terror & The South Pole Triumph',
    summary: "Relive India's historic lunar touchdown narrated in studio Indian voice. Hear how ISRO turned failure into victory at the Moon's rugged south pole.",
    cover_path: 'chandrayaan-3-cover.jpg',
    category: 'isro',
    duration_hint_min: 3,
    sources: ['https://www.isro.gov.in/Chandrayaan3.html']
  }
};

export async function initPlayer() {
  // Ensure the persistent global audio engine is running
  initGlobalPlayer();

  const urlParams = new URLSearchParams(window.location.search);
  activeStoryId = urlParams.get('id') || 'chandrayaan-3';
  activeLang = urlParams.get('lang') || getActiveLang();

  // Instant render from fast cache to prevent visual jump
  if (STORY_FAST_CACHE[activeStoryId]) {
    renderStoryMeta(STORY_FAST_CACHE[activeStoryId], [], activeLang);
  }

  setupPodcastControls();

  // Subscribe to global audio state for live synced controls
  if (unsubscribe) unsubscribe();
  unsubscribe = subscribeAudioState(syncPlayerUI);

  // Initial sync
  syncPlayerUI(getAudioState());

  await loadStoryDetails(activeStoryId, activeLang);

  // Auto-play if requested or query param autoplay=1
  if (urlParams.get('autoplay') === '1') {
    playStory(activeStoryId, activeLang);
  }
}

async function loadStoryDetails(storyId, lang) {
  try {
    const data = await apiFetch(`/api/stories/${storyId}?lang=${lang}`);
    renderStoryMeta(data.story, data.availableLangs, lang);
  } catch (err) {
    console.warn('Could not fetch story details:', err.message);
  }
}

function renderStoryMeta(story, availableLangs, currentLang) {
  document.title = `${story.title} — IsroPR Podcast`;

  const titleEl = document.getElementById('story-title');
  const summaryEl = document.getElementById('story-summary');
  const coverImg = document.getElementById('story-cover-img');
  const langSelectEl = document.getElementById('story-lang-select') || document.getElementById('lang-select');

  if (titleEl) titleEl.textContent = story.title;
  if (summaryEl) summaryEl.textContent = story.summary;
  if (coverImg && story.cover_path) {
    coverImg.src = `/media/covers/${story.cover_path}`;
    coverImg.alt = story.title || 'Space Mission Artwork';
  }

  const badgesRow = document.getElementById('story-badges-row');
  if (badgesRow) {
    const isUpcoming = story.category === 'upcoming-ongoing';
    const catLabel = isUpcoming ? 'UPCOMING / ONGOING MISSION' : story.category === 'isro' ? 'ISRO MISSION' : 'SPACE SCIENCE';
    const subLabel = story.id === 'chandrayaan-3' ? 'LUNAR LANDING' : story.id === 'mangalyaan' ? 'MARS ORBITER' : story.id === 'nvs-03' ? 'NavIC CONSTELLATION' : 'SPOTLIGHT PODCAST';
    const duration = story.duration_hint_min || 3;

    badgesRow.innerHTML = `
      <span class="podcast-badge podcast-badge-primary ${isUpcoming ? 'badge-live' : ''}">${catLabel}</span>
      <span class="podcast-badge podcast-badge-saffron">${subLabel}</span>
      <span class="podcast-badge" style="background: #f1f5f9; color: var(--text-muted); border: 1px solid var(--border-light);">${duration} MIN CONTINUOUS</span>
    `;
  }

  // Set total duration in timeline
  const durSeconds = (story.duration_hint_min || 3) * 60;
  const totalTimeEl = document.getElementById('player-total-time');
  if (totalTimeEl) {
    totalTimeEl.textContent = formatDuration(durSeconds);
  }

  // Populate dynamic source link
  const sourceLinkContainer = document.getElementById('story-source-link');
  if (sourceLinkContainer && story.sources && story.sources.length > 0) {
    const src = story.sources[0];
    let domain = 'isro.gov.in';
    try {
      domain = new URL(src).hostname.replace(/^www\./, '');
    } catch (e) {}
    sourceLinkContainer.innerHTML = `
      <a href="${src}" target="_blank" rel="noopener noreferrer" style="font-size: 0.82rem; color: var(--isro-blue); text-decoration: none; font-weight: 600;">
        Official Source (${domain}) ↗
      </a>
    `;
  }

  // Populate language selector
  if (langSelectEl) {
    langSelectEl.innerHTML = '';
    const allLangs = [
      { code: 'en-IN', label: 'English' },
      { code: 'hi-IN', label: 'हिन्दी (Hindi)' },
      { code: 'ta-IN', label: 'தமிழ் (Tamil)' },
      { code: 'te-IN', label: 'తెలుగు (Telugu)' },
      { code: 'bn-IN', label: 'বাংলা (Bengali)' },
      { code: 'kn-IN', label: 'ಕನ್ನಡ (Kannada)' }
    ];

    for (const l of allLangs) {
      const opt = document.createElement('option');
      opt.value = l.code;
      opt.textContent = l.label;
      if (l.code === currentLang) opt.selected = true;
      langSelectEl.appendChild(opt);
    }

    langSelectEl.onchange = (e) => {
      const newLang = e.target.value;
      setActiveLang(newLang);
      activeLang = newLang;
      const expectedDuration = activeStoryId === 'nvs-03'
        ? (newLang.startsWith('hi') ? 540 : newLang.startsWith('en') ? 483 : 130)
        : (STORY_DURATIONS[activeStoryId] || 180);
      playStory(activeStoryId, newLang, {
        coverSrc: `/media/covers/${activeStoryId === 'mangalyaan' ? 'mangalyaan-cover.jpg' : activeStoryId === 'nvs-03' ? 'nvs-03-cover.jpg' : 'chandrayaan-3-cover.jpg'}`,
        duration: expectedDuration
      });
    };
  }
}

function setupPodcastControls() {
  const playBtn = document.getElementById('btn-play-pause');
  const skipBackBtn = document.getElementById('btn-skip-back');
  const skipFwdBtn = document.getElementById('btn-skip-forward');
  const seekSlider = document.getElementById('player-seek');
  const speedBtn = document.getElementById('btn-speed');

  if (playBtn) {
    playBtn.onclick = () => {
      const st = getAudioState();
      // If a different story is loaded or playing, always start THIS story!
      if (st.storyId !== activeStoryId) {
        const expectedDuration = activeStoryId === 'nvs-03'
          ? (activeLang.startsWith('hi') ? 540 : activeLang.startsWith('en') ? 510 : 130)
          : (STORY_DURATIONS[activeStoryId] || 180);
        playStory(activeStoryId, activeLang, {
          title: document.getElementById('story-title')?.textContent,
          coverSrc: `/media/covers/${activeStoryId === 'mangalyaan' ? 'mangalyaan-cover.jpg' : activeStoryId === 'nvs-03' ? 'nvs-03-cover.jpg' : 'chandrayaan-3-cover.jpg'}`,
          duration: expectedDuration
        });
      } else {
        togglePlay();
      }
    };
  }

  if (skipBackBtn) {
    skipBackBtn.onclick = () => skip(-15);
  }

  if (skipFwdBtn) {
    skipFwdBtn.onclick = () => skip(15);
  }

  if (seekSlider) {
    seekSlider.oninput = (e) => {
      const st = getAudioState();
      const dur = st.duration || 180;
      const targetSec = (parseFloat(e.target.value) / 100) * dur;
      seek(targetSec);
    };
  }

  if (speedBtn) {
    const speeds = [0.75, 1, 1.25, 1.5];
    speedBtn.onclick = () => {
      const st = getAudioState();
      const curIdx = speeds.indexOf(st.playbackRate || 1);
      const nextIdx = (curIdx + 1) % speeds.length;
      const nextSpeed = speeds[nextIdx];
      setPlaybackSpeed(nextSpeed);
    };
  }
}

function syncPlayerUI(st) {
  const iconPlay = document.getElementById('icon-play');
  const iconPause = document.getElementById('icon-pause');
  const curTimeEl = document.getElementById('player-current-time');
  const totalTimeEl = document.getElementById('player-total-time');
  const slider = document.getElementById('player-seek');
  const speedBtn = document.getElementById('btn-speed');
  const eq = document.getElementById('story-equalizer');
  const statusText = document.getElementById('playback-status-text');

  const isCurrentStoryActive = st.storyId === activeStoryId;
  const isCurrentStoryPlaying = st.isPlaying && isCurrentStoryActive;

  if (iconPlay && iconPause) {
    iconPlay.style.display = isCurrentStoryPlaying ? 'none' : 'block';
    iconPause.style.display = isCurrentStoryPlaying ? 'block' : 'none';
  }

  if (eq) {
    eq.style.display = isCurrentStoryPlaying ? 'inline-flex' : 'none';
  }

  if (statusText) {
    if (isCurrentStoryPlaying) {
      statusText.textContent = 'Playing in background';
    } else if (st.isPlaying && !isCurrentStoryActive) {
      statusText.textContent = 'Another mission is playing • Click Play to switch to this story';
    } else {
      statusText.textContent = 'Paused';
    }
  }

  if (speedBtn) {
    speedBtn.textContent = `${st.playbackRate || 1}x`;
  }

  const expectedSec = activeStoryId === 'nvs-03'
    ? (activeLang.startsWith('hi') ? 540 : activeLang.startsWith('en') ? 510 : 130)
    : (STORY_DURATIONS[activeStoryId] || 180);

  if (totalTimeEl) {
    const dur = (isCurrentStoryActive && st.duration && !isNaN(st.duration) && st.duration > 0) ? st.duration : expectedSec;
    totalTimeEl.textContent = formatDuration(dur);
  }

  if (curTimeEl) {
    const curTime = isCurrentStoryActive ? (st.currentTime || 0) : 0;
    curTimeEl.textContent = formatDuration(curTime);
  }

  if (slider) {
    if (isCurrentStoryActive && st.duration > 0) {
      slider.value = ((st.currentTime || 0) / st.duration) * 100;
    } else {
      slider.value = 0;
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPlayer);
} else {
  initPlayer();
}
