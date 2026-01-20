'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { FoodSearchInput } from '@/components/forms/FoodSearchInput';
import { Trash2, Plus, Loader2, AlertTriangle, Search } from 'lucide-react';
import { useHealthStore } from '@/lib/store/healthStore';
import { checkFoodForAllergens } from '@/lib/utils/allergenChecker';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { FoodInspectionModal } from '@/components/modals/FoodInspectionModal';
import type { MealLog, Food } from '@/lib/types/health';

interface SelectedFood extends Food {
  amount: number;
  foodData?: any;
}

interface MealLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  editMeal?: MealLog;
  defaultMealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export function MealLogModal({ isOpen, onClose, editMeal, defaultMealType }: MealLogModalProps) {
  const [mealType, setMealType] = useState<string>(defaultMealType || 'breakfast');
  const [selectedFoods, setSelectedFoods] = useState<SelectedFood[]>([]);
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [inspectingFood, setInspectingFood] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addMeal, updateMeal, profile, fetchProfile, fetchFoodById, isLoading } = useHealthStore();

  const isEditMode = !!editMeal;

  // Fetch profile if not loaded
  useEffect(() => {
    if (!profile) {
      fetchProfile();
    }
  }, [profile, fetchProfile]);

  // Initialize form when editing
  useEffect(() => {
    if (editMeal && isOpen) {
      setMealType(editMeal.mealType);
      // We need to load the full food data for each food in the meal
      const loadFoods = async () => {
        const foods: SelectedFood[] = [];
        for (const food of editMeal.foods) {
          const fullFood = await fetchFoodById(food.foodId);
          if (fullFood) {
            foods.push({
              ...fullFood,
              amount: food.amount,
            });
          } else {
            // Fallback if food not found
            foods.push({
              id: food.foodId,
              name: food.foodName,
              servingSize: 100,
              servingUnit: 'g',
              nutritionPer100g: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
              amount: food.amount,
            });
          }
        }
        setSelectedFoods(foods);
      };
      loadFoods();
    } else if (!isOpen) {
      // Reset form when modal closes
      setMealType(defaultMealType || 'breakfast');
      setSelectedFoods([]);
      setErrors({});
    }
  }, [editMeal, isOpen, fetchFoodById, defaultMealType]);

  const addFood = (food: Food) => {
    setSelectedFoods([...selectedFoods, { ...food, amount: 100 }]);
    toast.success(`Added ${food.name}`);
  };

  const removeFood = (index: number) => {
    const foodName = selectedFoods[index].name;
    setSelectedFoods(selectedFoods.filter((_, i) => i !== index));
    toast.info(`Removed ${foodName}`);
  };

  const updateAmount = (index: number, amount: number) => {
    const newFoods = [...selectedFoods];
    newFoods[index].amount = amount;
    setSelectedFoods(newFoods);
  };

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

  const handleSubmit = async () => {
    if (selectedFoods.length === 0) {
      toast.error('Please add at least one food item');
      return;
    }
    if (!validate()) return;

    setIsSubmitting(true);
    const today = new Date().toISOString().split('T')[0];

    try {
      const foodsPayload = selectedFoods.map((f) => ({
        foodId: f.id,
        foodName: f.name,
        amount: f.amount,
        foodData: f.id.startsWith('usda-') ? f : undefined,
      }));

      if (isEditMode && editMeal) {
        await updateMeal(editMeal.id, {
          mealType,
          foods: foodsPayload,
        });
      } else {
        await addMeal({
          date: today,
          mealType: mealType as any,
          foods: foodsPayload,
        });
      }
      onClose();
    } catch {
      // Error is handled by store actions
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Meal' : 'Log a Meal'}</DialogTitle>
            <DialogDescription>
              {isEditMode
                ? 'Update the foods and amounts in this meal.'
                : 'Add foods to your meal and specify amounts.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
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

              <div className="space-y-3 pt-2 max-h-[300px] overflow-y-auto">
                {selectedFoods.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No foods added yet. Search and select foods above.
                  </p>
                ) : (
                  selectedFoods.map((food, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-4 p-3 rounded-lg border ${
                        errors[index] ? 'border-destructive bg-destructive/5' : 'bg-muted/50'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{food.name}</p>
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
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex items-center gap-1.5 mt-1.5 text-amber-600 dark:text-amber-400 cursor-help">
                                        <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                                        <p className="text-[11px] font-semibold truncate">
                                          Contains: {conflict.allergensFound.join(', ')}
                                        </p>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      This food contains ingredients you are allergic to:{' '}
                                      {conflict.allergensFound.join(', ')}.
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              );
                            }
                            return null;
                          })()}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
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
                      {food.rawUSDAData && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary flex-shrink-0"
                          onClick={() => setInspectingFood(food)}
                          title="Inspect raw data"
                        >
                          <Search className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive h-8 w-8 flex-shrink-0"
                        onClick={() => removeFood(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              className="gap-2"
              onClick={handleSubmit}
              disabled={isSubmitting || isLoading || selectedFoods.length === 0}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {isEditMode ? 'Update Meal' : 'Log Meal'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {inspectingFood && (
        <FoodInspectionModal
          isOpen={!!inspectingFood}
          onClose={() => setInspectingFood(null)}
          foodName={inspectingFood.name}
          rawJson={inspectingFood.rawUSDAData}
          onSave={(manualAllergens) => {
            const index = selectedFoods.findIndex((f) => f.id === inspectingFood.id);
            if (index !== -1) {
              const newFoods = [...selectedFoods];
              newFoods[index] = { ...newFoods[index], allergens: manualAllergens };
              setSelectedFoods(newFoods);
              toast.success(`Updated allergens for ${inspectingFood.name}`);
            }
          }}
        />
      )}
    </>
  );
}
