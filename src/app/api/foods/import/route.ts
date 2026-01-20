/**
 * USDA food import API endpoint
 * POST /api/foods/import
 * Body: { fdcId: number } or { food: Food & { usdaFdcId: number } }
 */

import { NextResponse } from 'next/server';
import { USDAClient, USDAMapper } from '@/lib/services/usda/index';
import { FoodRepository } from '@/lib/database/repositories/foodRepository';
import type { Food } from '@/lib/types/health';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Support two modes:
    // 1. Import by FDC ID (fetch from USDA)
    // 2. Import already-mapped food (from search results)
    if (body.fdcId) {
      return await importByFdcId(body.fdcId);
    } else if (body.food) {
      return await importMappedFood(body.food);
    } else {
      return NextResponse.json({ error: 'Either fdcId or food object required' }, { status: 400 });
    }
  } catch (error) {
    console.error('Food import error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to import food. Please try again.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * Import food by USDA FDC ID (fetch from API)
 */
async function importByFdcId(fdcId: number) {
  const repo = new FoodRepository();

  // Check if already cached
  const existing = repo.getFoodByUSDAId(fdcId.toString());
  if (existing) {
    return NextResponse.json({
      food: existing,
      cached: true,
      message: 'Food already in database',
    });
  }

  try {
    // Fetch from USDA API
    const usdaClient = new USDAClient();
    const usdaFood = await usdaClient.getFoodById(fdcId);

    // Map to our interface
    const mappedFood = USDAMapper.toFood(usdaFood);

    // Validate
    if (!USDAMapper.isValidFood(mappedFood)) {
      return NextResponse.json({ error: 'Food data incomplete or invalid' }, { status: 400 });
    }

    // Save to database
    const foodId = repo.createFoodFromUSDA(
      mappedFood.name,
      mappedFood.servingSize,
      mappedFood.servingUnit,
      mappedFood.nutritionPer100g,
      mappedFood.allergens,
      fdcId,
      mappedFood.brand,
      mappedFood.ingredients
    );

    const savedFood = repo.getFoodById(foodId);

    // Persist granular allergens if present
    if (mappedFood.allergens && mappedFood.allergens.length > 0) {
      repo.saveFoodAllergens(
        foodId,
        mappedFood.allergens.map((a: string) => ({
          allergenType: a,
          source: 'auto_detected',
          confidenceLevel: 'medium',
        }))
      );
    }

    return NextResponse.json({
      food: savedFood,
      cached: false,
      message: 'Food imported successfully',
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'USDA API rate limit exceeded. Please try again in an hour.' },
          { status: 429 }
        );
      }
      if (error.message.includes('not found')) {
        return NextResponse.json({ error: 'Food not found in USDA database' }, { status: 404 });
      }
    }
    throw error;
  }
}

/**
 * Import already-mapped food from search results
 */
async function importMappedFood(food: Food & { usdaFdcId: number }) {
  console.log('Importing mapped food:', {
    name: food.name,
    usdaFdcId: food.usdaFdcId,
    hasUsdaFdcId: 'usdaFdcId' in food,
  });

  const repo = new FoodRepository();

  // Check if already cached
  const existing = repo.getFoodByUSDAId(food.usdaFdcId.toString());
  if (existing) {
    return NextResponse.json({
      food: existing,
      cached: true,
      message: 'Food already in database',
    });
  }

  // Validate
  if (!USDAMapper.isValidFood(food)) {
    return NextResponse.json({ error: 'Food data incomplete or invalid' }, { status: 400 });
  }

  // Save to database
  const foodId = repo.createFoodFromUSDA(
    food.name,
    food.servingSize,
    food.servingUnit,
    food.nutritionPer100g,
    food.allergens,
    food.usdaFdcId,
    food.brand,
    food.ingredients
  );

  // Persist granular allergens if present
  if (food.allergens && food.allergens.length > 0) {
    repo.saveFoodAllergens(
      foodId,
      food.allergens.map((a: string) => ({
        allergenType: a,
        source: 'user_flagged', // If coming from mapped food import, assume user confirmed
        confidenceLevel: 'high',
      }))
    );
  }

  const savedFood = repo.getFoodById(foodId);

  return NextResponse.json({
    food: savedFood,
    cached: false,
    message: 'Food imported successfully',
  });
}
