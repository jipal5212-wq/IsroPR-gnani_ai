// Space Bharat — Knowledge Base Manager
import { apiFetch, formatDate } from './common.js';

let editingId = null;

document.addEventListener('DOMContentLoaded', async () => {
  await loadEntries();
  setupForm();
  setupSearch();
});

async function loadEntries() {
  const tbody = document.getElementById('knowledge-tbody');
  if (!tbody) return;

  try {
    const data = await apiFetch('/api/admin/knowledge');
    const entries = data.entries || [];

    if (entries.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-dim);">No knowledge entries yet. Add factual space entries below!</td></tr>`;
      return;
    }

    tbody.innerHTML = entries.map(e => `
      <tr>
        <td><strong>${e.title}</strong><br><small style="color: var(--text-muted);">${e.body.slice(0, 100)}...</small></td>
        <td><code>${e.category}</code></td>
        <td><a href="${e.source_url}" target="_blank" rel="noopener" style="color: var(--admin-primary); text-decoration: none;">Source ↗</a></td>
        <td>${formatDate(e.as_of)}</td>
        <td>
          <button class="btn-secondary btn-edit-entry" data-id="${e.id}" style="padding: 0.2rem 0.5rem; font-size: 0.8rem; margin-right: 0.3rem;">Edit</button>
          <button class="btn-logout btn-delete-entry" data-id="${e.id}">Delete</button>
        </td>
      </tr>
    `).join('');

    // Attach edit and delete listeners
    document.querySelectorAll('.btn-edit-entry').forEach(btn => {
      btn.onclick = () => {
        const id = parseInt(btn.dataset.id, 10);
        const entry = entries.find(x => x.id === id);
        if (entry) startEdit(entry);
      };
    });

    document.querySelectorAll('.btn-delete-entry').forEach(btn => {
      btn.onclick = async () => {
        if (!confirm('Are you sure you want to delete this fact?')) return;
        await apiFetch(`/api/admin/knowledge/${btn.dataset.id}`, { method: 'DELETE' });
        await loadEntries();
      };
    });
  } catch (err) {
    console.error('Failed to load knowledge entries:', err);
  }
}

function startEdit(entry) {
  editingId = entry.id;
  document.getElementById('kb-title').value = entry.title;
  document.getElementById('kb-body').value = entry.body;
  document.getElementById('kb-category').value = entry.category;
  document.getElementById('kb-source-url').value = entry.source_url;
  document.getElementById('kb-as-of').value = entry.as_of;
  document.getElementById('btn-save-kb').textContent = 'Update Fact';
  document.getElementById('btn-cancel-edit').style.display = 'inline-flex';
}

function resetForm() {
  editingId = null;
  document.getElementById('kb-form').reset();
  document.getElementById('btn-save-kb').textContent = 'Save Fact';
  document.getElementById('btn-cancel-edit').style.display = 'none';
}

function setupForm() {
  const form = document.getElementById('kb-form');
  const cancelBtn = document.getElementById('btn-cancel-edit');

  if (cancelBtn) {
    cancelBtn.onclick = resetForm;
  }

  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();

      const payload = {
        title: document.getElementById('kb-title').value.trim(),
        body: document.getElementById('kb-body').value.trim(),
        category: document.getElementById('kb-category').value.trim() || 'general',
        source_url: document.getElementById('kb-source-url').value.trim(),
        as_of: document.getElementById('kb-as-of').value.trim()
      };

      try {
        if (editingId) {
          await apiFetch(`/api/admin/knowledge/${editingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        } else {
          await apiFetch('/api/admin/knowledge', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        }
        resetForm();
        await loadEntries();
      } catch (err) {
        alert(`Error saving knowledge fact: ${err.message}`);
      }
    };
  }
}

function setupSearch() {
  const searchInput = document.getElementById('kb-search-input');
  const searchResultsBox = document.getElementById('kb-search-results');

  if (searchInput && searchResultsBox) {
    let debounce;
    searchInput.oninput = () => {
      clearTimeout(debounce);
      debounce = setTimeout(async () => {
        const q = searchInput.value.trim();
        if (!q) {
          searchResultsBox.style.display = 'none';
          return;
        }

        try {
          const res = await apiFetch(`/api/admin/knowledge/search?q=${encodeURIComponent(q)}`);
          const results = res.results || [];
          searchResultsBox.style.display = 'block';

          if (results.length === 0) {
            searchResultsBox.innerHTML = `<div style="padding: 0.5rem; color: var(--text-dim);">No FTS5 search matches found.</div>`;
            return;
          }

          searchResultsBox.innerHTML = results.map(r => `
            <div style="padding: 0.6rem; border-bottom: 1px solid var(--admin-border);">
              <strong>${r.title}</strong> (Rank: ${r.rank.toFixed(2)})<br>
              <small style="color: var(--text-muted);">${r.body.slice(0, 120)}...</small>
            </div>
          `).join('');
        } catch (err) {
          console.warn('Search preview failed:', err);
        }
      }, 300);
    };
  }
}
