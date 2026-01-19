import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'data', 'health.db');
const SCHEMA_PATH = path.join(process.cwd(), 'src', 'lib', 'database', 'schema.sql');

let db: Database.Database | null = null;

function runMigrations(database: Database.Database): void {
  // Migration: Add new columns to supplements table
  const supplementsCols = database.prepare('PRAGMA table_info(supplements)').all() as {
    name: string;
  }[];
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
  const logsCols = database.prepare('PRAGMA table_info(supplement_logs)').all() as {
    name: string;
  }[];
  const logsColNames = logsCols.map((c) => c.name);

  if (!logsColNames.includes('taken_at')) {
    database.exec('ALTER TABLE supplement_logs ADD COLUMN taken_at TEXT');
  }
  if (!logsColNames.includes('is_duplicate_warning')) {
    database.exec('ALTER TABLE supplement_logs ADD COLUMN is_duplicate_warning INTEGER DEFAULT 0');
  }

  // Migration: Add USDA columns to foods table
  const foodsCols = database.prepare('PRAGMA table_info(foods)').all() as { name: string }[];
  const foodsColNames = foodsCols.map((c) => c.name);

  if (!foodsColNames.includes('source')) {
    database.exec("ALTER TABLE foods ADD COLUMN source TEXT DEFAULT 'manual'");
  }
  if (!foodsColNames.includes('usda_fdc_id')) {
    database.exec('ALTER TABLE foods ADD COLUMN usda_fdc_id TEXT');
  }
  if (!foodsColNames.includes('brand_name')) {
    database.exec('ALTER TABLE foods ADD COLUMN brand_name TEXT');
  }
  if (!foodsColNames.includes('ingredients')) {
    database.exec('ALTER TABLE foods ADD COLUMN ingredients TEXT');
  }
  if (!foodsColNames.includes('sugar')) {
    database.exec('ALTER TABLE foods ADD COLUMN sugar REAL');
  }
  if (!foodsColNames.includes('calcium')) {
    database.exec('ALTER TABLE foods ADD COLUMN calcium REAL');
  }
  if (!foodsColNames.includes('iron')) {
    database.exec('ALTER TABLE foods ADD COLUMN iron REAL');
  }
  if (!foodsColNames.includes('sodium')) {
    database.exec('ALTER TABLE foods ADD COLUMN sodium REAL');
  }
  if (!foodsColNames.includes('potassium')) {
    database.exec('ALTER TABLE foods ADD COLUMN potassium REAL');
  }
  if (!foodsColNames.includes('vitamin_a')) {
    database.exec('ALTER TABLE foods ADD COLUMN vitamin_a REAL');
  }
  if (!foodsColNames.includes('vitamin_c')) {
    database.exec('ALTER TABLE foods ADD COLUMN vitamin_c REAL');
  }
  if (!foodsColNames.includes('vitamin_d')) {
    database.exec('ALTER TABLE foods ADD COLUMN vitamin_d REAL');
  }

  // Create index for USDA FDC ID lookups if it doesn't exist
  const indexes = database
    .prepare("SELECT name FROM sqlite_master WHERE type='index' AND name='idx_foods_usda_fdc_id'")
    .all();
  if (indexes.length === 0) {
    database.exec('CREATE INDEX idx_foods_usda_fdc_id ON foods(usda_fdc_id)');
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
