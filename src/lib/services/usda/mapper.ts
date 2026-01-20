/**
 * USDA FoodData Central API response mapper
 * Transforms USDA API responses to our internal Food interface
 */

import type { Food, NutritionalValues } from '@/lib/types/health';
import type { USDAFoodItem } from './types';
import { NUTRIENT_ID_MAP, ALLERGEN_KEYWORDS } from './constants';

export class USDAMapper {
  /**
   * Convert USDA FoodItem to our Food interface
   */
  static toFood(usdaFood: USDAFoodItem): Food & { usdaFdcId: number } {
    const nutritionPer100g = this.extractNutritionPer100g(usdaFood);
    const allergens = this.extractAllergens(usdaFood);

    return {
      id: `usda-${usdaFood.fdcId}`, // Temporary ID, will be replaced when saved to DB
      name: this.cleanFoodName(usdaFood.description),
      servingSize: usdaFood.servingSize || 100,
      servingUnit: usdaFood.servingSizeUnit || 'g',
      nutritionPer100g,
      brand: usdaFood.brandName || usdaFood.brandOwner,
      ingredients: usdaFood.ingredients,
      allergens: allergens.length > 0 ? allergens : undefined,
      usdaFdcId: usdaFood.fdcId,
      rawUSDAData: usdaFood, // Include raw response for inspection
    };
  }

  /**
   * Extract and normalize nutrients to per-100g basis
   */
  private static extractNutritionPer100g(usdaFood: USDAFoodItem): NutritionalValues {
    const nutrition: NutritionalValues = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
    };

    // Get serving size for normalization (default to 100g if not provided)
    const servingSize = usdaFood.servingSize || 100;

    // Map USDA nutrients to our interface
    usdaFood.foodNutrients.forEach((nutrient) => {
      const propertyName = NUTRIENT_ID_MAP[nutrient.nutrientId];

      if (propertyName && nutrient.value !== null && nutrient.value !== undefined) {
        // Normalize to per-100g
        const normalizedValue = this.normalizeToPerHundredGram(nutrient.value, servingSize);

        // Round appropriately
        nutrition[propertyName] = this.roundNutrientValue(normalizedValue, String(propertyName));
      }
    });

    return nutrition;
  }

  /**
   * Normalize nutrient value to per-100g basis
   */
  private static normalizeToPerHundredGram(value: number, servingSize: number): number {
    if (servingSize === 100) return value;
    return (value / servingSize) * 100;
  }

  /**
   * Round nutrient values appropriately
   * - Calories: whole numbers
   * - Macros: 1 decimal place
   * - Micros: 2 decimal places
   */
  private static roundNutrientValue(value: number, nutrientKey: string): number {
    if (nutrientKey === 'calories') {
      return Math.round(value);
    } else if (['protein', 'carbs', 'fat', 'fiber', 'sugar', 'sodium'].includes(nutrientKey)) {
      return Math.round(value * 10) / 10; // 1 decimal
    } else {
      return Math.round(value * 100) / 100; // 2 decimals
    }
  }

  /**
   * Extract potential allergens from ingredients string
   * Note: USDA allergen data may be incomplete. This is a best-effort extraction.
   * [PHASE 4: External Allergen Database Integration]
   * Future: Integrate with FatSecret API or Open Food Facts for more accurate allergen data.
   */
  private static extractAllergens(usdaFood: USDAFoodItem): string[] {
    if (!usdaFood.ingredients) return [];

    const ingredientsLower = usdaFood.ingredients.toLowerCase();
    const foundAllergens = new Set<string>();

    // Check for allergen keywords in ingredients
    Object.entries(ALLERGEN_KEYWORDS).forEach(([allergen, keywords]) => {
      if (keywords.some((keyword) => ingredientsLower.includes(keyword))) {
        foundAllergens.add(allergen);
      }
    });

    return Array.from(foundAllergens);
  }

  /**
   * Clean up USDA food names (often ALL CAPS or awkwardly formatted)
   */
  private static cleanFoodName(description: string): string {
    // If all uppercase, convert to title case
    if (description === description.toUpperCase()) {
      return description
        .toLowerCase()
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }

    // Remove extra whitespace
    return description.replace(/\s+/g, ' ').trim();
  }

  /**
   * Validate that essential nutrients are present
   */
  static isValidFood(food: Food): boolean {
    const nutrition = food.nutritionPer100g;

    // Must have at least calories and one macronutrient
    return (
      nutrition.calories > 0 && (nutrition.protein > 0 || nutrition.carbs > 0 || nutrition.fat > 0)
    );
  }

  /**
   * Get a human-readable summary of micronutrients present
   */
  static getMicronutrientSummary(food: Food): string {
    const micros: string[] = [];
    const nutrition = food.nutritionPer100g;

    const micronutrients = [
      'vitaminA',
      'vitaminC',
      'vitaminD',
      'vitaminE',
      'vitaminK',
      'thiamin',
      'riboflavin',
      'niacin',
      'vitaminB6',
      'folate',
      'vitaminB12',
      'calcium',
      'iron',
      'magnesium',
      'potassium',
      'zinc',
      'selenium',
    ];

    micronutrients.forEach((key) => {
      if (nutrition[key] && nutrition[key]! > 0) {
        micros.push(key);
      }
    });

    if (micros.length === 0) return 'No micronutrient data';
    if (micros.length <= 3) return micros.join(', ');
    return `${micros.length} micronutrients`;
  }

  /**
   * [PHASE 4: Edge Case & Unique Foods Handling]
   * Future: Implement logic to detect and surface 'edge case' foods
   * (e.g. sugar alcohols, high-FODMAP, certified vegan/halal).
   */
}
