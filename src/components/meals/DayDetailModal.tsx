'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import type { DailyLog } from '@/lib/types/health';
import { format, parseISO } from 'date-fns';

interface DayDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayLog: DailyLog | null;
}

const MEAL_EMOJIS: Record<string, string> = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snack: '🍎',
};

export function DayDetailModal({ isOpen, onClose, dayLog }: DayDetailModalProps) {
  if (!dayLog) return null;

  const formattedDate = format(parseISO(dayLog.date), 'EEEE, MMMM d, yyyy');

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{formattedDate}</DialogTitle>
          <DialogDescription>
            Detailed breakdown of nutrition and supplements for this day.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="p-3 bg-muted/50 rounded-lg text-center">
              <p className="text-2xl font-bold">{Math.round(dayLog.totalNutrition.calories)}</p>
              <p className="text-xs text-muted-foreground">Calories</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-500">
                {Math.round(dayLog.totalNutrition.protein)}g
              </p>
              <p className="text-xs text-muted-foreground">Protein</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg text-center">
              <p className="text-2xl font-bold text-orange-500">
                {Math.round(dayLog.totalNutrition.carbs)}g
              </p>
              <p className="text-xs text-muted-foreground">Carbs</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg text-center">
              <p className="text-2xl font-bold text-yellow-500">
                {Math.round(dayLog.totalNutrition.fat)}g
              </p>
              <p className="text-xs text-muted-foreground">Fat</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg text-center">
              <p className="text-2xl font-bold text-emerald-500">{dayLog.healthScore}</p>
              <p className="text-xs text-muted-foreground">Health Score</p>
            </div>
          </div>

          {/* Meals section */}
          <div>
            <h3 className="font-medium mb-3">Meals ({dayLog.meals.length})</h3>
            {dayLog.meals.length === 0 ? (
              <p className="text-sm text-muted-foreground">No meals logged this day.</p>
            ) : (
              <div className="space-y-3">
                {dayLog.meals.map((meal) => (
                  <div key={meal.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{MEAL_EMOJIS[meal.mealType] || '🍽️'}</span>
                        <span className="font-medium capitalize">{meal.mealType}</span>
                      </div>
                      <span className="text-sm font-bold">
                        {Math.round(meal.totalNutrition.calories)} kcal
                      </span>
                    </div>
                    <div className="space-y-1">
                      {meal.foods.map((food, index) => (
                        <div
                          key={index}
                          className="flex justify-between text-sm text-muted-foreground"
                        >
                          <span>{food.foodName}</span>
                          <span>{food.amount}g</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Supplements section */}
          <div>
            <h3 className="font-medium mb-3">Supplements</h3>
            {dayLog.supplements.length === 0 ? (
              <p className="text-sm text-muted-foreground">No supplements logged this day.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {dayLog.supplements.map((supp) => (
                  <Badge
                    key={supp.id}
                    variant={supp.taken ? 'default' : 'outline'}
                    className={supp.taken ? '' : 'opacity-50'}
                  >
                    {supp.supplementName}
                    {supp.taken ? ' ✓' : ' ✗'}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
