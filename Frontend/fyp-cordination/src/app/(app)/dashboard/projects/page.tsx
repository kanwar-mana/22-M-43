"use client";
import { useEffect } from "react";
import { Project } from "@/components/app/student/StudentProject";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { getGroup } from "@/store/group/groupThunk";
import SupervisorProjects from "@/components/app/supervisor/SupervisorProjects";
import CoordinatorProjects from "@/components/app/coordinator/CoordinatorProjects";
import { Loader2, FolderKanban } from "lucide-react";

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { currentGroup, isLoading } = useAppSelector((state) => state.group);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (user?.role === "student" && user?.studentProfile?.group && !currentGroup) {
      dispatch(getGroup(user.studentProfile.group as string));
    }
  }, [user, currentGroup, dispatch]);

  if (user?.role === "coordinator") {
    return <CoordinatorProjects />;
  }

  if (user?.role === "supervisor") {
    return <SupervisorProjects />;
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground gap-3">
        <Loader2 className="size-8 text-primary animate-spin" />
        <p className="text-sm">Loading project details...</p>
      </div>
    );
  }

  if (!currentGroup) {
    return (
      <div className="container mx-auto h-[60vh] flex flex-col items-center justify-center text-muted-foreground">
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
    <div className="container mx-auto md:p-6">
      <Project group={currentGroup} />
    </div>
  );
}
