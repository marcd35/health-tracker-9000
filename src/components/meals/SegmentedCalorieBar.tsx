'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';

interface SegmentedCalorieBarProps {
  actual: number;
  target: number;
  className?: string;
}

export const SegmentedCalorieBar = memo(function SegmentedCalorieBar({
  actual,
  target,
  className,
}: SegmentedCalorieBarProps) {
  const TOTAL_SEGMENTS = 20;
  const percentage = target > 0 ? (actual / target) * 100 : 0;
  const filledSegments = Math.min(Math.ceil((percentage / 100) * TOTAL_SEGMENTS), TOTAL_SEGMENTS);
  const overflowPercentage = percentage > 100 ? percentage - 100 : 0;
  const overflowSegments = Math.min(
    Math.ceil((overflowPercentage / 100) * TOTAL_SEGMENTS),
    TOTAL_SEGMENTS
  );

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex justify-between items-center text-sm">
        <span className="text-muted-foreground">Calories</span>
        <span className="font-medium">
          <span className={percentage > 100 ? 'text-red-500' : ''}>{Math.round(actual)}</span>
          <span className="text-muted-foreground"> / {Math.round(target)} kcal</span>
        </span>
      </div>

      {/* Main progress bar - 20 segments */}
      <div className="flex gap-0.5">
        {Array.from({ length: TOTAL_SEGMENTS }).map((_, index) => {
          const isFilled = index < filledSegments;
          const isOverflow = percentage > 100 && isFilled;

          return (
            <div
              key={index}
              className={cn(
                'h-3 flex-1 rounded-sm transition-colors duration-200',
                isFilled
                  ? isOverflow && percentage > 120
                    ? 'bg-red-500'
                    : isOverflow
                      ? 'bg-orange-500'
                      : 'bg-emerald-500'
                  : 'bg-muted'
              )}
            />
          );
        })}
      </div>

      {/* Overflow indicator bar */}
      {overflowPercentage > 0 && (
        <div className="flex gap-0.5">
          {Array.from({ length: TOTAL_SEGMENTS }).map((_, index) => {
            const isFilled = index < overflowSegments;

            return (
              <div
                key={index}
                className={cn(
                  'h-2 flex-1 rounded-sm transition-colors duration-200',
                  isFilled ? 'bg-red-500/70' : 'bg-transparent'
                )}
              />
            );
          })}
        </div>
      )}

      {/* Percentage indicator */}
      <div className="flex justify-center">
        <span
          className={cn(
            'text-xs font-medium',
            percentage >= 100
              ? percentage > 120
                ? 'text-red-500'
                : 'text-orange-500'
              : 'text-muted-foreground'
          )}
        >
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  );
});
