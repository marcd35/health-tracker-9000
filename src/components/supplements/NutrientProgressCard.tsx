'use client';

import { LayeredProgressBar } from './LayeredProgressBar';
import type { NutrientProgress } from '@/lib/types/supplements';
import { cn } from '@/lib/utils';
import { getNutrientColor } from '@/constants/nutrientColors';
import type { NutrientKey } from '@/constants/nutrientColors';

interface NutrientProgressCardProps {
  progress: NutrientProgress;
  compact?: boolean;
}

export function NutrientProgressCard({ progress, compact = false }: NutrientProgressCardProps) {
  const percentageText = `${Math.round(progress.percentage)}%`;
  const hasProgress = progress.total > 0;
  const isOverDRV = progress.percentage > 100;
  const nutrientColor = getNutrientColor(progress.nutrientKey as NutrientKey);

  return (
    <div className={cn('space-y-2', compact ? 'py-1' : 'py-2')}>
      <div className="flex items-center justify-between">
        <span className={cn('font-medium', !hasProgress && 'text-muted-foreground')}>
          {progress.name}
        </span>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: nutrientColor }} />
          <span
            className={cn(
              'text-sm tabular-nums font-medium',
              isOverDRV
                ? 'text-green-600 dark:text-green-400'
                : progress.percentage >= 50
                  ? 'text-foreground'
                  : 'text-muted-foreground'
            )}
          >
            {percentageText}
          </span>
        </div>
      </div>
      <LayeredProgressBar
        contributions={progress.contributions}
        total={progress.total}
        target={progress.target}
        unit={progress.unit}
        nutrientKey={progress.nutrientKey as NutrientKey}
      />
      {isOverDRV && (
        <p className="text-xs text-green-600 dark:text-green-400">
          Over DRV by {Math.round(progress.percentage - 100)}%
        </p>
      )}
    </div>
  );
}
