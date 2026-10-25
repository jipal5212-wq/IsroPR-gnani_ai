// IsroPR — Common Frontend Utilities

export const STORAGE_KEYS = {
  LANG: 'isro_pr_lang',
  PLAYBACK_SPEED: 'isro_pr_speed'
};

// Get current active language code or fallback
export function getActiveLang() {
  return localStorage.getItem(STORAGE_KEYS.LANG) || 'en-IN';
}

// Set active language
export function setActiveLang(langCode) {
  localStorage.setItem(STORAGE_KEYS.LANG, langCode);
}

// Standard fetch wrapper
export async function apiFetch(url, options = {}) {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/json',
        ...(options.headers || {})
      }
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `Request failed with status ${res.status}`);
    }
    return data;
  } catch (err) {
    console.error(`API Error on ${url}:`, err);
    throw err;
  }
}

// Format duration in seconds to MM:SS
export function formatDuration(sec) {
  if (!sec || isNaN(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

// Format dates e.g. "Aug 23, 2023"
export function formatDate(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}
