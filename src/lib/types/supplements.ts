// Vitamin keys (13 essential vitamins)
export type VitaminKey =
  | 'vitaminA'
  | 'vitaminD'
  | 'vitaminE'
  | 'vitaminK'
  | 'vitaminC'
  | 'thiamin' // B1
  | 'riboflavin' // B2
  | 'niacin' // B3
  | 'pantothenicAcid' // B5
  | 'vitaminB6' // B6
  | 'biotin' // B7
  | 'folate' // B9
  | 'vitaminB12'; // B12

// Mineral keys (14 minerals - extended set)
export type MineralKey =
  | 'calcium'
  | 'iron'
  | 'magnesium'
  | 'zinc'
  | 'potassium'
  | 'selenium'
  | 'copper'
  | 'manganese'
  | 'chromium'
  | 'iodine'
  | 'phosphorus'
  | 'sodium'
  | 'chloride'
  | 'molybdenum';

// Combined nutrient key type
export type NutrientKey = VitaminKey | MineralKey;

// Nutrient metadata
export interface NutrientInfo {
  key: NutrientKey;
  name: string;
  unit: 'mg' | 'mcg' | 'IU';
  rdaDefault: number;
  category: 'vitamin' | 'mineral';
  warningLevel?: number; // Level to trigger warning (yellow)
  toxicLevel?: number; // Upper Limit (UL) - maximum safe intake
}

// Metadata for custom nutrients (user creates these)
export interface CustomNutrientMetadata {
  id: string;
  key: string; // e.g., "epa", "dha", "ala"
  name: string; // e.g., "EPA (Omega-3)"
  unit: string; // e.g., "mg"
  category: string; // e.g., "omega3", "probiotic"
  userDefinedTarget?: number; // Daily goal (optional)
  createdAt: string;
  updatedAt: string;
}

// Progress data for a custom nutrient
export interface CustomNutrientProgress {
  nutrientKey: string;
  name: string;
  unit: string;
  target: number | null; // null = no target set
  total: number; // Today's intake
  percentage: number; // 0 if no target
  contributions: NutrientContribution[];
}

// Dosage frequency options
export type DosageFrequency = 'daily' | 'weekly';

// Supplement type discriminator
export type SupplementType = 'nutrient' | 'custom';

// Main supplement interface
export interface Supplement {
  id: string;
  name: string;
  brand: string;
  servingSize: string;
  nutrients: Partial<Record<NutrientKey, number>>;
  customNutrients: Record<string, number>; // NEW: custom nutrients
  notes?: string;
  color: string;
  dosageFrequency: DosageFrequency;
  dosageQuantity: number;
  dosageNotes?: string;
  supplementType: SupplementType;
  createdAt: string;
}

// Supplement log entry (with timestamp)
export interface SupplementLog {
  id: string;
  date: string;
  supplementId: string;
  supplementName: string;
  taken: boolean;
  takenAt?: string; // ISO timestamp
  isDuplicateWarning?: boolean; // Flag for duplicate logs on same day
  createdAt: string;
}

// Custom nutrient target override
export interface SupplementNutrientTarget {
  id: string;
  nutrientKey: NutrientKey;
  targetValue: number;
  useRda: boolean;
  createdAt: string;
  updatedAt: string;
}

// Form data for creating/editing supplements
export interface SupplementFormData {
  name: string;
  brand: string;
  servingSize: string;
  color: string;
  dosageFrequency: DosageFrequency;
  dosageQuantity: number;
  dosageNotes: string;
  nutrients: Partial<Record<NutrientKey, number>>;
  customNutrients: Record<string, number>; // NEW: custom nutrients
  notes: string;
  supplementType: SupplementType;
}

// Pre-built supplement template
export interface SupplementTemplate {
  id: string;
  name: string;
  description: string;
  defaultBrand?: string;
  defaultServingSize: string;
  nutrients: Partial<Record<NutrientKey, number>>;
  suggestedColor: string;
  supplementType: SupplementType;
}

// Individual supplement contribution to a nutrient
export interface NutrientContribution {
  supplementId: string;
  supplementName: string;
  color: string;
  amount: number;
  percentage: number;
}

// Progress data for a single nutrient
export interface NutrientProgress {
  nutrientKey: NutrientKey;
  name: string;
  unit: string;
  target: number;
  total: number;
  percentage: number;
  contributions: NutrientContribution[];
}
