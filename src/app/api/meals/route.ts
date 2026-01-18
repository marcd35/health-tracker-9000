import { NextResponse } from 'next/server';
import { MealLogRepository } from '@/lib/database/repositories/mealLogRepository';
import { FoodRepository } from '@/lib/database/repositories/foodRepository';
import { calculateNutrition, sumNutrition } from '@/lib/utils/nutrition';
import { DailySummaryRepository } from '@/lib/database/repositories/dailySummaryRepository';
import { ProfileRepository } from '@/lib/database/repositories/profileRepository';
import { calculateHealthScore } from '@/lib/utils/healthScoring';
import { getDatabase } from '@/lib/database/connection';

export async function POST(request: Request) {
  const mealRepo = new MealLogRepository();
  const foodRepo = new FoodRepository();
  const summaryRepo = new DailySummaryRepository();

  try {
    const body = await request.json();
    const { date, mealType, foods } = body;

    // Calculate nutrition for each food in the meal
    const mealNutrients = foods.map((f: any) => {
      const food = foodRepo.getFoodById(f.foodId);
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
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
