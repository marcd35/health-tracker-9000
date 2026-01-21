import { NextResponse } from 'next/server';
import { MealLogRepository } from '@/lib/database/repositories/mealLogRepository';
import { FoodRepository } from '@/lib/database/repositories/foodRepository';
import { calculateNutrition, sumNutrition } from '@/lib/utils/nutrition';
import { DailySummaryRepository } from '@/lib/database/repositories/dailySummaryRepository';
import { ProfileRepository } from '@/lib/database/repositories/profileRepository';
import { CalorieTrackerRepository } from '@/lib/database/repositories/calorieTrackerRepository';
import { calculateHealthScore } from '@/lib/utils/healthScoring';
import { getDatabase } from '@/lib/database/connection';
import { withErrorHandling } from '@/lib/utils/errorHandler';
import { MealLogSchema } from '@/lib/validation/schemas';
import { ValidationError } from '@/lib/errors/ApiError';
import { flagConflicts } from '@/lib/utils/allergenChecker';

export async function POST(request: Request) {
  const mealRepo = new MealLogRepository();
  const foodRepo = new FoodRepository();
  const summaryRepo = new DailySummaryRepository();
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

    // Update daily summary
    const summary = await summaryRepo.getDailySummary(date);
    if (summary) {
      const targets = profileRepo.calculateNutritionalTargets();

      const meals = mealRepo.getMealLogsByDate(date);
      const dailyTotals = summaryRepo.calculateDailyTotals(meals, summary.supplements);

      const scoreBreakdown = calculateHealthScore(dailyTotals, targets, {
        ...summary,
        meals,
        totalNutrition: dailyTotals,
      });

      summaryRepo.saveDailySummary({
        date,
        totalNutrition: dailyTotals,
        healthScore: scoreBreakdown.total,
      });
    }

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
    const summaryRepo = new DailySummaryRepository();
    const profileRepo = new ProfileRepository();
    const calorieTrackerRepo = new CalorieTrackerRepository();

    // Get date before deleting to update summary
    const stmt = getDatabase().prepare('SELECT date FROM meal_logs WHERE id = ?');
    const row = stmt.get(id) as any;
    const date = row?.date;

    mealRepo.deleteMealLog(id);

    if (date) {
      const summary = await summaryRepo.getDailySummary(date);
      if (summary) {
        const targets = profileRepo.calculateNutritionalTargets();

        const meals = mealRepo.getMealLogsByDate(date);
        const dailyTotals = summaryRepo.calculateDailyTotals(meals, summary.supplements);

        const scoreBreakdown = calculateHealthScore(dailyTotals, targets, {
          ...summary,
          meals,
          totalNutrition: dailyTotals,
        });

        summaryRepo.saveDailySummary({
          date,
          totalNutrition: dailyTotals,
          healthScore: scoreBreakdown.total,
        });
      }

      // Update calorie tracking if user has a calorie goal
      const profile = profileRepo.getProfile();
      if (profile) {
        calorieTrackerRepo.updateDailyTracking(profile.id, date);
      }
    }

    return NextResponse.json({ success: true });
  }, 'DELETE /api/meals');
}
