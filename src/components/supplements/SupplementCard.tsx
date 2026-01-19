'use client';

import { Pill, Pencil, Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { Supplement } from '@/lib/types/supplements';
import { NUTRIENTS } from '@/constants/nutrients';

interface SupplementCardProps {
  supplement: Supplement;
  takenCount: number;
  onEdit: () => void;
  onDelete: () => void;
  onTake: () => void;
}

export function SupplementCard({
  supplement,
  takenCount,
  onEdit,
  onDelete,
  onTake,
}: SupplementCardProps) {
  const nutrientCount = Object.keys(supplement.nutrients).length;
  const topNutrients = Object.entries(supplement.nutrients)
    .slice(0, 3)
    .map(([key, value]) => {
      const info = NUTRIENTS[key as keyof typeof NUTRIENTS];
      return info ? `${info.name}: ${value}${info.unit}` : null;
    })
    .filter(Boolean);

  return (
    <Card className="relative overflow-hidden">
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ backgroundColor: supplement.color }}
      />
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: supplement.color }}
            />
            <CardTitle className="text-base">{supplement.name}</CardTitle>
          </div>
          <div className="flex gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={onEdit}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={onDelete}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <CardDescription>{supplement.brand}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Pill className="h-3 w-3" />
            <span>{supplement.servingSize}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>
              {supplement.dosageQuantity}x {supplement.dosageFrequency}
            </span>
          </div>
        </div>

        {supplement.dosageNotes && (
          <p className="text-xs text-muted-foreground italic">
            {supplement.dosageNotes}
          </p>
        )}

        {topNutrients.length > 0 && (
          <div className="text-xs text-muted-foreground">
            {topNutrients.join(' • ')}
            {nutrientCount > 3 && ` +${nutrientCount - 3} more`}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="text-sm">
            {takenCount > 0 ? (
              <span className="text-green-600 font-medium">
                Taken {takenCount}x today
              </span>
            ) : (
              <span className="text-muted-foreground">Not taken yet</span>
            )}
          </div>
          <Button size="sm" onClick={onTake}>
            Take Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
