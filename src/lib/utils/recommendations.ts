import { NutritionalValues, NutritionalTargets, UserProfile } from '@/lib/types/health';

export interface Recommendation {
  type: 'deficiency' | 'excess' | 'health_condition' | 'general';
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export function generateRecommendations(
  actual: NutritionalValues,
  targets: NutritionalTargets,
  profile: UserProfile
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // 1. Check for gaps in macros
  if (actual.calories < targets.calories * 0.8) {
    recommendations.push({
      type: 'deficiency',
      message:
        'Your calorie intake is significantly below target. Ensure you are eating enough to support your activity level.',
      severity: 'medium',
    });
  }

  if (actual.protein < targets.protein * 0.9) {
    recommendations.push({
      type: 'deficiency',
      message: 'Protein intake is low. Consider adding more lean meats, legumes, or Greek yogurt.',
      severity: 'medium',
    });
  }

  // 2. Check for micro gaps
  const microsToCheck = ['vitaminC', 'vitaminD', 'fiber', 'magnesium', 'zinc'];
  microsToCheck.forEach((key) => {
    const actualVal = (actual as any)[key] || 0;
    const targetVal = (targets as any)[key];
    if (actualVal < targetVal * 0.5) {
      recommendations.push({
        type: 'deficiency',
        message: `You are very low on ${key.replace(/([A-Z])/g, ' $1')}. Try to include more nutrient-dense foods.`,
        severity: 'medium',
      });
    }
  });

  // 3. Gout-specific recommendations
  if (profile.healthConditions.includes('gout')) {
    recommendations.push({
      type: 'health_condition',
      message: 'Gout Friendly: Drink at least 2-3 liters of water to help flush uric acid.',
      severity: 'high',
    });

    if ((actual.vitaminC || 0) < 500) {
      recommendations.push({
        type: 'health_condition',
        message:
          'Gout Friendly: Studies suggest 500mg+ of Vitamin C may help lower uric acid levels.',
        severity: 'medium',
      });
    }

    recommendations.push({
      type: 'health_condition',
      message:
        'Avoid high-purine foods like organ meats, shellfish, and excessive red meat during flare-ups.',
      severity: 'medium',
    });
  }

  // 4. General wellness
  if (profile.activityLevel === 'sedentary') {
    recommendations.push({
      type: 'general',
      message: 'Consider a 15-minute walk to improve metabolic health.',
      severity: 'low',
    });
  }

  return recommendations;
}
