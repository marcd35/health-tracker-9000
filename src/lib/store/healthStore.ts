import { create } from 'zustand';
import { toast } from 'sonner';
import { UserProfile, DailyLog, MealLog, Food, Supplement } from '@/lib/types/health';

interface HealthState {
  profile: UserProfile | null;
  dailyLog: DailyLog | null;
  weeklySummary: DailyLog[];
  allSupplements: Supplement[];
  isLoading: boolean;
  error: string | null;
  usdaSearchLoading: boolean;
  usdaSearchError: string | null;

  // Actions
  fetchProfile: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  fetchDailyLog: (date: string) => Promise<void>;
  fetchWeeklySummary: (endDate: string) => Promise<void>;
  fetchAllSupplements: () => Promise<void>;
  addMeal: (meal: Omit<MealLog, 'id' | 'createdAt' | 'totalNutrition'>) => Promise<void>;
  updateMeal: (
    id: string,
    updates: {
      foods?: Array<{ foodId: string; foodName: string; amount: number; foodData?: any }>;
      mealType?: string;
    }
  ) => Promise<void>;
  deleteMeal: (id: string) => Promise<void>;
  toggleSupplement: (
    supplementId: string,
    supplementName: string,
    date: string,
    taken: boolean
  ) => Promise<void>;
  searchFoods: (query: string) => Promise<Food[]>;
  searchUSDAFoods: (query: string) => Promise<Food[]>;
  importUSDAFood: (food: Food & { usdaFdcId: number }) => Promise<Food | null>;
  fetchFoodById: (id: string) => Promise<Food | null>;
  fetchRawUSDAFood: (fdcId: number) => Promise<any | null>;
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
  usdaSearchLoading: false,
  usdaSearchError: null,

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
      toast.error(err.message || 'Failed to fetch profile');
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
      toast.success('Profile updated successfully');
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      toast.error(err.message || 'Failed to update profile');
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
      toast.error(err.message || 'Failed to fetch daily log');
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
      toast.error(err.message || 'Failed to fetch weekly summary');
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
      toast.error(err.message || 'Failed to fetch supplements');
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
      toast.success('Meal added successfully');
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      toast.error(err.message || 'Failed to add meal');
    }
  },

  updateMeal: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/meals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update meal');

      // Refresh daily log to get updated nutrition and score
      if (get().dailyLog) {
        await get().fetchDailyLog(get().dailyLog!.date);
      }
      toast.success('Meal updated successfully');
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      toast.error(err.message || 'Failed to update meal');
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
      toast.success('Meal deleted successfully');
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      toast.error(err.message || 'Failed to delete meal');
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
      toast.success(`${supplementName} marked as ${taken ? 'taken' : 'not taken'}`);
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      toast.error(err.message || 'Failed to update supplement');
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
      toast.error('Failed to search foods');
      return [];
    }
  },

  searchUSDAFoods: async (query: string) => {
    if (!query) return [];
    set({ usdaSearchLoading: true, usdaSearchError: null });
    try {
      const response = await fetch(
        `/api/foods/usda-search?q=${encodeURIComponent(query)}&limit=20`
      );

      if (response.status === 429) {
        const data = await response.json();
        toast.error(data.error || 'USDA API rate limit exceeded');
        set({ usdaSearchLoading: false, usdaSearchError: data.error });
        return [];
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to search USDA foods');
      }

      const data = await response.json();
      set({ usdaSearchLoading: false });
      return data.foods || [];
    } catch (err: any) {
      console.error('USDA search error:', err);
      const errorMessage = err.message || 'Failed to search USDA foods';
      toast.error(errorMessage);
      set({ usdaSearchLoading: false, usdaSearchError: errorMessage });
      return [];
    }
  },

  importUSDAFood: async (food: Food & { usdaFdcId: number }) => {
    try {
      const response = await fetch('/api/foods/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ food }),
      });

      if (response.status === 429) {
        const data = await response.json();
        toast.error(data.error || 'USDA API rate limit exceeded');
        return null;
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to import food');
      }

      const data = await response.json();

      if (data.cached) {
        // Food was already cached, silently return it
        return data.food;
      } else {
        // Food was newly imported
        return data.food;
      }
    } catch (err: any) {
      console.error('Import food error:', err);
      toast.error(err.message || 'Failed to import food');
      return null;
    }
  },
  fetchFoodById: async (id) => {
    try {
      const response = await fetch(`/api/foods/${id}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // Prefer details if available, otherwise error, otherwise default
        const message = errorData.details || errorData.error || 'Failed to fetch food details';
        throw new Error(message);
      }
      return await response.json();
    } catch (err: any) {
      console.error('Fetch food error:', err);
      toast.error(err.message || 'Failed to fetch food details');
      return null;
    }
  },

  fetchRawUSDAFood: async (fdcId: number) => {
    try {
      const response = await fetch(`/api/foods/usda/${fdcId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch raw USDA data');
      }
      return await response.json();
    } catch (err: any) {
      console.error('Fetch raw USDA food error:', err);
      toast.error('Failed to fetch raw USDA data for inspection');
      return null;
    }
  },
}));
