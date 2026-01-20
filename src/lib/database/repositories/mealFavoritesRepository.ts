import { getDatabase } from '../connection';
import { v4 as uuidv4 } from 'uuid';

export interface MealFavorite {
  id: string;
  name: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: Array<{
    foodId: string;
    foodName: string;
    amount: number;
  }>;
  createdAt: string;
}

export class MealFavoritesRepository {
  private db = getDatabase();

  constructor() {
    // Ensure table exists
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS meal_favorites (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        meal_type TEXT NOT NULL,
        foods TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `);
  }

  addFavorite(
    name: string,
    mealType: string,
    foods: Array<{ foodId: string; foodName: string; amount: number }>
  ): MealFavorite {
    const id = uuidv4();
    const createdAt = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO meal_favorites (id, name, meal_type, foods, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(id, name, mealType, JSON.stringify(foods), createdAt);

    return {
      id,
      name,
      mealType: mealType as MealFavorite['mealType'],
      foods,
      createdAt,
    };
  }

  getFavorites(): MealFavorite[] {
    const stmt = this.db.prepare('SELECT * FROM meal_favorites ORDER BY created_at DESC');
    const rows = stmt.all() as any[];

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      mealType: row.meal_type as MealFavorite['mealType'],
      foods: JSON.parse(row.foods),
      createdAt: row.created_at,
    }));
  }

  getFavoriteById(id: string): MealFavorite | null {
    const stmt = this.db.prepare('SELECT * FROM meal_favorites WHERE id = ?');
    const row = stmt.get(id) as any;

    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      mealType: row.meal_type as MealFavorite['mealType'],
      foods: JSON.parse(row.foods),
      createdAt: row.created_at,
    };
  }

  deleteFavorite(id: string): void {
    const stmt = this.db.prepare('DELETE FROM meal_favorites WHERE id = ?');
    stmt.run(id);
  }

  updateFavorite(
    id: string,
    updates: {
      name?: string;
      mealType?: string;
      foods?: Array<{ foodId: string; foodName: string; amount: number }>;
    }
  ): void {
    const current = this.getFavoriteById(id);
    if (!current) throw new Error('Favorite not found');

    const stmt = this.db.prepare(`
      UPDATE meal_favorites SET
        name = ?,
        meal_type = ?,
        foods = ?
      WHERE id = ?
    `);

    stmt.run(
      updates.name ?? current.name,
      updates.mealType ?? current.mealType,
      JSON.stringify(updates.foods ?? current.foods),
      id
    );
  }
}
