import { DailySummaryRepository } from '@/lib/database/repositories/dailySummaryRepository';
import { ProfileRepository } from '@/lib/database/repositories/profileRepository';
import { MealLogRepository } from '@/lib/database/repositories/mealLogRepository';
import { calculateHealthScore } from '@/lib/utils/healthScoring';

/**
 * Updates the daily summary for a given date after meals or supplements change.
 * This consolidates the duplicate logic that was scattered across multiple API routes.
 */
export async function updateDailySummaryForDate(date: string): Promise<void> {
  const summaryRepo = new DailySummaryRepository();
  const profileRepo = new ProfileRepository();
  const mealRepo = new MealLogRepository();

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
}
