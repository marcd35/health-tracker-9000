'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ChevronDown, ChevronRight, Calendar, Eye, Loader2 } from 'lucide-react';
import { useHealthStore } from '@/lib/store/healthStore';
import { DayDetailModal } from './DayDetailModal';
import { format, parseISO } from 'date-fns';
import type { DailyLog } from '@/lib/types/health';

export function HistoricalLogCard() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DailyLog | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const hasFetched = useRef(false);

  const { weeklySummary, fetchWeeklySummary } = useHealthStore();

  // Handle open/close with data fetching
  const handleOpenChange = async (open: boolean) => {
    setIsOpen(open);
    if (open && !hasFetched.current && weeklySummary.length === 0) {
      hasFetched.current = true;
      setIsLoading(true);
      const today = new Date().toISOString().split('T')[0];
      try {
        await fetchWeeklySummary(today);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Filter out today and sort by date descending
  const today = new Date().toISOString().split('T')[0];
  const historicalDays = weeklySummary
    .filter((day) => day.date !== today)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 7);

  return (
    <>
      <Card>
        <Collapsible open={isOpen} onOpenChange={handleOpenChange}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardTitle className="flex items-center justify-between text-base">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Weekly History
                </div>
                {isOpen ? (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                )}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className="pt-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading history...</span>
                </div>
              ) : historicalDays.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No historical data available yet.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Calories</TableHead>
                      <TableHead className="text-right hidden sm:table-cell">Protein</TableHead>
                      <TableHead className="text-right hidden sm:table-cell">Carbs</TableHead>
                      <TableHead className="text-right hidden sm:table-cell">Fat</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historicalDays.map((day) => (
                      <TableRow key={day.date}>
                        <TableCell className="font-medium">
                          {format(parseISO(day.date), 'EEE, MMM d')}
                        </TableCell>
                        <TableCell className="text-right">
                          {Math.round(day.totalNutrition.calories)}
                        </TableCell>
                        <TableCell className="text-right hidden sm:table-cell">
                          {Math.round(day.totalNutrition.protein)}g
                        </TableCell>
                        <TableCell className="text-right hidden sm:table-cell">
                          {Math.round(day.totalNutrition.carbs)}g
                        </TableCell>
                        <TableCell className="text-right hidden sm:table-cell">
                          {Math.round(day.totalNutrition.fat)}g
                        </TableCell>
                        <TableCell className="text-right font-bold">{day.healthScore}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setSelectedDay(day)}
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      <DayDetailModal
        isOpen={!!selectedDay}
        onClose={() => setSelectedDay(null)}
        dayLog={selectedDay}
      />
    </>
  );
}
