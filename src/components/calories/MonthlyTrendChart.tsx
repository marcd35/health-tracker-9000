'use client';

import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { MonthlyCalorieData } from '@/lib/types/calorieTracking';

interface MonthlyTrendChartProps {
  data: MonthlyCalorieData;
}

type ViewMode = 'daily' | 'weekly-average';

export function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('daily');

  if (!data || !data.weeks || data.weeks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Trend</CardTitle>
          <CardDescription>No data available for this month</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Build chart data from weeks
  const chartData = data.weeks.flatMap((week) => {
    return week.days.map((day) => ({
      date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fullDate: day.date,
      consumed: day.caloriesConsumed,
      target: day.caloriesTarget,
      goalMet: day.goalMet,
    }));
  });

  // Calculate 7-day moving average
  const chartDataWithAverage = chartData.map((day, index) => {
    const start = Math.max(0, index - 6);
    const window = chartData.slice(start, index + 1);
    const avgConsumed = Math.round(window.reduce((sum, d) => sum + d.consumed, 0) / window.length);
    const avgTarget = Math.round(window.reduce((sum, d) => sum + d.target, 0) / window.length);
    return { ...day, avgConsumed, avgTarget };
  });

  // Determine data to display based on view mode
  const displayData = viewMode === 'daily' ? chartData : chartDataWithAverage;

  // Get trend direction
  const getTrendDirection = (): string => {
    if (chartData.length < 2) return 'stable';
    const firstHalf = chartData.slice(0, Math.floor(chartData.length / 2));
    const secondHalf = chartData.slice(Math.floor(chartData.length / 2));
    const firstAvg = firstHalf.reduce((sum, d) => sum + d.consumed, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, d) => sum + d.consumed, 0) / secondHalf.length;

    if (secondAvg > firstAvg * 1.05) return '↑ Increasing';
    if (secondAvg < firstAvg * 0.95) return '↓ Decreasing';
    return '→ Stable';
  };

  const trendDirection = getTrendDirection();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Monthly Trend</CardTitle>
            <CardDescription>Daily calorie consumption pattern</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold text-blue-600">{trendDirection}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* View Mode Toggle */}
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'daily' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('daily')}
          >
            Daily View
          </Button>
          <Button
            variant={viewMode === 'weekly-average' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('weekly-average')}
          >
            7-Day Average
          </Button>
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={displayData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: '#a1a1aa' }}
            />
            <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fill: '#a1a1aa' }} />
            <Tooltip
              formatter={(value: number | undefined) =>
                value ? `${Math.round(value)} cal` : 'N/A'
              }
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--foreground))',
              }}
              cursor={{ stroke: 'hsl(var(--muted-foreground))' }}
            />
            <Legend wrapperStyle={{ color: 'hsl(var(--muted-foreground))' }} />
            {viewMode === 'daily' ? (
              <>
                <Line
                  type="monotone"
                  dataKey="consumed"
                  stroke="#ef4444"
                  name="Consumed"
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="#8b5cf6"
                  name="Target"
                  dot={false}
                  strokeDasharray="5 5"
                  isAnimationActive={false}
                />
              </>
            ) : (
              <>
                <Line
                  type="monotone"
                  dataKey="avgConsumed"
                  stroke="#ef4444"
                  name="Avg Consumed"
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="avgTarget"
                  stroke="#8b5cf6"
                  name="Avg Target"
                  dot={false}
                  strokeDasharray="5 5"
                  isAnimationActive={false}
                />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-accent/50 p-3">
            <p className="text-xs text-muted-foreground">Monthly Consumed</p>
            <p className="text-lg font-semibold">{Math.round(data.monthlyConsumed)} cal</p>
          </div>
          <div className="rounded-lg bg-accent/50 p-3">
            <p className="text-xs text-muted-foreground">Monthly Target</p>
            <p className="text-lg font-semibold">{Math.round(data.monthlyTarget)} cal</p>
          </div>
          <div className="rounded-lg bg-accent/50 p-3">
            <p className="text-xs text-muted-foreground">Avg Per Day</p>
            <p className="text-lg font-semibold">{Math.round(data.averageConsumed)} cal</p>
          </div>
          <div className="rounded-lg bg-accent/50 p-3">
            <p className="text-xs text-muted-foreground">Trend</p>
            <p className="text-lg font-semibold">{data.trend}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
