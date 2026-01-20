'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingDown, TrendingUp } from 'lucide-react';
import type { MonthlyCalorieData, WeeklyMetrics } from '@/lib/types/calorieTracking';

interface TrendAnalysisCardProps {
  monthlyData: MonthlyCalorieData;
}

export function TrendAnalysisCard({ monthlyData }: TrendAnalysisCardProps) {
  if (!monthlyData) {
    return null;
  }

  // Calculate trend direction and percentage change
  const calculateTrend = () => {
    if (!monthlyData.weeks || monthlyData.weeks.length < 2) {
      return { direction: 'stable' as const, percentageChange: 0 };
    }

    // Compare first half and second half of month
    const midpoint = Math.floor(monthlyData.weeks.length / 2);
    const firstHalfWeeks = monthlyData.weeks.slice(0, midpoint);
    const secondHalfWeeks = monthlyData.weeks.slice(midpoint);

    const firstHalfAvg =
      firstHalfWeeks.reduce((sum, week) => sum + week.weeklyConsumed, 0) / firstHalfWeeks.length;
    const secondHalfAvg =
      secondHalfWeeks.reduce((sum, week) => sum + week.weeklyConsumed, 0) / secondHalfWeeks.length;

    const percentageChange = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;

    if (percentageChange > 5) {
      return { direction: 'up' as const, percentageChange: Math.round(percentageChange) };
    } else if (percentageChange < -5) {
      return { direction: 'down' as const, percentageChange: Math.round(Math.abs(percentageChange)) };
    } else {
      return { direction: 'stable' as const, percentageChange: 0 };
    }
  };

  // Find best week
  const getBestWeek = (): WeeklyMetrics | null => {
    if (!monthlyData.weeks || monthlyData.weeks.length === 0) return null;

    return monthlyData.weeks.reduce((best, current) => {
      const currentOnPace = current.onPacePercentage;
      const bestOnPace = best.onPacePercentage;
      return currentOnPace > bestOnPace ? current : best;
    });
  };

  // Calculate insights
  const trend = calculateTrend();
  const bestWeek = getBestWeek();
  const goalAchievementRate = Math.round(
    (monthlyData.daysMetGoal / monthlyData.daysTotal) * 100
  );

  // Generate insight message
  const getInsightMessage = (): string => {
    if (trend.direction === 'up') {
      return `Your consumption is trending up by ${trend.percentageChange}%. Consider adjusting portions to maintain your goal.`;
    } else if (trend.direction === 'down') {
      return `Great progress! Your consumption is trending down by ${trend.percentageChange}%. Keep up the discipline!`;
    } else {
      return `You're maintaining a stable calorie intake throughout the month. Stay consistent!`;
    }
  };

  const trendIcon = trend.direction === 'up' ? (
    <TrendingUp className="w-5 h-5 text-red-500" />
  ) : trend.direction === 'down' ? (
    <TrendingDown className="w-5 h-5 text-green-500" />
  ) : (
    <div className="w-5 h-5 text-blue-500 flex items-center justify-center">→</div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {trendIcon}
          Trend Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Trend Direction */}
        <div className="flex items-start justify-between pb-4 border-b border-border">
          <div>
            <p className="text-sm text-muted-foreground">Monthly Trend</p>
            <p className="text-lg font-semibold capitalize">
              {trend.direction}
              {trend.percentageChange > 0 && ` (${trend.percentageChange}%)`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Days on Track</p>
            <p className="text-lg font-semibold">
              {monthlyData.daysMetGoal} of {monthlyData.daysTotal}
            </p>
          </div>
        </div>

        {/* Achievement Rate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Goal Achievement Rate</p>
            <p className="text-sm font-semibold">{goalAchievementRate}%</p>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
              style={{ width: `${Math.min(goalAchievementRate, 100)}%` }}
            />
          </div>
        </div>

        {/* Best Week */}
        {bestWeek && (
          <div className="space-y-2 pt-2 border-t border-border">
            <p className="text-sm font-medium">Best Week</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-accent/50 p-2">
                <p className="text-xs text-muted-foreground">Consumed</p>
                <p className="font-semibold">{Math.round(bestWeek.weeklyConsumed)} cal</p>
              </div>
              <div className="rounded-lg bg-accent/50 p-2">
                <p className="text-xs text-muted-foreground">Target</p>
                <p className="font-semibold">{Math.round(bestWeek.weeklyTarget)} cal</p>
              </div>
            </div>
          </div>
        )}

        {/* Insight Message */}
        <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-900 dark:text-blue-100">{getInsightMessage()}</p>
        </div>
      </CardContent>
    </Card>
  );
}
