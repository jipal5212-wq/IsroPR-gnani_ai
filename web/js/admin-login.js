// IsroPR — Admin Login Handler
import { apiFetch } from './common.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  const errorBox = document.getElementById('login-error');

  // Check if already logged in
  apiFetch('/api/admin/me')
    .then(() => {
      window.location.href = '/admin/dashboard.html';
    })
    .catch(() => {});

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (errorBox) errorBox.style.display = 'none';

      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;

      try {
        const res = await apiFetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        if (res.ok) {
          window.location.href = '/admin/dashboard.html';
        }
      } catch (err) {
        if (errorBox) {
          errorBox.textContent = err.message || 'Login failed. Check your credentials.';
          errorBox.style.display = 'block';
        }
      }
    });
  }
});
