import { createAsyncThunk } from "@reduxjs/toolkit";
import RepositoryFactory from "@/repository/RepositoryFactory";
import { toast } from "@/components/ui/use-toast";

const sessions = RepositoryFactory.get("sessions");

export const createSession = createAsyncThunk(
  "sessions/createSession",
  async (payload: any, thunkAPI) => {
    try {
      const response = await sessions.createSession(payload);
      toast({
        title: "Success!",
        description: response.data.message || "Session created successfully.",
      });
      return response.data.data;
    } catch (error: any) {
      console.log("Create session error:", error);
      toast({
        title: "Error",
        description:
          error?.response?.data?.message ||
          "Failed to create session. Please try again.",
        variant: "destructive",
      });
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  },
);

export const getSessions = createAsyncThunk(
  "sessions/getSessions",
  async (_, thunkAPI) => {
    try {
      const response = await sessions.getSessions();
      console.log("Fetched sessions:", response.data.data);
      return response.data.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error?.response?.data?.message ||
          "Failed to fetch sessions. Please try again.",
        variant: "destructive",
      });
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  },
);

export const updateSession = createAsyncThunk(
  "sessions/updateSession",
  async (
    { sessionId, payload }: { sessionId: string; payload: any },
    thunkAPI,
  ) => {
    try {
      const response = await sessions.updateSession(sessionId, payload);
      toast({
        title: "Success!",
        description: response.data.message || "Session updated successfully.",
      });
      return response.data.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error?.response?.data?.message ||
          "Failed to update session. Please try again.",
        variant: "destructive",
      });
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  },
);

export const deleteSession = createAsyncThunk(
  "sessions/deleteSession",
  async (sessionId: string, thunkAPI) => {
    try {
      const response = await sessions.deleteSession(sessionId);
      toast({
        title: "Success!",
        description: response.data.message || "Session deleted successfully.",
      });
      return sessionId; // Return the deleted session ID for state update
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error?.response?.data?.message ||
          "Failed to delete session. Please try again.",
        variant: "destructive",
      });
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  },
);

export const changeSessionActivation = createAsyncThunk(
  "sessions/changeActivation",
  async (sessionId: string, thunkAPI) => {
    try {
      const response = await sessions.changeActivation(sessionId);
      toast({
        title: "Success!",
        description: "Session activation status changed successfully.",
      });
      return response.data.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error?.response?.data?.message ||
          "Failed to change session activation. Please try again.",
        variant: "destructive",
      });
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  },
);
