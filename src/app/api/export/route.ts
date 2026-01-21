import { NextResponse } from 'next/server';
import { ProfileRepository } from '@/lib/database/repositories/profileRepository';
import { MealLogRepository } from '@/lib/database/repositories/mealLogRepository';
import { SupplementRepository } from '@/lib/database/repositories/supplementRepository';
import { CalorieTrackerRepository } from '@/lib/database/repositories/calorieTrackerRepository';
import { CalorieGoalRepository } from '@/lib/database/repositories/calorieGoalRepository';
import { DailySummaryRepository } from '@/lib/database/repositories/dailySummaryRepository';
import { MealFavoritesRepository } from '@/lib/database/repositories/mealFavoritesRepository';
import type { HealthTrackerExport } from '@/lib/types/export';

/**
 * GET /api/export - Export all user data as JSON
 */
export async function GET() {
  try {
    // Initialize repositories
    const profileRepo = new ProfileRepository();
    const mealRepo = new MealLogRepository();
    const supplementRepo = new SupplementRepository();
    const calorieTrackerRepo = new CalorieTrackerRepository();
    const calorieGoalRepo = new CalorieGoalRepository();
    const dailySummaryRepo = new DailySummaryRepository();
    const favoritesRepo = new MealFavoritesRepository();

    // Fetch profile data
    const profile = profileRepo.getProfile();
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Fetch all meal data
    const mealLogs = mealRepo.getAllMealLogs();
    const mealFavorites = favoritesRepo.getFavorites();

    // Fetch all supplement data
    const supplements = supplementRepo.getAllSupplements();
    const supplementLogs = supplementRepo.getAllSupplementLogs();
    const nutrientTargets = supplementRepo.getAllNutrientTargets();
    const customNutrients = supplementRepo.getAllCustomNutrients();

    // Fetch all calorie tracking data
    const allGoals = calorieGoalRepo.getAllGoals(profile.id);
    const currentGoal = calorieGoalRepo.getCurrentGoal(profile.id);
    const goalHistory = calorieGoalRepo.getAllGoalHistory(profile.id);
    const dailyTracking = calorieTrackerRepo.getAllDailyTracking(profile.id);
    const allStreaks = calorieTrackerRepo.getAllStreaks(profile.id);
    const currentStreak = calorieTrackerRepo.getCurrentStreak(profile.id);
    const streakInfo = calorieTrackerRepo.getStreakInfo(profile.id);

    // Fetch all daily summaries
    const dailySummaries = dailySummaryRepo.getAllDailySummaries();

    // Get nutritional targets
    const nutritionalTargets = profileRepo.calculateNutritionalTargets();

    // Get profile metadata
    const healthConditions = profile.healthConditions || [];
    const allergies = profile.allergies || [];

    // Build export object
    const exportData: HealthTrackerExport = {
      exportMetadata: {
        timestamp: new Date().toISOString(),
        version: '3.0.0',
        exportType: 'full_profile',
      },
      profileData: {
        profile,
        healthConditions,
        allergies,
        nutritionalTargets,
      },
      nutritionData: {
        meals: {
          mealLogs,
          mealFavorites: mealFavorites || [],
        },
        calories: {
          currentGoal,
          allGoals,
          goalHistory,
          dailyTracking,
          streakData: {
            currentStreak,
            allStreaks,
            streakInfo,
          },
        },
      },
      supplementData: {
        supplements,
        supplementLogs,
        nutrientTargets,
        customNutrients,
      },
      healthData: {
        dailySummaries,
      },
    };

    // Generate filename with timestamp
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toISOString().split('T')[1].split('.')[0].replace(/:/g, '');
    const filename = `health-tracker-export-${dateStr}-${timeStr}.json`;

    // Return JSON with proper headers
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      {
        error: 'Failed to export data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
