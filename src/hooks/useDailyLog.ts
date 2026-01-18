import { useEffect } from 'react';
import { useHealthStore } from '@/lib/store/healthStore';

export function useDailyLog(date: string) {
  const { dailyLog, isLoading, error, fetchDailyLog, addMeal, deleteMeal, toggleSupplement } =
    useHealthStore();

  useEffect(() => {
    if (!dailyLog || dailyLog.date !== date) {
      fetchDailyLog(date);
    }
  }, [date, dailyLog, fetchDailyLog]);

  return { dailyLog, isLoading, error, addMeal, deleteMeal, toggleSupplement };
}
