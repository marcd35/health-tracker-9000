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

export function flagConflicts(foods: Food[], profile: UserProfile): AllergenConflict[] {
  return foods
    .map((f) => checkFoodForAllergens(f, profile))
    .filter((c): c is AllergenConflict => c !== null);
}
