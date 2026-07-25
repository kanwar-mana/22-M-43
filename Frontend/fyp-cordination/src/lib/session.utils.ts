import { PauseCircle, Flag } from "lucide-react";
import type { Session } from "@/types/session.types";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export function toDate(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value?: string) {
  const date = toDate(value);
  if (!date) return "Not set";
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateRange(startDate?: string, endDate?: string) {
  if (!startDate && !endDate) return "Dates not configured";
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

export function getSessionLifecycle(session: Session) {
  const now = new Date();
  const start = toDate(session.startDate);
  const end = toDate(session.endDate);

  if (start && now < start)
    return { label: "Upcoming", variant: "secondary" as const };
  if (end && now > end)
    return { label: "Completed", variant: "outline" as const };
  return { label: "Active", variant: "default" as const };
}

export function getActivationState(session: Session) {
  if (session.isActive === false) {
    return {
      label: "Paused",
      variant: "secondary" as const,
      icon: PauseCircle,
      muted: true,
    };
  }
  return {
    label: "Active",
    variant: "default" as const,
    icon: Flag,
    muted: false,
  };
}

export function getDurationDays(startDate?: string, endDate?: string) {
  const start = toDate(startDate);
  const end = toDate(endDate);
  if (!start || !end) return "-";
  return `${Math.max(1, Math.ceil((end.getTime() - start.getTime()) / DAY_IN_MS))} days`;
}
