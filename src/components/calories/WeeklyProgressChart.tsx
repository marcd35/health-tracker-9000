'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { WeeklyProgressData } from '@/lib/types/calorieTracking';

interface WeeklyProgressChartProps {
  data: WeeklyProgressData;
  goalType: 'weight_loss' | 'maintenance' | 'gain';
}

export function WeeklyProgressChart({ data, goalType }: WeeklyProgressChartProps) {
  if (!data || !data.days || data.days.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weekly Progress</CardTitle>
          <CardDescription>No data available for this week</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Format days for chart display
  const chartData = data.days.map((day, index) => ({
    name: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
    consumed: day.caloriesConsumed,
    target: day.caloriesTarget,
    goalMet: day.goalMet ? 1 : 0,
    date: day.date,
  }));

  // Calculate status color
  const getStatusColor = () => {
    if (goalType === 'weight_loss') {
      return data.onPacePercentage >= 100 ? 'text-green-600' : 'text-amber-600';
    } else if (goalType === 'gain') {
      return data.onPacePercentage >= 100 ? 'text-green-600' : 'text-amber-600';
    } else {
      // maintenance
      return data.onPacePercentage >= 80 ? 'text-green-600' : 'text-amber-600';
    }
  };

  const getStatusMessage = () => {
    if (goalType === 'weight_loss') {
      return `${data.daysMetGoal} of ${data.days.length} days on track`;
    } else if (goalType === 'gain') {
      return `${data.daysMetGoal} of ${data.days.length} days met target`;
    } else {
      return `${data.daysMetGoal} of ${data.days.length} days within range`;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Weekly Progress</CardTitle>
            <CardDescription>Daily calorie consumption vs target</CardDescription>
          </div>
          <div className="text-right">
            <div className={`text-sm font-semibold ${getStatusColor()}`}>
              {data.onPacePercentage}% on pace
            </div>
            <p className="text-xs text-muted-foreground">{getStatusMessage()}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              formatter={(value: number) => `${Math.round(value)} cal`}
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar dataKey="consumed" fill="#ef4444" name="Consumed" radius={[8, 8, 0, 0]} />
            <Bar dataKey="target" fill="#8b5cf6" name="Target" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

        {/* Weekly Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-accent/50 p-3">
            <p className="text-xs text-muted-foreground">Weekly Total</p>
            <p className="text-lg font-semibold">{Math.round(data.weeklyConsumed)} cal</p>
          </div>
          <div className="rounded-lg bg-accent/50 p-3">
            <p className="text-xs text-muted-foreground">Weekly Target</p>
            <p className="text-lg font-semibold">{Math.round(data.weeklyTarget)} cal</p>
          </div>
          <div className="rounded-lg bg-accent/50 p-3">
            <p className="text-xs text-muted-foreground">Average/Day</p>
            <p className="text-lg font-semibold">{Math.round(data.weeklyAverage)} cal</p>
          </div>
          <div className="rounded-lg bg-accent/50 p-3">
            <p className="text-xs text-muted-foreground">Projection</p>
            <p className="text-lg font-semibold">{Math.round(data.projection)} cal</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
