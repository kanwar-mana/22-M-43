"use client";

import { useEffect, useState } from "react";
import {
  FolderGit2,
  CheckCircle2,
  Flag,
  AlertCircle,
  Clock,
  Bell,
} from "lucide-react";
import { User } from "@/types/auth.types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getGroup, createGroup, getMyInvitations } from "@/store/group/groupThunk";
import { getSessions } from "@/store/session/sessionThunk";
import { checkAuth } from "@/store/auth/authThunk";
import CreateGroupForm from "@/components/groups/CreateGroupForm";
import { CreateGroupPayload } from "@/types/group.types";
import { CalendarX } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/components/milestones/milestoneUtils";
import { GroupInvitations } from "@/components/groups/GroupInvitations";

// ─── Stat card (only lives on the dashboard) ──────────────────────────────
const StatCard = ({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  accent: string;
}) => (
  <div
    className={`bg-card rounded-xl border-l-4 border border-border/50 shadow-sm p-4 transition-all hover:-translate-y-0.5 hover:shadow-md ${accent}`}
  >
    <div className="flex items-center justify-between mb-2 text-muted-foreground">
      <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
      {icon}
    </div>
    {value}
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────
const StudentDashboard = ({ user }: { user: User }) => {
  const dispatch = useAppDispatch();
  const { currentGroup,myInvitations, isLoading } = useAppSelector((state) => state.group);
  const { sessions } = useAppSelector((state) => state.session);
  const [isFetchingSessions, setIsFetchingSessions] = useState(true);

  const groupId = user?.studentProfile?.group;

  useEffect(() => {
    if (groupId && !currentGroup) {
      dispatch(getGroup(groupId));
      setIsFetchingSessions(false);
    } else if (!groupId && sessions.length === 0) {
      dispatch(getSessions()).finally(() => setIsFetchingSessions(false));
    } else {
      setIsFetchingSessions(false);
    }
  }, [groupId, dispatch, sessions.length, currentGroup]);

  const handleCreateGroup = async (payload: CreateGroupPayload) => {
    await dispatch(createGroup(payload)).unwrap();
    dispatch(checkAuth());
  };
  useEffect(() => {
      dispatch(getMyInvitations());
  }, [dispatch]);

  // ── No group yet ──────────────────────────────────────────────────────
  if (!groupId && !currentGroup) {
    return (
      <div className="flex flex-col gap-6 w-full mt-6">
        <div className="text-center mb-2">
          <h1 className="text-3xl font-bold">Welcome, {user.fullName}!</h1>
          <p className="text-muted-foreground mt-2">
            You are not part of any group yet.
          </p>
        </div>

        {/* Pending invitations */}
        {myInvitations.length > 0 && (
          <div className="bg-card rounded-xl border border-border/50 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4 text-muted-foreground">
              <Bell className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">Group Invitations</span>
            </div>
            <GroupInvitations />
          </div>
        )}

        {isFetchingSessions ? (
          <div className="p-12 text-center text-muted-foreground animate-pulse">
            Checking for active sessions...
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 mt-4">
            <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-primary/10">
              <CalendarX className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">No Active Session Found</h3>
            <p className="max-w-md font-light mt-2 text-center text-muted-foreground">
              Your department coordinator has not created or activated an FYP
              session yet. You will be able to create your group once a session
              is live.
            </p>
          </div>
        ) : (
          <CreateGroupForm
            sessions={sessions}
            onSubmit={handleCreateGroup}
            isLoading={isLoading}
          />
        )}
      </div>
    );
  }

  // ── Loading ───────────────────────────────────────────────────────────
  if (groupId && !currentGroup) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-[50vh] text-muted-foreground">
        <Spinner className="size-8 mb-4 text-primary" />
        <p className="text-sm">Loading your project details...</p>
      </div>
    );
  }

  // ── Has group ─────────────────────────────────────────────────────────
  const group = currentGroup!;
  const milestones = group.milestones || [];
  const approvedCount = milestones.filter((m) => m.status === "APPROVED").length;
  const totalCount = group.session?.fypMilestones?.length || 0;
  const progressPercent =
    totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0;
  const nextMilestone = milestones.find(
    (m) => m.status === "PENDING" || m.status === "REJECTED"
  );

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      {/* ── Greeting ────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">
          Welcome back, {user.fullName.split(" ")[0]}!
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Here's a snapshot of your FYP progress.
        </p>
      </div>

      {/* ── Stat cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Progress"
          accent="border-l-primary"
          icon={<FolderGit2 className="w-4 h-4 text-primary" />}
          value={<p className="text-2xl font-bold text-primary">{progressPercent}%</p>}
        />
        <StatCard
          label="Approved"
          accent="border-l-green-500"
          icon={<CheckCircle2 className="w-4 h-4 text-green-500" />}
          value={<p className="text-2xl font-bold">{approvedCount}</p>}
        />
        <StatCard
          label="Next Milestone"
          accent="border-l-amber-500"
          icon={<Flag className="w-4 h-4 text-amber-500" />}
          value={
            <p className="text-sm font-semibold line-clamp-2 leading-tight mt-1">
              {nextMilestone ? nextMilestone.title : "All done 🎉"}
            </p>
          }
        />
        <StatCard
          label="Milestone Status"
          accent="border-l-purple-500"
          icon={<AlertCircle className="w-4 h-4 text-purple-500" />}
          value={
            nextMilestone ? (
              <Badge
                variant="outline"
                className={`mt-1 text-xs ${
                  nextMilestone.status === "REJECTED"
                    ? "border-red-500/30 text-red-600 bg-red-500/10"
                    : "border-amber-500/30 text-amber-600 bg-amber-500/10"
                }`}
              >
                {nextMilestone.status}
              </Badge>
            ) : (
              <span className="text-sm text-muted-foreground">N/A</span>
            )
          }
        />
      </div>

      {/* ── Progress bar ────────────────────────────────────────────── */}
      <div className=" p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Overall Progress</h2>
          <span className="text-xl font-bold text-primary">{progressPercent}%</span>
        </div>
        <Progress value={progressPercent} className="h-2 mb-2" />
        <p className="text-xs text-muted-foreground">
          {approvedCount} of {totalCount} milestones approved
        </p>
      </div>



      <Separator />

      {/* ── Milestone hierarchy ──────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Milestone Hierarchy
          </h2>
        </div>

        {totalCount === 0 ? (
          <p className="text-sm text-muted-foreground">
            No milestones set by your coordinator yet.
          </p>
        ) : (
          <div className="relative space-y-5">
            {(group.session?.fypMilestones || []).map((sm, idx) => {
              const mp = milestones.find(
                (p) => p.title === sm.title || p._id === sm._id
              );
              const isApproved = mp?.status === "APPROVED";
              const isSubmitted = mp?.status === "SUBMITTED";
              const isPastDue =
                !isApproved && !isSubmitted && new Date(sm.dueDate) < new Date();

              return (
                  <div
                    key={sm._id || idx}
                    className="relative flex items-start gap-4"
                  >
                  {/* Timeline dot */}
                  <div
                    className={`mt-0.5 w-5 h-5 rounded-full shrink-0 flex items-center justify-center border-2 border-background ${
                      isApproved
                        ? "bg-green-500"
                        : isSubmitted
                        ? "bg-blue-500"
                        : isPastDue
                        ? "bg-destructive"
                        : "bg-muted-foreground/30"
                    }`}
                  >
                    {isApproved && (
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    )}
                  </div>

                  <div className="flex-1 pb-1">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <p className="text-sm font-semibold">{sm.title}</p>
                      <span
                        className={`text-xs ${
                          isPastDue
                            ? "text-destructive"
                            : "text-muted-foreground"
                        }`}
                      >
                        {formatDate(sm.dueDate)}
                      </span>
                    </div>
                    {sm.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {sm.description}
                      </p>
                    )}
                    <div className="mt-1.5">
                      {isApproved ? (
                        <Badge
                          variant="outline"
                          className="text-[10px] bg-green-500/10 text-green-600 border-green-500/30"
                        >
                          Approved
                        </Badge>
                      ) : isSubmitted ? (
                        <Badge
                          variant="outline"
                          className="text-[10px] bg-blue-500/10 text-blue-600 border-blue-500/30"
                        >
                          Under Review
                        </Badge>
                      ) : isPastDue ? (
                        <Badge
                          variant="outline"
                          className="text-[10px] bg-destructive/10 text-destructive border-destructive/30"
                        >
                          Past Due
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-[10px] bg-muted text-muted-foreground"
                        >
                          Pending
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
    </div>
  );
};

export default StudentDashboard;
