'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useHealthStore } from '@/lib/store/healthStore';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';

export function DateTimeClock() {
  const [time, setTime] = useState<string>('');
  const { preferences } = useHealthStore();

  useEffect(() => {
    // Initial time set
    updateTime();

    // Update every second
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [preferences?.timezone]);

  function updateTime() {
    try {
      const now = new Date();

      // Format date and time - using local system time
      const formatted = format(now, 'EEEE, MMMM d, yyyy HH:mm:ss');
      setTime(formatted);
    } catch (error) {
      console.error('Error formatting time:', error);
      setTime('');
    }
  }

  // If preferences not loaded yet or clock is hidden, show compact button
  if (!preferences) {
    return (
      <div className="flex items-center">
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <Clock className="w-4 h-4 mr-2" />
          Loading...
        </Button>
      </div>
    );
  }

  if (!preferences.showClock) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => useHealthStore.setState({ preferences: { ...preferences, showClock: true } })}
        className="text-muted-foreground"
      >
        <Clock className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <div className="flex items-center text-sm font-medium text-foreground">
      <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
      <span>{time || 'Loading...'}</span>
    </div>
  );
}
