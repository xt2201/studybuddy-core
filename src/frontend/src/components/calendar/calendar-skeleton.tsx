
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function CalendarSkeleton() {
  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-10" />
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      {/* Calendar Grid */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="grid grid-cols-7 gap-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="aspect-square p-2 border rounded-lg">
                <Skeleton className="h-4 w-8 mb-2" />
                <div className="space-y-1">
                  <Skeleton className="h-2 w-full" />
                  <Skeleton className="h-2 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
