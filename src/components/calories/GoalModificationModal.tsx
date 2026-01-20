'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import type { CalorieGoal } from '@/lib/types/calorieTracking';

interface GoalModificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentGoal: CalorieGoal | null;
  hasActiveStreak: boolean;
  onConfirm: (weeklyTarget: number, reason: string) => Promise<void>;
}

export function GoalModificationModal({
  open,
  onOpenChange,
  currentGoal,
  hasActiveStreak,
  onConfirm,
}: GoalModificationModalProps) {
  const [step, setStep] = useState<'adjust' | 'confirm-streak'>('adjust');
  const [weeklyTarget, setWeeklyTarget] = useState(currentGoal?.weeklyCalorieTarget || 0);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!currentGoal) return null;

  const projectedDailyTarget = Math.round(
    currentGoal.dailyCalorieTarget - currentGoal.weeklyCalorieTarget / 7 + weeklyTarget / 7
  );

  const handleNext = () => {
    if (!reason.trim()) {
      alert('Please provide a reason for changing your goal');
      return;
    }

    if (hasActiveStreak) {
      setStep('confirm-streak');
    } else {
      handleConfirm();
    }
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(weeklyTarget, reason);
      onOpenChange(false);
      // Reset form
      setStep('adjust');
      setWeeklyTarget(currentGoal.weeklyCalorieTarget);
      setReason('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        {step === 'adjust' ? (
          <>
            <DialogHeader>
              <DialogTitle>Adjust Your Calorie Goal</DialogTitle>
              <DialogDescription>
                Make changes to your weekly calorie target and tell us why.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Current Goal Display */}
              <div className="rounded-lg bg-accent/50 p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Current Weekly Target</span>
                  <span className="font-semibold">
                    {currentGoal.weeklyCalorieTarget > 0 ? '+' : ''}
                    {currentGoal.weeklyCalorieTarget} cal/week
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Current Daily Target</span>
                  <span className="font-semibold">{currentGoal.dailyCalorieTarget} cal/day</span>
                </div>
              </div>

              {/* Weekly Target Slider */}
              <div className="space-y-3">
                <label className="text-sm font-medium">New Weekly Target</label>
                <input
                  type="range"
                  min="-7000"
                  max="7000"
                  step="500"
                  value={weeklyTarget}
                  onChange={(e) => setWeeklyTarget(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>-7000</span>
                  <span className="font-semibold text-foreground">
                    {weeklyTarget > 0 ? '+' : ''}
                    {weeklyTarget} cal/week
                  </span>
                  <span>+7000</span>
                </div>
              </div>

              {/* Projected Daily Target */}
              <div className="rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-3">
                <p className="text-xs text-muted-foreground mb-1">Projected Daily Target</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {projectedDailyTarget} cal/day
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  This will apply to tomorrow and beyond. Today's tracking remains unchanged.
                </p>
              </div>

              {/* Reason */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Reason for Change</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g., increased activity level, lifestyle adjustment..."
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  rows={3}
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {hasActiveStreak ? 'Next' : 'Update Goal'}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Streak Confirmation Step */}
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                Confirm Streak Reset
              </DialogTitle>
              <DialogDescription>
                Changing your goal will reset your current streak.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Card className="p-4 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950">
                <p className="text-sm text-amber-900 dark:text-amber-100">
                  Your active streak will be reset when you change your goal. This allows you to build a fresh
                  streak with your new target. You can always create a new goal later if needed.
                </p>
              </Card>

              <div className="rounded-lg bg-accent/50 p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">New Weekly Target</span>
                  <span className="font-semibold">
                    {weeklyTarget > 0 ? '+' : ''}
                    {weeklyTarget} cal/week
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Projected Daily</span>
                  <span className="font-semibold">{projectedDailyTarget} cal/day</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border">
                  <span className="text-sm text-muted-foreground">Reason</span>
                  <span className="text-sm font-medium max-w-xs text-right">{reason}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setStep('adjust')}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? 'Updating...' : 'Confirm & Update'}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
