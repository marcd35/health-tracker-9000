'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Archive, Plus } from 'lucide-react';
import type { CalorieGoalHistory } from '@/lib/types/calorieTracking';

interface GoalHistoryTimelineProps {
  history: CalorieGoalHistory[];
}

export function GoalHistoryTimeline({ history }: GoalHistoryTimelineProps) {
  if (!history || history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Goal Change History</CardTitle>
          <CardDescription>No goal changes recorded yet</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Sort by date descending (most recent first)
  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()
  );

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
        return <Plus className="w-4 h-4" />;
      case 'updated':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'archived':
        return <Archive className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getActionLabel = (action: string): string => {
    switch (action) {
      case 'created':
        return 'Created';
      case 'updated':
        return 'Updated';
      case 'archived':
        return 'Archived';
      default:
        return action;
    }
  };

  const getActionColor = (action: string): string => {
    switch (action) {
      case 'created':
        return 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200';
      case 'updated':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200';
      case 'archived':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Goal Change History</CardTitle>
        <CardDescription>Track all changes to your calorie goals</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedHistory.map((entry, index) => {
            const date = new Date(entry.changedAt);
            const formattedDate = date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });
            const formattedTime = date.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div key={entry.id} className="relative flex gap-4">
                {/* Timeline connector */}
                {index !== sortedHistory.length - 1 && (
                  <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-border" />
                )}

                {/* Timeline dot */}
                <div
                  className={`relative flex items-center justify-center w-9 h-9 rounded-full bg-background border-2 ${
                    entry.action === 'created'
                      ? 'border-green-500'
                      : entry.action === 'updated'
                        ? 'border-blue-500'
                        : 'border-gray-500'
                  }`}
                >
                  <div className="text-muted-foreground">{getActionIcon(entry.action)}</div>
                </div>

                {/* Content */}
                <div className="flex-1 pt-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={getActionColor(entry.action)}>
                      {getActionLabel(entry.action)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{formattedDate}</span>
                    <span className="text-xs text-muted-foreground">{formattedTime}</span>
                  </div>

                  {/* Goal details */}
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {entry.previousDailyTarget && (
                      <div className="rounded-lg bg-accent/50 p-2">
                        <p className="text-xs text-muted-foreground">Previous Daily</p>
                        <p className="font-semibold text-sm">{Math.round(entry.previousDailyTarget)} cal</p>
                      </div>
                    )}
                    {entry.newDailyTarget && (
                      <div className="rounded-lg bg-accent/50 p-2">
                        <p className="text-xs text-muted-foreground">New Daily</p>
                        <p className="font-semibold text-sm">{Math.round(entry.newDailyTarget)} cal</p>
                      </div>
                    )}
                  </div>

                  {/* Reason */}
                  {entry.changeReason && (
                    <p className="text-sm text-muted-foreground mt-2 italic">
                      "{entry.changeReason}"
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
