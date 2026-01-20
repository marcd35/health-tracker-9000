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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { NutrientProgress, NutrientInfo } from '@/lib/types/supplements';
import { NUTRIENTS } from '@/constants/nutrients';
import { ToxicityProgressBar, getToxicityStatus } from './ToxicityProgressBar';
import { cn } from '@/lib/utils';

interface MineralProgressCardProps {
  progressData: NutrientProgress[];
}

export function MineralProgressCard({ progressData }: MineralProgressCardProps) {
  // Filter only minerals and sort alphabetically by name
  const mineralData = progressData
    .filter((nutrient) => NUTRIENTS[nutrient.nutrientKey]?.category === 'mineral')
    .sort((a, b) => a.name.localeCompare(b.name));

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
              <TableHead className="w-12">Status</TableHead>
              <TableHead className="min-w-[120px]">Progress Bar</TableHead>
              <TableHead className="text-right whitespace-nowrap hidden md:table-cell">
                Intake / Target
              </TableHead>
              <TableHead className="text-center w-16">%</TableHead>
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

// Helper to render percentage cell with appropriate color and tooltip
function renderPercentageCell(
  nutrient: NutrientProgress,
  nutrientInfo: NutrientInfo,
  toxicityStatus: ReturnType<typeof getToxicityStatus>
) {
  const percentage = Math.round(nutrient.percentage);

  // Determine color based on toxicity tracking
  let textColor = 'text-foreground';
  let showTooltip = false;
  let tooltipText = '';

  if (nutrientInfo.toxicLevel) {
    // Has toxicity level - use toxicity status color
    textColor = toxicityStatus.color;
  } else {
    // No toxicity level - yellow if >200%
    if (percentage > 200) {
      textColor = 'text-yellow-600';
      showTooltip = true;
      tooltipText =
        'No official toxicity limit established. Values >200% may warrant review with healthcare provider.';
    }
  }

  const content = <span className={cn('font-medium text-sm', textColor)}>{percentage}%</span>;

  // Wrap in tooltip if needed
  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="cursor-help">{content}</div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <p className="text-xs">{tooltipText}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
}

function NutrientRow({ nutrient }: { nutrient: NutrientProgress }) {
  const { name, total, unit } = nutrient;
  const nutrientInfo = NUTRIENTS[nutrient.nutrientKey];
  const toxicityStatus = getToxicityStatus(nutrient, nutrientInfo);

  const formattedTotal = Number(total.toFixed(1));
  const formattedTarget = Number(nutrient.target.toFixed(1));

  const StatusIcon = toxicityStatus.icon;

  return (
    <TableRow>
      <TableCell className="font-medium">{name}</TableCell>
      <TableCell className="text-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex justify-center">
                <StatusIcon className={`h-5 w-5 ${toxicityStatus.color}`} />
              </div>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>{toxicityStatus.title}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
      <TableCell>
        <ToxicityProgressBar nutrient={nutrient} nutrientInfo={nutrientInfo} />
      </TableCell>
      <TableCell className="text-right whitespace-nowrap hidden md:table-cell">
        <span
          className={
            toxicityStatus.status === 'toxic'
              ? 'text-red-600 font-medium'
              : toxicityStatus.status === 'warning'
                ? 'text-yellow-600 font-medium'
                : 'text-green-600 font-medium'
          }
        >
          {formattedTotal}
        </span>
        <span className="text-xs text-muted-foreground ml-1">{unit}</span>
        <span className="text-xs text-muted-foreground mx-1">/</span>
        <span className="text-xs text-muted-foreground">
          {formattedTarget}
          <span className="ml-0.5">{unit}</span>
        </span>
      </TableCell>
      {/* Percentage cell */}
      <TableCell className="text-center">
        {renderPercentageCell(nutrient, nutrientInfo, toxicityStatus)}
      </TableCell>
    </TableRow>
  );
}
