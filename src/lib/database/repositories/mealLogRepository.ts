import { getDatabase } from '../connection';
import type { MealLog } from '@/lib/types/health';
import { v4 as uuidv4 } from 'uuid';

export class MealLogRepository {
  private db = getDatabase();

  addMealLog(meal: Omit<MealLog, 'id' | 'createdAt'>): MealLog {
    const id = uuidv4();
    const createdAt = new Date().toISOString();
    const newMeal = { ...meal, id, createdAt };

    const stmt = this.db.prepare(`
      INSERT INTO meal_logs (id, date, meal_type, foods, total_nutrition, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      newMeal.id,
      newMeal.date,
      newMeal.mealType,
      JSON.stringify(newMeal.foods),
      JSON.stringify(newMeal.totalNutrition),
      newMeal.createdAt
    );

    return newMeal;
  }

  getMealLogsByDate(date: string): MealLog[] {
    const stmt = this.db.prepare('SELECT * FROM meal_logs WHERE date = ?');
    const rows = stmt.all(date) as any[];

    return rows.map((row) => ({
      id: row.id,
      date: row.date,
      mealType: row.meal_type,
      foods: JSON.parse(row.foods),
      totalNutrition: JSON.parse(row.total_nutrition),
      createdAt: row.created_at,
    }));
  }

  updateMealLog(id: string, updates: Partial<MealLog>): void {
    const stmt = this.db.prepare('SELECT * FROM meal_logs WHERE id = ?');
    const current = stmt.get(id) as any;
    if (!current) throw new Error('Meal log not found');

    // Map camelCase updates to snake_case for database
    const dbUpdates: any = {};
    if (updates.mealType !== undefined) dbUpdates.meal_type = updates.mealType;
    if (updates.foods !== undefined) dbUpdates.foods = JSON.stringify(updates.foods);
    if (updates.totalNutrition !== undefined)
      dbUpdates.total_nutrition = JSON.stringify(updates.totalNutrition);

    const updateStmt = this.db.prepare(`
      UPDATE meal_logs SET
        ${Object.keys(dbUpdates)
          .map((key) => `${key} = ?`)
          .join(', ')}
      WHERE id = ?
    `);

    updateStmt.run(...Object.values(dbUpdates), id);
  }

  deleteMealLog(id: string): void {
    const stmt = this.db.prepare('DELETE FROM meal_logs WHERE id = ?');
    stmt.run(id);
  }

  getMealLogsByDates(dates: string[]): MealLog[] {
    if (dates.length === 0) return [];

    const placeholders = dates.map(() => '?').join(',');
    const stmt = this.db.prepare(
      `SELECT * FROM meal_logs WHERE date IN (${placeholders}) ORDER BY date, created_at`
    );
    const rows = stmt.all(...dates) as any[];

    return rows.map((row) => ({
      id: row.id,
      date: row.date,
      mealType: row.meal_type,
      foods: JSON.parse(row.foods),
      totalNutrition: JSON.parse(row.total_nutrition),
      createdAt: row.created_at,
    }));
  }

  getRecentFoods(limit: number = 10): Array<{ foodId: string; foodName: string; count: number }> {
    // Get cutoff date for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0];

    // Use SQLite json_each() to aggregate food frequencies at database level
    const stmt = this.db.prepare(`
      SELECT
        json_extract(value, '$.foodId') as food_id,
        json_extract(value, '$.foodName') as food_name,
        COUNT(*) as frequency
      FROM meal_logs,
           json_each(meal_logs.foods)
      WHERE date >= ?
      GROUP BY food_id
      ORDER BY frequency DESC, MAX(created_at) DESC
      LIMIT ?
    `);

    const rows = stmt.all(cutoffDate, limit) as any[];

    return rows.map((row) => ({
      foodId: row.food_id,
      foodName: row.food_name,
      count: row.frequency,
    }));
  }

  getAllMealLogs(
    startDate?: string,
    endDate?: string,
    limit: number = 100,
    offset: number = 0
  ): { data: MealLog[]; total: number } {
    // First, get the total count
    let countQuery = 'SELECT COUNT(*) as total FROM meal_logs';
    const countParams: any[] = [];

    if (startDate || endDate) {
      const conditions: string[] = [];
      if (startDate) {
        conditions.push('date >= ?');
        countParams.push(startDate);
      }
      if (endDate) {
        conditions.push('date <= ?');
        countParams.push(endDate);
      }
      countQuery += ' WHERE ' + conditions.join(' AND ');
    }

    const countStmt = this.db.prepare(countQuery);
    const countResult = countStmt.get(...countParams) as { total: number };
    const total = countResult.total;

    // Then get the paginated data
    let query = 'SELECT * FROM meal_logs';
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

    query += ' ORDER BY date DESC, created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const stmt = this.db.prepare(query);
    const rows = stmt.all(...params) as any[];

    const data = rows.map((row) => ({
      id: row.id,
      date: row.date,
      mealType: row.meal_type,
      foods: JSON.parse(row.foods),
      totalNutrition: JSON.parse(row.total_nutrition),
      createdAt: row.created_at,
    }));

    return { data, total };
  }
}
