// Space Bharat — Admin Dashboard Handler
import { apiFetch, formatDate } from './common.js';

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const me = await apiFetch('/api/admin/me');
    const userLabel = document.getElementById('admin-email-label');
    if (userLabel) userLabel.textContent = me.admin.email;

    setupLogout();
    await loadStats();
    await loadStoriesTable();
  } catch (err) {
    // Redirect to login if unauthorized
    window.location.href = '/admin/login.html';
  }
});

function setupLogout() {
  const btn = document.getElementById('btn-admin-logout');
  if (btn) {
    btn.addEventListener('click', async () => {
      await apiFetch('/api/admin/logout', { method: 'POST' });
      window.location.href = '/admin/login.html';
    });
  }
}

async function loadStats() {
  try {
    const data = await apiFetch('/api/admin/stats');
    const counts = data.counts || {};

    setElText('stat-stories-total', counts.storiesTotal || 0);
    setElText('stat-stories-published', `${counts.storiesPublished || 0} published, ${counts.storiesDraft || 0} draft`);

    setElText('stat-audio-ready', counts.audioReady || 0);
    setElText('stat-audio-queued', `${counts.audioQueued || 0} queued, ${counts.audioFailed || 0} failed`);

    setElText('stat-knowledge-count', counts.knowledgeCount || 0);
    setElText('stat-chats-count', counts.recentChats || 0);

    // API Key warning banner
    const warningBanner = document.getElementById('api-warning-banner');
    if (warningBanner) {
      if (!data.apiStatus.hasGnaniKey || !data.apiStatus.hasLlmKey) {
        warningBanner.style.display = 'block';
        const missing = [];
        if (!data.apiStatus.hasGnaniKey) missing.push('GNANI_API_KEY');
        if (!data.apiStatus.hasLlmKey) missing.push('LLM_API_KEY');
        warningBanner.innerHTML = `⚠️ <strong>Configuration Alert:</strong> Missing environment variables (${missing.join(', ')}). Local development simulation is active.`;
      } else {
        warningBanner.style.display = 'none';
      }
    }

    renderRecentJobs(data.recentJobs || []);
  } catch (err) {
    console.error('Failed to load dashboard stats:', err);
  }
}

function renderRecentJobs(jobs) {
  const tbody = document.getElementById('recent-jobs-tbody');
  if (!tbody) return;

  if (jobs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-dim);">No audio generation jobs yet</td></tr>`;
    return;
  }

  tbody.innerHTML = jobs.map(j => `
    <tr>
      <td>#${j.id}</td>
      <td><code>${j.type}</code></td>
      <td><span class="badge badge-${j.status}">${j.status}</span></td>
      <td>${formatDate(j.created_at)}</td>
      <td>
        ${j.status === 'failed' ? `<button class="btn-secondary btn-retry-job" data-id="${j.id}" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;">Retry</button>` : '—'}
      </td>
    </tr>
  `).join('');

  document.querySelectorAll('.btn-retry-job').forEach(btn => {
    btn.addEventListener('click', async () => {
      const jobId = btn.dataset.id;
      await apiFetch(`/api/admin/jobs/${jobId}/retry`, { method: 'POST' });
      await loadStats();
    });
  });
}

async function loadStoriesTable() {
  const tbody = document.getElementById('stories-table-tbody');
  if (!tbody) return;

  try {
    const data = await apiFetch('/api/admin/stories');
    const stories = data.stories || [];

    if (stories.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-dim);">No stories created yet. Click "New Story" to begin!</td></tr>`;
      return;
    }

    tbody.innerHTML = stories.map(s => `
      <tr>
        <td><strong>${s.title}</strong><br><small style="color: var(--text-dim);">${s.id}</small></td>
        <td><code>${s.category}</code></td>
        <td><span class="badge badge-${s.published ? 'published' : 'draft'}">${s.published ? 'Published' : 'Draft'}</span></td>
        <td>${s.translation_count} (${s.audio_ready_count} audio ready)</td>
        <td>${formatDate(s.updated_at || s.created_at)}</td>
        <td>
          <a href="/admin/story-edit.html?id=${s.id}" class="btn-secondary" style="padding: 0.25rem 0.6rem; font-size: 0.8rem;">Edit</a>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Failed to load stories table:', err);
  }
}

function setElText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}
