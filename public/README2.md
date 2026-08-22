# ElimuTrack — School Management System

A modern, role-based **CBC school management system** for Kenyan Primary & Junior Secondary Schools (PP1 → Grade 9). Built with a Node.js/Express/PostgreSQL backend and a rich, responsive single-page frontend.

![stack](https://img.shields.io/badge/stack-Node%2018%2B%20%7C%20Express%20%7C%20PostgreSQL%20%7C%20Vanilla%20JS-green) ![license](https://img.shields.io/badge/license-MIT-blue)

---

## Features

| Module | Highlights |
|---|---|
| **Auth** | Staff logins (email) + parent logins (learner ADM / NEMIS / UPI), JWT sessions, lockout after 5 failed attempts, password strength meter, forgot/reset password |
| **Dashboard** | Live KPI cards, enrollment / gender / competency charts, performance trends, subject radar, top-performer leaderboard, activity stream, upcoming assessments & events, time-range filters (Today/Week/Term/Year) |
| **Admissions** | 4-step learner registration with live ID-card preview, photo upload, auto-generated admission numbers, Excel batch import + template |
| **Learners** | Grid/list views, search, grade & stream filters, sorting, pagination, bulk actions (print cards, export, delete), 360° profile with radar/trend charts, mastery gauges, assessment history, discipline records, parent view |
| **Staff** | Full staff register with departments, TSC numbers, class-teacher assignments, subject assignment to learning areas |
| **Curriculum** | CBC learning areas per band (Pre-Primary / Lower / Middle / JSS), per-level teacher assignment |
| **Assessment Centre** | Create exam series (Opener / Mid Term / End Term / End Year), enter scores per subject, auto CBC rating (EE/ME/AE/BE), results marksheets, subject analysis, batch Excel entry, print/PDF/Excel export |
| **Exam Timetable** ⭐ | Fully functional timetable per exam series: **subject sessions** (date, time, room, invigilator), **collision detection** (same subject same day, room double-booking, cross-series clashes), **List / Calendar / Matrix** views, grade-term-type-year filters, stats bar, **Print & PDF export**, sample-data loader |
| **Weekly Timetable** | Class timetable grid with clash detection and PDF export |
| **Reports** | Report cards, analytics, PDF export with school letterhead |
| **Notes / Discipline** | Activity log with types (Discipline, Co-curricular, Academic, Medical) and severity |
| **Inbox** | Internal messaging to guardians, folders (Inbox/Sent/Trash), unread badge |
| **Settings** | School profile, term dates, calendar events, data tools (backup/restore, push-to-cloud, force sync, repair), user management, audit logs |
| **System** | Role-based access (admin / hoi / exam_officer / teacher / parent), dark mode, offline local backup, real-time cross-tab sync |

---

## Project structure

```
elimutrack/
├── server.js                 # Express + PostgreSQL API (auth, RBAC, sync, restore)
├── package.json
├── .env.example              # copy to .env
├── public/                   # static frontend (served by Express)
│   ├── index.html            # entry → redirects to login
│   ├── login.html            # modern login / signup / forgot-password page
│   ├── auth.js               # auth client wired to /api/login · /api/signup · /api/*-password
│   ├── dashboard.html        # single-page app shell (all sections)
│   ├── script.js             # app engine: data, routing, RBAC, charts, reports
│   ├── exam-timetable.js     # ⭐ exam timetable engine (list/calendar/matrix, clashes, PDF)
│   └── style.css             # full stylesheet (light/dark, responsive)
└── tools/                    # audit + patch + unit-test scripts (dev only)
```

---

## Requirements

- **Node.js 18+** (tested on 20.x)
- **PostgreSQL 12+** (local or remote — works on free tiers; tuned for slow connections)

---

## Setup

```bash
# 1. Create the database (once)
createdb elimutrack
# or via psql:
#   CREATE DATABASE elimutrack;

# 2. Install dependencies
cd elimutrack
npm install

# 3. Configure environment
cp .env.example .env
#   edit .env → set DATABASE_URL (and a strong JWT_SECRET)

# 4. Start the server
npm start
```

The server creates all tables and runs migrations automatically on first boot.

```
✅ Local:   http://localhost:8080
✅ Network: http://<your-lan-ip>:8080
```

---

## Seed accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@school.com` | `admin123` |
| Head Teacher | `hoi@school.com` | `hoi123` |
| Exam Officer | `exam@school.com` | `exam123` |

**Parent access**: set a learner's access password via *Profile → Parent Access*, then sign in using the learner's **ADM / NEMIS / UPI** number as the username.

Sign-ups via the public form are created as **Teacher** or **Parent** requests (server-enforced).

---

## Exam Timetable — quick tour

1. Go to **Assessment → Exam Timetable** (or Dashboard → Timetable quick action).
2. Click **New Exam Series** → name, type, grade, term, year, window dates, status, venue.
3. Under *Subject Sessions*, add one row per subject: **subject, date, start–end time, room, invigilator** (invigilators suggest from the staff register).
4. Save — any **clash** (same subject twice on a day, room double-booked at overlapping times, or a clash with another series in the same grade) is blocked with a readable warning.
5. Switch views: **List** (grouped cards), **Calendar** (month grid with session chips), **Matrix** (classic subjects × dates poster — ideal for printing).
6. Filter by grade / term / type / year, or export via **Print** / **PDF** (jsPDF + autoTable).
7. No data yet? Use **Load Sample Timetable** in the empty state (or `ettSeedDemo()`).

---

## API overview (key routes)

| Route | Method | Access |
|---|---|---|
| `/api/login`, `/api/signup`, `/api/forgot-password`, `/api/reset-password`, `/api/change-password` | POST | public / authed |
| `/api/db` | GET | all roles (parent gets a single-learner scoped copy) |
| `/api/restore`, `/api/repair-data`, `/api/users*` | POST/PUT/DELETE | admin (restore: +hoi) |
| `/students`, `/staff`, `/exams`, `/settings`, `/learningAreas`, `/notes`, `/timetable`, `/messages`, `/examSchedules`, `/classAssignments` | GET/POST | authed, role-gated writes |

Bulk endpoints reject empty bodies (no accidental table wipes); restore dedupes records and chunks inserts.

---

## Permissions & data-domain rules

**Assessments — "Submit & Close" is final for teachers**
- A teacher can enter and submit scores, then click **Submit & Close** — this **locks** the assessment.
- Once `closed`, only the **Exam Officer** (and Admin/HOI) can reopen, edit, or delete it. Teachers see a red "CLOSED — scores are locked" banner and read-only score grids; closed assessments disappear from their *Enter Scores* and *Batch Entry* dropdowns (still visible in Results/Analysis).
- Status toggling (open/close/reopen) is restricted to exam-management roles everywhere.

**Timetable — teachers are view-only**
- Weekly timetable: "+ Add" cells and lesson-click editing are hidden/blocked for teachers (`timetableEdit`); the Add Slot / Check Clashes toolbar buttons are permission-gated.
- Exam timetable: New/Edit/Delete are `examsManage`-gated (Exam Officer/Admin/HOI) — teachers view List/Calendar/Matrix, print and PDF.

**Reports — teacher domain only**
- Grade filters are restricted to the teacher's assigned classes; "All Grades" is auto-scoped to their classes.
- Subject analysis (both the Exams tab and Reports Center) only lists **subjects assigned to the teacher** (subject teacher + class-teacher rule) and fetches only their own students' scores.
- Every PDF/print export **confirms the exact scope** (assessment, grade, subject) before it runs.

**Role matrix (core)**: `examsManage` → admin/hoi/exam_officer · `timetableEdit` → admin/hoi · `scoresEdit` → admin/hoi/exam_officer/teacher · `reportsExport/Print` → all.

---

## Notes & tips

- **Offline-first**: the app keeps a full backup in `localStorage` and re-syncs when the server is reachable. Data is never silently lost.
- **Dark mode** is available from the header (login page has its own toggle).
- In production set `JWT_SECRET` to a long random string — the dev fallback logs a warning.
- PDF export uses local vendor files when present, with a CDN fallback (`public/vendor/`).
- Dev tooling: `npm run check` (syntax-checks all JS), `node tools/test-ett.js` (exam-timetable unit tests), `node tools/test-rbac.js` (permission-domain unit tests), `node tools/audit.js` (wiring audit).

---

## License

MIT — free to use, modify, and deploy.
