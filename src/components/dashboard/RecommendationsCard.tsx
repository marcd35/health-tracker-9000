'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Info, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Recommendation {
  type: 'deficiency' | 'excess' | 'health_condition' | 'general';
  message: string;
  severity: 'low' | 'medium' | 'high';
}

interface RecommendationsCardProps {
  recommendations: Recommendation[];
}

export function RecommendationsCard({ recommendations }: RecommendationsCardProps) {
  if (recommendations.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-primary" />
          Health Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.map((rec, index) => (
          <div
            key={index}
            className={cn(
              'flex gap-3 p-3 rounded-lg border text-sm',
              rec.severity === 'high'
                ? 'bg-destructive/10 border-destructive/20 text-destructive'
                : rec.severity === 'medium'
                  ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-700 dark:text-yellow-500'
                  : 'bg-muted border-border text-muted-foreground'
            )}
          >
            {rec.severity === 'high' ? (
              <AlertCircle className="h-5 w-5 shrink-0" />
            ) : (
              <Info className="h-5 w-5 shrink-0" />
            )}
            <p>{rec.message}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
