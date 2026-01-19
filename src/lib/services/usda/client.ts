/**
 * USDA FoodData Central API client
 * Handles HTTP requests to the USDA FDC API
 */

import type { USDASearchResponse, USDAFoodItem, USDAApiError } from './types';
import { USDA_CONFIG } from './constants';

export class USDAClient {
  private baseUrl: string;
  private apiKey: string;
  private timeout: number;

  constructor() {
    this.baseUrl = USDA_CONFIG.BASE_URL;
    this.apiKey = USDA_CONFIG.API_KEY;
    this.timeout = USDA_CONFIG.REQUEST_TIMEOUT_MS;

    if (!this.apiKey) {
      throw new Error('USDA_API_KEY environment variable is not set');
    }
  }

  /**
   * Search for foods by query string
   */
  async searchFoods(
    query: string,
    pageSize: number = USDA_CONFIG.DEFAULT_PAGE_SIZE
  ): Promise<USDAFoodItem[]> {
    const url = `${this.baseUrl}/foods/search`;

    const params = new URLSearchParams({
      query: query.trim(),
      pageSize: Math.min(pageSize, USDA_CONFIG.MAX_PAGE_SIZE).toString(),
      dataType: 'Foundation,SR Legacy,Branded', // Include multiple data types
    });

    try {
      const response = await this.fetchWithTimeout(`${url}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': this.apiKey,
        },
      });

      if (response.status === 429) {
        throw new Error('USDA API rate limit exceeded. Please try again in an hour.');
      }

      if (!response.ok) {
        const errorData: USDAApiError = await response.json().catch(() => ({
          error: { code: 'UNKNOWN', message: 'Unknown error' },
        }));
        throw new Error(
          errorData.error?.message || `USDA API request failed: ${response.statusText}`
        );
      }

      const data: USDASearchResponse = await response.json();
      return data.foods || [];
    } catch (error) {
      if (error instanceof Error) {
        // Re-throw with original message
        throw error;
      }
      throw new Error('Failed to search USDA foods');
    }
  }

  /**
   * Get a single food by FDC ID
   */
  async getFoodById(fdcId: number): Promise<USDAFoodItem> {
    const url = `${this.baseUrl}/food/${fdcId}`;

    const params = new URLSearchParams({
      format: 'full', // Get complete nutrient data
    });

    try {
      const response = await this.fetchWithTimeout(`${url}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': this.apiKey,
        },
      });

      if (response.status === 429) {
        throw new Error('USDA API rate limit exceeded. Please try again in an hour.');
      }

      if (response.status === 404) {
        throw new Error(`Food with FDC ID ${fdcId} not found`);
      }

      if (!response.ok) {
        const errorData: USDAApiError = await response.json().catch(() => ({
          error: { code: 'UNKNOWN', message: 'Unknown error' },
        }));
        throw new Error(
          errorData.error?.message || `USDA API request failed: ${response.statusText}`
        );
      }

      const food: USDAFoodItem = await response.json();
      return food;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch USDA food details');
    }
  }

  /**
   * Fetch with timeout and retry logic
   */
  private async fetchWithTimeout(
    url: string,
    options: RequestInit,
    retries: number = 2
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Retry on 5xx server errors (but not rate limits)
      if (response.status >= 500 && retries > 0) {
        // Wait briefly before retry with exponential backoff
        await this.delay(1000 * (3 - retries));
        return this.fetchWithTimeout(url, options, retries - 1);
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('USDA API request timed out. Please try again.');
      }

      // Retry on network errors
      if (retries > 0) {
        await this.delay(1000 * (3 - retries));
        return this.fetchWithTimeout(url, options, retries - 1);
      }

      throw error;
    }
  }

  /**
   * Simple delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
