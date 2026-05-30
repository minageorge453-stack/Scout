/* ========================================================================
   ZAYED SCOUT SYSTEM — Shared Auth & Navigation
   Authentication: LocalStorage-based (إيميل + باسورد)
   ======================================================================== */

const ZS = {
  // ===== Storage keys =====
  KEY_USERS: 'zs_users',
  KEY_CURRENT: 'zs_current_user',
  KEY_DATA: 'zs_data',

  // ===== Default users (seed) =====
  DEFAULT_USERS: [
    {
      id: 'u_admin',
      name: 'القائد العام',
      email: 'admin@zayedscout.org',
      password: 'admin2026',
      role: 'admin',
      sector: 'all',
      avatar: 'ق'
    },
    {
      id: 'u_leader_advanced',
      name: 'قائد قطاع متقدم',
      email: 'advanced@zayedscout.org',
      password: 'scout2026',
      role: 'sector_leader',
      sector: 'advanced',
      avatar: 'م'
    }
  ],

  // ===== localStorage safe wrappers =====
  _storageGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  },
  _storageSet(key, value) {
    try { localStorage.setItem(key, value); return true; } catch (e) { return false; }
  },
  _storageRemove(key) {
    try { localStorage.removeItem(key); } catch (e) {}
  },

  // In-memory session fallback (when localStorage is blocked)
  _memSession: null,

  // ===== Init: seed default users on first load =====
  init() {
    if (!this._storageGet(this.KEY_USERS)) {
      this._storageSet(this.KEY_USERS, JSON.stringify(this.DEFAULT_USERS));
    }
  },

  // ===== Auth: login =====
  login(email, password) {
    // Try localStorage users first, fall back to DEFAULT_USERS
    let users = this.DEFAULT_USERS;
    const stored = this._storageGet(this.KEY_USERS);
    if (stored) {
      try { users = JSON.parse(stored); } catch (e) { users = this.DEFAULT_USERS; }
    }

    const user = users.find(u =>
      u.email.toLowerCase() === email.toLowerCase().trim() &&
      u.password === password
    );

    if (!user) return { ok: false, error: 'الإيميل أو الباسورد غير صحيح' };

    const { password: _, ...safe } = user;

    // Try to save to localStorage; if blocked, use in-memory fallback
    const saved = this._storageSet(this.KEY_CURRENT, JSON.stringify(safe));
    if (!saved) {
      this._memSession = safe;
    }

    return { ok: true, user: safe };
  },

  // ===== Auth: current user =====
  currentUser() {
    // Check in-memory session first
    if (this._memSession) return this._memSession;

    const raw = this._storageGet(this.KEY_CURRENT);
    return raw ? JSON.parse(raw) : null;
  },

  // ===== Auth: logout =====
  logout() {
    this._memSession = null;
    this._storageRemove(this.KEY_CURRENT);
    window.location.href = 'index.html';
  },

  // ===== Auth: require login (call on every protected page) =====
  requireAuth() {
    const u = this.currentUser();
    if (!u) {
      window.location.href = 'index.html';
      return null;
    }
    return u;
  },

  // ===== Render: top nav (call after requireAuth) =====
  renderTopNav(currentPage = '') {
    const user = this.currentUser();
    if (!user) return '';
    const links = [
      { id: 'dashboard', label: 'الرئيسية', href: 'dashboard.html' },
      { id: 'identity', label: 'الهوية', href: 'identity.html' },
      { id: 'sectors', label: 'القطاعات', href: 'sectors.html' },
      { id: 'members', label: 'الأولاد', href: 'members.html' },
      { id: 'leaders', label: 'القادة', href: 'leaders.html' },
      { id: 'protocols', label: 'البروتوكولات', href: 'protocols.html' }
    ];
    const linksHTML = links.map(l =>
      `<li><a href="${l.href}" class="${l.id === currentPage ? 'active' : ''}">${l.label}</a></li>`
    ).join('');
    return `
      <nav class="topnav">
        <div class="topnav-inner">
          <a class="brand" href="dashboard.html">
            <div class="brand-mark brand-mark--logo">
              <img src="assets/logos/logo_scout.webp" alt="كشافة كنائس زايد">
            </div>
            <div>
              <div class="brand-name">كشافة كنائس زايد</div>
              <div class="brand-sub">ZAYED SCOUT GROUPS</div>
            </div>
          </a>
          <ul class="nav-links">${linksHTML}</ul>
          <div class="user-chip">
            <span>${user.name}</span>
            <div class="user-chip-avatar">${user.avatar || user.name.charAt(0)}</div>
            <button class="user-chip-logout" onclick="ZS.logout()">خروج</button>
          </div>
        </div>
      </nav>
    `;
  },

  // ===== Render: footer =====
  renderFooter() {
    return `
      <footer class="footer">
        <div class="footer-verse">«لاَ يَغْلِبَنَّكَ الشَّرُّ، بَلِ اغْلِبِ الشَّرَّ بِالْخَيْرِ» — رومية ١٢ : ٢١</div>
        <div>ZAYED SCOUT SYSTEM · SEASON 2026 · © المجموعة الكشفية لكنائس زايد</div>
      </footer>
    `;
  },

  // ===== Mount: standard page chrome =====
  mountChrome(currentPage = '') {
    const top = document.getElementById('topnav-mount');
    const foot = document.getElementById('footer-mount');
    if (top) top.innerHTML = this.renderTopNav(currentPage);
    if (foot) foot.innerHTML = this.renderFooter();
  }
};

ZS.init();
