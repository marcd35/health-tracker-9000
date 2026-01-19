/**
 * TypeScript types for USDA FoodData Central API
 * Based on FDC API spec: https://fdc.nal.usda.gov/api-spec/fdc_api.html
 */

export interface USDASearchResponse {
  foods: USDAFoodItem[];
  totalHits: number;
  currentPage: number;
  totalPages: number;
  pageList?: number[]; // Added for legacy support
}

export type UsdaSearchResponse = USDASearchResponse; // Legacy alias

export interface USDAFoodItem {
  fdcId: number;
  description: string;
  dataType: string;
  publicationDate?: string;
  brandOwner?: string;
  brandName?: string; // Added for legacy support
  ingredients?: string;
  foodCode?: string; // Added for legacy support
  servingSize?: number;
  servingSizeUnit?: string;
  householdServingFullText?: string;
  foodNutrients: USDAFoodNutrient[];
}

export type UsdaFoodSearchResult = USDAFoodItem; // Legacy alias

export interface USDAFoodNutrient {
  nutrientId: number;
  nutrientName: string;
  nutrientNumber: string;
  unitName: string;
  value: number;
}

export interface USDANutrient {
  id: number;
  number: string;
  name: string;
  rank: number;
  unitName: string;
}

export interface USDAApiError {
  error: {
    code: string;
    message: string;
  };
}
