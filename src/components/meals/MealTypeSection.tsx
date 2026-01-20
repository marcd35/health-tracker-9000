'use client';

import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ChevronDown,
  ChevronRight,
  Trash2,
  Pencil,
  Copy,
  Search,
  Loader2,
  Star,
} from 'lucide-react';
import { MealCalorieSegmentBar } from './MealCalorieSegmentBar';
import { useHealthStore } from '@/lib/store/healthStore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { MealLog } from '@/lib/types/health';

interface MealTypeSectionProps {
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  meals: MealLog[];
  dailyCalorieTarget: number;
  onEditMeal: (meal: MealLog) => void;
  onCopyMeal: (meal: MealLog) => void;
  onInspectFood: (foodId: string) => void;
  onSaveFavorite?: (meal: MealLog) => void;
}

const MEAL_EMOJIS = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snack: '🍎',
};

const MEAL_TITLES = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snacks',
};

export function MealTypeSection({
  mealType,
  meals,
  dailyCalorieTarget,
  onEditMeal,
  onCopyMeal,
  onInspectFood,
  onSaveFavorite,
}: MealTypeSectionProps) {
  const [isOpen, setIsOpen] = useState(meals.length > 0);
  const [mealToDelete, setMealToDelete] = useState<string | null>(null);
  const [editingAmount, setEditingAmount] = useState<{
    mealId: string;
    foodIndex: number;
    value: string;
  } | null>(null);
  const [isSavingAmount, setIsSavingAmount] = useState(false);

  const { deleteMeal, updateMeal } = useHealthStore();

  // Calculate totals for this meal type
  const totalCalories = meals.reduce((sum, meal) => sum + (meal.totalNutrition.calories || 0), 0);
  const totalProtein = meals.reduce((sum, meal) => sum + (meal.totalNutrition.protein || 0), 0);
  const totalCarbs = meals.reduce((sum, meal) => sum + (meal.totalNutrition.carbs || 0), 0);
  const totalFat = meals.reduce((sum, meal) => sum + (meal.totalNutrition.fat || 0), 0);

  const handleDelete = async () => {
    if (mealToDelete) {
      await deleteMeal(mealToDelete);
      setMealToDelete(null);
    }
  };

  const handleAmountSave = async (meal: MealLog, foodIndex: number, newAmount: number) => {
    if (newAmount <= 0 || isNaN(newAmount)) {
      setEditingAmount(null);
      return;
    }

    const currentFood = meal.foods[foodIndex];
    if (currentFood.amount === newAmount) {
      setEditingAmount(null);
      return;
    }

    setIsSavingAmount(true);
    try {
      const updatedFoods = meal.foods.map((f, i) =>
        i === foodIndex ? { ...f, amount: newAmount } : f
      );
      await updateMeal(meal.id, { foods: updatedFoods });
    } catch {
      // Error handled by store
    }
    setIsSavingAmount(false);
    setEditingAmount(null);
  };

  return (
    <>
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border rounded-lg">
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between p-4 bg-card hover:bg-muted transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{MEAL_EMOJIS[mealType]}</span>
              <div className="text-left">
                <h3 className="font-medium">{MEAL_TITLES[mealType]}</h3>
                <p className="text-xs text-muted-foreground">
                  {meals.length} {meals.length === 1 ? 'meal' : 'meals'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {meals.length > 0 && (
                <>
                  <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
                    <span>
                      P:{' '}
                      <span className="font-medium text-foreground">
                        {Math.round(totalProtein)}g
                      </span>
                    </span>
                    <span>
                      C:{' '}
                      <span className="font-medium text-foreground">{Math.round(totalCarbs)}g</span>
                    </span>
                    <span>
                      F:{' '}
                      <span className="font-medium text-foreground">{Math.round(totalFat)}g</span>
                    </span>
                  </div>
                  <span className="font-bold text-sm">{Math.round(totalCalories)} kcal</span>
                </>
              )}
              {isOpen ? (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-t">
            {meals.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No {mealType} logged yet today.
              </p>
            ) : (
              <div className="divide-y">
                {meals.map((meal) => (
                  <div key={meal.id} className="p-4 pl-6 space-y-3 bg-card">
                    {/* Meal header with calorie bar */}
                    <div className="flex items-center justify-between">
                      <MealCalorieSegmentBar
                        mealCalories={meal.totalNutrition.calories || 0}
                        dailyTarget={dailyCalorieTarget}
                        mealType={mealType}
                      />
                      <div className="flex items-center gap-1">
                        {onSaveFavorite && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-amber-500 hover:text-amber-600"
                            onClick={() => onSaveFavorite(meal)}
                            title="Save as favorite"
                          >
                            <Star className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onCopyMeal(meal)}
                          title="Copy meal to today"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onEditMeal(meal)}
                          title="Edit meal"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setMealToDelete(meal.id)}
                          title="Delete meal"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Foods list */}
                    <div className="space-y-2 pl-2">
                      {meal.foods.map((food, foodIndex) => (
                        <div
                          key={foodIndex}
                          className="flex items-center justify-between text-sm group"
                        >
                          <button
                            onClick={() => onInspectFood(food.foodId)}
                            className="flex items-center gap-1.5 hover:text-primary transition-colors text-left"
                          >
                            <span className="truncate max-w-[200px]">{food.foodName}</span>
                            <Search className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>

                          {/* Inline amount edit */}
                          <div className="flex items-center gap-1">
                            {editingAmount?.mealId === meal.id &&
                            editingAmount?.foodIndex === foodIndex ? (
                              <div className="flex items-center gap-1">
                                <Input
                                  type="number"
                                  value={editingAmount.value}
                                  onChange={(e) =>
                                    setEditingAmount({ ...editingAmount, value: e.target.value })
                                  }
                                  onBlur={() =>
                                    handleAmountSave(meal, foodIndex, parseInt(editingAmount.value))
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleAmountSave(
                                        meal,
                                        foodIndex,
                                        parseInt(editingAmount.value)
                                      );
                                    } else if (e.key === 'Escape') {
                                      setEditingAmount(null);
                                    }
                                  }}
                                  className="w-16 h-6 text-xs"
                                  autoFocus
                                  disabled={isSavingAmount}
                                />
                                {isSavingAmount && <Loader2 className="h-3 w-3 animate-spin" />}
                              </div>
                            ) : (
                              <button
                                onClick={() =>
                                  setEditingAmount({
                                    mealId: meal.id,
                                    foodIndex,
                                    value: food.amount.toString(),
                                  })
                                }
                                className="text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {food.amount}g
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Meal totals */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                      <span>{Math.round(meal.totalNutrition.calories || 0)} kcal</span>
                      <span>P: {Math.round(meal.totalNutrition.protein || 0)}g</span>
                      <span>C: {Math.round(meal.totalNutrition.carbs || 0)}g</span>
                      <span>F: {Math.round(meal.totalNutrition.fat || 0)}g</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Delete confirmation dialog */}
      <Dialog open={!!mealToDelete} onOpenChange={(open) => !open && setMealToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Meal?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete this meal from your log.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setMealToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
