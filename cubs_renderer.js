/* ========================================================================
   CUBS RENDERER — محرّك عرض قطاع الأشبال والزهرات
   ======================================================================== */

function arabicNumCubs(n) {
  const ar = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
  return String(n).split('').map(d => ar[parseInt(d)] || d).join('');
}

// لقاء أو احتفال خاص (مثل قداس البداية / مؤتمر التربية)
function renderCeremony(m) {
  const activitiesHTML = (m.activities || []).map(a => `
    <div class="ceremony-item">
      <div class="ceremony-type">${a.type}</div>
      <div class="ceremony-content">
        <h5>${a.title}</h5>
        <p>${a.description}</p>
      </div>
    </div>
  `).join('');

  return `
    <article class="cub-card ceremony" id="cub-meeting-${m.num}">
      <div class="cub-header" onclick="this.parentElement.classList.toggle('open')">
        <div class="cub-date">${m.date}</div>
        <div class="cub-info">
          <div class="eyebrow">🕊️ احتفال / لقاء خاص</div>
          <h3>${m.title}</h3>
          ${m.slogan ? `<p class="slogan">${m.slogan}</p>` : ''}
        </div>
        <div class="toggle-chev">▼</div>
      </div>
      <div class="cub-body">
        <div class="cub-body-inner">
          ${m.objective ? `<div class="objective-box"><strong>الهدف</strong>${m.objective}</div>` : ''}
          <div class="ceremony-list">
            ${activitiesHTML}
          </div>
        </div>
      </div>
    </article>
  `;
}

// لقاء عادي
function renderRegularMeeting(m, axes) {
  const axisMap = {};
  axes.forEach(a => { axisMap[a.id] = a; });

  // المحطات (stations) — كل محطة منها محور
  const stationsHTML = (m.stations || []).map(s => {
    const axis = axisMap[s.axis] || { name: s.axis, emoji: '', color: '#888' };
    return `
      <div class="station" style="--axis-color: ${axis.color};">
        <div class="station-header">
          <div class="station-axis">
            <span class="axis-emoji">${axis.emoji}</span>
            <span class="axis-name">${axis.name}</span>
          </div>
          <div class="station-duration">${s.duration}</div>
        </div>
        <h4 class="station-title">${s.title}</h4>
        <p class="station-content">${s.content}</p>
      </div>
    `;
  }).join('');

  // درس الأنبا موسى
  const mosesHTML = m.moses ? `
    <div class="moses-box">
      <div class="moses-emoji">🕊️</div>
      <div>
        <div class="moses-label">درس من الأنبا موسى الأسود</div>
        <p>${m.moses.lesson}</p>
      </div>
    </div>
  ` : '';

  // الآية
  const verseHTML = m.verse ? `
    <div class="cub-verse">
      <p>«${m.verse.text}»</p>
      <cite>${m.verse.ref}</cite>
    </div>
  ` : '';

  return `
    <article class="cub-card" id="cub-meeting-${m.num}">
      <div class="cub-header" onclick="this.parentElement.classList.toggle('open')">
        <div class="cub-date">${m.date}</div>
        <div class="cub-info">
          <div class="eyebrow">اللقاء ${arabicNumCubs(m.num)}</div>
          <h3>${m.title}</h3>
          ${m.slogan ? `<p class="slogan">${m.slogan}</p>` : ''}
        </div>
        <div class="toggle-chev">▼</div>
      </div>
      <div class="cub-body">
        <div class="cub-body-inner">
          ${m.objective ? `<div class="objective-box"><strong>الهدف</strong>${m.objective}</div>` : ''}
          ${verseHTML}

          <div class="stations-grid">
            ${stationsHTML}
          </div>

          ${mosesHTML}

          ${m.closing ? `<div class="closing-note">🏁 <strong>الختام:</strong> ${m.closing}</div>` : ''}
        </div>
      </div>
    </article>
  `;
}

// رسم TOC للأشبال
function renderCubsTOC(meetings, mountId) {
  const mount = document.getElementById(mountId);
  if (!mount) return;
  const html = meetings.map(m => `
    <a href="#cub-meeting-${m.num}" class="cub-toc-chip${m.special ? ' special' : ''}${m.isCeremony ? ' ceremony' : ''}" onclick="openCubMeeting(${m.num})">
      <span class="date-tag">${m.date}</span>
      <span class="title">${m.title}</span>
    </a>
  `).join('');
  mount.innerHTML = html;
}

function openCubMeeting(num) {
  setTimeout(() => {
    const card = document.getElementById('cub-meeting-' + num);
    if (card && !card.classList.contains('open')) {
      card.classList.add('open');
    }
  }, 100);
}

// الدالة الرئيسية
function renderCubsSeason(season, mountIds) {
  const meetings = season.meetings;
  const axes = season.axes;

  // TOC
  if (mountIds.toc) renderCubsTOC(meetings, mountIds.toc);

  // List
  const mount = document.getElementById(mountIds.list);
  if (!mount) return;

  const html = meetings.map(m =>
    m.isCeremony ? renderCeremony(m) : renderRegularMeeting(m, axes)
  ).join('');

  mount.innerHTML = html;
}
