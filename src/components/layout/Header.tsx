'use client';

import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DateTimeClock } from './DateTimeClock';
import { DateNavigator } from './DateNavigator';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b bg-background/95 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Center: Date Navigator */}
      <div className="flex-1 flex justify-center">
        <DateNavigator />
      </div>

      {/* Right: Clock (if enabled) */}
      <div className="flex items-center">
        <DateTimeClock />
      </div>
    </header>
  );
}
