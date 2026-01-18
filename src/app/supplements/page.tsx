'use client';

import React, { useEffect } from 'react';
import { SupplementCheckbox } from '@/components/forms/SupplementCheckbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Pill } from 'lucide-react';
import { useHealthStore } from '@/lib/store/healthStore';
import { SupplementsSkeleton } from '@/components/supplements/SupplementsSkeleton';

export default function SupplementsPage() {
  const {
    allSupplements,
    dailyLog,
    isLoading,
    fetchAllSupplements,
    fetchDailyLog,
    toggleSupplement,
  } = useHealthStore();

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchAllSupplements();
    fetchDailyLog(today);
  }, [fetchAllSupplements, fetchDailyLog, today]);

  if (isLoading && allSupplements.length === 0) {
    return <SupplementsSkeleton />;
  }

  const handleToggle = async (id: string, taken: boolean) => {
    const supp = allSupplements.find((s) => s.id === id);
    if (!supp) return;
    await toggleSupplement(id, supp.name, today, taken);
  };

  const supplementsWithStatus = allSupplements.map((supp) => {
    const log = dailyLog?.supplements.find((l) => l.supplementId === supp.id);
    return {
      ...supp,
      taken: log ? log.taken : false,
    };
  });

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
            {supplementsWithStatus.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                No supplements found. Add some in settings!
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {supplementsWithStatus.map((supp) => (
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
