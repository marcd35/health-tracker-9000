'use client';

import { LayeredProgressBar } from './LayeredProgressBar';
import type { NutrientProgress } from '@/lib/types/supplements';
import { cn } from '@/lib/utils';

interface NutrientProgressCardProps {
  progress: NutrientProgress;
  compact?: boolean;
}

export function NutrientProgressCard({
  progress,
  compact = false,
}: NutrientProgressCardProps) {
  const percentageText = `${Math.round(progress.percentage)}%`;
  const hasProgress = progress.total > 0;

  return (
    <div className={cn('space-y-1', compact ? 'py-1' : 'py-2')}>
      <div className="flex items-center justify-between text-sm">
        <span className={cn('font-medium', !hasProgress && 'text-muted-foreground')}>
          {progress.name}
        </span>
        <span
          className={cn(
            'text-xs tabular-nums',
            progress.percentage >= 100
              ? 'text-green-600 font-medium'
              : progress.percentage >= 50
                ? 'text-foreground'
                : 'text-muted-foreground'
          )}
        >
          {percentageText}
        </span>
      </div>
      <LayeredProgressBar
        contributions={progress.contributions}
        total={progress.total}
        target={progress.target}
        unit={progress.unit}
      />
    </div>
  );
}
