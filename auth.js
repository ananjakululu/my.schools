'use strict';

// ==========================================================================
//   OFFLINE AUTHENTICATION HELPERS
// ==========================================================================

const OfflineAuth = {
    STORAGE_KEY: 'offline_session_backup',

    decodeJWT(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
            );
            return JSON.parse(jsonPayload);
        } catch (e) {
            return null;
        }
    },

    isTokenValid(token) {
        const payload = this.decodeJWT(token);
        if (!payload || !payload.exp) return false;
        return (payload.exp * 1000) > (Date.now() + 30 * 60 * 1000);
    },

    saveSession(token, user) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify({ token, user }));
            console.log('[OfflineAuth] Backup saved successfully.');
        } catch (e) {
            console.error('Failed to save offline session:', e);
        }
    },

    getSession() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            if (!data) return null;
            const session = JSON.parse(data);
            if (!session.token || !session.user) return null;
            return session;
        } catch (e) {
            return null;
        }
    },

    clearSession() {
        localStorage.removeItem(this.STORAGE_KEY);
    }
};


// ==========================================================================
//   INITIALIZATION
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. SECURITY CHECK
    const token = localStorage.getItem('authToken');
    
    if (token) {
        if (OfflineAuth.isTokenValid(token)) {
            // Use replace() to prevent infinite redirect loops
            window.location.replace('dashboard.html');
            return; 
        } else {
            // Token is DEAD. Delete it.
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            // ⚠️ DO NOT DELETE THE OFFLINE BACKUP HERE! ⚠️
        }
    }

    // OFFLINE FALLBACK: Check if we have a valid offline backup
    const offlineSession = OfflineAuth.getSession();
    if (offlineSession && OfflineAuth.isTokenValid(offlineSession.token)) {
        localStorage.setItem('authToken', offlineSession.token);
        localStorage.setItem('user', JSON.stringify(offlineSession.user));
        sessionStorage.setItem('offline_mode', 'true');
        window.location.replace('dashboard.html');
        return;
    }

    // 2. THEME INITIALIZATION
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        if (icon) icon.className = savedTheme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }

    themeToggle?.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        const icon = themeToggle.querySelector('i');
        if (icon) icon.className = next === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    });
});

// ==========================================================================
//   UI HELPER FUNCTIONS
// ==========================================================================

function togglePasswordVisibility(inputId, btn) {
    const input = document.getElementById(inputId);
    const icon = btn.querySelector('i');
    if (!input || !icon) return;

    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
}

function switchMode(mode) {
    const slider = document.getElementById('slider');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const btns = document.querySelectorAll('.toggle-btn');

    if (!slider || !loginForm || !signupForm) return;

    if (mode === 'login') {
        slider.style.transform = 'translateX(0)';
        btns[0].classList.add('active');
        btns[1].classList.remove('active');
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
    } else {
        slider.style.transform = 'translateX(100%)';
        btns[1].classList.add('active');
        btns[0].classList.remove('active');
        signupForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
    }
}

function showToast(msg, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${msg}</span>`;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ==========================================================================
//   AUTHENTICATION LOGIC
// ==========================================================================

// 1. LOGIN FORM HANDLER
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const btn = document.getElementById('loginBtn');
    const originalText = btn.innerHTML;
    
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Signing in...';
    btn.disabled = true;

    const email = document.getElementById('loginUser').value; 
    const password = document.getElementById('loginPass').value;

    // --- OFFLINE FALLBACK HELPER ---
    const attemptOfflineFallback = () => {
        console.warn('Server unreachable. Attempting offline login...');
        const offlineSession = OfflineAuth.getSession();

        if (offlineSession && OfflineAuth.isTokenValid(offlineSession.token)) {
            if (offlineSession.user.email.toLowerCase() === email.toLowerCase()) {
                localStorage.setItem('authToken', offlineSession.token);
                localStorage.setItem('user', JSON.stringify(offlineSession.user));
                sessionStorage.setItem('offline_mode', 'true');
                showToast('Logged in offline. Data may be cached.', 'success');
                // Use replace() here too!
                setTimeout(() => window.location.replace('dashboard.html'), 1000);
                return true; 
            } else {
                showToast('Offline error: Email does not match cached session.', 'error');
            }
        } else {
            if (!offlineSession) {
                showToast('Offline unavailable: No backup found. Log in online first.', 'error');
            } else {
                showToast('Offline unavailable: Backup token expired. Connect to internet.', 'error');
            }
        }
        
        btn.innerHTML = originalText;
        btn.disabled = false;
        return false;
    };

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        let data;
        try {
            data = await res.json();
        } catch (parseError) {
            throw new Error('Server returned an invalid response (not JSON).');
        }

        if (data.success) {
            // ONLINE LOGIN SUCCESS
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            OfflineAuth.saveSession(data.token, data.user);
            sessionStorage.removeItem('offline_mode');
            showToast('Login Successful! Redirecting...', 'success');
            setTimeout(() => window.location.replace('dashboard.html'), 1000);
            
        } else if (res.status === 401 || res.status === 403 || res.status === 423) {
            showToast(data.message || 'Invalid email or password.', 'error');
            btn.innerHTML = originalText;
            btn.disabled = false;
            
        } else if (res.status >= 500) {
            showToast(`Server Error (${res.status}): Is your database running?`, 'error');
            btn.innerHTML = originalText;
            btn.disabled = false;
        } else {
            showToast(data.message || 'Unknown login error.', 'error');
            btn.innerHTML = originalText;
            btn.disabled = false;
        }

    } catch (err) {
        console.error('Network Error Details:', err.name, err.message);

        if (err.name === 'AbortError' || err.message.includes('Failed to fetch')) {
            showToast('Cannot reach server. Trying offline...', 'error');
            return attemptOfflineFallback();
            
        } else {
            showToast(`Unexpected error: ${err.message}`, 'error');
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }
});

// 2. SIGNUP FORM HANDLER
document.getElementById('signupForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating...';
    btn.disabled = true;

    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPass').value;

    try {
        const res = await fetch('/api/signup', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const data = await res.json();

        if (data.success) {
            showToast('Account created! Please log in.', 'success');
            e.target.reset();
            switchMode('login'); 
        } else {
            showToast(data.message || 'Failed to create account.', 'error');
        }
    } catch (err) {
        console.error(err);
        showToast('Network error.', 'error');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
});

// ==========================================================================
//   LOGOUT HELPER
// ==========================================================================

function logout() {
    // 1. Instantly wipe active auth data
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('offline_mode');
    
    // ⚠️⚠️⚠️ CRITICAL: DO NOT DELETE 'offline_session_backup' HERE! ⚠️⚠️⚠️
    // If you delete it, offline login dies forever until they log in online again.
    
    // 2. Use replace() to prevent infinite redirect loops offline
    window.location.replace('login.html');
}
