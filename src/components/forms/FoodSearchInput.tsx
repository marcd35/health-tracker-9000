'use client';

import React, { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface Food {
  id: string;
  name: string;
  calories: number;
}

interface FoodSearchInputProps {
  onSelect: (food: Food) => void;
}

// Mock results for UI development
const mockFoods: Food[] = [
  { id: '1', name: 'Chicken Breast', calories: 165 },
  { id: '2', name: 'Brown Rice', calories: 111 },
  { id: '3', name: 'Broccoli', calories: 35 },
  { id: '4', name: 'Salmon', calories: 208 },
  { id: '5', name: 'Avocado', calories: 160 },
];

export function FoodSearchInput({ onSelect }: FoodSearchInputProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value ? mockFoods.find((food) => food.name === value)?.name : 'Search for a food...'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Type a food name..." />
          <CommandList>
            <CommandEmpty>No food found.</CommandEmpty>
            <CommandGroup>
              {mockFoods.map((food) => (
                <CommandItem
                  key={food.id}
                  value={food.name}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? '' : currentValue);
                    onSelect(food);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === food.name ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {food.name}
                  <span className="ml-auto text-xs text-muted-foreground">
                    {food.calories} kcal/100g
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
