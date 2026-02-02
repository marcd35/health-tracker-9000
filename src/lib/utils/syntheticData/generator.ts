/**
 * Synthetic Data Generator
 * Generates realistic synthetic data for testing the calorie counter
 */

import { v4 as uuidv4 } from 'uuid';
import type { UserProfile, MealLog } from '@/lib/types/health';
import type { CalorieGoal, DailyCalorieTracking } from '@/lib/types/calorieTracking';
import {
  getRandomFood,
  calculateNutrition,
  aggregateNutrition,
  type FoodItem,
  type FoodCategory,
} from './foodDatabase';

// Profile type for synthetic data generation
export type ProfileType = 'weight_loss' | 'maintenance' | 'weight_gain';

// Map ProfileType to GoalType
function profileTypeToGoalType(type: ProfileType): 'weight_loss' | 'maintenance' | 'gain' {
  switch (type) {
    case 'weight_loss':
      return 'weight_loss';
    case 'weight_gain':
      return 'gain';
    default:
      return 'maintenance';
  }
}

// TDEE calculation using Mifflin-St Jeor
function calculateTDEE(
  age: number,
  weight: number, // kg
  height: number, // cm
  gender: 'male' | 'female',
  activityLevel: string
): number {
  let bmr: number;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  const multipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  return Math.round(bmr * (multipliers[activityLevel] || 1.55));
}

// Get profile configuration based on type
function getProfileConfig(type: ProfileType): {
  age: number;
  weight: number; // kg
  height: number; // cm
  gender: 'male' | 'female';
  activityLevel: string;
  weeklyCalorieTarget: number; // deficit: negative, surplus: positive
} {
  switch (type) {
    case 'weight_loss':
      return {
        age: 28,
        weight: 81.6, // 180 lbs
        height: 178, // 70 inches
        gender: 'male',
        activityLevel: 'moderate',
        weeklyCalorieTarget: -3500, // -1 lb/week
      };
    case 'maintenance':
      return {
        age: 35,
        weight: 74.8, // 165 lbs
        height: 173, // 68 inches
        gender: 'female',
        activityLevel: 'moderate',
        weeklyCalorieTarget: 0,
      };
    case 'weight_gain':
      return {
        age: 24,
        weight: 70.3, // 155 lbs
        height: 183, // 72 inches
        gender: 'male',
        activityLevel: 'moderate',
        weeklyCalorieTarget: 3500, // +1 lb/week
      };
  }
}

// Generate a complete meal with realistic nutrition
function generateMeal(
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
  targetCalories: number,
  dayVariance: number = 0
): {
  meal: MealLog;
  foods: Array<{ food: FoodItem; amount: number }>;
} {
  const foodCategories: Record<string, FoodCategory[]> = {
    breakfast: ['grain', 'protein', 'fruit', 'dairy', 'fat'],
    lunch: ['protein', 'grain', 'vegetable', 'fat'],
    dinner: ['protein', 'grain', 'vegetable', 'fat'],
    snack: ['fruit', 'dairy', 'fat', 'snack'],
  };

  const categories = foodCategories[mealType];
  const targetWithVariance = targetCalories + dayVariance;

  // Select foods based on meal type
  let selectedFoods: Array<{ food: FoodItem; amount: number }> = [];

  if (mealType === 'breakfast') {
    // Always include a grain and protein
    const grain = getRandomFood('grain');
    const protein = getRandomFood('protein');
    const fruit = Math.random() > 0.3 ? getRandomFood('fruit') : null;
    selectedFoods = [
      { food: grain, amount: 100 + Math.random() * 50 },
      { food: protein, amount: 100 + Math.random() * 50 },
    ];
    if (fruit) {
      selectedFoods.push({ food: fruit, amount: 80 + Math.random() * 40 });
    }
  } else if (mealType === 'lunch' || mealType === 'dinner') {
    // Main meal: protein + grain/veg + vegetable
    const protein = getRandomFood('protein');
    const grainOrVeg = mealType === 'lunch' ? getRandomFood('grain') : getRandomFood('vegetable');
    const vegetable = getRandomFood('vegetable');
    selectedFoods = [
      { food: protein, amount: 120 + Math.random() * 60 },
      { food: grainOrVeg, amount: 100 + Math.random() * 50 },
      { food: vegetable, amount: 80 + Math.random() * 60 },
    ];
  } else {
    // Snack
    const snackFood = getRandomFood(categories[Math.floor(Math.random() * categories.length)]);
    selectedFoods = [{ food: snackFood, amount: 50 + Math.random() * 50 }];
  }

  // Calculate nutrition and adjust portions to hit target
  const nutritionList = selectedFoods.map((sf) => calculateNutrition(sf.food, sf.amount));
  let totalNutrition = aggregateNutrition(nutritionList);

  // Adjust main food to hit calorie target
  const calorieDifference = targetWithVariance - totalNutrition.calories;
  if (calorieDifference !== 0 && selectedFoods.length > 0) {
    const adjustmentPerFood = calorieDifference / selectedFoods.length;
    selectedFoods = selectedFoods.map((sf) => {
      const foodCaloriesPer100g = sf.food.caloriesPer100g;
      const additionalAmount = (adjustmentPerFood / foodCaloriesPer100g) * 100;
      return {
        food: sf.food,
        amount: Math.max(20, sf.amount + additionalAmount),
      };
    });
  }

  // Recalculate final nutrition
  const finalNutritionList = selectedFoods.map((sf) => calculateNutrition(sf.food, sf.amount));
  totalNutrition = aggregateNutrition(finalNutritionList);

  // Create meal log
  const meal: MealLog = {
    id: uuidv4(),
    date: new Date().toISOString().split('T')[0],
    mealType,
    foods: selectedFoods.map((sf) => ({
      foodId: sf.food.id,
      foodName: sf.food.name,
      amount: Math.round(sf.amount),
    })),
    totalNutrition,
    createdAt: new Date().toISOString(),
  };

  return { meal, foods: selectedFoods };
}

// Generate daily nutrition data
export function generateDailyData(
  profileType: ProfileType,
  date: string,
  consistencyPercent: number = 85
): {
  profile: UserProfile;
  goal: CalorieGoal;
  meals: MealLog[];
  dailyTracking: DailyCalorieTracking;
} {
  const config = getProfileConfig(profileType);
  const profileId = uuidv4();

  // Create profile
  const profile: UserProfile = {
    id: profileId,
    age: config.age,
    weight: config.weight,
    height: config.height,
    gender: config.gender,
    activityLevel: config.activityLevel as UserProfile['activityLevel'],
    healthConditions: [],
    allergies: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Calculate TDEE and daily target
  const tdee = calculateTDEE(
    config.age,
    config.weight,
    config.height,
    config.gender,
    config.activityLevel
  );
  const dailyTarget = Math.round(tdee + config.weeklyCalorieTarget / 7);

  // Create calorie goal
  const goal: CalorieGoal = {
    id: uuidv4(),
    profileId,
    goalType: profileTypeToGoalType(profileType),
    weeklyCalorieTarget: config.weeklyCalorieTarget,
    dailyCalorieTarget: dailyTarget,
    activityLevel: config.activityLevel as CalorieGoal['activityLevel'],
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Determine if this day hits target based on consistency
  const hitsTarget = Math.random() * 100 < consistencyPercent;
  const dayVariance = hitsTarget
    ? (Math.random() - 0.5) * 100 // Within ±50 calories
    : (Math.random() > 0.5 ? 1 : -1) * (100 + Math.random() * 400); // Off by 100-500 calories

  // Generate meals for the day
  const mealTargets = {
    breakfast: Math.round(dailyTarget * 0.25),
    lunch: Math.round(dailyTarget * 0.35),
    dinner: Math.round(dailyTarget * 0.3),
    snack: Math.round(dailyTarget * 0.1),
  };

  const meals: MealLog[] = [
    generateMeal('breakfast', mealTargets.breakfast, dayVariance).meal,
    generateMeal('lunch', mealTargets.lunch, dayVariance).meal,
    generateMeal('dinner', mealTargets.dinner, dayVariance).meal,
    generateMeal('snack', mealTargets.snack, dayVariance).meal,
  ];

  // Set date for all meals
  meals.forEach((meal) => {
    meal.date = date;
  });

  // Calculate daily totals
  const totalNutrition = aggregateNutrition(meals.map((m) => m.totalNutrition));
  const caloriesConsumed = totalNutrition.calories;
  const calorieDeficitSurplus = caloriesConsumed - dailyTarget;

  // Determine if goal was met
  let goalMet: boolean;
  if (profileType === 'weight_loss') {
    goalMet = caloriesConsumed <= dailyTarget + 50;
  } else if (profileType === 'weight_gain') {
    goalMet = caloriesConsumed >= dailyTarget - 50;
  } else {
    goalMet = Math.abs(caloriesConsumed - dailyTarget) <= 100;
  }

  // Create daily tracking
  const dailyTracking: DailyCalorieTracking = {
    id: uuidv4(),
    date,
    profileId,
    caloriesConsumed,
    caloriesTarget: dailyTarget,
    calorieDeficitSurplus,
    goalMet,
    onPacePercentage: Math.min(150, Math.max(0, (caloriesConsumed / dailyTarget) * 100)),
    trend: 'stable',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return { profile, goal, meals, dailyTracking };
}

// Generate multiple days of data
export function generateSyntheticData(
  profileType: ProfileType,
  days: number = 30
): {
  profile: UserProfile;
  goal: CalorieGoal;
  meals: MealLog[];
  dailyTrackings: DailyCalorieTracking[];
} {
  const config = getProfileConfig(profileType);
  const profileId = uuidv4();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Create profile
  const profile: UserProfile = {
    id: profileId,
    age: config.age,
    weight: config.weight,
    height: config.height,
    gender: config.gender,
    activityLevel: config.activityLevel as UserProfile['activityLevel'],
    healthConditions: [],
    allergies: [],
    createdAt: startDate.toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Calculate TDEE and daily target
  const tdee = calculateTDEE(
    config.age,
    config.weight,
    config.height,
    config.gender,
    config.activityLevel
  );
  const dailyTarget = Math.round(tdee + config.weeklyCalorieTarget / 7);

  // Create calorie goal
  const goal: CalorieGoal = {
    id: uuidv4(),
    profileId,
    goalType: profileTypeToGoalType(profileType),
    weeklyCalorieTarget: config.weeklyCalorieTarget,
    dailyCalorieTarget: dailyTarget,
    activityLevel: config.activityLevel as CalorieGoal['activityLevel'],
    startDate: startDate.toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Consistency varies by profile type
  const consistencyMap: Record<ProfileType, number> = {
    weight_loss: 85,
    maintenance: 90,
    weight_gain: 75,
  };
  const consistency = consistencyMap[profileType];

  const meals: MealLog[] = [];
  const dailyTrackings: DailyCalorieTracking[] = [];

  // Generate data for each day
  for (let i = 0; i < days; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + i);
    const dateStr = currentDate.toISOString().split('T')[0];

    // Determine variance based on consistency and day of week
    const dayOfWeek = currentDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const adjustedConsistency = isWeekend ? consistency - 10 : consistency;

    const { meals: dayMeals, dailyTracking } = generateDayData(
      dateStr,
      dailyTarget,
      profileType,
      adjustedConsistency
    );

    meals.push(...dayMeals);
    dailyTrackings.push(dailyTracking);
  }

  return { profile, goal, meals, dailyTrackings };
}

// Helper function to generate a single day
function generateDayData(
  date: string,
  dailyTarget: number,
  profileType: ProfileType,
  consistency: number
): { meals: MealLog[]; dailyTracking: DailyCalorieTracking } {
  // Determine if this day hits target
  const hitsTarget = Math.random() * 100 < consistency;
  const dayVariance = hitsTarget
    ? (Math.random() - 0.5) * 100
    : (Math.random() > 0.5 ? 1 : -1) * (100 + Math.random() * 400);

  // Meal calorie distribution
  const mealTargets = {
    breakfast: Math.round(dailyTarget * 0.25),
    lunch: Math.round(dailyTarget * 0.35),
    dinner: Math.round(dailyTarget * 0.3),
    snack: Math.round(dailyTarget * 0.1),
  };

  const meals: MealLog[] = [
    generateMeal('breakfast', mealTargets.breakfast, dayVariance).meal,
    generateMeal('lunch', mealTargets.lunch, dayVariance).meal,
    generateMeal('dinner', mealTargets.dinner, dayVariance).meal,
    generateMeal('snack', mealTargets.snack, dayVariance).meal,
  ];

  // Set correct date
  meals.forEach((meal) => {
    meal.date = date;
  });

  // Calculate totals
  const totalNutrition = aggregateNutrition(meals.map((m) => m.totalNutrition));
  const caloriesConsumed = totalNutrition.calories;
  const calorieDeficitSurplus = caloriesConsumed - dailyTarget;

  // Goal met logic
  let goalMet: boolean;
  if (profileType === 'weight_loss') {
    goalMet = caloriesConsumed <= dailyTarget + 50;
  } else if (profileType === 'weight_gain') {
    goalMet = caloriesConsumed >= dailyTarget - 50;
  } else {
    goalMet = Math.abs(caloriesConsumed - dailyTarget) <= 100;
  }

  const dailyTracking: DailyCalorieTracking = {
    id: uuidv4(),
    date,
    profileId: '', // Will be set by the caller
    caloriesConsumed,
    caloriesTarget: dailyTarget,
    calorieDeficitSurplus,
    goalMet,
    onPacePercentage: Math.min(150, Math.max(0, (caloriesConsumed / dailyTarget) * 100)),
    trend: 'stable',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return { meals, dailyTracking };
}

// Export generator class for advanced usage
export class SyntheticDataGenerator {
  private profileType: ProfileType;
  private days: number;

  constructor(profileType: ProfileType = 'weight_loss', days: number = 30) {
    this.profileType = profileType;
    this.days = days;
  }

  setProfileType(type: ProfileType): void {
    this.profileType = type;
  }

  setDays(days: number): void {
    this.days = days;
  }

  generate(): ReturnType<typeof generateSyntheticData> {
    return generateSyntheticData(this.profileType, this.days);
  }

  generateDay(date: string): ReturnType<typeof generateDailyData> {
    return generateDailyData(this.profileType, date);
  }
}
