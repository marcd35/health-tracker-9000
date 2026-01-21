'use client';

import { Flame, Award, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { startOfWeek, differenceInDays } from 'date-fns';
import type { WeeklyProgressData, StreakInfo, GoalType } from '@/lib/types/calorieTracking';

interface WeeklyPaceStreakCardProps {
  weeklyTracking: WeeklyProgressData;
  streakInfo: StreakInfo | null;
  goalType: GoalType;
}

export function WeeklyPaceStreakCard({
  weeklyTracking,
  streakInfo,
  goalType,
}: WeeklyPaceStreakCardProps) {
  // Calculate week progress
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 0 }); // Sunday
  const dayOfWeek = differenceInDays(today, weekStart) + 1; // 1-7
  const weekProgressPercentage = Math.round((dayOfWeek / 7) * 100);

  // Calculate week number (simplified - just for display)
  const startOfYear = new Date(today.getFullYear(), 0, 1);
  const weekNumber = Math.ceil(differenceInDays(today, startOfYear) / 7);

  // Calculate weekly deficit/surplus
  const weeklyDeficitSurplus = weeklyTracking.weeklyTarget - weeklyTracking.weeklyConsumed;

  // Get pace text based on goal type
  const getPaceText = () => {
    if (goalType === 'weight_loss') {
      if (weeklyDeficitSurplus > 0) {
        return (
          <span className="text-green-700 dark:text-green-400">
            On pace for {Math.round(Math.abs(weeklyDeficitSurplus))} cal deficit
          </span>
        );
      } else {
        return (
          <span className="text-amber-600 dark:text-amber-400">
            On pace for {Math.round(Math.abs(weeklyDeficitSurplus))} cal surplus
          </span>
        );
      }
    } else if (goalType === 'gain') {
      if (weeklyDeficitSurplus < 0) {
        return (
          <span className="text-green-700 dark:text-green-400">
            On pace for {Math.round(Math.abs(weeklyDeficitSurplus))} cal surplus
          </span>
        );
      } else {
        return (
          <span className="text-amber-600 dark:text-amber-400">
            On pace for {Math.round(Math.abs(weeklyDeficitSurplus))} cal deficit
          </span>
        );
      }
    } else {
      // maintenance
      if (Math.abs(weeklyDeficitSurplus) < 350) {
        return <span className="text-green-700 dark:text-green-400">On pace to maintain</span>;
      } else {
        return (
          <span className="text-foreground">
            {weeklyDeficitSurplus > 0 ? 'Slight deficit' : 'Slight surplus'} of{' '}
            {Math.round(Math.abs(weeklyDeficitSurplus))} cal
          </span>
        );
      }
    }
  };

  // Get goal-specific encouragement
  const getGoalMessage = () => {
    const projectedWeightChange = Math.abs(weeklyDeficitSurplus) / 3500;

    if (goalType === 'weight_loss') {
      if (weeklyDeficitSurplus > 0) {
        return `You're on track to lose ${projectedWeightChange.toFixed(1)} lbs this week`;
      } else {
        return `Adjust your intake to get back on track`;
      }
    } else if (goalType === 'gain') {
      if (weeklyDeficitSurplus < 0) {
        return `You're on track to gain ${projectedWeightChange.toFixed(1)} lbs this week`;
      } else {
        return `Increase your intake to meet your gain goal`;
      }
    } else {
      // maintenance
      if (Math.abs(weeklyDeficitSurplus) < 350) {
        return `You're maintaining your weight perfectly!`;
      } else {
        return `Slight variation, but still in good range`;
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-500" />
          Weekly Pace & Streak
        </CardTitle>
        <CardDescription>Track your weekly progress and consistency</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Weekly Pace Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Week {weekNumber} of 52</p>
            <p className="text-sm font-semibold">{weekProgressPercentage}% through the week</p>
          </div>

          {/* Week progress bar */}
          <div className="relative">
            <Progress value={weekProgressPercentage} className="h-2" />
            <div className="mt-1 flex justify-between text-xs text-muted-foreground">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>
          </div>

          {/* Deficit/Surplus display with tooltip */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-between p-3 rounded-lg bg-accent/50 hover:bg-accent cursor-help">
                  <div className="flex items-center gap-2">
                    {weeklyDeficitSurplus > 0 ? (
                      <TrendingDown className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingUp className="h-4 w-4 text-amber-600" />
                    )}
                    <span className="text-sm font-medium">{getPaceText()}</span>
                  </div>
                  <Info className="h-4 w-4 text-muted-foreground" />
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

          {/* Pace message */}
          <p className="text-sm text-muted-foreground">{getGoalMessage()}</p>
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Streak Section */}
        {streakInfo ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                <p className="text-sm font-medium">Streak Tracker</p>
              </div>
              {streakInfo.isActive && (
                <div className="rounded-full bg-orange-100 px-3 py-1 dark:bg-orange-900/30">
                  <p className="text-xs font-semibold text-orange-700 dark:text-orange-400">
                    🔥 Active
                  </p>
                </div>
              )}
            </div>

            {/* Streak stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Current Streak</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {streakInfo.currentStreak}
                  </span>
                  <span className="text-xs text-muted-foreground">days</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <Award className="h-3 w-3 text-amber-500" />
                  <p className="text-xs text-muted-foreground">Best Streak</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">{streakInfo.bestStreak}</span>
                  <span className="text-xs text-muted-foreground">days</span>
                </div>
              </div>
            </div>

            {/* Days met goal this week */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">This Week</span>
                <span className="font-medium">
                  {weeklyTracking.daysMetGoal} out of {Math.min(dayOfWeek, 7)} days on target
                </span>
              </div>
              <Progress
                value={(weeklyTracking.daysMetGoal / Math.min(dayOfWeek, 7)) * 100}
                className="h-2"
              />
            </div>

            {/* Motivational message */}
            <div className="rounded-lg bg-blue-50 p-3 text-sm dark:bg-blue-900/20">
              {streakInfo.isActive ? (
                <p className="text-blue-700 dark:text-blue-400">
                  Keep it up! You&apos;re on a {streakInfo.currentStreak}-day streak. 🎯
                </p>
              ) : streakInfo.currentStreak > 0 ? (
                <p className="text-blue-700 dark:text-blue-400">
                  Your streak ended at {streakInfo.currentStreak} days. Start a new one today! 💪
                </p>
              ) : (
                <p className="text-blue-700 dark:text-blue-400">
                  Start tracking your goals to build your first streak!
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <Flame className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Start logging meals to build a streak!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
