import { getDatabase } from '../connection';
import type { Food, NutritionalValues } from '@/lib/types/health';
import { v4 as uuidv4 } from 'uuid';

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

  /**
   * Create a new food from USDA data
   * Returns the new food ID
   */
  createFoodFromUSDA(
    name: string,
    servingSize: number,
    servingUnit: string,
    nutritionPer100g: NutritionalValues,
    allergens: string[] | undefined,
    usdaFdcId: number
  ): string {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO foods (
        id, name, serving_size, serving_unit, calories, protein, carbs, fat, fiber,
        allergens, source, usda_fdc_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      name,
      servingSize,
      servingUnit,
      nutritionPer100g.calories,
      nutritionPer100g.protein,
      nutritionPer100g.carbs,
      nutritionPer100g.fat,
      nutritionPer100g.fiber || 0,
      allergens ? JSON.stringify(allergens) : null,
      'usda',
      usdaFdcId.toString(),
      now
    );

    return id;
  }

  /**
   * Check if a USDA food is already cached by FDC ID
   */
  getFoodByUSDAId(fdcId: string): Food | null {
    const stmt = this.db.prepare('SELECT * FROM foods WHERE usda_fdc_id = ? AND source = ?');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const row = stmt.get(fdcId, 'usda') as any;

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
      allergens: row.allergens ? JSON.parse(row.allergens) : undefined,
    };
  }

  /**
   * Search foods by source (manual, mock, usda)
   */
  searchFoodsBySource(query: string, source: 'manual' | 'mock' | 'usda'): Food[] {
    const stmt = this.db.prepare('SELECT * FROM foods WHERE name LIKE ? AND source = ?');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = stmt.all(`%${query}%`, source) as any[];

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
      allergens: row.allergens ? JSON.parse(row.allergens) : undefined,
    }));
  }

  /**
   * Update existing USDA food with fresh data
   */
  updateFoodFromUSDA(
    foodId: string,
    nutritionPer100g: NutritionalValues,
    allergens: string[] | undefined
  ): void {
    const stmt = this.db.prepare(`
      UPDATE foods
      SET calories = ?, protein = ?, carbs = ?, fat = ?, fiber = ?, allergens = ?
      WHERE id = ?
    `);

    stmt.run(
      nutritionPer100g.calories,
      nutritionPer100g.protein,
      nutritionPer100g.carbs,
      nutritionPer100g.fat,
      nutritionPer100g.fiber || 0,
      allergens ? JSON.stringify(allergens) : null,
      foodId
    );
  }
}
