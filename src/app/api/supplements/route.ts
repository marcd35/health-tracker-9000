import { NextResponse } from 'next/server';
import { SupplementRepository } from '@/lib/database/repositories/supplementRepository';
import { DailySummaryRepository } from '@/lib/database/repositories/dailySummaryRepository';
import { ProfileRepository } from '@/lib/database/repositories/profileRepository';
import { calculateHealthScore } from '@/lib/utils/healthScoring';
import { MealLogRepository } from '@/lib/database/repositories/mealLogRepository';

// GET - list all supplements OR logs by date
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const repo = new SupplementRepository();

  try {
    if (date) {
      const logs = repo.getSupplementLogsByDate(date);
      return NextResponse.json(logs);
    } else {
      const supplements = repo.getAllSupplements();
      return NextResponse.json(supplements);
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST - create supplement OR log taken (distinguished by body shape)
export async function POST(request: Request) {
  const supplementRepo = new SupplementRepository();
  const summaryRepo = new DailySummaryRepository();
  const mealRepo = new MealLogRepository();
  const profileRepo = new ProfileRepository();

  try {
    const body = await request.json();

    // If body has 'supplementId' and 'date', it's a log action
    if (body.supplementId && body.date) {
      const { date, supplementId, supplementName, taken, takenAt, isDuplicateWarning } = body;

      supplementRepo.logSupplementTaken({
        date,
        supplementId,
        supplementName,
        taken,
        takenAt: takenAt || new Date().toISOString(),
        isDuplicateWarning: isDuplicateWarning || false,
      });

      // Update daily summary
      const summary = await summaryRepo.getDailySummary(date);
      if (summary) {
        const targets = profileRepo.calculateNutritionalTargets();
        const meals = mealRepo.getMealLogsByDate(date);
        const supplements = supplementRepo.getSupplementLogsByDate(date);
        const dailyTotals = summaryRepo.calculateDailyTotals(meals, supplements);

        const scoreBreakdown = calculateHealthScore(dailyTotals, targets, {
          ...summary,
          meals,
          supplements,
          totalNutrition: dailyTotals,
        });

        summaryRepo.saveDailySummary({
          date,
          totalNutrition: dailyTotals,
          healthScore: scoreBreakdown.total,
        });
      }

      return NextResponse.json({ success: true });
    }

    // Otherwise, create new supplement
    const newSupplement = supplementRepo.createSupplement({
      name: body.name,
      brand: body.brand,
      servingSize: body.servingSize,
      nutrients: body.nutrients || {},
      notes: body.notes,
      color: body.color || '#6366f1',
      dosageFrequency: body.dosageFrequency || 'daily',
      dosageQuantity: body.dosageQuantity || 1,
      dosageNotes: body.dosageNotes,
    });

    return NextResponse.json(newSupplement, { status: 201 });
  } catch (error: unknown) {
    console.error('API Error:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT - update supplement
export async function PUT(request: Request) {
  const repo = new SupplementRepository();

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    const updated = repo.updateSupplement(id, updates);
    return NextResponse.json(updated);
  } catch (error: unknown) {
    console.error('API Error:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE - delete supplement
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const repo = new SupplementRepository();

  if (!id) {
    return NextResponse.json({ error: 'ID required' }, { status: 400 });
  }

  try {
    repo.deleteSupplement(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
