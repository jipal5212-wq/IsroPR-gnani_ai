// Space Bharat — Story & Translation Editor
import { apiFetch } from './common.js';

let isNew = true;
let storyId = null;
let currentStory = null;
let translationsMap = {};
let activeLangTab = 'en-IN';

const LANGUAGES = [
  { code: 'en-IN', name: 'English', defaultVoice: 'Pranav' },
  { code: 'hi-IN', name: 'Hindi', defaultVoice: 'Nalini' },
  { code: 'ta-IN', name: 'Tamil', defaultVoice: 'Asmita' },
  { code: 'te-IN', name: 'Telugu', defaultVoice: 'Suhana' },
  { code: 'bn-IN', name: 'Bengali', defaultVoice: 'Kirra' }
];

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  storyId = urlParams.get('id');
  isNew = !storyId;

  setupTabs();
  setupWordCounter();
  setupFormHandlers();

  if (!isNew) {
    document.getElementById('page-heading').textContent = 'Edit Space Story';
    document.getElementById('story-slug').disabled = true;
    document.getElementById('audio-actions-panel').style.display = 'block';
    document.getElementById('btn-delete-story').style.display = 'inline-flex';
    await loadStory(storyId);
  } else {
    document.getElementById('page-heading').textContent = 'New Space Story';
    document.getElementById('story-title').addEventListener('input', (e) => {
      const slug = e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      document.getElementById('story-slug').value = slug;
    });
  }
});

function setupTabs() {
  const tabsContainer = document.getElementById('lang-tabs');
  if (!tabsContainer) return;

  tabsContainer.innerHTML = '';
  LANGUAGES.forEach(l => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `lang-tab ${l.code === activeLangTab ? 'active' : ''}`;
    btn.dataset.lang = l.code;
    btn.textContent = l.name;
    btn.onclick = () => switchTab(l.code);
    tabsContainer.appendChild(btn);
  });
}

function switchTab(langCode) {
  // Save current tab values in local memory before switching
  saveCurrentTabToMemory();

  activeLangTab = langCode;
  document.querySelectorAll('.lang-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.lang === langCode);
  });

  populateTranslationFields(langCode);
}

function saveCurrentTabToMemory() {
  const bodyText = document.getElementById('trans-body').value;
  const voice = document.getElementById('trans-voice').value;
  const reviewed = document.getElementById('trans-reviewed').checked ? 1 : 0;
  const reviewNote = document.getElementById('trans-review-note').value;

  translationsMap[activeLangTab] = {
    ...(translationsMap[activeLangTab] || {}),
    body: bodyText,
    voice: voice || LANGUAGES.find(l => l.code === activeLangTab)?.defaultVoice || 'Pranav',
    reviewed,
    review_note: reviewNote
  };
}

function populateTranslationFields(langCode) {
  const trans = translationsMap[langCode] || {
    body: '',
    voice: LANGUAGES.find(l => l.code === langCode)?.defaultVoice || 'Pranav',
    reviewed: 0,
    review_note: '',
    audio_status: 'none'
  };

  document.getElementById('trans-body').value = trans.body || '';
  document.getElementById('trans-voice').value = trans.voice;
  document.getElementById('trans-reviewed').checked = Boolean(trans.reviewed);
  document.getElementById('trans-review-note').value = trans.review_note || '';

  // Audio status indicator
  const statusEl = document.getElementById('tab-audio-status');
  if (statusEl) {
    statusEl.innerHTML = `<span class="badge badge-${trans.audio_status || 'none'}">${trans.audio_status || 'no audio'}</span>`;
  }

  // Audio preview player
  const playerWrap = document.getElementById('tab-audio-player-wrap');
  if (playerWrap) {
    if (trans.audio_path && trans.audio_status === 'ready') {
      playerWrap.style.display = 'block';
      playerWrap.querySelector('audio').src = trans.audio_path;
    } else {
      playerWrap.style.display = 'none';
    }
  }

  updateWordCount();
}

function setupWordCounter() {
  const textarea = document.getElementById('trans-body');
  if (textarea) {
    textarea.addEventListener('input', updateWordCount);
  }
}

function updateWordCount() {
  const text = document.getElementById('trans-body').value || '';
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;
  const estMins = (words / 150).toFixed(1);

  document.getElementById('word-count-badge').textContent = `${words} words · ${chars} chars · ~${estMins} min listen`;
}

async function loadStory(id) {
  try {
    const data = await apiFetch(`/api/admin/stories/${id}`);
    currentStory = data.story;

    // Populate story fields
    document.getElementById('story-slug').value = currentStory.id;
    document.getElementById('story-title').value = currentStory.title;
    document.getElementById('story-summary').value = currentStory.summary;
    document.getElementById('story-category').value = currentStory.category;
    document.getElementById('story-facts-as-of').value = currentStory.facts_as_of || '';
    document.getElementById('story-sources').value = (currentStory.sources || []).join('\n');
    document.getElementById('story-pinned').checked = Boolean(currentStory.pinned);
    document.getElementById('story-published').checked = Boolean(currentStory.published);
    document.getElementById('story-duration').value = currentStory.duration_hint_min || 0;

    // Map translations
    (data.translations || []).forEach(t => {
      translationsMap[t.lang] = t;
    });

    populateTranslationFields(activeLangTab);
  } catch (err) {
    alert(`Failed to load story: ${err.message}`);
  }
}

function setupFormHandlers() {
  const form = document.getElementById('story-form');
  const alertBox = document.getElementById('form-alert');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (alertBox) alertBox.style.display = 'none';

    saveCurrentTabToMemory();

    const slug = document.getElementById('story-slug').value.trim();
    const title = document.getElementById('story-title').value.trim();
    const summary = document.getElementById('story-summary').value.trim();
    const category = document.getElementById('story-category').value;
    const factsAsOf = document.getElementById('story-facts-as-of').value || null;
    const sourcesRaw = document.getElementById('story-sources').value.trim();
    const sources = sourcesRaw ? sourcesRaw.split('\n').map(s => s.trim()).filter(Boolean) : [];
    const pinned = document.getElementById('story-pinned').checked ? 1 : 0;
    const published = document.getElementById('story-published').checked ? 1 : 0;
    const duration = parseInt(document.getElementById('story-duration').value || '0', 10);

    const payload = {
      title,
      summary,
      category,
      facts_as_of: factsAsOf,
      sources,
      pinned,
      published,
      duration_hint_min: duration
    };

    try {
      if (isNew) {
        payload.id = slug;
        const res = await apiFetch('/api/admin/stories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        storyId = res.storyId;
        isNew = false;
      } else {
        await apiFetch(`/api/admin/stories/${storyId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      // Save translation for currently active language if filled
      const trans = translationsMap[activeLangTab];
      if (trans && trans.body.trim()) {
        await apiFetch(`/api/admin/stories/${storyId}/translations/${activeLangTab}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            body: trans.body,
            voice: trans.voice,
            reviewed: trans.reviewed,
            review_note: trans.review_note
          })
        });
      }

      if (alertBox) {
        alertBox.className = 'badge badge-published';
        alertBox.style.display = 'block';
        alertBox.textContent = '✓ Story and translation saved successfully!';
        setTimeout(() => { alertBox.style.display = 'none'; }, 3000);
      }

      if (isNew) {
        window.location.href = `/admin/story-edit.html?id=${storyId}`;
      }
    } catch (err) {
      if (alertBox) {
        alertBox.className = 'badge badge-failed';
        alertBox.style.display = 'block';
        alertBox.textContent = `Error: ${err.message}`;
      }
    }
  });

  // Audio generation buttons
  const btnGenLang = document.getElementById('btn-generate-audio-lang');
  if (btnGenLang) {
    btnGenLang.addEventListener('click', async () => {
      saveCurrentTabToMemory();
      await apiFetch(`/api/admin/stories/${storyId}/audio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lang: activeLangTab })
      });
      alert(`Audio generation queued for ${activeLangTab}! Check jobs monitor.`);
      await loadStory(storyId);
    });
  }

  const btnGenAll = document.getElementById('btn-generate-audio-all');
  if (btnGenAll) {
    btnGenAll.addEventListener('click', async () => {
      saveCurrentTabToMemory();
      await apiFetch(`/api/admin/stories/${storyId}/audio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true })
      });
      alert('Audio generation queued for all available translations!');
      await loadStory(storyId);
    });
  }

  // Delete story
  const btnDelete = document.getElementById('btn-delete-story');
  if (btnDelete) {
    btnDelete.addEventListener('click', async () => {
      if (!confirm(`Are you sure you want to delete story "${storyId}"? This will also remove all audio files.`)) return;
      await apiFetch(`/api/admin/stories/${storyId}`, { method: 'DELETE' });
      window.location.href = '/admin/dashboard.html';
    });
  }
}
