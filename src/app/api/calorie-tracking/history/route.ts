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

    const history = goalRepo.getGoalHistory(profile.id);

    return NextResponse.json(history);
  } catch (error: any) {
    console.error('Error fetching goal history:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
