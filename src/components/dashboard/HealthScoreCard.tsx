'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Activity, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface HealthScoreCardProps {
  score: number;
  breakdown: {
    macros: number;
    micros: number;
    supplements: number;
    hydration: number;
  };
  hydrationEnabled?: boolean;
}

export function HealthScoreCard({
  score,
  breakdown,
  hydrationEnabled = true,
}: HealthScoreCardProps) {
  const getScoreColor = (value: number) => {
    if (value >= 80) return 'text-green-500';
    if (value >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getProgressColor = (value: number) => {
    if (value >= 80) return 'bg-green-500';
    if (value >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">Daily Health Score</CardTitle>
        <Activity className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-4">
          <div className={cn('text-5xl font-bold mb-2', getScoreColor(score))}>{score}</div>
          <p className="text-xs text-muted-foreground">Overall Compliance</p>
        </div>

        <div className="space-y-3 mt-4">
          <ScoreItem
            label="Macros"
            value={breakdown.macros}
            color={getProgressColor(breakdown.macros)}
            description="Balance of protein, carbs, and fats relative to your daily targets."
          />
          <ScoreItem
            label="Micros"
            value={breakdown.micros}
            color={getProgressColor(breakdown.micros)}
            description="Adherence to vitamin and mineral goals (e.g., Vitamin C, Magnesium, Zinc)."
          />
          <ScoreItem
            label="Supplements"
            value={breakdown.supplements}
            color={getProgressColor(breakdown.supplements)}
            description="Percentage of scheduled supplements taken today."
          />
          {hydrationEnabled && (
            <ScoreItem
              label="Hydration"
              value={breakdown.hydration}
              color={getProgressColor(breakdown.hydration)}
              description="Tracking liquid intake (currently based on meal hydration values)."
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ScoreItem({
  label,
  value,
  color,
  description,
}: {
  label: string;
  value: number;
  color: string;
  description: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 text-muted-foreground">
          {label}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3 w-3 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>{description}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <span className="font-medium">{value}%</span>
      </div>
      <Progress value={value} className="h-1" indicatorClassName={color} />
    </div>
  );
}
