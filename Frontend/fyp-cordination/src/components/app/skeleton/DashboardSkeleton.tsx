import { Skeleton } from "../../ui/skeleton";
export const DashboardSkeleton = () => (
  <div className="flex flex-col">
    {/* Header */}
    <div>
      <Skeleton className="h-9 w-40 mb-2" />
      <Skeleton className="h-5 w-56" />
    </div>

    {/* Stats Cards */}
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-card w-full rounded-md p-4 min-h-24">
          <Skeleton className="h-5 w-24 mb-3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4 mt-1" />
        </div>
      ))}
    </div>

    {/* Action Buttons */}
    <div className="flex gap-5 flex-wrap mt-6">
      <Skeleton className="h-10 w-40 rounded-md" />
      <Skeleton className="h-10 w-32 rounded-md" />
      <Skeleton className="h-10 w-36 rounded-md" />
    </div>

    {/* Timeline and Side Panel */}
    <div className="flex flex-wrap gap-6 mt-6 w-full">
      <div className="flex-2 bg-card min-h-96 rounded-xl p-6">
        <Skeleton className="h-7 w-40 mb-6" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex gap-4 mb-6">
            <Skeleton className="h-7 w-7 rounded-full shrink-0" />
            <div className="flex-1">
              <Skeleton className="h-4 w-28 mb-2" />
              <Skeleton className="h-5 w-44 mb-1" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        ))}
      </div>
      <div className="flex-1 bg-card min-h-96 rounded-xl p-6">
        <Skeleton className="h-7 w-32 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  </div>
);
