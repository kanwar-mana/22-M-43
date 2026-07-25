import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Group, GroupRequest } from "@/types/group.types";
import { User } from "@/types/auth.types";
import {
  getAllGroups,
  getGroup,
  getAvailableStudents,
  getSupervisors,
  getMyInvitations,
  getMySupervisorRequests,
  createGroup,
  updateGroupDetails,
  deleteGroup,
  submitMilestone,
  gradeMilestone,
  respondToSupervisorRequest,
  inviteStudent,
  respondToInvitation,
  removeMember,
  leaveGroup,
  sendSupervisorRequest,
  cancelSupervisorRequest,
  getMySentSupervisorRequests,
  assignInternalEvaluator,
} from "./groupThunk";

interface GroupState {
  allGroups: Group[];
  currentGroup: Group | null;
  availableStudents: User[];
  supervisors: User[];
  myInvitations: GroupRequest[];
  mySupervisorRequests: GroupRequest[];
  mySentSupervisorRequests: GroupRequest[];
  isLoading: boolean;
  error: string | null;
}

const initialState: GroupState = {
  allGroups: [],
  currentGroup: null,
  availableStudents: [],
  supervisors: [],
  myInvitations: [],
  mySupervisorRequests: [],
  mySentSupervisorRequests: [],
  isLoading: false,
  error: null,
};

const groupSlice = createSlice({
  name: "groups",
  initialState,
  reducers: {
    clearCurrentGroup: (state) => {
      state.currentGroup = null;
    },
    clearGroupError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // getAllGroups
      .addCase(getAllGroups.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllGroups.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allGroups = action.payload;
      })
      .addCase(getAllGroups.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // getGroup
      .addCase(getGroup.fulfilled, (state, action) => {
        state.currentGroup = action.payload;
      })
      // createGroup
      .addCase(createGroup.fulfilled, (state, action) => {
        state.currentGroup = action.payload;
        state.allGroups.push(action.payload);
      })
      // updateGroupDetails
      .addCase(updateGroupDetails.fulfilled, (state, action) => {
        state.currentGroup = action.payload;
        const index = state.allGroups.findIndex(g => g._id === action.payload._id);
        if (index !== -1) state.allGroups[index] = action.payload;
      })
      // getAvailableStudents
      .addCase(getAvailableStudents.fulfilled, (state, action) => {
        state.availableStudents = action.payload;
      })
      // getSupervisors
      .addCase(getSupervisors.fulfilled, (state, action) => {
        state.supervisors = action.payload;
      })
      // getMyInvitations
      .addCase(getMyInvitations.fulfilled, (state, action) => {
        state.myInvitations = action.payload;
      })
      // getMySupervisorRequests
      .addCase(getMySupervisorRequests.fulfilled, (state, action) => {
        state.mySupervisorRequests = action.payload;
      })
      // deleteGroup
      .addCase(deleteGroup.fulfilled, (state, action) => {
        state.allGroups = state.allGroups.filter(g => g._id !== action.payload);
        if (state.currentGroup?._id === action.payload) {
          state.currentGroup = null;
        }
      })
      // submit & grade milestone
      .addCase(submitMilestone.fulfilled, (state, action) => {
        state.currentGroup = action.payload;
        const index = state.allGroups.findIndex(g => g._id === action.payload._id);
        if (index !== -1) state.allGroups[index] = action.payload;
      })
      .addCase(gradeMilestone.fulfilled, (state, action) => {
        state.currentGroup = action.payload;
        const index = state.allGroups.findIndex(g => g._id === action.payload._id);
        if (index !== -1) state.allGroups[index] = action.payload;
      })
      .addCase(assignInternalEvaluator.fulfilled, (state, action) => {
        const index = state.allGroups.findIndex(g => g._id === action.payload._id);
        if (index !== -1) state.allGroups[index] = action.payload;
      })
      .addCase(respondToSupervisorRequest.fulfilled, (state, action) => {
        state.mySupervisorRequests = state.mySupervisorRequests.filter(
          r => r._id !== action.payload.payload.requestId
        );
        if (action.payload.payload.action === "ACCEPTED") {
          state.allGroups.push(action.payload.data as any);
        }
      })
      // respondToInvitation — if accepted, reload will happen via page refresh/auth update
      .addCase(respondToInvitation.fulfilled, (state, action) => {
        // Remove the accepted/rejected invitation from local list
        state.myInvitations = state.myInvitations.filter(
          inv => true // list will be refetched on next load
        );
        if (action.payload.action === "ACCEPTED") {
          state.currentGroup = action.payload.data as any;
        }
      })
      .addCase(removeMember.fulfilled, (state, action) => {
        state.currentGroup = action.payload;
        const index = state.allGroups.findIndex(g => g._id === action.payload._id);
        if (index !== -1) state.allGroups[index] = action.payload;
      })
      .addCase(leaveGroup.fulfilled, (state, action) => {
        state.currentGroup = null;
      })
      .addCase(sendSupervisorRequest.fulfilled, (state, action) => {
        // Optimistically update some state if needed, or simply refetch
      })
      .addCase(cancelSupervisorRequest.fulfilled, (state, action) => {
        state.mySupervisorRequests = state.mySupervisorRequests.filter(
          (r) => r._id !== action.payload
        );
        state.mySentSupervisorRequests = state.mySentSupervisorRequests.filter(
          (r) => r._id !== action.payload
        );
      })
      .addCase(getMySentSupervisorRequests.fulfilled, (state, action) => {
        state.mySentSupervisorRequests = action.payload;
      });
  },
});

export const { clearCurrentGroup, clearGroupError } = groupSlice.actions;
export default groupSlice.reducer;
