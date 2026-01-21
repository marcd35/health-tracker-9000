import { getDatabase } from '../connection';
import type { WeightLog, WeightLogRow } from '@/lib/types/weight';
import { v4 as uuidv4 } from 'uuid';

export class WeightLogRepository {
  private db = getDatabase();

  /**
   * Log a weight entry for a specific date
   * @param profileId - The profile ID
   * @param weight - Weight in lbs
   * @param date - ISO date string (YYYY-MM-DD), defaults to today
   * @param notes - Optional notes
   * @returns The created WeightLog
   */
  logWeight(profileId: string, weight: number, date?: string, notes?: string): WeightLog {
    const id = uuidv4();
    const createdAt = new Date().toISOString();
    const logDate = date || new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const stmt = this.db.prepare(`
      INSERT INTO weight_logs (id, profile_id, weight, date, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(profile_id, date) DO UPDATE SET
        weight = excluded.weight,
        notes = excluded.notes
      RETURNING *
    `);

    const row = stmt.get(id, profileId, weight, logDate, notes || null, createdAt) as WeightLogRow;
    return this.mapRowToWeightLog(row);
  }

  /**
   * Get weight history for a profile within a date range
   * @param profileId - The profile ID
   * @param startDate - Start date (ISO string), defaults to 30 days ago
   * @param endDate - End date (ISO string), defaults to today
   * @returns Array of WeightLog entries
   */
  getWeightHistory(profileId: string, startDate?: string, endDate?: string): WeightLog[] {
    const end = endDate || new Date().toISOString().split('T')[0];
    const start =
      startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 30 days ago

    const stmt = this.db.prepare(`
      SELECT * FROM weight_logs
      WHERE profile_id = ? AND date >= ? AND date <= ?
      ORDER BY date DESC
    `);

    const rows = stmt.all(profileId, start, end) as WeightLogRow[];
    return rows.map(this.mapRowToWeightLog);
  }

  /**
   * Get the latest weight log for a profile
   * @param profileId - The profile ID
   * @returns The most recent WeightLog or null
   */
  getLatestWeight(profileId: string): WeightLog | null {
    const stmt = this.db.prepare(`
      SELECT * FROM weight_logs
      WHERE profile_id = ?
      ORDER BY date DESC
      LIMIT 1
    `);

    const row = stmt.get(profileId) as WeightLogRow | undefined;
    return row ? this.mapRowToWeightLog(row) : null;
  }

  /**
   * Get weight log for a specific date
   * @param profileId - The profile ID
   * @param date - ISO date string (YYYY-MM-DD)
   * @returns WeightLog for that date or null
   */
  getWeightForDate(profileId: string, date: string): WeightLog | null {
    const stmt = this.db.prepare(`
      SELECT * FROM weight_logs
      WHERE profile_id = ? AND date = ?
    `);

    const row = stmt.get(profileId, date) as WeightLogRow | undefined;
    return row ? this.mapRowToWeightLog(row) : null;
  }

  /**
   * Delete a weight log entry
   * @param id - The weight log ID
   */
  deleteWeightLog(id: string): void {
    this.db.prepare('DELETE FROM weight_logs WHERE id = ?').run(id);
  }

  /**
   * Get all weight logs for a profile (no date filter)
   * @param profileId - The profile ID
   * @returns All WeightLog entries for the profile
   */
  getAllWeightLogs(profileId: string): WeightLog[] {
    const stmt = this.db.prepare(`
      SELECT * FROM weight_logs
      WHERE profile_id = ?
      ORDER BY date DESC
    `);

    const rows = stmt.all(profileId) as WeightLogRow[];
    return rows.map(this.mapRowToWeightLog);
  }

  /**
   * Map database row to WeightLog type
   */
  private mapRowToWeightLog(row: WeightLogRow): WeightLog {
    return {
      id: row.id,
      profileId: row.profile_id,
      weight: row.weight,
      date: row.date,
      notes: row.notes || undefined,
      createdAt: row.created_at,
    };
  }
}
