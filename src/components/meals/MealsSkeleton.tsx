import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader } from '@/components/ui/card';

export function MealsSkeleton() {
  return (
    <div className="space-y-8 pb-12">
      {/* Hero Header Skeleton */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-10 w-[200px]" />
            <Skeleton className="h-4 w-[300px]" />
          </div>
          <Skeleton className="h-10 w-[120px]" />
        </div>

        {/* Visualizations Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 rounded-xl border bg-card">
          {/* Macros Wheel */}
          <div className="flex flex-col items-center space-y-4">
            <Skeleton className="h-4 w-[120px]" />
            <Skeleton className="h-[180px] w-[180px] rounded-full" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-[60px]" />
              <Skeleton className="h-4 w-[60px]" />
              <Skeleton className="h-4 w-[60px]" />
            </div>
          </div>

          {/* Micros Wheel */}
          <div className="flex flex-col items-center space-y-4">
            <Skeleton className="h-4 w-[120px]" />
            <Skeleton className="h-[180px] w-[180px] rounded-full" />
            <Skeleton className="h-3 w-[180px]" />
          </div>

          {/* Calorie Bar */}
          <div className="flex flex-col justify-center space-y-4">
            <Skeleton className="h-4 w-[160px] mx-auto" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <div className="flex gap-0.5">
                {Array.from({ length: 20 }).map((_, i) => (
                  <Skeleton key={i} className="h-3 flex-1 rounded-sm" />
                ))}
              </div>
              <Skeleton className="h-4 w-[40px] mx-auto" />
            </div>
            <Skeleton className="h-4 w-[100px] mx-auto" />
          </div>
        </div>
      </div>

      {/* Favorites Section Skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-[150px]" />
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="flex-shrink-0 w-[200px] p-3">
              <Skeleton className="h-5 w-[140px] mb-2" />
              <Skeleton className="h-3 w-[80px] mb-2" />
              <Skeleton className="h-8 w-full" />
            </Card>
          ))}
        </div>
      </div>

      {/* Today's Meals Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-[140px]" />
        <div className="space-y-3">
          {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => (
            <div key={type} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded" />
                  <div>
                    <Skeleton className="h-5 w-[80px] mb-1" />
                    <Skeleton className="h-3 w-[50px]" />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-4 w-[100px] hidden sm:block" />
                  <Skeleton className="h-5 w-[60px]" />
                  <Skeleton className="h-5 w-5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Historical Log Skeleton */}
      <Card>
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-[130px]" />
            <Skeleton className="h-5 w-5" />
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
