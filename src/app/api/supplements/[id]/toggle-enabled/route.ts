import { NextResponse } from 'next/server';
import { SupplementRepository } from '@/lib/database/repositories/supplementRepository';
import { withErrorHandling } from '@/lib/utils/errorHandler';
import { ValidationError } from '@/lib/errors/ApiError';
import { z } from 'zod';

const ToggleEnabledSchema = z.object({
  enabled: z.boolean(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const repo = new SupplementRepository();
  return withErrorHandling(async () => {
    const { id } = await params;
    const body = await request.json();
    const { enabled } = ToggleEnabledSchema.parse(body);

    repo.toggleEnabled(id, enabled);

    const updated = repo.getSupplementById(id);
    if (!updated) {
      throw new ValidationError('Supplement not found', 404);
    }

    return NextResponse.json(updated);
  }, 'PATCH /api/supplements/[id]/toggle-enabled');
}
