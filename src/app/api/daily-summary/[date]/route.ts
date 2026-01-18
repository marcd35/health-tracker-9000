import { NextResponse } from 'next/server';
import { DailySummaryRepository } from '@/lib/database/repositories/dailySummaryRepository';

export async function GET(_request: Request, { params }: { params: Promise<{ date: string }> }) {
  const repo = new DailySummaryRepository();
  const { date } = await params;

  try {
    const summary = await repo.getDailySummary(date);
    if (!summary) {
      return NextResponse.json({ error: 'Summary not found' }, { status: 404 });
    }
    return NextResponse.json(summary);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
