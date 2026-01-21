import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

/**
 * Sets up an in-memory SQLite database for testing
 * Loads the full schema and returns a ready-to-use database instance
 */
export function setupTestDb(): Database.Database {
  const db = new Database(':memory:');
  const schemaPath = path.join(process.cwd(), 'src', 'lib', 'database', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');

  // Execute base schema
  db.exec(schema);

  // Add missing columns and tables from migrations
  db.exec(`
    -- Add columns from migrations
    ALTER TABLE supplements ADD COLUMN custom_nutrients TEXT DEFAULT '{}';
    ALTER TABLE supplements ADD COLUMN supplement_type TEXT DEFAULT 'nutrient';

    -- Add custom nutrient metadata table
    CREATE TABLE IF NOT EXISTS custom_nutrient_metadata (
      id TEXT PRIMARY KEY,
      nutrient_key TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      unit TEXT NOT NULL,
      category TEXT NOT NULL,
      user_defined_target REAL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- Add supplement database table
    CREATE TABLE IF NOT EXISTS supplement_database (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      brand TEXT,
      serving_size TEXT,
      serving_count INTEGER,
      nutrients TEXT DEFAULT '{}',
      custom_nutrients TEXT DEFAULT '{}',
      notes TEXT,
      created_at TEXT NOT NULL,
      UNIQUE(name, brand, serving_size, serving_count)
    );

    -- Add is_duplicate_warning column to supplement_logs
    ALTER TABLE supplement_logs ADD COLUMN is_duplicate_warning INTEGER DEFAULT 0;

    -- Add food_allergens table for allergen tracking
    CREATE TABLE IF NOT EXISTS food_allergens (
      id TEXT PRIMARY KEY,
      food_id TEXT NOT NULL,
      allergen_type TEXT NOT NULL,
      source TEXT NOT NULL,
      confidence_level TEXT NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (food_id) REFERENCES foods(id) ON DELETE CASCADE
    );

    -- Add calorie tracking tables
    CREATE TABLE IF NOT EXISTS calorie_goals (
      id TEXT PRIMARY KEY,
      profile_id TEXT NOT NULL,
      goal_type TEXT NOT NULL,
      weekly_calorie_target INTEGER NOT NULL,
      daily_calorie_target INTEGER NOT NULL,
      activity_level TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS daily_calorie_tracking (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      profile_id TEXT NOT NULL,
      calories_consumed INTEGER NOT NULL,
      calories_target INTEGER NOT NULL,
      calories_deficit_surplus INTEGER NOT NULL,
      goal_met INTEGER NOT NULL,
      weekly_total_consumed INTEGER,
      weekly_total_target INTEGER,
      weekly_average REAL,
      on_pace_percentage INTEGER,
      trend TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(date, profile_id)
    );

    CREATE TABLE IF NOT EXISTS calorie_streaks (
      id TEXT PRIMARY KEY,
      profile_id TEXT NOT NULL,
      streak_start_date TEXT NOT NULL,
      streak_end_date TEXT,
      days_count INTEGER NOT NULL,
      goal_met_count INTEGER NOT NULL,
      best_streak INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS calorie_goal_history (
      id TEXT PRIMARY KEY,
      profile_id TEXT NOT NULL,
      calorie_goal_id TEXT NOT NULL,
      action TEXT NOT NULL,
      previous_daily_target INTEGER,
      new_daily_target INTEGER,
      change_reason TEXT,
      changed_at TEXT NOT NULL
    );
  `);

  return db;
}

/**
 * Seeds the test database with a default profile
 * Used for tests that require a user profile to exist
 */
export function seedTestProfile(db: Database.Database): void {
  const stmt = db.prepare(`
    INSERT INTO profile
    (id, age, weight, height, gender, activity_level, health_conditions, allergies, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    'test-user-id',
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

/**
 * Seeds the test database with sample foods
 * Used for tests involving food search and meal logging
 */
export function seedTestFoods(db: Database.Database): void {
  const foods = [
    {
      id: 'food-1',
      name: 'Chicken Breast',
      serving_size: 100,
      serving_unit: 'g',
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6,
      fiber: 0,
      allergens: JSON.stringify([]),
      source: 'mock',
      usda_fdc_id: null,
      created_at: new Date().toISOString(),
    },
    {
      id: 'food-2',
      name: 'Brown Rice',
      serving_size: 100,
      serving_unit: 'g',
      calories: 111,
      protein: 2.6,
      carbs: 23,
      fat: 0.9,
      fiber: 1.8,
      allergens: JSON.stringify([]),
      source: 'mock',
      usda_fdc_id: null,
      created_at: new Date().toISOString(),
    },
    {
      id: 'food-3',
      name: 'Broccoli',
      serving_size: 100,
      serving_unit: 'g',
      calories: 34,
      protein: 2.8,
      carbs: 7,
      fat: 0.4,
      fiber: 2.6,
      allergens: JSON.stringify([]),
      source: 'mock',
      usda_fdc_id: null,
      created_at: new Date().toISOString(),
    },
    {
      id: 'food-4',
      name: 'Apple',
      serving_size: 100,
      serving_unit: 'g',
      calories: 52,
      protein: 0.2,
      carbs: 14,
      fat: 0.2,
      fiber: 2.4,
      allergens: JSON.stringify([]),
      source: 'mock',
      usda_fdc_id: null,
      created_at: new Date().toISOString(),
    },
  ];

  const stmt = db.prepare(`
    INSERT INTO foods
    (id, name, serving_size, serving_unit, calories, protein, carbs, fat, fiber, allergens, source, usda_fdc_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const food of foods) {
    stmt.run(...Object.values(food));
  }
}

/**
 * Seeds the test database with sample supplements
 * Used for tests involving supplement tracking
 */
export function seedTestSupplements(db: Database.Database): void {
  const supplements = [
    {
      id: 'supp-1',
      name: 'Vitamin D3',
      brand: 'Generic',
      nutrients: JSON.stringify({ vitaminD: 25 }),
      serving_size: '1 capsule',
      created_at: new Date().toISOString(),
    },
    {
      id: 'supp-2',
      name: 'Omega-3 Fish Oil',
      brand: 'Generic',
      nutrients: JSON.stringify({ omega_3: 1000 }),
      serving_size: '2 softgels',
      created_at: new Date().toISOString(),
    },
  ];

  const stmt = db.prepare(`
    INSERT INTO supplements
    (id, name, brand, nutrients, serving_size, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const supp of supplements) {
    stmt.run(...Object.values(supp));
  }
}

/**
 * Comprehensive test database setup with all seed data
 * Use this for integration tests that need a full dataset
 */
export function setupTestDbWithData(): Database.Database {
  const db = setupTestDb();
  seedTestProfile(db);
  seedTestFoods(db);
  seedTestSupplements(db);
  return db;
}

/**
 * Cleanup helper for tests
 * Closes the database connection
 */
export function teardownTestDb(db: Database.Database): void {
  db.close();
}
