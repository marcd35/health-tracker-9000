import { z } from 'zod';
import type { UserProfile, MealLog, SupplementLog, DailyLog } from './health';
import type { Supplement, SupplementNutrientTarget, CustomNutrientMetadata } from './supplements';
import type {
  CalorieGoal,
  CalorieGoalHistory,
  DailyCalorieTracking,
  CalorieStreak,
} from './calorieTracking';

/**
 * Export metadata
 */
export interface ExportMetadata {
  timestamp: string; // ISO string
  version: string; // Semantic version
  exportType: 'full_profile' | 'partial';
}

/**
 * Profile data section
 */
export interface ProfileDataSection {
  profile: UserProfile | null;
  healthConditions: string[];
  allergies: string[];
  nutritionalTargets: Record<string, any>;
}

/**
 * Nutrition data section (meals and calories)
 */
export interface NutritionDataSection {
  meals: {
    mealLogs: MealLog[];
    mealFavorites: any[];
  };
  calories: {
    currentGoal: CalorieGoal | null;
    allGoals: CalorieGoal[];
    goalHistory: CalorieGoalHistory[];
    dailyTracking: DailyCalorieTracking[];
    streakData: {
      currentStreak: CalorieStreak | null;
      allStreaks: CalorieStreak[];
      streakInfo: any;
    };
  };
}

/**
 * Supplement data section
 */
export interface SupplementDataSection {
  supplements: Supplement[];
  supplementLogs: SupplementLog[];
  nutrientTargets: SupplementNutrientTarget[];
  customNutrients: CustomNutrientMetadata[];
}

/**
 * Health data section
 */
export interface HealthDataSection {
  dailySummaries: DailyLog[];
}

/**
 * Complete export structure
 */
export interface HealthTrackerExport {
  exportMetadata: ExportMetadata;
  profileData: ProfileDataSection;
  nutritionData: NutritionDataSection;
  supplementData: SupplementDataSection;
  healthData: HealthDataSection;
}

/**
 * Zod schema for export validation
 */
export const ExportMetadataSchema = z.object({
  timestamp: z.string(),
  version: z.string(),
  exportType: z.enum(['full_profile', 'partial']),
});

export const ProfileDataSectionSchema = z.object({
  profile: z.any().nullable(),
  healthConditions: z.array(z.string()),
  allergies: z.array(z.string()),
  nutritionalTargets: z.record(z.string(), z.any()),
});

export const NutritionDataSectionSchema = z.object({
  meals: z.object({
    mealLogs: z.array(z.any()),
    mealFavorites: z.array(z.any()),
  }),
  calories: z.object({
    currentGoal: z.any().nullable(),
    allGoals: z.array(z.any()),
    goalHistory: z.array(z.any()),
    dailyTracking: z.array(z.any()),
    streakData: z.object({
      currentStreak: z.any().nullable(),
      allStreaks: z.array(z.any()),
      streakInfo: z.any(),
    }),
  }),
});

export const SupplementDataSectionSchema = z.object({
  supplements: z.array(z.any()),
  supplementLogs: z.array(z.any()),
  nutrientTargets: z.array(z.any()),
  customNutrients: z.array(z.any()),
});

export const HealthDataSectionSchema = z.object({
  dailySummaries: z.array(z.any()),
});

export const HealthTrackerExportSchema = z.object({
  exportMetadata: ExportMetadataSchema,
  profileData: ProfileDataSectionSchema,
  nutritionData: NutritionDataSectionSchema,
  supplementData: SupplementDataSectionSchema,
  healthData: HealthDataSectionSchema,
});

/**
 * Import mode
 */
export type ImportMode = 'replace' | 'merge';

/**
 * Import result
 */
export interface ImportResult {
  success: boolean;
  imported: {
    profile: boolean;
    meals: number;
    favorites: number;
    supplements: number;
    supplementLogs: number;
    calorieGoals: number;
    calorieTracking: number;
    dailySummaries: number;
  };
  warnings: string[];
  errors: string[];
}

/**
 * Version compatibility
 */
export interface VersionInfo {
  major: number;
  minor: number;
  patch: number;
}

export function parseVersion(versionString: string): VersionInfo {
  const parts = versionString.split('.').map((p) => parseInt(p, 10));
  return {
    major: parts[0] || 0,
    minor: parts[1] || 0,
    patch: parts[2] || 0,
  };
}

export function isVersionCompatible(
  exportedVersion: string,
  currentVersion: string = '3.0.0'
): boolean {
  const exported = parseVersion(exportedVersion);
  const current = parseVersion(currentVersion);

  // Compatible if same or higher version, with same major version
  return exported.major === current.major && exported.minor <= current.minor;
}
