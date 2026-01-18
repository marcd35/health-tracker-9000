import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'data', 'health.db');
const SCHEMA_PATH = path.join(process.cwd(), 'src', 'lib', 'database', 'schema.sql');

let db: Database.Database | null = null;

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

  return db;
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}
