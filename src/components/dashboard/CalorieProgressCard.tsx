'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useCalorieTrackerStore } from '@/lib/store/calorieTrackerStore';
import { ArrowRight } from 'lucide-react';

export function CalorieProgressCard() {
  const { currentGoal, todayTracking, fetchCurrentGoal, fetchDailyTracking } =
    useCalorieTrackerStore();

  useEffect(() => {
    fetchCurrentGoal();
    fetchDailyTracking();
  }, [fetchCurrentGoal, fetchDailyTracking]);

  if (!currentGoal) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Calorie Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Set a calorie goal to track your daily progress.
          </p>
          <Button asChild className="w-full">
            <Link href="/calories">Set Calorie Goal</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const dailyTarget = Math.round(currentGoal.weeklyCalorieTarget / 7);
  const consumed = todayTracking?.caloriesConsumed || 0;
  const percentage = dailyTarget > 0 ? Math.min(100, (consumed / dailyTarget) * 100) : 0;

  const getStatusColor = () => {
    const diff = consumed - dailyTarget;
    if (Math.abs(diff) <= dailyTarget * 0.1) return 'text-green-600';
    if (diff > 0) return 'text-orange-600';
    return 'text-blue-600';
  };

  const getStatusLabel = () => {
    const diff = consumed - dailyTarget;
    if (Math.abs(diff) <= dailyTarget * 0.1) return 'On track';
    if (diff > 0) return `${Math.round(diff)} over`;
    return `${Math.round(Math.abs(diff))} remaining`;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span>Calorie Progress</span>
          <Link href="/calories" className="ml-auto">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-2xl font-bold">{Math.round(consumed)}</span>
            <span className="text-sm text-muted-foreground">/ {dailyTarget} cal</span>
          </div>
          <Progress value={percentage} className="h-2" />
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className={`font-medium ${getStatusColor()}`}>{getStatusLabel()}</span>
        </div>

        <div className="text-xs text-muted-foreground">
          {percentage.toFixed(0)}% of daily target
        </div>
      </CardContent>
    </Card>
  );
}
