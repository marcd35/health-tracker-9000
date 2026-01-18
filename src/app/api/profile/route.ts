import { NextResponse } from 'next/server';
import { ProfileRepository } from '@/lib/database/repositories/profileRepository';

export async function GET() {
  const repo = new ProfileRepository();
  try {
    const profile = repo.getProfile();
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }
    const targets = repo.calculateNutritionalTargets();
    return NextResponse.json({ ...profile, targets });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const repo = new ProfileRepository();
  try {
    const body = await request.json();
    repo.updateProfile(body);
    const updatedProfile = repo.getProfile();
    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
