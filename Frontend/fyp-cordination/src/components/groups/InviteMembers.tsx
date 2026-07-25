"use client";

import { useEffect, useState, useRef } from "react";
import { Search, UserPlus, X, Loader2, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getAvailableStudents, inviteStudent } from "@/store/group/groupThunk";
import { User } from "@/types/auth.types";

interface InviteMembersProps {
  groupId: string;
  currentCount: number;
  requiredCount: number;
}

export const InviteMembers = ({ groupId, currentCount, requiredCount }: InviteMembersProps) => {
  const dispatch = useAppDispatch();
  const { availableStudents, isLoading } = useAppSelector((s) => s.group);
  const [query, setQuery] = useState("");
  const [inviting, setInviting] = useState<string | null>(null);
  const [invitedStudentIds, setInvitedStudentIds] = useState<Set<string>>(new Set());
  const [isFocused, setIsFocused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      dispatch(getAvailableStudents(query));
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

  const spots = requiredCount - currentCount;

  const filtered = availableStudents || [];

  const handleInvite = async (studentId: string) => {
    setInviting(studentId);
    try {
      await dispatch(inviteStudent({ groupId, studentId })).unwrap();
      setInvitedStudentIds((prev) => new Set(prev).add(studentId));
    } finally {
      setInviting(null);
    }
  };

  const getInitials = (name?: string) =>
    (name || "?").split(" ").map((w) => w[0] || "").join("").substring(0, 2).toUpperCase();

  if (spots <= 0) {
    return (
      <div className="flex items-center gap-2 p-4 rounded-lg bg-green-500/5 border border-green-500/20 text-sm text-green-600">
        <Users className="w-4 h-4 shrink-0" />
        <span>Group is full! All {requiredCount} member slots are filled.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 relative" ref={wrapperRef}>
      {/* Spots counter */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {currentCount} / {requiredCount} members &mdash; {spots} spot{spots !== 1 ? "s" : ""} remaining
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onFocus={() => setIsFocused(true)}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search students by name or email…"
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

      {/* Dropdown Results */}
      {isFocused && query.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-card rounded-lg border border-border shadow-lg overflow-hidden max-h-72 flex flex-col">
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Searching students…</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No students match "{query}".
            </div>
          ) : (
            <div className="overflow-y-auto p-2 space-y-1">
              {filtered.map((student: User) => {
                const isInvited = invitedStudentIds.has(student._id);
                return (
                  <div
                    key={student._id}
                    className="flex items-center justify-between px-3 py-2.5 rounded-md hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                          {getInitials(student.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium leading-tight">{student.fullName}</p>
                        <p className="text-xs text-muted-foreground">{student.email}</p>
                      </div>
                    </div>
                    {isInvited ? (
                      <Button size="sm" variant="secondary" className="gap-1.5 h-7 text-xs cursor-default" disabled>
                        <Clock className="w-3 h-3 text-amber-500" />
                        Pending
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 h-7 text-xs"
                        disabled={inviting === student._id}
                        onClick={() => handleInvite(student._id)}
                      >
                        {inviting === student._id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <UserPlus className="w-3 h-3" />
                        )}
                        {inviting === student._id ? "Sending…" : "Invite"}
                      </Button>
                    )}
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

