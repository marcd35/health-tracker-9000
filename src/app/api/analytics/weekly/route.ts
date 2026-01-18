import { NextResponse } from 'next/server';
import { DailySummaryRepository } from '@/lib/database/repositories/dailySummaryRepository';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const endDate = searchParams.get('endDate') || new Date().toISOString().split('T')[0];
  const repo = new DailySummaryRepository();

  try {
    const weeklyData = repo.getWeeklySummary(endDate);
    return NextResponse.json(weeklyData);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
