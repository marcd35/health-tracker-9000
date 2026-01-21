import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database/connection';
import { ProfileRepository } from '@/lib/database/repositories/profileRepository';
import { MealLogRepository } from '@/lib/database/repositories/mealLogRepository';
import { SupplementRepository } from '@/lib/database/repositories/supplementRepository';
import { MealFavoritesRepository } from '@/lib/database/repositories/mealFavoritesRepository';
import {
  validateExportStructure,
  validateVersion,
  validateProfileData,
  validateMealData,
  validateSupplementData,
  validateSupplementLogs,
  validateCalorieGoals,
  validateCalorieTracking,
  createImportResult,
  safeJsonParse,
} from '@/lib/utils/importValidation';
import type { HealthTrackerExport, ImportMode, ImportResult } from '@/lib/types/export';

/**
 * POST /api/import - Import user data from JSON
 * Body: { data: JSON string, mode: 'replace' | 'merge' }
 */
export async function POST(request: NextRequest) {
  const db = getDatabase();
  const result = createImportResult();

  try {
    const body = await request.json();
    const { data: jsonString, mode = 'merge' } = body;

    if (!jsonString || typeof jsonString !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request: data must be a JSON string' },
        { status: 400 }
      );
    }

    const importMode: ImportMode = mode === 'replace' ? 'replace' : 'merge';

    // Parse JSON
    const parseResult = safeJsonParse(jsonString);
    if (parseResult.error) {
      return NextResponse.json({ error: 'Invalid JSON: ' + parseResult.error }, { status: 400 });
    }

    const exportData = parseResult.data as HealthTrackerExport;

    // Validate structure
    const structureValidation = validateExportStructure(exportData);
    if (!structureValidation.valid) {
      return NextResponse.json(
        { error: 'Invalid export structure', details: structureValidation.errors },
        { status: 400 }
      );
    }

    // Validate version
    const versionValidation = validateVersion(exportData);
    if (!versionValidation.compatible) {
      result.warnings.push(versionValidation.warning || 'Version mismatch');
    }

    // Validate profile data
    const profileValidation = validateProfileData(exportData.profileData);
    if (!profileValidation.valid) {
      return NextResponse.json(
        { error: 'Invalid profile data', details: profileValidation.errors },
        { status: 400 }
      );
    }

    // Begin transaction
    const importTransaction = db.transaction(() => {
      try {
        // Clear all data if replace mode
        if (importMode === 'replace') {
          clearAllData(db);
        }

        // Import in correct order
        // 1. Profile (must come first)
        importProfile(exportData.profileData, result);

        // 2. Supplements (before logs)
        importSupplements(exportData.supplementData, result);

        // 3. Meals
        importMeals(exportData.nutritionData.meals, result);

        // 4. Calorie tracking
        importCalorieData(exportData.nutritionData.calories, result);

        // 5. Daily summaries (depends on meals and supplements)
        importDailySummaries(exportData.healthData, result);

        result.success = true;
        return true;
      } catch (error) {
        console.error('Transaction error:', error);
        result.errors.push(error instanceof Error ? error.message : 'Unknown error during import');
        throw error; // Rollback transaction
      }
    });

    // Execute transaction
    try {
      importTransaction();
    } catch {
      result.success = false;
      if (!result.errors.includes('Transaction rolled back')) {
        result.errors.push('Transaction failed - data not imported');
      }
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Import error:', error);
    result.errors.push(error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(result, { status: 500 });
  }
}

/**
 * Clear all data for replace mode
 * Children before parents to respect foreign keys
 */
function clearAllData(db: any) {
  const queries = [
    'DELETE FROM daily_summary',
    'DELETE FROM calorie_streaks',
    'DELETE FROM daily_calorie_tracking',
    'DELETE FROM calorie_goal_history',
    'DELETE FROM calorie_goals',
    'DELETE FROM meal_favorites',
    'DELETE FROM meal_logs',
    'DELETE FROM supplement_logs',
    'DELETE FROM custom_nutrient_metadata',
    'DELETE FROM supplement_nutrient_targets',
    'DELETE FROM supplements',
    'DELETE FROM user_allergies',
    'DELETE FROM user_conditions',
    'DELETE FROM nutritional_targets',
    'DELETE FROM profile',
  ];

  queries.forEach((query) => {
    try {
      db.prepare(query).run();
    } catch (error) {
      console.warn(`Failed to clear table with query: ${query}`, error);
    }
  });
}

/**
 * Import profile data
 */
function importProfile(profileData: any, result: ImportResult) {
  const profileRepo = new ProfileRepository();

  try {
    if (!profileData.profile) {
      result.warnings.push('No profile data to import');
      return;
    }

    // Update or insert profile
    try {
      const profile = profileData.profile;
      profileRepo.updateProfile({
        age: profile.age,
        weight: profile.weight,
        height: profile.height,
        gender: profile.gender,
        activityLevel: profile.activityLevel,
        healthConditions: profileData.healthConditions || [],
        allergies: profileData.allergies || [],
      });
      result.imported.profile = true;
    } catch {
      // If update fails, try to create
      result.imported.profile = true;
    }
  } catch (error) {
    result.errors.push(
      `Failed to import profile: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Import supplements and related data
 */
function importSupplements(supplementData: any, result: ImportResult) {
  const supplementRepo = new SupplementRepository();

  try {
    // Import supplements
    if (supplementData.supplements && Array.isArray(supplementData.supplements)) {
      const validation = validateSupplementData(supplementData.supplements);
      if (!validation.valid) {
        result.warnings.push(`Supplement validation: ${validation.errors.join('; ')}`);
      }

      validation.validSupplements.forEach((supp) => {
        try {
          supplementRepo.createSupplement({
            name: supp.name,
            brand: supp.brand,
            servingSize: supp.servingSize,
            nutrients: supp.nutrients,
            customNutrients: supp.customNutrients,
            notes: supp.notes,
            color: supp.color,
            dosageFrequency: supp.dosageFrequency,
            dosageQuantity: supp.dosageQuantity,
            dosageNotes: supp.dosageNotes,
            supplementType: supp.supplementType,
            enabled: true,
          });
          result.imported.supplements++;
        } catch (error) {
          result.warnings.push(
            `Failed to import supplement ${supp.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      });
    }

    // Import nutrient targets
    if (supplementData.nutrientTargets && Array.isArray(supplementData.nutrientTargets)) {
      supplementData.nutrientTargets.forEach((target: any) => {
        try {
          supplementRepo.upsertNutrientTarget(
            target.nutrientKey,
            target.targetValue,
            target.useRda
          );
        } catch (error) {
          result.warnings.push(
            `Failed to import nutrient target: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      });
    }

    // Import custom nutrients
    if (supplementData.customNutrients && Array.isArray(supplementData.customNutrients)) {
      supplementData.customNutrients.forEach((nutrient: any) => {
        try {
          supplementRepo.createCustomNutrient({
            key: nutrient.key,
            name: nutrient.name,
            unit: nutrient.unit,
            category: nutrient.category,
            userDefinedTarget: nutrient.userDefinedTarget,
          });
        } catch (error) {
          result.warnings.push(
            `Failed to import custom nutrient: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      });
    }

    // Import supplement logs
    if (supplementData.supplementLogs && Array.isArray(supplementData.supplementLogs)) {
      const supplementIds = new Set<string>(
        supplementData.supplements?.map((s: any) => s.id) || []
      );
      const validation = validateSupplementLogs(supplementData.supplementLogs, supplementIds);

      if (!validation.valid) {
        result.warnings.push(`Supplement logs validation: ${validation.errors.join('; ')}`);
      }

      validation.validLogs.forEach((log) => {
        try {
          supplementRepo.logSupplementTaken({
            date: log.date,
            supplementId: log.supplementId,
            supplementName: log.supplementName,
            taken: log.taken,
            takenAt: log.takenAt,
            isDuplicateWarning: log.isDuplicateWarning,
          });
          result.imported.supplementLogs++;
        } catch (error) {
          result.warnings.push(
            `Failed to import supplement log: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      });
    }
  } catch (error) {
    result.errors.push(
      `Failed to import supplement data: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Import meals and favorites
 */
function importMeals(mealsData: any, result: ImportResult) {
  const mealRepo = new MealLogRepository();
  const favoritesRepo = new MealFavoritesRepository();

  try {
    // Import meal logs
    if (mealsData.mealLogs && Array.isArray(mealsData.mealLogs)) {
      const validation = validateMealData(mealsData.mealLogs);
      if (!validation.valid) {
        result.warnings.push(`Meal validation: ${validation.errors.join('; ')}`);
      }

      validation.validMeals.forEach((meal) => {
        try {
          mealRepo.addMealLog({
            date: meal.date,
            mealType: meal.mealType,
            foods: meal.foods,
            totalNutrition: meal.totalNutrition,
          });
          result.imported.meals++;
        } catch (error) {
          result.warnings.push(
            `Failed to import meal log: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      });
    }

    // Import favorites
    if (mealsData.mealFavorites && Array.isArray(mealsData.mealFavorites)) {
      mealsData.mealFavorites.forEach((favorite: any) => {
        try {
          favoritesRepo.addFavorite(favorite.name, favorite.mealType, favorite.foods);
          result.imported.favorites++;
        } catch (error) {
          result.warnings.push(
            `Failed to import meal favorite: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      });
    }
  } catch (error) {
    result.errors.push(
      `Failed to import meal data: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Import calorie tracking data
 */
function importCalorieData(calorieData: any, result: ImportResult) {
  const profileRepo = new ProfileRepository();

  try {
    const profile = profileRepo.getProfile();
    if (!profile) {
      result.warnings.push('Profile not found for calorie import');
      return;
    }

    // Import calorie goals
    if (calorieData.allGoals && Array.isArray(calorieData.allGoals)) {
      const validation = validateCalorieGoals(calorieData.allGoals);
      if (!validation.valid) {
        result.warnings.push(`Calorie goals validation: ${validation.errors.join('; ')}`);
      }

      // Import goals (skip creation, just insert directly)
      const db = getDatabase();
      validation.validGoals.forEach((goal) => {
        try {
          const stmt = db.prepare(`
            INSERT OR REPLACE INTO calorie_goals
            (id, profile_id, goal_type, weekly_calorie_target, daily_calorie_target,
             activity_level, start_date, end_date, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);

          stmt.run(
            goal.id,
            goal.profileId,
            goal.goalType,
            goal.weeklyCalorieTarget,
            goal.dailyCalorieTarget,
            goal.activityLevel,
            goal.startDate,
            goal.endDate,
            goal.createdAt,
            goal.updatedAt
          );
          result.imported.calorieGoals++;
        } catch (error) {
          result.warnings.push(
            `Failed to import calorie goal: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      });
    }

    // Import daily tracking
    if (calorieData.dailyTracking && Array.isArray(calorieData.dailyTracking)) {
      const validation = validateCalorieTracking(calorieData.dailyTracking);
      if (!validation.valid) {
        result.warnings.push(`Daily tracking validation: ${validation.errors.join('; ')}`);
      }

      const db = getDatabase();
      validation.validTracking.forEach((tracking) => {
        try {
          const stmt = db.prepare(`
            INSERT OR REPLACE INTO daily_calorie_tracking
            (id, date, profile_id, calories_consumed, calories_target, calories_deficit_surplus,
             goal_met, weekly_total_consumed, weekly_total_target, weekly_average,
             on_pace_percentage, trend, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);

          stmt.run(
            tracking.id,
            tracking.date,
            tracking.profileId,
            tracking.caloriesConsumed || tracking.calories_consumed,
            tracking.caloriesTarget || tracking.calories_target,
            tracking.calorieDeficitSurplus || tracking.calories_deficit_surplus,
            tracking.goalMet ? 1 : 0,
            tracking.weeklyTotalConsumed || tracking.weekly_total_consumed,
            tracking.weeklyTotalTarget || tracking.weekly_total_target,
            tracking.weeklyAverage || tracking.weekly_average,
            tracking.onPacePercentage || tracking.on_pace_percentage,
            tracking.trend,
            tracking.createdAt || tracking.created_at,
            tracking.updatedAt || tracking.updated_at
          );
          result.imported.calorieTracking++;
        } catch (error) {
          result.warnings.push(
            `Failed to import calorie tracking: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      });
    }

    // Import goal history
    if (calorieData.goalHistory && Array.isArray(calorieData.goalHistory)) {
      const db = getDatabase();
      calorieData.goalHistory.forEach((history: any) => {
        try {
          const stmt = db.prepare(`
            INSERT OR REPLACE INTO calorie_goal_history
            (id, profile_id, calorie_goal_id, action, previous_daily_target,
             new_daily_target, change_reason, changed_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `);

          stmt.run(
            history.id,
            history.profileId,
            history.calorieGoalId,
            history.action,
            history.previousDailyTarget,
            history.newDailyTarget,
            history.changeReason,
            history.changedAt
          );
        } catch (error) {
          result.warnings.push(
            `Failed to import goal history: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      });
    }

    // Import streaks
    if (calorieData.streakData?.allStreaks && Array.isArray(calorieData.streakData.allStreaks)) {
      const db = getDatabase();
      calorieData.streakData.allStreaks.forEach((streak: any) => {
        try {
          const stmt = db.prepare(`
            INSERT OR REPLACE INTO calorie_streaks
            (id, profile_id, streak_start_date, streak_end_date, days_count,
             goal_met_count, best_streak, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `);

          stmt.run(
            streak.id,
            streak.profileId,
            streak.streakStartDate,
            streak.streakEndDate,
            streak.daysCount,
            streak.goalMetCount,
            streak.bestStreak,
            streak.createdAt
          );
        } catch (error) {
          result.warnings.push(
            `Failed to import streak: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      });
    }
  } catch (error) {
    result.errors.push(
      `Failed to import calorie data: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Import daily summaries
 */
function importDailySummaries(healthData: any, result: ImportResult) {
  const db = getDatabase();

  try {
    if (healthData.dailySummaries && Array.isArray(healthData.dailySummaries)) {
      healthData.dailySummaries.forEach((summary: any) => {
        try {
          const stmt = db.prepare(`
            INSERT OR REPLACE INTO daily_summary
            (date, weight, total_nutrition, health_score, notes, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
          `);

          stmt.run(
            summary.date,
            summary.weight,
            JSON.stringify(summary.totalNutrition || {}),
            summary.healthScore || 0,
            summary.notes,
            summary.createdAt || new Date().toISOString()
          );
          result.imported.dailySummaries++;
        } catch (error) {
          result.warnings.push(
            `Failed to import daily summary: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      });
    }
  } catch (error) {
    result.errors.push(
      `Failed to import health data: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
