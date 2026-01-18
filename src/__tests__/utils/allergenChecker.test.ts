import { checkFoodForAllergens, flagConflicts } from '@/lib/utils/allergenChecker';
import { Food, UserProfile } from '@/lib/types/health';

describe('Allergen Checker', () => {
  const mockProfile: UserProfile = {
    id: '1',
    age: 25,
    gender: 'female',
    height: 165,
    weight: 60,
    activityLevel: 'active',
    healthConditions: [],
    allergies: ['Peanuts', 'Dairy'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const safeFood: Food = {
    id: '1',
    name: 'Apple',
    servingSize: 1,
    servingUnit: 'fruit',
    nutritionPer100g: {
      calories: 95,
      protein: 0.5,
      carbs: 25,
      fat: 0.3,
      fiber: 2.4,
    },
    allergens: [],
  };

  const unsafeFood: Food = {
    ...safeFood,
    name: 'Peanut Butter Sandwich',
    allergens: ['Peanuts', 'Gluten', 'Wheat'],
  };

  describe('checkFoodForAllergens', () => {
    it('returns null for safe food', () => {
      const result = checkFoodForAllergens(safeFood, mockProfile);
      expect(result).toBeNull();
    });

    it('returns conflict for unsafe food', () => {
      const result = checkFoodForAllergens(unsafeFood, mockProfile);
      expect(result).not.toBeNull();
      expect(result?.foodName).toBe('Peanut Butter Sandwich');
      expect(result?.allergensFound).toContain('Peanuts');
      expect(result?.allergensFound).not.toContain('Dairy'); // Only Peanuts in this food
    });
  });

  describe('flagConflicts', () => {
    it('identifies all conflicts in a list of foods', () => {
      const foods = [safeFood, unsafeFood];
      const conflicts = flagConflicts(foods, mockProfile);

      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].foodName).toBe('Peanut Butter Sandwich');
    });

    it('returns empty array if no conflicts', () => {
      const foods = [safeFood, safeFood];
      const conflicts = flagConflicts(foods, mockProfile);

      expect(conflicts).toHaveLength(0);
    });
  });
});
