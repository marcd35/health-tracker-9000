import { getDatabase } from '../connection';
import type {
  Supplement,
  SupplementLog,
  SupplementNutrientTarget,
  CustomNutrientMetadata,
  NutrientKey,
} from '@/lib/types/supplements';
import { v4 as uuidv4 } from 'uuid';

export class SupplementRepository {
  private db = getDatabase();

  // ===== SUPPLEMENTS CRUD =====

  getAllSupplements(): Supplement[] {
    const stmt = this.db.prepare('SELECT * FROM supplements ORDER BY name');
    const rows = stmt.all() as Record<string, unknown>[];
    return rows.map(this.mapRowToSupplement);
  }

  getSupplementById(id: string): Supplement | null {
    const stmt = this.db.prepare('SELECT * FROM supplements WHERE id = ?');
    const row = stmt.get(id) as Record<string, unknown> | undefined;
    return row ? this.mapRowToSupplement(row) : null;
  }

  createSupplement(data: Omit<Supplement, 'id' | 'createdAt'>): Supplement {
    const id = uuidv4();
    const createdAt = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO supplements
      (id, name, brand, serving_size, nutrients, custom_nutrients, notes, color, dosage_frequency, dosage_quantity, dosage_notes, supplement_type, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.name,
      data.brand,
      data.servingSize,
      JSON.stringify(data.nutrients),
      JSON.stringify(data.customNutrients),
      data.notes || null,
      data.color,
      data.dosageFrequency,
      data.dosageQuantity,
      data.dosageNotes || null,
      data.supplementType,
      createdAt
    );

    return { ...data, id, createdAt };
  }

  updateSupplement(id: string, data: Partial<Omit<Supplement, 'id' | 'createdAt'>>): Supplement {
    const existing = this.getSupplementById(id);
    if (!existing) throw new Error('Supplement not found');

    const updated: Supplement = {
      ...existing,
      ...data,
      nutrients: data.nutrients ?? existing.nutrients,
      customNutrients: data.customNutrients ?? existing.customNutrients,
      supplementType: data.supplementType ?? existing.supplementType,
    };

    const stmt = this.db.prepare(`
      UPDATE supplements SET
        name = ?, brand = ?, serving_size = ?, nutrients = ?, custom_nutrients = ?, notes = ?,
        color = ?, dosage_frequency = ?, dosage_quantity = ?, dosage_notes = ?, supplement_type = ?
      WHERE id = ?
    `);

    stmt.run(
      updated.name,
      updated.brand,
      updated.servingSize,
      JSON.stringify(updated.nutrients),
      JSON.stringify(updated.customNutrients),
      updated.notes || null,
      updated.color,
      updated.dosageFrequency,
      updated.dosageQuantity,
      updated.dosageNotes || null,
      updated.supplementType,
      id
    );

    return updated;
  }

  deleteSupplement(id: string): void {
    // Delete associated logs first
    this.db.prepare('DELETE FROM supplement_logs WHERE supplement_id = ?').run(id);
    this.db.prepare('DELETE FROM supplements WHERE id = ?').run(id);
  }

  // ===== SUPPLEMENT LOGS =====

  logSupplementTaken(log: Omit<SupplementLog, 'id' | 'createdAt'>): SupplementLog {
    const id = uuidv4();
    const createdAt = new Date().toISOString();
    const takenAt = log.takenAt || createdAt;
    const isDuplicateWarning = log.isDuplicateWarning || false;

    const stmt = this.db.prepare(`
      INSERT INTO supplement_logs (id, date, supplement_id, supplement_name, taken, taken_at, is_duplicate_warning, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      log.date,
      log.supplementId,
      log.supplementName,
      log.taken ? 1 : 0,
      takenAt,
      isDuplicateWarning ? 1 : 0,
      createdAt
    );

    return { ...log, id, takenAt, isDuplicateWarning, createdAt };
  }

  getSupplementLogsByDate(date: string): SupplementLog[] {
    const stmt = this.db.prepare('SELECT * FROM supplement_logs WHERE date = ? ORDER BY taken_at');
    const rows = stmt.all(date) as Record<string, unknown>[];
    return rows.map(this.mapRowToLog);
  }

  getSupplementLogsByDateAndId(date: string, supplementId: string): SupplementLog[] {
    const stmt = this.db.prepare(
      'SELECT * FROM supplement_logs WHERE date = ? AND supplement_id = ? ORDER BY taken_at'
    );
    const rows = stmt.all(date, supplementId) as Record<string, unknown>[];
    return rows.map(this.mapRowToLog);
  }

  getAllSupplementLogs(startDate?: string, endDate?: string): SupplementLog[] {
    let query = 'SELECT * FROM supplement_logs';
    const params: any[] = [];

    if (startDate || endDate) {
      const conditions: string[] = [];
      if (startDate) {
        conditions.push('date >= ?');
        params.push(startDate);
      }
      if (endDate) {
        conditions.push('date <= ?');
        params.push(endDate);
      }
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY date DESC, taken_at DESC';

    const stmt = this.db.prepare(query);
    const rows = (params.length > 0 ? stmt.all(...params) : stmt.all()) as Record<
      string,
      unknown
    >[];
    return rows.map(this.mapRowToLog);
  }

  checkDuplicateLog(date: string, supplementId: string): boolean {
    const stmt = this.db.prepare(
      'SELECT COUNT(*) as count FROM supplement_logs WHERE date = ? AND supplement_id = ? AND taken = 1'
    );
    const result = stmt.get(date, supplementId) as { count: number };
    return result.count > 0;
  }

  deleteSupplementLog(id: string): void {
    this.db.prepare('DELETE FROM supplement_logs WHERE id = ?').run(id);
  }

  updateSupplementLog(id: string, takenAt: string): void {
    const stmt = this.db.prepare(`
      UPDATE supplement_logs
      SET taken_at = ?
      WHERE id = ?
    `);
    stmt.run(takenAt, id);
  }

  // ===== NUTRIENT TARGETS =====

  getAllNutrientTargets(): SupplementNutrientTarget[] {
    const stmt = this.db.prepare('SELECT * FROM supplement_nutrient_targets');
    const rows = stmt.all() as Record<string, unknown>[];
    return rows.map(this.mapRowToTarget);
  }

  getNutrientTarget(nutrientKey: string): SupplementNutrientTarget | null {
    const stmt = this.db.prepare(
      'SELECT * FROM supplement_nutrient_targets WHERE nutrient_key = ?'
    );
    const row = stmt.get(nutrientKey) as Record<string, unknown> | undefined;
    return row ? this.mapRowToTarget(row) : null;
  }

  upsertNutrientTarget(
    nutrientKey: NutrientKey,
    targetValue: number,
    useRda: boolean
  ): SupplementNutrientTarget {
    const now = new Date().toISOString();
    const existing = this.getNutrientTarget(nutrientKey);

    if (existing) {
      const stmt = this.db.prepare(`
        UPDATE supplement_nutrient_targets
        SET target_value = ?, use_rda = ?, updated_at = ?
        WHERE nutrient_key = ?
      `);
      stmt.run(targetValue, useRda ? 1 : 0, now, nutrientKey);
      return { ...existing, targetValue, useRda, updatedAt: now };
    } else {
      const id = uuidv4();
      const stmt = this.db.prepare(`
        INSERT INTO supplement_nutrient_targets (id, nutrient_key, target_value, use_rda, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      stmt.run(id, nutrientKey, targetValue, useRda ? 1 : 0, now, now);
      return {
        id,
        nutrientKey,
        targetValue,
        useRda,
        createdAt: now,
        updatedAt: now,
      };
    }
  }

  deleteNutrientTarget(nutrientKey: string): void {
    this.db
      .prepare('DELETE FROM supplement_nutrient_targets WHERE nutrient_key = ?')
      .run(nutrientKey);
  }

  // ===== CUSTOM NUTRIENTS =====

  getAllCustomNutrients(): CustomNutrientMetadata[] {
    const stmt = this.db.prepare('SELECT * FROM custom_nutrient_metadata ORDER BY category, name');
    const rows = stmt.all() as Record<string, unknown>[];
    return rows.map(this.mapRowToCustomNutrient);
  }

  getCustomNutrientByKey(key: string): CustomNutrientMetadata | null {
    const stmt = this.db.prepare('SELECT * FROM custom_nutrient_metadata WHERE nutrient_key = ?');
    const row = stmt.get(key) as Record<string, unknown> | undefined;
    return row ? this.mapRowToCustomNutrient(row) : null;
  }

  createCustomNutrient(
    data: Omit<CustomNutrientMetadata, 'id' | 'createdAt' | 'updatedAt'>
  ): CustomNutrientMetadata {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO custom_nutrient_metadata
      (id, nutrient_key, name, unit, category, user_defined_target, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.key,
      data.name,
      data.unit,
      data.category,
      data.userDefinedTarget || null,
      now,
      now
    );

    return {
      id,
      key: data.key,
      name: data.name,
      unit: data.unit,
      category: data.category,
      userDefinedTarget: data.userDefinedTarget,
      createdAt: now,
      updatedAt: now,
    };
  }

  updateCustomNutrient(
    key: string,
    data: Partial<Omit<CustomNutrientMetadata, 'id' | 'key' | 'createdAt' | 'updatedAt'>>
  ): CustomNutrientMetadata {
    const existing = this.getCustomNutrientByKey(key);
    if (!existing) throw new Error('Custom nutrient not found');

    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      UPDATE custom_nutrient_metadata
      SET name = ?, unit = ?, category = ?, user_defined_target = ?, updated_at = ?
      WHERE nutrient_key = ?
    `);

    stmt.run(
      data.name ?? existing.name,
      data.unit ?? existing.unit,
      data.category ?? existing.category,
      data.userDefinedTarget ?? existing.userDefinedTarget ?? null,
      now,
      key
    );

    return {
      ...existing,
      ...data,
      updatedAt: now,
    };
  }

  deleteCustomNutrient(key: string): void {
    this.db.prepare('DELETE FROM custom_nutrient_metadata WHERE nutrient_key = ?').run(key);
  }

  // ===== HELPERS =====

  private mapRowToSupplement(row: Record<string, unknown>): Supplement {
    // Infer supplement type if not stored (for backwards compatibility)
    let supplementType = (row.supplement_type as 'nutrient' | 'custom' | null) || 'nutrient';
    const nutrients = JSON.parse((row.nutrients as string) || '{}');
    const customNutrients = JSON.parse((row.custom_nutrients as string) || '{}');

    // Auto-infer custom type if nutrients is empty
    if (Object.keys(nutrients).length === 0) {
      supplementType = 'custom';
    }

    return {
      id: row.id as string,
      name: row.name as string,
      brand: row.brand as string,
      servingSize: row.serving_size as string,
      nutrients,
      customNutrients,
      notes: row.notes as string | undefined,
      color: (row.color as string) || '#6366f1',
      dosageFrequency: (row.dosage_frequency as 'daily' | 'weekly') || 'daily',
      dosageQuantity: (row.dosage_quantity as number) || 1,
      dosageNotes: row.dosage_notes as string | undefined,
      supplementType,
      createdAt: row.created_at as string,
    };
  }

  private mapRowToLog(row: Record<string, unknown>): SupplementLog {
    return {
      id: row.id as string,
      date: row.date as string,
      supplementId: row.supplement_id as string,
      supplementName: row.supplement_name as string,
      taken: row.taken === 1,
      takenAt: row.taken_at as string | undefined,
      isDuplicateWarning: row.is_duplicate_warning === 1,
      createdAt: row.created_at as string,
    };
  }

  private mapRowToTarget(row: Record<string, unknown>): SupplementNutrientTarget {
    return {
      id: row.id as string,
      nutrientKey: row.nutrient_key as NutrientKey,
      targetValue: row.target_value as number,
      useRda: row.use_rda === 1,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    };
  }

  private mapRowToCustomNutrient(row: Record<string, unknown>): CustomNutrientMetadata {
    return {
      id: row.id as string,
      key: row.nutrient_key as string,
      name: row.name as string,
      unit: row.unit as string,
      category: row.category as string,
      userDefinedTarget: row.user_defined_target as number | undefined,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    };
  }
}
