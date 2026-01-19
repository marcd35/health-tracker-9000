'use client';

import React, { useState } from 'react';
import { Search, Loader2, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { searchFoodAction, getFoodDetailsAction } from '@/app/actions/food-search';
import { UsdaFoodSearchResult } from '@/lib/services/usda/index';
import { FoodJsonDisplay } from './FoodJsonDisplay';

export function FoodSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UsdaFoodSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFood, setSelectedFood] = useState<any | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setSelectedFood(null);
    setResults([]);

    try {
      const result = await searchFoodAction(query);
      if (result.success && result.data) {
        setResults(result.data.foods);
        if (result.data.foods.length === 0) {
          setError('No foods found. Try a different search term.');
        }
      } else {
        setError(result.error || 'Failed to search foods');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectFood = async (food: UsdaFoodSearchResult) => {
    setIsLoadingDetails(true);
    setError(null);
    try {
      const result = await getFoodDetailsAction(food.fdcId);
      if (result.success && result.data) {
        setSelectedFood(result.data);
      } else {
        setError(result.error || 'Failed to fetch food details');
      }
    } catch {
      setError('Failed to fetch food details');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-4 w-full">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search USDA foods (e.g., 'avocado', 'steak')"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-8"
            autoFocus
          />
        </div>
        <Button onClick={handleSearch} disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 p-2 rounded-md">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {results.length > 0 && !selectedFood && (
        <div className="border rounded-md">
          <div className="p-2 bg-muted/50 border-b text-sm font-medium">
            Search Results ({results.length})
          </div>
          <ScrollArea className="h-[300px]">
            <ul className="divide-y">
              {results.map((food) => (
                <li
                  key={food.fdcId}
                  className="p-3 hover:bg-muted/50 cursor-pointer transition-colors text-sm"
                  onClick={() => handleSelectFood(food)}
                >
                  <div className="font-medium text-foreground">{food.description}</div>
                  <div className="text-muted-foreground text-xs mt-1 flex gap-2">
                    <span>ID: {food.fdcId}</span>
                    <span>{food.brandOwner || 'Generic'}</span>
                    {food.servingSize && food.servingSizeUnit && (
                      <span>
                        • {food.servingSize} {food.servingSizeUnit}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </div>
      )}

      {isLoadingDetails && (
        <div className="flex items-center justify-center p-8 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Fetching full food details...</span>
        </div>
      )}

      {selectedFood && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => setSelectedFood(null)}>
              Back to Results
            </Button>
          </div>
          <FoodJsonDisplay data={selectedFood} />
        </div>
      )}
    </div>
  );
}
