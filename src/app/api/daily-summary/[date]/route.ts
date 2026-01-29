import { NextResponse } from 'next/server';
import { DailySummaryRepository } from '@/lib/database/repositories/dailySummaryRepository';

export async function GET(_request: Request, { params }: { params: Promise<{ date: string }> }) {
  const repo = new DailySummaryRepository();
  const { date } = await params;

  console.log('[DEBUG] API /api/daily-summary/[date] called with date:', date);

  try {
    const summary = await repo.getDailySummary(date);
    console.log('[DEBUG] API summary result:', summary ? 'found' : 'not found');
    if (!summary) {
      console.log('[DEBUG] API returning 404 for date:', date);
      return NextResponse.json({ error: 'Summary not found' }, { status: 404 });
    }
    console.log('[DEBUG] API returning success for date:', date);
    return NextResponse.json(summary);
  } catch (error) {
    console.error('[DEBUG] API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
