export type MilestoneStatus =
  | "completed"
  | "in-progress"
  | "upcoming"
  | "pending";

export interface Milestone {
  id: number;
  date: string;
  title: string;
  description: string;
  status: MilestoneStatus;
  deliverables?: string[];
}
export interface TeamMember {
  id: number;
  name: string;
  role: string;
  avatar?: string;
  email: string;
}

export type SubmissionStatus = "submitted" | "pending" | "overdue" | "graded";

export interface Submission {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  submittedDate?: string;
  status: SubmissionStatus;
  grade?: string;
  feedback?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
}
