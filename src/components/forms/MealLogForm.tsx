'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FoodSearchInput } from './FoodSearchInput';
import { Trash2, Plus, Loader2, AlertTriangle } from 'lucide-react';
import { useHealthStore } from '@/lib/store/healthStore';
import { checkFoodForAllergens } from '@/lib/utils/allergenChecker';
import { useEffect } from 'react';

export function MealLogForm() {
  const [mealType, setMealType] = useState('breakfast');
  const [selectedFoods, setSelectedFoods] = useState<any[]>([]);
  const { addMeal, profile, fetchProfile, isLoading } = useHealthStore();

  useEffect(() => {
    if (!profile) {
      fetchProfile();
    }
  }, [profile, fetchProfile]);

  const addFood = (food: any) => {
    setSelectedFoods([...selectedFoods, { ...food, amount: 100 }]);
  };

  const removeFood = (index: number) => {
    setSelectedFoods(selectedFoods.filter((_, i) => i !== index));
  };

  const updateAmount = (index: number, amount: number) => {
    const newFoods = [...selectedFoods];
    newFoods[index].amount = amount;
    setSelectedFoods(newFoods);
  };

  const [errors, setErrors] = useState<Record<number, string>>({});

  const validate = () => {
    const newErrors: Record<number, string> = {};
    selectedFoods.forEach((food, index) => {
      if (food.amount <= 0) {
        newErrors[index] = 'Amount must be > 0';
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogMeal = async () => {
    if (selectedFoods.length === 0) return;
    if (!validate()) return;

    const today = new Date().toISOString().split('T')[0];
    await addMeal({
      date: today,
      mealType: mealType as any,
      foods: selectedFoods.map((f) => ({
        foodId: f.id,
        foodName: f.name,
        amount: f.amount,
      })),
    });
    setSelectedFoods([]);
    setErrors({});
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Log a Meal</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="meal-type">Meal Type</Label>
          <Select value={mealType} onValueChange={setMealType}>
            <SelectTrigger id="meal-type">
              <SelectValue placeholder="Select meal type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="breakfast">Breakfast</SelectItem>
              <SelectItem value="lunch">Lunch</SelectItem>
              <SelectItem value="dinner">Dinner</SelectItem>
              <SelectItem value="snack">Snack</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <Label>Add Foods</Label>
          <FoodSearchInput onSelect={addFood} />

          <div className="space-y-3 pt-2">
            {selectedFoods.map((food, index) => (
              <div
                key={index}
                className={`flex items-center gap-4 p-3 rounded-lg border ${
                  errors[index] ? 'border-destructive bg-destructive/5' : 'bg-muted/50'
                }`}
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">{food.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {food.nutritionPer100g.calories} kcal per 100g
                  </p>
                  {errors[index] && (
                    <p className="text-xs text-destructive mt-1">{errors[index]}</p>
                  )}
                  {profile &&
                    (() => {
                      const conflict = checkFoodForAllergens(food, profile);
                      if (conflict) {
                        return (
                          <div className="flex items-center gap-1.5 mt-1.5 text-amber-600 dark:text-amber-400">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            <p className="text-[11px] font-semibold">
                              Contains allergens: {conflict.allergensFound.join(', ')}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    })()}
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={food.amount}
                    onChange={(e) => {
                      updateAmount(index, parseInt(e.target.value) || 0);
                      if (errors[index]) {
                        const newErrors = { ...errors };
                        delete newErrors[index];
                        setErrors(newErrors);
                      }
                    }}
                    className={`w-20 h-8 ${errors[index] ? 'border-destructive' : ''}`}
                  />
                  <span className="text-sm text-muted-foreground">g</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive h-8 w-8"
                  onClick={() => removeFood(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-3 border-t pt-6">
        <Button variant="outline" onClick={() => setSelectedFoods([])} disabled={isLoading}>
          Clear
        </Button>
        <Button
          className="gap-2"
          onClick={handleLogMeal}
          disabled={isLoading || selectedFoods.length === 0}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Log Meal
        </Button>
      </CardFooter>
    </Card>
  );
}
