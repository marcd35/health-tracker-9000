import { NextResponse } from 'next/server';
import { MealLogRepository } from '@/lib/database/repositories/mealLogRepository';
import { FoodRepository } from '@/lib/database/repositories/foodRepository';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get('limit');
  const limit = limitParam ? parseInt(limitParam) : 10;

  try {
    const mealRepo = new MealLogRepository();
    const foodRepo = new FoodRepository();

    const recentFoods = mealRepo.getRecentFoods(limit);

    // Enrich with full food data where available
    const enrichedFoods = recentFoods.map((recent) => {
      const fullFood = foodRepo.getFoodById(recent.foodId);
      return {
        ...recent,
        food: fullFood || null,
      };
    });

    return NextResponse.json(enrichedFoods);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
