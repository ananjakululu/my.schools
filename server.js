require('dotenv').config({ override: true });
// Add this constant at the top of server.js
const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'%3E%3Crect fill='%23e2e8f0' width='150' height='150'/%3E%3Ctext fill='%2394a3b8' font-family='sans-serif' font-size='14' x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle'%3ENo Photo%3C/text%3E%3C/svg%3E";
const express = require('express');

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
//const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_change_this';
const JWT_SECRET = process.env.JWT_SECRET;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// ==========================================================================
//   POSTGRESQL CONNECTION (TUNED FOR SLOW/REMOTE DATABASES)
// ==========================================================================
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 30000,   // 30s to establish connection
    idleTimeoutMillis: 30000,         // Keep idle connections longer
    statement_timeout: 15000,         // 15s max per query
    max: 5,                           // Small pool - don't overwhelm free tier DBs
    allowExitOnIdle: true
});

// ==========================================================================
//   HELPER: Run queries in small batches (prevents pool exhaustion)
// ==========================================================================
const runInBatches = async (items, batchSize, executor) => {
    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        await Promise.all(batch.map(executor));
    }
};

const runMigration = async (sql, msg) => {
    try {
        await pool.query(sql);
        console.log(`  ✓ ${msg}`);
    } catch (e) { /* Column already exists, ignore */ }
};

// ==========================================================================
//   DATABASE INITIALIZATION (BATCHED FOR SLOW CONNECTIONS)
// ==========================================================================
const initDatabase = async () => {
    console.log('[DB] Connecting to PostgreSQL...');
    const startTime = Date.now();

    // Test connection
    try {
        await pool.query('SELECT 1');
        console.log(`[DB] ✓ Connected (${Date.now() - startTime}ms)`);
    } catch (err) {
        console.error(`[DB] ❌ Connection failed after ${Date.now() - startTime}ms`);
        console.error('  Check your DATABASE_URL in .env file');
        console.error('  Error:', err.message);
        process.exit(1);
    }

    // ── MIGRATIONS (batches of 4 to avoid overwhelming the DB) ──
    const migrations = [
        [`ALTER TABLE users ADD COLUMN "department" TEXT DEFAULT 'General';`, 'users.department'],
        [`ALTER TABLE users ADD COLUMN "isActive" INTEGER DEFAULT 1;`, 'users.isActive'],
        [`ALTER TABLE users ADD COLUMN "failedLoginAttempts" INTEGER DEFAULT 0;`, 'users.failedLoginAttempts'],
        [`ALTER TABLE users ADD COLUMN "lockedUntil" TEXT;`, 'users.lockedUntil'],
        [`ALTER TABLE exams ADD COLUMN "grade" TEXT;`, 'exams.grade'],
        [`ALTER TABLE exams ADD COLUMN "type" TEXT;`, 'exams.type'],
        [`ALTER TABLE "examSchedules" ADD COLUMN "type" TEXT;`, 'examSchedules.type'],
        [`ALTER TABLE "examSchedules" ADD COLUMN "grade" TEXT;`, 'examSchedules.grade'],
        [`ALTER TABLE "examSchedules" ADD COLUMN "status" TEXT DEFAULT 'open';`, 'examSchedules.status'],
        [`ALTER TABLE "examSchedules" ADD COLUMN "notes" TEXT;`, 'examSchedules.notes'],
        [`ALTER TABLE "examSchedules" ADD COLUMN "createdAt" TEXT;`, 'examSchedules.createdAt'],
        [`ALTER TABLE exams ADD COLUMN "name" TEXT;`, 'exams.name'],
        [`ALTER TABLE exams ADD COLUMN "subjects" TEXT;`, 'exams.subjects'],
        [`ALTER TABLE exams ADD COLUMN "scores" TEXT;`, 'exams.scores'],
        [`ALTER TABLE exams ADD COLUMN "assessType" TEXT;`, 'exams.assessType'],
        [`ALTER TABLE exams ADD COLUMN "status" TEXT DEFAULT 'draft';`, 'exams.status'],
        [`ALTER TABLE exams ADD COLUMN "virtualId" TEXT;`, 'exams.virtualId'],
        [`ALTER TABLE exams ADD COLUMN "startDate" TEXT;`, 'exams.startDate'],
        [`ALTER TABLE exams ADD COLUMN "endDate" TEXT;`, 'exams.endDate'],
        [`ALTER TABLE exams ADD COLUMN "notes" TEXT;`, 'exams.notes'],
        [`ALTER TABLE exams ADD COLUMN "createdAt" TEXT;`, 'exams.createdAt'],
    ];

    console.log('[DB] Running migrations...');
    const migStart = Date.now();
    await runInBatches(migrations, 4, ([sql, msg]) => runMigration(sql, msg));
    console.log(`[DB] ✓ Migrations done (${Date.now() - migStart}ms)`);

    // ── TABLE CREATION (sequential - safer, and overhead is network latency) ──
    const tables = [
        [`users`, `CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, name TEXT NOT NULL, role TEXT NOT NULL,
            "passwordHash" TEXT NOT NULL, "department" TEXT DEFAULT 'General',
            "isActive" INTEGER DEFAULT 1, "failedLoginAttempts" INTEGER DEFAULT 0, "lockedUntil" TEXT
        )`],
        [`passwordResetTokens`, `CREATE TABLE IF NOT EXISTS "passwordResetTokens" (
            id TEXT PRIMARY KEY, "userId" TEXT NOT NULL, "tokenHash" TEXT NOT NULL,
            "expiresAt" TEXT NOT NULL, used INTEGER DEFAULT 0, "createdAt" TEXT DEFAULT NOW()::TEXT
        )`],
        [`students`, `CREATE TABLE IF NOT EXISTS students (
            id TEXT PRIMARY KEY, name TEXT NOT NULL, gender TEXT, dob TEXT, "idNumber" TEXT,
            phone TEXT, grade TEXT, stream TEXT, reg TEXT, photo TEXT, "guardianName" TEXT,
            "guardianPhone" TEXT, "guardianRel" TEXT, "upiNumber" TEXT, "prevSchool" TEXT,
            "entryLevel" TEXT, "yearCompleted" TEXT, "nemisNumber" TEXT, disability TEXT
        )`],
        [`staff`, `CREATE TABLE IF NOT EXISTS staff (
            id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT, role TEXT, "department" TEXT,
            phone TEXT, "tscNumber" TEXT, photo TEXT, subjects TEXT
        )`],
        [`exams`, `CREATE TABLE IF NOT EXISTS exams (
            id TEXT PRIMARY KEY, "studentId" TEXT, "subjectId" TEXT, score INTEGER,
            term TEXT, year TEXT, comments TEXT, "grade" TEXT, "type" TEXT,
            name TEXT, subjects TEXT, scores TEXT, "assessType" TEXT, status TEXT DEFAULT 'draft',
            "virtualId" TEXT, "startDate" TEXT, "endDate" TEXT, notes TEXT, "createdAt" TEXT
        )`],
        [`settings`, `CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY CHECK (id = 1), "schoolName" TEXT, motto TEXT, email TEXT,
            phone TEXT, "schoolCode" TEXT, "academicYear" TEXT, "currentTerm" TEXT, level TEXT,
            category TEXT, address TEXT, "hoiName" TEXT, "hoiTitle" TEXT, "hoiTsc" TEXT,
            "hoiPhone" TEXT, "hoiEmail" TEXT, logo TEXT, stamp TEXT, "hoiSignature" TEXT, "ctSignature" TEXT
        )`],
        [`learningAreas`, `CREATE TABLE IF NOT EXISTS "learningAreas" (
            id TEXT PRIMARY KEY, name TEXT, code TEXT, "applicableLevels" TEXT
        )`],
        [`notes`, `CREATE TABLE IF NOT EXISTS notes (
            id TEXT PRIMARY KEY, title TEXT, content TEXT, "createdAt" TEXT, "createdBy" TEXT
        )`],
        [`timetable`, `CREATE TABLE IF NOT EXISTS timetable (
            id TEXT PRIMARY KEY, day TEXT, time TEXT, subject TEXT, grade TEXT, teacher TEXT
        )`],
        [`examSchedules`, `CREATE TABLE IF NOT EXISTS "examSchedules" (
            id TEXT PRIMARY KEY, name TEXT, "type" TEXT, grade TEXT, term TEXT, year TEXT,
            "startDate" TEXT, "endDate" TEXT, subjects TEXT, status TEXT DEFAULT 'open',
            notes TEXT, "createdAt" TEXT
        )`],
        [`auditLogs`, `CREATE TABLE IF NOT EXISTS "auditLogs" (
            id SERIAL PRIMARY KEY, "timestamp" TEXT NOT NULL DEFAULT NOW()::TEXT,
            "userId" TEXT, "userName" TEXT, action TEXT NOT NULL, details TEXT
        )`]
    ];

    console.log('[DB] Verifying tables...');
    const tblStart = Date.now();
    for (const [name, sql] of tables) {
        try {
            await pool.query(sql);
            console.log(`  ✓ ${name}`);
        } catch (err) {
            console.error(`  ✗ ${name}: ${err.message}`);
        }
    }
    console.log(`[DB] ✓ Tables done (${Date.now() - tblStart}ms)`);

    await seedDatabase();
    console.log(`[DB] ═══ Total init: ${Date.now() - startTime}ms ═══`);
};

// ==========================================================================
//   SEEDING (GENTLE ON SLOW CONNECTIONS)
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
    console.log('[DB] Checking seed data...');
    const seedStart = Date.now();

    // Single query to check all seed status at once
    const [userCheck, areaCount, settingsCheck] = await Promise.all([
        pool.query('SELECT email FROM users'),
        pool.query('SELECT COUNT(*) as c FROM "learningAreas"'),
        pool.query('SELECT id FROM settings WHERE id = 1')
    ]);

    const existingEmails = new Set(userCheck.rows.map(r => r.email));
    
    // Seed users
    const usersToSeed = [
        { id: 'u1', email: 'admin@school.com', name: 'System Admin', role: 'admin', dept: 'Administration', pass: 'admin123' },
        { id: 'u2', email: 'hoi@school.com', name: 'Head Teacher', role: 'hoi', dept: 'Administration', pass: 'hoi123' },
        { id: 'u3', email: 'exam@school.com', name: 'Exam Officer', role: 'exam_officer', dept: 'Exams', pass: 'exam123' }
    ].filter(u => !existingEmails.has(u.email));

    for (const u of usersToSeed) {
        await pool.query(
            'INSERT INTO users (id, email, name, role, "department", "passwordHash") VALUES ($1,$2,$3,$4,$5,$6)',
            [u.id, u.email, u.name, u.role, u.dept, bcrypt.hashSync(u.pass, 10)]
        );
        console.log(`  ✓ Seeded: ${u.name}`);
    }

    // Seed learning areas as a SINGLE bulk insert (1 query instead of 18)
    if (areaCount.rows[0].c === 0) {
        const placeholders = DEFAULT_LEARNING_AREAS.map((_, i) => `($${i*4+1}, $${i*4+2}, $${i*4+3}, $${i*4+4})`).join(',');
        const values = DEFAULT_LEARNING_AREAS.flatMap(a => [a.id, a.name, a.code, JSON.stringify(a.applicableLevels)]);
        await pool.query(`INSERT INTO "learningAreas" (id, name, code, "applicableLevels") VALUES ${placeholders}`, values);
        console.log('  ✓ Seeded: 18 Learning Areas');
    }

    // Seed settings
    if (settingsCheck.rows.length === 0) {
        await pool.query(
            `INSERT INTO settings (id,"schoolName",motto,email,phone,"schoolCode","academicYear","currentTerm",level,category,address) VALUES (1,$1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
            ["Tande Primary & JSS", "Excellence in Learning", "info@tande.ac.ke", "0712345678", "123456", "2024", "Term 1", "Primary & JSS", "Public", "P.O. Box 123, Nairobi"]
        );
        console.log('  ✓ Seeded: Settings');
    }

    console.log(`[DB] ✓ Seeding done (${Date.now() - seedStart}ms)`);
};

// ==========================================================================
//   SECURITY MIDDLEWARE
// ==========================================================================
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('dev'));

// ==========================================================================
//   CORS
// ==========================================================================
app.use((req, res, next) => {
    const origin = req.headers.origin || 'no-origin';
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Max-Age', '3600');

    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }
    next();
});
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public'), {
    etag: false,
    maxAge: '0s',
    lastModified: false
}));

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
    catch (e) { /* silent */ }
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
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        await logAction(user.id, user.name, 'LOGIN', `Logged in from ${req.ip}`);
        res.json({ success: true, token, user: { id: user.id, email: user.email, role: user.role, name: user.name, department: user.department } });
        
    } catch (err) { 
        console.error('[LOGIN ERROR]', err); 
        if (['ENOTFOUND', 'ECONNREFUSED', 'ETIMEDOUT', 'ECONNRESET'].includes(err.code)) {
            return res.status(503).json({ success: false, message: 'No internet connection. Cannot reach the database.' });
        }
        res.status(500).json({ error: 'Login failed.' }); 
    }
});

app.post('/api/logout', (req, res) => {
    res.json({ success: true, message: 'Logged out successfully.' });
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
//   RESOURCE ROUTES
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
    const cols = [
        'id', 'studentId', 'subjectId', 'score', 'term', 'year', 'comments', 'grade', 'type',
        'name', 'subjects', 'scores', 'assessType', 'status', 'virtualId',
        'startDate', 'endDate', 'notes', 'createdAt'
    ];
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query('DELETE FROM exams');
        for (const i of req.body) {
            const values = cols.map(c => {
                const val = i[c];
                if (val === null || val === undefined) return null;
                if (typeof val === 'object') return JSON.stringify(val);
                return val;
            });
            const placeholders = values.map((_, idx) => `$${idx + 1}`).join(',');
            await client.query(`INSERT INTO exams ("${cols.join('","')}") VALUES (${placeholders})`, values);
        }
        await client.query('COMMIT');
        await logAction(req.user.id, req.user.name, 'UPDATE_EXAMS', `${req.body.length} records`);
        res.json(req.body);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('[EXAMS SAVE ERROR]', err);
        res.status(500).json({ error: 'DB Error', details: err.message });
    } finally {
        client.release();
    }
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

app.post('/examSchedules', authenticateToken, requireRole('exam_officer', 'hoi', 'admin'), async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query('DELETE FROM "examSchedules"');
        const cols = ['id','name','type','grade','term','year','startDate','endDate','subjects','status','notes','createdAt'];
        for (const item of req.body) {
            const values = cols.map(c => {
                const val = item[c];
                if (val === null || val === undefined) return null;
                if (typeof val === 'object') return JSON.stringify(val);
                return val;
            });
            const placeholders = values.map((_, idx) => `$${idx + 1}`).join(', ');
            await client.query(`INSERT INTO "examSchedules" ("${cols.join('","')}") VALUES (${placeholders})`, values);
        }
        await client.query('COMMIT');
        await logAction(req.user.id, req.user.name, 'UPDATE_EXAM_SCHEDULES', `${req.body.length} schedules`);
        res.json(req.body);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('[EXAM SCHEDULES SAVE ERROR]', err);
        res.status(500).json({ error: 'Failed to save exam schedules', details: err.message });
    } finally {
        client.release();
    }
});

// ==========================================================================
//   INDIVIDUAL CRUD & SYNC
// ==========================================================================
app.post('/api/student', authenticateToken, requireRole('hoi', 'admin'), async (req, res) => {
    const s = req.body;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        if (!s.reg || s.reg.trim() === '') {
            const year = new Date().getFullYear().toString().slice(-2);
            const grade = s.grade || 'UNKNOWN';
            const gCode = grade.replace(/\s/g, '');
            const countRes = await client.query('SELECT COUNT(*) as c FROM students WHERE grade = $1', [grade]);
            const seq = String((countRes.rows[0].c || 0) + 1).padStart(3, '0');
            s.reg = `${gCode}/${year}/${seq}`;
        }
        if (!s.id) s.id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
        const cols = ['id','name','gender','dob','idNumber','phone','grade','stream','reg','photo','guardianName','guardianPhone','guardianRel','upiNumber','prevSchool','entryLevel','yearCompleted','nemisNumber','disability'];
        const values = cols.map(c => { const val = s[c]; if (val === undefined || val === null) return null; if (typeof val === 'object') return JSON.stringify(val); return val; });
        const placeholders = values.map((_, idx) => `$${idx + 1}`).join(', ');
        const updateSet = cols.slice(1).map((c) => `"${c}" = EXCLUDED."${c}"`).join(', ');
        await client.query(`INSERT INTO students ("${cols.join('","')}") VALUES (${placeholders}) ON CONFLICT (id) DO UPDATE SET ${updateSet}`, values);
        await client.query('COMMIT');
        res.json(s);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('[STUDENT SAVE ERROR]', err);
        res.status(500).json({ error: 'Failed to save student', details: err.message });
    } finally { client.release(); }
});

app.post('/api/students/sync', authenticateToken, requireRole('hoi', 'admin'), async (req, res) => {
    const students = req.body;
    if (!Array.isArray(students)) return res.status(400).json({ error: 'Expected array' });
    const client = await pool.connect();
    let saved = 0;
    try {
        await client.query('BEGIN');
        const cols = ['id','name','gender','dob','idNumber','phone','grade','stream','reg','photo','guardianName','guardianPhone','guardianRel','upiNumber','prevSchool','entryLevel','yearCompleted','nemisNumber','disability'];
        for (const s of students) {
            if (!s.id || !s.name) continue;
            if (!s.reg || s.reg.trim() === '') {
                const year = new Date().getFullYear().toString().slice(-2);
                const grade = s.grade || 'UNKNOWN';
                const gCode = grade.replace(/\s/g, '');
                const countRes = await client.query('SELECT COUNT(*) as c FROM students WHERE grade = $1', [grade]);
                const seq = String((countRes.rows[0].c || 0) + 1).padStart(3, '0');
                s.reg = `${gCode}/${year}/${seq}`;
            }
            const values = cols.map(c => { const val = s[c]; if (val === undefined || val === '') return null; if (val === null) return null; if (typeof val === 'object') return JSON.stringify(val); return val; });
            const placeholders = values.map((_, idx) => `$${idx + 1}`).join(', ');
            const updateSet = cols.slice(1).map((c) => `"${c}" = EXCLUDED."${c}"`).join(', ');
            const result = await client.query(`INSERT INTO students ("${cols.join('","')}") VALUES (${placeholders}) ON CONFLICT (id) DO UPDATE SET ${updateSet}`, values);
            if (result.rowCount > 0) saved++;
        }
        await client.query('COMMIT');
        await logAction(req.user.id, req.user.name, 'SYNC_STUDENTS', `${saved} synced`);
        res.json({ success: true, saved, total: students.length });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('[SYNC ERROR]', err);
        res.status(500).json({ error: 'Sync failed', details: err.message });
    } finally { client.release(); }
});

app.post('/api/exam', authenticateToken, requireRole('exam_officer', 'hoi', 'admin', 'teacher'), async (req, res) => {
    const exam = req.body;
    if (!exam.id) exam.id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    try {
        await pool.query(`
            INSERT INTO exams (id, "studentId", "subjectId", score, term, year, comments, grade, type, name, subjects, scores, "assessType", status, "virtualId", "startDate", "endDate", notes, "createdAt")
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
            ON CONFLICT (id) DO UPDATE SET "studentId"=EXCLUDED."studentId", "subjectId"=EXCLUDED."subjectId", score=EXCLUDED.score, term=EXCLUDED.term, year=EXCLUDED.year, comments=EXCLUDED.comments, grade=EXCLUDED.grade, type=EXCLUDED.type, name=EXCLUDED.name, subjects=EXCLUDED.subjects, scores=EXCLUDED.scores, "assessType"=EXCLUDED."assessType", status=EXCLUDED.status, "virtualId"=EXCLUDED."virtualId", "startDate"=EXCLUDED."startDate", "endDate"=EXCLUDED."endDate", notes=EXCLUDED.notes, "createdAt"=EXCLUDED."createdAt"
        `, [exam.id, exam.studentId, exam.subjectId, exam.score, exam.term, exam.year, exam.comments, exam.grade||null, exam.type||null, exam.name||null, exam.subjects?JSON.stringify(exam.subjects):null, exam.scores?JSON.stringify(exam.scores):null, exam.assessType||null, exam.status||'draft', exam.virtualId||null, exam.startDate||null, exam.endDate||null, exam.notes||null, exam.createdAt||null]);
        res.json(exam);
    } catch (err) { console.error('[EXAM SAVE ERROR]', err); res.status(500).json({ error: 'Failed to save exam' }); }
});

app.post('/api/exams/sync', authenticateToken, requireRole('exam_officer', 'hoi', 'admin', 'teacher'), async (req, res) => {
    const exams = req.body;
    if (!Array.isArray(exams)) return res.status(400).json({ error: 'Expected array' });
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        for (const exam of exams) {
            if (!exam.id) exam.id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
            if (!exam.studentId || !exam.subjectId) continue;
            await client.query(`INSERT INTO exams (id, "studentId", "subjectId", score, term, year, comments, grade, type) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT (id) DO UPDATE SET score=EXCLUDED.score, term=EXCLUDED.term, comments=EXCLUDED.comments, grade=EXCLUDED.grade, type=EXCLUDED.type`, [exam.id, exam.studentId, exam.subjectId, exam.score, exam.term, exam.year, exam.comments||null, exam.grade||null, exam.type||null]);
        }
        await client.query('COMMIT');
        res.json({ success: true, total: exams.length });
    } catch (err) { await client.query('ROLLBACK'); res.status(500).json({ error: 'Exam sync failed' }); }
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
        const parsedExams = exams.rows.map(e => { try { e.subjects = e.subjects ? JSON.parse(e.subjects) : []; } catch (_) { e.subjects = []; } try { e.scores = e.scores ? JSON.parse(e.scores) : {}; } catch (_) { e.scores = {}; } return e; });
        res.json({ students: students.rows, staff: staff.rows, exams: parsedExams, settings: settings.rows[0] || {}, learningAreas: learningAreas.rows.map(a => ({ ...a, applicableLevels: JSON.parse(a.applicableLevels) })), notes: notes.rows, timetable: timetable.rows, examSchedules: examSchedules.rows });
        await logAction(req.user.id, req.user.name, 'BACKUP_DB', 'Full backup downloaded');
    } catch (err) { console.error('[BACKUP ERROR]', err); res.status(500).json({ error: 'Backup failed' }); }
});

app.post('/api/restore', authenticateToken, requireRole('admin', 'hoi', 'exam_officer', 'teacher'), async (req, res) => {
    
    // HELPER: Remove duplicate IDs from the backup file
    const dedupe = (arr) => {
        if (!Array.isArray(arr)) return arr;
        const seen = new Set();
        return arr.filter(item => {
            if (!item.id) return false; 
            if (seen.has(item.id)) return false; 
            seen.add(item.id);
            return true;
        });
    };

    // CHUNKED BULK INSERT (Prevents 48,000 parameter crash)
    const safeReplace = async (client, table, data, columns) => {
        if (!data || !Array.isArray(data) || data.length === 0) return;
        await client.query(`DELETE FROM "${table}"`);
        
        const CHUNK_SIZE = 500; // Send 500 rows at a time
        
        for (let i = 0; i < data.length; i += CHUNK_SIZE) {
            const chunk = data.slice(i, i + CHUNK_SIZE);
            const allPlaceholders = [];
            const allValues = [];
            let paramIndex = 1;
            
            for (const r of chunk) {
                const rowPlaceholders = [];
                for (const c of columns) {
                    let val = r[c];
                    if (val === null || val === undefined) val = null;
                    else if (typeof val === 'object') val = JSON.stringify(val);
                    
                    allValues.push(val);
                    rowPlaceholders.push(`$${paramIndex++}`);
                }
                allPlaceholders.push(`(${rowPlaceholders.join(',')})`);
            }
            
            const updateSet = columns.slice(1).map((c) => `"${c}" = EXCLUDED."${c}"`).join(', ');
            const sql = `INSERT INTO "${table}" ("${columns.join('","')}") VALUES ${allPlaceholders.join(',')} ON CONFLICT (id) DO UPDATE SET ${updateSet}`;
            
            await client.query(sql, allValues);
        }
    };

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        let { students, staff, exams, settings, learningAreas, notes, timetable, examSchedules } = req.body;
        
        // CLEAN THE DATA (Remove duplicates)
        students = dedupe(students);
        staff = dedupe(staff);
        exams = dedupe(exams);
        learningAreas = dedupe(learningAreas);
        notes = dedupe(notes);
        timetable = dedupe(timetable);
        examSchedules = dedupe(examSchedules);
        
        // BULK INSERT LEARNING AREAS
        if (learningAreas && learningAreas.length > 0) {
            await client.query('DELETE FROM "learningAreas"');
            const laPlaceholders = [];
            const laValues = [];
            let laIdx = 1;
            for (const i of learningAreas) {
                laValues.push(i.id, i.name, i.code, JSON.stringify(i.applicableLevels));
                laPlaceholders.push(`($${laIdx++}, $${laIdx++}, $${laIdx++}, $${laIdx++})`);
            }
            await client.query(
                `INSERT INTO "learningAreas" (id, name, code, "applicableLevels") VALUES ${laPlaceholders.join(',')} ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, code=EXCLUDED.code, "applicableLevels"=EXCLUDED."applicableLevels"`, 
                laValues
            ); 
        }

        if (settings) {
            const s = { ...settings, id: 1 };
            const c = ['id','schoolName','motto','email','phone','schoolCode','academicYear','currentTerm','level','category','address','hoiName','hoiTitle','hoiTsc','hoiPhone','hoiEmail','logo','stamp','hoiSignature','ctSignature'];
            const colsQuoted = c.map(x => `"${x}"`);
            const placeholders = c.map((_, i) => `$${i + 1}`).join(', ');
            const updateSet = c.slice(1).map(x => `"${x}" = EXCLUDED."${x}"`).join(', ');
            await pool.query(`INSERT INTO settings (${colsQuoted.join(', ')}) VALUES (${placeholders}) ON CONFLICT (id) DO UPDATE SET ${updateSet}`, c.map(x => s[x] ?? ''));
        }
        
        await safeReplace(client, 'students', students, ['id','name','gender','dob','idNumber','phone','grade','stream','reg','photo','guardianName','guardianPhone','guardianRel','upiNumber','prevSchool','entryLevel','yearCompleted','nemisNumber','disability']);
        await safeReplace(client, 'staff', staff, ['id','name','email','role','department','phone','tscNumber','photo','subjects']);
        await safeReplace(client, 'exams', exams, ['id','studentId','subjectId','score','term','year','comments','grade','type','name','subjects','scores','assessType','status','virtualId','startDate','endDate','notes','createdAt']);
        await safeReplace(client, 'notes', notes, ['id','title','content','createdAt','createdBy']);
        await safeReplace(client, 'timetable', timetable, ['id','day','time','subject','grade','teacher']);
        await safeReplace(client, 'examSchedules', examSchedules, ['id','name','type','grade','term','year','startDate','endDate','subjects','status','notes','createdAt']);
        
        await client.query('COMMIT');
        await logAction(req.user.id, req.user.name, 'RESTORE_DB', 'Database restored from backup');
        res.json({ success: true, message: 'Database restored successfully!' });
    } catch (err) { 
        await client.query('ROLLBACK'); 
        console.error('[RESTORE ERROR]', err); 
        res.status(500).json({ error: 'Restore failed.', details: err.message }); 
    }
    finally { client.release(); }
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

// ==========================================================================
//   DATA REPAIR ENDPOINT
// ==========================================================================
app.post('/api/repair-data', authenticateToken, requireRole('admin'), async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query(`UPDATE students SET grade=NULLIF(grade,''), stream=NULLIF(stream,''), gender=NULLIF(gender,''), "idNumber"=NULLIF("idNumber",''), phone=NULLIF(phone,''), reg=NULLIF(reg,''), "guardianName"=NULLIF("guardianName",''), "guardianPhone"=NULLIF("guardianPhone",''), "nemisNumber"=NULLIF("nemisNumber",''), "upiNumber"=NULLIF("upiNumber",'')`);
        const missingReg = await client.query(`SELECT id, grade FROM students WHERE (reg IS NULL OR reg = '') AND grade IS NOT NULL AND grade != ''`);
        const year = new Date().getFullYear().toString().slice(-2);
        for (const row of missingReg.rows) {
            const gCode = row.grade.replace(/\s/g, '');
            const countRes = await client.query('SELECT COUNT(*) as c FROM students WHERE grade = $1 AND id <= $2', [row.grade, row.id]);
            const seq = String(countRes.rows[0].c).padStart(3, '0');
            await client.query('UPDATE students SET reg = $1 WHERE id = $2', [`${gCode}/${year}/${seq}`, row.id]);
        }
        await client.query('COMMIT');
        await logAction(req.user.id, req.user.name, 'REPAIR_DATA', `Fixed ${missingReg.rowCount} records`);
        res.json({ success: true, fixed: missingReg.rowCount });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('[REPAIR ERROR]', err);
        res.status(500).json({ error: 'Repair failed', details: err.message });
    } finally { client.release(); }
});

// ==========================================================================
//   START SERVER (WITH REAL QR CODE)
// ==========================================================================
const os = require('os');
const qrcode = require('qrcode-terminal'); // Added for QR generation

const getNetworkIPs = () => {
    const interfaces = os.networkInterfaces();
    const ips = [];
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                ips.push({ name, ip: iface.address });
            }
        }
    }
    return ips;
};

initDatabase().then(() => {
    const server = app.listen(PORT, '0.0.0.0', () => {
        const networkIPs = getNetworkIPs();
        
        console.log('\n✅ Local:   http://localhost:' + PORT);

        if (networkIPs.length > 0) {
            const url = 'http://' + networkIPs[0].ip + ':' + PORT;
            console.log('✅ Network: ' + url);
            
            console.log('\n📱 Point your phone camera at this QR code:\n');
            
            // This draws the actual scannable QR code in your terminal
            qrcode.generate(url, { small: true }, function(qr) {
                console.log(qr);
                console.log('   ➡️  ' + url + '\n');
            });
        }
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`\n❌ Port ${PORT} is already in use.`);
        } else {
            console.error('\n❌ Server error:', err.message);
        }
        process.exit(1);
    });
}).catch(err => {
    console.error('\n[FATAL] Database initialization failed:');
    console.error('  Message:', err.message);
    process.exit(1);
});
