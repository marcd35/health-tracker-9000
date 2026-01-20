/**
 * Supplement database seed data for prepopulation
 * Contains common supplements with their nutrient profiles
 */

export interface SupplementDatabaseEntry {
  name: string;
  brand: string;
  servingSize: string;
  servingCount: number;
  nutrients: Record<string, number>;
  customNutrients: Record<string, number>;
  notes?: string;
}

export const SUPPLEMENT_DATABASE: SupplementDatabaseEntry[] = [
  // Fish Oil & Omega-3s
  {
    name: 'Fish Oil',
    brand: "Nature's Truth",
    servingSize: '2 softgels',
    servingCount: 250,
    nutrients: {},
    customNutrients: {
      epa: 336, // 56% of 600mg (midpoint of 45-67%)
      dha: 231, // 38.5% of 600mg (midpoint of 30-47%)
    },
    notes: '2000mg fish oil, 600mg omega-3s per serving',
  },
  {
    name: 'Fish Oil',
    brand: 'Nordic Naturals',
    servingSize: '2 softgels',
    servingCount: 180,
    nutrients: {},
    customNutrients: {
      epa: 325,
      dha: 225,
    },
    notes: '1560mg fish oil, 650mg omega-3s per serving',
  },
  {
    name: 'Fish Oil',
    brand: 'Carlson Labs',
    servingSize: '1 softgel',
    servingCount: 300,
    nutrients: {},
    customNutrients: {
      epa: 400,
      dha: 300,
    },
    notes: '1000mg fish oil, 700mg omega-3s per serving',
  },
  {
    name: 'Algae Oil',
    brand: 'Nordic Naturals',
    servingSize: '1 softgel',
    servingCount: 60,
    nutrients: {},
    customNutrients: {
      dha: 200,
      epa: 100,
    },
    notes: 'Vegan omega-3 source',
  },

  // Vitamin D
  {
    name: 'Vitamin D3',
    brand: "Nature's Way",
    servingSize: '1 softgel',
    servingCount: 100,
    nutrients: {
      vitaminD: 1000, // 1000 IU per softgel (should be converted to mcg but keeping IU for now)
    },
    customNutrients: {},
    notes: '1000 IU per softgel',
  },
  {
    name: 'Vitamin D3',
    brand: 'Nordic Naturals',
    servingSize: '1 softgel',
    servingCount: 60,
    nutrients: {
      vitaminD: 1000,
    },
    customNutrients: {},
    notes: '1000 IU per softgel',
  },

  // Multivitamins
  {
    name: "Men's Multivitamin",
    brand: 'One A Day',
    servingSize: '1 tablet',
    servingCount: 100,
    nutrients: {
      vitaminA: 750,
      vitaminC: 90,
      vitaminD: 25,
      vitaminE: 30,
      thiamin: 1.2,
      riboflavin: 1.3,
      niacin: 16,
      vitaminB6: 1.7,
      folate: 400,
      vitaminB12: 2.4,
      calcium: 162,
      iron: 8,
      magnesium: 80,
      zinc: 11,
    },
    customNutrients: {},
    notes: "Complete men's daily multivitamin",
  },
  {
    name: "Women's Multivitamin",
    brand: 'One A Day',
    servingSize: '1 tablet',
    servingCount: 100,
    nutrients: {
      vitaminA: 700,
      vitaminC: 75,
      vitaminD: 25,
      vitaminE: 15,
      thiamin: 1.1,
      riboflavin: 1.1,
      niacin: 14,
      vitaminB6: 1.5,
      folate: 400,
      vitaminB12: 2.4,
      calcium: 450,
      iron: 18,
      magnesium: 50,
      zinc: 8,
    },
    customNutrients: {},
    notes: "Complete women's daily multivitamin",
  },

  // CoQ10
  {
    name: 'CoQ10',
    brand: 'Nature Made',
    servingSize: '1 softgel',
    servingCount: 120,
    nutrients: {},
    customNutrients: {
      coq10: 100,
    },
    notes: '100mg ubiquinone per softgel',
  },

  // Probiotics
  {
    name: 'Probiotic Complex',
    brand: "Nature's Bounty",
    servingSize: '1 capsule',
    servingCount: 100,
    nutrients: {},
    customNutrients: {
      probiotics: 50000000, // 50 million CFU
    },
    notes: '50 million CFU per capsule',
  },
  {
    name: 'Probiotic Complex',
    brand: 'Culturelle',
    servingSize: '1 capsule',
    servingCount: 30,
    nutrients: {},
    customNutrients: {
      probiotics: 10000000, // 10 million CFU
    },
    notes: '10 million CFU (Lactobacillus GG)',
  },

  // Magnesium
  {
    name: 'Magnesium',
    brand: 'Nature Made',
    servingSize: '1 tablet',
    servingCount: 100,
    nutrients: {
      magnesium: 400,
    },
    customNutrients: {},
    notes: '400mg elemental magnesium',
  },

  // Calcium
  {
    name: 'Calcium Citrate',
    brand: 'Citracal',
    servingSize: '2 tablets',
    servingCount: 60,
    nutrients: {
      calcium: 500,
      vitaminD: 5,
    },
    customNutrients: {},
    notes: '500mg calcium citrate with Vitamin D',
  },

  // Iron
  {
    name: 'Iron',
    brand: 'Nature Made',
    servingSize: '1 tablet',
    servingCount: 100,
    nutrients: {
      iron: 18,
    },
    customNutrients: {},
    notes: '18mg ferrous sulfate',
  },

  // B-Complex
  {
    name: 'B-Complex',
    brand: 'Solgar',
    servingSize: '1 tablet',
    servingCount: 100,
    nutrients: {
      thiamin: 100,
      riboflavin: 100,
      niacin: 100,
      vitaminB6: 100,
      folate: 400,
      vitaminB12: 100,
      pantothenicAcid: 100,
      biotin: 100,
    },
    customNutrients: {},
    notes: 'Complete B-Complex vitamin',
  },

  // Vitamin C
  {
    name: 'Vitamin C',
    brand: 'Nature Made',
    servingSize: '1 tablet',
    servingCount: 100,
    nutrients: {
      vitaminC: 1000,
    },
    customNutrients: {},
    notes: '1000mg ascorbic acid',
  },

  // Zinc
  {
    name: 'Zinc',
    brand: 'Now Foods',
    servingSize: '1 tablet',
    servingCount: 100,
    nutrients: {
      zinc: 30,
    },
    customNutrients: {},
    notes: '30mg zinc gluconate',
  },

  // Vitamin E
  {
    name: 'Vitamin E',
    brand: 'Nature Made',
    servingSize: '1 softgel',
    servingCount: 100,
    nutrients: {
      vitaminE: 400,
    },
    customNutrients: {},
    notes: '400 IU mixed tocopherols',
  },

  // Curcumin/Turmeric
  {
    name: 'Turmeric Curcumin',
    brand: "Nature's Bounty",
    servingSize: '2 capsules',
    servingCount: 60,
    nutrients: {},
    customNutrients: {
      curcumin: 1000,
    },
    notes: '1000mg curcumin with black pepper extract',
  },

  // Ashwagandha
  {
    name: 'Ashwagandha',
    brand: 'Gaia Herbs',
    servingSize: '1 capsule',
    servingCount: 60,
    nutrients: {},
    customNutrients: {
      ashwagandha: 500,
    },
    notes: '500mg standardized extract',
  },

  // Rhodiola
  {
    name: 'Rhodiola',
    brand: "Nature's Way",
    servingSize: '1 capsule',
    servingCount: 60,
    nutrients: {},
    customNutrients: {
      rhodiola: 500,
    },
    notes: '500mg standardized extract',
  },

  // Ginkgo Biloba
  {
    name: 'Ginkgo Biloba',
    brand: 'Nature Made',
    servingSize: '1 tablet',
    servingCount: 100,
    nutrients: {},
    customNutrients: {
      ginkgo: 120,
    },
    notes: '120mg standardized extract',
  },
];
