import { NutritionalValues, NutritionalTargets, DailyLog } from '@/lib/types/health';

export interface HealthScoreBreakdown {
  total: number;
  macros: number;
  micros: number;
  supplements: number;
  hydration: number;
}

export function calculateHealthScore(
  actual: NutritionalValues,
  targets: NutritionalTargets,
  dailyLog: DailyLog
): HealthScoreBreakdown {
  // 1. Macro Adherence (40%)
  const macroScore = calculateMacroAdherence(actual, targets);

  // 2. Micronutrient Adherence (40%)
  const microScore = calculateMicroAdherence(actual, targets);

  // 3. Supplement Compliance (10%)
  const supplementScore = calculateSupplementCompliance(dailyLog);

  // 4. Hydration/Notes (10%) - For now, we'll base it on if notes exist or a simple placeholder
  const hydrationScore = dailyLog.notes ? 10 : 5;

  const total = Math.round(
    macroScore * 0.4 + microScore * 0.4 + supplementScore * 0.1 + hydrationScore * 0.1
  );

  return {
    total: Math.min(100, Math.max(0, total)),
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
  const micros = [
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
    const targetVal = (targets as any)[key];
    const actualVal = (actual as any)[key] || 0;

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
  if (dailyLog.supplements.length === 0) return 100; // No supplements scheduled = perfect score

  const taken = dailyLog.supplements.filter((s) => s.taken).length;
  return (taken / dailyLog.supplements.length) * 100;
}
