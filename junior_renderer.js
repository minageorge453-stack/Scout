/* ========================================================================
   JUNIOR RENDERER — محرّك عرض قطاع المبتدئ
   يدمج البيانات الثابتة (SHARED) مع السفر المختار
   ======================================================================== */

// تحويل أرقام انجليزية لعربية
function arabicNum(n) {
  const ar = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
  return String(n).split('').map(d => ar[parseInt(d)] || d).join('');
}

// دمج اجتماع SHARED مع اجتماع البوك
function buildMeeting(shared, book, meetingIdx) {
  const frame = shared.meetingFrames[meetingIdx];
  const bookMeeting = book.meetings[meetingIdx];
  const psalm = shared.psalms[meetingIdx];
  const marineSkill = shared.marineSkills[meetingIdx];

  // ربط محور المحور (theme) بالاجتماع
  // الاجتماعات: 1=opening, 2-3=theme1, 4-5=theme2, 6-7=theme3, 8=theme4, 9=outdoor, 10=closing
  let themeNum = null;
  if (meetingIdx >= 1 && meetingIdx <= 2) themeNum = 0;       // theme 1
  else if (meetingIdx >= 3 && meetingIdx <= 4) themeNum = 1;  // theme 2
  else if (meetingIdx >= 5 && meetingIdx <= 6) themeNum = 2;  // theme 3
  else if (meetingIdx === 7) themeNum = 3;                    // theme 4
  const currentTheme = (themeNum !== null) ? book.themes[themeNum] : null;

  return {
    num: frame.num,
    phase: frame.phase,
    special: frame.special,
    eyebrow: currentTheme ? `${book.emoji} ${currentTheme.title}` : frame.frame,
    title: bookMeeting.lectureTitle || frame.frame,
    slogan: bookMeeting.slogan,
    objective: bookMeeting.objective,
    psalm: `${psalm.psalm} — ${psalm.excerpt}`,
    proverb: bookMeeting.proverb,
    themeContext: currentTheme,
    bookMeeting,
    marineSkill
  };
}

// رسم سياق المحور
function renderThemeContext(theme) {
  if (!theme) return '';
  return `
    <div class="theme-context">
      <div class="theme-num">المحور ${arabicNum(theme.num)} · ${theme.subtitle}</div>
      <h4>${theme.title}</h4>
      <p>${theme.summary}</p>
    </div>
  `;
}

// رسم اجتماع كامل للمبتدئ
function renderJuniorMeeting(meeting, shared) {
  const specialClass = meeting.special ? ' special' : '';
  const struct = shared.meetingStructure;
  const bm = meeting.bookMeeting;

  // === Theme Context ===
  const themeHTML = renderThemeContext(meeting.themeContext);

  // === Opening ritual (ثابت) ===
  let openingHTML = '<div class="phase-tag-row">OPENING · افتتاح ثابت (٣٥د)</div>';
  openingHTML += '<ul class="schedule-list">';
  struct.opening.forEach(s => {
    openingHTML += `<li><span class="time-tag">${s.time}</span><span>${s.item}</span></li>`;
  });
  openingHTML += '</ul>';

  // === Marine Skill (ثابت) ===
  let marineHTML = '';
  if (meeting.marineSkill) {
    marineHTML = `
      <div class="lecture-box" style="border-right-color: var(--teal);">
        <div class="type-tag">⚓ SCOUT BHRY · مهارة بحرية (٣٠د)</div>
        <h4>${meeting.marineSkill.skill}</h4>
        <div class="intro">${meeting.marineSkill.details}</div>
      </div>
    `;
  }

  // === Lecture (متغيّر حسب السفر) ===
  let lectureHTML = '';
  if (bm.lectureTitle) {
    lectureHTML = '<div class="lecture-box">';
    lectureHTML += `<div class="type-tag">📚 ${bm.lectureType || 'محاضرة'} (٤٠د)</div>`;
    lectureHTML += `<h4>${bm.lectureTitle}</h4>`;
    if (bm.lectureIntro) lectureHTML += `<div class="intro">${bm.lectureIntro}</div>`;
    if (bm.lecturePoints && bm.lecturePoints.length) {
      lectureHTML += '<ul>';
      bm.lecturePoints.forEach(p => lectureHTML += `<li>${p}</li>`);
      lectureHTML += '</ul>';
    }
    lectureHTML += '</div>';
  }

  // === Activity Note (لو موجود) ===
  let activityHTML = '';
  if (bm.activityNote) {
    activityHTML = `
      <div class="activity-box">
        <div class="type-tag">🎯 نشاط كبير (٤٥د)</div>
        <div class="goal">${bm.activityNote}</div>
      </div>
    `;
  }

  // === Proverb ===
  let proverbHTML = '';
  if (bm.proverb) {
    proverbHTML = `
      <div class="verse-line">
        <strong style="color:var(--teal-deep);font-family:var(--font-accent);font-size:11px;letter-spacing:2px;display:block;margin-bottom:6px;">موضوع: ${bm.proverb.topic}</strong>
        ${bm.proverb.verse}
      </div>
    `;
  }

  // === Closing (ثابت) ===
  let closingHTML = `
    <div class="phase-tag-row">CLOSING · ختام ثابت (٢٠د)</div>
    <ul class="schedule-list">
      <li><span class="time-tag">١٠د</span><span>مسابقة الآيات + تكريم سريع</span></li>
      <li><span class="time-tag">١٠د</span><span>تاسك الأسبوع + الصلاة الختامية</span></li>
    </ul>
  `;

  return `
    <article class="meeting-card${specialClass}" id="jr-meeting-${meeting.num}">
      <div class="meeting-header" onclick="this.parentElement.classList.toggle('open')">
        <div class="meeting-num">${arabicNum(meeting.num)}</div>
        <div class="meeting-info">
          <div class="eyebrow">${meeting.eyebrow} · ${meeting.phase}</div>
          <h3>${meeting.title}</h3>
          ${meeting.slogan ? `<p class="slogan">${meeting.slogan}</p>` : ''}
        </div>
        <div class="toggle-chev">▼</div>
      </div>
      <div class="meeting-body">
        <div class="meeting-body-inner">
          ${themeHTML}
          ${meeting.objective ? `<div class="objective-box"><strong>الهدف</strong>${meeting.objective}</div>` : ''}
          <div class="verse-line" style="margin-bottom:20px;">
            <strong style="color:var(--coral-deep);font-family:var(--font-accent);font-size:11px;letter-spacing:2px;display:block;margin-bottom:6px;">PSALM · المزمور</strong>
            ${meeting.psalm}
          </div>
          ${proverbHTML}
          <div class="meeting-block">
            <h4 class="block-title">⏱ هيكل الاجتماع (٣ ساعات)</h4>
            ${openingHTML}
            ${marineHTML}
            ${lectureHTML}
            ${activityHTML}
            ${closingHTML}
          </div>
        </div>
      </div>
    </article>
  `;
}

// رسم لمحة عامة عن السفر المختار
function renderBookOverview(book, shared) {
  return `
    <div class="book-overview">
      <div class="book-header">
        <div class="book-emoji">${book.emoji}</div>
        <div>
          <h2>${book.name}</h2>
          <p class="book-subtitle">${book.description}</p>
        </div>
      </div>
      <div class="book-verse">
        <p>«${book.coreVerse}»</p>
        <cite>${book.coreVerseRef}</cite>
      </div>
      <div class="themes-grid">
        ${book.themes.map(t => `
          <div class="theme-card-mini">
            <div class="num">المحور ${arabicNum(t.num)}</div>
            <h4>${t.title}</h4>
            <div class="sub">${t.subtitle}</div>
            <p>${t.summary}</p>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// رسم TOC للمبتدئ
function renderJuniorTOC(meetings, mountId) {
  const mount = document.getElementById(mountId);
  if (!mount) return;
  const html = meetings.map(m => `
    <a href="#jr-meeting-${m.num}" class="toc-chip${m.special ? ' special' : ''}" onclick="openJuniorMeeting(${m.num})">
      <span class="num">${arabicNum(m.num)}</span>
      <span>${m.title.length > 25 ? m.title.substring(0, 25) + '...' : m.title}</span>
    </a>
  `).join('');
  mount.innerHTML = html;
}

function openJuniorMeeting(num) {
  setTimeout(() => {
    const card = document.getElementById('jr-meeting-' + num);
    if (card && !card.classList.contains('open')) {
      card.classList.add('open');
    }
  }, 100);
}

// الدالة الرئيسية: تأخذ السفر المختار وترسم كل الصفحة
function renderJuniorSeason(season, bookId, mountIds) {
  const book = season.books[bookId];
  if (!book) {
    console.error('Book not found:', bookId);
    return;
  }
  const shared = season.shared;

  // 1. رسم لمحة السفر
  const overviewMount = document.getElementById(mountIds.overview);
  if (overviewMount) {
    overviewMount.innerHTML = renderBookOverview(book, shared);
  }

  // 2. بناء كل الاجتماعات بدمج SHARED مع BOOK
  const builtMeetings = [];
  for (let i = 0; i < shared.meetingFrames.length; i++) {
    builtMeetings.push(buildMeeting(shared, book, i));
  }

  // 3. رسم الـ TOC
  if (mountIds.toc) {
    renderJuniorTOC(builtMeetings, mountIds.toc);
  }

  // 4. رسم الاجتماعات
  const listMount = document.getElementById(mountIds.list);
  if (listMount) {
    let html = '';
    let lastPhase = '';
    builtMeetings.forEach(m => {
      if (m.phase && m.phase !== lastPhase) {
        html += `
          <div class="phase-divider">
            <div class="line"></div>
            <div class="label">${m.phase}</div>
            <div class="line"></div>
          </div>
        `;
        lastPhase = m.phase;
      }
      html += renderJuniorMeeting(m, shared);
    });
    listMount.innerHTML = html;
  }
}
