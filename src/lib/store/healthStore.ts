import { create } from 'zustand';
import { UserProfile, DailyLog, MealLog, Food, Supplement } from '@/lib/types/health';

interface HealthState {
  profile: UserProfile | null;
  dailyLog: DailyLog | null;
  weeklySummary: DailyLog[];
  allSupplements: Supplement[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchProfile: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  fetchDailyLog: (date: string) => Promise<void>;
  fetchWeeklySummary: (endDate: string) => Promise<void>;
  fetchAllSupplements: () => Promise<void>;
  addMeal: (meal: Omit<MealLog, 'id' | 'createdAt' | 'totalNutrition'>) => Promise<void>;
  deleteMeal: (id: string) => Promise<void>;
  toggleSupplement: (
    supplementId: string,
    supplementName: string,
    date: string,
    taken: boolean
  ) => Promise<void>;
  searchFoods: (query: string) => Promise<Food[]>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useHealthStore = create<HealthState>((set, get) => ({
  profile: null,
  dailyLog: null,
  weeklySummary: [],
  allSupplements: [],
  isLoading: false,
  error: null,

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/profile');
      if (!response.ok) throw new Error('Failed to fetch profile');
      const data = await response.json();
      set({ profile: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  updateProfile: async (updates) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update profile');
      const data = await response.json();
      set({ profile: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchDailyLog: async (date: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/daily-summary/${date}`);
      if (!response.ok) throw new Error('Failed to fetch daily log');
      const data = await response.json();
      set({ dailyLog: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchWeeklySummary: async (endDate: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/analytics/weekly?endDate=${endDate}`);
      if (!response.ok) throw new Error('Failed to fetch weekly summary');
      const data = await response.json();
      set({ weeklySummary: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchAllSupplements: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/supplements');
      if (!response.ok) throw new Error('Failed to fetch supplements');
      const data = await response.json();
      set({ allSupplements: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  addMeal: async (meal) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meal),
      });
      if (!response.ok) throw new Error('Failed to add meal');

      // Refresh daily log to get updated nutrition and score
      const date = meal.date;
      await get().fetchDailyLog(date);
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  deleteMeal: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/meals?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete meal');

      // Refresh daily log
      if (get().dailyLog) {
        await get().fetchDailyLog(get().dailyLog!.date);
      }
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  toggleSupplement: async (supplementId, supplementName, date, taken) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/supplements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supplementId, supplementName, date, taken }),
      });
      if (!response.ok) throw new Error('Failed to log supplement');

      // Refresh daily log
      await get().fetchDailyLog(date);
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  searchFoods: async (query: string) => {
    if (!query) return [];
    try {
      const response = await fetch(`/api/foods/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Failed to search foods');
      return await response.json();
    } catch (err: any) {
      console.error(err);
      return [];
    }
  },
}));
