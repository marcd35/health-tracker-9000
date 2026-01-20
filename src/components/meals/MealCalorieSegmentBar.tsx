'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';

interface MealCalorieSegmentBarProps {
  mealCalories: number;
  dailyTarget: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  className?: string;
}

const MEAL_COLORS = {
  breakfast: 'bg-amber-500',
  lunch: 'bg-emerald-500',
  dinner: 'bg-blue-500',
  snack: 'bg-purple-500',
};

export const MealCalorieSegmentBar = memo(function MealCalorieSegmentBar({
  mealCalories,
  dailyTarget,
  mealType,
  className,
}: MealCalorieSegmentBarProps) {
  const percentage = dailyTarget > 0 ? Math.min((mealCalories / dailyTarget) * 100, 100) : 0;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-300', MEAL_COLORS[mealType])}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground w-10 text-right">
        {Math.round(percentage)}%
      </span>
    </div>
  );
});
