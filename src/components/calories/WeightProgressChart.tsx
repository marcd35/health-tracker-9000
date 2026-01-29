'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import type { WeightLog } from '@/lib/types/weight';

interface WeightProgressChartProps {
  logs: WeightLog[];
  goalType: 'weight_loss' | 'maintenance' | 'gain';
}

export function WeightProgressChart({ logs, goalType }: WeightProgressChartProps) {
  if (!logs || logs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weight Progress</CardTitle>
          <CardDescription>No weight data logged yet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 text-muted-foreground">
            <p>Start logging your weight to see progress over time</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort logs by date (oldest first for chart)
  const sortedLogs = [...logs].reverse();

  // Calculate stats
  const startWeight = sortedLogs[0]?.weight || 0;
  const currentWeight = sortedLogs[sortedLogs.length - 1]?.weight || 0;
  const weightChange = currentWeight - startWeight;
  const trend = Math.abs(weightChange) < 0.5 ? 'stable' : weightChange > 0 ? 'up' : 'down';

  // Format data for chart
  const chartData = sortedLogs.map((log) => ({
    date: new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weight: log.weight,
    fullDate: log.date,
  }));

  // Determine line color based on goal and trend
  const getLineColor = () => {
    if (goalType === 'weight_loss') {
      return trend === 'down' ? '#22c55e' : trend === 'up' ? '#ef4444' : '#3b82f6';
    } else if (goalType === 'gain') {
      return trend === 'up' ? '#22c55e' : trend === 'down' ? '#ef4444' : '#3b82f6';
    } else {
      // maintenance
      return trend === 'stable' ? '#22c55e' : '#f59e0b';
    }
  };

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const getTrendColor = () => {
    if (goalType === 'weight_loss') {
      return trend === 'down'
        ? 'text-green-600'
        : trend === 'up'
          ? 'text-red-600'
          : 'text-blue-600';
    } else if (goalType === 'gain') {
      return trend === 'up'
        ? 'text-green-600'
        : trend === 'down'
          ? 'text-red-600'
          : 'text-blue-600';
    } else {
      return trend === 'stable' ? 'text-green-600' : 'text-amber-600';
    }
  };

  const getTrendText = () => {
    if (trend === 'stable') return 'Maintaining';
    if (weightChange > 0) return `+${weightChange.toFixed(1)} lbs`;
    return `${weightChange.toFixed(1)} lbs`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Weight Progress</CardTitle>
            <CardDescription>Last 30 days of weight tracking</CardDescription>
          </div>
          <div className={`flex items-center gap-1 text-sm font-semibold ${getTrendColor()}`}>
            {getTrendIcon()}
            {getTrendText()}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ResponsiveContainer width="100%" height={300} minWidth={0} minHeight={0}>
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: '#a1a1aa', fontSize: 12 }}
            />
            <YAxis
              domain={['dataMin - 2', 'dataMax + 2']}
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: '#a1a1aa' }}
              label={{ value: 'Weight (lbs)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              formatter={(value: number | undefined) =>
                value ? [`${value.toFixed(1)} lbs`, 'Weight'] : ['N/A', 'Weight']
              }
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--foreground))',
              }}
              cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
            />
            <ReferenceLine
              y={startWeight}
              stroke="#8b5cf6"
              strokeDasharray="5 5"
              label={{ value: 'Start', position: 'right', fill: '#8b5cf6' }}
            />
            <Line
              type="monotone"
              dataKey="weight"
              stroke={getLineColor()}
              strokeWidth={2}
              dot={{ fill: getLineColor(), r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Weight Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg bg-accent/50 p-3">
            <p className="text-xs text-muted-foreground">Starting Weight</p>
            <p className="text-lg font-semibold">{startWeight.toFixed(1)} lbs</p>
          </div>
          <div className="rounded-lg bg-accent/50 p-3">
            <p className="text-xs text-muted-foreground">Current Weight</p>
            <p className="text-lg font-semibold">{currentWeight.toFixed(1)} lbs</p>
          </div>
          <div className="rounded-lg bg-accent/50 p-3">
            <p className="text-xs text-muted-foreground">Change</p>
            <p className={`text-lg font-semibold ${getTrendColor()}`}>
              {weightChange > 0 ? '+' : ''}
              {weightChange.toFixed(1)} lbs
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
