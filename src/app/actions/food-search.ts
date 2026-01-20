'use server';

import { searchFoods, getFoodDetails, UsdaSearchResponse } from '@/lib/services/usda/index';

export type SearchActionState = {
  success: boolean;
  data?: UsdaSearchResponse;
  error?: string;
};

export async function searchFoodAction(query: string): Promise<SearchActionState> {
  if (!query || query.trim().length < 2) {
    return { success: false, error: 'Query must be at least 2 characters' };
  }

  try {
    const data = await searchFoods(query);
    return { success: true, data };
  } catch (error) {
    console.error('Food search error:', error);
    return { success: false, error: 'Failed to search foods. Please try again.' };
  }
}

export async function getFoodDetailsAction(fdcId: number) {
  try {
    const data = await getFoodDetails(fdcId);
    return { success: true, data };
  } catch (error) {
    console.error('Food details error:', error);
    return { success: false, error: 'Failed to fetch food details.' };
  }
}
