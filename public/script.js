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

// Add this helper near the top of script.js
async function apiFetch(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `/api/${endpoint}`;

    // Attach auth token if available
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, { ...options, headers });

        if (response.status === 401) {
            // Token expired — redirect to login
            console.warn('Auth token expired, redirecting to login...');
            localStorage.removeItem('authToken');
            sessionStorage.removeItem('authToken');
            window.location.href = '/login.html?reason=expired';
            return null;
        }

        if (response.status === 403) {
            console.error(`403 Forbidden: ${url} — Check user permissions for this endpoint`);
            // Optionally show user-friendly message
            showToast('You do not have permission to access this resource', 'error');
            return null;
        }

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`API fetch failed [${url}]:`, error);
        throw error;
    }
}

// Replace all your raw fetch calls:
// BEFORE:  fetch('/api/students')
// AFTER:   apiFetch('students')
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
     repackAssessments();
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
    initReportListeners(); 
    startClock();
    patchAssessmentIntegrity();
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
    'Opener': 'type-opener', 'Mid Term': 'type-midterm',
    'End Term': 'type-endterm', 'End Year': 'type-endyear'
};

// --- Subject → Teacher Mapping ---
function getSubjectTeacherName(subjectId, grade) {
    const staffList = StaffRepo.getAll();
    for (const s of staffList) {
        if (!s.subjects) continue;
        try {
            let assignments = [];
            if (typeof s.subjects === 'string') assignments = JSON.parse(s.subjects);
            else if (Array.isArray(s.subjects)) assignments = s.subjects;
            else continue;

            const match = assignments.find(a => {
                if (typeof a === 'string') return a === subjectId;
                const sid = a.subjectId || a.id || a.subject || '';
                const sg = a.grade || '';
                return sid === subjectId && (!sg || sg === grade);
            });
            if (match) return s.name;
        } catch (e) { /* skip malformed */ }
    }
    return '';
}

// --- Personalized CBC Remarks ---
function generateRemarks(rows, overallAvg, student) {
    const scored = rows.filter(r => r.avg > 0);
    if (scored.length === 0) return 'No assessment data recorded for this term.';

    const strongest = [...scored].sort((a, b) => b.avg - a.avg).slice(0, 2);
    const weakest = [...scored].sort((a, b) => a.avg - b.avg).slice(0, 2);
    const firstName = (student.name || 'The learner').split(' ')[0];
    const pronoun = student.gender === 'Female' ? 'She' : 'He';
    const poss = student.gender === 'Female' ? 'her' : 'his';
    const ref = student.gender === 'Female' ? 'her' : 'him';

    let remark = '';

    if (overallAvg >= 80) {
        remark = `${firstName} has demonstrated exceptional academic performance this term, exceeding expectations in most learning areas. `;
        remark += `${pronoun} shows outstanding competence particularly in ${strongest.map(s => s.subjectName).join(' and ')}. `;
        remark += `${pronoun} is highly motivated, consistent in ${poss} work, and displays excellent critical thinking skills. `;
        remark += `${firstName} should continue to challenge ${ref}self with advanced tasks and peer mentoring opportunities. `;
        remark += `Keep up the exemplary work!`;
    } else if (overallAvg >= 50) {
        remark = `${firstName} has shown satisfactory progress this term and is meeting expectations in several learning areas. `;
        remark += `${pronoun} performs well in ${strongest.map(s => s.subjectName).join(' and ')}. `;
        const weakBelow50 = weakest.filter(w => w.avg < 50);
        if (weakBelow50.length > 0) {
            remark += `However, ${pronoun} needs to put more effort in ${weakBelow50.map(w => w.subjectName).join(' and ')} to move from approaching to meeting expectations. `;
        }
        remark += `With consistent revision, active participation in class, and completion of assignments, ${firstName} can significantly improve ${poss} overall performance. `;
        remark += `${pronoun} is encouraged to seek clarification from teachers whenever needed.`;
    } else if (overallAvg >= 30) {
        remark = `${firstName} is approaching the expected competency levels but requires additional support in several learning areas. `;
        remark += `${pronoun} shows some understanding in ${strongest[0]?.subjectName || 'a few areas'} which is encouraging. `;
        remark += `${pronoun} needs targeted support and extra practice in ${weakest.map(w => w.subjectName).join(', ')}. `;
        remark += `Regular attendance of remedial classes, guided revision, and parental involvement in ${poss} studies will greatly help ${ref} improve. `;
        remark += `The class teacher will closely monitor ${poss} progress next term.`;
    } else {
        remark = `${firstName} is currently below the expected competency levels and requires urgent intervention across most learning areas. `;
        remark += `${pronoun} struggles significantly with ${weakest.slice(0, 3).map(w => w.subjectName).join(', ')}. `;
        remark += `A meeting between the school, the parent/guardian, and the class teacher is strongly recommended to develop a targeted support plan. `;
        remark += `${pronoun} will benefit from one-on-one tutoring, simplified learning materials, and continuous encouragement. `;
        remark += `Early intervention is key to helping ${firstName} get back on track.`;
    }

    return remark;
}

// --- Build Report Data for One Student ---
function getStudentReportData(studentId, term, year) {
    const student = StudentRepo.getById(studentId);
    if (!student) return null;

    const grade = student.grade;
    term = term || store.settings.currentTerm;
    year = year || store.settings.academicYear;

    // Applicable learning areas for this grade
    const subjects = (store.learningAreas || []).filter(la =>
        la.applicableLevels && la.applicableLevels.includes(grade)
    );

    // All exams for this student
    const studentExams = (store.exams || []).filter(e => e.studentId === studentId);

    // Detect which assessment types exist for this term/year
    const typeSet = new Set();
    studentExams.forEach(e => {
        if (e.type && VALID_ASSESSMENT_TYPES.includes(e.type) &&
            e.term === term && String(e.year) === String(year)) {
            typeSet.add(e.type);
        }
    });

    const sortedTypes = [...typeSet].sort((a, b) =>
        (ASSESSMENT_TYPE_ORDER[a] || 99) - (ASSESSMENT_TYPE_ORDER[b] || 99)
    );

    if (sortedTypes.length === 0) return null; // No data

    // Build rows
    const rows = subjects.map((subj, idx) => {
        const row = {
            num: idx + 1, subjectName: subj.name, subjectId: subj.id,
            teacherName: getSubjectTeacherName(subj.id, grade),
            scores: {}, total: 0, count: 0, avg: 0, rating: null
        };

        sortedTypes.forEach(type => {
            const exam = studentExams.find(e =>
                e.subjectId === subj.id && e.type === type &&
                e.term === term && String(e.year) === String(year)
            );
            const score = exam ? parseInt(exam.score) || 0 : 0;
            row.scores[type] = score;
            if (score > 0) { row.total += score; row.count++; }
        });

        row.avg = row.count > 0 ? Math.round(row.total / row.count) : 0;
        row.rating = row.avg > 0 ? cbcRating(row.avg) : null;
        return row;
    });

    // Overall average (average of subject averages, not all scores)
    const scoredRows = rows.filter(r => r.avg > 0);
    const overallAvg = scoredRows.length > 0
        ? Math.round(scoredRows.reduce((s, r) => s + r.avg, 0) / scoredRows.length)
        : 0;

    // Class rank calculation
    const gradeStudents = StudentRepo.findBy('grade', grade);
    const gradeAvgs = gradeStudents.map(s => {
        const sExams = (store.exams || []).filter(e =>
            e.studentId === s.id && e.term === term &&
            String(e.year) === String(year) && e.type && parseInt(e.score) > 0
        );
        if (sExams.length === 0) return -1;
        const subjMap = {};
        sExams.forEach(e => {
            if (!subjMap[e.subjectId]) subjMap[e.subjectId] = [];
            subjMap[e.subjectId].push(parseInt(e.score) || 0);
        });
        const subjAvgs = Object.values(subjMap).map(sc =>
            Math.round(sc.reduce((a, b) => a + b, 0) / sc.length)
        );
        return subjAvgs.reduce((a, b) => a + b, 0) / subjAvgs.length;
    }).filter(a => a >= 0).sort((a, b) => b - a);

    let rank = '-';
    for (let i = 0; i < gradeAvgs.length; i++) {
        if (Math.abs(gradeAvgs[i] - overallAvg) < 0.5) { rank = i + 1; break; }
    }

    return {
        student, term, year, sortedTypes, rows,
        overallAvg, overallRating: overallAvg > 0 ? cbcRating(overallAvg) : null,
        rank, totalInGrade: gradeStudents.length,
        remarks: generateRemarks(rows, overallAvg, student)
    };
}

// --- Render Report Card into jsPDF doc (reusable for batch) ---
function renderReportCardToDoc(doc, data, startY) {
    const pageW = 210, pageH = 297, margin = 12;
    let y = startY;
    const s = store.settings;

    // ===== HEADER =====
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.text(s.schoolName || 'Friends Tande Primary & JS', pageW / 2, y + 6, { align: 'center' });
    y += 9;

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'italic');
    doc.text(`"${s.motto || ''}"`, pageW / 2, y, { align: 'center' });
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(
        `${s.address || ''}  |  Tel: ${s.phone || ''}  |  Email: ${s.email || ''}`,
        pageW / 2, y, { align: 'center' }
    );
    y += 4;
    doc.text(
        `School Code: ${s.schoolCode || ''}   |   ${s.level || ''}   |   ${s.category || ''}`,
        pageW / 2, y, { align: 'center' }
    );
    y += 4;

    // Green double line
    doc.setDrawColor(34, 197, 94);
    doc.setLineWidth(1.5);
    doc.line(margin, y, pageW - margin, y);
    doc.setLineWidth(0.3);
    doc.line(margin, y + 2, pageW - margin, y + 2);
    y += 8;

    // Title
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(' Learner Academic Report Card', pageW / 2, y, { align: 'center' });
    y += 8;

    // ===== STUDENT INFO =====
    doc.setFontSize(8.5);
    const c1 = margin + 2, c2 = pageW / 2 + 8;
    const info = [
        ['Full Name:', data.student.name, 'Admission No:', data.student.reg || 'N/A'],
        ['Grade:', data.student.grade, 'Stream:', data.student.stream || 'N/A'],
        ['Term:', data.term, 'Academic Year:', data.year],
    ];
    info.forEach(([l1, v1, l2, v2]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(l1, c1, y);
        doc.setFont('helvetica', 'normal');
        doc.text(String(v1), c1 + 22, y);
        doc.setFont('helvetica', 'bold');
        doc.text(l2, c2, y);
        doc.setFont('helvetica', 'normal');
        doc.text(String(v2), c2 + 28, y);
        y += 5.5;
    });
    y += 4;

    // ===== MAIN TABLE =====
    const hasTeacher = data.rows.some(r => r.teacherName);
    const headers = ['#', 'Learning Area'];
    data.sortedTypes.forEach(t => headers.push(t));
    headers.push('Avg', 'Rating');
    if (hasTeacher) headers.push('Subject Teacher');

    const body = data.rows.map(r => {
        const row = [r.num, r.subjectName];
        data.sortedTypes.forEach(t => row.push(r.scores[t] || '—'));
        row.push(r.avg > 0 ? r.avg : '—');
        row.push(r.rating ? r.rating.code : '—');
        if (hasTeacher) row.push(r.teacherName || '—');
        return row;
    });

    // Summary row
    const summaryRow = ['', 'OVERALL'];
    data.sortedTypes.forEach(() => summaryRow.push(''));
    summaryRow.push(data.overallAvg > 0 ? data.overallAvg + '%' : '—');
    summaryRow.push(data.overallRating ? data.overallRating.code : '—');
    if (hasTeacher) summaryRow.push('');

    // Dynamic column styles
    const colStyles = {
        0: { halign: 'center', cellWidth: 8 },
        1: { cellWidth: hasTeacher ? 42 : 52 },
    };
    data.sortedTypes.forEach((_, i) => {
        colStyles[2 + i] = { halign: 'center', cellWidth: 16 };
    });
    const avgIdx = 2 + data.sortedTypes.length;
    colStyles[avgIdx] = { halign: 'center', cellWidth: 16, fontStyle: 'bold' };
    const ratingIdx = avgIdx + 1;
    colStyles[ratingIdx] = { halign: 'center', cellWidth: 16, fontStyle: 'bold' };
    if (hasTeacher) {
        colStyles[ratingIdx + 1] = { cellWidth: 32, fontSize: 6.5, overflow: 'ellipsize' };
    }

    const totalRows = body.length;
    const bodyWithSummary = [...body, summaryRow];

    doc.autoTable({
        startY: y,
        head: [headers],
        body: bodyWithSummary,
        margin: { left: margin, right: margin },
        styles: {
            fontSize: 7.5, cellPadding: 2.2,
            lineColor: [210, 210, 210], lineWidth: 0.2,
            font: 'helvetica', valign: 'middle', overflow: 'linebreak'
        },
        headStyles: {
            fillColor: [15, 23, 42], textColor: [255, 255, 255],
            fontStyle: 'bold', fontSize: 7.5, halign: 'center'
        },
        bodyStyles: { textColor: [30, 41, 59] },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: colStyles,
        didParseCell: function (tableData) {
            // Summary row highlight
            if (tableData.row.index === totalRows && tableData.section === 'body') {
                tableData.cell.styles.fillColor = [236, 253, 245];
                tableData.cell.styles.fontStyle = 'bold';
                tableData.cell.styles.fontSize = 8;
                return;
            }
            // Color-code rating cells
            if (tableData.column.index === ratingIdx && tableData.section === 'body') {
                const v = tableData.cell.raw;
                if (v === 'EE') tableData.cell.styles.textColor = [22, 163, 74];
                else if (v === 'ME') tableData.cell.styles.textColor = [37, 99, 235];
                else if (v === 'AE') tableData.cell.styles.textColor = [217, 119, 6];
                else if (v === 'BE') tableData.cell.styles.textColor = [220, 38, 38];
            }
            // Color-code individual score cells
            if (tableData.section === 'body' && typeof tableData.cell.raw === 'number') {
                if (tableData.cell.raw >= 80) tableData.cell.styles.textColor = [22, 163, 74];
                else if (tableData.cell.raw >= 50) tableData.cell.styles.textColor = [37, 99, 235];
                else if (tableData.cell.raw >= 30) tableData.cell.styles.textColor = [217, 119, 6];
                else if (tableData.cell.raw > 0) tableData.cell.styles.textColor = [220, 38, 38];
            }
        }
    });

    y = doc.lastAutoTable.finalY + 8;

    // ===== SUMMARY BOX =====
    if (y > pageH - 85) { doc.addPage(); y = margin; }

    doc.setDrawColor(34, 197, 94);
    doc.setLineWidth(0.6);
    doc.roundedRect(margin, y, pageW - 2 * margin, 20, 3, 3, 'S');
    doc.setFillColor(248, 253, 250);
    doc.roundedRect(margin, y, pageW - 2 * margin, 20, 3, 3, 'F');

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text('PERFORMANCE SUMMARY', margin + 6, y + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Total Average: ${data.overallAvg}%`, margin + 6, y + 14);
    doc.text(`Overall Rating: ${data.overallRating ? data.overallRating.text : 'N/A'}`, margin + 60, y + 14);
    doc.text(`Class Position: ${data.rank} out of ${data.totalInGrade}`, margin + 125, y + 14);

    // Rating color in summary
    if (data.overallRating) {
        doc.setTextColor(...hexToRgb(data.overallRating.color));
        doc.setFont('helvetica', 'bold');
        doc.text(`[${data.overallRating.code}]`, margin + 190, y + 14);
        doc.setTextColor(0);
        doc.setFont('helvetica', 'normal');
    }

    y += 26;

    // ===== REMARKS =====
    if (y > pageH - 55) { doc.addPage(); y = margin; }

    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, pageW - 2 * margin, 35, 2, 2, 'S');

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text("CLASS TEACHER'S REMARKS:", margin + 5, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    const splitRemarks = doc.splitTextToSize(data.remarks, pageW - 2 * margin - 10);
    doc.text(splitRemarks, margin + 5, y + 12);
    y += 40;

    // ===== SIGNATURES =====
    if (y > pageH - 30) { doc.addPage(); y = margin; }

    const sigY = y + 8;
    const segW = (pageW - 2 * margin) / 3;
    const today = new Date().toLocaleDateString('en-KE', { day: '2-digit', month: 'long', year: 'numeric' });

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');

    // Class Teacher sig
    doc.text('Class Teacher', margin + segW * 0.5, sigY, { align: 'center' });
    doc.setLineWidth(0.3);
    doc.line(margin + 15, sigY + 3, margin + segW - 15, sigY + 3);
    doc.setFontSize(6.5);
    doc.text('Name & Signature', margin + segW * 0.5, sigY + 8, { align: 'center' });

    // HOI sig
    doc.setFontSize(7.5);
    doc.text('Head of Institution', margin + segW * 1.5, sigY, { align: 'center' });
    doc.line(margin + segW + 15, sigY + 3, margin + segW * 2 - 15, sigY + 3);
    doc.setFontSize(6.5);
    doc.text(s.hoiName || 'Name & Signature', margin + segW * 1.5, sigY + 8, { align: 'center' });

    // Date
    doc.setFontSize(7.5);
    doc.text('Date:', margin + segW * 2.5, sigY, { align: 'center' });
    doc.line(margin + segW * 2 + 15, sigY + 3, margin + segW * 3 - 15, sigY + 3);
    doc.setFontSize(6.5);
    doc.text(today, margin + segW * 2.5, sigY + 8, { align: 'center' });

    // ===== FOOTER =====
    const footY = pageH - 5;
    doc.setFontSize(5.5);
    doc.setTextColor(160);
    doc.text(
        `Generated by ElimuTrack CBC Management System  |  ${new Date().toLocaleString('en-KE')}`,
        pageW / 2, footY, { align: 'center' }
    );
    doc.setTextColor(0);

    return y;
}
// --- Color helper ---
function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
}
// --- Download Single Student Report Card ---
function downloadStudentReportCard(studentId) {
    const data = getStudentReportData(studentId);
    if (!data) {
        showToast('No assessment data found for this student this term.', 'error');
        return;
    }
    const { doc } = new jspdf.jsPDF('p', 'mm', 'a4');
    renderReportCardToDoc(doc, data, 12);
    const fname = `Report_${data.student.name.replace(/\s+/g, '_')}_${data.term}_${data.year}.pdf`;
    doc.save(fname);
    showToast(`Downloaded: ${fname}`);
}
// --- Download Full Grade Report (all students, one PDF) ---
function downloadGradeReport(grade) {
    const students = StudentRepo.findBy('grade', grade);
    if (students.length === 0) {
        showToast(`No learners found in ${grade}.`, 'error');
        return;
    }

    const term = $('reportTermSelect')?.value || store.settings.currentTerm;
    const year = $('reportYearSelect')?.value || store.settings.academicYear;
    const { doc } = new jspdf.jsPDF('p', 'mm', 'a4');
    let first = true;
    let count = 0;

    students.forEach(student => {
        const data = getStudentReportData(student.id, term, year);
        if (!data) return; // Skip students with no data
        if (!first) doc.addPage();
        first = false;
        renderReportCardToDoc(doc, data, 12);
        count++;
    });

    if (count === 0) {
        showToast(`No assessment data found for ${grade} this term.`, 'error');
        return;
    }

    const fname = `Grade_Report_${grade.replace(/\s+/g, '_')}_${term}_${year}.pdf`;
    doc.save(fname);
    showToast(`Downloaded ${count} report cards for ${grade}`);
}

// --- Preview Student Report in Modal ---
function previewStudentReport(studentId) {
    const data = getStudentReportData(studentId);
    const container = $('reportPreviewContent');
    if (!container) return;

    if (!data) {
        container.innerHTML = `<div class="empty-state" style="padding:3rem;text-align:center;">
            <i class="fa-solid fa-file-circle-xmark" style="font-size:3rem;color:var(--text-muted);margin-bottom:1rem;display:block;"></i>
            <h3>No Assessment Data</h3>
            <p style="color:var(--text-muted);">This learner has no recorded assessments for the selected term.</p>
        </div>`;
        return;
    }

    const hasTeacher = data.rows.some(r => r.teacherName);
    const typeHeaders = data.sortedTypes.map(t => `<th>${escapeHtml(t)}</th>`).join('');

    container.innerHTML = `
        <div class="report-preview-header">
            <div class="rph-school">
                <strong style="font-size:1.1rem;">${escapeHtml(store.settings.schoolName)}</strong>
                <em style="font-size:0.8rem;color:var(--text-muted);display:block;">"${escapeHtml(store.settings.motto)}"</em>
            </div>
            <div class="rph-student">
                <div><strong>Name:</strong> ${escapeHtml(data.student.name)}</div>
                <div><strong>ADM:</strong> ${escapeHtml(data.student.reg || 'N/A')}</div>
                <div><strong>Grade:</strong> ${escapeHtml(data.student.grade)} &nbsp; <strong>Stream:</strong> ${escapeHtml(data.student.stream || 'N/A')}</div>
                <div><strong>Term:</strong> ${escapeHtml(data.term)} &nbsp; <strong>Year:</strong> ${escapeHtml(data.year)}</div>
            </div>
        </div>
        <div class="report-preview-table-wrap">
            <table class="data-table report-preview-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Learning Area</th>
                        ${typeHeaders}
                        <th>Avg</th>
                        <th>Rating</th>
                        ${hasTeacher ? '<th>Teacher</th>' : ''}
                    </tr>
                </thead>
                <tbody>
                    ${data.rows.map(r => `
                        <tr>
                            <td style="text-align:center;">${r.num}</td>
                            <td>${escapeHtml(r.subjectName)}</td>
                            ${data.sortedTypes.map(t => {
                                const sc = r.scores[t];
                                const style = sc > 0 ? `color:${cbcRating(sc).color};font-weight:700;` : 'color:var(--text-muted);';
                                return `<td style="text-align:center;${style}">${sc > 0 ? sc : '—'}</td>`;
                            }).join('')}
                            <td style="text-align:center;font-weight:700;${r.avg > 0 ? 'color:' + (r.rating?.color || 'inherit') : 'color:var(--text-muted);'}">${r.avg > 0 ? r.avg + '%' : '—'}</td>
                            <td style="text-align:center;font-weight:700;${r.rating ? 'color:' + r.rating.color : ''}">${r.rating ? r.rating.code : '—'}</td>
                            ${hasTeacher ? `<td style="font-size:0.8rem;">${escapeHtml(r.teacherName || '—')}</td>` : ''}
                        </tr>
                    `).join('')}
                    <tr class="report-summary-row">
                        <td></td>
                        <td><strong>OVERALL</strong></td>
                        ${data.sortedTypes.map(() => '<td></td>').join('')}
                        <td style="text-align:center;font-weight:800;font-size:1rem;${data.overallRating ? 'color:' + data.overallRating.color : ''}">${data.overallAvg > 0 ? data.overallAvg + '%' : '—'}</td>
                        <td style="text-align:center;font-weight:800;${data.overallRating ? 'color:' + data.overallRating.color : ''}">${data.overallRating ? data.overallRating.code : '—'}</td>
                        ${hasTeacher ? '<td></td>' : ''}
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="report-preview-summary">
            <div class="rps-item"><span class="rps-label">Total Average</span><strong style="font-size:1.2rem;${data.overallRating ? 'color:' + data.overallRating.color : ''}">${data.overallAvg}%</strong></div>
            <div class="rps-item"><span class="rps-label">Rating</span><strong>${data.overallRating ? data.overallRating.text : 'N/A'}</strong></div>
            <div class="rps-item"><span class="rps-label">Class Rank</span><strong>${data.rank} / ${data.totalInGrade}</strong></div>
        </div>
        <div class="report-preview-remarks">
            <strong>Class Teacher's Remarks:</strong>
            <p>${escapeHtml(data.remarks)}</p>
        </div>
        <div class="report-preview-actions">
            <button class="btn btn-primary" onclick="downloadStudentReportCard('${studentId}')">
                <i class="fa-solid fa-file-pdf"></i> Download PDF
            </button>
            <button class="btn btn-secondary" onclick="window.print()">
                <i class="fa-solid fa-print"></i> Print
            </button>
        </div>
    `;

    openModal('reportPreviewModal');
}

function populateReportStudentList() {
    const select = $('reportLearnerSelect');
    if (!select) return;

    const gradeFilter = getVal('reportGradeFilter') || 'all';
    let students = gradeFilter === 'all' ? StudentRepo.getAll() : StudentRepo.findBy('grade', gradeFilter);
    students.sort((a,b) => (a.name||'').localeCompare(b.name||''));

    select.innerHTML = '<option value="">-- Choose a learner --</option>' + 
        students.map(s => `<option value="${s.id}">${escapeHtml(s.name)} (${escapeHtml(s.grade)} - ${escapeHtml(s.reg || 'N/A')})</option>`).join('');
}

function selectReportStudent(id) {
    selectedReportStudentId = id;
    const student = StudentRepo.getById(id);
    if (!student) return;
    
    // Visual feedback for selection
    document.querySelectorAll('.report-student-row').forEach(row => {
        row.style.background = row.dataset.studentId === id ? 'var(--bg-soft, #f1f5f9)' : '';
        row.style.borderLeft = row.dataset.studentId === id ? '4px solid var(--primary, #3b82f6)' : '';
    });
    
    showToast(`Selected: ${student.name}`, 'success');
}

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

// ==========================================================================
//   MASTER REPORTS OVERRIDE (Bypasses Broken Modals)
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. FIX: "Generate Report" Button (Individual)
    const btnGen = $('btnGenerateIndividual');
    if (btnGen) {
        // Nuke old listeners
        const newBtn = btnGen.cloneNode(true);
        btnGen.parentNode.replaceChild(newBtn, btnGen);
        
        newBtn.addEventListener('click', (e) => {
            e.preventDefault(); e.stopPropagation();
            const id = $('reportLearnerSelect') ? $('reportLearnerSelect').value : null;
            if (!id) {
                showToast('Please select a learner from the dropdown.', 'error');
                return;
            }
            // Call the direct generator (No modals!)
            if (typeof generateStudentReport === 'function') {
                generateStudentReport(id);
            }
        });
    }

    // 2. FIX: "Download Grade Reports" Button
    const btnDl = $('btnDownloadGradePDFs');
    if (btnDl) {
        const newDl = btnDl.cloneNode(true);
        btnDl.parentNode.replaceChild(newDl, btnDl);
        
        newDl.addEventListener('click', (e) => {
            e.preventDefault(); e.stopPropagation();
            const grade = getVal('reportGradeFilter');
            if (!grade || grade === 'all') {
                showToast('Please select a specific grade first.', 'error');
                return;
            }
            
            const students = StudentRepo.findBy('grade', grade).sort((a,b) => (a.name||'').localeCompare(b.name||''));
            if (students.length === 0) return showToast('No learners in this grade.', 'error');
            
            const term = getVal('reportTermFilter') || 'Term 1';
            const year = getVal('reportYearFilter') || String(new Date().getFullYear());
            const validExams = (store.exams || []).filter(e => e.grade === grade && e.term === term && String(e.year) === String(year) && e.score > 0);
            if (validExams.length === 0) return showToast(`No scores for ${grade} in ${term} ${year}.`, 'warning');

            try {
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF();
                let count = 0;
                
                students.forEach((student, i) => {
                    const sExams = validExams.filter(e => e.studentId === student.id);
                    if (sExams.length === 0) return;
                    count++;
                    if (i > 0) doc.addPage();
                    
                    const subData = {};
                    sExams.forEach(e => {
                        if (!subData[e.subjectId]) {
                            const area = (store.learningAreas || []).find(la => la.id === e.subjectId);
                            subData[e.subjectId] = { name: area ? area.name : e.subjectId, scores: [] };
                        }
                        subData[e.subjectId].scores.push(parseInt(e.score));
                    });
                    const subs = Object.values(subData);
                    let total = 0, cnt = 0;
                    const body = subs.map(sub => { const avg = Math.round(sub.scores.reduce((a,b)=>a+b,0)/sub.scores.length); total += avg; cnt++; return [sub.name, `${avg}%`, cbcRating(avg).code]; });
                    const mean = cnt > 0 ? Math.round(total / cnt) : 0;
                    
                    doc.setFontSize(14); doc.text(store.settings.schoolName || 'School', 105, 15, {align:'center'});
                    doc.setFontSize(10); doc.text(`${term} ${year} Report`, 105, 22, {align:'center'});
                    doc.text(`Name: ${student.name} | ADM: ${student.reg || 'N/A'}`, 20, 35);
                    doc.text(`Grade: ${student.grade} | Mean: ${mean}% (${cbcRating(mean).code})`, 20, 41);
                    doc.autoTable({ startY: 50, head: [['Learning Area', 'Score', 'Rating']], body, theme:'grid', headStyles:{fillColor:[59,130,246]}, styles:{fontSize:9} });
                });
                
                if (count === 0) return showToast('No students had scores to print.', 'warning');
                doc.save(`${grade.replace(/\s/g,'_')}_${term}_Reports.pdf`);
                showToast(`Downloaded ${count} report cards!`, 'success');
            } catch(err) { console.error(err); showToast('PDF generation failed.', 'error'); }
        });
    }

    // 3. FIX: "PDF" and "Print" Tab Buttons (If they exist)
    document.querySelectorAll('#reports button').forEach(btn => {
        const text = btn.textContent.trim();
        if (text === 'PDF' || text === 'Print') {
            const newTabBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newTabBtn, btn);
            newTabBtn.addEventListener('click', (e) => {
                e.preventDefault(); e.stopPropagation();
                // Trigger the same logic as Download Grade Reports
                newDl.click();
            });
        }
        if (text === 'Individual Report Card') {
            const newModalBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newModalBtn, btn);
            newModalBtn.addEventListener('click', (e) => {
                e.preventDefault(); e.stopPropagation();
                // Don't open the broken modal, just focus on the top bar
                const topBar = $('reportStudentSelectorBar');
                if (topBar) topBar.scrollIntoView({ behavior: 'smooth', block: 'center' });
                showToast('Use the dropdown and "Generate Report" button above.', 'info');
            });
        }
    });

    console.log('✅ Master Reports Override Active. Modals bypassed.');
});



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
    (store.exams || []).forEach(exam => {
        if (!exam.assessType) exam.assessType = 'End Term';
        if (exam.assessType === 'opener') exam.assessType = 'Opener';
        if (exam.assessType === 'midterm') exam.assessType = 'Mid Term';
        if (exam.assessType === 'endterm') exam.assessType = 'End Term';
        if (exam.assessType === 'endyear') exam.assessType = 'End Year';
    });
}
function getAssessments() {
    return (store.exams || []).filter(e => e.type === 'assessment');
}

function getAssessmentById(id) {
    return getAssessments().find(a => a.id === id || a.virtualId === id);
}

function getStudentsForGrade(grade) {
    return StudentRepo.getAll().filter(s => s.grade === grade);
}

function getSubjectsForGrade(grade) {
    return store.learningAreas.filter(la => la.applicableLevels && la.applicableLevels.includes(grade));
}

function getSubjectName(subjectId) {
    const la = store.learningAreas.find(l => l.id === subjectId);
    return la ? la.name : subjectId;
}

function getSubjectById(subjectId) {
    return store.learningAreas.find(l => l.id === subjectId);
}



function populateAssessSubjects() {
    const grade = getVal('assessGrade');
    const container = $('assessSubjectsContainer');
    if (!container) return;

    if (!grade) {
        container.innerHTML = '<span style="color:var(--text-muted); font-size:0.85rem;">Select a grade first to load subjects.</span>';
        return;
    }

    const subjects = getSubjectsForGrade(grade);
    if (subjects.length === 0) {
        container.innerHTML = '<span style="color:var(--text-muted); font-size:0.85rem;">No learning areas found for this grade.</span>';
        return;
    }

    container.innerHTML = subjects.map(s => `
        <label class="assess-subject-chip" style="display:inline-flex;align-items:center;gap:0.35rem;padding:0.4rem 0.75rem;border:1px solid var(--border);border-radius:20px;cursor:pointer;font-size:0.82rem;transition:all 0.2s;background:var(--bg-body);">
            <input type="checkbox" name="assessSubject" value="${s.id}" checked style="accent-color:var(--primary);">
            ${escapeHtml(s.name)}
        </label>
    `).join('');

    // Style interactions
    container.querySelectorAll('.assess-subject-chip').forEach(chip => {
        const cb = chip.querySelector('input');
        cb.addEventListener('change', () => {
            chip.style.background = cb.checked ? 'var(--primary-light, #dcfce7)' : 'var(--bg-body)';
            chip.style.borderColor = cb.checked ? 'var(--primary)' : 'var(--border)';
        });
        // Trigger initial style
        chip.style.background = 'var(--primary-light, #dcfce7)';
        chip.style.borderColor = 'var(--primary)';
    });
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

function populateSubjectDropdown(assessment, selectElementId) {
    const select = document.getElementById(selectElementId);
    if (!select) return;

    // Clear existing options (keep placeholder)
    while (select.options.length > 1) {
        select.remove(1);
    }

    if (!assessment || !assessment.subjects) {
        console.warn('populateSubjectDropdown: No assessment or subjects found', assessment);
        return;
    }

    // Normalize subjects to an array regardless of input format
    let subjectsList = [];

    if (Array.isArray(assessment.subjects)) {
        // Already an array — use directly
        subjectsList = assessment.subjects;
    } else if (typeof assessment.subjects === 'object') {
        // It's an object like { "Math": {...}, "English": {...} }
        // Convert to array of { name, ...rest } 
        subjectsList = Object.entries(assessment.subjects).map(([key, value]) => {
            if (typeof value === 'object' && value !== null) {
                return { name: key, ...value };
            }
            return { name: key };
        });
    } else if (typeof assessment.subjects === 'string') {
        // It's a comma-separated string like "Math, English, Science"
        subjectsList = assessment.subjects.split(',').map(s => s.trim()).filter(Boolean).map(name => ({ name }));
    } else {
        console.error('populateSubjectDropdown: Unexpected subjects type:', typeof assessment.subjects, assessment.subjects);
        return;
    }

    // Now safely iterate
    subjectsList.forEach(subject => {
        const option = document.createElement('option');
        const displayName = subject.name || subject.subjectName || subject.title || 'Unknown';
        option.value = subject.id || subject._id || displayName;
        option.textContent = displayName;
        select.appendChild(option);
    });

    return subjectsList;
}

// --- TAB SWITCHING ---
function switchExamTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.exam-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.examtab === tabName);
    });
    // Update tab content
    document.querySelectorAll('.exam-tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `examTab-${tabName}`);
    });
    // Trigger loads
    switch (tabName) {
        case 'assessments': renderAssessmentCards(); break;
        case 'enter': populateScoreEntryDropdowns(); break;
        case 'results': populateResultsDropdowns(); break;
        case 'analysis': populateAnalysisDropdowns(); break;
        case 'batch': populateBatchDropdowns(); break;
    }
}
// --- TAB 1: ASSESSMENT CARDS ---
function renderAssessmentCards() {
    const grid = $('assessGrid');
    const emptyState = $('assessEmptyState');
    if (!grid || !emptyState) return;

    const gradeFilter = getVal('examFilterGrade') || 'all';
    const typeFilter = getVal('examFilterType') || 'all';
    const termFilter = getVal('examFilterTerm') || 'all';
    const statusFilter = getVal('examFilterStatus') || 'all';

    let assessments = getAssessments().filter(a => {
        if (gradeFilter !== 'all' && a.grade !== gradeFilter) return false;
        if (typeFilter !== 'all' && a.assessType !== typeFilter) return false;
        if (termFilter !== 'all' && a.term !== termFilter) return false;
        if (statusFilter !== 'all' && a.status !== statusFilter) return false;
        return true;
    });

    setText('examCountLabel', `${assessments.length} assessment${assessments.length !== 1 ? 's' : ''}`);

    if (assessments.length === 0) {
        grid.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';

    // Sort: newest first
    assessments.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    grid.innerHTML = assessments.map(a => {
        const studentCount = getStudentsForGrade(a.grade).length;
        const subjectCount = (a.subjects || []).length;
        const scoredCount = getScoredCount(a);
        const progressPct = studentCount > 0 ? Math.round((scoredCount / (studentCount * subjectCount)) * 100) : 0;

        const statusColors = {
            draft: { bg: '#fef3c7', color: '#92400e', icon: 'fa-pencil' },
            open: { bg: '#dcfce7', color: '#166534', icon: 'fa-lock-open' },
            closed: { bg: '#f1f5f9', color: '#475569', icon: 'fa-lock' }
        };
        const st = statusColors[a.status] || statusColors.draft;

        const typeColors = {
            'Opener': 'type-opener',
            'Mid Term': 'type-midterm',
            'End Term': 'type-endterm',
            'End Year': 'type-endyear'
        };

        return `
        <div class="assess-card" data-id="${a.id}">
            <div class="assess-card-header">
                <span class="assess-type-badge ${typeColors[a.assessType] || ''}">${escapeHtml(a.assessType || 'Exam')}</span>
                <div class="assess-status-dot" style="background:${st.color};" title="${a.status}"></div>
            </div>
            <div class="assess-card-body">
                <h4 class="assess-card-title">${escapeHtml(a.name)}</h4>
                <div class="assess-card-meta">
                    <span><i class="fa-solid fa-graduation-cap"></i> ${escapeHtml(a.grade)}</span>
                    <span><i class="fa-solid fa-calendar"></i> ${escapeHtml(a.term)}</span>
                </div>
                <div class="assess-card-stats">
                    <div class="acs-item">
                        <span class="acs-val">${studentCount}</span>
                        <span class="acs-label">Learners</span>
                    </div>
                    <div class="acs-item">
                        <span class="acs-val">${subjectCount}</span>
                        <span class="acs-label">Subjects</span>
                    </div>
                    <div class="acs-item">
                        <span class="acs-val">${progressPct}%</span>
                        <span class="acs-label">Scored</span>
                    </div>
                </div>
                <div class="assess-progress-bar">
                    <div class="assess-progress-fill" style="width:${progressPct}%; background:${st.color};"></div>
                </div>
            </div>
            <div class="assess-card-footer">
                <button class="assess-action-btn" onclick="openAssessmentForScoring('${a.id}')" title="Enter Scores">
                    <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button class="assess-action-btn" onclick="viewAssessmentResults('${a.id}')" title="View Results">
                    <i class="fa-solid fa-table-columns"></i>
                </button>
                <button class="assess-action-btn" onclick="toggleAssessmentStatus('${a.id}')" title="Toggle Status">
                    <i class="fa-solid ${a.status === 'open' ? 'fa-lock' : 'fa-lock-open'}"></i>
                </button>
                <button class="assess-action-btn assess-action-danger" onclick="promptDeleteAssessment('${a.id}')" title="Delete">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </div>`;
    }).join('');
}
function promptDeleteAssessment(id) {
    const assessment = getAssessmentById(id);
    if (!assessment) return;
    setText('deleteAssessName', assessment.name);
    openModal('deleteAssessModal');
    $('deleteAssessModal').dataset.assessId = id;
}

function toggleAssessmentStatus(id) {
    const assessment = getAssessmentById(id);
    if (!assessment) return;
    if (assessment.status === 'draft') assessment.status = 'open';
    else if (assessment.status === 'open') assessment.status = 'closed';
    else assessment.status = 'draft';
    saveData();
    renderAssessmentCards();
    showToast(`Assessment status changed to "${assessment.status}"`);
}

function openAssessmentForScoring(id) {
    switchExamTab('enter');
    setTimeout(() => {
        setVal('scoreEntryAssessment', id);
        loadScoreEntryTable();
    }, 100);
}

function viewAssessmentResults(id) {
    switchExamTab('results');
    setTimeout(() => {
        setVal('resultsAssessment', id);
        loadResultsTable();
    }, 100);
}


function getScoredCount(assessment) {
    if (!assessment.scores) return 0;
    let count = 0;
    const students = getStudentsForGrade(assessment.grade);
    students.forEach(student => {
        (assessment.subjects || []).forEach(subId => {
            const key = `${student.id}_${subId}`;
            if (assessment.scores[key] && assessment.scores[key].score !== '' && assessment.scores[key].score !== undefined) {
                count++;
            }
        });
    });
    return count;
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
    const modal = $('deleteAssessModal');
    const id = modal.dataset.assessId;
    if (!id) return;
    store.exams = store.exams.filter(e => e.id !== id && e.virtualId !== id);
    saveData();  // repackAssessments() + sends clean list without deleted item
    closeModal('deleteAssessModal');
    renderAssessmentCards();
    showToast('Assessment deleted successfully');
}

function openCreateAssessmentModal() {
    const form = $('createAssessmentForm');
    if (form) form.reset();
    setText('courseModalTitle', 'Create New Assessment'); // Reset if reused
    $('assessSubjectsContainer').innerHTML = '<span style="color:var(--text-muted); font-size:0.85rem;">Select a grade first to load subjects.</span>';
    openModal('createAssessmentModal');
}

// --- TAB 2: SCORE ENTRY ---
function populateScoreEntryDropdowns() {
    const assessSelect = $('scoreEntryAssessment');
    if (!assessSelect) return;

    const currentVal = assessSelect.value;
    const assessments = getAssessments();

    assessSelect.innerHTML = '<option value="">Select Assessment...</option>' +
        assessments.map(a => `<option value="${a.id}">${escapeHtml(a.name)} — ${a.grade} (${a.term})</option>`).join('');

    if (currentVal && assessments.some(a => a.id === currentVal)) {
        assessSelect.value = currentVal;
    }

    populateScoreEntrySubjects();
}
function populateScoreEntrySubjects() {
    const assessId = getVal('scoreEntryAssessment');
    const subjectSelect = $('scoreEntrySubject');
    if (!subjectSelect) return;

    if (!assessId) {
        subjectSelect.innerHTML = '<option value="">Select Subject...</option>';
        return;
    }

    const assessment = getAssessmentById(assessId);
    if (!assessment) {
        subjectSelect.innerHTML = '<option value="">Select Subject...</option>';
        return;
    }

    const currentVal = subjectSelect.value;
    subjectSelect.innerHTML = '<option value="">Select Subject...</option>' +
        (assessment.subjects || []).map(subId => {
            const sub = getSubjectById(subId);
            return sub ? `<option value="${sub.id}">${escapeHtml(sub.name)}</option>` : '';
        }).join('');

    if (currentVal && (assessment.subjects || []).includes(currentVal)) {
        subjectSelect.value = currentVal;
    }
}

function loadScoreEntryTable() {
    populateScoreEntrySubjects();
    const assessId = getVal('scoreEntryAssessment');
    const subjectId = getVal('scoreEntrySubject');
    const wrapper = $('scoreEntryWrapper');
    const emptyState = $('scoreEntryEmpty');
    const body = $('scoreEntryBody');

    if (!wrapper || !emptyState || !body) return;

    if (!assessId || !subjectId) {
        wrapper.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    const assessment = getAssessmentById(assessId);
    if (!assessment) {
        wrapper.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    const students = getStudentsForGrade(assessment.grade);
    if (students.length === 0) {
        wrapper.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    const subject = getSubjectById(subjectId);
    setText('scoreEntryTitle', `${assessment.name} — ${subject ? subject.name : subjectId}`);
    setText('scoreEntryCount', `${students.length} learners`);

    wrapper.style.display = 'block';
    emptyState.style.display = 'none';

    body.innerHTML = students.map((student, idx) => {
        const key = `${student.id}_${subjectId}`;
        const existing = (assessment.scores || {})[key] || {};
        const score = existing.score !== undefined ? existing.score : '';
        const rating = score !== '' ? cbcRating(parseFloat(score)) : null;

        return `
        <tr class="score-entry-row" data-student-id="${student.id}" data-key="${key}">
            <td style="text-align:center; color:var(--text-muted);">${idx + 1}</td>
            <td><strong>${escapeHtml(student.name)}</strong></td>
            <td style="color:var(--text-muted); font-size:0.85rem;">${escapeHtml(student.reg || 'N/A')}</td>
            <td class="subj-col">
                <input type="number" class="score-input" min="0" max="100" value="${score}"
                    data-key="${key}" data-student="${student.id}" data-subject="${subjectId}"
                    oninput="onScoreInput(this)" placeholder="—">
            </td>
            <td class="subj-col">
                <span class="cbc-rating-badge ${rating ? rating.cls : ''}" id="rating_${key}"
                    style="display:${rating ? 'inline-flex' : 'none'}; padding:0.25rem 0.6rem; border-radius:20px; font-size:0.78rem; font-weight:600; background:${rating ? rating.color + '22' : 'transparent'}; color:${rating ? rating.color : 'inherit'};">
                    ${rating ? rating.code : ''}
                </span>
            </td>
            <td class="subj-col">
                <span id="remark_${key}" style="font-size:0.82rem; color:var(--text-muted);">${rating ? escapeHtml(rating.text) : ''}</span>
            </td>
        </tr>`;
    }).join('');
}

function onScoreInput(input) {
    const val = input.value;
    const key = input.dataset.key;
    const ratingEl = $(`rating_${key}`);
    const remarkEl = $(`remark_${key}`);

    if (val === '' || isNaN(val)) {
        if (ratingEl) ratingEl.style.display = 'none';
        if (remarkEl) remarkEl.textContent = '';
        return;
    }

    const score = Math.min(100, Math.max(0, parseInt(val)));
    const rating = cbcRating(score);

    if (ratingEl) {
        ratingEl.style.display = 'inline-flex';
        ratingEl.className = `cbc-rating-badge ${rating.cls}`;
        ratingEl.style.background = rating.color + '22';
        ratingEl.style.color = rating.color;
        ratingEl.textContent = rating.code;
    }
    if (remarkEl) remarkEl.textContent = rating.text;
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
    const assessId = getVal('scoreEntryAssessment');
    const assessment = getAssessmentById(assessId);
    if (!assessment) return;

    if (!assessment.scores) assessment.scores = {};

    document.querySelectorAll('.score-input').forEach(input => {
        const key = input.dataset.key;
        const val = input.value;
        if (val !== '') {
            assessment.scores[key] = {
                score: parseInt(val),
                studentId: input.dataset.student,
                subjectId: input.dataset.subject,
                updatedAt: Date.now()
            };
        }
    });

    saveData();
    showToast('Scores saved as draft');
}

function submitAllScores() {
    const assessId = getVal('scoreEntryAssessment');
    const assessment = getAssessmentById(assessId);
    if (!assessment) return;

    if (!assessment.scores) assessment.scores = {};

    let enteredCount = 0;
    document.querySelectorAll('.score-input').forEach(input => {
        const key = input.dataset.key;
        const val = input.value;
        if (val !== '') {
            assessment.scores[key] = {
                score: parseInt(val),
                studentId: input.dataset.student,
                subjectId: input.dataset.subject,
                submitted: true,
                updatedAt: Date.now()
            };
            enteredCount++;
        }
    });

    assessment.status = 'closed';
    saveData();
    showToast(`${enteredCount} scores submitted and assessment closed`);
    switchExamTab('assessments');
}

function filterScoreEntryRows() {
    const q = getVal('scoreEntrySearch').toLowerCase();
    document.querySelectorAll('.score-entry-row').forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(q) ? '' : 'none';
    });
}

// --- TAB 3: RESULTS ---

function populateResultsDropdowns() {
    const assessSelect = $('resultsAssessment');
    if (!assessSelect) return;

    const currentVal = assessSelect.value;
    const assessments = getAssessments();

    assessSelect.innerHTML = '<option value="">Select Assessment...</option>' +
        assessments.map(a => `<option value="${a.id}">${escapeHtml(a.name)} — ${a.grade} (${a.term})</option>`).join('');

    if (currentVal && assessments.some(a => a.id === currentVal)) {
        assessSelect.value = currentVal;
    }
}

function loadResultsTable() {
    const assessId = getVal('resultsAssessment');
    const gradeFilter = getVal('resultsGrade') || 'all';
    const wrapper = $('resultsWrapper');
    const emptyState = $('resultsEmpty');
    const head = $('resultsHead');
    const body = $('resultsBody');

    if (!wrapper || !emptyState || !head || !body) return;

    if (!assessId) {
        wrapper.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    const assessment = getAssessmentById(assessId);
    if (!assessment) {
        wrapper.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    let students = getStudentsForGrade(assessment.grade);
    if (gradeFilter !== 'all') {
        students = students.filter(s => s.grade === gradeFilter);
    }

    if (students.length === 0) {
        wrapper.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    const subjects = (assessment.subjects || []).map(subId => getSubjectById(subId)).filter(Boolean);

    setText('resultsTitle', `${assessment.name} — Results Marksheet`);

    // Build header
    let headerHtml = `<tr>
        <th style="width:40px;">#</th>
        <th>Student Name</th>
        <th>ADM No</th>`;
    subjects.forEach(sub => {
        headerHtml += `<th class="subj-col" style="text-align:center; min-width:70px;">${escapeHtml(sub.name.length > 12 ? sub.name.substring(0, 12) + '...' : sub.name)}</th>`;
    });
    headerHtml += `<th style="text-align:center; font-weight:700;">Total</th>
        <th style="text-align:center; font-weight:700;">Mean</th>
        <th style="text-align:center; font-weight:700;">Grade</th>
    </tr>`;
    head.innerHTML = headerHtml;

    // Build body
    let allTotals = [];
    body.innerHTML = students.map((student, idx) => {
        let total = 0, scoredCount = 0;
        let cells = `<td style="text-align:center; color:var(--text-muted);">${idx + 1}</td>
            <td><strong>${escapeHtml(student.name)}</strong></td>
            <td style="color:var(--text-muted); font-size:0.85rem;">${escapeHtml(student.reg || 'N/A')}</td>`;

        subjects.forEach(sub => {
            const key = `${student.id}_${sub.id}`;
            const scoreData = (assessment.scores || {})[key];
            const score = scoreData ? parseInt(scoreData.score) : 0;
            if (score > 0) { total += score; scoredCount++; }
            const rating = score > 0 ? cbcRating(score) : null;
            cells += `<td class="subj-col" style="text-align:center;">
                <span style="color:${rating ? rating.color : 'var(--text-muted)'}; font-weight:${score > 0 ? '600' : '400'};">${score > 0 ? score : '—'}</span>
            </td>`;
        });

        const mean = scoredCount > 0 ? Math.round(total / scoredCount) : 0;
        const meanRating = mean > 0 ? cbcRating(mean) : null;
        allTotals.push(mean);

        cells += `<td style="text-align:center; font-weight:700;">${scoredCount > 0 ? total : '—'}</td>
            <td style="text-align:center; font-weight:700; color:${meanRating ? meanRating.color : 'inherit'};">${mean > 0 ? mean : '—'}</td>
            <td style="text-align:center;">
                <span class="cbc-rating-badge ${meanRating ? meanRating.cls : ''}" style="padding:0.2rem 0.5rem; border-radius:20px; font-size:0.75rem; font-weight:600; background:${meanRating ? meanRating.color + '22' : 'transparent'}; color:${meanRating ? meanRating.color : 'inherit'};">
                    ${meanRating ? meanRating.code : '—'}
                </span>
            </td>`;

        return `<tr class="result-row" data-student-id="${student.id}">${cells}</tr>`;
    }).join('');

    // Stats
    const validMeans = allTotals.filter(m => m > 0);
    const overallMean = validMeans.length > 0 ? Math.round(validMeans.reduce((a, b) => a + b, 0) / validMeans.length) : 0;
    setText('resultsStats', `${students.length} learners | Overall Mean: ${overallMean}%`);

    wrapper.style.display = 'block';
    emptyState.style.display = 'none';
}

function filterResultRows() {
    const q = getVal('resultsSearch').toLowerCase();
    document.querySelectorAll('.result-row').forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(q) ? '' : 'none';
    });
}

function printResults() {
    const wrapper = $('resultsWrapper');
    if (!wrapper || wrapper.style.display === 'none') {
        showToast('No results to print', 'error');
        return;
    }

    const title = $('resultsTitle').textContent;
    const stats = $('resultsStats').textContent;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${escapeHtml(title)}</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 2rem; }
                h1 { text-align: center; font-size: 1.3rem; margin-bottom: 0.25rem; }
                .stats { text-align: center; color: #666; font-size: 0.9rem; margin-bottom: 1.5rem; }
                table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
                th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: center; }
                th { background: #f5f5f5; font-weight: 600; }
                td:nth-child(2) { text-align: left; }
                @media print { body { padding: 0.5rem; } }
            </style>
        </head>
        <body>
            <h1>${escapeHtml(store.settings.schoolName || 'School')}</h1>
            <h1>${escapeHtml(title)}</h1>
            <div class="stats">${escapeHtml(stats)}</div>
            ${$('resultsTable').outerHTML}
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}


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
    const wrapper = $('resultsWrapper');
    if (!wrapper || wrapper.style.display === 'none') {
        showToast('No results to export', 'error');
        return;
    }

    const table = $('resultsTable');
    if (!table) return;

    let csv = '';
    const rows = table.querySelectorAll('tr');
    rows.forEach(row => {
        const cells = row.querySelectorAll('th, td');
        const rowData = [];
        cells.forEach(cell => rowData.push('"' + cell.textContent.replace(/"/g, '""').trim() + '"'));
        csv += rowData.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `results_${getVal('resultsAssessment') || 'export'}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    showToast('Results exported as CSV');
}



// --- TAB 4: SUBJECT ANALYSIS ---

function populateAnalysisDropdowns() {
    const assessSelect = $('analysisAssessment');
    if (!assessSelect) return;

    const currentVal = assessSelect.value;
    const assessments = getAssessments();

    assessSelect.innerHTML = '<option value="">Select Assessment...</option>' +
        assessments.map(a => `<option value="${a.id}">${escapeHtml(a.name)} — ${a.grade} (${a.term})</option>`).join('');

    if (currentVal && assessments.some(a => a.id === currentVal)) {
        assessSelect.value = currentVal;
    }

    populateAnalysisSubjects();
}
function populateAnalysisSubjects() {
    const assessId = getVal('analysisAssessment');
    const subjectSelect = $('analysisSubject');
    if (!subjectSelect) return;

    if (!assessId) {
        subjectSelect.innerHTML = '<option value="all">All Subjects</option>';
        return;
    }

    const assessment = getAssessmentById(assessId);
    if (!assessment) {
        subjectSelect.innerHTML = '<option value="all">All Subjects</option>';
        return;
    }

    const currentVal = subjectSelect.value;
    subjectSelect.innerHTML = '<option value="all">All Subjects</option>' +
        (assessment.subjects || []).map(subId => {
            const sub = getSubjectById(subId);
            return sub ? `<option value="${sub.id}">${escapeHtml(sub.name)}</option>` : '';
        }).join('');

    if (currentVal) subjectSelect.value = currentVal;
}

function loadSubjectAnalysis() {
    populateAnalysisSubjects();
    const assessId = getVal('analysisAssessment');
    const subjectFilter = getVal('analysisSubject') || 'all';
    const kpiContainer = $('subjectAnalysisKpis');
    const wrapper = $('analysisWrapper');
    const emptyState = $('analysisEmpty');
    const body = $('analysisBody');

    if (!wrapper || !emptyState || !body) return;

    if (!assessId) {
        if (kpiContainer) kpiContainer.innerHTML = '';
        wrapper.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    const assessment = getAssessmentById(assessId);
    if (!assessment) {
        wrapper.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    const students = getStudentsForGrade(assessment.grade);
    let subjects = (assessment.subjects || []).map(subId => getSubjectById(subId)).filter(Boolean);
    if (subjectFilter !== 'all') {
        subjects = subjects.filter(s => s.id === subjectFilter);
    }

    if (subjects.length === 0 || students.length === 0) {
        wrapper.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    // Compute analysis per subject
    let allScores = [];
    const analysisData = subjects.map(sub => {
        const scores = students.map(student => {
            const key = `${student.id}_${sub.id}`;
            const scoreData = (assessment.scores || {})[key];
            return scoreData ? parseInt(scoreData.score) : null;
        }).filter(s => s !== null && s > 0);

        allScores = allScores.concat(scores);
        const entries = scores.length;
        const mean = entries > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / entries) : 0;
        const highest = entries > 0 ? Math.max(...scores) : 0;
        const lowest = entries > 0 ? Math.min(...scores) : 0;
        const ee = scores.filter(s => s >= 80).length;
        const me = scores.filter(s => s >= 50 && s < 80).length;
        const ae = scores.filter(s => s >= 30 && s < 50).length;
        const be = scores.filter(s => s < 30).length;

        return { subject: sub.name, entries, mean, highest, lowest, ee, me, ae, be };
    });

    // KPIs
    const totalEntries = allScores.length;
    const overallMean = totalEntries > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / totalEntries) : 0;
    const eeCount = allScores.filter(s => s >= 80).length;
    const beCount = allScores.filter(s => s < 30).length;

    if (kpiContainer) {
        kpiContainer.innerHTML = `
            <div class="modern-card" style="padding:1rem; border-left:4px solid var(--primary);">
                <div style="font-size:0.78rem; color:var(--text-muted);">Total Entries</div>
                <div style="font-size:1.5rem; font-weight:700;">${totalEntries}</div>
            </div>
            <div class="modern-card" style="padding:1rem; border-left:4px solid #22c55e;">
                <div style="font-size:0.78rem; color:var(--text-muted);">Overall Mean</div>
                <div style="font-size:1.5rem; font-weight:700; color:#22c55e;">${overallMean}%</div>
            </div>
            <div class="modern-card" style="padding:1rem; border-left:4px solid #3b82f6;">
                <div style="font-size:0.78rem; color:var(--text-muted);">EE (≥80)</div>
                <div style="font-size:1.5rem; font-weight:700; color:#3b82f6;">${eeCount}</div>
            </div>
            <div class="modern-card" style="padding:1rem; border-left:4px solid #ef4444;">
                <div style="font-size:0.78rem; color:var(--text-muted);">BE (<30)</div>
                <div style="font-size:1.5rem; font-weight:700; color:#ef4444;">${beCount}</div>
            </div>
        `;
    }

    // Table
    body.innerHTML = analysisData.map(d => {
        const meanRating = d.mean > 0 ? cbcRating(d.mean) : null;
        return `
        <tr>
            <td><strong>${escapeHtml(d.subject)}</strong></td>
            <td style="text-align:center;">${d.entries}</td>
            <td style="text-align:center; font-weight:700; color:${meanRating ? meanRating.color : 'inherit'};">${d.mean > 0 ? d.mean : '—'}</td>
            <td style="text-align:center; color:#22c55e; font-weight:600;">${d.highest || '—'}</td>
            <td style="text-align:center; color:#ef4444; font-weight:600;">${d.lowest || '—'}</td>
            <td style="text-align:center; color:#22c55e; font-weight:600;">${d.ee}</td>
            <td style="text-align:center; color:#3b82f6; font-weight:600;">${d.me}</td>
            <td style="text-align:center; color:#f59e0b; font-weight:600;">${d.ae}</td>
            <td style="text-align:center; color:#ef4444; font-weight:600;">${d.be}</td>
        </tr>`;
    }).join('');

    wrapper.style.display = 'block';
    emptyState.style.display = 'none';
}

function exportAnalysisPDF() {
    const wrapper = $('analysisWrapper');
    if (!wrapper || wrapper.style.display === 'none') {
        showToast('No analysis to export', 'error');
        return;
    }

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Subject Analysis Report</title>
            <style>
                body { font-family: 'Segoe UI', sans-serif; padding: 2rem; }
                h1 { text-align: center; font-size: 1.3rem; }
                .kpi-row { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
                .kpi-card { flex: 1; padding: 0.75rem; border: 1px solid #ddd; border-radius: 8px; text-align: center; }
                .kpi-val { font-size: 1.5rem; font-weight: 700; }
                .kpi-label { font-size: 0.8rem; color: #666; }
                table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
                th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: center; }
                th { background: #f5f5f5; }
                td:first-child { text-align: left; }
            </style>
        </head>
        <body>
            <h1>${escapeHtml(store.settings.schoolName || 'School')} — Subject Analysis</h1>
            ${$('subjectAnalysisKpis').innerHTML.replace(/class="modern-card"/g, 'class="kpi-card"')}
            ${$('analysisTable').outerHTML}
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}


// --- TAB 5: BATCH ENTRY ---
function populateBatchDropdowns() {
    const assessSelect = $('batchAssessment');
    if (!assessSelect) return;

    const currentVal = assessSelect.value;
    const assessments = getAssessments();

    assessSelect.innerHTML = '<option value="">Select Assessment...</option>' +
        assessments.map(a => `<option value="${a.id}">${escapeHtml(a.name)} — ${a.grade} (${a.term})</option>`).join('');

    if (currentVal && assessments.some(a => a.id === currentVal)) {
        assessSelect.value = currentVal;
    }
}


// ==========================================================================
//   ASSESSMENT CENTRE — Complete Implementation
// ==========================================================================

// ── Virtual Assessment Store ──
function initVirtualAssessments() {
     unpackAssessments(); 
    virtualAssessments = store.exams ? store.exams.filter(e => e.type === 'assessment') : [];
    // Normalize legacy assessments
    (store.exams || []).forEach(exam => {
        if (!exam.virtualId) exam.virtualId = generateId();
        if (!exam.scores) exam.scores = {};
        if (!exam.status) exam.status = 'draft';
        if (!exam.type) exam.type = 'assessment';
    });
}

function normalizeLegacyAssessmentTypes() {
    (store.exams || []).forEach(exam => {
        if (!exam.assessType) exam.assessType = 'End Term';
        if (exam.assessType === 'opener') exam.assessType = 'Opener';
        if (exam.assessType === 'midterm') exam.assessType = 'Mid Term';
        if (exam.assessType === 'endterm') exam.assessType = 'End Term';
        if (exam.assessType === 'endyear') exam.assessType = 'End Year';
    });
}

function getAssessments() {
    return (store.exams || []).filter(e => e.type === 'assessment');
}

function getAssessmentById(id) {
    return getAssessments().find(a => a.id === id || a.virtualId === id);
}

function getStudentsForGrade(grade) {
    return StudentRepo.getAll().filter(s => s.grade === grade);
}

function getSubjectsForGrade(grade) {
    return store.learningAreas.filter(la => la.applicableLevels && la.applicableLevels.includes(grade));
}

function getSubjectName(subjectId) {
    const la = store.learningAreas.find(l => l.id === subjectId);
    return la ? la.name : subjectId;
}

function getSubjectById(subjectId) {
    return store.learningAreas.find(l => l.id === subjectId);
}

// ── TAB SWITCHING ──
function switchExamTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.exam-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.examtab === tabName);
    });
    // Update tab content
    document.querySelectorAll('.exam-tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `examTab-${tabName}`);
    });
    // Trigger loads
    switch (tabName) {
        case 'assessments': renderAssessmentCards(); break;
        case 'enter': populateScoreEntryDropdowns(); break;
        case 'results': populateResultsDropdowns(); break;
        case 'analysis': populateAnalysisDropdowns(); break;
        case 'batch': populateBatchDropdowns(); break;
    }
}

// ── TAB 1: MY ASSESSMENTS ──
function renderAssessmentCards() {
    const grid = $('assessGrid');
    const emptyState = $('assessEmptyState');
    if (!grid || !emptyState) return;

    const gradeFilter = getVal('examFilterGrade') || 'all';
    const typeFilter = getVal('examFilterType') || 'all';
    const termFilter = getVal('examFilterTerm') || 'all';
    const statusFilter = getVal('examFilterStatus') || 'all';

    let assessments = getAssessments().filter(a => {
        if (gradeFilter !== 'all' && a.grade !== gradeFilter) return false;
        if (typeFilter !== 'all' && a.assessType !== typeFilter) return false;
        if (termFilter !== 'all' && a.term !== termFilter) return false;
        if (statusFilter !== 'all' && a.status !== statusFilter) return false;
        return true;
    });

    setText('examCountLabel', `${assessments.length} assessment${assessments.length !== 1 ? 's' : ''}`);

    if (assessments.length === 0) {
        grid.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';

    // Sort: newest first
    assessments.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    grid.innerHTML = assessments.map(a => {
        const studentCount = getStudentsForGrade(a.grade).length;
        const subjectCount = (a.subjects || []).length;
        const scoredCount = getScoredCount(a);
        const progressPct = studentCount > 0 ? Math.round((scoredCount / (studentCount * subjectCount)) * 100) : 0;

        const statusColors = {
            draft: { bg: '#fef3c7', color: '#92400e', icon: 'fa-pencil' },
            open: { bg: '#dcfce7', color: '#166534', icon: 'fa-lock-open' },
            closed: { bg: '#f1f5f9', color: '#475569', icon: 'fa-lock' }
        };
        const st = statusColors[a.status] || statusColors.draft;

        const typeColors = {
            'Opener': 'type-opener',
            'Mid Term': 'type-midterm',
            'End Term': 'type-endterm',
            'End Year': 'type-endyear'
        };

        return `
        <div class="assess-card" data-id="${a.id}">
            <div class="assess-card-header">
                <span class="assess-type-badge ${typeColors[a.assessType] || ''}">${escapeHtml(a.assessType || 'Exam')}</span>
                <div class="assess-status-dot" style="background:${st.color};" title="${a.status}"></div>
            </div>
            <div class="assess-card-body">
                <h4 class="assess-card-title">${escapeHtml(a.name)}</h4>
                <div class="assess-card-meta">
                    <span><i class="fa-solid fa-graduation-cap"></i> ${escapeHtml(a.grade)}</span>
                    <span><i class="fa-solid fa-calendar"></i> ${escapeHtml(a.term)}</span>
                </div>
                <div class="assess-card-stats">
                    <div class="acs-item">
                        <span class="acs-val">${studentCount}</span>
                        <span class="acs-label">Learners</span>
                    </div>
                    <div class="acs-item">
                        <span class="acs-val">${subjectCount}</span>
                        <span class="acs-label">Subjects</span>
                    </div>
                    <div class="acs-item">
                        <span class="acs-val">${progressPct}%</span>
                        <span class="acs-label">Scored</span>
                    </div>
                </div>
                <div class="assess-progress-bar">
                    <div class="assess-progress-fill" style="width:${progressPct}%; background:${st.color};"></div>
                </div>
            </div>
            <div class="assess-card-footer">
                <button class="assess-action-btn" onclick="openAssessmentForScoring('${a.id}')" title="Enter Scores">
                    <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button class="assess-action-btn" onclick="viewAssessmentResults('${a.id}')" title="View Results">
                    <i class="fa-solid fa-table-columns"></i>
                </button>
                <button class="assess-action-btn" onclick="toggleAssessmentStatus('${a.id}')" title="Toggle Status">
                    <i class="fa-solid ${a.status === 'open' ? 'fa-lock' : 'fa-lock-open'}"></i>
                </button>
                <button class="assess-action-btn assess-action-danger" onclick="promptDeleteAssessment('${a.id}')" title="Delete">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </div>`;
    }).join('');
}

function getScoredCount(assessment) {
    if (!assessment.scores) return 0;
    let count = 0;
    const students = getStudentsForGrade(assessment.grade);
    students.forEach(student => {
        (assessment.subjects || []).forEach(subId => {
            const key = `${student.id}_${subId}`;
            if (assessment.scores[key] && assessment.scores[key].score !== '' && assessment.scores[key].score !== undefined) {
                count++;
            }
        });
    });
    return count;
}

function openAssessmentForScoring(id) {
    switchExamTab('enter');
    setTimeout(() => {
        setVal('scoreEntryAssessment', id);
        loadScoreEntryTable();
    }, 100);
}

function viewAssessmentResults(id) {
    switchExamTab('results');
    setTimeout(() => {
        setVal('resultsAssessment', id);
        loadResultsTable();
    }, 100);
}

function toggleAssessmentStatus(id) {
    const assessment = getAssessmentById(id);
    if (!assessment) return;
    if (assessment.status === 'draft') assessment.status = 'open';
    else if (assessment.status === 'open') assessment.status = 'closed';
    else assessment.status = 'draft';
    saveData();
    renderAssessmentCards();
    showToast(`Assessment status changed to "${assessment.status}"`);
}

function promptDeleteAssessment(id) {
    const assessment = getAssessmentById(id);
    if (!assessment) return;
    setText('deleteAssessName', assessment.name);
    openModal('deleteAssessModal');
    $('deleteAssessModal').dataset.assessId = id;
}

function confirmDeleteAssessment() {
    const modal = $('deleteAssessModal');
    const id = modal.dataset.assessId;
    if (!id) return;
    store.exams = store.exams.filter(e => e.id !== id && e.virtualId !== id);
    saveData();
    closeModal('deleteAssessModal');
    renderAssessmentCards();
    showToast('Assessment deleted successfully');
}

// ── CREATE ASSESSMENT MODAL ──
function openCreateAssessmentModal() {
    const form = $('createAssessmentForm');
    if (form) form.reset();
    setText('courseModalTitle', 'Create New Assessment'); // Reset if reused
    $('assessSubjectsContainer').innerHTML = '<span style="color:var(--text-muted); font-size:0.85rem;">Select a grade first to load subjects.</span>';
    openModal('createAssessmentModal');
}

function populateAssessSubjects() {
    const grade = getVal('assessGrade');
    const container = $('assessSubjectsContainer');
    if (!container) return;

    if (!grade) {
        container.innerHTML = '<span style="color:var(--text-muted); font-size:0.85rem;">Select a grade first to load subjects.</span>';
        return;
    }

    const subjects = getSubjectsForGrade(grade);
    if (subjects.length === 0) {
        container.innerHTML = '<span style="color:var(--text-muted); font-size:0.85rem;">No learning areas found for this grade.</span>';
        return;
    }

    container.innerHTML = subjects.map(s => `
        <label class="assess-subject-chip" style="display:inline-flex;align-items:center;gap:0.35rem;padding:0.4rem 0.75rem;border:1px solid var(--border);border-radius:20px;cursor:pointer;font-size:0.82rem;transition:all 0.2s;background:var(--bg-body);">
            <input type="checkbox" name="assessSubject" value="${s.id}" checked style="accent-color:var(--primary);">
            ${escapeHtml(s.name)}
        </label>
    `).join('');

    // Style interactions
    container.querySelectorAll('.assess-subject-chip').forEach(chip => {
        const cb = chip.querySelector('input');
        cb.addEventListener('change', () => {
            chip.style.background = cb.checked ? 'var(--primary-light, #dcfce7)' : 'var(--bg-body)';
            chip.style.borderColor = cb.checked ? 'var(--primary)' : 'var(--border)';
        });
        // Trigger initial style
        chip.style.background = 'var(--primary-light, #dcfce7)';
        chip.style.borderColor = 'var(--primary)';
    });
}



// ── TAB 2: ENTER SCORES ──
function populateScoreEntryDropdowns() {
    const assessSelect = $('scoreEntryAssessment');
    if (!assessSelect) return;

    const currentVal = assessSelect.value;
    const assessments = getAssessments();

    assessSelect.innerHTML = '<option value="">Select Assessment...</option>' +
        assessments.map(a => `<option value="${a.id}">${escapeHtml(a.name)} — ${a.grade} (${a.term})</option>`).join('');

    if (currentVal && assessments.some(a => a.id === currentVal)) {
        assessSelect.value = currentVal;
    }

    populateScoreEntrySubjects();
}

function populateScoreEntrySubjects() {
    const assessId = getVal('scoreEntryAssessment');
    const subjectSelect = $('scoreEntrySubject');
    if (!subjectSelect) return;

    if (!assessId) {
        subjectSelect.innerHTML = '<option value="">Select Subject...</option>';
        return;
    }

    const assessment = getAssessmentById(assessId);
    if (!assessment) {
        subjectSelect.innerHTML = '<option value="">Select Subject...</option>';
        return;
    }

    const currentVal = subjectSelect.value;
    subjectSelect.innerHTML = '<option value="">Select Subject...</option>' +
        (assessment.subjects || []).map(subId => {
            const sub = getSubjectById(subId);
            return sub ? `<option value="${sub.id}">${escapeHtml(sub.name)}</option>` : '';
        }).join('');

    if (currentVal && (assessment.subjects || []).includes(currentVal)) {
        subjectSelect.value = currentVal;
    }
}

function loadScoreEntryTable() {
    populateScoreEntrySubjects();
    const assessId = getVal('scoreEntryAssessment');
    const subjectId = getVal('scoreEntrySubject');
    const wrapper = $('scoreEntryWrapper');
    const emptyState = $('scoreEntryEmpty');
    const body = $('scoreEntryBody');

    if (!wrapper || !emptyState || !body) return;

    if (!assessId || !subjectId) {
        wrapper.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    const assessment = getAssessmentById(assessId);
    if (!assessment) {
        wrapper.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    const students = getStudentsForGrade(assessment.grade);
    if (students.length === 0) {
        wrapper.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    const subject = getSubjectById(subjectId);
    setText('scoreEntryTitle', `${assessment.name} — ${subject ? subject.name : subjectId}`);
    setText('scoreEntryCount', `${students.length} learners`);

    wrapper.style.display = 'block';
    emptyState.style.display = 'none';

    body.innerHTML = students.map((student, idx) => {
        const key = `${student.id}_${subjectId}`;
        const existing = (assessment.scores || {})[key] || {};
        const score = existing.score !== undefined ? existing.score : '';
        const rating = score !== '' ? cbcRating(parseFloat(score)) : null;

        return `
        <tr class="score-entry-row" data-student-id="${student.id}" data-key="${key}">
            <td style="text-align:center; color:var(--text-muted);">${idx + 1}</td>
            <td><strong>${escapeHtml(student.name)}</strong></td>
            <td style="color:var(--text-muted); font-size:0.85rem;">${escapeHtml(student.reg || 'N/A')}</td>
            <td class="subj-col">
                <input type="number" class="score-input" min="0" max="100" value="${score}"
                    data-key="${key}" data-student="${student.id}" data-subject="${subjectId}"
                    oninput="onScoreInput(this)" placeholder="—">
            </td>
            <td class="subj-col">
                <span class="cbc-rating-badge ${rating ? rating.cls : ''}" id="rating_${key}"
                    style="display:${rating ? 'inline-flex' : 'none'}; padding:0.25rem 0.6rem; border-radius:20px; font-size:0.78rem; font-weight:600; background:${rating ? rating.color + '22' : 'transparent'}; color:${rating ? rating.color : 'inherit'};">
                    ${rating ? rating.code : ''}
                </span>
            </td>
            <td class="subj-col">
                <span id="remark_${key}" style="font-size:0.82rem; color:var(--text-muted);">${rating ? escapeHtml(rating.text) : ''}</span>
            </td>
        </tr>`;
    }).join('');
}

function onScoreInput(input) {
    const val = input.value;
    const key = input.dataset.key;
    const ratingEl = $(`rating_${key}`);
    const remarkEl = $(`remark_${key}`);

    if (val === '' || isNaN(val)) {
        if (ratingEl) ratingEl.style.display = 'none';
        if (remarkEl) remarkEl.textContent = '';
        return;
    }

    const score = Math.min(100, Math.max(0, parseInt(val)));
    const rating = cbcRating(score);

    if (ratingEl) {
        ratingEl.style.display = 'inline-flex';
        ratingEl.className = `cbc-rating-badge ${rating.cls}`;
        ratingEl.style.background = rating.color + '22';
        ratingEl.style.color = rating.color;
        ratingEl.textContent = rating.code;
    }
    if (remarkEl) remarkEl.textContent = rating.text;
}

function filterScoreEntryRows() {
    const q = getVal('scoreEntrySearch').toLowerCase();
    document.querySelectorAll('.score-entry-row').forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(q) ? '' : 'none';
    });
}

function autoSaveScores() {
    const assessId = getVal('scoreEntryAssessment');
    const assessment = getAssessmentById(assessId);
    if (!assessment) return;

    if (!assessment.scores) assessment.scores = {};

    document.querySelectorAll('.score-input').forEach(input => {
        const key = input.dataset.key;
        const val = input.value;
        if (val !== '') {
            assessment.scores[key] = {
                score: parseInt(val),
                studentId: input.dataset.student,
                subjectId: input.dataset.subject,
                updatedAt: Date.now()
            };
        }
    });

    saveData();
    showToast('Scores saved as draft');
}

function submitAllScores() {
    const assessId = getVal('scoreEntryAssessment');
    const assessment = getAssessmentById(assessId);
    if (!assessment) return;

    if (!assessment.scores) assessment.scores = {};

    let enteredCount = 0;
    document.querySelectorAll('.score-input').forEach(input => {
        const key = input.dataset.key;
        const val = input.value;
        if (val !== '') {
            assessment.scores[key] = {
                score: parseInt(val),
                studentId: input.dataset.student,
                subjectId: input.dataset.subject,
                submitted: true,
                updatedAt: Date.now()
            };
            enteredCount++;
        }
    });

    assessment.status = 'closed';
    saveData();
    showToast(`${enteredCount} scores submitted and assessment closed`);
    switchExamTab('assessments');
}

// ── TAB 3: RESULTS ──
function populateResultsDropdowns() {
    const assessSelect = $('resultsAssessment');
    if (!assessSelect) return;

    const currentVal = assessSelect.value;
    const assessments = getAssessments();

    assessSelect.innerHTML = '<option value="">Select Assessment...</option>' +
        assessments.map(a => `<option value="${a.id}">${escapeHtml(a.name)} — ${a.grade} (${a.term})</option>`).join('');

    if (currentVal && assessments.some(a => a.id === currentVal)) {
        assessSelect.value = currentVal;
    }
}

function loadResultsTable() {
    const assessId = getVal('resultsAssessment');
    const gradeFilter = getVal('resultsGrade') || 'all';
    const wrapper = $('resultsWrapper');
    const emptyState = $('resultsEmpty');
    const head = $('resultsHead');
    const body = $('resultsBody');

    if (!wrapper || !emptyState || !head || !body) return;

    if (!assessId) {
        wrapper.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    const assessment = getAssessmentById(assessId);
    if (!assessment) {
        wrapper.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    let students = getStudentsForGrade(assessment.grade);
    if (gradeFilter !== 'all') {
        students = students.filter(s => s.grade === gradeFilter);
    }

    if (students.length === 0) {
        wrapper.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    const subjects = (assessment.subjects || []).map(subId => getSubjectById(subId)).filter(Boolean);

    setText('resultsTitle', `${assessment.name} — Results Marksheet`);

    // Build header
    let headerHtml = `<tr>
        <th style="width:40px;">#</th>
        <th>Student Name</th>
        <th>ADM No</th>`;
    subjects.forEach(sub => {
        headerHtml += `<th class="subj-col" style="text-align:center; min-width:70px;">${escapeHtml(sub.name.length > 12 ? sub.name.substring(0, 12) + '...' : sub.name)}</th>`;
    });
    headerHtml += `<th style="text-align:center; font-weight:700;">Total</th>
        <th style="text-align:center; font-weight:700;">Mean</th>
        <th style="text-align:center; font-weight:700;">Grade</th>
    </tr>`;
    head.innerHTML = headerHtml;

    // Build body
    let allTotals = [];
    body.innerHTML = students.map((student, idx) => {
        let total = 0, scoredCount = 0;
        let cells = `<td style="text-align:center; color:var(--text-muted);">${idx + 1}</td>
            <td><strong>${escapeHtml(student.name)}</strong></td>
            <td style="color:var(--text-muted); font-size:0.85rem;">${escapeHtml(student.reg || 'N/A')}</td>`;

        subjects.forEach(sub => {
            const key = `${student.id}_${sub.id}`;
            const scoreData = (assessment.scores || {})[key];
            const score = scoreData ? parseInt(scoreData.score) : 0;
            if (score > 0) { total += score; scoredCount++; }
            const rating = score > 0 ? cbcRating(score) : null;
            cells += `<td class="subj-col" style="text-align:center;">
                <span style="color:${rating ? rating.color : 'var(--text-muted)'}; font-weight:${score > 0 ? '600' : '400'};">${score > 0 ? score : '—'}</span>
            </td>`;
        });

        const mean = scoredCount > 0 ? Math.round(total / scoredCount) : 0;
        const meanRating = mean > 0 ? cbcRating(mean) : null;
        allTotals.push(mean);

        cells += `<td style="text-align:center; font-weight:700;">${scoredCount > 0 ? total : '—'}</td>
            <td style="text-align:center; font-weight:700; color:${meanRating ? meanRating.color : 'inherit'};">${mean > 0 ? mean : '—'}</td>
            <td style="text-align:center;">
                <span class="cbc-rating-badge ${meanRating ? meanRating.cls : ''}" style="padding:0.2rem 0.5rem; border-radius:20px; font-size:0.75rem; font-weight:600; background:${meanRating ? meanRating.color + '22' : 'transparent'}; color:${meanRating ? meanRating.color : 'inherit'};">
                    ${meanRating ? meanRating.code : '—'}
                </span>
            </td>`;

        return `<tr class="result-row" data-student-id="${student.id}">${cells}</tr>`;
    }).join('');

    // Stats
    const validMeans = allTotals.filter(m => m > 0);
    const overallMean = validMeans.length > 0 ? Math.round(validMeans.reduce((a, b) => a + b, 0) / validMeans.length) : 0;
    setText('resultsStats', `${students.length} learners | Overall Mean: ${overallMean}%`);

    wrapper.style.display = 'block';
    emptyState.style.display = 'none';
}

function filterResultRows() {
    const q = getVal('resultsSearch').toLowerCase();
    document.querySelectorAll('.result-row').forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(q) ? '' : 'none';
    });
}

function printResults() {
    const wrapper = $('resultsWrapper');
    if (!wrapper || wrapper.style.display === 'none') {
        showToast('No results to print', 'error');
        return;
    }

    const title = $('resultsTitle').textContent;
    const stats = $('resultsStats').textContent;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${escapeHtml(title)}</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 2rem; }
                h1 { text-align: center; font-size: 1.3rem; margin-bottom: 0.25rem; }
                .stats { text-align: center; color: #666; font-size: 0.9rem; margin-bottom: 1.5rem; }
                table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
                th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: center; }
                th { background: #f5f5f5; font-weight: 600; }
                td:nth-child(2) { text-align: left; }
                @media print { body { padding: 0.5rem; } }
            </style>
        </head>
        <body>
            <h1>${escapeHtml(store.settings.schoolName || 'School')}</h1>
            <h1>${escapeHtml(title)}</h1>
            <div class="stats">${escapeHtml(stats)}</div>
            ${$('resultsTable').outerHTML}
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

function exportResultsPDF() {
    showToast('PDF export initiated...', 'info');
    printResults(); // Fallback to print dialog
}

function exportResultsExcel() {
    const wrapper = $('resultsWrapper');
    if (!wrapper || wrapper.style.display === 'none') {
        showToast('No results to export', 'error');
        return;
    }

    const table = $('resultsTable');
    if (!table) return;

    let csv = '';
    const rows = table.querySelectorAll('tr');
    rows.forEach(row => {
        const cells = row.querySelectorAll('th, td');
        const rowData = [];
        cells.forEach(cell => rowData.push('"' + cell.textContent.replace(/"/g, '""').trim() + '"'));
        csv += rowData.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `results_${getVal('resultsAssessment') || 'export'}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    showToast('Results exported as CSV');
}

// ── TAB 4: SUBJECT ANALYSIS ──
function populateAnalysisDropdowns() {
    const assessSelect = $('analysisAssessment');
    if (!assessSelect) return;

    const currentVal = assessSelect.value;
    const assessments = getAssessments();

    assessSelect.innerHTML = '<option value="">Select Assessment...</option>' +
        assessments.map(a => `<option value="${a.id}">${escapeHtml(a.name)} — ${a.grade} (${a.term})</option>`).join('');

    if (currentVal && assessments.some(a => a.id === currentVal)) {
        assessSelect.value = currentVal;
    }

    populateAnalysisSubjects();
}

function populateAnalysisSubjects() {
    const assessId = getVal('analysisAssessment');
    const subjectSelect = $('analysisSubject');
    if (!subjectSelect) return;

    if (!assessId) {
        subjectSelect.innerHTML = '<option value="all">All Subjects</option>';
        return;
    }

    const assessment = getAssessmentById(assessId);
    if (!assessment) {
        subjectSelect.innerHTML = '<option value="all">All Subjects</option>';
        return;
    }

    const currentVal = subjectSelect.value;
    subjectSelect.innerHTML = '<option value="all">All Subjects</option>' +
        (assessment.subjects || []).map(subId => {
            const sub = getSubjectById(subId);
            return sub ? `<option value="${sub.id}">${escapeHtml(sub.name)}</option>` : '';
        }).join('');

    if (currentVal) subjectSelect.value = currentVal;
}

function loadSubjectAnalysis() {
    populateAnalysisSubjects();
    const assessId = getVal('analysisAssessment');
    const subjectFilter = getVal('analysisSubject') || 'all';
    const kpiContainer = $('subjectAnalysisKpis');
    const wrapper = $('analysisWrapper');
    const emptyState = $('analysisEmpty');
    const body = $('analysisBody');

    if (!wrapper || !emptyState || !body) return;

    if (!assessId) {
        if (kpiContainer) kpiContainer.innerHTML = '';
        wrapper.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    const assessment = getAssessmentById(assessId);
    if (!assessment) {
        wrapper.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    const students = getStudentsForGrade(assessment.grade);
    let subjects = (assessment.subjects || []).map(subId => getSubjectById(subId)).filter(Boolean);
    if (subjectFilter !== 'all') {
        subjects = subjects.filter(s => s.id === subjectFilter);
    }

    if (subjects.length === 0 || students.length === 0) {
        wrapper.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    // Compute analysis per subject
    let allScores = [];
    const analysisData = subjects.map(sub => {
        const scores = students.map(student => {
            const key = `${student.id}_${sub.id}`;
            const scoreData = (assessment.scores || {})[key];
            return scoreData ? parseInt(scoreData.score) : null;
        }).filter(s => s !== null && s > 0);

        allScores = allScores.concat(scores);
        const entries = scores.length;
        const mean = entries > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / entries) : 0;
        const highest = entries > 0 ? Math.max(...scores) : 0;
        const lowest = entries > 0 ? Math.min(...scores) : 0;
        const ee = scores.filter(s => s >= 80).length;
        const me = scores.filter(s => s >= 50 && s < 80).length;
        const ae = scores.filter(s => s >= 30 && s < 50).length;
        const be = scores.filter(s => s < 30).length;

        return { subject: sub.name, entries, mean, highest, lowest, ee, me, ae, be };
    });

    // KPIs
    const totalEntries = allScores.length;
    const overallMean = totalEntries > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / totalEntries) : 0;
    const eeCount = allScores.filter(s => s >= 80).length;
    const beCount = allScores.filter(s => s < 30).length;

    if (kpiContainer) {
        kpiContainer.innerHTML = `
            <div class="modern-card" style="padding:1rem; border-left:4px solid var(--primary);">
                <div style="font-size:0.78rem; color:var(--text-muted);">Total Entries</div>
                <div style="font-size:1.5rem; font-weight:700;">${totalEntries}</div>
            </div>
            <div class="modern-card" style="padding:1rem; border-left:4px solid #22c55e;">
                <div style="font-size:0.78rem; color:var(--text-muted);">Overall Mean</div>
                <div style="font-size:1.5rem; font-weight:700; color:#22c55e;">${overallMean}%</div>
            </div>
            <div class="modern-card" style="padding:1rem; border-left:4px solid #3b82f6;">
                <div style="font-size:0.78rem; color:var(--text-muted);">EE (≥80)</div>
                <div style="font-size:1.5rem; font-weight:700; color:#3b82f6;">${eeCount}</div>
            </div>
            <div class="modern-card" style="padding:1rem; border-left:4px solid #ef4444;">
                <div style="font-size:0.78rem; color:var(--text-muted);">BE (<30)</div>
                <div style="font-size:1.5rem; font-weight:700; color:#ef4444;">${beCount}</div>
            </div>
        `;
    }

    // Table
    body.innerHTML = analysisData.map(d => {
        const meanRating = d.mean > 0 ? cbcRating(d.mean) : null;
        return `
        <tr>
            <td><strong>${escapeHtml(d.subject)}</strong></td>
            <td style="text-align:center;">${d.entries}</td>
            <td style="text-align:center; font-weight:700; color:${meanRating ? meanRating.color : 'inherit'};">${d.mean > 0 ? d.mean : '—'}</td>
            <td style="text-align:center; color:#22c55e; font-weight:600;">${d.highest || '—'}</td>
            <td style="text-align:center; color:#ef4444; font-weight:600;">${d.lowest || '—'}</td>
            <td style="text-align:center; color:#22c55e; font-weight:600;">${d.ee}</td>
            <td style="text-align:center; color:#3b82f6; font-weight:600;">${d.me}</td>
            <td style="text-align:center; color:#f59e0b; font-weight:600;">${d.ae}</td>
            <td style="text-align:center; color:#ef4444; font-weight:600;">${d.be}</td>
        </tr>`;
    }).join('');

    wrapper.style.display = 'block';
    emptyState.style.display = 'none';
}

function exportAnalysisPDF() {
    const wrapper = $('analysisWrapper');
    if (!wrapper || wrapper.style.display === 'none') {
        showToast('No analysis to export', 'error');
        return;
    }

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Subject Analysis Report</title>
            <style>
                body { font-family: 'Segoe UI', sans-serif; padding: 2rem; }
                h1 { text-align: center; font-size: 1.3rem; }
                .kpi-row { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
                .kpi-card { flex: 1; padding: 0.75rem; border: 1px solid #ddd; border-radius: 8px; text-align: center; }
                .kpi-val { font-size: 1.5rem; font-weight: 700; }
                .kpi-label { font-size: 0.8rem; color: #666; }
                table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
                th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: center; }
                th { background: #f5f5f5; }
                td:first-child { text-align: left; }
            </style>
        </head>
        <body>
            <h1>${escapeHtml(store.settings.schoolName || 'School')} — Subject Analysis</h1>
            ${$('subjectAnalysisKpis').innerHTML.replace(/class="modern-card"/g, 'class="kpi-card"')}
            ${$('analysisTable').outerHTML}
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// ── TAB 5: BATCH ENTRY ──
function populateBatchDropdowns() {
    const assessSelect = $('batchAssessment');
    if (!assessSelect) return;

    const currentVal = assessSelect.value;
    const assessments = getAssessments();

    assessSelect.innerHTML = '<option value="">Select Assessment...</option>' +
        assessments.map(a => `<option value="${a.id}">${escapeHtml(a.name)} — ${a.grade} (${a.term})</option>`).join('');

    if (currentVal && assessments.some(a => a.id === currentVal)) {
        assessSelect.value = currentVal;
    }
}

function loadBatchGrid() {
    const assessId = getVal('batchAssessment');
    const wrapper = $('batchWrapper');
    const emptyState = $('batchEmpty');
    const head = $('batchHead');
    const body = $('batchBody');

    if (!wrapper || !emptyState || !head || !body) return;

    if (!assessId) {
        wrapper.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    const assessment = getAssessmentById(assessId);
    if (!assessment) {
        wrapper.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    const students = getStudentsForGrade(assessment.grade);
    const subjects = (assessment.subjects || []).map(subId => getSubjectById(subId)).filter(Boolean);

    if (students.length === 0 || subjects.length === 0) {
        wrapper.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    setText('batchTitle', `${assessment.name} — Batch Entry (${subjects.length} subjects)`);

    // Header
    let headerHtml = `<tr>
        <th style="width:40px; position:sticky; left:0; background:var(--bg-card, #fff); z-index:2;">#</th>
        <th style="min-width:180px; position:sticky; left:40px; background:var(--bg-card, #fff); z-index:2;">Student Name</th>
        <th style="min-width:100px; position:sticky; left:220px; background:var(--bg-card, #fff); z-index:2;">ADM No</th>`;
    subjects.forEach(sub => {
        headerHtml += `<th style="min-width:80px; text-align:center;">${escapeHtml(sub.name.length > 10 ? sub.name.substring(0, 10) + '..' : sub.name)}</th>`;
    });
    headerHtml += `<th style="min-width:70px; text-align:center; font-weight:700;">Total</th>
        <th style="min-width:60px; text-align:center; font-weight:700;">Mean</th>
        <th style="min-width:50px; text-align:center; font-weight:700;">Grade</th>
    </tr>`;
    head.innerHTML = headerHtml;

    // Body
    body.innerHTML = students.map((student, idx) => {
        let cells = `<td style="text-align:center; color:var(--text-muted); position:sticky; left:0; background:var(--bg-card, #fff); z-index:1;">${idx + 1}</td>
            <td style="position:sticky; left:40px; background:var(--bg-card, #fff); z-index:1;"><strong>${escapeHtml(student.name)}</strong></td>
            <td style="color:var(--text-muted); font-size:0.82rem; position:sticky; left:220px; background:var(--bg-card, #fff); z-index:1;">${escapeHtml(student.reg || 'N/A')}</td>`;

        subjects.forEach(sub => {
            const key = `${student.id}_${sub.id}`;
            const existing = (assessment.scores || {})[key];
            const val = existing ? existing.score : '';
            cells += `<td style="text-align:center;">
                <input type="number" class="batch-score-input" min="0" max="100" value="${val}"
                    data-key="${key}" data-student="${student.id}" data-subject="${sub.id}"
                    style="width:60px; padding:4px; border:1px solid var(--border); border-radius:6px; text-align:center; font-size:0.82rem;"
                    oninput="updateBatchRow(this)">
            </td>`;
        });

        cells += `<td class="batch-total" style="text-align:center; font-weight:700;">0</td>
            <td class="batch-mean" style="text-align:center; font-weight:700;">0</td>
            <td class="batch-grade" style="text-align:center;"></td>`;

        return `<tr class="batch-row" data-student-id="${student.id}" data-subjects-count="${subjects.length}">${cells}</tr>`;
    }).join('');

    // Update all totals
    document.querySelectorAll('.batch-row').forEach(row => updateBatchRowTotals(row));

    const totalCells = students.length * subjects.length;
    const filledCells = document.querySelectorAll('.batch-score-input').length;
    setText('batchStats', `${students.length} learners × ${subjects.length} subjects = ${totalCells} cells`);

    wrapper.style.display = 'block';
    emptyState.style.display = 'none';
}
function updateBatchRow(input) {
    const row = input.closest('.batch-row');
    if (row) updateBatchRowTotals(row);
}

function updateBatchRowTotals(row) {
    const inputs = row.querySelectorAll('.batch-score-input');
    let total = 0, count = 0;
    inputs.forEach(inp => {
        const v = parseInt(inp.value);
        if (!isNaN(v) && v > 0) { total += v; count++; }
    });
    const mean = count > 0 ? Math.round(total / count) : 0;
    const rating = mean > 0 ? cbcRating(mean) : null;

    const totalCell = row.querySelector('.batch-total');
    const meanCell = row.querySelector('.batch-mean');
    const gradeCell = row.querySelector('.batch-grade');

    if (totalCell) totalCell.textContent = count > 0 ? total : '0';
    if (meanCell) {
        meanCell.textContent = mean;
        meanCell.style.color = rating ? rating.color : 'inherit';
    }
    if (gradeCell && rating) {
        gradeCell.innerHTML = `<span style="padding:0.15rem 0.4rem; border-radius:12px; font-size:0.72rem; font-weight:600; background:${rating.color}22; color:${rating.color};">${rating.code}</span>`;
    } else if (gradeCell) {
        gradeCell.textContent = '';
    }
}

function handleBatchScoreChange(input) {
    let score = parseInt(input.value);
    if (isNaN(score) || score < 0) score = 0;
    if (score > 100) { score = 100; input.value = 100; }

    const assessId = input.dataset.assess;
    const studentId = input.dataset.student;
    const subjectId = input.dataset.subject;
    const assessment = (store.examSchedules || []).find(a => a.id === assessId);

    // ✅ FIX: Extract the fields that actually exist in the DB
    const term = assessment?.term || store.settings.currentTerm;
    const year = assessment?.year || store.settings.academicYear;
    const type = assessment?.type || 'Opener';
    const grade = assessment?.grade || '';

    // ✅ FIX: Match by term+year+type (NOT assessId — that column doesn't exist in DB)
    const existingIdx = (store.exams || []).findIndex(e =>
        e.studentId === studentId &&
        e.subjectId === subjectId &&
        e.term === term &&
        String(e.year) === String(year) &&
        e.type === type
    );

    if (score === 0 && input.value === '') {
        if (existingIdx !== -1) store.exams.splice(existingIdx, 1);
    } else if (existingIdx !== -1) {
        store.exams[existingIdx].score = score;
        store.exams[existingIdx].grade = grade;
    } else if (score > 0) {
        store.exams.push({
            id: generateId(),
            studentId: studentId,
            subjectId: subjectId,
            score: score,
            type: type,           // ← in DB
            term: term,           // ← in DB
            year: year,           // ← in DB
            grade: grade,         // ← in DB
            comments: ''
            // ❌ REMOVED: assessId — this column doesn't exist in the database
            // ❌ REMOVED: createdAt — this column doesn't exist in the database
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
    const q = getVal('batchSearch').toLowerCase();
    document.querySelectorAll('.batch-row').forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(q) ? '' : 'none';
    });
}


function saveBatchScores() {
    const assessId = getVal('batchAssessment');
    const assessment = getAssessmentById(assessId);
    if (!assessment) return;

    if (!assessment.scores) assessment.scores = {};
    let count = 0;

    document.querySelectorAll('.batch-score-input').forEach(input => {
        const key = input.dataset.key;
        const val = input.value;
        if (val !== '' && !isNaN(val)) {
            assessment.scores[key] = {
                score: parseInt(val),
                studentId: input.dataset.student,
                subjectId: input.dataset.subject,
                updatedAt: Date.now()
            };
            count++;
        }
    });

    saveData();
    showToast(`${count} scores saved as draft`);
}

function saveBatchAndClose() {
    saveBatchScores();
    const assessId = getVal('batchAssessment');
    const assessment = getAssessmentById(assessId);
    if (assessment) assessment.status = 'closed';
    saveData();
    showToast('All scores saved and assessment closed');
    switchExamTab('assessments');
}


// --- BATCH UPLOAD STATE ---
function downloadBatchTemplate() {
    const assessId = getVal('batchAssessment');
    const assessment = getAssessmentById(assessId);
    if (!assessment) {
        showToast('Select an assessment first', 'error');
        return;
    }

    const subjects = (assessment.subjects || []).map(subId => getSubjectById(subId)).filter(Boolean);
    const header = ['#', 'Name', 'ADM No', ...subjects.map(s => s.name), 'Total', 'Mean', 'Grade'].join(',');
    const students = getStudentsForGrade(assessment.grade);
    const rows = students.map((s, i) => {
        const cells = [i + 1, `"${s.name}"`, `"${s.reg || ''}"`, ...subjects.map(() => ''), '', '', ''];
        return cells.join(',');
    });

    const csv = header + '\n' + rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `batch_template_${assessment.name.replace(/\s+/g, '_')}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    showToast('Template downloaded');
}

function downloadBatchScores() {
    const assessId = getVal('batchAssessment');
    const assessment = getAssessmentById(assessId);
    if (!assessment) {
        showToast('Select an assessment first', 'error');
        return;
    }

    const subjects = (assessment.subjects || []).map(subId => getSubjectById(subId)).filter(Boolean);
    const header = ['#', 'Name', 'ADM No', ...subjects.map(s => s.name), 'Total', 'Mean', 'Grade'].join(',');
    const students = getStudentsForGrade(assessment.grade);
    const rows = students.map((s, i) => {
        let total = 0, count = 0;
        const scoreCells = subjects.map(sub => {
            const key = `${s.id}_${sub.id}`;
            const scoreData = (assessment.scores || {})[key];
            const score = scoreData ? parseInt(scoreData.score) : 0;
            if (score > 0) { total += score; count++; }
            return score || '';
        });
        const mean = count > 0 ? Math.round(total / count) : 0;
        const grade = mean > 0 ? cbcRating(mean).code : '';
        return [i + 1, `"${s.name}"`, `"${s.reg || ''}"`, ...scoreCells, count > 0 ? total : '', mean, grade].join(',');
    });

    const csv = header + '\n' + rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `batch_scores_${assessment.name.replace(/\s+/g, '_')}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    showToast('Scores downloaded');
}


function openBatchUploadModal() {
    const assessId = getVal('batchAssessment');
    if (!assessId) {
        showToast('Select an assessment first', 'error');
        return;
    }
    resetBatchUploadModal();
    openModal('batchUploadModal');
}

function resetBatchUploadModal() {
    const fileInput = $('batchUploadFile');
    if (fileInput) fileInput.value = '';
    const preview = $('batchUploadPreview');
    if (preview) preview.style.display = 'none';
    const previewContent = $('batchPreviewContent');
    if (previewContent) previewContent.innerHTML = '';
}

function handleBatchFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const text = e.target.result;
        const lines = text.split('\n').filter(l => l.trim());
        if (lines.length < 2) {
            showToast('File appears empty or invalid', 'error');
            return;
        }

        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
        const dataRows = lines.slice(1).slice(0, 10); // Preview first 10

        let previewHtml = '<table style="width:100%;border-collapse:collapse;font-size:0.75rem;">';
        previewHtml += '<tr>' + headers.map(h => `<th style="border:1px solid #ddd;padding:4px;background:#f5f5f5;">${escapeHtml(h)}</th>`).join('') + '</tr>';
        dataRows.forEach(row => {
            const cells = row.split(',').map(c => c.replace(/"/g, '').trim());
            previewHtml += '<tr>' + cells.map(c => `<td style="border:1px solid #ddd;padding:4px;">${escapeHtml(c)}</td>`).join('') + '</tr>';
        });
        previewHtml += '</table>';

        $('batchPreviewContent').innerHTML = previewHtml;
        $('batchPreviewStats').textContent = `${lines.length - 1} rows detected (showing first 10)`;
        $('batchUploadPreview').style.display = 'block';
    };
    reader.readAsText(file);
}

function confirmBatchUpload() {
    const assessId = getVal('batchAssessment');
    const assessment = getAssessmentById(assessId);
    if (!assessment) {
        showToast('Assessment not found', 'error');
        return;
    }

    const fileInput = $('batchUploadFile');
    if (!fileInput || !fileInput.files[0]) {
        showToast('Please select a file', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const text = e.target.result;
        const lines = text.split('\n').filter(l => l.trim());
        if (lines.length < 2) {
            showToast('No data rows found', 'error');
            return;
        }

        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
        const subjects = (assessment.subjects || []).map(subId => getSubjectById(subId)).filter(Boolean);

        // Map header columns to subject IDs
        const subjectColMap = {};
        headers.forEach((h, idx) => {
            if (idx < 3) return; // Skip #, Name, ADM No
            const matched = subjects.find(s => s.name === h || s.name.startsWith(h));
            if (matched) subjectColMap[idx] = matched.id;
        });

        const students = getStudentsForGrade(assessment.grade);
        let matchedCount = 0;

        lines.slice(1).forEach(line => {
            const cells = line.split(',').map(c => c.replace(/"/g, '').trim());
            const admNo = cells[2] || '';
            const student = students.find(s => s.reg === admNo || s.idNumber === admNo);
            if (!student) return;

            Object.entries(subjectColMap).forEach(([colIdx, subId]) => {
                const score = parseInt(cells[parseInt(colIdx)]);
                if (!isNaN(score) && score >= 0 && score <= 100) {
                    const key = `${student.id}_${subId}`;
                    if (!assessment.scores) assessment.scores = {};
                    assessment.scores[key] = {
                        score: score,
                        studentId: student.id,
                        subjectId: subId,
                        updatedAt: Date.now()
                    };
                    matchedCount++;
                }
            });
        });

        saveData();
        closeModal('batchUploadModal');
        loadBatchGrid(); // Refresh the grid
        showToast(`${matchedCount} scores imported successfully`);
    };
    reader.readAsText(fileInput.files[0]);
}

// ── EXPORT / IMPORT (Command Bar) ──
function examExportExcel() {
    const assessments = getAssessments();
    if (assessments.length === 0) {
        showToast('No assessments to export', 'error');
        return;
    }

    let csv = 'Name,Type,Grade,Term,Status,Subjects,Students,Scored %,Created\n';
    assessments.forEach(a => {
        const studentCount = getStudentsForGrade(a.grade).length;
        const subjectCount = (a.subjects || []).length;
        const scoredCount = getScoredCount(a);
        const progressPct = (studentCount * subjectCount) > 0 ? Math.round((scoredCount / (studentCount * subjectCount)) * 100) : 0;
        const subNames = (a.subjects || []).map(sId => getSubjectName(sId)).join('; ');
        const created = a.createdAt ? new Date(a.createdAt).toLocaleDateString() : '';

        csv += `"${a.name}","${a.assessType}","${a.grade}","${a.term}","${a.status}","${subNames}",${studentCount},${progressPct}%,"${created}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `assessments_export_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    showToast('Assessments exported');
}

function examImportScores() {
    populateImportDropdowns();
    openModal('importScoresModal');
}

function populateImportDropdowns() {
    const assessSelect = $('importAssessSelect');
    if (!assessSelect) return;

    const assessments = getAssessments();
    assessSelect.innerHTML = '<option value="">Select assessment...</option>' +
        assessments.map(a => `<option value="${a.id}">${escapeHtml(a.name)} — ${a.grade}</option>`).join('');

    // Subject dropdown updates on assessment change
    assessSelect.onchange = function () {
        const assessment = getAssessmentById(this.value);
        const subjectSelect = $('importSubjectSelect');
        if (!subjectSelect || !assessment) {
            if (subjectSelect) subjectSelect.innerHTML = '<option value="">Select subject...</option>';
            return;
        }
        subjectSelect.innerHTML = '<option value="">Select subject...</option>' +
            (assessment.subjects || []).map(subId => {
                const sub = getSubjectById(subId);
                return sub ? `<option value="${sub.id}">${escapeHtml(sub.name)}</option>` : '';
            }).join('');
    };
}

function processImportedScores() {
    const assessId = getVal('importAssessSelect');
    const subjectId = getVal('importSubjectSelect');
    const fileInput = $('importFileInput');

    if (!assessId || !subjectId) {
        showToast('Please select assessment and subject', 'error');
        return;
    }
    if (!fileInput || !fileInput.files[0]) {
        showToast('Please select a file', 'error');
        return;
    }

    const assessment = getAssessmentById(assessId);
    if (!assessment) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const text = e.target.result;
        const lines = text.split('\n').filter(l => l.trim());
        if (lines.length < 2) {
            showToast('File appears empty', 'error');
            return;
        }

        const students = getStudentsForGrade(assessment.grade);
        let imported = 0;

        lines.slice(1).forEach(line => {
            const cells = line.split(',').map(c => c.replace(/"/g, '').trim());
            const admNo = cells[0] || '';
            const score = parseInt(cells[1]);

            if (isNaN(score) || score < 0 || score > 100) return;

            const student = students.find(s => s.reg === admNo || s.idNumber === admNo);
            if (!student) return;

            const key = `${student.id}_${subjectId}`;
            if (!assessment.scores) assessment.scores = {};
            assessment.scores[key] = {
                score: score,
                studentId: student.id,
                subjectId: subjectId,
                updatedAt: Date.now()
            };
            imported++;
        });

        saveData();
        closeModal('importScoresModal');
        showToast(`${imported} scores imported successfully`);
    };
    reader.readAsText(fileInput.files[0]);
}


// ==========================================================================
//   VIRTUAL ASSESSMENTS INIT (Placeholder for existing code)
// ==========================================================================
// ── Virtual Assessment Store (SAFE VERSION) ──


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



// ==========================================================================
//   ANALYSIS SECTION LOGIC
// ==========================================================================

let subjectChartInstance = null;
let distChartInstance = null;
let analysisTrendChartInstance = null;
let genderComparisonChartInstance = null;
let leaderboardCurrentSubject = 'overall';
function renderAnalysis() {
    // 1. Get Context
    const selectedGrade = $('analysisGradeSelect') ? $('analysisGradeSelect').value : 'all';
    
    // 2. Filter Data
    let relevantStudents = StudentRepo.getAll();
    if (selectedGrade !== 'all') {
        relevantStudents = relevantStudents.filter(s => s.grade === selectedGrade);
    }

    const studentIds = relevantStudents.map(s => s.id);
    const relevantExams = store.exams.filter(e => studentIds.includes(e.studentId));

    // 3. Calculate Metrics
    let totalScore = 0;
    let count = 0;
    let subjectScores = {}; // { 'Math': [80, 90], 'Eng': [70] }
    
    relevantExams.forEach(e => {
        const score = parseInt(e.score) || 0;
        if(score > 0) {
            totalScore += score;
            count++;
            
            const subName = e.subjectName || 'Unknown';
            if(!subjectScores[subName]) subjectScores[subName] = [];
            subjectScores[subName].push(score);
        }
    });

    const avgScore = count > 0 ? Math.round(totalScore / count) : 0;

    // 4. Update KPIs
    animateValue('anaClassAvg', 0, avgScore, 800, '%');
    
    // CBC Categories (Exceeding: 80+, Meeting: 50-79, Below: <50)
    let exceeding = 0, approaching = 0, below = 0;
    Object.values(subjectScores).flat().forEach(s => {
        if(s >= 80) exceeding++;
        else if(s >= 50) approaching++;
        else below++;
    });

    animateValue('anaExceeding', 0, exceeding, 600);
    animateValue('anaApproaching', 0, approaching, 600);
    animateValue('anaBelow', 0, below, 600);

    // 4b. Trend indicators (compare first half vs second half of assessment list)
    const allScores = Object.values(subjectScores).flat();
    const trendData = computeTrendStats(allScores);
    updateTrendIndicator('anaClassAvgTrend', trendData, '%');
    updateTrendIndicator('anaExceedingTrend', computeCategoryTrend(relevantExams, s => s >= 80), '');
    updateTrendIndicator('anaApproachingTrend', computeCategoryTrend(relevantExams, s => s >= 50 && s < 80), '', true);
    updateTrendIndicator('anaBelowTrend', computeCategoryTrend(relevantExams, s => s < 50), '', true);

    // 4c. Sparklines
    renderSparkline('sparkClassAvg', trendData.series, '#22C55E');
    renderSparkline('sparkExceeding', computeCategorySeries(relevantExams, s => s >= 80), '#14B8A6');
    renderSparkline('sparkApproaching', computeCategorySeries(relevantExams, s => s >= 50 && s < 80), '#f59e0b');
    renderSparkline('sparkBelow', computeCategorySeries(relevantExams, s => s < 50), '#ef4444');

    // 4d. Context label
    const ctxLabel = $('chartContextLabel');
    if (ctxLabel) ctxLabel.textContent = selectedGrade === 'all' ? 'Whole school context' : `${selectedGrade} context`;

    // 5. Render Charts
    renderSubjectBarChart(subjectScores);
    renderCompetencyDonut(exceeding, approaching, below);
    renderAnalysisTrendChart(subjectScores);
    renderGenderComparisonChart(relevantStudents, relevantExams);
    renderSubjectHeatmap(relevantStudents, relevantExams);
    renderLeaderboard(relevantStudents, relevantExams);
}

// ==========================================================================
//   ANALYTICS ENGINE
// ==========================================================================
function renderAnalysisTab() {
    const container = $('analysisContent');
    if (!container) return;

    container.innerHTML = `
        <div class="analysis-layout">
            <aside class="analysis-sidebar">
                <div class="analysis-search-header">
                    <div class="form-group" style="margin:0 0 0.5rem 0;">
                        <label style="font-size:0.7rem; text-transform:uppercase; color:var(--text-muted);">Select Learner</label>
                        <select id="analysisStudentSelect" class="form-control">
                            <option value="">-- Select --</option>
                        </select>
                    </div>
                    <div class="search-wrapper" style="margin-top:0.5rem; width:100%;">
                        <input type="text" id="analysisSearchInput" class="form-control" placeholder="Filter list..." style="padding-left: 0.5rem;">
                    </div>
                </div>
                <div class="analysis-student-list" id="analysisStudentList"></div>
            </aside>
            
            <main class="analysis-main">
                <div class="student-hero-card">
                    <div class="shc-info">
                        <h2 id="analysisHeroName">Select a Learner</h2>
                        <p id="analysisHeroGrade">Grade: --</p>
                    </div>
                    <div class="shc-stats">
                        <div>
                            <div class="shc-stat-val" id="analysisMeanScore">--</div>
                            <div class="shc-stat-label">Mean Score</div>
                        </div>
                        <div>
                            <div class="shc-stat-val" id="analysisRank">--</div>
                            <div class="shc-stat-label">Rank</div>
                        </div>
                        <div>
                            <div class="shc-stat-val" id="analysisTotalPoints">--</div>
                            <div class="shc-stat-label">Total Points</div>
                        </div>
                    </div>
                </div>

                <div class="analysis-grid-2">
                    <div class="chart-card-modern">
                        <div class="chart-header"><h3>Performance Trend</h3></div>
                        <div id="trendChartContainer" style="position:relative; height:180px;">
                             <canvas id="trendChart"></canvas>
                             <div id="trendEmptyState" style="display:none; position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); text-align:center; color:var(--text-muted);">
                                <i class="fa-solid fa-chart-line" style="font-size:1.5rem; margin-bottom:0.5rem;"></i>
                                <p>No history yet</p>
                             </div>
                        </div>
                    </div>
                    <div class="chart-card-modern">
                        <div class="chart-header"><h3>Subject Breakdown</h3></div>
                        <div class="visual-bar-chart" id="analysisBarChart"></div>
                    </div>
                </div>

                <div class="action-toolbar">
                    <div class="at-info" id="analysisStatus">Select a learner to view detailed analysis.</div>
                    <div class="at-actions">
                        <button class="btn btn-secondary btn-sm" id="btnAnalysisWindow" disabled>
                            <i class="fa-solid fa-eye"></i> View Performance
                        </button>
                    </div>
                </div>
            </main>
        </div>`;

    const listContainer = $('analysisStudentList'); 
    const select = $('analysisStudentSelect');
    const searchInput = $('analysisSearchInput');

    const students = StudentRepo.getAll();
    if (students.length === 0) {
        listContainer.innerHTML = `<div class="p-4 text-center text-muted">No learners admitted yet.</div>`;
        return;
    }

    const fragment = document.createDocumentFragment();
    
    students.forEach(s => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'analysis-student-item';
        itemDiv.dataset.id = s.id;
        itemDiv.dataset.name = s.name.toLowerCase(); 
        itemDiv.innerHTML = `
            <div class="asi-avatar"><i class="fa-solid fa-user"></i></div>
            <div class="asi-info">
                <h4>${escapeHtml(s.name)}</h4>
                <span>${s.grade}</span>
            </div>`;
        fragment.appendChild(itemDiv);

        const opt = document.createElement('option');
        opt.value = s.id;
        opt.textContent = `${s.name} (${s.grade})`;
        select.appendChild(opt);
    });
    
    listContainer.appendChild(fragment);

    listContainer.addEventListener('click', (e) => { 
        const item = e.target.closest('.analysis-student-item'); 
        if(item) { 
            listContainer.querySelectorAll('.analysis-student-item').forEach(i => i.classList.remove('active')); 
            item.classList.add('active'); 
            
            $('analysisStudentSelect').value = item.dataset.id; 
            updateAnalysisDashboard(item.dataset.id); 
        } 
    });

    select.addEventListener('change', (e) => {
        const id = e.target.value;
        if(id) {
            const item = listContainer.querySelector(`[data-id="${id}"]`);
            if(item) {
                listContainer.querySelectorAll('.analysis-student-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
            updateAnalysisDashboard(id);
        }
    });

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const items = listContainer.querySelectorAll('.analysis-student-item');
        items.forEach(item => {
            const name = item.dataset.name;
            item.style.display = name.includes(term) ? 'flex' : 'none';
        });
    });

    $('btnAnalysisWindow')?.addEventListener('click', () => { 
        const sid = $('analysisStudentSelect').value; 
        if(sid) { 
            openPerformanceAnalysisModal(sid); 
        } 
    });
}

function updateAnalysisDashboard(studentId) {
    const student = StudentRepo.getById(studentId); 
    if(!student) return;

    $('analysisHeroName').innerText = student.name; 
    $('analysisHeroGrade').innerText = `${student.grade} (${student.stream})`; 
    $('analysisStatus').innerText = "Viewing performance analytics.";
    $('btnAnalysisWindow').disabled = false;

    const exams = store.exams.filter(e => e.studentId === studentId);
    const avg = exams.length > 0 ? Math.round(exams.reduce((a,b) => a + parseInt(b.score), 0) / exams.length) : 0;
    
    $('analysisMeanScore').innerText = avg + '%';

    const allStudents = StudentRepo.findBy('grade', student.grade);
    
    const ranked = allStudents.map(s => {
        const sExams = store.exams.filter(e => e.studentId === s.id);
        const sAvg = sExams.length > 0 ? sExams.reduce((a,b) => a + parseInt(b.score), 0) / sExams.length : 0;
        return { id: s.id, avg: sAvg };
    }).sort((a,b) => b.avg - a.avg);

    const rank = ranked.findIndex(s => s.id === studentId) + 1;

    $('analysisRank').innerText = `#${rank > 0 ? rank : '--'}`;
    
    const totalPoints = exams.reduce((a, b) => a + (parseInt(b.score) || 0), 0);
    $('analysisTotalPoints').innerText = totalPoints;

    renderTrendChart(exams); 
    renderAnalysisBarChart(studentId, student.grade);
}

function renderTrendChart(exams) {
    const ctx = $('trendChart')?.getContext('2d'); 
    const emptyState = $('trendEmptyState');
    
    if(!ctx) return;
    
    if(window.trendChartInstance) window.trendChartInstance.destroy();

    const sorted = [...exams].sort((a,b) => new Date(a.date) - new Date(b.date)).slice(-10);

    if (sorted.length === 0) {
        if(emptyState) emptyState.style.display = 'block';
        ctx.canvas.style.display = 'none';
        return;
    }

    ctx.canvas.style.display = 'block';
    if(emptyState) emptyState.style.display = 'none';

    window.trendChartInstance = new Chart(ctx, { 
        type: 'line', 
        data: { 
            labels: sorted.map(e => new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })), 
            datasets: [{ 
                label: 'Score', 
                data: sorted.map(e => e.score), 
                borderColor: '#2563eb', 
                backgroundColor: 'rgba(37, 99, 235, 0.1)', 
                fill: true, 
                tension: 0.4, 
                pointBackgroundColor: '#2563eb',
                pointRadius: 4,
                pointHoverRadius: 6
            }] 
        }, 
        options: { 
            responsive: true, 
            maintainAspectRatio: false,
            plugins: { 
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleFont: { size: 12 },
                    bodyFont: { size: 14 },
                    callbacks: {
                        label: function(context) {
                            return `Score: ${context.parsed.y}%`;
                        }
                    }
                }
            }, 
            scales: { 
                y: { 
                    beginAtZero: true, 
                    max: 100,
                    grid: { color: 'rgba(0,0,0,0.05)' }
                },
                x: {
                    grid: { display: false }
                }
            } 
        } 
    });
}

function renderAnalysisBarChart(studentId, grade) {
    const container = $('analysisBarChart'); 
    if(!container) return; 
    container.innerHTML = '';
    
    const subjects = store.learningAreas.filter(s => !s.applicableLevels || s.applicableLevels.includes(grade));
    
    if (subjects.length === 0) {
        container.innerHTML = `<div class="p-4 text-center text-muted">No subjects found for this grade.</div>`;
        return;
    }

    subjects.forEach(sub => {
        const exam = store.exams.find(e => e.studentId === studentId && e.unitCode === sub.code); 
        const score = exam ? parseInt(exam.score) : 0; 
        const comp = getCompetenceStatus(score);
        
        const item = document.createElement('div'); 
        item.className = 'vbc-item';
        
        item.innerHTML = `
            <div class="vbc-label" title="${sub.name}">${sub.code}</div>
            <div class="vbc-track">
                <div class="vbc-fill" style="width: ${score}%; background: ${comp.class === 'status-c' ? '#10b981' : '#ef4444'}"></div>
            </div>
            <div class="vbc-value" title="${comp.level}">
                <span style="font-size:0.7rem; color:var(--text-muted); margin-right:2px;">${comp.abbr}</span> 
                ${score}%
            </div>`;
        container.appendChild(item);
    });
}

// ==========================================================================
//   STAFF ANALYTICS (Modern dashboard)
// ==========================================================================
let staffDeptChartInstance = null;
let staffGenderChartInstance = null;
let staffEmploymentChartInstance = null;

function renderStaffAnalytics(allStaff, buckets) {
    if (!allStaff) return;
    const teachers = buckets.teachers || [];
    const admin = buckets.admin || [];
    const support = buckets.support || [];

    // Trend indicators (compute simple deltas from history if available)
    setTrendPill('staffTotalTrend', allStaff.length - (window._prevStaffTotal || 0), '');
    setTrendPill('staffTeachersTrend', teachers.length - (window._prevStaffTeachers || 0), '');
    setTrendPill('staffAdminTrend', admin.length - (window._prevStaffAdmin || 0), '');
    setTrendPill('staffSupportTrend', support.length - (window._prevStaffSupport || 0), '');
    window._prevStaffTotal = allStaff.length;
    window._prevStaffTeachers = teachers.length;
    window._prevStaffAdmin = admin.length;
    window._prevStaffSupport = support.length;

    // Sparklines (synthesized from current counts with slight variation for visual interest)
    renderSparkline('sparkStaffTotal', synthSeries(allStaff.length, 6), '#22C55E');
    renderSparkline('sparkStaffTeachers', synthSeries(teachers.length, 6), '#14B8A6');
    renderSparkline('sparkStaffAdmin', synthSeries(admin.length, 6), '#8b5cf6');
    renderSparkline('sparkStaffSupport', synthSeries(support.length, 6), '#f59e0b');

    // Department distribution doughnut
    const deptBuckets = {};
    allStaff.forEach(s => {
        const d = s.dept || 'Unspecified';
        deptBuckets[d] = (deptBuckets[d] || 0) + 1;
    });
    const deptPalette = ['#22C55E', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#64748b', '#14B8A6'];
    renderStaffDoughnut('staffDeptChart', 'staffDeptLegend',
        Object.keys(deptBuckets), Object.values(deptBuckets), deptPalette);

    // Gender ratio
    const maleCount = allStaff.filter(s => (s.gender || '').toLowerCase() === 'male').length;
    const femaleCount = allStaff.filter(s => (s.gender || '').toLowerCase() === 'female').length;
    const otherCount = allStaff.length - maleCount - femaleCount;
    renderStaffDoughnut('staffGenderChart', 'staffGenderLegend',
        ['Male', 'Female', 'Other'],
        [maleCount, femaleCount, otherCount].filter(v => v > 0),
        ['#3b82f6', '#ec4899', '#94a3b8'],
        [maleCount, femaleCount, otherCount]);

    // Employment type
    const empBuckets = {};
    allStaff.forEach(s => {
        const t = s.employmentType || 'Unspecified';
        empBuckets[t] = (empBuckets[t] || 0) + 1;
    });
    const empPalette = ['#22C55E', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];
    renderStaffDoughnut('staffEmploymentChart', 'staffEmploymentLegend',
        Object.keys(empBuckets), Object.values(empBuckets), empPalette);

    // Workload list — top 6 by subject count
    renderStaffWorkload(allStaff);

    // Performance list — top 5 by student avg
    renderStaffPerformance(allStaff);
}

// Helper: set a trend pill value + color
function setTrendPill(id, delta, suffix, invertColors) {
    const el = $(id);
    if (!el) return;
    const sign = delta > 0 ? '+' : '';
    el.textContent = `${sign}${delta}${suffix}`;
    const parent = el.parentElement;
    if (!parent) return;
    parent.classList.remove('trend-up', 'trend-down');
    if (delta >= 0) parent.classList.add(invertColors ? 'trend-down' : 'trend-up');
    else parent.classList.add(invertColors ? 'trend-up' : 'trend-down');
    const icon = parent.querySelector('i');
    if (icon) {
        icon.className = delta >= 0 ? 'fa-solid fa-arrow-trend-up' : 'fa-solid fa-arrow-trend-down';
    }
}

// Helper: synthesize a stable-ish series from a count
function synthSeries(target, points) {
    const series = [];
    let base = Math.max(0, target - Math.floor(target * 0.15));
    for (let i = 0; i < points; i++) {
        const trend = i / (points - 1); // 0 -> 1
        const noise = (Math.sin(i * 1.3) * 0.5) * Math.max(1, target * 0.05);
        const val = Math.round(base + (target - base) * trend + noise);
        series.push(Math.max(0, val));
    }
    series[series.length - 1] = target;
    return series;
}

// Helper: render a doughnut chart with custom legend
function renderStaffDoughnut(canvasId, legendId, labels, data, palette, fullData) {
    const ctx = $(canvasId);
    if (!ctx) return;
    // Filter out zero entries for clarity
    const pairs = labels.map((l, i) => ({ label: l, value: (fullData || data)[i] || 0 })).filter(p => p.value > 0);
    const useLabels = pairs.map(p => p.label);
    const useValues = pairs.map(p => p.value);
    const useColors = useLabels.map((_, i) => palette[i % palette.length]);

    let instance = null;
    if (canvasId === 'staffDeptChart') { instance = staffDeptChartInstance; staffDeptChartInstance = null; }
    else if (canvasId === 'staffGenderChart') { instance = staffGenderChartInstance; staffGenderChartInstance = null; }
    else if (canvasId === 'staffEmploymentChart') { instance = staffEmploymentChartInstance; staffEmploymentChartInstance = null; }
    if (instance) instance.destroy();

    const chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: useLabels,
            datasets: [{
                data: useValues,
                backgroundColor: useColors,
                borderColor: '#fff',
                borderWidth: 2,
                hoverOffset: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            animation: { duration: 800, animateRotate: true, animateScale: true },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#0f172a',
                    padding: 10,
                    borderRadius: 8,
                    callbacks: {
                        label: (c) => {
                            const total = useValues.reduce((a, b) => a + b, 0) || 1;
                            const pct = Math.round(c.parsed / total * 100);
                            return `${c.label}: ${c.parsed} (${pct}%)`;
                        }
                    }
                }
            }
        }
    });

    if (canvasId === 'staffDeptChart') staffDeptChartInstance = chart;
    else if (canvasId === 'staffGenderChart') staffGenderChartInstance = chart;
    else if (canvasId === 'staffEmploymentChart') staffEmploymentChartInstance = chart;

    // Custom legend
    const legendEl = $(legendId);
    if (legendEl) {
        const total = useValues.reduce((a, b) => a + b, 0) || 1;
        legendEl.innerHTML = useLabels.map((l, i) => {
            const v = useValues[i];
            const pct = Math.round(v / total * 100);
            return `<span class="polar-legend-item"><i style="background:${useColors[i]}"></i> ${escapeHtml(l)} (${v} · ${pct}%)</span>`;
        }).join('');
    }
}

// Helper: render staff workload list (top 6 by subject count)
function renderStaffWorkload(allStaff) {
    const container = $('staffWorkloadList');
    if (!container) return;

    const items = allStaff.map(s => {
        const assignedSubjects = (store.learningAreas || []).filter(area => area.teacherId === s.id);
        return {
            id: s.id,
            name: s.name,
            photo: s.photo,
            designation: s.designation || 'Staff',
            subjectCount: assignedSubjects.length,
            subjectNames: assignedSubjects.map(a => a.name)
        };
    }).sort((a, b) => b.subjectCount - a.subjectCount).slice(0, 6);

    if (items.length === 0 || items.every(i => i.subjectCount === 0)) {
        container.innerHTML = '<div class="heatmap-empty">No subject assignments yet. Assign subjects to teachers from the Learning Areas tab.</div>';
        return;
    }

    container.innerHTML = items.map(item => {
        let countClass = '';
        if (item.subjectCount >= 5) countClass = 'over';
        else if (item.subjectCount >= 3) countClass = 'high';
        const subjectSummary = item.subjectNames.length > 0
            ? item.subjectNames.slice(0, 2).join(', ') + (item.subjectNames.length > 2 ? ` +${item.subjectNames.length - 2} more` : '')
            : 'No subjects assigned';
        return `
            <div class="workload-item">
                <div class="wl-avatar"><img src="${item.photo || DEFAULT_AVATAR}" alt="" onerror="this.src='${DEFAULT_AVATAR}'"></div>
                <div class="wl-info">
                    <div class="wl-name">${escapeHtml(item.name)}</div>
                    <div class="wl-sub">${escapeHtml(item.designation)} · ${escapeHtml(subjectSummary)}</div>
                </div>
                <div class="wl-count ${countClass}">${item.subjectCount}</div>
            </div>
        `;
    }).join('');
}

// Helper: render staff performance list (top 5 by their students' avg)
function renderStaffPerformance(allStaff) {
    const container = $('staffPerfList');
    if (!container) return;

    // For each teacher, find students whose exam records reference subjects assigned to that teacher
    const items = allStaff.map(s => {
        const teacherSubjects = (store.learningAreas || []).filter(area => area.teacherId === s.id);
        if (teacherSubjects.length === 0) return { id: s.id, name: s.name, photo: s.photo, designation: s.designation || 'Staff', avg: 0, count: 0 };
        const subjectNames = new Set(teacherSubjects.map(a => a.name.toLowerCase()));
        const subjectCodes = new Set(teacherSubjects.map(a => a.code));
        const relevantExams = store.exams.filter(e => {
            const subName = (e.subjectName || '').toLowerCase();
            return subjectNames.has(subName) || subjectCodes.has(e.unitCode);
        });
        const scores = relevantExams.map(e => parseInt(e.score) || 0).filter(v => v > 0);
        const avg = scores.length ? Math.round(scores.reduce((a,b)=>a+b,0)/scores.length) : 0;
        return { id: s.id, name: s.name, photo: s.photo, designation: s.designation || 'Staff', avg, count: scores.length };
    }).filter(i => i.count > 0).sort((a, b) => b.avg - a.avg).slice(0, 5);

    if (items.length === 0) {
        container.innerHTML = '<div class="heatmap-empty">No teacher performance data yet. Assign teachers to subjects and record exam scores to populate this list.</div>';
        return;
    }

    container.innerHTML = items.map(item => {
        return `
            <div class="perf-item">
                <div class="perf-avatar"><img src="${item.photo || DEFAULT_AVATAR}" alt="" onerror="this.src='${DEFAULT_AVATAR}'"></div>
                <div class="perf-info">
                    <div class="perf-name">${escapeHtml(item.name)}</div>
                    <div class="perf-sub">${escapeHtml(item.designation)} · ${item.count} assessments</div>
                </div>
                <div class="perf-bar">
                    <div class="perf-bar-fill" style="width: ${item.avg}%"></div>
                </div>
                <div class="perf-score">${item.avg}%</div>
            </div>
        `;
    }).join('');
}

function renderStaffTable(data, container) {
    if (data.length === 0) { 
        container.innerHTML = `<div class="empty-state"><i class="fa-solid fa-user-slash"></i><p>No staff found.</p></div>`; 
        return; 
    } 
    
    let tableHTML = `
        <div class="table-container" style="background:var(--bg-card); border-radius:var(--radius-lg);">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>TSC No</th>
                        <th>ID No</th>
                        <th>Designation</th>
                        <th>Department</th>
                        <th>Phone</th>
                        <th style="width: 100px;">Actions</th>
                    </tr>
                </thead>
                <tbody>
    `;

    data.forEach(s => {
        tableHTML += `
            <tr>
                <td>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <img src="${s.photo || DEFAULT_AVATAR}" style="width:35px; height:35px; border-radius:50%; object-fit:cover;">
                        <strong>${escapeHtml(s.name)}</strong>
                    </div>
                </td>
                <td>${s.tsc || '-'}</td>
                <td>${s.idNo || '-'}</td>
                <td>${s.designation || '-'}</td>
                <td>${s.dept || '-'}</td>
                <td>${s.phone || '-'}</td>
                <td>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-ghost" data-action="edit" data-type="staff" data-id="${s.id}"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn btn-sm btn-ghost" data-action="delete" data-type="staff" data-id="${s.id}"><i class="fa-solid fa-trash" style="color:var(--danger)"></i></button>
                    </div>
                </td>
            </tr>
        `;
    });

    tableHTML += `</tbody></table></div>`;
    container.innerHTML = tableHTML;
}
function renderStaffGrid(data, container) {
    if (data.length === 0) { 
        container.innerHTML = `<div class="empty-state"><i class="fa-solid fa-user-slash"></i><p>No staff found matching criteria.</p></div>`; 
        return; 
    } 
    
    container.innerHTML = data.map(s => {
        // Check for linked subjects (from curricula)
        const assignedSubjects = (store.learningAreas || []).filter(area => area.teacherId === s.id).map(area => area.name);
        const teachesDisplay = assignedSubjects.length > 0 ? assignedSubjects.join(', ') : (s.subjects || 'N/A');
        
        // Determine Department Class for Card Border Color
        let deptClass = '';
        const d = (s.dept || '').toLowerCase();
        if (d.includes('lower')) deptClass = 'dept-lower-primary';
        else if (d.includes('upper')) deptClass = 'dept-upper-primary';
        else if (d.includes('jss') || d.includes('junior')) deptClass = 'dept-jss';
        else if (d.includes('admin')) deptClass = 'dept-admin';
        else if (d.includes('support')) deptClass = 'dept-support';

        // Map designation -> broad role bucket so the existing CSS rules
        // .staff-card[data-role="Admin|Teacher|Support"] apply and colour
        // the top strip accordingly.
        const desig = (s.designation || '').toLowerCase();
        let roleBucket = 'Teacher';
        if (d.includes('admin') || desig.includes('head') || desig.includes('principal') || desig.includes('deputy')) roleBucket = 'Admin';
        else if (d.includes('support') || desig.includes('support')) roleBucket = 'Support';

        // FIX: Corrected Class Names to match CSS (.staff-card, .staff-card-footer)
        return `
        <div class="staff-card ${deptClass}" data-role="${roleBucket}">
            <div class="staff-card-header"></div>
            <div class="staff-card-body">
                <img src="${s.photo || DEFAULT_AVATAR}" class="staff-avatar" alt="${escapeHtml(s.name)}" onerror="this.src='${DEFAULT_AVATAR}'">
                <h4 class="staff-name">${escapeHtml(s.name)}</h4>
                <span class="staff-role">${s.designation || 'Staff'}</span>
                
                <div class="staff-details-grid">
                    <div class="staff-detail-item">
                        <span>TSC No</span>
                        <strong>${s.tsc || '-'}</strong>
                    </div>
                    <div class="staff-detail-item">
                        <span>ID No</span>
                        <strong>${s.idNo || '-'}</strong>
                    </div>
                    <div class="staff-detail-item">
                        <span>Phone</span>
                        <strong>${s.phone || '-'}</strong>
                    </div>
                    <div class="staff-detail-item">
                        <span>Dept</span>
                        <strong>${s.dept || '-'}</strong>
                    </div>
                </div>
                <div style="margin-top: 0.5rem; font-size: 0.8rem; color: var(--primary); text-align: left;">
                    <strong>Teaches:</strong> ${escapeHtml(teachesDisplay)}
                </div>
            </div>
            <div class="staff-card-footer">
                <button class="btn btn-sm btn-ghost" data-action="edit" data-type="staff" data-id="${s.id}" title="Edit">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button class="btn btn-sm btn-ghost" data-action="delete" data-type="staff" data-id="${s.id}" title="Delete" style="color:var(--danger);">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </div>`;
    }).join(''); 
}

// ==========================================================================
//   CURRICULA MANAGEMENT
// ==========================================================================

function renderCurricula() {
    const container = $('curriculumAccordion');
    if (!container) return;
    container.innerHTML = '';

    // Render analytics dashboard first
    renderCurriculaAnalytics();

    const bandOrder = ['pp', 'lower', 'middle', 'jss'];
    const bandMeta = {
        'pp': { name: 'Pre-Primary', icon: 'fa-baby' },
        'lower': { name: 'Lower Primary', icon: 'fa-child-reaching' },
        'middle': { name: 'Middle School', icon: 'fa-book-open-reader' },
        'jss': { name: 'Junior Secondary', icon: 'fa-user-graduate' }
    };

    bandOrder.forEach(key => {
        const info = bandMeta[key];
        const gradesInBand = BAND_GRADE_MAP[key];

        const subjects = store.learningAreas.filter(sub => {
            if (!sub.applicableLevels || sub.applicableLevels.length === 0) return false;
            return sub.applicableLevels.some(level => gradesInBand.includes(level));
        });

        const item = document.createElement('div');
        item.className = 'accordion-item';
        item.dataset.band = key;

        item.innerHTML = `
            <button class="accordion-header">
                <div class="acc-header-content">
                   <i class="fa-solid ${info.icon}"></i>
                   <span>${info.name}</span>
                </div>
                <div style="display:flex; align-items:center;">
                    <span class="acc-count">${subjects.length} Subjects</span>
                    <i class="fa-solid fa-chevron-down accordion-icon"></i>
                </div>
            </button>
            <div class="accordion-content">
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; padding: 1rem;">
                    ${subjects.map(sub => renderSubjectCard(sub)).join('')}
                </div>
            </div>
        `;
        container.appendChild(item);
    });
}

function renderSubjectCard(sub) {
    const teacher = sub.teacherId ? StaffRepo.getById(sub.teacherId) : null; 
    const teacherName = teacher ? teacher.name : 'Unassigned';
    
    return `
        <div class="subject-card-modern">
            <div class="subject-header">
                <h4 style="margin:0">${sub.name}</h4>
                <span class="subject-code-badge">${sub.code}</span>
            </div>
            <div style="margin-top:0.5rem; font-size:0.85rem; color:var(--text-muted);">
                <p style="margin:0"><small>Grades: ${sub.applicableLevels ? sub.applicableLevels.join(', ') : 'All'}</small></p>
            </div>
            <div class="subject-footer">
                <button class="btn btn-sm btn-ghost" data-action="edit-curriculum" data-id="${sub.id}" title="Edit">
                    <i class="fa-solid fa-edit"></i>
                </button>
            </div>
        </div>
    `;
}

// ==========================================================================
//   CURRICULA ANALYTICS (Modern dashboard)
// ==========================================================================
let laBandChartInstance = null;
let laCoverageChartInstance = null;

function renderCurriculaAnalytics() {
    const areas = store.learningAreas || [];

    // KPI counts
    const totalCount = areas.length;
    const assignedCount = areas.filter(a => a.teacherId).length;
    const unassignedCount = totalCount - assignedCount;

    // Active bands (count subjects per band)
    const bandOrder = ['pp', 'lower', 'middle', 'jss'];
    const bandMeta = {
        'pp': { name: 'Pre-Primary' },
        'lower': { name: 'Lower Primary' },
        'middle': { name: 'Middle School' },
        'jss': { name: 'Junior Secondary' }
    };
    const bandCounts = {};
    bandOrder.forEach(b => bandCounts[b] = 0);
    areas.forEach(a => {
        if (!a.applicableLevels || a.applicableLevels.length === 0) return;
        bandOrder.forEach(b => {
            const gradesInBand = BAND_GRADE_MAP[b];
            if (a.applicableLevels.some(level => gradesInBand.includes(level))) {
                bandCounts[b]++;
            }
        });
    });
    const activeBands = bandOrder.filter(b => bandCounts[b] > 0).length;

    // Update KPIs
    setText('laTotalCount', totalCount);
    setText('laAssignedCount', assignedCount);
    setText('laUnassignedCount', unassignedCount);
    setText('laBandsCount', activeBands);

    // Trend pills (deltas from history)
    setTrendPill('laTotalTrend', totalCount - (window._prevLaTotal || 0), '');
    setTrendPill('laAssignedTrend', assignedCount - (window._prevLaAssigned || 0), '');
    setTrendPill('laUnassignedTrend', unassignedCount - (window._prevLaUnassigned || 0), '', true);
    setText('laBandsTrend', activeBands);
    window._prevLaTotal = totalCount;
    window._prevLaAssigned = assignedCount;
    window._prevLaUnassigned = unassignedCount;

    // Chart 1: Subject distribution by band (horizontal bar)
    renderLaBandChart(bandOrder, bandMeta, bandCounts);

    // Chart 2: Assignment coverage doughnut (assigned vs unassigned)
    renderLaCoverageChart(assignedCount, unassignedCount);

    // Chart 3: Teacher workload list (top 6 by subject count)
    renderLaWorkload();
}

function renderLaBandChart(bandOrder, bandMeta, bandCounts) {
    const ctx = $('laBandChart');
    if (!ctx) return;
    if (laBandChartInstance) { laBandChartInstance.destroy(); laBandChartInstance = null; }

    const labels = bandOrder.map(b => bandMeta[b].name);
    const data = bandOrder.map(b => bandCounts[b]);
    const chartCtx = ctx.getContext('2d');
    const gradient = chartCtx.createLinearGradient(0, 0, 400, 0);
    gradient.addColorStop(0, '#8b5cf6');
    gradient.addColorStop(1, '#22C55E');

    laBandChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Subjects',
                data: data,
                backgroundColor: gradient,
                borderRadius: 8,
                barPercentage: 0.6,
                categoryPercentage: 0.7
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 800, easing: 'easeOutCubic' },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#0f172a',
                    padding: 10,
                    borderRadius: 8,
                    callbacks: { label: (c) => `${c.parsed.x} subject${c.parsed.x === 1 ? '' : 's'}` }
                }
            },
            scales: {
                x: { beginAtZero: true, grid: { color: 'rgba(226, 232, 240, 0.6)', borderDash: [4,4] }, ticks: { color: '#94a3b8', precision: 0 } },
                y: { grid: { display: false }, ticks: { color: '#64748b', font: { weight: '600' } } }
            }
        }
    });
}

function renderLaCoverageChart(assigned, unassigned) {
    const ctx = $('laCoverageChart');
    if (!ctx) return;
    if (laCoverageChartInstance) { laCoverageChartInstance.destroy(); laCoverageChartInstance = null; }

    laCoverageChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Assigned', 'Unassigned'],
            datasets: [{
                data: [assigned, unassigned],
                backgroundColor: ['#14B8A6', '#f59e0b'],
                borderColor: '#fff',
                borderWidth: 2,
                hoverOffset: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            animation: { duration: 800, animateRotate: true, animateScale: true },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#0f172a',
                    padding: 10,
                    borderRadius: 8,
                    callbacks: {
                        label: (c) => {
                            const total = assigned + unassigned || 1;
                            const pct = Math.round(c.parsed / total * 100);
                            return `${c.label}: ${c.parsed} (${pct}%)`;
                        }
                    }
                }
            }
        }
    });

    const legendEl = $('laCoverageLegend');
    if (legendEl) {
        const total = assigned + unassigned || 1;
        legendEl.innerHTML = `
            <span class="polar-legend-item"><i style="background:#14B8A6"></i> Assigned (${assigned} · ${Math.round(assigned/total*100)}%)</span>
            <span class="polar-legend-item"><i style="background:#f59e0b"></i> Unassigned (${unassigned} · ${Math.round(unassigned/total*100)}%)</span>
        `;
    }
}

function renderLaWorkload() {
    const container = $('laWorkloadList');
    if (!container) return;

    const allStaff = StaffRepo.getAll();
    const items = allStaff.map(s => {
        const assignedSubjects = (store.learningAreas || []).filter(area => area.teacherId === s.id);
        return {
            id: s.id,
            name: s.name,
            photo: s.photo,
            designation: s.designation || 'Staff',
            subjectCount: assignedSubjects.length,
            subjectNames: assignedSubjects.map(a => a.name)
        };
    }).filter(i => i.subjectCount > 0).sort((a, b) => b.subjectCount - a.subjectCount).slice(0, 6);

    if (items.length === 0) {
        container.innerHTML = '<div class="heatmap-empty">No teacher assignments yet. Assign teachers to subjects from the edit button on each subject card.</div>';
        return;
    }

    container.innerHTML = items.map(item => {
        let countClass = '';
        if (item.subjectCount >= 5) countClass = 'over';
        else if (item.subjectCount >= 3) countClass = 'high';
        const subjectSummary = item.subjectNames.length > 0
            ? item.subjectNames.slice(0, 2).join(', ') + (item.subjectNames.length > 2 ? ` +${item.subjectNames.length - 2} more` : '')
            : '';
        return `
            <div class="workload-item">
                <div class="wl-avatar"><img src="${item.photo || DEFAULT_AVATAR}" alt="" onerror="this.src='${DEFAULT_AVATAR}'"></div>
                <div class="wl-info">
                    <div class="wl-name">${escapeHtml(item.name)}</div>
                    <div class="wl-sub">${escapeHtml(item.designation)} · ${escapeHtml(subjectSummary)}</div>
                </div>
                <div class="wl-count ${countClass}">${item.subjectCount}</div>
            </div>
        `;
    }).join('');
}

function filterCurricula(band) {
    const items = document.querySelectorAll('#curriculumAccordion .accordion-item');
    
    items.forEach(item => {
        if (band === 'all') {
            item.classList.remove('open'); 
        } else if (item.dataset.band === band) {
            item.classList.add('open');
            item.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            item.classList.remove('open');
        }
    });
}

function editCourseSettings(id) { 
    editCourse(id); 
    openModal('courseModal'); 
}

function populateTeacherDropdown(selectedId = '') { 
    const select = $('courseTeacher'); 
    if (!select) return; 
    select.innerHTML = '<option value="">Select Teacher...</option>'; 
    StaffRepo.getAll().forEach(teacher => { 
        select.innerHTML += `<option value="${teacher.id}">${teacher.name}</option>`; 
    }); 
    if (selectedId) select.value = selectedId; 
}

function saveCourseSettings(e) { 
    e.preventDefault(); 
    const editId = $('courseEditId')?.value; 
    const checkedBoxes = document.querySelectorAll('input[name="courseGrade"]:checked'); 
    const levelsArr = Array.from(checkedBoxes).map(cb => cb.value); 
    
    const subjectData = { 
        id: editId || generateId(), 
        name: getVal('courseName'), 
        code: getVal('courseCode'), 
        applicableLevels: levelsArr, 
        teacherId: getVal('courseTeacher') 
    }; 
    
    if (editId) { 
        const idx = store.learningAreas.findIndex(t => t.id === editId); 
        if (idx !== -1) store.learningAreas[idx] = subjectData; 
    } else { 
        store.learningAreas.push(subjectData); 
    } 
    
    saveData(); 
    closeModal('courseModal'); 
    renderCourseSettings(); 
    renderCurricula(); 
    renderStaff(); 
    showToast('Subject Saved!'); 
}

function renderCourseSettings() { 
    const tbody = $('courseSettingsTable'); 
    if (!tbody) return; 
    tbody.innerHTML = store.learningAreas.map(sub => { 
        return `<tr><td>${sub.code}</td><td>${sub.name}</td><td>${sub.applicableLevels ? sub.applicableLevels.join(', ') : 'All'}</td><td><button class="btn btn-sm" data-action="edit-subject" data-id="${sub.id}"><i class="fa-solid fa-edit"></i></button></td></tr>`; 
    }).join(''); 
}

function editCourse(id) { 
    const subject = store.learningAreas.find(t => t.id === id); 
    if (!subject) return; 
    $('courseForm').reset();
    
    $('courseModalTitle').innerText = "Edit Subject"; 
    $('courseEditId').value = id; 
    setVal('courseName', subject.name); 
    setVal('courseCode', subject.code); 
    
    const checkboxes = document.querySelectorAll('input[name="courseGrade"]'); 
    checkboxes.forEach(cb => { 
        cb.checked = subject.applicableLevels?.includes(cb.value); 
    }); 
    
    populateTeacherDropdown(subject.teacherId); 
}

function deleteCourse(id) { 
    if(confirm('Delete this Learning Area?')) { 
        store.learningAreas = store.learningAreas.filter(t => t.id !== id); 
        saveData(); 
        renderCourseSettings(); 
        renderCurricula(); 
        renderStaff(); 
        showToast('Subject Deleted'); 
    } 
}

/**
 * Ensures data is loaded before generating reports.
 * Returns true if data is ready, false if not.
 */
function ensureDataLoaded() {
    // Check if exams exist
    if (!store.exams || store.exams.length === 0) {
        showToast('Assessment data not loaded yet. Please wait or check your connection.', 'error');
        return false;
    }
    return true;
}

// ==========================================================================
//   TIMETABLE MODULE
// ==========================================================================
const TT_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TT_PERIODS = [
    { id: '1', label: 'Period 1', time: '08:00 - 08:40' },
    { id: '2', label: 'Period 2', time: '08:40 - 09:20' },
    { id: '3', label: 'Period 3', time: '09:20 - 10:00' },
    { id: 'break', label: 'Morning Break', time: '10:00 - 10:30', isBreak: true },
    { id: '4', label: 'Period 4', time: '10:30 - 11:10' },
    { id: '5', label: 'Period 5', time: '11:10 - 11:50' },
    { id: '6', label: 'Period 6', time: '11:50 - 12:30' },
    { id: 'lunch', label: 'Lunch Break', time: '12:30 - 13:30', isBreak: true },
    { id: '7', label: 'Period 7', time: '13:30 - 14:10' },
    { id: '8', label: 'Period 8', time: '14:10 - 14:50' },
    { id: '9', label: 'Period 9', time: '14:50 - 15:30' }
];

const TT_TONE_PALETTE = ['green', 'blue', 'purple', 'orange', 'pink', 'teal', 'red', 'indigo', 'cyan', 'amber'];
let currentTimetableView = 'master';
let ttCurrentEditId = null;

function initTimetableSection() {
    populateTimetableFilters();
    bindTimetableControls();
    renderTimetable();
}

function populateTimetableFilters() {
    const gradeFilter = $('ttGradeFilter');
    const teacherFilter = $('ttTeacherFilter');
    if (gradeFilter) {
        const grades = ['PP1', 'PP2', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9'];
        gradeFilter.innerHTML = '<option value="all">All Grades</option>' +
            grades.map(g => `<option value="${g}">${g}</option>`).join('');
    }
    if (teacherFilter) {
        const staff = StaffRepo.getAll();
        teacherFilter.innerHTML = '<option value="all">All Teachers</option>' +
            staff.map(s => `<option value="${s.id}">${escapeHtml(s.name)}</option>`).join('');
    }

    // Populate slot modal dropdowns
    const ttSlotTeacher = $('ttSlotTeacher');
    if (ttSlotTeacher) {
        const staff = StaffRepo.getAll();
        ttSlotTeacher.innerHTML = '<option value="">Select Teacher...</option>' +
            staff.map(s => `<option value="${s.id}">${escapeHtml(s.name)} (${escapeHtml(s.designation || 'Staff')})</option>`).join('');
    }

    // Slot subject - dynamically populated by grade change
    const ttSlotGrade = $('ttSlotGrade');
    if (ttSlotGrade && !ttSlotGrade.dataset.bound) {
        ttSlotGrade.dataset.bound = '1';
        ttSlotGrade.addEventListener('change', () => populateTimetableSlotSubjects(ttSlotGrade.value));
    }
}

function populateTimetableSlotSubjects(grade) {
    const subj = $('ttSlotSubject');
    if (!subj) return;
    if (!grade) {
        subj.innerHTML = '<option value="">Select Grade First...</option>';
        return;
    }
    const applicable = (store.learningAreas || []).filter(a => !a.applicableLevels || a.applicableLevels.includes(grade));
    subj.innerHTML = '<option value="">Select Subject...</option>' +
        applicable.map(a => `<option value="${a.id}" data-code="${a.code}">${escapeHtml(a.name)}</option>`).join('');
}

function bindTimetableControls() {
    const ttTabs = $('ttTabs');
    if (ttTabs && !ttTabs.dataset.bound) {
        ttTabs.dataset.bound = '1';
        ttTabs.addEventListener('click', (e) => {
            const btn = e.target.closest('.ttt-btn');
            if (!btn) return;
            ttTabs.querySelectorAll('.ttt-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTimetableView = btn.dataset.view;
            updateTimetableFilterVisibility();
            renderTimetable();
        });
    }

    const gradeFilter = $('ttGradeFilter');
    if (gradeFilter && !gradeFilter.dataset.bound) {
        gradeFilter.dataset.bound = '1';
        gradeFilter.addEventListener('change', renderTimetable);
    }
    const teacherFilter = $('ttTeacherFilter');
    if (teacherFilter && !teacherFilter.dataset.bound) {
        teacherFilter.dataset.bound = '1';
        teacherFilter.addEventListener('change', renderTimetable);
    }

    const btnAddSlot = $('btnAddSlot');
    if (btnAddSlot && !btnAddSlot.dataset.bound) {
        btnAddSlot.dataset.bound = '1';
        btnAddSlot.addEventListener('click', () => openTimetableSlotModal());
    }

    const btnExport = $('btnExportTimetable');
    if (btnExport && !btnExport.dataset.bound) {
        btnExport.dataset.bound = '1';
        btnExport.addEventListener('click', exportTimetablePDF);
    }

    const btnCheckClashes = $('btnCheckClashes');
    if (btnCheckClashes && !btnCheckClashes.dataset.bound) {
        btnCheckClashes.dataset.bound = '1';
        btnCheckClashes.addEventListener('click', runTimetableClashSweep);
    }

    const ttSlotForm = $('ttSlotForm');
    if (ttSlotForm && !ttSlotForm.dataset.bound) {
        ttSlotForm.dataset.bound = '1';
        ttSlotForm.addEventListener('submit', handleTimetableSlotSubmit);
    }

    // Live clash detection on form field changes
    ['ttSlotGrade', 'ttSlotTeacher', 'ttSlotDay', 'ttSlotPeriod', 'ttSlotRoom', 'ttSlotSubject'].forEach(id => {
        const el = $(id);
        if (el && !el.dataset.clashBound) {
            el.dataset.clashBound = '1';
            el.addEventListener('change', checkTimetableClashLive);
            el.addEventListener('input', checkTimetableClashLive);
        }
    });
}

function updateTimetableFilterVisibility() {
    const gradeFilter = $('ttGradeFilter');
    const teacherFilter = $('ttTeacherFilter');
    if (currentTimetableView === 'teacher') {
        if (gradeFilter) gradeFilter.style.display = 'none';
        if (teacherFilter) teacherFilter.style.display = '';
    } else if (currentTimetableView === 'grade') {
        if (gradeFilter) gradeFilter.style.display = '';
        if (teacherFilter) teacherFilter.style.display = 'none';
    } else { // master
        if (gradeFilter) gradeFilter.style.display = '';
        if (teacherFilter) teacherFilter.style.display = 'none';
    }
}

function renderTimetable() {
    const wrapper = $('ttGridWrapper');
    if (!wrapper) return;

    const slots = store.timetable || [];
    const gradeFilter = $('ttGradeFilter');
    const teacherFilter = $('ttTeacherFilter');
    const gradeVal = gradeFilter ? gradeFilter.value : 'all';
    const teacherVal = teacherFilter ? teacherFilter.value : 'all';

    // KPI counts
    const totalSlots = slots.length;
    const assignedSlots = slots.filter(s => s.subjectId && s.teacherId).length;
    const teachersActive = new Set(slots.map(s => s.teacherId).filter(Boolean)).size;

    // Compute "free slots" — periods that don't have a lesson across the visible scope
    const visibleSlots = slots.filter(s => {
        if (currentTimetableView === 'grade' && gradeVal !== 'all' && s.grade !== gradeVal) return false;
        if (currentTimetableView === 'teacher' && teacherVal !== 'all' && s.teacherId !== teacherVal) return false;
        if (currentTimetableView === 'master' && gradeVal !== 'all' && s.grade !== gradeVal) return false;
        return true;
    });

    // Total lesson cells = (periods that aren't breaks) * days * grades-visible
    // For simplicity, free = total period cells - assigned visible slots
    const teachingPeriods = TT_PERIODS.filter(p => !p.isBreak).length;
    const totalCells = teachingPeriods * TT_DAYS.length * (currentTimetableView === 'master' ? 1 : 1);
    const freeSlots = Math.max(0, totalCells - visibleSlots.length);

    setText('ttKpiTotal', totalSlots);
    setText('ttKpiAssigned', assignedSlots);
    setText('ttKpiFree', freeSlots);
    setText('ttKpiTeachers', teachersActive);

    // Render grid
    let html = '<div class="tt-grid">';
    // Header row: corner + days
    html += '<div class="tt-grid-corner">Period / Day</div>';
    TT_DAYS.forEach(day => {
        html += `<div class="tt-grid-day">${day}</div>`;
    });

    // Period rows
    TT_PERIODS.forEach(period => {
        html += `<div class="tt-grid-period"><div>${period.label}</div><small>${period.time}</small></div>`;
        TT_DAYS.forEach(day => {
            if (period.isBreak) {
                html += `<div class="tt-cell break-cell">${period.label}</div>`;
            } else {
                // Find slot for this day/period (and grade/teacher if filter active)
                const matching = visibleSlots.filter(s => s.day === day && s.period === period.id);
                if (matching.length === 0) {
                    html += `<div class="tt-cell" onclick="openTimetableSlotModal(null, '${day}', '${period.id}')">+ Add</div>`;
                } else if (matching.length === 1) {
                    html += renderTimetableLesson(matching[0]);
                } else {
                    // Multiple lessons (e.g. master view shows all grades for same slot)
                    html += `<div style="display:flex; flex-direction:column; gap:4px;">${matching.map(m => renderTimetableLesson(m, true)).join('')}</div>`;
                }
            }
        });
    });
    html += '</div>';
    wrapper.innerHTML = html;

    // Show/hide workload section in teacher view
    const workloadSection = $('ttWorkloadSection');
    if (workloadSection) {
        if (currentTimetableView === 'teacher') {
            workloadSection.style.display = '';
            renderTimetableWorkloadGrid();
        } else {
            workloadSection.style.display = 'none';
        }
    }
}

function renderTimetableLesson(slot, compact) {
    const subject = (store.learningAreas || []).find(a => a.id === slot.subjectId);
    const teacher = slot.teacherId ? StaffRepo.getById(slot.teacherId) : null;
    const subjectName = subject ? subject.name : (slot.subjectName || 'Subject');
    const teacherName = teacher ? teacher.name.split(' ')[0] : (slot.teacherName || 'TBA');
    const gradeLabel = slot.grade || '';

    // Tone based on subject code hash for consistent coloring
    const code = (subject && subject.code) || slot.subjectId || subjectName;
    let hash = 0;
    for (let i = 0; i < code.length; i++) hash = ((hash << 5) - hash + code.charCodeAt(i)) | 0;
    const tone = TT_TONE_PALETTE[Math.abs(hash) % TT_TONE_PALETTE.length];

    const metaParts = [];
    if (currentTimetableView === 'master' && gradeLabel) metaParts.push(gradeLabel);
    if (currentTimetableView !== 'teacher') metaParts.push(teacherName);
    if (currentTimetableView === 'teacher' && gradeLabel) metaParts.push(gradeLabel);
    if (slot.room) metaParts.push(`📍 ${slot.room}`);
    const meta = metaParts.join(' · ');

    return `<div class="tt-lesson" data-tone="${tone}" onclick="openTimetableSlotModal('${slot.id}')" title="${escapeHtml(subjectName)} · ${escapeHtml(teacherName || '')} ${slot.room ? '· ' + escapeHtml(slot.room) : ''}">
        <div class="tt-lesson-subject">${escapeHtml(subjectName)}</div>
        <div class="tt-lesson-meta">${escapeHtml(meta)}</div>
    </div>`;
}

function renderTimetableWorkloadGrid() {
    const container = $('ttWorkloadGrid');
    if (!container) return;
    const slots = store.timetable || [];
    const staff = StaffRepo.getAll();
    const items = staff.map(s => {
        const lessonCount = slots.filter(t => t.teacherId === s.id).length;
        return { ...s, lessonCount };
    }).filter(s => s.lessonCount > 0).sort((a, b) => b.lessonCount - a.lessonCount);

    if (items.length === 0) {
        container.innerHTML = '<div class="heatmap-empty" style="grid-column:1/-1;">No teacher assignments yet.</div>';
        return;
    }

    container.innerHTML = items.map(s => `
        <div class="tt-workload-card">
            <div class="ttw-avatar"><img src="${s.photo || DEFAULT_AVATAR}" alt="" onerror="this.src='${DEFAULT_AVATAR}'"></div>
            <div class="ttw-info">
                <div class="ttw-name">${escapeHtml(s.name)}</div>
                <div class="ttw-sub">${escapeHtml(s.designation || 'Staff')}</div>
            </div>
            <div class="ttw-count">${s.lessonCount}</div>
        </div>
    `).join('');
}

function openTimetableSlotModal(slotId, presetDay, presetPeriod) {
    populateTimetableFilters();
    const modal = $('ttSlotModal');
    if (!modal) return;
    ttCurrentEditId = slotId || null;

    if (slotId) {
        const slot = (store.timetable || []).find(s => s.id === slotId);
        if (slot) {
            setText('ttSlotModalTitle', 'Edit Timetable Slot');
            $('ttSlotEditId').value = slot.id;
            $('ttSlotDay').value = slot.day || 'Monday';
            $('ttSlotPeriod').value = slot.period || '1';
            $('ttSlotGrade').value = slot.grade || '';
            populateTimetableSlotSubjects(slot.grade);
            $('ttSlotSubject').value = slot.subjectId || '';
            $('ttSlotTeacher').value = slot.teacherId || '';
            $('ttSlotRoom').value = slot.room || '';
            $('ttSlotNotes').value = slot.notes || '';
        }
    } else {
        setText('ttSlotModalTitle', 'Add Timetable Slot');
        $('ttSlotForm')?.reset();
        $('ttSlotEditId').value = '';
        if (presetDay) $('ttSlotDay').value = presetDay;
        if (presetPeriod) $('ttSlotPeriod').value = presetPeriod;
        populateTimetableSlotSubjects('');
    }
    openModal('ttSlotModal');
}

function handleTimetableSlotSubmit(e) {
    e.preventDefault();
    const editId = $('ttSlotEditId').value;
    const grade = $('ttSlotGrade').value;
    const subjectId = $('ttSlotSubject').value;
    const teacherId = $('ttSlotTeacher').value;
    const day = $('ttSlotDay').value;
    const period = $('ttSlotPeriod').value;
    const room = $('ttSlotRoom').value.trim();
    const notes = $('ttSlotNotes').value.trim();

    if (!grade || !subjectId || !teacherId || !day || !period) {
        showToast('Fill all required fields', 'error');
        return;
    }

    // --- CLASH DETECTION ---
    // Rule 1: Same grade + same day + same period = only one subject allowed
    //         (a class can only be in one place at one time)
    // Rule 2: Same teacher + same day + same period = teacher can't be in two places
    // Rule 3: Same room + same day + same period = room can't host two lessons
    const slots = store.timetable || [];
    const clash = detectTimetableClash({ editId, grade, subjectId, teacherId, day, period, room }, slots);
    if (clash) {
        showTimetableClashWarning(clash, () => {
            // User acknowledged — proceed with save
            persistTimetableSlot(editId, grade, subjectId, teacherId, day, period, room, notes);
        });
        return;
    }

    persistTimetableSlot(editId, grade, subjectId, teacherId, day, period, room, notes);
}

// Returns a clash object { type, message, conflictingSlot } or null if no clash
function detectTimetableClash(newSlot, existingSlots) {
    const { editId, grade, subjectId, teacherId, day, period, room } = newSlot;

    // Skip the slot being edited (it will be replaced)
    const others = existingSlots.filter(s => s.id !== editId);

    // Rule 1: Class (grade) clash — same grade, same day, same period
    // The class cannot be taught two different subjects at the same time
    const gradeClash = others.find(s =>
        s.grade === grade && s.day === day && s.period === period
    );
    if (gradeClash) {
        const subject = (store.learningAreas || []).find(a => a.id === gradeClash.subjectId);
        return {
            type: 'grade',
            title: 'Class Schedule Clash',
            message: `Grade ${grade} already has <strong>${escapeHtml(subject ? subject.name : gradeClash.subjectName)}</strong> scheduled for ${day}, Period ${period}.`,
            detail: `A class can only be in one lesson at a time. The existing slot must be removed first.`,
            conflictingSlot: gradeClash
        };
    }

    // Rule 2: Teacher clash — same teacher, same day, same period
    // A teacher cannot teach two different classes at the same time
    const teacherClash = others.find(s =>
        s.teacherId === teacherId && s.day === day && s.period === period
    );
    if (teacherClash) {
        const teacher = StaffRepo.getById(teacherId);
        const teacherName = teacher ? teacher.name : 'This teacher';
        const subject = (store.learningAreas || []).find(a => a.id === teacherClash.subjectId);
        return {
            type: 'teacher',
            title: 'Teacher Schedule Clash',
            message: `${escapeHtml(teacherName)} is already teaching <strong>${escapeHtml(subject ? subject.name : teacherClash.subjectName)}</strong> to Grade ${teacherClash.grade} on ${day}, Period ${period}.`,
            detail: `A teacher cannot be in two classes at the same time. Choose a different teacher, period, or day.`,
            conflictingSlot: teacherClash
        };
    }

    // Rule 3: Room clash (optional — only if room is set)
    if (room) {
        const roomClash = others.find(s =>
            s.room && s.room.toLowerCase() === room.toLowerCase() &&
            s.day === day && s.period === period
        );
        if (roomClash) {
            return {
                type: 'room',
                title: 'Room Conflict',
                message: `Room <strong>${escapeHtml(room)}</strong> is already booked for ${escapeHtml(teacherClash ? '' : 'another lesson')} on ${day}, Period ${period}.`,
                detail: `Room is occupied. Choose a different room, period, or day.`,
                conflictingSlot: roomClash
            };
        }
    }

    return null;
}

function showTimetableClashWarning(clash, onProceed) {
    // Build a custom confirm modal content
    const existingModal = $('clashWarningModal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.className = 'modal-backdrop active';
    modal.id = 'clashWarningModal';
    modal.innerHTML = `
        <div class="modal" style="max-width: 480px;">
            <div class="modal-header" style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white;">
                <h3><i class="fa-solid fa-triangle-exclamation"></i> ${clash.title}</h3>
                <button data-dismiss="modal" style="color:white;">&times;</button>
            </div>
            <div class="modal-body" style="padding: 1.5rem;">
                <div style="display:flex; gap:1rem; align-items:flex-start;">
                    <div style="width:48px; height:48px; border-radius:50%; background:#fee2e2; color:#ef4444; display:flex; align-items:center; justify-content:center; font-size:1.4rem; flex-shrink:0;">
                        <i class="fa-solid fa-circle-exclamation"></i>
                    </div>
                    <div style="flex:1;">
                        <p style="margin:0 0 0.75rem; font-size:0.95rem; line-height:1.5;">${clash.message}</p>
                        <p style="margin:0; font-size:0.82rem; color:var(--text-muted); line-height:1.5;">${clash.detail}</p>
                    </div>
                </div>
                ${clash.conflictingSlot ? `
                    <div style="margin-top:1rem; padding:0.75rem; background:var(--bg-alt); border-radius:8px; font-size:0.78rem;">
                        <strong style="color:var(--text-muted);">Conflicting slot:</strong><br>
                        ${escapeHtml(clash.conflictingSlot.subjectName || 'Subject')} · ${escapeHtml(clash.conflictingSlot.grade || '')} · ${escapeHtml(clash.conflictingSlot.day || '')} · Period ${escapeHtml(clash.conflictingSlot.period || '')}
                    </div>
                ` : ''}
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                ${clash.type === 'grade' || clash.type === 'teacher' ? `
                    <button class="btn btn-danger" id="btnRemoveClashingSlot"><i class="fa-solid fa-trash"></i> Remove Conflicting Slot</button>
                ` : ''}
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Wire dismiss
    modal.querySelectorAll('[data-dismiss="modal"]').forEach(btn => {
        btn.addEventListener('click', () => modal.remove());
    });

    // Wire "Remove conflicting slot" button — removes the clash then saves the new slot
    const removeBtn = modal.querySelector('#btnRemoveClashingSlot');
    if (removeBtn && clash.conflictingSlot) {
        removeBtn.addEventListener('click', () => {
            store.timetable = (store.timetable || []).filter(s => s.id !== clash.conflictingSlot.id);
            saveData();
            modal.remove();
            onProceed();
            renderTimetable();
            showToast('Conflicting slot removed, new slot saved');
        });
    }
}

function persistTimetableSlot(editId, grade, subjectId, teacherId, day, period, room, notes) {
    const subject = (store.learningAreas || []).find(a => a.id === subjectId);
    const teacher = StaffRepo.getById(teacherId);
    const slot = {
        id: editId || generateId(),
        day, period, grade, subjectId,
        subjectName: subject ? subject.name : '',
        subjectCode: subject ? subject.code : '',
        teacherId,
        teacherName: teacher ? teacher.name : '',
        room, notes,
        createdAt: new Date().toISOString()
    };

    if (!store.timetable) store.timetable = [];
    if (editId) {
        const idx = store.timetable.findIndex(s => s.id === editId);
        if (idx >= 0) store.timetable[idx] = slot;
    } else {
        store.timetable.push(slot);
    }
    saveData();
    closeModal('ttSlotModal');
    renderTimetable();
    showToast(editId ? 'Slot updated' : 'Slot added');
}

// Live clash check as user edits the slot form
function checkTimetableClashLive() {
    const editId = $('ttSlotEditId').value;
    const grade = $('ttSlotGrade').value;
    const teacherId = $('ttSlotTeacher').value;
    const day = $('ttSlotDay').value;
    const period = $('ttSlotPeriod').value;
    const room = $('ttSlotRoom').value.trim();

    const warningEl = $('ttClashWarning');
    if (!warningEl) return;

    if (!grade || !teacherId || !day || !period) {
        warningEl.style.display = 'none';
        return;
    }

    const clash = detectTimetableClash({ editId, grade, subjectId: $('ttSlotSubject').value, teacherId, day, period, room }, store.timetable || []);
    if (clash) {
        warningEl.style.display = 'flex';
        warningEl.className = 'tt-clash-warning ' + clash.type;
        warningEl.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> <div><strong>${escapeHtml(clash.title)}:</strong> ${clash.message}</div>`;
    } else {
        warningEl.style.display = 'none';
    }
}

// Full clash sweep across the entire timetable — highlights all existing conflicts
function runTimetableClashSweep() {
    const slots = store.timetable || [];
    if (slots.length === 0) {
        showToast('No timetable slots to check', 'error');
        return;
    }

    const clashes = [];
    const seen = new Set();

    slots.forEach((slot, idx) => {
        // Check this slot against all others
        const clash = detectTimetableClash({ ...slot, editId: slot.id, subjectId: slot.subjectId, teacherId: slot.teacherId, room: slot.room }, slots);
        if (clash) {
            const key = [slot.id, clash.conflictingSlot.id].sort().join('|');
            if (!seen.has(key)) {
                seen.add(key);
                clashes.push({
                    slotA: slot,
                    slotB: clash.conflictingSlot,
                    type: clash.type,
                    title: clash.title
                });
            }
        }
    });

    if (clashes.length === 0) {
        showToast('No clashes detected — timetable is clean!', 'success');
        return;
    }

    // Show clash report modal
    const existing = $('clashSweepModal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.className = 'modal-backdrop active';
    modal.id = 'clashSweepModal';
    modal.innerHTML = `
        <div class="modal modal-lg" style="max-width: 720px;">
            <div class="modal-header" style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white;">
                <h3><i class="fa-solid fa-triangle-exclamation"></i> ${clashes.length} Timetable Clash${clashes.length === 1 ? '' : 'es'} Found</h3>
                <button data-dismiss="modal" style="color:white;">&times;</button>
            </div>
            <div class="modal-body" style="padding: 1rem 1.5rem; max-height: 60vh; overflow-y: auto;">
                <p style="margin:0 0 1rem; font-size:0.85rem; color:var(--text-muted);">
                    The following conflicts were detected. Resolve each by removing one of the conflicting slots.
                </p>
                <div style="display:flex; flex-direction:column; gap:0.75rem;">
                    ${clashes.map((c, i) => `
                        <div class="clash-sweep-item" data-clash-idx="${i}">
                            <div class="csi-header">
                                <span class="csi-badge csi-${c.type}">${c.type.toUpperCase()}</span>
                                <span style="font-weight:700;">${escapeHtml(c.title)}</span>
                            </div>
                            <div class="csi-body">
                                <div class="csi-slot">
                                    <strong>A:</strong> ${escapeHtml(c.slotA.subjectName || 'Subject')} · ${escapeHtml(c.slotA.grade || '')} · ${escapeHtml(c.slotA.day || '')} · P${escapeHtml(c.slotA.period || '')}
                                    <br><small style="color:var(--text-muted);">${escapeHtml(c.slotA.teacherName || '')}${c.slotA.room ? ' · ' + escapeHtml(c.slotA.room) : ''}</small>
                                </div>
                                <div class="csi-vs">vs</div>
                                <div class="csi-slot">
                                    <strong>B:</strong> ${escapeHtml(c.slotB.subjectName || 'Subject')} · ${escapeHtml(c.slotB.grade || '')} · ${escapeHtml(c.slotB.day || '')} · P${escapeHtml(c.slotB.period || '')}
                                    <br><small style="color:var(--text-muted);">${escapeHtml(c.slotB.teacherName || '')}${c.slotB.room ? ' · ' + escapeHtml(c.slotB.room) : ''}</small>
                                </div>
                            </div>
                            <div class="csi-actions">
                                <button class="btn btn-sm btn-danger" onclick="resolveTimetableClash('${c.slotA.id}', '${c.slotB.id}', ${i})"><i class="fa-solid fa-trash"></i> Remove A</button>
                                <button class="btn btn-sm btn-danger" onclick="resolveTimetableClash('${c.slotB.id}', '${c.slotA.id}', ${i})"><i class="fa-solid fa-trash"></i> Remove B</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" data-dismiss="modal">Close</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    modal.querySelectorAll('[data-dismiss="modal"]').forEach(btn => {
        btn.addEventListener('click', () => modal.remove());
    });
}

function resolveTimetableClash(removeId, keepId, clashIdx) {
    if (!confirm('Remove this slot from the timetable?')) return;
    store.timetable = (store.timetable || []).filter(s => s.id !== removeId);
    saveData();
    renderTimetable();
    // Remove the clash item from the modal
    const item = document.querySelector(`[data-clash-idx="${clashIdx}"]`);
    if (item) item.remove();
    // If no more clashes, close modal
    const remaining = document.querySelectorAll('.clash-sweep-item');
    if (remaining.length === 0) {
        const modal = $('clashSweepModal');
        if (modal) modal.remove();
        showToast('All clashes resolved!', 'success');
    } else {
        // Update title count
        const title = document.querySelector('#clashSweepModal h3');
        if (title) {
            title.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ${remaining.length} Timetable Clash${remaining.length === 1 ? '' : 'es'} Found`;
        }
    }
}

function deleteTimetableSlot(slotId) {
    if (!confirm('Delete this timetable slot?')) return;
    store.timetable = (store.timetable || []).filter(s => s.id !== slotId);
    saveData();
    renderTimetable();
    showToast('Slot removed');
}

function exportTimetablePDF() {
    if (!window.jspdf) { showToast('PDF library not loaded', 'error'); return; }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const slots = store.timetable || [];

    // Title
    const schoolName = (store.settings && store.settings.schoolName) || 'ElimuTrack School';
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text(schoolName, 40, 40);
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(currentTimetableView === 'teacher' ? 'Teacher Timetable' : 'Master Timetable', 40, 58);

    // Build table head
    const head = [['Period / Day', ...TT_DAYS]];
    const body = TT_PERIODS.map(period => {
        const row = [`${period.label}\n${period.time}`];
        TT_DAYS.forEach(day => {
            if (period.isBreak) {
                row.push(period.label);
            } else {
                const matching = slots.filter(s => s.day === day && s.period === period.id);
                if (matching.length === 0) {
                    row.push('-');
                } else {
                    row.push(matching.map(m => {
                        const subject = (store.learningAreas || []).find(a => a.id === m.subjectId);
                        const sName = subject ? subject.name : (m.subjectName || 'Subject');
                        return `${sName}\n${m.grade || ''}${m.teacherName ? ' · ' + m.teacherName : ''}${m.room ? ' · ' + m.room : ''}`;
                    }).join('\n---\n'));
                }
            }
        });
        return row;
    });

    doc.autoTable({
        head: head,
        body: body,
        startY: 80,
        theme: 'grid',
        headStyles: { fillColor: [34, 197, 94], textColor: 255, fontSize: 9, halign: 'center' },
        bodyStyles: { fontSize: 7, cellPadding: 3, valign: 'top' },
        columnStyles: { 0: { cellWidth: 70, fontStyle: 'bold' } },
        styles: { overflow: 'linebreak' }
    });

    const filename = currentTimetableView === 'teacher'
        ? `Teacher_Timetable_${(new Date()).toISOString().slice(0,10)}.pdf`
        : `Master_Timetable_${(new Date()).toISOString().slice(0,10)}.pdf`;
    doc.save(filename);
}



// ==========================================================================
//   ASSESSMENT CENTRE — Complete Implementation
// ==========================================================================



function normalizeLegacyAssessmentTypes() {
    (store.exams || []).forEach(exam => {
        if (!exam.assessType) exam.assessType = 'End Term';
        if (exam.assessType === 'opener') exam.assessType = 'Opener';
        if (exam.assessType === 'midterm') exam.assessType = 'Mid Term';
        if (exam.assessType === 'endterm') exam.assessType = 'End Term';
        if (exam.assessType === 'endyear') exam.assessType = 'End Year';
    });
}

function getAssessments() {
    return (store.exams || []).filter(e => e.type === 'assessment');
}

function getAssessmentById(id) {
    return getAssessments().find(a => a.id === id || a.virtualId === id);
}

function getStudentsForGrade(grade) {
    return StudentRepo.getAll().filter(s => s.grade === grade);
}

function getSubjectsForGrade(grade) {
    return store.learningAreas.filter(la => la.applicableLevels && la.applicableLevels.includes(grade));
}

function getSubjectName(subjectId) {
    const la = store.learningAreas.find(l => l.id === subjectId);
    return la ? la.name : subjectId;
}

function getSubjectById(subjectId) {
    return store.learningAreas.find(l => l.id === subjectId);
}

// ── TAB SWITCHING ──
function switchExamTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.exam-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.examtab === tabName);
    });
    // Update tab content
    document.querySelectorAll('.exam-tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `examTab-${tabName}`);
    });
    // Trigger loads
    switch (tabName) {
        case 'assessments': renderAssessmentCards(); break;
        case 'enter': populateScoreEntryDropdowns(); break;
        case 'results': populateResultsDropdowns(); break;
        case 'analysis': populateAnalysisDropdowns(); break;
        case 'batch': populateBatchDropdowns(); break;
    }
}

// ── TAB 1: MY ASSESSMENTS ──
function renderAssessmentCards() {
    const grid = $('assessGrid');
    const emptyState = $('assessEmptyState');
    if (!grid || !emptyState) return;

    const gradeFilter = getVal('examFilterGrade') || 'all';
    const typeFilter = getVal('examFilterType') || 'all';
    const termFilter = getVal('examFilterTerm') || 'all';
    const statusFilter = getVal('examFilterStatus') || 'all';

    let assessments = getAssessments().filter(a => {
        if (gradeFilter !== 'all' && a.grade !== gradeFilter) return false;
        if (typeFilter !== 'all' && a.assessType !== typeFilter) return false;
        if (termFilter !== 'all' && a.term !== termFilter) return false;
        if (statusFilter !== 'all' && a.status !== statusFilter) return false;
        return true;
    });

    setText('examCountLabel', `${assessments.length} assessment${assessments.length !== 1 ? 's' : ''}`);

    if (assessments.length === 0) {
        grid.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';

    // Sort: newest first
    assessments.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    grid.innerHTML = assessments.map(a => {
        const studentCount = getStudentsForGrade(a.grade).length;
        const subjectCount = (a.subjects || []).length;
        const scoredCount = getScoredCount(a);
        const progressPct = studentCount > 0 ? Math.round((scoredCount / (studentCount * subjectCount)) * 100) : 0;

        const statusColors = {
            draft: { bg: '#fef3c7', color: '#92400e', icon: 'fa-pencil' },
            open: { bg: '#dcfce7', color: '#166534', icon: 'fa-lock-open' },
            closed: { bg: '#f1f5f9', color: '#475569', icon: 'fa-lock' }
        };
        const st = statusColors[a.status] || statusColors.draft;

        const typeColors = {
            'Opener': 'type-opener',
            'Mid Term': 'type-midterm',
            'End Term': 'type-endterm',
            'End Year': 'type-endyear'
        };

        return `
        <div class="assess-card" data-id="${a.id}">
            <div class="assess-card-header">
                <span class="assess-type-badge ${typeColors[a.assessType] || ''}">${escapeHtml(a.assessType || 'Exam')}</span>
                <div class="assess-status-dot" style="background:${st.color};" title="${a.status}"></div>
            </div>
            <div class="assess-card-body">
                <h4 class="assess-card-title">${escapeHtml(a.name)}</h4>
                <div class="assess-card-meta">
                    <span><i class="fa-solid fa-graduation-cap"></i> ${escapeHtml(a.grade)}</span>
                    <span><i class="fa-solid fa-calendar"></i> ${escapeHtml(a.term)}</span>
                </div>
                <div class="assess-card-stats">
                    <div class="acs-item">
                        <span class="acs-val">${studentCount}</span>
                        <span class="acs-label">Learners</span>
                    </div>
                    <div class="acs-item">
                        <span class="acs-val">${subjectCount}</span>
                        <span class="acs-label">Subjects</span>
                    </div>
                    <div class="acs-item">
                        <span class="acs-val">${progressPct}%</span>
                        <span class="acs-label">Scored</span>
                    </div>
                </div>
                <div class="assess-progress-bar">
                    <div class="assess-progress-fill" style="width:${progressPct}%; background:${st.color};"></div>
                </div>
            </div>
            <div class="assess-card-footer">
                <button class="assess-action-btn" onclick="openAssessmentForScoring('${a.id}')" title="Enter Scores">
                    <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button class="assess-action-btn" onclick="viewAssessmentResults('${a.id}')" title="View Results">
                    <i class="fa-solid fa-table-columns"></i>
                </button>
                <button class="assess-action-btn" onclick="toggleAssessmentStatus('${a.id}')" title="Toggle Status">
                    <i class="fa-solid ${a.status === 'open' ? 'fa-lock' : 'fa-lock-open'}"></i>
                </button>
                <button class="assess-action-btn assess-action-danger" onclick="promptDeleteAssessment('${a.id}')" title="Delete">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </div>`;
    }).join('');
}

function getScoredCount(assessment) {
    if (!assessment.scores) return 0;
    let count = 0;
    const students = getStudentsForGrade(assessment.grade);
    students.forEach(student => {
        (assessment.subjects || []).forEach(subId => {
            const key = `${student.id}_${subId}`;
            if (assessment.scores[key] && assessment.scores[key].score !== '' && assessment.scores[key].score !== undefined) {
                count++;
            }
        });
    });
    return count;
}

function openAssessmentForScoring(id) {
    switchExamTab('enter');
    setTimeout(() => {
        setVal('scoreEntryAssessment', id);
        loadScoreEntryTable();
    }, 100);
}

function viewAssessmentResults(id) {
    switchExamTab('results');
    setTimeout(() => {
        setVal('resultsAssessment', id);
        loadResultsTable();
    }, 100);
}

function toggleAssessmentStatus(id) {
    const assessment = getAssessmentById(id);
    if (!assessment) return;
    if (assessment.status === 'draft') assessment.status = 'open';
    else if (assessment.status === 'open') assessment.status = 'closed';
    else assessment.status = 'draft';
    saveData();
    renderAssessmentCards();
    showToast(`Assessment status changed to "${assessment.status}"`);
}

function promptDeleteAssessment(id) {
    const assessment = getAssessmentById(id);
    if (!assessment) return;
    setText('deleteAssessName', assessment.name);
    openModal('deleteAssessModal');
    $('deleteAssessModal').dataset.assessId = id;
}

function confirmDeleteAssessment() {
    const modal = $('deleteAssessModal');
    const id = modal.dataset.assessId;
    if (!id) return;
    store.exams = store.exams.filter(e => e.id !== id && e.virtualId !== id);
    saveData();
    closeModal('deleteAssessModal');
    renderAssessmentCards();
    showToast('Assessment deleted successfully');
}

// ── CREATE ASSESSMENT MODAL ──
function openCreateAssessmentModal() {
    const form = $('createAssessmentForm');
    if (form) form.reset();
    setText('courseModalTitle', 'Create New Assessment'); // Reset if reused
    $('assessSubjectsContainer').innerHTML = '<span style="color:var(--text-muted); font-size:0.85rem;">Select a grade first to load subjects.</span>';
    openModal('createAssessmentModal');
}

function populateAssessSubjects() {
    const grade = getVal('assessGrade');
    const container = $('assessSubjectsContainer');
    if (!container) return;

    if (!grade) {
        container.innerHTML = '<span style="color:var(--text-muted); font-size:0.85rem;">Select a grade first to load subjects.</span>';
        return;
    }

    const subjects = getSubjectsForGrade(grade);
    if (subjects.length === 0) {
        container.innerHTML = '<span style="color:var(--text-muted); font-size:0.85rem;">No learning areas found for this grade.</span>';
        return;
    }

    container.innerHTML = subjects.map(s => `
        <label class="assess-subject-chip" style="display:inline-flex;align-items:center;gap:0.35rem;padding:0.4rem 0.75rem;border:1px solid var(--border);border-radius:20px;cursor:pointer;font-size:0.82rem;transition:all 0.2s;background:var(--bg-body);">
            <input type="checkbox" name="assessSubject" value="${s.id}" checked style="accent-color:var(--primary);">
            ${escapeHtml(s.name)}
        </label>
    `).join('');

    // Style interactions
    container.querySelectorAll('.assess-subject-chip').forEach(chip => {
        const cb = chip.querySelector('input');
        cb.addEventListener('change', () => {
            chip.style.background = cb.checked ? 'var(--primary-light, #dcfce7)' : 'var(--bg-body)';
            chip.style.borderColor = cb.checked ? 'var(--primary)' : 'var(--border)';
        });
        // Trigger initial style
        chip.style.background = 'var(--primary-light, #dcfce7)';
        chip.style.borderColor = 'var(--primary)';
    });
}

function saveAssessment(event) {
    event.preventDefault();

    const name = getVal('assessName');
    const assessType = getVal('assessType');
    const grade = getVal('assessGrade');
    const term = getVal('assessTerm');
    const startDate = getVal('assessStartDate');
    const endDate = getVal('assessEndDate');
    const notes = getVal('assessNotes');

    // ── Block incomplete submissions ──
    if (!grade || !term || !assessType) {
        showToast('Grade, Term, and Assessment Type are all required', 'error');
        return false;
    }

    // ── Gather selected subjects ──
    const selectedSubjects = [];
    document.querySelectorAll('input[name="assessSubject"]:checked').forEach(cb => {
        selectedSubjects.push(cb.value);
    });

    if (selectedSubjects.length === 0) {
        showToast('Please select at least one learning area', 'error');
        return false;
    }

    // ── Build the assessment object ──
    const id = generateId();
    const virtualId = generateId();
    const now = Date.now();

    const assessment = {
        id: id,
        virtualId: virtualId,
        type: 'assessment',
        name: name,
        assessType: assessType,
        grade: grade,
        term: term,
        startDate: startDate || null,
        endDate: endDate || null,
        subjects: selectedSubjects,
        notes: notes || '',
        status: 'draft',
        scores: {},
        createdAt: now,
        // ── Server-compatible fields (these 9 columns exist in the DB) ──
        studentId: null,
        subjectId: null,
        score: null,
        year: store.settings.academicYear || new Date().getFullYear().toString(),
        // ── 'comments' carries all the extra data the server doesn't have columns for ──
        comments: JSON.stringify({
            _a: 1,
            virtualId: virtualId,
            name: name,
            assessType: assessType,
            subjects: selectedSubjects,
            scores: {},
            status: 'draft',
            startDate: startDate || null,
            endDate: endDate || null,
            notes: notes || '',
            createdAt: now
        })
    };

    if (!store.exams) store.exams = [];
    store.exams.push(assessment);

    // ── Save: repackAssessments() is called inside saveData() automatically ──
    saveData();

    closeModal('createAssessmentModal');
    renderAssessmentCards();
    showToast('Assessment created successfully!');
    return false;
}
// ==========================================================================
//   ASSESSMENT PACK / UNPACK LAYER
//   (Smuggles extra fields into 'comments' so the 9-column server can store them)
// ==========================================================================

function repackAssessments() {
    (store.exams || []).forEach(exam => {
        if (exam.type === 'assessment') {
            exam.comments = JSON.stringify({
                _a: 1,
                virtualId: exam.virtualId || exam.id,
                name: exam.name || '',
                assessType: exam.assessType || 'End Term',
                subjects: exam.subjects || [],
                scores: exam.scores || {},
                status: exam.status || 'draft',
                startDate: exam.startDate || null,
                endDate: exam.endDate || null,
                notes: exam.notes || '',
                createdAt: exam.createdAt || Date.now()
            });
        }
    });
}

function unpackAssessments() {
    (store.exams || []).forEach(exam => {
        if (exam.type === 'assessment' && exam.comments) {
            try {
                const p = JSON.parse(exam.comments);
                if (p && p._a === 1) {
                    exam.virtualId = p.virtualId || exam.id;
                    exam.name = p.name || 'Untitled Assessment';
                    exam.assessType = p.assessType || 'End Term';
                    exam.subjects = p.subjects || [];
                    exam.scores = p.scores || {};
                    exam.status = p.status || 'draft';
                    exam.startDate = p.startDate || null;
                    exam.endDate = p.endDate || null;
                    exam.notes = p.notes || '';
                    exam.createdAt = p.createdAt || Date.now();
                }
            } catch (e) {
                // Not a packed assessment — it's a legacy broken record
                // Patch it so it doesn't crash the UI
                if (!exam.subjects) exam.subjects = [];
                if (!exam.scores) exam.scores = {};
                if (!exam.status) exam.status = 'draft';
                if (!exam.assessType) exam.assessType = 'End Term';
                if (!exam.name) exam.name = exam.grade ? `${exam.assessType} — ${exam.grade}` : 'Untitled';
                if (!exam.virtualId) exam.virtualId = exam.id;
                if (!exam.createdAt) exam.createdAt = Date.now();
            }
        }
    });
}

// ── TAB 2: ENTER SCORES ──
function populateScoreEntryDropdowns() {
    const assessSelect = $('scoreEntryAssessment');
    if (!assessSelect) return;

    const currentVal = assessSelect.value;
    const assessments = getAssessments();

    assessSelect.innerHTML = '<option value="">Select Assessment...</option>' +
        assessments.map(a => `<option value="${a.id}">${escapeHtml(a.name)} — ${a.grade} (${a.term})</option>`).join('');

    if (currentVal && assessments.some(a => a.id === currentVal)) {
        assessSelect.value = currentVal;
    }

    populateScoreEntrySubjects();
}

function populateScoreEntrySubjects() {
    const assessId = getVal('scoreEntryAssessment');
    const subjectSelect = $('scoreEntrySubject');
    if (!subjectSelect) return;

    if (!assessId) {
        subjectSelect.innerHTML = '<option value="">Select Subject...</option>';
        return;
    }

    const assessment = getAssessmentById(assessId);
    if (!assessment) {
        subjectSelect.innerHTML = '<option value="">Select Subject...</option>';
        return;
    }

    const currentVal = subjectSelect.value;
    subjectSelect.innerHTML = '<option value="">Select Subject...</option>' +
        (assessment.subjects || []).map(subId => {
            const sub = getSubjectById(subId);
            return sub ? `<option value="${sub.id}">${escapeHtml(sub.name)}</option>` : '';
        }).join('');

    if (currentVal && (assessment.subjects || []).includes(currentVal)) {
        subjectSelect.value = currentVal;
    }
}

function loadScoreEntryTable() {
    populateScoreEntrySubjects();
    const assessId = getVal('scoreEntryAssessment');
    const subjectId = getVal('scoreEntrySubject');
    const wrapper = $('scoreEntryWrapper');
    const emptyState = $('scoreEntryEmpty');
    const body = $('scoreEntryBody');

    if (!wrapper || !emptyState || !body) return;

    if (!assessId || !subjectId) {
        wrapper.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    const assessment = getAssessmentById(assessId);
    if (!assessment) {
        wrapper.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    const students = getStudentsForGrade(assessment.grade);
    if (students.length === 0) {
        wrapper.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    const subject = getSubjectById(subjectId);
    setText('scoreEntryTitle', `${assessment.name} — ${subject ? subject.name : subjectId}`);
    setText('scoreEntryCount', `${students.length} learners`);

    wrapper.style.display = 'block';
    emptyState.style.display = 'none';

    body.innerHTML = students.map((student, idx) => {
        const key = `${student.id}_${subjectId}`;
        const existing = (assessment.scores || {})[key] || {};
        const score = existing.score !== undefined ? existing.score : '';
        const rating = score !== '' ? cbcRating(parseFloat(score)) : null;

        return `
        <tr class="score-entry-row" data-student-id="${student.id}" data-key="${key}">
            <td style="text-align:center; color:var(--text-muted);">${idx + 1}</td>
            <td><strong>${escapeHtml(student.name)}</strong></td>
            <td style="color:var(--text-muted); font-size:0.85rem;">${escapeHtml(student.reg || 'N/A')}</td>
            <td class="subj-col">
                <input type="number" class="score-input" min="0" max="100" value="${score}"
                    data-key="${key}" data-student="${student.id}" data-subject="${subjectId}"
                    oninput="onScoreInput(this)" placeholder="—">
            </td>
            <td class="subj-col">
                <span class="cbc-rating-badge ${rating ? rating.cls : ''}" id="rating_${key}"
                    style="display:${rating ? 'inline-flex' : 'none'}; padding:0.25rem 0.6rem; border-radius:20px; font-size:0.78rem; font-weight:600; background:${rating ? rating.color + '22' : 'transparent'}; color:${rating ? rating.color : 'inherit'};">
                    ${rating ? rating.code : ''}
                </span>
            </td>
            <td class="subj-col">
                <span id="remark_${key}" style="font-size:0.82rem; color:var(--text-muted);">${rating ? escapeHtml(rating.text) : ''}</span>
            </td>
        </tr>`;
    }).join('');
}

function onScoreInput(input) {
    const val = input.value;
    const key = input.dataset.key;
    const ratingEl = $(`rating_${key}`);
    const remarkEl = $(`remark_${key}`);

    if (val === '' || isNaN(val)) {
        if (ratingEl) ratingEl.style.display = 'none';
        if (remarkEl) remarkEl.textContent = '';
        return;
    }

    const score = Math.min(100, Math.max(0, parseInt(val)));
    const rating = cbcRating(score);

    if (ratingEl) {
        ratingEl.style.display = 'inline-flex';
        ratingEl.className = `cbc-rating-badge ${rating.cls}`;
        ratingEl.style.background = rating.color + '22';
        ratingEl.style.color = rating.color;
        ratingEl.textContent = rating.code;
    }
    if (remarkEl) remarkEl.textContent = rating.text;
}

function filterScoreEntryRows() {
    const q = getVal('scoreEntrySearch').toLowerCase();
    document.querySelectorAll('.score-entry-row').forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(q) ? '' : 'none';
    });
}

function autoSaveScores() {
    const assessId = getVal('scoreEntryAssessment');
    const assessment = getAssessmentById(assessId);
    if (!assessment) return;

    if (!assessment.scores) assessment.scores = {};

    document.querySelectorAll('.score-input').forEach(input => {
        const key = input.dataset.key;
        const val = input.value;
        if (val !== '') {
            assessment.scores[key] = {
                score: parseInt(val),
                studentId: input.dataset.student,
                subjectId: input.dataset.subject,
                updatedAt: Date.now()
            };
        }
    });

    saveData();  // repackAssessments() runs inside here automatically
    showToast('Scores saved as draft');
}

function submitAllScores() {
    const assessId = getVal('scoreEntryAssessment');
    const assessment = getAssessmentById(assessId);
    if (!assessment) return;

    if (!assessment.scores) assessment.scores = {};

    let enteredCount = 0;
    document.querySelectorAll('.score-input').forEach(input => {
        const key = input.dataset.key;
        const val = input.value;
        if (val !== '') {
            assessment.scores[key] = {
                score: parseInt(val),
                studentId: input.dataset.student,
                subjectId: input.dataset.subject,
                submitted: true,
                updatedAt: Date.now()
            };
            enteredCount++;
        }
    });

    assessment.status = 'closed';
    saveData();  // repackAssessments() runs inside here automatically
    showToast(`${enteredCount} scores submitted and assessment closed`);
    switchExamTab('assessments');
}
// ── TAB 3: RESULTS ──
function populateResultsDropdowns() {
    const assessSelect = $('resultsAssessment');
    if (!assessSelect) return;

    const currentVal = assessSelect.value;
    const assessments = getAssessments();

    assessSelect.innerHTML = '<option value="">Select Assessment...</option>' +
        assessments.map(a => `<option value="${a.id}">${escapeHtml(a.name)} — ${a.grade} (${a.term})</option>`).join('');

    if (currentVal && assessments.some(a => a.id === currentVal)) {
        assessSelect.value = currentVal;
    }
}

function loadResultsTable() {
    const assessId = getVal('resultsAssessment');
    const gradeFilter = getVal('resultsGrade') || 'all';
    const wrapper = $('resultsWrapper');
    const emptyState = $('resultsEmpty');
    const head = $('resultsHead');
    const body = $('resultsBody');

    if (!wrapper || !emptyState || !head || !body) return;

    if (!assessId) {
        wrapper.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    const assessment = getAssessmentById(assessId);
    if (!assessment) {
        wrapper.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    let students = getStudentsForGrade(assessment.grade);
    if (gradeFilter !== 'all') {
        students = students.filter(s => s.grade === gradeFilter);
    }

    if (students.length === 0) {
        wrapper.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    const subjects = (assessment.subjects || []).map(subId => getSubjectById(subId)).filter(Boolean);

    setText('resultsTitle', `${assessment.name} — Results Marksheet`);

    // Build header
    let headerHtml = `<tr>
        <th style="width:40px;">#</th>
        <th>Student Name</th>
        <th>ADM No</th>`;
    subjects.forEach(sub => {
        headerHtml += `<th class="subj-col" style="text-align:center; min-width:70px;">${escapeHtml(sub.name.length > 12 ? sub.name.substring(0, 12) + '...' : sub.name)}</th>`;
    });
    headerHtml += `<th style="text-align:center; font-weight:700;">Total</th>
        <th style="text-align:center; font-weight:700;">Mean</th>
        <th style="text-align:center; font-weight:700;">Grade</th>
    </tr>`;
    head.innerHTML = headerHtml;

    // Build body
    let allTotals = [];
    body.innerHTML = students.map((student, idx) => {
        let total = 0, scoredCount = 0;
        let cells = `<td style="text-align:center; color:var(--text-muted);">${idx + 1}</td>
            <td><strong>${escapeHtml(student.name)}</strong></td>
            <td style="color:var(--text-muted); font-size:0.85rem;">${escapeHtml(student.reg || 'N/A')}</td>`;

        subjects.forEach(sub => {
            const key = `${student.id}_${sub.id}`;
            const scoreData = (assessment.scores || {})[key];
            const score = scoreData ? parseInt(scoreData.score) : 0;
            if (score > 0) { total += score; scoredCount++; }
            const rating = score > 0 ? cbcRating(score) : null;
            cells += `<td class="subj-col" style="text-align:center;">
                <span style="color:${rating ? rating.color : 'var(--text-muted)'}; font-weight:${score > 0 ? '600' : '400'};">${score > 0 ? score : '—'}</span>
            </td>`;
        });

        const mean = scoredCount > 0 ? Math.round(total / scoredCount) : 0;
        const meanRating = mean > 0 ? cbcRating(mean) : null;
        allTotals.push(mean);

        cells += `<td style="text-align:center; font-weight:700;">${scoredCount > 0 ? total : '—'}</td>
            <td style="text-align:center; font-weight:700; color:${meanRating ? meanRating.color : 'inherit'};">${mean > 0 ? mean : '—'}</td>
            <td style="text-align:center;">
                <span class="cbc-rating-badge ${meanRating ? meanRating.cls : ''}" style="padding:0.2rem 0.5rem; border-radius:20px; font-size:0.75rem; font-weight:600; background:${meanRating ? meanRating.color + '22' : 'transparent'}; color:${meanRating ? meanRating.color : 'inherit'};">
                    ${meanRating ? meanRating.code : '—'}
                </span>
            </td>`;

        return `<tr class="result-row" data-student-id="${student.id}">${cells}</tr>`;
    }).join('');

    // Stats
    const validMeans = allTotals.filter(m => m > 0);
    const overallMean = validMeans.length > 0 ? Math.round(validMeans.reduce((a, b) => a + b, 0) / validMeans.length) : 0;
    setText('resultsStats', `${students.length} learners | Overall Mean: ${overallMean}%`);

    wrapper.style.display = 'block';
    emptyState.style.display = 'none';
}

function filterResultRows() {
    const q = getVal('resultsSearch').toLowerCase();
    document.querySelectorAll('.result-row').forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(q) ? '' : 'none';
    });
}

function printResults() {
    const wrapper = $('resultsWrapper');
    if (!wrapper || wrapper.style.display === 'none') {
        showToast('No results to print', 'error');
        return;
    }

    const title = $('resultsTitle').textContent;
    const stats = $('resultsStats').textContent;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${escapeHtml(title)}</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 2rem; }
                h1 { text-align: center; font-size: 1.3rem; margin-bottom: 0.25rem; }
                .stats { text-align: center; color: #666; font-size: 0.9rem; margin-bottom: 1.5rem; }
                table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
                th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: center; }
                th { background: #f5f5f5; font-weight: 600; }
                td:nth-child(2) { text-align: left; }
                @media print { body { padding: 0.5rem; } }
            </style>
        </head>
        <body>
            <h1>${escapeHtml(store.settings.schoolName || 'School')}</h1>
            <h1>${escapeHtml(title)}</h1>
            <div class="stats">${escapeHtml(stats)}</div>
            ${$('resultsTable').outerHTML}
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

function exportResultsPDF() {
    showToast('PDF export initiated...', 'info');
    printResults(); // Fallback to print dialog
}

function exportResultsExcel() {
    const wrapper = $('resultsWrapper');
    if (!wrapper || wrapper.style.display === 'none') {
        showToast('No results to export', 'error');
        return;
    }

    const table = $('resultsTable');
    if (!table) return;

    let csv = '';
    const rows = table.querySelectorAll('tr');
    rows.forEach(row => {
        const cells = row.querySelectorAll('th, td');
        const rowData = [];
        cells.forEach(cell => rowData.push('"' + cell.textContent.replace(/"/g, '""').trim() + '"'));
        csv += rowData.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `results_${getVal('resultsAssessment') || 'export'}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    showToast('Results exported as CSV');
}

// ── TAB 4: SUBJECT ANALYSIS ──
function populateAnalysisDropdowns() {
    const assessSelect = $('analysisAssessment');
    if (!assessSelect) return;

    const currentVal = assessSelect.value;
    const assessments = getAssessments();

    assessSelect.innerHTML = '<option value="">Select Assessment...</option>' +
        assessments.map(a => `<option value="${a.id}">${escapeHtml(a.name)} — ${a.grade} (${a.term})</option>`).join('');

    if (currentVal && assessments.some(a => a.id === currentVal)) {
        assessSelect.value = currentVal;
    }

    populateAnalysisSubjects();
}

function populateAnalysisSubjects() {
    const assessId = getVal('analysisAssessment');
    const subjectSelect = $('analysisSubject');
    if (!subjectSelect) return;

    if (!assessId) {
        subjectSelect.innerHTML = '<option value="all">All Subjects</option>';
        return;
    }

    const assessment = getAssessmentById(assessId);
    if (!assessment) {
        subjectSelect.innerHTML = '<option value="all">All Subjects</option>';
        return;
    }

    const currentVal = subjectSelect.value;
    subjectSelect.innerHTML = '<option value="all">All Subjects</option>' +
        (assessment.subjects || []).map(subId => {
            const sub = getSubjectById(subId);
            return sub ? `<option value="${sub.id}">${escapeHtml(sub.name)}</option>` : '';
        }).join('');

    if (currentVal) subjectSelect.value = currentVal;
}

function loadSubjectAnalysis() {
    populateAnalysisSubjects();
    const assessId = getVal('analysisAssessment');
    const subjectFilter = getVal('analysisSubject') || 'all';
    const kpiContainer = $('subjectAnalysisKpis');
    const wrapper = $('analysisWrapper');
    const emptyState = $('analysisEmpty');
    const body = $('analysisBody');

    if (!wrapper || !emptyState || !body) return;

    if (!assessId) {
        if (kpiContainer) kpiContainer.innerHTML = '';
        wrapper.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    const assessment = getAssessmentById(assessId);
    if (!assessment) {
        wrapper.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    const students = getStudentsForGrade(assessment.grade);
    let subjects = (assessment.subjects || []).map(subId => getSubjectById(subId)).filter(Boolean);
    if (subjectFilter !== 'all') {
        subjects = subjects.filter(s => s.id === subjectFilter);
    }

    if (subjects.length === 0 || students.length === 0) {
        wrapper.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    // Compute analysis per subject
    let allScores = [];
    const analysisData = subjects.map(sub => {
        const scores = students.map(student => {
            const key = `${student.id}_${sub.id}`;
            const scoreData = (assessment.scores || {})[key];
            return scoreData ? parseInt(scoreData.score) : null;
        }).filter(s => s !== null && s > 0);

        allScores = allScores.concat(scores);
        const entries = scores.length;
        const mean = entries > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / entries) : 0;
        const highest = entries > 0 ? Math.max(...scores) : 0;
        const lowest = entries > 0 ? Math.min(...scores) : 0;
        const ee = scores.filter(s => s >= 80).length;
        const me = scores.filter(s => s >= 50 && s < 80).length;
        const ae = scores.filter(s => s >= 30 && s < 50).length;
        const be = scores.filter(s => s < 30).length;

        return { subject: sub.name, entries, mean, highest, lowest, ee, me, ae, be };
    });

    // KPIs
    const totalEntries = allScores.length;
    const overallMean = totalEntries > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / totalEntries) : 0;
    const eeCount = allScores.filter(s => s >= 80).length;
    const beCount = allScores.filter(s => s < 30).length;

    if (kpiContainer) {
        kpiContainer.innerHTML = `
            <div class="modern-card" style="padding:1rem; border-left:4px solid var(--primary);">
                <div style="font-size:0.78rem; color:var(--text-muted);">Total Entries</div>
                <div style="font-size:1.5rem; font-weight:700;">${totalEntries}</div>
            </div>
            <div class="modern-card" style="padding:1rem; border-left:4px solid #22c55e;">
                <div style="font-size:0.78rem; color:var(--text-muted);">Overall Mean</div>
                <div style="font-size:1.5rem; font-weight:700; color:#22c55e;">${overallMean}%</div>
            </div>
            <div class="modern-card" style="padding:1rem; border-left:4px solid #3b82f6;">
                <div style="font-size:0.78rem; color:var(--text-muted);">EE (≥80)</div>
                <div style="font-size:1.5rem; font-weight:700; color:#3b82f6;">${eeCount}</div>
            </div>
            <div class="modern-card" style="padding:1rem; border-left:4px solid #ef4444;">
                <div style="font-size:0.78rem; color:var(--text-muted);">BE (<30)</div>
                <div style="font-size:1.5rem; font-weight:700; color:#ef4444;">${beCount}</div>
            </div>
        `;
    }

    // Table
    body.innerHTML = analysisData.map(d => {
        const meanRating = d.mean > 0 ? cbcRating(d.mean) : null;
        return `
        <tr>
            <td><strong>${escapeHtml(d.subject)}</strong></td>
            <td style="text-align:center;">${d.entries}</td>
            <td style="text-align:center; font-weight:700; color:${meanRating ? meanRating.color : 'inherit'};">${d.mean > 0 ? d.mean : '—'}</td>
            <td style="text-align:center; color:#22c55e; font-weight:600;">${d.highest || '—'}</td>
            <td style="text-align:center; color:#ef4444; font-weight:600;">${d.lowest || '—'}</td>
            <td style="text-align:center; color:#22c55e; font-weight:600;">${d.ee}</td>
            <td style="text-align:center; color:#3b82f6; font-weight:600;">${d.me}</td>
            <td style="text-align:center; color:#f59e0b; font-weight:600;">${d.ae}</td>
            <td style="text-align:center; color:#ef4444; font-weight:600;">${d.be}</td>
        </tr>`;
    }).join('');

    wrapper.style.display = 'block';
    emptyState.style.display = 'none';
}

function exportAnalysisPDF() {
    const wrapper = $('analysisWrapper');
    if (!wrapper || wrapper.style.display === 'none') {
        showToast('No analysis to export', 'error');
        return;
    }

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Subject Analysis Report</title>
            <style>
                body { font-family: 'Segoe UI', sans-serif; padding: 2rem; }
                h1 { text-align: center; font-size: 1.3rem; }
                .kpi-row { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
                .kpi-card { flex: 1; padding: 0.75rem; border: 1px solid #ddd; border-radius: 8px; text-align: center; }
                .kpi-val { font-size: 1.5rem; font-weight: 700; }
                .kpi-label { font-size: 0.8rem; color: #666; }
                table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
                th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: center; }
                th { background: #f5f5f5; }
                td:first-child { text-align: left; }
            </style>
        </head>
        <body>
            <h1>${escapeHtml(store.settings.schoolName || 'School')} — Subject Analysis</h1>
            ${$('subjectAnalysisKpis').innerHTML.replace(/class="modern-card"/g, 'class="kpi-card"')}
            ${$('analysisTable').outerHTML}
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// ── TAB 5: BATCH ENTRY ──
function populateBatchDropdowns() {
    const assessSelect = $('batchAssessment');
    if (!assessSelect) return;

    const currentVal = assessSelect.value;
    const assessments = getAssessments();

    assessSelect.innerHTML = '<option value="">Select Assessment...</option>' +
        assessments.map(a => `<option value="${a.id}">${escapeHtml(a.name)} — ${a.grade} (${a.term})</option>`).join('');

    if (currentVal && assessments.some(a => a.id === currentVal)) {
        assessSelect.value = currentVal;
    }
}

function loadBatchGrid() {
    const assessId = getVal('batchAssessment');
    const wrapper = $('batchWrapper');
    const emptyState = $('batchEmpty');
    const head = $('batchHead');
    const body = $('batchBody');

    if (!wrapper || !emptyState || !head || !body) return;

    if (!assessId) {
        wrapper.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    const assessment = getAssessmentById(assessId);
    if (!assessment) {
        wrapper.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    const students = getStudentsForGrade(assessment.grade);
    const subjects = (assessment.subjects || []).map(subId => getSubjectById(subId)).filter(Boolean);

    if (students.length === 0 || subjects.length === 0) {
        wrapper.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    setText('batchTitle', `${assessment.name} — Batch Entry (${subjects.length} subjects)`);

    // Header
    let headerHtml = `<tr>
        <th style="width:40px; position:sticky; left:0; background:var(--bg-card, #fff); z-index:2;">#</th>
        <th style="min-width:180px; position:sticky; left:40px; background:var(--bg-card, #fff); z-index:2;">Student Name</th>
        <th style="min-width:100px; position:sticky; left:220px; background:var(--bg-card, #fff); z-index:2;">ADM No</th>`;
    subjects.forEach(sub => {
        headerHtml += `<th style="min-width:80px; text-align:center;">${escapeHtml(sub.name.length > 10 ? sub.name.substring(0, 10) + '..' : sub.name)}</th>`;
    });
    headerHtml += `<th style="min-width:70px; text-align:center; font-weight:700;">Total</th>
        <th style="min-width:60px; text-align:center; font-weight:700;">Mean</th>
        <th style="min-width:50px; text-align:center; font-weight:700;">Grade</th>
    </tr>`;
    head.innerHTML = headerHtml;

    // Body
    body.innerHTML = students.map((student, idx) => {
        let cells = `<td style="text-align:center; color:var(--text-muted); position:sticky; left:0; background:var(--bg-card, #fff); z-index:1;">${idx + 1}</td>
            <td style="position:sticky; left:40px; background:var(--bg-card, #fff); z-index:1;"><strong>${escapeHtml(student.name)}</strong></td>
            <td style="color:var(--text-muted); font-size:0.82rem; position:sticky; left:220px; background:var(--bg-card, #fff); z-index:1;">${escapeHtml(student.reg || 'N/A')}</td>`;

        subjects.forEach(sub => {
            const key = `${student.id}_${sub.id}`;
            const existing = (assessment.scores || {})[key];
            const val = existing ? existing.score : '';
            cells += `<td style="text-align:center;">
                <input type="number" class="batch-score-input" min="0" max="100" value="${val}"
                    data-key="${key}" data-student="${student.id}" data-subject="${sub.id}"
                    style="width:60px; padding:4px; border:1px solid var(--border); border-radius:6px; text-align:center; font-size:0.82rem;"
                    oninput="updateBatchRow(this)">
            </td>`;
        });

        cells += `<td class="batch-total" style="text-align:center; font-weight:700;">0</td>
            <td class="batch-mean" style="text-align:center; font-weight:700;">0</td>
            <td class="batch-grade" style="text-align:center;"></td>`;

        return `<tr class="batch-row" data-student-id="${student.id}" data-subjects-count="${subjects.length}">${cells}</tr>`;
    }).join('');

    // Update all totals
    document.querySelectorAll('.batch-row').forEach(row => updateBatchRowTotals(row));

    const totalCells = students.length * subjects.length;
    const filledCells = document.querySelectorAll('.batch-score-input').length;
    setText('batchStats', `${students.length} learners × ${subjects.length} subjects = ${totalCells} cells`);

    wrapper.style.display = 'block';
    emptyState.style.display = 'none';
}

function updateBatchRow(input) {
    const row = input.closest('.batch-row');
    if (row) updateBatchRowTotals(row);
}

function updateBatchRowTotals(row) {
    const inputs = row.querySelectorAll('.batch-score-input');
    let total = 0, count = 0;
    inputs.forEach(inp => {
        const v = parseInt(inp.value);
        if (!isNaN(v) && v > 0) { total += v; count++; }
    });
    const mean = count > 0 ? Math.round(total / count) : 0;
    const rating = mean > 0 ? cbcRating(mean) : null;

    const totalCell = row.querySelector('.batch-total');
    const meanCell = row.querySelector('.batch-mean');
    const gradeCell = row.querySelector('.batch-grade');

    if (totalCell) totalCell.textContent = count > 0 ? total : '0';
    if (meanCell) {
        meanCell.textContent = mean;
        meanCell.style.color = rating ? rating.color : 'inherit';
    }
    if (gradeCell && rating) {
        gradeCell.innerHTML = `<span style="padding:0.15rem 0.4rem; border-radius:12px; font-size:0.72rem; font-weight:600; background:${rating.color}22; color:${rating.color};">${rating.code}</span>`;
    } else if (gradeCell) {
        gradeCell.textContent = '';
    }
}

function filterBatchRows() {
    const q = getVal('batchSearch').toLowerCase();
    document.querySelectorAll('.batch-row').forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(q) ? '' : 'none';
    });
}

function saveBatchScores() {
    const assessId = getVal('batchAssessment');
    const assessment = getAssessmentById(assessId);
    if (!assessment) return;

    if (!assessment.scores) assessment.scores = {};
    let count = 0;

    document.querySelectorAll('.batch-score-input').forEach(input => {
        const key = input.dataset.key;
        const val = input.value;
        if (val !== '' && !isNaN(val)) {
            assessment.scores[key] = {
                score: parseInt(val),
                studentId: input.dataset.student,
                subjectId: input.dataset.subject,
                updatedAt: Date.now()
            };
            count++;
        }
    });

    saveData();
    showToast(`${count} scores saved as draft`);
}

function saveBatchAndClose() {
    saveBatchScores();
    const assessId = getVal('batchAssessment');
    const assessment = getAssessmentById(assessId);
    if (assessment) assessment.status = 'closed';
    saveData();
    showToast('All scores saved and assessment closed');
    switchExamTab('assessments');
}

function downloadBatchTemplate() {
    const assessId = getVal('batchAssessment');
    const assessment = getAssessmentById(assessId);
    if (!assessment) {
        showToast('Select an assessment first', 'error');
        return;
    }

    const subjects = (assessment.subjects || []).map(subId => getSubjectById(subId)).filter(Boolean);
    const header = ['#', 'Name', 'ADM No', ...subjects.map(s => s.name), 'Total', 'Mean', 'Grade'].join(',');
    const students = getStudentsForGrade(assessment.grade);
    const rows = students.map((s, i) => {
        const cells = [i + 1, `"${s.name}"`, `"${s.reg || ''}"`, ...subjects.map(() => ''), '', '', ''];
        return cells.join(',');
    });

    const csv = header + '\n' + rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `batch_template_${assessment.name.replace(/\s+/g, '_')}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    showToast('Template downloaded');
}

function downloadBatchScores() {
    const assessId = getVal('batchAssessment');
    const assessment = getAssessmentById(assessId);
    if (!assessment) {
        showToast('Select an assessment first', 'error');
        return;
    }

    const subjects = (assessment.subjects || []).map(subId => getSubjectById(subId)).filter(Boolean);
    const header = ['#', 'Name', 'ADM No', ...subjects.map(s => s.name), 'Total', 'Mean', 'Grade'].join(',');
    const students = getStudentsForGrade(assessment.grade);
    const rows = students.map((s, i) => {
        let total = 0, count = 0;
        const scoreCells = subjects.map(sub => {
            const key = `${s.id}_${sub.id}`;
            const scoreData = (assessment.scores || {})[key];
            const score = scoreData ? parseInt(scoreData.score) : 0;
            if (score > 0) { total += score; count++; }
            return score || '';
        });
        const mean = count > 0 ? Math.round(total / count) : 0;
        const grade = mean > 0 ? cbcRating(mean).code : '';
        return [i + 1, `"${s.name}"`, `"${s.reg || ''}"`, ...scoreCells, count > 0 ? total : '', mean, grade].join(',');
    });

    const csv = header + '\n' + rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `batch_scores_${assessment.name.replace(/\s+/g, '_')}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    showToast('Scores downloaded');
}

// ── BATCH UPLOAD ──
function openBatchUploadModal() {
    const assessId = getVal('batchAssessment');
    if (!assessId) {
        showToast('Select an assessment first', 'error');
        return;
    }
    resetBatchUploadModal();
    openModal('batchUploadModal');
}

function resetBatchUploadModal() {
    const fileInput = $('batchUploadFile');
    if (fileInput) fileInput.value = '';
    const preview = $('batchUploadPreview');
    if (preview) preview.style.display = 'none';
    const previewContent = $('batchPreviewContent');
    if (previewContent) previewContent.innerHTML = '';
}

function handleBatchFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const text = e.target.result;
        const lines = text.split('\n').filter(l => l.trim());
        if (lines.length < 2) {
            showToast('File appears empty or invalid', 'error');
            return;
        }

        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
        const dataRows = lines.slice(1).slice(0, 10); // Preview first 10

        let previewHtml = '<table style="width:100%;border-collapse:collapse;font-size:0.75rem;">';
        previewHtml += '<tr>' + headers.map(h => `<th style="border:1px solid #ddd;padding:4px;background:#f5f5f5;">${escapeHtml(h)}</th>`).join('') + '</tr>';
        dataRows.forEach(row => {
            const cells = row.split(',').map(c => c.replace(/"/g, '').trim());
            previewHtml += '<tr>' + cells.map(c => `<td style="border:1px solid #ddd;padding:4px;">${escapeHtml(c)}</td>`).join('') + '</tr>';
        });
        previewHtml += '</table>';

        $('batchPreviewContent').innerHTML = previewHtml;
        $('batchPreviewStats').textContent = `${lines.length - 1} rows detected (showing first 10)`;
        $('batchUploadPreview').style.display = 'block';
    };
    reader.readAsText(file);
}

function confirmBatchUpload() {
    const assessId = getVal('batchAssessment');
    const assessment = getAssessmentById(assessId);
    if (!assessment) {
        showToast('Assessment not found', 'error');
        return;
    }

    const fileInput = $('batchUploadFile');
    if (!fileInput || !fileInput.files[0]) {
        showToast('Please select a file', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const text = e.target.result;
        const lines = text.split('\n').filter(l => l.trim());
        if (lines.length < 2) {
            showToast('No data rows found', 'error');
            return;
        }

        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
        const subjects = (assessment.subjects || []).map(subId => getSubjectById(subId)).filter(Boolean);

        // Map header columns to subject IDs
        const subjectColMap = {};
        headers.forEach((h, idx) => {
            if (idx < 3) return; // Skip #, Name, ADM No
            const matched = subjects.find(s => s.name === h || s.name.startsWith(h));
            if (matched) subjectColMap[idx] = matched.id;
        });

        const students = getStudentsForGrade(assessment.grade);
        let matchedCount = 0;

        lines.slice(1).forEach(line => {
            const cells = line.split(',').map(c => c.replace(/"/g, '').trim());
            const admNo = cells[2] || '';
            const student = students.find(s => s.reg === admNo || s.idNumber === admNo);
            if (!student) return;

            Object.entries(subjectColMap).forEach(([colIdx, subId]) => {
                const score = parseInt(cells[parseInt(colIdx)]);
                if (!isNaN(score) && score >= 0 && score <= 100) {
                    const key = `${student.id}_${subId}`;
                    if (!assessment.scores) assessment.scores = {};
                    assessment.scores[key] = {
                        score: score,
                        studentId: student.id,
                        subjectId: subId,
                        updatedAt: Date.now()
                    };
                    matchedCount++;
                }
            });
        });

        saveData();
        closeModal('batchUploadModal');
        loadBatchGrid(); // Refresh the grid
        showToast(`${matchedCount} scores imported successfully`);
    };
    reader.readAsText(fileInput.files[0]);
}

// ── EXPORT / IMPORT (Command Bar) ──
function examExportExcel() {
    const assessments = getAssessments();
    if (assessments.length === 0) {
        showToast('No assessments to export', 'error');
        return;
    }

    let csv = 'Name,Type,Grade,Term,Status,Subjects,Students,Scored %,Created\n';
    assessments.forEach(a => {
        const studentCount = getStudentsForGrade(a.grade).length;
        const subjectCount = (a.subjects || []).length;
        const scoredCount = getScoredCount(a);
        const progressPct = (studentCount * subjectCount) > 0 ? Math.round((scoredCount / (studentCount * subjectCount)) * 100) : 0;
        const subNames = (a.subjects || []).map(sId => getSubjectName(sId)).join('; ');
        const created = a.createdAt ? new Date(a.createdAt).toLocaleDateString() : '';

        csv += `"${a.name}","${a.assessType}","${a.grade}","${a.term}","${a.status}","${subNames}",${studentCount},${progressPct}%,"${created}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `assessments_export_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    showToast('Assessments exported');
}

function examImportScores() {
    populateImportDropdowns();
    openModal('importScoresModal');
}

function populateImportDropdowns() {
    const assessSelect = $('importAssessSelect');
    if (!assessSelect) return;

    const assessments = getAssessments();
    assessSelect.innerHTML = '<option value="">Select assessment...</option>' +
        assessments.map(a => `<option value="${a.id}">${escapeHtml(a.name)} — ${a.grade}</option>`).join('');

    // Subject dropdown updates on assessment change
    assessSelect.onchange = function () {
        const assessment = getAssessmentById(this.value);
        const subjectSelect = $('importSubjectSelect');
        if (!subjectSelect || !assessment) {
            if (subjectSelect) subjectSelect.innerHTML = '<option value="">Select subject...</option>';
            return;
        }
        subjectSelect.innerHTML = '<option value="">Select subject...</option>' +
            (assessment.subjects || []).map(subId => {
                const sub = getSubjectById(subId);
                return sub ? `<option value="${sub.id}">${escapeHtml(sub.name)}</option>` : '';
            }).join('');
    };
}

function processImportedScores() {
    const assessId = getVal('importAssessSelect');
    const subjectId = getVal('importSubjectSelect');
    const fileInput = $('importFileInput');

    if (!assessId || !subjectId) {
        showToast('Please select assessment and subject', 'error');
        return;
    }
    if (!fileInput || !fileInput.files[0]) {
        showToast('Please select a file', 'error');
        return;
    }

    const assessment = getAssessmentById(assessId);
    if (!assessment) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const text = e.target.result;
        const lines = text.split('\n').filter(l => l.trim());
        if (lines.length < 2) {
            showToast('File appears empty', 'error');
            return;
        }

        const students = getStudentsForGrade(assessment.grade);
        let imported = 0;

        lines.slice(1).forEach(line => {
            const cells = line.split(',').map(c => c.replace(/"/g, '').trim());
            const admNo = cells[0] || '';
            const score = parseInt(cells[1]);

            if (isNaN(score) || score < 0 || score > 100) return;

            const student = students.find(s => s.reg === admNo || s.idNumber === admNo);
            if (!student) return;

            const key = `${student.id}_${subjectId}`;
            if (!assessment.scores) assessment.scores = {};
            assessment.scores[key] = {
                score: score,
                studentId: student.id,
                subjectId: subjectId,
                updatedAt: Date.now()
            };
            imported++;
        });

        saveData();
        closeModal('importScoresModal');
        showToast(`${imported} scores imported successfully`);
    };
    reader.readAsText(fileInput.files[0]);
}

// ==========================================================================
//   DATA CLEANUP — Purge Broken Assessments
// ==========================================================================
function purgeBrokenAssessments() {
    if (!confirm('⚠️ This will permanently delete ALL assessment records and their scores.\n\nStudents, staff, settings, and learning areas will NOT be affected.\n\nContinue?')) return;

    const before = store.exams.filter(e => e.type === 'assessment').length;
    const brokenCount = store.exams.filter(e =>
        e.type === 'assessment' &&
        (!e.subjects || !Array.isArray(e.subjects) || e.subjects.length === 0)
    ).length;

    // Remove all assessments
    store.exams = store.exams.filter(e => e.type !== 'assessment');

    // Force clean save
    localStorage.removeItem('elimutrack_backup');
    saveData();

    showToast(`Purged ${before} assessments (${brokenCount} were broken). Page will reload...`, 'success');

    setTimeout(() => {
        localStorage.removeItem('elimutrack_backup');
        window.location.reload();
    }, 1500);
}

// Also auto-fix the NaN bug for any future assessments that slip through
function patchAssessmentIntegrity() {
    let patched = 0;
    (store.exams || []).forEach(exam => {
        if (exam.type === 'assessment') {
            // Ensure subjects is always an array
            if (!Array.isArray(exam.subjects)) {
                exam.subjects = [];
                patched++;
            }
            // Ensure scores object exists
            if (!exam.scores || typeof exam.scores !== 'object') {
                exam.scores = {};
                patched++;
            }
            // Ensure required fields exist
            if (!exam.status) exam.status = 'draft';
            if (!exam.assessType) exam.assessType = 'End Term';
            if (!exam.virtualId) exam.virtualId = exam.id || generateId();
        }
    });
    if (patched > 0) {
        console.log(`Patched ${patched} assessments for integrity`);
        saveData();
    }
    return patched;
}



// ==========================================================================
//   REPORTS CENTER — CBC Harmonized with Assessment Section
// ==========================================================================
// ==========================================================================
//   REPORTS CENTER ENGINE — Full Implementation
// ==========================================================================

const rptState = {
    currentType: null,
    selectedStudentId: null,
    selectedAssessId: null
};

// ── Shared helpers (used by both Assessment and Reports) ──
function getSubjectName(subjectId) {
    if (!subjectId) return '';
    const la = (store.learningAreas || []).find(l => l.id === subjectId);
    return la ? la.name : subjectId;
}

function getApplicableLearningAreas(grade) {
    return (store.learningAreas || []).filter(la => la.applicableLevels && la.applicableLevels.includes(grade));
}

// ── Matches subject ID, Name, or Code reliably ──
function resolveLaId(scoreRecord, applicableAreas) {
    if (!scoreRecord || !applicableAreas || !applicableAreas.length) return null;
    const subId = (scoreRecord.subjectId || scoreRecord.learningAreaId || '').trim();
    if (!subId) return null;
    
    let la = applicableAreas.find(l => l.id === subId);
    if (la) return la.id;
    
    const lower = subId.toLowerCase();
    la = applicableAreas.find(l => l.id.toLowerCase() === lower);
    if (la) return la.id;
    
    la = applicableAreas.find(l => l.name.trim().toLowerCase() === lower);
    if (la) return la.id;
    
    la = applicableAreas.find(l => l.code && l.code.trim().toLowerCase() === lower);
    if (la) return la.id;

    const globalLa = (store.learningAreas || []).find(l => 
        l.id === subId || l.name.trim().toLowerCase() === lower || (l.code && l.code.trim().toLowerCase() === lower)
    );
    if (globalLa) {
        const match = applicableAreas.find(a => a.id === globalLa.id);
        if (match) return match.id;
    }
    return null;
}

// ── Fetches scores safely even if 'grade' or 'term' fields are missing from the record ──
function getStudentScoresDirect(studentId, studentGrade) {
    if (!studentId) return [];
    const gradeStr = (studentGrade || '').toString().trim().toLowerCase();
    
    return flattenExams().filter(e => {
        if (e.studentId !== studentId) return false;
        if (!e.score || parseFloat(e.score) <= 0) return false;
        
        const eGrade = (e.grade || '').toString().trim().toLowerCase();
        if (eGrade && eGrade !== gradeStr) return false;
        
        return true;
    });
}
// ── UNPACKS NESTED VIRTUAL SCORES INTO FLAT RECORDS ──
function flattenExams() {
    const flat = [];
    (store.exams || []).forEach(e => {
        // If it's a properly flat record with a valid score, use it directly
        if (e.studentId && e.score != null && parseFloat(e.score) > 0) {
            flat.push(e);
            return;
        }
        // If it's a wrapper record with a nested scores map, unpack it
        if (e.scores && typeof e.scores === 'object' && Object.keys(e.scores).length > 0) {
            Object.values(e.scores).forEach(s => {
                if (s && s.score != null && parseFloat(s.score) > 0) {
                    flat.push({
                        ...s,
                        grade: e.grade || s.grade,
                        term: e.term || s.term,
                        year: e.year || s.year,
                        assessId: e.id,
                        assessType: e.assessType || s.assessType,
                        assessName: e.name
                    });
                }
            });
        }
    });
    return flat;
}
// ── Entry point called by router ──
function renderReportsAnalytics() {
    populateReportFilters();
    showReportTypeGrid();
    wireDownloadButtons();

}

function showReportTypeGrid() {
    const preview = $('reportsPreviewArea');
    const empty = $('reportsEmptyState');
    if (preview) preview.style.display = 'none';
    if (empty) empty.style.display = '';
    // Reset all preview panels
    ['reportIndividualPreview','reportClassPreview','reportSubjectPreview',
     'reportTermPreview','reportCompetencyPreview','reportAttendancePreview'].forEach(id => {
        const el = $(id); if (el) el.style.display = 'none';
    });
}

// ── Filter population — mirrors Assessment filter patterns ──
function populateReportFilters() {
    // Grade: use BAND_GRADE_MAP optgroups (same as Assessment)
    const gradeSelect = $('reportGradeFilter');
    if (gradeSelect) {
        const cur = gradeSelect.value;
        gradeSelect.innerHTML = '<option value="all">All Grades</option>';
        ['pp','lower','middle','jss'].forEach(band => {
            const grades = BAND_GRADE_MAP[band];
            const label = CBC_LEVELS[grades[0]]?.type || band;
            const og = document.createElement('optgroup');
            og.label = label;
            grades.forEach(g => {
                const o = document.createElement('option');
                o.value = g; o.textContent = CBC_LEVELS[g]?.name || g;
                og.appendChild(o);
            });
            gradeSelect.appendChild(og);
        });
        gradeSelect.value = cur || 'all';
    }

    // Term
    const termSelect = $('reportTermFilter');
    if (termSelect) {
        const cur = termSelect.value;
        termSelect.innerHTML = '<option value="all">All Terms</option>';
        ['Term 1','Term 2','Term 3'].forEach(t => {
            termSelect.innerHTML += `<option value="${t}">${t}</option>`;
        });
        termSelect.value = cur || store.settings.currentTerm || 'Term 1';
    }

    // Year
    const yearSelect = $('reportYearFilter');
    if (yearSelect) {
        const cur = yearSelect.value;
        yearSelect.innerHTML = '<option value="all">All Years</option>';
        const cy = parseInt(store.settings.academicYear) || new Date().getFullYear();
        for (let y = cy + 1; y >= cy - 5; y--) {
            yearSelect.innerHTML += `<option value="${y}" ${y == cy ? 'selected' : ''}>${y}</option>`;
        }
        yearSelect.value = cur || String(cy);
    }

    // Assessment dropdown — derived from store.exams (same source as Assessment tab)
    refreshReportAssessmentDropdown();
}

function refreshReportAssessmentDropdown() {
    const sel = $('reportExamFilter');
    if (!sel) return;
    const grade = $('reportGradeFilter')?.value || 'all';
    const term = $('reportTermFilter')?.value || 'all';
    const year = $('reportYearFilter')?.value || 'all';

    const map = {};
    (store.exams || []).forEach(e => {
        // Try ALL known ID field variants — don't skip if missing
        let aid = e.assessId || e.examId || e.assessmentId || e.scheduleId;
        
        // If no explicit ID exists, synthesize one from name+type+grade+term+year
        if (!aid) {
            const name = e.assessName || e.examName || e.name || '';
            const type = e.assessType || e.examType || e.type || '';
            const g = e.grade || '';
            const t = e.term || '';
            const y = e.year || '';
            aid = `${name}__${type}__${g}__${t}__${y}`;
        }

        // Skip truly empty entries (no name, no score, nothing useful)
        if (!e.assessName && !e.examName && !e.name && !e.subjectId && !e.score) return;

        if (!map[aid]) {
            map[aid] = {
                id: aid,
                name: e.assessName || e.examName || e.name || 'Unnamed Assessment',
                type: e.assessType || e.examType || e.type || '',
                grade: e.grade,
                term: e.term,
                year: e.year
            };
        }
    });

    let list = Object.values(map);
    if (grade !== 'all') list = list.filter(a => a.grade === grade);
    if (term !== 'all') list = list.filter(a => a.term === term);
    if (year !== 'all') list = list.filter(a => String(a.year) === String(year));
    list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    const prev = sel.value;
    sel.innerHTML = '<option value="all">All Assessments</option>';
    list.forEach(a => {
        const label = `${a.name}${a.type ? ' (' + a.type + ')' : ''}${a.grade ? ' — ' + a.grade : ''}`;
        sel.innerHTML += `<option value="${escapeHtml(a.id)}">${escapeHtml(label)}</option>`;
    });
    sel.value = prev || 'all';
}
// ── Shared score filtering pipeline (same as Assessment analysis) ──
function getFilteredScores(overrides = {}) {
    const grade  = overrides.grade  ?? ($('reportGradeFilter')?.value || 'all');
    const term   = overrides.term   ?? ($('reportTermFilter')?.value || 'all');
    const year   = overrides.year   ?? ($('reportYearFilter')?.value || 'all');
    const aId    = overrides.assessId ?? ($('reportExamFilter')?.value || 'all');
    const sId    = overrides.studentId ?? null;

    // CRITICAL FIX: Use flattenExams() instead of (store.exams || [])
    let scores = flattenExams();
    if (grade !== 'all') scores = scores.filter(e => (e.grade || '').toString().trim().toLowerCase() === grade.toLowerCase().trim());
    if (term !== 'all')  scores = scores.filter(e => (e.term || '').toString().trim().toLowerCase() === term.toLowerCase().trim());
    if (year !== 'all')  scores = scores.filter(e => String(e.year) === String(year));
    if (aId !== 'all')   scores = scores.filter(e => (e.assessId || e.examId) === aId);
    if (sId)             scores = scores.filter(e => e.studentId === sId);
    return scores;
}
function bestScorePerSubject(scores) {
    const map = {};
    scores.forEach(s => {
        const sid = s.subjectId;
        if (!sid) return;
        if (!map[sid] || parseFloat(s.score) > parseFloat(map[sid].score)) {
            map[sid] = s;
        }
    });
    return map;
}

function countRatings(scores) {
    const rc = { EE: 0, ME: 0, AE: 0, BE: 0 };
    scores.forEach(e => { rc[cbcRating(parseFloat(e.score)).code]++; });
    return rc;
}

// ═══════════════════════════════════════════════════════════════
//   MAIN REPORT ROUTER
// ═══════════════════════════════════════════════════════════════
function buildReport(type) {
    $('reportsPreviewArea').style.display = '';
    $('reportsEmptyState').style.display = 'none';

    const panels = {
        individual: 'reportIndividualPreview',
        class: 'reportClassPreview',
        subject: 'reportSubjectPreview',
        term: 'reportTermPreview',
        competency: 'reportCompetencyPreview',
        attendance: 'reportAttendancePreview'
    };
    Object.values(panels).forEach(id => { const el = $(id); if (el) el.style.display = 'none'; });

    const titles = {
        individual: 'Individual Report Card', class: 'Class Performance Report',
        subject: 'Subject Analysis Report', term: 'Term Summary Report',
        competency: 'Competency Progress Report', attendance: 'Attendance Report'
    };
    setText('reportsPreviewTitle', titles[type] || 'Report Preview');

    const panel = $(panels[type]);
    if (panel) panel.style.display = '';

    switch (type) {
        case 'individual':
            fillSchoolBanner('reportSchoolLogo', 'rshLogoPlaceholder', 'reportSchoolName', 'reportSchoolMotto', 'reportSchoolAddress');
            setText('reportTermLabel', ($('reportTermFilter')?.value || 'all') === 'all' ? 'All Terms' : $('reportTermFilter').value);
            setText('reportYearLabel', ($('reportYearFilter')?.value || 'all') === 'all' ? 'All Years' : $('reportYearFilter').value);
            populateReportLearnerSelect();
            break;
        case 'class':     generateClassReport(); break;
        case 'subject':   populateReportSubjectSelect(); generateSubjectReport(); break;
        case 'term':      generateTermSummaryReport(); break;
        case 'competency':generateCompetencyReport(); break;
        case 'attendance':generateAttendanceReport(); break;
    }
}

function fillSchoolBanner(logoId, placeholderId, nameId, mottoId, addrId) {
    const s = store.settings;
    const logo = $(logoId), ph = $(placeholderId);
    if (logo && s.logo) { logo.src = s.logo; logo.style.display = ''; if (ph) ph.style.display = 'none'; }
    else if (ph) ph.style.display = '';
    setText(nameId, s.schoolName || 'FRIENDS TANDE PRIMARY & JS');
    setText(mottoId, s.motto || '');
    setText(addrId, `${s.address || ''} · ${s.phone || ''} · ${s.email || ''}`);
}

function getFilterLabel(id, fallback) {
    const v = $(id)?.value;
    return (v && v !== 'all') ? v : fallback;
}

// ═══════════════════════════════════════════════════════════════
//   4A. INDIVIDUAL REPORT CARD
// ═══════════════════════════════════════════════════════════════
function populateReportLearnerSelect() {
    const sel = $('reportLearnerSelect');
    if (!sel) return;
    const grade = $('reportGradeFilter')?.value || 'all';
    let students = StudentRepo.getAll();
    if (grade !== 'all') students = students.filter(s => s.grade === grade);

    // Use DIRECT fetch for accurate score counts
    const cntMap = {};
    students.forEach(st => {
        const sc = getStudentScoresDirect(st.id, st.grade);
        if (sc.length > 0) cntMap[st.id] = sc.length;
    });
    
    students.sort((a, b) => {
        const d = (cntMap[b.id] || 0) - (cntMap[a.id] || 0);
        return d !== 0 ? d : (a.name || '').localeCompare(b.name || '');
    });

    sel.innerHTML = '<option value="">-- Choose a learner --</option>';
    students.forEach(s => {
        const c = cntMap[s.id] || 0;
        const tag = c > 0 ? `  [${c} score${c > 1 ? 's' : ''}]` : '';
        sel.innerHTML += `<option value="${s.id}">${escapeHtml(s.name)} — ${escapeHtml(s.grade || '')} ${s.stream ? escapeHtml(s.stream) : ''}${tag}</option>`;
    });

    const page = $('individualReportPage');
    if (page) page.style.display = 'none';
}
function generateIndividualReport() {
    const sel = $('reportLearnerSelect');
    if (!sel || !sel.value) { showToast('Select a learner first.', 'error'); return; }
    const student = StudentRepo.getById(sel.value);
    if (!student) { showToast('Learner not found.', 'error'); return; }

    const page = $('individualReportPage');
    if (page) page.style.display = '';

    const areas = getApplicableLearningAreas(student.grade);

    // Use direct fetcher — bypasses strict dropdowns, tolerates missing grade fields
    const scores = getStudentScoresDirect(student.id, student.grade);

    const types = [...new Set(scores.map(e => e.assessType || e.examType || 'Assessment'))].sort();
    const multiCol = types.length > 1;

    // Build lookup using the universal subject resolver
    const lookup = {};
    scores.forEach(sc => {
        const laId = resolveLaId(sc, areas);
        if (!laId) return; 
        const tk = sc.assessType || sc.examType || 'Assessment';
        if (!lookup[laId]) lookup[laId] = {};
        if (!lookup[laId][tk] || parseFloat(sc.score) > parseFloat(lookup[laId][tk].score)) {
            lookup[laId][tk] = sc;
        }
    });

    const head = $('individualReportHead');
    if (head) {
        let h = '<tr><th style="width:30px">#</th><th>Learning Area</th><th style="width:55px">Code</th>';
        if (multiCol) types.forEach(t => { h += `<th style="text-align:center;min-width:65px">${escapeHtml(t)}</th>`; });
        h += '<th style="text-align:center;min-width:65px">Score</th><th style="text-align:center;min-width:75px">Rating</th></tr>';
        head.innerHTML = h;
    }

    const body = $('individualReportBody');
    let totalSc = 0, assessedN = 0;

    if (body) {
        body.innerHTML = areas.map((la, i) => {
            const em = lookup[la.id] || {};
            let best = 0;
            if (multiCol) {
                types.forEach(t => { if (em[t]) { const sc = parseFloat(em[t].score); if (sc > best) best = sc; } });
            } else {
                const k = types[0] || 'Assessment';
                if (em[k]) best = parseFloat(em[k].score);
            }
            const r = best > 0 ? cbcRating(best) : null;
            if (best > 0) { totalSc += best; assessedN++; }

            let cells = `<td>${i + 1}</td><td>${escapeHtml(la.name)}</td><td style="font-size:11px;color:#64748b">${escapeHtml(la.code)}</td>`;
            if (multiCol) {
                types.forEach(t => {
                    const e = em[t]; const sc = e ? parseFloat(e.score) : 0;
                    const rr = sc > 0 ? cbcRating(sc) : null;
                    cells += `<td style="text-align:center">${rr ? `<span style="color:${rr.color};font-weight:600;font-size:12px">${sc}%</span>` : '<span style="color:#cbd5e1">—</span>'}</td>`;
                });
            }
            cells += `<td style="text-align:center;font-weight:600">${best > 0 ? best + '%' : '<span style="color:#cbd5e1">—</span>'}</td>`;
            cells += `<td style="text-align:center">${r ? `<span style="display:inline-block;padding:2px 12px;border-radius:20px;font-weight:700;font-size:11px;background:${r.color}15;color:${r.color}">${r.code}</span>` : '<span style="color:#cbd5e1">—</span>'}</td>`;
            return `<tr>${cells}</tr>`;
        }).join('');
    }

    const foot = $('individualReportFoot');
    if (foot) {
        const avg = assessedN > 0 ? Math.round(totalSc / assessedN) : 0;
        const or = avg > 0 ? cbcRating(avg) : null;
        const cs = 3 + (multiCol ? types.length : 0);
        foot.innerHTML = `<tr style="background:#f8fafc;font-weight:700">
            <td colspan="${cs}" style="text-align:right;padding-right:14px">Overall Average</td>
            <td style="text-align:center;color:${or ? or.color : '#94a3b8'};font-size:15px">${avg > 0 ? avg + '%' : '—'}</td>
            <td style="text-align:center">${or ? `<span style="display:inline-block;padding:2px 12px;border-radius:20px;font-weight:700;font-size:11px;background:${or.color}15;color:${or.color}">${or.code}</span>` : '—'}</td>
        </tr>`;
    }

    setText('rptLearnerName', student.name || '---');
    setText('rptLearnerAdm', student.reg || 'N/A');
    setText('rptLearnerGrade', student.grade || '---');
    setText('rptLearnerStream', student.stream || 'N/A');
    setText('rptLearnerGender', student.gender || '---');

    if (student.dob) {
        const age = Math.floor((Date.now() - new Date(student.dob).getTime()) / 31557600000);
        setText('rptLearnerAge', age > 0 ? age + ' yrs' : '---');
    } else { setText('rptLearnerAge', '---'); }

    const rank = computeRank(student);
    setText('rptLearnerPosition', rank.pos);
    setText('rptOutOf', rank.total);

    const areasAssessed = areas.filter(la => lookup[la.id]).length;
    const allBest = areas.map(la => {
        const em = lookup[la.id] || {}; let b = 0;
        Object.values(em).forEach(e => { const sc = parseFloat(e.score); if (sc > b) b = sc; });
        return b;
    }).filter(v => v > 0);
    const avg2 = allBest.length > 0 ? Math.round(allBest.reduce((a, b) => a + b, 0) / allBest.length) : 0;
    const or2 = avg2 > 0 ? cbcRating(avg2) : null;
    setText('rptTotalAvg', avg2 > 0 ? avg2 + '%' : '0%');
    setText('rptOverallRating', or2 ? or2.code : '—');
    setText('rptSubjectsAssessed', `${areasAssessed}/${areas.length}`);

    setText('rptTeacherRemarks', autoRemark(or2 ? or2.code : null));
    setText('rptHeadRemarks', headRemark(or2 ? or2.code : null));
    setText('rptReportDate', new Date().toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' }));
}

function computeRank(student) {
    const studentGradeStr = (student.grade || '').toString().trim().toLowerCase();
    const areas = getApplicableLearningAreas(student.grade);
    let peers = StudentRepo.getAll().filter(s => 
        (s.grade || '').toString().trim().toLowerCase() === studentGradeStr
    );

    const avgs = peers.map(s => {
        const sc = getStudentScoresDirect(s.id, student.grade);
        const bp = {};
        sc.forEach(score => {
            const laId = resolveLaId(score, areas);
            if (!laId) return;
            if (!bp[laId] || parseFloat(score.score) > parseFloat(bp[laId].score)) bp[laId] = score;
        });
        const vals = Object.values(bp).map(e => parseFloat(e.score));
        return { id: s.id, avg: vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0 };
    }).filter(p => p.avg > 0).sort((a, b) => b.avg - a.avg);

    const idx = avgs.findIndex(p => p.id === student.id);
    if (idx === -1) return { pos: '—', total: avgs.length || '—' };
    return { pos: idx + 1, total: avgs.length };
}
function autoRemark(code) {
    return {
        EE: 'Excellent performance! The learner consistently exceeds expectations across learning areas and demonstrates deep understanding and creativity.',
        ME: 'Good progress. The learner meets expected competency levels in most areas. Continued practice and targeted support will sustain growth.',
        AE: 'The learner is approaching expected levels. Focused intervention, additional practice, and home-school collaboration are recommended.',
        BE: 'The learner requires significant support. Immediate intervention through remedial programs and parental engagement is strongly recommended.'
    }[code] || 'No assessment data recorded for this period. Ensure all learning areas have been assessed.';
}

function headRemark(code) {
    return { EE: 'Outstanding work! Keep it up.', ME: 'Good effort. Strive for excellence.', AE: 'More effort needed. Seek help from teachers.', BE: 'Must improve significantly. Parent-teacher conference required.' }[code] || 'Assessment data incomplete.';
}

// ═══════════════════════════════════════════════════════════════
//   4B. CLASS PERFORMANCE REPORT
// ═══════════════════════════════════════════════════════════════
function generateClassReport() {
    const grade = $('reportGradeFilter')?.value;
    if (!grade || grade === 'all') { showToast('Select a specific grade for class reports.', 'error'); return; }

    const s = store.settings;
    const term = getFilterLabel('reportTermFilter', 'All Terms');
    const year = getFilterLabel('reportYearFilter', s.academicYear || '2025');

    fillSchoolBanner(null, null, 'classReportSchoolName', null, null);
    setText('classReportPeriodLabel', `${term} — ${year}`);
    setText('classReportSubtitle', `${CBC_LEVELS[grade]?.name || grade}`);

    const students = StudentRepo.getAll().filter(st => st.grade === grade);
    const areas = getApplicableLearningAreas(grade);

        // ═══ FIX: Use flattenExams() to unpack nested virtual scores ═══
    const gradeStr = grade.toString().trim().toLowerCase();
    const scores = flattenExams().filter(e => {
        const eGrade = (e.grade || '').toString().trim().toLowerCase();
        if (eGrade && eGrade !== gradeStr) return false;
        return true;
    });
    // ═══ FIX: Robust helper to get best scores per learning area for a set of scores ═══
    function getResolvedBestScores(scoreList) {
        const bp = {};
        scoreList.forEach(sc => {
            const laId = resolveLaId(sc, areas);
            if (!laId) return;
            if (!bp[laId] || parseFloat(sc.score) > parseFloat(bp[laId].score)) {
                bp[laId] = sc;
            }
        });
        return bp;
    }

    // Per-student averages for ranking
    const studentStats = students.map(st => {
        const stScores = scores.filter(e => e.studentId === st.id);
        const bp = getResolvedBestScores(stScores);
        const vals = Object.values(bp).map(e => parseFloat(e.score));
        const avg = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
        return { ...st, avg, areasDone: Object.keys(bp).length };
    }).filter(st => st.avg > 0).sort((a, b) => b.avg - a.avg);

    // Class KPIs
    setText('rcsTotal', students.length);
    const classMean = studentStats.length ? Math.round(studentStats.reduce((a, b) => a + b.avg, 0) / studentStats.length) : 0;
    setText('rcsMean', classMean + '%');
    setText('rcsHighest', studentStats.length ? studentStats[0].avg + '%' : '0%');
    setText('rcsLowest', studentStats.length ? studentStats[studentStats.length - 1].avg + '%' : '0%');

    // ── Subject Performance Table ──
    const subBody = $('classSubjectBody');
    if (subBody) {
        subBody.innerHTML = areas.map((la, i) => {
            // FIX: Filter using the universal resolver instead of strict ID match
            const laScores = scores.filter(e => resolveLaId(e, areas) === la.id);
            const bp = getResolvedBestScores(laScores);
            const vals = Object.values(bp).map(e => parseFloat(e.score));
            const mean = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
            const rc = countRatings(vals.map(v => ({ score: v })));
            return `<tr>
                <td>${i + 1}</td><td>${escapeHtml(la.name)}</td>
                <td style="text-align:center;font-weight:600">${mean > 0 ? mean + '%' : '—'}</td>
                <td style="text-align:center">${vals.length ? Math.max(...vals) + '%' : '—'}</td>
                <td style="text-align:center">${vals.length ? Math.min(...vals) + '%' : '—'}</td>
                <td style="text-align:center;color:#22c55e;font-weight:600">${rc.EE}</td>
                <td style="text-align:center;color:#3b82f6;font-weight:600">${rc.ME}</td>
                <td style="text-align:center;color:#f59e0b;font-weight:600">${rc.AE}</td>
                <td style="text-align:center;color:#ef4444;font-weight:600">${rc.BE}</td>
            </tr>`;
        }).join('') || '<tr><td colspan="9" style="text-align:center;padding:24px;color:#94a3b8">No assessment data for this grade.</td></tr>';
    }

    // ── Learner Rankings Table ──
    const rankBody = $('classRankingBody');
    if (rankBody) {
        rankBody.innerHTML = studentStats.map((st, i) => {
            const r = cbcRating(st.avg);
            return `<tr>
                <td style="text-align:center;font-weight:700">${i + 1}</td>
                <td>${escapeHtml(st.reg || '—')}</td>
                <td>${escapeHtml(st.name)}</td>
                <td>${escapeHtml(st.gender || '—')}</td>
                <td style="text-align:center;font-weight:600">${(st.avg * st.areasDone).toFixed(0)}</td>
                <td style="text-align:center;font-weight:700;color:${r.color}">${st.avg}%</td>
                <td style="text-align:center"><span style="display:inline-block;padding:2px 10px;border-radius:20px;font-weight:700;font-size:11px;background:${r.color}15;color:${r.color}">${r.code}</span></td>
            </tr>`;
        }).join('') || '<tr><td colspan="7" style="text-align:center;padding:24px;color:#94a3b8">No scored learners in this grade.</td></tr>';
    }
}
// ═══════════════════════════════════════════════════════════════
//   4C. SUBJECT ANALYSIS REPORT
// ═══════════════════════════════════════════════════════════════
function populateReportSubjectSelect() {
    const sel = $('reportSubjectSelect');
    if (!sel) return;
    const grade = $('reportGradeFilter')?.value;
    const areas = grade && grade !== 'all' ? getApplicableLearningAreas(grade) : store.learningAreas;
    const prev = sel.value;
    sel.innerHTML = '<option value="all">All Learning Areas</option>';
    areas.forEach(la => {
        sel.innerHTML += `<option value="${la.id}">${escapeHtml(la.name)} (${escapeHtml(la.code)})</option>`;
    });
    sel.value = prev || 'all';
}

function generateSubjectReport() {
    const s = store.settings;
    fillSchoolBanner(null, null, 'subjectReportSchoolName', null, null);

    const subjectId = $('reportSubjectSelect')?.value || 'all';
    const grade = $('reportGradeFilter')?.value || 'all';
    const term = getFilterLabel('reportTermFilter', 'All Terms');
    const year = getFilterLabel('reportYearFilter', s.academicYear || '2025');

    if (subjectId !== 'all') {
        const la = store.learningAreas.find(l => l.id === subjectId);
        setText('subjectReportTitle', 'SUBJECT ANALYSIS REPORT');
        setText('subjectReportSubtitle', `${la ? la.name : subjectId} — ${grade === 'all' ? 'All Grades' : (CBC_LEVELS[grade]?.name || grade)}`);
    } else {
        setText('subjectReportTitle', 'SUBJECT ANALYSIS REPORT');
        setText('subjectReportSubtitle', 'All Learning Areas — Overview');
    }

    let scores = getFilteredScores({ grade });
    if (subjectId !== 'all') scores = scores.filter(e => e.subjectId === subjectId);

    const rc = countRatings(scores);
    const vals = scores.map(e => parseFloat(e.score));
    const mean = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;

    setText('rssOverallMean', mean + '%');
    setText('rssEE', rc.EE);
    setText('rssME', rc.ME);
    setText('rssBelow', rc.AE + rc.BE);

    // ── Per-Grade Table ──
    const gBody = $('subjectGradeBody');
    if (gBody) {
        const grades = grade !== 'all' ? [grade] : Object.keys(CBC_LEVELS);
        gBody.innerHTML = grades.map(g => {
            const enrolled = StudentRepo.getAll().filter(st => st.grade === g).length;
            const gScores = scores.filter(e => e.grade === g);
            const assessed = new Set(gScores.map(e => e.studentId)).size;
            const gVals = gScores.map(e => parseFloat(e.score));
            const gMean = gVals.length ? Math.round(gVals.reduce((a, b) => a + b, 0) / gVals.length) : 0;
            const gRc = countRatings(gScores);
            return `<tr>
                <td>${CBC_LEVELS[g]?.name || g}</td>
                <td style="text-align:center">${enrolled}</td>
                <td style="text-align:center">${assessed}</td>
                <td style="text-align:center;font-weight:600">${gMean > 0 ? gMean + '%' : '—'}</td>
                <td style="text-align:center;color:#22c55e;font-weight:600">${gRc.EE}</td>
                <td style="text-align:center;color:#3b82f6;font-weight:600">${gRc.ME}</td>
                <td style="text-align:center;color:#f59e0b;font-weight:600">${gRc.AE}</td>
                <td style="text-align:center;color:#ef4444;font-weight:600">${gRc.BE}</td>
            </tr>`;
        }).join('');
    }

    // ── Score Distribution Table ──
    const dBody = $('subjectDistBody');
    if (dBody) {
        const ranges = [
            { label: '80–100 (EE)', min: 80, max: 100, color: '#22c55e' },
            { label: '50–79 (ME)', min: 50, max: 79, color: '#3b82f6' },
            { label: '30–49 (AE)', min: 30, max: 49, color: '#f59e0b' },
            { label: '0–29 (BE)', min: 0, max: 29, color: '#ef4444' }
        ];
        const total = vals.length || 1;
        dBody.innerHTML = ranges.map(r => {
            const cnt = vals.filter(v => v >= r.min && v <= r.max).length;
            const pct = Math.round((cnt / total) * 100);
            return `<tr>
                <td>${r.label}</td>
                <td style="text-align:center;font-weight:600">${cnt}</td>
                <td style="text-align:center">${pct}%</td>
                <td class="col-visual"><div style="height:8px;border-radius:4px;background:${r.color};width:${pct}%;min-width:2px;"></div></td>
            </tr>`;
        }).join('');
    }
}

// ═══════════════════════════════════════════════════════════════
//   4D. TERM SUMMARY REPORT
// ═══════════════════════════════════════════════════════════════
function generateTermSummaryReport() {
    const s = store.settings;
    fillSchoolBanner(null, null, 'termReportSchoolName', null, null);
    const term = getFilterLabel('reportTermFilter', 'All Terms');
    const year = getFilterLabel('reportYearFilter', s.academicYear || '2025');
    setText('termReportPeriod', `${term} — ${year}`);

    const allStudents = StudentRepo.getAll();
    const allScores = getFilteredScores();

    // ── Enrollment Table ──
    const eBody = $('termEnrollBody');
    let tMale = 0, tFemale = 0;
    if (eBody) {
        const bands = { 'Early Years': ['PP1', 'PP2'], 'Lower Primary': ['Grade 1', 'Grade 2', 'Grade 3'], 'Upper Primary': ['Grade 4', 'Grade 5', 'Grade 6'], 'Junior School': ['Grade 7', 'Grade 8', 'Grade 9'] };
        let rows = '';
        Object.entries(bands).forEach(([band, grades]) => {
            grades.forEach((g, gi) => {
                const gs = allStudents.filter(st => st.grade === g);
                const m = gs.filter(st => st.gender === 'Male').length;
                const f = gs.filter(st => st.gender === 'Female').length;
                tMale += m; tFemale += f;
                rows += `<tr>
                    <td>${gi === 0 ? band : ''}</td>
                    <td>${CBC_LEVELS[g]?.name || g}</td>
                    <td style="text-align:center">${m}</td>
                    <td style="text-align:center">${f}</td>
                    <td style="text-align:center;font-weight:600">${gs.length}</td>
                </tr>`;
            });
        });
        eBody.innerHTML = rows;
    }
    setText('termTotalMale', tMale);
    setText('termTotalFemale', tFemale);
    setText('termTotalAll', tMale + tFemale);

    // ── Academic Performance Table ──
    const aBody = $('termAcademicBody');
    if (aBody) {
        const allGrades = Object.keys(CBC_LEVELS);
        aBody.innerHTML = allGrades.map(g => {
            const enrolled = allStudents.filter(st => st.grade === g).length;
            const gScores = allScores.filter(e => e.grade === g);
            const assessed = new Set(gScores.map(e => e.studentId)).size;
            const vals = gScores.map(e => parseFloat(e.score));
            const mean = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
            const rc = countRatings(gScores);
            const completion = enrolled > 0 ? Math.round((assessed / enrolled) * 100) : 0;
            return `<tr>
                <td>${CBC_LEVELS[g]?.name || g}</td>
                <td style="text-align:center;font-weight:600">${mean > 0 ? mean + '%' : '—'}</td>
                <td style="text-align:center;color:#22c55e;font-weight:600">${rc.EE}</td>
                <td style="text-align:center;color:#3b82f6;font-weight:600">${rc.ME}</td>
                <td style="text-align:center;color:#f59e0b;font-weight:600">${rc.AE}</td>
                <td style="text-align:center;color:#ef4444;font-weight:600">${rc.BE}</td>
                <td style="text-align:center">${completion}%</td>
            </tr>`;
        }).join('');
    }

    // ── Attendance Table (placeholder — no attendance data model) ──
    const atBody = $('termAttendanceBody');
    if (atBody) {
        const allGrades = Object.keys(CBC_LEVELS);
        atBody.innerHTML = allGrades.map(g => {
            const enrolled = allStudents.filter(st => st.grade === g).length;
            return `<tr>
                <td>${CBC_LEVELS[g]?.name || g}</td>
                <td style="text-align:center">${enrolled}</td>
                <td style="text-align:center;color:#94a3b8">N/A</td>
                <td style="text-align:center;color:#94a3b8">N/A</td>
            </tr>`;
        }).join('');
    }

    // ── Highlights ──
    const hl = $('termHighlightsList');
    if (hl) {
        const totalAssessed = new Set(allScores.map(e => e.studentId)).size;
        const totalAreas = new Set(allScores.map(e => e.subjectId)).size;
        const overallMean = allScores.length ? Math.round(allScores.reduce((a, e) => a + parseFloat(e.score), 0) / allScores.length) : 0;
        const rc = countRatings(allScores);
        hl.innerHTML = `
            <li>Report generated on ${new Date().toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })}</li>
            <li>Total enrollment: <strong>${allStudents.length}</strong> learners across ${Object.keys(CBC_LEVELS).length} grades</li>
            <li>Learners with assessment data: <strong>${totalAssessed}</strong> (${allStudents.length > 0 ? Math.round(totalAssessed / allStudents.length * 100) : 0}% completion)</li>
            <li>Learning areas assessed: <strong>${totalAreas}</strong></li>
            <li>Overall mean score: <strong>${overallMean}%</strong> — ${overallMean > 0 ? cbcRating(overallMean).code + ' (' + cbcRating(overallMean).text + ')' : 'No data'}</li>
            <li>Competency distribution: <span style="color:#22c55e;font-weight:600">${rc.EE} EE</span> · <span style="color:#3b82f6;font-weight:600">${rc.ME} ME</span> · <span style="color:#f59e0b;font-weight:600">${rc.AE} AE</span> · <span style="color:#ef4444;font-weight:600">${rc.BE} BE</span></li>
            ${rc.BE > rc.EE ? '<li style="color:#ef4444;font-weight:600">⚠ Concern: More learners Below Expectation than Exceeding. Intervention recommended.</li>' : ''}
            ${rc.EE > rc.BE * 2 ? '<li style="color:#22c55e;font-weight:600">✓ Positive: Strong exceeding-performance ratio across the school.</li>' : ''}
        `;
    }
    setText('termReportDate', new Date().toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' }));
}

// ═══════════════════════════════════════════════════════════════
//   4E. COMPETENCY PROGRESS REPORT
// ═══════════════════════════════════════════════════════════════
function generateCompetencyReport() {
    const s = store.settings;
    fillSchoolBanner(null, null, 'competencyReportSchoolName', null, null);

    const grade = $('reportGradeFilter')?.value || 'all';
    const term = getFilterLabel('reportTermFilter', 'All Terms');
    const year = getFilterLabel('reportYearFilter', s.academicYear || '2025');
    setText('competencyReportSubtitle', `${grade === 'all' ? 'All Grades' : (CBC_LEVELS[grade]?.name || grade)} — ${term} ${year}`);

    // Get current and previous term scores
    const terms = ['Term 1', 'Term 2', 'Term 3'];
    const curTermIdx = terms.indexOf(term !== 'All Terms' ? term : s.currentTerm || 'Term 1');
    const prevTermIdx = Math.max(0, curTermIdx - 1);

    const curScores = getFilteredScores({ grade, term: terms[curTermIdx], year });
    const prevScores = getFilteredScores({ grade, term: terms[prevTermIdx], year });

    // Build per-student rating
    function studentRating(scores) {
        const byStudent = {};
        scores.forEach(e => {
            if (!byStudent[e.studentId]) byStudent[e.studentId] = [];
            byStudent[e.studentId].push(parseFloat(e.score));
        });
        const result = {};
        Object.entries(byStudent).forEach(([sid, vals]) => {
            const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
            result[sid] = cbcRating(avg).code;
        });
        return result;
    }

    const curRatings = studentRating(curScores);
    const prevRatings = studentRating(prevScores);
    const levelOrder = { BE: 0, AE: 1, ME: 2, EE: 3 };

    const mBody = $('competencyMovementBody');
    if (mBody) {
        const allStudentIds = new Set([...Object.keys(curRatings), ...Object.keys(prevRatings)]);
        const rows = [];
        allStudentIds.forEach(sid => {
            const student = StudentRepo.getById(sid);
            if (!student) return;
            if (grade !== 'all' && student.grade !== grade) return;

            const prev = prevRatings[sid] || 'N/A';
            const cur = curRatings[sid] || 'N/A';
            const pIdx = levelOrder[prev] ?? -1;
            const cIdx = levelOrder[cur] ?? -1;
            const movement = cIdx - pIdx;
            let trend = '', trendColor = '#94a3b8';
            if (movement > 0) { trend = '▲ Improved'; trendColor = '#22c55e'; }
            else if (movement < 0) { trend = '▼ Declined'; trendColor = '#ef4444'; }
            else if (cur !== 'N/A') { trend = '● Maintained'; trendColor = '#3b82f6'; }
            else { trend = '— New'; trendColor = '#94a3b8'; }

            rows.push(`<tr>
                <td>${escapeHtml(student.name)}</td>
                <td>${escapeHtml(student.reg || '—')}</td>
                <td style="text-align:center">${prev}</td>
                <td style="text-align:center;font-weight:700">${cur}</td>
                <td style="text-align:center;color:${trendColor};font-weight:600">${movement > 0 ? '+' : ''}${movement !== 0 || cur === 'N/A' ? movement : '0'}</td>
                <td style="text-align:center;color:${trendColor};font-size:12px">${trend}</td>
            </tr>`);
        });

        rows.sort((a, b) => {
            // Sort: declined first, then new, then maintained, then improved
            const getPriority = (html) => {
                if (html.includes('Declined')) return 0;
                if (html.includes('New')) return 1;
                if (html.includes('Maintained')) return 2;
                if (html.includes('Improved')) return 3;
                return 4;
            };
            return getPriority(a) - getPriority(b);
        });

        mBody.innerHTML = rows.length > 0 ? rows.join('') :
            '<tr><td colspan="6" style="text-align:center;padding:24px;color:#94a3b8">Need at least two terms of data to show progress. Select a specific term (not "All Terms") for best results.</td></tr>';
    }

    // ── Current Distribution ──
    const dBody = $('competencyDistBody');
    if (dBody) {
        const rc = countRatings(curScores);
        const total = curScores.length || 1;
        dBody.innerHTML = ['EE', 'ME', 'AE', 'BE'].map(code => {
            const labels = { EE: 'Exceeding Expectation', ME: 'Meeting Expectation', AE: 'Approaching Expectation', BE: 'Below Expectation' };
            const colors = { EE: '#22c55e', ME: '#3b82f6', AE: '#f59e0b', BE: '#ef4444' };
            const pct = Math.round((rc[code] / total) * 100);
            return `<tr>
                <td style="font-weight:600;color:${colors[code]}">${code} — ${labels[code]}</td>
                <td style="text-align:center;font-weight:600">${rc[code]}</td>
                <td style="text-align:center">${pct}%</td>
            </tr>`;
        }).join('');
    }
}

// ═══════════════════════════════════════════════════════════════
//   4F. ATTENDANCE REPORT
// ═══════════════════════════════════════════════════════════════
function generateAttendanceReport() {
    const s = store.settings;
    fillSchoolBanner(null, null, 'attendanceReportSchoolName', null, null);

    const grade = $('reportGradeFilter')?.value || 'all';
    const term = getFilterLabel('reportTermFilter', 'All Terms');
    setText('attendanceReportSubtitle', `${grade === 'all' ? 'All Grades' : (CBC_LEVELS[grade]?.name || grade)} — ${term}`);

    // No attendance data model exists yet — show placeholder
    setText('rasTotalDays', 'N/A');
    setText('rasAvgAttendance', 'N/A');
    setText('rasChronic', '0');
    setText('rasPerfect', '0');

    const dBody = $('attendanceDetailBody');
    if (dBody) {
        const students = grade !== 'all' ? StudentRepo.getAll().filter(st => st.grade === grade) : StudentRepo.getAll();
        dBody.innerHTML = students.slice(0, 20).map(st => `
            <tr>
                <td>${escapeHtml(st.reg || '—')}</td>
                <td>${escapeHtml(st.name)}</td>
                <td style="text-align:center;color:#94a3b8">N/A</td>
                <td style="text-align:center;color:#94a3b8">N/A</td>
                <td style="text-align:center;color:#94a3b8">N/A</td>
                <td style="text-align:center"><span style="font-size:11px;padding:2px 8px;border-radius:10px;background:#f1f5f9;color:#94a3b8;">No Data</span></td>
            </tr>
        `).join('') + (students.length > 20 ? `<tr><td colspan="6" style="text-align:center;padding:12px;color:#94a3b8">... and ${students.length - 20} more</td></tr>` : '');
    }

    const gBody = $('attendanceGradeBody');
    if (gBody) {
        gBody.innerHTML = Object.keys(CBC_LEVELS).map(g => {
            const enrolled = StudentRepo.getAll().filter(st => st.grade === g).length;
            return `<tr>
                <td>${CBC_LEVELS[g]?.name || g}</td>
                <td style="text-align:center">${enrolled}</td>
                <td style="text-align:center;color:#94a3b8">N/A</td>
                <td style="text-align:center;color:#94a3b8">N/A</td>
                <td style="text-align:center;color:#94a3b8">N/A</td>
            </tr>`;
        }).join('');
    }
}

// ═══════════════════════════════════════════════════════════════
//   REPORT EXPORT HELPERS
// ═══════════════════════════════════════════════════════════════
function printCurrentReport() {
    const visible = document.querySelector('.report-preview-content[style*="display:"]') ||
                    document.querySelector('.report-preview-content:not([style*="display: none"])');
    if (!visible) { showToast('No report to print.', 'error'); return; }

    const s = store.settings;
    const printWin = window.open('', '_blank', 'width=900,height=700');
    if (!printWin) { showToast('Pop-up blocked. Allow pop-ups for this site.', 'error'); return; }

    printWin.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Report — ${escapeHtml(s.schoolName)}</title>
    <style>
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;padding:20px;color:#1e293b;font-size:13px}
        @page{size:A4;margin:12mm}
        .report-school-header{display:flex;align-items:center;border-bottom:3px solid #22c55e;padding-bottom:12px;margin-bottom:14px}
        .rsh-logo{width:60px;height:60px;border-radius:8px;overflow:hidden;margin-right:14px;flex-shrink:0}
        .rsh-logo img{width:100%;height:100%;object-fit:cover}
        .rsh-logo-placeholder{width:60px;height:60px;border-radius:8px;background:#f0fdf4;display:flex;align-items:center;justify-content:center;color:#22c55e;font-size:24px}
        .rsh-info h2{font-size:18px;font-weight:700}
        .rsh-info p{font-size:11px;color:#64748b;margin-top:2px}
        .report-title-block{text-align:center;margin:14px 0 16px}
        .report-title-block h3{font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#334155}
        .report-title-block p{font-size:12px;color:#64748b;margin-top:4px}
        .report-learner-info{margin-bottom:14px}
        .rli-row{display:grid;grid-template-columns:repeat(4,1fr);gap:4px 16px;margin-bottom:6px}
        .rli-field label{font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:0.3px}
        .rli-field span{font-weight:600;font-size:13px}
        table{width:100%;border-collapse:collapse;margin-bottom:14px}
        thead th{background:#22c55e;color:#fff;padding:8px 10px;font-size:10px;text-transform:uppercase;letter-spacing:0.5px;text-align:left}
        tbody td{padding:7px 10px;border-bottom:1px solid #e2e8f0;font-size:12px}
        tbody tr:nth-child(even){background:#f8fafc}
        .report-competency-legend{display:flex;gap:16px;flex-wrap:wrap;margin-bottom:14px;font-size:11px;color:#475569}
        .report-performance-strip{display:flex;gap:20px;margin-bottom:14px;padding:10px;background:#f8fafc;border-radius:8px}
        .rps-label{font-size:10px;color:#64748b;text-transform:uppercase}
        .rps-value{font-size:16px;display:block;margin-top:2px}
        .report-remarks-section{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:18px}
        .rrs-block label{font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:0.3px}
        .rrs-block p{margin-top:4px;font-size:12px;line-height:1.6}
        .report-signature-area{display:grid;grid-template-columns:1fr 1fr 1fr;gap:40px;margin-top:40px}
        .rsa-line{border-top:1px solid #334155;margin-top:50px}
        .rsa-block span{display:block;text-align:center;font-size:11px;color:#475569;margin-top:6px}
        .report-class-summary{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:14px}
        .rcs-item{text-align:center;padding:10px;background:#f8fafc;border-radius:8px}
        .rcs-label{font-size:10px;color:#64748b;text-transform:uppercase}
        .rcs-value{font-size:20px;font-weight:700;display:block;margin-top:4px}
        .report-sub-heading{font-size:13px;font-weight:600;margin:14px 0 8px;color:#334155}
        .report-highlights-block{margin-bottom:14px}
        .report-highlights-list{padding-left:20px;font-size:12px;line-height:1.8;color:#475569}
        .col-visual{width:30%}
        @media print{body{padding:0}}
    </style></head><body>${visible.querySelector('.report-page')?.outerHTML || visible.innerHTML}</body></html>`);
    printWin.document.close();
    setTimeout(() => { printWin.print(); }, 400);
}

function exportReportPDF() {
    // Delegates to print — browser's "Save as PDF" in print dialog
    printCurrentReport();
}

function exportReportExcel() {
    // Build CSV from the currently visible table
    const visible = document.querySelector('.report-preview-content[style*="display:"]') ||
                    document.querySelector('.report-preview-content:not([style*="display: none"])');
    if (!visible) { showToast('No report to export.', 'error'); return; }

    const tables = visible.querySelectorAll('table.report-table');
    if (tables.length === 0) { showToast('No data table found in report.', 'error'); return; }

    let csv = '';
    tables.forEach((table, ti) => {
        if (ti > 0) csv += '\n\n';
        const rows = table.querySelectorAll('tr');
        rows.forEach(row => {
            const cells = row.querySelectorAll('th, td');
            const line = Array.from(cells).map(c => `"${c.textContent.trim().replace(/"/g, '""')}"`).join(',');
            csv += line + '\n';
        });
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported as CSV.', 'success');
}

// ═══════════════════════════════════════════════════════════════
//   LEGACY MODAL WIRING (individualReportModal, classReportModal, subjectReportModal)
// ═══════════════════════════════════════════════════════════════
function wireReportModals() {
    // ── Individual Modal ──
    const indSel = $('reportStudentSelect');
    if (indSel && indSel.options.length <= 1) {
        const scores = getFilteredScores();
        const cntMap = {};
        scores.forEach(e => { cntMap[e.studentId] = (cntMap[e.studentId] || 0) + 1; });
        let students = StudentRepo.getAll();
        students.sort((a, b) => (cntMap[b.id] || 0) - (cntMap[a.id] || 0) || (a.name || '').localeCompare(b.name || ''));
        students.forEach(s => {
            const c = cntMap[s.id] || 0;
            indSel.innerHTML += `<option value="${s.id}">${escapeHtml(s.name)} — ${escapeHtml(s.grade || '')} ${c > 0 ? '[' + c + ' scores]' : ''}</option>`;
        });
    }

    // Preview info on student select change
    indSel?.addEventListener('change', () => {
        const info = $('reportPreviewInfo');
        if (!info) return;
        if (!indSel.value) { info.textContent = 'Select a learner above to see a summary.'; return; }
        const st = StudentRepo.getById(indSel.value);
        if (!st) return;
        const sc = getFilteredScores({ studentId: st.id });
        const bp = bestScorePerSubject(sc);
        const vals = Object.values(bp).map(e => parseFloat(e.score));
        const avg = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
        const r = avg > 0 ? cbcRating(avg) : null;
        info.innerHTML = `<strong>${escapeHtml(st.name)}</strong> — ${escapeHtml(st.grade)} ${st.stream ? '· ' + escapeHtml(st.stream) : ''}<br>
            Areas assessed: <strong>${Object.keys(bp).length}</strong> &middot; Average: <strong style="color:${r ? r.color : '#94a3b8'}">${avg > 0 ? avg + '% (' + r.code + ')' : 'No data'}</strong>`;
    });

    // Generate from modal → switch to inline preview
    $('btnGenTranscriptReport')?.addEventListener('click', () => {
        if (!$('reportStudentSelect')?.value) { showToast('Select a learner.', 'error'); return; }
        closeModal('individualReportModal');
        buildReport('individual');
        setTimeout(() => {
            const sel = $('reportLearnerSelect');
            if (sel) sel.value = $('reportStudentSelect').value;
            generateIndividualReport();
        }, 100);
    });

    // ── Class Modal ──
    const classGradeSel = $('classReportGrade');
    if (classGradeSel && classGradeSel.options.length <= 1) {
        Object.keys(CBC_LEVELS).forEach(g => {
            classGradeSel.innerHTML += `<option value="${g}">${CBC_LEVELS[g].name}</option>`;
        });
    }

    classGradeSel?.addEventListener('change', () => {
        const g = classGradeSel.value;
        const preview = $('classReportPreview');
        const btn = $('btnGenClassList');
        if (!g) { if (preview) preview.style.display = 'none'; if (btn) btn.disabled = true; return; }
        const students = StudentRepo.getAll().filter(s => s.grade === g);
        const scores = getFilteredScores({ grade: g });
        const assessed = new Set(scores.map(e => e.studentId)).size;
        const vals = scores.map(e => parseFloat(e.score));
        const mean = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
        const stats = $('classReportStats');
        if (stats) stats.innerHTML = `
            <div><div style="font-size:22px;font-weight:700">${students.length}</div><div style="font-size:11px;color:#64748b">Enrolled</div></div>
            <div><div style="font-size:22px;font-weight:700;color:#22c55e">${assessed}</div><div style="font-size:11px;color:#64748b">Assessed</div></div>
            <div><div style="font-size:22px;font-weight:700;color:#3b82f6">${mean > 0 ? mean + '%' : 'N/A'}</div><div style="font-size:11px;color:#64748b">Mean Score</div></div>`;
        if (preview) preview.style.display = '';
        if (btn) btn.disabled = false;
    });

    $('btnGenClassList')?.addEventListener('click', () => {
        const g = $('classReportGrade')?.value;
        if (!g) return;
        closeModal('classReportModal');
        if ($('reportGradeFilter')) $('reportGradeFilter').value = g;
        refreshReportAssessmentDropdown();
        buildReport('class');
    });

    // ── Subject Modal ──
    const subGradeSel = $('subjectReportGrade');
    if (subGradeSel && subGradeSel.options.length <= 1) {
        Object.keys(CBC_LEVELS).forEach(g => {
            subGradeSel.innerHTML += `<option value="${g}">${CBC_LEVELS[g].name}</option>`;
        });
    }

    const subSubjectSel = $('subjectReportSubject');
    subGradeSel?.addEventListener('change', () => {
        const g = subGradeSel.value;
        subSubjectSel.innerHTML = '<option value="">Select subject...</option>';
        if (!g) { subSubjectSel.disabled = true; return; }
        subSubjectSel.disabled = false;
        const areas = getApplicableLearningAreas(g);
        areas.forEach(la => {
            subSubjectSel.innerHTML += `<option value="${la.id}">${escapeHtml(la.name)}</option>`;
        });
    });

    subSubjectSel?.addEventListener('change', () => {
        const sid = subSubjectSel.value;
        const preview = $('subjectReportPreview');
        const btn = $('btnGenSubjectList');
        if (!sid) { if (preview) preview.style.display = 'none'; if (btn) btn.disabled = true; return; }
        const scores = getFilteredScores({ grade: subGradeSel.value }).filter(e => e.subjectId === sid);
        const vals = scores.map(e => parseFloat(e.score));
        const mean = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
        const rc = countRatings(scores);
        const stats = $('subjectReportStats');
        if (stats) stats.innerHTML = `
            <div><div style="font-size:22px;font-weight:700">${new Set(scores.map(e => e.studentId)).size}</div><div style="font-size:11px;color:#64748b">Assessed</div></div>
            <div><div style="font-size:22px;font-weight:700;color:#3b82f6">${mean > 0 ? mean + '%' : 'N/A'}</div><div style="font-size:11px;color:#64748b">Mean</div></div>
            <div><div style="font-size:22px;font-weight:700;color:#22c55e">${rc.EE}</div><div style="font-size:11px;color:#64748b">EE</div></div>
            <div><div style="font-size:22px;font-weight:700;color:#ef4444">${rc.BE}</div><div style="font-size:11px;color:#64748b">BE</div></div>`;
        if (preview) preview.style.display = '';
        if (btn) btn.disabled = false;
    });

    $('btnGenSubjectList')?.addEventListener('click', () => {
        const g = $('subjectReportGrade')?.value;
        const sid = $('subjectReportSubject')?.value;
        if (!g || !sid) return;
        closeModal('subjectReportModal');
        if ($('reportGradeFilter')) $('reportGradeFilter').value = g;
        refreshReportAssessmentDropdown();
        buildReport('subject');
        setTimeout(() => {
            const sel = $('reportSubjectSelect');
            if (sel) sel.value = sid;
            generateSubjectReport();
        }, 100);
    });
}

// ═══════════════════════════════════════════════════════════════
//   REPORT EVENT LISTENERS — call from initGlobalListeners()
// ═══════════════════════════════════════════════════════════════
function initReportListeners() {
    // Filter cascades — same pattern as Assessment
    ['reportGradeFilter', 'reportTermFilter', 'reportYearFilter'].forEach(id => {
        $(id)?.addEventListener('change', () => {
            refreshReportAssessmentDropdown();
        });
    });

    // Back button
    $('reportsBackBtn')?.addEventListener('click', showReportTypeGrid);

    // Export buttons
    $('reportsPrintBtn')?.addEventListener('click', printCurrentReport);
    $('reportsExportPdfBtn')?.addEventListener('click', exportReportPDF);
    $('reportsExportExcelBtn')?.addEventListener('click', exportReportExcel);

    // Print All (from section header)
    $('reportsPrintAllBtn')?.addEventListener('click', () => {
        showToast('Select a specific report type first, then use Print.', 'info');
    });

    // Individual report: learner select + generate
    $('reportLearnerSelect')?.addEventListener('change', () => {
        const page = $('individualReportPage');
        if (page) page.style.display = 'none';
    });
    $('btnGenerateIndividual')?.addEventListener('click', generateIndividualReport);

    // Download grade reports (bulk)
    $('btnDownloadGradePDFs')?.addEventListener('click', () => {
        const grade = $('reportGradeFilter')?.value;
        if (!grade || grade === 'all') { showToast('Select a specific grade first.', 'error'); return; }
        const students = StudentRepo.getAll().filter(s => s.grade === grade);
        if (students.length === 0) { showToast('No learners in this grade.', 'error'); return; }
        showToast(`Generating ${students.length} report cards for ${CBC_LEVELS[grade]?.name || grade}...`, 'info');
        // Generate first student's report as PDF; in production this would loop
        buildReport('individual');
        setTimeout(() => {
            const sel = $('reportLearnerSelect');
            if (sel && sel.options.length > 1) {
                sel.value = sel.options[1].value;
                generateIndividualReport();
                setTimeout(printCurrentReport, 300);
            }
        }, 200);
    });

    // Subject analysis: subject select change
    $('reportSubjectSelect')?.addEventListener('change', generateSubjectReport);

    // Search filters the learner dropdown in individual report preview
 $('reportStudentSearch')?.addEventListener('input', debounce(e => {
    const q = e.target.value.toLowerCase();
    const sel = $('reportLearnerSelect');
    if (!sel) return;
    const grade = $('reportGradeFilter')?.value || 'all';

    // Rebuild dropdown options filtered by search + grade
    const scores = getFilteredScores();
    const cntMap = {};
    scores.forEach(s => { cntMap[s.studentId] = (cntMap[s.studentId] || 0) + 1; });

    let students = StudentRepo.getAll();
    if (grade !== 'all') students = students.filter(s => s.grade === grade);
    if (q) students = students.filter(s =>
        [s.name, s.reg, s.grade, s.stream, s.guardianName].join(' ').toLowerCase().includes(q)
    );
    students.sort((a, b) => (cntMap[b.id] || 0) - (cntMap[a.id] || 0) || (a.name || '').localeCompare(b.name || ''));

    const prev = sel.value;
    sel.innerHTML = '<option value="">-- Choose a learner --</option>';
    students.forEach(s => {
        const c = cntMap[s.id] || 0;
        const tag = c > 0 ? `  [${c} score${c > 1 ? 's' : ''}]` : '';
        sel.innerHTML += `<option value="${s.id}">${escapeHtml(s.name)} — ${escapeHtml(s.grade || '')} ${s.stream ? escapeHtml(s.stream) : ''}${tag}</option>`;
    });
    sel.value = prev; // preserve selection if still in list
}, 200));
    // Wire legacy modals
    wireReportModals();
}





// ═══════════════════════════════════════════════════════════════════════════
//   PDF DOWNLOAD ENGINE — Robust Version (no silent failures)
// ═══════════════════════════════════════════════════════════════════════════

async function ensureHtml2Pdf() {
    if (typeof html2pdf !== 'undefined') return true;
    return new Promise((resolve, reject) => {
        if (document.querySelector('script[src*="html2pdf"]')) {
            let tries = 0;
            const iv = setInterval(() => {
                tries++;
                if (typeof html2pdf !== 'undefined') { clearInterval(iv); resolve(true); }
                if (tries > 150) { clearInterval(iv); reject(new Error('Timeout loading PDF library')); }
            }, 100);
            return;
        }
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        s.onload = () => { console.log('[PDF] Library loaded'); resolve(true); };
        s.onerror = () => reject(new Error('Cannot load PDF library — check internet'));
        document.head.appendChild(s);
    });
}

// Convert logo URL to base64 to avoid CORS issues
async function logoToBase64(url) {
    if (!url) return null;
    try {
        const resp = await fetch(url, { mode: 'cors' });
        const blob = await resp.blob();
        return new Promise((res, rej) => {
            const reader = new FileReader();
            reader.onloadend = () => res(reader.result);
            reader.onerror = rej;
            reader.readAsDataURL(blob);
        });
    } catch (e) {
        console.warn('[PDF] Logo CORS blocked, skipping logo', e);
        return null;
    }
}

// Show a full-screen loading overlay so user sees progress
function showPdfOverlay(msg) {
    let ov = document.getElementById('pdfLoadingOverlay');
    if (!ov) {
        ov = document.createElement('div');
        ov.id = 'pdfLoadingOverlay';
        ov.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.55);display:flex;align-items:center;justify-content:center;backdrop-filter:blur(3px);';
        document.body.appendChild(ov);
    }
    ov.style.display = 'flex';
    ov.innerHTML = `
        <div style="background:white;border-radius:16px;padding:40px 50px;text-align:center;box-shadow:0 25px 60px rgba(0,0,0,0.3);max-width:380px;">
            <div style="width:48px;height:48px;border:4px solid #e2e8f0;border-top-color:#22c55e;border-radius:50%;animation:pdfspin 0.8s linear infinite;margin:0 auto 20px;"></div>
            <p id="pdfOverlayMsg" style="font-size:15px;font-weight:600;color:#1e293b;margin:0 0 6px 0;">${msg}</p>
            <p style="font-size:12px;color:#94a3b8;margin:0;">Please wait, do not close this tab...</p>
        </div>
        <style>@keyframes pdfspin{to{transform:rotate(360deg)}}</style>
    `;
}
function updatePdfOverlay(msg) {
    const el = document.getElementById('pdfOverlayMsg');
    if (el) el.textContent = msg;
}
function hidePdfOverlay() {
    const ov = document.getElementById('pdfLoadingOverlay');
    if (ov) ov.style.display = 'none';
}

// ═══════════════════════════════════════════════════════════════
//   BUILD REPORT HTML (returns a complete standalone string)
// ═══════════════════════════════════════════════════════════════
function buildIndividualReportHTML(studentId, logoBase64) {
    const student = StudentRepo.getById(studentId);
    if (!student) return '';
    const s = store.settings;
    const term = ($('reportTermFilter')?.value || 'all') === 'all' ? 'All Terms' : $('reportTermFilter').value;
    const year = ($('reportYearFilter')?.value || 'all') === 'all' ? 'All Years' : $('reportYearFilter').value;
    const areas = getApplicableLearningAreas(student.grade);

    // ═══ FIX: Uses shared helper that tolerates missing 'grade' fields in score records ═══
    const rawScores = getStudentScoresDirect(student.id, student.grade);

    // ═══ FIX: Uses shared helper that matches by ID, Name, or Code ═══
    const lookup = {};
    rawScores.forEach(sc => {
        const laId = resolveLaId(sc, areas);
        if (!laId) return;
        const tk = sc.assessType || sc.examType || 'Assessment';
        if (!lookup[laId]) lookup[laId] = {};
        if (!lookup[laId][tk] || parseFloat(sc.score) > parseFloat(lookup[laId][tk].score)) {
            lookup[laId][tk] = sc;
        }
    });

    const types = [...new Set(rawScores.map(e => e.assessType || e.examType || 'Assessment'))].sort();
    const multiCol = types.length > 1;

    let totalSc = 0, assessedN = 0;
    const rows = areas.map((la, i) => {
        const em = lookup[la.id] || {};
        let best = 0;
        if (multiCol) { types.forEach(t => { if (em[t]) { const v = parseFloat(em[t].score); if (v > best) best = v; } }); }
        else { const k = types[0] || 'Assessment'; if (em[k]) best = parseFloat(em[k].score); }
        const r = best > 0 ? cbcRating(best) : null;
        if (best > 0) { totalSc += best; assessedN++; }

        let cells = `<td style="padding:5px 6px;border-bottom:1px solid #e2e8f0;font-size:10px;text-align:center;">${i + 1}</td>
            <td style="padding:5px 6px;border-bottom:1px solid #e2e8f0;font-size:10px;text-align:left;">${escapeHtml(la.name)}</td>
            <td style="padding:5px 6px;border-bottom:1px solid #e2e8f0;font-size:9px;color:#64748b;text-align:center;">${escapeHtml(la.code || '')}</td>`;
        if (multiCol) types.forEach(t => {
            const e = em[t]; const v = e ? parseFloat(e.score) : 0; const rr = v > 0 ? cbcRating(v) : null;
            cells += `<td style="text-align:center;padding:5px 6px;border-bottom:1px solid #e2e8f0;font-size:10px;">${rr ? `<span style="color:${rr.color};font-weight:600">${v}%</span>` : '<span style="color:#cbd5e1">—</span>'}</td>`;
        });
        cells += `<td style="text-align:center;padding:5px 6px;border-bottom:1px solid #e2e8f0;font-weight:700;font-size:10px;">${best > 0 ? best + '%' : '<span style="color:#cbd5e1">—</span>'}</td>
            <td style="text-align:center;padding:5px 6px;border-bottom:1px solid #e2e8f0;font-size:10px;">${r ? `<span style="display:inline-block;padding:2px 10px;border-radius:10px;font-weight:700;font-size:9px;background:${r.color}20;color:${r.color}">${r.code}</span>` : '<span style="color:#cbd5e1">—</span>'}</td>`;
        return `<tr style="${i % 2 !== 0 ? 'background:#f8fafc;' : ''}">${cells}</tr>`;
    }).join('');

    const avg = assessedN ? Math.round(totalSc / assessedN) : 0;
    const or1 = avg > 0 ? cbcRating(avg) : null;
    const colSpan = 3 + (multiCol ? types.length : 0);

    const rank = computeRank(student);
    let ageText = '---';
    if (student.dob) { const a = Math.floor((Date.now() - new Date(student.dob).getTime()) / 31557600000); if (a > 0) ageText = a + ' yrs'; }
    const areasAssessed = areas.filter(la => lookup[la.id]).length;
    const allBest = areas.map(la => { const em = lookup[la.id] || {}; let b = 0; Object.values(em).forEach(e => { const v = parseFloat(e.score); if (v > b) b = v; }); return b; }).filter(v => v > 0);
    const avg2 = allBest.length ? Math.round(allBest.reduce((a, b) => a + b, 0) / allBest.length) : 0;
    const or2 = avg2 > 0 ? cbcRating(avg2) : null;

    const logoImg = logoBase64
        ? `<img src="${logoBase64}" style="width:52px;height:52px;border-radius:8px;object-fit:cover;margin-right:14px;">`
        : `<div style="width:52px;height:52px;border-radius:8px;background:linear-gradient(135deg,#dcfce7,#bbf7d0);display:flex;align-items:center;justify-content:center;color:#16a34a;font-size:22px;margin-right:14px;flex-shrink:0;border:1px solid #86efac;">&#127891;</div>`;

    return `<!DOCTYPE html><html><head><meta charset="UTF-8">
    <style>
        @page { size: A4; margin: 0; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .a4-page {
            width: 210mm;
            height: 297mm;
            padding: 12mm 15mm 10mm 15mm;
            background: #fff;
            color: #1e293b;
            overflow: hidden;
            position: relative;
            display: flex;
            flex-direction: column;
        }
        table { width: 100%; border-collapse: collapse; table-layout: fixed; }
    </style></head>
    <body>
    <div class="a4-page">
        
        <!-- 1. SCHOOL HEADER -->
        <div style="display:flex;align-items:center;border-bottom:3px solid #16a34a;padding-bottom:8px;margin-bottom:10px;flex-shrink:0;">
            ${logoImg}
            <div style="flex:1;">
                <h1 style="font-size:16px;font-weight:800;color:#1e293b;line-height:1.2;">${escapeHtml(s.schoolName || 'FRIENDS TANDE PRIMARY & JS')}</h1>
                ${s.motto ? `<p style="font-size:9px;color:#475569;font-style:italic;margin-top:2px;letter-spacing:0.5px;">${escapeHtml(s.motto)}</p>` : ''}
                <p style="font-size:8px;color:#64748b;margin-top:2px;">${escapeHtml([s.address, s.phone, s.email].filter(Boolean).join('  |  '))}</p>
            </div>
        </div>

        <!-- 2. REPORT TITLE -->
        <div style="text-align:center;margin-bottom:10px;flex-shrink:0;">
            <h2 style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:2.5px;color:#334155;">LEARNER REPORT CARD</h2>
            <p style="font-size:10px;color:#64748b;margin-top:3px;font-weight:500;">${escapeHtml(term)} — ${escapeHtml(year)}</p>
        </div>

        <!-- 3. LEARNER DETAILS -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 20px;margin-bottom:10px;padding:8px 12px;background:#f8fafc;border-radius:6px;border:1px solid #e2e8f0;flex-shrink:0;">
            <div style="display:flex;justify-content:space-between;"><span style="font-size:8px;color:#64748b;text-transform:uppercase;">Name:</span><span style="font-size:11px;font-weight:600;text-align:right;max-width:70%;">${escapeHtml(student.name || '---')}</span></div>
            <div style="display:flex;justify-content:space-between;"><span style="font-size:8px;color:#64748b;text-transform:uppercase;">Adm No:</span><span style="font-size:11px;font-weight:600;">${escapeHtml(student.reg || 'N/A')}</span></div>
            <div style="display:flex;justify-content:space-between;"><span style="font-size:8px;color:#64748b;text-transform:uppercase;">Grade:</span><span style="font-size:11px;font-weight:600;">${escapeHtml(student.grade || '---')}</span></div>
            <div style="display:flex;justify-content:space-between;"><span style="font-size:8px;color:#64748b;text-transform:uppercase;">Stream:</span><span style="font-size:11px;font-weight:600;">${escapeHtml(student.stream || 'N/A')}</span></div>
            <div style="display:flex;justify-content:space-between;"><span style="font-size:8px;color:#64748b;text-transform:uppercase;">Gender:</span><span style="font-size:11px;font-weight:600;">${escapeHtml(student.gender || '---')}</span></div>
            <div style="display:flex;justify-content:space-between;"><span style="font-size:8px;color:#64748b;text-transform:uppercase;">Age:</span><span style="font-size:11px;font-weight:600;">${ageText}</span></div>
            <div style="display:flex;justify-content:space-between;"><span style="font-size:8px;color:#64748b;text-transform:uppercase;">Position:</span><span style="font-size:11px;font-weight:700;color:#16a34a;">${rank.pos} out of ${rank.total}</span></div>
            <div style="display:flex;justify-content:space-between;"><span style="font-size:8px;color:#64748b;text-transform:uppercase;">Date:</span><span style="font-size:11px;font-weight:600;">${new Date().toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}</span></div>
        </div>

        <!-- 4. PERFORMANCE TABLE -->
        <div style="flex:1;display:flex;flex-direction:column;min-height:0;">
            <table>
                <thead>
                    <tr style="background:#16a34a;color:#fff;">
                        <th style="width:25px;padding:6px 4px;font-size:8px;text-transform:uppercase;letter-spacing:.5px;text-align:center;">#</th>
                        <th style="padding:6px;font-size:8px;text-transform:uppercase;letter-spacing:.5px;text-align:left;">Learning Area</th>
                        <th style="width:40px;padding:6px 4px;font-size:8px;text-transform:uppercase;letter-spacing:.5px;text-align:center;">Code</th>
                        ${multiCol ? types.map(t => `<th style="width:55px;padding:6px 4px;font-size:8px;text-transform:uppercase;letter-spacing:.5px;text-align:center;">${escapeHtml(t)}</th>`).join('') : ''}
                        <th style="width:50px;padding:6px 4px;font-size:8px;text-transform:uppercase;letter-spacing:.5px;text-align:center;">Score</th>
                        <th style="width:65px;padding:6px 4px;font-size:8px;text-transform:uppercase;letter-spacing:.5px;text-align:center;">Rating</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
                <tfoot>
                    <tr style="background:#f0fdf4;font-weight:800;border-top:2px solid #16a34a;">
                        <td colspan="${colSpan}" style="text-align:right;padding:6px 10px;font-size:11px;color:#334155;">OVERALL MEAN</td>
                        <td style="text-align:center;padding:6px 4px;font-size:13px;color:${or1 ? or1.color : '#94a3b8'};">${avg > 0 ? avg + '%' : '—'}</td>
                        <td style="text-align:center;padding:6px 4px;">${or1 ? `<span style="display:inline-block;padding:2px 12px;border-radius:10px;font-weight:800;font-size:10px;background:${or1.color}20;color:${or1.color}">${or1.code}</span>` : '—'}</td>
                    </tr>
                </tfoot>
            </table>
        </div>

        <!-- 5. COMPETENCY LEGEND -->
        <div style="display:flex;justify-content:center;gap:16px;margin-top:6px;padding:4px 0;border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;flex-shrink:0;">
            <span style="font-size:8px;color:#475569;"><b style="color:#16a34a;">EE</b> Exceeding (80-100)</span>
            <span style="font-size:8px;color:#475569;"><b style="color:#2563eb;">ME</b> Meeting (50-79)</span>
            <span style="font-size:8px;color:#475569;"><b style="color:#d97706;">AE</b> Approaching (30-49)</span>
            <span style="font-size:8px;color:#475569;"><b style="color:#dc2626;">BE</b> Below (0-29)</span>
        </div>

        <!-- 6. PERFORMANCE SUMMARY STRIP -->
        <div style="display:flex;gap:0;margin-top:6px;flex-shrink:0;border:1px solid #bbf7d0;border-radius:6px;overflow:hidden;">
            <div style="flex:1;text-align:center;padding:8px 10px;background:linear-gradient(to right,#f0fdf4,#dcfce7);border-right:1px solid #bbf7d0;">
                <div style="font-size:7px;color:#64748b;text-transform:uppercase;letter-spacing:.5px;">Mean Score</div>
                <div style="font-size:18px;font-weight:800;margin-top:2px;color:${or2 ? or2.color : '#94a3b8'};">${avg2 > 0 ? avg2 + '%' : '0%'}</div>
            </div>
            <div style="flex:1;text-align:center;padding:8px 10px;background:linear-gradient(to right,#dcfce7,#bbf7d0);border-right:1px solid #bbf7d0;">
                <div style="font-size:7px;color:#64748b;text-transform:uppercase;letter-spacing:.5px;">Rating</div>
                <div style="font-size:18px;font-weight:800;margin-top:2px;color:${or2 ? or2.color : '#94a3b8'};">${or2 ? or2.code : '—'}</div>
            </div>
            <div style="flex:1;text-align:center;padding:8px 10px;background:linear-gradient(to right,#bbf7d0,#a7f3d0);">
                <div style="font-size:7px;color:#64748b;text-transform:uppercase;letter-spacing:.5px;">Areas Done</div>
                <div style="font-size:18px;font-weight:800;margin-top:2px;color:#1e293b;">${areasAssessed}/${areas.length}</div>
            </div>
        </div>

        <!-- 7. REMARKS -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:8px;flex-shrink:0;">
            <div style="padding:8px 10px;background:#fffbeb;border:1px solid #fde68a;border-radius:6px;">
                <div style="font-size:8px;color:#92400e;text-transform:uppercase;letter-spacing:.5px;font-weight:700;margin-bottom:4px;">Class Teacher's Remarks</div>
                <p style="font-size:9px;line-height:1.5;color:#334155;text-align:justify;">${autoRemark(or2 ? or2.code : null)}</p>
            </div>
            <div style="padding:8px 10px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px;">
                <div style="font-size:8px;color:#1e40af;text-transform:uppercase;letter-spacing:.5px;font-weight:700;margin-bottom:4px;">Head Teacher's Remarks</div>
                <p style="font-size:9px;line-height:1.5;color:#334155;text-align:justify;">${headRemark(or2 ? or2.code : null)}</p>
            </div>
        </div>

        <!-- 8. SIGNATURES -->
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;margin-top:auto;padding-top:20px;flex-shrink:0;">
            <div style="text-align:center;">
                <div style="border-top:1.5px solid #334155;padding-top:6px;margin-top:20px;"></div>
                <span style="font-size:9px;color:#475569;font-weight:600;">Class Teacher</span>
            </div>
            <div style="text-align:center;">
                <div style="border-top:1.5px solid #334155;padding-top:6px;margin-top:20px;"></div>
                <span style="font-size:9px;color:#475569;font-weight:600;">Head Teacher</span>
            </div>
            <div style="text-align:center;">
                <div style="border-top:1.5px solid #334155;padding-top:6px;margin-top:20px;"></div>
                <span style="font-size:9px;color:#475569;font-weight:600;">Parent / Guardian</span>
            </div>
        </div>

    </div>
    </body></html>`;
}
// ═══════════════════════════════════════════════════════════════
//   CORE DOWNLOAD FUNCTION — uses iframe + blob (most reliable)
// ═══════════════════════════════════════════════════════════════
async function renderHtmlToPdfBlob(htmlString, filename) {
    await ensureHtml2Pdf();
    console.log('[PDF] Starting render for:', filename);

    // STRICT A4 IFRAME: Exactly 210x297mm so nothing bleeds or cuts off
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;left:0;top:0;width:210mm;height:297mm;border:none;z-index:1;pointer-events:none;background:white;overflow:hidden;';
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open(); doc.write(htmlString); doc.close();

    // Wait for fonts and layout to paint
    await new Promise(r => setTimeout(r, 800));

    const element = doc.body || doc.documentElement;

    const opt = {
        margin: 0,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 2, 
            useCORS: true, 
            logging: false, 
            width: 794,   // 210mm at 96dpi
            height: 1123, // 297mm at 96dpi
            windowWidth: 794,
            windowHeight: 1123
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    const blob = await html2pdf().set(opt).from(element).outputPdf('blob');
    console.log('[PDF] Blob generated, size:', blob.size, 'bytes');

    document.body.removeChild(iframe);

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
}
// ═══════════════════════════════════════════════════════════════
//   DOWNLOAD SINGLE INDIVIDUAL REPORT
// ═══════════════════════════════════════════════════════════════
async function downloadIndividualReportPDF() {
    const sel = $('reportLearnerSelect');
    if (!sel || !sel.value) { showToast('Select a learner first.', 'error'); return; }
    const student = StudentRepo.getById(sel.value);
    if (!student) { showToast('Learner not found.', 'error'); return; }

    // Auto-generate if not yet done
    const page = $('individualReportPage');
    if (page && page.style.display === 'none') {
        generateIndividualReport();
        await new Promise(r => setTimeout(r, 150));
    }

    const cleanName = (student.name || 'Student').replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '_').substring(0, 30);
    const cleanGrade = (student.grade || '').replace(/\s/g, '_');

    showPdfOverlay('Generating report card...');

    try {
        const logoB64 = await logoToBase64(store.settings?.logo);
        const html = buildIndividualReportHTML(student.id, logoB64);
        await renderHtmlToPdfBlob(html, `Report_Card_${cleanName}_${cleanGrade}.pdf`);
        hidePdfOverlay();
        showToast('Report card downloaded!', 'success');
    } catch (err) {
        hidePdfOverlay();
        console.error('[PDF] Individual download failed:', err);
        showToast('Download failed: ' + err.message, 'error');
    }
}

// ═══════════════════════════════════════════════════════════════
//   DOWNLOAD ALL GRADE REPORTS AS ONE PDF
// ═══════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
//   DOWNLOAD ALL GRADE REPORTS AS ONE PDF — FIXED
// ═══════════════════════════════════════════════════════════════
async function downloadGradeReportsPDF() {
    const grade = $('reportGradeFilter')?.value;
    if (!grade || grade === 'all') { 
        showToast('Select a specific grade first.', 'error'); 
        return; 
    }

    // Get ALL students in this grade — do NOT filter by scores
    let students = StudentRepo.getAll().filter(s => s.grade === grade);
    if (!students.length) { 
        showToast('No students enrolled in ' + grade, 'error'); 
        return; 
    }

    // Sort by name for clean ordering
    students.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    showPdfOverlay(`Preparing ${students.length} report cards...`);

    try {
        await ensureHtml2Pdf();
        const logoB64 = await logoToBase64(store.settings?.logo);

        // First, do a quick diagnostic check
        const allScores = (store.exams || []).filter(e => parseFloat(e.score) > 0);
        const gradeScores = allScores.filter(e => e.grade === grade);
        const studentsWithScores = new Set(gradeScores.map(e => e.studentId));
        const scoredCount = students.filter(s => studentsWithScores.has(s.id)).length;

        console.log('[PDF] Grade:', grade, '| Students:', students.length, '| With scores:', scoredCount, '| Total score records for grade:', gradeScores.length);

        // If NO scores at all, warn but continue (reports will show "—")
        if (scoredCount === 0) {
            console.log('[PDF] No scores found for this grade. Checking all scores structure...');
            if (allScores.length > 0) {
                // Debug: show what grades exist in the data
                const gradesInData = [...new Set(allScores.map(e => e.grade))];
                console.log('[PDF] Grades found in score data:', gradesInData);
                console.log('[PDF] Sample score record:', allScores[0]);
            }
            hidePdfOverlay();
            showToast(`No assessment data found for ${grade}. Reports will be blank. Check that scores exist for this grade.`, 'error');
            return;
        }

        // Build combined HTML — each student gets a full report page
        const parts = [];
        for (let i = 0; i < students.length; i++) {
            updatePdfOverlay(`Building card ${i + 1} of ${students.length}...`);
            const html = buildIndividualReportHTML(students[i].id, logoB64);
            // Extract just the inner content (skip DOCTYPE/html/body wrapper)
            const match = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
            parts.push(match ? match[1] : html);
        }

        // Combine with page breaks
        const combinedHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8">
            <style>
                .report-page-break { page-break-after: always; clear: both; height: 0; border: none; margin: 0; }
                @page { size: A4; margin: 0; }
            </style></head><body style="margin:0;padding:0;">
            ${parts.join('<div class="report-page-break"></div>')}
            </body></html>`;

        updatePdfOverlay('Rendering PDF...');
        const cleanGrade = grade.replace(/\s/g, '_');
        const dateStr = new Date().toISOString().slice(0, 10);
        await renderHtmlToPdfBlob(combinedHtml, `Grade_Reports_${cleanGrade}_${dateStr}.pdf`);

        hidePdfOverlay();
        showToast(`${students.length} report cards downloaded!`, 'success');

    } catch (err) {
        hidePdfOverlay();
        console.error('[PDF] Grade download failed:', err);
        showToast('Download failed: ' + err.message, 'error');
    }
}
// ═══════════════════════════════════════════════════════════════
//   WIRE ALL BUTTONS
// ═══════════════════════════════════════════════════════════════
function wireDownloadButtons() {
    // Individual download button
    const btnInd = $('btnDownloadIndividualPDF');
    if (btnInd) {
        const clone = btnInd.cloneNode(true);
        btnInd.parentNode.replaceChild(clone, btnInd);
        clone.addEventListener('click', downloadIndividualReportPDF);
    }

    // Grade reports download button
    const btnGrade = $('btnDownloadGradePDFs');
    if (btnGrade) {
        const clone = btnGrade.cloneNode(true);
        btnGrade.parentNode.replaceChild(clone, btnGrade);
        clone.addEventListener('click', downloadGradeReportsPDF);
    }

    // Toolbar PDF button — smart routing
    const btnPdf = $('reportsExportPdfBtn');
    if (btnPdf) {
        const clone = btnPdf.cloneNode(true);
        btnPdf.parentNode.replaceChild(clone, btnPdf);
        clone.addEventListener('click', () => {
            if ($('reportIndividualPreview')?.style.display !== 'none') {
                downloadIndividualReportPDF();
            } else {
                printCurrentReport();
            }
        });
    }
}
