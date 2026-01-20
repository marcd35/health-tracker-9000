'use client';

import { Sparkles } from 'lucide-react';
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
import { NUTRIENTS } from '@/constants/nutrients';
import { ToxicityProgressBar } from './ToxicityProgressBar';

interface VitaminProgressCardProps {
  progressData: NutrientProgress[];
}

export function VitaminProgressCard({ progressData }: VitaminProgressCardProps) {
  // Filter only vitamins and sort alphabetically by name
  const vitaminData = progressData
    .filter((nutrient) => NUTRIENTS[nutrient.nutrientKey]?.category === 'vitamin')
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" />
          <CardTitle>Vitamin Progress</CardTitle>
        </div>
        <CardDescription>Daily vitamin intake vs. Daily Reference Values (DRV)</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Vitamin Name</TableHead>
              <TableHead className="min-w-[200px]">Progress Bar</TableHead>
              <TableHead className="text-right whitespace-nowrap">Today&apos;s Intake</TableHead>
              <TableHead className="text-right whitespace-nowrap">Overage %</TableHead>
              <TableHead className="text-right whitespace-nowrap">DRV Target</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vitaminData.map((nutrient) => (
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
  const nutrientInfo = NUTRIENTS[nutrient.nutrientKey];

  const percentageOfTarget = target > 0 ? (total / target) * 100 : 0;
  const overagePercent = percentageOfTarget - 100;

  const formattedTotal = Number(total.toFixed(1));
  const formattedTarget = Number(target.toFixed(1));
  const formattedOverage = `${overagePercent > 0 ? '+' : ''}${Math.round(overagePercent)}%`;

  return (
    <TableRow>
      <TableCell className="font-medium">{name}</TableCell>
      <TableCell>
        <ToxicityProgressBar nutrient={nutrient} nutrientInfo={nutrientInfo} />
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
