'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import {
  Flame,
  TrendingDown,
  TrendingUp,
  TrendingUpIcon,
  Calendar,
  History,
  Database,
} from 'lucide-react';
import { useCalorieTrackerStore } from '@/lib/store/calorieTrackerStore';
import { CalorieGoalOnboarding } from '@/components/calories/CalorieGoalOnboarding';
import { HeroCalorieCard } from '@/components/calories/HeroCalorieCard';
import { WeightCheckInModal } from '@/components/calories/WeightCheckInModal';
import { WeightProgressChart } from '@/components/calories/WeightProgressChart';
import { WeeklyPaceStreakCard } from '@/components/calories/WeeklyPaceStreakCard';
import { WeeklyProgressChart } from '@/components/calories/WeeklyProgressChart';
import { WeeklyEncouragementCard } from '@/components/calories/WeeklyEncouragementCard';
import { SectionDivider } from '@/components/calories/SectionDivider';
import { CalendarHeatmap } from '@/components/calories/CalendarHeatmap';
import { MonthlyTrendChart } from '@/components/calories/MonthlyTrendChart';
import { TrendAnalysisCard } from '@/components/calories/TrendAnalysisCard';
import { GoalModificationModal } from '@/components/calories/GoalModificationModal';
import { GoalHistoryTimeline } from '@/components/calories/GoalHistoryTimeline';
import { SyntheticDataModal } from '@/components/debug/SyntheticDataModal';
import type { WeightLog } from '@/lib/types/weight';

export default function CaloriesPage() {
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentMonth, setCurrentMonth] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  });
  const [goalModificationOpen, setGoalModificationOpen] = useState(false);
  const [weightCheckInOpen, setWeightCheckInOpen] = useState(false);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [latestWeight, setLatestWeight] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const currentGoal = useCalorieTrackerStore((state) => state.currentGoal);
  const todayTracking = useCalorieTrackerStore((state) => state.todayTracking);
  const weeklyTracking = useCalorieTrackerStore((state) => state.weeklyTracking);
  const monthlyData = useCalorieTrackerStore((state) => state.monthlyData);
  const streakInfo = useCalorieTrackerStore((state) => state.streakInfo);
  const currentStreak = useCalorieTrackerStore((state) => state.currentStreak);
  const goalHistory = useCalorieTrackerStore((state) => state.goalHistory);
  const isLoading = useCalorieTrackerStore((state) => state.isLoading);
  const onboardingDismissedForever = useCalorieTrackerStore(
    (state) => state.onboardingDismissedForever
  );

  const fetchCurrentGoal = useCalorieTrackerStore((state) => state.fetchCurrentGoal);
  const fetchDailyTracking = useCalorieTrackerStore((state) => state.fetchDailyTracking);
  const fetchWeeklyTracking = useCalorieTrackerStore((state) => state.fetchWeeklyTracking);
  const fetchMonthlyData = useCalorieTrackerStore((state) => state.fetchMonthlyData);
  const fetchStreakData = useCalorieTrackerStore((state) => state.fetchStreakData);
  const fetchGoalHistory = useCalorieTrackerStore((state) => state.fetchGoalHistory);
  const updateGoal = useCalorieTrackerStore((state) => state.updateGoal);

  // Fetch weight logs
  const fetchWeightLogs = async () => {
    try {
      const response = await fetch('/api/weight-logs');
      if (!response.ok) throw new Error('Failed to fetch weight logs');
      const logs = await response.json();
      setWeightLogs(logs);
    } catch (error) {
      console.error('Error fetching weight logs:', error);
    }
  };

  // Fetch latest weight
  const fetchLatestWeight = async () => {
    try {
      const response = await fetch('/api/weight-logs/latest');
      if (!response.ok) throw new Error('Failed to fetch latest weight');
      const data = await response.json();

      // Handle both weight log response and profile fallback
      if (data.weight) {
        setLatestWeight(data.weight);
      } else {
        setLatestWeight(null);
      }
    } catch (error) {
      console.error('Error fetching latest weight:', error);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const loadData = async () => {
      await fetchCurrentGoal();
      await fetchWeightLogs();
      await fetchLatestWeight();
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
  }, [
    currentGoal,
    currentMonth,
    fetchDailyTracking,
    fetchWeeklyTracking,
    fetchMonthlyData,
    fetchStreakData,
  ]);

  // Show onboarding if no goal and not dismissed forever
  useEffect(() => {
    if (mounted && !currentGoal && !onboardingDismissedForever) {
      setOnboardingOpen(true);
    }
  }, [currentGoal, onboardingDismissedForever, mounted]);

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
                Create a personalized calorie target to track your progress toward your health
                goals.
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
          <div className="flex items-center gap-2">
            {/* Debug button - only visible in development */}
            {process.env.NODE_ENV === 'development' && (
              <SyntheticDataModal
                triggerButton={
                  <Button variant="outline" size="sm">
                    <Database className="w-4 h-4 mr-2" />
                    Test Data
                  </Button>
                }
                onSuccess={async () => {
                  // Refresh all tracking data after generating synthetic data
                  await Promise.all([
                    fetchDailyTracking(),
                    fetchWeeklyTracking(),
                    fetchMonthlyData(currentMonth.year, currentMonth.month),
                    fetchStreakData(),
                  ]);
                  // Force HeroCalorieCard to remount and refetch meal data
                  setRefreshKey((prev) => prev + 1);
                }}
              />
            )}
            <Button asChild>
              <Link href="/meals">Log Meals</Link>
            </Button>
          </div>
        </div>

        {/* === DAILY SECTION (no explicit divider) === */}

        {/* Hero Card - Today's Progress + Current Goal */}
        {isLoading && !todayTracking ? (
          <Card className="p-6 bg-muted animate-pulse">
            <p>Loading...</p>
          </Card>
        ) : todayTracking && weeklyTracking ? (
          <HeroCalorieCard
            key={refreshKey}
            tracking={todayTracking}
            currentGoal={currentGoal}
            weeklyTracking={weeklyTracking}
            currentWeight={latestWeight}
            onWeightCheckIn={() => setWeightCheckInOpen(true)}
            onEditGoal={() => setGoalModificationOpen(true)}
          />
        ) : null}

        {/* Weight Progress Chart */}
        <WeightProgressChart logs={weightLogs} goalType={currentGoal.goalType} />

        {/* === THIS WEEK SECTION === */}
        <SectionDivider title="This Week" icon={<TrendingUpIcon className="h-6 w-6" />} />

        {/* Weekly Pace & Streak Card (combined) */}
        {weeklyTracking && (
          <WeeklyPaceStreakCard
            weeklyTracking={weeklyTracking}
            streakInfo={streakInfo}
            goalType={currentGoal.goalType}
          />
        )}

        {/* Weekly Progress Chart */}
        {weeklyTracking && (
          <WeeklyProgressChart data={weeklyTracking} goalType={currentGoal.goalType} />
        )}

        {/* Weekly Encouragement */}
        {weeklyTracking && <WeeklyEncouragementCard weeklyData={weeklyTracking} />}

        {/* === THIS MONTH SECTION === */}
        <SectionDivider title="This Month" icon={<Calendar className="h-6 w-6" />} />

        {/* Monthly Calendar Heatmap */}
        {monthlyData && (
          <CalendarHeatmap
            monthlyData={monthlyData}
            onMonthChange={(year, month) => {
              setCurrentMonth({ year, month });
            }}
          />
        )}

        {/* Monthly Trend Chart */}
        {monthlyData && <MonthlyTrendChart data={monthlyData} />}

        {/* Trend Analysis */}
        {monthlyData && <TrendAnalysisCard monthlyData={monthlyData} />}

        {/* === GOAL HISTORY (conditional) === */}
        {goalHistory.length > 0 && (
          <>
            <SectionDivider title="Goal History" icon={<History className="h-6 w-6" />} />
            <GoalHistoryTimeline history={goalHistory} />
          </>
        )}
      </div>

      <CalorieGoalOnboarding open={onboardingOpen} onOpenChange={setOnboardingOpen} />

      {/* Goal Modification Modal */}
      {currentGoal && (
        <GoalModificationModal
          open={goalModificationOpen}
          onOpenChange={setGoalModificationOpen}
          currentGoal={currentGoal}
          hasActiveStreak={!!currentStreak?.isActive}
          onConfirm={handleUpdateGoal}
        />
      )}

      {/* Weight Check-In Modal */}
      <WeightCheckInModal
        open={weightCheckInOpen}
        onOpenChange={setWeightCheckInOpen}
        currentWeight={latestWeight}
        onSuccess={() => {
          fetchWeightLogs();
          fetchLatestWeight();
        }}
      />
    </>
  );
}
