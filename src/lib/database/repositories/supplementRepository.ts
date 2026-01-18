import { getDatabase } from '../connection';
import type { Supplement, SupplementLog } from '@/lib/types/health';
import { v4 as uuidv4 } from 'uuid';

export class SupplementRepository {
  private db = getDatabase();

  getAllSupplements(): Supplement[] {
    const stmt = this.db.prepare('SELECT * FROM supplements');
    const rows = stmt.all() as any[];

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      brand: row.brand,
      servingSize: row.serving_size,
      nutrients: JSON.parse(row.nutrients),
      notes: row.notes,
    }));
  }

  logSupplementTaken(log: Omit<SupplementLog, 'id' | 'createdAt'>): SupplementLog {
    const id = uuidv4();
    const createdAt = new Date().toISOString();
    const newLog = { ...log, id, createdAt };

    const stmt = this.db.prepare(`
      INSERT INTO supplement_logs (id, date, supplement_id, supplement_name, taken, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      newLog.id,
      newLog.date,
      newLog.supplementId,
      newLog.supplementName,
      newLog.taken ? 1 : 0,
      newLog.createdAt
    );

    return newLog;
  }

  getSupplementLogsByDate(date: string): SupplementLog[] {
    const stmt = this.db.prepare('SELECT * FROM supplement_logs WHERE date = ?');
    const rows = stmt.all(date) as any[];

    return rows.map((row) => ({
      id: row.id,
      date: row.date,
      supplementId: row.supplement_id,
      supplementName: row.supplement_name,
      taken: row.taken === 1,
      createdAt: row.created_at,
    }));
  }
}
