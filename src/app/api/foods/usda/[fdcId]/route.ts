import { NextResponse } from 'next/server';
import { USDAClient } from '@/lib/services/usda/client';

export async function GET(_request: Request, { params }: { params: Promise<{ fdcId: string }> }) {
  try {
    const { fdcId } = await params;

    if (!fdcId || isNaN(Number(fdcId))) {
      return NextResponse.json({ error: 'Invalid FDC ID' }, { status: 400 });
    }

    const client = new USDAClient();
    const food = await client.getFoodById(Number(fdcId));

    return NextResponse.json(food);
  } catch (error) {
    console.error('Error fetching USDA food:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch USDA food' },
      { status: 500 }
    );
  }
}
