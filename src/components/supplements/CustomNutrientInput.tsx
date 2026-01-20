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
import type { CustomNutrientMetadata } from '@/lib/types/supplements';

interface CustomNutrientInputProps {
  nutrientKey: string;
  amount: number;
  availableNutrients: CustomNutrientMetadata[];
  usedKeys: string[];
  onNutrientChange: (key: string) => void;
  onAmountChange: (amount: number) => void;
  onRemove: () => void;
}

export function CustomNutrientInput({
  nutrientKey,
  amount,
  availableNutrients,
  usedKeys,
  onNutrientChange,
  onAmountChange,
  onRemove,
}: CustomNutrientInputProps) {
  const selectedNutrient = availableNutrients.find((n) => n.key === nutrientKey);

  // Group nutrients by category
  const groupedNutrients = availableNutrients.reduce(
    (acc, nutrient) => {
      const category = nutrient.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(nutrient);
      return acc;
    },
    {} as Record<string, CustomNutrientMetadata[]>
  );

  return (
    <div className="flex items-center gap-2">
      <Select value={nutrientKey} onValueChange={onNutrientChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select nutrient" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(groupedNutrients).map(([category, nutrients]) => (
            <SelectGroup key={category}>
              <SelectLabel className="capitalize">{category}</SelectLabel>
              {nutrients.map((nutrient) => (
                <SelectItem
                  key={nutrient.key}
                  value={nutrient.key}
                  disabled={usedKeys.includes(nutrient.key) && nutrient.key !== nutrientKey}
                >
                  {nutrient.name}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center gap-1">
        <Input
          type="number"
          min="0"
          step="0.1"
          value={amount || ''}
          onChange={(e) => onAmountChange(parseFloat(e.target.value) || 0)}
          className="w-24"
          placeholder="Amount"
        />
        {selectedNutrient && (
          <span className="text-sm text-muted-foreground w-12">{selectedNutrient.unit}</span>
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
