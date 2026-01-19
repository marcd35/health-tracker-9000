'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash2 } from 'lucide-react';
import { VITAMINS, MINERALS } from '@/constants/nutrients';
import type { NutrientKey } from '@/lib/types/supplements';

interface NutrientInputProps {
  nutrientKey: NutrientKey | '';
  amount: number;
  usedKeys: NutrientKey[];
  onNutrientChange: (key: NutrientKey) => void;
  onAmountChange: (amount: number) => void;
  onRemove: () => void;
}

export function NutrientInput({
  nutrientKey,
  amount,
  usedKeys,
  onNutrientChange,
  onAmountChange,
  onRemove,
}: NutrientInputProps) {
  const selectedNutrient = nutrientKey
    ? [...VITAMINS, ...MINERALS].find((n) => n.key === nutrientKey)
    : null;

  return (
    <div className="flex items-center gap-2">
      <Select
        value={nutrientKey}
        onValueChange={(val) => onNutrientChange(val as NutrientKey)}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select nutrient" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Vitamins</SelectLabel>
            {VITAMINS.map((vitamin) => (
              <SelectItem
                key={vitamin.key}
                value={vitamin.key}
                disabled={usedKeys.includes(vitamin.key) && vitamin.key !== nutrientKey}
              >
                {vitamin.name}
              </SelectItem>
            ))}
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Minerals</SelectLabel>
            {MINERALS.map((mineral) => (
              <SelectItem
                key={mineral.key}
                value={mineral.key}
                disabled={usedKeys.includes(mineral.key) && mineral.key !== nutrientKey}
              >
                {mineral.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <div className="flex items-center gap-1">
        <Input
          type="number"
          min="0"
          step="0.01"
          value={amount || ''}
          onChange={(e) => onAmountChange(parseFloat(e.target.value) || 0)}
          className="w-24"
          placeholder="Amount"
        />
        {selectedNutrient && (
          <span className="text-sm text-muted-foreground w-10">
            {selectedNutrient.unit}
          </span>
        )}
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
