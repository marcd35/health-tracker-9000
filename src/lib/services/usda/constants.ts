/**
 * USDA FoodData Central nutrient ID mappings
 * Maps USDA nutrient IDs to our NutritionalValues interface properties
 */

import type { NutritionalValues } from '@/lib/types/health';

export const NUTRIENT_ID_MAP: Record<number, keyof NutritionalValues> = {
  // Macronutrients
  1008: 'calories', // Energy (kcal)
  1003: 'protein', // Protein (g)
  1005: 'carbs', // Carbohydrate, by difference (g)
  1004: 'fat', // Total lipid (fat) (g)
  1079: 'fiber', // Fiber, total dietary (g)

  // Vitamins
  1106: 'vitaminA', // Vitamin A, RAE (mcg)
  1162: 'vitaminC', // Vitamin C, total ascorbic acid (mg)
  1114: 'vitaminD', // Vitamin D (D2 + D3) (mcg)
  1109: 'vitaminE', // Vitamin E (alpha-tocopherol) (mg)
  1185: 'vitaminK', // Vitamin K (phylloquinone) (mcg)
  1165: 'thiamin', // Thiamin (Vitamin B1) (mg)
  1166: 'riboflavin', // Riboflavin (Vitamin B2) (mg)
  1167: 'niacin', // Niacin (Vitamin B3) (mg)
  1175: 'vitaminB6', // Vitamin B6 (mg)
  1177: 'folate', // Folate, total (mcg)
  1178: 'vitaminB12', // Vitamin B12 (mcg)

  // Minerals
  1087: 'calcium', // Calcium, Ca (mg)
  1089: 'iron', // Iron, Fe (mg)
  1090: 'magnesium', // Magnesium, Mg (mg)
  1092: 'potassium', // Potassium, K (mg)
  1095: 'zinc', // Zinc, Zn (mg)
  1103: 'selenium', // Selenium, Se (mcg)
};

/**
 * USDA API configuration
 */
export const USDA_CONFIG = {
  BASE_URL: process.env.USDA_API_BASE_URL || 'https://api.nal.usda.gov/fdc/v1',
  API_KEY: process.env.USDA_API_KEY || '',
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 50,
  REQUEST_TIMEOUT_MS: 25000, // 25 seconds
} as const;

/**
 * Common allergen keywords to search for in ingredients
 */
export const ALLERGEN_KEYWORDS: Record<string, string[]> = {
  milk: ['milk', 'dairy', 'lactose', 'whey', 'casein', 'cream', 'butter', 'cheese'],
  eggs: ['egg', 'albumin', 'mayonnaise'],
  fish: ['fish', 'anchovy', 'bass', 'cod', 'salmon', 'tuna', 'trout'],
  shellfish: [
    'shellfish',
    'crab',
    'lobster',
    'shrimp',
    'prawns',
    'crayfish',
    'clam',
    'mussel',
    'oyster',
    'scallop',
  ],
  'tree nuts': [
    'almond',
    'cashew',
    'walnut',
    'pecan',
    'pistachio',
    'macadamia',
    'hazelnut',
    'brazil nut',
  ],
  peanuts: ['peanut', 'groundnut'],
  wheat: ['wheat', 'flour', 'gluten'],
  soybeans: ['soy', 'soybean', 'tofu', 'edamame'],
};
