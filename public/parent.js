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

    const state = { month: new Date(), view: 'home', trendChart: null };
    const $id = (i) => document.getElementById(i);
    const esc = (x) => escapeHtml(x);
    const todayISO = () => new Date().toISOString().slice(0, 10);
    const iso = (d) => new Date(d).toISOString().slice(0, 10);
    const fmtShort = (d) => { const dt = new Date(d); return isNaN(dt) ? d : dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }); };
    const STATUS = { present: { c: '#16a34a', l: 'Present' }, absent: { c: '#dc2626', l: 'Absent' }, late: { c: '#d97706', l: 'Late' } };

    function child() { return (store.students || [])[0] || null; }

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
    function latestAssessments(limit) {
        const c = child();
        if (!c) return [];
        return (store.examSchedules || [])
            .filter(a => a.grade === c.grade)
            .sort((a, b) => String(b.startDate || b.createdAt || '').localeCompare(String(a.startDate || a.createdAt || '')))
            .slice(0, limit || 6);
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
        if (!child()) {
            $id('parViewHome').innerHTML = '<div class="par-empty"><i class="fa-solid fa-user-xmark"></i><h4>No learner linked</h4><p>Contact the school to link your child\'s account.</p></div>';
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
    }

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
        if (!tag || !scores || !canvas || !empty) return;
        const latest = latestAssessments(1)[0];
        if (tag) tag.textContent = latest ? (latest.name || latest.type || 'Latest') : 'No assessments';
        if (latest) {
            const subs = (latest.subjects || []).map(sid => getSubjectById(sid)).filter(Boolean);
            const rows = subs.map(s => {
                const v = childScore(latest, s.id);
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
    function childMessages() {
        const c = child();
        return (store.messages || []).filter(m => {
            if (m.studentId) return m.studentId === c.id;   // bound to this learner
            if (m.category === 'attendance') return true;   // school-wide attendance alert (no student binding)
            const to = String(m.to || '');
            return (c.guardianName && to.toLowerCase().includes(String(c.guardianName).toLowerCase())) ||
                /^(parent|guardian)/i.test(to.trim());      // generic "Parent" / "Parent of X…" (not "Other Parent")
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
            </div>`;
    }

    /* ═══════════════════════════════════════════════════════════════
     *   REPORT CARD MODAL
     * ═══════════════════════════════════════════════════════════════ */
    function parentOpenReport() {
        const c = child();
        const s = store.settings || {};
        const latest = latestAssessments(1)[0];
        const body = $id('parReportBody');
        if (!body) return;
        if (!latest) {
            body.innerHTML = '<div class="par-empty"><i class="fa-solid fa-file-circle-xmark"></i><h4>No report card yet</h4><p>Results will appear after the first assessment.</p></div>';
            openModal('parReportModal');
            return;
        }
        const subs = (latest.subjects || []).map(sid => getSubjectById(sid)).filter(Boolean);
        const rows = subs.map(su => {
            const v = childScore(latest, su.id);
            if (v === null) return '';
            const rating = cbcRating(v);
            return `<tr>
                <td>${esc(su.name)}${su.code ? ' <small style="color:#94a3b8;">(' + esc(su.code) + ')</small>' : ''}</td>
                <td style="text-align:center;font-weight:700;">${v}</td>
                <td style="text-align:center;"><span class="par-rating-chip" style="background:${rating.color}22;color:${rating.color};">${rating.code}</span></td>
                <td style="font-size:0.78rem;color:var(--text-muted);">${esc(rating.text)}</td>
            </tr>`;
        }).filter(Boolean).join('');
        const avg = childAvg(latest);
        $id('parReportTitle').innerHTML = `<i class="fa-solid fa-file-lines"></i> Report Card — ${esc(latest.name || latest.type || 'Assessment')}`;
        body.innerHTML = `
            <div class="par-report-head">
                <div class="par-report-school">${esc(s.schoolName || 'School')}<br><small>${esc(s.motto || '')}</small></div>
                <div class="par-report-student"><strong>${esc(c.name)}</strong><small>${esc(c.grade || '')}${c.stream ? ' · ' + esc(c.stream) : ''} · ${esc(c.reg || '')}</small></div>
            </div>
            <table class="s-table report-table"><thead><tr><th>Subject</th><th style="text-align:center;">Score</th><th style="text-align:center;">Level</th><th>Descriptor</th></tr></thead><tbody>${rows || '<tr><td colspan="4" class="s-table-empty">No scores yet.</td></tr>'}</tbody></table>
            <div class="par-report-summary">
                <div><small>Overall Average</small><b>${avg !== null ? avg + '%' : '—'}</b></div>
                <div><small>Grade</small><b>${avg !== null ? (avg >= 80 ? 'A' : avg >= 65 ? 'B' : avg >= 50 ? 'C' : avg >= 40 ? 'D' : 'E') : '—'}</b></div>
                <div><small>Term</small><b>${esc(latest.term || '—')} ${esc(latest.year || '')}</b></div>
            </div>`;
        openModal('parReportModal');
    }
    function parPrintReport() {
        const body = $id('parReportBody');
        if (!body) return;
        const w = window.open('', '_blank', 'width=800,height=700');
        if (!w) return showToast('Pop-up blocked. Allow pop-ups for this site.', 'error');
        w.document.write(`<!DOCTYPE html><html><head><title>Report Card</title>
        <style>body{font-family:Inter,Arial,sans-serif;color:#1e293b;margin:32px;}
        .par-report-head{display:flex;justify-content:space-between;border-bottom:3px solid #22c55e;padding-bottom:12px;margin-bottom:16px;align-items:flex-end;}
        .par-report-school{font-weight:800;font-size:16px;color:#16a34a;} .par-report-school small{color:#64748b;font-weight:400;}
        .par-report-student{text-align:right;} .par-report-student small{color:#64748b;display:block;margin-top:3px;}
        table{width:100%;border-collapse:collapse;font-size:13px;} th,td{border:1px solid #e2e8f0;padding:8px 10px;text-align:left;}
        th{background:#f1f5f9;text-transform:uppercase;font-size:11px;letter-spacing:0.4px;}
        .par-report-summary{display:flex;gap:32px;margin-top:18px;} .par-report-summary small{color:#64748b;font-size:11px;text-transform:uppercase;}
        .par-report-summary b{font-size:18px;display:block;margin-top:2px;}</style></head><body>${body.innerHTML}</body></html>`);
        w.document.close();
        w.focus();
        setTimeout(() => { try { w.print(); } catch (_) { /* manual */ } }, 350);
    }

    /* ── expose API ── */
    window.initParentSection = initParentSection;
    window.parentGo = parentGo;
    window.parentNavMonth = parentNavMonth;
    window.parentOpenReport = parentOpenReport;
    window.parentOpenPayments = parentOpenPayments;
    window.parentPayNow = parentPayNow;
    window.parPrintReport = parPrintReport;
    // exposed for unit tests
    window.__parInternals = { statusOn, latestAssessments, childAvg, classAvg, feeInfo, childMessages };
})();
