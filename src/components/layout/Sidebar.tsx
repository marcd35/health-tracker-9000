'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Utensils,
  Pill,
  History,
  Settings,
  BarChart3,
  HeartPulse,
  Shield,
  Flame,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Meals', href: '/meals', icon: Utensils },
  { name: 'Calories', href: '/calories', icon: Flame },
  { name: 'Supplements', href: '/supplements', icon: Pill },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'History', href: '/history', icon: History },
  { name: 'Profile', href: '/profile', icon: Settings },
  { name: 'Admin', href: '/admin', icon: Shield },
];

interface SidebarProps {
  className?: string;
  onClose?: () => void;
}

export function Sidebar({ className, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div
      className={cn('flex h-full w-64 flex-col border-r bg-card text-card-foreground', className)}
    >
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-primary">
          <HeartPulse className="h-6 w-6" />
          <span>HealthTracker 9000</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={cn(
                'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5 flex-shrink-0',
                  isActive
                    ? 'text-primary-foreground'
                    : 'text-muted-foreground group-hover:text-accent-foreground'
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-4">
        <div className="flex items-center gap-3 rounded-lg bg-accent/50 p-3">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
            JD
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">John Doe</p>
            <p className="text-xs text-muted-foreground truncate">Level: Gout Buster</p>
          </div>
        </div>
      </div>
    </div>
  );
}
