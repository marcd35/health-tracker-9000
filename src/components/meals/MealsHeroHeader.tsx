'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { MacrosRadialWheel } from './MacrosRadialWheel';
import { MicrosRadialWheel } from './MicrosRadialWheel';
import { SegmentedCalorieBar } from './SegmentedCalorieBar';
import { InlineEditableTarget } from './InlineEditableTarget';
import type { NutritionalValues, NutritionalTargets } from '@/lib/types/health';
import { useHealthStore } from '@/lib/store/healthStore';

interface MealsHeroHeaderProps {
  totalNutrition: NutritionalValues;
  targets: NutritionalTargets;
  onLogMeal: () => void;
}

export function MealsHeroHeader({ totalNutrition, targets, onLogMeal }: MealsHeroHeaderProps) {
  const { updateProfile, profile } = useHealthStore();

  const handleTargetUpdate = async (field: string, value: number) => {
    if (profile?.targets) {
      await updateProfile({
        targets: {
          ...profile.targets,
          [field]: value,
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Title and action */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meal Logging</h1>
          <p className="text-muted-foreground">
            Track your intake and monitor nutritional balance.
          </p>
        </div>
        <Button onClick={onLogMeal} className="gap-2">
          <Plus className="h-4 w-4" />
          Log Meal
        </Button>
      </div>

      {/* Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 rounded-xl border bg-card">
        {/* Macros Wheel */}
        <div className="flex flex-col items-center space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">Macronutrients</h3>
          <MacrosRadialWheel
            actual={{
              protein: totalNutrition.protein || 0,
              carbs: totalNutrition.carbs || 0,
              fat: totalNutrition.fat || 0,
            }}
            targets={{
              protein: targets.protein || 150,
              carbs: targets.carbs || 250,
              fat: targets.fat || 65,
            }}
          />
          {/* Inline editable targets */}
          <div className="flex flex-wrap justify-center gap-2">
            <InlineEditableTarget
              value={targets.protein || 150}
              label="P"
              unit="g"
              onSave={(v) => handleTargetUpdate('protein', v)}
            />
            <InlineEditableTarget
              value={targets.carbs || 250}
              label="C"
              unit="g"
              onSave={(v) => handleTargetUpdate('carbs', v)}
            />
            <InlineEditableTarget
              value={targets.fat || 65}
              label="F"
              unit="g"
              onSave={(v) => handleTargetUpdate('fat', v)}
            />
          </div>
        </div>

        {/* Micros Wheel */}
        <div className="flex flex-col items-center space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">Micronutrients</h3>
          <MicrosRadialWheel actual={totalNutrition} targets={targets} />
          <p className="text-xs text-muted-foreground text-center max-w-[200px]">
            Outer: Vitamins avg | Inner: Minerals avg
          </p>
        </div>

        {/* Calorie Bar */}
        <div className="flex flex-col justify-center space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground text-center">
            Daily Calorie Progress
          </h3>
          <SegmentedCalorieBar
            actual={totalNutrition.calories || 0}
            target={targets.calories || 2000}
          />
          <div className="flex justify-center">
            <InlineEditableTarget
              value={targets.calories || 2000}
              label="Target"
              unit="kcal"
              onSave={(v) => handleTargetUpdate('calories', v)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
