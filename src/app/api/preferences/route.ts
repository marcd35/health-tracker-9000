import { NextResponse } from 'next/server';
import { PreferencesRepository } from '@/lib/database/repositories/preferencesRepository';
import { withErrorHandling } from '@/lib/utils/errorHandler';
import { ValidationError } from '@/lib/errors/ApiError';
import { z } from 'zod';

const PreferencesUpdateSchema = z.object({
  timezone: z.string().optional(),
  showClock: z.boolean().optional(),
  showHealthInsights: z.boolean().optional(),
  hydrationEnabled: z.boolean().optional(),
});

export async function GET() {
  const repo = new PreferencesRepository();
  return withErrorHandling(async () => {
    const preferences = repo.getPreferences();
    if (!preferences) {
      throw new ValidationError('Preferences not found', 404);
    }
    return NextResponse.json(preferences);
  }, 'GET /api/preferences');
}

export async function PUT(request: Request) {
  const repo = new PreferencesRepository();
  return withErrorHandling(async () => {
    const body = await request.json();
    const validated = PreferencesUpdateSchema.parse(body);
    const updated = repo.updatePreferences(validated);
    return NextResponse.json(updated);
  }, 'PUT /api/preferences');
}
