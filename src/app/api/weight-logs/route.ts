import { NextResponse } from 'next/server';
import { WeightLogRepository } from '@/lib/database/repositories/weightLogRepository';
import { ProfileRepository } from '@/lib/database/repositories/profileRepository';

// GET - Get weight history
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate') || undefined;
  const endDate = searchParams.get('endDate') || undefined;

  const repo = new WeightLogRepository();
  const profileRepo = new ProfileRepository();

  try {
    // Get the current profile (for now, we assume single user)
    const profile = profileRepo.getProfile();
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const logs = repo.getWeightHistory(profile.id, startDate, endDate);
    return NextResponse.json(logs);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST - Log new weight entry
export async function POST(request: Request) {
  const repo = new WeightLogRepository();
  const profileRepo = new ProfileRepository();

  try {
    const body = await request.json();
    const { weight, date, notes } = body;

    // Validation
    if (!weight || typeof weight !== 'number' || weight <= 0) {
      return NextResponse.json({ error: 'Valid weight (in lbs) is required' }, { status: 400 });
    }

    // Get the current profile
    const profile = profileRepo.getProfile();
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Log the weight
    const weightLog = repo.logWeight(profile.id, weight, date, notes);

    // Update profile's current weight if this is today's entry
    const today = new Date().toISOString().split('T')[0];
    if (!date || date === today) {
      profileRepo.updateProfile({ weight });
    }

    return NextResponse.json(weightLog, { status: 201 });
  } catch (error: unknown) {
    console.error('API Error:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE - Delete a weight log entry
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const repo = new WeightLogRepository();

  if (!id) {
    return NextResponse.json({ error: 'ID required' }, { status: 400 });
  }

  try {
    repo.deleteWeightLog(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
