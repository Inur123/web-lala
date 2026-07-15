import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function SettingsSkeleton() {
  return (
    <div className="p-6 space-y-6 max-w-xl animate-pulse">
      {/* Page Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-5 w-[160px]" />
        <Skeleton className="h-3 w-[280px]" />
      </div>

      {/* Settings Card Skeleton */}
      <Card className="border border-gray-100 shadow-sm rounded-2xl">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-[260px]" />
              <Skeleton className="h-3 w-[220px]" />
            </div>
            {/* Toggle Switch Skeleton */}
            <Skeleton className="h-6 w-11 rounded-full shrink-0" />
          </div>

          {/* Indicator Skeleton */}
          <Skeleton className="h-10 w-full rounded-xl" />
        </CardContent>
      </Card>
    </div>
  );
}
