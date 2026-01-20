import { NextResponse } from 'next/server';
import { MealLogRepository } from '@/lib/database/repositories/mealLogRepository';
import { FoodRepository } from '@/lib/database/repositories/foodRepository';
import { calculateNutrition, sumNutrition } from '@/lib/utils/nutrition';
import { DailySummaryRepository } from '@/lib/database/repositories/dailySummaryRepository';
import { ProfileRepository } from '@/lib/database/repositories/profileRepository';
import { CalorieTrackerRepository } from '@/lib/database/repositories/calorieTrackerRepository';
import { calculateHealthScore } from '@/lib/utils/healthScoring';
import { getDatabase } from '@/lib/database/connection';

export async function POST(request: Request) {
  const mealRepo = new MealLogRepository();
  const foodRepo = new FoodRepository();
  const summaryRepo = new DailySummaryRepository();
  const profileRepo = new ProfileRepository();
  const calorieTrackerRepo = new CalorieTrackerRepository();

  try {
    const body = await request.json();
    const { date, mealType, foods } = body;

    // Calculate nutrition for each food in the meal
    // Handle USDA foods that might not be in database yet
    const mealNutrients = foods.map((f: any) => {
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
              confidenceLevel: 'high'
            }))
          );
        }

        food = foodRepo.getFoodById(importedId);
      }

      if (!food) throw new Error(`Food not found: ${f.foodId}`);
      return calculateNutrition(food, f.amount);
    });

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
      const profileRepo = new ProfileRepository();
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

    return NextResponse.json(newMeal);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

  const mealRepo = new MealLogRepository();
  const summaryRepo = new DailySummaryRepository();
  const profileRepo = new ProfileRepository();
  const calorieTrackerRepo = new CalorieTrackerRepository();

  try {
    // Get date before deleting to update summary
    const stmt = getDatabase().prepare('SELECT date FROM meal_logs WHERE id = ?');
    const row = stmt.get(id) as any;
    const date = row?.date;

    mealRepo.deleteMealLog(id);

    if (date) {
      const summary = await summaryRepo.getDailySummary(date);
      if (summary) {
        const profileRepo = new ProfileRepository();
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
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
