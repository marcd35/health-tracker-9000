'use client';

import { memo, useEffect, useState } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WeeklyTrendChartProps {
  data: {
    date: string;
    score: number;
    weight: number;
  }[];
}

export const WeeklyTrendChart = memo(function WeeklyTrendChart({ data }: WeeklyTrendChartProps) {
  console.log('[DEBUG] WeeklyTrendChart rendered with data length:', data.length);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Delay rendering to ensure parent container has dimensions
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Don't render chart if no data to avoid dimension warning
  if (!data || data.length === 0) {
    return (
      <Card className="h-[400px] shadow-sm border border-slate-800">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-foreground">Health Trends</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  // Don't render chart until mounted to avoid dimension warning
  if (!isMounted) {
    return (
      <Card className="h-[400px] shadow-sm border border-slate-800">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-foreground">Health Trends</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[400px] shadow-sm border border-slate-800">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-foreground">Health Trends</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="hsl(var(--muted-foreground))"
              opacity={0.3}
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'white' }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'white' }}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)',
              }}
              labelStyle={{
                fontWeight: 'bold',
                marginBottom: '4px',
                color: 'hsl(var(--foreground))',
              }}
              itemStyle={{ color: 'hsl(var(--primary))' }}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke="hsl(var(--primary))"
              strokeWidth={4}
              fillOpacity={1}
              fill="url(#colorScore)"
              animationDuration={1500}
              isAnimationActive={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
});
