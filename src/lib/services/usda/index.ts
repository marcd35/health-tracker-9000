export { USDAClient } from './client';
export { USDAMapper } from './mapper';
export * from './types';
export * from './constants';

import { USDAClient } from './client';

/**
 * Legacy wrapper for searching foods
 */
export async function searchFoods(query: string, _apiKey: string) {
  const client = new USDAClient();
  return {
    foods: await client.searchFoods(query),
    totalHits: 0, // Not accurately provided by client.searchFoods currently
    currentPage: 1,
    totalPages: 1,
  };
}

/**
 * Legacy wrapper for getting food details
 */
export async function getFoodDetails(fdcId: number, _apiKey: string) {
  const client = new USDAClient();
  return await client.getFoodById(fdcId);
}
