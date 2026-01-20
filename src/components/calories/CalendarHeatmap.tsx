'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { MonthlyCalorieData } from '@/lib/types/calorieTracking';

interface CalendarHeatmapProps {
  monthlyData: MonthlyCalorieData | null;
  onMonthChange?: (year: number, month: number) => void;
}

export function CalendarHeatmap({ monthlyData, onMonthChange }: CalendarHeatmapProps) {
  if (!monthlyData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Heatmap</CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Get all days in the month
  const monthDate = new Date(monthlyData.year, monthlyData.month - 1);
  const firstDay = new Date(monthlyData.year, monthlyData.month - 1, 1);
  const lastDay = new Date(monthlyData.year, monthlyData.month, 0);

  // Get starting day of week (0 = Sunday)
  const startingDayOfWeek = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  // Create a map of goal met status by date
  const goalMetMap = new Map<string, boolean>();
  monthlyData.weeks.forEach((week) => {
    week.days.forEach((day) => {
      goalMetMap.set(day.date, day.goalMet);
    });
  });

  // Build calendar grid
  const calendarDays = [];

  // Add empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }

  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${monthlyData.year}-${String(monthlyData.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const goalMet = goalMetMap.get(dateStr) ?? false;
    calendarDays.push({
      day,
      dateStr,
      goalMet,
      hasData: goalMetMap.has(dateStr),
    });
  }

  // Determine intensity for color coding
  const getIntensity = (goalMet: boolean, hasData: boolean): string => {
    if (!hasData) return 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700';
    if (goalMet) return 'bg-green-500 dark:bg-green-600 text-white font-semibold';
    return 'bg-red-200 dark:bg-red-900 text-red-900 dark:text-red-200 font-semibold';
  };

  const handlePrevMonth = () => {
    const newMonth = monthlyData.month === 1 ? 12 : monthlyData.month - 1;
    const newYear = monthlyData.month === 1 ? monthlyData.year - 1 : monthlyData.year;
    onMonthChange?.(newYear, newMonth);
  };

  const handleNextMonth = () => {
    const newMonth = monthlyData.month === 12 ? 1 : monthlyData.month + 1;
    const newYear = monthlyData.month === 12 ? monthlyData.year + 1 : monthlyData.year;
    onMonthChange?.(newYear, newMonth);
  };

  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(
    monthDate
  );

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Monthly Heatmap</CardTitle>
            <CardDescription>Green = goal met, Red = goal missed</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-40 text-center text-sm font-medium">{monthName}</span>
            <Button variant="ghost" size="sm" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Week day headers */}
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((day) => (
              <div key={day} className="py-2 text-center text-xs font-semibold text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((dayInfo, index) => (
              <div
                key={index}
                className={`flex h-10 items-center justify-center rounded text-sm transition-colors ${
                  dayInfo ? getIntensity(dayInfo.goalMet, dayInfo.hasData) : ''
                }`}
                title={dayInfo ? `${dayInfo.dateStr}: ${dayInfo.goalMet ? 'Goal met' : 'Goal missed'}` : ''}
              >
                {dayInfo?.day}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center justify-center gap-6 pt-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-green-500" />
              <span className="text-muted-foreground">Goal Met</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-red-200 dark:bg-red-900" />
              <span className="text-muted-foreground">Goal Missed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800" />
              <span className="text-muted-foreground">No Data</span>
            </div>
          </div>

          {/* Month Summary */}
          <div className="mt-4 grid grid-cols-3 gap-3 border-t pt-4">
            <div className="rounded-lg bg-accent/50 p-3 text-center">
              <p className="text-xs text-muted-foreground">Days Met Goal</p>
              <p className="mt-1 text-xl font-bold text-green-600">{monthlyData.daysMetGoal}</p>
            </div>
            <div className="rounded-lg bg-accent/50 p-3 text-center">
              <p className="text-xs text-muted-foreground">Days Missed</p>
              <p className="mt-1 text-xl font-bold text-red-600">
                {monthlyData.daysTotal - monthlyData.daysMetGoal}
              </p>
            </div>
            <div className="rounded-lg bg-accent/50 p-3 text-center">
              <p className="text-xs text-muted-foreground">On Pace %</p>
              <p className="mt-1 text-xl font-bold text-blue-600">{monthlyData.onPacePercentage}%</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
