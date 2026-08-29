'use strict';
/* ==========================================================================
 *   ELIMUTRACK — PARENT PORTAL (parent.js)
 *   Dedicated parent dashboard (mobile-app concept):
 *     · gradient header — child photo, name, grade/class, bell + profile icons
 *     · status cards — Today's Attendance, Fee Balance, Latest Exam Average
 *     · attendance calendar — month grid with colored day dots + legend
 *     · exam results — recent per-subject scores + performance trend chart
 *       (Chart.js) + "View Report Card" modal with CBC ratings & print
 *     · fees & payments — outstanding balance, statements / history, Pay Now
 *     · messages & alerts + recent alerts feed
 *     · bottom nav — Home / Assignments / Notifications / More
 *   Parents sign in with the child's ADM + password; /api/db returns the
 *   single linked learner in store.students[0].
 *   Loaded AFTER script.js — reuses store, StudentRepo, escapeHtml, showToast,
 *   openModal, closeModal, cbcRating, canDo, saveData, logout.
 * ========================================================================== */

(function () {
    if (window.__PAR_LOADED__) return;
    window.__PAR_LOADED__ = true;

    const state = { month: new Date(), view: 'home', trendChart: null, insightsChart: null, previewStudentId: '' };
    const $id = (i) => document.getElementById(i);
    const esc = (x) => escapeHtml(x);
    const todayISO = () => new Date().toISOString().slice(0, 10);
    const iso = (d) => new Date(d).toISOString().slice(0, 10);
    const fmtShort = (d) => { const dt = new Date(d); return isNaN(dt) ? d : dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }); };
    const STATUS = { present: { c: '#16a34a', l: 'Present' }, absent: { c: '#dc2626', l: 'Absent' }, late: { c: '#d97706', l: 'Late' } };

    // Staff (admin/HOI/Deputy) can open the portal in PREVIEW mode to see any learner's view
    const previewMode = () => typeof getCurrentRole === 'function' && getCurrentRole() !== 'parent';
    function child() {
        const list = store.students || [];
        if (previewMode()) {
            const pick = state.previewStudentId ? list.find(s => s.id === state.previewStudentId) : null;
            return pick || list[0] || null;
        }
        // Parent session: the server already returns ONLY the linked learner,
        // but pin to the signed-in identity so the "particular student" is
        // always the one whose credentials were used — even if the list order
        // ever changes or multiple learners share a record set.
        const me = (typeof CURRENT_USER !== 'undefined' && CURRENT_USER) || {};
        const pid = me.studentId || me.id;
        if (pid) {
            const match = list.find(s => s.id === pid);
            if (match) return match;
        }
        return list[0] || null;
    }

    /* ── child data helpers ── */
    function childAttendance() {
        const c = child();
        if (!c) return [];
        return (store.attendance || []).filter(r => r.studentId === c.id);
    }
    function statusOn(date) {
        const recs = childAttendance().filter(r => r.date === date);
        // whole-day record preferred
        const rec = recs.find(r => !r.subjectId) || recs[0];
        return rec ? rec.status : '';
    }
    // FIXED (parents portal): the parent data branch of /api/db returns the
    // learner's assessments in `exams` (Assessment Centre wrappers) and leaves
    // `examSchedules` empty — the portal used to read examSchedules ONLY, so
    // parents always saw "No assessments found". Merge BOTH sources (deduped
    // by id) so the portal shows the child's real assessment records.
    function parentAssessments() {
        const c = child();
        if (!c) return [];
        const map = {};
        const parseScores = (a) => {
            if (a.scores && typeof a.scores === 'string') {
                try { a.scores = JSON.parse(a.scores); } catch (_) { a.scores = {}; }
            }
            if (!a.scores || typeof a.scores !== 'object') a.scores = {};
            return a;
        };
        // Assessment Centre wrappers (the primary source for parents).
        // FIXED: ALL assessments for the child's grade are included — with or
        // without scores ("results pending" shows) — and any wrapper that
        // holds scores keyed to THIS learner is kept even if its grade field
        // is missing/mismatched. Stray flat score rows are skipped.
        (store.exams || []).forEach(a => {
            if (!a || (a.studentId && !a.name && !a.assessType)) return;
            const isWrapper = a.type === 'assessment' || a.assessType || a.name;
            if (!isWrapper) return;
            a = parseScores(a);
            const childKey = c.id + '_';
            const hasChildScores = a.scores && typeof a.scores === 'object' && Object.keys(a.scores).some(k => k.startsWith(childKey));
            if (a.grade && a.grade !== c.grade && !hasChildScores) return;
            const id = a.id || a.virtualId || (a.name + '|' + a.assessType + '|' + a.term + '|' + a.year);
            map[id] = { ...a, name: a.name || a.assessName || 'Assessment', type: a.assessType || a.type || 'Exam' };
        });
        // Exam-timetable series (secondary source — non-empty for staff/preview)
        (store.examSchedules || []).forEach(a => {
            if (!a || (a.grade && a.grade !== c.grade)) return;
            a = parseScores(a);
            map[a.id] = { ...a, name: a.name || 'Assessment', type: a.type || a.assessType || 'Exam' };
        });
        return Object.values(map)
            .sort((a, b) => String(b.startDate || b.createdAt || b.updatedAt || '').localeCompare(String(a.startDate || a.createdAt || a.updatedAt || '')));
    }
    function latestAssessments(limit) {
        const c = child();
        if (!c) return [];
        return parentAssessments().slice(0, limit || 6);
    }
    function childScore(assessment, subjectId) {
        const c = child();
        const key = `${c.id}_${subjectId}`;
        const v = (assessment.scores || {})[key];
        return v && v.score !== undefined ? parseFloat(v.score) : null;
    }
    function childAvg(assessment) {
        const subs = (assessment.subjects || []).map(sid => getSubjectById(sid)).filter(Boolean);
        const vals = subs.map(s => childScore(assessment, s.id)).filter(v => v !== null);
        return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null;
    }
    function classAvg(assessment) {
        const subs = (assessment.subjects || []).map(sid => getSubjectById(sid)).filter(Boolean);
        let sum = 0, n = 0;
        (store.students || []).forEach(st => {
            subs.forEach(s => {
                const v = (assessment.scores || {})[`${st.id}_${s.id}`];
                if (v && v.score !== undefined) { sum += parseFloat(v.score); n++; }
            });
        });
        return n ? Math.round(sum / n) : null;
    }
    function feeInfo() {
        const c = child();
        const fr = (store.fees || []).find(f => f.studentId === c.id);
        if (fr && fr.balance !== undefined) return { balance: fr.balance, status: fr.status || 'pending', payments: fr.payments || [] };
        if (c && c.feeStatus) return { balance: null, status: c.feeStatus, payments: [] };
        return { balance: null, status: null, payments: [] };
    }

    /* ═══════════════════════════════════════════════════════════════
     *   INIT
     * ═══════════════════════════════════════════════════════════════ */
    function initParentSection() {
        if (!document.getElementById('parViewHome')) return;
        if (previewMode()) {
            state.previewStudentId = state.previewStudentId || ((store.students || [])[0] || {}).id || '';
            if (!child()) {
                $id('parViewHome').innerHTML = '<div class="par-empty"><i class="fa-solid fa-users-slash"></i><h4>No learners to preview</h4><p>Add learners first — the parent portal preview shows each child\'s view.</p></div>';
                return;
            }
            renderHeader();
            renderStatusCards();
            parentGo('home');
            updateBellBadge();
            return;
        }
        if (!child()) {
            // Unlinked parent — offer self-linking right here (ADM + guardian phone)
            $id('parViewHome').innerHTML = `
                <div class="par-card par-link-card">
                    <div class="par-card-head"><h4><i class="fa-solid fa-link"></i> Link your child</h4></div>
                    <p class="par-empty-note">Enter the learner's ADM / NEMIS / UPI number and the guardian phone number <b>on file with the school</b> to open their dashboard. Ask the school for the access password if you need one.</p>
                    <input type="text" class="att-note-input" id="parLinkAdm" placeholder="Learner ADM / NEMIS / UPI (e.g. ADM-0237)" style="margin-bottom:7px;">
                    <input type="tel" class="att-note-input" id="parLinkPhone" placeholder="Guardian phone on file (e.g. 0712 345 678)" style="margin-bottom:10px;">
                    <button class="par-btn-pay" onclick="parLinkChild()"><i class="fa-solid fa-link"></i> Link &amp; Open Dashboard</button>
                    <p class="par-empty-note" style="margin-top:8px;">Prefer the school to do it? Ask them to set the Parent Access password on your child's profile — you can then sign in with the child's name + admission number.</p>
                </div>`;
            return;
        }
        renderHeader();
        renderStatusCards();
        parentGo('home');
        updateBellBadge();
    }

    /* ── header ── */
    function renderHeader() {
        const c = child();
        if (!c) return;
        const nameEl = $id('parStudentName'), gradeEl = $id('parStudentGrade');
        if (nameEl) nameEl.textContent = c.name || '—';
        if (gradeEl) gradeEl.textContent = `${c.grade || ''}${c.stream ? ' — Class ' + c.stream : ''}`.trim();
        const photo = $id('parPhoto'), init = $id('parAvatarInit');
        if (c.photo) {
            photo.src = c.photo;
            photo.style.display = '';
            if (init) init.style.display = 'none';
        } else if (init) {
            init.textContent = (c.name || '?').charAt(0).toUpperCase();
        }
        // Preview mode: learner picker for staff (admin/HOI/Deputy)
        const bar = $id('parPreviewBar'), pick = $id('parPreviewPicker');
        if (bar && pick) {
            if (previewMode()) {
                const cur = state.previewStudentId;
                pick.innerHTML = (store.students || []).map(st =>
                    `<option value="${st.id}" ${st.id === cur ? 'selected' : ''}>${esc(st.name)} — ${esc(st.grade || '')}${st.stream ? ' ' + esc(st.stream) : ''}</option>`).join('');
                bar.style.display = '';
            } else {
                bar.style.display = 'none';
            }
        }
    }

    /* ── status cards ── */
    function renderStatusCards() {
        const wrap = $id('parStatusCards');
        if (!wrap) return;
        const c = child();
        const today = statusOn(todayISO());
        const st = STATUS[today] || { c: '#64748b', l: 'Not marked' };
        const fee = feeInfo();
        const balance = fee.balance !== null ? `KES ${Number(fee.balance).toLocaleString()}` : (fee.status || '—');
        const latest = latestAssessments(1)[0];
        const avg = latest ? childAvg(latest) : null;
        wrap.innerHTML = `
            <div class="par-status-card">
                <span class="par-ss-ic" style="background:${today ? st.c + '22' : '#f1f5f9'};color:${today ? st.c : '#64748b'};"><i class="fa-solid fa-${today === 'absent' ? 'xmark' : 'check'}"></i></span>
                <div><small>Today's Attendance</small><b style="color:${today ? st.c : '#64748b'};">${st.l}</b></div>
            </div>
            <div class="par-status-card">
                <span class="par-ss-ic" style="background:rgba(234,88,12,0.12);color:#ea580c;"><i class="fa-solid fa-coins"></i></span>
                <div><small>Fee Balance</small><b class="${fee.status && /clear|paid/i.test(fee.status) ? '' : 'par-fee-due'}">${esc(balance)}</b></div>
            </div>
            <div class="par-status-card">
                <span class="par-ss-ic" style="background:rgba(34,197,94,0.12);color:#16a34a;"><i class="fa-solid fa-star"></i></span>
                <div><small>Latest Exam Average</small><b>${avg !== null ? avg + '%' : '—'}</b></div>
            </div>`;
    }

    /* ═══════════════════════════════════════════════════════════════
     *   VIEW SWITCHING (bottom nav)
     * ═══════════════════════════════════════════════════════════════ */
    function parentGo(view) {
        state.view = view;
        ['home', 'assignments', 'notifications', 'more'].forEach(v => {
            const el = $id('parView' + v.charAt(0).toUpperCase() + v.slice(1));
            if (el) el.style.display = v === view ? '' : 'none';
        });
        document.querySelectorAll('.par-nav-btn').forEach(b => b.classList.toggle('active', b.dataset.parnav === view));
        if (view === 'home') renderHome();
        else if (view === 'assignments') renderAssignments();
        else if (view === 'notifications') renderNotifications();
        else renderMore();
        updateBellBadge();
    }

    /* ═══════════════════════════════════════════════════════════════
     *   HOME VIEW
     * ═══════════════════════════════════════════════════════════════ */
    function renderHome() {
        const el = $id('parViewHome');
        if (!el) return;
        el.innerHTML = `
            <div class="par-grid">
                <div class="par-card par-card-attendance">
                    <div class="par-card-head">
                        <h4><i class="fa-solid fa-calendar-days"></i> Attendance</h4>
                        <div class="par-month-nav">
                            <button onclick="parentNavMonth(-1)" title="Previous month"><i class="fa-solid fa-chevron-left"></i></button>
                            <span id="parMonthLabel">${state.month.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</span>
                            <button onclick="parentNavMonth(1)" title="Next month"><i class="fa-solid fa-chevron-right"></i></button>
                        </div>
                    </div>
                    <div id="parCalendar" class="par-cal"></div>
                    <div id="parCalLegend" class="par-cal-legend"></div>
                </div>

                <div class="par-card par-card-exams">
                    <div class="par-card-head">
                        <h4><i class="fa-solid fa-file-circle-check"></i> Exam Results</h4>
                        <span class="par-card-tag" id="parExamTag"></span>
                    </div>
                    <!-- FIXED: every assessment for the child is listed as a chip -->
                    <div class="par-exam-tabs" id="parExamTabs"></div>
                    <div class="par-scores" id="parScores"></div>
                    <div class="par-chart-wrap"><canvas id="parTrendChart"></canvas><div id="parTrendEmpty" class="par-chart-empty" style="display:none;"><i class="fa-solid fa-chart-line"></i><p>No scores yet — check back after the next assessment.</p></div></div>
                    <button class="par-btn-primary" onclick="parentOpenReport()"><i class="fa-solid fa-file-arrow-down"></i> View Report Card</button>
                </div>

                <div class="par-card par-card-fees">
                    <div class="par-card-head"><h4><i class="fa-solid fa-coins"></i> Fees &amp; Payments</h4></div>
                    <div class="par-fee-bar"><span>Outstanding Balance</span><b id="parFeeBalance">—</b></div>
                    <div class="par-fee-links">
                        <button class="par-link" onclick="parentOpenPayments('statements')"><i class="fa-solid fa-file-invoice"></i> View Statements</button>
                        <button class="par-link" onclick="parentOpenPayments('history')"><i class="fa-solid fa-clock-rotate-left"></i> Payment History</button>
                    </div>
                    <button class="par-btn-pay" onclick="parentPayNow()"><i class="fa-solid fa-mobile-screen-button"></i> Pay Now</button>
                </div>

                <div class="par-card par-card-messages">
                    <div class="par-card-head"><h4><i class="fa-solid fa-envelope-open-text"></i> Messages &amp; Alerts</h4></div>
                    <div class="par-msg-list" id="parMsgList"></div>
                    <button class="par-link par-link-center" onclick="parentGo('notifications')">View all <i class="fa-solid fa-chevron-right"></i></button>
                </div>

                <div class="par-card par-card-insights">
                    <div class="par-card-head"><h4><i class="fa-solid fa-chart-pie"></i> Insights</h4><span class="par-card-tag" id="parInsightTag"></span></div>
                    <div class="par-insights">
                        <div class="par-donut-wrap">
                            <canvas id="parDonutChart" height="150"></canvas>
                            <div class="par-donut-center" id="parDonutCenter">0%</div>
                        </div>
                        <div class="par-rings">
                            <div class="par-ring" id="parRingAttendance"><span id="parRingAttendanceVal">0%</span><small>Attendance</small></div>
                            <div class="par-ring" id="parRingExam"><span id="parRingExamVal">—</span><small>Exam Avg</small></div>
                        </div>
                        <div class="par-subject-bars" id="parSubjectBars"></div>
                    </div>
                </div>

                <div class="par-card par-card-alerts">
                    <div class="par-card-head"><h4><i class="fa-solid fa-bell"></i> Recent Alerts</h4></div>
                    <div class="par-alerts-feed" id="parAlertsFeed"></div>
                </div>
            </div>`;
        renderCalendar();
        renderExamBlock();
        renderFeesBlock();
        renderMessagesBlock();
        renderAlertsFeed();
        renderInsights();
    }

    /* ── Insights: attendance donut + progress rings + subject bars ── */
    function renderInsights() {
        const tag = $id('parInsightTag'), center = $id('parDonutCenter'),
            ringA = $id('parRingAttendance'), ringE = $id('parRingExam'), bars = $id('parSubjectBars');
        if (!tag || !center || !ringA || !ringE || !bars) return;

        // month attendance stats
        const y = state.month.getFullYear(), m = state.month.getMonth();
        const monthKey = `${y}-${String(m + 1).padStart(2, '0')}`;
        const monthRecs = childAttendance().filter(r => String(r.date || '').startsWith(monthKey));
        const cnt = { present: 0, absent: 0, late: 0 };
        // one mark per learner per day (whole-day preferred)
        const byDay = {};
        monthRecs.forEach(r => {
            if (!r.studentId || !r.date) return;
            const key = r.studentId + '__' + r.date;
            const cur = byDay[key];
            if (!cur || (!r.subjectId && cur.subjectId)) byDay[key] = r;
        });
        Object.values(byDay).forEach(r => { if (cnt[r.status] !== undefined) cnt[r.status]++; });
        const total = cnt.present + cnt.absent + cnt.late;
        const rate = total ? Math.round(((cnt.present + cnt.late) / total) * 100) : 0;
        tag.textContent = state.month.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
        center.textContent = total ? rate + '%' : '—';

        // donut chart (Chart.js) — fall back to conic gradient if unavailable
        const canvas = $id('parDonutChart');
        if (canvas && typeof Chart !== 'undefined') {
            if (state.insightsChart) state.insightsChart.destroy();
            state.insightsChart = new Chart(canvas, {
                type: 'doughnut',
                data: {
                    labels: ['Present', 'Absent', 'Late'],
                    datasets: [{
                        data: [cnt.present, cnt.absent, cnt.late],
                        backgroundColor: ['#16a34a', '#dc2626', '#d97706'],
                        borderWidth: 0, hoverOffset: 6
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    cutout: '70%',
                    plugins: { legend: { position: 'bottom', labels: { boxWidth: 9, font: { size: 9 } } } }
                }
            });
        } else if (canvas && total) {
            canvas.style.background = `conic-gradient(#16a34a ${cnt.present / total * 360}deg, #d97706 ${cnt.present / total * 360}deg ${(cnt.present + cnt.late) / total * 360}deg, #dc2626 ${(cnt.present + cnt.late) / total * 360}deg 360deg)`;
        }

        // progress rings
        ringA.style.background = total ? `conic-gradient(#22c55e ${rate * 3.6}deg, rgba(148,163,184,0.15) 0deg)` : 'rgba(148,163,184,0.15)';
        $id('parRingAttendanceVal').textContent = total ? rate + '%' : '—';
        const latest = latestAssessments(10).find(a => a.status === 'closed');
        const avg = latest ? childAvg(latest) : null;
        if (avg !== null) {
            ringE.style.background = `conic-gradient(#f97316 ${avg * 3.6}deg, rgba(148,163,184,0.15) 0deg)`;
            $id('parRingExamVal').textContent = avg + '%';
        } else {
            ringE.style.background = 'rgba(148,163,184,0.15)';
            $id('parRingExamVal').textContent = '—';
        }

        // per-subject bars for the latest closed assessment
        if (latest) {
            const subs = (latest.subjects || []).map(sid => getSubjectById(sid)).filter(Boolean);
            const rows = subs.map(su => {
                const v = childScore(latest, su.id);
                if (v === null) return '';
                const color = v >= 80 ? '#16a34a' : v >= 50 ? '#d97706' : '#dc2626';
                return `<div class="par-subj-row"><span class="par-subj-name">${esc(su.name)}</span>
                    <span class="par-subj-track"><i style="width:${Math.min(100, v)}%;background:${color};"></i></span>
                    <b class="par-subj-val" style="color:${color};">${v}</b></div>`;
            }).filter(Boolean).join('');
            bars.innerHTML = `<div class="par-subj-title">${esc(latest.name || 'Latest exam')}</div>` + (rows || '<p class="par-empty-note">No scores yet.</p>');
        } else {
            bars.innerHTML = '<p class="par-empty-note">No closed assessment yet — results appear here.</p>';
        }
    }

    /* ── exam results: switch the shown assessment ── */
    window.parentPickAssessment = function (id) {
        state.activeAssessId = id;
        renderExamBlock();
    };

    /* ── attendance calendar ── */
    function parentNavMonth(delta) {
        state.month.setMonth(state.month.getMonth() + delta);
        renderCalendar();
        const label = $id('parMonthLabel');
        if (label) label.textContent = state.month.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    }

    function renderCalendar() {
        const el = $id('parCalendar');
        if (!el) return;
        const year = state.month.getFullYear(), month = state.month.getMonth();
        const first = new Date(year, month, 1);
        const startDow = (first.getDay() + 6) % 7; // Monday-first
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        let counts = { present: 0, absent: 0, late: 0 };
        let cells = '';
        for (let i = 0; i < startDow; i++) cells += '<div class="par-cal-cell ghost"></div>';
        for (let d = 1; d <= daysInMonth; d++) {
            const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const status = statusOn(date);
            if (status && STATUS[status]) counts[status]++;
            const isToday = date === todayISO();
            const cls = status ? `dot-${status}` : '';
            cells += `<div class="par-cal-cell ${isToday ? 'today' : ''}">
                <span class="par-cal-day">${d}</span>
                ${status ? `<span class="par-cal-dot ${cls}" title="${STATUS[status].l}"></span>` : ''}
            </div>`;
        }
        el.innerHTML = `
            <div class="par-cal-dows">${['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(x => `<span>${x}</span>`).join('')}</div>
            <div class="par-cal-grid">${cells}</div>`;
        const legend = $id('parCalLegend');
        if (legend) {
            const n = counts.present + counts.absent + counts.late;
            legend.innerHTML = n ? `
                <span><i class="par-leg-dot" style="background:#16a34a;"></i> Present: ${counts.present} day${counts.present !== 1 ? 's' : ''}</span>
                <span><i class="par-leg-dot" style="background:#dc2626;"></i> Absent: ${counts.absent} day${counts.absent !== 1 ? 's' : ''}</span>
                <span><i class="par-leg-dot" style="background:#d97706;"></i> Late: ${counts.late} day${counts.late !== 1 ? 's' : ''}</span>` :
                '<span class="par-leg-none">No attendance marked this month</span>';
        }
    }

    /* ── exam results + trend ── */
    function renderExamBlock() {
        const tag = $id('parExamTag');
        const scores = $id('parScores');
        const canvas = $id('parTrendChart');
        const empty = $id('parTrendEmpty');
        const tabs = $id('parExamTabs');
        if (!tag || !scores || !canvas || !empty) return;
        // FIXED: every assessment for the child is fetched and listed as a
        // clickable chip; the card shows the scores of the selected one.
        const all = parentAssessments();
        if (!state.activeAssessId && all.length) state.activeAssessId = all[0].id;
        const active = all.find(a => a.id === state.activeAssessId) || all[0] || null;
        if (tabs) {
            tabs.innerHTML = all.slice(0, 12).map(a => {
                const on = active && a.id === active.id;
                return `<button class="par-exam-tab${on ? ' active' : ''}" onclick="parentPickAssessment('${String(a.id).replace(/'/g, '&#39;')}')">${esc((a.name || a.type || 'Exam').slice(0, 16))}</button>`;
            }).join('');
        }
        if (tag) tag.textContent = active ? (active.name || active.type || 'Latest') : 'No assessments';
        if (active) {
            const subs = (active.subjects || []).map(sid => getSubjectById(sid)).filter(Boolean);
            const rows = subs.map(s => {
                const v = childScore(active, s.id);
                if (v === null) return '';
                const color = v >= 80 ? '#16a34a' : v >= 50 ? '#d97706' : '#dc2626';
                return `<div class="par-score-row">
                    <span class="par-score-subj">${esc(s.name)}</span>
                    <span class="par-score-val" style="color:${color};">${v}</span>
                    <span class="par-score-bar"><i style="width:${Math.min(100, v)}%;background:${color};"></i></span>
                </div>`;
            }).filter(Boolean).join('');
            scores.innerHTML = rows || '<p class="par-empty-note">No scores recorded for this assessment yet.</p>';
        } else {
            scores.innerHTML = '<p class="par-empty-note">No assessments found for this class.</p>';
        }

        // Trend chart: child avg (line) vs class avg (bars) across assessments
        const assessments = latestAssessments(6).reverse();
        const labels = assessments.map(a => (a.name || a.type || 'Exam').replace(/\s+/g, ' ').slice(0, 14));
        const childAvgs = assessments.map(a => childAvg(a));
        const classAvgs = assessments.map(a => classAvg(a));
        const hasData = childAvgs.some(v => v !== null);
        if (!hasData) {
            empty.style.display = '';
            if (state.trendChart) { state.trendChart.destroy(); state.trendChart = null; }
            return;
        }
        empty.style.display = 'none';
        if (typeof Chart === 'undefined') return;
        if (state.trendChart) state.trendChart.destroy();
        state.trendChart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    { type: 'bar', label: 'Class avg', data: classAvgs, backgroundColor: 'rgba(59,130,246,0.25)', borderColor: 'rgba(59,130,246,0.6)', borderWidth: 1, borderRadius: 6 },
                    { type: 'line', label: 'My child', data: childAvgs, borderColor: '#f97316', backgroundColor: '#f97316', tension: 0.35, pointRadius: 4, pointBackgroundColor: '#f97316', borderWidth: 2 }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } },
                scales: { y: { beginAtZero: true, max: 100, grid: { color: 'rgba(0,0,0,0.05)' } }, x: { grid: { display: false } } }
            }
        });
    }

    /* ── fees ── */
    function renderFeesBlock() {
        const bal = $id('parFeeBalance');
        if (bal) {
            const fee = feeInfo();
            if (fee.balance !== null) bal.textContent = `KES ${Number(fee.balance).toLocaleString()}`;
            else if (fee.status) bal.textContent = fee.status;
            else bal.textContent = 'KES 0';
        }
    }

    function parentOpenPayments(kind) {
        const fee = feeInfo();
        const title = kind === 'statements' ? 'Fee Statements' : 'Payment History';
        $id('parPaymentsTitle').innerHTML = `<i class="fa-solid fa-receipt"></i> ${title}`;
        const body = $id('parPaymentsBody');
        const rows = fee.payments || [];
        body.innerHTML = rows.length ? `
            <table class="s-table"><thead><tr><th>Date</th><th>Description</th><th>Method</th><th style="text-align:right;">Amount</th></tr></thead>
            <tbody>${rows.map(p => `
                <tr><td>${esc(fmtShort(p.date) || '—')}</td><td>${esc(p.desc || p.description || 'Payment')}</td><td>${esc(p.method || '—')}</td><td style="text-align:right;font-weight:600;color:#16a34a;">KES ${Number(p.amount || 0).toLocaleString()}</td></tr>`).join('')}</tbody></table>`
            : `<div class="par-empty"><i class="fa-solid fa-receipt"></i><h4>${fee.balance !== null ? 'No payments recorded' : 'Payment records are managed by the school'}</h4><p>${fee.balance !== null ? 'Statements will appear here once the school posts them.' : 'Ask the school to enable the fees module.'}</p></div>`;
        openModal('parPaymentsModal');
    }

    function parentPayNow() {
        const fee = feeInfo();
        const amt = fee.balance !== null ? `KES ${Number(fee.balance).toLocaleString()}` : 'KES 0';
        showToast(`Pay ${amt} — MPESA paybill integration coming soon. The school can record payments for now.`, 'info');
    }

    /* ── messages + alerts ── */
    // FIXED (alert leakage): attendance alerts are LEARNER-SPECIFIC. If the
    // message carries a studentId it must match THIS child; if the binding is
    // missing (legacy/unsynced rows) the alert is only shown when it names
    // this learner's guardian — never blanket-shown to every parent.
    function childMessages() {
        const c = child();
        return (store.messages || []).filter(m => {
            if (m.studentId) return m.studentId === c.id;   // bound to this learner
            const to = String(m.to || '');
            const guardMatch = !!(c.guardianName && to.toLowerCase().includes(String(c.guardianName).toLowerCase()));
            const generic = /^(parent|guardian)/i.test(to.trim()); // "Parent" / "Parent of X…"
            const isAttendanceAlert = m.category === 'attendance' ||
                /Attendance Alert/i.test(m.subject || '') ||
                /marked (absent|late)/i.test(m.body || '');
            if (isAttendanceAlert) return guardMatch;       // only that learner's guardian
            return guardMatch || generic;                   // other mail: guardian or school-wide
        }).sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
    }
    const MSG_ICON = { attendance: { ic: 'fa-triangle-exclamation', c: '#dc2626' }, exam: { ic: 'fa-star', c: '#16a34a' }, fee: { ic: 'fa-coins', c: '#ea580c' }, school: { ic: 'fa-school', c: '#3b82f6' } };
    function msgRow(m, showDate) {
        const cat = MSG_ICON[m.category] || MSG_ICON.school;
        const when = m.date ? new Date(m.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '';
        return `<div class="par-msg-row">
            <span class="par-msg-ic" style="background:${cat.c}1a;color:${cat.c};"><i class="fa-solid ${cat.ic}"></i></span>
            <div class="par-msg-body"><p>${esc(m.body || m.subject || '')}</p><small>${esc(when)}${showDate ? ' · ' + esc(m.subject || '') : ''}</small></div>
        </div>`;
    }
    function renderMessagesBlock() {
        const el = $id('parMsgList');
        if (!el) return;
        const msgs = childMessages().slice(0, 4);
        el.innerHTML = msgs.length ? msgs.map(m => msgRow(m, false)).join('')
            : '<p class="par-empty-note">No messages yet.</p>';
    }
    function renderAlertsFeed() {
        const el = $id('parAlertsFeed');
        if (!el) return;
        const msgs = childMessages().slice(0, 5);
        el.innerHTML = msgs.length ? msgs.map(m => msgRow(m, true)).join('')
            : '<p class="par-empty-note">No alerts yet — everything is quiet.</p>';
    }

    /* ═══════════════════════════════════════════════════════════════
     *   ASSIGNMENTS VIEW
     * ═══════════════════════════════════════════════════════════════ */
    function renderAssignments() {
        const el = $id('parViewAssignments');
        if (!el) return;
        const assessments = latestAssessments(10);
        if (!assessments.length) {
            el.innerHTML = '<div class="par-empty"><i class="fa-solid fa-book-open"></i><h4>No assessments yet</h4><p>Assessment results will appear here after each exam.</p></div>';
            return;
        }
        el.innerHTML = `<h3 class="par-view-title"><i class="fa-solid fa-book-open"></i> Assignments & Assessments</h3>` +
            assessments.map(a => {
                const subs = (a.subjects || []).map(sid => getSubjectById(sid)).filter(Boolean);
                const rows = subs.map(s => {
                    const v = childScore(a, s.id);
                    if (v === null) return '';
                    const rating = cbcRating(v);
                    return `<tr>
                        <td>${esc(s.name)}</td>
                        <td style="text-align:center;font-weight:700;">${v}</td>
                        <td style="text-align:center;"><span class="par-rating-chip" style="background:${rating.color}22;color:${rating.color};">${rating.code} · ${rating.text}</span></td>
                    </tr>`;
                }).filter(Boolean).join('');
                const avg = childAvg(a);
                return `<div class="par-assign-card">
                    <div class="par-assign-head"><strong>${esc(a.name || a.type || 'Assessment')}</strong><span class="par-card-tag">${esc(a.type || '')} · ${esc(a.term || '')} ${esc(a.year || '')}</span></div>
                    ${rows ? `<table class="s-table"><thead><tr><th>Subject</th><th style="text-align:center;">Score</th><th style="text-align:center;">Rating</th></tr></thead><tbody>${rows}</tbody></table>` : '<p class="par-empty-note">No scores for this assessment yet.</p>'}
                    ${avg !== null ? `<div class="par-assign-avg">Average: <b>${avg}%</b></div>` : ''}
                </div>`;
            }).join('');
    }

    /* ═══════════════════════════════════════════════════════════════
     *   NOTIFICATIONS VIEW
     * ═══════════════════════════════════════════════════════════════ */
    function renderNotifications() {
        const el = $id('parViewNotifications');
        if (!el) return;
        const msgs = childMessages();
        el.innerHTML = `<h3 class="par-view-title"><i class="fa-solid fa-bell"></i> Notifications (${msgs.length})</h3>` +
            (msgs.length ? `<div class="par-notif-list">${msgs.map(m => msgRow(m, true)).join('')}</div>`
                : '<div class="par-empty"><i class="fa-solid fa-bell-slash"></i><h4>No notifications</h4><p>Messages from the school will appear here.</p></div>');
    }
    function updateBellBadge() {
        const badge = $id('parBellBadge');
        if (!badge) return;
        const unread = childMessages().filter(m => !m.read).length;
        badge.style.display = unread ? '' : 'none';
        badge.textContent = unread;
    }

    /* ═══════════════════════════════════════════════════════════════
     *   MORE VIEW
     * ═══════════════════════════════════════════════════════════════ */
    function renderMore() {
        const el = $id('parViewMore');
        if (!el) return;
        const c = child();
        const user = CURRENT_USER || {};
        if (!c) {
            if (previewMode()) {
                el.innerHTML = `
                    <h3 class="par-view-title"><i class="fa-solid fa-circle-user"></i> Account</h3>
                    <div class="par-card">
                        <div class="par-more-row"><label>Staff</label><span>${esc(user.name || '—')}</span></div>
                        <div class="par-more-row"><label>Email</label><span>${esc(user.email || '—')}</span></div>
                    </div>
                    <div class="par-card"><p class="par-empty-note">No learners to preview yet.</p>
                        <button class="par-btn-ghost" onclick="logout()"><i class="fa-solid fa-right-from-bracket"></i> Sign Out</button></div>`;
            } else {
                el.innerHTML = `
                <h3 class="par-view-title"><i class="fa-solid fa-circle-user"></i> Account</h3>
                <div class="par-card">
                    <div class="par-more-row"><label>Guardian</label><span>${esc(user.name || '—')}</span></div>
                    <div class="par-more-row"><label>Email</label><span>${esc(user.email || '—')}</span></div>
                </div>
                <div class="par-card">
                    <p class="par-empty-note" style="margin-bottom:8px;">No learner linked yet — link your child to open their dashboard.</p>
                    <input type="text" class="att-note-input" id="parLinkAdm" placeholder="Learner ADM / NEMIS / UPI" style="margin-bottom:7px;">
                    <input type="tel" class="att-note-input" id="parLinkPhone" placeholder="Guardian phone on file" style="margin-bottom:10px;">
                    <button class="par-btn-pay" onclick="parLinkChild()"><i class="fa-solid fa-link"></i> Link my child</button>
                    <button class="par-btn-ghost" onclick="logout()"><i class="fa-solid fa-right-from-bracket"></i> Sign Out</button>
                </div>`;
            }
            return;
        }
        el.innerHTML = `
            <h3 class="par-view-title"><i class="fa-solid fa-circle-user"></i> Account & Learner</h3>
            <div class="par-card">
                <div class="par-more-row"><label>Guardian</label><span>${esc(user.name || c.guardianName || '—')}</span></div>
                <div class="par-more-row"><label>Child</label><span>${esc(c.name || '—')}</span></div>
                <div class="par-more-row"><label>Grade / Class</label><span>${esc(c.grade || '—')}${c.stream ? ' · ' + esc(c.stream) : ''}</span></div>
                <div class="par-more-row"><label>Admission No</label><span>${esc(c.reg || c.nemisNumber || '—')}</span></div>
                <div class="par-more-row"><label>Date of Birth</label><span>${esc(c.dob || '—')}</span></div>
                <div class="par-more-row"><label>Guardian Phone</label><span>${esc(c.guardianPhone || '—')}</span></div>
            </div>
            <div class="par-card">
                <button class="par-btn-pay" onclick="parentOpenReport()"><i class="fa-solid fa-file-arrow-down"></i> View Report Card</button>
                <button class="par-btn-ghost" onclick="logout()"><i class="fa-solid fa-right-from-bracket"></i> Sign Out</button>
            </div>
            ${previewMode() ? '' : `<div class="par-card par-pass-card">
                <h4 class="par-card-head" style="margin-bottom:8px;"><i class="fa-solid fa-key"></i> Change Login Password</h4>
                <p class="par-empty-note" style="margin-bottom:8px;">Your access password can be changed any time. Login name &amp; admission number are managed by the school.</p>
                <input type="password" class="att-note-input" id="parCurPass" placeholder="Current password" style="margin-bottom:7px;">
                <input type="password" class="att-note-input" id="parNewPass" placeholder="New password (8+ chars, A-Z, a-z, 0-9)" style="margin-bottom:7px;">
                <input type="password" class="att-note-input" id="parConfirmPass" placeholder="Confirm new password" style="margin-bottom:10px;">
                <button class="par-btn-pay" onclick="parChangePassword()"><i class="fa-solid fa-rotate"></i> Update Password</button>
            </div>`}`;
    }

    /* ═══════════════════════════════════════════════════════════════
     *   REPORT CARD MODAL
     * ═══════════════════════════════════════════════════════════════ */
    function parentOpenReport() {
        const c = child();
        const s = store.settings || {};
        // Report cards are only shown for CLOSED assessments (closed by the Exam Chair)
        const latest = latestAssessments(10).find(a => a.status === 'closed');
        const body = $id('parReportBody');
        if (!body) return;
        if (!latest) {
            body.innerHTML = '<div class="par-empty"><i class="fa-solid fa-lock"></i><h4>Report card locked</h4><p>Your child\'s report card becomes available once the school closes the assessment. Check back after results are released.</p></div>';
            openModal('parReportModal');
            return;
        }
        // FIXED: the report card lists EVERY learning area for the child's
        // grade — scored where available, otherwise marked "Not assessed".
        const allAreas = (store.learningAreas || []).filter(la =>
            Array.isArray(la.applicableLevels) ? la.applicableLevels.includes(c.grade) : true);
        const subs = allAreas.length
            ? allAreas
            : (latest.subjects || []).map(sid => getSubjectById(sid)).filter(Boolean);
        const rows = subs.map((su, i) => {
            const v = childScore(latest, su.id);
            const rating = v !== null ? cbcRating(v) : null;
            return `<tr>
                <td class="prc-num">${i + 1}</td>
                <td class="prc-subj">${esc(su.name)}${su.code ? ' <small>' + esc(su.code) + '</small>' : ''}</td>
                <td class="prc-score">${v !== null ? v + '%' : '—'}</td>
                <td class="prc-lvl">${rating ? `<span class="prc-chip" style="background:${rating.color}1f;color:${rating.color};">${rating.code}</span>` : '<span class="prc-chip" style="background:#f1f5f9;color:#94a3b8;">NA</span>'}</td>
                <td class="prc-desc">${rating ? esc(rating.text) : 'Not assessed'}</td>
            </tr>`;
        }).join('');
        const avg = childAvg(latest);
        const gradeLetter = avg !== null ? (avg >= 80 ? 'A' : avg >= 65 ? 'B' : avg >= 50 ? 'C' : avg >= 40 ? 'D' : 'E') : '—';
        const overallRating = avg !== null ? cbcRating(avg) : null;
        const remark = (typeof autoRemark === 'function') ? autoRemark(overallRating ? overallRating.code : null)
            : (overallRating ? overallRating.text : 'No assessment data recorded for this period.');
        const logoHtml = s.logo
            ? `<img class="prc-logo" src="${esc(s.logo)}" alt="logo">`
            : `<div class="prc-logo prc-logo-ph">${esc((s.schoolName || 'S').charAt(0))}</div>`;
        const todayStr = new Date().toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' });

        $id('parReportTitle').innerHTML = `<i class="fa-solid fa-file-lines"></i> Report Card — ${esc(latest.name || latest.type || 'Assessment')}`;
        body.innerHTML = `
        <style>
            .prc-sheet{font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#fff;color:#0f172a;padding:22px 26px;border-radius:14px;border:1px solid #e2e8f0;max-width:820px;margin:0 auto}
            .prc-top{display:flex;align-items:center;gap:14px;border-bottom:3px solid #16a34a;padding-bottom:12px;margin-bottom:12px;flex-wrap:wrap}
            .prc-logo{width:56px;height:56px;border-radius:10px;object-fit:cover;flex-shrink:0}
            .prc-logo-ph{display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#dcfce7,#bbf7d0);color:#15803d;font-size:24px;font-weight:800;border:1px solid #86efac}
            .prc-school{flex:1;min-width:180px}
            .prc-school h2{margin:0;font-size:19px;font-weight:800;color:#0f172a}
            .prc-school p{margin:2px 0 0;font-size:11px;color:#64748b;font-style:italic}
            .prc-meta{font-size:9.5px;color:#64748b;text-align:right;line-height:1.8;flex-shrink:0}
            .prc-meta b{color:#334155}
            .prc-title{background:#1e293b;color:#fff;text-align:center;padding:9px 14px;border-radius:10px;font-size:14px;font-weight:800;letter-spacing:.4px;margin-bottom:12px;display:flex;justify-content:center;gap:8px;flex-wrap:wrap}
            .prc-title em{font-style:normal;font-weight:700;font-size:11px;opacity:.9;align-self:center}
            .prc-info{display:grid;grid-template-columns:repeat(4,1fr);gap:6px 14px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:10px 14px}
            /* FIXED (print): the learner-photo frame lives here too so it
               travels into the print window — without it the photo printed
               unstyled at full size and blew up the layout. */
            .prc-info-wrap{display:flex;gap:14px;align-items:stretch;margin-bottom:14px}
            .prc-info-wrap .prc-info{flex:1;margin-bottom:0}
            .prc-photo-frame{width:84px;height:84px;flex-shrink:0;border-radius:14px;padding:3px;background:#fff;border:1px solid #dbe3ee;box-shadow:0 5px 14px rgba(15,23,42,.10)}
            .prc-photo-frame img{width:100%;height:100%;object-fit:cover;border-radius:10px;display:block;background:#f8fafc}
            .prc-info-wrap img{max-width:100%}
            @media (max-width:560px){.prc-info-wrap{flex-wrap:wrap}.prc-photo-frame{width:68px;height:68px}}
            .prc-info div label{display:block;font-size:8px;font-weight:700;color:#64748b;letter-spacing:.5px;text-transform:uppercase}
            .prc-info div b{font-size:12px;color:#0f172a}
            .prc-table{width:100%;border-collapse:collapse;font-size:11.5px}
            .prc-table thead th{background:#1e293b;color:#fff;padding:7px 8px;font-size:9.5px;text-transform:uppercase;letter-spacing:.4px}
            .prc-table td{padding:7px 8px;border-bottom:1px solid #eef2f7}
            .prc-num{width:28px;text-align:center;color:#94a3b8}
            .prc-subj{font-weight:600} .prc-subj small{color:#94a3b8}
            .prc-score{text-align:center;font-weight:800}
            .prc-lvl{text-align:center} .prc-desc{font-size:10.5px;color:#64748b}
            .prc-chip{display:inline-block;padding:2px 10px;border-radius:20px;font-weight:800;font-size:10px}
            .prc-overall td{background:#f0fdf4;font-weight:800;border-top:2px solid #16a34a}
            .prc-summary{display:flex;gap:12px;margin:14px 0;flex-wrap:wrap}
            .prc-sum{flex:1;min-width:150px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:10px 14px}
            .prc-sum label{display:block;font-size:8.5px;font-weight:700;color:#64748b;letter-spacing:.5px}
            .prc-sum b{font-size:20px;display:block;margin-top:2px}
            .prc-sum.prc-high{background:linear-gradient(135deg,#16a34a,#15803d);border:none}
            .prc-sum.prc-high label{color:rgba(255,255,255,.85)}
            .prc-sum.prc-high b{color:#fff}
            .prc-remarks{margin-bottom:14px}
            .prc-remarks h5{margin:0 0 4px;font-size:11px;font-weight:800;color:#0f172a}
            .prc-remarks .line{height:2px;width:52px;background:#16a34a;margin-bottom:7px}
            .prc-remarks p{margin:0;font-size:11px;line-height:1.6;color:#334155}
            .prc-sigs{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;margin:30px 0 16px}
            .prc-sig{text-align:center}
            .prc-sig .prc-line{border-top:1px solid #64748b;margin-bottom:6px;padding-top:4px}
            .prc-sig span{font-size:9px;font-weight:700;color:#64748b;letter-spacing:.3px}
            .prc-legend{display:flex;flex-wrap:wrap;gap:14px;border-top:1px solid #e2e8f0;padding-top:10px;font-size:10px;color:#475569}
            .prc-legend span{display:inline-flex;align-items:center;gap:5px}
            .prc-legend i{width:10px;height:10px;border-radius:3px;display:inline-block}
            @media (max-width:560px){ .prc-info{grid-template-columns:repeat(2,1fr)} .prc-sigs{grid-template-columns:1fr} .prc-sheet{padding:14px 12px} }
        </style>
        <div class="prc-sheet">
            <div class="prc-top">
                ${logoHtml}
                <div class="prc-school">
                    <h2>${esc(s.schoolName || 'SCHOOL NAME')}</h2>
                    ${s.motto ? `<p>${esc(s.motto)}</p>` : ''}
                    <p style="font-style:normal;font-size:10px;">${esc([s.address, s.phone, s.email].filter(Boolean).join('  ·  '))}</p>
                </div>
                <div class="prc-meta">
                    <div><b>CODE:</b> ${esc(s.schoolCode || '—')}</div>
                    <div><b>LEVEL:</b> ${esc(s.level || '—')}</div>
                    <div><b>CATEGORY:</b> ${esc(s.category || '—')}</div>
                </div>
            </div>
            <div class="prc-title">LEARNER ACADEMIC REPORT CARD <em>${esc(latest.term || '')} — ${esc(latest.year || '')}</em></div>
            <!-- FIXED: the report card carries the learner's profile photo where available -->
            <div class="prc-info-wrap">
                ${c.photo && c.photo.startsWith('data:image') && !c.photo.startsWith('data:image/svg') && c.photo.indexOf('No Photo') === -1 ? `<div class="prc-photo-frame"><img src="${esc(c.photo)}" alt="${esc(c.name || 'Learner')} photo"></div>` : ''}
                <div class="prc-info">
                    <div><label>Full Name</label><b>${esc(c.name || '—')}</b></div>
                    <div><label>Admission No</label><b>${esc(c.reg || 'N/A')}</b></div>
                    <div><label>Grade</label><b>${esc(c.grade || '—')}${c.stream ? ' · ' + esc(c.stream) : ''}</b></div>
                    <div><label>Date</label><b>${esc(todayStr)}</b></div>
                </div>
            </div>
            <table class="prc-table">
                <thead><tr><th>#</th><th style="text-align:left;">Learning Area</th><th>Score</th><th>Level</th><th>Descriptor</th></tr></thead>
                <tbody>
                    ${rows || '<tr><td colspan="5" style="text-align:center;padding:18px;color:#94a3b8;">No scores recorded for this assessment yet.</td></tr>'}
                    <tr class="prc-overall"><td></td><td>OVERALL</td><td style="text-align:center;">${avg !== null ? avg + '%' : '—'}</td>
                        <td style="text-align:center;">${overallRating ? `<span class="prc-chip" style="background:${overallRating.color}1f;color:${overallRating.color};">${overallRating.code}</span>` : '—'}</td>
                        <td>${overallRating ? esc(overallRating.text) : ''}</td></tr>
                </tbody>
            </table>
            <div class="prc-summary">
                <div class="prc-sum"><label>MEAN SCORE</label><b>${avg !== null ? avg + '%' : '—'}</b></div>
                <div class="prc-sum prc-high"><label>GRADE</label><b>${gradeLetter}</b></div>
                <div class="prc-sum"><label>OVERALL RATING</label><b>${overallRating ? overallRating.code : '—'}</b></div>
            </div>
            <div class="prc-remarks">
                <h5>CLASS TEACHER'S REMARKS</h5>
                <div class="line"></div>
                <p>${esc(remark)}</p>
            </div>
            <div class="prc-sigs">
                <div class="prc-sig"><div class="prc-line"></div><span>CLASS TEACHER</span></div>
                <div class="prc-sig"><div class="prc-line"></div><span>${esc(s.hoiTitle || 'HEAD OF INSTITUTION')}</span></div>
                <div class="prc-sig"><div class="prc-line"></div><span>PARENT / GUARDIAN</span></div>
            </div>
            <div class="prc-legend">
                <span><i style="background:#22c55e;"></i><b>EE</b> Exceeding (80–100)</span>
                <span><i style="background:#3b82f6;"></i><b>ME</b> Meeting (50–79)</span>
                <span><i style="background:#f59e0b;"></i><b>AE</b> Approaching (30–49)</span>
                <span><i style="background:#ef4444;"></i><b>BE</b> Below (0–29)</span>
            </div>
        </div>`;
        openModal('parReportModal');
    }
    function parPrintReport() {
        const body = $id('parReportBody');
        if (!body) return;
        const w = window.open('', '_blank', 'width=860,height=760');
        if (!w) return showToast('Pop-up blocked. Allow pop-ups for this site.', 'error');
        w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Report Card</title>
        <style>
            @page { size: A4; margin: 12mm }
            * { margin:0; padding:0; box-sizing:border-box }
            body { font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; color:#1e293b; background:#fff; }
            .prc-sheet { max-width: 100%; border: none; border-radius: 0; padding: 0; }
            img { max-width: 100%; height: auto; }
            table { page-break-inside: auto } tr { page-break-inside: avoid }
            ${(body.querySelector('style') || {}).textContent || ''}
        </style></head><body>${body.querySelector('.prc-sheet') ? body.querySelector('.prc-sheet').outerHTML : body.innerHTML}</body></html>`);
        w.document.close();
        w.focus();
        setTimeout(() => { try { w.print(); } catch (_) { /* manual */ } }, 400);
    }

    /* ── link this parent account to a learner (ADM + guardian phone) ── */
    async function parLinkChild() {
        if (previewMode()) return showToast('Preview mode — changes are disabled.', 'error');
        const adm = $id('parLinkAdm') ? $id('parLinkAdm').value.trim() : '';
        const phone = $id('parLinkPhone') ? $id('parLinkPhone').value.trim() : '';
        if (!adm || !phone) return showToast('Enter both the learner ADM / NEMIS / UPI and the guardian phone on file.', 'error');
        try {
            const res = await fetch('/api/link-student', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (localStorage.getItem('authToken') || '') },
                body: JSON.stringify({ adm, guardianPhone: phone })
            });
            const data = await res.json().catch(() => ({}));
            if (res.ok && data.success) {
                showToast(data.student ? `Linked to ${data.student.name} (${data.student.grade}) — loading their dashboard…` : 'Already linked. Loading…', 'success');
                if (typeof loadData === 'function') await loadData();
                initParentSection();
            } else {
                showToast(data.message || data.error || 'Linking failed.', 'error');
            }
        } catch (err) {
            showToast('Cannot reach the server right now.', 'error');
        }
    }

    /* ── change login password (student-backed parent session) ── */
    async function parChangePassword() {
        if (previewMode()) return showToast('Preview mode — changes are disabled.', 'error');
        const cur = $id('parCurPass') ? $id('parCurPass').value : '';
        const nw = $id('parNewPass') ? $id('parNewPass').value : '';
        const cf = $id('parConfirmPass') ? $id('parConfirmPass').value : '';
        if (!cur || !nw) return showToast('Enter your current and new password.', 'error');
        if (nw !== cf) return showToast('New passwords do not match.', 'error');
        const issues = [];
        if (nw.length < 8) issues.push('at least 8 characters');
        if (!/[A-Z]/.test(nw)) issues.push('one uppercase letter');
        if (!/[a-z]/.test(nw)) issues.push('one lowercase letter');
        if (!/[0-9]/.test(nw)) issues.push('one number');
        if (issues.length) return showToast('Password needs: ' + issues.join(', '), 'error');
        try {
            const res = await fetch('/api/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (localStorage.getItem('authToken') || '') },
                body: JSON.stringify({ currentPassword: cur, newPassword: nw })
            });
            const data = await res.json().catch(() => ({}));
            if (res.ok && data.success) {
                showToast('Password updated successfully.', 'success');
                ['parCurPass', 'parNewPass', 'parConfirmPass'].forEach(id => { const el = $id(id); if (el) el.value = ''; });
            } else {
                showToast(data.message || data.error || 'Failed to change password.', 'error');
            }
        } catch (err) {
            showToast('Cannot reach the server right now.', 'error');
        }
    }

    /* ── expose API ── */
    window.initParentSection = initParentSection;
    window.parentGo = parentGo;
    window.parentNavMonth = parentNavMonth;
    window.parentOpenReport = parentOpenReport;
    window.parentOpenPayments = parentOpenPayments;
    window.parentPayNow = parentPayNow;
    window.parPrintReport = parPrintReport;
    window.parChangePassword = parChangePassword;
    window.parLinkChild = parLinkChild;
    window.parPickPreview = (id) => { state.previewStudentId = id; initParentSection(); };
    // exposed for unit tests
    window.__parInternals = { statusOn, latestAssessments, childAvg, classAvg, feeInfo, childMessages };
})();
