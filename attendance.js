'use strict';
/* ==========================================================================
 *   ELIMUTRACK — DIGITAL ROLL CALL DASHBOARD (attendance.js)
 *   Three tabs per the product concept:
 *     1. ROLL CALL  — teacher marks Present / Absent / Late + remarks,
 *        save & sync status.
 *     2. DASHBOARD  — today's %, absent & late counts, 7-day trend bars,
 *        per-class attendance report table.
 *     3. ALERTS     — absent learners auto-notified: message preview,
 *        guardian contact, "Send via SMS & School App" → inbox message.
 *   Data model: flat per-student records in store.attendance:
 *     { id, date, grade, stream, subjectId?, studentId, status,
 *       note, takenBy, takenAt }
 *   Loaded AFTER script.js — reuses store, StudentRepo, getScopedStudents,
 *   getTeacherScope, saveData, showToast, escapeHtml, generateId, canDo.
 * ========================================================================== */

(function () {
    if (window.__ATT_LOADED__) return;
    window.__ATT_LOADED__ = true;

    const STATUS_META = {
        present: { label: 'Present', cls: 'att-st-present', color: '#16a34a' },
        absent:  { label: 'Absent',  cls: 'att-st-absent',  color: '#dc2626' },
        late:    { label: 'Late',    cls: 'att-st-late',    color: '#d97706' }
    };
    const ALL_GRADES = ['PP1', 'PP2', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9'];
    const todayISO = () => new Date().toISOString().slice(0, 10);

    const state = { tab: 'rollcall', bound: false };

    const $id = (i) => document.getElementById(i);
    const val = (i) => ($id(i) ? $id(i).value : '');
    const setVal = (i, v) => { const el = $id(i); if (el) el.value = v; };
    const esc = (x) => escapeHtml(x);
    const fmtShort = (d) => { if (!d) return '—'; const dt = String(d).length === 10 ? new Date(d + 'T00:00:00') : new Date(d); return isNaN(dt) ? d : dt.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }); };

    /* ── helpers ── */
    function isTeacher() { return getCurrentRole() === 'teacher'; }
    function scopeGrades() {
        if (!isTeacher()) return ALL_GRADES;
        const g = getTeacherScope().grades;
        return g.length ? g : [];
    }
    function scopeStreams(grade) {
        return [...new Set(getScopedStudents().filter(s => s.grade === grade).map(s => s.stream).filter(Boolean))].sort();
    }
    function scopeStudents(grade, stream) {
        let list = getScopedStudents();
        if (grade) list = list.filter(s => s.grade === grade);
        if (stream) list = list.filter(s => s.stream === stream);
        return list;
    }
    function sessionKey(date, grade, stream, subjectId) {
        // null/undefined subjectId normalizes to '' (server stores NULL for whole-day)
        return `${date || ''}__${grade || ''}__${stream || ''}__${subjectId || ''}`;
    }
    function existingFor(date, grade, stream, subjectId) {
        const key = sessionKey(date, grade, stream, subjectId);
        const map = {};
        (store.attendance || []).forEach(r => {
            const k = sessionKey(r.date, r.grade, r.stream, r.subjectId);
            if (k === key && r.studentId) map[r.studentId] = r;
        });
        return map;
    }

    /* ═══════════════════════════════════════════════════════════════
     *   INIT
     * ═══════════════════════════════════════════════════════════════ */
    function initAttendanceSection() {
        if (!document.getElementById('attGrade')) return; // section absent
        if (!state.bound) {
            state.bound = true;
            bind();
        }
        populateFilters();
        renderActiveTab();
    }

    function bind() {
        const tabs = $id('attTabs');
        if (tabs) tabs.addEventListener('click', (e) => {
            const btn = e.target.closest('.att-tab');
            if (!btn) return;
            tabs.querySelectorAll('.att-tab').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.tab = btn.dataset.atttab;
            renderActiveTab();
        });
        ['attGrade', 'attStream', 'attSubject', 'attDate'].forEach(id => {
            $id(id)?.addEventListener('change', renderRollCall);
        });
        $id('attSaveBtn')?.addEventListener('click', attSave);
        $id('attMarkAllBtn')?.addEventListener('click', attMarkAll);
        $id('attDashDate')?.addEventListener('change', renderDashboard);
        $id('attAlertsDate')?.addEventListener('change', renderAlerts);
        $id('attSendAllBtn')?.addEventListener('click', attSendAll);
    }

    function populateFilters() {
        // Grade
        const gSel = $id('attGrade');
        if (gSel) {
            const cur = gSel.value;
            const grades = scopeGrades();
            gSel.innerHTML = '<option value="">Select Grade…</option>' + grades.map(g => `<option value="${esc(g)}">${esc(g)}</option>`).join('');
            if (cur && grades.includes(cur)) gSel.value = cur;
        }
        // Date defaults to today
        if ($id('attDate') && !$id('attDate').value) setVal('attDate', todayISO());

        const grade = val('attGrade');
        // Stream
        const stSel = $id('attStream');
        if (stSel) {
            const cur = stSel.value;
            const streams = grade ? scopeStreams(grade) : [];
            stSel.innerHTML = '<option value="">All Streams</option>' + streams.map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join('');
            if (cur && streams.includes(cur)) stSel.value = cur;
        }
        // Subject (optional — learning areas for the grade, teacher-scoped)
        const subSel = $id('attSubject');
        if (subSel) {
            const cur = subSel.value;
            let areas = (store.learningAreas || []).filter(a => !grade || !Array.isArray(a.applicableLevels) || a.applicableLevels.includes(grade));
            const mine = typeof getTeacherSubjectIds === 'function' ? getTeacherSubjectIds(grade || undefined) : null;
            if (mine) areas = areas.filter(a => mine.has(a.id));
            subSel.innerHTML = '<option value="">Whole Day (no subject)</option>' +
                areas.map(a => `<option value="${esc(a.id)}">${esc(a.name)}${a.code ? ' (' + esc(a.code) + ')' : ''}</option>`).join('');
            if (cur && areas.some(a => a.id === cur)) subSel.value = cur;
        }
        // Date lists for dashboard + alerts (last 30 recorded dates + today)
        const dates = recordedDates();
        ['attDashDate', 'attAlertsDate'].forEach(id => {
            const sel = $id(id);
            if (!sel) return;
            const cur = sel.value;
            sel.innerHTML = dates.map(d => `<option value="${d}">${esc(fmtShort(d))}</option>`).join('') ||
                `<option value="${todayISO()}">${esc(fmtShort(todayISO()))}</option>`;
            if (cur && dates.includes(cur)) sel.value = cur;
            else if (!dates.includes(cur)) { sel.value = dates[0] || todayISO(); }
        });
    }

    function recordedDates() {
        const set = new Set((store.attendance || []).map(r => r.date).filter(Boolean));
        set.add(todayISO());
        return [...set].sort().reverse();
    }

    function renderActiveTab() {
        ['rollcall', 'dashboard', 'alerts'].forEach(t => {
            const c = $id('attTab-' + t);
            if (c) c.style.display = state.tab === t ? '' : 'none';
        });
        if (state.tab === 'rollcall') renderRollCall();
        else if (state.tab === 'dashboard') renderDashboard();
        else renderAlerts();
        updateAlertsBadge();
    }

    /* ═══════════════════════════════════════════════════════════════
     *   TAB 1 — ROLL CALL
     * ═══════════════════════════════════════════════════════════════ */
    function renderRollCall() {
        populateFilters();
        const grade = val('attGrade');
        const body = $id('attRollBody');
        const meta = $id('attMetaBar');
        if (!body) return;
        if (!grade) {
            body.innerHTML = '<tr><td colspan="5" class="s-table-empty">Select a grade to start the roll call.</td></tr>';
            if (meta) meta.innerHTML = '';
            return;
        }
        const stream = val('attStream');
        const subjectId = val('attSubject');
        const date = val('attDate') || todayISO();
        const students = scopeStudents(grade, stream);
        if (!students.length) {
            body.innerHTML = '<tr><td colspan="5" class="s-table-empty">No learners in this class.</td></tr>';
            if (meta) meta.innerHTML = '';
            return;
        }
        const existing = existingFor(date, grade, stream, subjectId);
        const alreadyTaken = Object.keys(existing).length > 0;
        const subjName = subjectId ? (store.learningAreas.find(a => a.id === subjectId)?.name || '') : 'Whole Day';
        if (meta) {
            meta.innerHTML = `
                <span class="att-meta-chip"><i class="fa-solid fa-users"></i> ${students.length} learners</span>
                <span class="att-meta-chip"><i class="fa-solid fa-calendar-day"></i> ${esc(fmtShort(date))}</span>
                <span class="att-meta-chip"><i class="fa-solid fa-book"></i> ${esc(subjName)}</span>
                <span class="att-meta-chip ${alreadyTaken ? 'att-meta-ok' : ''}">${alreadyTaken ? '<i class="fa-solid fa-circle-check"></i> Attendance already recorded — editing existing marks' : '<i class="fa-solid fa-circle-info"></i> New roll call'}</span>`;
        }

        body.innerHTML = students.map((s, idx) => {
            const rec = existing[s.id];
            const status = rec ? rec.status : '';
            const note = rec ? rec.note || '' : '';
            const btn = (st, label, icon) => `<button type="button" class="att-btn att-btn-${st} ${status === st ? 'active' : ''}" data-student="${s.id}" data-status="${st}" onclick="attSetStatus('${s.id}', '${st}', this)">${icon}${label}</button>`;
            return `<tr class="att-row" data-student="${s.id}">
                <td style="text-align:center;color:var(--text-muted);">${idx + 1}</td>
                <td><strong>${esc(s.name)}</strong><small style="display:block;color:var(--text-muted);font-size:0.72rem;">${esc(s.stream || '')}</small></td>
                <td style="color:var(--text-muted);font-size:0.85rem;">${esc(s.reg || '—')}</td>
                <td>
                    <div class="att-btn-group">
                        ${btn('present', 'P', '<i class="fa-solid fa-check"></i>')}
                        ${btn('absent', 'A', '<i class="fa-solid fa-xmark"></i>')}
                        ${btn('late', 'L', '<i class="fa-solid fa-clock"></i>')}
                    </div>
                </td>
                <td><input type="text" class="att-note-input" placeholder="Remark (e.g. sick, permission…)…" value="${esc(note)}" data-student="${s.id}"></td>
            </tr>`;
        }).join('');
    }

    /* ═══════════════════════════════════════════════════════════════
     *   SAVE (upsert into store.attendance + persist)
     * ═══════════════════════════════════════════════════════════════ */
    function attSave() {
        if (!canDo('scoresEdit')) {
            showToast('You have view-only access to attendance.', 'error');
            return;
        }
        const grade = val('attGrade');
        if (!grade) return showToast('Select a grade first.', 'error');
        const stream = val('attStream');
        const subjectId = val('attSubject');
        const date = val('attDate') || todayISO();

        const rows = document.querySelectorAll('#attRollBody .att-row');
        if (!rows.length) return showToast('No learners to save.', 'error');

        let marked = 0;
        const records = [];
        rows.forEach(tr => {
            const studentId = tr.dataset.student;
            const activeBtn = tr.querySelector('.att-btn.active');
            const status = activeBtn ? activeBtn.dataset.status : 'present'; // default: present
            const noteInput = tr.querySelector('.att-note-input');
            const note = noteInput ? noteInput.value.trim() : '';
            records.push({
                id: generateId(),
                date, grade, stream,
                subjectId: subjectId || null,
                subjectName: subjectId ? (store.learningAreas.find(a => a.id === subjectId)?.name || null) : null,
                studentId, status, note,
                takenBy: (CURRENT_USER && CURRENT_USER.name) || 'Staff',
                takenAt: new Date().toISOString()
            });
            if (status !== 'present') marked++;
        });

        // Upsert: drop stale records for this exact session, then add new ones
        const key = sessionKey(date, grade, stream, subjectId);
        store.attendance = (store.attendance || []).filter(r => sessionKey(r.date, r.grade, r.stream, r.subjectId) !== key);
        store.attendance = store.attendance.concat(records);

        setSync('Syncing…', false); // matches the reference: Syncing… → Connected
        saveData(); // syncs /attendance + refreshes the active view
        setSync('Saved & synced ✓', true);
        const footer = $id('attFooterStatus');
        if (footer) {
            footer.style.display = '';
            footer.innerHTML = '<i class="fa-solid fa-circle-check"></i> Attendance Updated — ' + records.length + ' learners (' + marked + ' non-present)';
        }
        setTimeout(() => {
            setSync('Connected', false);
            if (footer) footer.style.display = 'none';
        }, 3200);
        showToast(`Attendance saved — ${records.length} learners, ${marked} non-present.`, 'success');
        updateAlertsBadge();
    }

    function attMarkAll() {
        if (!canDo('scoresEdit')) return showToast('You have view-only access to attendance.', 'error');
        document.querySelectorAll('#attRollBody .att-row .att-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.status === 'present');
        });
        showToast('All learners marked Present.', 'info');
    }

    /* ═══════════════════════════════════════════════════════════════
     *   TAB 2 — DASHBOARD
     * ═══════════════════════════════════════════════════════════════ */
    function renderDashboard() {
        const dateSel = $id('attDashDate');
        if (dateSel && !dateSel.value) dateSel.value = todayISO();
        const date = dateSel ? dateSel.value : todayISO();
        const kpis = $id('attKpis');
        const bars = $id('attBars');
        const cBody = $id('attClassBody');
        if (!kpis || !bars || !cBody) return;

        const recs = (store.attendance || []).filter(r => r.date === date);
        const perStudent = dedupeRecords(recs); // one mark per learner per day (whole-day preferred)
        const total = perStudent.length;
        const present = perStudent.filter(r => r.status === 'present').length;
        const absent = perStudent.filter(r => r.status === 'absent').length;
        const late = perStudent.filter(r => r.status === 'late').length;
        // Late counts as attended for the rate (same convention as reports)
        const rate = total ? Math.round(((present + late) / total) * 100) : 0;

        kpis.innerHTML = `
            <div class="att-kpi">
                <span class="att-kpi-ic green"><i class="fa-solid fa-user-check"></i></span>
                <div><b>${rate}%</b><small>Today's Attendance</small></div>
            </div>
            <div class="att-kpi">
                <span class="att-kpi-ic red"><i class="fa-solid fa-user-xmark"></i></span>
                <div><b>${absent}</b><small>Absent Students</small></div>
            </div>
            <div class="att-kpi">
                <span class="att-kpi-ic amber"><i class="fa-solid fa-clock"></i></span>
                <div><b>${late}</b><small>Late Arrivals</small></div>
            </div>
            <div class="att-kpi">
                <span class="att-kpi-ic indigo"><i class="fa-solid fa-users"></i></span>
                <div><b>${present}</b><small>Present</small></div>
            </div>`;

        // 7-day trend bars
        const days = last7RecordedDays(date);
        const maxV = Math.max(1, ...days.map(d => d.rate));
        bars.innerHTML = days.length ? days.map(d => `
            <div class="att-bar-col" title="${esc(fmtShort(d.date))} — ${d.rate}% (${d.present}/${d.total})">
                <div class="att-bar-track"><div class="att-bar-fill" style="height:${Math.max(6, Math.round((d.rate / maxV) * 100))}%;background:${d.rate >= 90 ? '#22c55e' : d.rate >= 75 ? '#3b82f6' : d.rate >= 50 ? '#f59e0b' : '#ef4444'};"></div></div>
                <span class="att-bar-label">${d.rate}%</span>
                <span class="att-bar-day">${esc(d.short)}</span>
            </div>`).join('')
            : '<p class="att-empty-note">No attendance records yet — mark attendance in the Roll Call tab.</p>';

        // Class attendance report
        const classes = {};
        perStudent.forEach(r => {
            const key = `${r.grade || '—'}${r.stream ? ' ' + r.stream : ''}`;
            if (!classes[key]) classes[key] = { present: 0, absent: 0, late: 0, total: 0 };
            classes[key][r.status]++;
            classes[key].total++;
        });
        const entries = Object.entries(classes).sort((a, b) => a[0].localeCompare(b[0]));
        cBody.innerHTML = entries.length ? entries.map(([cls, c]) => `
            <tr>
                <td><strong>${esc(cls)}</strong></td>
                <td style="text-align:center;color:#16a34a;font-weight:600;">${c.present}</td>
                <td style="text-align:center;color:#dc2626;font-weight:600;">${c.absent}</td>
                <td style="text-align:center;color:#d97706;font-weight:600;">${c.late}</td>
                <td style="text-align:center;font-weight:700;">${c.total ? Math.round((c.present / c.total) * 100) : 0}%</td>
            </tr>`).join('')
            : '<tr><td colspan="5" class="s-table-empty">No marks recorded for this date.</td></tr>';
    }

    // One mark per learner per DAY — prefer the whole-day record (no subjectId)
    // when both a subject mark and a whole-day mark exist for that learner+date.
    function dedupeRecords(recs) {
        const byKey = {};
        recs.forEach(r => {
            if (!r.studentId || !r.date) return;
            const key = r.studentId + '__' + r.date;
            const cur = byKey[key];
            if (!cur || (!r.subjectId && cur.subjectId)) byKey[key] = r;
        });
        return Object.values(byKey);
    }

    function last7RecordedDays(anchorDate) {
        const dates = [...new Set((store.attendance || []).map(r => r.date).filter(Boolean))].sort();
        const anchor = anchorDate || dates[dates.length - 1] || todayISO();
        const before = dates.filter(d => d <= anchor).slice(-7);
        return before.map(d => {
            const perStudent = dedupeRecords((store.attendance || []).filter(r => r.date === d));
            const total = perStudent.length;
            const present = perStudent.filter(r => r.status === 'present').length;
            const late = perStudent.filter(r => r.status === 'late').length;
            // Late counts as attended for the rate (same convention as the report)
            return { date: d, short: fmtShort(d).split(',')[0].split(' ')[0], total, present, late, rate: total ? Math.round(((present + late) / total) * 100) : 0 };
        });
    }

    /* ═══════════════════════════════════════════════════════════════
     *   TAB 3 — PARENT ALERTS
     * ═══════════════════════════════════════════════════════════════ */
    function renderAlerts() {
        const dateSel = $id('attAlertsDate');
        if (dateSel && !dateSel.value) dateSel.value = todayISO();
        const date = dateSel ? dateSel.value : todayISO();
        const list = $id('attAlertsList');
        if (!list) return;

        const absentRecs = dedupeRecords((store.attendance || []).filter(r => r.date === date && (r.status === 'absent' || r.status === 'late')));
        if (!absentRecs.length) {
            list.innerHTML = '<div class="att-empty-state"><i class="fa-solid fa-bell-slash"></i><h4>No alerts for this date</h4><p>No learners were marked absent or late on ' + esc(fmtShort(date)) + '.</p></div>';
            return;
        }
        list.innerHTML = absentRecs.map(r => {
            const student = StudentRepo.getById(r.studentId);
            if (!student) return '';
            const sent = isAlertSent(r);
            const msg = `Alert: Your child, ${student.name}, was marked ${r.status.toUpperCase()} from class today${r.subjectName ? ' (' + r.subjectName + ')' : ''}${r.note ? ' — ' + r.note : ''}.`;
            return `<div class="att-alert-card ${sent ? 'sent' : ''}">
                <div class="att-alert-left">
                    <span class="att-alert-avatar">${esc((student.name || '?').charAt(0).toUpperCase())}</span>
                    <div>
                        <strong>${esc(student.name)}</strong>
                        <small>${esc(student.grade || '')} ${esc(student.stream || '')} · ${esc(student.reg || '')}</small>
                        <small><i class="fa-solid fa-phone"></i> ${esc(student.guardianPhone || 'No phone on record')} · ${esc(student.guardianName || 'Guardian not recorded')}</small>
                    </div>
                </div>
                <div class="att-alert-mid">
                    <span class="att-alert-tag ${r.status}">${esc(r.status.toUpperCase())}</span>
                    <p><i class="fa-solid fa-comment-sms"></i> “${esc(msg)}”</p>
                    <small class="att-alert-via"><i class="fa-solid fa-bolt"></i> Sent via SMS &amp; School App</small>
                </div>
                <div class="att-alert-right">
                    ${sent
                        ? '<span class="att-alert-sent"><i class="fa-solid fa-circle-check"></i> Alert sent</span>'
                        : `<button class="ett-tool-btn att-primary" onclick="attSendAlert('${r.id}')"><i class="fa-solid fa-paper-plane"></i> Send Alert</button>`}
                </div>
            </div>`;
        }).join('');
    }

    function isAlertSent(rec) {
        return (store.messages || []).some(m => m.category === 'attendance' && m.studentId === rec.studentId && m.date === rec.date);
    }

    function pushAlertMessage(rec) {
        const student = StudentRepo.getById(rec.studentId);
        if (!student) return false;
        const msg = `Alert: Your child, ${student.name}, was marked ${rec.status.toUpperCase()} from class today${rec.subjectName ? ' (' + rec.subjectName + ')' : ''}${rec.note ? ' — ' + rec.note : ''}.`;
        store.messages = store.messages || [];
        store.messages.push({
            id: generateId(),
            to: student.guardianName || 'Parent/Guardian',
            from: (CURRENT_USER && CURRENT_USER.name) || 'School',
            subject: 'Attendance Alert — ' + student.name,
            body: msg,
            date: new Date().toISOString(),
            folder: 'sent',
            read: false,
            category: 'attendance',
            studentId: student.id,
            recDate: rec.date
        });
        return true;
    }

    function attSendAlert(recId) {
        const rec = (store.attendance || []).find(r => r.id === recId);
        if (!rec) return showToast('Record not found.', 'error');
        const student = StudentRepo.getById(rec.studentId);
        if (!student) return showToast('Learner not found.', 'error');
        if (isAlertSent(rec)) return showToast('Alert for this learner was already sent.', 'info');

        pushAlertMessage(rec);
        saveData();
        showToast(`Alert sent to ${student.guardianName || 'guardian'} (SMS & School App).`, 'success');
        renderAlerts();
        updateAlertsBadge();
    }

    function attSendAll() {
        const date = val('attAlertsDate') || todayISO();
        const unsent = dedupeRecords((store.attendance || []).filter(r => r.date === date && (r.status === 'absent' || r.status === 'late'))).filter(r => !isAlertSent(r));
        if (!unsent.length) return showToast('No unsent alerts for this date.', 'info');
        confirmAction(`Send ${unsent.length} attendance alert${unsent.length > 1 ? 's' : ''} to guardians?`, () => {
            let sent = 0;
            unsent.forEach(r => { if (pushAlertMessage(r)) sent++; });
            saveData();
            showToast(`${sent} alert${sent !== 1 ? 's' : ''} sent via SMS & School App.`, 'success');
            renderAlerts();
            updateAlertsBadge();
        });
    }

    function updateAlertsBadge() {
        const badge = $id('attAlertsBadge');
        if (!badge) return;
        const today = recordedDates()[0] || todayISO();
        const unsent = dedupeRecords((store.attendance || []).filter(r => r.date === today && (r.status === 'absent' || r.status === 'late'))).filter(r => !isAlertSent(r)).length;
        badge.style.display = unsent ? '' : 'none';
        badge.textContent = unsent;
    }

    /* ── sync chip ── */
    function setSync(text, ok) {
        const chip = $id('attSyncChip');
        if (!chip) return;
        const label = $id('attSyncText');
        if (label) label.textContent = text;
        chip.classList.toggle('ok', !!ok);
        chip.classList.toggle('busy', text.includes('…'));
    }

    /* ── expose API ── */
    window.initAttendanceSection = initAttendanceSection;
    window.switchAttendanceTab = (t) => { state.tab = t; renderActiveTab(); };
    window.attSetStatus = (studentId, status, btn) => {
        if (!canDo('scoresEdit')) return showToast('You have view-only access to attendance.', 'error');
        const row = btn.closest('.att-row');
        if (!row) return;
        row.querySelectorAll('.att-btn').forEach(b => b.classList.toggle('active', b === btn));
    };
    window.attSave = attSave;
    window.attMarkAll = attMarkAll;
    window.attSendAlert = attSendAlert;
    window.attSendAll = attSendAll;
    // exposed for unit tests
    window.__attInternals = { dedupeRecords, last7RecordedDays, sessionKey, existingFor };
})();
