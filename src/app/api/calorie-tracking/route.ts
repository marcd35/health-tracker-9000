import { NextRequest, NextResponse } from 'next/server';
import { CalorieGoalRepository } from '@/lib/database/repositories/calorieGoalRepository';
import { CalorieTrackerRepository } from '@/lib/database/repositories/calorieTrackerRepository';
import { ProfileRepository } from '@/lib/database/repositories/profileRepository';

const goalRepo = new CalorieGoalRepository();
const trackerRepo = new CalorieTrackerRepository();
const profileRepo = new ProfileRepository();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { goalType, weeklyCalorieTarget, activityLevel } = body;

    // Validate required fields
    if (!goalType || !weeklyCalorieTarget || !activityLevel) {
      return NextResponse.json(
        { error: 'Missing required fields: goalType, weeklyCalorieTarget, activityLevel' },
        { status: 400 }
      );
    }

    const profile = profileRepo.getProfile();
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const goal = goalRepo.createGoal(profile.id, goalType, weeklyCalorieTarget, activityLevel);

    // Create initial tracking for today
    const today = new Date().toISOString().split('T')[0];
    trackerRepo.updateDailyTracking(profile.id, today);

    return NextResponse.json({
      success: true,
      goal,
      dailyTarget: goal.dailyCalorieTarget,
      message: `Goal created! Daily target: ${goal.dailyCalorieTarget} calories`,
    });
  } catch (error: any) {
    console.error('Error creating calorie goal:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    const profile = profileRepo.getProfile();
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    if (action === 'history') {
      const history = goalRepo.getGoalHistory(profile.id);
      return NextResponse.json(history);
    }

    // Default: return current goal
    const goal = goalRepo.getCurrentGoal(profile.id);
    if (!goal) {
      return NextResponse.json(null);
    }

    return NextResponse.json(goal);
  } catch (error: any) {
    console.error('Error fetching calorie goal:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
