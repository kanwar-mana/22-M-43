import { Skeleton } from "@/components/ui/skeleton";

export const SubmissionsSkeleton = () => (
  <div className="flex flex-col gap-6">
    {/* Header */}
    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
      <div>
        <Skeleton className="h-9 w-40 mb-2" />
        <Skeleton className="h-5 w-72" />
      </div>
      <Skeleton className="h-10 w-36 rounded-md" />
    </div>

    {/* Stats Overview */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-card rounded-xl border border-border/50 shadow-sm p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-8 w-12" />
        </div>
      ))}
    </div>

    {/* Progress Bar */}
    <div className="bg-card rounded-xl border border-border/50 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-8 w-14" />
      </div>
      <Skeleton className="h-3 w-full rounded-full mb-2" />
      <Skeleton className="h-4 w-52" />
    </div>

    {/* Separator */}
    <Skeleton className="h-px w-full my-2" />

    {/* Submissions List */}
    <div className="bg-card rounded-xl border border-border/50 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <Skeleton className="h-5 w-5 rounded" />
        <Skeleton className="h-7 w-40" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-muted/30 rounded-lg p-4">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <Skeleton className="h-5 w-44" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                  {i <= 2 && <Skeleton className="h-5 w-24 rounded-full" />}
                </div>
                <Skeleton className="h-4 w-full mb-3" />
                <Skeleton className="h-4 w-3/4 mb-3" />
                <div className="flex flex-wrap gap-4">
                  <Skeleton className="h-4 w-32" />
                  {i <= 3 && <Skeleton className="h-4 w-40" />}
                  {i <= 3 && <Skeleton className="h-4 w-36" />}
                </div>
                {i <= 2 && (
                  <div className="mt-3 p-3 bg-background/50 rounded-md border border-border/50">
                    <Skeleton className="h-4 w-20 mb-1" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <Skeleton className="h-8 w-20 rounded-md" />
                {i <= 3 && <Skeleton className="h-8 w-24 rounded-md" />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
