'use client';

import { ChevronLeft, ChevronRight, Home, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHealthStore } from '@/lib/store/healthStore';
import { format, isToday, parseISO } from 'date-fns';

export function DateNavigator() {
  const { activeDate, navigateToYesterday, navigateToTomorrow, navigateToToday } = useHealthStore();

  const isViewingToday = isToday(parseISO(activeDate));
  const displayDate = format(parseISO(activeDate), 'EEEE, MMM d, yyyy');

  return (
    <div className="flex items-center gap-2">
      {/* Temporal clarity indicator - UNMISTAKABLE when not viewing today */}
      {typeof window !== 'undefined' && !isViewingToday && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-orange-100 dark:bg-orange-900/30 border-2 border-orange-400 dark:border-orange-600">
          <Calendar className="h-4 w-4 text-orange-700 dark:text-orange-300" />
          <span className="text-sm font-semibold text-orange-800 dark:text-orange-200">
            Viewing: {displayDate}
          </span>
        </div>
      )}

      {/* Yesterday button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={navigateToYesterday}
        title="Previous day"
        className="h-8 w-8"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Native HTML date picker */}
      <input
        type="date"
        value={activeDate}
        onChange={(e) => {
          const store = useHealthStore.getState();
          store.setActiveDate(e.target.value);
        }}
        className="h-8 rounded-md border border-input bg-background px-3 text-sm"
        title="Select date"
      />

      {/* Tomorrow button - NEVER disabled */}
      <Button
        variant="ghost"
        size="icon"
        onClick={navigateToTomorrow}
        title="Next day"
        className="h-8 w-8"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Quick "Today" button - only show when not viewing today */}
      {!isViewingToday && (
        <Button variant="default" size="sm" onClick={navigateToToday} className="gap-1.5 h-8">
          <Home className="h-3 w-3" />
          Today
        </Button>
      )}
    </div>
  );
}
