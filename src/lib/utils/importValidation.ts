import {
  HealthTrackerExportSchema,
  isVersionCompatible,
  type HealthTrackerExport,
  type ImportResult,
} from '@/lib/types/export';

/**
 * Validate JSON structure against schema
 */
export function validateExportStructure(data: any): { valid: boolean; errors: string[] } {
  try {
    const result = HealthTrackerExportSchema.safeParse(data);
    if (!result.success) {
      const errors = result.error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`);
      return { valid: false, errors };
    }
    return { valid: true, errors: [] };
  } catch (error) {
    return {
      valid: false,
      errors: [error instanceof Error ? error.message : 'Unknown validation error'],
    };
  }
}

/**
 * Validate version compatibility
 */
export function validateVersion(
  exportData: HealthTrackerExport,
  currentVersion: string = '3.0.0'
): { compatible: boolean; warning?: string } {
  const exportedVersion = exportData.exportMetadata.version;

  if (!isVersionCompatible(exportedVersion, currentVersion)) {
    return {
      compatible: false,
      warning: `Export version ${exportedVersion} may not be compatible with current version ${currentVersion}`,
    };
  }

  return { compatible: true };
}

/**
 * Validate profile data
 */
export function validateProfileData(profileData: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!profileData?.profile) {
    errors.push('Profile data is required');
  }

  if (profileData?.profile && !profileData.profile.id) {
    errors.push('Profile must have an ID');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate meal data
 */
export function validateMealData(meals: any[]): {
  valid: boolean;
  errors: string[];
  validMeals: any[];
} {
  const errors: string[] = [];
  const validMeals: any[] = [];

  meals.forEach((meal, index) => {
    if (!meal.id) {
      errors.push(`Meal at index ${index} missing ID`);
    } else if (!meal.date) {
      errors.push(`Meal ${meal.id} missing date`);
    } else if (!Array.isArray(meal.foods)) {
      errors.push(`Meal ${meal.id} has invalid foods array`);
    } else {
      validMeals.push(meal);
    }
  });

  return { valid: errors.length === 0, errors, validMeals };
}

/**
 * Validate supplement data
 */
export function validateSupplementData(supplements: any[]): {
  valid: boolean;
  errors: string[];
  validSupplements: any[];
} {
  const errors: string[] = [];
  const validSupplements: any[] = [];

  supplements.forEach((supp, index) => {
    if (!supp.id) {
      errors.push(`Supplement at index ${index} missing ID`);
    } else if (!supp.name) {
      errors.push(`Supplement ${supp.id} missing name`);
    } else {
      validSupplements.push(supp);
    }
  });

  return { valid: errors.length === 0, errors, validSupplements };
}

/**
 * Validate supplement logs
 */
export function validateSupplementLogs(
  logs: any[],
  supplementIds: Set<string>
): { valid: boolean; errors: string[]; validLogs: any[] } {
  const errors: string[] = [];
  const validLogs: any[] = [];

  logs.forEach((log, index) => {
    if (!log.id) {
      errors.push(`Supplement log at index ${index} missing ID`);
    } else if (!log.date) {
      errors.push(`Supplement log ${log.id} missing date`);
    } else if (!log.supplementId) {
      errors.push(`Supplement log ${log.id} missing supplement ID`);
    } else if (!supplementIds.has(log.supplementId)) {
      // Only warn about foreign key, don't skip
      errors.push(`Supplement log ${log.id} references unknown supplement ${log.supplementId}`);
    } else {
      validLogs.push(log);
    }
  });

  return { valid: errors.length === 0, errors, validLogs };
}

/**
 * Validate calorie goals
 */
export function validateCalorieGoals(goals: any[]): {
  valid: boolean;
  errors: string[];
  validGoals: any[];
} {
  const errors: string[] = [];
  const validGoals: any[] = [];

  goals.forEach((goal, index) => {
    if (!goal.id) {
      errors.push(`Calorie goal at index ${index} missing ID`);
    } else if (!goal.goalType) {
      errors.push(`Calorie goal ${goal.id} missing goal type`);
    } else if (!['weight_loss', 'maintenance', 'gain'].includes(goal.goalType)) {
      errors.push(`Calorie goal ${goal.id} has invalid goal type: ${goal.goalType}`);
    } else {
      validGoals.push(goal);
    }
  });

  return { valid: errors.length === 0, errors, validGoals };
}

/**
 * Validate calorie tracking
 */
export function validateCalorieTracking(tracking: any[]): {
  valid: boolean;
  errors: string[];
  validTracking: any[];
} {
  const errors: string[] = [];
  const validTracking: any[] = [];

  tracking.forEach((track, index) => {
    if (!track.date) {
      errors.push(`Calorie tracking at index ${index} missing date`);
    } else if (track.caloriesConsumed === undefined && track.calories_consumed === undefined) {
      errors.push(`Calorie tracking for date ${track.date} missing calories consumed`);
    } else {
      validTracking.push(track);
    }
  });

  return { valid: errors.length === 0, errors, validTracking };
}

/**
 * Create a baseline import result
 */
export function createImportResult(): ImportResult {
  return {
    success: false,
    imported: {
      profile: false,
      meals: 0,
      favorites: 0,
      supplements: 0,
      supplementLogs: 0,
      calorieGoals: 0,
      calorieTracking: 0,
      dailySummaries: 0,
    },
    warnings: [],
    errors: [],
  };
}

/**
 * Parse JSON with error handling
 */
export function safeJsonParse(
  jsonString: string
): { data: any; error: null } | { data: null; error: string } {
  try {
    const data = JSON.parse(jsonString);
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Invalid JSON' };
  }
}
