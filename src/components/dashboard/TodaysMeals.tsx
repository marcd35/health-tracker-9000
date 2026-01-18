'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Utensils } from 'lucide-react';

interface FoodEntry {
  foodId: string;
  foodName: string;
  amount: number;
}

interface MealLog {
  id: string;
  mealType: string;
  foods: FoodEntry[];
  totalNutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

interface TodaysMealsProps {
  meals: MealLog[];
}

export function TodaysMeals({ meals }: TodaysMealsProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Utensils className="h-4 w-4 text-muted-foreground" />
          Today&apos;s Meals
        </CardTitle>
      </CardHeader>
      <CardContent>
        {meals.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No meals logged yet today.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Meal</TableHead>
                <TableHead>Foods</TableHead>
                <TableHead className="text-right">Calories</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {meals.map((meal) => (
                <TableRow key={meal.id}>
                  <TableCell className="font-medium capitalize">{meal.mealType}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {meal.foods.map((food, i) => (
                        <span key={i} className="text-xs bg-muted px-1.5 py-0.5 rounded-sm">
                          {food.foodName} ({food.amount}g)
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {Math.round(meal.totalNutrition.calories)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
