/**
 * USDA FoodData Central search API endpoint
 * GET /api/foods/usda-search?q=chicken&limit=20
 */

import { NextResponse } from 'next/server';
import { USDAClient, USDAMapper } from '@/lib/services/usda';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const limit = parseInt(searchParams.get('limit') || '20');

  if (!query || query.trim().length === 0) {
    return NextResponse.json({ error: 'Query parameter required' }, { status: 400 });
  }

  // Validate limit
  if (limit < 1 || limit > 50) {
    return NextResponse.json({ error: 'Limit must be between 1 and 50' }, { status: 400 });
  }

  try {
    // Query USDA API
    const usdaClient = new USDAClient();
    const usdaResults = await usdaClient.searchFoods(query.trim(), limit);

    console.log(`USDA API returned ${usdaResults.length} results for query: ${query}`);

    // Map USDA results to our Food interface
    const foods = usdaResults
      .map((item) => {
        try {
          const mapped = USDAMapper.toFood(item);
          console.log(`Mapped food: ${mapped.name}, FDC ID: ${mapped.usdaFdcId}`);
          return mapped;
        } catch (error) {
          // Skip foods that fail mapping (incomplete data)
          console.error(`Failed to map USDA food ${item.fdcId}:`, error);
          return null;
        }
      })
      .filter((food) => food !== null && USDAMapper.isValidFood(food));

    console.log(`Successfully mapped ${foods.length} valid foods`);

    return NextResponse.json({
      foods,
      source: 'usda',
      count: foods.length,
      query,
    });
  } catch (error) {
    console.error('USDA search error:', error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          {
            error: 'USDA API rate limit exceeded. Please try again in an hour.',
          },
          { status: 429 }
        );
      }

      if (error.message.includes('timed out')) {
        return NextResponse.json(
          {
            error: 'USDA API request timed out. Please try again.',
          },
          { status: 504 }
        );
      }

      if (error.message.includes('API key')) {
        return NextResponse.json(
          {
            error: 'USDA API configuration error. Please contact support.',
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      {
        error: 'Failed to search USDA foods. Please try again.',
      },
      { status: 500 }
    );
  }
}
