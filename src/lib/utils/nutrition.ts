import { Food, NutritionalValues } from '@/lib/types/health';

export function calculateNutrition(food: Food, amountGrams: number): NutritionalValues {
  const factor = amountGrams / 100;

  const result: NutritionalValues = {
    calories: Math.round((food.nutritionPer100g.calories || 0) * factor),
    protein: Math.round((food.nutritionPer100g.protein || 0) * factor * 10) / 10,
    carbs: Math.round((food.nutritionPer100g.carbs || 0) * factor * 10) / 10,
    fat: Math.round((food.nutritionPer100g.fat || 0) * factor * 10) / 10,
    fiber: Math.round((food.nutritionPer100g.fiber || 0) * factor * 10) / 10,
  };

  // Add other nutrients if they exist
  Object.keys(food.nutritionPer100g).forEach((key) => {
    if (!['calories', 'protein', 'carbs', 'fat', 'fiber'].includes(key)) {
      const value = food.nutritionPer100g[key];
      if (typeof value === 'number') {
        result[key] = Math.round(value * factor * 10) / 10;
      }
    }
  });

  return result;
}

export function sumNutrition(nutrients: NutritionalValues[]): NutritionalValues {
  const result: NutritionalValues = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
  };

  nutrients.forEach((n) => {
    Object.keys(n).forEach((key) => {
      const value = n[key];
      if (typeof value === 'number') {
        result[key] = (result[key] || 0) + value;
      }
    });
  });

  // Round values
  Object.keys(result).forEach((key) => {
    if (key === 'calories') {
      result[key] = Math.round(result[key]!);
    } else {
      result[key] = Math.round(result[key]! * 10) / 10;
    }
  });

  return result;
}
