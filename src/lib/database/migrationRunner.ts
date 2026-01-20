import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

export interface Migration {
  name: string;
  up: (db: Database.Database) => void;
}

/**
 * Migration runner that tracks applied migrations and runs new ones
 */
export class MigrationRunner {
  private db: Database.Database;
  private migrationsPath: string;

  constructor(db: Database.Database, migrationsPath?: string) {
    this.db = db;
    this.migrationsPath =
      migrationsPath || path.join(process.cwd(), 'src', 'lib', 'database', 'migrations');
  }

  /**
   * Initialize migrations table if it doesn't exist
   */
  private initMigrationsTable(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        executed_at TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `);
  }

  /**
   * Get list of migration files in order
   */
  private getMigrationFiles(): string[] {
    if (!fs.existsSync(this.migrationsPath)) {
      return [];
    }

    const files = fs.readdirSync(this.migrationsPath);
    return files
      .filter((f) => f.endsWith('.sql'))
      .sort()
      .map((f) => path.join(this.migrationsPath, f));
  }

  /**
   * Get list of already-executed migrations
   */
  private getExecutedMigrations(): Set<string> {
    const stmt = this.db.prepare('SELECT name FROM _migrations');
    const rows = stmt.all() as { name: string }[];
    return new Set(rows.map((r) => r.name));
  }

  /**
   * Run all pending migrations
   */
  run(): void {
    // Initialize migrations table
    this.initMigrationsTable();

    // Get list of migration files
    const migrationFiles = this.getMigrationFiles();
    if (migrationFiles.length === 0) {
      return;
    }

    // Get already-executed migrations
    const executed = this.getExecutedMigrations();

    // Run pending migrations
    migrationFiles.forEach((filePath) => {
      const fileName = path.basename(filePath);

      if (executed.has(fileName)) {
        return; // Already executed
      }

      try {
        // Read SQL file
        const sql = fs.readFileSync(filePath, 'utf-8');

        // Execute migration in a transaction
        const transaction = this.db.transaction(() => {
          // Run the SQL migration
          try {
            this.db.exec(sql);
          } catch (error: any) {
            // Check for duplicate column error (common when switching from manual migrations)
            if (error.message && error.message.includes('duplicate column name')) {
              console.warn(`⚠ Migration ${fileName} flagged duplicate column. Assuming applied.`);
            } else {
              throw error;
            }
          }

          // Record migration as executed
          const now = new Date().toISOString();
          const stmt = this.db.prepare(`
            INSERT INTO _migrations (id, name, executed_at, created_at)
            VALUES (?, ?, ?, ?)
          `);
          stmt.run(`${Date.now()}-${Math.random()}`, fileName, now, now);
        });

        transaction();
        console.log(`✓ Executed migration: ${fileName}`);
      } catch (error) {
        console.error(`✗ Failed to execute migration: ${fileName}`);
        throw error;
      }
    });
  }
}
