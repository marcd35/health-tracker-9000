'use client';

import React from 'react';
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

const mockHistory = [
  { date: '2026-01-17', score: 85, calories: 1850, meals: 3, weight: 82.0 },
  { date: '2026-01-16', score: 92, calories: 2100, meals: 4, weight: 81.9 },
  { date: '2026-01-15', score: 88, calories: 1950, meals: 3, weight: 82.1 },
  { date: '2026-01-14', score: 70, calories: 2400, meals: 5, weight: 82.4 },
  { date: '2026-01-13', score: 82, calories: 2050, meals: 3, weight: 82.3 },
];

export default function HistoryPage() {
  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gradient">History</h1>
        <p className="text-muted-foreground">Look back at your progress and historical data.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <HistoryIcon className="h-5 w-5" />
            Activity Log
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
            <Calendar className="h-4 w-4" />
            Last 30 Days
          </div>
        </CardHeader>
        <CardContent>
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
              {mockHistory.map((day) => (
                <TableRow key={day.date}>
                  <TableCell className="font-medium">{day.date}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2 w-2 rounded-full ${day.score >= 80 ? 'bg-green-500' : 'bg-yellow-500'}`}
                      />
                      {day.score}
                    </div>
                  </TableCell>
                  <TableCell>{day.calories} kcal</TableCell>
                  <TableCell>{day.weight} kg</TableCell>
                  <TableCell>{day.meals}</TableCell>
                  <TableCell className="text-right">
                    <button className="text-primary hover:underline text-sm font-medium">
                      View Details
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
