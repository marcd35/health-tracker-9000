import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { MigrationRunner } from './migrationRunner';

const DB_PATH = path.join(process.cwd(), 'data', 'health.db');
const SCHEMA_PATH = path.join(process.cwd(), 'src', 'lib', 'database', 'schema.sql');

let db: Database.Database | null = null;

function runMigrations(database: Database.Database): void {
  const migrationRunner = new MigrationRunner(database);
  migrationRunner.run();
}

export function getDatabase(): Database.Database {
  if (db) return db;

  // Check if we're in test mode with a test database
  if (process.env.TEST_DB) {
    db = process.env.TEST_DB as unknown as Database.Database;
    return db;
  }

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
    // Don't close test databases - they're managed by tests
    if (!process.env.TEST_DB) {
      db.close();
    }
    db = null;
  }
}
