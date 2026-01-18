'use client';

import React from 'react';
import { HealthScoreCard } from '@/components/dashboard/HealthScoreCard';
import { NutritionSummaryCard } from '@/components/dashboard/NutritionSummaryCard';
import { RecommendationsCard } from '@/components/dashboard/RecommendationsCard';
import { TodaysMeals } from '@/components/dashboard/TodaysMeals';
import { TodaysSupplements } from '@/components/dashboard/TodaysSupplements';
import { MacroChart } from '@/components/dashboard/MacroChart';
import { WeeklyTrendChart } from '@/components/dashboard/WeeklyTrendChart';
import { MicronutrientGrid } from '@/components/dashboard/MicronutrientGrid';
import { Button } from '@/components/ui/button';
import { Plus, Utensils } from 'lucide-react';
import Link from 'next/link';

// Mock Data
const mockScore = 85;
const mockBreakdown = {
  macros: 92,
  micros: 78,
  supplements: 100,
  hydration: 70,
};

const mockNutrition = {
  actual: { calories: 1850, protein: 140, carbs: 180, fat: 65 },
  targets: { calories: 2200, protein: 160, carbs: 240, fat: 70 },
};

const mockMeals = [
  {
    id: '1',
    mealType: 'breakfast',
    foods: [
      { foodId: 'f1', foodName: 'Oatmeal', amount: 80 },
      { foodId: 'f2', foodName: 'Blueberries', amount: 50 },
    ],
    totalNutrition: { calories: 350, protein: 10, carbs: 65, fat: 5 },
  },
  {
    id: '2',
    mealType: 'lunch',
    foods: [{ foodId: 'f3', foodName: 'Chicken Salad', amount: 250 }],
    totalNutrition: { calories: 550, protein: 45, carbs: 15, fat: 35 },
  },
];

const mockSupplements = [
  { id: 's1', supplementId: 'sup1', supplementName: 'Multivitamin', taken: true },
  { id: 's2', supplementId: 'sup2', supplementName: 'Fish Oil', taken: true },
  { id: 's3', supplementId: 'sup3', supplementName: 'Vitamin D', taken: false },
];

const mockTrends = [
  { date: 'Mon', score: 75, weight: 82.5 },
  { date: 'Tue', score: 82, weight: 82.3 },
  { date: 'Wed', score: 70, weight: 82.4 },
  { date: 'Thu', score: 88, weight: 82.1 },
  { date: 'Fri', score: 92, weight: 81.9 },
  { date: 'Sat', score: 85, weight: 82.0 },
  { date: 'Sun', score: 85, weight: 82.0 },
];

const mockMicros = [
  { name: 'Vitamin A', actual: 800, target: 900 },
  { name: 'Vitamin C', actual: 120, target: 90 },
  { name: 'Vitamin D', actual: 10, target: 20 },
  { name: 'Iron', actual: 15, target: 18 },
  { name: 'Magnesium', actual: 300, target: 400 },
  { name: 'Zinc', actual: 12, target: 11 },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s your health summary for today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" className="gap-2">
            <Link href="/meals">
              <Utensils className="h-4 w-4" />
              Log Meal
            </Link>
          </Button>
          <Button asChild className="gap-2">
            <Link href="/supplements">
              <Plus className="h-4 w-4" />
              Quick Action
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <HealthScoreCard score={mockScore} breakdown={mockBreakdown} />
        <div className="lg:col-span-2">
          <NutritionSummaryCard actual={mockNutrition.actual} targets={mockNutrition.targets} />
        </div>
        <MacroChart data={mockNutrition.actual} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <WeeklyTrendChart data={mockTrends} />
          <MicronutrientGrid nutrients={mockMicros} />
        </div>
        <div className="space-y-6">
          <RecommendationsCard
            recommendations={[
              {
                type: 'health_condition',
                message: 'Gout Friendly: Drink at least 2L of water today.',
                severity: 'high',
              },
              {
                type: 'deficiency',
                message: 'You are low on Vitamin D today.',
                severity: 'medium',
              },
            ]}
          />
          <TodaysSupplements supplements={mockSupplements} />
          <TodaysMeals meals={mockMeals} />
        </div>
      </div>
    </div>
  );
}
