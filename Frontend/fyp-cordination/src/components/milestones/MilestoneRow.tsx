"use client";

import { Lock, CheckCircle2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Milestone } from "@/types/group.types";
import {
  getRowType,
  getInitials,
  colorByType,
  formatDate,
  MilestoneRowType,
} from "./milestoneUtils";

const StatusBadge = ({ type }: { type: MilestoneRowType }) => {
  if (type === "completed")
    return (
      <Badge
        variant="outline"
        className="bg-green-500/10 text-green-500 border-green-500/30 gap-1 text-xs rounded-md"
      >
        <CheckCircle2 className="w-3 h-3" /> Turned in
      </Badge>
    );
  if (type === "pastdue")
    return (
      <Badge
        variant="outline"
        className="bg-destructive/10 text-destructive border-destructive/30 gap-1 text-xs rounded-md"
      >
        <AlertCircle className="w-3 h-3" /> Past due
      </Badge>
    );
  return <span className="text-xs text-muted-foreground">Upcoming</span>;
};

interface MilestoneRowProps {
  milestone: Milestone;
  isLocked: boolean;
  onClick: () => void;
}

export const MilestoneRow = ({ milestone, isLocked, onClick }: MilestoneRowProps) => {
  const type = getRowType(milestone);
  const initials = getInitials(milestone.title);

  return (
    <button
      onClick={onClick}
      disabled={isLocked}
      className={`w-full text-left flex items-center justify-between px-4 py-3.5 rounded-xl border transition-all duration-150 mb-3 ${
        isLocked
          ? "border-border/20 bg-muted/20 opacity-50 cursor-not-allowed"
          : "border-border/40 bg-card/70 hover:border-primary/40 hover:bg-card shadow-sm cursor-pointer"
      }`}
    >
      <div className="flex items-center gap-3.5">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0 ${
            isLocked ? "bg-muted-foreground/30" : colorByType[type]
          }`}
        >
          {isLocked ? <Lock className="w-3.5 h-3.5" /> : initials}
        </div>
        <div className="flex flex-col items-start gap-0.5">
          <h4 className="font-semibold text-sm leading-tight">
            {milestone.title || "Untitled Milestone"}
          </h4>
          <p
            className={`text-xs font-normal ${
              type === "pastdue" && !isLocked
                ? "text-destructive"
                : "text-muted-foreground"
            }`}
          >
            {type === "completed" ? "Submitted" : `Due ${formatDate(milestone.deadline)}`}
          </p>
          {isLocked && (
            <p className="text-[10px] text-muted-foreground">
              Complete the previous milestone first
            </p>
          )}
        </div>
      </div>
      <div className="shrink-0">{!isLocked && <StatusBadge type={type} />}</div>
    </button>
  );
};
