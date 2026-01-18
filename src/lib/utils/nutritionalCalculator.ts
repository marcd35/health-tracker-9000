import { UserProfile, NutritionalTargets } from '@/lib/types/health';

export function calculateBMR(profile: UserProfile): number {
  if (profile.gender === 'male') {
    return 88.362 + 13.397 * profile.weight + 4.799 * profile.height - 5.677 * profile.age;
  } else {
    return 447.593 + 9.247 * profile.weight + 3.098 * profile.height - 4.33 * profile.age;
  }
}

export function calculateTDEE(profile: UserProfile): number {
  const bmr = calculateBMR(profile);
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  return Math.round(bmr * multipliers[profile.activityLevel]);
}

export function calculateNutritionalTargets(profile: UserProfile): NutritionalTargets {
  const tdee = calculateTDEE(profile);

  // Simple Macro Split (40/30/30 or custom)
  // Protein: 1.6g per kg of body weight is a good standard for active individuals
  const protein = Math.round(profile.weight * 1.6);
  // Fat: 25% of total calories
  const fat = Math.round((tdee * 0.25) / 9);
  // Carbs: Remaining calories
  const carbs = Math.round((tdee - protein * 4 - fat * 9) / 4);

  return {
    calories: tdee,
    protein,
    carbs,
    fat,
    fiber: 30, // Default RDA
    vitaminA: 900,
    vitaminC: 90,
    vitaminD: 20,
    vitaminE: 15,
    vitaminK: 120,
    thiamin: 1.2,
    riboflavin: 1.3,
    niacin: 16,
    vitaminB6: 1.3,
    folate: 400,
    vitaminB12: 2.4,
    calcium: 1000,
    iron: 8,
    magnesium: 400,
    potassium: 4700,
    zinc: 11,
    selenium: 55,
  };
}
