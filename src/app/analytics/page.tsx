'use client';

import React from 'react';
import { WeeklyTrendChart } from '@/components/dashboard/WeeklyTrendChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const mockTrends = [
  { date: 'Mon', score: 75, weight: 82.5, calories: 1900 },
  { date: 'Tue', score: 82, weight: 82.3, calories: 2100 },
  { date: 'Wed', score: 70, weight: 82.4, calories: 2400 },
  { date: 'Thu', score: 88, weight: 82.1, calories: 1800 },
  { date: 'Fri', score: 92, weight: 81.9, calories: 1750 },
  { date: 'Sat', score: 85, weight: 82.0, calories: 2000 },
  { date: 'Sun', score: 85, weight: 82.0, calories: 1950 },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Advanced Analytics</h1>
        <p className="text-muted-foreground">
          Deep dive into your health trends and correlation data.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <WeeklyTrendChart data={mockTrends} />

        <Card className="h-[400px]">
          <CardHeader>
            <CardTitle>Calorie Intake Trend</CardTitle>
            <CardDescription>Daily caloric consumption vs target</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockTrends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="calories" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Avg Health Score" value="82" change="+4.5%" positive />
        <StatCard title="Protein Consistency" value="94%" change="+2.1%" positive />
        <StatCard title="Weight Variance" value="0.6kg" change="-0.2kg" positive />
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  change,
  positive,
}: {
  title: string;
  value: string;
  change: string;
  positive: boolean;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={`text-xs mt-1 ${positive ? 'text-green-500' : 'text-red-500'}`}>
          {change} from last week
        </p>
      </CardContent>
    </Card>
  );
}
