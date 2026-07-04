require('dotenv').config({ override: true });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 8000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_change_this';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// ==========================================================================
//   POSTGRESQL CONNECTION
// ==========================================================================
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Required for most cloud Postgres providers
});

// Helper to execute multiple statements
const execMulti = async (sql) => {
    const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);
    for (const stmt of statements) {
        await pool.query(stmt);
    }
};

// ==========================================================================
//   DATABASE INITIALIZATION & MIGRATIONS
// ==========================================================================
const runMigration = async (sql, msg) => {
    try { 
        await pool.query(sql); 
        console.log(`[DB] Migration: ${msg}`); 
    } catch (e) { /* Column already exists, ignore */ }
};

const initDatabase = async () => {
    console.log('[DB] Connecting to PostgreSQL...');

    await runMigration(`ALTER TABLE users ADD COLUMN "department" TEXT DEFAULT 'General';`, 'Added department');
    await runMigration(`ALTER TABLE users ADD COLUMN "isActive" INTEGER DEFAULT 1;`, 'Added isActive');
    await runMigration(`ALTER TABLE users ADD COLUMN "failedLoginAttempts" INTEGER DEFAULT 0;`, 'Added failedLoginAttempts');
    await runMigration(`ALTER TABLE users ADD COLUMN "lockedUntil" TEXT;`, 'Added lockedUntil');

    await execMulti(`
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, name TEXT NOT NULL,
            role TEXT NOT NULL, "passwordHash" TEXT NOT NULL, "department" TEXT DEFAULT 'General',
            "isActive" INTEGER DEFAULT 1, "failedLoginAttempts" INTEGER DEFAULT 0, "lockedUntil" TEXT
        );
        CREATE TABLE IF NOT EXISTS "passwordResetTokens" (
            id TEXT PRIMARY KEY, "userId" TEXT NOT NULL, "tokenHash" TEXT NOT NULL,
            "expiresAt" TEXT NOT NULL, used INTEGER DEFAULT 0, "createdAt" TEXT DEFAULT NOW()::TEXT
        );
        CREATE TABLE IF NOT EXISTS students (
            id TEXT PRIMARY KEY, name TEXT NOT NULL, gender TEXT, dob TEXT, "idNumber" TEXT, phone TEXT,
            grade TEXT, stream TEXT, reg TEXT, photo TEXT, "guardianName" TEXT, "guardianPhone" TEXT,
            "guardianRel" TEXT, "upiNumber" TEXT, "prevSchool" TEXT, "entryLevel" TEXT, "yearCompleted" TEXT,
            "nemisNumber" TEXT, disability TEXT
        );
        CREATE TABLE IF NOT EXISTS staff (
            id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT, role TEXT, "department" TEXT,
            phone TEXT, "tscNumber" TEXT, photo TEXT, subjects TEXT
        );
        CREATE TABLE IF NOT EXISTS exams (
            id TEXT PRIMARY KEY, "studentId" TEXT, "subjectId" TEXT,
            score INTEGER, term TEXT, year INTEGER, comments TEXT
        );
        CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY CHECK (id = 1), "schoolName" TEXT, motto TEXT, email TEXT, phone TEXT,
            "schoolCode" TEXT, "academicYear" TEXT, "currentTerm" TEXT, level TEXT, category TEXT, address TEXT,
            "hoiName" TEXT, "hoiTitle" TEXT, "hoiTsc" TEXT, "hoiPhone" TEXT, "hoiEmail" TEXT,
            logo TEXT, stamp TEXT, "hoiSignature" TEXT, "ctSignature" TEXT
        );
        CREATE TABLE IF NOT EXISTS "learningAreas" (id TEXT PRIMARY KEY, name TEXT, code TEXT, "applicableLevels" TEXT);
        CREATE TABLE IF NOT EXISTS notes (id TEXT PRIMARY KEY, title TEXT, content TEXT, "createdAt" TEXT, "createdBy" TEXT);
        CREATE TABLE IF NOT EXISTS timetable (id TEXT PRIMARY KEY, day TEXT, time TEXT, subject TEXT, grade TEXT, teacher TEXT);
        CREATE TABLE IF NOT EXISTS "examSchedules" (id TEXT PRIMARY KEY, name TEXT, term TEXT, year TEXT, "startDate" TEXT, "endDate" TEXT, grades TEXT, subjects TEXT);
        CREATE TABLE IF NOT EXISTS "auditLogs" (
            id SERIAL PRIMARY KEY, "timestamp" TEXT NOT NULL DEFAULT NOW()::TEXT,
            "userId" TEXT, "userName" TEXT, action TEXT NOT NULL, details TEXT
        );
    `);
    console.log('[DB] Tables verified.');
    
    await seedDatabase();
};

// ==========================================================================
//   SEEDING
// ==========================================================================
const DEFAULT_LEARNING_AREAS = [
    { id: 'pp_lang', name: 'Language Activities', code: 'PP-LA', applicableLevels: ['PP1', 'PP2'] },
    { id: 'pp_math', name: 'Mathematics Activities', code: 'PP-MA', applicableLevels: ['PP1', 'PP2'] },
    { id: 'pp_creative', name: 'Creative Activities', code: 'PP-CA', applicableLevels: ['PP1', 'PP2'] },
    { id: 'pp_env', name: 'Environmental Activities', code: 'PP-EA', applicableLevels: ['PP1', 'PP2'] },
    { id: 'lp_lit', name: 'Literacy Activities', code: 'LP-LIT', applicableLevels: ['Grade 1', 'Grade 2', 'Grade 3'] },
    { id: 'lp_math', name: 'Mathematics', code: 'LP-MATH', applicableLevels: ['Grade 1', 'Grade 2', 'Grade 3'] },
    { id: 'lp_env', name: 'Environmental Activities', code: 'LP-EA', applicableLevels: ['Grade 1', 'Grade 2', 'Grade 3'] },
    { id: 'ms_eng', name: 'English', code: 'MS-ENG', applicableLevels: ['Grade 4', 'Grade 5', 'Grade 6'] },
    { id: 'ms_kis', name: 'Kiswahili', code: 'MS-KIS', applicableLevels: ['Grade 4', 'Grade 5', 'Grade 6'] },
    { id: 'ms_math', name: 'Mathematics', code: 'MS-MATH', applicableLevels: ['Grade 4', 'Grade 5', 'Grade 6'] },
    { id: 'ms_sci', name: 'Science & Technology', code: 'MS-SCI', applicableLevels: ['Grade 4', 'Grade 5', 'Grade 6'] },
    { id: 'ms_ss', name: 'Social Studies', code: 'MS-SS', applicableLevels: ['Grade 4', 'Grade 5', 'Grade 6'] },
    { id: 'js_eng', name: 'English', code: 'JS-ENG', applicableLevels: ['Grade 7', 'Grade 8', 'Grade 9'] },
    { id: 'js_kis', name: 'Kiswahili', code: 'JS-KIS', applicableLevels: ['Grade 7', 'Grade 8', 'Grade 9'] },
    { id: 'js_math', name: 'Mathematics', code: 'JS-MATH', applicableLevels: ['Grade 7', 'Grade 8', 'Grade 9'] },
    { id: 'js_sci', name: 'Integrated Science', code: 'JS-SCI', applicableLevels: ['Grade 7', 'Grade 8', 'Grade 9'] },
    { id: 'js_ss', name: 'Social Studies', code: 'JS-SS', applicableLevels: ['Grade 7', 'Grade 8', 'Grade 9'] },
    { id: 'js_pretech', name: 'Pre-Technical Studies', code: 'JS-PT', applicableLevels: ['Grade 7', 'Grade 8', 'Grade 9'] }
];

const seedDatabase = async () => {
    const seedUser = async (id, email, name, role, dept, pass) => {
        const res = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (res.rows.length === 0) {
            await pool.query('INSERT INTO users (id, email, name, role, "department", "passwordHash") VALUES ($1,$2,$3,$4,$5,$6)', [id, email, name, role, dept, bcrypt.hashSync(pass, 10)]);
            console.log(`[DB] Seeded: ${name}`);
        }
    };
    await seedUser('u1', 'admin@school.com', 'System Admin', 'admin', 'Administration', 'admin123');
    await seedUser('u2', 'hoi@school.com', 'Head Teacher', 'hoi', 'Administration', 'hoi123');
    await seedUser('u3', 'exam@school.com', 'Exam Officer', 'exam_officer', 'Exams', 'exam123');

    const areaCount = await pool.query('SELECT COUNT(*) as c FROM "learningAreas"');
    if (areaCount.rows[0].c === 0) {
        for (const i of DEFAULT_LEARNING_AREAS) {
            await pool.query('INSERT INTO "learningAreas" (id, name, code, "applicableLevels") VALUES ($1,$2,$3,$4)', [i.id, i.name, i.code, JSON.stringify(i.applicableLevels)]);
        }
        console.log('[DB] Seeded: Learning Areas');
    }
    
    const settingsExists = await pool.query('SELECT id FROM settings WHERE id = 1');
    if (settingsExists.rows.length === 0) {
        await pool.query(`INSERT INTO settings (id,"schoolName",motto,email,phone,"schoolCode","academicYear","currentTerm",level,category,address) VALUES (1,$1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`, 
            ["Tande Primary & JSS", "Excellence in Learning", "info@tande.ac.ke", "0712345678", "123456", "2024", "Term 1", "Primary & JSS", "Public", "P.O. Box 123, Nairobi"]);
        console.log('[DB] Seeded: Settings');
    }
};

// ==========================================================================
//   SECURITY MIDDLEWARE
// ==========================================================================
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('dev'));
app.use(cors({
    origin: function(origin, callback) {
        if (!origin) return callback(null, true);
        const allowedOrigins = ['http://localhost:8000','http://localhost:3000','http://localhost:5000','http://127.0.0.1:5500','http://127.0.0.1:8000', process.env.ALLOWED_ORIGIN].filter(Boolean);
        if (allowedOrigins.includes(origin)) { callback(null, true); } 
        else { console.warn('[CORS] Unknown origin:', origin); callback(null, true); }
    },
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================================================
//   SECURITY HELPERS
// ==========================================================================
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
const generateResetToken = () => crypto.randomBytes(32).toString('hex');
const validatePasswordStrength = (password) => {
    const errors = [];
    if (password.length < 8) errors.push('at least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('one uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('one lowercase letter');
    if (!/[0-9]/.test(password)) errors.push('one number');
    return errors;
};

const logAction = async (userId, userName, action, details) => {
    try { await pool.query('INSERT INTO "auditLogs" ("userId", "userName", action, details) VALUES ($1,$2,$3,$4)', [userId, userName, action, details]); }
    catch (e) { console.error("Log fail:", e); }
};

const authenticateToken = (req, res, next) => {
    const token = (req.headers['authorization'] || '').split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access denied.' });
    jwt.verify(token, JWT_SECRET, async (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token.' });
        const dbUserRes = await pool.query('SELECT * FROM users WHERE id = $1', [user.id]);
        const dbUser = dbUserRes.rows[0];
        if (!dbUser) return res.status(403).json({ error: 'User not found.' });
        if (dbUser.isActive !== 1) return res.status(403).json({ error: 'Account suspended. Contact Admin.' });
        req.user = dbUser;
        next();
    });
};

const requireRole = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden.' });
    next();
};
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

// ==========================================================================
//   AUTH ROUTES
// ==========================================================================
app.post('/api/login', rateLimit({ windowMs: 60 * 60 * 1000, max: 15 }), async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password are required.' });
        const userRes = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = userRes.rows[0];
        if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        
        if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
            const mins = Math.ceil((new Date(user.lockedUntil) - new Date()) / 60000);
            return res.status(423).json({ success: false, message: `Account locked. Try again in ${mins} minute${mins !== 1 ? 's' : ''}.` });
        }
        if (!bcrypt.compareSync(password, user.passwordHash)) {
            const attempts = (user.failedLoginAttempts || 0) + 1;
            if (attempts >= MAX_FAILED_ATTEMPTS) {
                const lockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000).toISOString();
                await pool.query('UPDATE users SET "failedLoginAttempts" = $1, "lockedUntil" = $2 WHERE id = $3', [attempts, lockedUntil, user.id]);
                return res.status(423).json({ success: false, message: `Too many failed attempts. Account locked for ${LOCKOUT_MINUTES} minutes.` });
            }
            await pool.query('UPDATE users SET "failedLoginAttempts" = $1 WHERE id = $2', [attempts, user.id]);
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }
        if (user.isActive !== 1) return res.status(403).json({ success: false, message: 'Account suspended. Contact Admin.' });
        
        await pool.query('UPDATE users SET "failedLoginAttempts" = 0, "lockedUntil" = NULL WHERE id = $1', [user.id]);
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
        await logAction(user.id, user.name, 'LOGIN', `Logged in from ${req.ip}`);
        res.json({ success: true, token, user: { id: user.id, email: user.email, role: user.role, name: user.name, department: user.department } });
    } catch (err) { console.error('[LOGIN ERROR]', err); res.status(500).json({ error: 'Login failed.' }); }
});

app.post('/api/signup', rateLimit({ windowMs: 60 * 60 * 1000, max: 5 }), async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password) return res.status(400).json({ success: false, message: 'All fields are required.' });
        const strengthErrors = validatePasswordStrength(password);
        if (strengthErrors.length > 0) return res.status(400).json({ success: false, message: `Password requires: ${strengthErrors.join(', ')}.` });
        const assignedRole = ['teacher', 'parent'].includes(role) ? role : 'teacher';
        if ((await pool.query('SELECT id FROM users WHERE email = $1', [email])).rows.length > 0) return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
        await pool.query('INSERT INTO users (id, email, name, role, "department", "passwordHash") VALUES ($1,$2,$3,$4,$5,$6)', [Date.now().toString(), email, name, assignedRole, 'General', bcrypt.hashSync(password, 10)]);
        await logAction('system', 'System', 'SIGNUP_REQUEST', `${name} (${email}) requested ${assignedRole} access`);
        res.status(201).json({ success: true, message: 'Account request submitted!' });
    } catch (err) { console.error('[SIGNUP ERROR]', err); res.status(500).json({ error: 'Signup failed.' }); }
});

app.post('/api/forgot-password', rateLimit({ windowMs: 15 * 60 * 1000, max: 3 }), async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });
        const userRes = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (userRes.rows.length === 0) return res.json({ success: true, message: 'If an account with that email exists, a reset link has been generated.', token: null });
        const user = userRes.rows[0];
        await pool.query('UPDATE "passwordResetTokens" SET used = 1 WHERE "userId" = $1', [user.id]);
        const token = generateResetToken();
        const tokenHash = hashToken(token);
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
        const tokenId = crypto.randomBytes(16).toString('hex');
        await pool.query('INSERT INTO "passwordResetTokens" (id, "userId", "tokenHash", "expiresAt") VALUES ($1,$2,$3,$4)', [tokenId, user.id, tokenHash, expiresAt]);
        res.json({ success: true, message: 'Reset link generated.', token });
    } catch (err) { console.error('[FORGOT ERROR]', err); res.status(500).json({ error: 'Request failed.' }); }
});

app.post('/api/reset-password', rateLimit({ windowMs: 15 * 60 * 1000, max: 5 }), async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) return res.status(400).json({ success: false, message: 'Token and new password are required.' });
        const recordRes = await pool.query('SELECT * FROM "passwordResetTokens" WHERE "tokenHash" = $1 AND used = 0', [hashToken(token)]);
        const record = recordRes.rows[0];
        if (!record) return res.status(400).json({ success: false, message: 'Invalid or already-used reset link.' });
        if (new Date(record.expiresAt) < new Date()) {
            await pool.query('UPDATE "passwordResetTokens" SET used = 1 WHERE id = $1', [record.id]);
            return res.status(400).json({ success: false, message: 'This reset link has expired.' });
        }
        const strengthErrors = validatePasswordStrength(newPassword);
        if (strengthErrors.length > 0) return res.status(400).json({ success: false, message: `Password requires: ${strengthErrors.join(', ')}.` });
        await pool.query('UPDATE users SET "passwordHash" = $1, "failedLoginAttempts" = 0, "lockedUntil" = NULL WHERE id = $2', [bcrypt.hashSync(newPassword, 10), record.userId]);
        await pool.query('UPDATE "passwordResetTokens" SET used = 1 WHERE id = $1', [record.id]);
        res.json({ success: true, message: 'Password has been reset successfully.' });
    } catch (err) { console.error('[RESET ERROR]', err); res.status(500).json({ error: 'Reset failed.' }); }
});

app.post('/api/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) return res.status(400).json({ success: false, message: 'Both passwords are required.' });
        if (!bcrypt.compareSync(currentPassword, req.user.passwordHash)) return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
        const strengthErrors = validatePasswordStrength(newPassword);
        if (strengthErrors.length > 0) return res.status(400).json({ success: false, message: `Password requires: ${strengthErrors.join(', ')}.` });
        await pool.query('UPDATE users SET "passwordHash" = $1 WHERE id = $2', [bcrypt.hashSync(newPassword, 10), req.user.id]);
        await logAction(req.user.id, req.user.name, 'PASSWORD_CHANGED', 'Changed own password');
        res.json({ success: true, message: 'Password changed successfully.' });
    } catch (err) { console.error('[CHANGE PASS ERROR]', err); res.status(500).json({ error: 'Failed to change password.' }); }
});

// ==========================================================================
//   ROLE SPECIFIC ROUTES
// ==========================================================================
app.get('/api/teacher/assignments', authenticateToken, requireRole('teacher'), async (req, res) => {
    try {
        const staffRes = await pool.query('SELECT subjects FROM staff WHERE email = $1', [req.user.email]);
        const staffRecord = staffRes.rows[0];
        if (!staffRecord || !staffRecord.subjects) return res.json([]);
        let assignments = [];
        try { assignments = JSON.parse(staffRecord.subjects); } catch (e) { return res.json([]); }
        res.json(assignments);
    } catch (err) { console.error('[ASSIGNMENTS ERROR]', err); res.status(500).json({ error: 'Failed to fetch assignments.' }); }
});

// ==========================================================================
//   RESOURCE ROUTES (Using Postgres Transactions)
// ==========================================================================
app.get('/students', authenticateToken, async (req, res) => {
    const res2 = await pool.query('SELECT * FROM students');
    res.json(res2.rows);
});

app.post('/students', authenticateToken, requireRole('hoi', 'admin'), async (req, res) => {
    const cols = ['id','name','gender','dob','idNumber','phone','grade','stream','reg','photo','guardianName','guardianPhone','guardianRel','upiNumber','prevSchool','entryLevel','yearCompleted','nemisNumber','disability'];
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query('DELETE FROM students');
        for (const i of req.body) {
            const values = cols.map(c => { const val = i[c]; return (val === null || val === undefined) ? '' : (typeof val === 'object' ? JSON.stringify(val) : val); });
            const placeholders = values.map((_, idx) => `$${idx + 1}`).join(',');
            await client.query(`INSERT INTO students ("${cols.join('","')}") VALUES (${placeholders})`, values);
        }
        await client.query('COMMIT');
        await logAction(req.user.id, req.user.name, 'UPDATE_STUDENTS', `${req.body.length} records`);
        res.json(req.body);
    } catch (err) { await client.query('ROLLBACK'); res.status(500).json({ error: 'DB Error', details: err.message }); }
    finally { client.release(); }
});

app.get('/staff', authenticateToken, async (req, res) => {
    res.json((await pool.query('SELECT * FROM staff')).rows);
});

app.post('/staff', authenticateToken, requireRole('hoi', 'admin'), async (req, res) => {
    const cols = ['id','name','email','role','department','phone','tscNumber','photo','subjects'];
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query('DELETE FROM staff');
        for (const i of req.body) {
            const values = cols.map(c => { const val = i[c]; return (val === null || val === undefined) ? '' : (typeof val === 'object' ? JSON.stringify(val) : val); });
            const placeholders = values.map((_, idx) => `$${idx + 1}`).join(',');
            await client.query(`INSERT INTO staff ("${cols.join('","')}") VALUES (${placeholders})`, values);
        }
        await client.query('COMMIT');
        await logAction(req.user.id, req.user.name, 'UPDATE_STAFF', `${req.body.length} records`);
        res.json(req.body);
    } catch (err) { await client.query('ROLLBACK'); res.status(500).json({ error: 'DB Error', details: err.message }); }
    finally { client.release(); }
});

app.get('/exams', authenticateToken, async (req, res) => {
    res.json((await pool.query('SELECT * FROM exams')).rows);
});

app.post('/exams', authenticateToken, requireRole('exam_officer', 'hoi', 'admin', 'teacher'), async (req, res) => {
    const cols = ['id','studentId','subjectId','score','term','year','comments'];
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query('DELETE FROM exams');
        for (const i of req.body) {
            const values = cols.map(c => { const val = i[c]; return (val === null || val === undefined) ? '' : (typeof val === 'object' ? JSON.stringify(val) : val); });
            const placeholders = values.map((_, idx) => `$${idx + 1}`).join(',');
            await client.query(`INSERT INTO exams ("${cols.join('","')}") VALUES (${placeholders})`, values);
        }
        await client.query('COMMIT');
        await logAction(req.user.id, req.user.name, 'UPDATE_EXAMS', `${req.body.length} records`);
        res.json(req.body);
    } catch (err) { await client.query('ROLLBACK'); res.status(500).json({ error: 'DB Error', details: err.message }); }
    finally { client.release(); }
});

app.get('/settings', authenticateToken, async (req, res) => {
    const res2 = await pool.query('SELECT * FROM settings WHERE id = 1');
    res.json(res2.rows[0] || { id: 1 });
});

app.post('/settings', authenticateToken, requireRole('admin', 'hoi'), async (req, res) => {
    const d = req.body; d.id = 1;
    const cols = ['id','schoolName','motto','email','phone','schoolCode','academicYear','currentTerm','level','category','address','hoiName','hoiTitle','hoiTsc','hoiPhone','hoiEmail','logo','stamp','hoiSignature','ctSignature'];
    try {
        const colsQuoted = cols.map(c => `"${c}"`);
        const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
        const updateSet = cols.slice(1).map(c => `"${c}" = EXCLUDED."${c}"`).join(', ');
        await pool.query(`INSERT INTO settings (${colsQuoted.join(', ')}) VALUES (${placeholders}) ON CONFLICT (id) DO UPDATE SET ${updateSet}`, cols.map(c => d[c]));
        await logAction(req.user.id, req.user.name, 'UPDATE_SETTINGS', 'School settings updated');
        res.json(d);
    } catch (err) { res.status(500).json({ error: 'Settings failed' }); }
});

app.get('/learningAreas', authenticateToken, async (req, res) => {
    const areas = (await pool.query('SELECT * FROM "learningAreas"')).rows;
    res.json(areas.map(a => ({ ...a, applicableLevels: JSON.parse(a.applicableLevels) })));
});

app.post('/learningAreas', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query('DELETE FROM "learningAreas"');
        for (const i of req.body) {
            await client.query('INSERT INTO "learningAreas" (id, name, code, "applicableLevels") VALUES ($1,$2,$3,$4)', [i.id, i.name, i.code, JSON.stringify(i.applicableLevels)]);
        }
        await client.query('COMMIT');
        await logAction(req.user.id, req.user.name, 'UPDATE_LEARNING_AREAS', 'Curriculum updated');
        res.json(req.body);
    } catch (err) { await client.query('ROLLBACK'); res.status(500).json({ error: 'DB Error', details: err.message }); }
    finally { client.release(); }
});

// ==========================================================================
//   BACKUP / RESTORE
// ==========================================================================
app.get('/api/db', authenticateToken, requireRole('admin', 'hoi', 'teacher', 'exam_officer'), async (req, res) => {
    try {
        const [students, staff, exams, settings, learningAreas, notes, timetable, examSchedules] = await Promise.all([
            pool.query('SELECT * FROM students'), pool.query('SELECT * FROM staff'), pool.query('SELECT * FROM exams'),
            pool.query('SELECT * FROM settings WHERE id=1'), pool.query('SELECT * FROM "learningAreas"'),
            pool.query('SELECT * FROM notes'), pool.query('SELECT * FROM timetable'), pool.query('SELECT * FROM "examSchedules"')
        ]);
        res.json({
            students: students.rows, staff: staff.rows, exams: exams.rows, settings: settings.rows[0] || {},
            learningAreas: learningAreas.rows.map(a => ({ ...a, applicableLevels: JSON.parse(a.applicableLevels) })),
            notes: notes.rows, timetable: timetable.rows, examSchedules: examSchedules.rows
        });
        await logAction(req.user.id, req.user.name, 'BACKUP_DB', 'Full backup downloaded');
    } catch (err) { res.status(500).json({ error: 'Backup failed' }); }
});

app.post('/api/restore', authenticateToken, requireRole('admin', 'hoi', 'exam_officer', 'teacher'), async (req, res) => {
    const safeReplace = async (client, table, data, columns) => {
        if (!data || !Array.isArray(data)) return;
        await client.query(`DELETE FROM "${table}"`);
        for (const r of data) {
            const values = columns.map(c => { const val = r[c]; if (val === null || val === undefined) return ''; if (typeof val === 'object') return JSON.stringify(val); return val; });
            const placeholders = values.map((_, idx) => `$${idx + 1}`).join(',');
            await client.query(`INSERT INTO "${table}" ("${columns.join('","')}") VALUES (${placeholders})`, values);
        }
    };

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { students, staff, exams, settings, learningAreas, notes, timetable, examSchedules } = req.body;
        
        if (learningAreas && Array.isArray(learningAreas)) {
            await client.query('DELETE FROM "learningAreas"');
            for (const i of learningAreas) {
                await client.query('INSERT INTO "learningAreas" (id, name, code, "applicableLevels") VALUES ($1,$2,$3,$4)', [i.id, i.name, i.code, JSON.stringify(i.applicableLevels)]);
            }
        }
        if (settings) {
            const s = { ...settings, id: 1 };
            const c = ['id','schoolName','motto','email','phone','schoolCode','academicYear','currentTerm','level','category','address','hoiName','hoiTitle','hoiTsc','hoiPhone','hoiEmail','logo','stamp','hoiSignature','ctSignature'];
            const colsQuoted = c.map(x => `"${x}"`);
            const placeholders = c.map((_, i) => `$${i + 1}`).join(', ');
            const updateSet = c.slice(1).map(x => `"${x}" = EXCLUDED."${x}"`).join(', ');
            await client.query(`INSERT INTO settings (${colsQuoted.join(', ')}) VALUES (${placeholders}) ON CONFLICT (id) DO UPDATE SET ${updateSet}`, c.map(x => s[x] ?? ''));
        }
        
        await safeReplace(client, 'students', students, ['id','name','gender','dob','idNumber','phone','grade','stream','reg','photo','guardianName','guardianPhone','guardianRel','upiNumber','prevSchool','entryLevel','yearCompleted','nemisNumber','disability']);
        await safeReplace(client, 'staff', staff, ['id','name','email','role','department','phone','tscNumber','photo','subjects']);
        await safeReplace(client, 'exams', exams, ['id','studentId','subjectId','score','term','year','comments']);
        await safeReplace(client, 'notes', notes, ['id','title','content','createdAt','createdBy']);
        await safeReplace(client, 'timetable', timetable, ['id','day','time','subject','grade','teacher']);
        await safeReplace(client, 'examSchedules', examSchedules, ['id','name','term','year','startDate','endDate','grades','subjects']);
        
        await client.query('COMMIT');
        await logAction(req.user.id, req.user.name, 'RESTORE_DB', 'Database restored from backup');
        res.json({ success: true, message: 'Database restored successfully!' });
    } catch (err) { 
        await client.query('ROLLBACK');
        console.error('[RESTORE ERROR]', err);
        res.status(500).json({ error: 'Restore failed.', details: err.message }); 
    } finally { client.release(); }
});

// ==========================================================================
//   USER MANAGEMENT
// ==========================================================================
app.post('/api/users/:id/deactivate', authenticateToken, requireRole('admin'), async (req, res) => {
    const r = await pool.query('UPDATE users SET "isActive" = 0 WHERE id = $1', [req.params.id]);
    r.rowCount > 0 ? (await logAction(req.user.id, req.user.name, 'DEACTIVATE_USER', req.params.id), res.json({ success: true })) : res.status(404).json({ success: false });
});

app.post('/api/users/:id/activate', authenticateToken, requireRole('admin'), async (req, res) => {
    const r = await pool.query('UPDATE users SET "isActive" = 1, "failedLoginAttempts" = 0, "lockedUntil" = NULL WHERE id = $1', [req.params.id]);
    r.rowCount > 0 ? (await logAction(req.user.id, req.user.name, 'ACTIVATE_USER', req.params.id), res.json({ success: true })) : res.status(404).json({ success: false });
});

app.get('/api/logs', authenticateToken, requireRole('admin'), async (req, res) => {
    res.json((await pool.query('SELECT * FROM "auditLogs" ORDER BY "timestamp" DESC LIMIT 100')).rows);
});

// ==========================================================================
//   AI CHAT
// ==========================================================================
app.post('/api/ai/chat', authenticateToken, async (req, res) => {
    if (!OPENAI_API_KEY) return res.status(500).json({ error: 'AI Service Unconfigured' });
    try {
        const r = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
            body: JSON.stringify({ model: 'gpt-3.5-turbo', messages: [{ role: 'system', content: `Assistant for ${req.body.context?.schoolName || 'the school'}.` }, { role: 'user', content: req.body.query }] })
        });
        if (!r.ok) throw new Error('AI API Error');
        res.json({ reply: (await r.json()).choices[0].message.content });
    } catch (err) { res.status(500).json({ error: 'AI request failed' }); }
});

// ==========================================================================
//   EMERGENCY RESET
// ==========================================================================
app.get('/api/reset-admin', async (req, res) => {
    try {
        const exists = (await pool.query('SELECT id FROM users WHERE id = $1', ['u1'])).rows[0];
        if (exists) {
            await pool.query('UPDATE users SET "passwordHash" = $1, "failedLoginAttempts" = 0, "lockedUntil" = NULL WHERE id = $2', [bcrypt.hashSync('admin123', 10), 'u1']);
        } else {
            await pool.query('INSERT INTO users (id, email, name, role, "department", "passwordHash") VALUES ($1,$2,$3,$4,$5,$6)', ['u1', 'admin@school.com', 'System Admin', 'admin', 'Administration', bcrypt.hashSync('admin123', 10)]);
        }
        res.json({ success: true, message: 'Admin reset.', note: 'admin@school.com / admin123' });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// ==========================================================================
//   START SERVER
// ==========================================================================
initDatabase().then(() => {
    app.listen(PORT, () => console.log(`[OK] Server running at http://localhost:${PORT}`));
}).catch(err => {
    console.error('[FATAL] Database connection failed:', err);
    process.exit(1);
});