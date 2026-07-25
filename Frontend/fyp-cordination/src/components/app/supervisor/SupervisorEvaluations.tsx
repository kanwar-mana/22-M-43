"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getAllGroups } from "@/store/group/groupThunk";
import { Project } from "@/components/app/student/StudentProject";
import { MilestoneList } from "@/components/milestones/MilestoneList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  FolderGit2,
  ArrowLeft,
  CheckCircle2,
  Search,
  Clock,
  ClipboardCheck,
} from "lucide-react";

export default function SupervisorEvaluations() {
  const dispatch = useAppDispatch();
  const { allGroups, isLoading } = useAppSelector((state) => state.group);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getAllGroups());
  }, [dispatch]);

  if (selectedGroup) {
    const groupToView = allGroups.find((g) => g._id === selectedGroup);
    if (groupToView) {
      return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedGroup(null)}
              className="gap-2 -ml-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Evaluations
            </Button>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="h-10 p-1 w-full max-w-sm">
              <TabsTrigger value="overview" className="flex-1 text-sm font-semibold">
                Project Overview
              </TabsTrigger>
              <TabsTrigger value="milestones" className="flex-1 text-sm font-semibold">
                Milestones & Grading
              </TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <Project group={groupToView} />
            </TabsContent>
            <TabsContent value="milestones">
              <MilestoneList group={groupToView} isLeader={false} isSupervisor={true} />
            </TabsContent>
          </Tabs>
        </div>
      );
    }
  }

  const activeGroups = allGroups.filter((g) => 
    (g.status === "APPROVED" || g.status === "COMPLETED") && 
    g.internalEvaluator?._id === user?._id
  );
  const filtered = activeGroups.filter(
    (g) =>
      !search ||
      g.projectDetails.title.toLowerCase().includes(search.toLowerCase()) ||
      g.projectDetails.domain?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary mb-1">Assigned Evaluations</p>
          <h1 className="text-3xl font-bold tracking-tight">Your Evaluations</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {activeGroups.length} project{activeGroups.length !== 1 ? "s" : ""} assigned to you for internal evaluation.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by title or domain…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      {isLoading && allGroups.length === 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[200px] rounded-2xl border bg-muted/20 animate-pulse" />
          ))}
        </div>
      ) : activeGroups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed rounded-2xl bg-muted/10">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-5">
            <ClipboardCheck className="w-8 h-8 text-primary/40" />
          </div>
          <h3 className="text-lg font-semibold">No evaluations assigned</h3>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-sm">
            You haven't been assigned any projects for internal evaluation yet. The coordinator will assign them.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed rounded-2xl bg-muted/10">
          <Search className="w-10 h-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">No projects match your search.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((group) => {
            const milestones = group.milestones || [];
            const pendingCount = milestones.filter((m) => m.status === "SUBMITTED").length;
            const approvedCount = milestones.filter((m) => m.status === "APPROVED").length;

            return (
              <div
                key={group._id}
                onClick={() => setSelectedGroup(group._id)}
                className="group relative cursor-pointer rounded-2xl border border-border/60 bg-card/60 hover:bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:border-primary/30 flex flex-col"
              >
                {/* Top */}
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <ClipboardCheck className="w-5 h-5 text-primary" />
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0 bg-background/60">
                    {group.projectDetails.domain}
                  </Badge>
                </div>

                {/* Title + Desc */}
                <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors mb-1.5">
                  {group.projectDetails.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed flex-1">
                  {group.projectDetails.description}
                </p>

                {/* Technologies */}
                {group.projectDetails.technologies && group.projectDetails.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {group.projectDetails.technologies.slice(0, 3).map((tech: string, i: number) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-muted border text-muted-foreground"
                      >
                        {tech}
                      </span>
                    ))}
                    {group.projectDetails.technologies.length > 3 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted border text-muted-foreground">
                        +{group.projectDetails.technologies.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/40">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="w-3.5 h-3.5" />
                    <span>{group.members.length} members</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {approvedCount > 0 && (
                      <div className="flex items-center gap-1 text-[10px] text-green-600">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{approvedCount} done</span>
                      </div>
                    )}
                    {pendingCount > 0 && (
                      <Badge className="text-[10px] px-2 h-5 bg-amber-500/10 text-amber-600 border border-amber-500/20">
                        <Clock className="w-2.5 h-2.5 mr-1" />
                        {pendingCount} pending
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
