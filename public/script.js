'use strict';

// ==========================================================================
//   DATA STORE & CONFIGURATION (CBC ALIGNED)
// ==========================================================================
const CBC_LEVELS = {
    'PP1': { name: 'Pre-Primary 1', type: 'Pre-Primary' },
    'PP2': { name: 'Pre-Primary 2', type: 'Pre-Primary' },
    'Grade 1': { name: 'Grade 1', type: 'Lower Primary' },
    'Grade 2': { name: 'Grade 2', type: 'Lower Primary' },
    'Grade 3': { name: 'Grade 3', type: 'Lower Primary' },
    'Grade 4': { name: 'Grade 4', type: 'Middle School' },
    'Grade 5': { name: 'Grade 5', type: 'Middle School' },
    'Grade 6': { name: 'Grade 6', type: 'Middle School' },
    'Grade 7': { name: 'Grade 7 (JSS)', type: 'JSS' },
    'Grade 8': { name: 'Grade 8 (JSS)', type: 'JSS' },
    'Grade 9': { name: 'Grade 9 (JSS)', type: 'JSS' }
};

const BAND_GRADE_MAP = {
    'pp': ['PP1', 'PP2'],
    'lower': ['Grade 1', 'Grade 2', 'Grade 3'],
    'middle': ['Grade 4', 'Grade 5', 'Grade 6'],
    'jss': ['Grade 7', 'Grade 8', 'Grade 9']
};

const DEFAULT_LEARNING_AREAS = [
    { id: 'pp_lang', name: 'Language Activities', code: 'PP-LA', applicableLevels: ['PP1', 'PP2'] },
    { id: 'pp_math', name: 'Mathematical Activities', code: 'PP-MA', applicableLevels: ['PP1', 'PP2'] },
    { id: 'pp_env', name: 'Environmental Activities', code: 'PP-EA', applicableLevels: ['PP1', 'PP2'] },
    { id: 'pp_creative', name: 'Creative Activities', code: 'PP-CA', applicableLevels: ['PP1', 'PP2'] },
    { id: 'pp_psycho', name: 'Psychomotor Activities', code: 'PP-PA', applicableLevels: ['PP1', 'PP2'] },
    { id: 'pp_re', name: 'Religious Education Activities', code: 'PP-RE', applicableLevels: ['PP1', 'PP2'] },
    { id: 'lp_lit_eng', name: 'Literacy Activities (English)', code: 'LP-LEN', applicableLevels: ['Grade 1', 'Grade 2', 'Grade 3'] },
    { id: 'lp_lit_kis', name: 'Literacy Activities (Kiswahili)', code: 'LP-LKIS', applicableLevels: ['Grade 1', 'Grade 2', 'Grade 3'] },
    { id: 'lp_math', name: 'Mathematical Activities', code: 'LP-MATH', applicableLevels: ['Grade 1', 'Grade 2', 'Grade 3'] },
    { id: 'lp_env', name: 'Environmental Activities', code: 'LP-ENV', applicableLevels: ['Grade 1', 'Grade 2', 'Grade 3'] },
    { id: 'lp_creative', name: 'Creative Activities (Art/Craft)', code: 'LP-CA', applicableLevels: ['Grade 1', 'Grade 2', 'Grade 3'] },
    { id: 'lp_pe', name: 'Movement & Creative Activities (PE)', code: 'LP-PE', applicableLevels: ['Grade 1', 'Grade 2', 'Grade 3'] },
    { id: 'lp_re', name: 'Religious Education (CRE/IRE)', code: 'LP-RE', applicableLevels: ['Grade 1', 'Grade 2', 'Grade 3'] },
    { id: 'ms_eng', name: 'English', code: 'MS-ENG', applicableLevels: ['Grade 4', 'Grade 5', 'Grade 6'] },
    { id: 'ms_kis', name: 'Kiswahili', code: 'MS-KIS', applicableLevels: ['Grade 4', 'Grade 5', 'Grade 6'] },
    { id: 'ms_math', name: 'Mathematics', code: 'MS-MATH', applicableLevels: ['Grade 4', 'Grade 5', 'Grade 6'] },
    { id: 'ms_sci', name: 'Science & Technology', code: 'MS-SCI', applicableLevels: ['Grade 4', 'Grade 5', 'Grade 6'] },
    { id: 'ms_ss', name: 'Social Studies', code: 'MS-SS', applicableLevels: ['Grade 4', 'Grade 5', 'Grade 6'] },
    { id: 'ms_cre', name: 'CRE / IRE', code: 'MS-RE', applicableLevels: ['Grade 4', 'Grade 5', 'Grade 6'] },
    { id: 'ms_creative', name: 'Creative Arts', code: 'MS-CA', applicableLevels: ['Grade 4', 'Grade 5', 'Grade 6'] },
    { id: 'ms_pe', name: 'Physical & Health Education', code: 'MS-PHE', applicableLevels: ['Grade 4', 'Grade 5', 'Grade 6'] },
    { id: 'ms_agri', name: 'Agriculture', code: 'MS-AGR', applicableLevels: ['Grade 4', 'Grade 5', 'Grade 6'] },
    { id: 'ms_hs', name: 'Home Science', code: 'MS-HS', applicableLevels: ['Grade 4', 'Grade 5', 'Grade 6'] },
    { id: 'ms_lang', name: 'Foreign Language (French/German)', code: 'MS-FL', applicableLevels: ['Grade 4', 'Grade 5', 'Grade 6'] },
    { id: 'js_eng', name: 'English', code: 'JS-ENG', applicableLevels: ['Grade 7', 'Grade 8', 'Grade 9'] },
    { id: 'js_kis', name: 'Kiswahili', code: 'JS-KIS', applicableLevels: ['Grade 7', 'Grade 8', 'Grade 9'] },
    { id: 'js_math', name: 'Mathematics', code: 'JS-MATH', applicableLevels: ['Grade 7', 'Grade 8', 'Grade 9'] },
    { id: 'js_sci', name: 'Integrated Science', code: 'JS-SCI', applicableLevels: ['Grade 7', 'Grade 8', 'Grade 9'] },
    { id: 'js_ss', name: 'Social Studies', code: 'JS-SS', applicableLevels: ['Grade 7', 'Grade 8', 'Grade 9'] },
    { id: 'js_re', name: 'Religious Education (CRE/IRE)', code: 'JS-RE', applicableLevels: ['Grade 7', 'Grade 8', 'Grade 9'] },
    { id: 'js_creative', name: 'Creative Arts & Sports Science', code: 'JS-CAS', applicableLevels: ['Grade 7', 'Grade 8', 'Grade 9'] },
    { id: 'js_tech', name: 'Pre-Technical Studies', code: 'JS-PTS', applicableLevels: ['Grade 7', 'Grade 8', 'Grade 9'] },
    { id: 'js_agri', name: 'Agriculture', code: 'JS-AGR', applicableLevels: ['Grade 7', 'Grade 8', 'Grade 9'] },
    { id: 'js_cs', name: 'Computer Science', code: 'JS-CS', applicableLevels: ['Grade 7', 'Grade 8', 'Grade 9'] },
    { id: 'js_lang', name: 'Foreign Language', code: 'JS-FL', applicableLevels: ['Grade 7', 'Grade 8', 'Grade 9'] },
    { id: 'js_life', name: 'Life Skills Education', code: 'JS-LSE', applicableLevels: ['Grade 7', 'Grade 8', 'Grade 9'] },
    { id: 'js_health', name: 'Health Education', code: 'JS-HE', applicableLevels: ['Grade 7', 'Grade 8', 'Grade 9'] },
    { id: 'js_bus', name: 'Business Studies', code: 'JS-BS', applicableLevels: ['Grade 7', 'Grade 8', 'Grade 9'] },
    { id: 'js_sports', name: 'Sports', code: 'JS-PE', applicableLevels: ['Grade 7', 'Grade 8', 'Grade 9'] }
];

const store = {
    students: [],
    staff: [],
    exams: [],
    notes: [],
    messages: [],
    settings: {
        schoolName: 'ElimuTrack School',
        motto: 'Excellence in Learning',
        schoolCode: 'PRI/001',
        academicYear: '2024',
        currentTerm: 'Term 1',
        level: 'Primary School',
        category: 'Public',
        hoiName: '',
        hoiTitle: 'Principal',
        hoiTsc: '',
        hoiPhone: '',
        hoiEmail: '',
        address: 'P.O. Box 123, Nairobi',
        phone: '0712345678',
        email: 'info@elimutrack.sc.ke',
        logo: null, stamp: null, hoiSignature: null, ctSignature: null,
    },
    learningAreas: DEFAULT_LEARNING_AREAS,
    timetable: [],
    examSchedules: []
};

const ADMIN_PASSWORD = 'admin123';
const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'%3E%3Crect fill='%23e2e8f0' width='150' height='150'/%3E%3Ctext fill='%2394a3b8' font-family='sans-serif' font-size='14' x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle'%3ENo Photo%3C/text%3E%3C/svg%3E";

let CURRENT_USER = null;
let currentView = { students: 'grid', staff: 'grid' };
let virtualAssessments = [];
let currentExamContext = { assessId: null, tradeId: null, subjectId: null, studentId: null };

const LearnerState = {
    search: '', grade: 'all', stream: 'all', gender: 'all', sort: 'name-asc', perPage: 24, page: 1, view: 'grid', selected: new Set()
};

// ==========================================================================
//   UTILITY FUNCTIONS
// ==========================================================================
const $ = id => document.getElementById(id);
const getVal = id => $(id) ? $(id).value.trim() : '';
const setVal = (id, val) => { if ($(id)) $(id).value = val; };
const setText = (id, text) => { const el = $(id); if (el) el.textContent = text; };

const debounce = (func, wait) => {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
};

function escapeHtml(text) {
    if (!text) return '';
    return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function generateId() { return Date.now().toString(36) + Math.random().toString(36).substr(2, 5); }

function showToast(msg, type = 'success') {
    let toast = $('toast');
    if (!toast) return;
    toast.innerHTML = `<i class="fa-solid ${type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-check'}"></i> <span>${msg}</span>`;
    toast.className = `toast show ${type}`;
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function openModal(id) {
    const modal = $(id);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        if (id === 'courseModal') openCourseModal();
    }
}

function closeModal(id) {
    const modal = $(id);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function cbcRating(score) {
    if (score >= 80) return { code: 'EE', text: 'Exceeding Expectation', color: '#22c55e', cls: 'type-opener' };
    if (score >= 50) return { code: 'ME', text: 'Meeting Expectation', color: '#3b82f6', cls: 'type-midterm' };
    if (score >= 30) return { code: 'AE', text: 'Approaching Expectation', color: '#f59e0b', cls: 'type-endterm' };
    return { code: 'BE', text: 'Below Expectation', color: '#ef4444', cls: 'type-endyear' };
}

(function checkCacheVersion() {
    const CACHE_VERSION = 'v1.0.6';
    const cachedVersion = localStorage.getItem('elimutrack_cache_ver');
    if (cachedVersion !== CACHE_VERSION) {
        localStorage.removeItem('elimutrack_backup');
        localStorage.setItem('elimutrack_cache_ver', CACHE_VERSION);
        console.log('Cache version mismatch — cleared stale backup.');
    }
})();

// ==========================================================================
//   API & AUTHENTICATION LAYER
// ==========================================================================
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    sessionStorage.clear();
    window.location.replace('login.html'); 
}

const API_URL = (() => {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.')) return `http://localhost:8000`;
    return window.location.origin;
})();

async function loadData() {
    const token = localStorage.getItem('authToken');
    if (!token) return logout();

    try {
        const res = await fetch(`${API_URL}/api/db`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            const db = await res.json();
            store.students = db.students || [];
            store.staff = db.staff || [];
            store.exams = db.exams || [];
            store.notes = db.notes || [];
            store.timetable = db.timetable || [];
            store.examSchedules = db.examSchedules || [];
            store.settings = { ...store.settings, ...db.settings };

            let existingAreas = db.learningAreas || [];
            DEFAULT_LEARNING_AREAS.forEach(def => {
                if (!existingAreas.some(area => area.code === def.code)) existingAreas.push(def);
            });
            store.learningAreas = existingAreas;

            _backupToLocalStorage();
            seedStaffData();
            initVirtualAssessments();
            normalizeLegacyAssessmentTypes();
        } else if (res.status === 401 || res.status === 403) {
            return logout();
        } else {
            throw new Error('Server error');
        }
    } catch (err) {
        console.warn('Server unreachable, loading local backup:', err.message);
        const localData = localStorage.getItem('elimutrack_backup');
        if (localData) {
            try {
                const parsed = JSON.parse(localData);
                Object.assign(store, parsed);
                seedStaffData();
                initVirtualAssessments();
                normalizeLegacyAssessmentTypes();
                showToast('Using offline cached data', 'warning');
            } catch (e) {
                seedStaffData();
                showToast('Local backup corrupted', 'error');
            }
        } else {
            seedStaffData();
            showToast('No data found. Fresh install.', 'info');
        }
    }
}

function _backupToLocalStorage() {
    try {
        const lightweight = {
            ...store,
            students: (store.students || []).map(s => ({ ...s, photo: null })),
            staff: (store.staff || []).map(s => ({ ...s, photo: null })),
            settings: { ...(store.settings || {}), logo: null, stamp: null, hoiSignature: null, ctSignature: null }
        };
        localStorage.setItem('elimutrack_backup', JSON.stringify(lightweight));
    } catch (e) { console.warn('localStorage backup skipped:', e.message); }
}

async function saveData() {
    const token = localStorage.getItem('authToken');
    if (!token) return logout();

    _backupToLocalStorage();

    if (!navigator.onLine) { showToast('Saved locally (no internet).', 'info'); return; }

    const endpoints = [
        ['/students', store.students], ['/staff', store.staff], ['/settings', store.settings],
        ['/exams', store.exams], ['/learningAreas', store.learningAreas], ['/notes', store.notes || []],
        ['/timetable', store.timetable || []], ['/examSchedules', store.examSchedules || []]
    ];

    try {
        await Promise.all(endpoints.map(([path, data]) =>
            fetch(`${API_URL}${path}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(data)
            })
        ));
    } catch (err) {
        console.warn('Server sync failed (data safe in localStorage):', err.message);
    }
}

function applyRoleRestrictions(role) {
    if (role === 'teacher') document.body.classList.add('role-teacher');
    const profileName = document.querySelector('.user-profile .user-info span');
    if (CURRENT_USER && profileName) profileName.innerText = CURRENT_USER.name;
}

// ==========================================================================
//   REPOSITORY & INIT
// ==========================================================================
function createRepository(entityKey) {
    return {
        getAll: () => store[entityKey] || [],
        getById: (id) => (store[entityKey] || []).find(item => item.id === id),
        findBy: (field, value) => (store[entityKey] || []).filter(item => item[field] === value),
        create: (item) => { if (!item.id) item.id = generateId(); if (!store[entityKey]) store[entityKey] = []; store[entityKey].unshift(item); saveData(); return item; },
        update: (id, updates) => { const i = store[entityKey].findIndex(item => item.id === id); if (i !== -1) { store[entityKey][i] = { ...store[entityKey][i], ...updates }; saveData(); return true; } return false; },
        delete: (id) => { const l = store[entityKey].length; store[entityKey] = store[entityKey].filter(item => item.id !== id); if (store[entityKey].length < l) { saveData(); return true; } return false; },
        count: () => (store[entityKey] || []).length
    };
}

const StudentRepo = createRepository('students');
const StaffRepo = createRepository('staff');

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('user');
    if (!token || !userStr) return window.location.href = 'login.html';
    try {
        CURRENT_USER = JSON.parse(userStr);
        await loadData();
        initializeApp(CURRENT_USER);
    } catch (e) {
        console.error("Session error", e);
        window.location.href = 'login.html';
    }
});

function initializeApp(user) {
    applyRoleRestrictions(user.role);
    initTheme();
    initGlobalListeners();
    startClock();
    router('dashboard');
    updateSettingsForm();
    updateHeaderAndDashboard();
    setTimeout(() => { const loader = $('appLoader'); if (loader) loader.style.display = 'none'; }, 800);
}

// ==========================================================================
//   GLOBAL EVENT LISTENERS & ROUTER
// ==========================================================================
function initGlobalListeners() {
    document.body.addEventListener('click', e => {
        const target = e.target;

        if (target.closest('#btnToggleSidebar')) return toggleSidebar();
        if (target.closest('#btnNotify')) return showToast('No new notifications');
        if (target.closest('#themeToggle')) return initTheme(true);

        const navItem = target.closest('[data-page]');
        if (navItem) return router(navItem.dataset.page, navItem);

        const modalTrigger = target.closest('[data-modal]');
        if (modalTrigger) return openModal(modalTrigger.dataset.modal);

        if (target.classList.contains('modal-backdrop') || target.matches('[data-dismiss="modal"]')) {
            const modal = target.closest('.modal-backdrop');
            if (modal) return closeModal(modal.id);
        }

        const actionBtn = target.closest('[data-action]');
        if (actionBtn) {
            const action = actionBtn.dataset.action;
            const id = actionBtn.dataset.id;
            if (action === 'edit') return id ? editStaff(id) : editStudent(id);
            if (action === 'delete') return id ? deleteStaff(id) : secureDelete(id);
            if (action === 'view') return viewStudent(id);
            if (action === 'openStaffModal') return openStaffModal();
            if (action === 'edit-curriculum' || action === 'edit-subject') return openCourseModal(id);
        }

        const viewBtn = target.closest('[data-view]');
        if (viewBtn) {
            const section = viewBtn.dataset.section, viewType = viewBtn.dataset.view;
            currentView[section] = viewType;
            viewBtn.closest('.btn-group')?.querySelectorAll('.btn').forEach(b => b.classList.remove('active'));
            viewBtn.classList.add('active');
            if (section === 'students') return renderLearnerSection();
            if (section === 'staff') return renderStaff();
        }

        const tabBtn = target.closest('.tab-btn');
        if (tabBtn) return switchSettingsTab(parseInt(tabBtn.dataset.tab));

        const bandBtn = target.closest('.band-btn');
        if (bandBtn) return filterCurricula(bandBtn.dataset.band);

        const dashNavItem = target.closest('.dash-nav-item');
        if (dashNavItem) return openDashTab(e, dashNavItem.dataset.tab || dashNavItem.textContent.trim());
    });

    $('globalSearch')?.addEventListener('input', debounce(e => handleGlobalSearch(e.target.value), 300));
    $('studentSearch')?.addEventListener('input', debounce(e => { LearnerState.search = e.target.value; LearnerState.page = 1; renderLearnerSection(); }, 300));
    $('learnerSortSelect')?.addEventListener('change', e => { LearnerState.sort = e.target.value; renderLearnerSection(); });
    $('learnerPerPageSelect')?.addEventListener('change', e => { LearnerState.perPage = e.target.value === 'all' ? 'all' : parseInt(e.target.value); LearnerState.page = 1; renderLearnerSection(); });
    $('streamFilter')?.addEventListener('change', e => { LearnerState.stream = e.target.value; LearnerState.page = 1; renderLearnerSection(); });
    $('staffSearch')?.addEventListener('input', debounce(renderStaff, 300));
    $('staffDeptFilter')?.addEventListener('change', renderStaff);

    $('newStudentForm')?.addEventListener('submit', submitRegistration);
    $('institutionForm')?.addEventListener('submit', saveInstitutionDetails);
    $('hoiForm')?.addEventListener('submit', saveHOIDetails);
    $('courseForm')?.addEventListener('submit', saveCourseSettings);
    $('staffForm')?.addEventListener('submit', submitStaff);
    $('noteForm')?.addEventListener('submit', e => { e.preventDefault(); saveNote(); });
    $('composeForm')?.addEventListener('submit', e => { e.preventDefault(); sendMessage(); });

    $('enrollmentChartToggle')?.addEventListener('click', e => {
        const btn = e.target.closest('button');
        if (!btn) return;
        document.querySelectorAll('#enrollmentChartToggle button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderDashboardChart(btn.dataset.type);
    });
    $('chartFilter')?.addEventListener('change', () => renderDashboardChart());
    $('activityFilter')?.addEventListener('click', e => {
        const btn = e.target.closest('button');
        if (!btn) return;
        document.querySelectorAll('#activityFilter button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderRecentActivityFeed(btn.dataset.filter);
    });

    $('analysisGradeSelect')?.addEventListener('change', renderAnalysis);
    $('analysisMetricSelect')?.addEventListener('change', renderAnalysis);

    ['examFilterGrade', 'examFilterType', 'examFilterTerm', 'examFilterStatus'].forEach(id => {
        $(id)?.addEventListener('change', renderAssessmentCards);
    });
    $('scoreEntryAssessment')?.addEventListener('change', loadScoreEntryTable);
    $('scoreEntrySubject')?.addEventListener('change', loadScoreEntryTable);
    $('resultsAssessment')?.addEventListener('change', loadResultsTable);
    $('batchAssessment')?.addEventListener('change', loadBatchGrid);
    $('analysisAssessment')?.addEventListener('change', loadSubjectAnalysis);
    $('analysisSubject')?.addEventListener('change', loadSubjectAnalysis);

    $('assessGrade')?.addEventListener('change', populateAssessSubjects);

    $('ttGradeFilter')?.addEventListener('change', renderTimetable);
    $('ttTabs')?.addEventListener('click', e => {
        const btn = e.target.closest('.ttt-btn');
        if (!btn) return;
        document.querySelectorAll('.ttt-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderTimetable();
    });
    $('btnAddSlot')?.addEventListener('click', () => openTimetableSlotModal());
    $('btnExportTimetable')?.addEventListener('click', exportTimetablePDF);
    $('ttSlotForm')?.addEventListener('submit', handleTimetableSlotSubmit);
    $('ttSlotGrade')?.addEventListener('change', e => populateTimetableSlotSubjects(e.target.value));
}

function router(viewId, navEl) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    const section = $(viewId);
    if (section) section.classList.add('active');

    setText('pageTitle', viewId.charAt(0).toUpperCase() + viewId.slice(1));

    if (navEl) {
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        navEl.classList.add('active');
    }

    try {
        switch (viewId) {
            case 'dashboard': renderDashboard(); break;
            case 'students': renderLearnerSection(); break;
            case 'staff': renderStaff(); break;
            case 'exams': switchExamTab('assessments'); break;
            case 'intake': resetIntakeForm(); break;
            case 'settings': updateSettingsForm(); break;
            case 'curricula': renderCurricula(); break;
            case 'timetable': renderTimetable(); break;
            case 'reports': renderReportsAnalytics(); break;
            case 'analysis': renderAnalysis(); break;
            case 'profile': populateProfileList(); break;
            case 'notes': renderNotesTab(); break;
            case 'inbox': renderInboxTab(); break;
        }
    } catch (e) {
        console.error(`Error rendering ${viewId}:`, e);
        showToast(`Error loading ${viewId} section`, 'error');
    }

    if (window.innerWidth < 768) $('sidebar')?.classList.remove('open');
}

// ==========================================================================
//   THEME & CLOCK
// ==========================================================================
function initTheme(toggle) {
    const html = document.documentElement;
    let theme = localStorage.getItem('theme') || 'light';
    if (toggle) theme = theme === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    const icon = theme === 'dark' ? 'fa-sun' : 'fa-moon';
    $('themeToggle').innerHTML = `<i class="fa-solid ${icon}"></i>`;
}

function startClock() {
    const clockEl = $('liveClock'), dateEl = $('liveDate');
    if (!clockEl && !dateEl) return;
    const tick = () => {
        const now = new Date();
        if (clockEl) clockEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (dateEl) dateEl.textContent = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    };
    tick(); setInterval(tick, 1000);
}

// ==========================================================================
//   DASHBOARD ENGINE
// ==========================================================================
const dashCharts = {};
const DASH_PALETTE = { green: '#22C55E', indigo: '#6366f1', amber: '#f59e0b', rose: '#f43f5e', teal: '#14b8a6', blue: '#3b82f6', pink: '#ec4899' };

function renderDashboard() {
    const allStudents = StudentRepo.getAll();
    const staffCount = StaffRepo.count();
    const maleCount = allStudents.filter(s => s.gender === 'Male').length;
    const femaleCount = allStudents.filter(s => s.gender === 'Female').length;
    const exams = store.exams || [];

    let totalScore = 0, examCount = 0;
    exams.forEach(e => { const sc = parseFloat(e.score)||0; if (sc > 0) { totalScore += sc; examCount++; } });
    const avgPerf = examCount > 0 ? Math.round(totalScore / examCount) : 0;
    const pending = allStudents.filter(s => !exams.some(e => e.studentId === s.id)).length;

    animateValue('statEnrollment', 0, allStudents.length, 800);
    animateValue('statStaff', 0, staffCount, 800);
    animateValue('statCompetent', 0, avgPerf, 800, '%');
    animateValue('statPending', 0, pending, 800);

    setText('kpiMaleCount', maleCount);
    setText('kpiFemaleCount', femaleCount);
    setText('kpiStaffTeaching', staffCount);
    setText('kpiStaffRatio', staffCount > 0 ? Math.round(allStudents.length / staffCount) : 0);

    renderDashboardChart();
    renderGenderVisual(maleCount, femaleCount);
    renderCompetencyChart(exams);
    renderPerformanceTrendChart(exams);
    renderSubjectRadarChart(exams);
    renderDashLeaderboard(allStudents, exams);
    renderRecentActivityFeed('all');
}

function animateValue(id, start, end, duration, suffix = '') {
    const obj = $(id);
    if (!obj) return;
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const val = Math.floor(progress * (end - start) + start);
        obj.textContent = val + suffix;
        if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
}

function renderDashboardChart(type = 'bar') {
    const canvas = $('enrollmentChart');
    if (!canvas || typeof Chart === 'undefined') return;
    if (dashCharts.enrollment) dashCharts.enrollment.destroy();

    const students = store.students || [];
    const allGrades = ['PP1', 'PP2', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9'];
    const counts = allGrades.map(g => students.filter(s => s.grade === g).length);
    const labels = allGrades.map(g => g.replace('Grade ', 'G'));

    const chartCtx = canvas.getContext('2d');
    const gradient = chartCtx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(34, 197, 94, 0.8)');
    gradient.addColorStop(1, 'rgba(34, 197, 94, 0.2)');

    let datasetConfig = {};
    if (type === 'bar') datasetConfig = { label: 'Learners', data: counts, backgroundColor: gradient, borderColor: DASH_PALETTE.green, borderWidth: 1.5, borderRadius: 6 };
    else if (type === 'line') datasetConfig = { label: 'Learners', data: counts, borderColor: DASH_PALETTE.green, backgroundColor: 'rgba(34,197,94,0.1)', fill: true, tension: 0.4 };
    else if (type === 'doughnut') datasetConfig = { label: 'Learners', data: counts, backgroundColor: Object.values(DASH_PALETTE), borderColor: '#fff', borderWidth: 2 };

    dashCharts.enrollment = new Chart(chartCtx, {
        type: type,
        data: { labels, datasets: [datasetConfig] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: type === 'doughnut' } }, scales: type === 'doughnut' ? {} : { y: { beginAtZero: true } } }
    });
}

function renderGenderVisual(male, female) {
    const total = male + female || 1;
    setText('countMale', male);
    setText('countFemale', female);
    setText('genderPercentMale', Math.round((male/total)*100) + '%');
    setText('genderPercentFemale', Math.round((female/total)*100) + '%');

    const barMale = $('genderBarMale'), barFemale = $('genderBarFemale');
    if (barMale && barFemale) {
        const maxH = 90;
        barMale.setAttribute('y', 100 - (male/total)*maxH);
        barMale.setAttribute('height', (male/total)*maxH);
        barFemale.setAttribute('y', 100 - (female/total)*maxH);
        barFemale.setAttribute('height', (female/total)*maxH);
    }
}

function renderCompetencyChart(exams) {
    const canvas = $('competencyChart');
    if (!canvas || typeof Chart === 'undefined') return;
    if (dashCharts.competency) dashCharts.competency.destroy();

    const cc = { EE: 0, ME: 0, AE: 0, BE: 0 };
    exams.forEach(e => { const sc = parseFloat(e.score)||0; if(sc>0){ cc[cbcRating(sc).code]++; } });
    const total = Object.values(cc).reduce((a,b)=>a+b,0);
    setText('competencyCenterNum', total);

    dashCharts.competency = new Chart(canvas.getContext('2d'), {
        type: 'doughnut',
        data: { labels: ['Exceeding', 'Meeting', 'Approaching', 'Below'], datasets: [{ data: [cc.EE, cc.ME, cc.AE, cc.BE], backgroundColor: [DASH_PALETTE.green, DASH_PALETTE.blue, DASH_PALETTE.amber, DASH_PALETTE.rose] }] },
        options: { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { display: false } } }
    });
}

function renderPerformanceTrendChart(exams) {
    const canvas = $('performanceTrendChart');
    if (!canvas || typeof Chart === 'undefined') return;
    if (dashCharts.trend) dashCharts.trend.destroy();

    const sorted = [...exams].filter(e => e.score > 0).slice(-12);
    if (sorted.length === 0) return;

    dashCharts.trend = new Chart(canvas.getContext('2d'), {
        type: 'line',
        data: { labels: sorted.map((_, i) => `A${i+1}`), datasets: [{ label: 'Avg Score', data: sorted.map(e => e.score), borderColor: DASH_PALETTE.indigo, backgroundColor: 'rgba(99,102,241,0.1)', fill: true, tension: 0.4 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, max: 100 } } }
    });
}

function renderSubjectRadarChart(exams) {
    const canvas = $('subjectRadarChart');
    if (!canvas || typeof Chart === 'undefined') return;
    if (dashCharts.radar) dashCharts.radar.destroy();

    const subjGroups = {};
    exams.forEach(e => {
        const name = getSubjectName(e.subjectId) || 'General';
        if (!subjGroups[name]) subjGroups[name] = [];
        if (e.score > 0) subjGroups[name].push(e.score);
    });

    const labels = Object.keys(subjGroups).slice(0, 6);
    if (labels.length === 0) return;

    dashCharts.radar = new Chart(canvas.getContext('2d'), {
        type: 'radar',
        data: { labels, datasets: [{ label: 'Avg Score', data: labels.map(l => Math.round(subjGroups[l].reduce((a,b)=>a+b,0)/subjGroups[l].length)), backgroundColor: 'rgba(34,197,94,0.2)', borderColor: DASH_PALETTE.green }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { r: { suggestedMin: 0, suggestedMax: 100 } } }
    });
}

function renderDashLeaderboard(students, exams) {
    const container = $('leaderboardList');
    if (!container) return;

    const stats = students.map(s => {
        const sExams = exams.filter(e => e.studentId === s.id && e.score > 0);
        const avg = sExams.length ? Math.round(sExams.reduce((a,b)=>a+b.score,0)/sExams.length) : 0;
        return { ...s, avg };
    }).filter(s => s.avg > 0).sort((a,b) => b.avg - a.avg).slice(0, 5);

    if (stats.length === 0) {
        container.innerHTML = '<div class="heatmap-empty">No assessment data yet.</div>';
        return;
    }

    container.innerHTML = stats.map((s, i) => `
        <div class="leaderboard-item rank-${i+1}" onclick="viewStudent('${s.id}')">
            <div class="leaderboard-rank">${i+1}</div>
            <div class="leaderboard-avatar"><img src="${s.photo || DEFAULT_AVATAR}" onerror="this.src='${DEFAULT_AVATAR}'"></div>
            <div class="leaderboard-info">
                <div class="leaderboard-name">${escapeHtml(s.name)}</div>
                <div class="leaderboard-meta">${s.grade || ''}</div>
            </div>
            <div class="leaderboard-score">${s.avg}%</div>
        </div>
    `).join('');
}

function renderRecentActivityFeed(filter = 'all') {
    const container = $('dashboardActivity');
    if (!container) return;
    let acts = [];

    if (filter === 'all' || filter === 'student') {
        StudentRepo.getAll().slice(-3).forEach(s => acts.push({ type: 'student', icon: 'fa-user-plus', title: `New admission: ${s.name}`, meta: s.grade, time: 'Recently' }));
    }
    if (filter === 'all' || filter === 'exam') {
        (store.exams||[]).slice(-3).forEach(e => {
            const s = StudentRepo.getById(e.studentId);
            acts.push({ type: 'exam', icon: 'fa-clipboard-check', title: `Assessment graded: ${getSubjectName(e.subjectId)}`, meta: s ? s.name : '', time: 'Recently' });
        });
    }
    if (filter === 'all' || filter === 'staff') {
        StaffRepo.getAll().slice(-2).forEach(s => acts.push({ type: 'staff', icon: 'fa-id-card', title: `Staff update: ${s.name}`, meta: s.designation, time: 'Recently' }));
    }

    if (acts.length === 0) {
        container.innerHTML = '<div class="activity-empty">No recent activity.</div>';
        return;
    }

    container.innerHTML = acts.map(act => `
        <div class="activity-item-modern">
            <div class="activity-icon-wrap ${act.type}"><i class="fa-solid ${act.icon}"></i></div>
            <div class="activity-content">
                <div class="activity-title">${escapeHtml(act.title)}</div>
                <div class="activity-meta"><span class="activity-tag">${act.type}</span> <span>${escapeHtml(act.meta||'')}</span> &middot; <span>${act.time}</span></div>
            </div>
        </div>
    `).join('');
}

// ==========================================================================
//   ADMISSIONS / INTAKE
// ==========================================================================
function resetIntakeForm() {
    $('newStudentForm')?.reset();
    if ($('editModeId')) $('editModeId').value = "";
    if ($('studentPhotoPreview')) $('studentPhotoPreview').src = DEFAULT_AVATAR;
    document.querySelectorAll('.form-step').forEach((s, i) => s.classList.toggle('active', i === 0));
    document.querySelectorAll('.step-modern').forEach((s, i) => s.classList.toggle('active', i === 0));
    updateLiveCard();
}

function validateField(input) {
    const val = input.value.trim();
    const formGroup = input.closest('.form-group-modern');
    if (!formGroup) return true;
    const errorSpan = formGroup.querySelector('.error-msg');
    let isValid = true, msg = "";

    if (input.id === 'idNumber') {
        if (val.length > 0 && val.length !== 8) { isValid = false; msg = "ID must be exactly 8 digits."; }
        else if (val.length === 8) {
            const editId = $('editModeId')?.value;
            if (StudentRepo.getAll().some(s => s.idNumber === val && s.id !== editId)) { isValid = false; msg = "ID already exists."; }
        }
    } else if (input.id === 'phone' || input.id === 'guardianPhone') {
        if (val.length > 0 && !/^(?:254|\+254|0)?([17][0-9]{8})$/.test(val)) { isValid = false; msg = "Invalid phone format."; }
    }

    if (!isValid && val.length > 0) {
        input.classList.add('error');
        if (errorSpan) errorSpan.innerText = msg;
    } else {
        input.classList.remove('error');
        if (errorSpan) errorSpan.innerText = "";
    }
    return isValid;
}

function nextStep(current, next) {
    const currentStep = $(`form-step-${current}`);
    const inputs = currentStep.querySelectorAll('input[required], select[required]');
    let allValid = true;

    inputs.forEach(input => {
        if (!input.value.trim()) {
            showToast(`Please fill in ${input.previousElementSibling?.innerText || 'required fields'}`, 'error');
            input.classList.add('error');
            allValid = false;
        } else if (!validateField(input)) {
            allValid = false;
        }
    });

    if (!allValid) return;

    $(`form-step-${current}`).classList.remove('active');
    $(`form-step-${next}`).classList.add('active');

    document.querySelectorAll('.step-modern').forEach((step, index) => {
        const stepNum = index + 1;
        step.classList.remove('active', 'completed');
        if (stepNum < next) step.classList.add('completed');
        else if (stepNum === next) step.classList.add('active');
    });
}

function prevStep(current, prev) {
    $(`form-step-${current}`).classList.remove('active');
    $(`form-step-${prev}`).classList.add('active');
    document.querySelectorAll('.step-modern').forEach((step, index) => {
        const stepNum = index + 1;
        step.classList.remove('active', 'completed');
        if (stepNum < prev) step.classList.add('completed');
        else if (stepNum === prev) step.classList.add('active');
    });
}

function updateLiveCard() {
    const sn = getVal('surname') || '';
    const fn = getVal('firstName') || '';
    const on = getVal('otherNames') || '';
    setText('liveCardName', `${sn} ${fn} ${on}`.trim() || 'Learner Name');
    setText('liveCardLevel', getVal('level') || '---');
    setText('liveCardDob', getVal('dob') || '---');

    const grade = getVal('regTrade');
    if (grade && !$('editModeId')?.value) {
        const year = new Date().getFullYear().toString().slice(-2);
        const count = StudentRepo.findBy('grade', grade).length + 1;
        const seq = String(count).padStart(3, '0');
        setText('liveCardReg', `${grade.replace(' ', '')}/${year}/${seq}`);
    }
    setText('liveCardTrade', grade || 'GRADE');
}

function previewStudentPhoto(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            $('studentPhotoPreview').src = e.target.result;
            $('liveCardPhoto').src = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function submitRegistration(e) {
    e.preventDefault();
    const grade = getVal('regTrade');
    const names = [getVal('surname'), getVal('firstName'), getVal('otherNames')].filter(Boolean).join(' ');

    const studentData = {
        name: names, gender: getVal('gender'), dob: getVal('dob'), idNumber: getVal('idNumber'),
        phone: getVal('phone'), grade: grade, stream: getVal('level'), photo: $('studentPhotoPreview').src,
        upiNumber: getVal('upiNumber'), prevSchool: getVal('prevSchool'), entryLevel: getVal('entryLevel'),
        yearCompleted: getVal('yearCompleted'), nemisNumber: getVal('assessmentNo'), disability: getVal('disability'),
        guardianName: getVal('guardianName'), guardianPhone: getVal('guardianPhone'), guardianRel: getVal('guardianRel')
    };

    const editId = $('editModeId').value;
    if (editId) {
        StudentRepo.update(editId, studentData);
        showToast('Learner updated successfully!');
    } else {
        const year = new Date().getFullYear().toString().slice(-2);
        const count = StudentRepo.findBy('grade', grade).length + 1;
        studentData.reg = `${grade.replace(' ', '')}/${year}/${String(count).padStart(3, '0')}`;
        StudentRepo.create(studentData);
        showToast('Learner Registered Successfully!');
    }
    router('students');
    resetIntakeForm();
    renderDashboard();
}

function editStudent(id) {
    const s = StudentRepo.getById(id);
    if (!s) return;
    router('intake');
    if ($('intakeFormTitle')) $('intakeFormTitle').innerText = "Edit Learner Details";
    $('editModeId').value = id;
    $('studentPhotoPreview').src = s.photo || DEFAULT_AVATAR;
    $('liveCardPhoto').src = s.photo || DEFAULT_AVATAR;

    setVal('surname', s.name.split(' ')[0]);
    setVal('firstName', s.name.split(' ')[1] || '');
    setVal('otherNames', s.name.split(' ').slice(2).join(' '));
    setVal('gender', s.gender);
    setVal('dob', s.dob);
    setVal('idNumber', s.idNumber);
    setVal('phone', s.phone);
    setVal('upiNumber', s.upiNumber || '');
    setVal('prevSchool', s.prevSchool || '');
    setVal('entryLevel', s.entryLevel || '');
    setVal('yearCompleted', s.yearCompleted || '');
    setVal('assessmentNo', s.nemisNumber || '');
    setVal('regTrade', s.grade);

    setTimeout(() => {
        setVal('level', s.stream);
        setVal('disability', s.disability || 'None');
        setVal('guardianName', s.guardianName || '');
        setVal('guardianPhone', s.guardianPhone || '');
        setVal('guardianRel', s.guardianRel || 'Parent');
        updateLiveCard();
    }, 100);
}

function secureDelete(id) {
    if (!confirm('Are you sure you want to delete this learner?')) return;
    StudentRepo.delete(id);
    renderLearnerSection();
    renderDashboard();
    showToast('Learner deleted');
}

// ==========================================================================
//   STUDENTS LIST SECTION
// ==========================================================================
function renderLearnerSection() {
    const all = StudentRepo.getAll();
    setText('lsTotalCount', all.length);
    setText('lsStatAll', all.length);
    setText('lsStatMale', all.filter(s => s.gender === 'Male').length);
    setText('lsStatFemale', all.filter(s => s.gender === 'Female').length);

    const filtered = getFilteredLearners();
    const sorted = sortLearners(filtered);
    const paginated = paginateLearners(sorted);

    if (LearnerState.view === 'list') {
        renderLearnerTable(paginated);
        if ($('studentsContainer')) $('studentsContainer').style.display = 'none';
        if ($('studentsListContainer')) $('studentsListContainer').style.display = 'block';
    } else {
        renderLearnerCards(paginated);
        if ($('studentsContainer')) $('studentsContainer').style.display = 'grid';
        if ($('studentsListContainer')) $('studentsListContainer').style.display = 'none';
    }
    renderLearnerPagination(sorted.length);
    renderLearnerSidebar();
}

function getFilteredLearners() {
    return StudentRepo.getAll().filter(s => {
        if (LearnerState.grade !== 'all' && s.grade !== LearnerState.grade) return false;
        if (LearnerState.stream !== 'all' && s.stream !== LearnerState.stream) return false;
        if (LearnerState.gender !== 'all' && s.gender !== LearnerState.gender) return false;
        if (LearnerState.search) {
            const hay = [s.name, s.reg, s.grade, s.stream, s.guardianName, s.guardianPhone].join(' ').toLowerCase();
            if (!hay.includes(LearnerState.search.toLowerCase())) return false;
        }
        return true;
    });
}

function sortLearners(list) {
    return [...list].sort((a, b) => {
        if (LearnerState.sort === 'name-asc') return (a.name||'').localeCompare(b.name||'');
        if (LearnerState.sort === 'name-desc') return (b.name||'').localeCompare(a.name||'');
        return 0;
    });
}

function paginateLearners(sorted) {
    if (LearnerState.perPage === 'all') return sorted;
    const start = (LearnerState.page - 1) * LearnerState.perPage;
    return sorted.slice(start, start + LearnerState.perPage);
}

function renderLearnerSidebar() {
    const listContainer = $('studentSidebarList');
    if (!listContainer) return;
    const groups = {};
    StudentRepo.getAll().forEach(s => {
        const grade = s.grade || 'Unknown';
        if (!groups[grade]) groups[grade] = [];
        groups[grade].push(s);
    });

    listContainer.innerHTML = Object.keys(groups).sort().map(grade => `
        <div class="grade-group ${LearnerState.grade === grade ? 'group-active' : ''}" data-grade="${escapeHtml(grade)}">
            <div class="grade-header" onclick="filterByGrade('${escapeHtml(grade)}')">
                <span>${escapeHtml(grade)}</span>
                <span class="ls-count-badge">${groups[grade].length}</span>
                <i class="fa-solid fa-chevron-down"></i>
            </div>
        </div>
    `).join('') || '<div class="empty-state">No learners yet.</div>';
}

function filterByGrade(grade) {
    LearnerState.grade = LearnerState.grade === grade ? 'all' : grade;
    LearnerState.page = 1;
    renderLearnerSection();
}

function filterByGender(gender) {
    LearnerState.gender = LearnerState.gender === gender ? 'all' : gender;
    LearnerState.page = 1;
    renderLearnerSection();
}

function renderLearnerCards(students) {
    const container = $('studentsContainer');
    if (!container) return;
    if (students.length === 0) {
        container.innerHTML = '<div class="empty-state">No learners found.</div>';
        return;
    }
    container.innerHTML = students.map(s => `
        <div class="student-card" onclick="viewStudent('${s.id}')">
            <div class="sc-top">
                <img src="${s.photo || DEFAULT_AVATAR}" class="sc-avatar" onerror="this.src='${DEFAULT_AVATAR}'">
                <div class="sc-info">
                    <div class="sc-name">${escapeHtml(s.name)}</div>
                    <div class="sc-reg">${escapeHtml(s.reg || 'N/A')}</div>
                </div>
            </div>
            <div class="sc-badges">
                <span class="sc-badge">${escapeHtml(s.grade || 'N/A')}</span>
                <span class="sc-badge">${escapeHtml(s.stream || 'N/A')}</span>
            </div>
            <div class="sc-actions">
                <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation(); editStudent('${s.id}')"><i class="fa-solid fa-pen"></i></button>
                <button class="btn btn-sm btn-danger" onclick="event.stopPropagation(); secureDelete('${s.id}')"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

function renderLearnerTable(students) {
    const tbody = $('studentsTableBody');
    if (!tbody) return;
    if (students.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="empty-state">No learners found.</td></tr>';
        return;
    }
    tbody.innerHTML = students.map(s => `
        <tr>
            <td>${escapeHtml(s.reg || 'N/A')}</td>
            <td>${escapeHtml(s.name)}</td>
            <td>${escapeHtml(s.grade || 'N/A')}</td>
            <td>${escapeHtml(s.stream || 'N/A')}</td>
            <td>${escapeHtml(s.gender || 'N/A')}</td>
            <td>${escapeHtml(s.guardianName || 'N/A')}</td>
            <td>${escapeHtml(s.guardianPhone || 'N/A')}</td>
            <td>
                <button class="btn btn-sm btn-ghost" onclick="editStudent('${s.id}')"><i class="fa-solid fa-pen"></i></button>
                <button class="btn btn-sm btn-ghost" onclick="secureDelete('${s.id}')"><i class="fa-solid fa-trash" style="color:var(--danger)"></i></button>
            </td>
        </tr>
    `).join('');
}

function renderLearnerPagination(total) {
    const container = $('studentsPagination');
    if (!container) return;
    const totalPages = Math.ceil(total / LearnerState.perPage);
    if (totalPages <= 1) { container.style.display = 'none'; return; }
    container.style.display = 'flex';
    container.innerHTML = Array.from({length: totalPages}, (_, i) => `<button class="lp-btn ${i+1 === LearnerState.page ? 'active' : ''}" onclick="changeLearnerPage(${i+1})">${i+1}</button>`).join('');
}

function changeLearnerPage(p) { LearnerState.page = p; renderLearnerSection(); }

// ==========================================================================
//   COMPLETE ASSESSMENT CENTER ENGINE (CBC Aligned)
// ==========================================================================

// --- ASSESSMENT TYPE CONSTANTS ---
const VALID_ASSESSMENT_TYPES = ['Opener', 'Mid Term', 'End Term', 'End Year'];
const ASSESSMENT_TYPE_ORDER = { 'Opener': 1, 'Mid Term': 2, 'End Term': 3, 'End Year': 4 };
const ASSESSMENT_TYPE_CSS = {
    'Opener': 'type-opener',
    'Mid Term': 'type-midterm',
    'End Term': 'type-endterm',
    'End Year': 'type-endyear'
};

// --- PERSISTENCE SAFETY NET ---
// store.examSchedules gets wiped to [] on refresh when the server's /api/db
// doesn't return examSchedules. This dedicated backup prevents that data loss.
const _ASSess_KEY = 'elimutrack_assess_safe';

function _assessBackup() {
    try {
        localStorage.setItem(_ASSess_KEY, JSON.stringify({
            s: store.examSchedules || [],
            e: (store.exams || []).filter(x => x.assessId)
        }));
    } catch (_) {}
}

function _assessRecover() {
    // Only recover if store is empty (data was lost after refresh)
    if ((store.examSchedules || []).length > 0) return;
    try {
        const raw = localStorage.getItem(_ASSess_KEY);
        if (!raw) return;
        const data = JSON.parse(raw);
        if (!data.s || data.s.length === 0) return;
        store.examSchedules = data.s;
        if (!store.exams) store.exams = [];
        (data.e || []).forEach(score => {
            if (!store.exams.some(x => x.id === score.id)) store.exams.push(score);
        });
        console.log(`Recovered ${data.s.length} assessment(s) from safety backup.`);
    } catch (_) {}
}

// Synchronous flush on tab close / refresh — guaranteed to complete
window.addEventListener('beforeunload', () => _assessBackup());

function isValidAssessmentType(type) {
    return VALID_ASSESSMENT_TYPES.includes(type);
}

function getAssessmentTypeOrder(type) {
    return ASSESSMENT_TYPE_ORDER[type] || 99;
}

function normalizeLegacyAssessmentTypes() {
    const TYPE_MAP = {
        'Formative': 'Opener',
        'Summative': 'Mid Term',
        'Midterm': 'Mid Term',
        'End of Term': 'End Term',
        'End of Year': 'End Year',
        'Final Exam': 'End Year',
        'Practical': 'End Term'
    };
    let changed = false;
    (store.examSchedules || []).forEach(a => {
        if (TYPE_MAP[a.type]) { a.type = TYPE_MAP[a.type]; changed = true; }
    });
    (store.exams || []).forEach(e => {
        if (TYPE_MAP[e.type]) { e.type = TYPE_MAP[e.type]; changed = true; }
    });
    if (changed) {
        saveData();
        _assessBackup();
        console.log('Legacy assessment types normalized to CBC standard.');
    }
}

// --- HELPERS ---
function getSubjectName(subjectId) {
    if (!subjectId) return '';
    const area = (store.learningAreas || []).find(la => la.id === subjectId || la.code === subjectId);
    return area ? area.name : subjectId;
}

function getSubjectsForGrade(grade) {
    if (!grade) return [];
    return (store.learningAreas || []).filter(la => la.applicableLevels && la.applicableLevels.includes(grade));
}

function populateAssessSubjects() {
    const grade = getVal('assessGrade');
    const container = $('assessSubjectsContainer');
    if (!container || !grade) {
        if (container) container.innerHTML = '<span style="color:var(--text-muted); font-size:0.85rem;">Select a grade first to load subjects.</span>';
        return;
    }
    const subjects = getSubjectsForGrade(grade);
    if (subjects.length === 0) {
        container.innerHTML = '<span style="color:var(--text-muted); font-size:0.85rem;">No subjects found for this grade.</span>';
        return;
    }
    container.innerHTML = subjects.map(s => `
        <label style="display:flex; align-items:center; gap:0.4rem; padding:0.3rem 0.6rem; border:1px solid var(--border); border-radius:8px; cursor:pointer; font-size:0.85rem;">
            <input type="checkbox" name="assessSubjects" value="${s.id}" checked style="accent-color:var(--primary);">
            ${escapeHtml(s.name)}
        </label>
    `).join('');
}

function populateAssessmentDropdown(selectId, includeAll) {
    _assessRecover();
    const select = $(selectId);
    if (!select) return;
    const year = store.settings.academicYear || new Date().getFullYear().toString();
    let assessments = (store.examSchedules || []).filter(a => a.year === year);
    assessments.sort((a, b) => getAssessmentTypeOrder(a.type) - getAssessmentTypeOrder(b.type));

    const currentVal = select.value;
    select.innerHTML = '<option value="">Select Assessment...</option>';
    assessments.forEach(a => {
        const opt = document.createElement('option');
        opt.value = a.id;
        opt.textContent = `${a.type} — ${a.grade} (${a.term})`;
        select.appendChild(opt);
    });
    if (currentVal) select.value = currentVal;
}

function populateSubjectDropdown(selectId, assessId, includeAll) {
    const select = $(selectId);
    if (!select) return;
    const assessment = (store.examSchedules || []).find(a => a.id === assessId);
    const currentVal = select.value;
    select.innerHTML = includeAll ? '<option value="all">All Subjects</option>' : '<option value="">Select Subject...</option>';
    if (!assessment) return;
    (assessment.subjects || []).forEach(subjId => {
        const subj = (store.learningAreas || []).find(la => la.id === subjId);
        if (subj) {
            const opt = document.createElement('option');
            opt.value = subj.id;
            opt.textContent = subj.name;
            select.appendChild(opt);
        }
    });
    if (currentVal) select.value = currentVal;
}

// --- TAB SWITCHING ---
function switchExamTab(tabName) {
    _assessRecover();
    document.querySelectorAll('.exam-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.examtab === tabName);
    });
    document.querySelectorAll('.exam-tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `examTab-${tabName}`);
    });

    switch (tabName) {
        case 'assessments': renderAssessmentCards(); break;
        case 'enter':
            populateAssessmentDropdown('scoreEntryAssessment');
            break;
        case 'results':
            populateAssessmentDropdown('resultsAssessment');
            break;
        case 'analysis':
            populateAssessmentDropdown('analysisAssessment');
            break;
        case 'batch':
            populateAssessmentDropdown('batchAssessment');
            break;
    }
}

// --- TAB 1: ASSESSMENT CARDS ---
function renderAssessmentCards() {
    _assessRecover();
    const grid = $('assessGrid');
    const emptyState = $('assessEmptyState');
    const countLabel = $('examCountLabel');
    if (!grid) return;

    const filterGrade = getVal('examFilterGrade') || 'all';
    const filterType = getVal('examFilterType') || 'all';
    const filterTerm = getVal('examFilterTerm') || 'all';
    const filterStatus = getVal('examFilterStatus') || 'all';
    const year = store.settings.academicYear || new Date().getFullYear().toString();

    let assessments = (store.examSchedules || []).filter(a => {
        if (filterGrade !== 'all' && a.grade !== filterGrade) return false;
        if (filterType !== 'all' && a.type !== filterType) return false;
        if (filterTerm !== 'all' && a.term !== filterTerm) return false;
        if (a.year && a.year !== year) return false;
        return true;
    }).sort((a, b) => {
        const typeDiff = getAssessmentTypeOrder(a.type) - getAssessmentTypeOrder(b.type);
        if (typeDiff !== 0) return typeDiff;
        return (b.createdAt || 0) - (a.createdAt || 0);
    });

    if (countLabel) countLabel.textContent = `${assessments.length} assessment${assessments.length !== 1 ? 's' : ''}`;

    if (assessments.length === 0) {
        grid.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';

    grid.innerHTML = assessments.map(a => {
        const subjects = a.subjects || [];
        const students = StudentRepo.findBy('grade', a.grade);
        const scoredExams = (store.exams || []).filter(e => e.assessId === a.id);
        const totalSlots = students.length * subjects.length;
        const progress = totalSlots > 0 ? Math.round((scoredExams.length / totalSlots) * 100) : 0;
        const status = a.status || (progress === 100 ? 'closed' : 'open');

        if (filterStatus === 'draft' && status !== 'draft') return '';
        if (filterStatus === 'open' && status !== 'open') return '';
        if (filterStatus === 'closed' && status !== 'closed') return '';

        const cssClass = ASSESSMENT_TYPE_CSS[a.type] || '';
        const statusClass = status === 'closed' ? 'status-complete' : 'status-pending';
        const statusText = status === 'closed' ? 'Closed' : status === 'draft' ? 'Draft' : 'Open';

        return `
            <div class="assess-card ${cssClass}" onclick="viewAssessmentDetail('${a.id}')">
                <div class="ac-header">
                    <span class="ac-type-badge">${escapeHtml(a.type)}</span>
                    <span class="ac-status ${statusClass}">${statusText}</span>
                </div>
                <div class="ac-body">
                    <h4>${escapeHtml(a.name || `${a.type} — ${a.grade}`)}</h4>
                    <div class="ac-meta">
                        <span><i class="fa-solid fa-graduation-cap"></i> ${escapeHtml(a.grade)}</span>
                        <span><i class="fa-solid fa-calendar"></i> ${escapeHtml(a.term)}</span>
                        <span><i class="fa-solid fa-book"></i> ${subjects.length} subjects</span>
                    </div>
                </div>
                <div class="ac-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <span class="progress-text">${progress}%</span>
                </div>
                <div class="ac-footer">
                    <span>${scoredExams.length}/${totalSlots} scores</span>
                    <div class="ac-actions">
                        <button class="btn btn-sm btn-ghost" onclick="event.stopPropagation(); editAssessment('${a.id}')" title="Edit"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn btn-sm btn-ghost" onclick="event.stopPropagation(); deleteAssessmentPrompt('${a.id}')" title="Delete"><i class="fa-solid fa-trash" style="color:var(--danger)"></i></button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function viewAssessmentDetail(id) {
    switchExamTab('enter');
    populateAssessmentDropdown('scoreEntryAssessment');
    setVal('scoreEntryAssessment', id);
    loadScoreEntryTable();
}

function editAssessment(id) {
    const a = (store.examSchedules || []).find(s => s.id === id);
    if (!a) return;

    setVal('assessName', a.name || '');
    setVal('assessType', a.type);
    setVal('assessGrade', a.grade);
    setVal('assessTerm', a.term);
    setVal('assessStartDate', a.startDate || '');
    setVal('assessEndDate', a.endDate || '');
    setVal('assessNotes', a.notes || '');

    const form = $('createAssessmentForm');
    if (form) {
        let editHidden = form.querySelector('#assessEditId');
        if (!editHidden) {
            editHidden = document.createElement('input');
            editHidden.type = 'hidden';
            editHidden.id = 'assessEditId';
            form.prepend(editHidden);
        }
        editHidden.value = id;
    }

    populateAssessSubjects();

    setTimeout(() => {
        const checkboxes = document.querySelectorAll('input[name="assessSubjects"]');
        checkboxes.forEach(cb => {
            cb.checked = (a.subjects || []).includes(cb.value);
        });
    }, 100);

    openModal('createAssessmentModal');
}

function deleteAssessmentPrompt(id) {
    const a = (store.examSchedules || []).find(s => s.id === id);
    if (!a) return;
    setText('deleteAssessName', a.name || `${a.type} — ${a.grade}`);
    window._pendingDeleteAssessId = id;
    openModal('deleteAssessModal');
}

function confirmDeleteAssessment() {
    const id = window._pendingDeleteAssessId;
    if (!id) return;

    store.examSchedules = (store.examSchedules || []).filter(s => s.id !== id);
    store.exams = (store.exams || []).filter(e => e.assessId !== id);

    saveData();
    _assessBackup();
    closeModal('deleteAssessModal');
    renderAssessmentCards();
    showToast('Assessment deleted.');
    window._pendingDeleteAssessId = null;
}

function openCreateAssessmentModal() {
    const form = $('createAssessmentForm');
    if (form) form.reset();
    const editHidden = form?.querySelector('#assessEditId');
    if (editHidden) editHidden.value = '';

    setVal('assessYear', store.settings.academicYear || new Date().getFullYear().toString());
    const container = $('assessSubjectsContainer');
    if (container) container.innerHTML = '<span style="color:var(--text-muted); font-size:0.85rem;">Select a grade first to load subjects.</span>';

    openModal('createAssessmentModal');
}

function saveAssessment(e) {
    e.preventDefault();

    const name = getVal('assessName');
    const type = getVal('assessType');
    const grade = getVal('assessGrade');
    const term = getVal('assessTerm');
    const startDate = getVal('assessStartDate');
    const endDate = getVal('assessEndDate');
    const notes = getVal('assessNotes');

    if (!isValidAssessmentType(type)) {
        showToast('Invalid assessment type.', 'error');
        return false;
    }

    const subjectCheckboxes = document.querySelectorAll('input[name="assessSubjects"]:checked');
    const subjects = Array.from(subjectCheckboxes).map(cb => cb.value);

    if (subjects.length === 0) {
        showToast('Please select at least one subject.', 'error');
        return false;
    }

    const editId = $('assessEditId')?.value;

    if (editId) {
        const idx = (store.examSchedules || []).findIndex(s => s.id === editId);
        if (idx !== -1) {
            store.examSchedules[idx] = {
                ...store.examSchedules[idx],
                name, type, grade, term, subjects,
                startDate, endDate, notes,
                status: store.examSchedules[idx].status || 'open'
            };
        }
        showToast('Assessment updated successfully!');
    } else {
        if (!store.examSchedules) store.examSchedules = [];
        store.examSchedules.push({
            id: generateId(),
            name: name || `${type} — ${grade}`,
            type, grade, term, subjects,
            startDate, endDate, notes,
            year: store.settings.academicYear || new Date().getFullYear().toString(),
            status: 'open',
            createdAt: Date.now()
        });
        showToast(`${type} assessment created!`);
    }

    saveData();
    _assessBackup();
    closeModal('createAssessmentModal');
    renderAssessmentCards();
    return false;
}

// --- TAB 2: SCORE ENTRY ---
function loadScoreEntryTable() {
    _assessRecover();
    const assessId = getVal('scoreEntryAssessment');
    const wrapper = $('scoreEntryWrapper');
    const emptyEl = $('scoreEntryEmpty');
    const titleEl = $('scoreEntryTitle');
    const countEl = $('scoreEntryCount');
    const tbody = $('scoreEntryBody');

    if (!assessId) {
        if (wrapper) wrapper.style.display = 'none';
        if (emptyEl) emptyEl.style.display = 'block';
        return;
    }

    const assessment = (store.examSchedules || []).find(a => a.id === assessId);
    if (!assessment) return;

    populateSubjectDropdown('scoreEntrySubject', assessId, true);

    const subjectFilter = getVal('scoreEntrySubject') || 'all';
    const subjects = subjectFilter === 'all'
        ? (assessment.subjects || []).map(sid => (store.learningAreas || []).find(la => la.id === sid)).filter(Boolean)
        : [(store.learningAreas || []).find(la => la.id === subjectFilter)].filter(Boolean);

    const students = StudentRepo.findBy('grade', assessment.grade);

    if (students.length === 0 || subjects.length === 0) {
        if (wrapper) wrapper.style.display = 'none';
        if (emptyEl) emptyEl.style.display = 'block';
        return;
    }

    if (wrapper) wrapper.style.display = 'block';
    if (emptyEl) emptyEl.style.display = 'none';
    if (titleEl) titleEl.textContent = assessment.name || `${assessment.type} — ${assessment.grade}`;
    if (countEl) countEl.textContent = `${students.length} learners`;

    if (!tbody) return;
    tbody.innerHTML = students.map((student, idx) => {
        const cells = subjects.map(subj => {
            const exam = (store.exams || []).find(e => e.assessId === assessId && e.studentId === student.id && e.subjectId === subj.id);
            const score = exam ? exam.score : '';
            const rating = score ? cbcRating(parseInt(score)) : { code: '-', color: 'transparent' };
            return `
                <td class="subj-col"><input type="number" min="0" max="100" class="score-input" data-assess="${assessId}" data-student="${student.id}" data-subject="${subj.id}" value="${score}" onchange="handleScoreChange(this)"></td>
                <td class="subj-col"><span class="rating-badge" style="background:${rating.color}20; color:${rating.color}">${rating.code}</span></td>
                <td class="subj-col"><input type="text" class="form-control" style="font-size:0.8rem; padding:0.3rem;" placeholder="Remarks" value="${exam?.remarks || ''}" onchange="handleRemarkChange(this, '${assessId}', '${student.id}', '${subj.id}')"></td>
            `;
        }).join('');

        return `<tr data-student-name="${escapeHtml(student.name).toLowerCase()}" data-student-adm="${(student.reg || '').toLowerCase()}">
            <td>${idx + 1}</td>
            <td>${escapeHtml(student.name)}</td>
            <td>${escapeHtml(student.reg || 'N/A')}</td>
            ${cells}
        </tr>`;
    }).join('');
}

function handleScoreChange(input) {
    let score = parseInt(input.value);
    if (isNaN(score) || score < 0) score = 0;
    if (score > 100) { score = 100; input.value = 100; }

    const row = input.closest('tr');
    if (!row) return;

    const cellIndex = input.closest('td').cellIndex;
    const ratingCell = row.cells[cellIndex + 1];
    if (ratingCell) {
        const rating = cbcRating(score);
        const badge = ratingCell.querySelector('.rating-badge');
        if (badge) {
            badge.textContent = rating.code;
            badge.style.background = rating.color + '20';
            badge.style.color = rating.color;
        }
    }

    const assessId = input.dataset.assess;
    const studentId = input.dataset.student;
    const subjectId = input.dataset.subject;
    const assessment = (store.examSchedules || []).find(a => a.id === assessId);

    const existingIdx = (store.exams || []).findIndex(e => e.assessId === assessId && e.studentId === studentId && e.subjectId === subjectId);

    if (score === 0 && input.value === '') {
        if (existingIdx !== -1) store.exams.splice(existingIdx, 1);
    } else if (existingIdx !== -1) {
        store.exams[existingIdx].score = score;
    } else if (score > 0) {
        store.exams.push({
            id: generateId(), assessId, studentId, subjectId, score,
            type: assessment?.type || 'Opener',
            term: assessment?.term || '',
            year: assessment?.year || new Date().getFullYear().toString(),
            grade: assessment?.grade || '',
            createdAt: Date.now()
        });
    }

    // IMMEDIATE local backup — survives refresh/close
    _assessBackup();
    // Debounced server sync
    clearTimeout(window._scoreSaveTimeout);
    window._scoreSaveTimeout = setTimeout(() => saveData(), 1500);
}

function handleRemarkChange(input, assessId, studentId, subjectId) {
    const existing = (store.exams || []).find(e => e.assessId === assessId && e.studentId === studentId && e.subjectId === subjectId);
    if (existing) {
        existing.remarks = input.value;
        _assessBackup();
        clearTimeout(window._remarkSaveTimeout);
        window._remarkSaveTimeout = setTimeout(() => saveData(), 2000);
    }
}

function autoSaveScores() {
    const grade = getVal('scoreEntryGrade') || getVal('assessGrade');
    const type = getVal('scoreEntryAssessment');
    const subjectId = getVal('scoreEntrySubject');
    const term = store.settings.currentTerm || 'Term 1';
    const year = String(store.settings.academicYear || new Date().getFullYear());

    if (!grade || !type || !subjectId) return; 

    const inputs = document.querySelectorAll('.score-input');
    
    inputs.forEach(input => {
        const studentId = input.dataset.studentId;
        const scoreVal = input.value.trim();

        store.exams = store.exams.filter(e => 
            !(e.studentId === studentId && 
              e.subjectId === subjectId && 
              e.type === type && 
              e.term === term && 
              String(e.year) === year)
        );

        if (scoreVal !== '') {
            const score = Math.max(0, Math.min(100, parseInt(scoreVal)));
            if (!isNaN(score)) {
                store.exams.push({ 
                    id: generateId(), 
                    studentId, 
                    subjectId, 
                    score, 
                    type, 
                    term, 
                    year, 
                    grade
                });
            }
        }
    });

    saveData();
    _assessBackup();
    showToast('Draft auto-saved.', 'info');
}

function submitAllScores() {
    saveData();
    _assessBackup();
    const assessId = getVal('scoreEntryAssessment');
    if (assessId) {
        const idx = (store.examSchedules || []).findIndex(a => a.id === assessId);
        if (idx !== -1) store.examSchedules[idx].status = 'closed';
        saveData();
        _assessBackup();
    }
    showToast('Scores submitted & assessment closed!');
    renderAssessmentCards();
}

function filterScoreEntryRows() {
    const search = (getVal('scoreEntrySearch') || '').toLowerCase();
    const rows = $('scoreEntryBody')?.querySelectorAll('tr');
    if (!rows) return;
    rows.forEach(row => {
        const name = row.dataset.studentName || '';
        const adm = row.dataset.studentAdm || '';
        row.style.display = (name.includes(search) || adm.includes(search)) ? '' : 'none';
    });
}

// --- TAB 3: RESULTS ---
function loadResultsTable() {
    _assessRecover();
    const assessId = getVal('resultsAssessment');
    const wrapper = $('resultsWrapper');
    const emptyEl = $('resultsEmpty');
    const titleEl = $('resultsTitle');
    const statsEl = $('resultsStats');
    const thead = $('resultsHead');
    const tbody = $('resultsBody');

    if (!assessId) {
        if (wrapper) wrapper.style.display = 'none';
        if (emptyEl) emptyEl.style.display = 'block';
        return;
    }

    const assessment = (store.examSchedules || []).find(a => a.id === assessId);
    if (!assessment) return;

    const subjects = (assessment.subjects || []).map(sid => (store.learningAreas || []).find(la => la.id === sid)).filter(Boolean);
    const students = StudentRepo.findBy('grade', assessment.grade);
    const exams = (store.exams || []).filter(e => e.assessId === assessId);

    if (students.length === 0 || subjects.length === 0) {
        if (wrapper) wrapper.style.display = 'none';
        if (emptyEl) emptyEl.style.display = 'block';
        return;
    }

    if (wrapper) wrapper.style.display = 'block';
    if (emptyEl) emptyEl.style.display = 'none';
    if (titleEl) titleEl.textContent = assessment.name || `${assessment.type} — ${assessment.grade}`;

    if (thead) {
        thead.innerHTML = `<tr>
            <th>#</th><th>Student Name</th><th>ADM No</th>
            ${subjects.map(s => `<th>${escapeHtml(s.name)}</th>`).join('')}
            <th>Total</th><th>Mean</th><th>Rating</th>
        </tr>`;
    }

    const studentResults = students.map(student => {
        const sExams = exams.filter(e => e.studentId === student.id);
        let total = 0, count = 0;
        const scores = subjects.map(subj => {
            const exam = sExams.find(e => e.subjectId === subj.id);
            const sc = exam ? parseInt(exam.score) || 0 : 0;
            if (sc > 0) { total += sc; count++; }
            return sc;
        });
        const mean = count > 0 ? Math.round(total / count) : 0;
        const rating = cbcRating(mean);
        return { student, scores, total, mean, rating };
    }).sort((a, b) => b.mean - a.mean);

    if (tbody) {
        tbody.innerHTML = studentResults.map((r, i) => `
            <tr class="row-${r.rating.cls}">
                <td>${i + 1}</td>
                <td>${escapeHtml(r.student.name)}</td>
                <td>${escapeHtml(r.student.reg || 'N/A')}</td>
                ${r.scores.map(s => `<td>${s > 0 ? s : '-'}</td>`).join('')}
                <td><strong>${r.total > 0 ? r.total : '-'}</strong></td>
                <td><strong>${r.mean > 0 ? r.mean + '%' : '-'}</strong></td>
                <td><span class="rating-badge" style="background:${r.rating.color}20; color:${r.rating.color}">${r.rating.code}</span></td>
            </tr>
        `).join('');
    }

    if (statsEl) {
        const ee = studentResults.filter(r => r.rating.code === 'EE').length;
        const me = studentResults.filter(r => r.rating.code === 'ME').length;
        const ae = studentResults.filter(r => r.rating.code === 'AE').length;
        const be = studentResults.filter(r => r.rating.code === 'BE').length;
        statsEl.textContent = `EE: ${ee} | ME: ${me} | AE: ${ae} | BE: ${be}`;
    }
}

function filterResultRows() {
    const search = (getVal('resultsSearch') || '').toLowerCase();
    const rows = $('resultsBody')?.querySelectorAll('tr');
    if (!rows) return;
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        const name = cells[1]?.textContent.toLowerCase() || '';
        const adm = cells[2]?.textContent.toLowerCase() || '';
        row.style.display = (name.includes(search) || adm.includes(search)) ? '' : 'none';
    });
}

function printResults() { window.print(); }

function exportResultsPDF() {
    const assessId = getVal('resultsAssessment');
    const assessment = (store.examSchedules || []).find(a => a.id === assessId);
    if (!assessment || typeof jspdf === 'undefined') return showToast('PDF library not loaded.', 'error');

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('landscape');
    doc.setFontSize(14);
    doc.text(assessment.name || `${assessment.type} — ${assessment.grade}`, 14, 15);
    doc.setFontSize(9);
    doc.text(`${assessment.term} | ${assessment.year} | ${store.settings.schoolName}`, 14, 22);

    const subjects = (assessment.subjects || []).map(sid => (store.learningAreas || []).find(la => la.id === sid)).filter(Boolean);
    const students = StudentRepo.findBy('grade', assessment.grade);
    const exams = (store.exams || []).filter(e => e.assessId === assessId);

    const headers = ['#', 'Name', 'Reg', ...subjects.map(s => s.name), 'Mean', 'Rating'];
    const rows = students.map((student, idx) => {
        const sExams = exams.filter(e => e.studentId === student.id);
        let total = 0, count = 0;
        const scores = subjects.map(subj => {
            const exam = sExams.find(e => e.subjectId === subj.id);
            const sc = exam ? parseInt(exam.score) || 0 : 0;
            if (sc > 0) { total += sc; count++; }
            return sc;
        });
        const mean = count > 0 ? Math.round(total / count) : 0;
        return [idx + 1, student.name, student.reg || 'N/A', ...scores, mean > 0 ? mean + '%' : '-', cbcRating(mean).code];
    });

    doc.autoTable({ head: [headers], body: rows, startY: 28, styles: { fontSize: 7 } });
    doc.save(`${assessment.type}_${assessment.grade}.pdf`);
    showToast('PDF exported!');
}


function exportResultsExcel() {
    const assessId = getVal('resultsAssessment');
    const assessment = (store.examSchedules || []).find(a => a.id === assessId);
    if (!assessment || typeof XLSX === 'undefined') return showToast('Excel library not loaded.', 'error');

    const subjects = (assessment.subjects || []).map(sid => (store.learningAreas || []).find(la => la.id === sid)).filter(Boolean);
    const students = StudentRepo.findBy('grade', assessment.grade);
    const exams = (store.exams || []).filter(e => e.assessId === assessId);

    const data = [['#', 'Name', 'Reg', ...subjects.map(s => s.name), 'Mean', 'Rating']];
    students.forEach((student, idx) => {
        const sExams = exams.filter(e => e.studentId === student.id);
        let total = 0, count = 0;
        const scores = subjects.map(subj => {
            const exam = sExams.find(e => e.subjectId === subj.id);
            const sc = exam ? parseInt(exam.score) || 0 : 0;
            if (sc > 0) { total += sc; count++; }
            return sc;
        });
        const mean = count > 0 ? Math.round(total / count) : 0;
        data.push([idx + 1, student.name, student.reg || 'N/A', ...scores, mean, cbcRating(mean).code]);
    });

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, assessment.type);
    XLSX.writeFile(wb, `${assessment.type}_${assessment.grade}.xlsx`);
    showToast('Excel exported!');
}


// --- TAB 4: SUBJECT ANALYSIS ---
function loadSubjectAnalysis() {
    const assessId = getVal('analysisAssessment');
    const subjectFilter = getVal('analysisSubject') || 'all';
    const wrapper = $('analysisWrapper');
    const emptyEl = $('analysisEmpty');
    const kpiRow = $('subjectAnalysisKpis');
    const tbody = $('analysisBody');

    if (!assessId) {
        if (wrapper) wrapper.style.display = 'none';
        if (emptyEl) emptyEl.style.display = 'block';
        return;
    }

    const assessment = (store.examSchedules || []).find(a => a.id === assessId);
    if (!assessment) return;

    let subjects = (assessment.subjects || []).map(sid => (store.learningAreas || []).find(la => la.id === sid)).filter(Boolean);
    if (subjectFilter !== 'all') subjects = subjects.filter(s => s.id === subjectFilter);

    const exams = (store.exams || []).filter(e => e.assessId === assessId);

    if (subjects.length === 0) {
        if (wrapper) wrapper.style.display = 'none';
        if (emptyEl) emptyEl.style.display = 'block';
        return;
    }

    if (wrapper) wrapper.style.display = 'block';
    if (emptyEl) emptyEl.style.display = 'none';

    // KPIs
    if (kpiRow) {
        const allScores = exams.filter(e => e.score > 0).map(e => parseInt(e.score));
        const avg = allScores.length ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0;
        const highest = allScores.length ? Math.max(...allScores) : 0;
        const lowest = allScores.length ? Math.min(...allScores) : 0;
        const ee = allScores.filter(s => s >= 80).length;

        kpiRow.innerHTML = `
            <div class="modern-card" style="padding:1rem; text-align:center;">
                <div style="color:var(--text-muted); font-size:0.8rem;">Mean Score</div>
                <div style="font-size:1.5rem; font-weight:700; color:var(--primary);">${avg}%</div>
            </div>
            <div class="modern-card" style="padding:1rem; text-align:center;">
                <div style="color:var(--text-muted); font-size:0.8rem;">Highest</div>
                <div style="font-size:1.5rem; font-weight:700; color:#22c55e;">${highest}</div>
            </div>
            <div class="modern-card" style="padding:1rem; text-align:center;">
                <div style="color:var(--text-muted); font-size:0.8rem;">Lowest</div>
                <div style="font-size:1.5rem; font-weight:700; color:#ef4444;">${lowest}</div>
            </div>
            <div class="modern-card" style="padding:1rem; text-align:center;">
                <div style="color:var(--text-muted); font-size:0.8rem;">EE Count</div>
                <div style="font-size:1.5rem; font-weight:700; color:#22c55e;">${ee}</div>
            </div>
        `;
    }

    // Table
    if (tbody) {
        tbody.innerHTML = subjects.map(subj => {
            const subjExams = exams.filter(e => e.subjectId === subj.id && e.score > 0);
            const scores = subjExams.map(e => parseInt(e.score));
            const mean = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
            const highest = scores.length ? Math.max(...scores) : 0;
            const lowest = scores.length ? Math.min(...scores) : 0;
            const ee = scores.filter(s => s >= 80).length;
            const me = scores.filter(s => s >= 50 && s < 80).length;
            const ae = scores.filter(s => s >= 30 && s < 50).length;
            const be = scores.filter(s => s < 30).length;

            return `<tr>
                <td>${escapeHtml(subj.name)}</td>
                <td style="text-align:center;">${subjExams.length}</td>
                <td style="text-align:center;"><strong>${mean}</strong></td>
                <td style="text-align:center; color:#22c55e;">${highest}</td>
                <td style="text-align:center; color:#ef4444;">${lowest}</td>
                <td style="text-align:center; color:#22c55e;">${ee}</td>
                <td style="text-align:center; color:#3b82f6;">${me}</td>
                <td style="text-align:center; color:#f59e0b;">${ae}</td>
                <td style="text-align:center; color:#ef4444;">${be}</td>
            </tr>`;
        }).join('');
    }
}

function exportAnalysisPDF() { exportResultsPDF(); }

// --- TAB 5: BATCH ENTRY ---
function loadBatchGrid() {
    const assessId = getVal('batchAssessment');
    const wrapper = $('batchWrapper');
    const emptyEl = $('batchEmpty');
    const titleEl = $('batchTitle');
    const thead = $('batchHead');
    const tbody = $('batchBody');
    const statsEl = $('batchStats');

    if (!assessId) {
        if (wrapper) wrapper.style.display = 'none';
        if (emptyEl) emptyEl.style.display = 'block';
        return;
    }

    const assessment = (store.examSchedules || []).find(a => a.id === assessId);
    if (!assessment) return;

    const subjects = (assessment.subjects || []).map(sid => (store.learningAreas || []).find(la => la.id === sid)).filter(Boolean);
    const students = StudentRepo.findBy('grade', assessment.grade);
    const exams = (store.exams || []).filter(e => e.assessId === assessId);

    if (students.length === 0 || subjects.length === 0) {
        if (wrapper) wrapper.style.display = 'none';
        if (emptyEl) emptyEl.style.display = 'block';
        return;
    }

    if (wrapper) wrapper.style.display = 'block';
    if (emptyEl) emptyEl.style.display = 'none';
    if (titleEl) titleEl.textContent = assessment.name || `${assessment.type} — ${assessment.grade}`;

    // Header
    if (thead) {
        thead.innerHTML = `<tr>
            <th style="width:40px;">#</th><th>Name</th><th>ADM No</th>
            ${subjects.map(s => `<th style="min-width:80px; font-size:0.75rem;">${escapeHtml(s.name)}</th>`).join('')}
            <th style="min-width:60px;">Mean</th><th style="min-width:50px;">Rating</th>
        </tr>`;
    }

    // Body
    if (tbody) {
        tbody.innerHTML = students.map((student, idx) => {
            const sExams = exams.filter(e => e.studentId === student.id);
            let total = 0, count = 0;
            const cells = subjects.map(subj => {
                const exam = sExams.find(e => e.subjectId === subj.id);
                const sc = exam ? exam.score : '';
                if (sc) { total += parseInt(sc); count++; }
                return `<td><input type="number" min="0" max="100" class="batch-score-input" data-assess="${assessId}" data-student="${student.id}" data-subject="${subj.id}" value="${sc}" onchange="handleBatchScoreChange(this)"></td>`;
            }).join('');

            const mean = count > 0 ? Math.round(total / count) : 0;
            const rating = cbcRating(mean);

            return `<tr data-batch-name="${escapeHtml(student.name).toLowerCase()}">
                <td>${idx + 1}</td>
                <td>${escapeHtml(student.name)}</td>
                <td>${escapeHtml(student.reg || 'N/A')}</td>
                ${cells}
                <td class="batch-mean" data-student="${student.id}"><strong>${mean > 0 ? mean : '-'}</strong></td>
                <td class="batch-rating" data-student="${student.id}"><span class="rating-badge" style="background:${rating.color}20; color:${rating.color}">${mean > 0 ? rating.code : '-'}</span></td>
            </tr>`;
        }).join('');
    }

    if (statsEl) statsEl.textContent = `${students.length} learners × ${subjects.length} subjects`;
}

function handleBatchScoreChange(input) {
    let score = parseInt(input.value);
    if (isNaN(score) || score < 0) score = 0;
    if (score > 100) { score = 100; input.value = 100; }

    const assessId = input.dataset.assess;
    const studentId = input.dataset.student;
    const subjectId = input.dataset.subject;
    const assessment = (store.examSchedules || []).find(a => a.id === assessId);

    const existingIdx = (store.exams || []).findIndex(e => e.assessId === assessId && e.studentId === studentId && e.subjectId === subjectId);

    if (score === 0 && input.value === '') {
        if (existingIdx !== -1) store.exams.splice(existingIdx, 1);
    } else if (existingIdx !== -1) {
        store.exams[existingIdx].score = score;
    } else if (score > 0) {
        store.exams.push({
            id: generateId(), assessId, studentId, subjectId, score,
            type: assessment?.type || 'Opener',
            term: assessment?.term || '',
            year: assessment?.year || new Date().getFullYear().toString(),
            grade: assessment?.grade || '',
            createdAt: Date.now()
        });
    }

    // Update row mean & rating
    const row = input.closest('tr');
    if (row) {
        const inputs = row.querySelectorAll('.batch-score-input');
        let total = 0, count = 0;
        inputs.forEach(inp => { const v = parseInt(inp.value) || 0; if (v > 0) { total += v; count++; } });
        const mean = count > 0 ? Math.round(total / count) : 0;
        const rating = cbcRating(mean);
        const meanCell = row.querySelector('.batch-mean');
        const ratingCell = row.querySelector('.batch-rating');
        if (meanCell) meanCell.innerHTML = `<strong>${mean > 0 ? mean : '-'}</strong>`;
        if (ratingCell) ratingCell.innerHTML = `<span class="rating-badge" style="background:${rating.color}20; color:${rating.color}">${mean > 0 ? rating.code : '-'}</span>`;
    }

    _flushNow();
}

function filterBatchRows() {
    const search = (getVal('batchSearch') || '').toLowerCase();
    const rows = $('batchBody')?.querySelectorAll('tr');
    if (!rows) return;
    rows.forEach(row => {
        const name = row.dataset.batchName || '';
        row.style.display = name.includes(search) ? '' : 'none';
    });
}

function saveBatchScores() {
    saveData();
    showToast('Batch scores saved!');
}

function saveBatchAndClose() {
    saveData();
    const assessId = getVal('batchAssessment');
    if (assessId) {
        const idx = (store.examSchedules || []).findIndex(a => a.id === assessId);
        if (idx !== -1) store.examSchedules[idx].status = 'closed';
        saveData();
    }
    showToast('Batch saved & assessment closed!');
    renderAssessmentCards();
}

// --- BATCH UPLOAD STATE ---
let _batchUploadData = null;

function downloadBatchTemplate() {
    if (typeof XLSX === 'undefined') return showToast('Excel library not loaded.', 'error');
    const assessId = getVal('batchAssessment');
    const assessment = (store.examSchedules || []).find(a => a.id === assessId);
    if (!assessment) return showToast('Select an assessment first.', 'error');

    const subjects = (assessment.subjects || []).map(sid => (store.learningAreas || []).find(la => la.id === sid)).filter(Boolean);
    const students = StudentRepo.findBy('grade', assessment.grade);

    const data = [['#', 'Name', 'ADM No', ...subjects.map(s => s.name)]];
    students.forEach((student, idx) => {
        data.push([idx + 1, student.name, student.reg || 'N/A', ...subjects.map(() => '')]);
    });

    const ws = XLSX.utils.aoa_to_sheet(data);
    // Set column widths
    ws['!cols'] = [
        { wch: 5 }, { wch: 30 }, { wch: 15 },
        ...subjects.map(() => ({ wch: 18 }))
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${assessment.type}_${assessment.grade}`);
    XLSX.writeFile(wb, `Batch_Template_${assessment.grade}_${assessment.type}.xlsx`);
    showToast('Empty template downloaded!');
}

function downloadBatchScores() {
    if (typeof XLSX === 'undefined') return showToast('Excel library not loaded.', 'error');
    const assessId = getVal('batchAssessment');
    const assessment = (store.examSchedules || []).find(a => a.id === assessId);
    if (!assessment) return showToast('Select an assessment first.', 'error');

    const subjects = (assessment.subjects || []).map(sid => (store.learningAreas || []).find(la => la.id === sid)).filter(Boolean);
    const students = StudentRepo.findBy('grade', assessment.grade);
    const exams = (store.exams || []).filter(e => e.assessId === assessId);

    const data = [['#', 'Name', 'ADM No', ...subjects.map(s => s.name), 'Mean', 'Rating']];
    students.forEach((student, idx) => {
        const sExams = exams.filter(e => e.studentId === student.id);
        let total = 0, count = 0;
        const scores = subjects.map(subj => {
            const exam = sExams.find(e => e.subjectId === subj.id);
            const sc = exam ? parseInt(exam.score) || 0 : 0;
            if (sc > 0) { total += sc; count++; }
            return sc;
        });
        const mean = count > 0 ? Math.round(total / count) : 0;
        data.push([idx + 1, student.name, student.reg || 'N/A', ...scores, mean, cbcRating(mean).code]);
    });

    const ws = XLSX.utils.aoa_to_sheet(data);
    ws['!cols'] = [
        { wch: 5 }, { wch: 30 }, { wch: 15 },
        ...subjects.map(() => ({ wch: 14 })),
        { wch: 8 }, { wch: 8 }
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${assessment.type}_${assessment.grade}`);
    XLSX.writeFile(wb, `${assessment.type}_${assessment.grade}_Scores_${new Date().toISOString().slice(0,10)}.xlsx`);
    showToast('Scores spreadsheet downloaded!');
}



function openBatchUploadModal() {
    _batchUploadData = null;
    const fileInput = $('batchUploadFile');
    if (fileInput) fileInput.value = '';
    const preview = $('batchUploadPreview');
    if (preview) preview.style.display = 'none';
    const stats = $('batchPreviewStats');
    if (stats) stats.textContent = '';
    const content = $('batchPreviewContent');
    if (content) content.innerHTML = '';
    openModal('batchUploadModal');
}
function resetBatchUploadModal() {
    _batchUploadData = null;
    const fileInput = $('batchUploadFile');
    if (fileInput) fileInput.value = '';
    const preview = $('batchUploadPreview');
    if (preview) preview.style.display = 'none';
    const stats = $('batchPreviewStats');
    if (stats) stats.textContent = '';
    const content = $('batchPreviewContent');
    if (content) content.innerHTML = '';
}
function handleBatchFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file extension
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
        showToast('Please select a valid Excel file (.xlsx or .xls)', 'error');
        e.target.value = '';
        return;
    }

    // Check XLSX library availability
    if (typeof XLSX === 'undefined') {
        showToast('Excel library not loaded. Please refresh the page and try again.', 'error');
        e.target.value = '';
        return;
    }

    // Check assessment selection
    const assessId = getVal('batchAssessment');
    const assessment = (store.examSchedules || []).find(a => a.id === assessId);
    if (!assessment) {
        showToast('Please select an assessment from the dropdown before uploading.', 'error');
        e.target.value = '';
        return;
    }

    const subjects = (assessment.subjects || []).map(sid => (store.learningAreas || []).find(la => la.id === sid)).filter(Boolean);
    if (subjects.length === 0) {
        showToast('The selected assessment has no subjects configured.', 'error');
        e.target.value = '';
        return;
    }

    // Show loading state
    const preview = $('batchUploadPreview');
    const content = $('batchPreviewContent');
    const stats   = $('batchPreviewStats');
    if (content) content.innerHTML = '<div style="padding:2rem; text-align:center;"><i class="fa-solid fa-spinner fa-spin" style="font-size:1.5rem; color:var(--primary);"></i><p style="margin-top:0.75rem; color:var(--text-muted);">Reading spreadsheet...</p></div>';
    if (preview) preview.style.display = 'block';
    if (stats) stats.textContent = 'Processing...';

    const reader = new FileReader();

    reader.onerror = function() {
        if (content) content.innerHTML = '<div style="padding:2rem; text-align:center; color:var(--danger);"><i class="fa-solid fa-triangle-exclamation" style="font-size:1.5rem;"></i><p style="margin-top:0.75rem;">Failed to read the file. The file may be corrupted or in use by another program.</p></div>';
        if (stats) stats.textContent = 'Error reading file';
    };

    reader.onload = function(evt) {
        try {
            const arrayBuffer = evt.target.result;

            // ★★★ FIX: Declare statsEl at the TOP of try so it's always in scope ★★★
            const statsEl = $('batchStats');

            // Try to read the workbook
            let workbook;
            try {
                workbook = XLSX.read(arrayBuffer, {
                    type: 'array',
                    cellDates: true,
                    cellNF: true,
                    cellText: true
                });
            } catch (readErr) {
                console.error('XLSX.read error:', readErr);
                throw new Error('Could not parse the file structure. It may be corrupted or saved in an incompatible format.');
            }

            // Validate workbook has sheets
            if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
                throw new Error('The file contains no sheets. It may be empty or not a valid Excel file.');
            }

            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];

            // Validate sheet has data
            if (!sheet) {
                throw new Error(`Could not read the first sheet "${sheetName}". The sheet may be empty or protected.`);
            }

            // Check if sheet has any actual data
            const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
            if (!range || (range.e.r - range.s.r <= 0 && range.e.c - range.s.c <= 0)) {
                throw new Error('The first sheet appears to be completely empty. Add a header row and at least one data row.');
            }

            // Convert to JSON
            let json;
            try {
                json = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false });
            } catch (jsonErr) {
                console.error('sheet_to_json error:', jsonErr);
                throw new Error('Could not convert sheet data to readable format.');
            }

            if (!json || json.length === 0) {
                throw new Error('The sheet has a header row but no data rows. Add student data below the header.');
            }

            // Get raw headers (preserving original case/spaces)
            let rawHeaders;
            try {
                rawHeaders = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true, defval: '' })[0];
            } catch (rawErr) {
                rawHeaders = json[0];
            }

            if (!rawHeaders || typeof rawHeaders !== 'object') {
                throw new Error('Could not read column headers from the first row.');
            }

            const headers = Array.isArray(rawHeaders) 
    ? rawHeaders.map(h => String(h)) 
    : Object.keys(rawHeaders);

            // Build normalized header lookup: lowercase -> { index, original }
            const headerLookup = {};
            headers.forEach((h, i) => {
                const key = String(h).toLowerCase().trim();
                headerLookup[key] = { index: i, original: String(h) };
            });

            // Map spreadsheet columns to our subjects using 3 strategies
            const subjectMap = [];
            const usedColumns = new Set();
            let matchedCount = 0;

            subjects.forEach(subj => {
                let matched = false;

                // Strategy 1: Exact match (case-insensitive)
                const exactKey = subj.name.toLowerCase().trim();
                if (headerLookup[exactKey] && !usedColumns.has(headerLookup[exactKey].index)) {
                    subjectMap.push({ colIndex: headerLookup[exactKey].index, headerName: headerLookup[exactKey].original, subjectId: subj.id, subjectName: subj.name });
                    usedColumns.add(headerLookup[exactKey].index);
                    matched = true;
                    matchedCount++;
                }

                // Strategy 2: Substring/first-word match
                if (!matched) {
                    const firstWord = subj.name.toLowerCase().split(/[\s\-()\/,]/)[0];
                    for (const [key, val] of Object.entries(headerLookup)) {
                        if (usedColumns.has(val.index)) continue;
                        const headerKey = key;

                        if (headerKey.length >= 3 && (subj.name.toLowerCase().includes(headerKey) || headerKey.includes(subj.name.toLowerCase()))) {
                            subjectMap.push({ colIndex: val.index, headerName: val.original, subjectId: subj.id, subjectName: subj.name });
                            usedColumns.add(val.index);
                            matched = true;
                            matchedCount++;
                            break;
                        }

                        if (firstWord.length >= 3 && headerKey.includes(firstWord) && !subjectMap.some(sm => sm.colIndex === val.index)) {
                            subjectMap.push({ colIndex: val.index, headerName: val.original, subjectId: subj.id, subjectName: subj.name });
                            usedColumns.add(val.index);
                            matched = true;
                            matchedCount++;
                            break;
                        }
                    }
                }

                // Strategy 3: Subject code match (e.g., "JS-MATH" in header)
                if (!matched && subj.code) {
                    const codeLower = subj.code.toLowerCase();
                    for (const [key, val] of Object.entries(headerLookup)) {
                        if (usedColumns.has(val.index)) continue;
                        if (key.includes(codeLower)) {
                            subjectMap.push({ colIndex: val.index, headerName: val.original, subjectId: subj.id, subjectName: subj.name });
                            usedColumns.add(val.index);
                            matched = true;
                            matchedCount++;
                            break;
                        }
                    }
                }
            });

            // Find ADM No column
            let admColIdx = -1;
            for (const [key, val] of Object.entries(headerLookup)) {
                if (/^(adm|adm\s*no|reg\s*no|admission|index|adm\.?\s*no)/i.test(key)) {
                    admColIdx = val.index;
                    break;
                }
            }
            if (admColIdx === -1) admColIdx = headers.length > 2 ? 2 : 1;

            // Find Name column
            let nameColIdx = -1;
            for (const [key, val] of Object.entries(headerLookup)) {
                if (/^(name|student\s*name|full\s*name|learner|candidate)/i.test(key)) {
                    nameColIdx = val.index;
                    break;
                }
            }
            if (nameColIdx === -1) nameColIdx = headers.length > 1 ? 1 : 0;

            // Store parsed data
            _batchUploadData = { json, subjectMap, admColIdx, nameColIdx, subjects, assessment, headerLookup };

            // Build preview table
            const maxPreviewRows = 12;
            const previewData = json.slice(0, maxPreviewRows);
            const matchedHeaders = subjectMap.map(sm => sm.headerName);

            let previewHtml = `
                <table style="width:100%; border-collapse:collapse; font-size:0.75rem; min-width:100%; border:1px solid var(--border); border-radius:8px; overflow:hidden;">
                    <thead><tr style="background:var(--bg-secondary, #f8fafc);">
                        <th style="padding:8px; border-bottom:2px solid var(--border); text-align:left; position:sticky; top:0; z-index:2;">Name</th>
                        <th style="padding:8px; border-bottom:2px solid var(--border); text-align:left; position:sticky; top:0; z-index:2;">ADM No</th>
                        ${matchedHeaders.map(h => `<th style="padding:8px; border-bottom:2px solid var(--border); text-align:center; position:sticky; top:0; z-index:2; white-space:nowrap; max-width:100px; overflow:hidden; text-overflow:ellipsis;" title="${escapeHtml(h)}">${escapeHtml(h)}</th>`).join('')}
                    </tr></thead>
                    <tbody>
            `;

            let validScoreCount = 0;
            let totalScoreCells = 0;

            previewData.forEach((row, rowIdx) => {
                const rowValues = Object.values(row);
                const name = String(rowValues[nameColIdx] || '').trim();
                const adm = String(rowValues[admColIdx] || '').trim();

                const scoreCells = subjectMap.map(sm => {
                    const rawVal = rowValues[sm.colIndex];
                    let bgColor = '';
                    let displayVal = '-';

                    if (rawVal !== '' && rawVal !== null && rawVal !== undefined) {
                        const score = parseFloat(rawVal);
                        totalScoreCells++;

                        if (!isNaN(score) && isFinite(score)) {
                            const intScore = Math.round(score);
                            if (intScore > 0) validScoreCount++;
                            if (intScore >= 80) bgColor = 'background:rgba(34,197,94,0.15); color:#15803d;';
                            else if (intScore >= 50) bgColor = 'background:rgba(59,130,246,0.15); color:#1e40af;';
                            else if (intScore >= 30) bgColor = 'background:rgba(245,158,11,0.15); color:#92400e;';
                            else if (intScore > 0) bgColor = 'background:rgba(239,68,68,0.15); color:#991b1b;';
                            if (intScore > 100) bgColor = 'background:rgba(239,68,68,0.3); color:#991b1b;';
                            displayVal = intScore;
                        } else {
                            bgColor = 'background:rgba(245,158,11,0.1); color:#92400e;';
                            displayVal = '?';
                        }
                    }
                    return `<td style="padding:6px 4px; border-bottom:1px solid var(--border); text-align:center; ${bgColor}">${displayVal}</td>`;
                }).join('');

                const rowBg = rowIdx % 2 === 0 ? '' : 'background:rgba(0,0,0,0.015);';
                previewHtml += `
                    <tr style="${rowBg}">
                        <td style="padding:8px; border-bottom:1px solid var(--border); max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${escapeHtml(name)}">${escapeHtml(name || '(no name)')}</td>
                        <td style="padding:8px; border-bottom:1px solid var(--border); font-family:monospace; font-size:0.7rem; white-space:nowrap;">${escapeHtml(adm || '(no adm)')}</td>
                        ${scoreCells}
                    </tr>
                `;
            });

            if (json.length > maxPreviewRows) {
                previewHtml += `<tr><td colspan="${2 + matchedHeaders.length}" style="padding:10px; border-bottom:1px solid var(--border); text-align:center; color:var(--text-muted); font-style:italic;">... and ${json.length - maxPreviewRows} more rows</td></tr>`;
            }

            previewHtml += '</tbody></table>';

            // Column mapping summary
            let mappingHtml = '<div style="margin-top:1rem; padding:0.75rem; background:rgba(34,197,94,0.05); border:1px solid rgba(34,197,94,0.2); border-radius:8px; font-size:0.78rem;">';
            mappingHtml += '<strong style="display:block; margin-bottom:0.4rem;">Column Mapping:</strong>';
            subjectMap.forEach(sm => {
                mappingHtml += `<span style="display:inline-block; margin:0.15rem 0.5rem 0.15rem 0; padding:0.2rem 0.5rem; background:rgba(34,197,94,0.15); border-radius:4px;">"${escapeHtml(sm.headerName)}" → <strong>${escapeHtml(sm.subjectName)}</strong></span>`;
            });
            mappingHtml += '</div>';
            previewHtml += mappingHtml;

            if (content) content.innerHTML = previewHtml;
            if (preview) preview.style.display = 'block';

            // ★★★ FIX: Use the hoisted statsEl with a null guard ★★★
            if (statsEl) {
                const unmatched = subjects.length - matchedCount;
                let statsHtml = `<strong>${json.length}</strong> rows, <strong style="color:var(--success)">${matchedCount}</strong>/${subjects.length} subjects matched`;
                if (unmatched > 0) {
                    statsHtml += ` &middot; <strong style="color:var(--warning)">${unmatched} unmatched</strong>`;
                }
                statsHtml += ` &middot; <strong>${validScoreCount}</strong> valid scores`;
                statsEl.innerHTML = statsHtml;
            }
            // Also update the other stats element if it exists
            if (stats) {
                stats.textContent = `${json.length} rows · ${matchedCount}/${subjects.length} subjects · ${validScoreCount} scores`;
            }

            // Toast
            if (matchedCount === 0) {
                showToast('No subject columns matched. Ensure headers match subject names: ' + subjects.map(s => `"${s.name}"`).join(', '), 'error');
            } else if (matchedCount < subjects.length) {
                showToast(`Matched ${matchedCount} of ${subjects.length} subjects. Review the preview carefully.`, 'warning');
            } else {
                showToast(`Perfect match! All ${subjects.length} subjects mapped. Review and click "Apply Scores".`, 'success');
            }

        } catch (err) {
            console.error('Upload error details:', err);

            let userMessage = 'Failed to read spreadsheet. ';
            if (err.message && err.message.length < 150) {
                userMessage += err.message;
            } else {
                userMessage += 'Make sure it is a valid .xlsx file with headers in the first row and student data below.';
            }

            if (content) {
                content.innerHTML = `
                    <div style="padding:2rem; text-align:center;">
                        <i class="fa-solid fa-file-circle-xmark" style="font-size:2.5rem; color:var(--danger); margin-bottom:1rem; display:block;"></i>
                        <h4 style="margin:0 0 0.5rem; color:var(--danger);">Upload Failed</h4>
                        <p style="color:var(--text-muted); margin:0 0 1rem; line-height:1.5;">${userMessage}</p>
                        <p style="color:var(--text-muted); font-size:0.8rem;">Expected format: Column A = #, B = Name, C = ADM No, D+ = Subject scores</p>
                    </div>
                `;
            }
            if (stats) stats.textContent = 'Error';
        }
    };

    reader.readAsArrayBuffer(file);
}
function confirmBatchUpload() {
    if (!_batchUploadData) {
        showToast('No upload data found. Select a file first.', 'error');
        return;
    }

    const { json, subjectMap, admColIdx, nameColIdx, subjects, assessment } = _batchUploadData;
    const assessId = assessment.id;
    
    let imported = 0;
    let skipped = 0;
    let invalidCount = 0;
    let studentNotFound = 0;

    json.forEach((row, rowIdx) => {
        const values = Object.values(row);
        const adm = String(values[admColIdx] || '').trim();
        const studentName = String(values[nameColIdx] || '').trim();

        if (!adm && !studentName) {
            skipped++;
            return;
        }

        // Find student by ADM No (try exact match, then partial)
        let student = null;
        const studentsInGrade = StudentRepo.findBy('grade', assessment.grade);

        if (adm) {
            // Exact match on reg or idNumber
            student = studentsInGrade.find(s =>
                (s.reg || '').toLowerCase() === adm.toLowerCase() ||
                (s.idNumber || '').toLowerCase() === adm.toLowerCase()
            );

            // Partial match if exact failed
            if (!student) {
                student = studentsInGrade.find(s =>
                    (s.reg || '').toLowerCase().includes(adm.toLowerCase()) ||
                    (s.idNumber || '').toLowerCase().includes(adm.toLowerCase())
                );
            }
        }

        // If still not found by ADM, try by name
        if (!student && studentName) {
            student = studentsInGrade.find(s =>
                (s.name || '').toLowerCase().includes(studentName.toLowerCase())
            );
        }

        if (!student) {
            studentNotFound++;
            return;
        }

        // Process each matched subject column
        subjectMap.forEach(sm => {
            const rawVal = values[sm.colIndex];
            let score = parseInt(rawVal);

            // Skip empty, non-numeric, or explicitly zero values
            if (rawVal === '' || rawVal === null || rawVal === undefined) return;
            if (isNaN(score)) {
                invalidCount++;
                return;
            }

            // Clamp score
            if (score < 0) score = 0;
            if (score > 100) score = 100;

            // Don't import zero scores (would erase existing data)
            if (score === 0) return;

            // Find existing exam record
            const existingIdx = (store.exams || []).findIndex(e =>
                e.assessId === assessId &&
                e.studentId === student.id &&
                e.subjectId === sm.subjectId
            );

            if (existingIdx !== -1) {
                // Update existing
                store.exams[existingIdx].score = score;
            } else {
                // Create new
                store.exams.push({
                    id: generateId(),
                    assessId: assessId,
                    studentId: student.id,
                    subjectId: sm.subjectId,
                    score: score,
                    type: assessment.type,
                    term: assessment.term,
                    year: assessment.year || store.settings.academicYear,
                    grade: assessment.grade,
                    createdAt: Date.now()
                });
            }
            imported++;
        });
    });

    // Save to server/localStorage
    saveData();

    // Close modal
    closeModal('batchUploadModal');

    // Refresh the batch grid to show new scores
    loadBatchGrid();

    // Build result message
    let msgParts = [];
    if (imported > 0) msgParts.push(`<strong style="color:var(--success)">${imported}</strong> scores imported`);
    if (skipped > 0) msgParts.push(`<strong>${skipped}</strong> rows skipped (no ADM/Name)`);
    if (studentNotFound > 0) msgParts.push(`<strong style="color:var(--warning)">${studentNotFound}</strong> students not found`);
    if (invalidCount > 0) msgParts.push(`<strong style="color:var(--danger)">${invalidCount}</strong> invalid values`);

    const msg = msgParts.length > 0 ? msgParts.join(' &middot; ') : 'No scores were imported.';
    showToast(msg, imported > 0 ? 'success' : 'warning');

    // Clear upload state
    _batchUploadData = null;
}



function examExportExcel() { exportResultsExcel(); }
function examImportScores() { switchExamTab('batch'); }
function processImportedScores() {}

// ==========================================================================
//   VIRTUAL ASSESSMENTS INIT (Placeholder for existing code)
// ==========================================================================
function initVirtualAssessments() {
    virtualAssessments = [];
    const grades = Object.keys(CBC_LEVELS);
    const types = VALID_ASSESSMENT_TYPES;
    // Force year to be a string to prevent type-mismatch bugs
    const term = store.settings.currentTerm || 'Term 1';
    const year = String(store.settings.academicYear || new Date().getFullYear());

    grades.forEach(grade => {
        const subjectsForGrade = store.learningAreas.filter(la => la.applicableLevels && la.applicableLevels.includes(grade));
        types.forEach(type => {
            subjectsForGrade.forEach(subject => {
                // Check against grade, type, subject, term, AND year
                const existingScores = store.exams.filter(e => 
                    e.grade === grade && 
                    e.type === type && 
                    e.subjectId === subject.id && 
                    e.term === term && 
                    String(e.year) === year
                );
                const scored = existingScores.filter(e => e.score > 0).length;
                const totalStudents = StudentRepo.findBy('grade', grade).length;
                
                virtualAssessments.push({
                    id: `${grade}-${type}-${subject.id}`,
                    grade, type, subjectId: subject.id, subjectName: subject.name, term, year,
                    totalStudents, scoredCount: scored,
                    progress: totalStudents > 0 ? Math.round((scored / totalStudents) * 100) : 0
                });
            });
        });
    });
}


function seedStaffData() {
    if (StaffRepo.count() === 0) {
        // Seed minimal default staff so app doesn't crash
        StaffRepo.create({ name: 'Admin User', designation: 'School Admin', department: 'Administration', phone: '0712345678', role: 'admin' });
    }
}


// ==========================================================================
//   STUBS FOR REMAINING SECTIONS
//   (Paste your original code for these sections below this line)
// ==========================================================================

function toggleSidebar() {
    const sidebar = $('sidebar');
    if (sidebar) sidebar.classList.toggle('open');
}

function handleGlobalSearch(q) {
    if (!q) return;
    const qLower = q.toLowerCase();
    const student = StudentRepo.getAll().find(s => (s.name || '').toLowerCase().includes(qLower) || (s.reg || '').toLowerCase().includes(qLower));
    if (student) return viewStudent(student.id);
    const staff = StaffRepo.getAll().find(s => (s.name || '').toLowerCase().includes(qLower));
    if (staff) return router('staff');
    showToast('No results found.', 'info');
}

function updateHeaderAndDashboard() {}
function updateSettingsForm() {
    const s = store.settings;
    setVal('schoolName', s.schoolName);
    setVal('schoolMotto', s.motto);
    setVal('schoolCode', s.schoolCode);
    setVal('academicYear', s.academicYear);
    setVal('currentTerm', s.currentTerm);
    setVal('schoolLevel', s.level);
    setVal('schoolCategory', s.category);
    setVal('hoiName', s.hoiName);
    setVal('hoiTitle', s.hoiTitle);
    setVal('hoiTsc', s.hoiTsc);
    setVal('hoiPhone', s.hoiPhone);
    setVal('hoiEmail', s.hoiEmail);
    setVal('address', s.address);
    setVal('phone', s.phone);
    setVal('email', s.email);
}
function saveInstitutionDetails(e) { e.preventDefault(); Object.assign(store.settings, { schoolName: getVal('schoolName'), motto: getVal('schoolMotto'), schoolCode: getVal('schoolCode'), academicYear: getVal('academicYear'), currentTerm: getVal('currentTerm'), level: getVal('schoolLevel'), category: getVal('schoolCategory'), address: getVal('address'), phone: getVal('phone'), email: getVal('email') }); saveData(); showToast('Institution details saved!'); }
function saveHOIDetails(e) { e.preventDefault(); Object.assign(store.settings, { hoiName: getVal('hoiName'), hoiTitle: getVal('hoiTitle'), hoiTsc: getVal('hoiTsc'), hoiPhone: getVal('hoiPhone'), hoiEmail: getVal('hoiEmail') }); saveData(); showToast('HOI details saved!'); }
function switchSettingsTab() {}

function renderStaff() { const c = $('staffGrid') || $('staffListContainer'); if (c) c.innerHTML = '<div class="empty-state">Staff section — paste your original renderStaff code here.</div>'; }
function editStaff(id) { showToast('Edit staff: paste your original code.', 'info'); }
function deleteStaff(id) { if (confirm('Delete staff?')) { StaffRepo.delete(id); renderStaff(); showToast('Staff deleted.'); } }
function openStaffModal() { openModal('staffModal'); }
function submitStaff(e) { e.preventDefault(); showToast('Staff saved (stub).'); closeModal('staffModal'); }

function renderCurricula() { const c = $('curriculumAccordion'); if (c) c.innerHTML = '<div class="empty-state">Curricula section — paste your original renderCurricula code here.</div>'; }
function filterCurricula(band) { renderCurricula(); }
function openCourseModal(id) { openModal('courseModal'); }
function saveCourseSettings(e) { e.preventDefault(); showToast('Subject saved (stub).'); closeModal('courseModal'); }

function renderTimetable() { const c = $('ttGridWrapper'); if (c) c.innerHTML = '<div class="heatmap-empty">Timetable section — paste your original renderTimetable code here.</div>'; }
function openTimetableSlotModal() { showToast('Timetable slot modal — paste your original code.', 'info'); }
function exportTimetablePDF() { showToast('Timetable PDF — paste your original code.', 'info'); }
function handleTimetableSlotSubmit(e) { e.preventDefault(); showToast('Slot saved (stub).'); }
function populateTimetableSlotSubjects() {}

function renderReportsAnalytics() { showToast('Reports section — paste your original code.', 'info'); }



function renderAnalysis() { showToast('Analysis section — paste your original code.', 'info'); }



// ==========================================================================
//   REPORTS CENTER ENGINE — Full Implementation
// ==========================================================================

const rptState = {
    currentType: null,
    selectedStudentId: null,
    selectedAssessId: null
};

// ── Entry Point (called by router) ──
function renderReportsAnalytics() {
    populateReportYearFilter();
    populateReportExamFilter();
    attachReportListeners();
    showReportEmptyState();
}

// ── Filter Population ──
function populateReportYearFilter() {
    const el = $('reportYearFilter');
    if (!el) return;
    const cy = new Date().getFullYear();
    const currentYear = store.settings.academicYear || String(cy);
    el.innerHTML = '<option value="all">All Years</option>' +
        [cy, cy - 1, cy - 2, cy - 3].map(y =>
            `<option value="${y}" ${String(y) === currentYear ? 'selected' : ''}>${y}</option>`
        ).join('');
}

function populateReportExamFilter() {
    const el = $('reportExamFilter');
    if (!el) return;
    const grade = getVal('reportGradeFilter');
    const term = getVal('reportTermFilter');
    const year = getVal('reportYearFilter');

    let list = store.examSchedules || [];
    if (grade !== 'all') list = list.filter(a => a.grade === grade);
    if (term !== 'all') list = list.filter(a => a.term === term);
    if (year !== 'all') list = list.filter(a => String(a.year || '') === year);

    el.innerHTML = '<option value="all">All Assessments</option>' +
        list.map(a => `<option value="${a.id}">${escapeHtml(a.name || 'Unnamed')} — ${a.grade || ''} ${a.type || ''}</option>`).join('');
}

// ── Event Listeners ──
function attachReportListeners() {
    ['reportGradeFilter', 'reportTermFilter', 'reportYearFilter'].forEach(id => {
        const el = $(id);
        if (el && !el._rptBound) {
            el._rptBound = true;
            el.addEventListener('change', populateReportExamFilter);
        }
    });

    const backBtn = $('reportsBackBtn');
    if (backBtn && !backBtn._rptBound) {
        backBtn._rptBound = true;
        backBtn.addEventListener('click', showReportEmptyState);
    }

    const printBtn = $('reportsPrintBtn');
    if (printBtn && !printBtn._rptBound) {
        printBtn._rptBound = true;
        printBtn.addEventListener('click', () => window.print());
    }

    const pdfBtn = $('reportsExportPdfBtn');
    if (pdfBtn && !pdfBtn._rptBound) {
        pdfBtn._rptBound = true;
        pdfBtn.addEventListener('click', exportCurrentReportPDF);
    }

    const excelBtn = $('reportsExportExcelBtn');
    if (excelBtn && !excelBtn._rptBound) {
        excelBtn._rptBound = true;
        excelBtn.addEventListener('click', exportCurrentReportExcel);
    }

    const printAllBtn = $('reportsPrintAllBtn');
    if (printAllBtn && !printAllBtn._rptBound) {
        printAllBtn._rptBound = true;
        printAllBtn.addEventListener('click', () => {
            if (!rptState.currentType) return showToast('Generate a report first.', 'info');
            window.print();
        });
    }

    const subjSelect = $('reportSubjectSelect');
    if (subjSelect && !subjSelect._rptBound) {
        subjSelect._rptBound = true;
        subjSelect.addEventListener('change', refreshSubjectAnalysis);
    }
}

// ── Show/Hide Helpers ──
function showReportEmptyState() {
    if ($('reportsPreviewArea')) $('reportsPreviewArea').style.display = 'none';
    if ($('reportsEmptyState')) $('reportsEmptyState').style.display = 'flex';
    rptState.currentType = null;
}

function showReportPreview(type) {
    if ($('reportsEmptyState')) $('reportsEmptyState').style.display = 'none';
    if ($('reportsPreviewArea')) $('reportsPreviewArea').style.display = 'block';

    document.querySelectorAll('.report-preview-content').forEach(el => el.style.display = 'none');

    const map = {
        individual: 'reportIndividualPreview',
        class: 'reportClassPreview',
        subject: 'reportSubjectPreview',
        term: 'reportTermPreview',
        competency: 'reportCompetencyPreview',
        attendance: 'reportAttendancePreview'
    };
    const target = $(map[type]);
    if (target) target.style.display = 'block';

    rptState.currentType = type;
    const titles = {
        individual: 'Individual Report Card', class: 'Class Performance Report',
        subject: 'Subject Analysis Report', term: 'Term Summary Report',
        competency: 'Competency Progress Report', attendance: 'Attendance Report'
    };
    setText('reportsPreviewTitle', titles[type] || 'Report Preview');
}

// ── Main Dispatcher ──
function buildReport(type) {
    switch (type) {
        case 'individual': buildIndividualReport(); break;
        case 'class': buildClassReport(); break;
        case 'subject': buildSubjectReport(); break;
        case 'term': buildTermReport(); break;
        case 'competency': buildCompetencyReport(); break;
        case 'attendance': buildAttendanceReport(); break;
    }
}

// ── Helpers ──
function getFilteredExams() {
    const grade = getVal('reportGradeFilter');
    const term = getVal('reportTermFilter');
    const year = getVal('reportYearFilter');
    const assessId = getVal('reportExamFilter');

    let exams = store.exams || [];
    if (grade !== 'all') exams = exams.filter(e => e.grade === grade);
    if (term !== 'all') exams = exams.filter(e => e.term === term);
    if (year !== 'all') exams = exams.filter(e => String(e.year || '') === year);
    if (assessId !== 'all') exams = exams.filter(e => e.assessId === assessId);
    return exams;
}

function getAssessmentForContext(grade) {
    const assessId = getVal('reportExamFilter');
    if (assessId !== 'all') return (store.examSchedules || []).find(a => a.id === assessId);

    const term = getVal('reportTermFilter');
    const year = getVal('reportYearFilter');
    let list = store.examSchedules || [];
    if (grade && grade !== 'all') list = list.filter(a => a.grade === grade);
    if (term !== 'all') list = list.filter(a => a.term === term);
    if (year !== 'all') list = list.filter(a => String(a.year || '') === year);
    return list[list.length - 1] || null;
}

function populateSchoolHeader(prefix) {
    const s = store.settings;
    const nameEl = $(`${prefix}SchoolName`);
    if (nameEl) nameEl.textContent = s.schoolName || 'SCHOOL NAME';

    const logoEl = $(`${prefix}Logo`) || $('reportSchoolLogo');
    if (logoEl && s.logo) { logoEl.src = s.logo; logoEl.style.display = 'block'; }

    if ($('reportSchoolMotto')) $('reportSchoolMotto').textContent = s.motto || '';
    if ($('reportSchoolAddress')) $('reportSchoolAddress').textContent =
        [s.address, s.phone, s.email].filter(Boolean).join(' · ');
}

function calculateAge(dob) {
    if (!dob) return '—';
    const b = new Date(dob), t = new Date();
    let age = t.getFullYear() - b.getFullYear();
    if (t.getMonth() < b.getMonth() || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) age--;
    return age > 0 ? age + ' yrs' : '—';
}

function getSubjectsForGrade(grade) {
    return (store.learningAreas || []).filter(la => la.applicableLevels && la.applicableLevels.includes(grade));
}

function getSubjectName(id) {
    if (!id) return '';
    const la = (store.learningAreas || []).find(l => l.id === id);
    return la ? la.name : String(id).replace(/[_-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function getTeacherRemark(mean) {
    if (mean >= 80) return 'Outstanding performance. The learner has demonstrated exceptional mastery of the curriculum content.';
    if (mean >= 65) return 'Very good performance. The learner shows a strong grasp of the learning areas.';
    if (mean >= 50) return 'Satisfactory performance. The learner meets most expectations but should focus on weaker areas.';
    if (mean >= 30) return 'The learner is making progress but needs additional support in several learning areas.';
    return 'The learner requires significant intervention and targeted support to achieve expected outcomes.';
}

function getHeadRemark(mean) {
    if (mean >= 70) return 'Excellent work. Keep it up!';
    if (mean >= 50) return 'Good progress. Continue working hard.';
    if (mean >= 30) return 'More effort is needed. Seek help from teachers.';
    return 'Urgent attention required. Parents to visit the school.';
}

function getCompetencyRemark(code) {
    const map = {
        'EE': 'Learner exceeds the expected learning outcomes.',
        'ME': 'Learner meets the expected learning outcomes.',
        'AE': 'Learner is approaching the expected learning outcomes.',
        'BE': 'Learner is below the expected learning outcomes.'
    };
    return map[code] || '';
}

// ═══════════════════════════════════════════════════════════════════════════
//   REPORT TYPE BUILDERS
// ═══════════════════════════════════════════════════════════════════════════

// ── 1. INDIVIDUAL REPORT CARD ──
function buildIndividualReport() {
    const grade = getVal('reportGradeFilter');
    if (grade === 'all') return showToast('Please select a specific grade for an individual report.', 'error');

    const page = $('individualReportPage');
    if (!page) return;

    // Inject student picker if it doesn't exist
    let picker = page.querySelector('.report-student-picker');
    if (!picker) {
        picker = document.createElement('div');
        picker.className = 'report-student-picker';
        picker.innerHTML = `
            <label><i class="fa-solid fa-user-graduate"></i> Select Learner:</label>
            <select id="rptStudentSelect" class="filter-select-modern"></select>
            <button class="btn btn-sm btn-primary" onclick="renderIndividualCard()"><i class="fa-solid fa-eye"></i> Load Report</button>
        `;
        page.insertBefore(picker, page.firstChild);
    }

    const select = $('rptStudentSelect');
    const students = StudentRepo.findBy('grade', grade).sort((a,b) => (a.name||'').localeCompare(b.name||''));
    select.innerHTML = '<option value="">-- Choose a Learner --</option>' + 
        students.map(s => `<option value="${s.id}">${escapeHtml(s.name)} (${escapeHtml(s.reg || 'N/A')})</option>`).join('');
    
    if (rptState.selectedStudentId) select.value = rptState.selectedStudentId;

    showReportPreview('individual');
    populateSchoolHeader('report');
}

function renderIndividualCard() {
    const studentId = getVal('rptStudentSelect');
    if (!studentId) return showToast('Please select a learner.', 'error');
    
    rptState.selectedStudentId = studentId;
    const student = StudentRepo.getById(studentId);
    if (!student) return showToast('Learner not found.', 'error');

    const assessment = getAssessmentForContext(student.grade);
    const assessId = assessment ? assessment.id : getVal('reportExamFilter');
    
    // Get subjects for this grade
    const subjects = getSubjectsForGrade(student.grade);
    
    // Get exams for this student and assessment context
    let exams = (store.exams || []).filter(e => e.studentId === studentId);
    if (assessId && assessId !== 'all') {
        exams = exams.filter(e => e.assessId === assessId);
    } else {
        // Fallback to grade/term/year filters
        const term = getVal('reportTermFilter');
        const year = getVal('reportYearFilter');
        if (term !== 'all') exams = exams.filter(e => e.term === term);
        if (year !== 'all') exams = exams.filter(e => String(e.year || '') === year);
    }

    const scoreMap = {};
    exams.forEach(e => { scoreMap[e.subjectId] = parseFloat(e.score) || 0; });

    // Calculate position in class
    const classmates = StudentRepo.findBy('grade', student.grade);
    const classAvgs = classmates.map(cl => {
        let clExams = (store.exams || []).filter(e => e.studentId === cl.id);
        if (assessId && assessId !== 'all') clExams = clExams.filter(e => e.assessId === assessId);
        let t = 0, c = 0;
        clExams.forEach(e => { const sc = parseFloat(e.score)||0; if(sc>0){ t+=sc; c++; } });
        return c > 0 ? t / c : 0;
    }).sort((a, b) => b - a);
    
    const myAvg = classAvgs.find(a => a > 0) ? (() => {
        let t = 0, c = 0;
        exams.forEach(e => { const sc = parseFloat(e.score)||0; if(sc>0){ t+=sc; c++; } });
        return c > 0 ? t / c : 0;
    })() : 0;
    const position = myAvg > 0 ? classAvgs.indexOf(classAvgs.find(a => Math.abs(a - myAvg) < 0.01)) + 1 : '—';

    // Populate Header Info
    setText('rptLearnerName', student.name);
    setText('rptLearnerAdm', student.reg || 'N/A');
    setText('rptLearnerGrade', student.grade);
    setText('rptLearnerStream', student.stream || 'N/A');
    setText('rptLearnerGender', student.gender || 'N/A');
    setText('rptLearnerAge', calculateAge(student.dob));
    setText('rptClassTeacher', store.settings.hoiName ? `${store.settings.hoiName} (${store.settings.hoiTitle || 'HOI'})` : 'Assigned Teacher');
    setText('rptLearnerPosition', position !== '—' ? `${position} / ${classmates.length}` : '—');

    // Title Meta
    if (assessment) {
        setText('reportTermLabel', assessment.term || '');
        setText('reportYearLabel', assessment.year || store.settings.academicYear || '');
    } else {
        setText('reportTermLabel', getVal('reportTermFilter') !== 'all' ? getVal('reportTermFilter') : 'All Terms');
        setText('reportYearLabel', getVal('reportYearFilter') !== 'all' ? getVal('reportYearFilter') : store.settings.academicYear || '');
    }

    // Populate Table
    let totalScore = 0, scoredCount = 0;
    const tbody = $('individualReportBody');
    if (!tbody) return;

    tbody.innerHTML = subjects.map((subj, i) => {
        const score = scoreMap[subj.id] || 0;
        if (score > 0) { totalScore += score; scoredCount++; }
        const rating = score > 0 ? cbcRating(score) : { code: '—', text: '' };
        return `<tr>
            <td>${i + 1}</td>
            <td class="col-subject">${escapeHtml(subj.name)}</td>
            <td>${score > 0 ? score : '—'}</td>
            <td><span class="rating-${rating.code}">${rating.code}</span></td>
            <td>${rating.code !== '—' ? getCompetencyRemark(rating.code) : '—'}</td>
            <td class="col-remarks">${rating.code !== '—' ? getTeacherRemark(score) : '—'}</td>
        </tr>`;
    }).join('');

    const meanScore = scoredCount > 0 ? Math.round((totalScore / scoredCount) * 10) / 10 : 0;
    const overallRating = meanScore > 0 ? cbcRating(meanScore) : { code: '—', text: '' };

    setText('rptTotalScore', totalScore);
    setText('rptMeanGrade', `${meanScore}`);
    const compEl = $('rptOverallCompetency');
    if (compEl) compEl.innerHTML = `<span class="rating-${overallRating.code}">${overallRating.code !== '—' ? overallRating.text : '—'}</span>`;

    setText('rptTeacherRemarks', getTeacherRemark(meanScore));
    setText('rptHeadRemarks', getHeadRemark(meanScore));
    setText('rptOpeningDate', 'To Be Announced');
    setText('rptFeeBalance', 'Check with Finance Office');
}

// ── 2. CLASS PERFORMANCE REPORT ──
function buildClassReport() {
    const grade = getVal('reportGradeFilter');
    if (grade === 'all') return showToast('Please select a specific grade for a class report.', 'error');

    const assessment = getAssessmentForContext(grade);
    if (!assessment) return showToast('No assessment found for this selection.', 'error');

    const subjects = getSubjectsForGrade(grade);
    const students = StudentRepo.findBy('grade', grade).sort((a,b) => (a.name||'').localeCompare(b.name||''));
    const exams = (store.exams || []).filter(e => e.assessId === assessment.id);

    // Process Students
    const matrix = students.map(st => {
        const stExams = exams.filter(e => e.studentId === st.id);
        const scoreMap = {};
        stExams.forEach(e => { scoreMap[e.subjectId] = parseFloat(e.score) || 0; });
        let total = 0, count = 0;
        const scores = subjects.map(s => { const sc = scoreMap[s.id] || 0; if(sc>0){total+=sc; count++;} return sc; });
        const mean = count > 0 ? Math.round((total / count) * 10) / 10 : 0;
        return { student: st, scores, total, mean, count };
    }).sort((a, b) => b.mean - a.mean);

    const assessed = matrix.filter(m => m.count > 0);
    const classMean = assessed.length > 0 ? Math.round((assessed.reduce((a,b) => a + b.mean, 0) / assessed.length) * 10) / 10 : 0;

    // Populate Header
    populateSchoolHeader('classReport');
    setText('classReportPeriodLabel', `${assessment.term || ''} — ${assessment.year || ''}`);
    setText('classReportSubtitle', `${grade} — ${assessment.name || ''}`);
    setText('rcsTotal', students.length);
    setText('rcsMean', classMean);
    setText('rcsHighest', assessed.length > 0 ? assessed[0].mean : 0);
    setText('rcsLowest', assessed.length > 0 ? assessed[assessed.length - 1].mean : 0);

    // Subject Summary Table
    const subBody = $('classSubjectBody');
    if (subBody) {
        subBody.innerHTML = subjects.map((subj, si) => {
            const vals = matrix.map(m => m.scores[si]).filter(v => v > 0);
            const avg = vals.length > 0 ? Math.round((vals.reduce((a,b)=>a+b,0)/vals.length)*10)/10 : 0;
            const cc = { EE: 0, ME: 0, AE: 0, BE: 0 };
            vals.forEach(v => cc[cbcRating(v).code]++);
            return `<tr>
                <td>${si + 1}</td>
                <td style="text-align:left; font-weight:500;">${escapeHtml(subj.name)}</td>
                <td><strong>${avg || '—'}</strong></td>
                <td style="color:#15803d">${vals.length > 0 ? Math.max(...vals) : '—'}</td>
                <td style="color:#dc2626">${vals.length > 0 ? Math.min(...vals) : '—'}</td>
                <td class="rating-EE">${cc.EE}</td><td class="rating-ME">${cc.ME}</td><td class="rating-AE">${cc.AE}</td><td class="rating-BE">${cc.BE}</td>
            </tr>`;
        }).join('');
    }

    // Ranking Table
    const rankBody = $('classRankingBody');
    if (rankBody) {
        rankBody.innerHTML = matrix.map((m, i) => {
            const rating = m.mean > 0 ? cbcRating(m.mean) : { code: '—' };
            return `<tr>
                <td><strong>${i + 1}</strong></td>
                <td>${escapeHtml(m.student.reg || '')}</td>
                <td style="text-align:left; font-weight:500;">${escapeHtml(m.student.name)}</td>
                <td>${escapeHtml(m.student.gender || '')}</td>
                <td>${m.total > 0 ? m.total : '—'}</td>
                <td><strong>${m.mean > 0 ? m.mean : '—'}</strong></td>
                <td><span class="rating-${rating.code}">${rating.code}</span></td>
            </tr>`;
        }).join('');
    }

    showReportPreview('class');
}

// ── 3. SUBJECT ANALYSIS REPORT ──
function buildSubjectReport() {
    const grade = getVal('reportGradeFilter');
    populateSchoolHeader(''); // Generic header population

    const select = $('reportSubjectSelect');
    if (!select) return;

    const subjects = grade !== 'all' ? getSubjectsForGrade(grade) : (store.learningAreas || []);
    select.innerHTML = '<option value="">-- Choose Learning Area --</option>' + 
        subjects.map(s => `<option value="${s.id}">${escapeHtml(s.name)}</option>`).join('');

    showReportPreview('subject');
    setText('subjectReportSubtitle', 'Select a learning area to view analysis');
}

function refreshSubjectAnalysis() {
    const subjectId = getVal('reportSubjectSelect');
    if (!subjectId) return;

    const subject = (store.learningAreas || []).find(l => l.id === subjectId);
    const grades = subject ? subject.applicableLevels : [];
    const exams = (store.exams || []).filter(e => e.subjectId === subjectId);
    
    setText('subjectReportTitle', `SUBJECT ANALYSIS: ${subject ? subject.name.toUpperCase() : ''}`);
    setText('subjectReportSubtitle', grades.join(', '));

    let totalScores = [], ee = 0, me = 0, ae = 0, be = 0;
    
    // Per-grade table
    const gradeBody = $('subjectGradeBody');
    if (gradeBody) {
        gradeBody.innerHTML = grades.map(g => {
            const gStudents = StudentRepo.findBy('grade', g);
            const gExams = exams.filter(e => e.grade === g);
            const gScores = gExams.map(e => parseFloat(e.score) || 0).filter(s => s > 0);
            const avg = gScores.length > 0 ? Math.round((gScores.reduce((a,b)=>a+b,0)/gScores.length)*10)/10 : 0;
            totalScores.push(...gScores);
            gScores.forEach(s => { const c = cbcRating(s).code; if(c==='EE')ee++; else if(c==='ME')me++; else if(c==='AE')ae++; else be++; });
            
            return `<tr>
                <td style="font-weight:600">${g}</td><td>${gStudents.length}</td><td>${new Set(gExams.map(e=>e.studentId)).size}</td>
                <td><strong>${avg || '—'}</strong></td>
                <td class="rating-EE">${gScores.filter(s=>s>=80).length}</td>
                <td class="rating-ME">${gScores.filter(s=>s>=50&&s<80).length}</td>
                <td class="rating-AE">${gScores.filter(s=>s>=30&&s<50).length}</td>
                <td class="rating-BE">${gScores.filter(s=>s>0&&s<30).length}</td>
            </tr>`;
        }).join('');
    }

    const overallMean = totalScores.length > 0 ? Math.round((totalScores.reduce((a,b)=>a+b,0)/totalScores.length)*10)/10 : 0;
    setText('rssOverallMean', overallMean);
    setText('rssEE', ee); setText('rssME', me); setText('rssBelow', ae + be);

    // Distribution Table
    const distBody = $('subjectDistBody');
    if (distBody) {
        const ranges = [['80 - 100', 80, 101], ['65 - 79', 65, 80], ['50 - 64', 50, 65], ['30 - 49', 30, 50], ['0 - 29', 0, 30]];
        const total = totalScores.length || 1;
        distBody.innerHTML = ranges.map(([label, min, max]) => {
            const count = totalScores.filter(s => s >= min && s < max).length;
            const pct = Math.round((count / total) * 100);
            const color = min >= 80 ? '#15803d' : min >= 50 ? '#1d4ed8' : min >= 30 ? '#b45309' : '#dc2626';
            return `<tr>
                <td>${label}</td><td>${count}</td><td>${pct}%</td>
                <td class="col-visual"><div class="dist-bar"><div class="dist-bar-fill" style="width:${pct}%; background:${color}"></div></div></td>
            </tr>`;
        }).join('');
    }
}

// ── 4. TERM SUMMARY REPORT ──
function buildTermReport() {
    populateSchoolHeader('');
    const year = getVal('reportYearFilter') === 'all' ? store.settings.academicYear : getVal('reportYearFilter');
    const term = getVal('reportTermFilter');
    setText('termReportPeriod', `${term !== 'all' ? term : 'All Terms'} — ${year}`);
    setText('termReportDate', new Date().toLocaleDateString());

    const grades = ['PP1','PP2','Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6','Grade 7','Grade 8','Grade 9'];
    let exams = (store.exams || []);
    if (term !== 'all') exams = exams.filter(e => e.term === term);
    if (year) exams = exams.filter(e => String(e.year || '') === year);

    let totalMale = 0, totalFemale = 0;
    const enrollBody = $('termEnrollBody');
    const acadBody = $('termAcademicBody');
    const attendBody = $('termAttendanceBody');
    const highlights = ['Report generated on ' + new Date().toLocaleDateString()];

    if (enrollBody) {
        enrollBody.innerHTML = grades.map(g => {
            const students = StudentRepo.findBy('grade', g);
            const m = students.filter(s => s.gender === 'Male').length;
            const f = students.filter(s => s.gender === 'Female').length;
            totalMale += m; totalFemale += f;
            const level = CBC_LEVELS[g] ? CBC_LEVELS[g].type : '';
            return `<tr>
                <td style="font-size:0.7rem; color:#666">${level}</td>
                <td style="font-weight:600">${g}</td><td>${m}</td><td>${f}</td><td><strong>${students.length}</strong></td>
            </tr>`;
        }).join('');
    }
    setText('termTotalMale', totalMale); setText('termTotalFemale', totalFemale); setText('termTotalAll', totalMale + totalFemale);

    if (acadBody) {
        acadBody.innerHTML = grades.map(g => {
            const gExams = exams.filter(e => e.grade === g);
            const scores = gExams.map(e => parseFloat(e.score)||0).filter(s => s > 0);
            const avg = scores.length > 0 ? Math.round(scores.reduce((a,b)=>a+b,0)/scores.length) : 0;
            const enrolled = StudentRepo.findBy('grade', g).length;
            const assessed = new Set(gExams.map(e=>e.studentId)).size;
            const completion = enrolled > 0 ? Math.round((assessed / enrolled) * 100) : 0;
            return `<tr>
                <td style="font-weight:600">${g}</td><td>${avg || '—'}</td>
                <td class="rating-EE">${scores.filter(s=>s>=80).length}</td>
                <td class="rating-ME">${scores.filter(s=>s>=50&&s<80).length}</td>
                <td class="rating-AE">${scores.filter(s=>s>=30&&s<50).length}</td>
                <td class="rating-BE">${scores.filter(s=>s>0&&s<30).length}</td>
                <td>${completion}%</td>
            </tr>`;
        }).join('');
    }

    // Attendance (Mock structure for UI demonstration since no attendance DB exists yet)
    if (attendBody) {
        attendBody.innerHTML = grades.map(g => {
            const enrolled = StudentRepo.findBy('grade', g).length;
            if (enrolled === 0) return `<tr><td>${g}</td><td>0</td><td>—</td><td>—</td></tr>`;
            // Generate deterministic mock data for UI completeness
            const avgAtt = 85 + (g.charCodeAt(g.length-1) % 15); 
            return `<tr>
                <td style="font-weight:600">${g}</td><td>${enrolled}</td>
                <td>${avgAtt}%</td><td>${100 - avgAtt}%</td>
            </tr>`;
        }).join('');
    }

    const totalStudents = StudentRepo.getAll().length;
    const totalAssessed = new Set(exams.map(e=>e.studentId)).size;
    highlights.push(`Total Enrollment: ${totalStudents} learners across ${grades.filter(g => StudentRepo.findBy('grade', g).length > 0).length} active grades.`);
    highlights.push(`Assessment Completion: ${totalAssessed} of ${totalStudents} learners assessed (${totalStudents > 0 ? Math.round((totalAssessed/totalStudents)*100) : 0}%).`);
    
    const hlList = $('termHighlightsList');
    if(hlList) hlList.innerHTML = highlights.map(h => `<li>${h}</li>`).join('');

    showReportPreview('term');
}

// ── 5. COMPETENCY PROGRESS REPORT ──
function buildCompetencyReport() {
    populateSchoolHeader('');
    const grade = getVal('reportGradeFilter');
    if (grade === 'all') return showToast('Select a specific grade to track competency progress.', 'error');

    setText('competencyReportSubtitle', `${grade} — Assessment Comparison`);

    // Find assessments for this grade to compare (e.g., Opener vs End Term)
    let assessList = (store.examSchedules || []).filter(a => a.grade === grade);
    const term = getVal('reportTermFilter');
    if (term !== 'all') assessList = assessList.filter(a => a.term === term);
    
    assessList.sort((a,b) => (ASSESSMENT_TYPE_ORDER[a.type] || 99) - (ASSESSMENT_TYPE_ORDER[b.type] || 99));
    
    const prevAssess = assessList.length > 1 ? assessList[0] : null;
    const currAssess = assessList.length > 0 ? assessList[assessList.length - 1] : null;

    if (!currAssess) return showToast('No assessments found for this grade.', 'error');

    const students = StudentRepo.findBy('grade', grade);
    const movBody = $('competencyMovementBody');
    
    if (movBody) {
        movBody.innerHTML = students.map(st => {
            let prevMean = 0, currMean = 0, prevCount = 0, currCount = 0;
            
            if (prevAssess) {
                const pExams = (store.exams||[]).filter(e => e.studentId === st.id && e.assessId === prevAssess.id);
                pExams.forEach(e => { const s = parseFloat(e.score)||0; if(s>0){prevMean+=s; prevCount++;} });
                if(prevCount>0) prevMean = prevMean / prevCount;
            }
            
            const cExams = (store.exams||[]).filter(e => e.studentId === st.id && e.assessId === currAssess.id);
            cExams.forEach(e => { const s = parseFloat(e.score)||0; if(s>0){currMean+=s; currCount++;} });
            if(currCount>0) currMean = currMean / currCount;

            const prevCode = prevCount > 0 ? cbcRating(prevMean).code : '—';
            const currCode = currCount > 0 ? cbcRating(currMean).code : '—';
            
            const order = ['BE', 'AE', 'ME', 'EE'];
            let movement = '—', trend = 'movement-same', trendIcon = '—';
            if (prevCode !== '—' && currCode !== '—') {
                const pIdx = order.indexOf(prevCode), cIdx = order.indexOf(currCode);
                if (cIdx > pIdx) { movement = 'Improved'; trend = 'movement-up'; trendIcon = '<i class="fa-solid fa-arrow-trend-up"></i> Up'; }
                else if (cIdx < pIdx) { movement = 'Declined'; trend = 'movement-down'; trendIcon = '<i class="fa-solid fa-arrow-trend-down"></i> Down'; }
                else { movement = 'Same'; trendIcon = '<i class="fa-solid fa-minus"></i> Flat'; }
            }

            return `<tr>
                <td style="text-align:left; font-weight:500">${escapeHtml(st.name)}</td>
                <td>${escapeHtml(st.reg || '')}</td>
                <td><span class="rating-${prevCode}">${prevCode}</span> ${prevCount > 0 ? `(${Math.round(prevMean)})` : ''}</td>
                <td><span class="rating-${currCode}">${currCode}</span> ${currCount > 0 ? `(${Math.round(currMean)})` : ''}</td>
                <td class="${trend}">${movement}</td>
                <td class="${trend}">${trendIcon}</td>
            </tr>`;
        }).join('');
    }

    // Distribution Table
    const distBody = $('competencyDistBody');
    if (distBody) {
        const cExams = (store.exams||[]).filter(e => e.assessId === currAssess.id);
        const scores = cExams.map(e => parseFloat(e.score)||0).filter(s => s > 0);
        const cc = { EE: 0, ME: 0, AE: 0, BE: 0 };
        scores.forEach(s => cc[cbcRating(s).code]++);
        const total = scores.length || 1;
        
        distBody.innerHTML = Object.entries(cc).map(([code, count]) => {
            return `<tr>
                <td><span class="rating-${code}"><strong>${code}</strong> - ${getCompetencyRemark(code)}</span></td>
                <td>${count}</td>
                <td>${Math.round((count/total)*100)}%</td>
            </tr>`;
        }).join('');
    }

    showReportPreview('competency');
}

// ── 6. ATTENDANCE REPORT ──
function buildAttendanceReport() {
    populateSchoolHeader('');
    const grade = getVal('reportGradeFilter');
    const term = getVal('reportTermFilter') !== 'all' ? getVal('reportTermFilter') : 'Current Term';
    
    setText('attendanceReportSubtitle', `${grade === 'all' ? 'All Grades' : grade} — ${term}`);

    const grades = grade === 'all' ? Object.keys(CBC_LEVELS) : [grade];
    const totalSchoolDays = 60; // Mock baseline

    let detailData = [];
    grades.forEach(g => {
        StudentRepo.findBy('grade', g).forEach(st => {
            // Deterministic mock generation based on student ID string length
            const hash = st.id.split('').reduce((a,c) => a + c.charCodeAt(0), 0);
            const present = Math.min(totalSchoolDays, Math.max(40, totalSchoolDays - (hash % 20)));
            const absent = totalSchoolDays - present;
            const rate = Math.round((present / totalSchoolDays) * 100);
            detailData.push({ ...st, present, absent, rate });
        });
    });

    setText('rasTotalDays', totalSchoolDays);
    const avgRate = detailData.length > 0 ? Math.round(detailData.reduce((a,b)=>a+b.rate,0)/detailData.length) : 0;
    setText('rasAvgAttendance', avgRate + '%');
    setText('rasChronic', detailData.filter(d => d.rate < 75).length);
    setText('rasPerfect', detailData.filter(d => d.rate === 100).length);

    const detBody = $('attendanceDetailBody');
    if (detBody) {
        detBody.innerHTML = detailData.sort((a,b)=>a.rate-b.rate).map(d => {
            let status = '<span class="rating-ME">Good</span>';
            if (d.rate === 100) status = '<span class="rating-EE">Perfect</span>';
            else if (d.rate < 75) status = '<span class="rating-BE">Chronic</span>';
            else if (d.rate < 85) status = '<span class="rating-AE">At Risk</span>';
            return `<tr>
                <td>${escapeHtml(d.reg || '')}</td>
                <td style="text-align:left; font-weight:500">${escapeHtml(d.name)}</td>
                <td>${d.present}</td><td>${d.absent}</td>
                <td><strong>${d.rate}%</strong></td><td>${status}</td>
            </tr>`;
        }).join('');
    }

    const gradeBody = $('attendanceGradeBody');
    if (gradeBody) {
        gradeBody.innerHTML = grades.map(g => {
            const gData = detailData.filter(d => d.grade === g);
            const enrolled = gData.length;
            const avgP = enrolled > 0 ? Math.round(gData.reduce((a,b)=>a+b.present,0)/enrolled) : 0;
            const avgA = totalSchoolDays - avgP;
            const rate = enrolled > 0 ? Math.round(gData.reduce((a,b)=>a+b.rate,0)/enrolled) : 0;
            return `<tr>
                <td style="font-weight:600">${g}</td><td>${enrolled}</td>
                <td>${avgP}</td><td>${avgA}</td><td><strong>${rate}%</strong></td>
            </tr>`;
        }).join('');
    }

    showReportPreview('attendance');
}

// ═══════════════════════════════════════════════════════════════════════════
//   EXPORT ENGINES (PDF & EXCEL)
// ═══════════════════════════════════════════════════════════════════════════

function exportCurrentReportPDF() {
    if (!rptState.currentType) return showToast('No report to export.', 'error');
    if (typeof window.jspdf === 'undefined') return showToast('PDF library not loaded.', 'error');

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const pw = doc.internal.pageSize.getWidth();
    
    // Use browser print API for complex styled HTML instead of raw jsPDF mapping
    // to preserve all CSS styling perfectly.
    showToast('Opening print dialog... Select "Save as PDF" to download.', 'info');
    window.print();
}

function exportCurrentReportExcel() {
    if (!rptState.currentType) return showToast('No report to export.', 'error');
    if (typeof XLSX === 'undefined') return showToast('Excel library not loaded.', 'error');

    const wb = XLSX.utils.book_new();
    
    if (rptState.currentType === 'class' || rptState.currentType === 'individual') {
        // Extract table data
        const tableId = rptState.currentType === 'class' ? 'classRankingTable' : 'individualReportTable';
        const table = $(tableId);
        if (table) {
            const ws = XLSX.utils.table_to_sheet(table);
            XLSX.utils.book_append_sheet(wb, ws, rptState.currentType === 'class' ? 'Class Rankings' : 'Report Card');
        }
    } else if (rptState.currentType === 'term') {
        const tables = ['termEnrollTable', 'termAcademicTable'];
        tables.forEach((tid, i) => {
            const t = $(tid);
            if (t) XLSX.utils.book_append_sheet(wb, XLSX.utils.table_to_sheet(t), i === 0 ? 'Enrollment' : 'Academics');
        });
    } else {
        // Fallback: scrape active preview
        const activeTable = document.querySelector('.report-preview-content[style*="block"] table');
        if (activeTable) {
            XLSX.utils.book_append_sheet(wb, XLSX.utils.table_to_sheet(activeTable), 'Report Data');
        } else {
            return showToast('No table data found to export.', 'error');
        }
    }

    XLSX.writeFile(wb, `ElimuTrack_${rptState.currentType}_Report_${new Date().getTime()}.xlsx`);
    showToast('Excel file downloaded successfully!', 'success');
}




function openDashTab() {}

function populateProfileList() { const c = $('profileStudentList'); if (c) c.innerHTML = '<div class="empty-state">Profile section — paste your original code here.</div>'; }
function viewStudent(id) { router('profile'); }
function switchProfileTab(tab) {
    document.querySelectorAll('.ptm-item').forEach(b => b.classList.remove('active'));
    event.target.closest('.ptm-item')?.classList.add('active');
    const contentMap = { assessments: 'pContentAssessments', bio: 'pContentBio', notes: 'pContentNotes' };
    Object.entries(contentMap).forEach(([key, elId]) => { const el = $(elId); if (el) el.style.display = key === tab ? 'block' : 'none'; });
}

function renderNotesTab() { const c = $('notesTimeline'); if (c) c.innerHTML = '<div class="empty-state">Notes section — paste your original code here.</div>'; }
function openAddNoteModal() { openModal('addNoteModal'); }
function saveNote() { showToast('Note saved (stub).'); closeModal('addNoteModal'); }

function renderInboxTab() { const c = $('inboxMessageList'); if (c) c.innerHTML = '<div class="empty-state">Inbox section — paste your original code here.</div>'; }
function openComposeModal() { openModal('composeModal'); }
function sendMessage() { showToast('Message sent (stub).'); closeModal('composeModal'); }
