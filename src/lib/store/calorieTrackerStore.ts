import { create } from 'zustand';
import { toast } from 'sonner';
import type {
  CalorieGoal,
  CalorieGoalHistory,
  DailyCalorieTracking,
  WeeklyProgressData,
  CalorieStreak,
  MonthlyCalorieData,
  StreakInfo,
  GoalChangeRequest,
  GoalChangeResponse,
} from '@/lib/types/calorieTracking';

interface CalorieTrackerState {
  // Current goal
  currentGoal: CalorieGoal | null;

  // Daily tracking
  todayTracking: DailyCalorieTracking | null;
  weeklyTracking: WeeklyProgressData | null;

  // Phase 2: Monthly and Streak tracking
  monthlyData: MonthlyCalorieData | null;
  streakInfo: StreakInfo | null;

  // Streaks
  currentStreak: CalorieStreak | null;
  bestStreak: number;

  // Goal history
  goalHistory: CalorieGoalHistory[];

  // UI state
  isLoading: boolean;
  error: string | null;
  hasSeenOnboarding: boolean;
  onboardingDismissedForever: boolean;

  // Actions
  fetchCurrentGoal: () => Promise<void>;
  createGoal: (data: {
    goalType: 'weight_loss' | 'maintenance' | 'gain';
    weeklyCalorieTarget: number;
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  }) => Promise<void>;
  updateGoal: (data: GoalChangeRequest) => Promise<GoalChangeResponse | null>;
  fetchDailyTracking: (date?: string) => Promise<void>;
  fetchWeeklyTracking: (endDate?: string) => Promise<void>;
  fetchMonthlyData: (year?: number, month?: number) => Promise<void>;
  fetchStreakData: () => Promise<void>;
  fetchGoalHistory: () => Promise<void>;
  dismissOnboarding: (forever?: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useCalorieTrackerStore = create<CalorieTrackerState>((set, get) => ({
  currentGoal: null,
  todayTracking: null,
  weeklyTracking: null,
  monthlyData: null,
  streakInfo: null,
  currentStreak: null,
  bestStreak: 0,
  goalHistory: [],
  isLoading: false,
  error: null,
  hasSeenOnboarding: true, // Start as false to show modal
  onboardingDismissedForever: false,

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  dismissOnboarding: (forever = false) => {
    set({
      hasSeenOnboarding: true,
      onboardingDismissedForever: forever,
    });
    if (forever) {
      localStorage.setItem('calorieTrackerOnboardingDismissed', 'true');
    }
  },

  fetchCurrentGoal: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/calorie-tracking/current');
      if (!response.ok) {
        if (response.status === 404) {
          set({ currentGoal: null, isLoading: false });
          return;
        }
        throw new Error('Failed to fetch current goal');
      }
      const data = await response.json();
      set({ currentGoal: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  createGoal: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/calorie-tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to create calorie goal');
      const result = await response.json();

      set({
        currentGoal: result.goal,
        isLoading: false,
        hasSeenOnboarding: true,
      });

      toast.success(result.message || 'Calorie goal created successfully');

      // Fetch daily tracking after creating goal
      setTimeout(() => get().fetchDailyTracking(), 500);
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      toast.error(err.message || 'Failed to create calorie goal');
    }
  },

  updateGoal: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/calorie-tracking/goal-change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update goal');
      }

      const result: GoalChangeResponse = await response.json();

      // Update current goal
      set({
        currentGoal: result.newGoal,
        isLoading: false,
      });

      toast.success(result.message || 'Goal updated successfully');

      // Refetch tracking data after goal change
      setTimeout(async () => {
        await Promise.all([get().fetchDailyTracking(), get().fetchWeeklyTracking()]);
      }, 500);

      return result;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      toast.error(err.message || 'Failed to update goal');
      return null;
    }
  },

  fetchDailyTracking: async (date?: string) => {
    set({ isLoading: true, error: null });
    try {
      const queryDate = date || new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/calorie-tracking/today?date=${queryDate}`);

      if (!response.ok) throw new Error('Failed to fetch daily tracking');
      const data = await response.json();

      set({ todayTracking: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchWeeklyTracking: async (endDate?: string) => {
    set({ isLoading: true, error: null });
    try {
      const queryEndDate = endDate || new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/calorie-tracking/weekly?endDate=${queryEndDate}`);

      if (!response.ok) throw new Error('Failed to fetch weekly tracking');
      const data = await response.json();

      set({ weeklyTracking: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchMonthlyData: async (year?: number, month?: number) => {
    set({ isLoading: true, error: null });
    try {
      const now = new Date();
      const queryYear = year || now.getFullYear();
      const queryMonth = month || now.getMonth() + 1;

      const response = await fetch(
        `/api/calorie-tracking/month?year=${queryYear}&month=${queryMonth}`
      );

      if (!response.ok) throw new Error('Failed to fetch monthly data');
      const data = await response.json();

      set({ monthlyData: data.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchStreakData: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/calorie-tracking/streaks');

      if (!response.ok) throw new Error('Failed to fetch streak data');
      const data = await response.json();

      set({
        currentStreak: data.currentStreak,
        bestStreak: data.bestStreak,
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchGoalHistory: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/calorie-tracking/history');

      if (!response.ok) throw new Error('Failed to fetch goal history');
      const data = await response.json();

      set({ goalHistory: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },
}));

// Initialize onboarding state from localStorage
if (typeof window !== 'undefined') {
  const dismissed = localStorage.getItem('calorieTrackerOnboardingDismissed');
  if (dismissed) {
    useCalorieTrackerStore.setState({ onboardingDismissedForever: true });
  } else {
    useCalorieTrackerStore.setState({ hasSeenOnboarding: false });
  }
}
