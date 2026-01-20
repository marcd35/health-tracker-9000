'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Star, Plus, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { MealFavorite } from '@/lib/database/repositories/mealFavoritesRepository';
import type { MealLog } from '@/lib/types/health';

interface FavoriteMealsSectionProps {
  onQuickAdd: (favorite: MealFavorite) => void;
  mealToSave?: MealLog | null;
  onMealSaved?: () => void;
}

const MEAL_EMOJIS: Record<string, string> = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snack: '🍎',
};

export function FavoriteMealsSection({
  onQuickAdd,
  mealToSave,
  onMealSaved,
}: FavoriteMealsSectionProps) {
  const [favorites, setFavorites] = useState<MealFavorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveName, setSaveName] = useState('');

  // Fetch favorites on mount
  useEffect(() => {
    fetchFavorites();
  }, []);

  // Open save dialog when a meal is passed in
  useEffect(() => {
    if (mealToSave) {
      setSaveDialogOpen(true);
      setSaveName('');
    }
  }, [mealToSave]);

  const fetchFavorites = async () => {
    try {
      const response = await fetch('/api/meals/favorites');
      if (response.ok) {
        const data = await response.json();
        setFavorites(data);
      }
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveFavorite = async () => {
    if (!mealToSave || !saveName.trim()) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/meals/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: saveName.trim(),
          mealType: mealToSave.mealType,
          foods: mealToSave.foods,
        }),
      });

      if (response.ok) {
        const newFavorite = await response.json();
        setFavorites([newFavorite, ...favorites]);
        toast.success('Meal saved to favorites');
        setSaveDialogOpen(false);
        onMealSaved?.();
      } else {
        throw new Error('Failed to save favorite');
      }
    } catch {
      toast.error('Failed to save favorite');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const response = await fetch(`/api/meals/favorites?id=${deleteId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setFavorites(favorites.filter((f) => f.id !== deleteId));
        toast.success('Favorite removed');
      } else {
        throw new Error('Failed to delete favorite');
      }
    } catch {
      toast.error('Failed to remove favorite');
    } finally {
      setDeleteId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-500" />
            Favorite Meals
          </h2>
        </div>
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-500" />
            Favorite Meals
          </h2>
        </div>

        {favorites.length === 0 ? (
          <Card className="p-4">
            <p className="text-sm text-muted-foreground text-center">
              No favorites yet. Save a meal as favorite using the star icon.
            </p>
          </Card>
        ) : (
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-3 pb-2">
              {favorites.map((favorite) => (
                <Card
                  key={favorite.id}
                  className="flex-shrink-0 w-[200px] p-3 hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{MEAL_EMOJIS[favorite.mealType] || '🍽️'}</span>
                      <span className="text-sm font-medium truncate max-w-[120px]">
                        {favorite.name}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteId(favorite.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {favorite.foods.length} {favorite.foods.length === 1 ? 'item' : 'items'}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-1"
                    onClick={() => onQuickAdd(favorite)}
                  >
                    <Plus className="h-3 w-3" />
                    Quick Add
                  </Button>
                </Card>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}
      </div>

      {/* Save favorite dialog */}
      <Dialog
        open={saveDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setSaveDialogOpen(false);
            onMealSaved?.();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as Favorite</DialogTitle>
            <DialogDescription>
              Give this meal a name so you can quickly add it again later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="favorite-name">Favorite Name</Label>
              <Input
                id="favorite-name"
                placeholder="e.g., Morning Oatmeal, Power Lunch"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveFavorite()}
              />
            </div>
            {mealToSave && (
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">
                  {MEAL_EMOJIS[mealToSave.mealType]} {mealToSave.mealType}
                </p>
                <ul className="list-disc list-inside">
                  {mealToSave.foods.map((food, i) => (
                    <li key={i}>
                      {food.foodName} ({food.amount}g)
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveFavorite} disabled={!saveName.trim() || isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Favorite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Favorite?</DialogTitle>
            <DialogDescription>
              This will remove this meal from your favorites. You can always save it again later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
