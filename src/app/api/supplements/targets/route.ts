import { NextResponse } from 'next/server';
import { SupplementRepository } from '@/lib/database/repositories/supplementRepository';

// GET - list all custom nutrient targets
export async function GET() {
  const repo = new SupplementRepository();

  try {
    const targets = repo.getAllNutrientTargets();
    return NextResponse.json(targets);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST - upsert a nutrient target
export async function POST(request: Request) {
  const repo = new SupplementRepository();

  try {
    const { nutrientKey, targetValue, useRda } = await request.json();

    if (!nutrientKey || targetValue === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const target = repo.upsertNutrientTarget(nutrientKey, targetValue, useRda ?? true);
    return NextResponse.json(target);
  } catch (error: unknown) {
    console.error('API Error:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE - remove a custom target (revert to RDA)
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const nutrientKey = searchParams.get('nutrientKey');
  const repo = new SupplementRepository();

  if (!nutrientKey) {
    return NextResponse.json({ error: 'nutrientKey required' }, { status: 400 });
  }

  try {
    repo.deleteNutrientTarget(nutrientKey);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
