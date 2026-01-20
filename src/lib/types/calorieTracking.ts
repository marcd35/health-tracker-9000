export type GoalType = 'weight_loss' | 'maintenance' | 'gain';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

// Goal Management Types
export interface CalorieGoal {
  id: string;
  profileId: string;
  goalType: GoalType;
  weeklyCalorieTarget: number; // deficit: -3500 (1lb/week loss), surplus: +3500 (1lb/week gain)
  dailyCalorieTarget: number; // calculated TDEE adjusted by weekly target
  activityLevel: ActivityLevel;
  startDate: string;
  endDate?: string | null; // null if current
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CalorieGoalHistory {
  id: string;
  profileId: string;
  calorieGoalId: string;
  action: 'created' | 'updated' | 'archived';
  previousDailyTarget?: number;
  newDailyTarget?: number;
  changeReason?: string;
  changedAt: string;
}

// Daily Tracking Types
export interface DailyCalorieTracking {
  id: string;
  date: string;
  profileId: string;
  caloriesConsumed: number;
  caloriesTarget: number;
  calorieDeficitSurplus: number; // negative = deficit, positive = surplus
  goalMet: boolean;
  weeklyTotalConsumed?: number;
  weeklyTotalTarget?: number;
  weeklyAverage?: number;
  onPacePercentage: number; // 0-100+
  trend: 'up' | 'down' | 'stable';
  createdAt: string;
  updatedAt: string;
}

// Streak Types
export interface CalorieStreak {
  id: string;
  profileId: string;
  streakStartDate: string;
  streakEndDate?: string | null;
  daysCount: number;
  goalMetCount: number;
  bestStreak: number;
  createdAt: string;
  isActive: boolean;
}

// Weekly Progress Data
export interface WeeklyProgressData {
  weekStart: string;
  days: DailyCalorieTracking[];
  weeklyAverage: number;
  weeklyTarget: number;
  weeklyConsumed: number;
  onPacePercentage: number;
  daysMetGoal: number;
  projection: number; // projected end-of-week total
}

// UI State Types
export interface CalorieProgressCardData {
  caloriesConsumed: number;
  caloriesTarget: number;
  percentageOfGoal: number;
  remaining: number;
  isDeficit: boolean;
  message: string;
}

export interface CalorieStreakUI {
  currentStreak: number;
  bestStreak: number;
  lastActivityDate: string;
  streakMessage: string;
}

// Onboarding Types
export interface CalorieGoalOnboarding {
  goalType: GoalType;
  weeklyTargetChange: number; // -7000 to +7000 (2 lbs/week)
  activityLevel: ActivityLevel;
}

// API Response Types
export interface CreateGoalResponse {
  goal: CalorieGoal;
  dailyTarget: number;
  message: string;
}

export interface DailyTrackingResponse {
  tracking: DailyCalorieTracking;
  goalMetStatus: 'met' | 'missed' | 'approaching';
  message: string;
}

export interface WeeklyTrackingResponse {
  weekStart: string;
  weekEnd: string;
  data: WeeklyProgressData;
}
