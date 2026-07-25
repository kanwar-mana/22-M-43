"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { GroupRequest, RespondSupervisorRequestPayload } from "@/types/group.types";
import { CheckCircle2, X, Loader2, Users, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface SupervisorRequestsListProps {
  requests: GroupRequest[];
  onRespond: (payload: RespondSupervisorRequestPayload) => Promise<void>;
}

export default function SupervisorRequestsList({ requests, onRespond }: SupervisorRequestsListProps) {
  const [remarksMap, setRemarksMap] = useState<Record<string, string>>({});
  const [responding, setResponding] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleAction = async (requestId: string, action: "ACCEPTED" | "REJECTED") => {
    setResponding(requestId + action);
    try {
      await onRespond({ requestId, action, remarks: remarksMap[requestId] });
      // If successful, collapse the expanded view if it was the one we just responded to
      if (expandedId === requestId) {
        setExpandedId(null);
      }
    } finally {
      setResponding(null);
    }
  };

  const handleRemarksChange = (requestId: string, value: string) => {
    setRemarksMap((prev) => ({ ...prev, [requestId]: value }));
  };

  const toggleExpand = (requestId: string) => {
    setExpandedId((prev) => (prev === requestId ? null : requestId));
  };

  const getInitials = (name?: string) =>
    (name || "?").split(" ").map((w) => w[0] || "").join("").substring(0, 2).toUpperCase();

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6 text-primary/40" />
        </div>
        <p className="text-sm">You have no pending requests.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((request) => {
        const group = request.group as any;
        const sender = request.sender as any;
        const isExpanded = expandedId === request._id;

        return (
          <div
            key={request._id}
            className={`flex flex-col rounded-xl border border-border/50 transition-all shadow-sm overflow-hidden ${
              isExpanded ? "bg-card shadow-md border-primary/20" : "bg-card/70 hover:bg-card"
            }`}
          >
            {/* ── Compact Header ─────────────────────────────────────────── */}
            <div
              className="flex items-center justify-between gap-4 px-4 py-3.5 cursor-pointer select-none"
              onClick={() => toggleExpand(request._id)}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div className="overflow-hidden">
                  <h3 className="text-sm font-semibold leading-tight truncate">
                    {group?.projectDetails?.title || "Untitled Project"}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    Requested by <span className="font-medium text-foreground">{sender?.fullName}</span>
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
                      {group?.members?.length ?? 1} / {group?.requiredMembers ?? 3} members
                    </Badge>
                    {group?.projectDetails?.domain && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 truncate">
                        {group.projectDetails.domain}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center shrink-0 text-muted-foreground hover:text-foreground transition-colors p-2">
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>

            {/* ── Expanded Content ───────────────────────────────────────── */}
            {isExpanded && (
              <div className="flex flex-col gap-4 p-4 pt-2 border-t border-border/50 bg-background/50">
                <div className="space-y-4">
                  
                  {/* Description & Technologies */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                      <FileText className="w-3.5 h-3.5" />
                      Project Description
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {group?.projectDetails?.description || "No description provided."}
                    </p>
                    
                    {group?.projectDetails?.technologies?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {group.projectDetails.technologies.map((tech: string, i: number) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-muted border text-muted-foreground">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <Separator className="bg-border/50" />

                  {/* Members List */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                      <Users className="w-3.5 h-3.5" />
                      Group Members
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {group?.members?.map((member: any) => (
                        <div key={member._id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/40 border border-border/30">
                          <Avatar className="h-6 w-6 shrink-0">
                            <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                              {getInitials(member.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="overflow-hidden">
                            <p className="text-xs font-medium truncate">{member.fullName}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{member.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator className="bg-border/50" />

                  {/* Remarks & Actions */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <label htmlFor={`remarks-${request._id}`} className="font-medium">
                        Add Remarks <span className="text-muted-foreground font-normal">(Optional)</span>
                      </label>
                    </div>
                    <Textarea
                      id={`remarks-${request._id}`}
                      placeholder="Share feedback or conditions for accepting/rejecting this request..."
                      value={remarksMap[request._id] || ""}
                      onChange={(e) => handleRemarksChange(request._id, e.target.value)}
                      className="resize-none h-16 text-xs focus-visible:ring-1"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 h-8 text-xs text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                      disabled={!!responding}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction(request._id, "REJECTED");
                      }}
                    >
                      {responding === request._id + "REJECTED" ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <X className="w-3 h-3" />
                      )}
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      className="gap-1.5 h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground"
                      disabled={!!responding}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction(request._id, "ACCEPTED");
                      }}
                    >
                      {responding === request._id + "ACCEPTED" ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-3 h-3" />
                      )}
                      Accept Request
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
