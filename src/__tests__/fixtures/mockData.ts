import type { UserProfile, Food, MealLog, DailyLog, NutritionalTargets } from '@/lib/types/health';
import type { Supplement } from '@/lib/types/supplements';

/**
 * Mock data fixtures for testing
 * Provides consistent, realistic test data across all test suites
 */

// Mock User Profile
export const mockUserProfile: UserProfile = {
  id: 'test-user-id',
  age: 30,
  weight: 80,
  height: 180,
  gender: 'male',
  activityLevel: 'moderate',
  healthConditions: [],
  allergies: ['peanuts', 'shellfish'],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  targets: {
    calories: 2500,
    protein: 150,
    carbs: 300,
    fat: 83,
    fiber: 30,
    vitaminA: 900,
    vitaminC: 90,
    vitaminD: 20,
    vitaminE: 15,
    vitaminK: 120,
    thiamin: 1.2,
    riboflavin: 1.3,
    niacin: 16,
    vitaminB6: 1.7,
    folate: 400,
    vitaminB12: 2.4,
    calcium: 1000,
    iron: 18,
    magnesium: 400,
    potassium: 4700,
    zinc: 11,
    selenium: 55,
  },
};

// Mock Foods
export const mockFoods: Food[] = [
  {
    id: 'food-chicken-breast',
    name: 'Chicken Breast',
    servingSize: 100,
    servingUnit: 'g',
    nutritionPer100g: {
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6,
      fiber: 0,
    },
    allergens: [],
  },
  {
    id: 'food-brown-rice',
    name: 'Brown Rice',
    servingSize: 100,
    servingUnit: 'g',
    nutritionPer100g: {
      calories: 111,
      protein: 2.6,
      carbs: 23,
      fat: 0.9,
      fiber: 1.8,
    },
    allergens: [],
  },
  {
    id: 'food-broccoli',
    name: 'Broccoli',
    servingSize: 100,
    servingUnit: 'g',
    nutritionPer100g: {
      calories: 34,
      protein: 2.8,
      carbs: 7,
      fat: 0.4,
      fiber: 2.6,
    },
    allergens: [],
  },
  {
    id: 'food-peanut-butter',
    name: 'Peanut Butter',
    servingSize: 100,
    servingUnit: 'g',
    nutritionPer100g: {
      calories: 588,
      protein: 25,
      carbs: 20,
      fat: 50,
      fiber: 6,
    },
    allergens: ['peanuts'],
  },
  {
    id: 'food-salmon',
    name: 'Salmon',
    servingSize: 100,
    servingUnit: 'g',
    nutritionPer100g: {
      calories: 206,
      protein: 22,
      carbs: 0,
      fat: 13,
      fiber: 0,
    },
    allergens: ['fish'],
  },
];

// Mock Meal Logs
export const mockMealLogs: MealLog[] = [
  {
    id: 'meal-1',
    date: '2024-01-15',
    mealType: 'breakfast',
    foods: [
      {
        foodId: 'food-chicken-breast',
        foodName: 'Chicken Breast',
        amount: 100,
      },
    ],
    totalNutrition: {
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6,
      fiber: 0,
    },
    createdAt: '2024-01-15T08:00:00.000Z',
  },
  {
    id: 'meal-2',
    date: '2024-01-15',
    mealType: 'lunch',
    foods: [
      {
        foodId: 'food-brown-rice',
        foodName: 'Brown Rice',
        amount: 150,
      },
      {
        foodId: 'food-broccoli',
        foodName: 'Broccoli',
        amount: 200,
      },
    ],
    totalNutrition: {
      calories: 111 * 1.5 + 34 * 2,
      protein: 2.6 * 1.5 + 2.8 * 2,
      carbs: 23 * 1.5 + 7 * 2,
      fat: 0.9 * 1.5 + 0.4 * 2,
      fiber: 1.8 * 1.5 + 2.6 * 2,
    },
    createdAt: '2024-01-15T12:00:00.000Z',
  },
];

// Mock Supplements
export const mockSupplements: Supplement[] = [
  {
    id: 'supp-vitamin-d',
    name: 'Vitamin D3',
    brand: 'Generic',
    nutrients: { vitaminD: 25 },
    customNutrients: {},
    servingSize: '1 capsule',
    supplementType: 'nutrient',
    color: '#fbbf24',
    dosageFrequency: 'daily',
    dosageQuantity: 1,
    enabled: true,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'supp-omega-3',
    name: 'Omega-3 Fish Oil',
    brand: 'Generic',
    nutrients: {},
    customNutrients: { epa: 500, dha: 250 },
    servingSize: '2 softgels',
    supplementType: 'custom',
    color: '#06b6d4',
    dosageFrequency: 'daily',
    dosageQuantity: 2,
    enabled: true,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'supp-multivitamin',
    name: 'Multivitamin',
    brand: 'Generic',
    nutrients: {
      vitaminC: 60,
      vitaminD: 10,
      calcium: 200,
      iron: 8,
    },
    customNutrients: {},
    servingSize: '1 tablet',
    supplementType: 'nutrient',
    color: '#10b981',
    dosageFrequency: 'daily',
    dosageQuantity: 1,
    enabled: true,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
];

// Mock Daily Log
export const mockDailyLog: DailyLog = {
  date: '2024-01-15',
  meals: mockMealLogs,
  supplements: [],
  totalNutrition: {
    calories: 165 + 111 * 1.5 + 34 * 2,
    protein: 31 + 2.6 * 1.5 + 2.8 * 2,
    carbs: 0 + 23 * 1.5 + 7 * 2,
    fat: 3.6 + 0.9 * 1.5 + 0.4 * 2,
    fiber: 0 + 1.8 * 1.5 + 2.6 * 2,
  },
  healthScore: 85,
};

// Mock Nutrient Targets
export const mockNutrientTargets: NutritionalTargets = {
  calories: 2500,
  protein: 150,
  carbs: 300,
  fat: 83,
  fiber: 30,
  vitaminA: 900,
  vitaminC: 90,
  vitaminD: 20,
  vitaminE: 15,
  vitaminK: 120,
  thiamin: 1.2,
  riboflavin: 1.3,
  niacin: 16,
  vitaminB6: 1.7,
  folate: 400,
  vitaminB12: 2.4,
  calcium: 1000,
  iron: 18,
  magnesium: 400,
  potassium: 4700,
  zinc: 11,
  selenium: 55,
};

// Helper functions for test data generation
export function createMockMealLog(overrides: Partial<MealLog> = {}): MealLog {
  return {
    ...mockMealLogs[0],
    id: `meal-${Date.now()}`,
    ...overrides,
  };
}

export function createMockFood(overrides: Partial<Food> = {}): Food {
  return {
    ...mockFoods[0],
    id: `food-${Date.now()}`,
    ...overrides,
  };
}

export function createMockSupplement(overrides: Partial<Supplement> = {}): Supplement {
  return {
    ...mockSupplements[0],
    id: `supp-${Date.now()}`,
    ...overrides,
  };
}

// Test data for edge cases
export const edgeCaseData = {
  emptyMeal: {
    id: 'meal-empty',
    date: '2024-01-15',
    mealType: 'snack',
    foods: [],
    totalNutrition: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
    },
    createdAt: '2024-01-15T15:00:00.000Z',
  },
  highCalorieFood: {
    id: 'food-high-cal',
    name: 'High Calorie Food',
    servingSize: 100,
    servingUnit: 'g',
    nutritionPer100g: {
      calories: 10000,
      protein: 0,
      carbs: 0,
      fat: 1000,
      fiber: 0,
    },
    allergens: [],
  },
  allergenFood: {
    id: 'food-allergen',
    name: 'Peanut Butter',
    servingSize: 100,
    servingUnit: 'g',
    nutritionPer100g: {
      calories: 588,
      protein: 25,
      carbs: 20,
      fat: 50,
      fiber: 6,
    },
    allergens: ['peanuts'],
  },
};
