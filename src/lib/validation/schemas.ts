import { z } from 'zod';

// Food item schema for meal logging
export const FoodItemSchema = z.object({
  foodId: z.string().min(1),
  foodName: z.string().min(1),
  amount: z.number().positive().max(10000),
  unit: z.string(),
  foodData: z.any().optional(),
});

// Meal logging schema
export const MealLogSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  foods: z.array(FoodItemSchema).min(1, 'At least one food required'),
});

// Meal update schema (foods required, mealType optional)
export const MealUpdateSchema = z.object({
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']).optional(),
  foods: z.array(FoodItemSchema).min(1, 'At least one food required'),
});

// Profile update schema
export const ProfileUpdateSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  age: z.number().int().min(1).max(120).optional(),
  weight: z.number().positive().max(500).optional(),
  height: z.number().positive().max(300).optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']).optional(),
  allergies: z.array(z.string()).optional(),
});

// Supplement creation schema
export const SupplementCreateSchema = z.object({
  name: z.string().min(1).max(100),
  brand: z.string().min(1).max(100),
  servingSize: z.string().min(1).max(50),
  nutrients: z.record(z.string(), z.number().min(0)).optional(),
  customNutrients: z.record(z.string(), z.number().min(0)).optional(),
  notes: z.string().max(500).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i)
    .optional()
    .default('#6366f1'),
  dosageFrequency: z.enum(['daily', 'weekly']).optional().default('daily'),
  dosageQuantity: z.number().int().min(1).max(10).optional().default(1),
  dosageNotes: z.string().max(200).optional(),
  supplementType: z.enum(['nutrient', 'custom']).optional().default('nutrient'),
});

// Supplement update schema
export const SupplementUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  brand: z.string().min(1).max(100).optional(),
  servingSize: z.string().min(1).max(50).optional(),
  nutrients: z.record(z.string(), z.number().min(0)).optional(),
  customNutrients: z.record(z.string(), z.number().min(0)).optional(),
  notes: z.string().max(500).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i)
    .optional(),
  dosageFrequency: z.enum(['daily', 'weekly']).optional(),
  dosageQuantity: z.number().int().min(1).max(10).optional(),
  dosageNotes: z.string().max(200).optional(),
  supplementType: z.string().optional(),
});

// Supplement logging schema
export const SupplementLogSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  supplementId: z.string().min(1),
  supplementName: z.string().min(1),
  taken: z.boolean(),
  takenAt: z.string().datetime().optional(),
  isDuplicateWarning: z.boolean().optional().default(false),
});

// Weight logging schema
export const WeightLogSchema = z.object({
  weight: z.number().positive().max(500),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  notes: z.string().max(500).optional(),
});

// Calorie goal creation schema
export const CalorieGoalCreateSchema = z.object({
  goalType: z.enum(['weight_loss', 'maintenance', 'gain']),
  weeklyCalorieTarget: z.number().int().min(5000).max(25000),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
});

// Food search schema
export const FoodSearchSchema = z.object({
  query: z.string().min(1).max(100),
  limit: z.number().int().min(1).max(50).optional().default(20),
});

// USDA food import schema
export const USDAFoodImportSchema = z.object({
  fdcId: z.number().int().positive(),
  name: z.string().min(1),
  servingSize: z.number().positive(),
  servingUnit: z.string(),
  nutritionPer100g: z.record(z.string(), z.number().min(0)),
  allergens: z.array(z.string()).optional(),
  brand: z.string().optional(),
  ingredients: z.string().optional(),
});

// Meal favorites schema
export const MealFavoriteSchema = z.object({
  name: z.string().min(1).max(100),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  foods: z.array(FoodItemSchema).min(1, 'At least one food required'),
});

// Supplement targets schema
export const SupplementTargetSchema = z.object({
  nutrient_key: z.string().min(1),
  target_value: z.number().min(0),
  use_rda: z.number().int().min(0).max(1).optional().default(1),
});

// Export/Import schemas
export const ExportRequestSchema = z.object({
  includeMeals: z.boolean().optional().default(true),
  includeSupplements: z.boolean().optional().default(true),
  includeWeights: z.boolean().optional().default(true),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export const ImportDataSchema = z.object({
  meals: z
    .array(
      z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
        foods: z.array(FoodItemSchema),
      })
    )
    .optional(),
  supplements: z
    .array(
      z.object({
        name: z.string(),
        brand: z.string(),
        servingSize: z.string(),
        nutrients: z.record(z.string(), z.number()),
      })
    )
    .optional(),
  weightLogs: z
    .array(
      z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        weight: z.number().positive(),
        notes: z.string().optional(),
      })
    )
    .optional(),
});
