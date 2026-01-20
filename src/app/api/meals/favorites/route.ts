import { NextResponse } from 'next/server';
import { MealFavoritesRepository } from '@/lib/database/repositories/mealFavoritesRepository';

export async function GET() {
  try {
    const repo = new MealFavoritesRepository();
    const favorites = repo.getFavorites();
    return NextResponse.json(favorites);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const repo = new MealFavoritesRepository();
    const body = await request.json();
    const { name, mealType, foods } = body;

    if (!name || !mealType || !foods || !Array.isArray(foods)) {
      return NextResponse.json(
        { error: 'Name, mealType, and foods array are required' },
        { status: 400 }
      );
    }

    const favorite = repo.addFavorite(name, mealType, foods);
    return NextResponse.json(favorite);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID required' }, { status: 400 });
  }

  try {
    const repo = new MealFavoritesRepository();
    repo.deleteFavorite(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
