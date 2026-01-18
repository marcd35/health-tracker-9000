import { getDatabase } from '../connection';
import type { Food } from '@/lib/types/health';

export class FoodRepository {
  private db = getDatabase();

  searchFoods(query: string): Food[] {
    const stmt = this.db.prepare('SELECT * FROM foods WHERE name LIKE ?');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = stmt.all(`%${query}%`) as any[];

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      servingSize: row.serving_size,
      servingUnit: row.serving_unit,
      nutritionPer100g: {
        calories: row.calories,
        protein: row.protein,
        carbs: row.carbs,
        fat: row.fat,
        fiber: row.fiber,
      },
    }));
  }

  getFoodById(id: string): Food | null {
    const stmt = this.db.prepare('SELECT * FROM foods WHERE id = ?');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const row = stmt.get(id) as any;

    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      servingSize: row.serving_size,
      servingUnit: row.serving_unit,
      nutritionPer100g: {
        calories: row.calories,
        protein: row.protein,
        carbs: row.carbs,
        fat: row.fat,
        fiber: row.fiber,
      },
    };
  }

  checkAllergens(foodId: string, userAllergies: string[]): string[] {
    const food = this.getFoodById(foodId);
    if (!food) return [];

    // In a real app, allergens would be stored in the DB.
    // Our mock schema has an allergens column.
    const stmt = this.db.prepare('SELECT allergens FROM foods WHERE id = ?');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const row = stmt.get(foodId) as any;
    const foodAllergens = JSON.parse(row.allergens || '[]') as string[];

    return foodAllergens.filter((a) => userAllergies.includes(a));
  }
}
