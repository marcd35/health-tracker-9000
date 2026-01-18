'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Pill } from 'lucide-react';

interface SupplementEntry {
  id: string;
  supplementId: string;
  supplementName: string;
  taken: boolean;
}

interface TodaysSupplementsProps {
  supplements: SupplementEntry[];
}

export function TodaysSupplements({ supplements }: TodaysSupplementsProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Pill className="h-4 w-4 text-muted-foreground" />
          Today&apos;s Supplements
        </CardTitle>
      </CardHeader>
      <CardContent>
        {supplements.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            No supplements scheduled.
          </div>
        ) : (
          <div className="space-y-4">
            {supplements.map((supp) => (
              <div key={supp.id} className="flex items-center space-x-3">
                <Checkbox
                  id={supp.id}
                  checked={supp.taken}
                  onCheckedChange={() => {}} // Handle in upper state
                />
                <label
                  htmlFor={supp.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {supp.supplementName}
                </label>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
