import { Milestone } from "@/types/group.types";

// ─── Types ─────────────────────────────────────────────────────────────────
export type MilestoneRowType = "upcoming" | "pastdue" | "completed";

// ─── Helpers ───────────────────────────────────────────────────────────────
export const formatDate = (dateStr?: string) => {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const relativeTime = (dateStr?: string) => {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 0) return `in ${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"}`;
  if (days === 0) return "today";
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months === 1 ? "" : "s"} ago`;
};

export const getInitials = (title: string) =>
  (title || "M")
    .split(" ")
    .map((w) => w[0] || "")
    .join("")
    .substring(0, 2)
    .toUpperCase();

export const getRowType = (m: Milestone): MilestoneRowType => {
  if (m.status === "SUBMITTED" || m.status === "APPROVED") return "completed";
  if (new Date(m.deadline) < new Date()) return "pastdue";
  return "upcoming";
};

export const colorByType: Record<MilestoneRowType, string> = {
  upcoming: "bg-primary/80",
  pastdue: "bg-destructive/80",
  completed: "bg-green-600/80",
};

/** Returns true if milestone at `index` should be locked. */
export const isMilestoneLocked = (milestones: Milestone[], index: number): boolean => {
  if (index === 0) return false;
  const prev = milestones[index - 1];
  return prev.status === "PENDING" || prev.status === "REJECTED";
};
