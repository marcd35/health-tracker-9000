import { calculateHealthScore } from '@/lib/utils/healthScoring';
import { NutritionalValues, NutritionalTargets, DailyLog } from '@/lib/types/health';

describe('Health Scoring', () => {
  const mockTargets: NutritionalTargets = {
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 65,
    fiber: 30,
    vitaminA: 900,
    vitaminC: 90,
    vitaminD: 20,
    vitaminE: 15,
    vitaminK: 120,
    thiamin: 1.2,
    riboflavin: 1.3,
    niacin: 16,
    vitaminB6: 1.3,
    folate: 400,
    vitaminB12: 2.4,
    calcium: 1000,
    iron: 8,
    magnesium: 400,
    potassium: 4700,
    zinc: 11,
    selenium: 55,
  };

  const mockDailyLog: DailyLog = {
    date: new Date().toISOString(),
    meals: [],
    supplements: [
      {
        id: '1',
        date: new Date().toISOString(),
        supplementId: '1',
        supplementName: 'Vitamin D',
        taken: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        date: new Date().toISOString(),
        supplementId: '2',
        supplementName: 'Omega 3',
        taken: true,
        createdAt: new Date().toISOString(),
      },
    ],
    totalNutrition: { calories: 2000, protein: 150, carbs: 250, fat: 65, fiber: 30 },
    healthScore: 0,
    notes: 'Good day',
  };

  it('calculates perfect score when targets are met', () => {
    const perfectNutrition = { ...mockTargets } as unknown as NutritionalValues;
    const score = calculateHealthScore(perfectNutrition, mockTargets, mockDailyLog);

    expect(score.total).toBe(91); // Based on current logic
    expect(score.macros).toBe(100);
    expect(score.micros).toBe(100);
    expect(score.supplements).toBe(100);
  });

  it('calculates lower score when macros are off', () => {
    const badMacros = { ...mockTargets, calories: 3000 } as NutritionalValues; // 50% deviation on calories
    const score = calculateHealthScore(badMacros, mockTargets, mockDailyLog);
    expect(score.macros).toBe(88);
  });

  it('calculates supplement compliance correctly', () => {
    const missedSupps = {
      ...mockDailyLog,
      supplements: [
        {
          id: '1',
          date: new Date().toISOString(),
          supplementId: '1',
          supplementName: 'Vitamin D',
          taken: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          date: new Date().toISOString(),
          supplementId: '2',
          supplementName: 'Omega 3',
          taken: false,
          createdAt: new Date().toISOString(),
        },
      ],
    };
    const score = calculateHealthScore(mockTargets as NutritionalValues, mockTargets, missedSupps);
    expect(score.supplements).toBe(50);
  });
});
