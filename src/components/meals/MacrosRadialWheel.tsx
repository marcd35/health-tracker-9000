'use client';

import { memo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface MacrosRadialWheelProps {
  actual: {
    protein: number;
    carbs: number;
    fat: number;
  };
  targets: {
    protein: number;
    carbs: number;
    fat: number;
  };
}

const COLORS = {
  protein: '#3b82f6', // blue
  carbs: '#f97316', // orange
  fat: '#eab308', // yellow
};

interface TooltipPayloadItem {
  payload: {
    name: string;
    color: string;
    actual: number;
    target: number;
    percentage: number;
  };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}

function MacrosTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background border rounded-lg shadow-lg p-3">
        <p className="font-medium text-sm" style={{ color: data.color }}>
          {data.name}
        </p>
        <p className="text-xs text-muted-foreground">
          {Math.round(data.actual)}g / {Math.round(data.target)}g
        </p>
        <p className="text-xs font-medium">{data.percentage}% of target</p>
      </div>
    );
  }
  return null;
}

export const MacrosRadialWheel = memo(function MacrosRadialWheel({
  actual,
  targets,
}: MacrosRadialWheelProps) {
  // Calculate percentages of targets
  const data = [
    {
      name: 'Protein',
      value: actual.protein,
      target: targets.protein,
      percentage: targets.protein > 0 ? Math.round((actual.protein / targets.protein) * 100) : 0,
      color: COLORS.protein,
    },
    {
      name: 'Carbs',
      value: actual.carbs,
      target: targets.carbs,
      percentage: targets.carbs > 0 ? Math.round((actual.carbs / targets.carbs) * 100) : 0,
      color: COLORS.carbs,
    },
    {
      name: 'Fat',
      value: actual.fat,
      target: targets.fat,
      percentage: targets.fat > 0 ? Math.round((actual.fat / targets.fat) * 100) : 0,
      color: COLORS.fat,
    },
  ];

  // For the donut chart, we show actual values as filled portion
  const chartData = data.map((d) => ({
    name: d.name,
    value: Math.max(d.value, 0.1), // Ensure minimum value for visibility
    color: d.color,
    percentage: d.percentage,
    actual: d.value,
    target: d.target,
  }));

  const totalMacros = actual.protein + actual.carbs + actual.fat;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[180px] h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<MacrosTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold">{Math.round(totalMacros)}</span>
          <span className="text-xs text-muted-foreground">grams</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-3">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
            <div className="text-xs">
              <span className="text-muted-foreground">{d.name}</span>
              <span className="font-medium ml-1">{Math.round(d.value)}g</span>
              <span className="text-muted-foreground ml-1">({d.percentage}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
