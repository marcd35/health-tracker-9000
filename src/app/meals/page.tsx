'use client';

import { useEffect, useState } from 'react';
import { useHealthStore } from '@/lib/store/healthStore';
import { useCalorieTrackerStore } from '@/lib/store/calorieTrackerStore';
import { MealsSkeleton } from '@/components/meals/MealsSkeleton';
import { MealsHeroHeader } from '@/components/meals/MealsHeroHeader';
import { MealLogModal } from '@/components/meals/MealLogModal';
import { TodaysMealsList } from '@/components/meals/TodaysMealsList';
import { HistoricalLogCard } from '@/components/meals/HistoricalLogCard';
import { FavoriteMealsSection } from '@/components/meals/FavoriteMealsSection';
import { CalorieProgressCard } from '@/components/calories/CalorieProgressCard';
import { toast } from 'sonner';
import type { MealLog } from '@/lib/types/health';
import type { MealFavorite } from '@/lib/database/repositories/mealFavoritesRepository';

export default function MealsPage() {
  const { dailyLog, profile, isLoading, activeDate, fetchDailyLog, fetchProfile, addMeal } =
    useHealthStore();
  const {
    todayTracking,
    currentGoal,
    fetchDailyTracking: fetchCalorieTracking,
    fetchCurrentGoal,
  } = useCalorieTrackerStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<MealLog | null>(null);
  const [defaultMealType, setDefaultMealType] = useState<
    'breakfast' | 'lunch' | 'dinner' | 'snack' | undefined
  >(undefined);
  const [mealToSave, setMealToSave] = useState<MealLog | null>(null);

  useEffect(() => {
    fetchDailyLog(activeDate);
    fetchCalorieTracking(activeDate);
    fetchCurrentGoal();
    if (!profile) {
      fetchProfile();
    }
  }, [fetchDailyLog, fetchProfile, fetchCalorieTracking, fetchCurrentGoal, activeDate, profile]);

  const handleLogMeal = () => {
    setEditingMeal(null);
    setDefaultMealType(undefined);
    setModalOpen(true);
  };

  const handleEditMeal = (meal: MealLog) => {
    setEditingMeal(meal);
    setDefaultMealType(undefined);
    setModalOpen(true);
  };

  const handleCopyMeal = async (meal: MealLog) => {
    try {
      await addMeal({
        date: activeDate,
        mealType: meal.mealType,
        foods: meal.foods.map((f) => ({
          foodId: f.foodId,
          foodName: f.foodName,
          amount: f.amount,
        })),
      });
      toast.success('Meal copied');
    } catch {
      // Error handled by store
    }
  };

  const handleQuickAddFavorite = async (favorite: MealFavorite) => {
    try {
      await addMeal({
        date: activeDate,
        mealType: favorite.mealType,
        foods: favorite.foods,
      });
      toast.success(`Added ${favorite.name}`);
    } catch {
      // Error handled by store
    }
  };

  const handleSaveMealAsFavorite = (meal: MealLog) => {
    setMealToSave(meal);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingMeal(null);
    setDefaultMealType(undefined);
  };

  if (isLoading && !dailyLog) {
    return <MealsSkeleton />;
  }

  // Default targets if profile not loaded yet
  const targets = profile?.targets || {
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 65,
    fiber: 30,
    vitaminA: 900,
    vitaminC: 90,
    vitaminD: 20,
    vitaminE: 15,
    vitaminK: 120,
    thiamin: 1.2,
    riboflavin: 1.3,
    niacin: 16,
    vitaminB6: 1.7,
    folate: 400,
    vitaminB12: 2.4,
    calcium: 1300,
    iron: 18,
    magnesium: 420,
    potassium: 4700,
    zinc: 11,
    selenium: 55,
  };

  const totalNutrition = dailyLog?.totalNutrition || {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hero Header with Visualizations */}
      <MealsHeroHeader
        totalNutrition={totalNutrition}
        targets={targets}
        onLogMeal={handleLogMeal}
      />

      {/* Calorie Progress Card - Show if user has a calorie goal */}
      {currentGoal && todayTracking && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Daily Calorie Progress</h2>
          <CalorieProgressCard tracking={todayTracking} goalType={currentGoal.goalType} />
        </div>
      )}

      {/* Favorite Meals Quick-Add */}
      <FavoriteMealsSection
        onQuickAdd={handleQuickAddFavorite}
        mealToSave={mealToSave}
        onMealSaved={() => setMealToSave(null)}
      />

      {/* Today's Meals by Type */}
      <TodaysMealsList
        meals={dailyLog?.meals || []}
        dailyCalorieTarget={targets.calories}
        onEditMeal={handleEditMeal}
        onCopyMeal={handleCopyMeal}
        onSaveFavorite={handleSaveMealAsFavorite}
      />

      {/* Historical Log */}
      <HistoricalLogCard />

      {/* Meal Log Modal */}
      <MealLogModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        editMeal={editingMeal || undefined}
        defaultMealType={defaultMealType}
      />
    </div>
  );
}
