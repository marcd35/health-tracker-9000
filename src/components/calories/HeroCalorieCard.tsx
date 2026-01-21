'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Edit3, Activity, Scale, TrendingUp, TrendingDown, Info } from 'lucide-react';
import type {
  DailyCalorieTracking,
  CalorieGoal,
  WeeklyProgressData,
} from '@/lib/types/calorieTracking';

interface HeroCalorieCardProps {
  tracking: DailyCalorieTracking;
  currentGoal: CalorieGoal;
  weeklyTracking: WeeklyProgressData;
  currentWeight: number | null;
  onWeightCheckIn: () => void;
  onEditGoal: () => void;
}

interface MealTypeCalories {
  breakfast: number;
  lunch: number;
  dinner: number;
  snacks: number;
}

export function HeroCalorieCard({
  tracking,
  currentGoal,
  weeklyTracking,
  currentWeight,
  onWeightCheckIn,
  onEditGoal,
}: HeroCalorieCardProps) {
  const [isDarkMode, setIsDarkMode] = useState(() =>
    document.documentElement.classList.contains('dark')
  );
  const [mealTypeCalories, setMealTypeCalories] = useState<MealTypeCalories>({
    breakfast: 0,
    lunch: 0,
    dinner: 0,
    snacks: 0,
  });

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  // Fetch meal data grouped by meal type
  useEffect(() => {
    const fetchMealData = async () => {
      try {
        const response = await fetch(`/api/meals`);
        if (!response.ok) return;
        const meals = await response.json();

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
      }
    };

    if (tracking.date) {
      fetchMealData();
    }
  }, [tracking.date, tracking.caloriesConsumed]);

  const consumed = tracking.caloriesConsumed;
  const target = tracking.caloriesTarget;
  const remaining = target - consumed;

  // Calculate weekly deficit/surplus and projected weight change
  const weeklyDeficitSurplus = weeklyTracking.weeklyTarget - weeklyTracking.weeklyConsumed;
  const projectedWeightChange = Math.abs(weeklyDeficitSurplus) / 3500;

  // Pie chart data
  const totalMeals =
    mealTypeCalories.breakfast +
    mealTypeCalories.lunch +
    mealTypeCalories.dinner +
    mealTypeCalories.snacks;

  const remainingColor = isDarkMode ? '#404040' : '#d1d5db';

  let chartData: any[] = [];
  if (totalMeals > 0) {
    chartData = [
      { name: 'Breakfast 🍳', value: mealTypeCalories.breakfast, color: '#fbbf24' },
      { name: 'Lunch 🍕', value: mealTypeCalories.lunch, color: '#60a5fa' },
      { name: 'Dinner 🍝', value: mealTypeCalories.dinner, color: '#f87171' },
      { name: 'Snacks 🍿', value: mealTypeCalories.snacks, color: '#a78bfa' },
      { name: 'Remaining', value: Math.max(0, remaining), color: remainingColor },
    ].filter((item) => item.value > 0);
  } else {
    chartData = [
      { name: 'Consumed', value: consumed, color: '#3b82f6' },
      { name: 'Remaining', value: Math.max(0, remaining), color: remainingColor },
    ];
  }

  // Goal type badge
  const getGoalBadge = () => {
    if (currentGoal.goalType === 'weight_loss') {
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-300 dark:bg-green-900/20 dark:text-green-400"
        >
          🎯 Weight Loss Goal
        </Badge>
      );
    } else if (currentGoal.goalType === 'gain') {
      return (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-900/20 dark:text-blue-400"
        >
          💪 Weight Gain Goal
        </Badge>
      );
    } else {
      return (
        <Badge
          variant="outline"
          className="bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-900/20 dark:text-purple-400"
        >
          🏃 Maintenance Goal
        </Badge>
      );
    }
  };

  // Pace indicator text
  const getPaceIndicator = () => {
    if (currentGoal.goalType === 'weight_loss') {
      if (weeklyDeficitSurplus > 0) {
        return (
          <p className="text-sm text-foreground">
            <TrendingDown className="inline h-4 w-4 text-green-600 mr-1" />
            On pace for{' '}
            <span className="font-semibold">
              {Math.round(Math.abs(weeklyDeficitSurplus))} cal deficit
            </span>{' '}
            - You&apos;re on track to lose{' '}
            <span className="font-semibold text-green-600">
              {projectedWeightChange.toFixed(1)} lbs
            </span>{' '}
            this week
          </p>
        );
      } else {
        return (
          <p className="text-sm text-amber-600">
            <TrendingUp className="inline h-4 w-4 mr-1" />
            On pace for {Math.round(Math.abs(weeklyDeficitSurplus))} cal surplus - above target
          </p>
        );
      }
    } else if (currentGoal.goalType === 'gain') {
      if (weeklyDeficitSurplus < 0) {
        return (
          <p className="text-sm text-foreground">
            <TrendingUp className="inline h-4 w-4 text-green-600 mr-1" />
            On pace for{' '}
            <span className="font-semibold">
              {Math.round(Math.abs(weeklyDeficitSurplus))} cal surplus
            </span>{' '}
            - You&apos;re on track to gain{' '}
            <span className="font-semibold text-green-600">
              {projectedWeightChange.toFixed(1)} lbs
            </span>{' '}
            this week
          </p>
        );
      } else {
        return (
          <p className="text-sm text-amber-600">
            <TrendingDown className="inline h-4 w-4 mr-1" />
            On pace for {Math.round(Math.abs(weeklyDeficitSurplus))} cal deficit - below target
          </p>
        );
      }
    } else {
      // maintenance
      if (Math.abs(weeklyDeficitSurplus) < 350) {
        return (
          <p className="text-sm text-green-600">
            <Activity className="inline h-4 w-4 mr-1" />
            On pace to maintain weight - You&apos;re keeping steady!
          </p>
        );
      } else {
        return (
          <p className="text-sm text-foreground">
            On pace for{' '}
            <span className="font-semibold">
              {Math.round(Math.abs(weeklyDeficitSurplus))} cal{' '}
              {weeklyDeficitSurplus > 0 ? 'deficit' : 'surplus'}
            </span>
          </p>
        );
      }
    }
  };

  // Activity level display
  const getActivityLevelText = () => {
    const levels = {
      sedentary: 'Sedentary',
      light: 'Lightly Active',
      moderate: 'Moderately Active',
      active: 'Active',
      very_active: 'Very Active',
    };
    return levels[currentGoal.activityLevel] || 'Moderate';
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-background to-accent/20 border-2">
      <div className="grid lg:grid-cols-2 gap-6 items-center">
        {/* Left side: Pie Chart */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-48 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={96}
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
          </div>

          <div className="text-center">
            <p className="text-4xl font-bold">{consumed}</p>
            <p className="text-sm text-muted-foreground">of {target} cal</p>
            <p
              className={`text-lg font-semibold mt-2 ${remaining < 0 ? 'text-red-600' : 'text-foreground'}`}
            >
              {remaining > 0 ? `${remaining} remaining` : `${Math.abs(remaining)} over`}
            </p>
          </div>

          {/* Meal breakdown legend */}
          {totalMeals > 0 && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-[#fbbf24]" />
                <span>Breakfast: {mealTypeCalories.breakfast}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-[#60a5fa]" />
                <span>Lunch: {mealTypeCalories.lunch}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-[#f87171]" />
                <span>Dinner: {mealTypeCalories.dinner}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-[#a78bfa]" />
                <span>Snacks: {mealTypeCalories.snacks}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right side: Goal Info */}
        <div className="space-y-4">
          {/* Goal type badge with edit button */}
          <div className="flex items-center justify-between">
            {getGoalBadge()}
            <Button variant="outline" size="sm" onClick={onEditGoal}>
              <Edit3 className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </div>

          {/* Pace indicator with tooltip */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-start gap-2 p-3 rounded-lg bg-accent/50 hover:bg-accent cursor-help">
                  <Info className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1">{getPaceIndicator()}</div>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-semibold mb-1">Weekly Breakdown:</p>
                <p>Consumed: {Math.round(weeklyTracking.weeklyConsumed)} cal</p>
                <p>Target: {Math.round(weeklyTracking.weeklyTarget)} cal</p>
                <p>
                  Difference: {weeklyDeficitSurplus > 0 ? '+' : ''}
                  {Math.round(weeklyDeficitSurplus)} cal
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Activity level */}
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              Activity Level: <span className="font-semibold">{getActivityLevelText()}</span>
            </span>
          </div>

          {/* Current weight */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Current Weight:{' '}
                <span className="font-semibold">
                  {currentWeight ? `${currentWeight.toFixed(1)} lbs` : 'Not set'}
                </span>
              </span>
            </div>
            <Button size="sm" onClick={onWeightCheckIn}>
              Quick Check-in
            </Button>
          </div>

          {/* Weekly pace percentage */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Weekly Progress</span>
              <span className="text-lg font-bold">{tracking.onPacePercentage}%</span>
            </div>
            <div className="w-full bg-accent rounded-full h-2 mt-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(tracking.onPacePercentage, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
