import { getDatabase } from '../connection';
import type { UserPreferences, PreferencesUpdateInput } from '@/lib/types/preferences';

export class PreferencesRepository {
  private db = getDatabase();

  getPreferences(): UserPreferences | null {
    const stmt = this.db.prepare('SELECT * FROM user_preferences WHERE user_id = ? LIMIT 1');
    const row = stmt.get('default') as any;

    if (!row) return null;

    return {
      id: row.id,
      userId: row.user_id,
      timezone: row.timezone,
      showClock: row.show_clock === 1,
      showHealthInsights: row.show_health_insights === 1,
      hydrationEnabled: row.hydration_enabled === 1,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  updatePreferences(updates: PreferencesUpdateInput): UserPreferences {
    const current = this.getPreferences();
    if (!current) throw new Error('Preferences not found');

    const updated: UserPreferences = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.db
      .prepare(
        `
        UPDATE user_preferences SET
          timezone = ?,
          show_clock = ?,
          show_health_insights = ?,
          hydration_enabled = ?,
          updated_at = ?
        WHERE user_id = ?
      `
      )
      .run(
        updated.timezone,
        updated.showClock ? 1 : 0,
        updated.showHealthInsights ? 1 : 0,
        updated.hydrationEnabled ? 1 : 0,
        updated.updatedAt,
        'default'
      );

    return updated;
  }

  getTimezone(): string {
    const preferences = this.getPreferences();
    return preferences?.timezone || 'UTC';
  }
}
