import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '@/lib/database/connection';
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
    const db = getDatabase();
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

    // Get the current goal to determine daily target
    const currentGoal = calorieGoalRepo.getCurrentGoal(profileId);
    if (!currentGoal) throw new Error('Failed to create calorie goal');

    // Clear existing meals and tracking for the past 30 days
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    const clearMealsStmt = db.prepare(`
      DELETE FROM meal_logs WHERE date >= ?
    `);
    clearMealsStmt.run(thirtyDaysAgoStr);

    const clearTrackingStmt = db.prepare(`
      DELETE FROM daily_calorie_tracking WHERE date >= ?
    `);
    clearTrackingStmt.run(thirtyDaysAgoStr);

    // Group meals by date and add meal logs
    const mealsByDate = new Map<string, Array<{
      mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
      name: string;
      calories: number;
    }>>();

    for (const meal of mockProfile.mealData) {
      const mealType = (meal.mealType === 'snacks' ? 'snack' : meal.mealType) as 'breakfast' | 'lunch' | 'dinner' | 'snack';
      if (!mealsByDate.has(meal.date)) {
        mealsByDate.set(meal.date, []);
      }
      mealsByDate.get(meal.date)!.push({
        mealType,
        name: meal.name,
        calories: meal.calories,
      });

      // Add individual meal log
      mealLogRepo.addMealLog({
        date: meal.date,
        mealType: mealType,
        foods: [
          {
            foodId: uuidv4(),
            foodName: meal.name,
            amount: 100,
          },
        ],
        totalNutrition: {
          calories: meal.calories,
          carbs: Math.round(meal.calories * 0.5 / 4), // 50% carbs
          protein: Math.round(meal.calories * 0.3 / 4), // 30% protein
          fat: Math.round(meal.calories * 0.2 / 9), // 20% fat
        },
      });
    }

    // Create daily_calorie_tracking entries
    const insertDailyTrackingStmt = db.prepare(`
      INSERT INTO daily_calorie_tracking (
        id, date, profile_id, calories_consumed, calories_target,
        calorie_deficit_surplus, goal_met, trend, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Determine goal met logic based on goal type
    const getGoalMet = (consumed: number, target: number, goalType: string): boolean => {
      if (goalType === 'weight_loss') {
        return consumed <= target;
      } else if (goalType === 'gain') {
        return consumed >= target;
      } else {
        // maintenance: within ±50 calories
        return Math.abs(consumed - target) <= 50;
      }
    };

    for (const [date, meals] of mealsByDate.entries()) {
      const caloriesConsumed = meals.reduce((sum, m) => sum + m.calories, 0);
      const caloriesTarget = currentGoal.dailyCalorieTarget;
      const deficitSurplus = caloriesConsumed - caloriesTarget;
      const goalMet = getGoalMet(caloriesConsumed, caloriesTarget, mockProfile.goalData.goalType);
      const now = new Date().toISOString();

      insertDailyTrackingStmt.run(
        uuidv4(),
        date,
        profileId,
        caloriesConsumed,
        caloriesTarget,
        deficitSurplus,
        goalMet ? 1 : 0,
        'stable', // Default trend
        now,
        now
      );
    }

    return NextResponse.json({
      success: true,
      message: `Profile reset to ${profileType.replace('_', ' ')} with 30 days of meal data (${mockProfile.mealData.length} meals)`,
      profileType,
      mealsLoaded: mockProfile.mealData.length,
    });
  } catch (error: any) {
    console.error('Debug API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to reset profile' },
      { status: 500 }
    );
  }
}
