import { Badge } from "@/components/ui/badge";
import { Check, Clock, Target } from "lucide-react";
import { MilestoneStatus, Milestone } from "@/types/app.types";
import { getStatusColor } from "../components/ui/getStatusColor";

const TimelineIcon = ({ status }: { status: MilestoneStatus }) => {
  if (status === "completed") {
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white shadow-md ring-4 ring-green-500/20">
        <Check className="w-4 h-4" strokeWidth={3} />
      </div>
    );
  }
  if (status === "in-progress") {
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground shadow-md ring-4 ring-primary/20 animate-pulse">
        <Clock className="w-4 h-4" />
      </div>
    );
  }
  if (status === "upcoming") {
    return (
      <div className="w-8 h-8 rounded-full bg-primary/20 border-[3px] border-primary shadow-md ring-4 ring-primary/10" />
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-muted border-[3px] border-muted-foreground/30 shadow-sm" />
  );
};

export const ProjectTimeline = ({
  milestones,
}: {
  milestones: Milestone[];
}) => {
  return (
    <div className=" p-6">
      <div className="flex items-center gap-2 mb-6">
        <Target className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold">Project Timeline</h2>
      </div>
      <div className="relative">
        {milestones.map((milestone, index) => (
          <div
            key={milestone.id}
            className="relative flex gap-4 pb-8 last:pb-0"
          >
            {/* Vertical Line */}
            {index < milestones.length - 1 && (
              <div
                className={`absolute left-[15px] top-8 w-0.5 h-[calc(100%-16px)] ${
                  milestone.status === "completed"
                    ? "bg-linear-to-b from-green-500 to-green-500/50"
                    : milestone.status === "in-progress"
                    ? "bg-linear-to-b from-primary to-muted-foreground/20"
                    : "bg-muted-foreground/20"
                }`}
              />
            )}

            {/* Icon */}
            <div className="relative z-10 shrink-0">
              <TimelineIcon status={milestone.status} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 bg-muted/40 rounded-lg p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-sm font-medium text-muted-foreground">
                  {milestone.date}
                </span>
                <Badge
                  variant="secondary"
                  className={getStatusColor(milestone.status)}
                >
                  {milestone.status === "in-progress"
                    ? "In Progress"
                    : milestone.status.charAt(0).toUpperCase() +
                      milestone.status.slice(1)}
                </Badge>
              </div>
              <h3 className="font-semibold text-foreground">
                {milestone.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {milestone.description}
              </p>
              {milestone.deliverables && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {milestone.deliverables.map((deliverable, i) => (
                    <span
                      key={i}
                      className="text-xs bg-background px-2 py-1 rounded-md border border-border"
                    >
                      {deliverable}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
