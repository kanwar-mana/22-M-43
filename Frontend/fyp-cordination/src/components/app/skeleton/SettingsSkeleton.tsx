import { Skeleton } from "@/components/ui/skeleton";

export const SettingsSkeleton = () => (
  <div className="flex flex-col gap-6">
    {/* Header */}
    <div>
      <Skeleton className="h-9 w-32 mb-2" />
      <Skeleton className="h-5 w-72" />
    </div>

    {/* Tabs */}
    <Skeleton className="h-9 w-80 rounded-lg mb-6" />

    {/* Profile Card */}
    <div className="bg-card rounded-xl border border-border/50 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <Skeleton className="h-5 w-5 rounded" />
        <Skeleton className="h-7 w-44" />
      </div>

      {/* Avatar Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div>
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-48 mb-1" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>

      {/* Separator */}
      <Skeleton className="h-px w-full my-6" />

      {/* Form Fields */}
      <div className="grid md:grid-cols-2 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
        ))}
      </div>

      {/* Save Button */}
      <div className="flex justify-end mt-6">
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>
    </div>
  </div>
);
