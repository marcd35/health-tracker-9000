'use client';

import React from 'react';
import { SupplementCheckbox } from '@/components/forms/SupplementCheckbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Pill } from 'lucide-react';

const mockSupplements = [
  { id: '1', name: "Sentry Men's Multivitamin", brand: 'Care One', taken: true },
  { id: '2', name: 'Fish Oil', brand: 'Nature Made', taken: false },
  { id: '3', name: 'Vitamin C', brand: 'Emergen-C', taken: true },
  { id: '4', name: 'Magnesium Glycinate', brand: 'Pure Encapsulations', taken: false },
];

export default function SupplementsPage() {
  const handleToggle = (id: string, taken: boolean) => {
    console.log(`Toggle supplement ${id} to ${taken}`);
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Supplements</h1>
          <p className="text-muted-foreground">
            Manage your daily supplement routine and track compliance.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-primary" />
              <CardTitle>Daily Stack</CardTitle>
            </div>
            <CardDescription>Click to mark as taken for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mockSupplements.map((supp) => (
                <SupplementCheckbox
                  key={supp.id}
                  id={supp.id}
                  name={supp.name}
                  brand={supp.brand}
                  taken={supp.taken}
                  onToggle={handleToggle}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
