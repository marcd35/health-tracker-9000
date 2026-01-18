'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History as HistoryIcon, Calendar } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TableSkeleton } from '@/components/ui/TableSkeleton';
import { useHealthStore } from '@/lib/store/healthStore';
import { DailyLog } from '@/lib/types/health';

export default function HistoryPage() {
  const { weeklySummary, isLoading, fetchWeeklySummary } = useHealthStore();

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    fetchWeeklySummary(today);
  }, [fetchWeeklySummary]);

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gradient">History</h1>
          <p className="text-muted-foreground">Look back at your progress and historical data.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <HistoryIcon className="h-5 w-5" />
            Activity Log
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
            <Calendar className="h-4 w-4" />
            Last 7 Days
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton rows={7} columns={6} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Health Score</TableHead>
                  <TableHead>Calories</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Meals</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {weeklySummary.map((day: DailyLog) => (
                  <TableRow key={day.date}>
                    <TableCell className="font-medium">{day.date}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2 w-2 rounded-full ${day.healthScore >= 80 ? 'bg-green-500' : 'bg-yellow-500'}`}
                        />
                        {day.healthScore}
                      </div>
                    </TableCell>
                    <TableCell>{Math.round(day.totalNutrition.calories)} kcal</TableCell>
                    <TableCell>{day.weight || '-'} kg</TableCell>
                    <TableCell>{day.meals.length}</TableCell>
                    <TableCell className="text-right">
                      <button className="text-primary hover:underline text-sm font-medium">
                        View Details
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
                {weeklySummary.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No history found. Start logging today!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
