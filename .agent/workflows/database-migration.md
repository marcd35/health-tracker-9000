---
description: How to make database schema changes using migrations
---

## Database Migration Policy

To maintain database integrity and ensure smooth updates across all environments, follow these rules for any schema changes:

### Rules
1. **NEVER** modify `src/lib/database/schema.sql` directly for existing tables.
2. **ALWAYS** create a new `.sql` file in `src/lib/database/migrations/`.
3. Use the naming convention `00X_description.sql` (e.g., `008_new_feature_table.sql`).
4. All migrations are automatically executed by the `MigrationRunner` on application startup.

### Steps to migrate
1. Identify the next migration number by checking the `src/lib/database/migrations/` directory.
2. Create the new migration file with the required `ALTER TABLE` or `CREATE TABLE` statements.
3. Verify the SQL syntax for SQLite compatibility.
4. Restart the application to apply the migration.
