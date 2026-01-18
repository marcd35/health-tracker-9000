'use client';

import React from 'react';
import { MealLogForm } from '@/components/forms/MealLogForm';
import { TodaysMeals } from '@/components/dashboard/TodaysMeals';

// Mock data for display
const mockMeals = [
  {
    id: '1',
    mealType: 'breakfast',
    foods: [
      { foodId: 'f1', foodName: 'Oatmeal', amount: 80 },
      { foodId: 'f2', foodName: 'Blueberries', amount: 50 },
    ],
    totalNutrition: { calories: 350, protein: 10, carbs: 65, fat: 5 },
  },
];

export default function MealsPage() {
  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Meal Logging</h1>
        <p className="text-muted-foreground">Track your intake and monitor nutritional balance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <MealLogForm />
        </div>
        <div>
          <TodaysMeals meals={mockMeals} />
        </div>
      </div>
    </div>
  );
}
