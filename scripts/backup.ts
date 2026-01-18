import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'health.db');
const BACKUPS_DIR = path.join(process.cwd(), 'backups');

async function backup() {
  try {
    // Ensure backups directory exists
    if (!fs.existsSync(BACKUPS_DIR)) {
      fs.mkdirSync(BACKUPS_DIR, { recursive: true });
    }

    // Check if database exists
    if (!fs.existsSync(DB_PATH)) {
      console.error('Database file not found at:', DB_PATH);
      process.exit(1);
    }

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(BACKUPS_DIR, `health-${timestamp}.db`);

    // Copy file
    fs.copyFileSync(DB_PATH, backupPath);

    console.log(`✅ Database backed up manually to: ${backupPath}`);

    // Cleanup old backups (keep last 5)
    const files = fs
      .readdirSync(BACKUPS_DIR)
      .filter((f) => f.startsWith('health-') && f.endsWith('.db'))
      .map((f) => ({
        name: f,
        time: fs.statSync(path.join(BACKUPS_DIR, f)).mtime.getTime(),
      }))
      .sort((a, b) => b.time - a.time); // Newest first

    if (files.length > 5) {
      console.log('Cleaning up old backups...');
      for (let i = 5; i < files.length; i++) {
        const fileToDelete = path.join(BACKUPS_DIR, files[i].name);
        fs.unlinkSync(fileToDelete);
        console.log(`Deleted old backup: ${files[i].name}`);
      }
    }
  } catch (error) {
    console.error('Backup failed:', error);
    process.exit(1);
  }
}

backup();
