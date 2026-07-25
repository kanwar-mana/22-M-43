import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth/authSlice";
import sessionReducer from "./session/sessionSlice";
import userReducer from "./user/userSlice";
import groupReducer from "./group/groupSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    session: sessionReducer,
    user: userReducer,
    group: groupReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
