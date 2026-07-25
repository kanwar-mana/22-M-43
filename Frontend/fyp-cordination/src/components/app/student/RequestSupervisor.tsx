"use client";

import { useEffect, useState, useRef } from "react";
import { Loader2, Search, User, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getSupervisors,
  sendSupervisorRequest,
  cancelSupervisorRequest,
  getMySentSupervisorRequests,
} from "@/store/group/groupThunk";
import { User as UserType } from "@/types/auth.types";

interface RequestSupervisorProps {
  groupId: string;
}

export const RequestSupervisor = ({ groupId }: RequestSupervisorProps) => {
  const dispatch = useAppDispatch();
  const { supervisors, isLoading, mySentSupervisorRequests } = useAppSelector((s) => s.group);
  const [query, setQuery] = useState("");
  const [requesting, setRequesting] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(getMySentSupervisorRequests());
  }, [dispatch]);

  useEffect(() => {
    const handler = setTimeout(() => {
      dispatch(getSupervisors(query));
    }, 300);
    return () => clearTimeout(handler);
  }, [dispatch, query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = supervisors || [];

  const handleRequest = async (supervisorId: string) => {
    setRequesting(supervisorId);
    try {
      await dispatch(sendSupervisorRequest({ groupId, supervisorId })).unwrap();
      // Refresh sent requests so cancel button appears immediately
      dispatch(getMySentSupervisorRequests());
      setIsFocused(false);
      setQuery("");
    } finally {
      setRequesting(null);
    }
  };

  const handleCancel = async (requestId: string) => {
    setCancelling(true);
    try {
      await dispatch(cancelSupervisorRequest(requestId)).unwrap();
      // Slice already removes it optimistically, but re-fetch to be safe
      dispatch(getMySentSupervisorRequests());
    } finally {
      setCancelling(false);
    }
  };

  const getInitials = (name?: string) =>
    (name || "?").split(" ").map((w) => w[0] || "").join("").substring(0, 2).toUpperCase();

  // Find a pending request sent FOR this specific group
  const pendingRequest = mySentSupervisorRequests.find(
    (r: any) => (r.group?._id || r.group) === groupId && r.status === "PENDING"
  );

  if (pendingRequest) {
    const supervisorName = (pendingRequest as any).receiver?.fullName || "the supervisor";
    return (
      <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
        <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-amber-600">Request Pending</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Awaiting response from <span className="font-medium text-foreground">{supervisorName}</span>.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="shrink-0 h-7 text-xs gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
          disabled={cancelling}
          onClick={() => handleCancel((pendingRequest as any)._id)}
        >
          {cancelling ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <X className="w-3 h-3" />
          )}
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 relative" ref={wrapperRef}>
      <p className="text-xs text-muted-foreground">
        Select a supervisor from your department to oversee your project.
      </p>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={query}
          onFocus={() => setIsFocused(true)}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search supervisors by name or email…"
          className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border/50 bg-background focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 placeholder:text-muted-foreground"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {isFocused && query.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-card rounded-xl border border-border shadow-xl overflow-hidden max-h-72 flex flex-col">
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading supervisors…</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No supervisors match "{query}".
            </div>
          ) : (
            <div className="overflow-y-auto p-2 space-y-1">
              {filtered.map((supervisor: UserType) => {
                const quota = supervisor.supervisorProfile?.studentQuota || 5;
                const currentGroups = supervisor.supervisorProfile?.groups?.length || 0;
                const isFull = currentGroups >= quota;

                return (
                  <div
                    key={supervisor._id}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
                      isFull ? "opacity-60" : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                          {getInitials(supervisor.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium leading-tight">{supervisor.fullName}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-muted-foreground">
                            {currentGroups}/{quota} groups
                          </p>
                          <Badge
                            variant="outline"
                            className={`text-[9px] px-1.5 py-0 ${
                              isFull
                                ? "border-destructive/30 text-destructive"
                                : "border-green-500/30 text-green-600"
                            }`}
                          >
                            {isFull ? "Full" : "Available"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 h-7 text-xs"
                      disabled={isFull || requesting === supervisor._id}
                      onClick={() => handleRequest(supervisor._id)}
                    >
                      {requesting === supervisor._id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <User className="w-3 h-3" />
                      )}
                      {isFull ? "Full" : "Request"}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
