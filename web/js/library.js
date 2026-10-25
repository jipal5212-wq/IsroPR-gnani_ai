import { apiFetch, getActiveLang, setActiveLang, formatDate } from './common.js';

let currentCategory = 'all';
let searchQuery = '';

export async function initLibrary() {
  await loadLanguages();
  setupEventListeners();
  await loadStories();
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
      await loadStories();
    });
  } catch (err) {
    console.error('Failed to load languages:', err);
  }
}

function setupEventListeners() {
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
  } catch (err) {
    container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--danger);">Failed to load stories: ${err.message}</div>`;
  }
}

function getEditorialCover(category) {
  let bg1, bg2, accentColor, iconSvg, tag;
  if (category === 'isro') {
    bg1 = '#0f4c81'; bg2 = '#0284c7'; accentColor = '#38bdf8'; tag = 'ISRO MISSION';
    iconSvg = `<polygon points='200,55 218,115 182,115' fill='${accentColor}'/><circle cx='200' cy='128' r='6' fill='#ffffff'/><path d='M185,115 L175,145 L192,135 Z' fill='#ff6b00'/><path d='M215,115 L225,145 L208,135 Z' fill='#ff6b00'/>`;
  } else if (category === 'startup') {
    bg1 = '#b45309'; bg2 = '#ea580c'; accentColor = '#fde047'; tag = 'SPACE STARTUP';
    iconSvg = `<circle cx='200' cy='95' r='28' fill='${accentColor}' opacity='0.9'/><path d='M170,130 Q200,60 230,130' stroke='#ffffff' stroke-width='4' fill='none'/>`;
  } else if (category === 'legacy') {
    bg1 = '#1e1b4b'; bg2 = '#312e81'; accentColor = '#a5b4fc'; tag = 'ISRO LEGACY';
    iconSvg = `<circle cx='200' cy='95' r='30' stroke='${accentColor}' stroke-width='3' fill='none' stroke-dasharray='6,4'/><circle cx='200' cy='95' r='12' fill='${accentColor}'/>`;
  } else {
    bg1 = '#065f46'; bg2 = '#059669'; accentColor = '#6ee7b7'; tag = 'EXPLAINER';
    iconSvg = `<path d='M165,120 C185,60 215,60 235,120' stroke='${accentColor}' stroke-width='4' fill='none'/><circle cx='200' cy='85' r='10' fill='#ffffff'/>`;
  }

  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 200' width='400' height='200'>
    <defs>
      <linearGradient id='grad' x1='0%' y1='0%' x2='100%' y2='100%'>
        <stop offset='0%' stop-color='${bg1}'/>
        <stop offset='100%' stop-color='${bg2}'/>
      </linearGradient>
    </defs>
    <rect width='400' height='200' fill='url(#grad)'/>
    <circle cx='340' cy='30' r='80' fill='#ffffff' opacity='0.06'/>
    <circle cx='60' cy='170' r='60' fill='#ffffff' opacity='0.04'/>
    ${iconSvg}
    <text x='200' y='165' fill='#ffffff' font-family='Plus Jakarta Sans, sans-serif' font-weight='800' font-size='12' letter-spacing='2.5' text-anchor='middle' opacity='0.92'>${tag}</text>
  </svg>`;

  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

function createStoryCard(story, lang) {
  const card = document.createElement('article');
  card.className = 'story-card';

  const coverSrc = story.cover_path ? `/media/covers/${story.cover_path}` : getEditorialCover(story.category);

  const categoryNames = {
    isro: 'ISRO Mission',
    startup: 'Space Startup',
    legacy: 'ISRO Legacy',
    explainer: 'Explainer'
  };

  const actionBtn = story.audio_ready
    ? `<a href="/story.html?id=${story.id}&lang=${lang}" class="btn-listen" id="listen-${story.id}">
         <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
         Listen
       </a>`
    : `<a href="/story.html?id=${story.id}&lang=${lang}" class="btn-read" id="read-${story.id}">
         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
         Read
       </a>`;

  card.innerHTML = `
    <div class="story-card-top">
      <img src="${coverSrc}" alt="${story.title.replace(/"/g, '&quot;')}" class="story-card-img" loading="lazy" />
      <span class="story-badge-cat">${categoryNames[story.category] || story.category}</span>
      ${story.pinned ? `<span class="story-pinned-badge">★ Featured</span>` : ''}
    </div>
    <div class="story-card-content">
      <a href="/story.html?id=${story.id}&lang=${lang}" class="story-card-title">${story.title}</a>
      <p class="story-card-summary">${story.summary}</p>
      <div class="story-card-meta">
        ${story.facts_as_of ? `
          <div class="facts-as-of" title="Verified against official sources">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
            As of ${formatDate(story.facts_as_of)}
          </div>
        ` : '<div></div>'}
        ${actionBtn}
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
