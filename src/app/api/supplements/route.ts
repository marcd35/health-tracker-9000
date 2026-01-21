import { NextResponse } from 'next/server';
import { SupplementRepository } from '@/lib/database/repositories/supplementRepository';
import { updateDailySummaryForDate } from '@/lib/utils/dailySummary';
import { withErrorHandling } from '@/lib/utils/errorHandler';
import { ValidationError } from '@/lib/errors/ApiError';
import {
  SupplementCreateSchema,
  SupplementUpdateSchema,
  SupplementLogSchema,
} from '@/lib/validation/schemas';

// GET - list all supplements OR logs by date
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const repo = new SupplementRepository();

  return withErrorHandling(async () => {
    if (date) {
      const logs = repo.getSupplementLogsByDate(date);
      return NextResponse.json(logs);
    } else {
      const supplements = repo.getAllSupplements();
      return NextResponse.json(supplements);
    }
  }, 'GET /api/supplements');
}

// POST - create supplement OR log taken (distinguished by body shape)
export async function POST(request: Request) {
  const supplementRepo = new SupplementRepository();

  return withErrorHandling(async () => {
    const body = await request.json();

    // If body has 'supplementId' and 'date', it's a log action
    if (body.supplementId && body.date) {
      const validated = SupplementLogSchema.parse(body);

      supplementRepo.logSupplementTaken({
        date: validated.date,
        supplementId: validated.supplementId,
        supplementName: validated.supplementName,
        taken: validated.taken,
        takenAt: validated.takenAt || new Date().toISOString(),
        isDuplicateWarning: validated.isDuplicateWarning || false,
      });

      // Update daily summary using utility function
      await updateDailySummaryForDate(validated.date);

      return NextResponse.json({ success: true });
    }

    // Otherwise, create new supplement
    const validated = SupplementCreateSchema.parse(body);
    const newSupplement = supplementRepo.createSupplement({
      name: validated.name,
      brand: validated.brand,
      servingSize: validated.servingSize,
      nutrients: validated.nutrients || {},
      customNutrients: validated.customNutrients || {},
      notes: validated.notes,
      color: validated.color,
      dosageFrequency: validated.dosageFrequency,
      dosageQuantity: validated.dosageQuantity,
      dosageNotes: validated.dosageNotes,
      supplementType: validated.supplementType,
      enabled: true,
    });

    return NextResponse.json(newSupplement, { status: 201 });
  }, 'POST /api/supplements');
}

// PUT - update supplement
export async function PUT(request: Request) {
  const repo = new SupplementRepository();

  return withErrorHandling(async () => {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      throw new ValidationError('Supplement ID required');
    }

    // Validate the update data
    const validated = SupplementUpdateSchema.parse(updateData);

    const updated = repo.updateSupplement(id, validated as any);
    return NextResponse.json(updated);
  }, 'PUT /api/supplements');
}

// DELETE - delete supplement
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const repo = new SupplementRepository();

  return withErrorHandling(async () => {
    if (!id) {
      throw new ValidationError('Supplement ID required');
    }

    repo.deleteSupplement(id);
    return NextResponse.json({ success: true });
  }, 'DELETE /api/supplements');
}
