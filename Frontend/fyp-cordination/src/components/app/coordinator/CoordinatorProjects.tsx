"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getAllGroups } from "@/store/group/groupThunk";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FolderGit2,
  Search,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  ChevronRight,
  Filter,
} from "lucide-react";
import { Group } from "@/types/group.types";
import Link from "next/link";

const statusConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  APPROVED: {
    label: "Approved",
    className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-blue-500/10 text-blue-600 border-blue-500/30",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  PENDING_SUPERVISOR: {
    label: "Pending Supervisor",
    className: "bg-amber-500/10 text-amber-600 border-amber-500/30",
    icon: <Clock className="w-3 h-3" />,
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-red-500/10 text-red-600 border-red-500/30",
    icon: <XCircle className="w-3 h-3" />,
  },
  DRAFT: {
    label: "Draft",
    className: "bg-muted text-muted-foreground border-border",
    icon: <FileText className="w-3 h-3" />,
  },
};

function ProjectCard({ group }: { group: Group }) {
  const status = statusConfig[group.status] ?? statusConfig.DRAFT;
  const milestones = group.milestones || [];
  const submittedCount = milestones.filter((m) => m.status === "SUBMITTED").length;
  const approvedCount = milestones.filter((m) => m.status === "APPROVED").length;
  const progress = milestones.length > 0 ? Math.round((approvedCount / milestones.length) * 100) : 0;

  return (
    <Link href={`/dashboard/projects/${group._id}`}>
      <Card className="group cursor-pointer border-border/60 bg-card/70 hover:bg-card hover:border-primary/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
        <CardContent className="p-4 sm:p-5 flex flex-col gap-3 h-full">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <FolderGit2 className="w-4.5 h-4.5 text-primary" />
            </div>
            <Badge variant="outline" className={`text-[10px] flex items-center gap-1 shrink-0 ${status.className}`}>
              {status.icon}
              {status.label}
            </Badge>
          </div>

          {/* Title */}
          <div>
            <h3 className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
              {group.projectDetails.title}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
              {group.projectDetails.description}
            </p>
          </div>

          {/* Domain & Technologies */}
          <div className="flex flex-wrap gap-1">
            <Badge variant="secondary" className="text-[10px]">{group.projectDetails.domain}</Badge>
            {group.projectDetails.technologies.slice(0, 2).map((tech, i) => (
              <Badge key={i} variant="outline" className="text-[10px] text-muted-foreground">{tech}</Badge>
            ))}
            {group.projectDetails.technologies.length > 2 && (
              <Badge variant="outline" className="text-[10px] text-muted-foreground">
                +{group.projectDetails.technologies.length - 2}
              </Badge>
            )}
          </div>

          {/* Progress bar */}
          {milestones.length > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Milestones</span>
                <span>{approvedCount}/{milestones.length} done</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-border/40 mt-auto">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {group.members.length}/{group.requiredMembers}
              </span>
              {submittedCount > 0 && (
                <span className="flex items-center gap-1 text-amber-600">
                  <Clock className="w-3 h-3" />
                  {submittedCount} pending review
                </span>
              )}
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function CoordinatorProjects() {
  const dispatch = useAppDispatch();
  const { allGroups, isLoading } = useAppSelector((state) => state.group);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    dispatch(getAllGroups());
  }, [dispatch]);

  const filtered = allGroups.filter((g) => {
    const matchesSearch =
      !search ||
      g.projectDetails.title.toLowerCase().includes(search.toLowerCase()) ||
      g.projectDetails.domain?.toLowerCase().includes(search.toLowerCase()) ||
      g.supervisor?.fullName?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || g.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const counts = {
    ALL: allGroups.length,
    APPROVED: allGroups.filter((g) => g.status === "APPROVED").length,
    PENDING_SUPERVISOR: allGroups.filter((g) => g.status === "PENDING_SUPERVISOR").length,
    COMPLETED: allGroups.filter((g) => g.status === "COMPLETED").length,
    REJECTED: allGroups.filter((g) => g.status === "REJECTED").length,
    DRAFT: allGroups.filter((g) => g.status === "DRAFT").length,
  };

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary mb-1">Department Overview</p>
          <h1 className="text-3xl font-bold tracking-tight">All Projects</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {allGroups.length} project{allGroups.length !== 1 ? "s" : ""} in your department
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 w-60 text-sm"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-44 text-sm gap-1">
              <Filter className="w-3.5 h-3.5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status ({counts.ALL})</SelectItem>
              <SelectItem value="APPROVED">Approved ({counts.APPROVED})</SelectItem>
              <SelectItem value="PENDING_SUPERVISOR">Pending Supervisor ({counts.PENDING_SUPERVISOR})</SelectItem>
              <SelectItem value="COMPLETED">Completed ({counts.COMPLETED})</SelectItem>
              <SelectItem value="REJECTED">Rejected ({counts.REJECTED})</SelectItem>
              <SelectItem value="DRAFT">Draft ({counts.DRAFT})</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(counts).filter(([k]) => k !== "ALL").map(([status, count]) => {
          if (count === 0) return null;
          const cfg = statusConfig[status];
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(statusFilter === status ? "ALL" : status)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${cfg?.className} ${statusFilter === status ? "ring-2 ring-offset-1 ring-primary/40" : "opacity-70 hover:opacity-100"}`}
            >
              {cfg?.icon}
              {cfg?.label}: {count}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {isLoading && allGroups.length === 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-[220px] rounded-2xl border bg-muted/20 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed rounded-2xl bg-muted/10">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-5">
            <FolderGit2 className="w-8 h-8 text-primary/40" />
          </div>
          <h3 className="text-lg font-semibold">No projects found</h3>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-sm">
            {search || statusFilter !== "ALL" ? "Try adjusting your filters." : "No groups have been created yet."}
          </p>
          {(search || statusFilter !== "ALL") && (
            <Button variant="ghost" size="sm" className="mt-3" onClick={() => { setSearch(""); setStatusFilter("ALL"); }}>
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((group) => (
            <ProjectCard key={group._id} group={group} />
          ))}
        </div>
      )}
    </div>
  );
}
