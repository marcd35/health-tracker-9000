import { NextResponse } from 'next/server';
import { CalorieGoalRepository } from '@/lib/database/repositories/calorieGoalRepository';
import { ProfileRepository } from '@/lib/database/repositories/profileRepository';

const goalRepo = new CalorieGoalRepository();
const profileRepo = new ProfileRepository();

export async function GET() {
  try {
    const profile = profileRepo.getProfile();
    if (!profile) {
      // Return null instead of 404 when no profile exists yet
      return NextResponse.json(null, { status: 200 });
    }

    const goal = goalRepo.getCurrentGoal(profile.id);
    if (!goal) {
      return NextResponse.json(null, { status: 200 });
    }

    return NextResponse.json(goal);
  } catch (error: any) {
    console.error('[API] Error fetching current goal:', error);
    console.error('[API] Stack:', error.stack);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
