import { NextResponse } from 'next/server';
import { WeightLogRepository } from '@/lib/database/repositories/weightLogRepository';
import { ProfileRepository } from '@/lib/database/repositories/profileRepository';
import { withErrorHandling } from '@/lib/utils/errorHandler';
import { ValidationError } from '@/lib/errors/ApiError';
import { WeightLogSchema } from '@/lib/validation/schemas';

// GET - Get weight history
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate') || undefined;
  const endDate = searchParams.get('endDate') || undefined;

  const repo = new WeightLogRepository();
  const profileRepo = new ProfileRepository();

  return withErrorHandling(async () => {
    // Get the current profile (for now, we assume single user)
    const profile = profileRepo.getProfile();
    if (!profile) {
      throw new ValidationError('Profile not found', 404);
    }

    const logs = repo.getWeightHistory(profile.id, startDate, endDate);
    return NextResponse.json(logs);
  }, 'GET /api/weight-logs');
}

// POST - Log new weight entry
export async function POST(request: Request) {
  const repo = new WeightLogRepository();
  const profileRepo = new ProfileRepository();

  return withErrorHandling(async () => {
    const body = await request.json();
    const validated = WeightLogSchema.parse(body);

    // Get the current profile
    const profile = profileRepo.getProfile();
    if (!profile) {
      throw new ValidationError('Profile not found', 404);
    }

    // Log the weight
    const weightLog = repo.logWeight(profile.id, validated.weight, validated.date, validated.notes);

    // Update profile's current weight if this is today's entry
    const today = new Date().toISOString().split('T')[0];
    if (!validated.date || validated.date === today) {
      profileRepo.updateProfile({ weight: validated.weight });
    }

    return NextResponse.json(weightLog, { status: 201 });
  }, 'POST /api/weight-logs');
}

// DELETE - Delete a weight log entry
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const repo = new WeightLogRepository();

  return withErrorHandling(async () => {
    if (!id) {
      throw new ValidationError('Weight log ID required');
    }

    repo.deleteWeightLog(id);
    return NextResponse.json({ success: true });
  }, 'DELETE /api/weight-logs');
}
