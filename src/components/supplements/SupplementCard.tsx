'use client';

import { Eye, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Supplement } from '@/lib/types/supplements';

interface SupplementCardProps {
  supplement: Supplement;
  takenCount: number;
  onView: () => void;
  onTakeEarlier: () => void;
  onTake: () => void;
}

export function SupplementCard({
  supplement,
  takenCount,
  onView,
  onTakeEarlier,
  onTake,
}: SupplementCardProps) {
  return (
    <Card className="relative overflow-hidden py-1">
      {/* Color indicator bar on left edge */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ backgroundColor: supplement.color }}
      />
      <CardContent className="px-3 py-1.5 space-y-2">
        {/* Title row with name and brand */}
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-base leading-tight">{supplement.name}</h3>
          <p className="text-xs text-muted-foreground">{supplement.brand}</p>
        </div>

        {/* Divider */}
        <div className="border-t" />

        {/* Info section: Dosage and Serving size */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {/* Left column: Dosage */}
          <div className="text-xs text-muted-foreground">
            <div>
              {supplement.dosageQuantity}x {supplement.dosageFrequency}
            </div>
          </div>

          {/* Right column: Serving size */}
          <div className="text-right text-xs text-muted-foreground">
            <div>{supplement.servingSize}</div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t" />

        {/* Middle section: Action buttons - all in one row */}
        <div className="flex justify-center gap-1.5 items-center">
          <Button
            variant="outline"
            size="icon"
            onClick={onView}
            title="View details"
            className="h-8 w-8"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={onTakeEarlier}
            title="Log earlier time"
            className="h-8 w-8"
          >
            <Calendar className="h-4 w-4" />
          </Button>
          <Button size="sm" onClick={onTake} className="h-7 px-2 text-xs w-20">
            Take Now
          </Button>
        </div>

        {/* Divider */}
        <div className="border-t" />

        {/* Bottom section: Status */}
        <div className="text-center text-xs py-0.5">
          {takenCount > 0 ? (
            <span className="text-green-600 dark:text-green-400 font-medium">
              Taken {takenCount}x today
            </span>
          ) : (
            <span className="text-muted-foreground">Not taken yet</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
