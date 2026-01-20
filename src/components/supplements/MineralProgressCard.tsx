'use client';

import { Gem } from 'lucide-react';
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

interface MineralProgressCardProps {
  progressData: NutrientProgress[];
}

export function MineralProgressCard({ progressData }: MineralProgressCardProps) {
  // Filter only minerals (14 minerals)
  const mineralData = progressData.filter((nutrient) =>
    [
      'calcium',
      'iron',
      'magnesium',
      'zinc',
      'potassium',
      'selenium',
      'copper',
      'manganese',
      'chromium',
      'iodine',
      'phosphorus',
      'sodium',
      'chloride',
      'molybdenum',
    ].includes(nutrient.nutrientKey)
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Gem className="h-5 w-5 text-emerald-500" />
          <CardTitle>Mineral Progress</CardTitle>
        </div>
        <CardDescription>Daily mineral intake vs. Daily Reference Values (DRV)</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Mineral Name</TableHead>
              <TableHead className="min-w-[200px]">Progress Bar</TableHead>
              <TableHead className="text-right whitespace-nowrap">Today&apos;s Intake</TableHead>
              <TableHead className="text-right whitespace-nowrap">Overage %</TableHead>
              <TableHead className="text-right whitespace-nowrap">DRV Target</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mineralData.map((nutrient) => (
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

  const percentageOfTarget = target > 0 ? (total / target) * 100 : 0;
  const overagePercent = percentageOfTarget - 100;
  const visualWidth = Math.min(100, (percentageOfTarget / 100) * 95);

  let barColorClass = 'bg-yellow-500';
  if (total === 0) {
    barColorClass = 'bg-red-900';
  } else if (percentageOfTarget >= 100) {
    barColorClass = 'bg-green-500';
  }

  const formattedTotal = Number(total.toFixed(1));
  const formattedTarget = Number(target.toFixed(1));
  const formattedOverage = `${overagePercent > 0 ? '+' : ''}${Math.round(overagePercent)}%`;

  return (
    <TableRow>
      <TableCell className="font-medium">{name}</TableCell>
      <TableCell>
        <div className="relative h-6 w-full bg-secondary/30 rounded-sm overflow-hidden">
          <div
            className="absolute top-0 bottom-0 w-px bg-red-500 z-10"
            style={{ left: '95%' }}
            title="Target (100% DRV)"
          />

          <div
            className={cn('h-full transition-all duration-500', barColorClass)}
            style={{ width: `${visualWidth}%` }}
          />
        </div>
      </TableCell>
      <TableCell className="text-right whitespace-nowrap">
        {formattedTotal}
        <span className="text-xs text-muted-foreground ml-1">{unit}</span>
      </TableCell>
      <TableCell className="text-right whitespace-nowrap">{formattedOverage}</TableCell>
      <TableCell className="text-right whitespace-nowrap">
        {formattedTarget}
        <span className="text-xs text-muted-foreground ml-1">{unit}</span>
      </TableCell>
    </TableRow>
  );
}
