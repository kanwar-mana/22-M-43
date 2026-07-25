import { User } from "./auth.types";
import { Session } from "./session.types";

export type ProjectDomain =
  | "Research"
  | "Web";

export type GroupStatus =
  | "DRAFT"
  | "PENDING_SUPERVISOR"
  | "APPROVED"
  | "REJECTED"
  | "COMPLETED";

export type MilestoneStatus = "PENDING" | "SUBMITTED" | "APPROVED" | "REJECTED";

/** A file stored in Cloudinary, with all info needed to display and download it. */
export interface CloudinaryFile {
  cloudinaryUrl: string;
  publicId: string;
  originalName: string;
}

export interface ProjectDetails {
  title: string;
  description: string;
  domain: ProjectDomain;
  technologies: string[];
  proposalDocument?: string;
}

export interface Milestone {
  _id: string;
  title: string;
  description?: string;
  deadline: string;
  documentFiles?: CloudinaryFile[];
  status: MilestoneStatus;
  submissionFiles?: CloudinaryFile[];
  studentMessage?: string;
  remarks?: string;
  grade?: string;
}

export interface Group {
  _id: string;
  session: Session;
  leader: User;
  department: string;
  members: User[];
  requiredMembers: number;
  supervisor?: User | null;
  internalEvaluator?: User | null;
  projectDetails: ProjectDetails;
  status: GroupStatus;
  milestones: Milestone[];
  createdAt: string;
  updatedAt: string;
}

// Request Models
export type RequestType = "GROUP_INVITATION" | "SUPERVISOR_REQUEST";
export type RequestStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export interface GroupRequest {
  _id: string;
  type: RequestType;
  sender: User;
  receiver: User;
  group: Group;
  status: RequestStatus;
  message?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

// Payloads
export interface CreateGroupPayload {
  sessionId: string;
  requiredMembers: number;
  projectDetails: ProjectDetails;
}

export interface UpdateGroupPayload {
  groupId: string;
  requiredMembers?: number;
  title?: string;
  description?: string;
  domain?: ProjectDomain;
  technologies?: string[];
}

export interface RemoveMemberPayload {
  groupId: string;
  studentId: string;
}

export interface InviteStudentPayload {
  groupId: string;
  studentId: string;
}

export interface RespondInvitationPayload {
  requestId: string;
  action: "ACCEPTED" | "REJECTED";
}

export interface SendSupervisorRequestPayload {
  groupId: string;
  supervisorId: string;
}

export interface RespondSupervisorRequestPayload {
  requestId: string;
  action: "ACCEPTED" | "REJECTED";
  remarks?: string;
}

export interface SubmitMilestonePayload {
  submissionLink: string;
}

export interface GradeMilestonePayload {
  action: "APPROVED" | "REJECTED";
  remarks?: string;
  grade?: string;
}
