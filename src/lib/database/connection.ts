import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'data', 'health.db');
const SCHEMA_PATH = path.join(process.cwd(), 'src', 'lib', 'database', 'schema.sql');

let db: Database.Database | null = null;

function runMigrations(database: Database.Database): void {
  // Migration: Add new columns to supplements table
  const supplementsCols = database
    .prepare("PRAGMA table_info(supplements)")
    .all() as { name: string }[];
  const supplementsColNames = supplementsCols.map((c) => c.name);

  if (!supplementsColNames.includes('color')) {
    database.exec("ALTER TABLE supplements ADD COLUMN color TEXT DEFAULT '#6366f1'");
  }
  if (!supplementsColNames.includes('dosage_frequency')) {
    database.exec("ALTER TABLE supplements ADD COLUMN dosage_frequency TEXT DEFAULT 'daily'");
  }
  if (!supplementsColNames.includes('dosage_quantity')) {
    database.exec('ALTER TABLE supplements ADD COLUMN dosage_quantity INTEGER DEFAULT 1');
  }
  if (!supplementsColNames.includes('dosage_notes')) {
    database.exec('ALTER TABLE supplements ADD COLUMN dosage_notes TEXT');
  }

  // Migration: Add taken_at column to supplement_logs table
  const logsCols = database
    .prepare("PRAGMA table_info(supplement_logs)")
    .all() as { name: string }[];
  const logsColNames = logsCols.map((c) => c.name);

  if (!logsColNames.includes('taken_at')) {
    database.exec('ALTER TABLE supplement_logs ADD COLUMN taken_at TEXT');
  }
}

export function getDatabase(): Database.Database {
  if (db) return db;

  // Ensure data directory exists
  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Create/open database
  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');

  // Initialize schema if database is new
  const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
  db.exec(schema);

  // Run migrations for existing databases
  runMigrations(db);

  return db;
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}
