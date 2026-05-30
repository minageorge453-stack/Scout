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

  // ===== Init: seed default users on first load =====
  init() {
    if (!localStorage.getItem(this.KEY_USERS)) {
      localStorage.setItem(this.KEY_USERS, JSON.stringify(this.DEFAULT_USERS));
    }
  },

  // ===== Auth: login =====
  login(email, password) {
    const users = JSON.parse(localStorage.getItem(this.KEY_USERS) || '[]');
    const user = users.find(u =>
      u.email.toLowerCase() === email.toLowerCase().trim() &&
      u.password === password
    );
    if (!user) return { ok: false, error: 'الإيميل أو الباسورد غير صحيح' };
    const { password: _, ...safe } = user;
    localStorage.setItem(this.KEY_CURRENT, JSON.stringify(safe));
    return { ok: true, user: safe };
  },

  // ===== Auth: current user =====
  currentUser() {
    const raw = localStorage.getItem(this.KEY_CURRENT);
    return raw ? JSON.parse(raw) : null;
  },

  // ===== Auth: logout =====
  logout() {
    localStorage.removeItem(this.KEY_CURRENT);
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
