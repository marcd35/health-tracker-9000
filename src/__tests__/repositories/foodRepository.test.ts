import { FoodRepository } from '@/lib/database/repositories/foodRepository';
import { setupTestDbWithData, teardownTestDb } from '../setup/test-db';

describe('FoodRepository', () => {
  let db: any;
  let repo: FoodRepository;

  beforeEach(() => {
    db = setupTestDbWithData();
    repo = new FoodRepository();
    // Override the database connection for testing
    (repo as any).db = db;
  });

  afterEach(() => {
    if (db) {
      teardownTestDb(db);
    }
  });

  describe('searchFoods', () => {
    it('should return foods matching query', () => {
      const results = repo.searchFoods('apple');
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((food) => food.name.toLowerCase().includes('apple'))).toBe(true);

      results.forEach((food) => {
        expect(food).toMatchObject({
          id: expect.any(String),
          name: expect.any(String),
          servingSize: expect.any(Number),
          servingUnit: expect.any(String),
          nutritionPer100g: expect.any(Object),
        });
        expect(food.nutritionPer100g).toMatchObject({
          calories: expect.any(Number),
          protein: expect.any(Number),
          carbs: expect.any(Number),
          fat: expect.any(Number),
          fiber: expect.any(Number),
        });
      });
    });

    it('should return empty array for non-matching query', () => {
      const results = repo.searchFoods('nonexistentfood12345');
      expect(results).toEqual([]);
    });

    it('should be case insensitive', () => {
      const lowerResults = repo.searchFoods('apple');
      const upperResults = repo.searchFoods('APPLE');
      const mixedResults = repo.searchFoods('Apple');

      expect(lowerResults.length).toBe(upperResults.length);
      expect(lowerResults.length).toBe(mixedResults.length);
    });
  });

  describe('getFoodById', () => {
    it('should return food by id', () => {
      // First get a food from search
      const searchResults = repo.searchFoods('apple');
      expect(searchResults.length).toBeGreaterThan(0);

      const food = searchResults[0];
      const result = repo.getFoodById(food.id);

      expect(result).toEqual(food);
    });

    it('should return null for non-existent food', () => {
      const result = repo.getFoodById('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('checkAllergens', () => {
    it('should return matching allergens', () => {
      // Create a test food with allergens
      const foodId = repo.createFoodFromUSDA(
        'Test Allergen Food',
        100,
        'g',
        {
          calories: 200,
          protein: 10,
          carbs: 20,
          fat: 5,
          fiber: 3,
        },
        ['peanuts', 'tree nuts'],
        12345
      );

      const userAllergies = ['peanuts', 'shellfish', 'dairy'];
      const result = repo.checkAllergens(foodId, userAllergies);

      expect(result).toEqual(['peanuts']);
    });

    it('should return empty array when no allergens match', () => {
      const foodId = repo.createFoodFromUSDA(
        'Safe Food',
        100,
        'g',
        {
          calories: 150,
          protein: 8,
          carbs: 25,
          fat: 3,
          fiber: 2,
        },
        ['gluten'],
        12346
      );

      const userAllergies = ['peanuts', 'shellfish'];
      const result = repo.checkAllergens(foodId, userAllergies);

      expect(result).toEqual([]);
    });

    it('should return empty array for food with no allergens', () => {
      const foodId = repo.createFoodFromUSDA(
        'No Allergen Food',
        100,
        'g',
        {
          calories: 100,
          protein: 5,
          carbs: 20,
          fat: 1,
          fiber: 1,
        },
        undefined,
        12347
      );

      const userAllergies = ['peanuts'];
      const result = repo.checkAllergens(foodId, userAllergies);

      expect(result).toEqual([]);
    });

    it('should return empty array for non-existent food', () => {
      const result = repo.checkAllergens('non-existent', ['peanuts']);
      expect(result).toEqual([]);
    });
  });

  describe('createFoodFromUSDA', () => {
    it('should create food from USDA data', () => {
      const nutrition = {
        calories: 250,
        protein: 12,
        carbs: 30,
        fat: 8,
        fiber: 4,
        sugar: 5,
        sodium: 200,
        calcium: 100,
        iron: 2,
        potassium: 300,
        vitaminA: 50,
        vitaminC: 20,
        vitaminD: 10,
      };

      const allergens = ['soy', 'wheat'];
      const foodId = repo.createFoodFromUSDA(
        'USDA Test Food',
        100,
        'g',
        nutrition,
        allergens,
        99999,
        'Test Brand',
        'Test ingredients'
      );

      expect(typeof foodId).toBe('string');
      expect(foodId.length).toBeGreaterThan(0);

      // Verify food was created
      const createdFood = repo.getFoodById(foodId);
      expect(createdFood).toMatchObject({
        id: foodId,
        name: 'USDA Test Food',
        servingSize: 100,
        servingUnit: 'g',
        brand: 'Test Brand',
        ingredients: 'Test ingredients',
        usdaFdcId: 99999,
        allergens: ['soy', 'wheat'],
      });
      expect(createdFood?.nutritionPer100g).toEqual(nutrition);
    });

    it('should handle undefined allergens and optional fields', () => {
      const nutrition = {
        calories: 150,
        protein: 8,
        carbs: 25,
        fat: 3,
        fiber: 2,
      };

      const foodId = repo.createFoodFromUSDA('Simple Food', 50, 'g', nutrition, undefined, 88888);

      const createdFood = repo.getFoodById(foodId);
      expect(createdFood?.allergens).toBeUndefined();
      expect(createdFood?.brand).toBeNull();
      expect(createdFood?.ingredients).toBeNull();
    });
  });

  describe('getFoodByUSDAId', () => {
    it('should return food by USDA FDC ID', () => {
      // Create a USDA food
      const foodId = repo.createFoodFromUSDA(
        'USDA Food',
        100,
        'g',
        {
          calories: 200,
          protein: 10,
          carbs: 20,
          fat: 5,
          fiber: 3,
        },
        undefined,
        77777
      );

      const result = repo.getFoodByUSDAId('77777');
      expect(result?.id).toBe(foodId);
      expect(result?.usdaFdcId).toBe(77777);
    });

    it('should return null for non-existent USDA ID', () => {
      const result = repo.getFoodByUSDAId('999999');
      expect(result).toBeNull();
    });
  });

  describe('searchFoodsBySource', () => {
    beforeEach(() => {
      // Create foods with different sources
      repo.createFoodFromUSDA(
        'USDA Apple',
        100,
        'g',
        {
          calories: 52,
          protein: 0.2,
          carbs: 14,
          fat: 0.2,
          fiber: 2.4,
        },
        undefined,
        123456
      );

      // Insert a manual food directly
      db.prepare(
        `
        INSERT INTO foods (id, name, serving_size, serving_unit, calories, protein, carbs, fat, fiber, source, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
      ).run(
        'manual-food-1',
        'Manual Banana',
        100,
        'g',
        89,
        1.1,
        23,
        0.3,
        2.6,
        'manual',
        new Date().toISOString()
      );
    });

    it('should filter foods by source', () => {
      const usdaFoods = repo.searchFoodsBySource('apple', 'usda');
      const manualFoods = repo.searchFoodsBySource('banana', 'manual');
      const mockFoods = repo.searchFoodsBySource('nonexistent', 'mock');

      expect(usdaFoods.length).toBeGreaterThan(0);
      expect(usdaFoods[0].name).toBe('USDA Apple');

      expect(manualFoods.length).toBe(1);
      expect(manualFoods[0].name).toBe('Manual Banana');

      expect(mockFoods.length).toBe(0);
    });
  });

  describe('updateFoodFromUSDA', () => {
    it('should update existing food with new nutrition data', () => {
      // Create initial food
      const foodId = repo.createFoodFromUSDA(
        'Update Test Food',
        100,
        'g',
        {
          calories: 200,
          protein: 10,
          carbs: 20,
          fat: 5,
          fiber: 3,
        },
        ['old allergen'],
        55555
      );

      // Update with new data
      const newNutrition = {
        calories: 250,
        protein: 12,
        carbs: 25,
        fat: 6,
        fiber: 4,
        vitaminC: 50,
      };
      const newAllergens = ['new allergen'];

      repo.updateFoodFromUSDA(foodId, newNutrition, newAllergens);

      // Verify update
      const updatedFood = repo.getFoodById(foodId);
      expect(updatedFood?.nutritionPer100g.calories).toBe(250);
      expect(updatedFood?.nutritionPer100g.vitaminC).toBe(50);
      expect(updatedFood?.allergens).toEqual(['new allergen']);
    });
  });

  describe('getFoodAllergens and saveFoodAllergens', () => {
    it('should save and retrieve food allergens', () => {
      const foodId = repo.createFoodFromUSDA(
        'Allergen Test Food',
        100,
        'g',
        {
          calories: 100,
          protein: 5,
          carbs: 20,
          fat: 1,
          fiber: 1,
        },
        undefined,
        44444
      );

      const allergens = [
        {
          allergenType: 'peanuts',
          source: 'user_flagged' as const,
          confidenceLevel: 'high' as const,
          notes: 'User reported allergy',
        },
        {
          allergenType: 'soy',
          source: 'auto_detected' as const,
          confidenceLevel: 'medium' as const,
        },
      ];

      repo.saveFoodAllergens(foodId, allergens);

      const retrieved = repo.getFoodAllergens(foodId);
      expect(retrieved).toHaveLength(2);

      const peanutAllergen = retrieved.find((a) => a.allergenType === 'peanuts');
      expect(peanutAllergen).toMatchObject({
        foodId,
        allergenType: 'peanuts',
        source: 'user_flagged',
        confidenceLevel: 'high',
        notes: 'User reported allergy',
      });

      const soyAllergen = retrieved.find((a) => a.allergenType === 'soy');
      expect(soyAllergen).toMatchObject({
        foodId,
        allergenType: 'soy',
        source: 'auto_detected',
        confidenceLevel: 'medium',
      });
    });

    it('should return empty array for food with no allergens', () => {
      const foodId = repo.createFoodFromUSDA(
        'No Allergen Food',
        100,
        'g',
        {
          calories: 100,
          protein: 5,
          carbs: 20,
          fat: 1,
          fiber: 1,
        },
        undefined,
        33333
      );

      const retrieved = repo.getFoodAllergens(foodId);
      expect(retrieved).toEqual([]);
    });

    it('should replace existing allergens when saving', () => {
      const foodId = repo.createFoodFromUSDA(
        'Replace Test Food',
        100,
        'g',
        {
          calories: 100,
          protein: 5,
          carbs: 20,
          fat: 1,
          fiber: 1,
        },
        undefined,
        22222
      );

      // Save initial allergens
      repo.saveFoodAllergens(foodId, [{ allergenType: 'peanuts', source: 'user_flagged' }]);

      // Save different allergens (should replace)
      repo.saveFoodAllergens(foodId, [
        { allergenType: 'soy', source: 'auto_detected' },
        { allergenType: 'wheat', source: 'auto_detected' },
      ]);

      const retrieved = repo.getFoodAllergens(foodId);
      expect(retrieved).toHaveLength(2);
      expect(retrieved.map((a) => a.allergenType).sort()).toEqual(['soy', 'wheat']);
    });
  });
});
