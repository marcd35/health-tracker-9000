'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import type { DailyCalorieTracking, GoalType } from '@/lib/types/calorieTracking';

interface CalorieProgressCardProps {
  tracking: DailyCalorieTracking;
  goalType: GoalType;
}

export function CalorieProgressCard({ tracking, goalType }: CalorieProgressCardProps) {
  const consumed = tracking.caloriesConsumed;
  const target = tracking.caloriesTarget;
  const remaining = target - consumed;

  // Calculate percentage for visualization
  let percentageOfGoal = 0;
  let status: 'on-track' | 'close' | 'over' = 'on-track';

  if (goalType === 'weight_loss') {
    // For weight loss, we want to be BELOW target
    percentageOfGoal = Math.min((consumed / target) * 100, 100);
    if (consumed > target) status = 'over';
    else if (consumed > target * 0.85) status = 'close';
    else status = 'on-track';
  } else if (goalType === 'gain') {
    // For weight gain, we want to be ABOVE target
    percentageOfGoal = Math.min((consumed / target) * 100, 100);
    if (consumed < target) status = 'close';
    else status = 'on-track';
  } else {
    // For maintenance, we want to be close to target
    percentageOfGoal = Math.min((consumed / target) * 100, 100);
    const diff = Math.abs(consumed - target);
    if (diff <= 50) status = 'on-track';
    else if (diff <= 150) status = 'close';
    else status = 'over';
  }

  const chartData = [
    { name: 'Consumed', value: consumed, color: '#3b82f6' },
    { name: 'Remaining', value: Math.max(0, remaining), color: '#e5e7eb' },
  ];

  const statusColors = {
    'on-track': 'bg-green-50 text-green-800 border-green-200',
    'close': 'bg-amber-50 text-amber-800 border-amber-200',
    'over': 'bg-red-50 text-red-800 border-red-200',
  };

  const statusMessages = {
    'on-track': goalType === 'weight_loss' ? '🎯 On track!' : goalType === 'gain' ? '💪 Keep going!' : '✨ Perfect!',
    'close': goalType === 'weight_loss' ? '⚠️ Getting close' : goalType === 'gain' ? '🎯 Almost there' : '⚠️ Close',
    'over': goalType === 'weight_loss' ? '❌ Over target' : goalType === 'gain' ? '✅ Met goal!' : '⚠️ Over target',
  };

  return (
    <Card className={`p-6 ${statusColors[status]} border`}>
      <div className="grid grid-cols-2 gap-6 items-center">
        {/* Left side: Circular Chart */}
        <div className="flex flex-col items-center justify-center">
          <div className="w-32 h-32">
            <ResponsiveContainer width="100%" height="100%">
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
          </div>
          <p className="text-2xl font-bold mt-4 text-center">{percentageOfGoal.toFixed(0)}%</p>
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
