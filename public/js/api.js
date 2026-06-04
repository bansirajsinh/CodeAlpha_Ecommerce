/* ═══════════════════════════════════════════════════════
   api.js — Centralized HTTP client + Auth helpers + Toast
   Used by ALL frontend pages.
   ═══════════════════════════════════════════════════════ */

'use strict';

// ── Token helpers ────────────────────────────────────────────
const getToken = () => localStorage.getItem('token');

const getHeaders = () => {
  const h = { 'Content-Type': 'application/json' };
  const t = getToken();
  if (t) h['Authorization'] = `Bearer ${t}`;
  return h;
};

// ── Handle response → parse JSON, redirect on 401 ───────────
const handleRes = async (res) => {
  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    const onAuthPage = /login|register/.test(window.location.pathname);
    if (!onAuthPage) window.location.href = '/login.html';
    throw new Error('Unauthorized');
  }
  return res.json();
};

// ── API object (use from any page) ──────────────────────────
const api = {
  get: (url) =>
    fetch(url, { headers: getHeaders() }).then(handleRes),

  post: (url, body) =>
    fetch(url, {
      method : 'POST',
      headers: getHeaders(),
      body   : JSON.stringify(body)
    }).then(handleRes),

  put: (url, body) =>
    fetch(url, {
      method : 'PUT',
      headers: getHeaders(),
      body   : JSON.stringify(body)
    }).then(handleRes),

  del: (url) =>
    fetch(url, { method: 'DELETE', headers: getHeaders() }).then(handleRes)
};

// ── Toast notification system ────────────────────────────────
const toast = (() => {
  let container = null;

  const init = () => {
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
  };

  const show = (message, type = 'info', duration = 3200) => {
    init();
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.innerHTML = `
      <div class="toast-icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : 'i'}</div>
      <div class="toast-message">${message}</div>`;
    container.appendChild(el);

    // Trigger animation
    requestAnimationFrame(() => {
      requestAnimationFrame(() => el.classList.add('toast-show'));
    });

    setTimeout(() => {
      el.classList.remove('toast-show');
      setTimeout(() => el.remove(), 320);
    }, duration);
  };

  return {
    show,
    success: (msg, d) => show(msg, 'success', d),
    error  : (msg, d) => show(msg, 'error', d),
    info   : (msg, d) => show(msg, 'info', d)
  };
})();

// ── Auth helpers ─────────────────────────────────────────────
const auth = {
  getUser   : () => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } },
  isLoggedIn: () => !!localStorage.getItem('token'),
  logout    : () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/index.html';
  }
};

// ── Shared header initializer ────────────────────────────────
function initHeader() {
  const user     = auth.getUser();
  const loginBtn = document.getElementById('login-btn');
  const userMenu = document.getElementById('user-menu');
  const userName = document.getElementById('user-name');
  const avatar   = document.getElementById('user-avatar');

  if (user) {
    if (loginBtn) loginBtn.style.display = 'none';
    if (userMenu) userMenu.style.display = 'flex';
    if (userName) userName.textContent = user.full_name.split(' ')[0];
    if (avatar)   avatar.textContent   = user.full_name.charAt(0).toUpperCase();

    // Dynamically append Admin Hub link if logged in user is admin
    if (user.role === 'admin') {
      const navLinks = document.querySelector('.nav-links');
      if (navLinks && !document.getElementById('admin-nav-link')) {
        const adminLink = document.createElement('a');
        adminLink.href = '/admin.html';
        adminLink.className = 'nav-link';
        adminLink.id = 'admin-nav-link';
        adminLink.textContent = 'Admin Hub';
        
        // If we are currently viewing the admin hub page, activate this link
        if (window.location.pathname.includes('admin.html')) {
          adminLink.classList.add('active');
          const activeLinks = navLinks.querySelectorAll('.nav-link.active');
          activeLinks.forEach(lnk => lnk.classList.remove('active'));
        }
        
        navLinks.appendChild(adminLink);
      }
    }
  }

  // Update cart badge if not on auth pages
  if (auth.isLoggedIn()) updateCartBadge();
}

// ── Cart badge helper ────────────────────────────────────────
async function updateCartBadge() {
  try {
    const res   = await api.get('/api/cart');
    const badge = document.getElementById('cart-badge');
    if (badge && !res.error) {
      const n = res.data.itemCount;
      badge.textContent = n;
      badge.classList.toggle('hidden', n === 0);
    }
  } catch { /* silent fail */ }
}
