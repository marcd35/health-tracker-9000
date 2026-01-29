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
      bestStreak: bestStreak || 0,
    });
  } catch (error: any) {
    console.error('[API] Error fetching streak data:', error);
    console.error('[API] Stack:', error.stack);
    // Return empty data instead of 500 when no goals/data exist
    return NextResponse.json({
      currentStreak: null,
      bestStreak: 0,
    });
  }
}
