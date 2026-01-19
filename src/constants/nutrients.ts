import type { NutrientInfo, NutrientKey, SupplementTemplate } from '@/lib/types/supplements';

// All 25 trackable nutrients with RDA defaults (adult male values)
export const NUTRIENTS: Record<NutrientKey, NutrientInfo> = {
  // Vitamins (13 essential)
  vitaminA: {
    key: 'vitaminA',
    name: 'Vitamin A',
    unit: 'mcg',
    rdaDefault: 900,
    category: 'vitamin',
  },
  vitaminD: {
    key: 'vitaminD',
    name: 'Vitamin D',
    unit: 'mcg',
    rdaDefault: 20,
    category: 'vitamin',
  },
  vitaminE: {
    key: 'vitaminE',
    name: 'Vitamin E',
    unit: 'mg',
    rdaDefault: 15,
    category: 'vitamin',
  },
  vitaminK: {
    key: 'vitaminK',
    name: 'Vitamin K',
    unit: 'mcg',
    rdaDefault: 120,
    category: 'vitamin',
  },
  vitaminC: {
    key: 'vitaminC',
    name: 'Vitamin C',
    unit: 'mg',
    rdaDefault: 90,
    category: 'vitamin',
  },
  thiamin: {
    key: 'thiamin',
    name: 'Thiamin (B1)',
    unit: 'mg',
    rdaDefault: 1.2,
    category: 'vitamin',
  },
  riboflavin: {
    key: 'riboflavin',
    name: 'Riboflavin (B2)',
    unit: 'mg',
    rdaDefault: 1.3,
    category: 'vitamin',
  },
  niacin: {
    key: 'niacin',
    name: 'Niacin (B3)',
    unit: 'mg',
    rdaDefault: 16,
    category: 'vitamin',
  },
  pantothenicAcid: {
    key: 'pantothenicAcid',
    name: 'Pantothenic Acid (B5)',
    unit: 'mg',
    rdaDefault: 5,
    category: 'vitamin',
  },
  vitaminB6: {
    key: 'vitaminB6',
    name: 'Vitamin B6',
    unit: 'mg',
    rdaDefault: 1.7,
    category: 'vitamin',
  },
  biotin: {
    key: 'biotin',
    name: 'Biotin (B7)',
    unit: 'mcg',
    rdaDefault: 30,
    category: 'vitamin',
  },
  folate: {
    key: 'folate',
    name: 'Folate (B9)',
    unit: 'mcg',
    rdaDefault: 400,
    category: 'vitamin',
  },
  vitaminB12: {
    key: 'vitaminB12',
    name: 'Vitamin B12',
    unit: 'mcg',
    rdaDefault: 2.4,
    category: 'vitamin',
  },

  // Minerals (12 - extended set)
  calcium: {
    key: 'calcium',
    name: 'Calcium',
    unit: 'mg',
    rdaDefault: 1300,
    category: 'mineral',
  },
  iron: {
    key: 'iron',
    name: 'Iron',
    unit: 'mg',
    rdaDefault: 18,
    category: 'mineral',
  },
  magnesium: {
    key: 'magnesium',
    name: 'Magnesium',
    unit: 'mg',
    rdaDefault: 420,
    category: 'mineral',
  },
  zinc: {
    key: 'zinc',
    name: 'Zinc',
    unit: 'mg',
    rdaDefault: 11,
    category: 'mineral',
  },
  potassium: {
    key: 'potassium',
    name: 'Potassium',
    unit: 'mg',
    rdaDefault: 4700,
    category: 'mineral',
  },
  selenium: {
    key: 'selenium',
    name: 'Selenium',
    unit: 'mcg',
    rdaDefault: 55,
    category: 'mineral',
  },
  copper: {
    key: 'copper',
    name: 'Copper',
    unit: 'mg',
    rdaDefault: 0.9,
    category: 'mineral',
  },
  manganese: {
    key: 'manganese',
    name: 'Manganese',
    unit: 'mg',
    rdaDefault: 2.3,
    category: 'mineral',
  },
  chromium: {
    key: 'chromium',
    name: 'Chromium',
    unit: 'mcg',
    rdaDefault: 35,
    category: 'mineral',
  },
  iodine: {
    key: 'iodine',
    name: 'Iodine',
    unit: 'mcg',
    rdaDefault: 150,
    category: 'mineral',
  },
  phosphorus: {
    key: 'phosphorus',
    name: 'Phosphorus',
    unit: 'mg',
    rdaDefault: 1250,
    category: 'mineral',
  },
  sodium: {
    key: 'sodium',
    name: 'Sodium',
    unit: 'mg',
    rdaDefault: 2300,
    category: 'mineral',
  },
  chloride: {
    key: 'chloride',
    name: 'Chloride',
    unit: 'mg',
    rdaDefault: 2300,
    category: 'mineral',
  },
  molybdenum: {
    key: 'molybdenum',
    name: 'Molybdenum',
    unit: 'mcg',
    rdaDefault: 45,
    category: 'mineral',
  },
};

// Get nutrients grouped by category
export const VITAMINS = Object.values(NUTRIENTS).filter((n) => n.category === 'vitamin');
export const MINERALS = Object.values(NUTRIENTS).filter((n) => n.category === 'mineral');

// All nutrient keys as an array
export const NUTRIENT_KEYS = Object.keys(NUTRIENTS) as NutrientKey[];

// Pre-built supplement templates
export const SUPPLEMENT_TEMPLATES: SupplementTemplate[] = [
  {
    id: 'template-multivitamin-men',
    name: 'Multivitamin (Men)',
    description: 'Complete daily multivitamin for adult men',
    defaultServingSize: '1 tablet',
    suggestedColor: '#6366f1',
    nutrients: {
      vitaminA: 900,
      vitaminC: 90,
      vitaminD: 25,
      vitaminE: 15,
      vitaminK: 80,
      thiamin: 1.2,
      riboflavin: 1.3,
      niacin: 16,
      vitaminB6: 1.7,
      folate: 400,
      vitaminB12: 2.4,
      calcium: 200,
      magnesium: 100,
      zinc: 11,
      selenium: 55,
    },
  },
  {
    id: 'template-multivitamin-women',
    name: 'Multivitamin (Women)',
    description: 'Complete daily multivitamin for adult women',
    defaultServingSize: '1 tablet',
    suggestedColor: '#ec4899',
    nutrients: {
      vitaminA: 700,
      vitaminC: 75,
      vitaminD: 25,
      vitaminE: 15,
      vitaminK: 90,
      thiamin: 1.1,
      riboflavin: 1.1,
      niacin: 14,
      vitaminB6: 1.5,
      folate: 400,
      vitaminB12: 2.4,
      calcium: 300,
      iron: 18,
      magnesium: 100,
      zinc: 8,
    },
  },
  {
    id: 'template-vitamin-d',
    name: 'Vitamin D3',
    description: 'High-dose vitamin D for immune and bone health',
    defaultServingSize: '1 softgel',
    suggestedColor: '#f59e0b',
    nutrients: {
      vitaminD: 50, // 2000 IU
    },
  },
  {
    id: 'template-vitamin-c',
    name: 'Vitamin C',
    description: 'Antioxidant and immune support',
    defaultServingSize: '1 tablet',
    suggestedColor: '#ef4444',
    nutrients: {
      vitaminC: 1000,
    },
  },
  {
    id: 'template-b-complex',
    name: 'B-Complex',
    description: 'All 8 B vitamins for energy metabolism',
    defaultServingSize: '1 capsule',
    suggestedColor: '#8b5cf6',
    nutrients: {
      thiamin: 100,
      riboflavin: 100,
      niacin: 100,
      pantothenicAcid: 100,
      vitaminB6: 50,
      biotin: 300,
      folate: 400,
      vitaminB12: 100,
    },
  },
  {
    id: 'template-magnesium',
    name: 'Magnesium Glycinate',
    description: 'Highly absorbable magnesium for sleep and muscle recovery',
    defaultServingSize: '2 capsules',
    suggestedColor: '#10b981',
    nutrients: {
      magnesium: 400,
    },
  },
  {
    id: 'template-zinc',
    name: 'Zinc',
    description: 'Immune support and wound healing',
    defaultServingSize: '1 tablet',
    suggestedColor: '#64748b',
    nutrients: {
      zinc: 30,
    },
  },
  {
    id: 'template-iron',
    name: 'Iron',
    description: 'For blood health and energy',
    defaultServingSize: '1 tablet',
    suggestedColor: '#dc2626',
    nutrients: {
      iron: 18,
    },
  },
  {
    id: 'template-calcium',
    name: 'Calcium + D3',
    description: 'Calcium with vitamin D for bone health',
    defaultServingSize: '2 tablets',
    suggestedColor: '#f5f5f5',
    nutrients: {
      calcium: 600,
      vitaminD: 25,
    },
  },
  {
    id: 'template-fish-oil',
    name: 'Fish Oil (Omega-3)',
    description: 'EPA/DHA for heart and brain health (nutrients not tracked)',
    defaultServingSize: '1 softgel',
    suggestedColor: '#3b82f6',
    nutrients: {},
  },
];

// Preset color palette for supplements
export const PRESET_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#eab308', // yellow
  '#84cc16', // lime
  '#22c55e', // green
  '#10b981', // emerald
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#0ea5e9', // sky
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#a855f7', // purple
  '#d946ef', // fuchsia
  '#ec4899', // pink
];

// Default color for new supplements
export const DEFAULT_SUPPLEMENT_COLOR = '#6366f1';
