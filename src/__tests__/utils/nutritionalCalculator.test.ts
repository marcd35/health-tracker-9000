import {
  calculateBMR,
  calculateTDEE,
  calculateNutritionalTargets,
} from '@/lib/utils/nutritionalCalculator';
import { UserProfile } from '@/lib/types/health';

describe('Nutritional Calculator', () => {
  const mockMaleProfile: UserProfile = {
    id: '1',
    age: 30,
    gender: 'male',
    height: 180, // cm
    weight: 80, // kg
    activityLevel: 'moderate',
    healthConditions: [],
    allergies: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockFemaleProfile: UserProfile = {
    ...mockMaleProfile,
    gender: 'female',
    weight: 60,
    height: 165,
  };

  describe('calculateBMR', () => {
    it('calculates BMR correctly for males', () => {
      // BMR = 88.362 + 13.397*80 + 4.799*180 - 5.677*30
      // 88.362 + 1071.76 + 863.82 - 170.31 = 1853.632
      const bmr = calculateBMR(mockMaleProfile);
      expect(bmr).toBeCloseTo(1853.632, 1);
    });

    it('calculates BMR correctly for females', () => {
      // BMR = 447.593 + 9.247*60 + 3.098*165 - 4.33*30
      // 447.593 + 554.82 + 511.17 - 129.9 = 1383.683
      const bmr = calculateBMR(mockFemaleProfile);
      expect(bmr).toBeCloseTo(1383.683, 1);
    });
  });

  describe('calculateTDEE', () => {
    it('calculates TDEE correctly for moderate activity', () => {
      // 1853.632 * 1.55 = 2873.1296
      const tdee = calculateTDEE(mockMaleProfile);
      expect(tdee).toBe(Math.round(2873.1296));
    });

    it('calculates TDEE correctly for sedentary activity', () => {
      const sedentaryProfile: UserProfile = { ...mockMaleProfile, activityLevel: 'sedentary' };
      // 1853.632 * 1.2 = 2224.3584
      const tdee = calculateTDEE(sedentaryProfile);
      expect(tdee).toBe(Math.round(2224.3584));
    });
  });

  describe('calculateNutritionalTargets', () => {
    it('calculates macro splits correctly', () => {
      const targets = calculateNutritionalTargets(mockMaleProfile);

      // Protein: 80 * 1.6 = 128
      expect(targets.protein).toBe(128);

      // TDEE ≈ 2873
      // Fat: (2873 * 0.25) / 9 ≈ 79.8 -> 80
      expect(targets.fat).toBeCloseTo(80, -1); // Allow slight rounding diffs

      // Carbs: (2873 - 128*4 - 80*9) / 4
      // (2873 - 512 - 720) / 4 = 1641 / 4 = 410.25 -> 410
      expect(targets.carbs).toBeCloseTo(410, -1);
    });
  });
});
