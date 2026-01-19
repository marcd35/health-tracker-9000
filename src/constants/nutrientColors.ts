/**
 * Global nutrient color mapping for consistent visualization across the app.
 * Colors are deterministic and carefully chosen for visual distinction.
 */

export type NutrientKey =
  | 'vitaminA'
  | 'vitaminC'
  | 'vitaminD'
  | 'vitaminE'
  | 'vitaminK'
  | 'vitaminB1'
  | 'vitaminB2'
  | 'vitaminB3'
  | 'vitaminB6'
  | 'vitaminB9'
  | 'vitaminB12'
  | 'biotin'
  | 'pantothenicAcid'
  | 'calcium'
  | 'iron'
  | 'magnesium'
  | 'zinc'
  | 'selenium'
  | 'copper'
  | 'manganese'
  | 'chromium'
  | 'molybdenum'
  | 'iodine'
  | 'potassium'
  | 'phosphorus'
  | 'chloride';

/**
 * Global color mapping for all 25 tracked nutrients.
 * Vitamins use warm→cool spectrum, minerals use earth tones.
 */
export const NUTRIENT_COLORS: Record<NutrientKey, string> = {
  // Vitamins (13) - Warm to cool spectrum
  vitaminA: '#ef4444', // red-500
  vitaminC: '#f97316', // orange-500
  vitaminD: '#f59e0b', // amber-500
  vitaminE: '#eab308', // yellow-500
  vitaminK: '#84cc16', // lime-500
  vitaminB1: '#22c55e', // green-500
  vitaminB2: '#10b981', // emerald-500
  vitaminB3: '#14b8a6', // teal-500
  vitaminB6: '#06b6d4', // cyan-500
  vitaminB9: '#0ea5e9', // sky-500
  vitaminB12: '#3b82f6', // blue-500
  biotin: '#6366f1', // indigo-500
  pantothenicAcid: '#8b5cf6', // violet-500

  // Minerals (12) - Earth tones and cool colors
  calcium: '#f5f5f5', // neutral-100 (bone/white)
  iron: '#dc2626', // red-600 (blood)
  magnesium: '#71717a', // zinc-500 (gray)
  zinc: '#9ca3af', // gray-400
  selenium: '#d1d5db', // gray-300
  copper: '#b45309', // amber-700 (copper metal)
  manganese: '#78350f', // amber-900 (dark brown)
  chromium: '#c0c0c0', // silver
  molybdenum: '#475569', // slate-600
  iodine: '#7c3aed', // violet-600 (purple)
  potassium: '#be123c', // rose-700
  phosphorus: '#fb923c', // orange-400
  chloride: '#6b7280', // gray-500
};

/**
 * Helper function to get color for a nutrient key.
 * Returns a fallback color if the key is not found.
 */
export function getNutrientColor(nutrientKey: NutrientKey): string {
  return NUTRIENT_COLORS[nutrientKey] || '#64748b'; // slate-500 fallback
}

/**
 * Display names for nutrients (human-readable)
 */
export const NUTRIENT_DISPLAY_NAMES: Record<NutrientKey, string> = {
  vitaminA: 'Vitamin A',
  vitaminC: 'Vitamin C',
  vitaminD: 'Vitamin D',
  vitaminE: 'Vitamin E',
  vitaminK: 'Vitamin K',
  vitaminB1: 'Vitamin B1 (Thiamin)',
  vitaminB2: 'Vitamin B2 (Riboflavin)',
  vitaminB3: 'Vitamin B3 (Niacin)',
  vitaminB6: 'Vitamin B6',
  vitaminB9: 'Vitamin B9 (Folate)',
  vitaminB12: 'Vitamin B12',
  biotin: 'Biotin',
  pantothenicAcid: 'Pantothenic Acid',
  calcium: 'Calcium',
  iron: 'Iron',
  magnesium: 'Magnesium',
  zinc: 'Zinc',
  selenium: 'Selenium',
  copper: 'Copper',
  manganese: 'Manganese',
  chromium: 'Chromium',
  molybdenum: 'Molybdenum',
  iodine: 'Iodine',
  potassium: 'Potassium',
  phosphorus: 'Phosphorus',
  chloride: 'Chloride',
};
