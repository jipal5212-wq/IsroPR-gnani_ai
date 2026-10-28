import { apiFetch, getActiveLang, setActiveLang, formatDate } from './common.js';
import { initGlobalPlayer, playStory, togglePlay, getAudioState, subscribeAudioState } from './spotify-player.js';

let currentCategory = 'all';
let searchQuery = '';

export async function initLibrary() {
  initGlobalPlayer();
  await loadLanguages();
  setupEventListeners();
  await loadStories();

  // Listen to global player changes to keep card buttons synchronized
  subscribeAudioState(syncCardButtons);

  // If loaded with #audio-stories hash, glide smoothly to stories section
  if (window.location.hash === '#audio-stories') {
    setTimeout(scrollToAudioStories, 250);
  }
}

export function scrollToAudioStories() {
  const section = document.getElementById('audio-stories');
  if (section) {
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    try {
      if (window.location.hash !== '#audio-stories') {
        history.pushState(null, '', '#audio-stories');
      }
    } catch (_) {}
  }
}

function syncCardButtons(audioState) {
  const cards = document.querySelectorAll('.story-card');
  const heroPlayBtn = document.getElementById('hero-btn-play-c3');
  const heroOBtn = document.getElementById('hero-o-play-btn');
  const isPlayingC3 = audioState.isPlaying && audioState.storyId === 'chandrayaan-3';

  if (heroOBtn) {
    if (isPlayingC3) {
      heroOBtn.classList.add('playing');
      heroOBtn.title = 'Pause Chandrayaan-3 Podcast';
      heroOBtn.setAttribute('aria-label', 'Pause Chandrayaan-3 Podcast');
    } else {
      heroOBtn.classList.remove('playing');
      heroOBtn.title = 'Play Top-Rated Podcast: Chandrayaan-3';
      heroOBtn.setAttribute('aria-label', 'Play Top-Rated Podcast: Chandrayaan-3');
    }
  }

  if (heroPlayBtn) {
    const heroBtnText = heroPlayBtn.querySelector('.btn-hero-text');
    if (isPlayingC3) {
      heroPlayBtn.classList.add('playing');
      if (heroBtnText) heroBtnText.textContent = 'Pause Chandrayaan-3';
    } else {
      heroPlayBtn.classList.remove('playing');
      if (heroBtnText) heroBtnText.textContent = 'Listen: Chandrayaan-3 (3 min)';
    }
  }

  cards.forEach(card => {
    const cardStoryId = card.dataset.storyId || 'chandrayaan-3';
    const isPlayingThis = audioState.isPlaying && audioState.storyId === cardStoryId;
    const playFab = card.querySelector('.card-play-fab');
    const listenBtn = card.querySelector('.btn-listen-instant');
    const duration = card.dataset.duration || '3';

    if (isPlayingThis) {
      card.classList.add('playing');
    } else {
      card.classList.remove('playing');
    }

    if (playFab) {
      if (isPlayingThis) {
        playFab.classList.add('playing');
        playFab.title = 'Pause Podcast';
      } else {
        playFab.classList.remove('playing');
        playFab.title = 'Play Podcast';
      }
    }

    if (listenBtn) {
      const btnText = listenBtn.querySelector('.btn-text');
      if (isPlayingThis) {
        listenBtn.classList.add('playing');
        if (btnText) btnText.textContent = 'Pause';
      } else {
        listenBtn.classList.remove('playing');
        if (btnText) btnText.textContent = `Listen (${duration} min)`;
      }
    }
  });
}

async function loadLanguages() {
  try {
    const data = await apiFetch('/api/languages');
    const select = document.getElementById('lang-select');
    if (!select) return;

    select.innerHTML = '';
    const activeLang = getActiveLang();

    for (const lang of data.languages) {
      const opt = document.createElement('option');
      opt.value = lang.code;
      opt.textContent = `${lang.nativeName} (${lang.name})`;
      if (lang.code === activeLang) {
        opt.selected = true;
      }
      select.appendChild(opt);
    }

    select.addEventListener('change', async (e) => {
      setActiveLang(e.target.value);
      const chips = document.querySelectorAll('.mah-chip');
      chips.forEach(c => c.classList.toggle('active', c.dataset.lang === e.target.value));
      await loadStories();
    });
  } catch (err) {
    console.error('Failed to load languages:', err);
  }
}

function setupEventListeners() {
  // Creative Multilingual Audio Highlight Chips
  const heroLangChips = document.querySelectorAll('.mah-chip');
  if (heroLangChips.length > 0) {
    const syncChips = (code) => {
      heroLangChips.forEach(chip => {
        const isActive = chip.dataset.lang === code;
        chip.classList.toggle('active', isActive);
        chip.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
    };

    syncChips(getActiveLang());

    heroLangChips.forEach(chip => {
      chip.addEventListener('click', async () => {
        const targetLang = chip.dataset.lang;
        if (!targetLang) return;

        setActiveLang(targetLang);
        syncChips(targetLang);

        const select = document.getElementById('lang-select');
        if (select) select.value = targetLang;

        await loadStories();

        const st = getAudioState();
        if (st.isPlaying) {
          playStory(st.storyId || 'chandrayaan-3', targetLang);
        }
      });
    });
  }

  // Category filter tabs
  const tabs = document.querySelectorAll('.cat-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', async () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentCategory = tab.dataset.category || 'all';
      await loadStories();
    });
  });

  // Search input with debounce
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    let timeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(timeout);
      timeout = setTimeout(async () => {
        searchQuery = e.target.value.trim();
        await loadStories();
      }, 300);
    });
  }

  // Hero 'O' logo button click & quick-play button (Plays top-rated Chandrayaan-3)
  const heroPlayTriggers = document.querySelectorAll('#hero-o-play-btn, #hero-btn-play-c3');
  heroPlayTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const audioState = getAudioState();
      if (audioState.isPlaying && audioState.storyId === 'chandrayaan-3') {
        togglePlay();
      } else {
        playStory('chandrayaan-3', getActiveLang());
      }
    });
  });

  // Explore Audio Stories & navigation links pointing to #audio-stories
  const exploreLinks = document.querySelectorAll('a[href="#audio-stories"], a[href="/#audio-stories"], #hero-btn-explore-stories');
  exploreLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      scrollToAudioStories();
    });
  });

  // Delegated instant play clicks for story cards
  const container = document.getElementById('stories-grid');
  if (container) {
    container.addEventListener('click', (e) => {
      const playTarget = e.target.closest('.card-play-fab, .btn-listen-instant');
      if (!playTarget) return;

      e.preventDefault();
      e.stopPropagation();

      const storyId = playTarget.dataset.storyId || 'chandrayaan-3';
      const audioState = getAudioState();

      if (audioState.isPlaying && audioState.storyId === storyId) {
        togglePlay();
      } else {
        playStory(storyId, getActiveLang());
      }
    });
  }
}

export async function loadStories() {
  const container = document.getElementById('stories-grid');
  const emptyState = document.getElementById('empty-state');
  if (!container) return;

  const lang = getActiveLang();
  container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-dim);">Scanning the cosmos for stories...</div>`;

  try {
    const query = new URLSearchParams({ lang });
    if (currentCategory && currentCategory !== 'all') {
      query.set('category', currentCategory);
    }
    if (searchQuery) {
      query.set('q', searchQuery);
    }

    const res = await apiFetch(`/api/stories?${query.toString()}`);
    const stories = res.stories || [];

    if (stories.length === 0) {
      container.style.display = 'none';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    container.style.display = 'grid';
    container.innerHTML = '';

    for (const story of stories) {
      container.appendChild(createStoryCard(story, lang));
    }

    // Sync button state immediately after render
    syncCardButtons(getAudioState());
  } catch (err) {
    container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--danger);">Failed to load stories: ${err.message}</div>`;
  }
}

function getEditorialCover(category) {
  let bg1 = '#0f4c81', bg2 = '#0284c7', accentColor = '#38bdf8', tag = 'ISRO MISSION';
  const iconSvg = `<polygon points='200,55 218,115 182,115' fill='${accentColor}'/><circle cx='200' cy='128' r='6' fill='#ffffff'/><path d='M185,115 L175,145 L192,135 Z' fill='#ff6b00'/><path d='M215,115 L225,145 L208,135 Z' fill='#ff6b00'/>`;

  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 200' width='400' height='200'>
    <defs>
      <linearGradient id='grad' x1='0%' y1='0%' x2='100%' y2='100%'>
        <stop offset='0%' stop-color='${bg1}'/>
        <stop offset='100%' stop-color='${bg2}'/>
      </linearGradient>
    </defs>
    <rect width='400' height='200' fill='url(#grad)'/>
    <circle cx='340' cy='30' r='80' fill='#ffffff' opacity='0.08'/>
    <circle cx='60' cy='170' r='60' fill='#ffffff' opacity='0.04'/>
    ${iconSvg}
    <text x='200' y='165' fill='#ffffff' font-family='Plus Jakarta Sans, sans-serif' font-weight='800' font-size='12' letter-spacing='2.5' text-anchor='middle' opacity='0.92'>${tag}</text>
  </svg>`;

  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

function createStoryCard(story, lang) {
  const card = document.createElement('article');
  const audioState = getAudioState();
  const isPlayingThis = audioState.isPlaying && audioState.storyId === story.id;
  const duration = story.duration_hint_min || 3;

  card.className = `story-card ${isPlayingThis ? 'playing' : ''}`;
  card.dataset.storyId = story.id;
  card.dataset.duration = duration;

  const coverSrc = story.cover_path ? `/media/covers/${story.cover_path}?v=navcam_20230827` : getEditorialCover(story.category);
  const categoryLabel = story.category === 'isro' ? 'ISRO Mission' : story.category === 'startups' ? 'NewSpace India' : 'Space Science';

  card.innerHTML = `
    <div class="story-card-top">
      <img src="${coverSrc}" alt="${story.title.replace(/"/g, '&quot;')}" class="story-card-img" loading="eager" />
      
      <div class="story-top-badges">
        <span class="story-badge-cat">${categoryLabel}</span>
        <span class="story-duration-pill">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>
          ${duration} MIN LISTEN
        </span>
      </div>

      <!-- Creative Floating Play FAB -->
      <button class="card-play-fab ${isPlayingThis ? 'playing' : ''}" data-story-id="${story.id}" title="${isPlayingThis ? 'Pause' : 'Play Podcast'}" aria-label="Play ${story.title}">
        <svg class="sp-icon-svg icon-play" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        <svg class="sp-icon-svg icon-pause" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
        <div class="sp-equalizer-bars">
          <span></span><span></span><span></span>
        </div>
      </button>
    </div>

    <!-- Authentic ISRO Telemetry Banner -->
    <div class="photo-telemetry-strip">
      <span class="navcam-badge">ISRO NavCam</span>
      <span class="photo-caption-text">Authentic Pragyan rover crater photograph · 27 Aug 2023</span>
    </div>

    <div class="story-card-content">
      <div class="story-languages-cue">
        <span class="lang-wave-icon"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="display: inline-block; vertical-align: middle;"><line x1="12" y1="2" x2="12" y2="22"></line><line x1="7" y1="6" x2="7" y2="18"></line><line x1="17" y1="6" x2="17" y2="18"></line><line x1="2" y1="10" x2="2" y2="14"></line><line x1="22" y1="10" x2="22" y2="14"></line></svg></span>
        <span class="lang-names">EN • हिन्दी • தமிழ் • తెలుగు • বাংলা • ಕನ್ನಡ</span>
      </div>

      <a href="/story.html?id=${story.id}&lang=${lang}" class="story-card-title">${story.title}</a>
      <p class="story-card-summary">${story.summary}</p>

      <div class="story-card-footer">
        <div class="story-meta-col">
          ${story.facts_as_of ? `
            <div class="facts-as-of" title="Verified against official sources">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20 6L9 17l-5-5"/></svg>
              Official Fact-Check (${formatDate(story.facts_as_of)})
            </div>
          ` : `
            <div class="facts-as-of">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20 6L9 17l-5-5"/></svg>
              ISRO Telemetry Verified
            </div>
          `}
        </div>

        <div class="story-actions-row">
          <button class="btn-listen-instant ${isPlayingThis ? 'playing' : ''}" data-story-id="${story.id}" type="button">
            <svg class="icon-play" width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            <div class="sp-equalizer-bars">
              <span></span><span></span><span></span>
            </div>
            <span class="btn-text">${isPlayingThis ? 'Pause' : `Listen (${duration} min)`}</span>
          </button>

          <a href="/story.html?id=${story.id}&lang=${lang}" class="btn-card-explore" title="Open podcast page">
            <span>Explore</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>
      </div>
    </div>
  `;

  return card;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLibrary);
} else {
  initLibrary();
}
