const sqlite3 = require('sqlite3').verbose();

async function rescueExams() {
    console.log('[RESCUE] Connecting to local school.db...');
    const db = new sqlite3.Database('./school.db');

    db.all('SELECT * FROM exams', async (err, rows) => {
        if (err) {
            console.error('[ERROR] Could not read exams.', err.message);
            return;
        }

        if (rows.length === 0) {
            console.log('[INFO] No exams found in school.db.');
            return;
        }

        console.log(`[RESCUE] Found ${rows.length} exams!`);
        console.log('[RESCUE] Saving to exams-backup.json...');

        fs.writeFileSync('./exams-backup.json', JSON.stringify(rows, null, 2));
        console.log('[SUCCESS] File saved! Now go to your app Settings -> Import Backup, and select exams-backup.json');

        db.close();
    });
}

const fs = require('fs');
rescueExams();