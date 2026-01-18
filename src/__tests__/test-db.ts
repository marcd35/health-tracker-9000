import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

export function setupTestDb() {
  const db = new Database(':memory:');
  const schemaPath = path.join(process.cwd(), 'src', 'lib', 'database', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  db.exec(schema);
  return db;
}

export function seedTestProfile(db: Database.Database) {
  const stmt = db.prepare(`
    INSERT INTO profile 
    (id, age, weight, height, gender, activity_level, health_conditions, allergies, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    'test-id',
    30,
    80,
    180,
    'male',
    'moderate',
    JSON.stringify([]),
    JSON.stringify([]),
    new Date().toISOString(),
    new Date().toISOString()
  );
}
