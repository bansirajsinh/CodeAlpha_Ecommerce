'use strict';
/* auth.js — Handles Login and Register form submissions */

// ── Redirect if already logged in ───────────────────────────
if (auth.isLoggedIn()) {
  window.location.href = '/index.html';
}

// ── Password visibility toggle ───────────────────────────────
document.querySelectorAll('.toggle-password').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = document.getElementById(btn.dataset.target);
    if (!input) return;
    const show = input.type === 'password';
    input.type  = show ? 'text' : 'password';
    btn.textContent = show ? '🙈' : '👁';
  });
});

// ── LOGIN ────────────────────────────────────────────────────
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn      = loginForm.querySelector('[type="submit"]');
    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
      toast.error('Please fill in all fields.');
      return;
    }

    btn.disabled    = true;
    btn.textContent = '⏳ Signing in…';

    try {
      const res = await api.post('/api/auth/login', { email, password });
      if (res.error) {
        toast.error(res.message);
      } else {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user',  JSON.stringify(res.data.user));
        toast.success(`Welcome back, ${res.data.user.full_name.split(' ')[0]}!`);
        setTimeout(() => { window.location.href = '/index.html'; }, 900);
      }
    } catch {
      toast.error('Login failed. Please try again.');
    } finally {
      btn.disabled    = false;
      btn.textContent = 'Sign In';
    }
  });
}

// ── REGISTER ─────────────────────────────────────────────────
const registerForm = document.getElementById('register-form');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn            = registerForm.querySelector('[type="submit"]');
    const full_name      = document.getElementById('full_name').value.trim();
    const email          = document.getElementById('email').value.trim();
    const phone          = document.getElementById('phone')?.value.trim() || '';
    const password       = document.getElementById('password').value;
    const confirmPwd     = document.getElementById('confirm_password').value;

    // Client-side validation
    if (!full_name || !email || !password) {
      toast.error('Please fill in all required fields.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPwd) {
      toast.error('Passwords do not match.');
      return;
    }

    btn.disabled    = true;
    btn.textContent = '⏳ Creating Account…';

    try {
      const res = await api.post('/api/auth/register', { full_name, email, password, phone });
      if (res.error) {
        toast.error(res.message);
      } else {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user',  JSON.stringify(res.data.user));
        toast.success('Account created! Redirecting…');
        setTimeout(() => { window.location.href = '/index.html'; }, 900);
      }
    } catch {
      toast.error('Registration failed. Please try again.');
    } finally {
      btn.disabled    = false;
      btn.textContent = 'Create Account';
    }
  });
}
