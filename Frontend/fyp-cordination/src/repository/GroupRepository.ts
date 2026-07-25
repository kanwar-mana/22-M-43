import apiClient from "./index";
import { ApiResponse, User } from "@/types/auth.types";
import {
  Group,
  GroupRequest,
  CreateGroupPayload,
  RemoveMemberPayload,
  InviteStudentPayload,
  RespondInvitationPayload,
  SendSupervisorRequestPayload,
  RespondSupervisorRequestPayload,
  SubmitMilestonePayload,
  GradeMilestonePayload,
  UpdateGroupPayload,
} from "@/types/group.types";

const GROUP_BASE = "/groups";

export default {
  // Create a new group
  createGroup(payload: CreateGroupPayload) {
    return apiClient.post<ApiResponse<Group>>(`${GROUP_BASE}/create-group`, payload);
  },

  // Update group details
  updateGroupDetails(payload: UpdateGroupPayload) {
    const { groupId, ...updateData } = payload;
    return apiClient.put<ApiResponse<Group>>(`${GROUP_BASE}/${groupId}/update`, updateData);
  },

  // Get all groups (Coordinator)
  getAllGroups() {
    return apiClient.get<ApiResponse<Group[]>>(`${GROUP_BASE}/all-groups`);
  },

  // Get available students to invite
  getAvailableStudents(search?: string) {
    return apiClient.get<ApiResponse<User[]>>(`${GROUP_BASE}/available-students`, { params: { search } });
  },

  // Get current student's pending group invitations
  getMyInvitations() {
    return apiClient.get<ApiResponse<GroupRequest[]>>(`${GROUP_BASE}/my-invitations`);
  },

  // Get group details by ID
  getGroup(groupId: string) {
    return apiClient.get<ApiResponse<Group>>(`${GROUP_BASE}/${groupId}`);
  },

  // Delete a group
  deleteGroup(groupId: string) {
    return apiClient.delete<ApiResponse<null>>(`${GROUP_BASE}/delete-group/${groupId}`);
  },

  // Remove a member from the group (Leader or Supervisor)
  removeMember(payload: RemoveMemberPayload) {
    return apiClient.post<ApiResponse<Group>>(`${GROUP_BASE}/remove-member`, payload);
  },

  // Leave a group
  leaveGroup(groupId: string) {
    return apiClient.post<ApiResponse<Group>>(`${GROUP_BASE}/leave-group/${groupId}`);
  },

  // Cancel supervisor request (Leader)
  cancelSupervisorRequest(requestId: string) {
    return apiClient.delete<ApiResponse<null>>(`${GROUP_BASE}/cancel-supervisor-request/${requestId}`);
  },

  // Invite student to group
  inviteStudent(payload: InviteStudentPayload) {
    return apiClient.post<ApiResponse<GroupRequest>>(`${GROUP_BASE}/invite-student`, payload);
  },

  // Respond to group invitation
  respondToInvitation(payload: RespondInvitationPayload) {
    return apiClient.post<ApiResponse<Group | GroupRequest>>(`${GROUP_BASE}/respond-invitation`, payload);
  },

  // Get available supervisors (Leader)
  getSupervisors(search?: string) {
    return apiClient.get<ApiResponse<User[]>>(`${GROUP_BASE}/supervisors`, { params: { search } });
  },

  // Send request to supervisor
  sendSupervisorRequest(payload: SendSupervisorRequestPayload) {
    return apiClient.post<ApiResponse<GroupRequest>>(`${GROUP_BASE}/send-supervisor-request`, payload);
  },

  // Get supervisor requests (Supervisor)
  getMySupervisorRequests() {
    return apiClient.get<ApiResponse<GroupRequest[]>>(`${GROUP_BASE}/my-supervisor-requests`);
  },

  // Get supervisor requests sent by the logged-in leader (Student/Leader)
  getMySentSupervisorRequests() {
    return apiClient.get<ApiResponse<GroupRequest[]>>(`${GROUP_BASE}/my-sent-supervisor-requests`);
  },

  // Respond to supervisor request
  respondToSupervisorRequest(payload: RespondSupervisorRequestPayload) {
    return apiClient.post<ApiResponse<Group | GroupRequest>>(`${GROUP_BASE}/respond-supervisor-request`, payload);
  },

  // Submit a milestone
  submitMilestone(groupId: string, milestoneId: string, payload: SubmitMilestonePayload) {
    return apiClient.post<ApiResponse<Group>>(`${GROUP_BASE}/${groupId}/milestones/${milestoneId}/submit`, payload);
  },

  // Grade a milestone
  gradeMilestone(groupId: string, milestoneId: string, payload: GradeMilestonePayload) {
    return apiClient.post<ApiResponse<Group>>(`${GROUP_BASE}/${groupId}/milestones/${milestoneId}/grade`, payload);
  },

  // Assign internal evaluator
  assignInternalEvaluator: (groupId: string, payload: { internalEvaluatorId: string | null }) => {
    return apiClient.patch<ApiResponse<Group>>(`${GROUP_BASE}/${groupId}/assign-evaluator`, payload);
  },
};
