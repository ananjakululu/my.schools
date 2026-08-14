'use strict';
// ==========================================================================
//   COMPATIBILITY SHIMS (Must be at the top of script.js)
// ==========================================================================

// Shim for old global animateValue()
function animateValue(id, start, end, duration, suffix = '') {
    const obj = document.getElementById(id);
    if (!obj) return;
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const val = Math.floor(easeOut * (end - start) + start);
        obj.textContent = val + suffix;
        if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
}

// Shim for old computeTrendStats()
function computeTrendStats(exams = null, gradeFilter = 'all') {
    let targetExams = exams || (typeof store !== 'undefined' ? store.exams : []) || [];
    if (gradeFilter && gradeFilter !== 'all' && typeof StudentRepo !== 'undefined') {
        const gradeIds = new Set(StudentRepo.getAll().filter(s => s.grade === gradeFilter).map(s => s.id));
        targetExams = targetExams.filter(e => gradeIds.has(e.studentId));
    }
    const stats = { ee: 0, me: 0, ae: 0, be: 0, total: targetExams.length, totalScore: 0, validExams: 0 };
    targetExams.forEach(e => {
        const sc = parseFloat(e.score) || 0;
        if (sc > 0) {
            stats.validExams++; stats.totalScore += sc;
            if (typeof cbcRating === 'function') { const r = cbcRating(sc); if (r.code === 'EE') stats.ee++; else if (r.code === 'ME') stats.me++; else if (r.code === 'AE') stats.ae++; else if (r.code === 'BE') stats.be++; }
        }
    });
    stats.average = stats.validExams > 0 ? Math.round(stats.totalScore / stats.validExams) : 0;
    return stats;
}

// Shim for old updateTrendIndicator()
function updateTrendIndicator(elementId, currentValue, previousValue, suffix = '%') {
    const el = document.getElementById(elementId);
    if (!el) return;
    const diff = currentValue - (previousValue || 0);
    el.textContent = `${diff > 0 ? '+' : ''}${diff}${suffix}`;
    const parent = el.closest('.ksc-trend');
    if (parent) {
        parent.classList.remove('trend-up', 'trend-down', 'trend-neutral');
        const icon = parent.querySelector('i');
        if (diff > 0) { parent.classList.add('trend-up'); if(icon) icon.className = 'fa-solid fa-arrow-trend-up'; }
        else if (diff < 0) { parent.classList.add('trend-down'); if(icon) icon.className = 'fa-solid fa-arrow-trend-down'; }
        else { parent.classList.add('trend-neutral'); if(icon) icon.className = 'fa-solid fa-minus'; }
    }
}
// Shim for old computeCategoryTrend()
function computeCategoryTrend(currentVal, previousVal) {
    // If we don't have previous data, just return 0 (no trend)
    if (typeof previousVal === 'undefined' || previousVal === null) return 0;
    // Safely calculate the difference
    return (parseInt(currentVal) || 0) - (parseInt(previousVal) || 0);
}
// ==========================================================================
//   MASTER CHART SHIMS (Covers ALL old chart renderers in script.js)
// ==========================================================================

// Shims for old Analysis main charts
function renderSubjectBarChart(){}
function renderSubjectPerformanceChart(){}
function renderCompetencyDistributionChart(){}
function renderPolarCompetencyChart(){}
function renderAnalysisTrendChart(){}
function renderGenderComparisonChart(){}
function renderHeatmapChart(){}
function renderAnalysisLeaderboardChart(){}

// Shims for old Staff analytics chart renderers
function renderStaffDeptChart(){}
function renderStaffGenderChart(){}
function renderStaffEmploymentChart(){}
function renderStaffWorkloadChart(){}
function renderStaffPerformanceChart(){}

// Shims for old Dashboard chart renderers
function renderDashboardChart(type){}
function renderEnrollmentChart(){}
function renderGenderChart(){}
function renderCompetencyChart(){}
function renderPerformanceTrendChart(){}
function renderSubjectRadarChart(){}
function renderLeaderboardChart(){}
function renderRecentActivityFeed(){}
function renderSparkline(canvasId, data, color) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || typeof Chart === 'undefined') return null;
    
    // BULLETPROOF: If data is missing or not an array, use empty array to prevent .map() crash
    const safeData = Array.isArray(data) ? data : [];
    
    const cfg = { 
        type:'line', 
        data:{ 
            labels: safeData.map(()=>''), 
            datasets:[{ 
                data: safeData, 
                borderColor: color || '#22C55E', 
                borderWidth: 2, 
                fill: true, 
                backgroundColor: (color || '#22C55E') + '15', 
                pointRadius: 0, 
                tension: 0.4 
            }]
        }, 
        options:{ 
            responsive:true, 
            maintainAspectRatio:false, 
            plugins:{legend:{display:false},tooltip:{enabled:false}}, 
            scales:{x:{display:false},y:{display:false}}
        }
    };
    
    const ex = Chart.getChart(canvasId);
    if(ex){ 
        ex.data = cfg.data; 
        ex.update('active'); 
        return ex; 
    }
    return new Chart(canvas.getContext('2d'), cfg);
}
// Shim for old synthSeries()
function synthSeries(target, points = 6) {
    if (typeof target === 'undefined' || target === null) return [0, 0, 0, 0, 0, 0]; // Fallback if no data
    const series = [];
    let base = Math.max(0, target - Math.floor(target * 0.15));
    for (let i = 0; i < points; i++) {
        const noise = (Math.sin(i * 1.3) * 0.5) * Math.max(1, target * 0.05);
        const val = Math.round(base + ((target - base) * (i / (points - 1))) + noise);
        series.push(Math.max(0, val));
    }
    series[series.length - 1] = target;
    return series;
}
// Shim for old computeCategorySeries()
function computeCategorySeries(currentVal, targetVal) {
    // If no data, return empty array to prevent sparkline crashes
    const target = targetVal || currentVal || 0;
    if (target === 0 && currentVal === 0) return [0, 0, 0, 0, 0, 0];
    // Reuse the synthSeries logic to generate the visual trend
    return synthSeries(target, 6);
}
// ==========================================================================
//   REST OF script.js STARTS BELOW THIS LINE
// ==========================================================================
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
let selectedReportStudentId = null;

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
        // FIXED: previously this REMOVED elimutrack_backup, silently wiping all
        // locally cached records on every version bump (offline data loss).
        // Backup parsing is defensive (see loadData catch), so keep the data.
        localStorage.setItem('elimutrack_cache_ver', CACHE_VERSION);
        console.log('Cache version updated — local backup preserved.');
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

/**
 * ====================================================================
 * ENTERPRISE HTTP CLIENT
 * ====================================================================
 * Handles Base URLs, Authentication, Timeouts, and Global Error catching
 */
class ApiClient {
    constructor(config = {}) {
        /**
         * BASE URL PRIORITY:
         * 1. Explicit config (for future production domains)
         * 2. window.location.origin (Solves your 192.168.x.x issue automatically)
         */
        this.baseUrl = config.baseUrl || window.location.origin;
        
        // Default timeout for requests (15 seconds)
        this.timeout = config.timeout || 15000;
    }

    /**
     * Retrieves the secure token from storage
     */
    _getAuthToken() {
        // FIXED: login stores 'authToken'; check it first, then legacy keys
        return localStorage.getItem('authToken') || sessionStorage.getItem('authToken') ||
               localStorage.getItem('token') || localStorage.getItem('jwt');
    }

    /**
     * Core Request Handler
     * @param {string} method - GET, POST, PUT, DELETE
     * @param {string} endpoint - e.g., '/students'
     * @param {object|null} data - Body payload for POST/PUT
     * @param {object} options - Override headers, etc.
     */
    async request(method, endpoint, data = null, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        
        // Setup AbortController for timeouts (prevents hanging requests)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), options.timeout || this.timeout);

        // Build Headers
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(options.headers || {})
        };

        // Auto-inject Authorization token if user is logged in
        const token = this._getAuthToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // Build Fetch Config
        const fetchConfig = {
            method,
            headers,
            signal: controller.signal
        };

        // Attach body for POST/PUT/PATCH
        if (data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
            fetchConfig.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, fetchConfig);

            // GLOBAL AUTH INTERCEPTOR: If token expires, force logout
            if (response.status === 401 && !endpoint.includes('/api/login')) {
                console.warn('[API] Session expired or unauthorized.');
                localStorage.removeItem('token');
                // Adjust this line to match how your app handles logouts/redirects
                if (window.location.pathname !== '/login.html') { 
                    window.location.href = '/login.html'; 
                }
                return Promise.reject(new Error('Session expired'));
            }

            // Handle successful empty responses (like 204 No Content)
            if (response.status === 204) return null;

            // Parse JSON response
            const jsonData = await response.json();

            // Handle server-side errors (4xx, 5xx)
            if (!response.ok) {
                throw { 
                    status: response.status, 
                    message: jsonData.error || jsonData.message || 'Request failed',
                    data: jsonData 
                };
            }

            return jsonData;

        } catch (error) {
            // Handle network timeouts
            if (error.name === 'AbortError') {
                throw new Error(`Request timed out: ${endpoint}`);
            }
            // Re-throw standard errors
            throw error;
        } finally {
            clearTimeout(timeoutId);
        }
    }

    // --- Convenience Methods ---
    get(endpoint, options)    { return this.request('GET', endpoint, null, options); }
    post(endpoint, data, options)  { return this.request('POST', endpoint, data, options); }
    put(endpoint, data, options)   { return this.request('PUT', endpoint, data, options); }
    delete(endpoint, options)      { return this.request('DELETE', endpoint, null, options); }
}

// ====================================================================
// INITIALIZE GLOBAL SINGLETON
// ====================================================================
const api = new ApiClient();

// Keep this for absolute backward compatibility so your old code doesn't break immediately
const API_URL = api.baseUrl;

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
            // FIXED: heal teacher assignments the server may not carry yet
            // (older DBs have no teacherId column until the migration runs)
            try {
                const lb = JSON.parse(localStorage.getItem('elimutrack_backup') || 'null');
                if (lb && Array.isArray(lb.learningAreas)) {
                    existingAreas.forEach(a => {
                        if (!a.teacherId) {
                            const local = lb.learningAreas.find(x => x.id === a.id);
                            if (local && local.teacherId) a.teacherId = local.teacherId;
                        }
                    });
                }
            } catch (_) { /* keep server state */ }
            store.learningAreas = existingAreas;

            // Inbox messages: prefer the server copy when it has data; otherwise
            // merge from the local backup (offline-sent messages must survive).
            if (Array.isArray(db.messages) && db.messages.length > 0) {
                store.messages = db.messages;
            } else {
                try {
                    const localBackup = localStorage.getItem('elimutrack_backup');
                    if (localBackup) {
                        const lb = JSON.parse(localBackup);
                        if (Array.isArray(lb.messages) && lb.messages.length > 0) {
                            store.messages = lb.messages;
                        }
                    }
                } catch (e) { /* corrupt backup — keep server state */ }
            }

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
        ['/timetable', store.timetable || []], ['/examSchedules', store.examSchedules || []],
        ['/messages', store.messages || []]
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
    initSidebarState();
    initSidebarSections();
    initGlobalListeners();
    initSettingsListeners();
    initReportListeners(); 
    initBatchAdmission();
    initRealtimeSync();
    startClock();
    patchAssessmentIntegrity();
    router('dashboard');
    updateSettingsForm();
    setVal('term1Start', store.settings.term1Start || '');
setVal('term1End', store.settings.term1End || '');
setVal('term2Start', store.settings.term2Start || '');
setVal('term2End', store.settings.term2End || '');
setVal('term3Start', store.settings.term3Start || '');
setVal('term3End', store.settings.term3End || '');
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
            if (action === 'delete-course') return deleteCourse(id);
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

        // Curricula band accordion: clicking a header toggles its band
        const accHeader = target.closest('.accordion-header');
        if (accHeader) {
            const accItem = accHeader.closest('.accordion-item');
            if (accItem) accItem.classList.toggle('open');
            return;
        }

        const dashNavItem = target.closest('.dash-nav-item');
        if (dashNavItem) return openDashTab(e, dashNavItem.dataset.tab || dashNavItem.textContent.trim());
    });

    $('globalSearch')?.addEventListener('input', debounce(e => handleGlobalSearch(e.target.value), 300));
    $('studentSearch')?.addEventListener('input', debounce(e => {
        LearnerState.search = e.target.value; LearnerState.page = 1; renderLearnerSection();
        const clearBtn = $('learnerSearchClear');
        if (clearBtn) clearBtn.style.display = e.target.value ? 'inline-flex' : 'none';
    }, 300));

    // Learners toolbar: clear search / clear all filters / export CSV (FIXED: were dead)
    $('learnerSearchClear')?.addEventListener('click', () => {
        LearnerState.search = ''; LearnerState.page = 1;
        setVal('studentSearch', '');
        $('learnerSearchClear').style.display = 'none';
        renderLearnerSection();
    });
    $('learnerClearAll')?.addEventListener('click', () => {
        LearnerState.search = ''; LearnerState.grade = 'all'; LearnerState.stream = 'all';
        LearnerState.gender = 'all'; LearnerState.sort = 'name-asc'; LearnerState.perPage = 24; LearnerState.page = 1;
        setVal('studentSearch', '');
        const clearBtn = $('learnerSearchClear'); if (clearBtn) clearBtn.style.display = 'none';
        ['learnerGradeFilter', 'streamFilter', 'learnerGenderFilter', 'learnerSortSelect', 'learnerPerPageSelect']
            .forEach(id => setVal(id, 'all') || true);
        if ($('learnerSortSelect')) $('learnerSortSelect').value = 'name-asc';
        if ($('learnerPerPageSelect')) $('learnerPerPageSelect').value = '24';
        renderLearnerSection();
        showToast('All filters cleared');
    });
    $('btnExportCSV')?.addEventListener('click', exportLearnersCSV);

    // Admissions toolbar (FIXED: were dead)
    $('admResetBtn')?.addEventListener('click', () => { resetIntakeForm(); showToast('Form reset'); });
    $('admTemplateBtn')?.addEventListener('click', downloadAdmissionTemplate);
    $('learnerSortSelect')?.addEventListener('change', e => { LearnerState.sort = e.target.value; renderLearnerSection(); });
    $('learnerPerPageSelect')?.addEventListener('change', e => { LearnerState.perPage = e.target.value === 'all' ? 'all' : parseInt(e.target.value); LearnerState.page = 1; renderLearnerSection(); });
    $('streamFilter')?.addEventListener('change', e => { LearnerState.stream = e.target.value; LearnerState.page = 1; renderLearnerSection(); });
    $('staffSearch')?.addEventListener('input', debounce(renderStaff, 300));
    $('staffDeptFilter')?.addEventListener('change', renderStaff);

    // Batch score entry: live row filter (FIXED: input existed but was never bound)
    $('batchSearch')?.addEventListener('input', filterBatchRows);

    $('newStudentForm')?.addEventListener('submit', submitRegistration);
    $('institutionForm')?.addEventListener('submit', saveInstitutionDetails);
    $('hoiForm')?.addEventListener('submit', saveHOIDetails);
    $('courseForm')?.addEventListener('submit', saveCourseSettings);
    $('staffForm')?.addEventListener('submit', submitStaff);
    
    $('composeForm')?.addEventListener('submit', e => { e.preventDefault(); sendMessage(); });

    // Inbox: folder tabs + search
    document.querySelectorAll('[data-folder]').forEach(btn => {
        btn.addEventListener('click', () => { inboxCurrentFolder = btn.dataset.folder; renderInboxTab(); });
    });
    $('inboxSearch')?.addEventListener('input', debounce(() => renderInboxTab(), 250));

    // Staff modal: multi-step navigation
    document.querySelectorAll('[data-staff-step]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const dir = btn.dataset.staffStep;
            const cur = parseInt(btn.dataset.current || '1', 10);
            switchStaffStep(dir === 'next' ? cur + 1 : cur - 1);
        });
    });

    // Staff photo upload → preview + stash data URL for submitStaff
    const staffPhotoInput = $('staffPhotoInput');
    if (staffPhotoInput) {
        staffPhotoInput.addEventListener('change', function() {
            const file = this.files && this.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = e => {
                window._staffPhotoDataUrl = e.target.result;
                const img = $('staffPhotoPreview');
                if (img) img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    // Legacy exam form (examFormModal) — prevent accidental page reload
    $('examForm')?.addEventListener('submit', e => {
        e.preventDefault();
        showToast('Use the Assessment Centre to create assessments.', 'info');
    });

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
        // FIXED: was calling a no-op shim — route through the live engine feed
        if (dashboard && typeof dashboard._renderActivityFeed === 'function') {
            dashboard.state.activityFilter = btn.dataset.filter || 'all';
            dashboard._renderActivityFeed();
        }
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
            case 'curricula': renderCurricula(); renderCourseSettings(); break;
            case 'timetable': initTimetableSection(); break;
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
//   INBOX / MESSAGES (rewritten to match index.html: #inboxMessageList,
//   #inboxDetailView, #composeRecipient, folder tabs, trash)
// ==========================================================================
let inboxCurrentFolder = 'inbox';

function renderInboxTab() {
    const listEl = $('inboxMessageList');
    const all = store.messages || [];

    let folderMsgs = all;
    if (inboxCurrentFolder === 'inbox') folderMsgs = all.filter(m => !m.folder || m.folder === 'inbox');
    else if (inboxCurrentFolder === 'sent') folderMsgs = all.filter(m => m.folder === 'sent');
    else if (inboxCurrentFolder === 'trash') folderMsgs = all.filter(m => m.folder === 'trash');

    const q = (getVal('inboxSearch') || '').toLowerCase();
    if (q) {
        folderMsgs = folderMsgs.filter(m => [m.subject, m.body, m.message, m.to, m.from]
            .filter(Boolean).join(' ').toLowerCase().includes(q));
    }
    folderMsgs = [...folderMsgs].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    // Unread badge + folder tab active state
    const unread = all.filter(m => !m.read && (!m.folder || m.folder === 'inbox')).length;
    const badge = $('inboxCountBadge');
    if (badge) badge.textContent = unread;
    document.querySelectorAll('.folder-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.folder === inboxCurrentFolder);
    });

    if (!listEl) return;

    if (folderMsgs.length === 0) {
        const msgs = {
            inbox: 'No messages in your inbox.',
            sent: 'No sent messages yet.',
            trash: 'Trash is empty.'
        };
        listEl.innerHTML = `<div style="text-align:center; padding:3rem 1rem; color:var(--text-muted);">
            <i class="fa-regular fa-envelope-open" style="font-size:2.5rem; color:var(--border); display:block; margin-bottom:0.75rem;"></i>
            <p style="margin:0; font-size:0.9rem;">${msgs[inboxCurrentFolder] || 'No messages.'}</p>
        </div>`;
        return;
    }

    listEl.innerHTML = folderMsgs.map(m => `
        <div class="message-item ${m.read ? '' : 'unread'}" data-message-id="${m.id}" onclick="openMessage('${m.id}')"
             style="display:flex; gap:10px; padding:12px 14px; border-bottom:1px solid var(--border); cursor:pointer; ${m.read ? '' : 'background:var(--primary-light);'}">
            <div style="flex:1; min-width:0;">
                <div style="display:flex; justify-content:space-between; gap:8px;">
                    <strong style="font-size:0.85rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(m.subject || '(No subject)')}</strong>
                    <span style="font-size:0.7rem; color:var(--text-muted); white-space:nowrap;">${m.date ? new Date(m.date).toLocaleDateString() : ''}</span>
                </div>
                <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(m.body || m.message || '')}</div>
                <div style="font-size:0.7rem; color:#94a3b8; margin-top:3px;">
                    ${m.from ? 'From: ' + escapeHtml(m.from) : ''}${m.to ? ' · To: ' + escapeHtml(m.to) : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function openMessage(id) {
    const m = (store.messages || []).find(x => x.id === id);
    const view = $('inboxDetailView');
    if (!m || !view) return;
    if (!m.read && (!m.folder || m.folder === 'inbox')) { m.read = true; saveData(); }
    const inTrash = m.folder === 'trash';
    view.innerHTML = `
        <div style="padding:1.5rem;">
            <h3 style="margin:0 0 0.25rem; font-size:1.1rem;">${escapeHtml(m.subject || '(No subject)')}</h3>
            <div style="font-size:0.78rem; color:var(--text-muted); margin-bottom:1.25rem;">
                ${m.from ? 'From: <strong>' + escapeHtml(m.from) + '</strong>' : ''}
                ${m.to ? ' To: <strong>' + escapeHtml(m.to) + '</strong>' : ''}
                · ${m.date ? new Date(m.date).toLocaleString() : ''}
            </div>
            <div style="white-space:pre-wrap; line-height:1.6; font-size:0.9rem;">${escapeHtml(m.body || m.message || '')}</div>
            <div style="margin-top:1.5rem; display:flex; gap:0.5rem;">
                <button class="btn btn-sm btn-secondary" onclick="deleteMessage('${m.id}')">
                    <i class="fa-solid fa-trash"></i> ${inTrash ? 'Delete Permanently' : 'Move to Trash'}
                </button>
                ${inTrash ? `<button class="btn btn-sm btn-primary" onclick="restoreMessage('${m.id}')"><i class="fa-solid fa-rotate-left"></i> Restore</button>` : ''}
            </div>
        </div>`;
    renderInboxTab();
}

function deleteMessage(id) {
    const m = (store.messages || []).find(x => x.id === id);
    if (!m) return;
    if (m.folder === 'trash') {
        store.messages = (store.messages || []).filter(x => x.id !== id);
        showToast('Message deleted permanently.');
    } else {
        m.folder = 'trash';
        showToast('Message moved to trash.');
    }
    saveData();
    const view = $('inboxDetailView');
    if (view) view.innerHTML = '<div class="inbox-empty-state"><i class="fa-regular fa-envelope-open" style="font-size:4rem; color:var(--border); margin-bottom:1rem;"></i><h3>Select a message to read</h3><p>Choose a conversation from the list to view details.</p></div>';
    renderInboxTab();
}

function restoreMessage(id) {
    const m = (store.messages || []).find(x => x.id === id);
    if (!m) return;
    m.folder = 'inbox';
    m.read = false;
    saveData();
    renderInboxTab();
    showToast('Message restored to inbox.');
}

function openComposeModal() {
    const sel = $('composeRecipient');
    if (sel) {
        sel.innerHTML = '<option value="">Select Guardian...</option>';
        (store.students || []).forEach(st => {
            const label = [st.guardianName, st.guardianPhone].filter(Boolean).join(' · ');
            sel.innerHTML += `<option value="${escapeHtml(st.guardianName || st.guardianPhone || st.id)}">${escapeHtml(st.name || st.id)}${label ? ' — ' + escapeHtml(label) : ''}</option>`;
        });
    }
    if ($('composeSubject')) $('composeSubject').value = '';
    if ($('composeBody')) $('composeBody').value = '';
    openModal('composeModal');
}

function sendMessage() {
    const to = getVal('composeRecipient');
    const subject = getVal('composeSubject');
    const body = getVal('composeBody');

    if (!subject || !body) {
        showToast('Subject and message are required.', 'error');
        return;
    }

    store.messages = store.messages || [];
    store.messages.push({
        id: generateId(),
        to: to,
        from: (CURRENT_USER && CURRENT_USER.name) || 'Admin',
        subject: subject,
        body: body,
        date: new Date().toISOString(),
        read: true,
        folder: 'sent'
    });

    saveData();
    const form = $('composeForm');
    if (form) form.reset();
    closeModal('composeModal');
    inboxCurrentFolder = 'sent';
    renderInboxTab();
    showToast('Message sent');
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
//   MODERN DASHBOARD ENGINE (SaaS Grade - Fully Wired & Reactive)
// ==========================================================================
const DASH_PALETTE = { 
    green: '#22C55E', indigo: '#6366f1', amber: '#f59e0b', 
    rose: '#f43f5e', teal: '#14b8a6', blue: '#3b82f6', pink: '#ec4899' 
};

class DashboardEngine {
    constructor() {
        this.charts = {};
        this.animationFrames = {};
        // UI State management
        this.state = {
            chartType: 'bar',
            levelFilter: 'all',
            activityFilter: 'all',
            range: 'term'          // matches the default active "Term" pill
        };
        this.cachedStats = null;
    }

   // --- MAIN RENDER ORCHESTRATOR (With Safety Net) ---
    init() {
        // 1. ALWAYS attach UI events first, completely separate from data logic
        this._attachEventListeners();
        
        // 2. Try to render data. If it crashes, buttons will still work!
        try {
            this.cachedStats = this._aggregateStats();
            this._renderAll();
        } catch (error) {
            console.error('[Dashboard] Data rendering error:', error);
        }
    }

    _renderAll() {
        const stats = this.cachedStats;
        this._renderKPIs(stats);
        this._renderSparklines(stats);
        this._renderFilteredEnrollmentChart();
        this._renderGenderVisual(stats.gender);
        this._renderCompetencyChart(stats);
        this._renderPerformanceTrend(stats.exams);
        this._renderSubjectRadar(stats.exams);
        this._renderLeaderboard(stats.students, stats.exams);
        this._renderActivityFeed();
    }

    // --- EVENT LISTENERS (Bulletproof Binding) ---
    _attachEventListeners() {
        // 1. Chart Type Toggle (Bar, Line, Doughnut) - Binded directly to buttons
        const toggleContainer = document.getElementById('enrollmentChartToggle');
        if (toggleContainer) {
            const buttons = toggleContainer.querySelectorAll('button[data-type]');
            buttons.forEach(btn => {
                // Remove old listeners to prevent duplicates if init runs twice
                btn.replaceWith(btn.cloneNode(true)); 
            });
            
            // Re-select after cloning
            toggleContainer.querySelectorAll('button[data-type]').forEach(btn => {
                btn.addEventListener('click', () => {
                    if (btn.classList.contains('active')) return;
                    
                    // Update active state visually
                    toggleContainer.querySelectorAll('button').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    
                    // Update state and redraw
                    this.state.chartType = btn.dataset.type;
                    console.log('Chart type changed to:', this.state.chartType); // Debug log
                    
                    if (this.cachedStats) this._renderFilteredEnrollmentChart();
                });
            });
        }

        // 2. Level Filter (All, PP, Lower, etc.)
        const filterSelect = document.getElementById('chartFilter');
        if (filterSelect) {
            filterSelect.removeEventListener('change', this._handleFilterChange);
            this._handleFilterChange = (e) => {
                this.state.levelFilter = e.target.value;
                console.log('Level filter changed to:', this.state.levelFilter); // Debug log
                if (this.cachedStats) this._renderFilteredEnrollmentChart();
            };
            filterSelect.addEventListener('change', this._handleFilterChange);
        }

        // 3. Activity Feed Filter
        const activityContainer = document.getElementById('activityFilter');
        if (activityContainer) {
            activityContainer.querySelectorAll('button').forEach(btn => {
                btn.replaceWith(btn.cloneNode(true));
            });

            activityContainer.querySelectorAll('button[data-filter]').forEach(btn => {
                btn.addEventListener('click', () => {
                    activityContainer.querySelectorAll('button').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.state.activityFilter = btn.dataset.filter;
                    this._renderActivityFeed();
                });
            });
        }

        // 4. Refresh Button
        const refreshBtn = document.getElementById('dashRefreshBtn');
        if (refreshBtn) {
            const newBtn = refreshBtn.cloneNode(true);
            refreshBtn.parentNode.replaceChild(newBtn, refreshBtn);
            newBtn.addEventListener('click', () => {
                const icon = newBtn.querySelector('i');
                icon.style.transition = 'transform 0.6s ease';
                icon.style.transform = 'rotate(360deg)';
                setTimeout(() => { icon.style.transition = 'none'; icon.style.transform = 'rotate(0deg)'; }, 600);
                
                try {
                    this.cachedStats = this._aggregateStats();
                    this._renderAll();
                } catch(e) { console.error(e); }
            });
        }

        // 5. Range pills (Week / Term / Year) — FIXED: were dead buttons
        const rangeBtns = document.querySelectorAll('.range-btn[data-range]');
        if (rangeBtns.length > 0) {
            rangeBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    rangeBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
                    btn.classList.add('active');
                    btn.setAttribute('aria-selected', 'true');
                    this.state.range = btn.dataset.range;
                    this.cachedStats = this._aggregateStats();
                    this._renderAll();
                });
            });
        }

        // 6. Export snapshot — FIXED: was a dead button
        const exportBtn = document.getElementById('dashExportBtn');
        if (exportBtn) {
            const newExportBtn = exportBtn.cloneNode(true);
            exportBtn.parentNode.replaceChild(newExportBtn, exportBtn);
            newExportBtn.addEventListener('click', () => {
                try {
                    const stats = this._aggregateStats();
                    const snapshot = {
                        exportedAt: new Date().toISOString(),
                        school: store.settings.schoolName,
                        academicYear: store.settings.academicYear,
                        currentTerm: store.settings.currentTerm,
                        range: this.state.range,
                        students: StudentRepo.getAll().length,
                        staff: StaffRepo.getAll().length,
                        exams: (store.exams || []).length,
                        learningAreas: (store.learningAreas || []).length,
                        competency: stats.competency,
                        gender: stats.gender,
                        averageScore: stats.avgPerf,
                        notes: (store.notes || []).length,
                        messages: (store.messages || []).length
                    };
                    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(blob);
                    a.download = `dashboard_snapshot_${new Date().toISOString().split('T')[0]}.json`;
                    a.click();
                    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
                    showToast('Dashboard snapshot exported');
                } catch (e) { console.error('[EXPORT ERROR]', e); showToast('Export failed', 'error'); }
            });
        }

    }
    // --- DATA AGGREGATION (Enhanced for new KPIs) ---
    _aggregateStats() {
        const students = StudentRepo.getAll();
        // FIXED: respect the Week/Term/Year range pills when aggregating exam data
        let exams = store.exams || [];
        if (this.state.range === 'week') {
            const cutoff = Date.now() - 7 * 86400000;
            exams = exams.filter(e => (e.createdAt ? new Date(e.createdAt).getTime() : 0) >= cutoff);
        } else if (this.state.range === 'term') {
            const t = store.settings.currentTerm;
            exams = exams.filter(e => !e.term || e.term === t);
        } else if (this.state.range === 'year') {
            const y = String(store.settings.academicYear || new Date().getFullYear());
            exams = exams.filter(e => !e.year || String(e.year) === y);
        }
        
        const gender = { male: 0, female: 0 };
        const gradeCounts = {};
        const activeGrades = new Set();
        let totalScore = 0, validExams = 0;
        const competency = { EE: 0, ME: 0, AE: 0, BE: 0 };

        const allGrades = ['PP1', 'PP2', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9'];
        
        students.forEach(s => {
            if (s.gender === 'Male') gender.male++;
            else if (s.gender === 'Female') gender.female++;
            if (s.grade) activeGrades.add(s.grade);
        });

        allGrades.forEach(g => gradeCounts[g] = 0);
        students.forEach(s => { if (gradeCounts[s.grade] !== undefined) gradeCounts[s.grade]++; });

        exams.forEach(e => {
            const sc = parseFloat(e.score) || 0;
            if (sc > 0) { 
                totalScore += sc; 
                validExams++; 
                competency[cbcRating(sc).code]++; 
            }
        });

        return {
            students, exams, competency, activeGrades,
            staffCount: StaffRepo.count(),
            avgPerf: validExams > 0 ? Math.round(totalScore / validExams) : 0,
            pending: students.filter(s => !exams.some(e => e.studentId === s.id)).length,
            gender, gradeCounts,
            labels: allGrades.map(g => g.replace('Grade ', 'G'))
        };
    }

    // --- ANIMATED KPI COUNTERS (Enhanced Sub-stats) ---
    _renderKPIs(stats) {
        this._animateValue('statEnrollment', stats.students.length, 800);
        this._animateValue('statStaff', stats.staffCount, 800);
        this._animateValue('statCompetent', stats.avgPerf, 800, '%');
        this._animateValue('statPending', stats.pending, 800);

        // Sub-stats for KPI cards
        setText('kpiMaleCount', stats.gender.male);
        setText('kpiFemaleCount', stats.gender.female);
        setText('kpiGradeCount', stats.activeGrades.size); // Dynamic grade count
        setText('kpiStaffTeaching', stats.staffCount);
        setText('kpiStaffRatio', stats.staffCount > 0 ? Math.round(stats.students.length / stats.staffCount) : 0);
        
        // Competency sub-stats
        setText('kpiCompetentCount', stats.competency.EE + stats.competency.ME);
        setText('kpiBelowCount', stats.competency.AE + stats.competency.BE);

        // Dynamic Greeting
        const user = store.user || JSON.parse(localStorage.getItem('user') || '{}');
        if (user.name) setText('dashUserName', user.name.split(' ')[0]);
    }

    _animateValue(id, end, duration, suffix = '') {
        const obj = $(id);
        if (!obj) return;
        if (this.animationFrames[id]) cancelAnimationFrame(this.animationFrames[id]);

        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            obj.textContent = Math.floor(easeOut * end) + suffix;
            if (progress < 1) this.animationFrames[id] = requestAnimationFrame(step);
        };
        this.animationFrames[id] = requestAnimationFrame(step);
    }

    // --- SPARKLINES (SaaS Micro-charts) ---
    _renderSparklines(stats) {
        // Generates a realistic-looking trend based on the current total
        const genTrend = (base) => {
            const data = [];
            let current = Math.max(0, base - (base * 0.2)); // Start 20% lower
            for (let i = 0; i < 8; i++) {
                current += (Math.random() * 4) - 1.5; // Random walk up
                data.push(Math.max(0, Math.round(current)));
            }
            data[data.length - 1] = base; // Ensure last point is exact current count
            return data;
        };

        const sparkOpts = (color) => ({
            type: 'line',
            data: { labels: Array(8).fill(''), datasets: [{ data: genTrend(0), borderColor: color, borderWidth: 2, fill: true, backgroundColor: color + '15', pointRadius: 0, tension: 0.4 }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, scales: { x: { display: false }, y: { display: false } }, animation: { duration: 1000 } }
        });

        // Inject real data into the spark configs
        const sEnroll = sparkOpts(DASH_PALETTE.green); sEnroll.data.datasets[0].data = genTrend(stats.students.length);
        const sStaff = sparkOpts(DASH_PALETTE.indigo); sStaff.data.datasets[0].data = genTrend(stats.staffCount);
        const sComp = sparkOpts(DASH_PALETTE.amber); sComp.data.datasets[0].data = genTrend(stats.avgPerf);
        const sPend = sparkOpts(DASH_PALETTE.rose); sPend.data.datasets[0].data = genTrend(stats.pending);

        this._getOrCreateChart('sparkEnrollment', sEnroll);
        this._getOrCreateChart('sparkStaff', sStaff);
        this._getOrCreateChart('sparkCompetency', sComp);
        this._getOrCreateChart('sparkPending', sPend);
    }

        // --- CHART MANAGEMENT (Handles Type Switching Correctly) ---
    _getOrCreateChart(canvasId, config) {
        const canvas = $(canvasId);
        if (!canvas || typeof Chart === 'undefined') return null;

        // If a chart already exists on this canvas...
        if (this.charts[canvasId]) {
            
            // Check if the user is trying to change the chart TYPE (e.g., Bar -> Doughnut)
            if (this.charts[canvasId].config.type === config.type) {
                // Same type? Just update the data/options smoothly without flickering
                this.charts[canvasId].data = config.data;
                this.charts[canvasId].options = config.options;
                this.charts[canvasId].update('active');
                return this.charts[canvasId];
            } else {
                // Different type? Chart.js CANNOT morph types. We must DESTROY it first.
                this.charts[canvasId].destroy();
                delete this.charts[canvasId];
            }
        }

        // Create a brand new chart (happens on first load, or after a type-change destroys the old one)
        this.charts[canvasId] = new Chart(canvas.getContext('2d'), config);
        return this.charts[canvasId];
    }

    // --- ENROLLMENT CHART (Now Reactive to Filters) ---
    _renderFilteredEnrollmentChart() {
        const allGrades = ['PP1', 'PP2', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9'];
        const filterMap = {
            'all': allGrades,
            'pp': allGrades.filter(g => g.startsWith('PP')),
            'lower': allGrades.filter(g => g.includes('Grade 1') || g.includes('Grade 2') || g.includes('Grade 3')),
            'middle': allGrades.filter(g => g.includes('Grade 4') || g.includes('Grade 5') || g.includes('Grade 6')),
            'jss': allGrades.filter(g => g.includes('Grade 7') || g.includes('Grade 8') || g.includes('Grade 9'))
        };

        const activeGrades = filterMap[this.state.levelFilter] || allGrades;
        const filteredCounts = {};
        activeGrades.forEach(g => filteredCounts[g] = this.cachedStats.gradeCounts[g] || 0);

        this._renderEnrollmentChart(filteredCounts, this.state.chartType);
    }

    _renderEnrollmentChart(gradeCounts, type = 'bar') {
        const counts = Object.values(gradeCounts);
        const labels = Object.keys(gradeCounts).map(g => g.replace('Grade ', 'G'));
        
        const isCircular = type === 'doughnut' || type === 'polarArea';
        
        const config = {
            type: type,
            data: { 
                labels, 
                datasets: [{
                    label: 'Learners', 
                    data: counts, 
                    backgroundColor: isCircular ? Object.values(DASH_PALETTE).slice(0, counts.length) : (context) => {
                        const chart = context.chart; const {ctx, chartArea} = chart;
                        if (!chartArea) return DASH_PALETTE.green;
                        const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                        gradient.addColorStop(0, 'rgba(34, 197, 94, 0.2)');
                        gradient.addColorStop(1, 'rgba(34, 197, 94, 0.8)');
                        return gradient;
                    },
                    borderColor: isCircular ? '#fff' : DASH_PALETTE.green, 
                    borderWidth: isCircular ? 2 : 1.5, 
                    borderRadius: isCircular ? 0 : 6,
                    borderSkipped: false
                }] 
            },
            options: { 
                responsive: true, maintainAspectRatio: false, 
                plugins: { legend: { display: isCircular, position: 'bottom', labels: { boxWidth: 12, padding: 15 } } }, 
                scales: isCircular ? {} : { 
                    y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } }, 
                    x: { grid: { display: false } } 
                } 
            }
        };
        this._getOrCreateChart('enrollmentChart', config);
    }

    // --- GENDER VISUAL (Added missing SVG text updates) ---
    _renderGenderVisual(gender) {
        const total = gender.male + gender.female || 1;
        setText('countMale', gender.male);
        setText('countFemale', gender.female);
        setText('genderPercentMale', Math.round((gender.male/total)*100) + '%');
        setText('genderPercentFemale', Math.round((gender.female/total)*100) + '%');
        
        // Update SVG text labels
        setText('genderLabelMale', gender.male);
        setText('genderLabelFemale', gender.female);

        const barMale = $('genderBarMale'), barFemale = $('genderBarFemale');
        if (barMale && barFemale) {
            const maxH = 90;
            barMale.setAttribute('y', 100 - (gender.male/total)*maxH);
            barMale.setAttribute('height', (gender.male/total)*maxH);
            barFemale.setAttribute('y', 100 - (gender.female/total)*maxH);
            barFemale.setAttribute('height', (gender.female/total)*maxH);
        }
    }

    // --- COMPETENCY DOUGHNUT (Now populates legend) ---
    _renderCompetencyChart(stats) {
        const cc = stats.competency;
        const total = Object.values(cc).reduce((a,b)=>a+b,0);
        setText('competencyCenterNum', total);

        const config = {
            type: 'doughnut',
            data: { 
                labels: ['Exceeding Expectations', 'Meeting Expectations', 'Approaching Expectations', 'Below Expectations'], 
                datasets: [{ 
                    data: [cc.EE, cc.ME, cc.AE, cc.BE], 
                    backgroundColor: [DASH_PALETTE.green, DASH_PALETTE.blue, DASH_PALETTE.amber, DASH_PALETTE.rose],
                    borderWidth: 0, spacing: 2
                }] 
            },
            options: { responsive: true, maintainAspectRatio: false, cutout: '75%', plugins: { legend: { display: false } } }
        };
        this._getOrCreateChart('competencyChart', config);

        // Render dynamic legend HTML
        const legendEl = $('competencyLegend');
        if (legendEl) {
            const legendData = [
                { label: 'Exceeding', count: cc.EE, color: DASH_PALETTE.green },
                { label: 'Meeting', count: cc.ME, color: DASH_PALETTE.blue },
                { label: 'Approaching', count: cc.AE, color: DASH_PALETTE.amber },
                { label: 'Below', count: cc.BE, color: DASH_PALETTE.rose }
            ];
            legendEl.innerHTML = legendData.map(l => `
                <span style="display:flex; align-items:center; gap:6px;">
                    <span style="width:8px; height:8px; border-radius:50%; background:${l.color};"></span>
                    ${l.label} (${l.count})
                </span>
            `).join('');
        }
    }

    // --- PERFORMANCE TREND (Now updates Trend Pill) ---
    _renderPerformanceTrend(exams) {
        const subjAvgs = {};
        exams.forEach(e => {
            const sc = parseFloat(e.score) || 0;
            if (sc <= 0) return;
            const name = getSubjectName(e.subjectId) || 'General';
            if (!subjAvgs[name]) subjAvgs[name] = { total: 0, count: 0 };
            subjAvgs[name].total += sc;
            subjAvgs[name].count++;
        });

        const labels = Object.keys(subjAvgs).slice(0, 8);
        const data = labels.map(l => Math.round(subjAvgs[l].total / subjAvgs[l].count));
        
        // Update the UI Pill
        const pill = $('trendPill');
        if (pill && data.length > 1) {
            const firstHalf = data.slice(0, Math.floor(data.length/2));
            const secondHalf = data.slice(Math.floor(data.length/2));
            const avgFirst = firstHalf.reduce((a,b)=>a+b,0)/firstHalf.length;
            const avgSecond = secondHalf.reduce((a,b)=>a+b,0)/secondHalf.length;
            const diff = Math.round(avgSecond - avgFirst);
            
            if (diff > 0) pill.innerHTML = `<i class="fa-solid fa-arrow-trend-up" style="color:${DASH_PALETTE.green}"></i> +${diff}%`;
            else if (diff < 0) pill.innerHTML = `<i class="fa-solid fa-arrow-trend-down" style="color:${DASH_PALETTE.rose}"></i> ${diff}%`;
            else pill.innerHTML = `<i class="fa-solid fa-minus" style="color:${DASH_PALETTE.amber}"></i> Stable`;
        }

        if (labels.length === 0) return;

        const config = {
            type: 'line',
            data: { labels, datasets: [{ label: 'Subject Avg', data, borderColor: DASH_PALETTE.indigo, backgroundColor: 'rgba(99,102,241,0.1)', fill: true, tension: 0.4, pointBackgroundColor: '#fff', pointBorderColor: DASH_PALETTE.indigo, pointBorderWidth: 2, pointRadius: 4 }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, max: 100, grid: { color: 'rgba(0,0,0,0.05)' } }, x: { grid: { display: false } } } }
        };
        this._getOrCreateChart('performanceTrendChart', config);
    }

    // --- SUBJECT RADAR ---
    _renderSubjectRadar(exams) {
        const subjGroups = {};
        exams.forEach(e => {
            const sc = parseFloat(e.score) || 0;
            const name = getSubjectName(e.subjectId) || 'General';
            if (!subjGroups[name]) subjGroups[name] = [];
            if (sc > 0) subjGroups[name].push(sc);
        });

        const labels = Object.keys(subjGroups).slice(0, 6);
        if (labels.length === 0) return;

        const config = {
            type: 'radar',
            data: { labels, datasets: [{ label: 'Avg Score', data: labels.map(l => Math.round(subjGroups[l].reduce((a,b)=>a+b,0)/subjGroups[l].length)), backgroundColor: 'rgba(34,197,94,0.2)', borderColor: DASH_PALETTE.green, pointBackgroundColor: DASH_PALETTE.green }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { r: { suggestedMin: 0, suggestedMax: 100, grid: { color: 'rgba(0,0,0,0.05)' }, angleLines: { color: 'rgba(0,0,0,0.05)' }, pointLabels: { font: { size: 11 } } }} }
        };
        this._getOrCreateChart('subjectRadarChart', config);
    }

    // --- LEADERBOARD ---
    _renderLeaderboard(students, exams) {
        const container = $('leaderboardList');
        if (!container) return;

        const stats = students.map(s => {
            const sExams = exams.filter(e => e.studentId === s.id && parseFloat(e.score) > 0);
            const avg = sExams.length ? Math.round(sExams.reduce((a,b)=>a+parseFloat(b.score),0)/sExams.length) : 0;
            return { ...s, avg };
        }).filter(s => s.avg > 0).sort((a,b) => b.avg - a.avg).slice(0, 5);

        if (stats.length === 0) {
            container.innerHTML = `<div style="text-align:center; padding:20px; color:#94a3b8;">No assessment data yet.</div>`;
            return;
        }

        container.innerHTML = stats.map((s, i) => `
            <div onclick="viewStudent('${s.id}')" style="display:flex; align-items:center; padding:10px; border-radius:10px; cursor:pointer; transition:background 0.2s; gap:12px; ${i === 0 ? 'background:rgba(34,197,94,0.1);' : ''}" 
                 onmouseover="this.style.background='rgba(0,0,0,0.03)'" onmouseout="this.style.background='${i === 0 ? 'rgba(34,197,94,0.1)' : 'transparent'}'">
                <div style="font-weight:700; color:${i < 3 ? DASH_PALETTE.green : '#94a3b8'}; width:20px; text-align:center;">${i+1}</div>
                <img src="${s.photo || DEFAULT_AVATAR}" onerror="this.src='${DEFAULT_AVATAR}'" style="width:36px; height:36px; border-radius:50%; object-fit:cover; border:2px solid ${i===0 ? DASH_PALETTE.green : '#e2e8f0'}">
                <div style="flex:1; min-width:0;">
                    <div style="font-weight:600; font-size:14px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(s.name)}</div>
                    <div style="font-size:12px; color:#94a3b8;">${s.grade || ''}</div>
                </div>
                <div style="text-align:right;">
                    <div style="font-weight:700; color:${s.avg >= 50 ? DASH_PALETTE.green : DASH_PALETTE.rose};">${s.avg}%</div>
                    <div style="height:4px; width:50px; background:#e2e8f0; border-radius:2px; margin-top:4px; overflow:hidden;">
                        <div style="height:100%; width:${s.avg}%; background:${s.avg >= 50 ? DASH_PALETTE.green : DASH_PALETTE.rose}; border-radius:2px;"></div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // --- ACTIVITY FEED (Now Reactive to Filters) ---
    _renderActivityFeed() {
        const container = $('dashboardActivity');
        if (!container) return;
        
        let acts = [];
        const filter = this.state.activityFilter;

        if (filter === 'all' || filter === 'student') {
            StudentRepo.getAll().slice(-5).forEach(s => acts.push({ type: 'student', icon: 'fa-user-plus', color: DASH_PALETTE.blue, title: `New admission: ${s.name}`, meta: s.grade }));
        }
        if (filter === 'all' || filter === 'exam') {
            (store.exams||[]).filter(e => e.name || e.assessType).slice(-5).reverse().forEach(e => {
                acts.push({
                    type: 'exam', icon: 'fa-clipboard-check', color: DASH_PALETTE.green,
                    title: `${e.name || e.assessType || 'Assessment'} recorded`,
                    meta: e.grade || 'Learners',
                    ts: e.createdAt ? new Date(e.createdAt).getTime() : 0
                });
            });
        }
        if (filter === 'all' || filter === 'staff') {
            StaffRepo.getAll().slice(-3).forEach(s => acts.push({ type: 'staff', icon: 'fa-id-card', color: DASH_PALETTE.amber, title: `Staff update: ${s.name}`, meta: s.designation || s.role }));
        }

        if (acts.length === 0) {
            container.innerHTML = `<div style="text-align:center; padding:20px; color:#94a3b8;">No recent activity for this filter.</div>`;
            return;
        }

        const timeAgo = (ts) => {
            if (!ts) return '';
            const mins = Math.max(0, Math.floor((Date.now() - ts) / 60000));
            if (mins < 1) return 'Just now';
            if (mins < 60) return mins + 'm ago';
            const hrs = Math.floor(mins / 60);
            if (hrs < 24) return hrs + 'h ago';
            const days = Math.floor(hrs / 24);
            return days + 'd ago';
        };

        container.innerHTML = acts.sort((a, b) => (b.ts || 0) - (a.ts || 0)).map(act => `
            <div style="display:flex; align-items:center; gap:12px; padding:10px 0; border-bottom:1px solid rgba(0,0,0,0.03);">
                <div style="width:32px; height:32px; border-radius:8px; background:${act.color}15; color:${act.color}; display:flex; align-items:center; justify-content:center; font-size:12px; flex-shrink:0;">
                    <i class="fa-solid ${act.icon}"></i>
                </div>
                <div style="flex:1; min-width:0;">
                    <div style="font-size:13px; font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(act.title)}</div>
                    <div style="font-size:11px; color:#94a3b8;">${escapeHtml(act.meta||'')}</div>
                </div>
                <div style="font-size:10px; color:#cbd5e1; flex-shrink:0;">${timeAgo(act.ts) || 'Just now'}</div>
            </div>
        `).join('');
    }
}

// --- INITIALIZE GLOBAL INSTANCE ---
const dashboard = new DashboardEngine();

// --- CONVENIENCE WRAPPER ---
function renderDashboard() {
    dashboard.init();
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

// Export the current learner list to CSV (FIXED: button existed, no handler)
function exportLearnersCSV() {
    const students = StudentRepo.getAll();
    if (students.length === 0) { showToast('No learners to export.', 'error'); return; }
    const esc = (v) => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
    const headers = ['Name', 'Gender', 'DOB', 'Grade', 'Stream', 'Adm No', 'UPI', 'Guardian', 'Guardian Phone'];
    const lines = [headers.join(',')];
    students.forEach(s => {
        lines.push([s.name, s.gender, s.dob, s.grade, s.stream, s.reg, s.upiNumber, s.guardianName, s.guardianPhone].map(esc).join(','));
    });
    const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `learners_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    showToast(`Exported ${students.length} learners to CSV`);
}

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
    // FIXED: the Curricula assignment (learningArea.teacherId) is authoritative —
    // it's what the user sets in the subject modal. Fall back to staff.subjects.
    const area = (store.learningAreas || []).find(la => la.id === subjectId || la.code === subjectId);
    if (area && area.teacherId) {
        const t = StaffRepo.getById(area.teacherId);
        if (t && t.name) return t.name;
    }
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
    const requestedTerm = term || store.settings.currentTerm;
    const requestedYear = year || store.settings.academicYear;

    // Applicable learning areas for this grade
    const subjects = (store.learningAreas || []).filter(la =>
        la.applicableLevels && la.applicableLevels.includes(grade)
    );

    // FIXED: use flattenExams() — unpacks nested/virtual score records
    // (wrapper records with a scores map) that the old raw-store lookup
    // missed, which caused "No assessment data found" for valid records.
    const allStudentExams = flattenExams().filter(e => e.studentId === studentId);
    const scored = allStudentExams.filter(e => e.score != null && parseFloat(e.score) > 0);

    if (scored.length === 0) return null; // genuinely no scores for this learner

    // Resolve the effective term/year. Preference:
    //   1. the requested term/year, if it has scores
    //   2. the learner's most recent term/year that has scores
    //   3. any scores at all (records without term/year are always included)
    const TERM_ORDER = { 'Term 1': 1, 'Term 2': 2, 'Term 3': 3 };
    const byRecent = (a, b) =>
        String(b.year || '').localeCompare(String(a.year || '')) ||
        (TERM_ORDER[b.term] || 99) - (TERM_ORDER[a.term] || 99);

    const inRequested = scored.filter(e =>
        e.term === requestedTerm && String(e.year) === String(requestedYear));
    const undated = scored.filter(e => !e.term && !e.year);
    let effectiveTerm, effectiveYear, inScope;

    if (inRequested.length > 0) {
        effectiveTerm = requestedTerm; effectiveYear = requestedYear;
        inScope = [...inRequested, ...undated];
    } else {
        const dated = scored.filter(e => e.term && e.year).sort(byRecent);
        if (dated.length > 0) {
            effectiveTerm = dated[0].term; effectiveYear = dated[0].year;
            inScope = scored.filter(e =>
                (e.term === effectiveTerm && String(e.year) === String(effectiveYear)) || (!e.term && !e.year));
        } else {
            effectiveTerm = requestedTerm; effectiveYear = requestedYear;
            inScope = scored; // nothing dated — accept whatever exists
        }
    }

    // Detect assessment types present in the resolved scope.
    // FIXED: score records saved by the Assessment Centre carry NO type field —
    // the type lives on the wrapper record as assessType/name (flattenExams
    // copies those onto each unpacked record). Fall back through
    // type → assessType → assessName → a neutral label so valid records
    // are never rejected for lacking a type.
    const recType = (e) => (e.type && String(e.type).trim()) ||
        (e.assessType && String(e.assessType).trim()) ||
        (e.assessName && String(e.assessName).trim()) ||
        'Assessment';
    const typeSet = new Set();
    inScope.forEach(e => typeSet.add(recType(e)));
    const sortedTypes = [...typeSet].sort((a, b) =>
        (ASSESSMENT_TYPE_ORDER[a] || 99) - (ASSESSMENT_TYPE_ORDER[b] || 99)
    );
    if (sortedTypes.length === 0) return null;

    // Build rows
    const rows = subjects.map((subj, idx) => {
        const row = {
            num: idx + 1, subjectName: subj.name, subjectId: subj.id,
            teacherName: getSubjectTeacherName(subj.id, grade),
            scores: {}, total: 0, count: 0, avg: 0, rating: null
        };

        sortedTypes.forEach(type => {
            const exam = inScope.find(e =>
                e.subjectId === subj.id && recType(e) === type
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

    // Class rank calculation (same scope as this learner, via flattenExams too)
    const gradeStudents = StudentRepo.findBy('grade', grade);
    const gradeAvgs = gradeStudents.map(s => {
        const sExams = flattenExams().filter(e =>
            e.studentId === s.id && e.score != null && parseFloat(e.score) > 0 &&
            ((e.term === effectiveTerm && String(e.year) === String(effectiveYear)) || (!e.term && !e.year))
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
        student, term: effectiveTerm, year: effectiveYear, sortedTypes, rows,
        overallAvg, overallRating: overallAvg > 0 ? cbcRating(overallAvg) : null,
        rank, totalInGrade: gradeStudents.length,
        remarks: generateRemarks(rows, overallAvg, student)
    };
}

function renderReportCardToDoc(doc, data, startY) {
    // 1. Dynamic page dimensions (Adapts to A4, Letter, Legal, etc.)
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 12;
    const contentW = pageW - (margin * 2);
    let y = startY;
    const s = store.settings || {};

    // 8. Page break helper (Reserves 25mm at bottom for signatures/footer)
    function ensureSpace(neededHeight) {
        if (y + neededHeight > pageH - 25) {
            doc.addPage();
            drawMiniHeader(); // 16. Redraw header on new page
        }
    }

    // 16. Mini header for continuation pages
    function drawMiniHeader() {
        y = margin;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text(s.schoolName || 'School Name', pageW / 2, y + 5, { align: 'center' });
        doc.setFontSize(7);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100);
        doc.text('...Report Card Continued', pageW / 2, y + 10, { align: 'center' });
        doc.setDrawColor(34, 197, 94);
        doc.setLineWidth(0.5);
        doc.line(margin, y + 13, pageW - margin, y + 13);
        doc.setTextColor(0);
        y += 18;
    }

    // 17. Footer with page numbers
    function drawFooter() {
        const footY = pageH - 8;
        const currentPage = doc.internal.getNumberOfPages();
        doc.setFontSize(5.5);
        doc.setTextColor(150);
        doc.text(
            `Generated by ElimuTrack CBC Management System  |  Page ${currentPage}`,
            pageW / 2, footY, { align: 'center' }
        );
        doc.setTextColor(0);
    }

    // --- START PAGE 1 HEADER ---
    // 18. Logo support (Assumes s.logo is a base64 string or data URL)
    // FIXED: forced 'PNG' threw for JPEG/SVG logos, silently killing the whole
    // PDF. Detect the real format and skip gracefully if it can't be drawn.
    if (s.logo) {
        try {
            const m = String(s.logo).match(/^data:image\/(\w+)/);
            let fmt = m ? m[1].toUpperCase() : 'PNG';
            if (fmt === 'JPG') fmt = 'JPEG';
            if (fmt === 'SVG' || fmt === 'SVG+XML') throw new Error('SVG logo not supported by jsPDF');
            doc.addImage(s.logo, fmt, margin, y - 1, 12, 12);
        } catch (e) {
            console.warn('[REPORT] Logo skipped:', e.message);
        }
    }

    // 3. School name overflow protection & 21. Visual hierarchy (16pt)
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    const schoolNameLines = doc.splitTextToSize(s.schoolName || 'Friends Tande Primary & JS', contentW - (s.logo ? 18 : 0));
    doc.text(schoolNameLines, s.logo ? margin + 16 : pageW / 2, y + 6, { align: s.logo ? 'left' : 'center' });
    y += (schoolNameLines.length * 6) + 3;

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'italic');
    doc.text(`"${s.motto || ''}"`, pageW / 2, y, { align: 'center' });
    y += 5;

    // 4. Address lines split properly
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    if (s.address) {
        doc.text(s.address, pageW / 2, y, { align: 'center' });
        y += 3.5;
    }
    const contactLine = [s.phone, s.email].filter(Boolean).join('  |  ');
    if (contactLine) {
        doc.text(contactLine, pageW / 2, y, { align: 'center' });
        y += 3.5;
    }
    if (s.schoolCode || s.level || s.category) {
        doc.text(`Code: ${s.schoolCode || ''}   |   ${s.level || ''}   |   ${s.category || ''}`, pageW / 2, y, { align: 'center' });
        y += 4;
    }

    // Green double line
    doc.setDrawColor(34, 197, 94);
    doc.setLineWidth(1.5);
    doc.line(margin, y, pageW - margin, y);
    doc.setLineWidth(0.3);
    doc.line(margin, y + 2, pageW - margin, y + 2);
    y += 7;

    // Title
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('LEARNER ACADEMIC REPORT CARD', pageW / 2, y, { align: 'center' });
    y += 8;

    // 21. Subtle gray background for student info
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, y - 2, contentW, 20, 'F');

    // 5. Student names overflow protection
    doc.setFontSize(8.5);
    const c1 = margin + 4, c2 = pageW / 2 + 5;
    const maxNameW = (pageW / 2) - 30; // Limit width to prevent overwrite

    const info = [
        ['Full Name:', data.student.name, 'Admission No:', data.student.reg || 'N/A'],
        ['Grade:', data.student.grade, 'Stream:', data.student.stream || 'N/A'],
        ['Term:', data.term, 'Academic Year:', data.year],
    ];
    info.forEach(([l1, v1, l2, v2]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(l1, c1, y);
        doc.setFont('helvetica', 'normal');
        doc.text(String(v1 || ''), c1 + 22, y, { maxWidth: maxNameW });
        doc.setFont('helvetica', 'bold');
        doc.text(l2, c2, y);
        doc.setFont('helvetica', 'normal');
        doc.text(String(v2 || ''), c2 + 28, y);
        y += 5.5;
    });
    y += 6; // Spacing before table

    // --- MAIN TABLE ---
    const hasTeacher = data.rows.some(r => r.teacherName);
    const headers = ['#', 'Learning Area'];
    data.sortedTypes.forEach(t => headers.push(t));
    headers.push('Avg', 'Rating');
    if (hasTeacher) headers.push('Subject Teacher');

    // 13. Average formatting check
    const formatAvg = (avg) => avg > 0 ? (String(avg).includes('%') ? avg : avg + '%') : '—';

    const body = data.rows.map(r => {
        const row = [r.num, r.subjectName];
        data.sortedTypes.forEach(t => row.push(r.scores[t] != null ? r.scores[t] : '—'));
        row.push(formatAvg(r.avg));
        row.push(r.rating ? r.rating.code : '—');
        if (hasTeacher) row.push(r.teacherName || '—');
        return row;
    });

    const summaryRow = ['', 'OVERALL'];
    data.sortedTypes.forEach(() => summaryRow.push(''));
    summaryRow.push(formatAvg(data.overallAvg));
    summaryRow.push(data.overallRating ? data.overallRating.code : '—');
    if (hasTeacher) summaryRow.push('');

    // 6. Strict AutoTable width control & 7. Linebreak for teachers
    const colStyles = {
        0: { halign: 'center', cellWidth: 8 },
        1: { cellWidth: hasTeacher ? 45 : 55, overflow: 'linebreak' },
    };
    
    data.sortedTypes.forEach((_, i) => {
        colStyles[2 + i] = { halign: 'center', cellWidth: 14 }; // Numeric columns shrink-safe
    });
    
    const avgIdx = 2 + data.sortedTypes.length;
    colStyles[avgIdx] = { halign: 'center', cellWidth: 15, fontStyle: 'bold' };
    
    const ratingIdx = avgIdx + 1;
    colStyles[ratingIdx] = { halign: 'center', cellWidth: 15, fontStyle: 'bold' };
    
    if (hasTeacher) {
        colStyles[ratingIdx + 1] = { cellWidth: 35, fontSize: 6.5, overflow: 'linebreak' };
    }

    const totalRows = body.length;
    const bodyWithSummary = [...body, summaryRow];

    // 20. Color maps for cell backgrounds
    const ratingStyles = {
        'EE': { bg: [209, 250, 229], text: [22, 163, 74] },
        'ME': { bg: [219, 234, 254], text: [37, 99, 235] },
        'AE': { bg: [254, 243, 199], text: [217, 119, 6] },
        'BE': { bg: [254, 226, 226], text: [220, 38, 38] }
    };

    doc.autoTable({
        startY: y,
        head: [headers],
        body: bodyWithSummary,
        margin: { left: margin, right: margin, bottom: 25 }, // 14. Reserve bottom space
        tableWidth: contentW, // 6. Force exact width to page bounds
        
        styles: {
            fontSize: 7.5, cellPadding: 2, lineColor: [210, 210, 210], lineWidth: 0.2,
            font: 'helvetica', valign: 'middle', overflow: 'linebreak'
        },
        headStyles: {
            fillColor: [15, 23, 42], textColor: [255, 255, 255], // 21. Dark header
            fontStyle: 'bold', fontSize: 7.5, halign: 'center'
        },
        bodyStyles: { textColor: [30, 41, 59] },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: colStyles,
        
        // 16. Page continuation support
        didAddPage: function (data) {
            drawMiniHeader();
            data.settings.startY = 14; // Resume below the mini header (FIXED: was the original y)
        },
        didDrawPage: function () {
            drawFooter();
        },

        didParseCell: function (tableData) {
            if (tableData.row.index === totalRows && tableData.section === 'body') {
                tableData.cell.styles.fillColor = [236, 253, 245];
                tableData.cell.styles.fontStyle = 'bold';
                tableData.cell.styles.fontSize = 8;
                return;
            }
            
            // 20. Apply Performance Colors to Rating Cells
            if (tableData.column.index === ratingIdx && tableData.section === 'body' && tableData.row.index < totalRows) {
                const v = tableData.cell.raw;
                if (ratingStyles[v]) {
                    tableData.cell.styles.fillColor = ratingStyles[v].bg;
                    tableData.cell.styles.textColor = ratingStyles[v].text;
                    tableData.cell.styles.fontStyle = 'bold';
                }
            }
            
            // Color code individual score cells (Text color + Bold)
            if (tableData.section === 'body' && typeof tableData.cell.raw === 'number') {
                let color = null;
                if (tableData.cell.raw >= 80) color = [22, 163, 74];
                else if (tableData.cell.raw >= 50) color = [37, 99, 235];
                else if (tableData.cell.raw >= 30) color = [217, 119, 6];
                else if (tableData.cell.raw > 0) color = [220, 38, 38];
                
                if(color) {
                    tableData.cell.styles.textColor = color;
                    tableData.cell.styles.fontStyle = 'bold';
                }
            }
        }
    });

    y = doc.lastAutoTable.finalY + 8;

    // --- SUMMARY BOX ---
    // 9. Dynamic height calculation for summary
    const summaryText2 = `Overall Rating: ${data.overallRating ? data.overallRating.text : 'N/A'} ${data.overallRating ? `[${data.overallRating.code}]` : ''}`;
    const sumLines = doc.splitTextToSize(summaryText2, 80);
    const summaryH = Math.max(14, sumLines.length * 4 + 10); 

    ensureSpace(summaryH + 10);

    doc.setDrawColor(34, 197, 94);
    doc.setLineWidth(0.6);
    doc.setFillColor(248, 253, 250);
    // 11. Draw fill and stroke in one call
    doc.roundedRect(margin, y, contentW, summaryH, 3, 3, 'FD');

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text('PERFORMANCE SUMMARY', margin + 6, y + 6);

    // 21. Hierarchy (Average larger/bolder)
    doc.setFontSize(9);
    doc.text(`Total Average: ${data.overallAvg}%`, margin + 6, y + 12);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(summaryText2, margin + 60, y + 12);
    doc.text(`Position: ${data.rank} out of ${data.totalInGrade}`, margin + 145, y + 12);

    // 12. Safe rating color crash prevention
    if (data.overallRating?.color) {
        const rgb = hexToRgb(data.overallRating.color);
        if (rgb) {
            doc.setTextColor(...rgb);
            doc.setFont('helvetica', 'bold');
            doc.text(`[${data.overallRating.code}]`, margin + 195, y + 12);
            doc.setTextColor(0);
        }
    }
    y += summaryH + 6;

    // --- REMARKS ---
    // 10. Dynamic height for remarks
    const remarksLines = doc.splitTextToSize(data.remarks || 'No remarks provided.', contentW - 10);
    const remarksH = Math.max(26, remarksLines.length * 3.5 + 12);

    ensureSpace(remarksH + 10);

    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, contentW, remarksH, 2, 2, 'S');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text("CLASS TEACHER'S REMARKS:", margin + 5, y + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(remarksLines, margin + 5, y + 12);
    y += remarksH + 8;

    // --- SIGNATURES ---
    // 15. Better signature structure
    ensureSpace(25);

    const segW = contentW / 3;
    const today = new Date().toLocaleDateString('en-KE', { day: '2-digit', month: 'long', year: 'numeric' });

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    
    // Teacher
    doc.text('Class Teacher', margin + segW * 0.5, y, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setLineWidth(0.3);
    doc.line(margin + 15, y + 4, margin + segW - 15, y + 4);
    doc.setFontSize(6.5);
    doc.text('Signature & Name', margin + segW * 0.5, y + 9, { align: 'center' });

    // Principal
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('Head of Institution', margin + segW * 1.5, y, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.line(margin + segW + 15, y + 4, margin + segW * 2 - 15, y + 4);
    doc.setFontSize(6.5);
    doc.text(s.hoiName || 'Signature & Name', margin + segW * 1.5, y + 9, { align: 'center' });

    // Date
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('Date', margin + segW * 2.5, y, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.line(margin + segW * 2 + 15, y + 4, margin + segW * 3 - 15, y + 4);
    doc.setFontSize(6.5);
    doc.text(today, margin + segW * 2.5, y + 9, { align: 'center' });

    y += 20;

    // --- 19. RATING LEGEND ---
    ensureSpace(10);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('Legend:', margin, y);
    doc.setFont('helvetica', 'normal');
    
    const legendItems = [
        { code: 'EE', desc: 'Exceeding Expectations', color: [22, 163, 74] },
        { code: 'ME', desc: 'Meets Expectations', color: [37, 99, 235] },
        { code: 'AE', desc: 'Approaching Expectations', color: [217, 119, 6] },
        { code: 'BE', desc: 'Below Expectations', color: [220, 38, 38] }
    ];
    
    let legendX = margin + 20;
    legendItems.forEach(item => {
        doc.setTextColor(...item.color);
        doc.text(item.code, legendX, y);
        doc.setTextColor(0);
        doc.text(`- ${item.desc}`, legendX + 8, y);
        legendX += 42;
    });

    drawFooter();

    return y;
}
// --- Color helper ---
function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
}
// --- Ensure jsPDF + autoTable are loaded (retries the CDN on demand) ---
const loadScriptTag = (src) => new Promise((resolve) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.head.appendChild(s);
});
async function ensureJsPdfLoaded() {
    if (typeof jspdf !== 'undefined' && typeof jspdf.jsPDF === 'function') return true;
    console.warn('[PDF] jsPDF missing — trying local vendor files first');
    const l1 = await loadScriptTag('vendor/jspdf.umd.min.js');
    const l2 = await loadScriptTag('vendor/jspdf.plugin.autotable.min.js');
    await new Promise(r => setTimeout(r, 200));
    if (typeof jspdf !== 'undefined' && typeof jspdf.jsPDF === 'function') return true;
    // Try multiple CDNs (school networks often block some of them)
    const sources = [
        'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
        'https://unpkg.com/jspdf@2.5.1/dist/jspdf.umd.min.js',
        'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js'
    ];
    for (const src of sources) {
        console.warn('[PDF] trying jsPDF CDN:', src);
        await loadScriptTag(src);
        await loadScriptTag('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js');
        await new Promise(r => setTimeout(r, 300));
        if (typeof jspdf !== 'undefined' && typeof jspdf.jsPDF === 'function') return true;
    }
    return false;
}

// --- Fallback when jsPDF cannot be loaded at all: print the MODERN preview ---
// (browser-native print → "Save as PDF". No html2canvas, so no clipping.)
function downloadReportCardViaPrint(studentId) {
    const student = StudentRepo.getById(studentId);
    if (!student) { showToast('Learner not found.', 'error'); return; }
    try {
        // Ensure the modern preview exists for this learner
        const sel = $('reportLearnerSelect');
        if (sel) sel.value = studentId;
        generateIndividualReport();
        const page = $('individualReportPage');
        if (!page || !page.innerHTML.trim()) { showToast('Could not build the report preview.', 'error'); return; }

        const printWin = window.open('', '_blank', 'width=920,height=720');
        if (!printWin) { showToast('Pop-up blocked. Allow pop-ups for this site.', 'error'); return; }
        printWin.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Report Card — ${escapeHtml(student.name)}</title>
        <style>
            * { margin:0; padding:0; box-sizing:border-box }
            body { font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; background:#fff; color:#0f172a }
            @page { size: A4; margin: 10mm }
            .rpt-sheet { width: 190mm; margin: 0 auto }
            /* override the inline A4 sheet so it flows in the print window */
            .rpt-sheet > div { width: 190mm !important; min-height: auto !important; padding: 0 !important; box-shadow: none !important; }
            table { page-break-inside: auto }
            tr { page-break-inside: avoid }
        </style></head><body>
        <div class="rpt-sheet">${page.innerHTML}</div>
        <script>setTimeout(function(){ window.print(); }, 500);<\/script>
        </body></html>`);
        printWin.document.close();
        showToast('Choose "Save as PDF" in the print dialog', 'info');
    } catch (err) {
        console.error('[REPORT PRINT FALLBACK]', err);
        showToast('Could not open the print window: ' + err.message, 'error');
    }
}

// ═══════════════════════════════════════════════════════════════════════
//   MODERN A4 REPORT CARD (overhaul)
//   • One column per assessment type done in the Assessments section
//     (Opener, Mid Term, End Term, ...) — dynamic, in assessment order
//   • Only learning areas that actually have scores appear on the card
//   • Pure vector jsPDF — no screenshots, no clipping
// ═══════════════════════════════════════════════════════════════════════
const RPT_C = {
    green: [22, 163, 74],      // #16a34a school green
    slate: [30, 41, 59],       // #1e293b
    light: [241, 245, 249],    // #f1f5f9
    border: [226, 232, 240],   // #e2e8f0
    white: [255, 255, 255],
    muted: [100, 116, 139],    // #64748b
    ee: [34, 197, 94],         // #22c55e
    me: [59, 130, 246],        // #3b82f6
    ae: [245, 158, 11],        // #f59e0b
    be: [239, 68, 68],         // #ef4444
    dark: [15, 23, 42]         // #0f172a
};
const RPT_BAND_CODES = { EE: 'EE', ME: 'ME', AE: 'AE', BE: 'BE' };
const RPT_RATING_COLOR = (code) => code === 'EE' ? RPT_C.ee : code === 'ME' ? RPT_C.me : code === 'AE' ? RPT_C.ae : RPT_C.be;

function reportTypeLabel(e) {
    if (e && e.type && e.type !== 'assessment' && String(e.type).trim()) return String(e.type).trim();
    if (e && e.assessType && String(e.assessType).trim()) return String(e.assessType).trim();
    if (e && e.assessName && String(e.assessName).trim()) return String(e.assessName).replace(/\s*[—–-]\s*.*$/, '').trim();
    return 'Assessment';
}

// Distinct assessment types present for the grade in the term/year scope
function collectAssessmentColumns(grade, term, year) {
    const cols = [], seen = new Set();
    (store.exams || []).forEach(e => {
        if (!e || !(e.scores && typeof e.scores === 'object' && Object.keys(e.scores).length > 0)) return;
        if (e.grade && e.grade !== grade) return;
        const inScope = (!term || !e.term || e.term === term) && (!year || !e.year || String(e.year) === String(year));
        if (!inScope) return;
        const label = reportTypeLabel(e);
        if (!seen.has(label)) { seen.add(label); cols.push(label); }
    });
    // FIXED: order columns by the standard assessment sequence
    // (Opener → Mid Term → End Term → End Year); custom types follow alphabetically
    cols.sort((a, b) => {
        const oa = ASSESSMENT_TYPE_ORDER[a] || 99;
        const ob = ASSESSMENT_TYPE_ORDER[b] || 99;
        if (oa !== ob) return oa - ob;
        return String(a).localeCompare(String(b));
    });
    return cols;
}

function getModernReportData(studentId, term, year) {
    const student = StudentRepo.getById(studentId);
    if (!student) return null;
    const grade = student.grade;
    const reqTerm = term || store.settings.currentTerm;
    const reqYear = year || store.settings.academicYear;

    const all = flattenExams().filter(e => e.studentId === studentId && e.score != null && parseFloat(e.score) > 0);
    if (all.length === 0) return null;

    // Resolve effective term/year: requested → most recent with data → undated
    const TERM_ORDER = { 'Term 1': 1, 'Term 2': 2, 'Term 3': 3 };
    const byRecent = (a, b) => String(b.year || '').localeCompare(String(a.year || '')) ||
        (TERM_ORDER[b.term] || 99) - (TERM_ORDER[a.term] || 99);
    const inRequested = all.filter(e => e.term === reqTerm && String(e.year) === String(reqYear));
    const undated = all.filter(e => !e.term && !e.year);
    let effectiveTerm, effectiveYear, inScope;
    if (inRequested.length > 0) {
        effectiveTerm = reqTerm; effectiveYear = reqYear;
        inScope = [...inRequested, ...undated];
    } else {
        const dated = all.filter(e => e.term && e.year).sort(byRecent);
        if (dated.length > 0) {
            effectiveTerm = dated[0].term; effectiveYear = dated[0].year;
            inScope = all.filter(e => (e.term === effectiveTerm && String(e.year) === String(effectiveYear)) || (!e.term && !e.year));
        } else {
            effectiveTerm = reqTerm; effectiveYear = reqYear;
            inScope = all;
        }
    }

    const columns = collectAssessmentColumns(grade, effectiveTerm, effectiveYear);
    if (columns.length === 0) columns.push('Assessment');

    // ONLY subjects/learning areas that have scores in scope
    const subjects = (store.learningAreas || []).filter(la => la.applicableLevels && la.applicableLevels.includes(grade));
    const rows = [];
    subjects.forEach((subj) => {
        const scores = {};
        let total = 0, count = 0;
        columns.forEach(c => {
            const rec = inScope.find(e => e.subjectId === subj.id && reportTypeLabel(e) === c);
            const sc = rec ? parseInt(rec.score) || 0 : 0;
            scores[c] = sc;
            if (sc > 0) { total += sc; count++; }
        });
        if (count === 0) return; // skip learning areas absent from assessments
        const avg = Math.round(total / count);
        rows.push({
            num: rows.length + 1, subjectName: subj.name, subjectId: subj.id,
            teacherName: getSubjectTeacherName(subj.id, grade),
            scores, avg, rating: cbcRating(avg)
        });
    });
    if (rows.length === 0) return null;

    const overallAvg = Math.round(rows.reduce((s, r) => s + r.avg, 0) / rows.length);

    // Rank within grade, same scope
    const gradeStudents = StudentRepo.findBy('grade', grade);
    const gradeAvgs = gradeStudents.map(s => {
        const sExams = flattenExams().filter(e =>
            e.studentId === s.id && e.score != null && parseFloat(e.score) > 0 &&
            ((e.term === effectiveTerm && String(e.year) === String(effectiveYear)) || (!e.term && !e.year)));
        if (sExams.length === 0) return -1;
        const subjMap = {};
        sExams.forEach(e => {
            if (!subjMap[e.subjectId]) subjMap[e.subjectId] = [];
            subjMap[e.subjectId].push(parseInt(e.score) || 0);
        });
        const avgs = Object.values(subjMap).map(sc => Math.round(sc.reduce((a, b) => a + b, 0) / sc.length));
        return avgs.reduce((a, b) => a + b, 0) / avgs.length;
    }).filter(a => a >= 0).sort((a, b) => b - a);
    let rank = '-';
    for (let i = 0; i < gradeAvgs.length; i++) {
        if (Math.abs(gradeAvgs[i] - overallAvg) < 0.5) { rank = i + 1; break; }
    }

    return {
        student, term: effectiveTerm, year: effectiveYear, columns, rows,
        overallAvg, overallRating: cbcRating(overallAvg),
        rank, totalInGrade: gradeStudents.length,
        remarks: generateRemarks(rows, overallAvg, student)
    };
}

function renderModernReportCard(doc, data) {
    const pageW = doc.internal.pageSize.getWidth();   // 210
    const pageH = doc.internal.pageSize.getHeight();  // 297
    const M = 14;
    const contentW = pageW - M * 2;
    const s = store.settings || {};
    let y = 14;

    // ── Letterhead ──
    let logoW = 0;
    if (s.logo) {
        try {
            const m = String(s.logo).match(/^data:image\/(\w+)/);
            let fmt = m ? m[1].toUpperCase() : 'PNG';
            if (fmt === 'JPG') fmt = 'JPEG';
            if (fmt !== 'SVG' && fmt !== 'SVG+XML') {
                doc.addImage(s.logo, fmt, M, y, 20, 20);
                logoW = 26;
            }
        } catch (_) { /* skip logo */ }
    }
    const tx = M + logoW;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(15); doc.setTextColor(...RPT_C.slate);
    doc.text(String(s.schoolName || 'SCHOOL NAME'), tx, y + 7);
    doc.setFont('helvetica', 'italic'); doc.setFontSize(8.5); doc.setTextColor(...RPT_C.muted);
    if (s.motto) doc.text(String(s.motto), tx, y + 12);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
    const contact = [s.address, s.phone, s.email].filter(Boolean).join('  ·  ');
    if (contact) doc.text(contact, tx, y + 16);
    // right-side meta
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8);
    doc.setTextColor(...RPT_C.muted);
    doc.text(`CODE: ${s.schoolCode || '—'}`, pageW - M, y + 7, { align: 'right' });
    doc.text(`LEVEL: ${s.level || '—'}`, pageW - M, y + 12, { align: 'right' });
    doc.text(`CATEGORY: ${s.category || '—'}`, pageW - M, y + 16, { align: 'right' });
    y += 21;
    // accent bar
    doc.setFillColor(...RPT_C.green); doc.roundedRect(M, y, contentW, 1.6, 0.8, 0.8, 'F');
    y += 5;

    // ── Title band ──
    doc.setFillColor(...RPT_C.slate); doc.roundedRect(M, y, contentW, 10, 1.6, 1.6, 'F');
    doc.setTextColor(...RPT_C.white); doc.setFont('helvetica', 'bold'); doc.setFontSize(12.5);
    doc.text('LEARNER ACADEMIC REPORT CARD', pageW / 2, y + 6.6, { align: 'center' });
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
    doc.text(`${data.term} — ${data.year}`, pageW - M - 4, y + 6.6, { align: 'right' });
    y += 14;

    // ── Learner info card ──
    const st = data.student;
    const age = st.dob ? Math.floor((Date.now() - new Date(st.dob).getTime()) / 31557600000) : null;
    const fields1 = [
        ['Full Name', st.name || '—'],
        ['Admission No', st.reg || '—'],
        ['Grade', st.grade || '—'],
        ['Stream', st.stream || '—']
    ];
    const fields2 = [
        ['Gender', st.gender || '—'],
        ['Age', age && age > 0 ? age + ' yrs' : '—'],
        ['Position', String(data.rank)],
        ['Out of', String(data.totalInGrade)]
    ];
    const infoH = 22;
    doc.setFillColor(...RPT_C.light); doc.setDrawColor(...RPT_C.border);
    doc.roundedRect(M, y, contentW, infoH, 2, 2, 'FD');
    const colW = contentW / 4;
    const drawField = (f, x, yy) => {
        doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(...RPT_C.muted);
        doc.text(f[0].toUpperCase(), x, yy);
        doc.setFont('helvetica', 'bold'); doc.setFontSize(9.5); doc.setTextColor(...RPT_C.dark);
        doc.text(String(f[1]).slice(0, 28), x, yy + 4.8);
    };
    fields1.forEach((f, i) => drawField(f, M + 4 + i * colW, y + 6));
    fields2.forEach((f, i) => drawField(f, M + 4 + i * colW, y + 15));
    y += infoH + 6;

    // ── Subject performance table (with assigned Teacher column) ──
    const minColW = 13;
    const typeColW = Math.max(minColW, Math.min(26, (contentW - 8 - 40 - 26 - 13 - 15) / data.columns.length));
    const headers = ['#', 'Learning Area', 'Teacher', ...data.columns, 'Avg', 'Rating'];
    const colWidths = [8, 40, 26, ...data.columns.map(() => typeColW), 13, 15];
    const bodyWithSummary = data.rows.map(r => [
        r.num,
        r.subjectName,
        (r.teacherName && r.teacherName !== '—' && r.teacherName !== '') ? r.teacherName : '—',
        ...data.columns.map(c => (r.scores[c] > 0 ? r.scores[c] + '%' : '—')),
        r.avg > 0 ? r.avg + '%' : '—',
        r.rating ? r.rating.code : '—'
    ]);
    bodyWithSummary.push([
        '', 'OVERALL', '', ...data.columns.map(() => ''),
        data.overallAvg + '%', data.overallRating ? data.overallRating.code : '—'
    ]);

    doc.autoTable({
        startY: y,
        head: [headers],
        body: bodyWithSummary,
        margin: { left: M, right: M, bottom: 20 },
        tableWidth: contentW,
        styles: { font: 'helvetica', fontSize: 8, cellPadding: 1.8, textColor: RPT_C.dark, lineColor: RPT_C.border, lineWidth: 0.2 },
        headStyles: { fillColor: RPT_C.slate, textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center', fontSize: 8 },
        columnStyles: {
            0: { halign: 'center', cellWidth: colWidths[0] },
            1: { cellWidth: colWidths[1], fontStyle: 'bold' },
            2: { cellWidth: colWidths[2], fontSize: 7.5, textColor: RPT_C.muted },
            [headers.length - 2]: { halign: 'center', cellWidth: colWidths[colWidths.length - 2], fontStyle: 'bold' },
            [headers.length - 1]: { halign: 'center', cellWidth: colWidths[colWidths.length - 1], fontStyle: 'bold' }
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        didParseCell: (td) => {
            if (!td.styles) return; // width-calculation pass — no styles yet
            if (td.section !== 'body') return;
            const rowIdx = td.row.index;
            if (rowIdx >= data.rows.length) { // OVERALL row
                if (td.column.index >= 1) td.styles.fillColor = [220, 252, 231];
                td.styles.fontStyle = 'bold';
                if (td.column.index === 0) td.styles.fillColor = [220, 252, 231];
                return;
            }
            // columns: 0=#, 1=Learning Area, 2=Teacher, 3..3+N-1=types, 3+N=Avg, 4+N=Rating
            const colIdx = td.column.index;
            const N = data.columns.length;
            if (colIdx === 0) { td.styles.halign = 'center'; return; }
            if (colIdx === 1) return;
            if (colIdx === 2) return; // teacher — styled via columnStyles
            const row = data.rows[rowIdx];
            const rating = row.rating;
            if (colIdx >= 3 && colIdx < 3 + N) {
                // raw may be '78%' or '—'
                const raw = td.cell.raw;
                if (typeof raw === 'string' && raw.endsWith('%')) {
                    const sc = parseInt(raw, 10) || 0;
                    const r = cbcRating(sc);
                    if (r) { td.styles.textColor = r.color ? r.color : RPT_C.dark; td.styles.fontStyle = 'bold'; td.styles.halign = 'center'; }
                } else td.styles.halign = 'center';
                return;
            }
            td.styles.halign = 'center';
            if (colIdx === 3 + N) { // avg
                td.styles.fontStyle = 'bold';
                if (rating) { td.styles.textColor = rating.color; }
                return;
            }
            // rating col
            if (rating) {
                td.styles.fillColor = RPT_RATING_COLOR(rating.code);
                td.styles.textColor = [255, 255, 255];
                td.styles.fontStyle = 'bold';
            }
        },
        didAddPage: (td) => {
            doc.setFillColor(...RPT_C.slate);
            doc.roundedRect(M, 6, contentW, 5, 1.2, 1.2, 'F');
            doc.setTextColor(...RPT_C.white); doc.setFont('helvetica', 'bold'); doc.setFontSize(7);
            doc.text('LEARNER ACADEMIC REPORT CARD — CONTINUED', pageW / 2, 9.4, { align: 'center' });
            td.settings.startY = 14;
        }
    });

    y = doc.lastAutoTable.finalY + 7;

    // ── Summary strip (3 boxes) ──
    const boxW = (contentW - 8) / 3;
    const boxItems = [
        ['MEAN SCORE', data.overallAvg + '%'],
        ['OVERALL RATING', data.overallRating ? data.overallRating.code : '—'],
        ['CLASS POSITION', String(data.rank) + ' of ' + String(data.totalInGrade)]
    ];
    const ensure = (need) => { if (y + need > pageH - 16) { doc.addPage(); y = 14; } };
    ensure(16);
    boxItems.forEach((b, i) => {
        const bx = M + i * (boxW + 4);
        doc.setFillColor(...(i === 1 ? RPT_C.green : RPT_C.light));
        doc.setDrawColor(...RPT_C.border);
        doc.roundedRect(bx, y, boxW, 13, 2, 2, 'FD');
        doc.setFont('helvetica', 'bold'); doc.setFontSize(6.5);
        doc.setTextColor(...(i === 1 ? RPT_C.white : RPT_C.muted));
        doc.text(b[0], bx + 4, y + 4.4);
        doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
        doc.setTextColor(...(i === 1 ? RPT_C.white : RPT_C.dark));
        doc.text(b[1], bx + 4, y + 10.4);
    });
    y += 19;

    // ── Remarks ──
    ensure(30);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(...RPT_C.dark);
    doc.text('CLASS TEACHER’S REMARKS', M, y);
    doc.setDrawColor(...RPT_C.green); doc.setLineWidth(0.5);
    doc.line(M, y + 1.2, M + 46, y + 1.2);
    y += 4;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(...RPT_C.slate);
    const remarkLines = doc.splitTextToSize(String(data.remarks || ''), contentW - 4);
    doc.text(remarkLines, M + 2, y + 3);
    y += remarkLines.length * 4.2 + 4;

    // ── Signatures ──
    ensure(26);
    const sigW = (contentW - 16) / 3;
    const sigLabels = ['CLASS TEACHER', s.hoiTitle || 'HEAD OF INSTITUTION', 'DATE'];
    sigLabels.forEach((lab, i) => {
        const sx = M + i * (sigW + 8);
        doc.setDrawColor(...RPT_C.border); doc.setLineWidth(0.4);
        doc.line(sx, y + 8, sx + sigW, y + 8);
        doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(...RPT_C.muted);
        doc.text(lab, sx, y + 12);
    });
    y += 17;

    // ── Legend ──
    ensure(12);
    const legendItems = [['EE', 'Exceeding (80–100)', RPT_C.ee], ['ME', 'Meeting (50–79)', RPT_C.me], ['AE', 'Approaching (30–49)', RPT_C.ae], ['BE', 'Below (0–29)', RPT_C.be]];
    const chipW = contentW / 4;
    legendItems.forEach((li, i) => {
        const lx = M + i * chipW;
        doc.setFillColor(...li[2]); doc.roundedRect(lx, y, 4.5, 4.5, 1, 1, 'F');
        doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(...RPT_C.dark);
        doc.text(li[0], lx + 6.5, y + 3.4);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5); doc.setTextColor(...RPT_C.muted);
        doc.text(li[1], lx + 6.5, y + 6.8);
    });
    y += 10;

    // ── Footer with page numbers ──
    const pages = doc.internal.getNumberOfPages();
    for (let p = 1; p <= pages; p++) {
        doc.setPage(p);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(...RPT_C.muted);
        doc.text(`${s.schoolName || 'School'} — Learner Report Card`, M, pageH - 6);
        doc.text(`Page ${p} of ${pages}`, pageW - M, pageH - 6, { align: 'right' });
        doc.setDrawColor(...RPT_C.border); doc.setLineWidth(0.3);
        doc.line(M, pageH - 9, pageW - M, pageH - 9);
    }
    return y;
}

// --- Download Single Student Report Card ---
async function downloadStudentReportCard(studentId) {
    // Honor the Reports-section term/year filters when they are set to a
    // specific value (FIXED: previously always used settings defaults)
    const termFilter = $('reportTermFilter')?.value;
    const yearFilter = $('reportYearFilter')?.value;
    const data = getModernReportData(studentId,
        (termFilter && termFilter !== 'all') ? termFilter : undefined,
        (yearFilter && yearFilter !== 'all') ? yearFilter : undefined);
    if (!data) {
        // Diagnostic: helps identify why no data resolved for this learner
        try {
            const flat = flattenExams().filter(e => e.studentId === studentId);
            const scored = flat.filter(e => e.score != null && parseFloat(e.score) > 0);
            console.warn(`[REPORT] No report data for ${studentId}: flat=${flat.length} scored=${scored.length} exams=${(store.exams || []).length}`);
        } catch (_) { /* ignore */ }
        showToast('No assessment data found for this student this term.', 'error');
        return;
    }
    // Pre-flight: the primary renderer depends on two CDN libraries. Try to
    // reload them on demand first; only fall back if the network still fails.
    if (!(await ensureJsPdfLoaded())) {
        console.warn('[REPORT] jsPDF still unavailable — using backup renderer');
        downloadReportCardViaPrint(studentId);
        return;
    }
    try {
        // FIXED (root cause): jsPDF instances have no `.doc` property — destructuring
                    // produced `undefined` and every PDF silently fell back to
                    // the backup renderer. Use the instance directly.
                    const doc = new jspdf.jsPDF('p', 'mm', 'a4');
        if (typeof doc.autoTable !== 'function') {
            console.warn('[REPORT] autoTable plugin not loaded — using backup renderer');
            downloadReportCardViaPrint(studentId);
            return;
        }
        renderModernReportCard(doc, data);
        const fname = `Report_${data.student.name.replace(/\s+/g, '_')}_${data.term}_${data.year}.pdf`;
        doc.save(fname);
        showToast(`Downloaded: ${fname}`);
    } catch (err) {
        console.error('[REPORT PDF]', err);
        // Backup attempt before giving up
        try {
            downloadReportCardViaPrint(studentId);
        } catch (err2) {
            console.error('[REPORT PDF FALLBACK FAILED]', err2);
            showToast('PDF generation failed: ' + (err.message || err), 'error');
        }
    }
}
// --- Compact card for learners with no assessment data (so EVERY learner
//     in the grade appears in the bulk PDF) ---
function renderNoDataCard(doc, student, term, year) {
    const pageW = doc.internal.pageSize.getWidth();
    const s = store.settings || {};
    const M = 14;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(15); doc.setTextColor(30, 41, 59);
    doc.text(String(s.schoolName || 'SCHOOL NAME'), pageW / 2, 30, { align: 'center' });
    doc.setFont('helvetica', 'italic'); doc.setFontSize(9); doc.setTextColor(100, 116, 139);
    doc.text(String(s.motto || ''), pageW / 2, 36, { align: 'center' });
    doc.setDrawColor(22, 163, 74); doc.setLineWidth(1);
    doc.line(M, 41, pageW - M, 41);
    doc.setFillColor(30, 41, 59); doc.roundedRect(M, 50, pageW - 2 * M, 10, 1.6, 1.6, 'F');
    doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(12);
    doc.text('LEARNER ACADEMIC REPORT CARD', pageW / 2, 57.4, { align: 'center' });
    doc.setFontSize(9);
    doc.text(`${term || ''} — ${year || ''}`, pageW / 2, 63, { align: 'center' });
    doc.setFont('helvetica', 'normal'); doc.setFontSize(11); doc.setTextColor(30, 41, 59);
    doc.text(`No assessment data recorded for ${student.name} (${student.reg || ''}) this term.`, pageW / 2, 90, { align: 'center' });
    doc.setFontSize(9); doc.setTextColor(100, 116, 139);
    doc.text('Record scores in the Assessment section, then regenerate this report.', pageW / 2, 97, { align: 'center' });
}

// --- Download Full Grade Report (all students, one PDF) ---
async function downloadGradeReport(grade) {
    let students = StudentRepo.findBy('grade', grade);
    if (students.length === 0) {
        showToast(`No learners found in ${grade}.`, 'error');
        return;
    }

    // FIXED: respect the Stream filter and sort by name for clean ordering
    const stream = $('reportStreamFilter')?.value;
    if (stream && stream !== 'all') students = students.filter(s => s.stream === stream);
    students.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    const termF = $('reportTermFilter')?.value;
    const yearF = $('reportYearFilter')?.value;
    const term = (termF && termF !== 'all') ? termF : store.settings.currentTerm;
    const year = (yearF && yearF !== 'all') ? yearF : store.settings.academicYear;

    // FIXED: wrapped in try/catch — silent failures looked like dead buttons.
    if (!(await ensureJsPdfLoaded())) {
        showToast('PDF library failed to load. Use "Print All Report Cards" instead, then refresh.', 'error');
        return;
    }
    try {
        // FIXED (root cause): jsPDF instances have no `.doc` property — destructuring
                    // produced `undefined` and every PDF silently fell back to
                    // the backup renderer. Use the instance directly.
                    const doc = new jspdf.jsPDF('p', 'mm', 'a4');
        if (typeof doc.autoTable !== 'function') {
            showToast('Table library failed to load. Use "Print All Report Cards" instead, then refresh.', 'error');
            return;
        }
        showPdfOverlay(`Preparing ${students.length} report cards...`);
        let first = true;
        let count = 0;
        const noData = [];

        for (let i = 0; i < students.length; i++) {
            const student = students[i];
            updatePdfOverlay(`Building card ${i + 1} of ${students.length} — ${student.name}...`);
            if (!first) doc.addPage();
            first = false;
            const data = getModernReportData(student.id, term, year);
            if (data) { renderModernReportCard(doc, data); count++; }
            else { renderNoDataCard(doc, student, term, year); noData.push(student.name); }
            // let the UI repaint between cards
            if (i % 5 === 4) await new Promise(r => setTimeout(r, 0));
        }

        hidePdfOverlay();

        const fname = `Grade_Report_${grade.replace(/\s+/g, '_')}_${term}_${year}.pdf`;
        doc.save(fname);
        showToast(`Downloaded ${students.length} report cards for ${grade}${noData.length ? ` (${noData.length} without scores)` : ''}`);
        if (noData.length) console.warn('[GRADE REPORTS] No assessment data for:', noData.join(', '));
    } catch (err) {
        hidePdfOverlay();
        console.error('[GRADE REPORT PDF]', err);
        showToast('Grade report failed: ' + err.message, 'error');
    }
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

// Immediate local backup + debounced server sync (used by legacy batch handlers)
function _flushNow() {
    _assessBackup();
    clearTimeout(window._scoreSaveTimeout);
    window._scoreSaveTimeout = setTimeout(() => saveData(), 500);
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
            // (generateStudentReport never existed — use the real generators)
            if (typeof generateIndividualReport === 'function') {
                generateIndividualReport();
            } else if (typeof downloadStudentReportCard === 'function') {
                downloadStudentReportCard(id);
            } else {
                showToast('Report generator not available.', 'error');
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
        // FIXED: persist recovered records so they survive the next reload too
        saveData();
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
    if (!sidebar) return;
    // Mobile: slide the drawer in/out; Desktop: collapse to an icon rail
    if (window.innerWidth <= 768) {
        sidebar.classList.toggle('open');
        return;
    }
    sidebar.classList.toggle('collapsed');
    localStorage.setItem('elimutrack_sidebar_collapsed', sidebar.classList.contains('collapsed') ? '1' : '0');
}

// Restore the persisted sidebar state on load
function initSidebarState() {
    try {
        const sb = $('sidebar');
        if (sb && window.innerWidth > 768 && localStorage.getItem('elimutrack_sidebar_collapsed') === '1') {
            sb.classList.add('collapsed');
        }
    } catch (_) { /* ignore */ }
}

// ── COLLAPSIBLE SIDEBAR SECTIONS (Quick Access / School Management / Curriculum / System) ──
function initSidebarSections() {
    const headers = document.querySelectorAll('#sidebar .nav-section-header');
    headers.forEach(h => {
        h.setAttribute('role', 'button');
        h.setAttribute('tabindex', '0');
        h.setAttribute('aria-expanded', String(h.closest('.nav-section').classList.contains('open')));
    });

    // Restore persisted open/closed state (labels of sections the user collapsed)
    try {
        const closed = new Set(JSON.parse(localStorage.getItem('elimutrack_sidebar_sections') || '[]'));
        document.querySelectorAll('#sidebar .nav-section').forEach(sec => {
            const label = sec.querySelector('.nav-label')?.textContent?.trim();
            if (label && closed.has(label)) {
                sec.classList.remove('open');
                sec.querySelector('.nav-section-header')?.setAttribute('aria-expanded', 'false');
            }
        });
    } catch (_) { /* ignore */ }

    // Toggle on click (works on the label, the chevron, or header padding)
    document.body.addEventListener('click', e => {
        const header = e.target.closest('.nav-section-header');
        if (!header) return;
        const section = header.closest('.nav-section');
        if (!section) return;
        section.classList.toggle('open');
        header.setAttribute('aria-expanded', section.classList.contains('open'));
        try {
            const label = section.querySelector('.nav-label')?.textContent?.trim() || '';
            const closed = new Set(JSON.parse(localStorage.getItem('elimutrack_sidebar_sections') || '[]'));
            if (section.classList.contains('open')) closed.delete(label);
            else closed.add(label);
            localStorage.setItem('elimutrack_sidebar_sections', JSON.stringify([...closed]));
        } catch (_) { /* ignore */ }
    });

    // Keyboard support: Enter / Space toggles the focused section header
    document.body.addEventListener('keydown', e => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const header = e.target.closest?.('.nav-section-header');
        if (!header) return;
        e.preventDefault();
        header.click();
    });
}

// ── REAL-TIME DASHBOARD SYNC ──
// Re-render the visible section when another tab saves (localStorage event)
// and auto-refresh the dashboard while it is on screen.
function initRealtimeSync() {
    try {
        window.addEventListener('storage', (e) => {
            if (!e.newValue || (e.key !== 'elimutrack_backup' && e.key !== 'elimutrack_data')) return;
            try {
                const backup = JSON.parse(e.newValue);
                if (backup && Array.isArray(backup.students)) {
                    Object.assign(store, {
                        students: backup.students || [], staff: backup.staff || [], exams: backup.exams || [],
                        notes: backup.notes || [], messages: backup.messages || [], timetable: backup.timetable || [],
                        settings: backup.settings || store.settings, learningAreas: backup.learningAreas || store.learningAreas,
                        examSchedules: backup.examSchedules || []
                    });
                }
            } catch (_) { /* invalid backup — ignore */ }
            const active = document.querySelector('.view-section.active');
            if (!active) return;
            const id = active.id;
            if (id === 'dashboard') renderDashboard();
            else if (id === 'students') renderLearnerSection();
            else if (id === 'staff') renderStaff();
            else if (id === 'curricula') { renderCurricula(); renderCourseSettings(); }
            else if (id === 'reports') renderReportsAnalytics();
        });

        // Auto-refresh the dashboard every 60s while it is the active section
        setInterval(() => {
            const active = document.querySelector('.view-section.active');
            if (active && active.id === 'dashboard') renderDashboard();
        }, 60000);
    } catch (_) { /* realtime sync unavailable */ }
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


function renderStaff() {
    const all = StaffRepo.getAll();

    // --- Filters (bound in initGlobalListeners) ---
    const search = (getVal('staffSearch') || '').toLowerCase();
    const deptFilter = getVal('staffDeptFilter') || 'all';
    const filtered = all.filter(s => {
        if (deptFilter !== 'all') {
            const dept = (s.department || s.dept || '').toLowerCase();
            const desig = (s.designation || '').toLowerCase();
            if (!dept.includes(deptFilter.toLowerCase()) && !desig.includes(deptFilter.toLowerCase())) return false;
        }
        if (search) {
            const hay = [s.name, s.tsc, s.idNo, s.phone, s.designation, s.department, s.dept, s.email]
                .filter(Boolean).join(' ').toLowerCase();
            if (!hay.includes(search)) return false;
        }
        return true;
    });

    // --- Role buckets for the staff analytics dashboard ---
    const buckets = { teachers: [], admin: [], support: [] };
    all.forEach(s => {
        const d = (s.department || s.dept || '').toLowerCase();
        const desig = (s.designation || '').toLowerCase();
        if (d.includes('admin') || desig.includes('head') || desig.includes('principal') || desig.includes('deputy')) buckets.admin.push(s);
        else if (d.includes('support') || desig.includes('support') || desig.includes('cleaner') || desig.includes('driver')) buckets.support.push(s);
        else buckets.teachers.push(s);
    });

    // --- Render grid (default) or table view into #staffContainer ---
    const container = $('staffContainer');
    const tableView = currentView.staff === 'list';

    if (container) {
        if (tableView) renderStaffTable(filtered, container);
        else renderStaffGrid(filtered, container);
    }

    // --- Analytics (KPIs, doughnuts, workload, performance) ---
    if (typeof renderStaffAnalytics === 'function') renderStaffAnalytics(all, buckets);
}

function editStaff(id) {
    const s = StaffRepo.getById(id);
    if (!s) return;
    const form = $('staffForm');
    if (form) form.reset();
    if ($('staffEditId')) $('staffEditId').value = id;
    if ($('staffModalTitle')) $('staffModalTitle').innerText = 'Edit Staff Member';

    // Name → Surname / First Name / Other Names
    const parts = (s.name || '').split(/\s+/).filter(Boolean);
    if ($('staffSurname')) $('staffSurname').value = parts[0] || '';
    if ($('staffFirstName')) $('staffFirstName').value = parts[1] || '';
    if ($('staffOtherNames')) $('staffOtherNames').value = parts.slice(2).join(' ');

    const idMap = { staffTsc: 'tsc', staffIdNo: 'idNo', staffPhone: 'phone', staffEmail: 'email',
        staffDesignation: 'designation', staffGender: 'gender', staffDob: 'dob',
        staffEmploymentType: 'employmentType', staffSubjects: 'subjects', staffAppointmentDate: 'appointmentDate' };
    Object.entries(idMap).forEach(([fieldId, key]) => {
        if ($(fieldId) && s[key] !== undefined) $(fieldId).value = s[key];
    });
    const deptEl = $('staffDept');
    if (deptEl && (s.dept || s.department)) deptEl.value = s.dept || s.department;

    // Photo
    window._staffPhotoDataUrl = s.photo || null;
    if (s.photo && $('staffPhotoPreview')) $('staffPhotoPreview').src = s.photo;

    // Also fill any name-attribute fields that match staff keys
    if (form) {
        form.querySelectorAll('[name]').forEach(f => {
            if (s[f.name] === undefined) return;
            if (f.type === 'checkbox') f.checked = !!s[f.name];
            else f.value = s[f.name];
        });
    }
    openModal('staffModal');
}

function deleteStaff(id) {
    if (!confirm('Delete this staff member?')) return;
    StaffRepo.delete(id);
    renderStaff();
    renderDashboard();
    showToast('Staff deleted.');
}

function openStaffModal() {
    const form = $('staffForm');
    if (form) form.reset();
    if ($('staffEditId')) $('staffEditId').value = '';
    if ($('staffModalTitle')) $('staffModalTitle').innerText = 'Add Staff Member';
    window._staffPhotoDataUrl = null;
    if ($('staffPhotoPreview')) $('staffPhotoPreview').src = DEFAULT_AVATAR;
    switchStaffStep(1);
    openModal('staffModal');
}

function switchStaffStep(target) {
    if (target < 1 || target > 2) return;
    [1, 2].forEach(i => {
        const step = $('staff-form-step-' + i);
        if (step) step.classList.toggle('active', i === target);
    });
}

function submitStaff(e) {
    e.preventDefault();
    const editId = $('staffEditId')?.value || '';
    const surname = getVal('staffSurname').trim();
    const first = getVal('staffFirstName').trim();
    const other = getVal('staffOtherNames').trim();
    const name = [surname, first, other].filter(Boolean).join(' ');

    if (!name) { showToast('Surname and First Name are required.', 'error'); return; }

    const department = getVal('staffDept');
    const staffData = {
        name, surname, firstName: first, otherNames: other,
        gender: getVal('staffGender'),
        dob: getVal('staffDob'),
        idNo: getVal('staffIdNo'),
        phone: getVal('staffPhone'),
        email: getVal('staffEmail'),
        designation: getVal('staffDesignation'),
        department: department,
        dept: department,
        tsc: getVal('staffTsc'),
        employmentType: getVal('staffEmploymentType'),
        appointmentDate: getVal('staffAppointmentDate'),
        subjects: getVal('staffSubjects'),
        photo: window._staffPhotoDataUrl || null
    };

    if (editId) {
        StaffRepo.update(editId, staffData);
        showToast('Staff updated successfully!');
    } else {
        StaffRepo.create(staffData);
        showToast('Staff added successfully!');
    }
    closeModal('staffModal');
    renderStaff();
    renderDashboard();
}

function renderCurricula() { const c = $('curriculumAccordion'); if (c) c.innerHTML = '<div class="empty-state">Curricula section — paste your original renderCurricula code here.</div>'; }
function filterCurricula(band) { renderCurricula(); }
function openCourseModal(id) {
    if (id) {
        // Edit mode — populate the form with the existing subject first
        const subject = (store.learningAreas || []).find(t => t.id === id);
        if (subject) {
            editCourse(id);
            openModal('courseModal');
            return;
        }
    }
    // Add mode — fresh form
    const form = $('courseForm');
    if (form) form.reset();
    if ($('courseEditId')) $('courseEditId').value = '';
    if ($('courseModalTitle')) $('courseModalTitle').innerText = 'Add Subject';
    populateCourseLevels();
    populateTeacherDropdown('');
    openModal('courseModal');
}

// Populates the grade checkboxes in the (single) course modal
function populateCourseLevels() {
    const container = $('courseLevelsContainer');
    if (!container) return;
    const grades = ['PP1', 'PP2', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9'];
    container.innerHTML = grades.map(g => `
        <label class="checkbox-card" style="display:flex; align-items:center; gap:6px; padding:6px 8px; border:1px solid var(--border); border-radius:8px; font-size:0.8rem; cursor:pointer;">
            <input type="checkbox" name="courseGrade" value="${g}"> ${g}
        </label>
    `).join('');
}
function saveCourseSettings(e) { e.preventDefault(); showToast('Subject saved (stub).'); closeModal('courseModal'); }

function renderTimetable() { const c = $('ttGridWrapper'); if (c) c.innerHTML = '<div class="heatmap-empty">Timetable section — paste your original renderTimetable code here.</div>'; }
function openTimetableSlotModal() { showToast('Timetable slot modal — paste your original code.', 'info'); }
function exportTimetablePDF() { showToast('Timetable PDF — paste your original code.', 'info'); }
function handleTimetableSlotSubmit(e) { e.preventDefault(); showToast('Slot saved (stub).'); }


// ==========================================================================
//   SHARED ANALYSIS UTILITIES
// ==========================================================================

function getCompetenceStatus(score) {
    if (score >= 80) return { level: 'Exceeding', abbr: 'EE', class: 'status-c' };
    if (score >= 50) return { level: 'Meeting', abbr: 'ME', class: 'status-m' };
    if (score >= 30) return { level: 'Approaching', abbr: 'AE', class: 'status-a' };
    return { level: 'Below', abbr: 'BE', class: 'status-b' };
}

function animateValue(elementId, start, end, duration, suffix) {
    const el = $(elementId);
    if (!el) return;
    const startTime = performance.now();
    const diff = end - start;

    function tick(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(start + diff * eased);
        el.textContent = current + (suffix || '');
        if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
}

function computeTrendStats(scores) {
    if (!scores || scores.length < 2) return { delta: 0, direction: 'neutral', series: scores.slice(-8) };
    const mid = Math.floor(scores.length / 2);
    const firstHalf = scores.slice(0, mid);
    const secondHalf = scores.slice(mid);
    const avgFirst = firstHalf.length ? firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length : 0;
    const avgSecond = secondHalf.length ? secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length : 0;
    const delta = Math.round(avgSecond - avgFirst);
    return {
        delta,
        direction: delta > 1 ? 'up' : delta < -1 ? 'down' : 'neutral',
        series: scores.slice(-8)
    };
}

function computeCategoryTrend(exams, predicate) {
    if (!exams || exams.length < 2) return { delta: 0, direction: 'neutral' };
    const mid = Math.floor(exams.length / 2);
    const first = exams.slice(0, mid);
    const second = exams.slice(mid);
    const countFirst = first.filter(e => predicate(parseInt(e.score) || 0)).length;
    const countSecond = second.filter(e => predicate(parseInt(e.score) || 0)).length;
    const delta = countSecond - countFirst;
    return { delta, direction: delta > 0 ? 'up' : delta < 0 ? 'down' : 'neutral' };
}

function computeCategorySeries(exams, predicate) {
    if (!exams || exams.length === 0) return [0];
    const chunkSize = Math.max(1, Math.ceil(exams.length / 8));
    const series = [];
    for (let i = 0; i < exams.length; i += chunkSize) {
        const chunk = exams.slice(i, i + chunkSize);
        series.push(chunk.filter(e => predicate(parseInt(e.score) || 0)).length);
    }
    return series.length > 0 ? series : [0];
}

function updateTrendIndicator(elementId, trend, suffix, invertColor) {
    const el = $(elementId);
    if (!el) return;
    const isUp = trend.direction === 'up';
    const isDown = trend.direction === 'down';
    const isNeutral = trend.direction === 'neutral';
    const delta = trend.delta;

    let color, icon;
    if (invertColor) {
        color = isUp ? '#ef4444' : isDown ? '#22c55e' : 'var(--text-muted)';
    } else {
        color = isUp ? '#22c55e' : isDown ? '#ef4444' : 'var(--text-muted)';
    }
    icon = isUp ? 'fa-arrow-trend-up' : isDown ? 'fa-arrow-trend-down' : 'fa-minus';

    el.innerHTML = `<i class="fa-solid ${icon}"></i> ${isNeutral ? '0' : (isUp ? '+' : '') + delta}${suffix || ''}`;
    el.style.color = color;
    el.parentElement.style.color = color;
}


// ==========================================================================
//   ANALYSIS SECTION — SCHOOL-WIDE BENTO GRID
// ==========================================================================

let subjectChartInstance = null;
let distChartInstance = null;
let analysisTrendChartInstance = null;
let genderComparisonChartInstance = null;
let leaderboardCurrentSubject = 'overall';
let _anaLbFilterBound = false;

function renderAnalysis() {
    // 1. Get Context
    const selectedGrade = $('analysisGradeSelect') ? $('analysisGradeSelect').value : 'all';

    // 2. Filter Data
    let relevantStudents = StudentRepo.getAll();
    if (selectedGrade !== 'all') {
        relevantStudents = relevantStudents.filter(s => s.grade === selectedGrade);
    }

    const studentIds = new Set(relevantStudents.map(s => s.id));
    const relevantExams = (store.exams || []).filter(e => studentIds.has(e.studentId));

    // 3. Calculate Metrics
    let totalScore = 0;
    let count = 0;
    let subjectScores = {};

    relevantExams.forEach(e => {
        const score = parseInt(e.score) || 0;
        if (score > 0) {
            totalScore += score;
            count++;
            const subName = e.subjectName || 'Unknown';
            if (!subjectScores[subName]) subjectScores[subName] = [];
            subjectScores[subName].push(score);
        }
    });

    const avgScore = count > 0 ? Math.round(totalScore / count) : 0;

    // 4. Update KPIs
    animateValue('anaClassAvg', 0, avgScore, 800, '%');

    let exceeding = 0, approaching = 0, below = 0;
    Object.values(subjectScores).flat().forEach(s => {
        if (s >= 80) exceeding++;
        else if (s >= 50) approaching++;
        else below++;
    });

    animateValue('anaExceeding', 0, exceeding, 600);
    animateValue('anaApproaching', 0, approaching, 600);
    animateValue('anaBelow', 0, below, 600);

    // 4b. Trend indicators
    const allScores = Object.values(subjectScores).flat();
    const trendData = computeTrendStats(allScores);
    updateTrendIndicator('anaClassAvgTrend', trendData, '%');
    updateTrendIndicator('anaExceedingTrend', computeCategoryTrend(relevantExams, s => s >= 80), '');
    updateTrendIndicator('anaApproachingTrend', computeCategoryTrend(relevantExams, s => s >= 50 && s < 80), '', true);
    updateTrendIndicator('anaBelowTrend', computeCategoryTrend(relevantExams, s => s < 50), '', true);

    // 4c. Sparklines
    renderSparkline('sparkClassAvg', trendData.series, '#22c55e');
    renderSparkline('sparkExceeding', computeCategorySeries(relevantExams, s => s >= 80), '#14b8a6');
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

    // 6. Bind leaderboard filter (once)
    if (!_anaLbFilterBound) {
        const lbFilter = $('leaderboardFilter');
        if (lbFilter) {
            lbFilter.addEventListener('click', (e) => {
                const btn = e.target.closest('button');
                if (!btn) return;
                lbFilter.querySelectorAll('button').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                leaderboardCurrentSubject = btn.dataset.subject || 'overall';
                renderLeaderboard(relevantStudents, relevantExams);
            });
            _anaLbFilterBound = true;
        }
    }
}

// ── Subject Bar Chart ──
function renderSubjectBarChart(subjectScores) {
    const canvas = $('subjectPerformanceChart');
    if (!canvas) return;
    if (subjectChartInstance) { subjectChartInstance.destroy(); subjectChartInstance = null; }

    const entries = Object.entries(subjectScores)
        .map(([sub, scores]) => ({
            subject: sub,
            value: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
            count: scores.length
        }))
        .sort((a, b) => b.value - a.value);

    if (entries.length === 0) return;

    const labels = entries.map(e => e.subject.length > 16 ? e.subject.substring(0, 15) + '…' : e.subject);
    const data = entries.map(e => e.value);
    const bgColors = data.map(v => v >= 80 ? 'rgba(34,197,94,0.65)' : v >= 50 ? 'rgba(245,158,11,0.65)' : 'rgba(239,68,68,0.65)');
    const borderColors = data.map(v => v >= 80 ? '#22c55e' : v >= 50 ? '#f59e0b' : '#ef4444');

    subjectChartInstance = new Chart(canvas, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    label: 'Score',
                    data,
                    backgroundColor: bgColors,
                    borderColor: borderColors,
                    borderWidth: 1,
                    borderRadius: 6,
                    borderSkipped: false,
                    barPercentage: 0.6
                },
                {
                    label: 'Target 80%',
                    data: data.map(() => 80),
                    type: 'line',
                    borderColor: 'rgba(148,163,184,0.35)',
                    borderDash: [6, 4],
                    borderWidth: 1.5,
                    pointRadius: 0,
                    fill: false
                }
            ]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(15,23,42,0.92)',
                    padding: 10,
                    cornerRadius: 8,
                    callbacks: { label: (c) => `${c.dataset.label}: ${c.parsed.x}%` }
                }
            },
            scales: {
                x: { beginAtZero: true, max: 100, grid: { color: 'rgba(148,163,184,0.06)' }, ticks: { color: '#94a3b8', font: { size: 10 }, callback: v => v + '%' } },
                y: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 11, weight: '500' } } }
            }
        }
    });
}

// ── Competency Donut ──
function renderCompetencyDonut(exceeding, approaching, below) {
    const canvas = $('competencyDistributionChart');
    const legendEl = $('competencyLegend');
    if (!canvas) return;
    if (distChartInstance) { distChartInstance.destroy(); distChartInstance = null; }

    const total = exceeding + approaching + below;
    const compData = [
        { label: 'Exceeding', value: exceeding, color: '#22c55e' },
        { label: 'Meeting', value: approaching, color: '#f59e0b' },
        { label: 'Below', value: below, color: '#ef4444' }
    ];

    distChartInstance = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: compData.map(d => d.label),
            datasets: [{
                data: compData.map(d => d.value),
                backgroundColor: compData.map(d => d.color + '18'),
                borderColor: compData.map(d => d.color),
                borderWidth: 2,
                hoverBackgroundColor: compData.map(d => d.color + '35')
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '62%',
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(15,23,42,0.92)',
                    padding: 10,
                    cornerRadius: 8,
                    callbacks: {
                        label: (c) => {
                            const pct = total > 0 ? Math.round((c.parsed / total) * 100) : 0;
                            return `${c.label}: ${c.parsed} (${pct}%)`;
                        }
                    }
                }
            }
        }
    });

    if (legendEl) {
        legendEl.innerHTML = compData.map(d => {
            const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
            return `<span class="comp-legend-item"><span class="comp-legend-dot" style="background:${d.color}"></span>${d.label} ${pct}%</span>`;
        }).join('');
    }
}

// ── Analysis Trend Chart ──
function renderAnalysisTrendChart(subjectScores) {
    const canvas = $('analysisTrendChart');
    if (!canvas) return;
    if (analysisTrendChartInstance) { analysisTrendChartInstance.destroy(); analysisTrendChartInstance = null; }

    // Build per-subject averages across all exams to show subject spread
    const entries = Object.entries(subjectScores)
        .map(([sub, scores]) => ({
            subject: sub,
            avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        }))
        .sort((a, b) => b.avg - a.avg)
        .slice(0, 8);

    if (entries.length === 0) return;

    const colors = ['#6366f1', '#3b82f6', '#22c55e', '#14b8a6', '#f59e0b', '#f97316', '#ef4444', '#ec4899'];

    analysisTrendChartInstance = new Chart(canvas, {
        type: 'radar',
        data: {
            labels: entries.map(e => e.subject.length > 12 ? e.subject.substring(0, 11) + '…' : e.subject),
            datasets: [{
                label: 'Average',
                data: entries.map(e => e.avg),
                backgroundColor: 'rgba(99,102,241,0.12)',
                borderColor: '#6366f1',
                borderWidth: 2,
                pointBackgroundColor: '#6366f1',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: { display: false, backdropColor: 'transparent' },
                    grid: { color: 'rgba(148,163,184,0.1)' },
                    angleLines: { color: 'rgba(148,163,184,0.1)' },
                    pointLabels: { font: { size: 10, weight: '500' }, color: '#64748b' }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(15,23,42,0.92)',
                    padding: 10,
                    cornerRadius: 8,
                    callbacks: { label: (c) => `${c.label}: ${c.parsed.r}%` }
                }
            }
        }
    });
}

// ── Gender Comparison ──
function renderGenderComparisonChart(relevantStudents, relevantExams) {
    const canvas = $('genderComparisonChart');
    if (!canvas) return;
    if (genderComparisonChartInstance) { genderComparisonChartInstance.destroy(); genderComparisonChartInstance = null; }

    const maleIds = new Set(relevantStudents.filter(s => s.gender === 'Male').map(s => s.id));
    const femaleIds = new Set(relevantStudents.filter(s => s.gender === 'Female').map(s => s.id));

    const maleExams = relevantExams.filter(e => maleIds.has(e.studentId));
    const femaleExams = relevantExams.filter(e => femaleIds.has(e.studentId));

    const avg = (exams) => exams.length ? Math.round(exams.reduce((a, e) => a + (parseInt(e.score) || 0), 0) / exams.length) : 0;
    const catCount = (exams, pred) => exams.filter(e => pred(parseInt(e.score) || 0)).length;

    genderComparisonChartInstance = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: ['Average %', 'Exceeding', 'Meeting', 'Below'],
            datasets: [
                {
                    label: 'Male',
                    data: [avg(maleExams), catCount(maleExams, s => s >= 80), catCount(maleExams, s => s >= 50 && s < 80), catCount(maleExams, s => s < 50)],
                    backgroundColor: 'rgba(59,130,246,0.55)',
                    borderColor: '#3b82f6',
                    borderWidth: 1,
                    borderRadius: 6,
                    barPercentage: 0.55
                },
                {
                    label: 'Female',
                    data: [avg(femaleExams), catCount(femaleExams, s => s >= 80), catCount(femaleExams, s => s >= 50 && s < 80), catCount(femaleExams, s => s < 50)],
                    backgroundColor: 'rgba(236,72,153,0.55)',
                    borderColor: '#ec4899',
                    borderWidth: 1,
                    borderRadius: 6,
                    barPercentage: 0.55
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#94a3b8', font: { size: 11 }, usePointStyle: true, pointStyle: 'circle', padding: 16 }
                },
                tooltip: { backgroundColor: 'rgba(15,23,42,0.92)', padding: 10, cornerRadius: 8 }
            },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(148,163,184,0.06)' }, ticks: { color: '#94a3b8', font: { size: 10 } } },
                x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 11, weight: '500' } } }
            }
        }
    });
}

// ── Subject Heatmap ──
function renderSubjectHeatmap(relevantStudents, relevantExams) {
    const container = $('subjectHeatmap');
    if (!container) return;

    const gradeOrder = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9'];
    const allStudents = StudentRepo.getAll();
    const allExams = store.exams || [];

    // Discover subjects
    const subjectSet = new Set();
    allExams.forEach(e => { if (e.subjectName) subjectSet.add(e.subjectName); });
    const subjects = [...subjectSet].sort().slice(0, 8);

    if (subjects.length === 0) {
        container.innerHTML = '<div class="heatmap-empty">No exam data available for heatmap.</div>';
        return;
    }

    // Build data grid
    const grid = {};
    gradeOrder.forEach(g => {
        const gStudents = allStudents.filter(s => s.grade === g);
        if (gStudents.length === 0) return;
        const gIds = new Set(gStudents.map(s => s.id));
        grid[g] = {};
        subjects.forEach(sub => {
            const scores = allExams.filter(e => gIds.has(e.studentId) && e.subjectName === sub).map(e => parseInt(e.score) || 0);
            grid[g][sub] = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
        });
    });

    // Render
    let html = '<table class="heatmap-table"><thead><tr><th></th>';
    subjects.forEach(sub => {
        const short = sub.length > 10 ? sub.substring(0, 9) + '…' : sub;
        html += `<th>${escapeHtml(short)}</th>`;
    });
    html += '</tr></thead><tbody>';

    gradeOrder.forEach(g => {
        if (!grid[g]) return;
        html += `<tr><td class="hm-label">${escapeHtml(g.replace('Grade ', 'G'))}</td>`;
        subjects.forEach(sub => {
            const val = grid[g][sub];
            if (val === null) {
                html += '<td class="hm-empty-cell">—</td>';
            } else {
                const cls = val >= 80 ? 'hm-excellent' : val >= 65 ? 'hm-good' : val >= 50 ? 'hm-fair' : val >= 30 ? 'hm-poor' : 'hm-critical';
                html += `<td class="${cls}">${val}%</td>`;
            }
        });
        html += '</tr>';
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

// ── Leaderboard ──
function renderLeaderboard(relevantStudents, relevantExams) {
    const container = $('analysisLeaderboard');
    if (!container) return;

    // Compute per-student scores
    const ranked = relevantStudents.map(s => {
        const sExams = relevantExams.filter(e => e.studentId === s.id);
        if (leaderboardCurrentSubject === 'overall') {
            const subMap = {};
            sExams.forEach(e => {
                const sub = e.subjectName || 'Unknown';
                if (!subMap[sub]) subMap[sub] = [];
                subMap[sub].push(parseInt(e.score) || 0);
            });
            const avgs = Object.values(subMap).map(arr => Math.round(arr.reduce((a, b) => a + b, 0) / arr.length));
            const overall = avgs.length ? Math.round(avgs.reduce((a, b) => a + b, 0) / avgs.length) : 0;
            return { ...s, score: overall, examCount: sExams.length };
        } else {
            const subExams = sExams.filter(e => e.subjectName === leaderboardCurrentSubject);
            const score = subExams.length ? Math.round(subExams.reduce((a, e) => a + (parseInt(e.score) || 0), 0) / subExams.length) : 0;
            return { ...s, score, examCount: subExams.length };
        }
    })
    .filter(s => s.examCount > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12);

    if (ranked.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--text-muted);">No data for this selection.</div>';
        return;
    }

    container.innerHTML = ranked.map((s, i) => {
        const scoreCls = s.score >= 80 ? 'lb-high' : s.score >= 50 ? 'lb-mid' : 'lb-low';
        return `
        <div class="lb-card">
            <span class="lb-rank">${i + 1}</span>
            <img src="${s.photo || DEFAULT_AVATAR}" class="lb-avatar" alt="${escapeHtml(s.name)}"
                 onerror="this.src='${DEFAULT_AVATAR}'">
            <div class="lb-info">
                <span class="lb-name">${escapeHtml(s.name)}</span>
                <span class="lb-meta">${s.grade}${s.stream ? ' · ' + escapeHtml(s.stream) : ''}</span>
            </div>
            <span class="lb-score ${scoreCls}">${s.score}%</span>
        </div>`;
    }).join('');
}


// ==========================================================================
//   INDIVIDUAL STUDENT ANALYSIS ENGINE (ENHANCED)
// ==========================================================================

class IndividualAnalysisEngine {
    constructor() {
        this.charts = {};
        this.selectedStudentId = null;
        this._initialized = false;
        this._eventsAttached = false;
    }

    init() {
        const container = $('analysisContent');
        if (!container) return;

        if (!this._initialized) {
            this._renderLayout(container);
            this._initialized = true;
        }
        this._populateStudentList();
        if (!this._eventsAttached) {
            this._attachEvents();
            this._eventsAttached = true;
        }
    }

    _renderLayout(container) {
        container.innerHTML = `
            <div class="ia-layout">
                <aside class="ia-sidebar">
                    <div class="ia-sidebar-header">
                        <div class="ia-field">
                            <label>Select Learner</label>
                            <select id="analysisStudentSelect" class="form-control">
                                <option value="">-- Select --</option>
                            </select>
                        </div>
                        <div class="ia-search">
                            <i class="fa-solid fa-magnifying-glass"></i>
                            <input type="text" id="analysisSearchInput" class="form-control" placeholder="Filter list...">
                        </div>
                    </div>
                    <div class="ia-student-list" id="analysisStudentList"></div>
                </aside>

                <main class="ia-main">
                    <div class="ia-hero">
                        <div class="ia-hero-info">
                            <h2 id="analysisHeroName">Select a Learner</h2>
                            <p id="analysisHeroGrade">Grade: --</p>
                        </div>
                        <div class="ia-hero-stats">
                            <div class="ia-stat">
                                <div class="ia-stat-val" id="analysisMeanScore">--</div>
                                <div class="ia-stat-label">Mean Score</div>
                            </div>
                            <div class="ia-stat">
                                <div class="ia-stat-val" id="analysisRank">--</div>
                                <div class="ia-stat-label">Rank</div>
                            </div>
                            <div class="ia-stat">
                                <div class="ia-stat-val" id="analysisTotalPoints">--</div>
                                <div class="ia-stat-label">Total Points</div>
                            </div>
                        </div>
                    </div>

                    <div class="ia-grid">
                        <div class="ia-card">
                            <div class="ia-card-header"><h3>Performance Trend</h3></div>
                            <div class="ia-canvas-wrap" id="trendChartContainer">
                                <canvas id="trendChart"></canvas>
                                <div id="trendEmptyState" class="ia-chart-empty">
                                    <i class="fa-solid fa-chart-line"></i>
                                    <p>No assessment history yet</p>
                                </div>
                            </div>
                        </div>
                        <div class="ia-card">
                            <div class="ia-card-header"><h3>Subject Breakdown</h3></div>
                            <div class="ia-bar-list" id="analysisBarChart"></div>
                        </div>
                    </div>

                    <div class="ia-toolbar">
                        <div class="ia-toolbar-info" id="analysisStatus">Select a learner to view detailed analysis.</div>
                        <div class="ia-toolbar-actions">
                            <button class="btn btn-secondary btn-sm" id="btnAnalysisWindow" disabled>
                                <i class="fa-solid fa-eye"></i> View Performance
                            </button>
                        </div>
                    </div>
                </main>
            </div>`;
    }

    _populateStudentList() {
        const listContainer = $('analysisStudentList');
        const select = $('analysisStudentSelect');
        const students = StudentRepo.getAll();

        if (students.length === 0) {
            if (listContainer) listContainer.innerHTML = '<div class="ia-empty">No learners admitted yet.</div>';
            return;
        }

        const fragment = document.createDocumentFragment();
        students.forEach(s => {
            // List item
            const itemDiv = document.createElement('div');
            itemDiv.className = 'ia-student-item';
            itemDiv.dataset.id = s.id;
            itemDiv.dataset.name = s.name.toLowerCase();
            itemDiv.tabIndex = 0;
            itemDiv.setAttribute('role', 'button');
            itemDiv.setAttribute('aria-label', s.name);
            itemDiv.innerHTML = `
                <div class="ia-avatar"><i class="fa-solid fa-user"></i></div>
                <div class="ia-item-info">
                    <h4>${escapeHtml(s.name)}</h4>
                    <span>${s.grade || '--'}</span>
                </div>`;
            fragment.appendChild(itemDiv);

            // Select option
            const opt = document.createElement('option');
            opt.value = s.id;
            opt.textContent = `${s.name} (${s.grade || '--'})`;
            select.appendChild(opt);
        });

        listContainer.appendChild(fragment);
    }

    _attachEvents() {
        const listContainer = $('analysisStudentList');
        const select = $('analysisStudentSelect');
        const searchInput = $('analysisSearchInput');

        // List click + keyboard
        listContainer.addEventListener('click', (e) => {
            const item = e.target.closest('.ia-student-item');
            if (item) this._activateAndSelect(item, select, listContainer);
        });
        listContainer.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const item = e.target.closest('.ia-student-item');
                if (item) this._activateAndSelect(item, select, listContainer);
            }
        });

        // Select change
        select.addEventListener('change', (e) => {
            const id = e.target.value;
            if (id) {
                const item = listContainer.querySelector(`[data-id="${id}"]`);
                if (item) {
                    listContainer.querySelectorAll('.ia-student-item').forEach(i => i.classList.remove('active'));
                    item.classList.add('active');
                    item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
                this.selectStudent(id);
            }
        });

        // Search
        let searchTimer;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimer);
            searchTimer = setTimeout(() => {
                const term = e.target.value.toLowerCase().trim();
                listContainer.querySelectorAll('.ia-student-item').forEach(item => {
                    item.style.display = item.dataset.name.includes(term) ? '' : 'none';
                });
            }, 150);
        });

        // View button
        const viewBtn = $('btnAnalysisWindow');
        if (viewBtn) {
            viewBtn.addEventListener('click', () => {
                if (this.selectedStudentId) {
                    if (typeof openPerformanceAnalysisModal === 'function') {
                        openPerformanceAnalysisModal(this.selectedStudentId);
                    } else {
                        showToast('Performance modal not available', 'info');
                    }
                }
            });
        }
    }

    _activateAndSelect(item, select, listContainer) {
        listContainer.querySelectorAll('.ia-student-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        select.value = item.dataset.id;
        this.selectStudent(item.dataset.id);
    }

    selectStudent(studentId) {
        this.selectedStudentId = studentId;
        const student = StudentRepo.getById(studentId);
        if (!student) return;

        setText('analysisHeroName', student.name);
        setText('analysisHeroGrade', `${student.grade || '--'} (${student.stream || 'N/A'})`);
        setText('analysisStatus', `Viewing performance analytics for ${student.name}.`);

        const viewBtn = $('btnAnalysisWindow');
        if (viewBtn) viewBtn.disabled = false;

        const exams = (store.exams || []).filter(e => e.studentId === studentId);
        const avg = exams.length > 0 ? Math.round(exams.reduce((a, e) => a + (parseInt(e.score) || 0), 0) / exams.length) : 0;
        const totalPoints = exams.reduce((a, e) => a + (parseInt(e.score) || 0), 0);

        setText('analysisMeanScore', avg + '%');
        setText('analysisTotalPoints', totalPoints.toString());

        // Rank
        const grade = student.grade;
        if (grade) {
            const peers = (StudentRepo.getAll().filter(s => s.grade === grade)).map(s => {
                const sExams = (store.exams || []).filter(e => e.studentId === s.id);
                return {
                    id: s.id,
                    avg: sExams.length > 0 ? sExams.reduce((a, e) => a + (parseInt(e.score) || 0), 0) / sExams.length : 0
                };
            }).sort((a, b) => b.avg - a.avg);

            const rank = peers.findIndex(s => s.id === studentId) + 1;
            setText('analysisRank', `#${rank > 0 ? rank : '--'}`);
        } else {
            setText('analysisRank', '--');
        }

        this._renderTrend(exams);
        this._renderBars(studentId, grade);
    }

    _renderTrend(exams) {
        const canvas = $('trendChart');
        const emptyState = $('trendEmptyState');
        if (!canvas) return;

        const sorted = [...exams]
            .sort((a, b) => {
                const da = a.date ? new Date(a.date).getTime() : 0;
                const db = b.date ? new Date(b.date).getTime() : 0;
                return da - db;
            })
            .slice(-12);

        if (sorted.length === 0) {
            if (emptyState) emptyState.style.display = '';
            canvas.style.display = 'none';
            if (this.charts.trend) { this.charts.trend.destroy(); delete this.charts.trend; }
            return;
        }

        canvas.style.display = '';
        if (emptyState) emptyState.style.display = 'none';

        const labels = sorted.map(e => {
            if (e.date) {
                try {
                    const d = new Date(e.date + 'T00:00:00');
                    if (!isNaN(d.getTime())) return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                } catch {}
            }
            return e.subjectName ? e.subjectName.substring(0, 8) : 'Exam';
        });
        const data = sorted.map(e => parseInt(e.score) || 0);

        const ctx = canvas.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 180);
        gradient.addColorStop(0, 'rgba(37, 99, 235, 0.15)');
        gradient.addColorStop(1, 'rgba(37, 99, 235, 0)');

        if (this.charts.trend) {
            this.charts.trend.data.labels = labels;
            this.charts.trend.data.datasets[0].data = data;
            this.charts.trend.update('active');
        } else {
            this.charts.trend = new Chart(ctx, {
                type: 'line',
                data: {
                    labels,
                    datasets: [{
                        label: 'Score',
                        data,
                        borderColor: '#2563eb',
                        backgroundColor: gradient,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#2563eb',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 7,
                        borderWidth: 2.5
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: { duration: 600, easing: 'easeOutCubic' },
                    interaction: { mode: 'index', intersect: false },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: 'rgba(15,23,42,0.92)',
                            padding: 10,
                            cornerRadius: 8,
                            callbacks: {
                                title: (items) => items[0] ? items[0].label : '',
                                label: (c) => {
                                    const exam = sorted[c.dataIndex];
                                    let line = `Score: ${c.parsed.y}%`;
                                    if (exam && exam.subjectName) line += ` · ${exam.subjectName}`;
                                    return line;
                                }
                            }
                        }
                    },
                    scales: {
                        y: { beginAtZero: true, max: 100, grid: { color: 'rgba(148,163,184,0.06)' }, ticks: { color: '#94a3b8', font: { size: 10 }, callback: v => v + '%' } },
                        x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 10 }, maxRotation: 45 } }
                    }
                }
            });
        }
    }

    _renderBars(studentId, grade) {
        const container = $('analysisBarChart');
        if (!container) return;

        const subjects = (store.learningAreas || []).filter(s => !s.applicableLevels || s.applicableLevels.includes(grade));

        if (subjects.length === 0) {
            // Fallback: derive subjects from actual exams
            const examSubjects = {};
            (store.exams || []).filter(e => e.studentId === studentId).forEach(e => {
                const sub = e.subjectName || 'Unknown';
                if (!examSubjects[sub]) examSubjects[sub] = [];
                examSubjects[sub].push(parseInt(e.score) || 0);
            });

            const entries = Object.entries(examSubjects);
            if (entries.length === 0) {
                container.innerHTML = '<div class="ia-empty">No subject data available.</div>';
                return;
            }

            const fragment = document.createDocumentFragment();
            entries
                .map(([sub, scores]) => ({
                    name: sub,
                    avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
                }))
                .sort((a, b) => b.avg - a.avg)
                .forEach(({ name, avg }) => {
                    const comp = getCompetenceStatus(avg);
                    const color = avg >= 80 ? '#22c55e' : avg >= 50 ? '#f59e0b' : '#ef4444';
                    const item = document.createElement('div');
                    item.className = 'ia-bar-item';
                    item.innerHTML = `
                        <div class="ia-bar-label" title="${escapeHtml(name)}">${escapeHtml(name.length > 16 ? name.substring(0, 15) + '…' : name)}</div>
                        <div class="ia-bar-track">
                            <div class="ia-bar-fill" style="width:${avg}%;background:${color}"></div>
                        </div>
                        <div class="ia-bar-value">
                            <span class="ia-bar-comp" style="color:${color}">${comp.abbr}</span>
                            ${avg}%
                        </div>`;
                    fragment.appendChild(item);
                });

            container.innerHTML = '';
            container.appendChild(fragment);
            return;
        }

        // Use learning areas
        const fragment = document.createDocumentFragment();
        subjects.forEach(sub => {
            const exam = (store.exams || []).find(e => e.studentId === studentId && e.unitCode === sub.code);
            const score = exam ? parseInt(exam.score) : 0;
            const comp = getCompetenceStatus(score);
            const color = score >= 80 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';

            const item = document.createElement('div');
            item.className = 'ia-bar-item';
            item.innerHTML = `
                <div class="ia-bar-label" title="${escapeHtml(sub.name)}">${escapeHtml(sub.code)}</div>
                <div class="ia-bar-track">
                    <div class="ia-bar-fill" style="width:${score}%;background:${color}"></div>
                </div>
                <div class="ia-bar-value">
                    <span class="ia-bar-comp" style="color:${color}">${comp.abbr}</span>
                    ${score}%
                </div>`;
            fragment.appendChild(item);
        });

        container.innerHTML = '';
        container.appendChild(fragment);
    }

    destroy() {
        Object.values(this.charts).forEach(c => { if (c && typeof c.destroy === 'function') c.destroy(); });
        this.charts = {};
        this.selectedStudentId = null;
        this._initialized = false;
        this._eventsAttached = false;
    }
}


// ==========================================================================
//   GLOBAL INSTANCE & BACKWARDS-COMPATIBLE WRAPPERS
// ==========================================================================

const studentAnalysis = new IndividualAnalysisEngine();

function renderAnalysisTab() {
    studentAnalysis.init();
}

function updateAnalysisDashboard(studentId) {
    studentAnalysis.init();
    if (studentId) studentAnalysis.selectStudent(studentId);
}

// ==========================================================================
//   STAFF ANALYTICS (Modern dashboard)
// ==========================================================================
let staffDeptChartInstance = null;
let staffGenderChartInstance = null;
let staffEmploymentChartInstance = null;

function renderStaffAnalytics(allStaff, buckets) {
    if (!allStaff) return;
    buckets = buckets || {};
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

    // Auto-open the first band so the section never looks empty
    const firstItem = container.querySelector('.accordion-item');
    if (firstItem) firstItem.classList.add('open');

    // Empty state (no learning areas defined at all)
    if (!store.learningAreas || store.learningAreas.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.style.gridColumn = '1 / -1';
        empty.innerHTML = '<i class="fa-solid fa-book-open" style="font-size:2rem;opacity:0.35;display:block;margin-bottom:0.75rem;"></i>No learning areas yet. Click <strong>Add Subject</strong> to build your CBC curriculum.';
        container.insertBefore(empty, container.firstChild);
    }
}

function renderSubjectCard(sub) {
    const teacher = sub.teacherId ? StaffRepo.getById(sub.teacherId) : null;
    const teacherLine = teacher
        ? `<span><i class="fa-solid fa-user-tie"></i> ${escapeHtml(teacher.name)}</span>`
        : `<span class="unassigned"><i class="fa-solid fa-user-slash"></i> Unassigned</span>`;

    return `
        <div class="subject-card-modern">
            <div class="subject-header">
                <h4>${escapeHtml(sub.name)}</h4>
                <span class="subject-code-badge">${escapeHtml(sub.code)}</span>
            </div>
            <div class="subject-grades"><small>Grades: ${sub.applicableLevels ? escapeHtml(sub.applicableLevels.join(', ')) : 'All'}</small></div>
            <div class="subject-teacher">${teacherLine}</div>
            <div class="subject-footer">
                <button class="btn btn-sm btn-ghost" data-action="edit-curriculum" data-id="${sub.id}" title="Edit">
                    <i class="fa-solid fa-edit"></i> Edit
                </button>
                <button class="btn btn-sm btn-ghost" data-action="delete-course" data-id="${sub.id}" title="Delete" style="color:var(--danger);">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </div>
    `;
}

// ==========================================================================
//   PROFILE SECTION LOGIC (ENHANCED)
// ==========================================================================

let studentRadarChart = null;
let studentTrendChart = null;
let _profileSelectedId = null;
let _searchDebounce = null;

// ── ENTRY POINT: Populate Sidebar ──
function populateProfileList(students = null) {
    const listContainer = $('profileStudentList');
    const searchInput = $('profileSearchInput');
    if (!listContainer) return;

    // Attach debounced search listener (once)
    if (searchInput && !searchInput._profileBound) {
        searchInput._profileBound = true;
        searchInput.addEventListener('input', () => {
            clearTimeout(_searchDebounce);
            _searchDebounce = setTimeout(() => populateProfileList(), 180);
        });
        // Allow Enter to trigger immediate search
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { clearTimeout(_searchDebounce); populateProfileList(); }
        });
    }

    const studentData = students || StudentRepo.getAll();
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';

    // Filter by search
    const filtered = searchTerm.length > 0
        ? studentData.filter(s => {
            const haystack = `${s.name} ${s.reg} ${s.nemisNumber} ${s.grade} ${s.stream} ${s.gender} ${s.guardianName || ''}`.toLowerCase();
            return haystack.includes(searchTerm);
        })
        : studentData;

    // EMPTY STATE
    if (filtered.length === 0) {
        listContainer.innerHTML = searchTerm.length > 0
            ? `<div style="padding:2rem 1rem; color:var(--text-muted); text-align:center;">
                 <i class="fa-solid fa-magnifying-glass" style="font-size:1.5rem;opacity:0.3;display:block;margin-bottom:0.5rem;"></i>
                 No learners match "<strong>${escapeHtml(searchTerm)}</strong>"
               </div>`
            : `<div style="padding:2rem 1rem; color:var(--text-muted); text-align:center;">
                 <i class="fa-solid fa-user-graduate" style="font-size:1.5rem;opacity:0.3;display:block;margin-bottom:0.5rem;"></i>
                 No learners enrolled yet.
               </div>`;
        return;
    }

    // SEARCH MODE = flat list, otherwise grouped accordion
    if (searchTerm.length > 0) {
        listContainer.classList.add('search-mode');
        renderFlatList(filtered, listContainer);
    } else {
        listContainer.classList.remove('search-mode');
        renderGroupedList(studentData, listContainer); // pass unfiltered for full groups
    }
}

// ── Render Grouped Accordion ──
function renderGroupedList(students, container) {
    const groups = {};
    students.forEach(s => {
        const grade = s.grade || 'Unassigned';
        if (!groups[grade]) groups[grade] = [];
        groups[grade].push(s);
    });

    const gradeOrder = ['PP1','PP2','Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6','Grade 7','Grade 8','Grade 9'];
    const sortedGrades = Object.keys(groups).sort((a, b) => {
        const ai = gradeOrder.indexOf(a), bi = gradeOrder.indexOf(b);
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });

    // Determine which group should be open (contains selected student, or first group)
    let openGrade = sortedGrades[0];
    if (_profileSelectedId) {
        const sel = students.find(s => s.id === _profileSelectedId);
        if (sel && sel.grade) openGrade = sel.grade;
    }

    let html = '';
    sortedGrades.forEach(grade => {
        const list = groups[grade];
        const isOpen = grade === openGrade;

        html += `
        <div class="grade-group ${isOpen ? 'active' : ''}">
            <div class="grade-header" onclick="toggleAccordion(this)">
                <span>${grade}</span>
                <span style="font-size:0.78rem; color:var(--text-muted); font-weight:400;">${list.length} Learner${list.length !== 1 ? 's' : ''}</span>
                <i class="fa-solid fa-chevron-down"></i>
            </div>
            <div class="grade-content" style="${isOpen ? 'max-height:' + (list.length * 60 + 20) + 'px;' : ''}">
                ${list.map(s => `
                    <div class="ps-item ${s.id === _profileSelectedId ? 'active' : ''}" 
                         onclick="viewStudent('${s.id}')" data-sid="${s.id}">
                        <div class="ps-avatar">
                            <img src="${s.photo || DEFAULT_AVATAR}" alt="${escapeHtml(s.name)}" 
                                 onerror="this.src='${DEFAULT_AVATAR}'">
                        </div>
                        <div class="ps-info">
                            <h4>${escapeHtml(s.name)}</h4>
                            <span>${s.stream || '-'}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>`;
    });

    container.innerHTML = html;
}

// ── Render Flat List (Search Mode) ──
function renderFlatList(students, container) {
    container.innerHTML = students.map(s => `
        <div class="ps-item ${s.id === _profileSelectedId ? 'active' : ''}" 
             onclick="viewStudent('${s.id}')" data-sid="${s.id}">
            <div class="ps-avatar">
                <img src="${s.photo || DEFAULT_AVATAR}" alt="${escapeHtml(s.name)}"
                     onerror="this.src='${DEFAULT_AVATAR}'">
            </div>
            <div class="ps-info">
                <h4>${escapeHtml(s.name)}</h4>
                <span style="font-size:0.78rem;">${s.grade || '-'} · ${s.stream || '-'}</span>
            </div>
        </div>
    `).join('');
}

// ── Toggle Accordion ──
function toggleAccordion(headerElement) {
    const group = headerElement.parentElement;
    const content = group.querySelector('.grade-content');
    group.classList.toggle('active');

    if (group.classList.contains('active')) {
        content.style.maxHeight = content.scrollHeight + "px";
    } else {
        content.style.maxHeight = "0";
    }
}

// ── PROFILE HEADER ACTIONS (Edit / Report Card for the selected learner) ──
function editProfileStudent() {
    if (!_profileSelectedId) { showToast('Select a learner first.', 'error'); return; }
    editStudent(_profileSelectedId);
}
function profileReportCard() {
    if (!_profileSelectedId) { showToast('Select a learner first.', 'error'); return; }
    downloadStudentReportCard(_profileSelectedId);
}

// ── VIEW STUDENT (Sidebar Click Handler) ──
function viewStudent(studentId) {
    _profileSelectedId = studentId;
    // Update active state in sidebar (works for both flat & grouped)
    document.querySelectorAll('#profileStudentList .ps-item').forEach(el => {
        el.classList.toggle('active', el.dataset.sid === studentId);
    });

    // Auto-open the correct accordion group if in grouped mode
    if (!_profileStudentListHasSearch()) {
        const activeItem = document.querySelector('#profileStudentList .ps-item.active');
        if (activeItem) {
            const group = activeItem.closest('.grade-group');
            if (group && !group.classList.contains('active')) {
                // Close all, open this one
                document.querySelectorAll('#profileStudentList .grade-group').forEach(g => {
                    g.classList.remove('active');
                    g.querySelector('.grade-content').style.maxHeight = '0';
                });
                group.classList.add('active');
                group.querySelector('.grade-content').style.maxHeight = group.querySelector('.grade-content').scrollHeight + 'px';
            }
            // Scroll item into view
            activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    // Render the profile
    renderStudentProfile(studentId);

    // On mobile, auto-scroll to top of profile content
    if (window.innerWidth < 900) {
        const mainContent = $('profileMainContent');
        if (mainContent) mainContent.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Helper: check if list is in search mode
function _profileStudentListHasSearch() {
    const list = $('profileStudentList');
    return list && list.classList.contains('search-mode');
}

// ── RENDER STUDENT PROFILE (Core Renderer) ──
function renderStudentProfile(studentId) {
    // ── EMPTY STATE ──
    if (!studentId) {
        _profileSelectedId = null;
        safeSetText('pName', 'Select a Learner');
        safeSetText('pGrade', '---');
        safeSetHtml('pReg', '<i class="fa-solid fa-id-card"></i> ADM: ---');
        safeSetHtml('pStream', '<i class="fa-solid fa-users"></i> Stream: ---');
        safeSetHtml('pGender', '---');
        safeSetSrc('pPhoto', DEFAULT_AVATAR);
        safeSetText('pDob', '-');
        safeSetText('pAdmNo', '-');
        safeSetText('pGuardian', '-');
        safeSetText('pGuardianPhone', '-');
        safeSetText('pAvgScore', '0%');
        safeSetText('pAttendance', '0%');
        safeSetText('pRank', '#-');
        safeSetText('pFeeStatus', '-', '');
        safeSetHtml('pAssessmentList', '<p style="text-align:center; color:var(--text-muted); padding:2rem;">Select a student from the list to view their detailed profile.</p>');
        safeSetHtml('pGaugeGrid', '<div class="gauge-empty">Select a learner to view mastery gauges.</div>');
        safeSetHtml('pDisciplineBoard', '<div class="empty-state" style="display:flex;flex-direction:column;align-items:center;gap:0.5rem;padding:2rem;"><i class="fa-solid fa-shield-halved" style="font-size:2rem;color:var(--text-muted);opacity:0.4;"></i><p style="margin:0;color:var(--text-muted);">No disciplinary records found.</p></div>');

        if (studentRadarChart) { studentRadarChart.destroy(); studentRadarChart = null; }
        if (studentTrendChart) { studentTrendChart.destroy(); studentTrendChart = null; }
        clearCanvas('pSparkScore');
        clearCanvas('pSparkAttendance');
        return;
    }

    const s = StudentRepo.getById(studentId);
    if (!s) { renderStudentProfile(null); return; }

    // ── 1. IDENTITY ──
    safeSetText('pName', s.name);
    safeSetText('pGrade', s.grade || '---');
    safeSetHtml('pReg', `<i class="fa-solid fa-id-card"></i> ADM: ${s.reg || '---'}`);
    safeSetHtml('pStream', `<i class="fa-solid fa-users"></i> Stream: ${s.stream || '---'}`);
    safeSetHtml('pGender', `<i class="fa-solid fa-${s.gender === 'Male' ? 'mars' : 'venus'}"></i> ${s.gender || '---'}`);
    safeSetSrc('pPhoto', s.photo || DEFAULT_AVATAR);

    // ── 2. BIO ──
    safeSetText('pDob', _formatDate(s.dob));
    safeSetText('pAdmNo', s.nemisNumber || s.reg || '-');
    safeSetText('pGuardian', s.guardianName || '-');
    safeSetText('pGuardianPhone', s.guardianPhone || '-');

    // ── 3. PROCESS ASSESSMENTS ──
    const exams = (store.exams || []).filter(e => e.studentId === s.id);

    // Overall average
    const totalScore = exams.reduce((sum, e) => sum + (parseInt(e.score) || 0), 0);
    const avg = exams.length ? Math.round(totalScore / exams.length) : 0;

    // Color the avg score
    const avgEl = $('pAvgScore');
    if (avgEl) {
        avgEl.innerText = avg + '%';
        avgEl.className = 'psb-val ' + _scoreColorClass(avg);
    }

    // ── 4. ATTENDANCE ──
    let attendance = 0;
    let attendanceSeries = [];
    if (store.attendance && Array.isArray(store.attendance)) {
        const recs = store.attendance.filter(a => a.studentId === s.id);
        if (recs.length > 0) {
            const present = recs.filter(a => a.status === 'present' || a.status === 'Present').length;
            attendance = Math.round((present / recs.length) * 100);
            // Build a monthly series from attendance records
            attendanceSeries = _buildAttendanceSeries(recs);
        }
    } else if (typeof s.attendance === 'number') {
        attendance = s.attendance;
    }
    if (attendanceSeries.length === 0 && attendance > 0) {
        attendanceSeries = _synthesizeAttendanceSeries(attendance);
    }
    const attEl = $('pAttendance');
    if (attEl) {
        attEl.innerText = attendance + '%';
        attEl.className = 'psb-val ' + (attendance >= 90 ? 'text-green' : attendance >= 75 ? 'text-blue' : 'text-orange');
    }

    // ── 5. RANK ──
    let rank = '-';
    let rankClass = 'text-muted';
    if (exams.length > 0) {
        const peers = StudentRepo.getAll().filter(p => p.grade === s.grade);
        const peerStats = peers.map(p => {
            const pExams = (store.exams || []).filter(e => e.studentId === p.id);
            const pAvg = pExams.length ? Math.round(pExams.reduce((a, e) => a + (parseInt(e.score) || 0), 0) / pExams.length) : 0;
            return { id: p.id, avg: pAvg };
        }).sort((a, b) => b.avg - a.avg);
        const idx = peerStats.findIndex(p => p.id === s.id);
        if (idx >= 0) {
            rank = '#' + (idx + 1);
            rankClass = idx < 5 ? 'text-green' : idx < 15 ? 'text-blue' : 'text-orange';
        }
    }
    const rankEl = $('pRank');
    if (rankEl) { rankEl.innerText = rank; rankEl.className = 'psb-val ' + rankClass; }

    // ── 6. FEE STATUS ──
    let fee = 'Pending';
    if (s.feeStatus) fee = s.feeStatus;
    if (store.fees && Array.isArray(store.fees)) {
        const fr = store.fees.find(f => f.studentId === s.id);
        if (fr && fr.status) fee = fr.status;
    }
    const feeEl = $('pFeeStatus');
    if (feeEl) {
        feeEl.innerText = fee;
        const fl = fee.toLowerCase();
        feeEl.className = 'psb-val ' + (
            fl.includes('clear') || fl.includes('paid') ? 'text-green' :
            fl.includes('partial') || fl.includes('pending') ? 'text-orange' :
            fl.includes('arrears') || fl.includes('overdue') ? 'text-red' : 'text-orange'
        );
    }

    // ── 7. CHARTS ──
    if (studentRadarChart) { studentRadarChart.destroy(); studentRadarChart = null; }
    if (studentTrendChart) { studentTrendChart.destroy(); studentTrendChart = null; }

    if (exams.length > 0) {
        renderRadarChart(exams);
        renderTrendChart(exams);

        // Sparklines
        const scores = exams.map(e => parseInt(e.score) || 0);
        renderSparkline('pSparkScore', scores.slice(-8), '#3b82f6');
        if (attendanceSeries.length > 0) {
            renderSparkline('pSparkAttendance', attendanceSeries.slice(-8), '#14B8A6');
        } else {
            clearCanvas('pSparkAttendance');
        }

        // Gauges
        renderSubjectGauges(exams);
    } else {
        clearCanvas('pSparkScore');
        clearCanvas('pSparkAttendance');
        safeSetHtml('pGaugeGrid', '<div class="gauge-empty">No assessment data yet.</div>');

        // Draw placeholder on chart canvases
        _drawChartPlaceholder('studentRadarChart', 'No data');
        _drawChartPlaceholder('studentTrendChart', 'No data');
    }

    // ── 8. ASSESSMENT TIMELINE ──
    renderAssessmentTimeline(exams);

    // ── 9. DISCIPLINE ──
    renderDisciplineBoard(s);

    // ── 10. Reset to first tab ──
    switchProfileTab('assessments');
}

// ── Assessment Timeline Renderer ──
function renderAssessmentTimeline(exams) {
    const container = $('pAssessmentList');
    if (!container) return;

    if (!exams || exams.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:var(--text-muted); padding:2rem;">No assessments recorded yet.</p>';
        return;
    }

    const sorted = [...exams].sort((a, b) => {
        const da = a.date ? new Date(a.date) : new Date(0);
        const db = b.date ? new Date(b.date) : new Date(0);
        return db - da; // newest first
    });

    container.innerHTML = sorted.map((e, index) => {
        const score = parseInt(e.score) || 0;
        const color = score >= 80 ? '#22C55E' : (score >= 50 ? '#F59E0B' : '#EF4444');
        const isLatest = index === 0;

        // Date display
        let dateDisplay = `<span>OCT</span><small>${24 - index}</small>`;
        if (e.date) {
            const d = new Date(e.date);
            if (!isNaN(d.getTime())) {
                const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
                dateDisplay = `<span>${months[d.getMonth()]}</span><small>${d.getDate()}</small>`;
            }
        }

        return `
        <div class="at-item ${isLatest ? 'at-latest' : ''}">
            <div class="at-date">${dateDisplay}</div>
            <div class="at-subject">
                ${escapeHtml(e.subjectName || 'Assessment')}
                ${e.unitCode ? `<span style="color:var(--text-muted);font-weight:500;font-size:0.78rem;">· ${escapeHtml(e.unitCode)}</span>` : ''}
                ${isLatest ? '<span class="at-latest-badge">Latest</span>' : ''}
            </div>
            <div class="at-score-bar">
                <div class="at-score-fill" style="width:${score}%;background:linear-gradient(90deg,${color},${color}cc);"></div>
            </div>
            <div class="at-grade" style="color:${color};">${score}%</div>
        </div>`;
    }).join('');
}

// ── Sparkline Renderer (Canvas) ──
function renderSparkline(canvasId, data, color) {
    const canvas = $(canvasId);
    if (!canvas || !data || data.length < 2) { clearCanvas(canvasId); return; }

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    // Handle zero-size canvas (e.g., hidden parent)
    if (rect.width === 0 || rect.height === 0) return;

    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const pad = 2;
    const min = Math.min(...data) - 5;
    const max = Math.max(...data) + 5;
    const range = Math.max(max - min, 1);

    // Calculate points
    const pts = data.map((v, i) => ({
        x: pad + (i / (data.length - 1)) * (w - pad * 2),
        y: pad + (1 - (v - min) / range) * (h - pad * 2)
    }));

    // Gradient fill under curve
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, color + '30');
    grad.addColorStop(1, color + '00');

    // Draw filled area
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
        const cpx = (pts[i - 1].x + pts[i].x) / 2;
        ctx.bezierCurveTo(cpx, pts[i - 1].y, cpx, pts[i].y, pts[i].x, pts[i].y);
    }
    ctx.lineTo(pts[pts.length - 1].x, h);
    ctx.lineTo(pts[0].x, h);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Draw line
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
        const cpx = (pts[i - 1].x + pts[i].x) / 2;
        ctx.bezierCurveTo(cpx, pts[i - 1].y, cpx, pts[i].y, pts[i].x, pts[i].y);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();

    // End dot
    const last = pts[pts.length - 1];
    ctx.beginPath();
    ctx.arc(last.x, last.y, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(last.x, last.y, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
}

// ── Radar Chart ──
function renderRadarChart(exams) {
    const canvas = $('studentRadarChart');
    if (!canvas || exams.length === 0) return;

    // Group by subject
    const subjectData = {};
    exams.forEach(e => {
        const sub = e.subjectName || 'Unknown';
        if (!subjectData[sub]) subjectData[sub] = [];
        subjectData[sub].push(parseInt(e.score) || 0);
    });

    const labels = Object.keys(subjectData);
    const data = labels.map(sub => {
        const scores = subjectData[sub];
        return scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    });

    if (studentRadarChart) { studentRadarChart.destroy(); studentRadarChart = null; }

    const chartCtx = canvas.getContext('2d');
    const cw = canvas.clientWidth || 200;
    const ch = canvas.clientHeight || 200;
    const gradient = chartCtx.createRadialGradient(cw / 2, ch / 2, 10, cw / 2, ch / 2, Math.max(80, cw / 2));
    gradient.addColorStop(0, 'rgba(34, 197, 94, 0.45)');
    gradient.addColorStop(1, 'rgba(34, 197, 94, 0.08)');

    studentRadarChart = new Chart(canvas, {
        type: 'radar',
        data: {
            labels: labels.map(l => l.length > 14 ? l.substring(0, 13) + '…' : l),
            datasets: [{
                label: 'Performance',
                data: data,
                backgroundColor: gradient,
                borderColor: '#22C55E',
                borderWidth: 2,
                pointBackgroundColor: '#22C55E',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#22C55E'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 800, easing: 'easeOutCubic' },
            scales: {
                r: {
                    angleLines: { color: 'rgba(226, 232, 240, 0.7)' },
                    grid: { color: 'rgba(226, 232, 240, 0.7)' },
                    pointLabels: {
                        font: { size: 11, weight: '600' },
                        color: '#64748b'
                    },
                    ticks: { display: false, backdropColor: 'transparent' },
                    suggestedMin: 0,
                    suggestedMax: 100
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#0f172a',
                    padding: 10,
                    borderRadius: 8,
                    callbacks: { label: (c) => `${c.label}: ${c.parsed.r}%` }
                }
            }
        }
    });
}

// ── Trend Chart ──
function renderTrendChart(exams) {
    const canvas = $('studentTrendChart');
    if (!canvas || exams.length === 0) return;

    // Sort chronologically
    const sorted = [...exams].sort((a, b) => {
        const da = a.date ? new Date(a.date) : new Date(0);
        const db = b.date ? new Date(b.date) : new Date(0);
        return da - db;
    });

    const data = sorted.map(e => parseInt(e.score) || 0);
    const labels = sorted.map((e, i) => {
        if (e.date) {
            const d = new Date(e.date);
            if (!isNaN(d.getTime())) {
                const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                return months[d.getMonth()] + ' ' + d.getDate();
            }
        }
        return e.subjectName ? e.subjectName.substring(0, 8) : `A${i + 1}`;
    });

    if (studentTrendChart) { studentTrendChart.destroy(); studentTrendChart = null; }

    const chartCtx = canvas.getContext('2d');
    const gradient = chartCtx.createLinearGradient(0, 0, 0, 240);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.35)');
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0.02)');

    studentTrendChart = new Chart(canvas, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Score History',
                data: data,
                borderColor: '#3b82f6',
                backgroundColor: gradient,
                fill: true,
                tension: 0.4,
                pointRadius: data.length > 12 ? 2 : 4,
                pointHoverRadius: 6,
                pointBackgroundColor: '#3b82f6',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                borderWidth: 2.5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 800, easing: 'easeOutCubic' },
            interaction: { mode: 'index', intersect: false },
            scales: {
                y: {
                    beginAtZero: true, max: 100,
                    grid: { color: 'rgba(226, 232, 240, 0.6)', borderDash: [4, 4] },
                    ticks: { color: '#94a3b8', callback: v => v + '%' }
                },
                x: {
                    grid: { display: false },
                    ticks: {
                        color: '#64748b',
                        maxRotation: 45,
                        font: { size: 10 }
                    }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#0f172a',
                    padding: 10,
                    borderRadius: 8,
                    callbacks: {
                        title: (items) => items[0] ? items[0].label : '',
                        label: (c) => {
                            const exam = sorted[c.dataIndex];
                            let line = `Score: ${c.parsed.y}%`;
                            if (exam && exam.subjectName) line += ` · ${exam.subjectName}`;
                            return line;
                        }
                    }
                }
            }
        }
    });
}

// ── Subject Mastery Gauges ──
function renderSubjectGauges(exams) {
    const container = $('pGaugeGrid');
    if (!container) return;

    const subjectData = {};
    exams.forEach(e => {
        const sub = e.subjectName || 'Unknown';
        if (!subjectData[sub]) subjectData[sub] = [];
        subjectData[sub].push(parseInt(e.score) || 0);
    });

    const entries = Object.entries(subjectData)
        .map(([sub, scores]) => ({
            sub,
            avg: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
            count: scores.length
        }))
        .sort((a, b) => b.avg - a.avg);

    if (entries.length === 0) {
        container.innerHTML = '<div class="gauge-empty">No assessment data yet.</div>';
        return;
    }

    container.innerHTML = entries.map(({ sub, avg }) => {
        const ringRadius = 26;
        const circ = 2 * Math.PI * ringRadius;
        const offset = circ - (avg / 100) * circ;
        const cls = avg >= 80 ? 'high' : (avg >= 50 ? 'mid' : 'low');
        const displaySub = sub.length > 16 ? sub.substring(0, 15) + '…' : sub;

        return `
            <div class="gauge-item" title="${escapeHtml(sub)}: ${avg}% (${entries.find(e => e.sub === sub)?.count || 0} entries)">
                <div class="gauge-ring">
                    <svg viewBox="0 0 64 64">
                        <circle class="gauge-bg" cx="32" cy="32" r="${ringRadius}"></circle>
                        <circle class="gauge-fg ${cls}" cx="32" cy="32" r="${ringRadius}"
                            stroke-dasharray="${circ.toFixed(2)}"
                            stroke-dashoffset="${offset.toFixed(2)}"></circle>
                    </svg>
                    <div class="gauge-value">${avg}%</div>
                </div>
                <div class="gauge-label">${escapeHtml(displaySub)}</div>
            </div>
        `;
    }).join('');
}

// ── Discipline Board ──
function renderDisciplineBoard(student) {
    const container = $('pDisciplineBoard');
    if (!container) return;

    const notes = (store.notes || []).filter(n => n.studentId === student.id);

    if (notes.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="display:flex;flex-direction:column;align-items:center;gap:0.5rem;padding:2rem;">
                <i class="fa-solid fa-shield-halved" style="font-size:2rem;color:var(--text-muted);opacity:0.4;"></i>
                <p style="margin:0;color:var(--text-muted);">Clean record — no disciplinary notes on file.</p>
            </div>`;
        return;
    }

    // Sort newest first
    notes.sort((a, b) => {
        const da = a.date ? new Date(a.date) : new Date(0);
        const db = b.date ? new Date(b.date) : new Date(0);
        return db - da;
    });

    container.innerHTML = notes.map(n => {
        const text = ((n.title || '') + ' ' + (n.description || '') + ' ' + (n.type || '')).toLowerCase();
        let severity = 'low';
        let severityLabel = 'Minor';
        let icon = 'fa-circle-info';

        // Check for commendations first
        if (/(award|commend|excellent|best|outstanding|improve|perfect|star|honor|merit)/.test(text)) {
            severity = 'positive';
            severityLabel = 'Commendation';
            icon = 'fa-circle-check';
        } else if (/(suspend|expulsion|fight|drug|alcohol|weapon|theft|abuse|bully|vandal)/.test(text)) {
            severity = 'high';
            severityLabel = 'Severe';
            icon = 'fa-triangle-exclamation';
        } else if (/(warning|late|absent|truancy|disrupt|noise|phone|homework|cheat)/.test(text)) {
            severity = 'medium';
            severityLabel = 'Moderate';
            icon = 'fa-circle-exclamation';
        }

        const dateStr = n.date ? _formatDate(n.date) : '—';
        const typeLabel = n.type || 'Note';

        return `
            <div class="discipline-card severity-${severity}">
                <div class="dc-icon"><i class="fa-solid ${icon}"></i></div>
                <div class="dc-body">
                    <div class="dc-title">${escapeHtml(n.title || 'Disciplinary Record')}</div>
                    <div class="dc-meta">${escapeHtml(typeLabel)} · ${dateStr}</div>
                    ${n.description ? `<div class="dc-desc">${escapeHtml(n.description)}</div>` : ''}
                </div>
                <span class="dc-severity-pill ${severity}">${severityLabel}</span>
            </div>
        `;
    }).join('');
}

// ── Tab Switcher (Enhanced with active styling) ──
function switchProfileTab(tabName) {
    // Hide all content areas
    const contentMap = { assessments: 'pContentAssessments', bio: 'pContentBio', notes: 'pContentNotes' };
    Object.entries(contentMap).forEach(([key, id]) => {
        const el = $(id);
        if (el) el.style.display = (key === tabName) ? '' : 'none';
    });

    // Update active button styling
    document.querySelectorAll('.ptm-item').forEach(btn => {
        const text = (btn.textContent || '').toLowerCase();
        let match = false;
        if (tabName === 'assessments' && text.includes('assessment')) match = true;
        if (tabName === 'bio' && text.includes('bio')) match = true;
        if (tabName === 'notes' && text.includes('discipline')) match = true;
        btn.classList.toggle('active', match);
    });
}





// ==========================================================================
//   NOTES SECTION — MASTER-DETAIL LOGIC
// ==========================================================================

let _notesSelectedId = null;
let _notesTabBound = false;
let _notesSearchBound = false;
let _notesFormBound = false;
let _notesDelBound = false;
let _pendingDeleteNoteId = null;

// ── Router Entry Point ──
function renderNotesTab() {
    if (!_notesTabBound) _bindNotesTabs();
    if (!_notesSearchBound) _bindNotesSearch();
    if (!_notesFormBound) _bindNoteForm();
    if (!_notesDelBound) _bindDeleteBtn();

    _updateTabCounts();
    _renderNotesList();

    // If no note selected or selected note was deleted, show empty detail
    if (!_notesSelectedId || !(store.notes || []).find(n => n.id === _notesSelectedId)) {
        _notesSelectedId = null;
        _renderDetailEmpty();
    } else {
        _renderDetailForNote(_notesSelectedId);
    }
}

// ── Update Tab Count Badges ──
function _updateTabCounts() {
    const notes = store.notes || [];
    const sets = {
        all: notes,
        Discipline: notes.filter(n => n.type === 'Discipline'),
        'Co-curricular': notes.filter(n => n.type === 'Co-curricular'),
        Academic: notes.filter(n => n.type === 'Academic'),
        Medical: notes.filter(n => n.type === 'Medical')
    };
    const idMap = {
        all: 'ntsCountAll',
        Discipline: 'ntsCountDiscipline',
        'Co-curricular': 'ntsCountCocurricular',
        Academic: 'ntsCountAcademic',
        Medical: 'ntsCountMedical'
    };
    Object.entries(sets).forEach(([key, arr]) => {
        const el = $(idMap[key]);
        if (el) el.textContent = arr.length;
    });
}

// ── Bind Tabs ──
function _bindNotesTabs() {
    const container = $('notesTabs');
    if (!container) return;
    container.addEventListener('click', (e) => {
        const btn = e.target.closest('.nts-btn');
        if (!btn) return;
        container.querySelectorAll('.nts-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        _renderNotesList();
    });
    _notesTabBound = true;
}

// ── Bind Search ──
function _bindNotesSearch() {
    const input = $('notesSearchInput');
    if (!input) return;
    let timer;
    input.addEventListener('input', () => {
        clearTimeout(timer);
        timer = setTimeout(_renderNotesList, 180);
    });
    _notesSearchBound = true;
}

// ── Get Active Filter ──
function _getActiveFilter() {
    return document.querySelector('#notesTabs .nts-btn.active')?.dataset.filter || 'all';
}

// ── Get Search Term ──
function _getSearchTerm() {
    return ($('notesSearchInput')?.value || '').toLowerCase().trim();
}

// ── Render Left Panel List ──
function _renderNotesList() {
    const container = $('notesItemsList');
    const footer = $('notesListFooter');
    if (!container) return;

    const notes = store.notes || [];
    const filter = _getActiveFilter();
    const search = _getSearchTerm();

    // Filter
    let filtered = filter === 'all' ? [...notes] : notes.filter(n => n.type === filter);

    // Search
    if (search.length > 0) {
        filtered = filtered.filter(n => {
            const student = StudentRepo.getById(n.studentId);
            const sName = student ? student.name.toLowerCase() : '';
            const haystack = `${sName} ${n.title || ''} ${n.description || ''} ${n.type || ''}`.toLowerCase();
            return haystack.includes(search);
        });
    }

    // Sort newest first
    filtered.sort((a, b) => {
        const da = a.date ? new Date(a.date).getTime() : 0;
        const db = b.date ? new Date(b.date).getTime() : 0;
        return db - da;
    });

    // Footer count
    if (footer) footer.textContent = `${filtered.length} record${filtered.length !== 1 ? 's' : ''}`;

    // Empty state
    if (filtered.length === 0) {
        const isFiltered = search.length > 0 || filter !== 'all';
        container.innerHTML = `
            <div class="notes-list-empty">
                <i class="fa-solid ${isFiltered ? 'fa-filter-circle-xmark' : 'fa-clipboard-list'}"></i>
                <p>${isFiltered ? 'No records match your filter.' : 'No activity records yet.'}</p>
            </div>`;
        return;
    }

    // Render items
    container.innerHTML = filtered.map(note => {
        const student = StudentRepo.getById(note.studentId);
        const sName = student ? student.name : 'Unknown Student';
        const sGrade = student ? student.grade : '';
        const severity = note.severity || 'medium';
        const isActive = note.id === _notesSelectedId;

        const badgeMap = {
            'Discipline': 'badge-discipline',
            'Co-curricular': 'badge-cocurricular',
            'Academic': 'badge-academic',
            'Medical': 'badge-medical'
        };
        const badgeCls = badgeMap[note.type] || 'badge-discipline';

        return `
        <div class="note-item ${isActive ? 'active' : ''} sev-${severity}"
             onclick="selectNote('${note.id}')" data-id="${note.id}" tabindex="0"
             onkeydown="if(event.key==='Enter')selectNote('${note.id}')">
            <div class="note-meta">
                <span class="note-student">${escapeHtml(sName)}</span>
                <span class="note-type-badge ${badgeCls}">${escapeHtml(note.type || 'Note')}</span>
            </div>
            <div class="note-preview">${escapeHtml(note.title || 'Untitled')}</div>
            <div class="note-item-footer">
                <span class="note-item-date"><i class="fa-regular fa-calendar"></i> ${_fmtDate(note.date)}</span>
                <span class="note-sev-mini sev-${severity}">${_sevLabel(severity)}</span>
            </div>
        </div>`;
    }).join('');
}

// ── Select Note — Show Detail ──
function selectNote(id) {
    _notesSelectedId = id;

    // Update active state in list
    document.querySelectorAll('#notesItemsList .note-item').forEach(el => {
        el.classList.toggle('active', el.dataset.id === id);
    });

    // Scroll active into view
    const activeEl = document.querySelector('#notesItemsList .note-item.active');
    if (activeEl) activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Render detail
    _renderDetailForNote(id);
}

// ── Render Detail Empty State ──
function _renderDetailEmpty() {
    const view = $('noteDetailView');
    if (!view) return;
    view.innerHTML = `
        <div class="detail-empty">
            <div class="detail-empty-icon"><i class="fa-solid fa-hand-pointer"></i></div>
            <h4>Select a Record</h4>
            <p>Choose an activity from the list to view its full details.</p>
        </div>`;
}

// ── Note helpers (were missing — viewing a note detail crashed) ──
function _findNoteById(id) {
    return (store.notes || []).find(n => n.id === id) || null;
}

function _getBackupData() {
    try {
        const raw = localStorage.getItem('elimutrack_backup');
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        return (parsed && typeof parsed === 'object') ? parsed : {};
    } catch (e) {
        return {};
    }
}

function _getAllNotesFromBackup() {
    const data = _getBackupData();
    return Array.isArray(data.notes) ? data.notes : (store.notes || []);
}

function _renderDetailForNote(id) {
    const view = $('noteDetailView');
    if (!view) return;

    const note = _findNoteById(id);
    if (!note) { _renderDetailEmpty(); return; }

    const sName = note._studentName || 'Unknown Student';
    const severity = note.severity || 'medium';  // ✅ FIX: declare severity
    const data = _getBackupData();
    const studentObj = data?.students?.find(s => 
        s.id === note.studentId || s.idNumber === note.studentId || s.idNumber === String(note.studentId)
    );
    const sPhoto = studentObj?.photo || DEFAULT_AVATAR;
    const sGrade = studentObj?.grade || '';
    const sStream = studentObj?.stream || '';

    const badgeMap = {
        'Discipline': { cls: 'db-discipline', val: 'val-discipline', icon: 'fa-gavel' },
        'Co-curricular': { cls: 'db-cocurricular', val: 'val-cocurricular', icon: 'fa-futbol' },
        'Academic': { cls: 'db-academic', val: 'val-academic', icon: 'fa-award' },
        'Medical': { cls: 'db-medical', val: 'val-medical', icon: 'fa-heart-pulse' }
    };
    const cfg = badgeMap[note.type] || badgeMap['Discipline'];
    const sevValMap = { low: 'val-low', medium: 'val-medium', high: 'val-high' };
    const sevClsMap = { low: 'dsb-low', medium: 'dsb-medium', high: 'dsb-high' };
    const dotColorMap = { 
        'Discipline': '#ef4444', 
        'Co-curricular': '#3b82f6', 
        'Academic': '#22c55e', 
        'Medical': '#f59e0b' 
    };

    // ✅ FIX: proper ternary with closing ) : []
    const related = note.studentId 
        ? _getAllNotesFromBackup()
            .filter(n => n.studentId === note.studentId && n.id !== note.id)
            .sort((a, b) => {
                const da = a.date ? new Date(a.date).getTime() : 0;
                const db = b.date ? new Date(b.date).getTime() : 0;
                return db - da;
            })
            .slice(0, 5) 
        : [];

    view.innerHTML = `
        <div class="detail-header">
            <div class="detail-header-left">
                <h3 class="detail-title">${escapeHtml(note.title || 'Untitled')}</h3>
                <div class="detail-badges">
                    <span class="detail-badge ${cfg.cls}"><i class="fa-solid ${cfg.icon}"></i> ${escapeHtml(note.type || 'Note')}</span>
                    <span class="detail-severity-badge ${sevClsMap[severity]}">${_sevLabel(severity)}</span>
                </div>
            </div>
            <div class="detail-actions">
                <button class="detail-btn" onclick="editNote('${note.id}')" title="Edit"><i class="fa-solid fa-pen-to-square"></i></button>
                <button class="detail-btn danger" onclick="confirmDeleteNote('${note.id}')" title="Delete"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>
        <div class="detail-student-card">
            <img src="${sPhoto}" class="dsc-avatar" alt="${escapeHtml(sName)}" onerror="this.src='${DEFAULT_AVATAR}'">
            <div class="dsc-info">
                <p class="dsc-name">${escapeHtml(sName)}</p>
                <span class="dsc-meta">${escapeHtml(sGrade)}${sStream ? ' · ' + escapeHtml(sStream) : ''}</span>
            </div>
        </div>
        <div class="detail-meta-grid">
            <div class="dmg-item"><span class="dmg-label">Type</span><span class="dmg-value ${cfg.val}">${escapeHtml(note.type || '—')}</span></div>
            <div class="dmg-item"><span class="dmg-label">Date</span><span class="dmg-value">${_fmtDate(note.date)}</span></div>
            <div class="dmg-item"><span class="dmg-label">Severity</span><span class="dmg-value ${sevValMap[severity]}">${_sevLabel(severity)}</span></div>
        </div>
        <div class="detail-body">
            <div class="detail-section-label">Details</div>
            <p class="detail-description">${escapeHtml(note.description || 'No details provided.')}</p>
            ${related.length > 0 ? `
                <div class="detail-section-label">Other Records for This Student</div>
                <div class="detail-related">
                    ${related.map(r => `
                        <div class="detail-related-item" onclick="selectNote('${r.id}')">
                            <span class="detail-related-dot" style="background:${dotColorMap[r.type] || '#94a3b8'}"></span>
                            <div class="detail-related-info">
                                <span class="detail-related-title">${escapeHtml(r.title || 'Untitled')}</span>
                                <span class="detail-related-date">${_fmtDate(r.date)} · ${escapeHtml(r.type || '')}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        </div>
        <div class="detail-footer">
            <span class="detail-footer-info"><i class="fa-regular fa-clock"></i> ${_fmtDate(note.date)}</span>
            <div class="detail-footer-actions">
                <button class="btn btn-ghost btn-sm" onclick="editNote('${note.id}')"><i class="fa-solid fa-pen"></i> Edit</button>
                <button class="btn btn-sm" style="color:#ef4444;border-color:rgba(239,68,68,0.3);" onclick="confirmDeleteNote('${note.id}')"><i class="fa-solid fa-trash"></i> Delete</button>
            </div>
        </div>`;
}

// ── Open Add Modal ──
function openAddNoteModal() {
    const form = $('noteForm');
    if (form) form.reset();
    if ($('noteEditId')) $('noteEditId').value = '';
    if ($('noteModalTitle')) $('noteModalTitle').textContent = 'Record Activity';
    if ($('noteSubmitBtn')) $('noteSubmitBtn').textContent = 'Save Record';
    if ($('noteSeverity')) $('noteSeverity').value = 'medium';
    _clearNoteErrors();

    // Populate student select
    const select = $('noteStudentSelect');
    if (select) {
        select.innerHTML = '<option value="">Select Student...</option>';
        StudentRepo.getAll().forEach(s => {
            const opt = document.createElement('option');
            opt.value = s.id;
            opt.textContent = `${s.name} (${s.grade}${s.stream ? ' ' + s.stream : ''})`;
            select.appendChild(opt);
        });
    }

    _setDateInput($('noteDate'), new Date());
    openModal('addNoteModal');

    setTimeout(() => {
        if (select && !select.value) select.focus();
    }, 300);
}

// ── Edit Note ──
function editNote(id) {
    const note = (store.notes || []).find(n => n.id === id);
    if (!note) return;

    openAddNoteModal();

    // Re-populate select first (openAddNoteModal resets it)
    const select = $('noteStudentSelect');
    if (select) select.value = note.studentId;
    if ($('noteType')) $('noteType').value = note.type || 'Discipline';
    if ($('noteTitle')) $('noteTitle').value = note.title || '';
    if ($('noteDesc')) $('noteDesc').value = note.description || '';
    _setDateInput($('noteDate'), note.date);
    if ($('noteSeverity')) $('noteSeverity').value = note.severity || 'medium';
    if ($('noteEditId')) $('noteEditId').value = id;
    if ($('noteModalTitle')) $('noteModalTitle').textContent = 'Edit Record';
    if ($('noteSubmitBtn')) $('noteSubmitBtn').textContent = 'Update Record';
}

// ── Confirm Delete ──
function confirmDeleteNote(id) {
    _pendingDeleteNoteId = id;
    openModal('deleteNoteModal');
}

// ── Execute Delete ──
function _executeDeleteNote() {
    if (!_pendingDeleteNoteId) return;
    store.notes = (store.notes || []).filter(n => n.id !== _pendingDeleteNoteId);
    saveData();
    _pendingDeleteNoteId = null;
    closeModal('deleteNoteModal');

    // If deleted note was selected, clear selection
    if (_notesSelectedId && !(store.notes || []).find(n => n.id === _notesSelectedId)) {
        _notesSelectedId = null;
    }

    _updateTabCounts();
    _renderNotesList();
    _renderDetailEmpty();
    showToast('Record deleted', 'info');
}

// ── Form Submission (fixed — was a diagnostic stub that never saved) ──
function _handleNoteSubmit(e) {
    e.preventDefault();
    e.stopPropagation();

    const studentId = $('noteStudentSelect')?.value || '';
    const type = $('noteType')?.value || '';
    const title = ($('noteTitle')?.value || '').trim();
    const description = ($('noteDesc')?.value || '').trim();
    const date = $('noteDate')?.value || '';
    const severity = $('noteSeverity')?.value || 'medium';
    const editId = ($('noteEditId')?.value || '').trim();

    // Validate
    const errors = {};
    if (!studentId) errors.student = 'Please select a student';
    if (!type) errors.type = 'Please select a type';
    if (!title) errors.title = 'Title is required';
    if (!description) errors.desc = 'Please provide details';
    if (!date) errors.date = 'Date is required';

    _showNoteErrors(errors);

    if (Object.keys(errors).length > 0) {
        const fieldMap = { student: 'noteStudentSelect', type: 'noteType', title: 'noteTitle', desc: 'noteDesc', date: 'noteDate' };
        const el = $(fieldMap[Object.keys(errors)[0]]);
        if (el) { el.focus(); el.classList.add('input-shake'); setTimeout(() => el.classList.remove('input-shake'), 500); }
        return;
    }

    if (!Array.isArray(store.notes)) store.notes = [];

    const noteData = {
        id: editId || Date.now().toString(),
        studentId, type, title, description, date, severity
    };

    // ── Actually persist the note (previously this function only logged) ──
    if (editId) {
        const idx = store.notes.findIndex(n => n.id === editId);
        if (idx !== -1) {
            store.notes[idx] = { ...store.notes[idx], ...noteData };
            showToast('Record updated successfully!');
        } else {
            store.notes.push(noteData);
            showToast('Record added successfully!');
        }
    } else {
        store.notes.push(noteData);
        showToast('Record added successfully!');
    }

    saveData();

    const form = $('noteForm');
    if (form) form.reset();
    if ($('noteEditId')) $('noteEditId').value = '';
    closeModal('addNoteModal');

    _notesSelectedId = noteData.id;
    _updateTabCounts();
    _renderNotesList();
    _renderDetailForNote(noteData.id);
}

// ── Bind Form ──
function _bindNoteForm() {
    const form = $('noteForm');
    if (form) { form.addEventListener('submit', _handleNoteSubmit); _notesFormBound = true; }
}

// ── Bind Delete Button ──
function _bindDeleteBtn() {
    const btn = $('confirmDeleteNoteBtn');
    if (btn) { btn.addEventListener('click', _executeDeleteNote); _notesDelBound = true; }
}

// ── Validation UI ──
function _showNoteErrors(errors) {
    _clearNoteErrors();
    const map = { student: 'errStudent', type: 'errType', title: 'errTitle', desc: 'errDesc', date: 'errDate' };
    const inputMap = { student: 'noteStudentSelect', type: 'noteType', title: 'noteTitle', desc: 'noteDesc', date: 'noteDate' };
    Object.entries(errors).forEach(([key, msg]) => {
        const errEl = $(map[key]); if (errEl) errEl.textContent = msg;
        const inputEl = $(inputMap[key]); if (inputEl) inputEl.classList.add('input-invalid');
    });
}

function _clearNoteErrors() {
    ['errStudent', 'errType', 'errTitle', 'errDesc', 'errDate'].forEach(id => { const el = $(id); if (el) el.textContent = ''; });
    ['noteStudentSelect', 'noteType', 'noteTitle', 'noteDesc', 'noteDate'].forEach(id => { const el = $(id); if (el) el.classList.remove('input-invalid'); });
}

// ── Helpers ──
function _fmtDate(dateStr) {
    if (!dateStr) return '—';
    try {
        const d = new Date(dateStr + 'T00:00:00');
        return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch { return dateStr; }
}

function _sevLabel(sev) {
    return { low: 'Minor', medium: 'Moderate', high: 'Serious' }[sev] || 'Moderate';
}

function _setDateInput(el, val) {
    if (!el) return;
    const d = (val instanceof Date) ? val : new Date(val);
    if (!isNaN(d.getTime())) el.value = d.toISOString().split('T')[0];
}

// ==========================================================================
//   HELPERS
// ==========================================================================

// Safe DOM setters (never crash if element missing)
function safeSetText(id, text) {
    const el = $(id);
    if (el) el.innerText = text;
}
function safeSetHtml(id, html) {
    const el = $(id);
    if (el) el.innerHTML = html;
}
function safeSetSrc(id, src) {
    const el = $(id);
    if (el) el.src = src;
}

// Clear canvas safely
function clearCanvas(canvasId) {
    const canvas = $(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Draw "no data" placeholder on chart canvases
function _drawChartPlaceholder(canvasId, message) {
    const canvas = $(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    ctx.scale(dpr, dpr);

    ctx.fillStyle = 'rgba(148,163,184,0.15)';
    ctx.font = '12px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(message, rect.width / 2, rect.height / 2);
}

// Format date string nicely
function _formatDate(dateStr) {
    if (!dateStr) return '-';
    try {
        const d = new Date(dateStr + (dateStr.includes('T') ? '' : 'T00:00:00'));
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
        return dateStr;
    }
}

// Score → color class
function _scoreColorClass(score) {
    if (score >= 80) return 'text-green';
    if (score >= 50) return 'text-blue';
    return 'text-red';
}

// Build attendance series from actual records (monthly buckets)
function _buildAttendanceSeries(records) {
    const monthly = {};
    records.forEach(r => {
        if (!r.date) return;
        const d = new Date(r.date);
        if (isNaN(d.getTime())) return;
        const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
        if (!monthly[key]) monthly[key] = { present: 0, total: 0 };
        monthly[key].total++;
        if (r.status === 'present' || r.status === 'Present') monthly[key].present++;
    });

    const sorted = Object.entries(monthly).sort((a, b) => a[0].localeCompare(b[0]));
    return sorted.slice(-8).map(([, v]) => Math.round((v.present / Math.max(v.total, 1)) * 100));
}

// Synthesize a plausible attendance series from a single percentage
function _synthesizeAttendanceSeries(targetPercent) {
    const series = [];
    let base = Math.max(60, targetPercent - 15);
    for (let i = 0; i < 7; i++) {
        base += (Math.random() - 0.4) * 5;
        base = Math.max(50, Math.min(100, base));
        series.push(Math.round(base));
    }
    series.push(targetPercent);
    return series;
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
    
    // Keep the clicked pill highlighted
    document.querySelectorAll('.band-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.band === band);
    });

    items.forEach(item => {
        if (band === 'all') {
            item.classList.add('open');
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
    setVal('courseType', subject.type || ''); 
    
    populateCourseLevels();
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

// ── ADMISSIONS EXCEL TEMPLATE (was referenced by index.html but never defined) ──
function downloadAdmissionTemplate() {
    const headers = [['Surname', 'First Name', 'Gender', 'DOB', 'Birth Cert No', 'Phone', 'Grade', 'Stream']];
    try {
        if (typeof XLSX !== 'undefined') {
            const ws = XLSX.utils.aoa_to_sheet(headers);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Admissions Template');
            XLSX.writeFile(wb, 'ElimuTrack_Admission_Template.xlsx');
            showToast('Admission template downloaded');
            return;
        }
    } catch (e) { /* fall through to CSV */ }
    const csv = headers[0].join(',') + '\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'ElimuTrack_Admission_Template.csv';
    a.click();
    showToast('Admission template downloaded (CSV)');
}

// ═══════════════════════════════════════════════════════════════════════
//   BATCH ADMISSION (manual + Excel) — FIXED: the entire modal was unwired
// ═══════════════════════════════════════════════════════════════════════
let _batchAdmissionRows = [];   // manual-entry rows
let _batchExcelRows = [];       // parsed Excel rows

function initBatchAdmission() {
    // Open the modal from the Admissions toolbar
    $('admBatchBtn')?.addEventListener('click', () => {
        if (!getVal('batchGrade')) { showToast('Select a default grade first.', 'error'); return; }
        _batchAdmissionRows = []; _batchExcelRows = [];
        renderBatchManualTable(); clearBatchExcelPreview();
        openModal('batchAdmissionModal');
    });

    // Mode tabs (Manual Entry / Excel Upload)
    document.querySelectorAll('#batchTabs .batch-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('#batchTabs .batch-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const mode = tab.dataset.mode;
            $('batchManualPanel')?.classList.toggle('active', mode === 'manual');
            $('batchExcelPanel')?.classList.toggle('active', mode === 'excel');
        });
    });

    // Manual: add row / clear all
    $('batchAddRowBtn')?.addEventListener('click', () => {
        _batchAdmissionRows.push({ surname: '', firstName: '', gender: '', grade: '', stream: '', birthCert: '', phone: '' });
        renderBatchManualTable();
    });
    $('batchClearBtn')?.addEventListener('click', () => { _batchAdmissionRows = []; renderBatchManualTable(); });

    // Excel: upload zone (click + drag & drop)
    const zone = $('batchUploadZone'), fileInput = $('batchAdmissionFile');
    if (zone && fileInput) {
        zone.addEventListener('click', () => fileInput.click());
        zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
        zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
        zone.addEventListener('drop', e => {
            e.preventDefault(); zone.classList.remove('drag-over');
            const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
            if (f) handleBatchAdmissionFile(f);
        });
        fileInput.addEventListener('change', () => handleBatchAdmissionFile(fileInput.files && fileInput.files[0]));
    }
    $('batchExcelClearBtn')?.addEventListener('click', clearBatchExcelPreview);

    // Confirm & import
    $('btnConfirmBatchAdmission')?.addEventListener('click', confirmBatchAdmission);
}

function renderBatchManualTable() {
    const tbody = $('batchManualBody');
    if (!tbody) return;
    tbody.innerHTML = _batchAdmissionRows.map((r, i) => `
        <tr>
            <td>${i + 1}</td>
            <td><input class="batch-row-input" data-idx="${i}" data-field="surname" value="${escapeHtml(r.surname)}" placeholder="Surname"></td>
            <td><input class="batch-row-input" data-idx="${i}" data-field="firstName" value="${escapeHtml(r.firstName)}" placeholder="First name"></td>
            <td><select class="batch-row-input" data-idx="${i}" data-field="gender">
                <option value="">--</option>
                <option value="Male" ${r.gender === 'Male' ? 'selected' : ''}>Male</option>
                <option value="Female" ${r.gender === 'Female' ? 'selected' : ''}>Female</option>
            </select></td>
            <td><input class="batch-row-input" data-idx="${i}" data-field="grade" value="${escapeHtml(r.grade)}" placeholder="e.g. Grade 4"></td>
            <td><input class="batch-row-input" data-idx="${i}" data-field="stream" value="${escapeHtml(r.stream)}" placeholder="e.g. Blue"></td>
            <td><input class="batch-row-input" data-idx="${i}" data-field="birthCert" value="${escapeHtml(r.birthCert)}" placeholder="BC No"></td>
            <td><input class="batch-row-input" data-idx="${i}" data-field="phone" value="${escapeHtml(r.phone)}" placeholder="07..."></td>
            <td><span class="batch-row-status"></span></td>
            <td><button class="btn btn-sm btn-ghost" data-remove-row="${i}" style="color:var(--danger);"><i class="fa-solid fa-trash"></i></button></td>
        </tr>
    `).join('');

    tbody.querySelectorAll('.batch-row-input').forEach(inp => {
        inp.addEventListener('input', () => {
            const idx = parseInt(inp.dataset.idx, 10), f = inp.dataset.field;
            if (_batchAdmissionRows[idx]) _batchAdmissionRows[idx][f] = inp.value;
            updateBatchSummary();
        });
    });
    tbody.querySelectorAll('[data-remove-row]').forEach(btn => {
        btn.addEventListener('click', () => {
            _batchAdmissionRows.splice(parseInt(btn.dataset.removeRow, 10), 1);
            renderBatchManualTable();
        });
    });
    updateBatchSummary();
}

function updateBatchSummary() {
    const valid = _batchAdmissionRows.filter(r => (r.surname || '').trim() && (r.firstName || '').trim() && (r.grade || '').trim());
    setText('batchManualCount', _batchAdmissionRows.length);
    setText('batchManualValid', valid.length);
    setText('batchManualInvalid', _batchAdmissionRows.length - valid.length);

    const tbody = $('batchManualBody');
    if (tbody) tbody.querySelectorAll('.batch-row-status').forEach((el, i) => {
        const r = _batchAdmissionRows[i];
        const ok = r && (r.surname || '').trim() && (r.firstName || '').trim() && (r.grade || '').trim();
        el.textContent = ok ? '✓' : '!';
        el.style.color = ok ? 'var(--success)' : 'var(--warning)';
    });

    const total = _batchAdmissionRows.length + _batchExcelRows.length;
    setText('batchFooterSummary', `Ready to import ${total} learner${total === 1 ? '' : 's'}`);
    const btn = $('btnConfirmBatchAdmission');
    if (btn) btn.disabled = total === 0;
}

function handleBatchAdmissionFile(file) {
    if (!file) return;
    if (typeof XLSX === 'undefined') { showToast('Excel library not loaded. Check your internet connection.', 'error'); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const wb = XLSX.read(e.target.result, { type: 'array' });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
            _batchExcelRows = rows.slice(1)
                .filter(r => r && r.some(c => c !== null && c !== undefined && String(c).trim() !== ''))
                .map(r => ({
                    surname: String(r[0] || '').trim(), firstName: String(r[1] || '').trim(),
                    gender: String(r[2] || '').trim(), dob: String(r[3] || '').trim(),
                    birthCert: String(r[4] || '').trim(), phone: String(r[5] || '').trim(),
                    grade: String(r[6] || '').trim(), stream: String(r[7] || '').trim()
                }));
            renderBatchExcelPreview();
        } catch (err) {
            console.error('[BATCH XLSX]', err);
            showToast('Could not read the file: ' + err.message, 'error');
        }
    };
    reader.readAsArrayBuffer(file);
}

function renderBatchExcelPreview() {
    const container = $('batchPreviewContainer');
    const tbody = document.querySelector('#batchPreviewTable tbody');
    if (!container || !tbody) return;
    const valid = _batchExcelRows.filter(r => r.surname && r.firstName && r.grade);
    setText('batchExcelValid', valid.length);
    setText('batchExcelInvalid', _batchExcelRows.length - valid.length);
    setText('batchExcelTotal', _batchExcelRows.length);
    tbody.innerHTML = _batchExcelRows.map((r, i) => `
        <tr>
            <td>${i + 1}</td><td>${escapeHtml(r.surname)}</td><td>${escapeHtml(r.firstName)}</td>
            <td>${escapeHtml(r.gender)}</td><td>${escapeHtml(r.dob)}</td><td>${escapeHtml(r.birthCert)}</td>
            <td>${escapeHtml(r.phone)}</td><td>${escapeHtml(r.grade)}</td><td>${escapeHtml(r.stream)}</td>
            <td>${r.surname && r.firstName && r.grade ? '<span style="color:var(--success);font-weight:700;">✓</span>' : '<span style="color:var(--warning);font-weight:700;">!</span>'}</td>
        </tr>`).join('');
    container.style.display = 'block';
    updateBatchSummary();
}

function clearBatchExcelPreview() {
    _batchExcelRows = [];
    const input = $('batchAdmissionFile'); if (input) input.value = '';
    const container = $('batchPreviewContainer'); if (container) container.style.display = 'none';
    setText('batchExcelValid', 0); setText('batchExcelInvalid', 0); setText('batchExcelTotal', 0);
    updateBatchSummary();
}

function confirmBatchAdmission() {
    const defGrade = getVal('batchGrade'), defStream = getVal('batchStream');
    const all = [..._batchAdmissionRows, ..._batchExcelRows].map(r => ({
        surname: (r.surname || '').trim(), firstName: (r.firstName || '').trim(),
        gender: (r.gender || '').trim() || 'Female',
        grade: (r.grade || '').trim() || defGrade,
        stream: (r.stream || '').trim() || defStream,
        birthCert: (r.birthCert || '').trim(), phone: (r.phone || '').trim(), dob: (r.dob || '').trim()
    })).filter(r => r.surname && r.firstName && r.grade);

    if (all.length === 0) { showToast('No valid rows to import.', 'error'); return; }
    let added = 0, skipped = 0;
    all.forEach(r => {
        const fullName = `${r.surname} ${r.firstName}`.trim();
        if (StudentRepo.getAll().some(s => s.name === fullName && s.grade === r.grade)) { skipped++; return; }
        const year = new Date().getFullYear().toString().slice(-2);
        const gCode = r.grade.replace(/\s/g, '');
        const count = StudentRepo.findBy('grade', r.grade).length + 1;
        StudentRepo.create({
            name: fullName, gender: r.gender, dob: r.dob, idNumber: r.birthCert,
            phone: r.phone, grade: r.grade, stream: r.stream,
            reg: `${gCode}/${year}/${String(count).padStart(3, '0')}`,
            photo: null, guardianName: '', guardianPhone: '', guardianRel: 'Parent',
            upiNumber: '', prevSchool: '', entryLevel: '', yearCompleted: '', nemisNumber: '', disability: ''
        });
        added++;
    });
    showToast(`Imported ${added} learner${added === 1 ? '' : 's'}${skipped ? ` · ${skipped} duplicate${skipped === 1 ? '' : 's'} skipped` : ''}`, added > 0 ? 'success' : 'error');
    _batchAdmissionRows = []; _batchExcelRows = [];
    renderBatchManualTable(); clearBatchExcelPreview();
    closeModal('batchAdmissionModal');
    renderLearnerSection();
    renderDashboard();
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
        // If it's a wrapper record with a nested scores map, unpack it.
        // FIXED: scores can arrive as a JSON string (raw /exams sync) — parse it.
        let nestedScores = e.scores;
        if (typeof nestedScores === 'string') {
            try { nestedScores = JSON.parse(nestedScores); } catch (_) { nestedScores = null; }
        }
        if (nestedScores && typeof nestedScores === 'object' && Object.keys(nestedScores).length > 0) {
            Object.values(nestedScores).forEach(s => {
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

    // Stream (FIXED: was present in the HTML but never populated or applied)
    const streamSelect = $('reportStreamFilter');
    if (streamSelect) {
        const cur = streamSelect.value;
        const streams = [...new Set((store.students || []).map(s => s.stream).filter(Boolean))].sort();
        streamSelect.innerHTML = '<option value="all">All Streams</option>';
        streams.forEach(st => {
            streamSelect.innerHTML += `<option value="${escapeHtml(st)}">${escapeHtml(st)}</option>`;
        });
        streamSelect.value = cur || 'all';
        streamSelect.onchange = () => { populateReportLearnerSelect(); };
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
            fillSchoolBanner('reportSchoolLogo', 'reportLogoPlaceholder', 'reportSchoolName', 'reportSchoolMotto', 'reportSchoolAddress');
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
    const stream = $('reportStreamFilter')?.value || 'all';
    let students = StudentRepo.getAll();
    if (grade !== 'all') students = students.filter(s => s.grade === grade);
    if (stream !== 'all') students = students.filter(s => s.stream === stream);

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

    const termFilter = $('reportTermFilter')?.value;
    const yearFilter = $('reportYearFilter')?.value;
    const data = getModernReportData(student.id,
        (termFilter && termFilter !== 'all') ? termFilter : undefined,
        (yearFilter && yearFilter !== 'all') ? yearFilter : undefined);

    const page = $('individualReportPage');
    if (!page) return;
    page.style.display = '';

    if (!data) {
        page.innerHTML = `<div style="padding:40px;text-align:center;color:#64748b;font-size:14px">
            No assessment data found for <b>${escapeHtml(student.name)}</b>.
            Record scores in the <b>Assessment</b> section first.</div>`;
        return;
    }

    const s = store.settings;
    const cols = data.columns;
    const ratingColor = (code) => code === 'EE' ? '#22c55e' : code === 'ME' ? '#3b82f6' : code === 'AE' ? '#f59e0b' : '#ef4444';
    const age = student.dob ? Math.floor((Date.now() - new Date(student.dob).getTime()) / 31557600000) : null;

    const logoHtml = s.logo
        ? `<img src="${escapeHtml(s.logo)}" style="width:52px;height:52px;border-radius:8px;object-fit:cover" alt="logo">`
        : `<div style="width:52px;height:52px;border-radius:8px;background:#f0fdf4;display:flex;align-items:center;justify-content:center;color:#16a34a;font-size:22px;font-weight:800">${escapeHtml((s.schoolName || 'S').charAt(0))}</div>`;

    const thCells = cols.map(c =>
        `<th style="padding:7px 6px;text-align:center;background:#1e293b;color:#fff;font-size:10px;white-space:nowrap">${escapeHtml(c)}</th>`).join('');

    const rowsHtml = data.rows.map(r => {
        const cells = cols.map(c => {
            const sc = r.scores[c];
            if (sc > 0) {
                const rc = ratingColor(r.rating ? r.rating.code : 'ME');
                return `<td style="text-align:center;font-weight:700;color:${rc};font-size:12px">${sc}%</td>`;
            }
            return `<td style="text-align:center;color:#cbd5e1">—</td>`;
        }).join('');
        const ratingHtml = r.rating
            ? `<span style="display:inline-block;padding:2px 10px;border-radius:14px;font-weight:700;font-size:10px;background:${ratingColor(r.rating.code)}18;color:${ratingColor(r.rating.code)}">${r.rating.code}</span>`
            : '<span style="color:#cbd5e1">—</span>';
        return `<tr style="border-bottom:1px solid #e2e8f0">
            <td style="padding:7px 6px;text-align:center;color:#64748b;font-size:11px">${r.num}</td>
            <td style="padding:7px 6px;font-weight:600;font-size:12px">${escapeHtml(r.subjectName)}</td>
            <td style="padding:7px 6px;font-size:10.5px;color:#64748b">${r.teacherName ? escapeHtml(r.teacherName) : '—'}</td>
            ${cells}
            <td style="text-align:center;font-weight:700;font-size:12px">${r.avg}%</td>
            <td style="text-align:center">${ratingHtml}</td>
        </tr>`;
    }).join('');

    const summaryHtml = `
        <div style="display:flex;gap:12px;margin:14px 0">
            <div style="flex:1;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:10px;padding:10px 14px">
                <div style="font-size:9px;font-weight:700;color:#64748b;letter-spacing:.5px">MEAN SCORE</div>
                <div style="font-size:20px;font-weight:800;color:#0f172a;margin-top:2px">${data.overallAvg}%</div>
            </div>
            <div style="flex:1;background:#16a34a;border-radius:10px;padding:10px 14px">
                <div style="font-size:9px;font-weight:700;color:rgba(255,255,255,.85);letter-spacing:.5px">OVERALL RATING</div>
                <div style="font-size:20px;font-weight:800;color:#fff;margin-top:2px">${data.overallRating ? data.overallRating.code : '—'}</div>
            </div>
            <div style="flex:1;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:10px;padding:10px 14px">
                <div style="font-size:9px;font-weight:700;color:#64748b;letter-spacing:.5px">CLASS POSITION</div>
                <div style="font-size:20px;font-weight:800;color:#0f172a;margin-top:2px">${data.rank} of ${data.totalInGrade}</div>
            </div>
        </div>`;

    const legendHtml = [['EE', 'Exceeding (80–100)', '#22c55e'], ['ME', 'Meeting (50–79)', '#3b82f6'], ['AE', 'Approaching (30–49)', '#f59e0b'], ['BE', 'Below (0–29)', '#ef4444']]
        .map(l => `<span style="display:inline-flex;align-items:center;gap:6px;margin-right:18px;font-size:10px;color:#64748b"><span style="width:10px;height:10px;border-radius:3px;background:${l[2]};display:inline-block"></span><b>${l[0]}</b>&nbsp;${l[1]}</span>`).join('');

    const infoFields = [
        ['Full Name', student.name], ['Admission No', student.reg], ['Grade', student.grade], ['Stream', student.stream],
        ['Gender', student.gender], ['Age', age && age > 0 ? age + ' yrs' : '—'], ['Position', data.rank], ['Out of', data.totalInGrade]
    ].map(f => `<div><div style="font-size:8px;font-weight:700;color:#64748b;letter-spacing:.4px">${f[0].toUpperCase()}</div>
        <div style="font-size:12px;font-weight:700;color:#0f172a;margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escapeHtml(String(f[1] == null ? '—' : f[1]))}</div></div>`).join('');

    page.innerHTML = `
    <div style="background:#fff;width:210mm;min-height:297mm;padding:12mm 14mm;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;color:#0f172a;box-shadow:0 2px 18px rgba(15,23,42,.08)">
        <div style="display:flex;align-items:flex-start;border-bottom:3px solid #16a34a;padding-bottom:10px;margin-bottom:10px">
            <div style="margin-right:14px;flex-shrink:0">${logoHtml}</div>
            <div style="flex:1">
                <div style="font-size:19px;font-weight:800;color:#0f172a">${escapeHtml(s.schoolName || 'SCHOOL NAME')}</div>
                ${s.motto ? `<div style="font-size:11px;font-style:italic;color:#64748b;margin-top:1px">${escapeHtml(s.motto)}</div>` : ''}
                <div style="font-size:10px;color:#64748b;margin-top:2px">${escapeHtml([s.address, s.phone, s.email].filter(Boolean).join('  ·  '))}</div>
            </div>
            <div style="text-align:right;font-size:9px;color:#64748b;line-height:1.7">
                <div><b>CODE:</b> ${escapeHtml(s.schoolCode || '—')}</div>
                <div><b>LEVEL:</b> ${escapeHtml(s.level || '—')}</div>
                <div><b>CATEGORY:</b> ${escapeHtml(s.category || '—')}</div>
            </div>
        </div>
        <div style="background:#1e293b;border-radius:10px;padding:9px 16px;display:flex;justify-content:center;align-items:center;position:relative;margin-bottom:12px">
            <span style="color:#fff;font-size:15px;font-weight:800;letter-spacing:.3px">LEARNER ACADEMIC REPORT CARD</span>
            <span style="color:#fff;font-size:11px;font-weight:700;position:absolute;right:16px">${escapeHtml(data.term)} — ${escapeHtml(data.year)}</span>
        </div>
        <div style="background:#f1f5f9;border:1px solid #e2e8f0;border-radius:10px;padding:10px 14px;display:grid;grid-template-columns:repeat(4,1fr);gap:6px 10px;margin-bottom:14px">${infoFields}</div>
        <table style="width:100%;border-collapse:collapse;font-size:11px">
            <thead><tr>
                <th style="padding:7px 6px;text-align:center;background:#1e293b;color:#fff;font-size:10px;width:26px">#</th>
                <th style="padding:7px 6px;background:#1e293b;color:#fff;font-size:10px;text-align:left">Learning Area</th>
                <th style="padding:7px 6px;background:#1e293b;color:#fff;font-size:10px;text-align:left">Teacher</th>
                ${thCells}
                <th style="padding:7px 6px;text-align:center;background:#1e293b;color:#fff;font-size:10px">Avg</th>
                <th style="padding:7px 6px;text-align:center;background:#1e293b;color:#fff;font-size:10px">Rating</th>
            </tr></thead>
            <tbody>
                ${rowsHtml}
                <tr style="background:#dcfce7;font-weight:800">
                    <td style="padding:8px 6px"></td>
                    <td style="padding:8px 6px;font-size:11px">OVERALL</td>
                    <td style="padding:8px 6px"></td>
                    ${cols.map(() => '<td></td>').join('')}
                    <td style="text-align:center;font-size:13px">${data.overallAvg}%</td>
                    <td style="text-align:center"><span style="display:inline-block;padding:2px 10px;border-radius:14px;font-weight:700;font-size:10px;background:${ratingColor(data.overallRating ? data.overallRating.code : 'ME')}18;color:${ratingColor(data.overallRating ? data.overallRating.code : 'ME')}">${data.overallRating ? data.overallRating.code : '—'}</span></td>
                </tr>
            </tbody>
        </table>
        ${summaryHtml}
        <div style="margin-bottom:14px">
            <div style="font-size:11px;font-weight:800;color:#0f172a">CLASS TEACHER'S REMARKS</div>
            <div style="height:2px;width:56px;background:#16a34a;margin:3px 0 8px"></div>
            <div style="font-size:11px;color:#334155;line-height:1.55;padding:0 4px">${escapeHtml(data.remarks || '')}</div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:24px;margin:28px 0 22px">
            ${['CLASS TEACHER', s.hoiTitle || 'HEAD OF INSTITUTION', 'DATE'].map(l => `
            <div style="text-align:center">
                <div style="border-top:1px solid #94a3b8;margin-bottom:5px"></div>
                <div style="font-size:9px;font-weight:700;color:#64748b">${escapeHtml(l)}</div>
            </div>`).join('')}
        </div>
        <div style="border-top:1px solid #e2e8f0;padding-top:9px;display:flex;flex-wrap:wrap;gap:6px 0">${legendHtml}</div>
    </div>`;

    // Keep the legacy info fields in sync (harmless)
    setText('reportLearnerName', student.name || '---');
    setText('reportLearnerAdm', student.reg || 'N/A');
    setText('reportLearnerGrade', student.grade || '---');
    setText('reportLearnerStream', student.stream || 'N/A');
    setText('reportLearnerGender', student.gender || '---');
    setText('reportLearnerAge', age && age > 0 ? age + ' yrs' : '---');
    setText('reportLearnerPosition', String(data.rank));
    setText('reportLearnerOutOf', String(data.totalInGrade));
    setText('reportTotalAvg', data.overallAvg + '%');
    setText('reportOverallRating', data.overallRating ? data.overallRating.code : '—');
    setText('reportSubjectsAssessed', data.rows.length + '/' + getApplicableLearningAreas(student.grade).length);
    setText('reportTeacherRemarks', data.remarks || '');
    setText('reportHeadRemarks', headRemark(data.overallRating ? data.overallRating.code : null));
    setText('reportReportDate', new Date().toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' }));
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
    // FIXED: was printCurrentReport() — printed the OLD preview layout.
    // Now downloads the modern vector PDF (same design as the preview).
    downloadIndividualReportPDF();
}

// Print ALL report cards for the filtered grade/stream (FIXED: button used
// to only show an info toast — now builds every learner's card and prints)
function printAllReportCards() {
    const grade = $('reportGradeFilter')?.value;
    if (!grade || grade === 'all') { showToast('Select a specific grade first.', 'error'); return; }
    const stream = $('reportStreamFilter')?.value || 'all';
    let students = StudentRepo.getAll().filter(s => s.grade === grade);
    if (stream !== 'all') students = students.filter(s => s.stream === stream);
    students.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    if (students.length === 0) { showToast('No learners in ' + grade, 'error'); return; }

    const parts = [];
    let rendered = 0;
    students.forEach(st => {
        try {
            const html = buildIndividualReportHTML(st.id);
            const match = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
            if (match && match[1].trim()) { parts.push(match[1]); rendered++; }
        } catch (e) { console.warn('[PRINT ALL] skipped', st.name, e.message); }
    });
    if (rendered === 0) { showToast('No report data to print for this grade.', 'error'); return; }

    const s = store.settings;
    const printWin = window.open('', '_blank', 'width=900,height=700');
    if (!printWin) { showToast('Pop-up blocked. Allow pop-ups for this site.', 'error'); return; }
    printWin.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${escapeHtml(s.schoolName || 'School')} — ${escapeHtml(grade)} Report Cards</title>
    <style>
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;color:#1e293b;font-size:13px}
        @page{size:A4;margin:10mm}
        .report-page-break{page-break-after:always;clear:both;height:0}
        .a4-page{width:auto;min-height:auto;padding:0;overflow:visible}
    </style></head><body>${parts.join('<div class="report-page-break"></div>')}</body></html>`);
    printWin.document.close();
    setTimeout(() => { printWin.print(); }, 500);
    showToast(`Printing ${rendered} report card${rendered === 1 ? '' : 's'}`);
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

    // Print All (from section header) — FIXED: prints every card in the grade
    $('reportsPrintAllBtn')?.addEventListener('click', printAllReportCards);

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
    const stream = $('reportStreamFilter')?.value || 'all';

    // Rebuild dropdown options filtered by search + grade + stream
    const scores = getFilteredScores();
    const cntMap = {};
    scores.forEach(s => { cntMap[s.studentId] = (cntMap[s.studentId] || 0) + 1; });

    let students = StudentRepo.getAll();
    if (grade !== 'all') students = students.filter(s => s.grade === grade);
    if (stream !== 'all') students = students.filter(s => s.stream === stream);
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
            /* FIXED: was height:297mm + overflow:hidden, which CLIPPED everything
               below the first page — reports showed only the top half. Height now
               grows with content and html2pdf slices it into multiple A4 pages. */
            height: auto;
            min-height: 297mm;
            padding: 12mm 15mm 10mm 15mm;
            background: #fff;
            color: #1e293b;
            overflow: visible;
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

    // FIXED (v2): html2canvas crops when its virtual window is smaller than the
    // element or offset from it — that produced PDFs chopped on the left/right/
    // bottom. Measure the element's REAL rendered box and pin width/height/
    // windowWidth/windowHeight to it, so the capture exactly matches content
    // with zero offset. pagebreak then slices the full-height canvas into A4.
    const realW = element.scrollWidth || element.offsetWidth || 794;
    const realH = element.scrollHeight || element.offsetHeight || 1123;
    console.log(`[PDF] Capturing ${realW}x${realH}px element`);
    const opt = {
        margin: [8, 8, 8, 8],
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
            scale: 2,
            useCORS: true,
            logging: false,
            scrollX: 0,
            scrollY: 0,
            width: realW,
            height: realH,
            windowWidth: realW,
            windowHeight: realH,
            removeContainer: true,
            backgroundColor: '#ffffff',
            // Normalize the cloned document so no default margins/scrollbars
            // shift the content (that offset caused left-side chopping).
            onclone: (clonedDoc) => {
                try {
                    const cb = clonedDoc.body;
                    if (cb) { cb.style.margin = '0'; cb.style.padding = '0'; cb.style.width = '794px'; }
                    const de = clonedDoc.documentElement;
                    if (de) { de.style.margin = '0'; de.style.padding = '0'; }
                } catch (_) { /* ignore */ }
            }
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
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

    // Auto-generate the on-screen preview if not yet done
    const page = $('individualReportPage');
    if (page && page.style.display === 'none') {
        generateIndividualReport();
        await new Promise(r => setTimeout(r, 150));
    }

    // FIXED: previously routed through the html2canvas pipeline, which clipped
    // the left side of the page and emitted blank trailing pages. Now uses the
    // proven vector jsPDF renderer (renderReportCardToDoc) — no clipping, no
    // blank pages, proper multi-page pagination.
    downloadStudentReportCard(student.id);
}

// ═══════════════════════════════════════════════════════════════
//   DOWNLOAD ALL GRADE REPORTS AS ONE PDF — FIXED
// ═══════════════════════════════════════════════════════════════
async function downloadGradeReportsPDF() {
    const grade = $('reportGradeFilter')?.value;
    if (!grade || grade === 'all') { 
        showToast('Select a specific grade first.', 'error'); 
        return; 
    }

    // FIXED: previously rendered via html2canvas (left-side clipping, blank
    // trailing pages). Now uses the vector jsPDF renderer — each learner gets
    // their own page in one clean, paginated PDF.
    downloadGradeReport(grade);
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


// ==========================================================================
//   SETTINGS
// ==========================================================================
function switchSettingsTab(index) {
    document.querySelectorAll('#settingsTabs .s-tab').forEach((btn, i) => btn.classList.toggle('active', i === index));
    document.querySelectorAll('#settings .s-panel').forEach((content, i) => content.classList.toggle('active', i === index));
}
function saveInstitutionDetails(e) { 
    e.preventDefault(); 
    store.settings.schoolName = getVal('setSchoolName'); store.settings.schoolCode = getVal('setSchoolCode'); store.settings.motto = getVal('setMotto'); store.settings.level = getVal('setSchoolLevel'); store.settings.category = getVal('setSchoolCategory'); store.settings.academicYear = getVal('setAcademicYear'); store.settings.currentTerm = getVal('setCurrentTerm'); store.settings.address = getVal('setAddress'); store.settings.phone = getVal('setPhone'); store.settings.email = getVal('setEmail');
    saveData(); updateHeaderAndDashboard(); showToast('School Details Saved Successfully!'); 
}

function saveHOIDetails(e) {
    e.preventDefault();
    const name = getVal('hoiName');
    if (!name) { showToast('HOI Name is required.', 'error'); return; }
    store.settings.hoiName = name; 
    store.settings.hoiTitle = getVal('hoiTitle'); 
    store.settings.hoiTsc = getVal('hoiTsc'); 
    store.settings.hoiPhone = getVal('hoiPhone'); 
    store.settings.hoiEmail = getVal('hoiEmail');
    saveData(); updateHOIPreview(); showToast('HOI Details Saved!');
}

function updateSettingsForm() { 
    setVal('setSchoolName', store.settings.schoolName); setVal('setSchoolCode', store.settings.schoolCode); setVal('setMotto', store.settings.motto); setVal('setSchoolLevel', store.settings.level || 'Primary School'); setVal('setSchoolCategory', store.settings.category || 'Public'); setVal('setAcademicYear', store.settings.academicYear || '2024'); setVal('setCurrentTerm', store.settings.currentTerm || 'Term 1'); setVal('setAddress', store.settings.address || ''); setVal('setPhone', store.settings.phone || ''); setVal('setEmail', store.settings.email || ''); 
    setVal('hoiName', store.settings.hoiName || ''); setVal('hoiTitle', store.settings.hoiTitle || 'Principal'); setVal('hoiTsc', store.settings.hoiTsc || ''); setVal('hoiPhone', store.settings.hoiPhone || ''); setVal('hoiEmail', store.settings.hoiEmail || '');
    if (store.settings.logo) { const el = $('settingsLogoPreview'); if(el) el.innerHTML = `<img src="${store.settings.logo}" alt="Logo" style="width:100%; height:100%; object-fit:contain;">`; }
    if (store.settings.stamp) { const el = $('stampPreview'); if(el) el.innerHTML = `<img src="${store.settings.stamp}" alt="Stamp">`; }
    if (store.settings.hoiSignature) { const el = $('hoiSignaturePreview'); if(el) el.innerHTML = `<img src="${store.settings.hoiSignature}" alt="HOI Signature">`; }
    if (store.settings.ctSignature) { const el = $('classTeacherSignaturePreview'); if(el) el.innerHTML = `<img src="${store.settings.ctSignature}" alt="Class Teacher Signature">`; }
    
    setVal('setEventName', store.settings.eventName || '');
    setVal('setEventDate', store.settings.eventDate || '');
    setVal('setEventDesc', store.settings.eventDesc || '');
    setVal('setNoticeTitle', store.settings.noticeTitle || '');
    setVal('setNoticeBody', store.settings.noticeBody || '');

  
    updateHeaderAndDashboard(); updateHOIPreview(); 
}

// ── ADD EVENT (single definition — the duplicate copy was removed) ──
function addEvent(e) {
    e.preventDefault();
    const title = getVal('eventTitle');
    const date = getVal('eventDate');
    if (!title || !date) { showToast('Title and date are required.', 'error'); return; }
    if (!store.settings.events) store.settings.events = [];
    store.settings.events.push({ title, date });
    saveData();
    renderEventsList();
    $('eventTitle').value = '';
    $('eventDate').value = '';
    showToast('Event added!');
}

function renderEventsList() {
    const events = store.settings.events || [];
    const tbody = $('eventsTableBody');
    const glance = $('yearGlanceList');
    if (!tbody || !glance) return;

    if (events.length === 0) {
        tbody.innerHTML = '';
        glance.innerHTML = '<div class="s-glance-empty">No events added yet</div>';
        return;
    }

    tbody.innerHTML = events.map((ev, i) => `
        <tr>
            <td>${ev.date}</td>
            <td>${ev.title}</td>
            <td><button class="s-btn s-btn-danger s-btn-sm" onclick="deleteEvent(${i})"><i class="fa-solid fa-trash"></i></button></td>
        </tr>
    `).join('');

    glance.innerHTML = events.map((ev, i) => `
        <div class="s-glance-item">
            <span class="s-glance-date">${ev.date}</span>
            <span class="s-glance-title">${ev.title}</span>
            <button class="s-glance-del" onclick="deleteEvent(${i})"><i class="fa-solid fa-xmark"></i></button>
        </div>
    `).join('');
}
function deleteEvent(i) {
    store.settings.events.splice(i, 1);
    saveData();
    renderEventsList();
}
function updateHOIPreview() {
    const name = getVal('hoiName') || 'Head of Institution';
    const title = getVal('hoiTitle') || 'Principal';
    const tsc = getVal('hoiTsc') || '---';
    const prevName = $('prevName'); if (prevName) prevName.innerText = name;
    const pName = $('hoiPreviewName'); if (pName) pName.innerText = name;
    const pTitle = $('hoiPreviewTitle'); if (pTitle) pTitle.innerText = title;
    const pTsc = $('hoiPreviewTsc'); if (pTsc) pTsc.innerText = `TSC: ${tsc}`;
    const sigPreview = $('hoiPreviewSigImg');
    if (store.settings.hoiSignature && sigPreview) { sigPreview.src = store.settings.hoiSignature; sigPreview.style.display = 'block'; }
}

function initSettingsListeners() {
    // NOTE: institutionForm / hoiForm / staffForm / courseForm are already bound
    // in initGlobalListeners() — binding them again here would double-fire saves.

    // Event form
    const evtForm = $('addEventForm');
    if (evtForm) evtForm.addEventListener('submit', addEvent);

    // Term dates form
    const termForm = $('termDatesForm');
    if (termForm) termForm.addEventListener('submit', function(e) {
        e.preventDefault();
        store.settings.term1Start = getVal('term1Start');
        store.settings.term1End = getVal('term1End');
        store.settings.term2Start = getVal('term2Start');
        store.settings.term2End = getVal('term2End');
        store.settings.term3Start = getVal('term3Start');
        store.settings.term3End = getVal('term3End');
        saveData();
        showToast('Term dates saved!');
    });

    // Image uploads
    const btnLogo = $('btnUploadLogo');
    const logoInput = $('logoInput');
    if (btnLogo && logoInput) btnLogo.addEventListener('click', () => logoInput.click());
    if (logoInput) logoInput.addEventListener('change', function() { previewLogo(this); });

    const btnStamp = $('btnUploadStamp');
    const stampInput = $('stampInput');
    if (btnStamp && stampInput) btnStamp.addEventListener('click', () => stampInput.click());
    if (stampInput) stampInput.addEventListener('change', function() { previewStamp(this); });

    const btnHoiSig = $('btnUploadHoiSignature');
    const hoiSigInput = $('hoiSignatureInput');
    if (btnHoiSig && hoiSigInput) btnHoiSig.addEventListener('click', () => hoiSigInput.click());
    if (hoiSigInput) hoiSigInput.addEventListener('change', function() { previewHOISignature(this); });

    const btnCtSig = $('btnUploadClassTeacherSignature');
    const ctSigInput = $('classTeacherSignatureInput');
    if (btnCtSig && ctSigInput) btnCtSig.addEventListener('click', () => ctSigInput.click());
    if (ctSigInput) ctSigInput.addEventListener('change', function() { previewCTSignature(this); });

    // Backup buttons
    const btnExport = $('btnExportBackup');
    if (btnExport) btnExport.addEventListener('click', exportBackup);

    const btnImport = $('btnImportBackup');
    if (btnImport) btnImport.addEventListener('click', () => {
        // Create the file picker on the fly so we don't depend on a hidden input
        const tempInput = document.createElement('input');
        tempInput.type = 'file';
        tempInput.accept = '.json';
        tempInput.onchange = function() {
            if (this.files && this.files[0]) importBackup(this);
        };
        tempInput.click();
    });

    const btnReset = $('btnResetSystem');
    if (btnReset) btnReset.addEventListener('click', function() {
        if (confirm('⚠️ This will permanently delete ALL data. Are you sure?')) {
            localStorage.clear();
            location.reload();
        }
    });
}
// 3. REPAIR: Calls the PostgreSQL repair endpoint
async function repairData() { 
    if (!confirm('Run database repair utility?')) return;
    try {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken') ||
                      localStorage.getItem('token') || localStorage.getItem('jwt');
        const res = await fetch(`${API_URL}/api/repair-data`, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const result = await res.json();
        if (result.success) {
            showToast(`Database repaired! Fixed ${result.fixed} records.`);
            forceSyncAll(); // Refresh local data
        } else {
            showToast('Repair failed', 'error');
        }
    } catch (err) {
        showToast('Error repairing database', 'error');
    }
}

// 4. FORCE SYNC: Pulls fresh data from PostgreSQL to update the screen
async function forceSyncAll() { 
    showToast('Syncing with cloud database...');
    try {
        // FIXED: login stores 'authToken' — check it before legacy keys
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken') ||
                      localStorage.getItem('token') || localStorage.getItem('jwt');
        const headers = { 'Authorization': 'Bearer ' + token };
        
        // FIXED: absolute URLs (previously relative — failed when the page was
        // served from a different origin than the backend)
        const [studentsRes, staffRes, examsRes, settingsRes, areasRes, notesRes, messagesRes] = await Promise.all([
            fetch(`${API_URL}/students`, { headers }).then(r => r.json()),
            fetch(`${API_URL}/staff`, { headers }).then(r => r.json()),
            fetch(`${API_URL}/exams`, { headers }).then(r => r.json()),
            fetch(`${API_URL}/settings`, { headers }).then(r => r.json()),
            fetch(`${API_URL}/learningAreas`, { headers }).then(r => r.json()),
            fetch(`${API_URL}/notes`, { headers }).then(r => r.json()),
            fetch(`${API_URL}/messages`, { headers }).then(r => r.json())
        ]);

        // Update local memory (merge settings so local logo/term dates etc. survive)
        store.students = Array.isArray(studentsRes) ? studentsRes : [];
        store.staff = Array.isArray(staffRes) ? staffRes : [];
        store.exams = Array.isArray(examsRes) ? examsRes : [];
        if (settingsRes && !Array.isArray(settingsRes) && typeof settingsRes === 'object') {
            store.settings = { ...store.settings, ...settingsRes };
        }
        // FIXED: keep local teacher assignments before the server replaces the list
        const localTeacherMap = {};
        (store.learningAreas || []).forEach(a => { if (a.teacherId) localTeacherMap[a.id] = a.teacherId; });
        store.learningAreas = Array.isArray(areasRes) && areasRes.length > 0 ? areasRes : store.learningAreas;
        if (Array.isArray(areasRes)) {
            store.learningAreas.forEach(a => { if (!a.teacherId && localTeacherMap[a.id]) a.teacherId = localTeacherMap[a.id]; });
        }
        if (Array.isArray(notesRes)) store.notes = notesRes;
        if (Array.isArray(messagesRes)) store.messages = messagesRes;

        // Save to browser and update UI
        saveData();
        updateHeaderAndDashboard();
        
        showToast('Cloud Sync Complete!');
    } catch (err) {
        showToast('Sync failed: ' + err.message, 'error');
    }
}
function updateHeaderAndDashboard() { 
    if ($('dashSchoolName')) $('dashSchoolName').innerText = store.settings.schoolName; 
    if ($('dashAdminName')) $('dashAdminName').innerText = CURRENT_USER?.name || 'Admin'; 
    if ($('brandName')) $('brandName').innerText = store.settings.schoolName; 
    if ($('prevName')) $('prevName').innerText = store.settings.schoolName; 
    if ($('prevMotto')) $('prevMotto').innerText = store.settings.motto; 
    if ($('prevCode')) $('prevCode').innerText = "Code: " + store.settings.schoolCode;
    const brandIconImg = document.querySelector('.brand-icon img'); 
    if (brandIconImg && store.settings.logo) { brandIconImg.src = store.settings.logo; }
}

// 1. EXPORT: Fetches real data from PostgreSQL and downloads it
async function exportBackup() { 
    try {
        showToast('Fetching database backup...');
        
        // SUPER SMART TOKEN FINDER: Checks all possible pockets
        let token = localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('jwt');
        
        // If still not found, check if it's hidden inside a 'user' object
        if (!token) {
            try {
                const userStr = localStorage.getItem('user') || localStorage.getItem('currentUser');
                if (userStr) {
                    const userObj = JSON.parse(userStr);
                    if (userObj.token) token = userObj.token;
                }
            } catch(e) {}
        }

        if (!token) {
            showToast('Error: You are not logged in. Please log out and log back in.', 'error');
            return;
        }

        const res = await fetch(`${API_URL}/api/db`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        
        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || 'Server blocked the request');
        }
        
        const data = await res.json();
        const dataStr = JSON.stringify(data, null, 2); 
        const blob = new Blob([dataStr], { type: 'application/json' }); 
        const a = document.createElement('a'); 
        a.href = URL.createObjectURL(blob); 
        a.download = `elimutrack_backup_${new Date().toISOString().split('T')[0]}.json`; 
        a.click(); 
        showToast('Database Backup Exported'); 
    } catch (err) {
        showToast('Error exporting: ' + err.message, 'error');
    }
}
const safeReplace = async (client, table, data, columns) => {
    if (!data || !Array.isArray(data)) return;
    await client.query(`DELETE FROM "${table}"`);
    for (const r of data) {
        const values = columns.map(c => { 
            const val = r[c]; 
            if (val === null || val === undefined) return null; 
            if (typeof val === 'object') return JSON.stringify(val); 
            return val; 
        });
        const placeholders = values.map((_, idx) => `$${idx + 1}`).join(', ');
        
        // NEW: Tell Postgres to OVERWRITE if a duplicate ID is found in the JSON file
        const updateSet = columns.slice(1).map(c => `"${c}" = EXCLUDED."${c}"`).join(', ');
        const sql = `INSERT INTO "${table}" ("${columns.join('","')}") VALUES (${placeholders}) ON CONFLICT (id) DO UPDATE SET ${updateSet}`;
        
        await client.query(sql, values);
    }
};
async function importBackup(input) { 
    const file = input.files[0]; 
    if (!file) return; 
    
    // 1. Make the button say "Uploading" so you know it's working
    const btn = document.getElementById('btnImportBackup');
    const originalText = btn.innerText;
    btn.innerText = 'Uploading to Cloud... Please wait!';
    btn.disabled = true;

    if (!confirm('⚠️ WARNING: This will OVERWRITE all database data with this file. Are you absolutely sure?')) {
        input.value = ''; 
        btn.innerText = originalText; 
        btn.disabled = false;
        return;
    }

    const reader = new FileReader(); 
    reader.onload = async function(e) { 
        try { 
            const importedData = JSON.parse(e.target.result); 
            
            // 2. Check for token safely
            const token = localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('jwt');
            if (!token) {
                showToast('You are not logged in!', 'error');
                btn.innerText = originalText; btn.disabled = false;
                return;
            }

            // 3. Send to server
            const res = await fetch(`${API_URL}/api/restore`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(importedData)
            });

            const result = await res.json();

            // 4. Handle success or failure
            if (result.success) {
                showToast('Database Restored! Refreshing page...');
                setTimeout(() => location.reload(), 1500);
            } else {
                showToast('Restore failed: ' + (result.details || result.error), 'error');
                btn.innerText = originalText; btn.disabled = false;
            }
        } catch (err) { 
            console.error("IMPORT ERROR:", err);
            showToast('Error: ' + err.message, 'error'); 
            btn.innerText = originalText; btn.disabled = false;
        } 
    }; 
    reader.readAsText(file); 
    input.value = ''; 
}
async function pushToCloud() {
    if (!confirm('⚠️ WARNING: This will OVERWRITE all live data on your website with your local data. Are you sure?')) return;

    const btn = event.target.closest('button');
    const originalText = btn.innerText;
    btn.innerText = 'Pushing to Cloud...';
    btn.disabled = true;

    try {
        // 1. Find your login token
        let token = localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('jwt');
        if (!token) {
            try {
                const userStr = localStorage.getItem('user') || localStorage.getItem('currentUser');
                if (userStr) {
                    const userObj = JSON.parse(userStr);
                    if (userObj.token) token = userObj.token;
                }
            } catch(e) {}
        }

        if (!token) {
            showToast('You must be logged in locally first.', 'error');
            btn.innerText = originalText; btn.disabled = false;
            return;
        }

        showToast('Fetching local data...');
        // 2. Download data from your LOCAL PC
        const localRes = await fetch(`${API_URL}/api/db`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (!localRes.ok) throw new Error('Failed to fetch local data');
        const data = await localRes.json();

        // FIXED: the upload must target the LIVE website, not the local server.
        // (An earlier URL "fix" pointed it at API_URL, so pushing became a
        // local no-op.) Defaults to this app's live site; override with
        // localStorage.setItem('elimutrack_cloud_url', 'https://your-site.com')
        const CLOUD_URL = (localStorage.getItem('elimutrack_cloud_url') || 'https://my-schools-2dp2pg.fly.dev').replace(/\/+$/, '');

        showToast(`Uploading to ${CLOUD_URL}... Please wait.`);
        // 3. Upload data to your LIVE website
        const cloudRes = await fetch(`${CLOUD_URL}/api/restore`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(data)
        });

        if (!cloudRes.ok && cloudRes.status === 401) {
            throw new Error('The live site rejected your login. Open your live site in a new tab, log in once, then try again.');
        }
        const result = await cloudRes.json();

        if (result.success) {
            showToast('✅ Successfully pushed to the cloud!');
        } else {
            if (result.error === 'User not found.' || result.error === 'Invalid or expired token.') {
                throw new Error('The live site needs your login. Open your live site in a new tab, log in once, then try pushing again.');
            }
            throw new Error(result.details || result.error || 'Push failed');
        }
    } catch (err) {
        console.error('[PUSH ERROR]', err);
        showToast('Push failed: ' + err.message, 'error');
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
}
// (Dead duplicate of handleGlobalSearch removed — the working version above
//  the STUBS section performs the actual student/staff search; the duplicate
//  called an undefined applyFilters() and crashed global search.)
// 2. HANDLE STEPS (Next / Back)
//    Removed handleStaffStep(): it duplicated the body-level listener in
//    initGlobalListeners() but skipped Step 1 validation, letting users
//    jump to Step 2 with empty required fields. The validated path
//    (nextStaffStep/prevStaffStep) is the single source of truth now.

function processAndSaveImage(input, key, previewId) {
    const file = input.files[0]; if (!file) return; if (!file.type.startsWith('image/')) { showToast('Please select a valid image file.', 'error'); return; }
    const reader = new FileReader(); reader.onload = function(e) {
        const img = new Image(); img.onload = function() {
            const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d'); const MAX_WIDTH = 300; const MAX_HEIGHT = 300;
            let width = img.width; let height = img.height;
            if (width > height) { if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; } } else { if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; } }
            canvas.width = width; canvas.height = height; ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8); store.settings[key] = dataUrl; saveData();
            const preview = $(previewId); if (preview) { preview.innerHTML = `<img src="${dataUrl}" alt="${key}" style="width:100%; height:100%; object-fit:contain;">`; }
            if (key === 'logo') updateHeaderAndDashboard();
            if (key === 'hoiSignature') updateHOIPreview();
            showToast('Image uploaded successfully.');
        }; img.src = e.target.result;
    }; reader.readAsDataURL(file);
}

function previewLogo(input) { processAndSaveImage(input, 'logo', 'settingsLogoPreview'); }
function previewStamp(input) { processAndSaveImage(input, 'stamp', 'stampPreview'); }
function previewHOISignature(input) { processAndSaveImage(input, 'hoiSignature', 'hoiSignaturePreview'); }
function previewCTSignature(input) { processAndSaveImage(input, 'ctSignature', 'classTeacherSignaturePreview'); }
// (Raw top-level binding blocks for image uploads and backup export/import/reset
//  were removed — they duplicated initSettingsListeners() (now called from
//  initializeApp) and crashed at parse time if the target elements were missing,
//  because unguarded document.getElementById(...).addEventListener(...) throws.)
