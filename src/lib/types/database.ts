// Database row type definitions for type-safe SQLite operations

export interface MealLogRow {
  id: string;
  date: string;
  meal_type: string;
  foods: string; // JSON string
  total_nutrition: string; // JSON string
  created_at: string;
}

export interface SupplementRow {
  id: string;
  name: string;
  brand: string;
  serving_size: string;
  nutrients: string; // JSON string
  custom_nutrients: string; // JSON string
  notes: string | null;
  color: string;
  dosage_frequency: 'daily' | 'weekly';
  dosage_quantity: number;
  dosage_notes: string | null;
  supplement_type: 'nutrient' | 'custom';
  created_at: string;
}

export interface SupplementLogRow {
  id: string;
  date: string;
  supplement_id: string;
  supplement_name: string;
  taken: number; // 0 or 1
  taken_at: string | null;
  is_duplicate_warning: number; // 0 or 1
  created_at: string;
}

export interface DailySummaryRow {
  id?: string;
  date: string;
  weight: number | null;
  total_nutrition: string; // JSON string
  health_score: number;
  notes: string | null;
  created_at: string;
}

export interface DailyCalorieTrackingRow {
  id: string;
  date: string;
  profile_id: string;
  calories_consumed: number;
  calories_target: number;
  calories_deficit_surplus: number;
  goal_met: number; // 0 or 1
  weekly_total_consumed: number;
  weekly_total_target: number;
  weekly_average: number;
  on_pace_percentage: number;
  trend: string;
  created_at: string;
  updated_at: string;
}

export interface CalorieStreakRow {
  id: string;
  profile_id: string;
  streak_start_date: string;
  streak_end_date: string | null;
  days_count: number;
  goal_met_count: number;
  best_streak: number;
  created_at: string;
}

export interface CalorieGoalRow {
  id: string;
  profile_id: string;
  goal_type: 'weight_loss' | 'gain' | 'maintenance';
  daily_calorie_target: number;
  weekly_calorie_target: number;
  start_date: string;
  end_date: string | null;
  is_active: number; // 0 or 1
  created_at: string;
  updated_at: string;
}

export interface ProfileRow {
  id: string;
  age: number;
  weight: number;
  height: number;
  gender: 'male' | 'female' | 'other';
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  allergies: string; // JSON string
  created_at: string;
  updated_at: string;
}

export interface FoodRow {
  id: string;
  name: string;
  brand: string | null;
  serving_size: string;
  serving_unit: string;
  calories_per_serving: number;
  nutrition_per_100g: string; // JSON string
  allergens: string | null; // JSON string
  usda_fdc_id: string | null;
  source: string;
  ingredients: string | null;
  created_at: string;
}

export interface FoodAllergenRow {
  id: string;
  food_id: string;
  allergen_type: string;
  source: string;
  confidence_level: 'high' | 'medium' | 'low';
  created_at: string;
}

export interface MealFavoriteRow {
  id: string;
  name: string;
  description: string | null;
  foods: string; // JSON string
  total_nutrition: string; // JSON string
  created_at: string;
}

export interface WeightLogRow {
  id: string;
  date: string;
  weight: number;
  notes: string | null;
  created_at: string;
}

export interface SupplementNutrientTargetRow {
  id: string;
  nutrient_key: string;
  target_value: number;
  use_rda: number; // 0 or 1
  created_at: string;
  updated_at: string;
}

export interface CustomNutrientMetadataRow {
  id: string;
  nutrient_key: string;
  name: string;
  unit: string;
  category: string;
  user_defined_target: number | null;
  created_at: string;
  updated_at: string;
}
