'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NutrientProgressCard } from './NutrientProgressCard';
import type { NutrientProgress } from '@/lib/types/supplements';
import { NUTRIENTS } from '@/constants/nutrients';

interface NutrientProgressGridProps {
  progressData: NutrientProgress[];
  showEmpty?: boolean;
}

export function NutrientProgressGrid({
  progressData,
  showEmpty = true,
}: NutrientProgressGridProps) {
  // Filter and group by category
  const vitamins = progressData.filter((p) => {
    const nutrient = NUTRIENTS[p.nutrientKey];
    return nutrient?.category === 'vitamin';
  });

  const minerals = progressData.filter((p) => {
    const nutrient = NUTRIENTS[p.nutrientKey];
    return nutrient?.category === 'mineral';
  });

  // Filter out empty ones if showEmpty is false
  const displayVitamins = showEmpty ? vitamins : vitamins.filter((p) => p.total > 0);
  const displayMinerals = showEmpty ? minerals : minerals.filter((p) => p.total > 0);

  const hasAnyProgress = progressData.some((p) => p.total > 0);

  if (!hasAnyProgress && !showEmpty) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <p>Take supplements to see your nutrient progress.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {displayVitamins.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Vitamins</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {displayVitamins.map((progress) => (
              <NutrientProgressCard key={progress.nutrientKey} progress={progress} />
            ))}
          </CardContent>
        </Card>
      )}

      {displayMinerals.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Minerals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {displayMinerals.map((progress) => (
              <NutrientProgressCard key={progress.nutrientKey} progress={progress} />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
