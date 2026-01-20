import { NextResponse } from 'next/server';
import { CalorieTrackerRepository } from '@/lib/database/repositories/calorieTrackerRepository';
import { ProfileRepository } from '@/lib/database/repositories/profileRepository';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));
  const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1));

  if (!year || !month || month < 1 || month > 12) {
    return NextResponse.json(
      { error: 'Invalid year or month parameter' },
      { status: 400 }
    );
  }

  try {
    const profileRepo = new ProfileRepository();
    const profile = profileRepo.getProfile();

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    const calorieTrackerRepo = new CalorieTrackerRepository();
    const monthlyData = calorieTrackerRepo.getMonthlyTracking(profile.id, year, month);

    return NextResponse.json({
      year,
      month,
      data: monthlyData,
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
