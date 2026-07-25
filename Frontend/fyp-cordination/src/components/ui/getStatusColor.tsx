import { MilestoneStatus } from "@/types/app.types";

export const getStatusColor = (status: MilestoneStatus) => {
  switch (status) {
    case "completed":
      return "bg-green-500/10 text-green-700 dark:text-green-400";
    case "in-progress":
      return "bg-primary/10 text-primary";
    case "upcoming":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-400";
    default:
      return "bg-muted text-muted-foreground";
  }
};
