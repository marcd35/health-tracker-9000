'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Utensils, Trash2, Plus } from 'lucide-react';
import { useHealthStore } from '@/lib/store/healthStore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import Link from 'next/link';

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
  const { deleteMeal } = useHealthStore();
  const [mealToDelete, setMealToDelete] = useState<string | null>(null);

  const handleDelete = async () => {
    if (mealToDelete) {
      await deleteMeal(mealToDelete);
      setMealToDelete(null);
    }
  };

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
          <div className="py-12 text-center space-y-4">
            <p className="text-sm text-muted-foreground">No meals logged yet today.</p>
            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link href="/meals">
                <Plus className="h-3.5 w-3.5" />
                Log a Meal
              </Link>
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Meal</TableHead>
                <TableHead>Foods</TableHead>
                <TableHead className="text-right">Calories</TableHead>
                <TableHead className="w-[50px]"></TableHead>
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
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => setMealToDelete(meal.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={!!mealToDelete} onOpenChange={(open) => !open && setMealToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your logged meal.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setMealToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Meal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
