import { createAsyncThunk } from "@reduxjs/toolkit";
import RepositoryFactory from "@/repository/RepositoryFactory";
import { toast } from "@/components/ui/use-toast";

const groups = RepositoryFactory.get("groups");

export const createGroup = createAsyncThunk(
  "groups/createGroup",
  async (payload: any, thunkAPI) => {
    try {
      const response = await groups.createGroup(payload);
      toast({
        title: "Success",
        description: "Group created successfully.",
      });
      return response.data.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to create group.",
        variant: "destructive",
      });
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  }
);

export const updateGroupDetails = createAsyncThunk(
  "groups/updateGroupDetails",
  async (payload: any, thunkAPI) => {
    try {
      const response = await groups.updateGroupDetails(payload);
      toast({
        title: "Success",
        description: "Group details updated successfully.",
      });
      return response.data.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to update group.",
        variant: "destructive",
      });
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  }
);

export const getAllGroups = createAsyncThunk(
  "groups/getAllGroups",
  async (_, thunkAPI) => {
    try {
      const response = await groups.getAllGroups();
      return response.data.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  }
);

export const getGroup = createAsyncThunk(
  "groups/getGroup",
  async (groupId: string, thunkAPI) => {
    try {
      const response = await groups.getGroup(groupId);
      return response.data.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  }
);

export const getAvailableStudents = createAsyncThunk(
  "groups/getAvailableStudents",
  async (search: string | undefined, thunkAPI) => {
    try {
      const response = await groups.getAvailableStudents(search);
      return response.data.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  }
);

export const getSupervisors = createAsyncThunk(
  "groups/getSupervisors",
  async (search: string | undefined, thunkAPI) => {
    try {
      const response = await groups.getSupervisors(search);
      return response.data.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  }
);

export const getMyInvitations = createAsyncThunk(
  "groups/getMyInvitations",
  async (_, thunkAPI) => {
    try {
      const response = await groups.getMyInvitations();
      return response.data.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  }
);

export const getMySupervisorRequests = createAsyncThunk(
  "groups/getMySupervisorRequests",
  async (_, thunkAPI) => {
    try {
      const response = await groups.getMySupervisorRequests();
      return response.data.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  }
);

export const deleteGroup = createAsyncThunk(
  "groups/deleteGroup",
  async (groupId: string, thunkAPI) => {
    try {
      await groups.deleteGroup(groupId);
      toast({
        title: "Success",
        description: "Group deleted successfully.",
      });
      return groupId;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to delete group.",
        variant: "destructive",
      });
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  }
);

export const submitMilestone = createAsyncThunk(
  "groups/submitMilestone",
  async ({ groupId, milestoneId, payload }: { groupId: string, milestoneId: string, payload: any }, thunkAPI) => {
    try {
      const response = await groups.submitMilestone(groupId, milestoneId, payload);
      toast({ title: "Success", description: "Milestone submitted successfully." });
      return response.data.data;
    } catch (error: any) {
      toast({ title: "Error", description: error?.response?.data?.message || "Failed to submit milestone.", variant: "destructive" });
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  }
);

export const gradeMilestone = createAsyncThunk(
  "groups/gradeMilestone",
  async ({ groupId, milestoneId, payload }: { groupId: string, milestoneId: string, payload: any }, thunkAPI) => {
    try {
      const response = await groups.gradeMilestone(groupId, milestoneId, payload);
      toast({ title: "Success", description: "Milestone graded successfully." });
      return response.data.data;
    } catch (error: any) {
      toast({ title: "Error", description: error?.response?.data?.message || "Failed to grade milestone.", variant: "destructive" });
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  }
);

export const respondToSupervisorRequest = createAsyncThunk(
  "groups/respondToSupervisorRequest",
  async (payload: any, thunkAPI) => {
    try {
      const response = await groups.respondToSupervisorRequest(payload);
      toast({ title: "Success", description: "Successfully responded to the request." });
      return { payload, data: response.data.data };
    } catch (error: any) {
      toast({ title: "Error", description: error?.response?.data?.message || "Failed to respond to request.", variant: "destructive" });
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  }
);

export const inviteStudent = createAsyncThunk(
  "groups/inviteStudent",
  async (payload: { groupId: string; studentId: string }, thunkAPI) => {
    try {
      const response = await groups.inviteStudent(payload);
      toast({ title: "Invitation Sent", description: "Student has been invited to your group." });
      return response.data.data;
    } catch (error: any) {
      toast({ title: "Error", description: error?.response?.data?.message || "Failed to send invitation.", variant: "destructive" });
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  }
);

export const respondToInvitation = createAsyncThunk(
  "groups/respondToInvitation",
  async (payload: { requestId: string; action: "ACCEPTED" | "REJECTED" }, thunkAPI) => {
    try {
      const response = await groups.respondToInvitation(payload);
      toast({
        title: payload.action === "ACCEPTED" ? "Joined Group!" : "Invitation Declined",
        description: payload.action === "ACCEPTED" ? "You have joined the group successfully." : "Invitation declined.",
      });
      return { action: payload.action, data: response.data.data };
    } catch (error: any) {
      toast({ title: "Error", description: error?.response?.data?.message || "Failed to respond to invitation.", variant: "destructive" });
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  }
);

export const removeMember = createAsyncThunk(
  "groups/removeMember",
  async (payload: { groupId: string; studentId: string }, thunkAPI) => {
    try {
      const response = await groups.removeMember(payload);
      toast({ title: "Success", description: "Member removed successfully." });
      return response.data.data;
    } catch (error: any) {
      toast({ title: "Error", description: error?.response?.data?.message || "Failed to remove member.", variant: "destructive" });
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  }
);

export const leaveGroup = createAsyncThunk(
  "groups/leaveGroup",
  async (groupId: string, thunkAPI) => {
    try {
      const response = await groups.leaveGroup(groupId);
      toast({ title: "Success", description: "You left the group." });
      return response.data.data;
    } catch (error: any) {
      toast({ title: "Error", description: error?.response?.data?.message || "Failed to leave group.", variant: "destructive" });
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  }
);

export const sendSupervisorRequest = createAsyncThunk(
  "groups/sendSupervisorRequest",
  async (payload: { groupId: string; supervisorId: string }, thunkAPI) => {
    try {
      const response = await groups.sendSupervisorRequest(payload);
      toast({ title: "Success", description: "Supervisor request sent successfully." });
      return response.data.data;
    } catch (error: any) {
      toast({ title: "Error", description: error?.response?.data?.message || "Failed to send request.", variant: "destructive" });
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  }
);

export const cancelSupervisorRequest = createAsyncThunk(
  "groups/cancelSupervisorRequest",
  async (requestId: string, thunkAPI) => {
    try {
      await groups.cancelSupervisorRequest(requestId);
      toast({ title: "Success", description: "Request cancelled successfully." });
      return requestId;
    } catch (error: any) {
      toast({ title: "Error", description: error?.response?.data?.message || "Failed to cancel request.", variant: "destructive" });
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  }
);

export const getMySentSupervisorRequests = createAsyncThunk(
  "groups/getMySentSupervisorRequests",
  async (_, thunkAPI) => {
    try {
      const response = await groups.getMySentSupervisorRequests();
      return response.data.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  }
);

export const assignInternalEvaluator = createAsyncThunk(
  "groups/assignInternalEvaluator",
  async (payload: { groupId: string; internalEvaluatorId: string | null }, thunkAPI) => {
    try {
      const response = await groups.assignInternalEvaluator(payload.groupId, { internalEvaluatorId: payload.internalEvaluatorId });
      toast({
        title: "Success",
        description: payload.internalEvaluatorId ? "Internal evaluator assigned successfully." : "Internal evaluator removed.",
      });
      return response.data.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to assign internal evaluator.",
        variant: "destructive",
      });
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  }
);
