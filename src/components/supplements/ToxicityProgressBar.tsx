'use client';

import { AlertCircle, Check, AlertTriangle } from 'lucide-react'; // Used by getToxicityStatus
import type { NutrientProgress } from '@/lib/types/supplements';
import type { NutrientInfo } from '@/lib/types/supplements';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface ToxicityStatus {
  status: 'safe' | 'warning' | 'toxic';
  icon: typeof Check | typeof AlertTriangle | typeof AlertCircle;
  color: string;
  title: string;
}

// Helper function to determine toxicity status
export function getToxicityStatus(
  nutrient: NutrientProgress,
  nutrientInfo: NutrientInfo
): ToxicityStatus {
  const { total } = nutrient;
  const { warningLevel, toxicLevel } = nutrientInfo;

  // If no toxicity tracking, default to safe
  if (!toxicLevel) {
    return {
      status: 'safe',
      icon: Check,
      color: 'text-green-600',
      title: 'Within safe range',
    };
  }

  // Determine status based on toxicity levels
  if (total > toxicLevel) {
    return {
      status: 'toxic',
      icon: AlertCircle,
      color: 'text-red-600',
      title: 'Exceeds toxic limit!',
    };
  }

  if (warningLevel && total > warningLevel) {
    return {
      status: 'warning',
      icon: AlertTriangle,
      color: 'text-yellow-600',
      title: 'Approaching toxic limits',
    };
  }

  return {
    status: 'safe',
    icon: Check,
    color: 'text-green-600',
    title: 'Within safe range',
  };
}

interface ToxicityProgressBarProps {
  nutrient: NutrientProgress;
  nutrientInfo: NutrientInfo;
}

export function ToxicityProgressBar({ nutrient, nutrientInfo }: ToxicityProgressBarProps) {
  const { total, target } = nutrient;
  const { warningLevel, toxicLevel } = nutrientInfo;

  // Calculate percentage of target (0-100% = reaching daily goal)
  const percentageOfTarget = target > 0 ? (total / target) * 100 : 0;

  // Determine toxicity status for color-coding the progress bar
  const toxicityStatus = getToxicityStatus(nutrient, nutrientInfo);

  // Get progress bar color based on toxicity status
  const getProgressColor = (status: 'safe' | 'warning' | 'toxic'): string => {
    switch (status) {
      case 'toxic':
        return 'bg-red-600';
      case 'warning':
        return 'bg-yellow-600';
      case 'safe':
      default:
        return 'bg-green-500';
    }
  };

  // Get RGB color for gradients (inline styles require actual color values)
  const getGradientColor = (status: 'safe' | 'warning' | 'toxic'): string => {
    switch (status) {
      case 'toxic':
        return 'rgb(220 38 38)'; // red-600
      case 'warning':
        return 'rgb(202 138 4)'; // yellow-600
      case 'safe':
      default:
        return 'rgb(34 197 94)'; // green-500
    }
  };

  const progressColor = getProgressColor(toxicityStatus.status);

  // Segment rendering helper
  const renderGoalZoneSegments = () => {
    // When 100% goal is reached, show solid fill instead of segments
    if (percentageOfTarget >= 100) {
      return (
        <div
          className={cn('h-full w-full transition-all duration-500 rounded-none', progressColor)}
        />
      );
    }

    // Show segmented progress for < 100%
    const TOTAL_SEGMENTS = 10;
    const segmentSize = 100 / TOTAL_SEGMENTS; // 10% per segment

    return Array.from({ length: TOTAL_SEGMENTS }, (_, index) => {
      const segmentStartPercent = index * segmentSize;
      const segmentEndPercent = (index + 1) * segmentSize;

      const isFilled = percentageOfTarget >= segmentEndPercent;
      const isPartial =
        percentageOfTarget > segmentStartPercent && percentageOfTarget < segmentEndPercent;
      const isEmpty = percentageOfTarget <= segmentStartPercent;

      // Calculate partial fill percentage for gradient
      const partialFillPercent = isPartial
        ? ((percentageOfTarget - segmentStartPercent) / segmentSize) * 100
        : 0;

      return (
        <div
          key={index}
          className={cn(
            'h-full flex-1 rounded-none transition-all duration-500 border border-white/20',
            {
              [progressColor]: isFilled,
              'bg-slate-100 dark:bg-slate-700': isEmpty,
            }
          )}
          style={
            isPartial
              ? {
                  background: `linear-gradient(to right, ${getGradientColor(toxicityStatus.status)} ${partialFillPercent}%, rgb(241 245 250) ${partialFillPercent}%)`,
                }
              : undefined
          }
        />
      );
    });
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {/* Main progress bar container */}
          <div className="relative h-4 w-full bg-secondary/30 overflow-hidden flex">
            {/* Goal zone (full width) - 10 segments */}
            <div className="relative w-full flex gap-0.5 items-stretch">
              {renderGoalZoneSegments()}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-2 text-sm">
            <div className="font-semibold">Nutrient Status</div>
            <div>
              Daily Goal: {target.toFixed(1)} {nutrient.unit}
            </div>
            <div>
              Current Intake: {total.toFixed(1)} {nutrient.unit}
            </div>
            <div>Progress: {percentageOfTarget.toFixed(0)}%</div>
            {warningLevel && (
              <div className="text-yellow-600">
                Warning Level: {warningLevel} {nutrient.unit}
              </div>
            )}
            {toxicLevel && (
              <>
                <div className="text-red-600">
                  Toxic Limit: {toxicLevel} {nutrient.unit}
                </div>
                <div className="pt-2 border-t border-muted-foreground/30">
                  {total > toxicLevel && (
                    <div className="text-red-600 font-semibold">⚠️ Exceeds toxic limit!</div>
                  )}
                  {warningLevel && total > warningLevel && total <= toxicLevel && (
                    <div className="text-yellow-600 font-semibold">⚠️ Approaching toxic limits</div>
                  )}
                  {warningLevel && total <= warningLevel && (
                    <div className="text-green-600">✓ Within safe range</div>
                  )}
                  {!warningLevel && total <= toxicLevel && (
                    <div className="text-green-600">✓ Within safe range</div>
                  )}
                </div>
              </>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
