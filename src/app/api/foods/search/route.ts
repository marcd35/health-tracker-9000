import { NextResponse } from 'next/server';
import { FoodRepository } from '@/lib/database/repositories/foodRepository';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const repo = new FoodRepository();

  try {
    if (!query) return NextResponse.json([]);
    const results = repo.searchFoods(query);
    return NextResponse.json(results);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
