"use client";

import {
  Calendar,
  Users,
  User,
  GitBranch,
  Cpu,
  Clock,
  CheckCircle2,
  UserPlus,
  Trash2,
  Loader2,
  LogOut,
  UserMinus,
  ShieldQuestion,
  AlertTriangle,
  ClipboardCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Group } from "@/types/group.types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { formatDate } from "@/components/milestones/milestoneUtils";
import { InviteMembers } from "@/components/groups/InviteMembers";
import { RequestSupervisor } from "@/components/app/student/RequestSupervisor";
import { removeMember, leaveGroup, deleteGroup } from "@/store/group/groupThunk";
import { EditGroupDialog } from "@/components/groups/EditGroupDialog";
import { checkAuth } from "@/store/auth/authThunk";
import { useState } from "react";
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

// ─── Shared section card ────────────────────────────────────────────────────
const InfoCard = ({
  title,
  icon,
  children,
  headerAction,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
}) => (
  <div className="bg-card rounded-xl border border-border/50 shadow-sm p-5 flex flex-col gap-3">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wide">{title}</span>
      </div>
      {headerAction}
    </div>
    {children}
  </div>
);

// ─── Initials helper ───────────────────────────────────────────────────────
const initials = (name?: string) =>
  (name || "?")
    .split(" ")
    .map((w) => w[0] || "")
    .join("")
    .substring(0, 2)
    .toUpperCase();

// ─── Status badge config ───────────────────────────────────────────────────
const statusStyle = (status: string) => {
  switch (status) {
    case "APPROVED": return "text-green-600 border-green-500/30 bg-green-500/10";
    case "REJECTED": return "text-red-600 border-red-500/30 bg-red-500/10";
    case "COMPLETED": return "text-blue-600 border-blue-500/30 bg-blue-500/10";
    default: return "text-amber-600 border-amber-500/30 bg-amber-500/10";
  }
};

// ─── Main component ────────────────────────────────────────────────────────
export const Project = ({ group }: { group: Group }) => {
  const { user } = useAppSelector((s) => s.auth);
  const { mySentSupervisorRequests } = useAppSelector((s) => s.group); 
  const dispatch = useAppDispatch();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isLeader = user?.role === "student" && user._id === group.leader?._id;
  const isSupervisor = user?.role === "supervisor" && user._id === group.supervisor?._id;
  const groupNotFull = group.members.length < group.requiredMembers;
  const isPendingSupervisor = group.status === "PENDING_SUPERVISOR";
  const isRejected = group.status === "REJECTED";

  const canInvite = isLeader && groupNotFull && isPendingSupervisor;
  const canRequestSupervisor = isLeader && !groupNotFull && (isPendingSupervisor || isRejected);
  const canDeleteGroup = isLeader && (isPendingSupervisor || isRejected);

  const rejectedRequest = mySentSupervisorRequests
    ?.filter((r: any) => (r.group?._id || r.group) === group._id && r.status === "REJECTED")
    ?.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())?.[0];

  const approvedRequest = mySentSupervisorRequests
    ?.filter((r: any) => (r.group?._id || r.group) === group._id && r.status === "ACCEPTED")
    ?.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())?.[0];

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleRemove = async (studentId: string) => {
    setLoadingAction(`remove-${studentId}`);
    try {
      await dispatch(removeMember({ groupId: group._id, studentId })).unwrap();
      if (studentId === user?._id) dispatch(checkAuth());
    } finally {
      setLoadingAction(null);
    }
  };

  const handleLeave = async () => {
    setLoadingAction("leave");
    try {
      await dispatch(leaveGroup(group._id)).unwrap();
      dispatch(checkAuth());
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDeleteGroup = async () => {
    setLoadingAction("delete");
    try {
      await dispatch(deleteGroup(group._id)).unwrap();
      dispatch(checkAuth());
    } finally {
      setLoadingAction(null);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full pb-10">

      {/* ── Page header ───────────────────────────────────────────── */}
      <div>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-bold">{group.projectDetails.title}</h1>
            <Badge variant="outline" className={`mt-0.5 ${statusStyle(group.status)}`}>
              {group.status.replace(/_/g, " ")}
            </Badge>
          </div>

          {/* Edit Group / Delete Group — shown for leader only when deletable */}
          {canDeleteGroup && (
            <div className="flex items-center gap-2">
              <EditGroupDialog group={group} />
              
              <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
                <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Group
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="w-5 h-5" />
                    Are you absolutely sure?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your group
                    and remove all members.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={loadingAction === "delete"}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground! hover:bg-destructive/90"
                    disabled={loadingAction === "delete"}
                    onClick={(e) => {
                      e.preventDefault();
                      handleDeleteGroup();
                    }}
                  >
                    {loadingAction === "delete" ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Deleting...
                      </>
                    ) : (
                      "Delete Group"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>

        <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
          {group.projectDetails.description}
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          <Badge variant="outline" className="gap-1">
            <GitBranch className="w-3 h-3" /> {group.projectDetails.domain}
          </Badge>
          {group.projectDetails.technologies.map((tech, i) => (
            <Badge key={i} variant="secondary" className="gap-1">
              <Cpu className="w-3 h-3" /> {tech}
            </Badge>
          ))}
        </div>

        {/* Rejection notice */}
        {isRejected && (
          <div className="mt-4 p-3 rounded-lg bg-red-500/5 border border-red-500/20 text-sm text-red-600">
            <div className="flex gap-2 mb-1">
              <span className="font-semibold">Rejected.</span> 
              <span>Your supervisor request was rejected.</span>
            </div>
            {rejectedRequest?.remarks && (
              <div className="mb-2 pl-3 border-l-2 border-red-500/30 text-red-700/90 italic">
                "{rejectedRequest.remarks}"
              </div>
            )}
            <div className="text-red-500/80">
              {isLeader
                ? "You can invite members and send a new supervisor request."
                : "Please contact your group leader for next steps."}
            </div>
          </div>
        )}

        {/* Approval remarks */}
        {group.status !== "PENDING_SUPERVISOR" && group.status !== "REJECTED" && group.status !== "DRAFT" && approvedRequest?.remarks && (
          <div className="mt-4 p-3 rounded-lg bg-green-500/5 border border-green-500/20 text-sm text-green-700">
            <div className="flex items-center gap-2 mb-1 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Supervisor Remarks
            </div>
            <div className="pl-6 italic text-green-700/90">
              "{approvedRequest.remarks}"
            </div>
          </div>
        )}
      </div>

      {/* ── Info cards ─────────────────────────────────────────────── */}
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Supervisor */}
        <InfoCard title="Supervisor" icon={<User className="w-3.5 h-3.5" />}>
          {group.supervisor ? (
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                  {initials(group.supervisor.fullName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-medium leading-tight truncate">{group.supervisor.fullName}</p>
                <p className="text-xs text-muted-foreground truncate">{group.supervisor.email}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">Not assigned yet.</p>
          )}
        </InfoCard>

        {/* Internal Evaluator */}
        <InfoCard title="Internal Evaluator" icon={<ClipboardCheck className="w-3.5 h-3.5" />}>
          {group.internalEvaluator ? (
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                  {initials(group.internalEvaluator.fullName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-medium leading-tight truncate">{group.internalEvaluator.fullName}</p>
                <p className="text-xs text-muted-foreground truncate">{group.internalEvaluator.email}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">Not assigned yet.</p>
          )}
        </InfoCard>

        {/* Session */}
        <InfoCard title="Session" icon={<Calendar className="w-3.5 h-3.5" />}>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Start</span>
              <span className="font-medium">{formatDate(group.session?.startDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">End</span>
              <span className="font-medium">{formatDate(group.session?.endDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Session</span>
              <span className="font-medium truncate max-w-[120px]">
                {group.session?.name || "—"}
              </span>
            </div>
          </div>
        </InfoCard>

        {/* Team */}
        <InfoCard
          title={`Team (${group.members.length}/${group.requiredMembers})`}
          icon={<Users className="w-3.5 h-3.5" />}
        >
          <div className="flex flex-col gap-2">
            {group.members.map((member) => {
              const isMe = member._id === user?._id;
              const isMemberLeader = member._id === group.leader._id;
              const canRemove =
                (!isMemberLeader) &&
                ((isLeader && (isPendingSupervisor || isRejected)) || isSupervisor);
              const canLeave = !isLeader && isMe && (isPendingSupervisor || isRejected);

              return (
                <div key={member._id} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar className="h-7 w-7 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                        {initials(member.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col leading-none min-w-0">
                      <span className="text-sm font-medium truncate">{member.fullName || "Unknown"}</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {isMemberLeader && (
                          <span className="text-[10px] text-amber-500 font-medium">Leader</span>
                        )}
                        {isMe && (
                          <span className="text-[10px] text-muted-foreground">(you)</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {canRemove && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:bg-destructive/10"
                        title="Remove member"
                        disabled={!!loadingAction}
                        onClick={() => handleRemove(member._id)}
                      >
                        {loadingAction === `remove-${member._id}` ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <UserMinus className="w-3.5 h-3.5" />
                        )}
                      </Button>
                    )}
                    {canLeave && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-destructive hover:bg-destructive/10 gap-1"
                        disabled={!!loadingAction}
                        onClick={handleLeave}
                      >
                        {loadingAction === "leave" ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <LogOut className="w-3 h-3" />
                        )}
                        Leave
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </InfoCard>
      </div>

      {/* ── Invite Members (leader only, group not full, PENDING_SUPERVISOR) ── */}
      {canInvite && (
        <InfoCard title="Invite Members" icon={<UserPlus className="w-3.5 h-3.5" />}>
          <InviteMembers
            groupId={group._id}
            currentCount={group.members.length}
            requiredCount={group.requiredMembers}
          />
        </InfoCard>
      )}

      {/* ── Request Supervisor (leader only, group full, PENDING or REJECTED) ── */}
      {canRequestSupervisor && (
        <InfoCard title="Request Supervisor" icon={<ShieldQuestion className="w-3.5 h-3.5" />}>
          <RequestSupervisor groupId={group._id} />
        </InfoCard>
      )}

      <Separator />

      {/* ── Milestone timeline ─────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Milestone Timeline
          </h2>
        </div>

        {!(group.session?.fypMilestones?.length) ? (
          <p className="text-sm text-muted-foreground">No milestones set by the coordinator yet.</p>
        ) : (
          <div className="relative space-y-5">
            {(group.session?.fypMilestones || []).map((sm, idx) => {
              const mp = group.milestones?.find(
                (p) => p.title === sm.title || p._id === sm._id
              );
              const isApproved = mp?.status === "APPROVED";
              const isSubmitted = mp?.status === "SUBMITTED";
              const isPastDue = !isApproved && !isSubmitted && new Date(sm.dueDate) < new Date();

              return (
                <div key={sm._id || idx} className="relative flex items-start gap-4">
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
                    {isApproved && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <p className="text-sm font-semibold">{sm.title}</p>
                      <span
                        className={`text-xs ${
                          isPastDue ? "text-destructive" : "text-muted-foreground"
                        }`}
                      >
                        {formatDate(sm.dueDate)}
                      </span>
                    </div>
                    {sm.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{sm.description}</p>
                    )}
                    <div className="mt-1">
                      {isApproved ? (
                        <Badge variant="outline" className="text-[10px] bg-green-500/10 text-green-600 border-green-500/30">
                          Approved
                        </Badge>
                      ) : isSubmitted ? (
                        <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-600 border-blue-500/30">
                          Under Review
                        </Badge>
                      ) : isPastDue ? (
                        <Badge variant="outline" className="text-[10px] bg-destructive/10 text-destructive border-destructive/30">
                          Past Due
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] bg-muted text-muted-foreground">
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
