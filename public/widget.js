(function() {
  'use strict';

  const script = document.currentScript;
  const API_KEY = script?.getAttribute('data-api-key') || '';
  const THEME = script?.getAttribute('data-theme') || 'dark';
  const BASE_URL = script?.src ? new URL(script.src).origin : '';

  if (!API_KEY) {
    console.error('[QuickAuth] Missing data-api-key attribute');
    return;
  }

  // Styles
  const isDark = THEME === 'dark';
  const colors = isDark
    ? { bg: '#18181b', border: '#3f3f46', input: '#27272a', text: '#fafafa', muted: '#a1a1aa', accent: '#6366f1', accentHover: '#818cf8', btnText: '#fff' }
    : { bg: '#ffffff', border: '#e4e4e7', input: '#f4f4f5', text: '#18181b', muted: '#71717a', accent: '#6366f1', accentHover: '#818cf8', btnText: '#fff' };

  const STYLES = `
    .qa-widget * { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; }
    .qa-widget { background: ${colors.bg}; border: 1px solid ${colors.border}; border-radius: 16px; padding: 24px; max-width: 360px; width: 100%; color: ${colors.text}; }
    .qa-header { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; font-size: 14px; font-weight: 600; }
    .qa-header svg { width: 20px; height: 20px; color: ${colors.accent}; }
    .qa-tabs { display: flex; gap: 4px; background: ${colors.input}; border-radius: 8px; padding: 4px; margin-bottom: 20px; }
    .qa-tab { flex: 1; padding: 6px; text-align: center; font-size: 13px; border-radius: 6px; cursor: pointer; border: none; background: transparent; color: ${colors.muted}; transition: all 0.2s; }
    .qa-tab.active { background: ${colors.accent}; color: ${colors.btnText}; }
    .qa-input { width: 100%; background: ${colors.input}; border: 1px solid ${colors.border}; border-radius: 8px; padding: 8px 12px; font-size: 14px; color: ${colors.text}; outline: none; margin-bottom: 10px; transition: border-color 0.2s; }
    .qa-input:focus { border-color: ${colors.accent}; }
    .qa-input::placeholder { color: ${colors.muted}; }
    .qa-btn { width: 100%; background: ${colors.accent}; color: ${colors.btnText}; border: none; border-radius: 8px; padding: 10px; font-size: 14px; font-weight: 500; cursor: pointer; transition: background 0.2s; margin-top: 4px; }
    .qa-btn:hover { background: ${colors.accentHover}; }
    .qa-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .qa-error { color: #ef4444; font-size: 12px; margin-bottom: 8px; }
    .qa-success { color: #22c55e; font-size: 12px; margin-bottom: 8px; text-align: center; }
    .qa-user { text-align: center; }
    .qa-user-email { font-weight: 600; margin-bottom: 4px; }
    .qa-user-sub { font-size: 12px; color: ${colors.muted}; margin-bottom: 16px; }
    .qa-logout { background: transparent; border: 1px solid ${colors.border}; color: ${colors.muted}; }
    .qa-logout:hover { background: ${colors.input}; color: ${colors.text}; }
  `;

  const SHIELD_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>';

  class QuickAuthWidget {
    constructor() {
      this.mode = 'login';
      this.user = null;
      this.token = localStorage.getItem('qa_token_' + API_KEY);
      this.container = null;
      this.init();
    }

    async init() {
      // Inject styles
      const style = document.createElement('style');
      style.textContent = STYLES;
      document.head.appendChild(style);

      // Create container
      this.container = document.createElement('div');
      this.container.className = 'qa-widget';
      script.parentNode.insertBefore(this.container, script);

      // Check existing session
      if (this.token) {
        try {
          const res = await fetch(BASE_URL + '/api/auth/me', {
            headers: { 'X-API-Key': API_KEY, 'Authorization': 'Bearer ' + this.token }
          });
          if (res.ok) {
            const data = await res.json();
            this.user = data.user;
            this.render();
            this.emit('login', this.user);
            return;
          }
        } catch (e) { /* ignore */ }
        localStorage.removeItem('qa_token_' + API_KEY);
        this.token = null;
      }

      this.render();
    }

    emit(event, detail) {
      window.dispatchEvent(new CustomEvent('quickauth:' + event, { detail }));
    }

    render() {
      if (!this.container) return;

      if (this.user) {
        this.container.innerHTML = `
          <div class="qa-header">${SHIELD_SVG}<span>QuickAuth</span></div>
          <div class="qa-user">
            <div class="qa-user-email">${this.user.email}</div>
            <div class="qa-user-sub">${this.user.display_name || 'Logged in'}</div>
            <button class="qa-btn qa-logout" id="qa-logout">Log out</button>
          </div>
        `;
        this.container.querySelector('#qa-logout').addEventListener('click', () => this.logout());
        return;
      }

      const isLogin = this.mode === 'login';
      this.container.innerHTML = `
        <div class="qa-header">${SHIELD_SVG}<span>QuickAuth</span></div>
        <div class="qa-tabs">
          <button class="qa-tab ${isLogin ? 'active' : ''}" data-mode="login">Log in</button>
          <button class="qa-tab ${!isLogin ? 'active' : ''}" data-mode="signup">Sign up</button>
        </div>
        <div id="qa-error" class="qa-error" style="display:none"></div>
        <div id="qa-success" class="qa-success" style="display:none"></div>
        <input class="qa-input" id="qa-email" type="email" placeholder="Email" />
        <input class="qa-input" id="qa-password" type="password" placeholder="Password" />
        ${!isLogin ? '<input class="qa-input" id="qa-name" type="text" placeholder="Display name (optional)" />' : ''}
        <button class="qa-btn" id="qa-submit">${isLogin ? 'Log in' : 'Create account'}</button>
      `;

      // Tab events
      this.container.querySelectorAll('.qa-tab').forEach(tab => {
        tab.addEventListener('click', () => {
          this.mode = tab.getAttribute('data-mode');
          this.render();
        });
      });

      // Submit
      this.container.querySelector('#qa-submit').addEventListener('click', () => this.submit());

      // Enter key
      this.container.querySelectorAll('.qa-input').forEach(input => {
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter') this.submit(); });
      });
    }

    async submit() {
      const email = this.container.querySelector('#qa-email').value.trim();
      const password = this.container.querySelector('#qa-password').value;
      const nameEl = this.container.querySelector('#qa-name');
      const display_name = nameEl ? nameEl.value.trim() : '';
      const errorEl = this.container.querySelector('#qa-error');
      const btn = this.container.querySelector('#qa-submit');

      errorEl.style.display = 'none';

      if (!email || !password) {
        errorEl.textContent = 'Email and password are required';
        errorEl.style.display = 'block';
        return;
      }

      btn.disabled = true;
      btn.textContent = 'Loading...';

      try {
        const endpoint = this.mode === 'login' ? '/api/auth/login' : '/api/auth/register';
        const body = this.mode === 'login' ? { email, password } : { email, password, display_name };

        const res = await fetch(BASE_URL + endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
          body: JSON.stringify(body)
        });

        const data = await res.json();

        if (!res.ok) {
          errorEl.textContent = data.error || 'Something went wrong';
          errorEl.style.display = 'block';
          btn.disabled = false;
          btn.textContent = this.mode === 'login' ? 'Log in' : 'Create account';
          return;
        }

        this.user = data.user;
        this.token = data.token;
        localStorage.setItem('qa_token_' + API_KEY, data.token);
        this.render();
        this.emit('login', this.user);

      } catch (err) {
        errorEl.textContent = 'Network error. Please try again.';
        errorEl.style.display = 'block';
        btn.disabled = false;
        btn.textContent = this.mode === 'login' ? 'Log in' : 'Create account';
      }
    }

    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('qa_token_' + API_KEY);
      this.mode = 'login';
      this.render();
      this.emit('logout');
    }
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new QuickAuthWidget());
  } else {
    new QuickAuthWidget();
  }
})();
