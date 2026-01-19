
import { getDatabase } from '../src/lib/database/connection';

const MIGRATION_SQL = `
-- User Conditions
CREATE TABLE IF NOT EXISTS user_conditions (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (profile_id) REFERENCES profile(id)
);

-- User Allergies
CREATE TABLE IF NOT EXISTS user_allergies (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (profile_id) REFERENCES profile(id)
);
`;

function main() {
    console.log('Applying migration...');
    const db = getDatabase();

    try {
        db.exec(MIGRATION_SQL);
        console.log('Migration SQL executed successfully.');

        // Verify tables exist
        const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('user_conditions', 'user_allergies')").all();
        console.log('Verified tables:', tables);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

main();
