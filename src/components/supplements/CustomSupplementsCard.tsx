'use client';

import { CheckCircle2, Circle, Pill } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Supplement, SupplementLog, CustomNutrientProgress } from '@/lib/types/supplements';
import { cn } from '@/lib/utils';

interface CustomSupplementsCardProps {
  customSupplements: Supplement[];
  todayLogs: SupplementLog[];
  customNutrientProgress?: CustomNutrientProgress[];
  onTake: (supplement: Supplement) => void;
}

export function CustomSupplementsCard({
  customSupplements,
  todayLogs,
  customNutrientProgress = [],
  onTake,
}: CustomSupplementsCardProps) {
  if (customSupplements.length === 0 && customNutrientProgress.length === 0) {
    return null;
  }

  // Count taken logs for each supplement
  const takenCounts: Record<string, number> = {};
  todayLogs.forEach((log) => {
    if (log.taken) {
      takenCounts[log.supplementId] = (takenCounts[log.supplementId] || 0) + 1;
    }
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Pill className="h-5 w-5 text-purple-500" />
          <CardTitle>Custom Supplements</CardTitle>
        </div>
        <CardDescription>
          Non-FDA tracked supplements (fish oil, CoQ10, probiotics, etc.)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Supplement Checklist Section */}
        {customSupplements.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-sm mb-3">Today&apos;s Checklist</h3>
            {customSupplements.map((supplement) => {
              const takenCount = takenCounts[supplement.id] || 0;
              const isTaken = takenCount > 0;

              return (
                <div
                  key={supplement.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {isTaken ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    )}

                    <div className="flex-1">
                      <p className="font-medium text-sm">{supplement.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {supplement.brand ? `${supplement.brand} • ` : ''}
                        {supplement.servingSize}
                        {takenCount > 1 && (
                          <span className="ml-2 text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded">
                            Taken ×{takenCount}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {!isTaken && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onTake(supplement)}
                      className="ml-2 flex-shrink-0"
                    >
                      Take
                    </Button>
                  )}

                  {isTaken && (
                    <div className="text-xs text-green-600 font-medium flex-shrink-0">✓ Taken</div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Custom Nutrient Progress Section */}
        {customNutrientProgress.length > 0 && (
          <div className="pt-4 border-t">
            <h3 className="font-semibold text-sm mb-3">Custom Nutrient Progress</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[160px]">Nutrient</TableHead>
                  <TableHead className="min-w-[200px]">Progress</TableHead>
                  <TableHead className="text-right">Intake</TableHead>
                  <TableHead className="text-right">Target</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customNutrientProgress.map((nutrient) => (
                  <CustomNutrientRow key={nutrient.nutrientKey} nutrient={nutrient} />
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {customNutrientProgress.length === 0 && customSupplements.length > 0 && (
          <p className="text-xs text-muted-foreground">
            No custom nutrients defined yet. Create custom nutrients in the &quot;Custom
            Nutrients&quot; tab to track them.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function CustomNutrientRow({ nutrient }: { nutrient: CustomNutrientProgress }) {
  const { name, total, target, unit } = nutrient;

  // If no target is set, show "No target" state
  if (!target) {
    return (
      <TableRow>
        <TableCell className="font-medium">{name}</TableCell>
        <TableCell>
          <div className="text-xs text-muted-foreground">No target set</div>
        </TableCell>
        <TableCell className="text-right whitespace-nowrap">
          {total.toFixed(1)}
          <span className="text-xs text-muted-foreground ml-1">{unit}</span>
        </TableCell>
        <TableCell className="text-right text-xs text-muted-foreground">—</TableCell>
      </TableRow>
    );
  }

  const percentageOfTarget = target > 0 ? (total / target) * 100 : 0;
  const visualWidth = Math.min(100, (percentageOfTarget / 100) * 95);

  let barColorClass = 'bg-yellow-500';
  if (total === 0) {
    barColorClass = 'bg-red-500';
  } else if (percentageOfTarget >= 100) {
    barColorClass = 'bg-green-500';
  }

  const formattedTotal = Number(total.toFixed(1));
  const formattedTarget = Number(target.toFixed(1));
  const formattedPercent = `${Math.round(percentageOfTarget)}%`;

  return (
    <TableRow>
      <TableCell className="font-medium">{name}</TableCell>
      <TableCell>
        <div className="relative h-6 w-full bg-secondary/30 rounded-sm overflow-hidden">
          <div
            className="absolute top-0 bottom-0 w-px bg-red-500 z-10"
            style={{ left: '95%' }}
            title="Target (100%)"
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
      <TableCell className="text-right whitespace-nowrap">
        <span className="text-sm">{formattedTarget}</span>
        <span className="text-xs text-muted-foreground ml-1">{unit}</span>
        <span className="text-xs text-muted-foreground ml-2">({formattedPercent})</span>
      </TableCell>
    </TableRow>
  );
}
