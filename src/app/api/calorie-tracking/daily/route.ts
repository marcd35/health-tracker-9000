import { NextResponse } from 'next/server';
import { CalorieTrackerRepository } from '@/lib/database/repositories/calorieTrackerRepository';
import { ProfileRepository } from '@/lib/database/repositories/profileRepository';
import { withErrorHandling } from '@/lib/utils/errorHandler';
import { ValidationError } from '@/lib/errors/ApiError';
import { z } from 'zod';

const PaginationSchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 100)),
  offset: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 0)),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export async function GET(request: Request) {
  const repo = new CalorieTrackerRepository();
  const profileRepo = new ProfileRepository();
  const { searchParams } = new URL(request.url);

  return withErrorHandling(async () => {
    const profile = profileRepo.getProfile();
    if (!profile) {
      throw new ValidationError('User profile not found');
    }

    const params = PaginationSchema.parse({
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
    });

    const result = repo.getAllDailyTracking(
      profile.id,
      params.startDate,
      params.endDate,
      params.limit,
      params.offset
    );

    return NextResponse.json({
      data: result.data,
      pagination: {
        total: result.total,
        limit: params.limit,
        offset: params.offset,
        hasMore: params.offset + params.limit < result.total,
      },
    });
  }, 'GET /api/calorie-tracking/daily');
}
