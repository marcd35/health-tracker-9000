'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { NutrientProgress } from '@/lib/types/supplements';
import { cn } from '@/lib/utils';

interface NutrientTrackingTableProps {
  progressData: NutrientProgress[];
}

export function NutrientTrackingTable({ progressData }: NutrientTrackingTableProps) {
  // Sort or group logic can go here if needed. currently existing list is likely sorted by key insertion order in NUTRIENTS.
  // We can keep the default order from NUTRIENTS constant which is mapped in progressData.

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nutrient Progress</CardTitle>
        <CardDescription>
          Daily intake vs. Daily Reference Values (DRV). target is indicated by the red line (95%).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Nutrient Name</TableHead>
              <TableHead className="min-w-[200px]">Progress Bar</TableHead>
              <TableHead className="text-right whitespace-nowrap">Today&apos;s Intake</TableHead>
              <TableHead className="text-right whitespace-nowrap">Overage %</TableHead>
              <TableHead className="text-right whitespace-nowrap">DRV Target</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {progressData.map((nutrient) => (
              <NutrientRow key={nutrient.nutrientKey} nutrient={nutrient} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function NutrientRow({ nutrient }: { nutrient: NutrientProgress }) {
  const { name, total, target, unit } = nutrient;

  // Calculations
  const percentageOfTarget = target > 0 ? (total / target) * 100 : 0;

  // Overage %: percentage above or below target
  // e.g., 50% intake -> -50% overage
  // 150% intake -> +50% overage
  const overagePercent = percentageOfTarget - 100;

  // Progress Bar Width Logic
  // Target (100%) aligns with 95% of the bar's visual width.
  // visualWidth% = (percentageOfTarget / 100) * 95
  // Max width capped at 100% (which would be ~105% of target)
  const visualWidth = Math.min(100, (percentageOfTarget / 100) * 95);

  // Color Logic
  // Dark red if no data (0%)
  // Yellow if < 100%
  // Green if >= 100%
  let barColorClass = 'bg-yellow-500'; // Default to yellow (under target)
  if (total === 0) {
    barColorClass = 'bg-red-900';
  } else if (percentageOfTarget >= 100) {
    barColorClass = 'bg-green-500';
  }

  // Format numbers
  const formattedTotal = Number(total.toFixed(1));
  const formattedTarget = Number(target.toFixed(1));
  const formattedOverage = `${overagePercent > 0 ? '+' : ''}${Math.round(overagePercent)}%`;

  return (
    <TableRow>
      <TableCell className="font-medium">{name}</TableCell>
      <TableCell>
        <div className="relative h-6 w-full bg-secondary/30 rounded-sm overflow-hidden">
          {/* 95% Marker Line - Represents the Target */}
          <div
            className="absolute top-0 bottom-0 w-px bg-red-500 z-10"
            style={{ left: '95%' }}
            title="Target (100% DRV)"
          />

          {/* Progress Fill */}
          <div
            className={cn('h-full transition-all duration-500', barColorClass)}
            style={{ width: `${visualWidth}%` }}
          />
        </div>
      </TableCell>
      <TableCell className="text-right tabular-nums">
        {formattedTotal} <span className="text-muted-foreground text-xs">{unit}</span>
      </TableCell>
      <TableCell
        className={cn(
          'text-right tabular-nums',
          overagePercent > 0 ? 'text-green-600 font-medium' : 'text-muted-foreground'
        )}
      >
        {formattedOverage}
      </TableCell>
      <TableCell className="text-right tabular-nums text-muted-foreground">
        {formattedTarget} <span className="text-xs">{unit}</span>
      </TableCell>
    </TableRow>
  );
}
