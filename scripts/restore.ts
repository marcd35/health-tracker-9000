import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'health.db');
const BACKUPS_DIR = path.join(process.cwd(), 'backups');

async function restore() {
  try {
    const backupFile = process.argv[2];

    if (!backupFile) {
      console.log('Available backups:');
      const files = fs
        .readdirSync(BACKUPS_DIR)
        .filter((f) => f.startsWith('health-') && f.endsWith('.db'))
        .sort()
        .reverse();

      files.forEach((f) => console.log(` - ${f}`));
      console.log('\nUsage: npm run restore <backup-filename>');
      process.exit(0);
    }

    const sourcePath = path.join(BACKUPS_DIR, backupFile);

    if (!fs.existsSync(sourcePath)) {
      console.error('Backup file not found:', sourcePath);
      process.exit(1);
    }

    // Create a safety backup of current state before restoring
    if (fs.existsSync(DB_PATH)) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const safetyPath = path.join(BACKUPS_DIR, `pre-restore-${timestamp}.db`);
      fs.copyFileSync(DB_PATH, safetyPath);
      console.log(`Created safety backup at: ${safetyPath}`);
    }

    fs.copyFileSync(sourcePath, DB_PATH);
    console.log(`✅ Database successfully restored from: ${backupFile}`);
  } catch (error) {
    console.error('Restore failed:', error);
    process.exit(1);
  }
}

restore();
