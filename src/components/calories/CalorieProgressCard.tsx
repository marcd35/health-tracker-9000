'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import type { DailyCalorieTracking, GoalType } from '@/lib/types/calorieTracking';

interface CalorieProgressCardProps {
  tracking: DailyCalorieTracking;
  goalType: GoalType;
}

interface MealTypeCalories {
  breakfast: number;
  lunch: number;
  dinner: number;
  snacks: number;
}

export function CalorieProgressCard({ tracking, goalType }: CalorieProgressCardProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mealTypeCalories, setMealTypeCalories] = useState<MealTypeCalories>({
    breakfast: 0,
    lunch: 0,
    dinner: 0,
    snacks: 0,
  });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const updateDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    // Use setTimeout to avoid synchronous setState in effect
    const timeoutId = setTimeout(updateDarkMode, 0);
    const observer = new MutationObserver(updateDarkMode);
    observer.observe(document.documentElement, { attributes: true });
    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, []);

  // Fetch meal data grouped by meal type
  useEffect(() => {
    const fetchMealData = async () => {
      try {
        // Fetch meals for the specific date
        const response = await fetch(`/api/meals`);
        if (!response.ok) {
          console.warn('Failed to fetch meals');
          return;
        }
        const result = await response.json();
        const meals = result.data || [];

        // Filter meals for the tracking date
        const filteredMeals = meals.filter((meal: any) => meal.date === tracking.date);

        const totals: MealTypeCalories = {
          breakfast: 0,
          lunch: 0,
          dinner: 0,
          snacks: 0,
        };

        filteredMeals.forEach((meal: any) => {
          const mealType = (meal.mealType || 'snacks').toLowerCase() as keyof MealTypeCalories;
          const calories = meal.totalNutrition?.calories || 0;
          if (mealType in totals) {
            totals[mealType] += calories;
          }
        });

        setMealTypeCalories(totals);
      } catch (error) {
        console.error('Failed to fetch meal data:', error);
        // Fall back to empty meal totals - pie will show just consumed + remaining
      }
    };

    if (tracking.date) {
      fetchMealData();
    }
  }, [tracking.date, tracking.caloriesConsumed]);

  const consumed = tracking.caloriesConsumed;
  const target = tracking.caloriesTarget;
  const remaining = target - consumed;

  // Calculate percentage for visualization (allow >100%)
  let percentageOfGoal = 0;
  let status: 'on-track' | 'close' | 'over' = 'on-track';

  if (goalType === 'weight_loss') {
    // For weight loss, we want to be BELOW target
    percentageOfGoal = (consumed / target) * 100;
    if (consumed > target) status = 'over';
    else if (consumed > target * 0.85) status = 'close';
    else status = 'on-track';
  } else if (goalType === 'gain') {
    // For weight gain, we want to be ABOVE target
    percentageOfGoal = (consumed / target) * 100;
    if (consumed < target) status = 'close';
    else status = 'on-track';
  } else {
    // For maintenance, we want to be close to target
    percentageOfGoal = (consumed / target) * 100;
    const diff = Math.abs(consumed - target);
    if (diff <= 50) status = 'on-track';
    else if (diff <= 150) status = 'close';
    else status = 'over';
  }

  // Format percentage display: "95%" or "100% + 14%"
  let displayPercentage = '';
  if (percentageOfGoal <= 100) {
    displayPercentage = `${percentageOfGoal.toFixed(0)}%`;
  } else {
    const overage = percentageOfGoal - 100;
    displayPercentage = `100% + ${overage.toFixed(0)}%`;
  }

  // Get the remaining color based on theme (light gray for light, dark gray for dark)
  const remainingColor = isDarkMode ? '#404040' : '#d1d5db';

  // Build pie chart data from meal types
  // If no meal data yet, show consumed + remaining
  const totalMeals =
    mealTypeCalories.breakfast +
    mealTypeCalories.lunch +
    mealTypeCalories.dinner +
    mealTypeCalories.snacks;

  let chartData: any[] = [];
  if (totalMeals > 0) {
    // Show meal breakdown
    chartData = [
      { name: 'Breakfast', value: mealTypeCalories.breakfast, color: '#fbbf24' },
      { name: 'Lunch', value: mealTypeCalories.lunch, color: '#60a5fa' },
      { name: 'Dinner', value: mealTypeCalories.dinner, color: '#f87171' },
      { name: 'Snacks', value: mealTypeCalories.snacks, color: '#a78bfa' },
      { name: 'Remaining', value: Math.max(0, remaining), color: remainingColor },
    ].filter((item) => item.value > 0);
  } else {
    // Fallback: show simple consumed + remaining
    chartData = [
      { name: 'Consumed', value: consumed, color: '#3b82f6' },
      { name: 'Remaining', value: Math.max(0, remaining), color: remainingColor },
    ];
  }

  const statusColors = {
    'on-track': 'bg-green-900/5 text-foreground border-green-200/50 dark:border-green-800/30',
    close: 'bg-amber-900/5 text-foreground border-amber-200/50 dark:border-amber-800/30',
    over: 'bg-red-900/5 text-foreground border-red-200/50 dark:border-red-800/30',
  };

  const statusMessages = {
    'on-track':
      goalType === 'weight_loss'
        ? '🎯 On track!'
        : goalType === 'gain'
          ? '💪 Keep going!'
          : '✨ Perfect!',
    close:
      goalType === 'weight_loss'
        ? '⚠️ Getting close'
        : goalType === 'gain'
          ? '🎯 Almost there'
          : '⚠️ Close',
    over:
      goalType === 'weight_loss'
        ? '❌ Over target'
        : goalType === 'gain'
          ? '✅ Met goal!'
          : '⚠️ Over target',
  };

  return (
    <Card className={`p-6 ${statusColors[status]} border`}>
      <div className="grid grid-cols-2 gap-6 items-center">
        {/* Left side: Circular Chart */}
        <div className="flex flex-col items-center justify-center">
          <div className="w-32 h-32">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={64}
                    paddingAngle={2}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-muted-foreground text-sm">Loading...</p>
              </div>
            )}
          </div>
          <p className="text-2xl font-bold mt-4 text-center">{displayPercentage}</p>
        </div>

        {/* Right side: Details */}
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Calories Consumed</p>
            <p className="text-3xl font-bold">{consumed}</p>
            <p className="text-xs text-muted-foreground mt-1">Target: {target} cal</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              <Badge variant="outline" className="bg-background">
                {statusMessages[status]}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Remaining</span>
              <span className={`text-lg font-semibold ${remaining < 0 ? 'text-red-600' : ''}`}>
                {remaining > 0 ? `+${remaining}` : remaining} cal
              </span>
            </div>
          </div>

          {/* On-Pace Percentage */}
          <div className="pt-3 border-t border-current/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">Weekly Pace</span>
              <span className="text-sm font-bold">{tracking.onPacePercentage}%</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {tracking.onPacePercentage >= 100
                ? 'Ahead of pace'
                : tracking.onPacePercentage >= 50
                  ? 'On pace for this week'
                  : 'Behind pace this week'}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
