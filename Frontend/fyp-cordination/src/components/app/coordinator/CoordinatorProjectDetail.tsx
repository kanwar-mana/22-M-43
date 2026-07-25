"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getAllGroups, getGroup } from "@/store/group/groupThunk";
import { Project } from "@/components/app/student/StudentProject";
import { MilestoneList } from "@/components/milestones/MilestoneList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, FolderGit2, Users, CheckCircle2, Clock } from "lucide-react";

export default function CoordinatorProjectDetail() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { allGroups, isLoading } = useAppSelector((state) => state.group);
  const groupId = params.groupId as string;

  useEffect(() => {
    // If groups aren't loaded yet, fetch them
    if (allGroups.length === 0) {
      dispatch(getAllGroups());
    }
  }, [dispatch, allGroups.length]);

  const group = allGroups.find((g) => g._id === groupId);

  if (isLoading && !group) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-3 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm">Loading project...</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-3 text-muted-foreground">
        <FolderGit2 className="w-12 h-12 text-muted/40" />
        <p className="text-sm font-medium">Project not found.</p>
        <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/projects")}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Projects
        </Button>
      </div>
    );
  }

  const milestones = group.milestones || [];
  const submittedCount = milestones.filter((m) => m.status === "SUBMITTED").length;
  const approvedCount = milestones.filter((m) => m.status === "APPROVED").length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard/projects")}
          className="gap-1.5 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          All Projects
        </Button>
        <span className="text-muted-foreground/40">/</span>
        <span className="text-sm font-medium truncate max-w-[300px]">{group.projectDetails.title}</span>
      </div>

      {/* Quick Stats Bar */}
      <div className="flex flex-wrap gap-3 p-4 rounded-xl border border-border/60 bg-muted/20">
        <div className="flex items-center gap-2 text-sm">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">{group.members.length}/{group.requiredMembers}</span>
          <span className="text-muted-foreground">members</span>
        </div>
        <div className="w-px bg-border" />
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span className="font-medium">{approvedCount}</span>
          <span className="text-muted-foreground">milestones done</span>
        </div>
        {submittedCount > 0 && (
          <>
            <div className="w-px bg-border" />
            <div className="flex items-center gap-2 text-sm text-amber-600">
              <Clock className="w-4 h-4" />
              <span className="font-medium">{submittedCount} pending review</span>
            </div>
          </>
        )}
        {group.supervisor && (
          <>
            <div className="w-px bg-border" />
            <div className="text-sm">
              <span className="text-muted-foreground">Supervisor: </span>
              <span className="font-medium">{group.supervisor.fullName}</span>
            </div>
          </>
        )}
        {group.internalEvaluator && (
          <>
            <div className="w-px bg-border" />
            <div className="text-sm">
              <span className="text-muted-foreground">Evaluator: </span>
              <span className="font-medium">{group.internalEvaluator.fullName}</span>
            </div>
          </>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="h-10 p-1 w-full max-w-sm">
          <TabsTrigger value="overview" className="flex-1 text-sm font-semibold">
            Project Overview
          </TabsTrigger>
          <TabsTrigger value="milestones" className="flex-1 text-sm font-semibold">
            Milestones
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Project group={group} />
        </TabsContent>
        <TabsContent value="milestones">
          <MilestoneList group={group} isLeader={false} isSupervisor={false} isCoordinator={true} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
