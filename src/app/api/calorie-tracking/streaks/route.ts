import { NextResponse } from 'next/server';
import { CalorieTrackerRepository } from '@/lib/database/repositories/calorieTrackerRepository';
import { ProfileRepository } from '@/lib/database/repositories/profileRepository';

const trackerRepo = new CalorieTrackerRepository();
const profileRepo = new ProfileRepository();

export async function GET() {
  try {
    const profile = profileRepo.getProfile();
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const currentStreak = trackerRepo.getCurrentStreak(profile.id);
    const bestStreak = trackerRepo.getBestStreak(profile.id);

    return NextResponse.json({
      currentStreak: currentStreak || null,
      bestStreak,
    });
  } catch (error: any) {
    console.error('Error fetching streak data:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
