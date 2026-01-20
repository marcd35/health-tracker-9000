'use client';

import { Flame, Award } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { StreakInfo } from '@/lib/types/calorieTracking';

interface CalorieStreakCardProps {
  streakInfo: StreakInfo | null;
}

export function CalorieStreakCard({ streakInfo }: CalorieStreakCardProps) {
  if (!streakInfo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Streak Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Start logging meals to build a streak!</p>
        </CardContent>
      </Card>
    );
  }

  // Format dates
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          Streak Tracker
        </CardTitle>
        <CardDescription>Your consistency journey</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Streak Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Current Streak</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-orange-600">{streakInfo.currentStreak}</span>
                <span className="text-sm text-muted-foreground">days</span>
              </div>
            </div>
            {streakInfo.isActive && (
              <div className="rounded-full bg-orange-100 px-3 py-1">
                <p className="text-xs font-semibold text-orange-700">🔥 Active</p>
              </div>
            )}
            {!streakInfo.isActive && streakInfo.currentStreak > 0 && (
              <div className="rounded-full bg-slate-100 px-3 py-1">
                <p className="text-xs font-semibold text-slate-700">Ended</p>
              </div>
            )}
          </div>
          {streakInfo.streakStartDate && (
            <p className="text-xs text-muted-foreground">
              Started: {formatDate(streakInfo.streakStartDate)}
            </p>
          )}
          {streakInfo.currentStreak > 0 && (
            <>
              <div className="mt-3">
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Goal Completion Rate</span>
                  <span className="font-medium">{streakInfo.streakPercentage}%</span>
                </div>
                <Progress value={streakInfo.streakPercentage} className="h-2" />
              </div>
            </>
          )}
        </div>

        {/* Best Streak Section */}
        <div className="space-y-2 rounded-lg bg-accent/50 p-3">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-amber-500" />
            <p className="text-sm font-medium text-muted-foreground">Personal Best</p>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{streakInfo.bestStreak}</span>
            <span className="text-xs text-muted-foreground">days</span>
          </div>
        </div>

        {/* Motivational Message */}
        <div className="rounded-lg bg-blue-50 p-3 text-sm dark:bg-blue-900/20">
          {streakInfo.isActive ? (
            <p className="text-blue-700 dark:text-blue-400">
              Keep it up! You're on a {streakInfo.currentStreak}-day streak. 🎯
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
      </CardContent>
    </Card>
  );
}
