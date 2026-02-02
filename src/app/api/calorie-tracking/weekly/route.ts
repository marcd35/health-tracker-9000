import { NextRequest, NextResponse } from 'next/server';
import { CalorieTrackerRepository } from '@/lib/database/repositories/calorieTrackerRepository';
import { CalorieGoalRepository } from '@/lib/database/repositories/calorieGoalRepository';
import { ProfileRepository } from '@/lib/database/repositories/profileRepository';

const trackerRepo = new CalorieTrackerRepository();
const goalRepo = new CalorieGoalRepository();
const profileRepo = new ProfileRepository();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const endDateParam = searchParams.get('endDate');
    const endDate = endDateParam || new Date().toISOString().split('T')[0];

    const profile = profileRepo.getProfile();
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const goal = goalRepo.getCurrentGoal(profile.id);
    if (!goal) {
      return NextResponse.json({ error: 'No active calorie goal' }, { status: 400 });
    }

    // Get weekly tracking data
    const weeklyData = trackerRepo.getWeeklyTracking(profile.id, endDate);

    return NextResponse.json(weeklyData);
  } catch (error: any) {
    console.error('[API] Error fetching weekly tracking:', error);
    console.error('[API] Stack:', error.stack);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
