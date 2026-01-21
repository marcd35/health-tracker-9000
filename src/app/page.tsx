'use client';

import { useEffect } from 'react';
import { useHealthStore } from '@/lib/store/healthStore';
import { HealthScoreCard } from '@/components/dashboard/HealthScoreCard';
import { NutritionSummaryCard } from '@/components/dashboard/NutritionSummaryCard';
import { RecommendationsCard } from '@/components/dashboard/RecommendationsCard';
import { TodaysMeals } from '@/components/dashboard/TodaysMeals';
import { TodaysSupplements } from '@/components/dashboard/TodaysSupplements';
import { MicronutrientGrid } from '@/components/dashboard/MicronutrientGrid';
import { CalorieProgressCard } from '@/components/dashboard/CalorieProgressCard';
import { Button } from '@/components/ui/button';
import { Utensils } from 'lucide-react';
import Link from 'next/link';
import { generateRecommendations } from '@/lib/utils/recommendations';

import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const MacroChart = dynamic(
  () => import('@/components/dashboard/MacroChart').then((mod) => mod.MacroChart),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[350px] w-full rounded-xl" />,
  }
);

const WeeklyTrendChart = dynamic(
  () => import('@/components/dashboard/WeeklyTrendChart').then((mod) => mod.WeeklyTrendChart),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[400px] w-full rounded-xl" />,
  }
);

export default function DashboardPage() {
  const {
    profile,
    preferences,
    dailyLog,
    weeklySummary,
    isLoading,
    fetchProfile,
    fetchPreferences,
    fetchDailyLog,
    fetchWeeklySummary,
  } = useHealthStore();

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    // Check if we need to refresh data (new day)
    const lastFetchedDate = localStorage.getItem('lastDashboardDate');
    if (lastFetchedDate !== today) {
      fetchProfile();
      fetchPreferences();
      fetchDailyLog(today);
      fetchWeeklySummary(today);
      localStorage.setItem('lastDashboardDate', today);
    } else {
      // Same day, still fetch preferences in case they changed
      fetchPreferences();
    }
  }, [fetchProfile, fetchPreferences, fetchDailyLog, fetchWeeklySummary, today]);

  if (isLoading && !dailyLog) {
    return <DashboardSkeleton />;
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

  const trendData = weeklySummary.map((day) => ({
    date: new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    score: day.healthScore,
    weight: day.weight || 0,
  }));

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            {profile?.displayName
              ? `Welcome back, ${profile.displayName}!`
              : 'Welcome back!'}
            {' '}Here&apos;s your health summary for today.
          </p>
          {!profile?.displayName && (
            <p className="text-sm text-muted-foreground mt-2">
              <Link href="/profile" className="text-primary hover:underline">
                Complete your profile
              </Link>
              {' '}to personalize your experience.
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" className="gap-2" aria-label="Navigate to meal logging">
            <Link href="/meals">
              <Utensils className="h-4 w-4" aria-hidden="true" />
              Log Meal
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <HealthScoreCard score={healthScore} breakdown={breakdown} />
        <CalorieProgressCard />
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
          {preferences?.showHealthInsights && (
            <RecommendationsCard recommendations={recommendations} />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TodaysMeals meals={dailyLog?.meals || []} />
        <TodaysSupplements supplements={dailyLog?.supplements || []} />
      </div>
    </div>
  );
}
