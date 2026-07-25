import { CloudinaryFile } from "./group.types";

export interface SessionMilestone {
  _id?: string;
  id?: string;
  title: string;
  dueDate: string;
  description: string;
  status?: string;
  documentFiles?: CloudinaryFile[];
}

export interface SessionSettings {
  maxGroupSize?: number;
  minGroupSize?: number;
  groupsPerSupervisor?: number;
}

export interface Session {
  _id?: string;
  id?: string;
  name: string;
  department?: string;
  startDate?: string;
  isActive?: boolean;
  endDate?: string;
  settings?: SessionSettings;
  fypMilestones?: SessionMilestone[];
  maxGroups?: number;
  createdAt?: string;
  updatedAt?: string;
}
