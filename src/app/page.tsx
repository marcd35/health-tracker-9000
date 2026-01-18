'use client';

import React, { useEffect } from 'react';
import { useHealthStore } from '@/lib/store/healthStore';
import { HealthScoreCard } from '@/components/dashboard/HealthScoreCard';
import { NutritionSummaryCard } from '@/components/dashboard/NutritionSummaryCard';
import { RecommendationsCard } from '@/components/dashboard/RecommendationsCard';
import { TodaysMeals } from '@/components/dashboard/TodaysMeals';
import { TodaysSupplements } from '@/components/dashboard/TodaysSupplements';
import { MacroChart } from '@/components/dashboard/MacroChart';
import { WeeklyTrendChart } from '@/components/dashboard/WeeklyTrendChart';
import { MicronutrientGrid } from '@/components/dashboard/MicronutrientGrid';
import { Button } from '@/components/ui/button';
import { Plus, Utensils, RefreshCcw } from 'lucide-react';
import Link from 'next/link';
import { generateRecommendations } from '@/lib/utils/recommendations';

export default function DashboardPage() {
  const {
    profile,
    dailyLog,
    weeklySummary,
    isLoading,
    fetchProfile,
    fetchDailyLog,
    fetchWeeklySummary,
  } = useHealthStore();

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchProfile();
    fetchDailyLog(today);
    fetchWeeklySummary(today);
  }, [fetchProfile, fetchDailyLog, fetchWeeklySummary, today]);

  if (isLoading && !dailyLog) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCcw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const actual = dailyLog?.totalNutrition || {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
  };
  const targets: any = profile?.targets || {
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 70,
    fiber: 30,
    vitaminA: 900,
    vitaminC: 90,
    vitaminD: 20,
    magnesium: 400,
    zinc: 11,
  };

  const healthScore = dailyLog?.healthScore || 0;
  const breakdown = dailyLog?.healthScoreBreakdown || {
    macros: 0,
    micros: 0,
    supplements: 0,
    hydration: 0,
    total: 0,
  };

  const recommendations =
    profile && profile.targets ? generateRecommendations(actual, profile.targets, profile) : [];

  const microData = [
    {
      name: 'Fiber',
      actual: (actual.fiber as number) || 0,
      target: (targets.fiber as number) || 30,
    },
    {
      name: 'Vitamin A',
      actual: (actual.vitaminA as number) || 0,
      target: (targets.vitaminA as number) || 900,
    },
    {
      name: 'Vitamin C',
      actual: (actual.vitaminC as number) || 0,
      target: (targets.vitaminC as number) || 90,
    },
    {
      name: 'Vitamin D',
      actual: (actual.vitaminD as number) || 0,
      target: (targets.vitaminD as number) || 20,
    },
    {
      name: 'Magnesium',
      actual: (actual.magnesium as number) || 0,
      target: (targets.magnesium as number) || 400,
    },
    { name: 'Zinc', actual: (actual.zinc as number) || 0, target: (targets.zinc as number) || 11 },
  ];

  const trendData = weeklySummary
    .map((day) => ({
      date: new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' }),
      score: day.healthScore,
      weight: day.weight || 0,
    }))
    .reverse();

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back{profile ? `, ${profile.gender === 'male' ? 'Mr.' : 'Ms.'}` : ''}!
            Here&apos;s your health summary for today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" className="gap-2">
            <Link href="/meals">
              <Utensils className="h-4 w-4" />
              Log Meal
            </Link>
          </Button>
          <Button asChild className="gap-2">
            <Link href="/supplements">
              <Plus className="h-4 w-4" />
              Quick Action
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <HealthScoreCard score={healthScore} breakdown={breakdown} />
        <div className="lg:col-span-2">
          <NutritionSummaryCard actual={actual} targets={targets} />
        </div>
        <MacroChart data={actual} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <WeeklyTrendChart data={trendData} />
          <MicronutrientGrid nutrients={microData} />
        </div>
        <div className="space-y-6">
          <RecommendationsCard recommendations={recommendations} />
          <TodaysSupplements supplements={dailyLog?.supplements || []} />
          <TodaysMeals meals={dailyLog?.meals || []} />
        </div>
      </div>
    </div>
  );
}
