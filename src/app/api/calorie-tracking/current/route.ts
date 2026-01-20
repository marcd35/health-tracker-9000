import { NextResponse } from 'next/server';
import { CalorieGoalRepository } from '@/lib/database/repositories/calorieGoalRepository';
import { ProfileRepository } from '@/lib/database/repositories/profileRepository';

const goalRepo = new CalorieGoalRepository();
const profileRepo = new ProfileRepository();

export async function GET() {
  try {
    const profile = profileRepo.getProfile();
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const goal = goalRepo.getCurrentGoal(profile.id);
    if (!goal) {
      return NextResponse.json(null, { status: 404 });
    }

    return NextResponse.json(goal);
  } catch (error: any) {
    console.error('Error fetching current goal:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
