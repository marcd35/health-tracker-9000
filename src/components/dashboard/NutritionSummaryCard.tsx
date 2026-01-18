'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface NutritionSummaryCardProps {
  actual: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  targets: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export function NutritionSummaryCard({ actual, targets }: NutritionSummaryCardProps) {
  const getPercentage = (act: number, tar: number) => Math.min(100, Math.round((act / tar) * 100));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Nutritional Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-bold">{actual.calories}</span>
            <span className="text-xs text-muted-foreground">/ {targets.calories} kcal</span>
          </div>
          <Progress value={getPercentage(actual.calories, targets.calories)} className="h-2" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <MacroItem
            label="Protein"
            actual={actual.protein}
            target={targets.protein}
            unit="g"
            color="bg-blue-500"
          />
          <MacroItem
            label="Carbs"
            actual={actual.carbs}
            target={targets.carbs}
            unit="g"
            color="bg-orange-500"
          />
          <MacroItem
            label="Fat"
            actual={actual.fat}
            target={targets.fat}
            unit="g"
            color="bg-yellow-500"
          />
        </div>
      </CardContent>
    </Card>
  );
}

function MacroItem({
  label,
  actual,
  target,
  unit,
  color,
}: {
  label: string;
  actual: number;
  target: number;
  unit: string;
  color: string;
}) {
  const percent = Math.min(100, Math.round((actual / target) * 100));
  return (
    <div className="space-y-2">
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-sm font-bold">
          {actual}
          {unit}
        </span>
      </div>
      <Progress value={percent} className="h-1.5" indicatorClassName={color} />
      <span className="text-[10px] text-muted-foreground">{percent}% of goal</span>
    </div>
  );
}
