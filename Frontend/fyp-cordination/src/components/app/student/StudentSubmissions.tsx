"use client";

import { ShieldX, FolderKanban } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { Spinner } from "@/components/ui/spinner";
import { MilestoneList } from "@/components/milestones/MilestoneList";

const StudentSubmissions = () => {
  const { currentGroup } = useAppSelector((s) => s.group);
  const { user } = useAppSelector((s) => s.auth);

  if (!currentGroup) {
    if (!user?.studentProfile?.group) {
      return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground gap-1">
          <FolderKanban className="w-16 h-16 mb-4 text-muted/40" />
          <h2 className="text-xl font-semibold text-foreground mb-2">No Project Found</h2>
          <p className="text-sm">You haven't created or joined any project yet.</p>
          <p className="text-xs mt-2 text-muted-foreground/80">
            Go to your Dashboard to create a group or check your invitations.
          </p>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground gap-3">
        <Spinner className="size-8 text-primary" />
        <p className="text-sm">Loading your project details...</p>
      </div>
    );
  }

  const isLeader =
    user?.role === "student" && user._id === currentGroup.leader?._id;

  const groupApproved = currentGroup.status === "APPROVED";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Submissions</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Track and submit your FYP milestones
        </p>
      </div>

      {!groupApproved ? (
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10">
            <ShieldX className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold">Group Not Approved</h2>
          <p className="text-sm text-muted-foreground max-w-md">
            Milestone submissions are only available once your group has been{" "}
            <span className="font-medium text-foreground">approved by a supervisor</span>.
            Your current group status is{" "}
            <span className="font-medium text-amber-500">
              {currentGroup.status.replace(/_/g, " ")}
            </span>
            .
          </p>
        </div>
      ) : (
        <MilestoneList group={currentGroup} isLeader={isLeader} showStats />
      )}
    </div>
  );
};

export default StudentSubmissions;
