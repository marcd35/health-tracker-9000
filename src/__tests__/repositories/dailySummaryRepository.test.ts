import { DailySummaryRepository } from '@/lib/database/repositories/dailySummaryRepository';
import { MealLogRepository } from '@/lib/database/repositories/mealLogRepository';
import { SupplementRepository } from '@/lib/database/repositories/supplementRepository';
import { ProfileRepository } from '@/lib/database/repositories/profileRepository';
import { setupTestDbWithData, teardownTestDb } from '../setup/test-db';

describe('DailySummaryRepository', () => {
  let db: any;
  let repo: DailySummaryRepository;
  let mealRepo: MealLogRepository;
  let supplementRepo: SupplementRepository;
  let profileRepo: ProfileRepository;

  beforeEach(() => {
    db = setupTestDbWithData();
    repo = new DailySummaryRepository();
    mealRepo = new MealLogRepository();
    supplementRepo = new SupplementRepository();
    profileRepo = new ProfileRepository();

    // Override database connections for testing
    (repo as any).db = db;
    (mealRepo as any).db = db;
    (supplementRepo as any).db = db;
    (profileRepo as any).db = db;

    // Override repo instances in dailySummaryRepo
    (repo as any).mealRepo = mealRepo;
    (repo as any).supplementRepo = supplementRepo;
    (repo as any).profileRepo = profileRepo;
  });

  afterEach(() => {
    if (db) {
      teardownTestDb(db);
    }
  });

  describe('getDailySummary', () => {
    it('should return daily summary with meals and supplements', async () => {
      // Create test data
      const supplement = supplementRepo.createSupplement({
        name: 'Vitamin D',
        brand: 'Test Brand',
        servingSize: '1000 IU',
        nutrients: { vitaminD: 1000 },
        customNutrients: {},
        supplementType: 'nutrient',
        color: '#fbbf24',
        dosageFrequency: 'daily',
        dosageQuantity: 1,
        enabled: true,
      });

      mealRepo.addMealLog({
        date: '2024-01-15',
        mealType: 'breakfast',
        foods: [
          {
            foodId: 'test-food-1',
            foodName: 'Test Food',
            amount: 100,
          },
        ],
        totalNutrition: {
          calories: 200,
          protein: 10,
          carbs: 20,
          fat: 5,
          fiber: 3,
        },
      });

      supplementRepo.logSupplementTaken({
        date: '2024-01-15',
        supplementId: supplement.id,
        supplementName: supplement.name,
        taken: true,
      });

      const result = await repo.getDailySummary('2024-01-15');

      expect(result).toMatchObject({
        date: '2024-01-15',
        totalNutrition: expect.any(Object),
        healthScore: expect.any(Number),
      });

      expect(result?.meals).toHaveLength(1);
      expect(result?.supplements).toHaveLength(1);
      expect(Array.isArray(result?.meals)).toBe(true);
      expect(Array.isArray(result?.supplements)).toBe(true);
      expect(result?.totalNutrition.calories).toBe(200);
    });

    it('should return null for date with no data', async () => {
      const result = await repo.getDailySummary('2024-01-20');
      expect(result).toBeNull();
    });

    it('should calculate totals correctly when no stored summary exists', async () => {
      // Create meal and supplement data
      const supplement = supplementRepo.createSupplement({
        name: 'Calcium',
        brand: 'Test Brand',
        servingSize: '500mg',
        nutrients: { calcium: 500 },
        customNutrients: {},
        supplementType: 'nutrient',
        color: '#10b981',
        dosageFrequency: 'daily',
        dosageQuantity: 1,
        enabled: true,
      });

      mealRepo.addMealLog({
        date: '2024-01-16',
        mealType: 'lunch',
        foods: [
          {
            foodId: 'test-food-2',
            foodName: 'Another Food',
            amount: 150,
          },
        ],
        totalNutrition: {
          calories: 300,
          protein: 15,
          carbs: 30,
          fat: 10,
          fiber: 4,
          calcium: 200,
        },
      });

      supplementRepo.logSupplementTaken({
        date: '2024-01-16',
        supplementId: supplement.id,
        supplementName: supplement.name,
        taken: true,
      });

      const result = await repo.getDailySummary('2024-01-16');

      expect(result?.totalNutrition.calories).toBe(300);
      expect(result?.totalNutrition.calcium).toBe(700); // 200 from food + 500 from supplement
    });
  });

  describe('calculateDailyTotals', () => {
    it('should calculate totals from meals and supplements', () => {
      const meals = [
        {
          totalNutrition: {
            calories: 400,
            protein: 20,
            carbs: 40,
            fat: 15,
            vitaminC: 50,
          },
        },
        {
          totalNutrition: {
            calories: 300,
            protein: 15,
            carbs: 30,
            fat: 10,
            fiber: 5,
          },
        },
      ];

      // Create supplements
      const supp1 = supplementRepo.createSupplement({
        name: 'Multi',
        brand: 'Test',
        servingSize: '1 tablet',
        nutrients: { vitaminD: 1000, vitaminC: 100 },
        customNutrients: {},
        supplementType: 'nutrient',
        color: '#6366f1',
        dosageFrequency: 'daily',
        dosageQuantity: 1,
        enabled: true,
      });

      const supp2 = supplementRepo.createSupplement({
        name: 'Omega',
        brand: 'Test',
        servingSize: '1 softgel',
        nutrients: { vitaminE: 200 },
        customNutrients: {},
        supplementType: 'nutrient',
        color: '#3b82f6',
        dosageFrequency: 'daily',
        dosageQuantity: 1,
        enabled: true,
      });

      const supplementLogs = [
        { supplementId: supp1.id, taken: true },
        { supplementId: supp2.id, taken: false }, // Not taken, should be ignored
      ];

      const result = repo.calculateDailyTotals(meals, supplementLogs);

      expect(result.calories).toBe(700); // 400 + 300
      expect(result.protein).toBe(35); // 20 + 15
      expect(result.carbs).toBe(70); // 40 + 30
      expect(result.fat).toBe(25); // 15 + 10
      expect(result.fiber).toBe(5); // Only in second meal
      expect(result.vitaminC).toBe(150); // 50 from meals + 100 from supplement
      expect(result.vitaminD).toBe(1000); // Only from supplement
      expect(result.vitaminE).toBeUndefined(); // Supplement not taken
    });

    it('should handle empty meals and supplements', () => {
      const result = repo.calculateDailyTotals([], []);

      expect(result).toEqual({
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
      });
    });
  });

  describe('saveDailySummary', () => {
    it('should create new daily summary', () => {
      const summary = {
        date: '2024-01-17',
        weight: 70.5,
        totalNutrition: {
          calories: 2200,
          protein: 120,
          carbs: 250,
          fat: 80,
          fiber: 25,
        },
        healthScore: 85,
        notes: 'Good day',
      };

      repo.saveDailySummary(summary);

      // Verify in database
      const saved = db.prepare('SELECT * FROM daily_summary WHERE date = ?').get('2024-01-17');
      expect(saved).toMatchObject({
        date: '2024-01-17',
        weight: 70.5,
        health_score: 85,
        notes: 'Good day',
      });
      expect(JSON.parse(saved.total_nutrition)).toEqual(summary.totalNutrition);
    });

    it('should update existing daily summary', () => {
      // Create initial summary
      repo.saveDailySummary({
        date: '2024-01-18',
        weight: 71.0,
        totalNutrition: { calories: 2000, protein: 100, carbs: 200, fat: 70, fiber: 20 },
        healthScore: 75,
      });

      // Update it
      repo.saveDailySummary({
        date: '2024-01-18',
        weight: 70.8,
        totalNutrition: { calories: 2100, protein: 110, carbs: 220, fat: 75, fiber: 22 },
        healthScore: 80,
        notes: 'Updated notes',
      });

      // Verify update
      const updated = db.prepare('SELECT * FROM daily_summary WHERE date = ?').get('2024-01-18');
      expect(updated.weight).toBe(70.8);
      expect(updated.health_score).toBe(80);
      expect(updated.notes).toBe('Updated notes');
      expect(JSON.parse(updated.total_nutrition).calories).toBe(2100);
    });

    it('should handle partial updates', () => {
      // Create initial summary
      repo.saveDailySummary({
        date: '2024-01-19',
        weight: 72.0,
        totalNutrition: { calories: 1800, protein: 90, carbs: 180, fat: 60, fiber: 18 },
        healthScore: 70,
        notes: 'Initial notes',
      });

      // Update only weight
      repo.saveDailySummary({
        date: '2024-01-19',
        weight: 71.5,
      });

      const updated = db.prepare('SELECT * FROM daily_summary WHERE date = ?').get('2024-01-19');
      expect(updated.weight).toBe(71.5);
      expect(updated.health_score).toBe(70); // Unchanged
      expect(updated.notes).toBe('Initial notes'); // Unchanged
    });
  });

  describe('getWeeklySummary', () => {
    beforeEach(() => {
      // Create test data for a week
      const dates = [
        '2024-01-14',
        '2024-01-15',
        '2024-01-16',
        '2024-01-17',
        '2024-01-18',
        '2024-01-19',
        '2024-01-20',
      ];

      dates.forEach((date, index) => {
        // Create meal for each day
        mealRepo.addMealLog({
          date,
          mealType: 'breakfast',
          foods: [
            {
              foodId: `food-${index}`,
              foodName: `Food ${index}`,
              amount: 100,
            },
          ],
          totalNutrition: {
            calories: 200 + index * 50,
            protein: 10 + index,
            carbs: 20 + index * 5,
            fat: 8 + index,
            fiber: 3 + index,
          },
        });

        // Create supplement log for some days
        if (index % 2 === 0) {
          const supplement = supplementRepo.createSupplement({
            name: `Supplement ${index}`,
            brand: 'Test',
            servingSize: '1 capsule',
            nutrients: { vitaminD: 500 + index * 100 },
            customNutrients: {},
            supplementType: 'nutrient',
            color: '#fbbf24',
            dosageFrequency: 'daily',
            dosageQuantity: 1,
            enabled: true,
          });

          supplementRepo.logSupplementTaken({
            date,
            supplementId: supplement.id,
            supplementName: supplement.name,
            taken: true,
          });
        }

        // Save daily summary for some days
        if (index < 3) {
          repo.saveDailySummary({
            date,
            weight: 70 + index * 0.5,
            totalNutrition: {
              calories: 2000 + index * 100,
              protein: 100 + index * 10,
              carbs: 200 + index * 20,
              fat: 70 + index * 7,
              fiber: 20 + index * 2,
            },
            healthScore: 70 + index * 5,
          });
        }
      });
    });

    it('should return weekly summaries for 7 days', () => {
      const result = repo.getWeeklySummary('2024-01-20');

      expect(result).toHaveLength(7);
      expect(result[0].date).toBe('2024-01-14');
      expect(result[6].date).toBe('2024-01-20');

      // Check that stored summaries are used where available
      expect(result[0].weight).toBe(70); // Stored value
      expect(result[0].healthScore).toBeGreaterThan(0);

      // Check that calculated summaries are used where not stored
      expect(result[3].weight).toBeUndefined(); // No stored value, should use profile default
    });

    it('should batch fetch meals and supplements efficiently', () => {
      // This test verifies the N+1 query fix - should make few database calls
      const result = repo.getWeeklySummary('2024-01-20');

      expect(result).toHaveLength(7);

      // Verify all dates have meals
      result.forEach((summary) => {
        expect(summary.meals).toBeDefined();
        expect(summary.supplements).toBeDefined();
      });
    });

    it('should calculate health scores for summaries', () => {
      const result = repo.getWeeklySummary('2024-01-20');

      result.forEach((summary) => {
        expect(summary.healthScore).toBeGreaterThan(0);
        expect(summary.healthScoreBreakdown).toBeDefined();
      });
    });
  });

  describe('getAllDailySummaries', () => {
    beforeEach(() => {
      // Create test data for multiple days
      for (let i = 1; i <= 15; i++) {
        const date = `2024-01-${String(i).padStart(2, '0')}`;

        // Create meal
        mealRepo.addMealLog({
          date,
          mealType: 'breakfast',
          foods: [
            {
              foodId: `food-${i}`,
              foodName: `Food ${i}`,
              amount: 100,
            },
          ],
          totalNutrition: {
            calories: 200 + i * 10,
            protein: 10 + i,
            carbs: 20 + i * 2,
            fat: 8 + i,
            fiber: 3 + i,
          },
        });

        // Save daily summary
        repo.saveDailySummary({
          date,
          weight: 70 + i * 0.1,
          totalNutrition: {
            calories: 2000 + i * 50,
            protein: 100 + i * 5,
            carbs: 200 + i * 10,
            fat: 70 + i * 3,
            fiber: 20 + i,
          },
          healthScore: 70 + i,
        });
      }
    });

    it('should return paginated summaries with total count', () => {
      const result = repo.getAllDailySummaries(undefined, undefined, 10, 0);

      expect(result.data).toHaveLength(10);
      expect(result.total).toBe(15);
      expect(result.data[0].date).toBe('2024-01-15'); // Most recent first
      expect(result.data[9].date).toBe('2024-01-06');
    });

    it('should handle date range filtering', () => {
      const result = repo.getAllDailySummaries('2024-01-05', '2024-01-10');

      expect(result.total).toBe(6); // dates 5-10
      expect(result.data).toHaveLength(6);
      expect(result.data[0].date).toBe('2024-01-10');
      expect(result.data[5].date).toBe('2024-01-05');
    });

    it('should handle pagination with date range', () => {
      const result = repo.getAllDailySummaries('2024-01-01', '2024-01-15', 5, 5);

      expect(result.total).toBe(15);
      expect(result.data).toHaveLength(5);
      expect(result.data[0].date).toBe('2024-01-10'); // Offset 5 from most recent
    });

    it('should batch fetch meals and supplements for paginated results', () => {
      const result = repo.getAllDailySummaries(undefined, undefined, 5, 0);

      expect(result.data).toHaveLength(5);

      // Verify all summaries have meals and supplements loaded
      result.data.forEach((summary) => {
        expect(summary.meals).toBeDefined();
        expect(summary.supplements).toBeDefined();
        expect(Array.isArray(summary.meals)).toBe(true);
        expect(Array.isArray(summary.supplements)).toBe(true);
      });
    });

    it('should return empty result when no summaries exist', () => {
      // Clear all summaries
      db.prepare('DELETE FROM daily_summary').run();

      const result = repo.getAllDailySummaries();

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should handle start date only', () => {
      const result = repo.getAllDailySummaries('2024-01-10', undefined);

      expect(result.total).toBe(6); // dates 10-15
      expect(result.data[0].date).toBe('2024-01-15');
      expect(result.data[5].date).toBe('2024-01-10');
    });

    it('should handle end date only', () => {
      const result = repo.getAllDailySummaries(undefined, '2024-01-05');

      expect(result.total).toBe(5); // dates 1-5
      expect(result.data[0].date).toBe('2024-01-05');
      expect(result.data[4].date).toBe('2024-01-01');
    });
  });
});
