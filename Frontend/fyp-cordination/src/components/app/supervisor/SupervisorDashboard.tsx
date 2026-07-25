"use client";

import { useEffect, useState } from "react";
import { User } from "@/types/auth.types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getAllGroups,
  getMySupervisorRequests,
  respondToSupervisorRequest,
  deleteGroup,
  removeMember,
} from "@/store/group/groupThunk";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Users,
  FolderGit2,
  AlertCircle,
  ArrowLeft,
  TrendingUp,
  Clock,
  CheckCircle2,
  Sparkles,
  Trash2,
  UserMinus,
  Crown,
} from "lucide-react";
import SupervisorRequestsList from "@/components/groups/SupervisorRequestsList";
import { Project } from "@/components/app/student/StudentProject";
import { checkAuth } from "@/store/auth/authThunk";
import { MilestoneList } from "@/components/milestones/MilestoneList";

// ── Stat Card ───────────────────────────────────────────────────────────────
const StatCard = ({
  label, value, sub, icon: Icon, color, bg, border,
}: {
  label: string; value: React.ReactNode; sub: string;
  icon: React.ElementType; color: string; bg: string; border: string;
}) => (
  <Card className={`border ${border} bg-card/70 backdrop-blur-sm hover:bg-card transition-all duration-200`}>
    <CardContent className="p-5">
      <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-3`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <p className="text-2xl font-bold leading-none mb-1">{value}</p>
      <p className="text-xs font-medium text-foreground/80">{label}</p>
      <p className="text-[11px] text-muted-foreground mt-1">{sub}</p>
    </CardContent>
  </Card>
);

const getInitials = (name?: string) =>
  (name || "?").split(" ").map((w) => w[0] || "").join("").substring(0, 2).toUpperCase();

const SupervisorDashboard = ({ user }: { user: User }) => {
  const dispatch = useAppDispatch();
  const { allGroups, mySupervisorRequests, isLoading } = useAppSelector((state) => state.group);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [removingMember, setRemovingMember] = useState<string | null>(null);
  const [deletingGroup, setDeletingGroup] = useState(false);

  useEffect(() => {
    dispatch(getAllGroups());
    dispatch(getMySupervisorRequests());
  }, [dispatch]);

  // ── Group Detail View ──────────────────────────────────────────────────────
  if (selectedGroup) {
    const groupToView = allGroups.find((g) => g._id === selectedGroup);
    if (groupToView) {
      const handleDeleteGroup = async () => {
        setDeletingGroup(true);
        try {
          await dispatch(deleteGroup(groupToView._id)).unwrap();
          setSelectedGroup(null);
        } finally {
          setDeletingGroup(false);
        }
      };

      const handleRemoveMember = async (studentId: string) => {
        setRemovingMember(studentId);
        try {
          await dispatch(removeMember({ groupId: groupToView._id, studentId })).unwrap();
          // Refresh the view
          dispatch(getAllGroups());
        } finally {
          setRemovingMember(null);
        }
      };

      return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Back + Delete */}
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="ghost" size="sm"
              onClick={() => setSelectedGroup(null)}
              className="gap-2 -ml-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline" size="sm"
                  className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                  disabled={deletingGroup}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Group
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this group?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete <span className="font-semibold text-foreground">"{groupToView.projectDetails.title}"</span> and all its data. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteGroup}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Yes, Delete Group
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="h-10 p-1 w-full max-w-md">
              <TabsTrigger value="overview" className="flex-1 text-sm font-semibold">Project Overview</TabsTrigger>
              <TabsTrigger value="milestones" className="flex-1 text-sm font-semibold">Milestones & Grading</TabsTrigger>
              <TabsTrigger value="members" className="flex-1 text-sm font-semibold">Members</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Project group={groupToView} />
            </TabsContent>

            <TabsContent value="milestones">
              <MilestoneList group={groupToView} isLeader={false} isSupervisor={true} />
            </TabsContent>

            {/* Members Tab */}
            <TabsContent value="members">
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground mb-4">
                  {groupToView.members.length} member{groupToView.members.length !== 1 ? "s" : ""} in this group
                </p>
                {(groupToView.members as any[]).map((member: any) => {
                  const isLeader = (groupToView.leader as any)?._id === member._id ||
                    groupToView.leader === member._id;
                  return (
                    <div
                      key={member._id}
                      className="flex items-center justify-between gap-4 p-3.5 rounded-xl border border-border/50 bg-card/60 hover:bg-card transition-colors"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <Avatar className="h-9 w-9 shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                            {getInitials(member.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="overflow-hidden">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate">{member.fullName}</p>
                            {isLeader && (
                              <Badge className="text-[10px] px-1.5 py-0 h-4 bg-amber-500/10 text-amber-600 border border-amber-500/20 gap-0.5">
                                <Crown className="w-2.5 h-2.5" /> Leader
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                        </div>
                      </div>

                      {!isLeader && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost" size="sm"
                              className="shrink-0 h-7 text-xs gap-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              disabled={!!removingMember}
                            >
                              {removingMember === member._id ? (
                                <span className="text-[11px]">Removing…</span>
                              ) : (
                                <>
                                  <UserMinus className="w-3.5 h-3.5" />
                                  Remove
                                </>
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove {member.fullName}?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will remove <span className="font-semibold text-foreground">{member.fullName}</span> from the group. They will need to be re-invited to rejoin.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRemoveMember(member._id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Remove Member
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      );
    }
  }

  // ── Dashboard Home ─────────────────────────────────────────────────────────
  const activeGroups = allGroups.filter((g) => g.status === "APPROVED" || g.status === "COMPLETED");
  const pendingGrades = allGroups.reduce(
    (acc, g) => acc + (g.milestones || []).filter((m) => m.status === "SUBMITTED").length,
    0
  );
  const quota = user.supervisorProfile?.studentQuota || 5;

  return (
    <div className="space-y-8 pb-8 animate-in fade-in duration-300">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user.fullName.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground text-sm">
          Here's an overview of your supervised projects and pending activity.
        </p>
      </div>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <div className="grid gap-4 grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active Projects" value={activeGroups.length} sub={`${quota - activeGroups.length} slots remaining`}
          icon={FolderGit2} color="text-primary" bg="bg-primary/10" border="border-primary/20" />
        <StatCard label="Pending Requests" value={mySupervisorRequests.length}
          sub={mySupervisorRequests.length > 0 ? "Needs your attention" : "All clear"}
          icon={AlertCircle} color="text-amber-500" bg="bg-amber-500/10" border="border-amber-500/20" />
        <StatCard label="Pending Grades" value={pendingGrades}
          sub={pendingGrades > 0 ? "Submissions awaiting review" : "All reviewed"}
          icon={Clock} color="text-blue-500" bg="bg-blue-500/10" border="border-blue-500/20" />
        <StatCard label="Quota Used" value={`${activeGroups.length}/${quota}`} sub="Supervision capacity"
          icon={TrendingUp} color="text-violet-500" bg="bg-violet-500/10" border="border-violet-500/20" />
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────────────── */}
      <Tabs defaultValue="groups" className="space-y-6">
        <TabsList className="h-10 p-1">
          <TabsTrigger value="groups" className="text-sm font-medium px-4">Supervised Groups</TabsTrigger>
          <TabsTrigger value="requests" className="text-sm font-medium px-4 gap-2">
            Requests
            {mySupervisorRequests.length > 0 && (
              <Badge className="h-5 min-w-5 px-1.5 text-[10px] rounded-full bg-primary text-primary-foreground">
                {mySupervisorRequests.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── Groups Tab ──────────────────────────────────────────────────── */}
        <TabsContent value="groups" className="mt-0">
          {isLoading && allGroups.length === 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-[190px] rounded-2xl border bg-muted/20 animate-pulse" />)}
            </div>
          ) : allGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed rounded-2xl bg-muted/10">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <FolderGit2 className="w-7 h-7 text-primary/40" />
              </div>
              <h3 className="text-base font-semibold">No supervised groups yet</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Accept a group request to start supervising.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {allGroups.map((group) => {
                const pendingCount = (group.milestones || []).filter((m) => m.status === "SUBMITTED").length;
                return (
                  <div
                    key={group._id}
                    onClick={() => setSelectedGroup(group._id)}
                    className="group cursor-pointer rounded-2xl border border-border/60 bg-card/60 hover:bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:border-primary/30 flex flex-col min-h-[190px]"
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <FolderGit2 className="w-4 h-4 text-primary" />
                      </div>
                      <Badge variant="outline" className="text-[10px] shrink-0 bg-background/50">
                        {group.projectDetails.domain}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors mb-1.5">
                      {group.projectDetails.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed flex-1">
                      {group.projectDetails.description}
                    </p>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/40">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Users className="w-3.5 h-3.5" />
                        <span>{group.members.length} members</span>
                      </div>
                      {pendingCount > 0 ? (
                        <Badge className="text-[10px] px-2 bg-amber-500/10 text-amber-600 border border-amber-500/20">
                          {pendingCount} pending
                        </Badge>
                      ) : (
                        <div className="flex items-center gap-1 text-[10px] text-green-600">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Up to date</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ── Requests Tab ─────────────────────────────────────────────────── */}
        <TabsContent value="requests" className="mt-0">
          <SupervisorRequestsList
            requests={mySupervisorRequests as any}
            onRespond={async (payload) => {
              await dispatch(respondToSupervisorRequest(payload)).unwrap();
              dispatch(checkAuth());
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SupervisorDashboard;
