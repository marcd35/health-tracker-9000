/**
 * Weight tracking types
 */

export interface WeightLog {
  id: string;
  profileId: string;
  weight: number; // in lbs
  date: string; // ISO 8601 date (YYYY-MM-DD)
  notes?: string;
  createdAt: string; // ISO 8601 timestamp
}

export interface WeightLogRequest {
  weight: number;
  date?: string; // defaults to today if not provided
  notes?: string;
}

export interface WeightProgressData {
  logs: WeightLog[];
  startWeight: number | null; // oldest weight in dataset
  currentWeight: number | null; // most recent weight
  weightChange: number; // positive = gained, negative = lost
  trend: 'up' | 'down' | 'stable';
}

export interface WeightLogRow {
  id: string;
  profile_id: string;
  weight: number;
  date: string;
  notes: string | null;
  created_at: string;
}
