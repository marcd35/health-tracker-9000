'use client';

import { AlertCircle, Check, AlertTriangle } from 'lucide-react';
import type { NutrientProgress } from '@/lib/types/supplements';
import type { NutrientInfo } from '@/lib/types/supplements';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ToxicityProgressBarProps {
  nutrient: NutrientProgress;
  nutrientInfo: NutrientInfo;
}

export function ToxicityProgressBar({ nutrient, nutrientInfo }: ToxicityProgressBarProps) {
  const { total, target } = nutrient;
  const { warningLevel, toxicLevel } = nutrientInfo;

  // Calculate percentage of target (0-100% = reaching daily goal)
  const percentageOfTarget = target > 0 ? (total / target) * 100 : 0;

  // Calculate percentage of toxic level (for the overage zone)
  const percentageOfToxic = toxicLevel && toxicLevel > 0 ? (total / toxicLevel) * 100 : 0;

  // Progress bar dimensions:
  // - Top 90% for reaching daily goal
  // - Bottom 10% for overage/toxicity zone
  const goalZonePercent = Math.min(100, (percentageOfTarget / 100) * 90); // Cap at 90%
  const overageZoneFill = toxicLevel ? Math.min(100, (percentageOfToxic / 100) * 90) : 0; // Show overage fill

  // Determine goal zone color
  let goalZoneColor = 'bg-red-900'; // Empty
  if (total > 0 && total < target) {
    goalZoneColor = 'bg-yellow-500'; // Partial
  } else if (percentageOfTarget >= 100) {
    goalZoneColor = 'bg-green-500'; // Goal met
  }

  // Determine overage zone color based on proximity to warning/toxic levels
  let overageZoneColor = 'bg-green-500'; // Safe zone (below warning)
  let overageStatus = 'Safe';
  let statusIcon = Check;

  if (toxicLevel) {
    if (total > toxicLevel) {
      overageZoneColor = 'bg-red-600'; // Toxic
      overageStatus = 'TOXIC';
      statusIcon = AlertCircle;
    } else if (warningLevel && total > warningLevel) {
      overageZoneColor = 'bg-yellow-600'; // Warning
      overageStatus = 'Warning';
      statusIcon = AlertTriangle;
    }
  }

  const StatusIcon = statusIcon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="space-y-2">
            {/* Main progress bar container */}
            <div className="relative h-8 w-full bg-secondary/30 rounded-md overflow-hidden flex">
              {/* Goal zone (90% of bar width) */}
              <div className="relative flex-1 flex items-stretch">
                <div
                  className={cn('h-full transition-all duration-500', goalZoneColor)}
                  style={{ width: `${goalZonePercent}%` }}
                />
                {/* Target marker at 100% */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-blue-600 z-10"
                  style={{ left: '100%', transform: 'translateX(-1px)' }}
                  title="100% Daily Goal"
                />
              </div>

              {/* Overage zone (10% of bar width) - always visible for toxicity awareness */}
              <div className="relative w-[10%] flex items-stretch border-l border-dashed border-muted-foreground/50">
                <div
                  className={cn('h-full transition-all duration-500', overageZoneColor)}
                  style={{ width: `${Math.min(100, (overageZoneFill * 100) / 90)}%` }}
                />
                {/* Toxic level marker */}
                {toxicLevel && (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-red-700 z-10"
                    style={{ left: '100%', transform: 'translateX(-1px)' }}
                    title={`Toxic Limit: ${toxicLevel} ${nutrient.unit}`}
                  />
                )}
              </div>
            </div>

            {/* Status indicator */}
            {total > target && toxicLevel && (
              <div className="flex items-center gap-1.5">
                <StatusIcon
                  className={cn('h-4 w-4', {
                    'text-green-600': overageStatus === 'Safe',
                    'text-yellow-600': overageStatus === 'Warning',
                    'text-red-600': overageStatus === 'TOXIC',
                  })}
                />
                <span
                  className={cn('text-xs font-medium', {
                    'text-green-600': overageStatus === 'Safe',
                    'text-yellow-600': overageStatus === 'Warning',
                    'text-red-600': overageStatus === 'TOXIC',
                  })}
                >
                  {overageStatus}
                </span>
              </div>
            )}
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
