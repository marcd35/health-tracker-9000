import { Food, UserProfile } from '@/lib/types/health';

export interface AllergenConflict {
  foodName: string;
  allergensFound: string[];
}

export function checkFoodForAllergens(food: Food, profile: UserProfile): AllergenConflict | null {
  // Extract allergens from food (mock schema has them, but let's assume they are stored in a specific place)
  // In our types/schema, allergens are on the food object or in the DB
  // For this utility, we'll assume the food object passed in contains the necessary info or we have access to it.

  const foodAllergens: string[] = food.allergens || [];

  const matches = foodAllergens.filter((a) => profile.allergies.includes(a));

  if (matches.length > 0) {
    return {
      foodName: food.name,
      allergensFound: matches,
    };
  }

  return null;
}

export function normalizeAllergen(allergen: string): string {
  return allergen.toLowerCase().trim();
}

export function flagConflicts(foods: Food[], profile: UserProfile): AllergenConflict[] {
  const normalizedUserAllergies = profile.allergies.map(normalizeAllergen);

  const conflicts: AllergenConflict[] = [];

  for (const food of foods) {
    const foodAllergens = (food.allergens || []).map(normalizeAllergen);
    const matches = foodAllergens.filter((a) => normalizedUserAllergies.includes(a));

    if (matches.length > 0) {
      conflicts.push({
        foodName: food.name,
        allergensFound: matches,
      });
    }
  }

  return conflicts;
}
