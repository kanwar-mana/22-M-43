"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, X, MessageSquare, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Milestone } from "@/types/group.types";

interface MilestoneGradingFormProps {
  milestone: Milestone;
  isLoading: boolean;
  onSubmit: (payload: { action: "APPROVED" | "REJECTED"; remarks: string; grade?: number }) => Promise<void>;
}

export default function MilestoneGradingForm({ milestone, isLoading, onSubmit }: MilestoneGradingFormProps) {
  const [remarks, setRemarks] = useState(milestone.remarks || "");
  const [grade, setGrade] = useState<string>(milestone.grade?.toString() || "");
  const [actionLoading, setActionLoading] = useState<"APPROVED" | "REJECTED" | null>(null);

  const handleSubmit = async (action: "APPROVED" | "REJECTED") => {
    setActionLoading(action);
    try {
      await onSubmit({
        action,
        remarks,
        ...(grade && !isNaN(Number(grade)) ? { grade: Number(grade) } : {}),
      });
    } finally {
      setActionLoading(null);
    }
  };

  const busy = isLoading || !!actionLoading;

  if (milestone.status === "PENDING") {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-muted/20 text-sm text-muted-foreground">
        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
          <MessageSquare className="w-4 h-4 text-muted-foreground/50" />
        </div>
        <p>This milestone has not been submitted by the students yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-border/50 bg-card/60 p-5">
      <div className="grid sm:grid-cols-[1fr_200px] gap-4">
        {/* Remarks */}
        <div className="space-y-1.5">
          <Label htmlFor="remarks" className="flex items-center gap-1.5 text-sm font-medium">
            <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
            Feedback / Remarks
          </Label>
          <Textarea
            id="remarks"
            placeholder="Provide constructive feedback for this milestone submission..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="resize-none min-h-[110px] text-sm"
            disabled={busy}
          />
        </div>

        {/* Grade */}
        <div className="space-y-1.5">
          <Label htmlFor="grade" className="flex items-center gap-1.5 text-sm font-medium">
            <Star className="w-3.5 h-3.5 text-muted-foreground" />
            Grade <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Input
            id="grade"
            type="number"
            placeholder="e.g. 85"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            disabled={busy}
            className="text-sm"
          />
          {milestone.grade && (
            <p className="text-[11px] text-muted-foreground">
              Previously graded: <span className="font-semibold text-primary">{milestone.grade}</span>
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 pt-1">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
          disabled={busy}
          onClick={() => handleSubmit("REJECTED")}
        >
          {actionLoading === "REJECTED" ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <X className="w-3.5 h-3.5" />
          )}
          Request Revisions
        </Button>
        <Button
          size="sm"
          className="gap-1.5 bg-green-600 hover:bg-green-700 text-white"
          disabled={busy}
          onClick={() => handleSubmit("APPROVED")}
        >
          {actionLoading === "APPROVED" ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5" />
          )}
          Approve Milestone
        </Button>
      </div>
    </div>
  );
}
