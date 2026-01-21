import { MealLogRepository } from '@/lib/database/repositories/mealLogRepository';
import { setupTestDbWithData, teardownTestDb } from '../setup/test-db';

describe('MealLogRepository', () => {
  let db: any;
  let repo: MealLogRepository;

  beforeEach(() => {
    db = setupTestDbWithData();
    repo = new MealLogRepository();
    // Override the database connection for testing
    (repo as any).db = db;
  });

  afterEach(() => {
    if (db) {
      teardownTestDb(db);
    }
  });

  describe('addMealLog', () => {
    it('should add a meal log successfully', () => {
      const mealData = {
        date: '2024-01-15',
        mealType: 'breakfast' as const,
        foods: [
          {
            foodId: 'food-1',
            foodName: 'Test Food',
            amount: 100,
          },
        ],
        totalNutrition: {
          calories: 200,
          protein: 10,
          carbs: 20,
          fat: 5,
          fiber: 2,
        },
      };

      const result = repo.addMealLog(mealData);

      expect(result).toMatchObject({
        ...mealData,
        id: expect.any(String),
        createdAt: expect.any(String),
      });

      // Verify it was saved to database
      const saved = db.prepare('SELECT * FROM meal_logs WHERE id = ?').get(result.id);
      expect(saved).toBeTruthy();
      expect(saved.meal_type).toBe('breakfast');
      expect(JSON.parse(saved.foods)).toEqual(mealData.foods);
    });

    it('should generate unique IDs for each meal', () => {
      const mealData = {
        date: '2024-01-15',
        mealType: 'lunch' as const,
        foods: [{ foodId: 'food-1', foodName: 'Test Food', amount: 100 }],
        totalNutrition: { calories: 200, protein: 10, carbs: 20, fat: 5, fiber: 2 },
      };

      const result1 = repo.addMealLog(mealData);
      const result2 = repo.addMealLog(mealData);

      expect(result1.id).not.toBe(result2.id);
    });
  });

  describe('getMealLogsByDate', () => {
    beforeEach(() => {
      // Insert test data
      const stmt = db.prepare(`
        INSERT INTO meal_logs (id, date, meal_type, foods, total_nutrition, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        'meal-1',
        '2024-01-15',
        'breakfast',
        JSON.stringify([{ foodId: 'food-1', foodName: 'Eggs', amount: 100 }]),
        JSON.stringify({ calories: 155, protein: 13, carbs: 1, fat: 11, fiber: 0 }),
        '2024-01-15T08:00:00.000Z'
      );

      stmt.run(
        'meal-2',
        '2024-01-15',
        'lunch',
        JSON.stringify([{ foodId: 'food-2', foodName: 'Chicken', amount: 150 }]),
        JSON.stringify({ calories: 240, protein: 35, carbs: 0, fat: 8, fiber: 0 }),
        '2024-01-15T12:00:00.000Z'
      );

      stmt.run(
        'meal-3',
        '2024-01-16',
        'dinner',
        JSON.stringify([{ foodId: 'food-3', foodName: 'Salad', amount: 200 }]),
        JSON.stringify({ calories: 100, protein: 5, carbs: 15, fat: 2, fiber: 5 }),
        '2024-01-16T18:00:00.000Z'
      );
    });

    it('should return all meals for a specific date', () => {
      const meals = repo.getMealLogsByDate('2024-01-15');

      expect(meals).toHaveLength(2);
      expect(meals[0]).toMatchObject({
        id: 'meal-1',
        date: '2024-01-15',
        mealType: 'breakfast',
        createdAt: '2024-01-15T08:00:00.000Z',
      });
      expect(meals[1]).toMatchObject({
        id: 'meal-2',
        date: '2024-01-15',
        mealType: 'lunch',
      });
    });

    it('should return empty array for date with no meals', () => {
      const meals = repo.getMealLogsByDate('2024-01-20');
      expect(meals).toHaveLength(0);
    });

    it('should parse JSON fields correctly', () => {
      const meals = repo.getMealLogsByDate('2024-01-15');

      expect(meals[0].foods).toEqual([{ foodId: 'food-1', foodName: 'Eggs', amount: 100 }]);
      expect(meals[0].totalNutrition).toEqual({
        calories: 155,
        protein: 13,
        carbs: 1,
        fat: 11,
        fiber: 0,
      });
    });
  });

  describe('updateMealLog', () => {
    beforeEach(() => {
      const stmt = db.prepare(`
        INSERT INTO meal_logs (id, date, meal_type, foods, total_nutrition, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        'meal-1',
        '2024-01-15',
        'breakfast',
        JSON.stringify([{ foodId: 'food-1', foodName: 'Eggs', amount: 100 }]),
        JSON.stringify({ calories: 155, protein: 13, carbs: 1, fat: 11, fiber: 0 }),
        '2024-01-15T08:00:00.000Z'
      );
    });

    it('should update meal log successfully', () => {
      const updates = {
        mealType: 'lunch' as const,
        foods: [{ foodId: 'food-2', foodName: 'Pancakes', amount: 150 }],
        totalNutrition: { calories: 300, protein: 8, carbs: 45, fat: 10, fiber: 2 },
      };

      repo.updateMealLog('meal-1', updates);

      const updated = db.prepare('SELECT * FROM meal_logs WHERE id = ?').get('meal-1');
      expect(updated.meal_type).toBe('lunch');
      expect(JSON.parse(updated.foods)).toEqual(updates.foods);
      expect(JSON.parse(updated.total_nutrition)).toEqual(updates.totalNutrition);
    });

    it('should throw error for non-existent meal', () => {
      expect(() => {
        repo.updateMealLog('non-existent', { mealType: 'dinner' });
      }).toThrow('Meal log not found');
    });

    it('should handle partial updates', () => {
      repo.updateMealLog('meal-1', { mealType: 'snack' });

      const updated = db.prepare('SELECT * FROM meal_logs WHERE id = ?').get('meal-1');
      expect(updated.meal_type).toBe('snack');
      // Other fields should remain unchanged
      expect(JSON.parse(updated.foods)).toEqual([
        { foodId: 'food-1', foodName: 'Eggs', amount: 100 },
      ]);
    });
  });

  describe('deleteMealLog', () => {
    beforeEach(() => {
      const stmt = db.prepare(`
        INSERT INTO meal_logs (id, date, meal_type, foods, total_nutrition, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        'meal-1',
        '2024-01-15',
        'breakfast',
        JSON.stringify([{ foodId: 'food-1', foodName: 'Eggs', amount: 100 }]),
        JSON.stringify({ calories: 155, protein: 13, carbs: 1, fat: 11, fiber: 0 }),
        '2024-01-15T08:00:00.000Z'
      );
    });

    it('should delete meal log successfully', () => {
      repo.deleteMealLog('meal-1');

      const deleted = db.prepare('SELECT * FROM meal_logs WHERE id = ?').get('meal-1');
      expect(deleted).toBeUndefined();
    });

    it('should not throw error when deleting non-existent meal', () => {
      expect(() => {
        repo.deleteMealLog('non-existent');
      }).not.toThrow();
    });
  });

  describe('getMealLogsByDates', () => {
    beforeEach(() => {
      const stmt = db.prepare(`
        INSERT INTO meal_logs (id, date, meal_type, foods, total_nutrition, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      stmt.run('meal-1', '2024-01-15', 'breakfast', '[]', '{}', '2024-01-15T08:00:00.000Z');
      stmt.run('meal-2', '2024-01-16', 'lunch', '[]', '{}', '2024-01-16T12:00:00.000Z');
      stmt.run('meal-3', '2024-01-17', 'dinner', '[]', '{}', '2024-01-17T18:00:00.000Z');
    });

    it('should return meals for multiple dates', () => {
      const meals = repo.getMealLogsByDates(['2024-01-15', '2024-01-17']);

      expect(meals).toHaveLength(2);
      expect(meals.map((m) => m.id)).toEqual(['meal-1', 'meal-3']);
    });

    it('should return empty array for empty dates array', () => {
      const meals = repo.getMealLogsByDates([]);
      expect(meals).toHaveLength(0);
    });

    it('should return empty array when no meals found for dates', () => {
      const meals = repo.getMealLogsByDates(['2024-01-20']);
      expect(meals).toHaveLength(0);
    });

    it('should order results by date and created_at', () => {
      // Add another meal on the same date with later timestamp
      const stmt = db.prepare(`
        INSERT INTO meal_logs (id, date, meal_type, foods, total_nutrition, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      stmt.run('meal-4', '2024-01-15', 'snack', '[]', '{}', '2024-01-15T15:00:00.000Z');

      const meals = repo.getMealLogsByDates(['2024-01-15']);
      expect(meals.map((m) => m.id)).toEqual(['meal-1', 'meal-4']);
    });
  });

  describe('getRecentFoods', () => {
    beforeEach(() => {
      const stmt = db.prepare(`
        INSERT INTO meal_logs (id, date, meal_type, foods, total_nutrition, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      // Recent meals (within 30 days)
      stmt.run(
        'meal-1',
        new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days ago
        'breakfast',
        JSON.stringify([
          { foodId: 'food-1', foodName: 'Eggs', amount: 100 },
          { foodId: 'food-2', foodName: 'Toast', amount: 50 },
        ]),
        '{}',
        new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      );

      stmt.run(
        'meal-2',
        new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 10 days ago
        'lunch',
        JSON.stringify([
          { foodId: 'food-1', foodName: 'Eggs', amount: 100 },
          { foodId: 'food-3', foodName: 'Bacon', amount: 30 },
        ]),
        '{}',
        new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      );

      // Old meal (more than 30 days ago)
      stmt.run(
        'meal-3',
        new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 40 days ago
        'dinner',
        JSON.stringify([{ foodId: 'food-4', foodName: 'Steak', amount: 200 }]),
        '{}',
        new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString()
      );
    });

    it('should return recent foods ordered by frequency', () => {
      const recentFoods = repo.getRecentFoods(10);

      expect(recentFoods).toHaveLength(3);
      expect(recentFoods[0]).toEqual({
        foodId: 'food-1',
        foodName: 'Eggs',
        count: 2,
      });
      expect(recentFoods[1]).toEqual({
        foodId: 'food-2',
        foodName: 'Toast',
        count: 1,
      });
    });

    it('should respect limit parameter', () => {
      const recentFoods = repo.getRecentFoods(2);
      expect(recentFoods).toHaveLength(2);
    });

    it('should exclude foods from meals older than 30 days', () => {
      const recentFoods = repo.getRecentFoods(10);
      const steakFood = recentFoods.find((f) => f.foodId === 'food-4');
      expect(steakFood).toBeUndefined();
    });
  });

  describe('getAllMealLogs', () => {
    beforeEach(() => {
      const stmt = db.prepare(`
        INSERT INTO meal_logs (id, date, meal_type, foods, total_nutrition, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      for (let i = 1; i <= 15; i++) {
        const date = `2024-01-${String(i).padStart(2, '0')}`;
        stmt.run(
          `meal-${i}`,
          date,
          'breakfast',
          JSON.stringify([{ foodId: 'food-1', foodName: 'Eggs', amount: 100 }]),
          JSON.stringify({ calories: 155, protein: 13, carbs: 1, fat: 11, fiber: 0 }),
          `${date}T08:00:00.000Z`
        );
      }
    });

    it('should return paginated results with total count', () => {
      const result = repo.getAllMealLogs(undefined, undefined, 5, 0);

      expect(result.data).toHaveLength(5);
      expect(result.total).toBe(15);
      expect(result.data[0].id).toBe('meal-15'); // Most recent first
    });

    it('should handle date range filtering', () => {
      const result = repo.getAllMealLogs('2024-01-05', '2024-01-10');

      expect(result.total).toBe(6); // meals 5-10
      expect(result.data).toHaveLength(6);
    });

    it('should handle pagination with date range', () => {
      const result = repo.getAllMealLogs('2024-01-01', '2024-01-15', 3, 3);

      expect(result.total).toBe(15);
      expect(result.data).toHaveLength(3);
      expect(result.data[0].id).toBe('meal-12'); // Offset 3 from most recent
    });

    it('should return all results when no pagination specified', () => {
      const result = repo.getAllMealLogs();

      expect(result.data).toHaveLength(15);
      expect(result.total).toBe(15);
    });
  });
});
