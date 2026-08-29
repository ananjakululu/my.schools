'use strict';
/* ==========================================================================
 *   ELIMUTRACK — EXAM TIMETABLE ENGINE (exam-timetable.js)
 *   Fully functional examination timetable:
 *     · Exam series (name/type/grade/term/year/status) with per-subject
 *       sessions (date, start–end time, room, invigilator)
 *     · Three views: List (grouped), Calendar (month grid), Matrix
 *       (classic subjects × dates poster)
 *     · Collision/overlap validation (same subject on same date; same room
 *       double-booked at overlapping times; cross-series clashes)
 *     · Filters (grade / term / type / year) + stats bar
 *     · Print + PDF export (jsPDF + autoTable)
 *     · One-time demo seeding for fresh installs
 *   Loaded AFTER script.js — reuses $, store, saveData, escapeHtml,
 *   generateId, showToast, openModal, closeModal, confirmAction, getVal.
 * ========================================================================== */

(function () {
    if (window.__ETT_LOADED__) return;
    window.__ETT_LOADED__ = true;

    const TYPE_COLORS = { 'Opener': '#f59e0b', 'Mid Term': '#3b82f6', 'End Term': '#22c55e', 'End Year': '#8b5cf6' };
    const STATUS_META = { draft: { label: 'Draft', cls: 'ett-st-draft' }, open: { label: 'Open', cls: 'ett-st-open' }, closed: { label: 'Closed', cls: 'ett-st-closed' } };
    const ALL_GRADES = ['PP1', 'PP2', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9'];

    const state = {
        view: 'list',            // list | calendar | matrix
        month: new Date(),       // calendar view month
        editingId: '',           // series being edited in the modal
        sessionRows: [],         // session data mirror for the modal
        matrixSeries: '',        // selected series id in matrix view
        bound: false
    };

    /* ── helpers ── */
    const $id = (i) => document.getElementById(i);
    const fmtDate = (d) => {
        if (!d) return '—';
        const dt = String(d).length === 10 ? new Date(d + 'T00:00:00') : new Date(d);
        return isNaN(dt) ? d : dt.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
    };
    const fmtDateFull = (d) => {
        if (!d) return '—';
        const dt = String(d).length === 10 ? new Date(d + 'T00:00:00') : new Date(d);
        return isNaN(dt) ? d : dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };
    const iso = (d) => { const dt = new Date(d); return isNaN(dt) ? '' : dt.toISOString().slice(0, 10); };
    const addDays = (d, n) => { const dt = new Date(d); dt.setDate(dt.getDate() + n); return iso(dt); };
    const timeOverlap = (s1, e1, s2, e2) => {
        if (!s1 || !e1 || !s2 || !e2) return false;
        return s1 < e2 && s2 < e1;
    };
    const todayISO = () => iso(new Date());

    function isInScope(grade) {
        return typeof isGradeInScope === 'function' ? isGradeInScope(grade) : true;
    }

    function normSeries(s) {
        if (!s.sessions) s.sessions = [];
        if (!s.status) s.status = 'draft';
        return s;
    }

    function allSeries() {
        return (store.examSchedules || []).map(normSeries).filter(s => isInScope(s.grade));
    }

    function filteredSeries() {
        const g = getVal('ettGrade') || 'all';
        const t = getVal('ettTerm') || 'all';
        const ty = getVal('ettType') || 'all';
        const y = getVal('ettYear') || 'all';
        return allSeries().filter(s => {
            if (g !== 'all' && s.grade !== g) return false;
            if (t !== 'all' && s.term !== t) return false;
            if (ty !== 'all' && s.type !== ty) return false;
            if (y !== 'all' && String(s.year) !== y) return false;
            return true;
        });
    }

    function subjectOptionsFor(grade) {
        const areas = (store.learningAreas || []).filter(a => Array.isArray(a.applicableLevels) && a.applicableLevels.includes(grade));
        if (areas.length) return areas.map(a => ({ id: a.id, name: a.name, code: a.code || '' }));
        return (store.learningAreas || []).map(a => ({ id: a.id, name: a.name, code: a.code || '' }));
    }

    /* ── collision detection ── */
    function ettClashes(exam) {
        const warnings = [];
        const sessions = exam.sessions || [];
        const dedupe = new Set();
        const push = (msg) => { if (!dedupe.has(msg)) { dedupe.add(msg); warnings.push(msg); } };

        sessions.forEach((s, i) => {
            const sameSubj = sessions.filter((x, j) => j !== i && x.subject && x.subject === s.subject && x.date === s.date);
            if (sameSubj.length) push(`"${s.subject}" is scheduled twice on ${fmtDate(s.date)} (${exam.name}).`);
            if (s.room) {
                const roomHit = sessions.filter((x, j) => j !== i && x.room && x.room.toLowerCase() === s.room.toLowerCase() && x.date === s.date && timeOverlap(s.start, s.end, x.start, x.end));
                if (roomHit.length) {
                    // canonical message (subject order sorted) so both directions dedupe to one warning
                    const pair = [s.subject || '?', roomHit[0].subject || '?'].sort().join(' vs ');
                    const times = [s.start || '', roomHit[0].start || ''].sort().join('/') + '–' + [s.end || '', roomHit[0].end || ''].sort().join('/');
                    push(`Room "${s.room}" is double-booked on ${fmtDate(s.date)}: ${pair} (${times}).`);
                }
            }
        });

        (store.examSchedules || []).forEach(o => {
            if (o.id === exam.id || !o.grade || !exam.grade || o.grade !== exam.grade) return;
            const osessions = Array.isArray(o.sessions) ? o.sessions : [];
            osessions.forEach(os => {
                sessions.forEach(s => {
                    if (s.subject && os.subject === s.subject && os.date === s.date)
                        push(`"${s.subject}" on ${fmtDate(s.date)} clashes with ${o.name} (same subject, same day).`);
                    if (s.room && os.room && os.room.toLowerCase() === s.room.toLowerCase() && os.date === s.date && timeOverlap(s.start, s.end, os.start, os.end))
                        push(`Room "${s.room}" on ${fmtDate(s.date)} clashes with ${o.name}.`);
                });
            });
        });

        return warnings;
    }

    /* ═══════════════════════════════════════════════════════════════
     *   MAIN INIT
     * ═══════════════════════════════════════════════════════════════ */
    function ettInit() {
        if (!document.getElementById('ettGrade')) return; // section not present
        if (!state.bound) {
            state.bound = true;
            bindControls();
        }
        populateFilters();
        maybeSeedDemo();
        ettRender();
    }

    function bindControls() {
        ['ettGrade', 'ettTerm', 'ettType', 'ettYear'].forEach(id => {
            const el = $id(id);
            if (el) el.addEventListener('change', ettRender);
        });
        const toggle = $id('ettViewToggle');
        if (toggle) toggle.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-view]');
            if (!btn) return;
            toggle.querySelectorAll('button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.view = btn.dataset.view;
            ettRender();
        });
        $id('ettPrevMonth')?.addEventListener('click', () => { state.month.setMonth(state.month.getMonth() - 1); ettRenderCalendar(); });
        $id('ettNextMonth')?.addEventListener('click', () => { state.month.setMonth(state.month.getMonth() + 1); ettRenderCalendar(); });
        $id('ettMatrixSel')?.addEventListener('change', (e) => { state.matrixSeries = e.target.value; ettRenderMatrix(); });
        $id('ettAddBtn')?.addEventListener('click', () => ettOpenSeries(''));
        $id('ettPrintBtn')?.addEventListener('click', ettPrint);
        $id('ettPdfBtn')?.addEventListener('click', ettExportPDF);
        $id('ettSaveBtn')?.addEventListener('click', ettSaveSeries);
        $id('ettAddSessionBtn')?.addEventListener('click', () => ettAddSessionRow({}));
        $id('ettGradeSel')?.addEventListener('change', (e) => { refreshSessionSubjects(e.target.value); });
        $id('ettForm')?.addEventListener('submit', (e) => { e.preventDefault(); ettSaveSeries(); });
        $id('ettSeedBtn')?.addEventListener('click', ettSeedDemo);
        // close on backdrop
        $id('ettModal')?.addEventListener('click', (e) => { if (e.target === $id('ettModal')) closeModal('ettModal'); });
        // invigilator suggestions from the staff register
        const invig = $id('ettInvigList');
        if (invig && typeof StaffRepo !== 'undefined') {
            try {
                invig.innerHTML = StaffRepo.getAll().filter(s => s && s.name).map(s => `<option value="${escapeHtml(s.name)}"></option>`).join('');
            } catch (_) { /* staff repo unavailable */ }
        }
    }

    function populateFilters() {
        const series = allSeries();
        const grades = [...new Set(series.map(s => s.grade).filter(Boolean))].sort((a, b) => ALL_GRADES.indexOf(a) - ALL_GRADES.indexOf(b));
        const terms = [...new Set(series.map(s => s.term).filter(Boolean))].sort();
        const types = [...new Set(series.map(s => s.type).filter(Boolean))].sort();
        const years = [...new Set(series.map(s => String(s.year)).filter(Boolean))].sort().reverse();

        const fill = (id, opts, current) => {
            const el = $id(id);
            if (!el) return;
            const val = el.value || current || 'all';
            el.innerHTML = '<option value="all">All ' + (id === 'ettGrade' ? 'Grades' : id === 'ettTerm' ? 'Terms' : id === 'ettType' ? 'Types' : 'Years') + '</option>' +
                opts.map(o => `<option value="${escapeHtml(o)}">${escapeHtml(o)}</option>`).join('');
            if (val !== 'all' && opts.includes(val)) el.value = val;
        };
        fill('ettGrade', grades, store.settings.currentTerm ? '' : '');
        fill('ettTerm', terms, '');
        fill('ettType', types, '');
        fill('ettYear', years, String(store.settings.academicYear || new Date().getFullYear()));
    }

    /* ═══════════════════════════════════════════════════════════════
     *   RENDER
     * ═══════════════════════════════════════════════════════════════ */
    function ettRender() {
        const list = $id('ettViewList'), cal = $id('ettViewCalendar'), mat = $id('ettViewMatrix');
        if (!list || !cal || !mat) return;
        list.style.display = state.view === 'list' ? '' : 'none';
        cal.style.display = state.view === 'calendar' ? '' : 'none';
        mat.style.display = state.view === 'matrix' ? '' : 'none';
        ettRenderStats();
        if (state.view === 'list') ettRenderList();
        else if (state.view === 'calendar') ettRenderCalendar();
        else ettRenderMatrix();
    }

    function ettRenderStats() {
        const el = $id('ettStats');
        if (!el) return;
        const series = filteredSeries();
        const sessions = series.flatMap(s => s.sessions || []);
        const subjects = [...new Set(sessions.map(x => x.subject).filter(Boolean))];
        const grades = [...new Set(series.map(s => s.grade).filter(Boolean))];
        const next = sessions.filter(x => x.date && x.date >= todayISO()).sort((a, b) => a.date.localeCompare(b.date))[0];
        const el2 = document.createElement('div');
        el2.className = 'ett-stats';
        el2.innerHTML = `
            <div class="ett-stat"><span class="ett-stat-ic green"><i class="fa-solid fa-clipboard-list"></i></span><div><b>${series.length}</b><small>Exam series</small></div></div>
            <div class="ett-stat"><span class="ett-stat-ic indigo"><i class="fa-solid fa-clock"></i></span><div><b>${sessions.length}</b><small>Sessions</small></div></div>
            <div class="ett-stat"><span class="ett-stat-ic amber"><i class="fa-solid fa-book-open"></i></span><div><b>${subjects.length}</b><small>Subjects</small></div></div>
            <div class="ett-stat"><span class="ett-stat-ic rose"><i class="fa-solid fa-layer-group"></i></span><div><b>${grades.length}</b><small>Grades</small></div></div>
            <div class="ett-stat ett-stat-next"><span class="ett-stat-ic teal"><i class="fa-solid fa-calendar-day"></i></span><div><b>${next ? fmtDate(next.date) : '—'}</b><small>Next exam</small></div></div>`;
        el.replaceWith(el2);
        el2.id = 'ettStats';
    }

    /* ── LIST VIEW ── */
    function ettRenderList() {
        const el = $id('ettViewList');
        if (!el) return;
        const series = filteredSeries().sort((a, b) => String(a.startDate || '').localeCompare(String(b.startDate || '')));
        if (!series.length) {
            el.innerHTML = `
                <div class="ett-empty">
                    <i class="fa-solid fa-calendar-week"></i>
                    <h3>No exam timetable entries</h3>
                    <p>Create an exam series and add subject sessions to build the school examination timetable.</p>
                    <button class="btn btn-primary" id="ettSeedBtn2" onclick="ettSeedDemo()"><i class="fa-solid fa-wand-magic-sparkles"></i> Load Sample Timetable</button>
                </div>`;
            return;
        }
        el.innerHTML = series.map(s => {
            const sessions = (s.sessions || []).slice().sort((a, b) => (a.date || '').localeCompare(b.date || ''));
            const st = STATUS_META[s.status] || STATUS_META.draft;
            const tc = TYPE_COLORS[s.type] || '#64748b';
            const clash = ettClashes(s);
            const rows = sessions.length ? sessions.map(x => `
                <tr class="${(x.date && x.date < todayISO()) ? 'ett-row-past' : ''}">
                    <td class="ett-sess-subj"><strong>${escapeHtml(x.subject || '—')}</strong>${x.code ? `<small>${escapeHtml(x.code)}</small>` : ''}</td>
                    <td>${fmtDateFull(x.date)}</td>
                    <td><span class="ett-time-chip">${escapeHtml(x.start || '—')} – ${escapeHtml(x.end || '—')}</span></td>
                    <td>${escapeHtml(x.room || '—')}</td>
                    <td>${escapeHtml(x.invigilator || '—')}</td>
                </tr>`).join('') : `
                <tr><td colspan="5" class="ett-no-sessions">No subject sessions yet — <a href="#" onclick="ettOpenSeries('${s.id}');return false;">add sessions</a> to build the timetable.</td></tr>`;
            return `
            <div class="ett-series-card ${clash.length ? 'ett-has-clash' : ''}">
                <div class="ett-series-head">
                    <div class="ett-series-id">
                        <div class="ett-series-avatar" style="background:${tc}1a;color:${tc};"><i class="fa-solid fa-file-lines"></i></div>
                        <div>
                            <h4>${escapeHtml(s.name || 'Untitled exam')}</h4>
                            <div class="ett-series-meta">
                                <span class="ett-type-chip" style="color:${tc};background:${tc}1a;">${escapeHtml(s.type || 'Exam')}</span>
                                <span><i class="fa-solid fa-graduation-cap"></i> ${escapeHtml(s.grade || '—')}</span>
                                <span><i class="fa-solid fa-calendar"></i> ${escapeHtml(s.term || '—')} ${escapeHtml(s.year || '')}</span>
                                <span><i class="fa-solid fa-arrows-left-right"></i> ${fmtDateFull(s.startDate)} → ${fmtDateFull(s.endDate)}</span>
                                <span class="ett-status ${st.cls}">${st.label}</span>
                            </div>
                        </div>
                    </div>
                    <div class="ett-series-actions">
                        ${clash.length ? `<span class="ett-clash-badge" title="${escapeHtml(clash.join(' | '))}"><i class="fa-solid fa-triangle-exclamation"></i> ${clash.length} clash${clash.length > 1 ? 'es' : ''}</span>` : ''}
                        <button class="ett-act-btn" title="Matrix view" onclick="ettOpenMatrixOf('${s.id}')"><i class="fa-solid fa-table-cells"></i></button>
                        <button class="ett-act-btn" title="Edit" onclick="ettOpenSeries('${s.id}')"><i class="fa-solid fa-pen"></i></button>
                        <button class="ett-act-btn danger" title="Delete" onclick="ettDeleteSeries('${s.id}')"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
                ${s.notes || s.venue ? `<div class="ett-series-notes"><i class="fa-solid fa-circle-info"></i> ${escapeHtml([s.venue ? 'Venue: ' + s.venue : '', s.notes].filter(Boolean).join(' · '))}</div>` : ''}
                <div class="ett-table-wrap">
                    <table class="ett-table">
                        <thead><tr><th>Subject</th><th>Date</th><th>Time</th><th>Room</th><th>Invigilator</th></tr></thead>
                        <tbody>${rows}</tbody>
                    </table>
                </div>
            </div>`;
        }).join('');
    }

    /* ── CALENDAR VIEW ── */
    function ettRenderCalendar() {
        const el = $id('ettViewCalendar');
        if (!el) return;
        const year = state.month.getFullYear(), month = state.month.getMonth();
        const first = new Date(year, month, 1);
        const startDow = (first.getDay() + 6) % 7; // Monday-first
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const monthLabel = state.month.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

        // sessions of filtered series → map date → chips
        const byDate = {};
        const ranges = [];
        filteredSeries().forEach(s => {
            (s.sessions || []).forEach(x => {
                if (!x.date) return;
                if (!byDate[x.date]) byDate[x.date] = [];
                byDate[x.date].push({ ...x, series: s });
            });
            if (!(s.sessions || []).length && s.startDate) ranges.push(s);
        });

        let cells = '';
        for (let i = 0; i < startDow; i++) cells += '<div class="ett-cal-cell ett-cal-ghost"></div>';
        for (let d = 1; d <= daysInMonth; d++) {
            const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const chips = byDate[date] || [];
            const isToday = date === todayISO();
            cells += `<div class="ett-cal-cell ${isToday ? 'ett-cal-today' : ''}">
                <span class="ett-cal-daynum">${d}</span>
                <div class="ett-cal-chips">
                    ${chips.sort((a, b) => (a.start || '').localeCompare(b.start || '')).slice(0, 4).map(c => `
                        <span class="ett-cal-chip" title="${escapeHtml(c.series.name)} · ${escapeHtml(c.subject)}">${escapeHtml(c.start ? c.start.slice(0, 5) : '')} ${escapeHtml(c.subject || '')}${c.room ? ' · ' + escapeHtml(c.room) : ''}</span>`).join('')}
                    ${chips.length > 4 ? `<span class="ett-cal-more">+${chips.length - 4} more</span>` : ''}
                </div>
            </div>`;
        }
        const rangeBars = ranges.map(r => `<div class="ett-cal-range"><i class="fa-solid fa-arrows-left-right"></i> ${escapeHtml(r.name)} · ${escapeHtml(r.grade)} — ${fmtDateFull(r.startDate)} → ${fmtDateFull(r.endDate)} <button class="ett-act-btn" onclick="ettOpenSeries('${r.id}')"><i class="fa-solid fa-pen"></i></button></div>`).join('');

        el.innerHTML = `
            <div class="ett-cal-head">
                <button class="ett-tool-btn" id="ettPrevMonth"><i class="fa-solid fa-chevron-left"></i></button>
                <h3>${monthLabel}</h3>
                <button class="ett-tool-btn" id="ettNextMonth"><i class="fa-solid fa-chevron-right"></i></button>
                <span class="ett-cal-legend"><i class="fa-solid fa-circle" style="color:var(--primary);"></i> Today</span>
            </div>
            ${rangeBars ? `<div class="ett-cal-ranges">${rangeBars}</div>` : ''}
            <div class="ett-cal-grid">
                ${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => `<div class="ett-cal-dow">${d}</div>`).join('')}
                ${cells}
            </div>`;
        $id('ettPrevMonth')?.addEventListener('click', () => { state.month.setMonth(state.month.getMonth() - 1); ettRenderCalendar(); });
        $id('ettNextMonth')?.addEventListener('click', () => { state.month.setMonth(state.month.getMonth() + 1); ettRenderCalendar(); });
    }

    /* ── MATRIX VIEW (classic subjects × dates poster) ── */
    function ettRenderMatrix() {
        const wrap = $id('ettViewMatrix');
        if (!wrap) return;
        const series = filteredSeries().filter(s => (s.sessions || []).length > 0);
        if (!state.matrixSeries || !series.some(s => s.id === state.matrixSeries)) state.matrixSeries = series[0] ? series[0].id : '';
        const sel = $id('ettMatrixSel');
        if (sel) {
            const cur = sel.value;
            sel.innerHTML = '<option value="">Select an exam series…</option>' + series.map(s => `<option value="${s.id}">${escapeHtml(s.name)} — ${escapeHtml(s.grade)} (${escapeHtml(s.type)})</option>`).join('');
            if (cur && series.some(s => s.id === cur)) sel.value = cur;
            else if (series.length) { sel.value = series[0].id; state.matrixSeries = series[0].id; }
        }
        if (!state.matrixSeries) {
            wrap.innerHTML = '<div class="ett-empty"><i class="fa-solid fa-table-cells"></i><h3>No scheduled sessions</h3><p>Add sessions to an exam series to generate the timetable matrix.</p></div>';
            return;
        }
        const exam = filteredSeries().find(s => s.id === state.matrixSeries);
        if (!exam) { wrap.innerHTML = ''; return; }
        const sessions = (exam.sessions || []).slice().sort((a, b) => (a.date || '').localeCompare(b.date || ''));
        const dates = [...new Set(sessions.map(s => s.date).filter(Boolean))].sort();
        const subjects = [...new Set(sessions.map(s => s.subject).filter(Boolean))];

        if (!dates.length || !subjects.length) {
            wrap.innerHTML = `<div class="ett-empty"><i class="fa-solid fa-table-cells"></i><h3>No sessions for ${escapeHtml(exam.name)}</h3><p><a href="#" onclick="ettOpenSeries('${exam.id}');return false;">Add subject sessions</a> to build this matrix.</p></div>`;
            return;
        }
        // group: subject+date → session
        const cellFor = (subj, date) => {
            const s = sessions.find(x => x.subject === subj && x.date === date);
            if (!s) return '<span class="ett-mx-empty">—</span>';
            return `<div class="ett-mx-cell"><b>${escapeHtml(s.start || '')}–${escapeHtml(s.end || '')}</b><span>${escapeHtml(s.room || 'No room')}${s.invigilator ? ' · ' + escapeHtml(s.invigilator) : ''}</span></div>`;
        };

        wrap.innerHTML = `
            <div class="ett-mx-toolbar">
                <div><h3><i class="fa-solid fa-table-cells"></i> ${escapeHtml(exam.name)} — ${escapeHtml(exam.grade)}</h3>
                <small>${escapeHtml(exam.type || 'Exam')} · ${escapeHtml(exam.term || '')} ${escapeHtml(exam.year || '')} · ${fmtDateFull(exam.startDate)} → ${fmtDateFull(exam.endDate)}</small></div>
                <div class="ett-mx-actions">
                    <button class="ett-tool-btn" onclick="ettOpenSeries('${exam.id}')"><i class="fa-solid fa-pen"></i> Edit</button>
                    <button class="ett-tool-btn" onclick="ettPrintSeries('${exam.id}')"><i class="fa-solid fa-print"></i> Print</button>
                </div>
            </div>
            <div class="ett-mx-scroll">
                <table class="ett-mx-table">
                    <thead><tr><th class="ett-mx-subjhead">Subject</th>${dates.map(d => `<th>${escapeHtml(fmtDate(d))}</th>`).join('')}</tr></thead>
                    <tbody>${subjects.map(subj => `<tr><td class="ett-mx-subj">${escapeHtml(subj)}</td>${dates.map(d => `<td>${cellFor(subj, d)}</td>`).join('')}</tr>`).join('')}</tbody>
                </table>
            </div>`;
    }

    function ettOpenMatrixOf(id) {
        state.view = 'matrix';
        state.matrixSeries = id;
        document.querySelectorAll('#ettViewToggle button').forEach(b => b.classList.remove('active'));
        const btn = document.querySelector(`#ettViewToggle button[data-view="matrix"]`);
        if (btn) btn.classList.add('active');
        ettRender();
        const mat = $id('ettViewMatrix');
        if (mat) mat.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    /* ═══════════════════════════════════════════════════════════════
     *   MODAL (series + sessions editor)
     * ═══════════════════════════════════════════════════════════════ */
    function ettOpenSeries(id) {
        // RBAC: only exam-management roles (Exam Officer / Admin / HOI) may
        // create or edit exam series — teachers are view-only.
        if (typeof canDo !== 'undefined' && !canDo('examsManage')) {
            showToast('Only the Exam Officer can create or edit exam series.', 'error');
            return;
        }
        state.editingId = id || '';
        const exam = id ? (store.examSchedules || []).find(x => x.id === id) : null;
        if (exam) normSeries(exam);
        const isEdit = !!exam;

        $id('ettModalTitle').innerText = isEdit ? 'Edit Exam Series' : 'New Exam Series';
        setVal('ettName', exam ? exam.name : '');
        setVal('ettTypeSel', exam ? exam.type : 'End Term');
        setVal('ettTermSel', exam ? exam.term : (store.settings.currentTerm || 'Term 1'));
        setVal('ettYearSel', exam ? exam.year : (store.settings.academicYear || String(new Date().getFullYear())));
        setVal('ettStart', exam && exam.startDate ? exam.startDate.slice(0, 10) : '');
        setVal('ettEnd', exam && exam.endDate ? exam.endDate.slice(0, 10) : '');
        setVal('ettStatusSel', exam ? exam.status : 'open');
        setVal('ettVenue', exam ? exam.venue || '' : '');
        setVal('ettNotes', exam ? exam.notes || '' : '');

        // grade select
        const gSel = $id('ettGradeSel');
        const usedGrades = [...new Set([...(store.exams || []).map(a => a.grade), ...allSeries().map(x => x.grade)].filter(Boolean))];
        const gradePool = usedGrades.length ? usedGrades : ALL_GRADES;
        gSel.innerHTML = '<option value="">Select grade…</option>' + gradePool.map(g => `<option value="${escapeHtml(g)}">${escapeHtml(g)}</option>`).join('');
        if (exam && exam.grade) gSel.value = exam.grade;

        // sessions body
        const body = $id('ettSessionsBody');
        body.innerHTML = '';
        state.sessionRows = [];
        (exam && exam.sessions ? exam.sessions : []).forEach(s => ettAddSessionRow(s));
        if (!state.sessionRows.length) ettAddSessionRow({}); // one empty starter row

        refreshSessionSubjects(gSel.value);
        const clashBox = $id('ettClashBox');
        if (clashBox) { clashBox.style.display = 'none'; clashBox.innerHTML = ''; }
        openModal('ettModal');
        setTimeout(() => $id('ettName')?.focus(), 120);
    }

    function refreshSessionSubjects(grade) {
        const opts = subjectOptionsFor(grade || '').map(a => `<option value="${escapeHtml(a.name)}" data-code="${escapeHtml(a.code)}">${escapeHtml(a.name)}${a.code ? ' (' + escapeHtml(a.code) + ')' : ''}</option>`).join('');
        document.querySelectorAll('.ett-sess-subject').forEach(sel => {
            const cur = sel.value;
            sel.innerHTML = '<option value="">Select subject…</option>' + opts;
            if (cur) sel.value = cur;
        });
    }

    function ettAddSessionRow(data = {}) {
        const body = $id('ettSessionsBody');
        if (!body) return;
        const tr = document.createElement('tr');
        tr.className = 'ett-sess-row';
        tr.innerHTML = `
            <td><select class="ett-sess-subject form-control-modern"><option value="">Select subject…</option></select></td>
            <td><input type="date" class="ett-sess-date form-control-modern"></td>
            <td><input type="time" class="ett-sess-start form-control-modern"></td>
            <td><input type="time" class="ett-sess-end form-control-modern"></td>
            <td><input type="text" class="ett-sess-room form-control-modern" placeholder="Room/Stream"></td>
            <td><input type="text" class="ett-sess-invig form-control-modern" list="ettInvigList" placeholder="Invigilator"></td>
            <td><button type="button" class="ett-row-del" title="Remove session"><i class="fa-solid fa-xmark"></i></button></td>`;
        body.appendChild(tr);

        const subject = tr.querySelector('.ett-sess-subject');
        subject.innerHTML = '<option value="">Select subject…</option>' +
            subjectOptionsFor(getVal('ettGradeSel') || '').map(a => `<option value="${escapeHtml(a.name)}" data-code="${escapeHtml(a.code)}">${escapeHtml(a.name)}${a.code ? ' (' + escapeHtml(a.code) + ')' : ''}</option>`).join('');
        if (data.subject) subject.value = data.subject;
        tr.querySelector('.ett-sess-date').value = data.date || '';
        tr.querySelector('.ett-sess-start').value = data.start || '08:00';
        tr.querySelector('.ett-sess-end').value = data.end || '10:00';
        tr.querySelector('.ett-sess-room').value = data.room || getVal('ettVenue') || '';
        tr.querySelector('.ett-sess-invig').value = data.invigilator || '';
        tr.querySelector('.ett-row-del').addEventListener('click', () => {
            tr.remove();
            state.sessionRows = state.sessionRows.filter(r => r !== tr);
        });
        // auto-fill date from series window when it changes
        tr.querySelector('.ett-sess-date').addEventListener('change', (e) => {
            const d = e.target.value;
            if (d && !$id('ettEnd').value) $id('ettEnd').value = d;
        });
        state.sessionRows.push(tr);
    }

    function ettReadSessions() {
        const rows = [];
        document.querySelectorAll('#ettSessionsBody .ett-sess-row').forEach(tr => {
            const subject = tr.querySelector('.ett-sess-subject').value;
            const date = tr.querySelector('.ett-sess-date').value;
            const start = tr.querySelector('.ett-sess-start').value;
            const end = tr.querySelector('.ett-sess-end').value;
            const room = tr.querySelector('.ett-sess-room').value.trim();
            const invigilator = tr.querySelector('.ett-sess-invig').value.trim();
            if (!subject && !date) return; // skip fully-empty rows
            rows.push({ id: generateId(), subject, code: tr.querySelector('.ett-sess-subject').selectedOptions[0]?.dataset.code || '', date, start, end, room, invigilator });
        });
        return rows;
    }

    function ettSaveSeries() {
        // RBAC: defense-in-depth — never persist timetable writes for view-only roles
        if (typeof canDo !== 'undefined' && !canDo('examsManage')) {
            showToast('Only the Exam Officer can save exam timetable changes.', 'error');
            return;
        }
        const name = (getVal('ettName') || '').trim();
        const type = getVal('ettTypeSel') || 'End Term';
        const grade = getVal('ettGradeSel') || '';
        const term = getVal('ettTermSel') || '';
        const year = getVal('ettYearSel') || String(new Date().getFullYear());
        const startDate = getVal('ettStart') || '';
        const endDate = getVal('ettEnd') || startDate;
        const status = getVal('ettStatusSel') || 'draft';
        const venue = (getVal('ettVenue') || '').trim();
        const notes = (getVal('ettNotes') || '').trim();

        if (!name) return showToast('Exam name is required.', 'error');
        if (!grade) return showToast('Select a grade.', 'error');
        if (!startDate) return showToast('Start date is required.', 'error');
        if (endDate && endDate < startDate) return showToast('End date cannot be before start date.', 'error');

        const sessions = ettReadSessions();
        sessions.forEach(s => {
            if (s.date && (s.date < startDate || (endDate && s.date > endDate))) {
                return showToast(`Session "${s.subject}" (${s.date}) is outside the exam window (${startDate} → ${endDate}).`, 'error');
            }
            if (s.subject && s.date && (!s.start || !s.end)) return showToast(`Set start & end times for "${s.subject}" on ${s.date}.`, 'error');
            if (s.start && s.end && s.start >= s.end) return showToast(`End time must be after start time for "${s.subject}".`, 'error');
        });

        const rec = {
            id: state.editingId || generateId(),
            name, type, grade, term, year, startDate, endDate, status,
            venue, notes, sessions, createdAt: new Date().toISOString()
        };
        const clashes = ettClashes(rec);
        if (clashes.length) {
            showToast('⚠ ' + clashes[0], 'error');
            const list = $id('ettClashBox');
            if (list) {
                list.style.display = 'block';
                list.innerHTML = `<div class="ett-clash-title"><i class="fa-solid fa-triangle-exclamation"></i> Timetable clashes detected — fix them before saving:</div>` +
                    clashes.map(c => `<div class="ett-clash-item">${escapeHtml(c)}</div>`).join('');
            }
            return;
        }

        if (state.editingId) {
            const idx = (store.examSchedules || []).findIndex(x => x.id === state.editingId);
            if (idx !== -1) store.examSchedules[idx] = { ...store.examSchedules[idx], ...rec, id: state.editingId };
        } else {
            store.examSchedules.push(rec);
        }
        saveData();
        closeModal('ettModal');
        ettRender();
        showToast('Exam timetable saved.', 'success');
    }

    function ettDeleteSeries(id) {
        if (typeof canDo !== 'undefined' && !canDo('examsManage')) {
            showToast('Only the Exam Officer can delete exam series.', 'error');
            return;
        }
        confirmAction('Delete this exam series and all its sessions?', () => {
            store.examSchedules = (store.examSchedules || []).filter(x => x.id !== id);
            saveData();
            ettRender();
            showToast('Exam series deleted.', 'success');
        });
    }

    /* ═══════════════════════════════════════════════════════════════
     *   PRINT + PDF EXPORT
     * ═══════════════════════════════════════════════════════════════ */
    function ettPrintHTML(examOnly) {
        const school = store.settings.schoolName || 'School';
        const motto = store.settings.motto || '';
        const series = examOnly
            ? filteredSeries().filter(s => s.id === examOnly)
            : filteredSeries().filter(s => (s.sessions || []).length > 0);
        const html = series.map(exam => {
            const sessions = (exam.sessions || []).slice().sort((a, b) => (a.date || '').localeCompare(b.date || ''));
            const dates = [...new Set(sessions.map(s => s.date).filter(Boolean))].sort();
            const subjects = [...new Set(sessions.map(s => s.subject).filter(Boolean))];
            let table;
            if (subjects.length && dates.length) {
                table = `<h3>${escapeHtml(exam.name)} — ${escapeHtml(exam.grade)}</h3>
                <p class="ett-print-sub">${escapeHtml(exam.type || 'Exam')} · ${escapeHtml(exam.term || '')} ${escapeHtml(exam.year || '')} · ${fmtDateFull(exam.startDate)} → ${fmtDateFull(exam.endDate)}${exam.venue ? ' · Venue: ' + escapeHtml(exam.venue) : ''}</p>
                <table class="ett-print-mx">
                    <thead><tr><th>Subject</th>${dates.map(d => `<th>${escapeHtml(fmtDate(d))}</th>`).join('')}</tr></thead>
                    <tbody>${subjects.map(subj => {
                        return `<tr><td>${escapeHtml(subj)}</td>${dates.map(d => {
                            const s = sessions.find(x => x.subject === subj && x.date === d);
                            return s ? `<td>${escapeHtml(s.start || '')}–${escapeHtml(s.end || '')}<br><small>${escapeHtml(s.room || '')}${s.invigilator ? ' · ' + escapeHtml(s.invigilator) : ''}</small></td>` : '<td></td>';
                        }).join('')}</tr>`;
                    }).join('')}</tbody>
                </table>`;
            } else {
                table = `<h3>${escapeHtml(exam.name)} — ${escapeHtml(exam.grade)}</h3>
                <table class="ett-print-mx"><thead><tr><th>Subject</th><th>Date</th><th>Time</th><th>Room</th><th>Invigilator</th></tr></thead>
                <tbody>${sessions.map(s => `<tr><td>${escapeHtml(s.subject || '')}</td><td>${fmtDateFull(s.date)}</td><td>${escapeHtml(s.start || '')}–${escapeHtml(s.end || '')}</td><td>${escapeHtml(s.room || '')}</td><td>${escapeHtml(s.invigilator || '')}</td></tr>`).join('') || '<tr><td colspan="5">No sessions scheduled.</td></tr>'}</tbody></table>`;
            }
            return table;
        }).join('');
        return `<div class="ett-print-head">
            <h1>${escapeHtml(school)}</h1>
            ${motto ? `<p>${escapeHtml(motto)}</p>` : ''}
            <h2>EXAMINATION TIMETABLE — ${escapeHtml(store.settings.currentTerm || '')} ${escapeHtml(store.settings.academicYear || '')}</h2>
            <p>Printed: ${new Date().toLocaleString('en-GB')}</p>
        </div>${html}`;
    }

    function ettPrint() {
        const w = window.open('', '_blank', 'width=980,height=720');
        if (!w) return showToast('Pop-up blocked. Allow pop-ups for this site.', 'error');
        w.document.write(`<!DOCTYPE html><html><head><title>Exam Timetable</title>
        <style>
            body{font-family:'Inter',Arial,sans-serif;color:#0f172a;margin:36px;}
            .ett-print-head{text-align:center;margin-bottom:28px;border-bottom:3px solid #16a34a;padding-bottom:16px;}
            .ett-print-head h1{margin:0;font-size:24px;}
            .ett-print-head h2{margin:8px 0 4px;font-size:16px;color:#16a34a;text-transform:uppercase;letter-spacing:1px;}
            .ett-print-head p{margin:2px 0;color:#64748b;font-size:12px;}
            h3{margin:26px 0 8px;font-size:15px;}
            .ett-print-sub{margin:0 0 10px;color:#475569;font-size:12px;}
            table.ett-print-mx{width:100%;border-collapse:collapse;font-size:12px;margin-bottom:18px;}
            table.ett-print-mx th,table.ett-print-mx td{border:1px solid #cbd5e1;padding:7px 9px;text-align:left;vertical-align:top;}
            table.ett-print-mx th{background:#f1f5f9;font-weight:700;}
            table.ett-print-mx td small{color:#64748b;}
            @media print{body{margin:12mm;}}
        </style></head><body>${ettPrintHTML()}</body></html>`);
        w.document.close();
        w.focus();
        setTimeout(() => { try { w.print(); } catch (e) { /* user may print manually */ } }, 400);
    }

    function ettPrintSeries(id) {
        const w = window.open('', '_blank', 'width=980,height=720');
        if (!w) return showToast('Pop-up blocked. Allow pop-ups for this site.', 'error');
        w.document.write(`<!DOCTYPE html><html><head><title>Exam Timetable</title>
        <style>body{font-family:'Inter',Arial,sans-serif;color:#0f172a;margin:36px;}
            .ett-print-head{text-align:center;margin-bottom:28px;border-bottom:3px solid #16a34a;padding-bottom:16px;}
            .ett-print-head h1{margin:0;font-size:24px;} .ett-print-head h2{margin:8px 0 4px;font-size:16px;color:#16a34a;text-transform:uppercase;letter-spacing:1px;} .ett-print-head p{margin:2px 0;color:#64748b;font-size:12px;}
            h3{margin:26px 0 8px;font-size:15px;} .ett-print-sub{margin:0 0 10px;color:#475569;font-size:12px;}
            table.ett-print-mx{width:100%;border-collapse:collapse;font-size:12px;margin-bottom:18px;}
            table.ett-print-mx th,table.ett-print-mx td{border:1px solid #cbd5e1;padding:7px 9px;text-align:left;vertical-align:top;}
            table.ett-print-mx th{background:#f1f5f9;font-weight:700;} table.ett-print-mx td small{color:#64748b;}
        </style></head><body>${ettPrintHTML(id)}</body></html>`);
        w.document.close();
        w.focus();
        setTimeout(() => { try { w.print(); } catch (e) { /* manual */ } }, 400);
    }

    function ettExportPDF() {
        if (typeof jspdf === 'undefined') return showToast('PDF library not loaded.', 'error');
        const series = filteredSeries().filter(s => (s.sessions || []).length > 0);
        if (!series.length) return showToast('No scheduled sessions to export.', 'error');
        try {
            const doc = new jspdf.jsPDF('l', 'pt', 'a4');
            const school = store.settings.schoolName || 'School';
            doc.setFontSize(16); doc.setTextColor(22, 163, 74);
            doc.text(school, 40, 50);
            doc.setFontSize(11); doc.setTextColor(30, 41, 59);
            doc.text(`EXAMINATION TIMETABLE — ${store.settings.currentTerm || ''} ${store.settings.academicYear || ''}`, 40, 70);
            doc.setFontSize(9); doc.setTextColor(100, 116, 139);
            doc.text(`Generated ${new Date().toLocaleString('en-GB')} · ${series.length} exam series`, 40, 86);

            let y = 110;
            series.forEach((exam, idx) => {
                if (y > 560) { doc.addPage(); y = 60; }
                const sessions = (exam.sessions || []).slice().sort((a, b) => (a.date || '').localeCompare(b.date || ''));
                doc.setFontSize(12); doc.setTextColor(15, 23, 42);
                doc.text(`${exam.name} — ${exam.grade} (${exam.type || 'Exam'})`, 40, y);
                y += 16;
                doc.autoTable({
                    startY: y,
                    head: [['Subject', 'Date', 'Time', 'Room', 'Invigilator']],
                    body: sessions.map(s => [s.subject || '', fmtDateFull(s.date), `${s.start || ''}–${s.end || ''}`, s.room || '', s.invigilator || '']),
                    styles: { fontSize: 9, cellPadding: 5 },
                    headStyles: { fillColor: [34, 197, 94], textColor: 255 },
                    margin: { left: 40, right: 40 }
                });
                y = doc.lastAutoTable.finalY + 26;
            });
            doc.save(`exam-timetable-${store.settings.currentTerm || 'term'}-${store.settings.academicYear || new Date().getFullYear()}.pdf`);
            showToast('Exam timetable PDF exported.', 'success');
        } catch (e) {
            console.error('[ETT PDF]', e);
            showToast('PDF export failed: ' + (e.message || 'error'), 'error');
        }
    }

    /* ═══════════════════════════════════════════════════════════════
     *   DEMO SEED
     * ═══════════════════════════════════════════════════════════════ */
    function ettSeedDemo() {
        if ((store.examSchedules || []).length > 0 && !confirm('This will ADD sample exam timetable entries to the current data. Continue?')) return;
        const year = store.settings.academicYear || String(new Date().getFullYear());
        const term = store.settings.currentTerm || 'Term 2';
        const start = addDays(new Date(), 2);
        const types = ['Opener', 'Mid Term', 'End Term'];

        const build = (grade, name, type, offset) => {
            const areas = subjectOptionsFor(grade).slice(0, 6);
            const s0 = addDays(start, offset);
            const sessions = areas.map((a, i) => ({
                id: generateId(),
                subject: a.name,
                code: a.code,
                date: addDays(s0, Math.floor(i / 2)),
                start: (i % 2 === 0 ? '08:00' : '10:30'),
                end: (i % 2 === 0 ? '10:00' : '12:30'),
                room: i % 2 === 0 ? 'Hall A' : 'Hall B',
                invigilator: ''
            }));
            return {
                id: generateId(), name, type, grade, term, year,
                startDate: s0, endDate: addDays(s0, Math.ceil(areas.length / 2) - 1),
                status: 'open', venue: 'Main Hall', notes: 'Sample timetable — edit or delete as needed.',
                sessions, createdAt: new Date().toISOString()
            };
        };

        const sample = [
            build('Grade 7', `${term} ${year} — Grade 7`, types[2], 0),
            build('Grade 4', `${term} ${year} — Grade 4`, types[2], 2),
            build('Grade 8', `${term} ${year} — Grade 8`, types[1], 4)
        ];
        sample.forEach(s => store.examSchedules.push(s));
        saveData();
        localStorage.setItem('elimutrack_ett_seeded', '1');
        populateFilters();
        ettRender();
        showToast('Sample examination timetable loaded.', 'success');
    }

    function maybeSeedDemo() {
        try {
            if (localStorage.getItem('elimutrack_ett_seeded') === '1') return;
            if ((store.examSchedules || []).length > 0) return;
            if ((store.students || []).length === 0 && (store.learningAreas || []).length === 0) return;
            ettSeedDemo();
        } catch (e) { console.warn('[ETT seed]', e); }
    }

    /* ── expose API ── */
    window.ettInit = ettInit;
    window.ettOpenSeries = ettOpenSeries;
    window.ettDeleteSeries = ettDeleteSeries;
    window.ettSaveSeries = ettSaveSeries;
    window.ettAddSessionRow = ettAddSessionRow;
    window.ettRender = ettRender;
    window.ettRenderCalendar = ettRenderCalendar;
    window.ettRenderMatrix = ettRenderMatrix;
    window.ettOpenMatrixOf = ettOpenMatrixOf;
    window.ettPrint = ettPrint;
    window.ettPrintSeries = ettPrintSeries;
    window.ettExportPDF = ettExportPDF;
    window.ettSeedDemo = ettSeedDemo;
    window.ettClashes = ettClashes; // exposed for unit-testing / debugging
})();
