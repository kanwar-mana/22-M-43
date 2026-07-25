"use client";

import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  ClipboardCheck,
  FolderGit2,
  TrendingDown,
  TrendingUp,
  Users,
  EllipsisVertical,
  PencilLine,
  Trash2,
  Power,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CreateSession from "./CreateSession";
import UpdateSession from "./UpdateSession";
import {
  getSessions,
  deleteSession,
  changeSessionActivation,
} from "@/store/session/sessionThunk";
import SessionDetailsModal from "./SessionDetailsModal";
import { getSessionLifecycle, getActivationState, formatDateRange } from "@/lib/session.utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AllGroupsTable from "@/components/groups/AllGroupsTable";
import AllowedSupervisorsList from "./AllowedSupervisorsList";
import { getAllGroups, deleteGroup } from "@/store/group/groupThunk";
import { getSupervisors } from "@/store/user/userThunk";
import type { User } from "@/types/auth.types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { Session } from "@/types/session.types";
import { useEffect, useState } from "react";

// ─── Constants ───────────────────────────────────────────────────────────────

// ─── Component ───────────────────────────────────────────────────────────────

const CoordinatorDashboard = ({ user }: { user?: User | null }) => {
  const dispatch = useAppDispatch();

  const supervisors = useAppSelector((state: any) => state.user.supervisors);
  const sessions = useAppSelector((state) => state.session.sessions);
  const groups = useAppSelector((state) => state.group.allGroups);

  const [loading, setLoading] = useState(true);
  const [sessionEditorMode, setSessionEditorMode] = useState<
    "create" | "update" | null
  >(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [sessionForUpdate, setSessionForUpdate] = useState<Session | null>(
    null,
  );
  const [sessionForDelete, setSessionforDelete] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getSupervisors())
      .unwrap()
      .finally(() => setLoading(false));
  }, [dispatch]);

  useEffect(() => {
    dispatch(getSessions())
      .unwrap()
      .finally(() => setLoading(false));
  }, [dispatch]);

  const activeProjectsCount = groups.filter((g: any) => g.status === "APPROVED" || g.status === "COMPLETED").length;
  const pendingApprovalsCount = groups.filter((g: any) => g.status === "PENDING_SUPERVISOR").length;
  
  const missedDeadlinesCount = groups.reduce((acc: number, group: any) => {
    const missed = group.milestones?.filter((m: any) => {
      if (!m.deadline) return false;
      const isPast = new Date(m.deadline) < new Date();
      return isPast && (m.status === "PENDING" || m.status === "REJECTED");
    }).length || 0;
    return acc + missed;
  }, 0);

  const metrics = [
    {
      title: "Active Projects",
      value: activeProjectsCount,
      icon: FolderGit2,
    },
    {
      title: "Supervisors",
      value: supervisors.length,
      icon: Users,
    },
    {
      title: "Pending Approvals",
      value: pendingApprovalsCount,
      icon: ClipboardCheck,
    },
    {
      title: "Missed Deadlines",
      value: missedDeadlinesCount,
      icon: AlertTriangle,
    },
  ];

  useEffect(() => {
    dispatch(getAllGroups());
  }, [dispatch]);

  // ── Early returns ──────────────────────────────────────────────────────────

  if (!loading && sessions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-6rem)]">
        <CreateSession />
      </div>
    );
  }

  if (sessionEditorMode === "create") {
    return (
      <CreateSession startInForm onBack={() => setSessionEditorMode(null)} />
    );
  }

  if (sessionEditorMode === "update" && sessionForUpdate) {
    return (
      <UpdateSession
        session={sessionForUpdate}
        onBack={() => {
          setSessionEditorMode(null);
          setSessionForUpdate(null);
        }}
      />
    );
  }

  // ── Handlers ───────────────────────────────────────────────────────────────

  const deleteSelectedSession = async (sessionId: string) => {
    try {
      await dispatch(deleteSession(sessionId)).unwrap();
    } catch (error) {
      console.error("Failed to delete session:", error);
    }
  };

  const changeActivation = async (sessionId: string) => {
    await dispatch(changeSessionActivation(sessionId)).unwrap();
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="relative space-y-6 pb-8">
      {/* Metric Cards */}
      <div className="grid gap-4 grid-cols-2 xl:grid-cols-4">
        {metrics.map((item) => {
          const Icon = item.icon;
          return (
            <Card
              key={item.title}
              className="gap-2 border-l-4 border-l-primary shadow-lg/3 bg-card/90 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            >
              <CardHeader className="pb-0">
                <div className="flex gap-2 items-center justify-between">
                  <div className="rounded-md bg-primary/12 p-2 text-primary">
                    <Icon className="size-4" />
                  </div>
                  <CardDescription className="font-medium text-xs uppercase">
                    {item.title}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex justify-between space-y-3">
                <p className="text-3xl font-bold leading-none">
                  {item.value}
                </p>
                <div className="flex items-center gap-2 text-xs">
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="sessions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-0 md:w-[600px] h-auto">
          <TabsTrigger value="sessions" className="font-semibold">Sessions Overview</TabsTrigger>
          <TabsTrigger value="groups" className="font-semibold">Groups Directory</TabsTrigger>
          <TabsTrigger value="supervisors" className="font-semibold">Supervisors</TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="space-y-4">
          <Card className="border-border/70 bg-linear-to-br from-card via-card to-primary/5 shadow-lg/10">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <CalendarDays className="size-5 text-primary" />
              Session Details
            </CardTitle>
            <CardDescription>
              Review all coordinator sessions. Click any card to view full
              details.
            </CardDescription>
            <Badge variant="secondary" className="w-fit">
              {sessions.length} {sessions.length === 1 ? "Session" : "Sessions"}
            </Badge>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setSelectedSession(null);
              setSessionForUpdate(null);
              setSessionEditorMode("create");
            }}
          >
            New Session
          </Button>
        </CardHeader>

        <CardContent>
          {loading && sessions.length === 0 ? (
            // Skeleton
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={`skeleton-${i}`}
                  className="h-36 rounded-xl border bg-muted/20 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {sessions.map((session: Session, index: number) => {
                if (!session) return null;
                const lifecycle = getSessionLifecycle(session);
                const activation = getActivationState(session);

                return (
                  <div
                    key={session._id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedSession(session)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedSession(session);
                      }
                    }}
                    className={`group rounded-xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                      activation.muted
                        ? "border-dashed border-muted-foreground/25 bg-muted/35 opacity-80 grayscale-[0.15] hover:border-muted-foreground/40 hover:shadow-none"
                        : "border-accent/20 bg-background/80 hover:border-primary/40"
                    }`}
                  >
                    {/* Card Header Row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p
                            className={`line-clamp-1 text-base font-semibold tracking-tight ${
                              activation.muted ? "text-muted-foreground" : ""
                            }`}
                          >
                            {session.name}
                          </p>
                        </div>
                        <p
                          className={`line-clamp-1 text-xs ${
                            activation.muted
                              ? "text-muted-foreground/80"
                              : "text-muted-foreground"
                          }`}
                        >
                          {session.department || "Department not specified"}
                        </p>
                      </div>

                      {/* Badges + Actions */}
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <Badge variant={lifecycle.variant} className="h-6">
                          {lifecycle.label}
                        </Badge>
                        <Badge
                          variant={activation.variant}
                          className={`h-6 gap-1.5 ${
                            activation.muted
                              ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                              : ""
                          }`}
                        >
                          <activation.icon className="size-3.5" />
                          {activation.label}
                        </Badge>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              onClick={(e) => e.stopPropagation()}
                              className="hover:bg-muted-foreground/20 p-2 cursor-pointer rounded-full z-10"
                              aria-label="Open session actions"
                            >
                              <EllipsisVertical className="size-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-52 rounded-xl border-border/70 bg-popover/95 p-1.5 shadow-xl backdrop-blur"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <DropdownMenuItem
                              onSelect={(e) => {
                                e.stopPropagation();
                                setSelectedSession(null);
                                setSessionForUpdate(session);
                                setSessionEditorMode("update");
                              }}
                            >
                              <PencilLine className="size-4" />
                              Update
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={(e) => {
                                e.stopPropagation();
                                changeActivation(session._id!);
                              }}
                            >
                              <Power className="size-4" />
                              Change Activation
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onSelect={(e) => {
                                e.stopPropagation();
                                setSessionforDelete(session._id!);
                              }}
                            >
                              <Trash2 className="size-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Date Range */}
                    <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                      <CalendarDays className="size-3.5" />
                      <span>
                        {formatDateRange(session.startDate, session.endDate)}
                      </span>
                    </div>

                    {/* Footer Row */}
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {(session.fypMilestones || []).length} milestones
                      </span>
                      <span className="inline-flex items-center gap-1 font-medium text-foreground/90 transition-colors group-hover:text-primary">
                        View details
                        <ArrowRight className="size-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
      </TabsContent>

      <TabsContent value="groups" className="mt-4">
        <AllGroupsTable 
          groups={groups} 
          supervisors={supervisors}
          onDeleteGroup={async (groupId) => {
            await dispatch(deleteGroup(groupId));
          }} 
        />
      </TabsContent>

      <TabsContent value="supervisors" className="mt-4">
        <AllowedSupervisorsList />
      </TabsContent>
    </Tabs>

      {/* Extracted Session Details Modal */}
      <SessionDetailsModal 
        session={selectedSession} 
        onClose={() => setSelectedSession(null)} 
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={Boolean(sessionForDelete)}
        onOpenChange={(open) => {
          if (!open) setSessionforDelete(null);
        }}
      >
        <AlertDialogContent className="border-border/70">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Session</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this session? This action cannot
              be undone. All associated data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSessionforDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={async () => {
                if (sessionForDelete) {
                  await deleteSelectedSession(sessionForDelete);
                  setSessionforDelete(null);
                  setSelectedSession(null);
                }
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CoordinatorDashboard;
