import { v4 as uuidv4 } from 'uuid';

export interface MockProfile {
  profileData: {
    id: string;
    age: number;
    gender: 'male' | 'female';
    weight: number;
    height: number;
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
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
function calculateTDEE(age: number, weight: number, height: number, gender: 'male' | 'female', activityLevel: string): number {
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
 * Generate mock profile data for weight loss scenario
 */
export function generateWeightLossProfile(): MockProfile {
  const age = 28;
  const weight = 180; // lbs
  const height = 70; // inches
  const gender: 'male' = 'male';
  const activityLevel = 'moderate';

  const tdee = calculateTDEE(age, weight, height, gender, activityLevel);
  const weeklyDeficit = -3500; // -1 lb/week
  const dailyTarget = tdee + weeklyDeficit / 7;

  // Generate sample meals for today and past 6 days
  const today = new Date();
  const mealData = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    // Breakfast: 400 cal
    mealData.push({
      date: dateStr,
      mealType: 'breakfast',
      name: 'Oatmeal with berries',
      calories: 380,
    });

    // Lunch: 550 cal
    mealData.push({
      date: dateStr,
      mealType: 'lunch',
      name: 'Grilled chicken salad',
      calories: 520,
    });

    // Dinner: 600 cal
    mealData.push({
      date: dateStr,
      mealType: 'dinner',
      name: 'Salmon with vegetables',
      calories: 620,
    });

    // Snacks: 200 cal
    mealData.push({
      date: dateStr,
      mealType: 'snacks',
      name: 'Apple and almonds',
      calories: 180,
    });
  }

  return {
    profileData: {
      id: uuidv4(),
      age,
      gender,
      weight,
      height,
      activityLevel,
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
  const age = 35;
  const weight = 165; // lbs
  const height = 68; // inches
  const gender: 'female' = 'female';
  const activityLevel = 'moderate';

  const tdee = calculateTDEE(age, weight, height, gender, activityLevel);

  // Generate sample meals for today and past 6 days
  const today = new Date();
  const mealData = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    // Breakfast: 420 cal
    mealData.push({
      date: dateStr,
      mealType: 'breakfast',
      name: 'Greek yogurt parfait',
      calories: 420,
    });

    // Lunch: 580 cal
    mealData.push({
      date: dateStr,
      mealType: 'lunch',
      name: 'Turkey sandwich with veggies',
      calories: 560,
    });

    // Dinner: 650 cal
    mealData.push({
      date: dateStr,
      mealType: 'dinner',
      name: 'Pasta with lean meat sauce',
      calories: 680,
    });

    // Snacks: 250 cal
    mealData.push({
      date: dateStr,
      mealType: 'snacks',
      name: 'Cheese and crackers',
      calories: 240,
    });
  }

  return {
    profileData: {
      id: uuidv4(),
      age,
      gender,
      weight,
      height,
      activityLevel,
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
  const age = 24;
  const weight = 155; // lbs
  const height = 72; // inches
  const gender: 'male' = 'male';
  const activityLevel = 'moderate';

  const tdee = calculateTDEE(age, weight, height, gender, activityLevel);
  const weeklySurplus = 3500; // +1 lb/week
  const dailyTarget = tdee + weeklySurplus / 7;

  // Generate sample meals for today and past 6 days
  const today = new Date();
  const mealData = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    // Breakfast: 600 cal (higher for surplus)
    mealData.push({
      date: dateStr,
      mealType: 'breakfast',
      name: 'Pancakes with peanut butter',
      calories: 600,
    });

    // Lunch: 750 cal
    mealData.push({
      date: dateStr,
      mealType: 'lunch',
      name: 'Burrito with rice and beans',
      calories: 750,
    });

    // Dinner: 800 cal
    mealData.push({
      date: dateStr,
      mealType: 'dinner',
      name: 'Steak with potatoes and butter',
      calories: 820,
    });

    // Snacks: 350 cal
    mealData.push({
      date: dateStr,
      mealType: 'snacks',
      name: 'Protein bar and nuts',
      calories: 350,
    });
  }

  return {
    profileData: {
      id: uuidv4(),
      age,
      gender,
      weight,
      height,
      activityLevel,
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
