import { NextResponse } from 'next/server';
import { SUPPLEMENT_DATABASE } from '@/lib/database/supplementDatabaseSeed';

// Simple fuzzy search helper
function fuzzyMatch(query: string, text: string): number {
  query = query.toLowerCase();
  text = text.toLowerCase();

  if (text.includes(query)) {
    return 100; // Exact substring match
  }

  // Fuzzy matching: count matching characters in order
  let matches = 0;
  let queryIndex = 0;

  for (let i = 0; i < text.length && queryIndex < query.length; i++) {
    if (text[i] === query[queryIndex]) {
      matches++;
      queryIndex++;
    }
  }

  if (queryIndex === query.length) {
    return (matches / query.length) * 100; // All characters matched
  }

  return 0; // No match
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');
  const brand = searchParams.get('brand');
  const limit = parseInt(searchParams.get('limit') || '5');

  if (!name && !brand) {
    return NextResponse.json(
      { error: 'Either name or brand parameter is required' },
      { status: 400 }
    );
  }

  try {
    // Search and rank results
    const results = SUPPLEMENT_DATABASE.map((entry) => {
      let score = 0;

      if (name) {
        score += fuzzyMatch(name, entry.name) * 0.7; // Name match weighted higher
      }

      if (brand) {
        score += fuzzyMatch(brand, entry.brand) * 0.3;
      }

      return { entry, score };
    })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ entry }) => entry);

    return NextResponse.json(results);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
