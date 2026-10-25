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

function createStoryCard(story, lang) {
  const card = document.createElement('article');
  card.className = 'story-card';

  const defaultCover = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="240" viewBox="0 0 400 240"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231e1b4b"/><stop offset="100%" stop-color="%230f172a"/></linearGradient></defs><rect width="400" height="240" fill="url(%23g)"/><circle cx="200" cy="120" r="45" fill="%236366f1" opacity="0.25"/><text x="50%" y="54%" text-anchor="middle" fill="%23a5b4fc" font-family="sans-serif" font-weight="700" font-size="16">ISRO SPACE ODYSSEY</text></svg>`;

  const coverSrc = story.cover_path ? `/media/covers/${story.cover_path}` : defaultCover;

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
      <img src="${coverSrc}" alt="${story.title}" class="story-card-img" loading="lazy" />
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
