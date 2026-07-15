import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function RegistrasiListSkeleton() {
  return (
    <div className="p-6 space-y-6 w-full animate-pulse">
      {/* Page Header Skeleton */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-[180px]" />
          <Skeleton className="h-3 w-[250px]" />
        </div>
        <Skeleton className="h-8 w-[80px] rounded-lg" />
      </div>

      {/* Stats Cards Skeleton (6 Cards Grid matching layout exactly) */}
      <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="border border-gray-100 shadow-sm rounded-2xl">
            <CardContent className="p-4 space-y-2">
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-7 w-1/3 mt-1" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tab Navigation Skeleton */}
      <div className="flex gap-1 rounded-lg bg-gray-100 p-1 w-fit">
        <Skeleton className="h-8 w-[150px] rounded-md" />
        <Skeleton className="h-8 w-[150px] rounded-md" />
      </div>

      {/* Table Card Skeleton */}
      <Card className="border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="p-4 w-[50px]"><Skeleton className="h-4 w-6" /></th>
                  <th className="p-4"><Skeleton className="h-4 w-28" /></th>
                  <th className="p-4"><Skeleton className="h-4 w-16" /></th>
                  <th className="p-4"><Skeleton className="h-4 w-24" /></th>
                  <th className="p-4"><Skeleton className="h-4 w-16" /></th>
                  <th className="p-4"><Skeleton className="h-4 w-24" /></th>
                  <th className="p-4"><Skeleton className="h-4 w-20" /></th>
                  <th className="p-4 w-[100px]"><Skeleton className="h-4 w-12" /></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {Array.from({ length: 4 }).map((_, rowIndex) => (
                  <tr key={rowIndex}>
                    <td className="p-4"><Skeleton className="h-4 w-4" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-32" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-16" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-28" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-16" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="p-4"><Skeleton className="h-5 w-16 rounded" /></td>
                    <td className="p-4"><Skeleton className="h-7 w-16 rounded" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
