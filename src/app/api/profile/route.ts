import { NextResponse } from 'next/server';
import { ProfileRepository } from '@/lib/database/repositories/profileRepository';
import { withErrorHandling } from '@/lib/utils/errorHandler';
import { ValidationError } from '@/lib/errors/ApiError';
import { ProfileUpdateSchema } from '@/lib/validation/schemas';

export async function GET() {
  const repo = new ProfileRepository();
  return withErrorHandling(async () => {
    const profile = repo.getProfile();
    if (!profile) {
      throw new ValidationError('Profile not found', 404);
    }
    const targets = repo.calculateNutritionalTargets();
    return NextResponse.json({ ...profile, targets });
  }, 'GET /api/profile');
}

export async function PUT(request: Request) {
  const repo = new ProfileRepository();
  return withErrorHandling(async () => {
    const body = await request.json();
    const validated = ProfileUpdateSchema.parse(body);
    repo.updateProfile(validated);
    const updatedProfile = repo.getProfile();
    return NextResponse.json(updatedProfile);
  }, 'PUT /api/profile');
}
