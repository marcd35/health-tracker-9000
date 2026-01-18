'use client';

import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface SupplementCheckboxProps {
  id: string;
  name: string;
  brand: string;
  taken: boolean;
  onToggle: (id: string, taken: boolean) => void;
  className?: string;
}

export function SupplementCheckbox({
  id,
  name,
  brand,
  taken,
  onToggle,
  className,
}: SupplementCheckboxProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between p-4 rounded-xl border transition-all duration-200',
        taken
          ? 'bg-primary/5 border-primary/20 shadow-sm'
          : 'bg-card border-border hover:border-primary/30',
        className
      )}
    >
      <div className="flex flex-col">
        <span
          className={cn(
            'text-sm font-semibold transition-colors',
            taken ? 'text-primary' : 'text-card-foreground'
          )}
        >
          {name}
        </span>
        <span className="text-xs text-muted-foreground">{brand}</span>
      </div>
      <Checkbox
        id={id}
        checked={taken}
        onCheckedChange={(checked) => onToggle(id, !!checked)}
        className="h-6 w-6 rounded-full border-2"
      />
    </div>
  );
}
