'use client';

import { memo, useMemo } from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from 'recharts';
import { VITAMINS, MINERALS } from '@/constants/nutrients';
import type { NutritionalValues, NutritionalTargets } from '@/lib/types/health';

interface MicrosRadialWheelProps {
  actual: NutritionalValues;
  targets: NutritionalTargets;
}

function getProgressColor(percentage: number): string {
  if (percentage >= 100) return '#22c55e'; // green
  if (percentage >= 50) return '#eab308'; // yellow
  return '#ef4444'; // red
}

interface TooltipPayloadItem {
  payload: {
    name: string;
    fill: string;
    fullValue: number;
  };
}

interface MicrosTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}

function MicrosTooltip({ active, payload }: MicrosTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background border rounded-lg shadow-lg p-3">
        <p className="font-medium text-sm">{data.name}</p>
        <p className="text-xs text-muted-foreground">Average completion</p>
        <p className="text-sm font-medium" style={{ color: data.fill }}>
          {data.fullValue}%
        </p>
      </div>
    );
  }
  return null;
}

export const MicrosRadialWheel = memo(function MicrosRadialWheel({
  actual,
  targets,
}: MicrosRadialWheelProps) {
  // Calculate average completion for vitamins
  const vitaminStats = useMemo(() => {
    let total = 0;
    let count = 0;

    VITAMINS.forEach((vitamin) => {
      const actualValue = actual[vitamin.key] ?? 0;
      const targetValue = (targets as unknown as Record<string, number>)[vitamin.key] ?? 0;
      if (targetValue > 0) {
        total += Math.min((actualValue / targetValue) * 100, 200); // Cap at 200%
        count++;
      }
    });

    const average = count > 0 ? Math.round(total / count) : 0;
    return { average, count };
  }, [actual, targets]);

  // Calculate average completion for minerals
  const mineralStats = useMemo(() => {
    let total = 0;
    let count = 0;

    MINERALS.forEach((mineral) => {
      const actualValue = actual[mineral.key] ?? 0;
      const targetValue = (targets as unknown as Record<string, number>)[mineral.key] ?? 0;
      if (targetValue > 0) {
        total += Math.min((actualValue / targetValue) * 100, 200); // Cap at 200%
        count++;
      }
    });

    const average = count > 0 ? Math.round(total / count) : 0;
    return { average, count };
  }, [actual, targets]);

  const chartData = [
    {
      name: 'Minerals',
      value: Math.min(mineralStats.average, 100),
      fill: getProgressColor(mineralStats.average),
      fullValue: mineralStats.average,
    },
    {
      name: 'Vitamins',
      value: Math.min(vitaminStats.average, 100),
      fill: getProgressColor(vitaminStats.average),
      fullValue: vitaminStats.average,
    },
  ];

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[180px] h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="40%"
            outerRadius="100%"
            barSize={15}
            data={chartData}
            startAngle={90}
            endAngle={-270}
          >
            <RadialBar
              background={{ fill: 'hsl(var(--muted))' }}
              dataKey="value"
              cornerRadius={8}
            />
            <Tooltip content={<MicrosTooltip />} />
          </RadialBarChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-lg font-bold">
            {Math.round((vitaminStats.average + mineralStats.average) / 2)}%
          </span>
          <span className="text-[10px] text-muted-foreground">Micros</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-3">
        <div className="flex items-center gap-1.5">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: getProgressColor(vitaminStats.average) }}
          />
          <div className="text-xs">
            <span className="text-muted-foreground">Vitamins</span>
            <span className="font-medium ml-1">{vitaminStats.average}%</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: getProgressColor(mineralStats.average) }}
          />
          <div className="text-xs">
            <span className="text-muted-foreground">Minerals</span>
            <span className="font-medium ml-1">{mineralStats.average}%</span>
          </div>
        </div>
      </div>
    </div>
  );
});
