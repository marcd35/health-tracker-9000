import { NextResponse } from 'next/server';
import { MealLogRepository } from '@/lib/database/repositories/mealLogRepository';
import { FoodRepository } from '@/lib/database/repositories/foodRepository';
import { calculateNutrition, sumNutrition } from '@/lib/utils/nutrition';
import { ProfileRepository } from '@/lib/database/repositories/profileRepository';
import { CalorieTrackerRepository } from '@/lib/database/repositories/calorieTrackerRepository';
import { getDatabase } from '@/lib/database/connection';
import { withErrorHandling } from '@/lib/utils/errorHandler';
import { MealLogSchema } from '@/lib/validation/schemas';
import { ValidationError } from '@/lib/errors/ApiError';
import { flagConflicts } from '@/lib/utils/allergenChecker';
import { updateDailySummaryForDate } from '@/lib/utils/dailySummary';
import { z } from 'zod';

const PaginationSchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 100)),
  offset: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 0)),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export async function GET(request: Request) {
  const mealRepo = new MealLogRepository();
  const { searchParams } = new URL(request.url);

  return withErrorHandling(async () => {
    const params = PaginationSchema.parse({
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
    });

    const result = mealRepo.getAllMealLogs(
      params.startDate,
      params.endDate,
      params.limit,
      params.offset
    );

    return NextResponse.json({
      data: result.data,
      pagination: {
        total: result.total,
        limit: params.limit,
        offset: params.offset,
        hasMore: params.offset + params.limit < result.total,
      },
    });
  }, 'GET /api/meals');
}

export async function POST(request: Request) {
  const mealRepo = new MealLogRepository();
  const foodRepo = new FoodRepository();
  const profileRepo = new ProfileRepository();
  const calorieTrackerRepo = new CalorieTrackerRepository();

  return withErrorHandling(async () => {
    const body = await request.json();
    const validated = MealLogSchema.parse(body);
    const { date, mealType, foods } = validated;

    // Get user profile for allergen checking
    const profile = profileRepo.getProfile();
    if (!profile) {
      throw new ValidationError('User profile not found');
    }

    // Calculate nutrition and collect Food objects for allergen checking
    const foodObjects: any[] = [];
    const mealNutrients = foods.map((f) => {
      let food = foodRepo.getFoodById(f.foodId);

      // If food not found and it's a USDA food (ID starts with "usda-"),
      // it might be from search results - use the provided data
      if (!food && f.foodId.startsWith('usda-')) {
        console.log(`USDA food not in DB yet: ${f.foodName}, importing...`);
        // Persist to DB so it can be referenced next time
        const importedId = foodRepo.createFoodFromUSDA(
          f.foodData.name,
          f.foodData.servingSize,
          f.foodData.servingUnit,
          f.foodData.nutritionPer100g,
          f.foodData.allergens,
          f.foodData.usdaFdcId,
          f.foodData.brand,
          f.foodData.ingredients
        );

        // Save allergens if present
        if (f.foodData.allergens && f.foodData.allergens.length > 0) {
          foodRepo.saveFoodAllergens(
            importedId,
            f.foodData.allergens.map((a: string) => ({
              allergenType: a,
              source: 'user_flagged',
              confidenceLevel: 'high',
            }))
          );
        }

        food = foodRepo.getFoodById(importedId);
      }

      if (!food) throw new ValidationError(`Food not found: ${f.foodId}`);

      foodObjects.push(food);
      return calculateNutrition(food, f.amount);
    });

    // ENFORCE allergen checking server-side
    const allergenConflicts = flagConflicts(foodObjects, profile);
    if (allergenConflicts.length > 0) {
      throw new ValidationError('Allergen conflict detected', {
        conflicts: allergenConflicts,
        message: 'Cannot save meal with allergen conflicts. Please remove conflicting foods.',
      });
    }

    const totalNutrition = sumNutrition(mealNutrients);

    const newMeal = mealRepo.addMealLog({
      date,
      mealType,
      foods,
      totalNutrition,
    });

    // Update daily summary using utility function
    await updateDailySummaryForDate(date);

    // Update calorie tracking if user has a calorie goal
    if (profile) {
      calorieTrackerRepo.updateDailyTracking(profile.id, date);
    }

    return NextResponse.json(newMeal);
  }, 'POST /api/meals');
}

export async function DELETE(request: Request) {
  return withErrorHandling(async () => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      throw new ValidationError('ID required');
    }

    const mealRepo = new MealLogRepository();
    const profileRepo = new ProfileRepository();
    const calorieTrackerRepo = new CalorieTrackerRepository();

    // Get date before deleting to update summary
    const stmt = getDatabase().prepare('SELECT date FROM meal_logs WHERE id = ?');
    const row = stmt.get(id) as any;
    const date = row?.date;

    mealRepo.deleteMealLog(id);

    if (date) {
      // Update daily summary using utility function
      await updateDailySummaryForDate(date);

      // Update calorie tracking if user has a calorie goal
      const profile = profileRepo.getProfile();
      if (profile) {
        calorieTrackerRepo.updateDailyTracking(profile.id, date);
      }
    }

    return NextResponse.json({ success: true });
  }, 'DELETE /api/meals');
}
