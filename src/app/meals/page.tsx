'use client';

import { useEffect } from 'react';
import { MealLogForm } from '@/components/forms/MealLogForm';
import { TodaysMeals } from '@/components/dashboard/TodaysMeals';
import { useHealthStore } from '@/lib/store/healthStore';
import { MealsSkeleton } from '@/components/meals/MealsSkeleton';

export default function MealsPage() {
  const { dailyLog, isLoading, fetchDailyLog } = useHealthStore();
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchDailyLog(today);
  }, [fetchDailyLog, today]);

  if (isLoading && !dailyLog) {
    return <MealsSkeleton />;
  }

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meal Logging</h1>
          <p className="text-muted-foreground">
            Track your intake and monitor nutritional balance.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <MealLogForm />
        </div>
        <div>
          <TodaysMeals meals={dailyLog?.meals || []} />
        </div>
      </div>
    </div>
  );
}
