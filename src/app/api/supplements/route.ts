import { NextResponse } from 'next/server';
import { SupplementRepository } from '@/lib/database/repositories/supplementRepository';
import { DailySummaryRepository } from '@/lib/database/repositories/dailySummaryRepository';
import { ProfileRepository } from '@/lib/database/repositories/profileRepository';
import { calculateHealthScore } from '@/lib/utils/healthScoring';
import { MealLogRepository } from '@/lib/database/repositories/mealLogRepository';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const repo = new SupplementRepository();

  try {
    if (date) {
      const logs = repo.getSupplementLogsByDate(date);
      return NextResponse.json(logs);
    } else {
      const supplements = repo.getAllSupplements();
      return NextResponse.json(supplements);
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supplementRepo = new SupplementRepository();
  const summaryRepo = new DailySummaryRepository();
  const mealRepo = new MealLogRepository();
  const profileRepo = new ProfileRepository();

  try {
    const body = await request.json();
    const { date, supplementId, supplementName, taken } = body;

    supplementRepo.logSupplementTaken({
      date,
      supplementId,
      supplementName,
      taken,
    });

    // Update daily summary
    const summary = await summaryRepo.getDailySummary(date);
    if (summary) {
      const targets = profileRepo.calculateNutritionalTargets();
      const meals = mealRepo.getMealLogsByDate(date);
      const supplements = supplementRepo.getSupplementLogsByDate(date);
      const dailyTotals = summaryRepo.calculateDailyTotals(meals, supplements);

      const scoreBreakdown = calculateHealthScore(dailyTotals, targets, {
        ...summary,
        meals,
        supplements,
        totalNutrition: dailyTotals,
      });

      summaryRepo.saveDailySummary({
        date,
        totalNutrition: dailyTotals,
        healthScore: scoreBreakdown.total,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
