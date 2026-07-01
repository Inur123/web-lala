import { Skeleton } from "@/components/ui/skeleton";

export function RegistrasiListSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      {/* Page Header Skeleton */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-[180px]" />
          <Skeleton className="h-3 w-[250px]" />
        </div>
        <Skeleton className="h-8 w-[80px] rounded-lg" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-100 bg-white p-4 space-y-2">
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-7 w-1/3 mt-1" />
          </div>
        ))}
      </div>

      {/* Tab Navigation Skeleton */}
      <div className="flex gap-1 rounded-lg bg-gray-100 p-1 w-fit">
        <Skeleton className="h-8 w-[150px] rounded-md" />
        <Skeleton className="h-8 w-[150px] rounded-md" />
      </div>

      {/* Table Card Skeleton */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 space-y-4">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
        <div className="space-y-2 pt-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
    </div>
  );
}
