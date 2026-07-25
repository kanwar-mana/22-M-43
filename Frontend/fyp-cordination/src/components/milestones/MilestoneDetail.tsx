"use client";

import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  FileText,
  Paperclip,
  Star,
  Upload,
  ShieldX,
  Download,
} from "lucide-react";
import { getFileIcon, downloadCloudinaryFile } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Milestone } from "@/types/group.types";
import MilestoneSubmissionForm from "@/components/groups/MilestoneSubmissionForm";
import MilestoneGradingForm from "@/components/app/supervisor/MilestoneGradingForm";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { submitMilestone, gradeMilestone } from "@/store/group/groupThunk";
import { getRowType, formatDate } from "./milestoneUtils";

interface MilestoneDetailProps {
  milestone: Milestone;
  groupId: string;
  isLeader: boolean;
  isSupervisor?: boolean;
  isCoordinator?: boolean;
  groupApproved: boolean;
  onBack: () => void;
  onSubmitSuccess?: () => void;
}

export const MilestoneDetail = ({
  milestone,
  groupId,
  isLeader,
  isSupervisor = false,
  isCoordinator = false,
  groupApproved,
  onBack,
  onSubmitSuccess,
}: MilestoneDetailProps) => {
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((s) => s.group);
  const type = getRowType(milestone);

  const statusBadge = () => {
    if (milestone.status === "APPROVED")
      return (
        <Badge className="bg-green-500/10 text-green-600 border border-green-500/30 gap-1">
          <CheckCircle2 className="w-3 h-3" /> Approved
        </Badge>
      );
    if (milestone.status === "SUBMITTED")
      return (
        <Badge className="bg-blue-500/10 text-blue-600 border border-blue-500/30 gap-1">
          <CheckCircle2 className="w-3 h-3" /> Turned in
        </Badge>
      );
    if (milestone.status === "REJECTED")
      return (
        <Badge className="bg-red-500/10 text-red-600 border border-red-500/30 gap-1">
          <AlertCircle className="w-3 h-3" /> Rejected
        </Badge>
      );
    if (type === "pastdue")
      return (
        <span className="flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="w-3.5 h-3.5" /> Past due
        </span>
      );
    return (
      isLeader && (
        <span className="text-xs text-muted-foreground italic">Not turned in</span>
      )
    );
  };

  return (
    <div className="flex flex-col gap-0 animate-in fade-in slide-in-from-right-4 duration-200">
      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b pb-4 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 -ml-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <div className="flex items-center gap-3">{statusBadge()}</div>
      </div>

      {/* ── Title + due date ─────────────────────────────────────────── */}
      <h1 className="text-2xl md:text-3xl font-bold">{milestone.title}</h1>
      <p className="text-sm text-muted-foreground mt-1 mb-8">
        Due {formatDate(milestone.deadline)}
      </p>

      <div className="grid md:grid-cols-[1fr_220px] gap-8">
        {/* ── Left column ──────────────────────────────────────────── */}
        <div className="space-y-7">
          {/* Instructions */}
          <section>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Instructions
            </p>
            <p className="text-sm">{milestone.description || "None"}</p>
          </section>

          {/* Reference materials */}
          {milestone.documentFiles && milestone.documentFiles.length > 0 && (
            <section>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Reference materials
              </p>
              <div className="space-y-2">
                {milestone.documentFiles.map((file, i) => {
                  const Icon = getFileIcon(file.originalName);
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-2 px-4 py-2.5 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/60 transition-colors"
                    >
                      <button
                        onClick={() => downloadCloudinaryFile(file.cloudinaryUrl, file.originalName)}
                        className="flex items-center gap-2 text-sm text-primary hover:underline flex-1 min-w-0 text-left"
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate max-w-[300px]">{file.originalName}</span>
                      </button>
                      <button
                        onClick={() => downloadCloudinaryFile(file.cloudinaryUrl, file.originalName)}
                        title="Download file"
                        className="p-1.5 hover:bg-muted-foreground/10 rounded-md text-muted-foreground hover:text-foreground transition-colors shrink-0 cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* My Work / Submission */}
          <section>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              {isSupervisor ? "Student Submission" : "My work"}
            </p>

            {(type === "completed" || (milestone.submissionFiles?.length ?? 0) > 0 || milestone.studentMessage) && (
              <div className="space-y-3 mb-6">
                {milestone.submissionFiles && milestone.submissionFiles.length > 0 ? (
                  <div className="space-y-2">
                    {milestone.submissionFiles.map((file, i) => {
                      const Icon = getFileIcon(file.originalName);
                      return (
                        <div
                          key={i}
                          className="flex items-center justify-between gap-2 px-4 py-2.5 rounded-lg border border-green-500/30 bg-green-500/5 transition-colors"
                        >
                          <button
                            onClick={() => downloadCloudinaryFile(file.cloudinaryUrl, file.originalName)}
                            className="flex items-center gap-2 text-sm text-green-600 hover:underline flex-1 min-w-0 text-left"
                          >
                            <Icon className="w-4 h-4 shrink-0" />
                            <span className="truncate">{file.originalName}</span>
                          </button>
                          <button
                            onClick={() => downloadCloudinaryFile(file.cloudinaryUrl, file.originalName)}
                            title="Download file"
                            className="p-1.5 hover:bg-green-500/20 rounded-md text-green-600/80 hover:text-green-700 transition-colors shrink-0 cursor-pointer"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : type === "completed" ? (
                  <p className="text-sm text-muted-foreground">No files attached.</p>
                ) : null}
                {milestone.studentMessage && (
                  <div className="p-3 bg-muted/40 rounded-lg border border-border/50 text-sm italic text-muted-foreground">
                    "{milestone.studentMessage}"
                  </div>
                )}
              </div>
            )}

            {!isSupervisor && !isCoordinator && milestone.remarks && (
              <div className="mb-6 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <p className="text-xs font-semibold text-amber-600 mb-1 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Supervisor Feedback
                </p>
                <p className="text-sm text-amber-700/90 italic">"{milestone.remarks}"</p>
              </div>
            )}

            {isCoordinator && milestone.remarks && (
              <div className="mb-6 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <p className="text-xs font-semibold text-amber-600 mb-1 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Supervisor Feedback
                </p>
                <p className="text-sm text-amber-700/90 italic">"{milestone.remarks}"</p>
              </div>
            )}

            {!isCoordinator && (
              isSupervisor ? (
                <div className="pt-2 border-t border-border/50">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-4 mt-4">
                    Supervisor Action
                  </p>
                  <MilestoneGradingForm
                    milestone={milestone}
                    isLoading={isLoading}
                    onSubmit={async (payload) => {
                      await dispatch(
                        gradeMilestone({ groupId, milestoneId: milestone._id, payload })
                      ).unwrap();
                      onSubmitSuccess?.();
                    }}
                  />
                </div>
              ) : type !== "completed" ? (
                !groupApproved ? (
                  <div className="flex items-center gap-3 p-4 rounded-lg border border-destructive/20 bg-destructive/5 text-sm text-destructive">
                    <ShieldX className="w-4 h-4 shrink-0" />
                    <span>Submissions are locked until your group is approved by a supervisor.</span>
                  </div>
                ) : isLeader ? (
                  <MilestoneSubmissionForm
                    milestone={milestone}
                    isLoading={isLoading}
                    onSubmit={async (payload) => {
                      await dispatch(
                        submitMilestone({ groupId, milestoneId: milestone._id, payload })
                      ).unwrap();
                      onSubmitSuccess?.();
                    }}
                  />
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
                    <Upload className="w-4 h-4" />
                    <span>Only the group leader can submit this milestone.</span>
                  </div>
                )
              ) : null
            )}
          </section>
        </div>

        {/* ── Right column ─────────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-border/50 bg-card/60">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Points / Grade
            </p>
            {milestone.grade ? (
              <div className="flex items-center gap-1.5 text-primary font-bold">
                <Star className="w-4 h-4" />
                {milestone.grade}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Not graded</p>
            )}
          </div>

          <div className="p-4 rounded-xl border border-border/50 bg-card/60">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Status
            </p>
            <Badge
              variant="outline"
              className={
                milestone.status === "APPROVED"
                  ? "bg-green-500/10 text-green-600 border-green-500/30"
                  : milestone.status === "SUBMITTED"
                  ? "bg-blue-500/10 text-blue-600 border-blue-500/30"
                  : milestone.status === "REJECTED"
                  ? "bg-red-500/10 text-red-600 border-red-500/30"
                  : "bg-amber-500/10 text-amber-600 border-amber-500/30"
              }
            >
              {milestone.status}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};
