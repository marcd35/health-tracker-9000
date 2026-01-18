'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface Nutrient {
  name: string;
  actual: number;
  target: number;
}

interface MicronutrientGridProps {
  nutrients: Nutrient[];
}

export function MicronutrientGrid({ nutrients }: MicronutrientGridProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Micronutrients</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-4">
          {nutrients.map((n) => {
            const percent = Math.min(100, Math.round((n.actual / (n.target || 1)) * 100));
            return (
              <div key={n.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground truncate">{n.name}</span>
                  <span className="font-medium text-primary">{percent}%</span>
                </div>
                <Progress
                  value={percent}
                  className="h-1"
                  indicatorClassName={
                    percent >= 100 ? 'bg-green-500' : percent >= 50 ? 'bg-primary' : 'bg-yellow-500'
                  }
                />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
