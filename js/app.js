'use strict';

// ============================================================
// STATE
// ============================================================
const DEFAULT_STATE = {
  activeView: 'dashboard',
  calendarTerm: 'A',
  calendarMode: 'all',      // 'all' | 'mine'
  schedule: { A:[], B:[], C:[], D:[] },
  selectedSections: { A:{}, B:{}, C:{}, D:{} }, // courseId → section index
  project: null,             // 'IQP' | 'MQP'
  projectDist: [0,0,0,0],    // credits per term A B C D
  termTags: { A: { iqp: false, hu39xx: false }, B: { iqp: false, hu39xx: false }, C: { iqp: false, hu39xx: false }, D: { iqp: false, hu39xx: false } },
  autoResult: null,
  manualTerm: 'A',
  manualFilter: 'all',
  catalogSemester: 'all',   // 'all' | 'fall' | 'spring'
  catalogTerm: 'all',       // 'all' | 'A' | 'B' | 'C' | 'D'
  catalogSubject: 'all',    // 'all' | 'CS' | 'DS' | 'EN' | 'INTL' | 'HU' | 'WPE'
  catalogTime: 'all',       // 'all' | 'morning' | 'afternoon' | 'evening'
};

let state = loadState();

function loadState() {
  try {
    const saved = localStorage.getItem('wpi-2627');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure nested objects are properly merged
      const s = Object.assign({}, DEFAULT_STATE, parsed);
      s.schedule = Object.assign({A:[],B:[],C:[],D:[]}, parsed.schedule);
      s.selectedSections = Object.assign({A:{},B:{},C:{},D:{}}, parsed.selectedSections);
      s.termTags = Object.assign({A:{iqp:false,hu39xx:false},B:{iqp:false,hu39xx:false},C:{iqp:false,hu39xx:false},D:{iqp:false,hu39xx:false}}, parsed.termTags);
      return s;
    }
  } catch(e) {}
  return Object.assign({}, DEFAULT_STATE,
    { schedule:{A:[],B:[],C:[],D:[]}, selectedSections:{A:{},B:{},C:{},D:{}}, termTags:{A:{iqp:false,hu39xx:false},B:{iqp:false,hu39xx:false},C:{iqp:false,hu39xx:false},D:{iqp:false,hu39xx:false}} });
}
function saveState() {
  try { localStorage.setItem('wpi-2627', JSON.stringify(state)); } catch(e) {}
}

// ============================================================
// NAVIGATION
// ============================================================
function showView(id) {
  state.activeView = id;
  saveState();
  document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.id === `view-${id}`));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.view === id));
  renderActiveView();
}
function renderActiveView() {
  switch (state.activeView) {
    case 'dashboard': renderDashboard(); break;
    case 'calendar':  renderCalendar();  break;
    case 'auto':      renderAuto();      break;
    case 'manual':    renderManual();    break;
    case 'catalog':   renderCatalog();   break;
  }
}

// ============================================================
// HELPERS
// ============================================================
function regCount(term) {
  return state.schedule[term].filter(id => { const c=getCourse(id); return c&&c.type!=='WPE'; }).length;
}
function effectiveRegCount(term) {
  const reg = regCount(term);
  const tags = state.termTags?.[term] || { iqp: false, hu39xx: false };
  return reg + (tags.iqp ? 1 : 0) + (tags.hu39xx ? 1 : 0);
}
function allCourses() {
  return ['A','B','C','D'].flatMap(t => state.schedule[t]);
}
function courseInSchedule(id) { return allCourses().includes(id); }
function courseTermInSchedule(id, term) { return state.schedule[term].includes(id); }

// Returns the selected section object for a course in a term
// Falls back to sections[term][0] if nothing explicitly selected
function getSelectedSection(courseId, term) {
  const c = getCourse(courseId);
  if (!c || !c.sections[term]) return null;
  const idx = state.selectedSections[term]?.[courseId] ?? 0;
  return c.sections[term][Math.min(idx, c.sections[term].length - 1)] || null;
}

function setSelectedSection(courseId, term, idx) {
  if (!state.selectedSections[term]) state.selectedSections[term] = {};
  state.selectedSections[term][courseId] = idx;
  saveState();
}

function toggleTermTag(term, tag) {
  if (!state.termTags) state.termTags = { A:{iqp:false,hu39xx:false}, B:{iqp:false,hu39xx:false}, C:{iqp:false,hu39xx:false}, D:{iqp:false,hu39xx:false} };
  if (!state.termTags[term]) state.termTags[term] = { iqp: false, hu39xx: false };
  state.termTags[term][tag] = !state.termTags[term][tag];
  // HU 39XX is one term only — uncheck other terms when setting
  if (tag === 'hu39xx' && state.termTags[term].hu39xx) {
    for (const t of ['A','B','C','D']) {
      if (t !== term) state.termTags[t].hu39xx = false;
    }
  }
  saveState();
  renderCalendar();
}

// Named handler for section dropdown — captures value from event.target BEFORE
// renderManual() replaces the DOM, avoiding stale-this issues in inline handlers
function changeCourseSection(evt, courseId, term) {
  const idx = +evt.target.value;
  setSelectedSection(courseId, term, idx);
  renderManual();
}

function getScheduledBefore(term) {
  const TERMS = ['A','B','C','D'];
  const idx = TERMS.indexOf(term);
  return TERMS.slice(0, idx).flatMap(t => state.schedule[t]);
}

function isPrereqMet(courseId, term) {
  const c = getCourse(courseId);
  if (!c) return true;
  const before = getScheduledBefore(term);
  // Extra rule: CS 4342 requires CS 3733 before this term
  if (courseId === 'CS4342') {
    return before.includes('CS3733');
  }
  return c.prerequisites.every(p => before.includes(p));
}

function getEliminatedInTerm(term) {
  // Returns a Set of course IDs that CANNOT be added to this term
  const eliminated = new Set();
  const available = TERM_AVAIL[term];
  for (const id of available) {
    // Already in this term
    if (courseTermInSchedule(id, term)) continue;
    // Already taken another term (except IQP/MQP can repeat)
    const c = getCourse(id);
    if (!c) continue;
    if (!c.isProject && courseInSchedule(id)) { eliminated.add(id); continue; }
    // Prereqs not met
    if (!isPrereqMet(id, term)) { eliminated.add(id); continue; }
    // Project conflict: if IQP selected, can't add MQP and vice versa
    if (id === 'IQP' && state.project === 'MQP') { eliminated.add(id); continue; }
    if (id === 'MQP' && state.project === 'IQP') { eliminated.add(id); continue; }
  }
  return eliminated;
}

// ============================================================
// DASHBOARD
// ============================================================
function renderDashboard() {
  const el = document.getElementById('view-dashboard');

  // Requirements check
  const all = allCourses();
  const intlCount = all.filter(id => { const c=getCourse(id); return c&&c.type==='INTL'; }).length;
  const hasHU     = all.includes('HU3900') || ['A','B','C','D'].some(t => state.termTags?.[t]?.hu39xx);
  const hasDS2010 = all.includes('DS2010');
  const hasDS3010 = all.includes('DS3010');
  const hasCS4432 = all.includes('CS4432');
  const iqpTagCount = ['A','B','C','D'].filter(t => state.termTags?.[t]?.iqp).length;
  const hasProj   = all.includes('IQP') || all.includes('MQP') || (state.project === 'IQP' && state.projectDist?.reduce((a,b)=>a+b,0) === 3) || iqpTagCount >= 3;

  const req = [
    { label:'2 INTL courses (before HU 3900)',  done: intlCount >= 2, partial:`${Math.min(intlCount,2)}/2` },
    { label:'HU 39XX (C or D term — not yet posted)', done: hasHU, partial: hasHU?'✓':'Slot reserved' },
    { label:'DS 2010 — Statistical Modeling',   done: hasDS2010,      partial: hasDS2010?'✓':'0/1' },
    { label:'DS 3010 — Computational Methods',  done: hasDS3010,      partial: hasDS3010?'✓':'0/1' },
    { label:'CS 4432 — Database Systems II',    done: hasCS4432,      partial: hasCS4432?'✓':'0/1' },
    { label:'IQP or MQP (3 credits, no gaps)',  done: hasProj,        partial: hasProj?'✓':'0/1' },
  ];

  const reqMet = req.filter(r => r.done).length;
  const pct = Math.round(reqMet / req.length * 100);

  // Validation
  const v = new ScheduleValidator(state.schedule, state.project, state.projectDist, state.termTags).validate();

  const fallReg  = effectiveRegCount('A') + effectiveRegCount('B');
  const springReg= effectiveRegCount('C') + effectiveRegCount('D');

  el.innerHTML = `
    <div class="page-header">
      <div>
        <h1>Schedule Overview</h1>
        <p class="subtitle">WPI 2026–27 Academic Year</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-primary" onclick="downloadSchedulePDF()">Download PDF</button>
        <button class="btn btn-outline" onclick="clearSchedule()">Clear Schedule</button>
      </div>
    </div>

    <div class="info-banner">
      📅 Course data from <strong>courselistings.wpi.edu</strong> (fetched Feb 2026).
      Note: <strong>HU 3900 sections not yet posted</strong> — a slot is reserved in your schedule.
      Verify enrollment before registering.
    </div>

    ${v.warnings.length ? `
      <div class="alert alert-warning">
        <strong>Warnings (${v.warnings.length})</strong>
        <ul>${v.warnings.map(w=>`<li>${w}</li>`).join('')}</ul>
      </div>` : ''}

    <div class="section-title">Requirements Progress</div>
    <div class="requirements-card">
      <div class="req-progress-bar">
        <div class="req-progress-fill" style="width:${pct}%"></div>
      </div>
      <div class="req-pct">${reqMet} of ${req.length} completed</div>
      <div class="req-grid">
        ${req.map(r=>`
          <div class="req-item ${r.done?'done':''}">
            <span class="req-check">${r.done?'✓':'○'}</span>
            <span class="req-label">${r.label}</span>
            <span class="req-status">${r.partial}</span>
          </div>`).join('')}
      </div>
    </div>

    <div class="section-title">Term Schedule</div>
    <div class="term-cards">
      ${['A','B','C','D'].map(t => renderTermCard(t)).join('')}
    </div>

    <div class="semester-totals">
      <div class="sem-box ${fallReg===7?'ok':fallReg>7?'over':'under'}">
        <div class="sem-label">Fall Semester (A+B)</div>
        <div class="sem-count">${fallReg}<span>/7</span></div>
        <div class="sem-desc">classes scheduled</div>
      </div>
      <div class="sem-box ${springReg===7?'ok':springReg>7?'over':'under'}">
        <div class="sem-label">Spring Semester (C+D)</div>
        <div class="sem-count">${springReg}<span>/7</span></div>
        <div class="sem-desc">classes scheduled</div>
      </div>
    </div>
  `;
}

function renderTermCard(term) {
  const info = TERM_INFO[term];
  const courses = state.schedule[term].map(id => getCourse(id)).filter(Boolean);
  const regular = courses.filter(c => c.type !== 'WPE');
  const pe = courses.filter(c => c.type === 'WPE');
  const tags = state.termTags?.[term] || { iqp: false, hu39xx: false };
  const tagCount = (tags.iqp ? 1 : 0) + (tags.hu39xx ? 1 : 0);
  const count = regular.length + tagCount;
  const status = count === 0 ? '' : count < 3 ? 'under' : count > 4 ? 'over' : 'ok';

  return `
    <div class="term-card">
      <div class="term-card-header" style="background:${info.color}">
        <span class="term-name">${info.name}</span>
        <span class="term-season">${info.season}</span>
        <span class="term-dates">${info.start} → ${info.end}</span>
      </div>
      <div class="term-card-body">
        <div class="term-count-row">
          <span class="count-badge ${status}">${count} class${count!==1?'es':''}</span>
          ${pe.length ? `<span class="pe-badge">+ ${pe.map(c=>c.code).join(', ')}</span>` : ''}
        </div>
        ${regular.length === 0 && tagCount === 0 ? '<div class="empty-term">No classes scheduled</div>' :
          [...regular.map(c => `
            <div class="term-course-chip" style="background:${TYPE_META[c.type].color}" onclick="openModal('${c.id}','${term}')">
              ${c.code}
            </div>`),
          tags.iqp ? `<div class="term-course-chip" style="background:${TYPE_META.IQP.color}">IQP</div>` : '',
          tags.hu39xx ? `<div class="term-course-chip" style="background:${TYPE_META.HU.color}">HU 39XX</div>` : ''].filter(Boolean).join('')}
      </div>
      <button class="btn-term-edit" onclick="state.manualTerm='${term}';showView('manual')">
        Edit ${term} term
      </button>
    </div>
  `;
}

function clearSchedule() {
  if (!confirm('Clear your entire schedule? This cannot be undone.')) return;
  state.schedule = { A:[], B:[], C:[], D:[] };
  state.selectedSections = { A:{}, B:{}, C:{}, D:{} };
  state.project = null;
  state.projectDist = [0,0,0,0];
  state.termTags = { A:{iqp:false,hu39xx:false}, B:{iqp:false,hu39xx:false}, C:{iqp:false,hu39xx:false}, D:{iqp:false,hu39xx:false} };
  saveState();
  renderDashboard();
}

// ============================================================
// CALENDAR VIEW
// ============================================================
const DAY_LABELS = { M:'Mon', T:'Tue', W:'Wed', R:'Thu', F:'Fri' };
const DAY_COLS   = { M:2, T:3, W:4, R:5, F:6 };
const DAYS = ['M','T','W','R','F'];

// Time grid: rows 2..45 = 7:00-18:00 in 15-min slots
// rowStart = (hour-7)*4 + floor(min/15) + 2
// rowEnd   = (hour-7)*4 + ceil(min/15)  + 2
function timeToRow(t, isEnd = false) {
  const [h,m] = t.split(':').map(Number);
  return (h - 7) * 4 + (isEnd ? Math.ceil(m / 15) : Math.floor(m / 15)) + 2;
}

function renderCalendar() {
  const el = document.getElementById('view-calendar');
  const term = state.calendarTerm;
  const mode = state.calendarMode;
  const info = TERM_INFO[term];

  const courseIds = mode === 'mine'
    ? state.schedule[term]
    : TERM_AVAIL[term].filter(id => {
        if (courseTermInSchedule(id, term)) return true; // in this term — show as "mine"
        const c = getCourse(id);
        if (c && c.isProject) return true;               // IQP/MQP can span terms
        return !courseInSchedule(id);                    // hide if scheduled elsewhere
      });

  el.innerHTML = `
    <div class="page-header">
      <div>
        <h1>Term Calendar</h1>
        <p class="subtitle">${info.fullName} &nbsp;•&nbsp; ${info.start} → ${info.end}</p>
      </div>
    </div>

    <div class="calendar-controls">
      <div class="term-tabs">
        ${['A','B','C','D'].map(t=>`
          <button class="term-tab ${t===term?'active':''}"
            style="${t===term?`background:${TERM_INFO[t].color};color:#fff;border-color:${TERM_INFO[t].color}`:''}"
            onclick="state.calendarTerm='${t}';renderCalendar()">
            ${TERM_INFO[t].name}
          </button>`).join('')}
      </div>
      <div class="mode-toggle">
        <button class="btn btn-primary" onclick="downloadSchedulePDF()">Download Schedule</button>
        <button class="toggle-btn ${mode==='all'?'active':''}" onclick="state.calendarMode='all';renderCalendar()">
          All Available
        </button>
        <button class="toggle-btn ${mode==='mine'?'active':''}" onclick="state.calendarMode='mine';renderCalendar()">
          My Selection
        </button>
      </div>
    </div>

    <div class="term-tags-bar">
      <span class="term-tags-label">${term} Term tags (count as 1 class each):</span>
      <label class="term-tag-check"><input type="checkbox" ${(state.termTags?.[term]?.iqp)?'checked':''} onchange="toggleTermTag('${term}','iqp')"> IQP this term</label>
      <label class="term-tag-check"><input type="checkbox" ${(state.termTags?.[term]?.hu39xx)?'checked':''} onchange="toggleTermTag('${term}','hu39xx')"> HU 39XX this term</label>
    </div>

    <div class="calendar-legend">
      ${Object.entries(TYPE_META).map(([type,meta])=>`
        <span class="legend-chip" style="background:${meta.color}">${meta.label}</span>
      `).join('')}
    </div>

    <div class="calendar-wrap">
      ${buildCalendarGrid(courseIds, term)}
    </div>

    <div class="calendar-no-time">
      <strong>IQP / MQP:</strong> No fixed meeting time — self-directed project work.
    </div>
  `;
}

function buildCalendarGrid(courseIds, term) {
  // Collect all day-time blocks
  const blocks = [];

  function addBlocks(id, c, sec, isMine, isLab, secIdx) {
    if (!sec || !sec.start || !sec.days || !sec.days.length) return;
    const startRow = timeToRow(sec.start, false);
    const endRow   = timeToRow(sec.end,   true);
    for (const day of sec.days) {
      if (!DAY_COLS[day]) continue;
      blocks.push({ id, c, sec, day, startRow, endRow,
        colIdx: DAY_COLS[day], isMine, isLab, secIdx });
    }
  }

  for (const id of courseIds) {
    const c = getCourse(id);
    if (!c || !c.sections[term]) continue;
    const isMine = courseTermInSchedule(id, term);
    if (isMine) {
      // Scheduled: show only the selected section
      const selIdx = state.selectedSections[term]?.[id] ?? 0;
      const sec = getSelectedSection(id, term);
      if (!sec) continue;
      addBlocks(id, c, sec, true, false, selIdx);
      if (sec.lab) addBlocks(id, c, sec.lab, true, true, selIdx);
    } else {
      // Not scheduled: show ALL sections so every time option is visible
      for (let si = 0; si < c.sections[term].length; si++) {
        const sec = c.sections[term][si];
        if (!sec) continue;
        addBlocks(id, c, sec, false, false, si);
        if (sec.lab) addBlocks(id, c, sec.lab, false, true, si);
      }
    }
  }

  // Compute side-by-side overlap layout per day column
  // Group by (day column, overlapping time range), assign sub-cols per cluster
  const colBlocks = {};
  for (const b of blocks) {
    const key = b.colIdx;
    if (!colBlocks[key]) colBlocks[key] = [];
    colBlocks[key].push(b);
  }

  for (const key of Object.keys(colBlocks)) {
    const dayBlocks = colBlocks[key].sort((a, b) => a.startRow - b.startRow);

    // Assign sub-columns greedily
    const slots = []; // each slot holds the endRow of the last block placed in it
    for (const b of dayBlocks) {
      let slot = slots.findIndex(e => e <= b.startRow);
      if (slot === -1) { slot = slots.length; slots.push(0); }
      slots[slot] = b.endRow;
      b.subCol = slot;
    }

    // Compute per-block totalSubCols as the size of its overlapping cluster
    for (const b of dayBlocks) {
      // All blocks that overlap with b
      const cluster = dayBlocks.filter(o => o.startRow < b.endRow && o.endRow > b.startRow);
      b.totalSubCols = Math.max(...cluster.map(o => o.subCol)) + 1;
    }
  }

  // Time labels — one per hour
  const times = [];
  for (let h = 7; h <= 17; h++) {
    const row = (h - 7) * 4 + 2;
    const label = h === 12 ? '12 pm' : h > 12 ? `${h-12} pm` : `${h} am`;
    times.push(`<div class="cal-time-label" style="grid-row:${row}/span 4;grid-column:1">${label}</div>`);
  }

  // Day headers
  const headers = DAYS.map((d,i) =>
    `<div class="cal-day-header" style="grid-row:1;grid-column:${i+2}">${DAY_LABELS[d]}</div>`
  );

  // Hourly grid lines + half-hour dashed lines
  const lines = [];
  for (let h = 7; h <= 17; h++) {
    const rowHour = (h - 7) * 4 + 2;
    const rowHalf = rowHour + 2;
    for (let col = 2; col <= 6; col++) {
      // Full hour line (solid)
      lines.push(`<div class="cal-cell" style="grid-row:${rowHour}/span 2;grid-column:${col}"></div>`);
      // Half-hour line (dashed)
      if (h < 17) {
        lines.push(`<div class="cal-cell cal-cell-half" style="grid-row:${rowHalf}/span 2;grid-column:${col}"></div>`);
      }
    }
  }

  // Course blocks
  const courseBlocks = blocks.map(b => {
    const meta    = TYPE_META[b.c.type];
    const sec     = b.sec;
    const rowSpan = b.endRow - b.startRow;

    // Side-by-side layout for overlapping blocks
    const w = b.totalSubCols > 1
      ? `width:calc(${100/b.totalSubCols}% - 2px);left:calc(${b.subCol * 100/b.totalSubCols}%);`
      : '';

    // "Mine" blocks: bright, solid; "available" blocks: slightly transparent
    const opacity = b.isMine ? '1' : '0.72';
    const shadow  = b.isMine
      ? `box-shadow:inset 0 0 0 2px rgba(255,255,255,.5), 0 2px 6px rgba(0,0,0,.2);`
      : '';

    // Lab blocks use a darker tint
    const bgColor = b.isLab
      ? meta.color + 'cc'
      : meta.color;
    const labTag = b.isLab ? ' [Lab]' : '';

    // Show extra info based on block height
    const profLine = sec.professor && rowSpan >= 6 && !b.isLab
      ? `<div class="cal-block-prof">${sec.professor}</div>`
      : '';
    const roomLine = sec.location && rowSpan >= 8
      ? `<div class="cal-block-room">${sec.location}</div>`
      : '';
    const secLabel = sec.section && sec.section !== '—' ? ` §${sec.section}` : '';

    const fmtTime = t => {
      if (!t) return '';
      const [h,m] = t.split(':').map(Number);
      const ampm = h >= 12 ? 'pm' : 'am';
      const hr = h > 12 ? h-12 : h;
      return `${hr}:${String(m).padStart(2,'0')}${ampm}`;
    };

    return `
      <div class="cal-block${b.isLab?' cal-block-lab':''}"
        style="grid-row:${b.startRow}/${b.endRow};grid-column:${b.colIdx};
               background:${bgColor};opacity:${opacity};${w}${shadow}"
        onclick="openModal('${b.id}','${term}',${b.secIdx ?? -1})"
        title="${b.c.code}${secLabel}${labTag} · ${b.c.name}&#10;${fmtTime(sec.start)}–${fmtTime(sec.end)}&#10;${sec.professor||''}${sec.location?' · '+sec.location:''}">
        <div class="cal-block-inner">
          <div class="cal-block-code">${b.c.code}${b.isLab ? ' Lab' : ''}${b.isMine ? ' ★' : ''}</div>
          <div class="cal-block-time">${fmtTime(sec.start)}–${fmtTime(sec.end)}</div>
          ${profLine}
          ${roomLine}
        </div>
      </div>`;
  });

  return `<div class="calendar-grid">
    ${times.join('')}
    ${headers.join('')}
    ${lines.join('')}
    ${courseBlocks.join('')}
  </div>`;
}

// ============================================================
// AUTO SCHEDULER
// ============================================================
function renderAuto() {
  const el = document.getElementById('view-auto');
  const tab = state.autoTab || 'req';

  el.innerHTML = `
    <div class="page-header">
      <h1>Auto Scheduler</h1>
      <p class="subtitle">Generate a schedule automatically based on your requirements and preferences.</p>
    </div>

    <div class="auto-tabs">
      <button class="auto-tab ${tab==='req'?'active':''}" onclick="state.autoTab='req';renderAuto()">
        Requirements
      </button>
      <button class="auto-tab ${tab==='pref'?'active':''}" onclick="state.autoTab='pref';renderAuto()">
        Preferences
      </button>
    </div>

    ${tab === 'req' ? renderAutoRequirements() : renderAutoPreferences()}
  `;
}

function renderProjectPicker() {
  const p = state.project;
  const d = state.projectDist;
  const totalCredits = d.reduce((a,b)=>a+b,0);

  return `
    <div class="project-picker">
      <div class="field-label">IQP or MQP (choose one, required this year)</div>
      <div class="project-btns">
        <button class="proj-btn ${p==='IQP'?'active':''}" onclick="setProject('IQP')">IQP</button>
        <button class="proj-btn ${p==='MQP'?'active':''}" onclick="setProject('MQP')">MQP</button>
        <button class="proj-btn ${!p?'active':''}" onclick="setProject(null)">None</button>
      </div>
      ${p ? `
      <div class="dist-picker">
        <div class="field-label">Credit distribution across terms (total must = 3)</div>
        <div class="dist-row">
          ${['A','B','C','D'].map((t,i)=>`
            <div class="dist-cell">
              <div class="dist-term">${t} Term</div>
              <div class="dist-controls">
                <button class="dist-btn" onclick="adjustDist(${i},-1)" ${d[i]===0?'disabled':''}>−</button>
                <span class="dist-val">${d[i]}</span>
                <button class="dist-btn" onclick="adjustDist(${i},+1)" ${totalCredits>=3?'disabled':''}>+</button>
              </div>
            </div>`).join('')}
          <div class="dist-total ${totalCredits===3?'ok':totalCredits>3?'over':''}">
            Total: ${totalCredits}/3
          </div>
        </div>
        ${totalCredits > 0 && !isDistValid(d) ? `
          <div class="dist-warning">Distribution must be consecutive (no gaps like 1-0-1 or 1-1-0-1).</div>
        ` : ''}
      </div>` : ''}
    </div>
  `;
}

function renderAutoRequirements() {
  const result = state.autoResult && state.autoTab === 'req' ? state.autoResult : null;
  return `
    <div class="auto-section">
      <div class="section-title">Required Courses</div>
      <div class="req-list">
        ${[
          { label:'2 INTL courses', desc:'Any 2 from INTL 1100, 2110, 2210, 2310, 2320, 2410, 2510 — must complete before HU 3900' },
          { label:'HU 39XX', desc:'Upper-level humanities — C or D term (not yet posted; slot reserved)' },
          { label:'DS 2010', desc:'Statistical Modeling and Analysis (B, C, or D term)' },
          { label:'DS 3010', desc:'Computational Methods — must come after DS 2010' },
          { label:'CS 4432', desc:'Database Systems II (A, B, or D term)' },
          { label:'IQP or MQP', desc:'3-credit project — consecutive terms, no gaps' },
        ].map(r => `
          <div class="req-row">
            <div class="req-row-label">${r.label}</div>
            <div class="req-row-desc">${r.desc}</div>
          </div>`).join('')}
      </div>

      ${renderProjectPicker()}

      <div class="auto-constraints">
        <div class="section-title">Scheduling Constraints</div>
        <ul class="constraint-list">
          <li>3–4 regular classes per term</li>
          <li>7 classes per semester (A+B = 7, C+D = 7), 14 total</li>
          <li>DS 2010 must come before DS 3010</li>
          <li>CS 4342 cannot be taken until CS 3733 is complete</li>
          <li>IQP/MQP credits must be in consecutive terms (no gaps)</li>
        </ul>
      </div>

      <button class="btn btn-primary" onclick="generateSchedule('req')"
        ${!state.project ? 'style="opacity:.6" title="Select IQP or MQP first"' : ''}>
        Generate Requirements Schedule
      </button>
    </div>

    ${result ? renderAutoResult(result, 'req') : ''}
  `;
}

function renderAutoPreferences() {
  const result = state.autoResult && state.autoTab === 'pref' ? state.autoResult : null;
  const PREFS = [
    { id:'p1', label:'CS 4341 in A Term', desc:'Set up prerequisites for B term CS 3733' },
    { id:'p2', label:'CS 3733 in B Term', desc:'Take with the best teacher (B term)' },
    { id:'p3', label:'CS 4342 right after CS 3733', desc:'Maximize continuity in the AI/ML track' },
    { id:'p4', label:'CS 4345 in D Term', desc:'Only offered D term — include if desired' },
    { id:'p5', label:'DS 2010 → DS 3010 back-to-back', desc:'Take DS 3010 the term right after DS 2010' },
    { id:'p6', label:'PE in 3-class terms', desc:'Add a WPE course to any term with exactly 3 classes' },
  ];

  return `
    <div class="auto-section">
      <div class="section-title">Preferences</div>
      <div class="pref-list">
        ${PREFS.map(p => `
          <label class="pref-row">
            <input type="checkbox" id="pref-${p.id}" ${state[p.id] !== false ? 'checked' : ''}
              onchange="state['${p.id}']=this.checked">
            <div class="pref-text">
              <div class="pref-label">${p.label}</div>
              <div class="pref-desc">${p.desc}</div>
            </div>
          </label>`).join('')}
      </div>

      ${renderProjectPicker()}

      <button class="btn btn-primary" onclick="generateSchedule('pref')"
        ${!state.project ? 'style="opacity:.6" title="Select IQP or MQP first"' : ''}>
        Generate Preferences Schedule
      </button>
    </div>

    ${result ? renderAutoResult(result, 'pref') : ''}
  `;
}

function renderAutoResult(schedule, mode) {
  const v = new ScheduleValidator(schedule, state.project, state.projectDist, state.termTags).validate();
  const all = Object.values(schedule).flat();
  const fallReg  = [...schedule.A,...schedule.B].filter(id=>{const c=getCourse(id);return c&&c.type!=='WPE';}).length;
  const springReg= [...schedule.C,...schedule.D].filter(id=>{const c=getCourse(id);return c&&c.type!=='WPE';}).length;

  return `
    <div class="result-card">
      <div class="result-header">
        <h3>Generated Schedule</h3>
        <div class="result-actions">
          <button class="btn btn-outline" onclick="generateSchedule('${mode}')">Regenerate</button>
          <button class="btn btn-primary" onclick="applyAutoSchedule()">Save Schedule</button>
        </div>
      </div>

      ${v.errors.length ? `<div class="alert alert-error"><ul>${v.errors.map(e=>`<li>${e}</li>`).join('')}</ul></div>` : ''}
      ${v.warnings.length ? `<div class="alert alert-warning"><ul>${v.warnings.map(w=>`<li>${w}</li>`).join('')}</ul></div>` : ''}

      <div class="result-grid">
        ${['A','B','C','D'].map(t => {
          const courses = schedule[t].map(id => getCourse(id)).filter(Boolean);
          const regular = courses.filter(c => c.type !== 'WPE');
          const pe = courses.filter(c => c.type === 'WPE');
          return `
            <div class="result-term">
              <div class="result-term-header">
                ${TERM_INFO[t].name} — ${regular.length} class${regular.length!==1?'es':''}
              </div>
              ${regular.map(c=>`
                <div class="result-course" style="border-left:3px solid ${TYPE_META[c.type].color}">
                  <span class="rc-code">${c.code}</span>
                  <span class="rc-name">${c.name}</span>
                </div>`).join('')}
              ${pe.map(c=>`
                <div class="result-course pe-course" style="border-left:3px solid ${TYPE_META[c.type].color}">
                  <span class="rc-code">${c.code}</span>
                  <span class="rc-name">${c.name} (PE)</span>
                </div>`).join('')}
            </div>`;
        }).join('')}
      </div>

      <div class="result-totals">
        <span>Fall (A+B): ${fallReg}/7</span>
        <span>Spring (C+D): ${springReg}/7</span>
        <span>Total: ${fallReg+springReg}/14</span>
      </div>
    </div>
  `;
}

function isDistValid(d) {
  let started=false, gapped=false;
  for (let i=0; i<4; i++) {
    if (d[i]>0) { if(gapped) return false; started=true; }
    else if (started) gapped=true;
  }
  return true;
}

function setProject(p) {
  state.project = p;
  if (!p) state.projectDist = [0,0,0,0];
  else if (state.projectDist.reduce((a,b)=>a+b,0) === 0) {
    // Default: 1-1-1 spread
    state.projectDist = [1,1,1,0];
  }
  saveState();
  renderAuto();
}

function adjustDist(idx, delta) {
  const d = [...state.projectDist];
  d[idx] = Math.max(0, d[idx] + delta);
  state.projectDist = d;
  saveState();
  renderAuto();
}

function generateSchedule(mode) {
  if (!state.project) { alert('Please select IQP or MQP first.'); return; }
  const totalDist = state.projectDist.reduce((a,b)=>a+b,0);
  if (totalDist !== 3) { alert('Project distribution must total exactly 3 credits.'); return; }
  if (!isDistValid(state.projectDist)) { alert('Project credits must span consecutive terms (no gaps).'); return; }

  let sched;
  if (mode === 'req') {
    sched = generator.generateRequirements(state.project, state.projectDist);
  } else {
    sched = generator.generatePreferences(state.project, state.projectDist);
  }
  state.autoResult = sched;
  state.autoTab = mode;
  saveState();
  renderAuto();
}

function applyAutoSchedule() {
  if (!state.autoResult) return;
  if (!confirm('Save this schedule? Your current schedule will be replaced.')) return;
  state.schedule = JSON.parse(JSON.stringify(state.autoResult));
  state.autoResult = null;
  saveState();
  showView('dashboard');
}

// ============================================================
// MANUAL BUILDER
// ============================================================
function renderManual() {
  const el = document.getElementById('view-manual');
  const term = state.manualTerm || 'A';
  const filter = state.manualFilter || 'all';

  const available = TERM_AVAIL[term];
  const eliminated = getEliminatedInTerm(term);

  const typeGroups = {};
  for (const id of available) {
    const c = getCourse(id);
    if (!c) continue;
    if (filter !== 'all' && c.type !== filter) continue;
    if (!typeGroups[c.type]) typeGroups[c.type] = [];
    typeGroups[c.type].push(c);
  }

  const v = new ScheduleValidator(state.schedule, state.project, state.projectDist, state.termTags).validate();

  el.innerHTML = `
    <div class="page-header">
      <div>
        <h1>Manual Builder</h1>
        <p class="subtitle">Click courses to add/remove. Eliminated courses shown greyed out.</p>
      </div>
      <button class="btn btn-primary" onclick="saveState();renderDashboard();showView('dashboard')">
        Save &amp; View Dashboard
      </button>
    </div>

    ${v.errors.length ? `
      <div class="alert alert-error compact">
        ${v.errors.map(e=>`<span>${e}</span>`).join(' &nbsp;•&nbsp; ')}
      </div>` : ''}

    <div class="manual-layout">

      <!-- LEFT: Course picker -->
      <div class="manual-left">
        <div class="manual-term-tabs">
          ${['A','B','C','D'].map(t=>`
            <button class="term-tab ${t===term?'active':''}"
              style="${t===term?`background:${TERM_INFO[t].color};color:#fff;border-color:${TERM_INFO[t].color}`:''}"
              onclick="state.manualTerm='${t}';renderManual()">
              ${TERM_INFO[t].name}
            </button>`).join('')}
        </div>

        <div class="type-filter">
          ${['all','CS','DS','INTL','HU','WPE','IQP','MQP'].map(f=>`
            <button class="filter-chip ${f===filter?'active':''}"
              ${TYPE_META[f] ? `style="${f===filter?`background:${TYPE_META[f].color};color:#fff`:''}"`:''}
              onclick="state.manualFilter='${f}';renderManual()">${f==='all'?'All':TYPE_META[f]?TYPE_META[f].label:f}</button>
          `).join('')}
        </div>

        <div class="course-list">
          ${Object.entries(typeGroups).map(([type, courses]) => `
            <div class="type-group">
              <div class="type-group-header" style="color:${TYPE_META[type].color}">${TYPE_META[type].label}</div>
              ${courses.map(c => {
                const isIn   = courseTermInSchedule(c.id, term);
                const isElim = eliminated.has(c.id);
                const sections = c.sections[term] || [];
                const selIdx = state.selectedSections[term]?.[c.id] ?? 0;
                const sec = sections[Math.min(selIdx, sections.length-1)];

                const fmtDays = days => days.length ? days.join('-') : '';
                const fmtTime12 = t => {
                  if (!t) return '';
                  const [h,m] = t.split(':').map(Number);
                  return `${h>12?h-12:h}:${String(m).padStart(2,'0')}${h>=12?'pm':'am'}`;
                };

                let timeStr = 'No fixed time';
                if (sec?.start && sec.days?.length) {
                  timeStr = `${fmtDays(sec.days)} ${fmtTime12(sec.start)}–${fmtTime12(sec.end)}`;
                  if (sec.lab?.start) timeStr += ` + W lab`;
                }
                const profStr = sec?.professor && sec.professor !== 'TBD — Not yet posted'
                  ? sec.professor : (sec?.professor || '');
                const enrollStr = sec?.enrolled ? ` · ${sec.enrolled}` : '';

                // Section selector (shown when course is in schedule and has >1 section)
                const sectionSelector = (isIn && sections.length > 1) ? `
                  <select class="ci-section-select"
                    onclick="event.stopPropagation()"
                    onchange="changeCourseSection(event,'${c.id}','${term}')">
                    ${sections.map((s,i) => {
                      const sd = s.days?.length ? `${fmtDays(s.days)} ${fmtTime12(s.start)}–${fmtTime12(s.end)}` : 'No fixed time';
                      return `<option value="${i}" ${i===selIdx?'selected':''}>${s.section}: ${sd} · ${s.professor||'TBD'}</option>`;
                    }).join('')}
                  </select>` : '';

                return `
                  <div class="course-item ${isIn?'in-schedule':''} ${isElim&&!isIn?'eliminated':''}"
                    onclick="${isElim&&!isIn ? `showEliminatedReason('${c.id}','${term}')` : `toggleCourse('${c.id}','${term}')`}"
                    title="${c.name}">
                    <div class="ci-left">
                      <div class="ci-code" style="color:${TYPE_META[c.type].color}">${c.code}</div>
                      <div class="ci-name">${c.name}</div>
                      <div class="ci-meta">${timeStr}${profStr?' · '+profStr:''}${enrollStr}${sections.length>1?` <em>(${sections.length} sections)</em>`:''}</div>
                      ${sectionSelector}
                    </div>
                    <div class="ci-right">
                      ${isIn ? '<span class="ci-badge in">Added ✓</span>' :
                        isElim ? '<span class="ci-badge elim">Unavailable</span>' :
                        '<span class="ci-badge add">+ Add</span>'}
                    </div>
                  </div>`;
              }).join('')}
            </div>`).join('')}
          ${Object.keys(typeGroups).length === 0 ? '<div class="empty-list">No courses match the filter.</div>' : ''}
        </div>
      </div>

      <!-- RIGHT: All-term schedule overview -->
      <div class="manual-right">
        <div class="schedule-overview">
          ${renderScheduleOverview()}
        </div>
      </div>

    </div>
  `;
}

function renderScheduleOverview() {
  const TERMS = ['A','B','C','D'];
  return TERMS.map(t => {
    const courses = state.schedule[t].map(id => getCourse(id)).filter(Boolean);
    const regular = courses.filter(c => c.type !== 'WPE');
    const pe = courses.filter(c => c.type === 'WPE');
    const n = regular.length;
    const status = n===0?'':(n<3?'under':n>4?'over':'ok');

    return `
      <div class="ov-term ${t===state.manualTerm?'active-term':''}">
        <div class="ov-header" style="background:${TERM_INFO[t].color}">
          <span>${TERM_INFO[t].name}</span>
          <span class="ov-count ${status}">${n}/4</span>
        </div>
        <div class="ov-body">
          ${regular.length===0 ? '<div class="ov-empty">Empty</div>' :
            regular.map(c => `
              <div class="ov-course" style="border-left:3px solid ${TYPE_META[c.type].color}">
                <span>${c.code}</span>
                <button class="ov-remove" onclick="toggleCourse('${c.id}','${t}')">×</button>
              </div>`).join('')}
          ${pe.map(c => `
            <div class="ov-course ov-pe" style="border-left:3px solid ${TYPE_META.WPE.color}">
              <span>${c.code} (PE)</span>
              <button class="ov-remove" onclick="toggleCourse('${c.id}','${t}')">×</button>
            </div>`).join('')}
        </div>
      </div>`;
  }).join('');
}

function toggleCourse(id, term) {
  const s = state.schedule[term];
  const idx = s.indexOf(id);
  if (idx >= 0) {
    // Remove
    state.schedule[term] = s.filter(x => x !== id);
    // If removing IQP/MQP project, update project state
    if ((id === 'IQP' || id === 'MQP') && !Object.values(state.schedule).flat().includes(id)) {
      state.project = null;
      state.projectDist = [0,0,0,0];
    }
  } else {
    // Add — check constraints
    const c = getCourse(id);
    if (!c) return;
    const reg = regCount(term);

    if (c.type !== 'WPE' && reg >= 4) {
      alert(`${TERM_INFO[term].name} already has 4 classes (maximum).`);
      return;
    }
    if (c.type === 'WPE' && reg === 4) {
      alert(`Can only take PE in a term with exactly 3 regular classes.`);
      return;
    }
    if (c.type === 'WPE' && reg === 3 && s.some(id2 => { const c2=getCourse(id2); return c2&&c2.type==='WPE'; })) {
      alert(`You already have a PE course this term.`);
      return;
    }
    // Check for project conflict
    if (id === 'IQP' && state.project === 'MQP') {
      alert('You already have MQP selected. Remove it first to add IQP.');
      return;
    }
    if (id === 'MQP' && state.project === 'IQP') {
      alert('You already have IQP selected. Remove it first to add MQP.');
      return;
    }
    // Check same course already in another term (except projects)
    if (!c.isProject && courseInSchedule(id)) {
      const other = ['A','B','C','D'].find(t2 => t2!==term && state.schedule[t2].includes(id));
      if (other) {
        alert(`${c.code} is already scheduled in ${other} term.`);
        return;
      }
    }

    state.schedule[term].push(id);

    // Track project selection
    if (id === 'IQP') state.project = 'IQP';
    if (id === 'MQP') state.project = 'MQP';
  }
  saveState();
  renderManual();
}

function showEliminatedReason(id, term) {
  const c = getCourse(id);
  if (!c) return;
  // Find why it's eliminated
  const before = getScheduledBefore(term);

  // Already taken
  if (!c.isProject && courseInSchedule(id)) {
    const other = ['A','B','C','D'].find(t => state.schedule[t].includes(id));
    alert(`${c.code} is already scheduled in ${other} term.`);
    return;
  }
  // Prereqs
  if (id === 'CS4342' && !before.includes('CS3733')) {
    alert(`CS 4342 requires CS 3733 to be completed in a prior term.\n\nSchedule CS 3733 earlier to unlock this course.`);
    return;
  }
  for (const pre of c.prerequisites) {
    if (!before.includes(pre)) {
      const pc = getCourse(pre);
      alert(`${c.code} requires ${pc ? pc.code : pre} to be completed first.`);
      return;
    }
  }
  // Project conflict
  if (id === 'IQP' && state.project === 'MQP') { alert('You have MQP selected. Remove it first.'); return; }
  if (id === 'MQP' && state.project === 'IQP') { alert('You have IQP selected. Remove it first.'); return; }

  alert(`${c.code} is not available in ${term} term.`);
}

// ============================================================
// COURSE MODAL
// ============================================================
function openModal(courseId, term, clickedSecIdx) {
  const c = getCourse(courseId);
  if (!c) return;
  const meta = TYPE_META[c.type];
  const info = term ? TERM_INFO[term] : null;
  const isInSchedule = term && courseTermInSchedule(courseId, term);
  const sections = (term && c.sections[term]) || [];

  // If opened from a specific calendar block, pre-select that section in state
  // so that Add/modal reflects the exact time slot the user clicked
  if (term && clickedSecIdx != null && clickedSecIdx >= 0 && !isInSchedule) {
    setSelectedSection(courseId, term, clickedSecIdx);
  }

  const prereqs = c.prerequisites.map(p => { const pc = getCourse(p); return pc ? pc.code : p; });
  const offeredIn = Object.entries(TERM_AVAIL)
    .filter(([t, ids]) => ids.includes(courseId))
    .map(([t]) => TERM_INFO[t].name).join(', ');

  const fmtDays = days => days?.length ? days.map(d=>DAY_LABELS[d]||d).join(', ') : '';
  const fmtTime12 = t => {
    if (!t) return '';
    const [h,m] = t.split(':').map(Number);
    return `${h>12?h-12:h}:${String(m).padStart(2,'0')} ${h>=12?'pm':'am'}`;
  };

  const sectionsHtml = sections.length ? `
    <div class="modal-sections">
      <div class="md-label" style="margin-bottom:6px">Available Sections (${term} Term)</div>
      ${sections.map((s, i) => {
        const mainTime = s.start
          ? `${fmtDays(s.days)} &nbsp;${fmtTime12(s.start)} – ${fmtTime12(s.end)}`
          : 'No fixed time';
        const labTime = s.lab?.start
          ? `<div class="sec-lab">+ Wed Lab: ${fmtTime12(s.lab.start)} – ${fmtTime12(s.lab.end)} · ${s.lab.location||''}</div>`
          : '';
        return `
          <div class="sec-row">
            <div class="sec-info">
              <span class="sec-num">${s.section}</span>
              <span class="sec-time">${mainTime}</span>
              ${s.professor ? `<span class="sec-prof">${s.professor}</span>` : ''}
              ${s.location  ? `<span class="sec-room">${s.location}</span>` : ''}
              ${s.enrolled  ? `<span class="sec-enroll">Enrolled: ${s.enrolled}</span>` : ''}
              ${s.waitlist  ? `<span class="sec-enroll">Waitlist: ${s.waitlist}</span>` : ''}
              ${labTime}
            </div>
          </div>`;
      }).join('')}
    </div>` : '';

  const prereqNote = c.prereqNote ? `<div class="modal-prereq-note">⚠ ${c.prereqNote}</div>` : '';
  const placeholderNote = c.hu3900placeholder
    ? `<div class="modal-prereq-note">📌 HU 3900 sections have not yet been posted for Spring 2027. Check courselistings.wpi.edu. Must complete 2 INTL courses first.</div>`
    : '';

  document.getElementById('modal-content').innerHTML = `
    <div class="modal-course-header" style="background:${meta.color}">
      <div class="modal-code">${c.code}</div>
      <div class="modal-type">${meta.label}</div>
    </div>
    <div class="modal-body">
      <h2>${c.name}</h2>
      ${info ? `<div class="modal-term-badge" style="color:${info.color}">${info.fullName}</div>` : ''}

      <div class="modal-desc">${c.description.replace(/\n/g,'<br>')}</div>
      ${prereqNote}
      ${placeholderNote}

      <div class="modal-details">
        <div class="modal-detail">
          <span class="md-label">Credits</span>
          <span class="md-value">${c.credits}</span>
        </div>
        <div class="modal-detail">
          <span class="md-label">Offered</span>
          <span class="md-value">${offeredIn}</span>
        </div>
        ${prereqs.length ? `
          <div class="modal-detail">
            <span class="md-label">Prerequisites</span>
            <span class="md-value">${prereqs.join(', ')}</span>
          </div>` : ''}
      </div>

      ${sectionsHtml}

      ${term ? `
        <div class="modal-actions">
          <button class="btn ${isInSchedule ? 'btn-danger' : 'btn-primary'}"
            onclick="toggleCourse('${courseId}','${term}');closeModal()">
            ${isInSchedule ? 'Remove from Schedule' : 'Add to Schedule'}
          </button>
          <button class="btn btn-outline" onclick="closeModal()">Close</button>
        </div>` : ''}
    </div>
  `;
  document.getElementById('modal-overlay').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
}

// ============================================================
// PDF EXPORT
// ============================================================
function downloadSchedulePDF() {
  const fmtTime = t => {
    if (!t) return '';
    const [h,m] = t.split(':').map(Number);
    return `${h>12?h-12:h}:${String(m).padStart(2,'0')} ${h>=12?'pm':'am'}`;
  };
  const fmtDays = days => {
    if (!days||!days.length) return '';
    const map = {M:'Mon',T:'Tue',W:'Wed',R:'Thu',F:'Fri'};
    return days.map(d=>map[d]||d).join('/');
  };

  // Build one compact table per term — stacked vertically for portrait layout
  const termCells = ['A','B','C','D'].map(t => {
    const ti = TERM_INFO[t];
    const tags = state.termTags?.[t] || { iqp: false, hu39xx: false };
    const courses = state.schedule[t].map(id=>getCourse(id)).filter(Boolean);
    const regular = courses.filter(c=>c.type!=='WPE');
    const pe      = courses.filter(c=>c.type==='WPE');
    const tagCount = (tags.iqp ? 1 : 0) + (tags.hu39xx ? 1 : 0);
    const effectiveClassCount = regular.length + tagCount;
    const allRows = [...regular,...pe];

    const rows = allRows.map(c => {
      const meta = TYPE_META[c.type]||{color:'#888'};
      const sec  = getSelectedSection(c.id, t);
      const timeStr = sec?.start
        ? `${fmtDays(sec.days)} ${fmtTime(sec.start)}–${fmtTime(sec.end)}`
        : 'No fixed time';
      const prof = sec?.professor && sec.professor !== 'TBD — Not yet posted' ? sec.professor : '—';
      const loc  = sec?.location || '—';
      return `<tr>
        <td style="padding:4px 6px;border-bottom:1px solid #eee">
          <span style="background:${meta.color};color:#fff;font-size:9px;font-weight:700;
            padding:1px 5px;border-radius:3px;letter-spacing:.03em">${c.type}</span>
        </td>
        <td style="padding:4px 6px;border-bottom:1px solid #eee;font-weight:600;font-size:11px;white-space:nowrap">${c.code}</td>
        <td style="padding:4px 6px;border-bottom:1px solid #eee;font-size:11px">${c.name}</td>
        <td style="padding:4px 6px;border-bottom:1px solid #eee;font-size:10px;white-space:nowrap;color:#444">${timeStr}</td>
        <td style="padding:4px 6px;border-bottom:1px solid #eee;font-size:10px;color:#444">${prof}</td>
        <td style="padding:4px 6px;border-bottom:1px solid #eee;font-size:10px;color:#444">${loc}</td>
      </tr>`;
    }).join('');

    const tagRows = [];
    const iqpMeta = TYPE_META.IQP || { color:'#B7950B' };
    const huMeta = TYPE_META.HU || { color:'#CA6F1E' };
    if (tags.iqp) tagRows.push(`<tr><td style="padding:4px 6px;border-bottom:1px solid #eee"><span style="background:${iqpMeta.color};color:#fff;font-size:9px;font-weight:700;padding:1px 5px;border-radius:3px">IQP</span></td><td style="padding:4px 6px;border-bottom:1px solid #eee;font-weight:600;font-size:11px">IQP</td><td style="padding:4px 6px;border-bottom:1px solid #eee;font-size:11px">Interactive Qualifying Project (1 cr)</td><td style="padding:4px 6px;border-bottom:1px solid #eee;font-size:10px;color:#444">No fixed time</td><td style="padding:4px 6px;border-bottom:1px solid #eee;font-size:10px;color:#444">—</td><td style="padding:4px 6px;border-bottom:1px solid #eee;font-size:10px;color:#444">—</td></tr>`);
    if (tags.hu39xx) tagRows.push(`<tr><td style="padding:4px 6px;border-bottom:1px solid #eee"><span style="background:${huMeta.color};color:#fff;font-size:9px;font-weight:700;padding:1px 5px;border-radius:3px">HU</span></td><td style="padding:4px 6px;border-bottom:1px solid #eee;font-weight:600;font-size:11px">HU 39XX</td><td style="padding:4px 6px;border-bottom:1px solid #eee;font-size:11px">Upper-level Humanities (1 cr, not yet posted)</td><td style="padding:4px 6px;border-bottom:1px solid #eee;font-size:10px;color:#444">No fixed time</td><td style="padding:4px 6px;border-bottom:1px solid #eee;font-size:10px;color:#444">—</td><td style="padding:4px 6px;border-bottom:1px solid #eee;font-size:10px;color:#444">—</td></tr>`);
    const allTableRows = rows + tagRows.join('');

    return `<div style="border:1px solid #ddd;border-radius:6px;overflow:hidden">
      <div style="background:#AC2B37;color:#fff;padding:7px 10px;
        display:flex;justify-content:space-between;align-items:center">
        <span style="font-size:13px;font-weight:700">${ti.fullName}</span>
        <span style="font-size:10px;opacity:.9">${ti.start} → ${ti.end} · ${effectiveClassCount} class${effectiveClassCount!==1?'es':''}</span>
      </div>
      ${allRows.length || tagRows.length ? `
      <table style="width:100%;border-collapse:collapse">
        <thead><tr style="background:#f7f7f7">
          <th style="padding:4px 6px;text-align:left;font-size:9px;color:#888;font-weight:700;border-bottom:1px solid #ddd;text-transform:uppercase">Type</th>
          <th style="padding:4px 6px;text-align:left;font-size:9px;color:#888;font-weight:700;border-bottom:1px solid #ddd;text-transform:uppercase">Code</th>
          <th style="padding:4px 6px;text-align:left;font-size:9px;color:#888;font-weight:700;border-bottom:1px solid #ddd;text-transform:uppercase">Course</th>
          <th style="padding:4px 6px;text-align:left;font-size:9px;color:#888;font-weight:700;border-bottom:1px solid #ddd;text-transform:uppercase">Time</th>
          <th style="padding:4px 6px;text-align:left;font-size:9px;color:#888;font-weight:700;border-bottom:1px solid #ddd;text-transform:uppercase">Professor</th>
          <th style="padding:4px 6px;text-align:left;font-size:9px;color:#888;font-weight:700;border-bottom:1px solid #ddd;text-transform:uppercase">Location</th>
        </tr></thead>
        <tbody>${allTableRows}</tbody>
      </table>` : `<div style="padding:10px;color:#aaa;font-size:11px;font-style:italic">No classes scheduled.</div>`}
    </div>`;
  });

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>WPI Schedule 2026–27</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
           font-size: 12px; color: #1a1a1a; background: #fff;
           padding: 20px 24px; }
    .vertical-stack { display: flex; flex-direction: column; gap: 16px; }
    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
      @page { margin: 1cm; size: A4 portrait; }
    }
  </style>
</head>
<body>

  <!-- Header -->
  <div style="display:flex;align-items:center;justify-content:space-between;
    border-bottom:3px solid #AC2B37;padding-bottom:10px;margin-bottom:14px">
    <div>
      <div style="font-size:20px;font-weight:800;color:#AC2B37;letter-spacing:-.5px">WPI Schedule 2026–27</div>
      <div style="font-size:11px;color:#6B7280;margin-top:2px">Fall 2026 (A+B) · Spring 2027 (C+D)</div>
    </div>
    <div style="text-align:right;font-size:10px;color:#A9B0B7">
      Generated ${new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}<br>
      Verify at courselistings.wpi.edu before registering
    </div>
  </div>

  <!-- Vertical term stack (portrait layout) -->
  <div class="vertical-stack">
    ${termCells[0]}
    ${termCells[1]}
    ${termCells[2]}
    ${termCells[3]}
  </div>

  <!-- Print button (hidden when printing) -->
  <div class="no-print" style="position:fixed;bottom:20px;right:20px">
    <button onclick="window.print()"
      style="background:#AC2B37;color:#fff;border:none;border-radius:8px;
        padding:10px 22px;font-size:13px;font-weight:700;cursor:pointer;
        box-shadow:0 4px 12px rgba(172,43,55,.4)">
      Save as PDF
    </button>
  </div>

</body>
</html>`;

  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
  win.focus();
}

// ============================================================
// COURSE CATALOG
// ============================================================
function renderCatalog() {
  const el = document.getElementById('view-catalog');

  // Build flat list of all (course, term, section) entries
  function getCatalogEntries() {
    const entries = [];
    for (const id of Object.keys(COURSES)) {
      const c = COURSES[id];
      if (c.isProject) continue; // skip IQP/MQP
      for (const term of ['A','B','C','D']) {
        if (!c.sections[term]) continue;
        for (const sec of c.sections[term]) {
          entries.push({ c, term, sec });
        }
      }
    }
    return entries;
  }

  // Apply filters
  function applyFilters(entries) {
    return entries.filter(({ c, term, sec }) => {
      // Semester filter
      if (state.catalogSemester === 'fall'   && !['A','B'].includes(term)) return false;
      if (state.catalogSemester === 'spring' && !['C','D'].includes(term)) return false;
      // Term filter (overrides semester when set)
      if (state.catalogTerm !== 'all' && term !== state.catalogTerm) return false;
      // Subject filter
      if (state.catalogSubject !== 'all' && c.type !== state.catalogSubject) return false;
      // Time filter
      if (state.catalogTime !== 'all' && sec.start) {
        const h = parseInt(sec.start.split(':')[0], 10);
        if (state.catalogTime === 'morning'   && h >= 12) return false;
        if (state.catalogTime === 'afternoon' && (h < 12 || h >= 17)) return false;
        if (state.catalogTime === 'evening'   && h < 17) return false;
      }
      return true;
    });
  }

  const allEntries = getCatalogEntries();
  const filtered   = applyFilters(allEntries);

  // Sort: by term A→D, then subject, then course code
  filtered.sort((a, b) => {
    const tOrd = ['A','B','C','D'];
    if (a.term !== b.term) return tOrd.indexOf(a.term) - tOrd.indexOf(b.term);
    if (a.c.type !== b.c.type) return a.c.type.localeCompare(b.c.type);
    return a.c.code.localeCompare(b.c.code);
  });

  function fmtDays(days) {
    if (!days || !days.length) return '—';
    const map = { M:'Mon', T:'Tue', W:'Wed', R:'Thu', F:'Fri' };
    return days.map(d => map[d] || d).join(' · ');
  }

  function catalogCard({ c, term, sec }) {
    const ti   = TERM_INFO[term];
    const meta = TYPE_META[c.type] || { color:'#888', text:'#fff' };
    const displayName = sec.sectionName || c.name;
    const timeStr = sec.start ? `${fmtTime(sec.start)}–${fmtTime(sec.end)}` : 'TBD';
    const daysStr = fmtDays(sec.days);
    const inSchedule = courseTermInSchedule(c.id, term);
    const btnLabel = inSchedule ? 'Remove' : 'Add';
    const btnCls   = inSchedule ? 'cat-btn-remove' : 'cat-btn-add';
    const canAdd   = !inSchedule && TERM_AVAIL[term].includes(c.id);

    return `
      <div class="cat-card" onclick="openModal('${c.id}','${term}')">
        <div class="cat-card-header">
          <span class="cat-type-badge" style="background:${meta.color};color:${meta.text}">${c.type}</span>
          <span class="cat-term-badge" style="background:${ti.color}">${term} Term</span>
          <span class="cat-code">${c.code} · ${sec.section}</span>
        </div>
        <div class="cat-name">${displayName}</div>
        <div class="cat-meta-row">
          <span class="cat-meta-item">🕐 ${timeStr}</span>
          <span class="cat-meta-item">📅 ${daysStr}</span>
          ${sec.professor && sec.professor !== 'TBD' ? `<span class="cat-meta-item">👤 ${sec.professor}</span>` : ''}
          ${sec.location ? `<span class="cat-meta-item">📍 ${sec.location}</span>` : ''}
        </div>
        <div class="cat-card-footer">
          <span class="cat-enroll">${sec.enrolled ? `${sec.enrolled} enrolled` : ''}</span>
          <button class="cat-btn ${btnCls}" onclick="event.stopPropagation();${canAdd||inSchedule?`toggleCourse('${c.id}','${term}');renderCatalog()`:''}">
            ${canAdd || inSchedule ? btnLabel : 'N/A'}
          </button>
        </div>
      </div>`;
  }

  // Filter button helper
  function filterBtn(key, val, label, active) {
    return `<button class="cat-filter-btn ${active?'active':''}"
      onclick="state.catalogSemester='all';state.catalog${key.charAt(0).toUpperCase()+key.slice(1)}='${val}';saveState();renderCatalog()">${label}</button>`;
  }

  // Subject counts for filter bar
  const subjectCounts = {};
  for (const { c } of allEntries) subjectCounts[c.type] = (subjectCounts[c.type]||0) + 1;

  const semesterBtns = [
    filterBtn('semester','all',  'All Semesters',   state.catalogSemester==='all'),
    filterBtn('semester','fall',  'Fall (A+B)',       state.catalogSemester==='fall'),
    filterBtn('semester','spring','Spring (C+D)',     state.catalogSemester==='spring'),
  ].join('');

  const termBtns = ['all','A','B','C','D'].map(t =>
    `<button class="cat-filter-btn ${state.catalogTerm===t?'active':''}"
       onclick="state.catalogTerm='${t}';saveState();renderCatalog()">${t==='all'?'All Terms':t+' Term'}</button>`
  ).join('');

  const subjectBtns = ['all','CS','DS','EN','INTL','HU','WPE'].map(s =>
    `<button class="cat-filter-btn ${state.catalogSubject===s?'active':''}"
       onclick="state.catalogSubject='${s}';saveState();renderCatalog()">
       ${s==='all'?'All Subjects':s}</button>`
  ).join('');

  const timeBtns = [
    ['all','All Times'], ['morning','Morning (before 12)'], ['afternoon','Afternoon (12–5)'], ['evening','Evening (5+)']
  ].map(([v,l]) =>
    `<button class="cat-filter-btn ${state.catalogTime===v?'active':''}"
       onclick="state.catalogTime='${v}';saveState();renderCatalog()">${l}</button>`
  ).join('');

  el.innerHTML = `
    <div class="cat-wrap">
      <div class="cat-header">
        <h2 class="cat-title">Course Catalog</h2>
        <span class="cat-count">${filtered.length} section${filtered.length!==1?'s':''} shown</span>
      </div>

      <div class="cat-filters">
        <div class="cat-filter-group">
          <div class="cat-filter-label">Semester</div>
          <div class="cat-filter-row">${semesterBtns}</div>
        </div>
        <div class="cat-filter-group">
          <div class="cat-filter-label">Term</div>
          <div class="cat-filter-row">${termBtns}</div>
        </div>
        <div class="cat-filter-group">
          <div class="cat-filter-label">Subject</div>
          <div class="cat-filter-row">${subjectBtns}</div>
        </div>
        <div class="cat-filter-group">
          <div class="cat-filter-label">Time of Day</div>
          <div class="cat-filter-row">${timeBtns}</div>
        </div>
      </div>

      <div class="cat-grid">
        ${filtered.length ? filtered.map(catalogCard).join('') : '<div class="cat-empty">No sections match the selected filters.</div>'}
      </div>
    </div>
  `;
}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  // Nav buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => showView(btn.dataset.view));
  });

  // Modal close on overlay click
  document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modal-overlay')) closeModal();
  });

  // Keyboard ESC to close modal
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  // Set active view from state
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.view === state.activeView));
  document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.id === `view-${state.activeView}`));

  renderActiveView();
});
