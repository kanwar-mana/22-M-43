import { createSlice } from "@reduxjs/toolkit";
import {
  createSession,
  getSessions,
  updateSession,
  changeSessionActivation,
} from "./sessionThunk";

interface SessionState {
  sessions: any[];
}

const initialState: SessionState = {
  sessions: [],
};

const sessionSlice = createSlice({
  name: "sessions",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createSession.fulfilled, (state, action) => {
        state.sessions.push(action.payload);
      })
      .addCase(updateSession.fulfilled, (state, action) => {
        const updatedSession = action.payload;
        const updatedId = updatedSession._id;

        const sessionIndex = state.sessions.findIndex(
          (session) => session._id === updatedId,
        );

        if (sessionIndex !== -1) {
          state.sessions[sessionIndex] = updatedSession;
        }
      })
      .addCase(getSessions.fulfilled, (state, action) => {
        state.sessions = action.payload;
      })

      .addCase(changeSessionActivation.fulfilled, (state, action) => {
        const updatedId = action.payload._id;
        console.log("Updated session ID:", updatedId);
        if (!updatedId) return;
        state.sessions.forEach((session) => {
          if (session._id === updatedId) {
            session.isActive = action.payload.isActive;
          }
        });
      });
  },
});

export default sessionSlice.reducer;
