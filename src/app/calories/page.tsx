'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { Flame, TrendingDown, TrendingUp, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { useCalorieTrackerStore } from '@/lib/store/calorieTrackerStore';
import { CalorieGoalOnboarding } from '@/components/calories/CalorieGoalOnboarding';
import { CalorieProgressCard } from '@/components/calories/CalorieProgressCard';
import { WeeklyProgressChart } from '@/components/calories/WeeklyProgressChart';
import { WeeklyEncouragementCard } from '@/components/calories/WeeklyEncouragementCard';
import { CalorieStreakCard } from '@/components/calories/CalorieStreakCard';
import { CalendarHeatmap } from '@/components/calories/CalendarHeatmap';
import { MonthlyTrendChart } from '@/components/calories/MonthlyTrendChart';
import { TrendAnalysisCard } from '@/components/calories/TrendAnalysisCard';
import { GoalModificationModal } from '@/components/calories/GoalModificationModal';
import { GoalHistoryTimeline } from '@/components/calories/GoalHistoryTimeline';
import { Edit } from 'lucide-react';

export default function CaloriesPage() {
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentMonth, setCurrentMonth] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  });
  const [isResettingProfile, setIsResettingProfile] = useState(false);
  const [goalModificationOpen, setGoalModificationOpen] = useState(false);

  const currentGoal = useCalorieTrackerStore((state) => state.currentGoal);
  const todayTracking = useCalorieTrackerStore((state) => state.todayTracking);
  const weeklyTracking = useCalorieTrackerStore((state) => state.weeklyTracking);
  const monthlyData = useCalorieTrackerStore((state) => state.monthlyData);
  const streakInfo = useCalorieTrackerStore((state) => state.streakInfo);
  const currentStreak = useCalorieTrackerStore((state) => state.currentStreak);
  const bestStreak = useCalorieTrackerStore((state) => state.bestStreak);
  const goalHistory = useCalorieTrackerStore((state) => state.goalHistory);
  const isLoading = useCalorieTrackerStore((state) => state.isLoading);
  const onboardingDismissedForever = useCalorieTrackerStore((state) => state.onboardingDismissedForever);

  const fetchCurrentGoal = useCalorieTrackerStore((state) => state.fetchCurrentGoal);
  const fetchDailyTracking = useCalorieTrackerStore((state) => state.fetchDailyTracking);
  const fetchWeeklyTracking = useCalorieTrackerStore((state) => state.fetchWeeklyTracking);
  const fetchMonthlyData = useCalorieTrackerStore((state) => state.fetchMonthlyData);
  const fetchStreakData = useCalorieTrackerStore((state) => state.fetchStreakData);
  const fetchGoalHistory = useCalorieTrackerStore((state) => state.fetchGoalHistory);
  const updateGoal = useCalorieTrackerStore((state) => state.updateGoal);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const loadData = async () => {
      await fetchCurrentGoal();
    };

    loadData();
  }, [mounted, fetchCurrentGoal]);

  useEffect(() => {
    if (!currentGoal) return;

    const loadTracking = async () => {
      await Promise.all([
        fetchDailyTracking(),
        fetchWeeklyTracking(),
        fetchMonthlyData(currentMonth.year, currentMonth.month),
        fetchStreakData(),
      ]);
    };

    loadTracking();
  }, [currentGoal, currentMonth, fetchDailyTracking, fetchWeeklyTracking, fetchMonthlyData, fetchStreakData]);

  // Show onboarding if no goal and not dismissed forever
  useEffect(() => {
    if (mounted && !currentGoal && !onboardingDismissedForever) {
      setOnboardingOpen(true);
    }
  }, [currentGoal, onboardingDismissedForever, mounted]);

  // Handle profile reset for debugging
  const handleResetProfile = async (profileType: 'weight_loss' | 'maintenance' | 'weight_gain') => {
    setIsResettingProfile(true);
    try {
      const response = await fetch('/api/debug/reset-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileType }),
      });

      if (!response.ok) throw new Error('Failed to reset profile');

      toast.success(`Profile reset to ${profileType.replace('_', ' ')}. Reloading data...`);

      // Reload all data
      await Promise.all([
        fetchCurrentGoal(),
        fetchDailyTracking(),
        fetchWeeklyTracking(),
        fetchStreakData(),
      ]);
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset profile');
    } finally {
      setIsResettingProfile(false);
    }
  };

  // Handle goal modification
  const handleUpdateGoal = async (weeklyTarget: number, reason: string) => {
    const result = await updateGoal({
      weeklyCalorieTarget: weeklyTarget,
      reason,
    });

    if (result && result.streakResetRequired) {
      // Refetch goal history after change
      await fetchGoalHistory();
    }
  };

  if (!mounted) {
    return null;
  }

  // No goal - show empty state
  if (!currentGoal) {
    return (
      <>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Flame className="w-8 h-8 text-orange-500" />
            <h1 className="text-3xl font-bold">Calorie Tracker</h1>
          </div>

          <Card className="p-8 text-center space-y-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <Flame className="w-16 h-16 mx-auto text-blue-500" />
            <div>
              <h2 className="text-2xl font-bold text-blue-900">Set Your Calorie Goal</h2>
              <p className="text-blue-700 mt-2">
                Create a personalized calorie target to track your progress toward your health goals.
              </p>
            </div>
            <Button
              size="lg"
              onClick={() => setOnboardingOpen(true)}
              className="mt-4 w-full sm:w-auto"
            >
              Set Up Calorie Goal
            </Button>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <TrendingDown className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Weight Loss</p>
                  <p className="font-semibold">Create a deficit</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Flame className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Maintenance</p>
                  <p className="font-semibold">Stay at goal</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Weight Gain</p>
                  <p className="font-semibold">Create a surplus</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <CalorieGoalOnboarding open={onboardingOpen} onOpenChange={setOnboardingOpen} />
      </>
    );
  }

  // Goal exists - show tracking
  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Flame className="w-8 h-8 text-orange-500" />
            <h1 className="text-3xl font-bold">Calorie Tracker</h1>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/meals">Log Meals</Link>
          </Button>
        </div>

        {/* Today's Progress */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Today's Progress</h2>
          {isLoading && !todayTracking ? (
            <Card className="p-6 bg-muted animate-pulse">
              <p>Loading...</p>
            </Card>
          ) : todayTracking ? (
            <CalorieProgressCard tracking={todayTracking} goalType={currentGoal.goalType} />
          ) : null}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Daily Target */}
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Daily Target</p>
            <p className="text-2xl font-bold">{currentGoal.dailyCalorieTarget}</p>
            <p className="text-xs text-muted-foreground mt-2">calories/day</p>
          </Card>

          {/* Weekly Status */}
          {weeklyTracking && (
            <>
              <Card className="p-4">
                <p className="text-sm text-muted-foreground mb-1">Weekly Total</p>
                <p className="text-2xl font-bold">{weeklyTracking.weeklyConsumed}</p>
                <p className="text-xs text-muted-foreground mt-2">of {weeklyTracking.weeklyTarget}</p>
              </Card>

              <Card className="p-4">
                <p className="text-sm text-muted-foreground mb-1">Days Met Goal</p>
                <p className="text-2xl font-bold">{weeklyTracking.daysMetGoal}</p>
                <p className="text-xs text-muted-foreground mt-2">out of 7</p>
              </Card>

              <Card className="p-4">
                <p className="text-sm text-muted-foreground mb-1">Weekly Projection</p>
                <p className="text-2xl font-bold">{weeklyTracking.projection}</p>
                <p className="text-xs text-muted-foreground mt-2">at current pace</p>
              </Card>
            </>
          )}

          {/* Best Streak */}
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Best Streak
            </p>
            <p className="text-2xl font-bold">{bestStreak}</p>
            <p className="text-xs text-muted-foreground mt-2">days</p>
          </Card>

          {/* Current Streak */}
          {currentStreak && (
            <Card className="p-4">
              <p className="text-sm text-muted-foreground mb-1">Current Streak</p>
              <p className="text-2xl font-bold">{currentStreak.daysCount}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {currentStreak.isActive ? 'ongoing' : 'ended'}
              </p>
            </Card>
          )}
        </div>

        {/* Phase 2: Weekly Progress Chart */}
        {weeklyTracking && (
          <div>
            <WeeklyProgressChart data={weeklyTracking} goalType={currentGoal.goalType} />
          </div>
        )}

        {/* Phase 2: Weekly Encouragement */}
        {weeklyTracking && (
          <WeeklyEncouragementCard weeklyData={weeklyTracking} goalType={currentGoal.goalType} />
        )}

        {/* Phase 2: Streak Card */}
        <CalorieStreakCard streakInfo={streakInfo} />

        {/* Phase 2: Monthly Calendar Heatmap */}
        {monthlyData && (
          <CalendarHeatmap
            monthlyData={monthlyData}
            onMonthChange={(year, month) => {
              setCurrentMonth({ year, month });
            }}
          />
        )}

        {/* Phase 3: Monthly Trend Chart */}
        {monthlyData && <MonthlyTrendChart data={monthlyData} />}

        {/* Phase 3: Trend Analysis */}
        {monthlyData && <TrendAnalysisCard monthlyData={monthlyData} />}

        {/* Phase 3: Goal History Timeline */}
        {goalHistory.length > 0 && <GoalHistoryTimeline history={goalHistory} />}

        {/* Goal Info Card */}
        <Card className="p-4 bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">Current Goal</span>
              <div className="flex items-center gap-2">
                <span className="capitalize text-sm font-semibold text-blue-700">
                  {currentGoal.goalType.replace('_', ' ')}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setGoalModificationOpen(true)}
                  className="h-7 w-7 p-0"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Weekly Target</span>
              <span className="font-medium">
                {Math.round(Math.abs(currentGoal.weeklyCalorieTarget) / 3500)} lb/week
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Activity Level</span>
              <span className="font-medium capitalize">
                {currentGoal.activityLevel.replace('_', ' ')}
              </span>
            </div>
          </div>
        </Card>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button asChild variant="outline" className="h-auto py-3">
            <Link href="/meals">
              <div className="text-left">
                <div className="font-semibold">Log Meals</div>
                <div className="text-xs text-muted-foreground">Add foods to your log</div>
              </div>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto py-3">
            <Link href="/analytics">
              <div className="text-left">
                <div className="font-semibold">Analytics</div>
                <div className="text-xs text-muted-foreground">View detailed trends</div>
              </div>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto py-3">
            <Link href="/">
              <div className="text-left">
                <div className="font-semibold">Dashboard</div>
                <div className="text-xs text-muted-foreground">Back to home</div>
              </div>
            </Link>
          </Button>
        </div>

        {/* Debug Panel - Mock Profile Switcher */}
        <div className="mt-8 pt-6 border-t border-muted">
          <p className="text-xs font-semibold text-muted-foreground mb-3">DEBUG: Load Mock Profile</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleResetProfile('weight_loss')}
              disabled={isResettingProfile}
              className="text-xs"
            >
              {isResettingProfile ? 'Resetting...' : 'Weight Loss'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleResetProfile('maintenance')}
              disabled={isResettingProfile}
              className="text-xs"
            >
              {isResettingProfile ? 'Resetting...' : 'Maintenance'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleResetProfile('weight_gain')}
              disabled={isResettingProfile}
              className="text-xs"
            >
              {isResettingProfile ? 'Resetting...' : 'Weight Gain'}
            </Button>
          </div>
        </div>
      </div>

      <CalorieGoalOnboarding open={onboardingOpen} onOpenChange={setOnboardingOpen} />

      {/* Phase 3: Goal Modification Modal */}
      {currentGoal && (
        <GoalModificationModal
          open={goalModificationOpen}
          onOpenChange={setGoalModificationOpen}
          currentGoal={currentGoal}
          hasActiveStreak={!!currentStreak?.isActive}
          onConfirm={handleUpdateGoal}
        />
      )}
    </>
  );
}
