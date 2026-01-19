import { create } from 'zustand';
import { toast } from 'sonner';
import type {
  Supplement,
  SupplementLog,
  SupplementNutrientTarget,
  SupplementFormData,
  NutrientProgress,
  NutrientKey,
} from '@/lib/types/supplements';
import { NUTRIENTS } from '@/constants/nutrients';

interface SupplementState {
  supplements: Supplement[];
  todayLogs: SupplementLog[];
  nutrientTargets: SupplementNutrientTarget[];
  isLoading: boolean;
  error: string | null;

  // Supplement CRUD
  fetchSupplements: () => Promise<void>;
  createSupplement: (data: SupplementFormData) => Promise<Supplement | null>;
  updateSupplement: (id: string, data: Partial<SupplementFormData>) => Promise<void>;
  deleteSupplement: (id: string) => Promise<void>;

  // Logging
  fetchTodayLogs: (date: string) => Promise<void>;
  logSupplementTaken: (
    supplementId: string,
    supplementName: string,
    date: string,
    takenAt?: string
  ) => Promise<void>;
  updateLog: (logId: string, takenAt: string, date: string) => Promise<void>;
  deleteLog: (logId: string, date: string) => Promise<void>;

  // Targets
  fetchNutrientTargets: () => Promise<void>;
  updateNutrientTarget: (
    nutrientKey: NutrientKey,
    targetValue: number,
    useRda: boolean
  ) => Promise<void>;
  deleteNutrientTarget: (nutrientKey: NutrientKey, date: string) => Promise<void>;

  // Computed
  calculateNutrientProgress: () => NutrientProgress[];
}

export const useSupplementStore = create<SupplementState>((set, get) => ({
  supplements: [],
  todayLogs: [],
  nutrientTargets: [],
  isLoading: false,
  error: null,

  // ===== SUPPLEMENTS CRUD =====

  fetchSupplements: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/supplements');
      if (!res.ok) throw new Error('Failed to fetch supplements');
      const data = await res.json();
      set({ supplements: data, isLoading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch supplements';
      set({ error: message, isLoading: false });
      toast.error(message);
    }
  },

  createSupplement: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/supplements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create supplement');
      const newSupplement = await res.json();
      set((state) => ({
        supplements: [...state.supplements, newSupplement],
        isLoading: false,
      }));
      toast.success(`${data.name} added successfully`);
      return newSupplement;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create supplement';
      set({ error: message, isLoading: false });
      toast.error(message);
      return null;
    }
  },

  updateSupplement: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/supplements', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      });
      if (!res.ok) throw new Error('Failed to update supplement');
      const updated = await res.json();
      set((state) => ({
        supplements: state.supplements.map((s) => (s.id === id ? updated : s)),
        isLoading: false,
      }));
      toast.success('Supplement updated');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update supplement';
      set({ error: message, isLoading: false });
      toast.error(message);
    }
  },

  deleteSupplement: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/supplements?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete supplement');
      set((state) => ({
        supplements: state.supplements.filter((s) => s.id !== id),
        isLoading: false,
      }));
      toast.success('Supplement deleted');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete supplement';
      set({ error: message, isLoading: false });
      toast.error(message);
    }
  },

  // ===== LOGGING =====

  fetchTodayLogs: async (date) => {
    try {
      const res = await fetch(`/api/supplements?date=${date}`);
      if (!res.ok) throw new Error('Failed to fetch logs');
      const logs = await res.json();
      set({ todayLogs: logs });
    } catch (err) {
      console.error(err);
    }
  },

  logSupplementTaken: async (supplementId, supplementName, date, takenAt) => {
    try {
      const res = await fetch('/api/supplements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplementId,
          supplementName,
          date,
          taken: true,
          takenAt: takenAt || new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error('Failed to log supplement');
      await get().fetchTodayLogs(date);
      toast.success(`${supplementName} logged`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to log supplement';
      toast.error(message);
    }
  },

  updateLog: async (logId, takenAt, date) => {
    try {
      const res = await fetch('/api/supplements/logs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: logId, takenAt }),
      });
      if (!res.ok) throw new Error('Failed to update log');
      await get().fetchTodayLogs(date);
      toast.success('Log updated');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update log';
      toast.error(message);
    }
  },

  deleteLog: async (logId, date) => {
    try {
      const res = await fetch(`/api/supplements/logs?id=${logId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete log');
      await get().fetchTodayLogs(date);
      toast.success('Log removed');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to remove log';
      toast.error(message);
    }
  },

  // ===== TARGETS =====

  fetchNutrientTargets: async () => {
    try {
      const res = await fetch('/api/supplements/targets');
      if (!res.ok) throw new Error('Failed to fetch targets');
      const targets = await res.json();
      set({ nutrientTargets: targets });
    } catch (err) {
      console.error(err);
    }
  },

  updateNutrientTarget: async (nutrientKey, targetValue, useRda) => {
    try {
      const res = await fetch('/api/supplements/targets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nutrientKey, targetValue, useRda }),
      });
      if (!res.ok) throw new Error('Failed to update target');
      await get().fetchNutrientTargets();
      toast.success('Target updated');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update target';
      toast.error(message);
    }
  },

  deleteNutrientTarget: async (nutrientKey, date) => {
    try {
      const res = await fetch(`/api/supplements/targets?nutrientKey=${nutrientKey}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete target');
      await get().fetchNutrientTargets();
      await get().fetchTodayLogs(date);
      toast.success('Target reset to RDA');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to reset target';
      toast.error(message);
    }
  },

  // ===== COMPUTED =====

  calculateNutrientProgress: () => {
    const { supplements, todayLogs, nutrientTargets } = get();

    // Count how many times each supplement was taken today
    const supplementTakenCount: Record<string, number> = {};
    todayLogs.forEach((log) => {
      if (log.taken) {
        supplementTakenCount[log.supplementId] = (supplementTakenCount[log.supplementId] || 0) + 1;
      }
    });

    const progress: NutrientProgress[] = [];

    Object.entries(NUTRIENTS).forEach(([key, info]) => {
      const nutrientKey = key as NutrientKey;
      const customTarget = nutrientTargets.find((t) => t.nutrientKey === nutrientKey);
      const target =
        customTarget && !customTarget.useRda ? customTarget.targetValue : info.rdaDefault;

      const contributions: NutrientProgress['contributions'] = [];
      let total = 0;

      supplements.forEach((supp) => {
        const takenCount = supplementTakenCount[supp.id] || 0;
        if (takenCount > 0 && supp.nutrients[nutrientKey]) {
          const amountPerServing = supp.nutrients[nutrientKey] || 0;
          const totalAmount = amountPerServing * takenCount;
          total += totalAmount;
          contributions.push({
            supplementId: supp.id,
            supplementName: supp.name,
            color: supp.color,
            amount: totalAmount,
            percentage: (totalAmount / target) * 100,
          });
        }
      });

      progress.push({
        nutrientKey,
        name: info.name,
        unit: info.unit,
        target,
        total,
        percentage: target > 0 ? Math.min(200, (total / target) * 100) : 0,
        contributions,
      });
    });

    return progress;
  },
}));
