'use client';

import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, Loader2, Database } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { useHealthStore } from '@/lib/store/healthStore';
import type { Food } from '@/lib/types/health';

interface FoodSearchInputProps {
  onSelect: (food: Food) => void;
}

export function FoodSearchInput({ onSelect }: FoodSearchInputProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Food[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchMode, setSearchMode] = useState<'local' | 'usda'>('local');

  const { searchFoods, searchUSDAFoods, importUSDAFood, usdaSearchLoading, usdaSearchError } =
    useHealthStore();

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length > 1) {
        setIsSearching(true);
        if (searchMode === 'local') {
          const res = await searchFoods(query);
          setResults(res);
        } else {
          const res = await searchUSDAFoods(query);
          setResults(res);
        }
        setIsSearching(false);
      } else {
        setResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, searchMode, searchFoods, searchUSDAFoods]);

  const handleSelect = async (food: Food) => {
    setValue(food.name);
    setOpen(false);

    // For USDA foods, import to local database in the background
    // This makes them searchable locally next time
    if (searchMode === 'usda' && 'usdaFdcId' in food) {
      // Import asynchronously (don't wait for it)
      importUSDAFood(food as Food & { usdaFdcId: number }).then((importedFood) => {
        if (importedFood) {
          console.log('USDA food cached locally:', importedFood.name);
        }
      });
    }

    // Always pass the original food to the form immediately
    // The meal API will handle looking it up or creating it
    onSelect(food);
  };

  const toggleSearchMode = () => {
    setSearchMode((prev) => (prev === 'local' ? 'usda' : 'local'));
    setResults([]);
    setQuery('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="flex gap-2">
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="flex-1 justify-between"
          >
            {value ? value : 'Search for a food...'}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <Button
          variant={searchMode === 'usda' ? 'default' : 'outline'}
          size="icon"
          onClick={toggleSearchMode}
          title={searchMode === 'usda' ? 'Switch to Local Search' : 'Search USDA Database'}
        >
          <Database className="h-4 w-4" />
        </Button>
      </div>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <div className="flex items-center gap-2 border-b px-3 py-2">
            <CommandInput placeholder="Type a food name..." onValueChange={setQuery} />
            {searchMode === 'usda' && (
              <Badge variant="secondary" className="text-xs">
                USDA
              </Badge>
            )}
          </div>
          <CommandList>
            {(isSearching || usdaSearchLoading) && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2 text-sm text-muted-foreground">
                  {searchMode === 'usda' ? 'Searching USDA database...' : 'Searching...'}
                </span>
              </div>
            )}
            {usdaSearchError && searchMode === 'usda' && (
              <div className="px-3 py-4 text-sm text-destructive">{usdaSearchError}</div>
            )}
            {!isSearching &&
              !usdaSearchLoading &&
              results.length === 0 &&
              query.length > 1 &&
              !usdaSearchError && (
                <CommandEmpty>
                  {searchMode === 'usda'
                    ? 'No foods found in USDA database.'
                    : 'No food found. Try searching USDA database.'}
                </CommandEmpty>
              )}
            <CommandGroup>
              {results.map((food) => (
                <CommandItem
                  key={food.id}
                  value={food.id}
                  onSelect={(selectedId) => {
                    // Only handle if this is the exact food being clicked
                    if (selectedId === food.id) {
                      handleSelect(food);
                    }
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === food.name ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-center gap-2">
                      <span>{food.name}</span>
                      {searchMode === 'usda' && (
                        <Badge variant="outline" className="text-[10px]">
                          USDA
                        </Badge>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {food.nutritionPer100g.calories} kcal/100g • {food.nutritionPer100g.protein}g
                      P • {food.nutritionPer100g.carbs}g C • {food.nutritionPer100g.fat}g F
                    </span>
                    {food.allergens && food.allergens.length > 0 && (
                      <span className="text-[10px] text-orange-600">
                        ⚠ {food.allergens.join(', ')}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
