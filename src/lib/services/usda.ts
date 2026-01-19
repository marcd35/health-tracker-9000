export type UsdaFoodSearchResult = {
  fdcId: number;
  description: string;
  dataType: string;
  publicationDate: string;
  foodCode?: string;
  foodNutrients?: {
    nutrientId: number;
    nutrientName: string;
    nutrientNumber: string;
    unitName: string;
    value: number;
  }[];
  servingSize?: number;
  servingSizeUnit?: string;
  brandName?: string;
  brandOwner?: string;
};

export type UsdaSearchResponse = {
  totalHits: number;
  currentPage: number;
  totalPages: number;
  pageList: number[];
  foods: UsdaFoodSearchResult[];
};

const USDA_API_BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

export async function searchFoods(query: string, apiKey: string): Promise<UsdaSearchResponse> {
  const url = new URL(`${USDA_API_BASE_URL}/foods/search`);
  url.searchParams.append('api_key', apiKey);
  url.searchParams.append('query', query);
  url.searchParams.append('dataType', 'Foundation,SR Legacy,Branded');
  url.searchParams.append('pageSize', '25');

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`USDA API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function getFoodDetails(fdcId: number, apiKey: string): Promise<any> {
  const url = new URL(`${USDA_API_BASE_URL}/food/${fdcId}`);
  url.searchParams.append('api_key', apiKey);

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`USDA API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
