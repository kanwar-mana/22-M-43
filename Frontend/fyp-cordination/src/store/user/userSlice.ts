import { createSlice } from "@reduxjs/toolkit";
import { getSupervisors, getStudents, getAllowedSupervisors, allowSupervisor, removeAllowedSupervisor } from "./userThunk";

interface UserState {
  user: any | null;
  supervisors: any[];
  students: any[];
  allowedSupervisors: any[];
}

const initialState: UserState = {
  user: null,
  supervisors: [],
  students: [],
  allowedSupervisors: [],
};

const userslice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getSupervisors.fulfilled, (state, action) => {
        state.supervisors = action.payload || [];
      })
      .addCase(getStudents.fulfilled, (state, action) => {
        state.students = action.payload || [];
      })
      .addCase(getAllowedSupervisors.fulfilled, (state, action) => {
        state.allowedSupervisors = action.payload || [];
      })
      .addCase(allowSupervisor.fulfilled, (state, action) => {
        state.allowedSupervisors.unshift(action.payload);
      })
      .addCase(removeAllowedSupervisor.fulfilled, (state, action) => {
        state.allowedSupervisors = state.allowedSupervisors.filter((s: any) => s._id !== action.payload);
      });
  },
});

export default userslice.reducer;
