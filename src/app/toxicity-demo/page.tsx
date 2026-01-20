'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ToxicityProgressBar } from '@/components/supplements/ToxicityProgressBar';
import { NUTRIENTS } from '@/constants/nutrients';
import type { NutrientProgress } from '@/lib/types/supplements';

// Mock data showing different scenarios
const DEMO_SCENARIOS = [
  {
    title: 'Vitamin C - Normal (60% of goal)',
    nutrient: {
      nutrientKey: 'vitaminC' as const,
      name: 'Vitamin C',
      unit: 'mg',
      target: 90,
      total: 54, // 60% of 90
      percentage: 60,
      contributions: [],
    } as NutrientProgress,
  },
  {
    title: 'Vitamin C - Goal Met (100%)',
    nutrient: {
      nutrientKey: 'vitaminC' as const,
      name: 'Vitamin C',
      unit: 'mg',
      target: 90,
      total: 90, // 100% of 90
      percentage: 100,
      contributions: [],
    } as NutrientProgress,
  },
  {
    title: 'Vitamin C - Warning Level (1,200 mg)',
    nutrient: {
      nutrientKey: 'vitaminC' as const,
      name: 'Vitamin C',
      unit: 'mg',
      target: 90,
      total: 1200, // Over warning level (1045)
      percentage: 1333,
      contributions: [],
    } as NutrientProgress,
  },
  {
    title: 'Vitamin C - Toxic Level (2,100 mg)',
    nutrient: {
      nutrientKey: 'vitaminC' as const,
      name: 'Vitamin C',
      unit: 'mg',
      target: 90,
      total: 2100, // Over toxic level (2000)
      percentage: 2333,
      contributions: [],
    } as NutrientProgress,
  },
  {
    title: 'Vitamin D - Normal (30 mcg)',
    nutrient: {
      nutrientKey: 'vitaminD' as const,
      name: 'Vitamin D',
      unit: 'mcg',
      target: 20,
      total: 30, // 150% of 20
      percentage: 150,
      contributions: [],
    } as NutrientProgress,
  },
  {
    title: 'Vitamin D - Warning Level (40 mcg)',
    nutrient: {
      nutrientKey: 'vitaminD' as const,
      name: 'Vitamin D',
      unit: 'mcg',
      target: 20,
      total: 40, // Over warning (35)
      percentage: 200,
      contributions: [],
    } as NutrientProgress,
  },
  {
    title: 'Vitamin D - Toxic Level (60 mcg)',
    nutrient: {
      nutrientKey: 'vitaminD' as const,
      name: 'Vitamin D',
      unit: 'mcg',
      target: 20,
      total: 60, // Over toxic (50)
      percentage: 300,
      contributions: [],
    } as NutrientProgress,
  },
  {
    title: 'Iron - Normal (12 mg)',
    nutrient: {
      nutrientKey: 'iron' as const,
      name: 'Iron',
      unit: 'mg',
      target: 18,
      total: 12, // 67% of 18
      percentage: 67,
      contributions: [],
    } as NutrientProgress,
  },
  {
    title: 'Iron - Warning Level (35 mg)',
    nutrient: {
      nutrientKey: 'iron' as const,
      name: 'Iron',
      unit: 'mg',
      target: 18,
      total: 35, // Over warning (31.5)
      percentage: 194,
      contributions: [],
    } as NutrientProgress,
  },
  {
    title: 'Iron - Toxic Level (50 mg)',
    nutrient: {
      nutrientKey: 'iron' as const,
      name: 'Iron',
      unit: 'mg',
      target: 18,
      total: 50, // Over toxic (45)
      percentage: 278,
      contributions: [],
    } as NutrientProgress,
  },
];

export default function ToxicityDemoPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Toxicity Progress Bar Demo</h1>
          <p className="text-muted-foreground">
            Visual representation of the 2-in-1 progress bar showing daily goal progress and
            toxicity risk.
          </p>
        </div>

        <div className="grid gap-6">
          {DEMO_SCENARIOS.map((scenario, index) => {
            const nutrientInfo = NUTRIENTS[scenario.nutrient.nutrientKey];
            return (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{scenario.title}</CardTitle>
                  <CardDescription>
                    {scenario.nutrient.total.toFixed(1)} {scenario.nutrient.unit} current ·{' '}
                    {scenario.nutrient.target.toFixed(1)} {scenario.nutrient.unit} target
                    {nutrientInfo?.warningLevel && (
                      <> · Warning: {nutrientInfo.warningLevel.toFixed(1)}</>
                    )}
                    {nutrientInfo?.toxicLevel && (
                      <> · Toxic: {nutrientInfo.toxicLevel.toFixed(1)}</>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="w-full">
                    <ToxicityProgressBar nutrient={scenario.nutrient} nutrientInfo={nutrientInfo} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="mt-8 bg-muted/50">
          <CardHeader>
            <CardTitle>Legend</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="font-semibold mb-2">Progress Zone (Top 90%)</div>
                <ul className="space-y-1 text-sm">
                  <li>
                    <span className="inline-block w-4 h-4 bg-red-900 mr-2 rounded"></span>
                    Red: No intake
                  </li>
                  <li>
                    <span className="inline-block w-4 h-4 bg-yellow-500 mr-2 rounded"></span>
                    Yellow: Below daily goal
                  </li>
                  <li>
                    <span className="inline-block w-4 h-4 bg-green-500 mr-2 rounded"></span>
                    Green: Goal met or exceeded
                  </li>
                </ul>
              </div>
              <div>
                <div className="font-semibold mb-2">Overage Zone (Bottom 10%)</div>
                <ul className="space-y-1 text-sm">
                  <li>
                    <span className="inline-block w-4 h-4 bg-green-500 mr-2 rounded"></span>
                    Green: Safe (below warning)
                  </li>
                  <li>
                    <span className="inline-block w-4 h-4 bg-yellow-600 mr-2 rounded"></span>
                    Yellow: Warning level reached
                  </li>
                  <li>
                    <span className="inline-block w-4 h-4 bg-red-600 mr-2 rounded"></span>
                    Red: Toxic level exceeded
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
