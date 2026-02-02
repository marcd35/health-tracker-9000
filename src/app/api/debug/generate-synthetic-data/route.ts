import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database/connection';
import { ProfileRepository } from '@/lib/database/repositories/profileRepository';
import { CalorieGoalRepository } from '@/lib/database/repositories/calorieGoalRepository';
import { generateSyntheticData } from '@/lib/utils/syntheticData/generator';
import type { ProfileType } from '@/lib/utils/syntheticData/generator';

export async function POST(request: Request) {
  try {
    const {
      profileType,
      days = 30,
      wipeExistingData = false,
    } = (await request.json()) as {
      profileType?: ProfileType;
      days?: number;
      wipeExistingData?: boolean;
    };

    if (!profileType || !['weight_loss', 'maintenance', 'weight_gain'].includes(profileType)) {
      return NextResponse.json(
        { error: 'Invalid profile type. Must be one of: weight_loss, maintenance, weight_gain' },
        { status: 400 }
      );
    }

    // Generate synthetic data with realistic nutrition
    const syntheticData = generateSyntheticData(profileType, days);
    const { profile, goal, meals, dailyTrackings } = syntheticData;

    const profileRepo = new ProfileRepository();
    const calorieGoalRepo = new CalorieGoalRepository();
    const db = getDatabase();

    // Get existing profile or use synthetic profile id
    const existingProfile = profileRepo.getProfile();
    const profileId = existingProfile?.id || profile.id;

    // Wipe all existing data if requested
    if (wipeExistingData) {
      // Disable foreign key constraints for clean wipe
      db.prepare('PRAGMA foreign_keys = OFF').run();

      // Delete all meal logs
      db.prepare('DELETE FROM meal_logs').run();
      // Delete all daily tracking
      db.prepare('DELETE FROM daily_calorie_tracking').run();
      // Delete all calorie goals
      db.prepare('DELETE FROM calorie_goals').run();

      // Re-enable foreign key constraints
      db.prepare('PRAGMA foreign_keys = ON').run();

      // Archive existing calorie goal if any (for history)
      const existingGoal = calorieGoalRepo.getCurrentGoal(profileId);
      if (existingGoal) {
        calorieGoalRepo.archiveCurrentGoal(profileId);
      }
      // Reset profile with new values
      db.prepare(
        `
        UPDATE profile SET
          age = ?,
          gender = ?,
          weight = ?,
          height = ?,
          activity_level = ?
        WHERE id = ?
      `
      ).run(
        profile.age,
        profile.gender,
        profile.weight,
        profile.height,
        profile.activityLevel,
        profileId
      );
    } else {
      // Update existing profile with synthetic data
      db.prepare(
        `
        UPDATE profile SET
          age = ?,
          gender = ?,
          weight = ?,
          height = ?,
          activity_level = ?
        WHERE id = ?
      `
      ).run(
        profile.age,
        profile.gender,
        profile.weight,
        profile.height,
        profile.activityLevel,
        profileId
      );

      // Archive existing calorie goal if any
      const existingGoal = calorieGoalRepo.getCurrentGoal(profileId);
      if (existingGoal) {
        calorieGoalRepo.archiveCurrentGoal(profileId);
      }
    }

    // Create new calorie goal
    calorieGoalRepo.createGoal(
      profileId,
      goal.goalType,
      goal.weeklyCalorieTarget,
      goal.activityLevel
    );

    // Get the current goal to determine daily target
    const currentGoal = calorieGoalRepo.getCurrentGoal(profileId);
    if (!currentGoal) throw new Error('Failed to create calorie goal');

    // Clear existing meals and tracking for the past N days
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    const clearMealsStmt = db.prepare(`
      DELETE FROM meal_logs WHERE date >= ?
    `);
    clearMealsStmt.run(startDateStr);

    const clearTrackingStmt = db.prepare(`
      DELETE FROM daily_calorie_tracking WHERE date >= ?
    `);
    clearTrackingStmt.run(startDateStr);

    // Insert synthetic meal logs with realistic nutrition
    const insertMealLogStmt = db.prepare(`
      INSERT INTO meal_logs (
        id, date, meal_type, foods, total_nutrition, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const meal of meals) {
      insertMealLogStmt.run(
        meal.id,
        meal.date,
        meal.mealType,
        JSON.stringify(meal.foods),
        JSON.stringify(meal.totalNutrition),
        meal.createdAt
      );
    }

    // Create daily_calorie_tracking entries
    const insertDailyTrackingStmt = db.prepare(`
      INSERT INTO daily_calorie_tracking (
        id, date, profile_id, calories_consumed, calories_target,
        calories_deficit_surplus, goal_met, on_pace_percentage, trend, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const tracking of dailyTrackings) {
      const now = new Date().toISOString();
      insertDailyTrackingStmt.run(
        tracking.id,
        tracking.date,
        profileId,
        tracking.caloriesConsumed,
        tracking.caloriesTarget,
        tracking.calorieDeficitSurplus,
        tracking.goalMet ? 1 : 0,
        tracking.onPacePercentage,
        tracking.trend,
        now,
        now
      );
    }

    // Calculate summary statistics
    const daysMetGoal = dailyTrackings.filter((t) => t.goalMet).length;
    const avgCalories = Math.round(
      dailyTrackings.reduce((sum, t) => sum + t.caloriesConsumed, 0) / dailyTrackings.length
    );

    return NextResponse.json({
      success: true,
      message: `Generated ${days} days of realistic synthetic data for ${profileType.replace('_', ' ')}`,
      profileType,
      daysGenerated: days,
      summary: {
        totalMeals: meals.length,
        daysMetGoal,
        totalDays: dailyTrackings.length,
        averageCalories: avgCalories,
        dailyTarget: currentGoal.dailyCalorieTarget,
      },
      profile: {
        age: profile.age,
        gender: profile.gender,
        weight: profile.weight,
        height: profile.height,
        activityLevel: profile.activityLevel,
      },
      goal: {
        goalType: currentGoal.goalType,
        dailyTarget: currentGoal.dailyCalorieTarget,
        weeklyCalorieTarget: currentGoal.weeklyCalorieTarget,
      },
    });
  } catch (error: any) {
    console.error('Debug API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate synthetic data' },
      { status: 500 }
    );
  }
}
