import { Skeleton } from "@/components/ui/skeleton";

export function RegistrasiDetailSkeleton() {
  return (
    <div className="p-6 space-y-6 max-w-6xl animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center gap-4">
        {/* Back Button Arrow Skeleton */}
        <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-[200px]" />
          <Skeleton className="h-3 w-[150px]" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side Cards Skeleton */}
        <div className="md:col-span-2 space-y-6">
          {/* Profil Card */}
          <div className="rounded-xl border border-gray-100 bg-white p-6 space-y-4">
            <Skeleton className="h-3 w-[80px]" />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Skeleton className="h-3 w-1/3" /><Skeleton className="h-4 w-2/3" /></div>
              <div className="space-y-2"><Skeleton className="h-3 w-1/3" /><Skeleton className="h-4 w-2/3" /></div>
              <div className="space-y-2"><Skeleton className="h-3 w-1/3" /><Skeleton className="h-4 w-2/3" /></div>
              <div className="space-y-2"><Skeleton className="h-3 w-1/3" /><Skeleton className="h-4 w-2/3" /></div>
            </div>
            <div className="space-y-2 pt-2">
              <Skeleton className="h-3 w-[100px]" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          </div>

          {/* Documents Card */}
          <div className="rounded-xl border border-gray-100 bg-white p-6 space-y-4">
            <Skeleton className="h-3 w-[100px]" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between border border-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded" />
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-[100px]" />
                      <Skeleton className="h-2.5 w-[70px]" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-[50px] rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side Cards Skeleton */}
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-100 bg-white p-6 space-y-4">
            <Skeleton className="h-3 w-[70px]" />
            <div className="space-y-3">
              <div className="flex justify-between"><Skeleton className="h-3.5 w-1/3" /><Skeleton className="h-5 w-1/4 rounded-full" /></div>
              <div className="flex justify-between"><Skeleton className="h-3.5 w-1/3" /><Skeleton className="h-5 w-1/4 rounded-full" /></div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-6 space-y-4">
            <Skeleton className="h-3 w-[90px]" />
            <div className="space-y-3">
              <Skeleton className="h-3 w-[120px]" />
              <div className="flex gap-2"><Skeleton className="h-8 flex-1 rounded-lg" /><Skeleton className="h-8 flex-1 rounded-lg" /></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
