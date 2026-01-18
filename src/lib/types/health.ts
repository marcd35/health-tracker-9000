export interface UserProfile {
  id: string;
  age: number;
  weight: number; // kg
  height: number; // cm
  gender: 'male' | 'female' | 'other';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  healthConditions: string[]; // e.g., ['gout']
  allergies: string[]; // e.g., ['shellfish', 'peanuts']
  createdAt: string;
  updatedAt: string;
  targets?: NutritionalTargets;
}

export interface NutritionalTargets {
  calories: number;
  protein: number; // grams
  carbs: number;
  fat: number;
  fiber: number;
  // Vitamins (mg or mcg)
  vitaminA: number;
  vitaminC: number;
  vitaminD: number;
  vitaminE: number;
  vitaminK: number;
  // B vitamins
  thiamin: number;
  riboflavin: number;
  niacin: number;
  vitaminB6: number;
  folate: number;
  vitaminB12: number;
  // Minerals (mg or mcg)
  calcium: number;
  iron: number;
  magnesium: number;
  potassium: number;
  zinc: number;
  selenium: number;
}

export interface Food {
  id: string;
  name: string;
  servingSize: number; // grams
  servingUnit: string;
  nutritionPer100g: NutritionalValues;
  allergens?: string[];
}

export interface NutritionalValues {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  // All vitamins and minerals same as targets
  [key: string]: number | undefined;
}

export interface Supplement {
  id: string;
  name: string;
  brand: string;
  nutrients: Partial<NutritionalValues>;
  servingSize: string;
  notes?: string;
}

export interface MealLog {
  id: string;
  date: string; // ISO date
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: Array<{
    foodId: string;
    foodName: string;
    amount: number; // grams
  }>;
  totalNutrition: NutritionalValues;
  createdAt: string;
}

export interface SupplementLog {
  id: string;
  date: string;
  supplementId: string;
  supplementName: string;
  taken: boolean;
  createdAt: string;
}

import { HealthScoreBreakdown } from '../utils/healthScoring';

export interface DailyLog {
  date: string;
  weight?: number;
  meals: MealLog[];
  supplements: SupplementLog[];
  totalNutrition: NutritionalValues;
  healthScore: number;
  healthScoreBreakdown?: HealthScoreBreakdown;
  notes?: string;
}
