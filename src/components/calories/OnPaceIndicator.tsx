'use client';

import { CheckCircle2, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnPaceIndicatorProps {
  percentage: number;
  goalType: 'weight_loss' | 'maintenance' | 'gain';
  size?: 'sm' | 'md' | 'lg';
  showTrend?: boolean;
  trend?: 'up' | 'down' | 'stable';
}

export function OnPaceIndicator({
  percentage,
  goalType,
  size = 'md',
  showTrend = false,
  trend,
}: OnPaceIndicatorProps) {
  // Determine status based on percentage and goal type
  const getStatus = () => {
    if (goalType === 'weight_loss' || goalType === 'gain') {
      if (percentage >= 100) return 'on-track';
      if (percentage >= 75) return 'approaching';
      return 'behind';
    } else {
      // maintenance
      if (percentage >= 80) return 'on-track';
      if (percentage >= 60) return 'approaching';
      return 'behind';
    }
  };

  const status = getStatus();

  const getStatusStyles = () => {
    switch (status) {
      case 'on-track':
        return 'bg-green-100 text-green-700';
      case 'approaching':
        return 'bg-amber-100 text-amber-700';
      case 'behind':
        return 'bg-red-100 text-red-700';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'on-track':
        return <CheckCircle2 className={sizeMap[size].icon} />;
      case 'approaching':
        return <AlertCircle className={sizeMap[size].icon} />;
      case 'behind':
        return <AlertCircle className={sizeMap[size].icon} />;
    }
  };

  const sizeMap = {
    sm: { text: 'text-xs', icon: 'h-3 w-3', label: 'text-xs' },
    md: { text: 'text-sm', icon: 'h-4 w-4', label: 'text-xs' },
    lg: { text: 'text-base', icon: 'h-5 w-5', label: 'text-sm' },
  };

  const getStatusText = () => {
    switch (status) {
      case 'on-track':
        return 'On Track';
      case 'approaching':
        return 'Close';
      case 'behind':
        return 'Behind';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className={cn('rounded-full p-2', getStatusStyles())}>
        {getStatusIcon()}
      </div>
      <div className="flex flex-col">
        <div className={cn(sizeMap[size].text, 'font-semibold')}>
          {percentage}% {getStatusText()}
        </div>
        {showTrend && trend && (
          <div className={cn(sizeMap[size].label, 'text-muted-foreground flex items-center gap-1')}>
            {trend === 'up' && <TrendingUp className="h-3 w-3" />}
            {trend === 'down' && <TrendingDown className="h-3 w-3" />}
            {trend === 'stable' && <span className="text-xs">→</span>}
            <span className="capitalize">{trend}</span>
          </div>
        )}
      </div>
    </div>
  );
}
