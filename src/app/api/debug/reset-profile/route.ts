import { NextResponse } from 'next/server';
import { ProfileRepository } from '@/lib/database/repositories/profileRepository';
import { CalorieGoalRepository } from '@/lib/database/repositories/calorieGoalRepository';
import { MealLogRepository } from '@/lib/database/repositories/mealLogRepository';
import { mockProfiles } from '@/lib/utils/mockProfileData';

export async function POST(request: Request) {
  try {
    const { profileType } = await request.json();

    if (!profileType || !['weight_loss', 'maintenance', 'weight_gain'].includes(profileType)) {
      return NextResponse.json(
        { error: 'Invalid profile type. Must be one of: weight_loss, maintenance, weight_gain' },
        { status: 400 }
      );
    }

    const mockProfile = mockProfiles[profileType as keyof typeof mockProfiles];
    const profileRepo = new ProfileRepository();
    const calorieGoalRepo = new CalorieGoalRepository();
    const mealLogRepo = new MealLogRepository();

    // Update or create profile
    const existingProfile = profileRepo.getProfile();
    const profileId = existingProfile?.id || mockProfile.profileData.id;

    // Update profile with mock data
    const db = require('@/lib/database/connection').getDatabase();
    const updateProfileStmt = db.prepare(`
      UPDATE profile SET
        age = ?,
        gender = ?,
        weight = ?,
        height = ?,
        activity_level = ?
      WHERE id = ?
    `);

    updateProfileStmt.run(
      mockProfile.profileData.age,
      mockProfile.profileData.gender,
      mockProfile.profileData.weight,
      mockProfile.profileData.height,
      mockProfile.profileData.activityLevel,
      profileId
    );

    // Archive existing calorie goal if any
    const existingGoal = calorieGoalRepo.getCurrentGoal(profileId);
    if (existingGoal) {
      calorieGoalRepo.archiveCurrentGoal(profileId);
    }

    // Create new calorie goal
    calorieGoalRepo.createGoal(
      profileId,
      mockProfile.goalData.goalType,
      mockProfile.goalData.weeklyCalorieTarget,
      mockProfile.goalData.activityLevel
    );

    // Clear existing meals for the date range and add mock meals
    const clearMealsStmt = db.prepare(`
      DELETE FROM meal_logs WHERE date >= date('now', '-7 days')
    `);
    clearMealsStmt.run();

    // Add mock meals
    for (const meal of mockProfile.mealData) {
      mealLogRepo.createMeal({
        date: meal.date,
        mealType: meal.mealType,
        name: meal.name,
        servingSize: '1 serving',
        unit: 'serving',
        totalNutrition: {
          calories: meal.calories,
          carbs: Math.round(meal.calories * 0.5 / 4), // 50% carbs
          protein: Math.round(meal.calories * 0.3 / 4), // 30% protein
          fat: Math.round(meal.calories * 0.2 / 9), // 20% fat
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Profile reset to ${profileType.replace('_', ' ')}`,
      profileType,
    });
  } catch (error: any) {
    console.error('Debug API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to reset profile' },
      { status: 500 }
    );
  }
}
