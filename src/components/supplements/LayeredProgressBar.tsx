'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { NutrientContribution } from '@/lib/types/supplements';

interface LayeredProgressBarProps {
  contributions: NutrientContribution[];
  total: number;
  target: number;
  unit: string;
  className?: string;
}

export function LayeredProgressBar({
  contributions,
  total,
  target,
  unit,
  className,
}: LayeredProgressBarProps) {
  const percentage = target > 0 ? Math.min(100, (total / target) * 100) : 0;

  // Calculate cumulative widths for stacking using reduce
  const segments = contributions.reduce<
    Array<NutrientContribution & { left: number; width: number }>
  >((acc, c) => {
    const prevTotal = acc.reduce((sum, seg) => sum + seg.width, 0);
    const width = Math.min(c.percentage, 100 - prevTotal);
    return [...acc, { ...c, left: prevTotal, width }];
  }, []);

  const tooltipContent = (
    <div className="space-y-1 text-xs">
      <div className="font-medium">
        {total.toFixed(1)} / {target} {unit} ({percentage.toFixed(0)}%)
      </div>
      {contributions.length > 0 && (
        <div className="space-y-0.5 pt-1 border-t border-border/50">
          {contributions.map((c) => (
            <div key={c.supplementId} className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: c.color }}
              />
              <span>
                {c.supplementName}: {c.amount.toFixed(1)} {unit}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'relative h-2 w-full rounded-full bg-muted overflow-hidden cursor-pointer',
              className
            )}
          >
            {/* Base progress background */}
            <div
              className={cn(
                'absolute inset-y-0 left-0 rounded-full transition-all duration-300',
                percentage >= 100
                  ? 'bg-green-500/20'
                  : percentage >= 50
                    ? 'bg-primary/20'
                    : 'bg-yellow-500/20'
              )}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />

            {/* Layered colored segments */}
            {segments.map((segment, index) => (
              <div
                key={segment.supplementId}
                className="absolute inset-y-0 rounded-full transition-all duration-300"
                style={{
                  left: `${segment.left}%`,
                  width: `${segment.width}%`,
                  backgroundColor: segment.color,
                  opacity: 0.8 - index * 0.1, // Slight fade for layering effect
                }}
              />
            ))}

            {/* Overflow indicator */}
            {percentage > 100 && (
              <div className="absolute inset-y-0 right-0 w-1 bg-green-500 rounded-full" />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
