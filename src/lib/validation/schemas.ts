import { z } from 'zod';

export const MealLogSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  foods: z
    .array(
      z.object({
        foodId: z.string().min(1),
        foodName: z.string().min(1),
        amount: z.number().positive().max(10000),
        unit: z.string(),
        foodData: z.any().optional(),
      })
    )
    .min(1, 'At least one food required'),
});

export const ProfileUpdateSchema = z.object({
  age: z.number().int().min(1).max(120).optional(),
  weight: z.number().positive().max(500).optional(),
  height: z.number().positive().max(300).optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']).optional(),
  allergies: z.array(z.string()).optional(),
});
