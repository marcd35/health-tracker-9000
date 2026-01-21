import { NextResponse } from 'next/server';
import { MealLogRepository } from '@/lib/database/repositories/mealLogRepository';
import { FoodRepository } from '@/lib/database/repositories/foodRepository';
import { calculateNutrition, sumNutrition } from '@/lib/utils/nutrition';
import { ProfileRepository } from '@/lib/database/repositories/profileRepository';
import { getDatabase } from '@/lib/database/connection';
import { withErrorHandling } from '@/lib/utils/errorHandler';
import { ValidationError } from '@/lib/errors/ApiError';
import { flagConflicts } from '@/lib/utils/allergenChecker';
import { updateDailySummaryForDate } from '@/lib/utils/dailySummary';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return withErrorHandling(async () => {
    const stmt = getDatabase().prepare('SELECT * FROM meal_logs WHERE id = ?');
    const row = stmt.get(id) as any;

    if (!row) {
      throw new ValidationError('Meal not found', 404);
    }

    const meal = {
      id: row.id,
      date: row.date,
      mealType: row.meal_type,
      foods: JSON.parse(row.foods),
      totalNutrition: JSON.parse(row.total_nutrition),
      createdAt: row.created_at,
    };

    return NextResponse.json(meal);
  }, 'GET /api/meals/[id]');
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const mealRepo = new MealLogRepository();
  const foodRepo = new FoodRepository();
  const profileRepo = new ProfileRepository();

  return withErrorHandling(async () => {
    const body = await request.json();
    const { mealType, foods } = body;

    // Get existing meal to find the date
    const stmt = getDatabase().prepare('SELECT * FROM meal_logs WHERE id = ?');
    const existing = stmt.get(id) as any;

    if (!existing) {
      throw new ValidationError('Meal not found', 404);
    }

    const date = existing.date;

    // Get user profile for allergen checking
    const profile = profileRepo.getProfile();
    if (!profile) {
      throw new ValidationError('User profile not found');
    }

    // Calculate nutrition and collect Food objects for allergen checking
    const foodObjects: any[] = [];
    const mealNutrients = foods.map((f: any) => {
      let food = foodRepo.getFoodById(f.foodId);

      // If food not found and it's a USDA food (ID starts with "usda-"),
      // it might be from search results - use the provided data
      if (!food && f.foodId.startsWith('usda-')) {
        console.log(`USDA food not in DB yet: ${f.foodName}, importing...`);
        // Persist to DB so it can be referenced next time
        const importedId = foodRepo.createFoodFromUSDA(
          f.foodData.name,
          f.foodData.servingSize,
          f.foodData.servingUnit,
          f.foodData.nutritionPer100g,
          f.foodData.allergens,
          f.foodData.usdaFdcId,
          f.foodData.brand,
          f.foodData.ingredients
        );

        // Save allergens if present
        if (f.foodData.allergens && f.foodData.allergens.length > 0) {
          foodRepo.saveFoodAllergens(
            importedId,
            f.foodData.allergens.map((a: string) => ({
              allergenType: a,
              source: 'user_flagged',
              confidenceLevel: 'high',
            }))
          );
        }

        food = foodRepo.getFoodById(importedId);
      }

      if (!food) throw new ValidationError(`Food not found: ${f.foodId}`);

      foodObjects.push(food);
      return calculateNutrition(food, f.amount);
    });

    // ENFORCE allergen checking server-side
    const allergenConflicts = flagConflicts(foodObjects, profile);
    if (allergenConflicts.length > 0) {
      throw new ValidationError('Allergen conflict detected', {
        conflicts: allergenConflicts,
        message: 'Cannot save meal with allergen conflicts. Please remove conflicting foods.',
      });
    }

    const totalNutrition = sumNutrition(mealNutrients);

    // Update the meal
    mealRepo.updateMealLog(id, {
      mealType: mealType || existing.meal_type,
      foods,
      totalNutrition,
    });

    // Update daily summary using utility function
    await updateDailySummaryForDate(date);

    // Fetch and return the updated meal
    const updatedRow = stmt.get(id) as any;
    const updatedMeal = {
      id: updatedRow.id,
      date: updatedRow.date,
      mealType: updatedRow.meal_type,
      foods: JSON.parse(updatedRow.foods),
      totalNutrition: JSON.parse(updatedRow.total_nutrition),
      createdAt: updatedRow.created_at,
    };

    return NextResponse.json(updatedMeal);
  }, 'PUT /api/meals/[id]');
}
