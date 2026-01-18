'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Activity } from 'lucide-react';

interface HealthScoreCardProps {
  score: number;
  breakdown: {
    macros: number;
    micros: number;
    supplements: number;
    hydration: number;
  };
}

export function HealthScoreCard({ score, breakdown }: HealthScoreCardProps) {
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
          />
          <ScoreItem
            label="Micros"
            value={breakdown.micros}
            color={getProgressColor(breakdown.micros)}
          />
          <ScoreItem
            label="Supplements"
            value={breakdown.supplements}
            color={getProgressColor(breakdown.supplements)}
          />
          <ScoreItem
            label="Hydration"
            value={breakdown.hydration}
            color={getProgressColor(breakdown.hydration)}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function ScoreItem({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span>{label}</span>
        <span className="font-medium">{value}%</span>
      </div>
      <Progress value={value} className="h-1" indicatorClassName={color} />
    </div>
  );
}
