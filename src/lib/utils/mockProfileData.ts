import { v4 as uuidv4 } from 'uuid';

export interface MockProfile {
  profileData: {
    id: string;
    age: number;
    gender: 'male' | 'female';
    weight: number;
    height: number;
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
    healthConditions: string[];
    allergies: string[];
  };
  goalData: {
    goalType: 'weight_loss' | 'maintenance' | 'gain';
    weeklyCalorieTarget: number;
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  };
  mealData: Array<{
    date: string;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
    name: string;
    calories: number;
  }>;
}

/**
 * Calculate TDEE (Total Daily Energy Expenditure) using Mifflin-St Jeor formula
 */
function calculateTDEE(
  age: number,
  weight: number,
  height: number,
  gender: 'male' | 'female',
  activityLevel: string
): number {
  // Mifflin-St Jeor formula
  let bmr: number;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  // Activity multipliers
  const multipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  return Math.round(bmr * (multipliers[activityLevel] || 1.55));
}

/**
 * Realistic meal options for weight loss (lighter meals)
 */
const weightLossMeals = {
  breakfasts: [
    { name: 'Oatmeal with berries', calories: 320 },
    { name: 'Egg white omelet with toast', calories: 280 },
    { name: 'Greek yogurt with granola', calories: 300 },
    { name: 'Whole grain toast with avocado', calories: 350 },
    { name: 'Smoothie bowl', calories: 310 },
  ],
  lunches: [
    { name: 'Grilled chicken salad', calories: 420 },
    { name: 'Turkey sandwich with veggies', calories: 480 },
    { name: 'Tuna salad', calories: 450 },
    { name: 'Veggie stir-fry with tofu', calories: 390 },
    { name: 'Quinoa and roasted vegetables', calories: 410 },
  ],
  dinners: [
    { name: 'Baked salmon with broccoli', calories: 550 },
    { name: 'Lean ground turkey tacos', calories: 520 },
    { name: 'Grilled tilapia with sweet potato', calories: 480 },
    { name: 'Chicken breast with rice', calories: 540 },
    { name: 'Vegetable soup with lean protein', calories: 450 },
  ],
  snacks: [
    { name: 'Apple with almond butter', calories: 150 },
    { name: 'Greek yogurt', calories: 120 },
    { name: 'Protein bar', calories: 180 },
    { name: 'Almonds', calories: 160 },
    { name: 'String cheese and berries', calories: 140 },
  ],
};

/**
 * Realistic meal options for maintenance (balanced meals)
 */
const maintenanceMeals = {
  breakfasts: [
    { name: 'Greek yogurt parfait with granola', calories: 420 },
    { name: 'Pancakes with berries', calories: 450 },
    { name: 'Scrambled eggs with toast and jam', calories: 480 },
    { name: 'Bagel with cream cheese and lox', calories: 500 },
    { name: 'Breakfast burrito', calories: 520 },
  ],
  lunches: [
    { name: 'Chicken Caesar wrap', calories: 580 },
    { name: 'Turkey club sandwich', calories: 620 },
    { name: 'Pad Thai with shrimp', calories: 600 },
    { name: 'Turkey meatballs with pasta', calories: 610 },
    { name: 'Grilled chicken with rice', calories: 550 },
  ],
  dinners: [
    { name: 'Pasta with marinara and meatballs', calories: 720 },
    { name: 'Salmon fillet with potatoes', calories: 680 },
    { name: 'Grilled steak with vegetables', calories: 750 },
    { name: 'Baked chicken with roasted veggies', calories: 700 },
    { name: 'Shrimp scampi with bread', calories: 710 },
  ],
  snacks: [
    { name: 'Cheese and crackers', calories: 250 },
    { name: 'Trail mix', calories: 280 },
    { name: 'Granola bar and fruit', calories: 240 },
    { name: 'Nuts and chocolate', calories: 260 },
    { name: 'Hummus and pita chips', calories: 270 },
  ],
};

/**
 * Realistic meal options for weight gain (calorie-dense meals)
 */
const weightGainMeals = {
  breakfasts: [
    { name: 'Pancakes with peanut butter', calories: 650 },
    { name: 'Full breakfast: eggs, bacon, toast', calories: 700 },
    { name: 'Cereal with whole milk and banana', calories: 620 },
    { name: 'French toast with syrup', calories: 680 },
    { name: 'Breakfast sandwich with cheese', calories: 720 },
  ],
  lunches: [
    { name: 'Burrito with rice and cheese', calories: 820 },
    { name: 'Double cheeseburger with fries', calories: 900 },
    { name: 'Fried chicken with sides', calories: 850 },
    { name: 'Pizza (2 slices)', calories: 800 },
    { name: 'Pasta carbonara', calories: 880 },
  ],
  dinners: [
    { name: 'Ribeye steak with potatoes and butter', calories: 950 },
    { name: 'Fried chicken with gravy', calories: 920 },
    { name: 'Salmon with cream sauce', calories: 880 },
    { name: 'Beef lasagna', calories: 900 },
    { name: 'BBQ ribs with sides', calories: 980 },
  ],
  snacks: [
    { name: 'Protein shake with peanut butter', calories: 450 },
    { name: 'Mixed nuts and chocolate', calories: 480 },
    { name: 'Granola and peanut butter', calories: 420 },
    { name: 'Protein bar x2', calories: 400 },
    { name: 'Cheese and crackers with dip', calories: 460 },
  ],
};

/**
 * Generate 30 days of meal data with consistency pattern
 */
function generateMealData30Days(
  mealOptions: typeof weightLossMeals,
  dailyTarget: number,
  consistencyPercent: number,
  startDate: Date
): Array<{
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
  name: string;
  calories: number;
}> {
  const meals: Array<{
    date: string;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
    name: string;
    calories: number;
  }> = [];

  // Determine which days hit the target
  const daysToHitTarget = Math.round((30 * consistencyPercent) / 100);
  const daysHittingTarget = new Set<number>();

  // Spread hitting days throughout the month
  for (let i = 0; i < daysToHitTarget; i++) {
    const dayIndex = Math.floor((i * 30) / daysToHitTarget);
    daysHittingTarget.add(dayIndex);
  }

  for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() - (29 - dayOffset));
    const dateStr = currentDate.toISOString().split('T')[0];

    const hitsTarget = daysHittingTarget.has(dayOffset);
    const targetVariance = hitsTarget
      ? 0
      : (Math.random() > 0.5 ? 1 : -1) * (100 + Math.random() * 300);
    const adjustedTarget = dailyTarget + targetVariance;

    // Randomly select meals and adjust for target
    const breakfastIndex = Math.floor(Math.random() * mealOptions.breakfasts.length);
    const lunchIndex = Math.floor(Math.random() * mealOptions.lunches.length);
    const dinnerIndex = Math.floor(Math.random() * mealOptions.dinners.length);
    const snackIndex = Math.floor(Math.random() * mealOptions.snacks.length);

    const breakfast = mealOptions.breakfasts[breakfastIndex];
    const lunch = mealOptions.lunches[lunchIndex];
    const dinner = mealOptions.dinners[dinnerIndex];
    const snack = mealOptions.snacks[snackIndex];

    // Adjust dinner slightly to hit target
    const adjustedDinner = { ...dinner };
    const currentTotal = breakfast.calories + lunch.calories + dinner.calories + snack.calories;
    const difference = adjustedTarget - currentTotal;
    adjustedDinner.calories = Math.max(200, dinner.calories + difference);

    meals.push(
      {
        date: dateStr,
        mealType: 'breakfast',
        name: breakfast.name,
        calories: Math.round(breakfast.calories),
      },
      {
        date: dateStr,
        mealType: 'lunch',
        name: lunch.name,
        calories: Math.round(lunch.calories),
      },
      {
        date: dateStr,
        mealType: 'dinner',
        name: adjustedDinner.name,
        calories: Math.round(adjustedDinner.calories),
      },
      {
        date: dateStr,
        mealType: 'snacks',
        name: snack.name,
        calories: Math.round(snack.calories),
      }
    );
  }

  return meals;
}

/**
 * Generate mock profile data for weight loss scenario
 */
export function generateWeightLossProfile(): MockProfile {
  const age = 28 as const;
  const weight = 180 as const; // lbs
  const height = 70 as const; // inches
  const gender = 'male' as const;
  const activityLevel = 'moderate' as const;

  const tdee = calculateTDEE(age, weight, height, gender, activityLevel);
  const weeklyDeficit = -3500; // -1 lb/week
  const dailyTarget = tdee + weeklyDeficit / 7;

  const today = new Date();
  const mealData = generateMealData30Days(weightLossMeals, dailyTarget, 85, today); // 85% consistency

  return {
    profileData: {
      id: uuidv4(),
      age,
      gender,
      weight,
      height,
      activityLevel,
      healthConditions: [],
      allergies: [],
    },
    goalData: {
      goalType: 'weight_loss',
      weeklyCalorieTarget: weeklyDeficit,
      activityLevel,
    },
    mealData,
  };
}

/**
 * Generate mock profile data for maintenance scenario
 */
export function generateMaintenanceProfile(): MockProfile {
  const age = 35 as const;
  const weight = 165 as const; // lbs
  const height = 68 as const; // inches
  const gender = 'female' as const;
  const activityLevel = 'moderate' as const;

  const tdee = calculateTDEE(age, weight, height, gender, activityLevel);
  const dailyTarget = tdee;

  const today = new Date();
  const mealData = generateMealData30Days(maintenanceMeals, dailyTarget, 100, today); // 100% consistency

  return {
    profileData: {
      id: uuidv4(),
      age,
      gender,
      weight,
      height,
      activityLevel,
      healthConditions: [],
      allergies: [],
    },
    goalData: {
      goalType: 'maintenance',
      weeklyCalorieTarget: 0,
      activityLevel,
    },
    mealData,
  };
}

/**
 * Generate mock profile data for weight gain scenario
 */
export function generateWeightGainProfile(): MockProfile {
  const age = 24 as const;
  const weight = 155 as const; // lbs
  const height = 70 as const; // inches
  const gender = 'male' as const;
  const activityLevel = 'moderate' as const;

  const tdee = calculateTDEE(age, weight, height, gender, activityLevel);
  const weeklySurplus = 3500; // +1 lb/week
  const dailyTarget = tdee + weeklySurplus / 7;

  const today = new Date();
  const mealData = generateMealData30Days(weightGainMeals, dailyTarget, 55, today); // 55% consistency

  return {
    profileData: {
      id: uuidv4(),
      age,
      gender,
      weight,
      height,
      activityLevel,
      healthConditions: [],
      allergies: [],
    },
    goalData: {
      goalType: 'gain',
      weeklyCalorieTarget: weeklySurplus,
      activityLevel,
    },
    mealData,
  };
}

export const mockProfiles = {
  weight_loss: generateWeightLossProfile(),
  maintenance: generateMaintenanceProfile(),
  weight_gain: generateWeightGainProfile(),
};
