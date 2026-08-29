'use strict';

// ==========================================================================
//   ELIMUTRACK AUTH CLIENT — wired to the real server API (server.js)
//   POST /api/login · /api/logout · /api/signup
//   POST /api/forgot-password · /api/reset-password · /api/change-password
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    handleRedirectReason();

    // Already authenticated → straight into the app
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (token) {
        window.location.replace('dashboard.html');
        return;
    }
});

// ==========================================================================
//   THEME
// ==========================================================================
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        if (icon) icon.className = savedTheme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
        themeToggle.addEventListener('click', () => {
            const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('theme', next);
            const i = themeToggle.querySelector('i');
            if (i) i.className = next === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
        });
    }
}

// ==========================================================================
//   UI HELPERS
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
    const forgotPanel = document.getElementById('forgotPanel');
    const btns = document.querySelectorAll('.toggle-btn');
    if (!slider || !loginForm || !signupForm) return;

    // Leaving forgot-password returns to login
    if (forgotPanel) forgotPanel.classList.add('hidden');

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
    const icon = type === 'success' ? 'fa-circle-check' : type === 'info' ? 'fa-circle-info' : 'fa-circle-exclamation';
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3800);
}

// ── Inline field errors ──
function setFieldError(inputId, message) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const wrapper = input.closest('.form-group');
    const errEl = wrapper ? wrapper.querySelector('.field-error') : null;
    input.classList.toggle('invalid', !!message);
    input.classList.toggle('valid', !message && input.value);
    if (errEl) errEl.textContent = message || '';
}
function clearFormErrors(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    form.querySelectorAll('.field-error').forEach(el => { el.textContent = ''; });
    form.querySelectorAll('.form-input.invalid').forEach(el => el.classList.remove('invalid'));
}

// ── Client-side validators (mirror the server rules) ──
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}
function passwordIssues(pw) {
    const issues = [];
    if (!pw || pw.length < 8) issues.push('at least 8 characters');
    if (!/[A-Z]/.test(pw)) issues.push('one uppercase letter');
    if (!/[a-z]/.test(pw)) issues.push('one lowercase letter');
    if (!/[0-9]/.test(pw)) issues.push('one number');
    return issues;
}

// ── Live password strength meter (signup) ──
function initStrengthMeter() {
    const input = document.getElementById('signupPass');
    const bar = document.getElementById('strengthBar');
    const label = document.getElementById('strengthLabel');
    if (!input || !bar) return;
    input.addEventListener('input', () => {
        const pw = input.value;
        const issues = passwordIssues(pw);
        let score = 0, txt = '', cls = '';
        if (pw.length >= 8) score++;
        if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
        if (/[0-9]/.test(pw)) score++;
        if (pw.length >= 12) score++;
        if (pw.length === 0) { score = 0; txt = ''; }
        else if (score <= 1) { txt = 'Weak'; cls = 'weak'; }
        else if (score === 2) { txt = 'Fair'; cls = 'fair'; }
        else if (score === 3) { txt = 'Good'; cls = 'good'; }
        else { txt = 'Strong'; cls = 'strong'; }
        bar.className = 'strength-bar ' + cls;
        bar.style.width = (score / 4) * 100 + '%';
        if (label) { label.textContent = txt; label.className = 'strength-label ' + cls; }
        const hint = document.getElementById('signupPassHint');
        if (hint) hint.textContent = issues.length ? 'Needs: ' + issues.join(', ') : 'Password looks great';
    });
}

// ── Login mode switcher: Staff Email · Teacher TSC/ID · Parent (Student) ──
function setLoginMode(mode) {
    document.querySelectorAll('.login-mode-btn').forEach(b => b.classList.toggle('active', b.dataset.lmode === mode));
    ['email', 'staff', 'parent'].forEach(m => {
        const group = document.getElementById('loginGroup-' + m);
        if (group) group.style.display = m === mode ? '' : 'none';
    });
    clearFormErrors('loginForm');
}
window.setLoginMode = setLoginMode;

// ==========================================================================
//   LOGIN
// ==========================================================================
async function handleLogin(e) {
    e.preventDefault();
    const mode = (document.querySelector('.login-mode-btn.active') || {}).dataset?.lmode || 'email';

    clearFormErrors('loginForm');
    let ok = true;
    let payload = { password: '' };
    if (mode === 'staff') {
        // Teacher login: surname + TSC/ID number + password
        const surname = document.getElementById('staffSurname').value.trim();
        const number = document.getElementById('staffNumber').value.trim();
        const password = document.getElementById('staffPass').value;
        if (!surname) { setFieldError('staffSurname', 'Surname is required.'); ok = false; }
        if (!number) { setFieldError('staffNumber', 'TSC or ID number is required.'); ok = false; }
        if (!password) { setFieldError('staffPass', 'Password is required.'); ok = false; }
        if (!ok) return;
        payload = { loginMode: 'staff', staffSurname: surname, staffNumber: number, password };
    } else if (mode === 'parent') {
        // Parent login: student name + admission number + access password
        const sName = document.getElementById('studentName').value.trim();
        const sAdm = document.getElementById('studentAdm').value.trim();
        const password = document.getElementById('parentPass').value;
        if (!sName) { setFieldError('studentName', 'Student name is required.'); ok = false; }
        if (!sAdm) { setFieldError('studentAdm', 'Admission number is required.'); ok = false; }
        if (!password) { setFieldError('parentPass', 'Password is required.'); ok = false; }
        if (!ok) return;
        payload = { loginMode: 'parent', studentName: sName, studentAdm: sAdm, password };
    } else {
        // Staff email or learner ADM/NEMIS/UPI (auto)
        const email = document.getElementById('loginUser').value.trim();
        const password = document.getElementById('loginPass').value;
        if (!email) { setFieldError('loginUser', 'Email or ADM number is required.'); ok = false; }
        else if (email.includes('@') && !isValidEmail(email)) { setFieldError('loginUser', 'Enter a valid email or ADM number.'); ok = false; }
        if (!password) { setFieldError('loginPass', 'Password is required.'); ok = false; }
        if (!ok) return;
        payload = { email, password };
    }

    const remember = (document.getElementById('rememberMe') || {}).checked;
    const btn = document.getElementById('loginBtn');
    const original = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Signing in...';
    btn.disabled = true;

    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json().catch(() => ({}));

        if (res.ok && data.success) {
            // Token + user → the app (dashboard.html) reads both from storage
            (remember ? localStorage : sessionStorage).setItem('authToken', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('authRole', data.user.role || '');
            localStorage.setItem('authName', data.user.name || '');

            showToast(`Welcome back, ${data.user.name || 'there'}! Redirecting...`, 'success');
            setTimeout(() => { window.location.href = 'dashboard.html'; }, 800);
            return;
        }

        // Structured failure from the server
        const message = data.message || data.error || 'Invalid email or password.';
        if (res.status === 423) setFieldError('loginPass', message);            // locked — inline only
        else if (res.status === 403) setFieldError('loginUser', message);       // suspended — inline only
        else if (res.status === 503) showToast(message, 'error');               // offline — toast only
        else { setFieldError('loginPass', message); showToast(message, 'error'); }
    } catch (err) {
        console.error('[LOGIN]', err);
        showToast('Cannot reach the server. Is it running on this host?', 'error');
    } finally {
        btn.innerHTML = original;
        btn.disabled = false;
    }
}

// ==========================================================================
//   SIGNUP (public signups become Teacher / Parent — server enforced)
// ==========================================================================
async function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPass').value;
    const confirm = document.getElementById('signupConfirm').value;
    const role = document.getElementById('signupRole').value;
    // Optional parent↔student linking — only when the checkbox is ticked
    const linkNow = document.getElementById('signupLinkNow') ? document.getElementById('signupLinkNow').checked : false;
    const adm = document.getElementById('signupAdm') ? document.getElementById('signupAdm').value.trim() : '';
    const phone = document.getElementById('signupGuardianPhone') ? document.getElementById('signupGuardianPhone').value.trim() : '';

    clearFormErrors('signupForm');
    let ok = true;
    if (name.split(/\s+/).length < 2) { setFieldError('signupName', 'Enter your full name.'); ok = false; }
    if (!email) { setFieldError('signupEmail', 'Email is required.'); ok = false; }
    else if (!isValidEmail(email)) { setFieldError('signupEmail', 'Enter a valid email address.'); ok = false; }
    const issues = passwordIssues(password);
    if (issues.length > 0) { setFieldError('signupPass', 'Needs: ' + issues.join(', ')); ok = false; }
    if (confirm !== password) { setFieldError('signupConfirm', 'Passwords do not match.'); ok = false; }
    // Linking is fully optional — only validate when the user chose to link
    if (role === 'parent' && linkNow) {
        if (!adm) { setFieldError('signupAdm', 'Enter the learner ADM / NEMIS / UPI to link your child.'); ok = false; }
        if (!phone) { setFieldError('signupGuardianPhone', 'Enter the guardian phone number on file (or untick to skip linking).'); ok = false; }
    }
    if (!ok) return;

    const btn = e.target.querySelector('button[type="submit"]');
    const original = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating...';
    btn.disabled = true;

    try {
        const res = await fetch('/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, role, linkAdm: role === 'parent' && linkNow && adm ? adm : undefined, linkGuardianPhone: role === 'parent' && linkNow && phone ? phone : undefined })
        });
        const data = await res.json().catch(() => ({}));
        const message = data.message || data.error || 'Failed to create account.';
        if (res.ok && data.success) {
            showToast(message, 'success');
            e.target.reset();
            if (document.getElementById('strengthBar')) document.getElementById('strengthBar').style.width = '0';
            switchMode('login');
        } else if (res.status === 400) {
            showToast(message, 'error');
            if (/password/i.test(message)) setFieldError('signupPass', message);
            if (/email/i.test(message)) setFieldError('signupEmail', message);
            if (/learner|adm|nemis|upi/i.test(message)) setFieldError('signupAdm', message);
            if (/phone|guardian/i.test(message)) setFieldError('signupGuardianPhone', message);
        } else {
            showToast(message, 'error');
        }
    } catch (err) {
        console.error('[SIGNUP]', err);
        showToast('Cannot reach the server. Please try again.', 'error');
    } finally {
        btn.innerHTML = original;
        btn.disabled = false;
    }
}

// ==========================================================================
//   FORGOT / RESET PASSWORD (server returns the reset token for demo use)
// ==========================================================================
function showForgotPanel() {
    document.getElementById('forgotPanel')?.classList.remove('hidden');
    document.getElementById('loginForm')?.classList.add('hidden');
    document.getElementById('signupForm')?.classList.add('hidden');
    document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
    clearForgot();
}
function closeForgotPanel() {
    document.getElementById('forgotPanel')?.classList.add('hidden');
    document.getElementById('loginForm')?.classList.remove('hidden');
    const btns = document.querySelectorAll('.toggle-btn');
    if (btns[0]) btns[0].classList.add('active');
    if (btns[1]) btns[1].classList.remove('active');
    const slider = document.getElementById('slider');
    if (slider) slider.style.transform = 'translateX(0)';
}
function clearForgot() {
    ['forgotEmail', 'forgotToken', 'forgotNewPass', 'forgotConfirm'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    const status = document.getElementById('forgotStatus');
    if (status) status.className = 'forgot-status';
    if (status) status.innerHTML = '';
}

async function requestResetLink() {
    const email = document.getElementById('forgotEmail').value.trim();
    const status = document.getElementById('forgotStatus');
    if (!isValidEmail(email)) { setFieldError('forgotEmail', 'Enter a valid email address.'); return; }
    setFieldError('forgotEmail', '');
    if (status) { status.className = 'forgot-status'; status.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Checking account...'; }

    try {
        const res = await fetch('/api/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.success) {
            const msg = data.message || 'Reset link generated.';
            if (data.token) {
                // No mailer configured — server echoes the token for demo/dev.
                document.getElementById('forgotToken')?.setAttribute('placeholder', data.token);
                if (status) {
                    status.className = 'forgot-status success';
                    status.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${escapeHtml(msg)}<br><small>Demo mode — your reset token: <code>${escapeHtml(data.token)}</code></small>`;
                }
                showToast('Reset token generated (demo mode).', 'info');
            } else {
                if (status) {
                    status.className = 'forgot-status success';
                    status.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${escapeHtml(msg)}`;
                }
            }
        } else {
            const message = data.message || data.error || 'Request failed.';
            if (status) { status.className = 'forgot-status error'; status.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${escapeHtml(message)}`; }
        }
    } catch (err) {
        console.error('[FORGOT]', err);
        if (status) { status.className = 'forgot-status error'; status.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Cannot reach the server.'; }
    }
}

async function submitPasswordReset() {
    const token = document.getElementById('forgotToken').value.trim();
    const newPassword = document.getElementById('forgotNewPass').value;
    const confirm = document.getElementById('forgotConfirm').value;
    const status = document.getElementById('forgotStatus');
    const issues = passwordIssues(newPassword);

    if (!token) { setFieldError('forgotToken', 'Reset token is required.'); return; }
    setFieldError('forgotToken', '');
    if (issues.length > 0) { setFieldError('forgotNewPass', 'Needs: ' + issues.join(', ')); return; }
    setFieldError('forgotNewPass', '');
    if (confirm !== newPassword) { setFieldError('forgotConfirm', 'Passwords do not match.'); return; }
    setFieldError('forgotConfirm', '');

    if (status) { status.className = 'forgot-status'; status.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Resetting password...'; }
    try {
        const res = await fetch('/api/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, newPassword })
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.success) {
            if (status) { status.className = 'forgot-status success'; status.innerHTML = '<i class="fa-solid fa-circle-check"></i> Password reset! Sign in below.'; }
            showToast('Password reset successfully.', 'success');
            clearForgot();
            closeForgotPanel();
        } else {
            const message = data.message || data.error || 'Reset failed.';
            if (status) { status.className = 'forgot-status error'; status.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${escapeHtml(message)}`; }
        }
    } catch (err) {
        console.error('[RESET]', err);
        if (status) { status.className = 'forgot-status error'; status.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Cannot reach the server.'; }
    }
}

// ==========================================================================
//   MISC
// ==========================================================================

function escapeHtml(str) {
    return String(str == null ? '' : str)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ?reason=expired etc. from the app's session guard
function handleRedirectReason() {
    const reason = new URLSearchParams(window.location.search).get('reason');
    if (reason === 'expired') showToast('Your session expired. Please sign in again.', 'info');
    else if (reason === 'logout') showToast('You have been signed out.', 'info');
}

// Show / hide the optional "Link to your child" section with the role picker
document.getElementById('signupRole')?.addEventListener('change', (e) => {
    const box = document.getElementById('signupLinkBox');
    if (box) {
        box.style.display = e.target.value === 'parent' ? '' : 'none';
        const cb = document.getElementById('signupLinkNow');
        if (cb) cb.checked = false;
        toggleSignupLink();
    }
});

// Reveal the linking fields only when the parent opts in
function toggleSignupLink() {
    const cb = document.getElementById('signupLinkNow');
    const fields = document.getElementById('signupLinkFields');
    if (cb && fields) fields.style.display = cb.checked ? '' : 'none';
    clearFormErrors('signupForm');
}
window.toggleSignupLink = toggleSignupLink;

// Wire the forms (guarded so auth.js works even if an element is missing)
document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
document.getElementById('signupForm')?.addEventListener('submit', handleSignup);
document.getElementById('forgotLink')?.addEventListener('click', (e) => { e.preventDefault(); showForgotPanel(); });
document.getElementById('forgotBack')?.addEventListener('click', (e) => { e.preventDefault(); closeForgotPanel(); });
document.getElementById('forgotRequestBtn')?.addEventListener('click', requestResetLink);
document.getElementById('forgotResetBtn')?.addEventListener('click', submitPasswordReset);
initStrengthMeter();
