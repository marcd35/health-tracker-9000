import { NutritionalValues, NutritionalTargets, DailyLog } from '@/lib/types/health';

export interface HealthScoreBreakdown {
  total: number;
  macros: number;
  micros: number;
  supplements: number;
  hydration: number;
}

/**
 * Calculates the overall health score based on nutritional intakem supplement compliance,
 * and other factors.
 *
 * @param actual - The actual nutritional values consumed (macros and micros).
 * @param targets - The user's daily nutritional targets.
 * @param dailyLog - The full daily log including supplements and notes.
 * @param hydrationEnabled - Whether hydration tracking is enabled for this user.
 * @returns {HealthScoreBreakdown} A breakdown of the score including total, macros, micros, etc.
 */
export function calculateHealthScore(
  actual: NutritionalValues,
  targets: NutritionalTargets,
  dailyLog: DailyLog,
  hydrationEnabled: boolean
): HealthScoreBreakdown {
  // Calculate individual component scores (0-100 scale)
  const macroScore = calculateMacroAdherence(actual, targets);
  const microScore = calculateMicroAdherence(actual, targets);
  const supplementScore = calculateSupplementCompliance(dailyLog);
  const hydrationScore = dailyLog.notes ? 10 : 5; // Placeholder

  // Build enabled categories array
  const enabledCategories = [
    { name: 'macros', score: macroScore },
    { name: 'micros', score: microScore },
    { name: 'supplements', score: supplementScore },
  ];

  // Only include hydration if enabled
  if (hydrationEnabled) {
    enabledCategories.push({ name: 'hydration', score: hydrationScore });
  }

  // Dynamic weight: 1 / N (where N = number of enabled categories)
  const weight = 1 / enabledCategories.length;

  // Calculate weighted total
  const total = enabledCategories.reduce((sum, cat) => sum + cat.score * weight, 0);

  return {
    total: Math.round(Math.min(100, Math.max(0, total))),
    macros: Math.round(macroScore),
    micros: Math.round(microScore),
    supplements: Math.round(supplementScore),
    hydration: Math.round(hydrationScore),
  };
}

function calculateMacroAdherence(actual: NutritionalValues, targets: NutritionalTargets): number {
  const caloriesDiff = Math.abs(actual.calories - targets.calories) / targets.calories;
  const proteinDiff = Math.abs(actual.protein - targets.protein) / targets.protein;
  const carbsDiff = Math.abs(actual.carbs - targets.carbs) / targets.carbs;
  const fatDiff = Math.abs(actual.fat - targets.fat) / targets.fat;

  // Average error, capped at 1.0 (100% error)
  const avgError = (caloriesDiff + proteinDiff + carbsDiff + fatDiff) / 4;
  const score = (1 - Math.min(1, avgError)) * 100;
  return score;
}

function calculateMicroAdherence(actual: NutritionalValues, targets: NutritionalTargets): number {
  const micros: (keyof NutritionalTargets)[] = [
    'vitaminA',
    'vitaminC',
    'vitaminD',
    'vitaminE',
    'vitaminK',
    'thiamin',
    'riboflavin',
    'niacin',
    'vitaminB6',
    'folate',
    'vitaminB12',
    'calcium',
    'iron',
    'magnesium',
    'potassium',
    'zinc',
    'selenium',
    'fiber',
  ];

  let totalScore = 0;
  micros.forEach((key) => {
    const targetVal = targets[key];
    const actualVal = actual[key] || 0;

    if (targetVal > 0) {
      // For micros, we often want AT LEAST the target.
      // Scoring: 100% if >= target, otherwise actual/target
      const ratio = Math.min(1, actualVal / targetVal);
      totalScore += ratio;
    }
  });

  return (totalScore / micros.length) * 100;
}

function calculateSupplementCompliance(dailyLog: DailyLog): number {
  // Filter to only enabled supplements
  const enabledSupplements = dailyLog.supplements.filter((s) => s.enabled !== false);

  if (enabledSupplements.length === 0) return 100; // No enabled supplements = perfect score

  const taken = enabledSupplements.filter((s) => s.taken).length;
  return (taken / enabledSupplements.length) * 100;
}
