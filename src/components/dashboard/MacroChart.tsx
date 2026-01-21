'use client';

import { memo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MacroChartProps {
  data: {
    protein: number;
    carbs: number;
    fat: number;
  };
}

const COLORS = ['#3b82f6', '#f97316', '#eab308'];

export const MacroChart = memo(function MacroChart({ data }: MacroChartProps) {
  const chartData = [
    { name: 'Protein', value: data.protein },
    { name: 'Carbs', value: data.carbs },
    { name: 'Fat', value: data.fat },
  ];

  const total = data.protein + data.carbs + data.fat;

  const calculatePercentage = (value: number): number => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Macro Distribution</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                itemStyle={{ color: 'hsl(var(--foreground))' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="space-y-1">
            <div className="text-xs font-medium text-blue-500">Protein</div>
            <div className="text-lg font-bold">{Math.round(data.protein)}g</div>
            <div className="text-xs text-muted-foreground">{calculatePercentage(data.protein)}%</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-medium text-orange-500">Carbs</div>
            <div className="text-lg font-bold">{Math.round(data.carbs)}g</div>
            <div className="text-xs text-muted-foreground">{calculatePercentage(data.carbs)}%</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-medium text-yellow-500">Fat</div>
            <div className="text-lg font-bold">{Math.round(data.fat)}g</div>
            <div className="text-xs text-muted-foreground">{calculatePercentage(data.fat)}%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
