'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

import { useHealthStore } from '@/lib/store/healthStore';
import { AnalyticsSkeleton } from '@/components/analytics/AnalyticsSkeleton';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { Info } from 'lucide-react';
import { useEffect } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const WeeklyTrendChart = dynamic(
  () => import('@/components/dashboard/WeeklyTrendChart').then((mod) => mod.WeeklyTrendChart),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[400px] w-full rounded-xl" />,
  }
);

export default function AnalyticsPage() {
  const { weeklySummary, isLoading, fetchWeeklySummary, activeDate } = useHealthStore();

  useEffect(() => {
    fetchWeeklySummary(activeDate);
  }, [fetchWeeklySummary, activeDate]);

  const trendData = weeklySummary
    .map((day) => ({
      date: new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' }),
      score: day.healthScore,
      weight: day.weight || 0,
      calories: day.totalNutrition.calories,
    }))
    .reverse();

  if (isLoading && trendData.length === 0) {
    return <AnalyticsSkeleton />;
  }

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Advanced Analytics</h1>
        <p className="text-muted-foreground">
          Deep dive into your health trends and correlation data.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <WeeklyTrendChart data={trendData} />

        <Card className="h-[400px]">
          <CardHeader>
            <CardTitle>Calorie Intake Trend</CardTitle>
            <CardDescription>Daily caloric consumption vs target</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <ChartTooltip
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
        <StatCard
          title="Avg Health Score"
          value="82"
          change="+4.5%"
          positive
          description="The average of your daily health scores over the selected period."
        />
        <StatCard
          title="Protein Consistency"
          value="94%"
          change="+2.1%"
          positive
          description="How often you meet your daily protein target within a 10% margin."
        />
        <StatCard
          title="Weight Variance"
          value="0.6kg"
          change="-0.2kg"
          positive
          description="The variation in your morning weight readings this week."
        />
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  change,
  positive,
  description,
}: {
  title: string;
  value: string;
  change: string;
  positive: boolean;
  description: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
          {title}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground/50 hover:text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>{description}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
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
