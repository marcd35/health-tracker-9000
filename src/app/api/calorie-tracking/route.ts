import { NextRequest, NextResponse } from 'next/server';
import { CalorieGoalRepository } from '@/lib/database/repositories/calorieGoalRepository';
import { CalorieTrackerRepository } from '@/lib/database/repositories/calorieTrackerRepository';
import { ProfileRepository } from '@/lib/database/repositories/profileRepository';
import { withErrorHandling } from '@/lib/utils/errorHandler';
import { ValidationError } from '@/lib/errors/ApiError';
import { CalorieGoalCreateSchema } from '@/lib/validation/schemas';

const goalRepo = new CalorieGoalRepository();
const trackerRepo = new CalorieTrackerRepository();
const profileRepo = new ProfileRepository();

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const body = await request.json();
    console.log('[DEBUG] POST /api/calorie-tracking - Request body:', body);
    
    const validated = CalorieGoalCreateSchema.parse(body);
    console.log('[DEBUG] Validation passed:', validated);

    const profile = profileRepo.getProfile();
    console.log('[DEBUG] Profile retrieved:', profile?.id || 'NO PROFILE');
    
    if (!profile) {
      console.error('[ERROR] ❌ Profile not found when creating calorie goal');
      throw new ValidationError('Profile not found. Please create your profile first.', 404);
    }

    console.log('[DEBUG] Creating goal for profile:', profile.id);
    const goal = goalRepo.createGoal(
      profile.id,
      validated.goalType,
      validated.weeklyCalorieTarget,
      validated.activityLevel
    );
    console.log('[DEBUG] Goal created:', goal.id);

    // Create initial tracking for today
    const today = new Date().toISOString().split('T')[0];
    trackerRepo.updateDailyTracking(profile.id, today);
    console.log('[DEBUG] Daily tracking initialized for:', today);

    return NextResponse.json({
      success: true,
      goal,
      dailyTarget: goal.dailyCalorieTarget,
      message: `Goal created! Daily target: ${goal.dailyCalorieTarget} calories`,
    });
  }, 'POST /api/calorie-tracking');
}

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    const profile = profileRepo.getProfile();
    if (!profile) {
      throw new ValidationError('Profile not found', 404);
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
  }, 'GET /api/calorie-tracking');
}
