"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCircle2, X, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getMyInvitations, respondToInvitation } from "@/store/group/groupThunk";
import { checkAuth } from "@/store/auth/authThunk";

interface GroupInvitationsProps {
  /** When true, renders nothing instead of empty state — for embedded use inside dashboards */
  hideWhenEmpty?: boolean;
}

export const GroupInvitations = ({ hideWhenEmpty = false }: GroupInvitationsProps) => {
  const dispatch = useAppDispatch();
  const { myInvitations, isLoading } = useAppSelector((s) => s.group);
  const [responding, setResponding] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    dispatch(getMyInvitations());
  }, [dispatch]);

  const getInitials = (name?: string) =>
    (name || "?").split(" ").map((w) => w[0] || "").join("").substring(0, 2).toUpperCase();

  const handleRespond = async (requestId: string, action: "ACCEPTED" | "REJECTED") => {
    setResponding(requestId + action);
    try {
      await dispatch(respondToInvitation({ requestId, action })).unwrap();
      if (action === "ACCEPTED") {
        setAccepted(true);
        dispatch(checkAuth());
      }
      dispatch(getMyInvitations()); // refresh — after accept, all others become REJECTED server-side
    } finally {
      setResponding(null);
    }
  };

  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (isLoading && myInvitations.length === 0) {
    return (
      <div className="flex items-center justify-center py-6 text-muted-foreground gap-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Checking invitations…</span>
      </div>
    );
  }

  // ── After acceptance, hide entirely ─────────────────────────────────────
  if (accepted || myInvitations.length === 0) {
    if (hideWhenEmpty) return null; // embedded context: render nothing
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
        <Bell className="w-8 h-8 opacity-20" />
        <p className="text-sm">No pending invitations.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {myInvitations.map((inv) => {
        const group = inv.group as any;
        const sender = inv.sender as any;
        return (
          <div
            key={inv._id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 py-3.5 rounded-xl border border-border/50 bg-card/70 hover:bg-card transition-colors shadow-sm"
          >
            <div className="flex items-center gap-3">
              {/* Group icon */}
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight">
                  {group?.projectDetails?.title || "Group Invitation"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Invited by{" "}
                  <span className="font-medium text-foreground">{sender?.fullName}</span>
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {group?.members?.length ?? "?"} / {group?.requiredMembers ?? "?"} members
                  </Badge>
                  {group?.projectDetails?.domain && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {group.projectDetails.domain}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 h-7 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                disabled={!!responding}
                onClick={() => handleRespond(inv._id, "REJECTED")}
              >
                {responding === inv._id + "REJECTED" ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <X className="w-3 h-3" />
                )}
                Decline
              </Button>
              <Button
                size="sm"
                className="gap-1.5 h-7 text-xs"
                disabled={!!responding}
                onClick={() => handleRespond(inv._id, "ACCEPTED")}
              >
                {responding === inv._id + "ACCEPTED" ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3 h-3" />
                )}
                Accept
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
