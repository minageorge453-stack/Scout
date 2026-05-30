/* ========================================================================
   MEETING RENDERER — محرّك عرض الاجتماعات
   يستقبل بيانات السيزون ويرسم كل الاجتماعات + جدول المحتويات
   ======================================================================== */

// رسم اجتماع واحد كامل
function renderMeeting(m) {
  const specialClass = m.special ? ' special' : '';

  // === Schedule (الجدول الزمني) ===
  let scheduleHTML = '';
  if (m.schedule && m.schedule.length) {
    scheduleHTML = '<div class="meeting-block">';
    scheduleHTML += '<h4 class="block-title">⏱ الجدول الزمني</h4>';
    scheduleHTML += '<ul class="schedule-list">';
    m.schedule.forEach(s => {
      if (s.phase) {
        scheduleHTML += `<li><span class="phase-tag">${s.phase}</span></li>`;
      } else {
        scheduleHTML += `<li><span class="time-tag">${s.time}</span><span>${s.item}</span></li>`;
      }
    });
    scheduleHTML += '</ul></div>';
  }

  // === Lectures (المحاضرات) ===
  let lecturesHTML = '';
  if (m.lectures && m.lectures.length) {
    lecturesHTML = '<div class="meeting-block">';
    lecturesHTML += '<h4 class="block-title">📚 المحاضرات</h4>';
    m.lectures.forEach(l => {
      lecturesHTML += '<div class="lecture-box">';
      if (l.type) lecturesHTML += `<div class="type-tag">${l.type}</div>`;
      lecturesHTML += `<h4>${l.title}</h4>`;
      if (l.intro) lecturesHTML += `<div class="intro">${l.intro}</div>`;
      if (l.points && l.points.length) {
        lecturesHTML += '<ul>';
        l.points.forEach(p => lecturesHTML += `<li>${p}</li>`);
        lecturesHTML += '</ul>';
      }
      if (l.father) {
        lecturesHTML += `<div class="verse-line" style="font-style:italic;">${l.father.quote}<span class="ref">— ${l.father.who}</span></div>`;
      }
      lecturesHTML += '</div>';
    });
    lecturesHTML += '</div>';
  }

  // === Activities (الأنشطة) ===
  let activitiesHTML = '';
  if (m.activities && m.activities.length) {
    activitiesHTML = '<div class="meeting-block">';
    activitiesHTML += '<h4 class="block-title">🎯 الأنشطة</h4>';
    m.activities.forEach(a => {
      activitiesHTML += '<div class="activity-box">';
      if (a.type) activitiesHTML += `<div class="type-tag">${a.type}</div>`;
      activitiesHTML += `<h4>${a.title}</h4>`;
      if (a.goal) activitiesHTML += `<div class="goal">${a.goal}</div>`;
      if (a.steps && a.steps.length) {
        activitiesHTML += '<ul>';
        a.steps.forEach(s => activitiesHTML += `<li>${s}</li>`);
        activitiesHTML += '</ul>';
      }
      activitiesHTML += '</div>';
    });
    activitiesHTML += '</div>';
  }

  // === Proverb verse ===
  let proverbHTML = '';
  if (m.proverb) {
    proverbHTML = `
      <div class="meeting-block">
        <h4 class="block-title">📖 من سفر الأمثال</h4>
        <div class="verse-line">
          <strong style="color:var(--teal-deep);font-family:var(--font-accent);font-size:11px;letter-spacing:2px;display:block;margin-bottom:6px;">موضوع: ${m.proverb.topic}</strong>
          ${m.proverb.verse}
        </div>
      </div>
    `;
  }

  // === Psalm ===
  let psalmHTML = '';
  if (m.psalm) {
    psalmHTML = `
      <div class="verse-line" style="margin-bottom:24px;">
        <strong style="color:var(--coral-deep);font-family:var(--font-accent);font-size:11px;letter-spacing:2px;display:block;margin-bottom:6px;">PSALM · المزمور</strong>
        ${m.psalm}
      </div>
    `;
  }

  return `
    <article class="meeting-card${specialClass}" id="meeting-${m.num}">
      <div class="meeting-header" onclick="this.parentElement.classList.toggle('open')">
        <div class="meeting-num">${arabicNum(m.num)}</div>
        <div class="meeting-info">
          ${m.eyebrow ? `<div class="eyebrow">${m.eyebrow}${m.phase ? ' · ' + m.phase : ''}</div>` : ''}
          <h3>${m.title}</h3>
          ${m.slogan ? `<p class="slogan">${m.slogan}</p>` : ''}
        </div>
        <div class="toggle-chev">▼</div>
      </div>
      <div class="meeting-body">
        <div class="meeting-body-inner">
          ${m.objective ? `<div class="objective-box"><strong>الهدف</strong>${m.objective}</div>` : ''}
          ${psalmHTML}
          ${proverbHTML}
          ${scheduleHTML}
          ${lecturesHTML}
          ${activitiesHTML}
        </div>
      </div>
    </article>
  `;
}

// تحويل أرقام انجليزية لعربية
function arabicNum(n) {
  const ar = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
  return String(n).split('').map(d => ar[parseInt(d)] || d).join('');
}

// رسم جدول المحتويات (TOC)
function renderTOC(meetings, mountId) {
  const mount = document.getElementById(mountId);
  if (!mount) return;
  const html = meetings.map(m => `
    <a href="#meeting-${m.num}" class="toc-chip${m.special ? ' special' : ''}" onclick="openMeeting(${m.num})">
      <span class="num">${arabicNum(m.num)}</span>
      <span>${m.title}</span>
    </a>
  `).join('');
  mount.innerHTML = html;
}

// فتح اجتماع معيّن من TOC
function openMeeting(num) {
  setTimeout(() => {
    const card = document.getElementById('meeting-' + num);
    if (card && !card.classList.contains('open')) {
      card.classList.add('open');
    }
  }, 100);
}

// رسم كل الاجتماعات في الصفحة، مع فواصل الـ phases
function renderAllMeetings(season, listMountId, tocMountId) {
  const meetings = season.meetings || [];

  // رسم الـ TOC الأول
  if (tocMountId) renderTOC(meetings, tocMountId);

  // رسم الـ list مع فواصل phases
  const mount = document.getElementById(listMountId);
  if (!mount) return;

  let html = '';
  let lastPhase = '';
  meetings.forEach(m => {
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
    html += renderMeeting(m);
  });
  mount.innerHTML = html;
}
