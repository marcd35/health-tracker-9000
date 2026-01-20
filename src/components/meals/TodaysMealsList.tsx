'use client';

import { useMemo, useState } from 'react';
import { MealTypeSection } from './MealTypeSection';
import { FoodInspectionModal } from '@/components/modals/FoodInspectionModal';
import { useHealthStore } from '@/lib/store/healthStore';
import type { MealLog } from '@/lib/types/health';

interface TodaysMealsListProps {
  meals: MealLog[];
  dailyCalorieTarget: number;
  onEditMeal: (meal: MealLog) => void;
  onCopyMeal: (meal: MealLog) => void;
  onSaveFavorite?: (meal: MealLog) => void;
}

const MEAL_ORDER: Array<'breakfast' | 'lunch' | 'dinner' | 'snack'> = [
  'breakfast',
  'lunch',
  'dinner',
  'snack',
];

export function TodaysMealsList({
  meals,
  dailyCalorieTarget,
  onEditMeal,
  onCopyMeal,
  onSaveFavorite,
}: TodaysMealsListProps) {
  const { fetchFoodById, fetchRawUSDAFood } = useHealthStore();
  const [inspectingFood, setInspectingFood] = useState<any | null>(null);

  // Group meals by type
  const mealsByType = useMemo(() => {
    const grouped: Record<string, MealLog[]> = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: [],
    };

    meals.forEach((meal) => {
      if (grouped[meal.mealType]) {
        grouped[meal.mealType].push(meal);
      }
    });

    return grouped;
  }, [meals]);

  const handleInspectFood = async (foodId: string) => {
    try {
      const fullFood = await fetchFoodById(foodId);
      if (fullFood) {
        // If it's a USDA food but missing raw data, fetch it
        if (fullFood.usdaFdcId && !fullFood.rawUSDAData) {
          const rawData = await fetchRawUSDAFood(Number(fullFood.usdaFdcId));
          if (rawData) {
            fullFood.rawUSDAData = rawData;
          }
        }
        setInspectingFood(fullFood);
      }
    } catch (error) {
      console.error('Failed to inspect food:', error);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Today&apos;s Meals</h2>
        <div className="space-y-3">
          {MEAL_ORDER.map((mealType) => (
            <MealTypeSection
              key={mealType}
              mealType={mealType}
              meals={mealsByType[mealType]}
              dailyCalorieTarget={dailyCalorieTarget}
              onEditMeal={onEditMeal}
              onCopyMeal={onCopyMeal}
              onInspectFood={handleInspectFood}
              onSaveFavorite={onSaveFavorite}
            />
          ))}
        </div>
      </div>

      {inspectingFood && (
        <FoodInspectionModal
          isOpen={!!inspectingFood}
          onClose={() => setInspectingFood(null)}
          foodName={inspectingFood.name}
          rawJson={inspectingFood.rawUSDAData}
        />
      )}
    </>
  );
}
