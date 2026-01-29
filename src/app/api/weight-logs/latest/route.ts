import { NextResponse } from 'next/server';
import { WeightLogRepository } from '@/lib/database/repositories/weightLogRepository';
import { ProfileRepository } from '@/lib/database/repositories/profileRepository';

// GET - Get latest weight log
export async function GET() {
  const repo = new WeightLogRepository();
  const profileRepo = new ProfileRepository();

  try {
    // Get the current profile
    const profile = profileRepo.getProfile();
    if (!profile) {
      // Return null weight if no profile exists yet
      return NextResponse.json({ weight: null, source: 'none' }, { status: 200 });
    }

    const latestWeight = repo.getLatestWeight(profile.id);

    if (!latestWeight) {
      return NextResponse.json({ weight: profile.weight, source: 'profile' }, { status: 200 });
    }

    return NextResponse.json(latestWeight);
  } catch (error: any) {
    console.error('[API] Error fetching latest weight:', error);
    console.error('[API] Stack:', error?.stack);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
