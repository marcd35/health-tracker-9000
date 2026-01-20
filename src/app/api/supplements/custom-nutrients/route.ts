import { NextResponse } from 'next/server';
import { SupplementRepository } from '@/lib/database/repositories/supplementRepository';

// GET - list all custom nutrients
export async function GET() {
  const repo = new SupplementRepository();

  try {
    const nutrients = repo.getAllCustomNutrients();
    return NextResponse.json(nutrients);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST - create a custom nutrient
export async function POST(request: Request) {
  const repo = new SupplementRepository();

  try {
    const { key, name, unit, category, userDefinedTarget } = await request.json();

    if (!key || !name || !unit || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const nutrient = repo.createCustomNutrient({
      key,
      name,
      unit,
      category,
      userDefinedTarget,
    });

    return NextResponse.json(nutrient, { status: 201 });
  } catch (error: unknown) {
    console.error('API Error:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT - update a custom nutrient
export async function PUT(request: Request) {
  const repo = new SupplementRepository();

  try {
    const { key, ...updates } = await request.json();

    if (!key) {
      return NextResponse.json({ error: 'key required' }, { status: 400 });
    }

    const nutrient = repo.updateCustomNutrient(key, updates);
    return NextResponse.json(nutrient);
  } catch (error: unknown) {
    console.error('API Error:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE - delete a custom nutrient
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');
  const repo = new SupplementRepository();

  if (!key) {
    return NextResponse.json({ error: 'key required' }, { status: 400 });
  }

  try {
    repo.deleteCustomNutrient(key);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
