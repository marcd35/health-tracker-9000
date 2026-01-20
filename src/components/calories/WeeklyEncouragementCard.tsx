'use client';

import { Lightbulb, Heart, Target, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { WeeklyProgressData } from '@/lib/types/calorieTracking';

interface WeeklyEncouragementCardProps {
  weeklyData: WeeklyProgressData | null;
  goalType: 'weight_loss' | 'maintenance' | 'gain';
}

export function WeeklyEncouragementCard({ weeklyData, goalType }: WeeklyEncouragementCardProps) {
  if (!weeklyData) return null;

  const generateMessage = () => {
    const daysInWeek = weeklyData.days?.length || 7;
    const daysMetGoal = weeklyData.daysMetGoal || 0;
    const onPacePercentage = weeklyData.onPacePercentage || 0;

    // Perfect week
    if (daysMetGoal === 7) {
      const messages = [
        '🎉 Absolutely amazing! You crushed every single day this week!',
        '🏆 Perfect week! Your consistency is inspiring!',
        '⭐ Outstanding effort! You nailed every day!',
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    }

    // Great week (6+ days)
    if (daysMetGoal >= 6) {
      return `Great work! You hit your goal ${daysMetGoal} out of ${daysInWeek} days. Almost there! 💪`;
    }

    // Good progress (4-5 days)
    if (daysMetGoal >= 4) {
      const remaining = daysInWeek - daysMetGoal;
      return `You're making solid progress! ${remaining} more day${remaining !== 1 ? 's' : ''} to turn this into a great week! 🚀`;
    }

    // Moderate progress (2-3 days)
    if (daysMetGoal >= 2) {
      return `Don't worry, you're building momentum. Keep pushing—the best is yet to come! 📈`;
    }

    // Struggling
    if (daysMetGoal === 1) {
      return `Every journey starts with a single step. You've got this! Let's make the rest of the week count! 🌟`;
    }

    // No days met
    return `This week hasn't been your best, but that's okay! Today is a fresh start. Let's go! 💪`;
  };

  const getIcon = () => {
    const daysMetGoal = weeklyData.daysMetGoal || 0;
    if (daysMetGoal >= 6) return <TrendingUp className="h-5 w-5" />;
    if (daysMetGoal >= 4) return <Target className="h-5 w-5" />;
    return <Heart className="h-5 w-5" />;
  };

  const getBackgroundColor = () => {
    const daysMetGoal = weeklyData.daysMetGoal || 0;
    if (daysMetGoal >= 6) return 'bg-green-50 dark:bg-green-900/20';
    if (daysMetGoal >= 4) return 'bg-blue-50 dark:bg-blue-900/20';
    return 'bg-purple-50 dark:bg-purple-900/20';
  };

  const getTextColor = () => {
    const daysMetGoal = weeklyData.daysMetGoal || 0;
    if (daysMetGoal >= 6) return 'text-green-700 dark:text-green-400';
    if (daysMetGoal >= 4) return 'text-blue-700 dark:text-blue-400';
    return 'text-purple-700 dark:text-purple-400';
  };

  const getIconColor = () => {
    const daysMetGoal = weeklyData.daysMetGoal || 0;
    if (daysMetGoal >= 6) return 'text-green-600 dark:text-green-400';
    if (daysMetGoal >= 4) return 'text-blue-600 dark:text-blue-400';
    return 'text-purple-600 dark:text-purple-400';
  };

  return (
    <Card className={getBackgroundColor()}>
      <CardContent className="pt-6">
        <div className="flex gap-4">
          <div className={`flex-shrink-0 ${getIconColor()}`}>
            <Lightbulb className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p className={`${getTextColor()} text-sm font-medium leading-relaxed`}>
              {generateMessage()}
            </p>
            {weeklyData.projection && (
              <p className="mt-2 text-xs text-muted-foreground">
                📊 At this pace, you're projected to end the week at{' '}
                <span className="font-semibold">{Math.round(weeklyData.projection)} calories</span>.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
