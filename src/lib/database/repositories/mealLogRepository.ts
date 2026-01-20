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

    const updated = {
      ...current,
      ...updates,
      foods: JSON.stringify(updates.foods || JSON.parse(current.foods)),
      total_nutrition: JSON.stringify(
        updates.totalNutrition || JSON.parse(current.total_nutrition)
      ),
    };

    const updateStmt = this.db.prepare(`
      UPDATE meal_logs SET 
        meal_type = ?, 
        foods = ?, 
        total_nutrition = ?
      WHERE id = ?
    `);

    updateStmt.run(updated.meal_type, updated.foods, updated.total_nutrition, id);
  }

  deleteMealLog(id: string): void {
    const stmt = this.db.prepare('DELETE FROM meal_logs WHERE id = ?');
    stmt.run(id);
  }

  getRecentFoods(limit: number = 10): Array<{ foodId: string; foodName: string; count: number }> {
    // Get all meals from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0];

    const stmt = this.db.prepare(`
      SELECT foods FROM meal_logs WHERE date >= ? ORDER BY created_at DESC
    `);
    const rows = stmt.all(cutoffDate) as any[];

    // Count food occurrences
    const foodCounts: Map<string, { foodName: string; count: number }> = new Map();

    rows.forEach((row) => {
      const foods = JSON.parse(row.foods);
      foods.forEach((food: { foodId: string; foodName: string }) => {
        const existing = foodCounts.get(food.foodId);
        if (existing) {
          existing.count++;
        } else {
          foodCounts.set(food.foodId, { foodName: food.foodName, count: 1 });
        }
      });
    });

    // Sort by count and return top N
    return Array.from(foodCounts.entries())
      .map(([foodId, data]) => ({ foodId, foodName: data.foodName, count: data.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }
}
