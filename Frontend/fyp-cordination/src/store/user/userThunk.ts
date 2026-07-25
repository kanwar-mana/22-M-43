import { createAsyncThunk } from "@reduxjs/toolkit";
import RepositoryFactory from "@/repository/RepositoryFactory";
import { toast } from "@/components/ui/use-toast";

const users = RepositoryFactory.get("users");

export const getSupervisors = createAsyncThunk(
  "users/getSupervisors",
  async (_, thunkAPI) => {
    try {
      const response = await users.getSupervisors();
      return response.data.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error?.response?.data?.message ||
          "Failed to fetch supervisors. Please try again.",
        variant: "destructive",
      });
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  },
);

export const getStudents = createAsyncThunk(
  "users/getStudents",
  async (_, thunkAPI) => {
    try {
      const response = await users.getStudents();
      return response.data.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error?.response?.data?.message ||
          "Failed to fetch students. Please try again.",
        variant: "destructive",
      });
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  },
);

export const getAllowedSupervisors = createAsyncThunk(
  "users/getAllowedSupervisors",
  async (_, thunkAPI) => {
    try {
      const response = await users.getAllowedSupervisors();
      return response.data.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  },
);

export const allowSupervisor = createAsyncThunk(
  "users/allowSupervisor",
  async (email: string, thunkAPI) => {
    try {
      const response = await users.allowSupervisor(email);
      toast({
        title: "Success",
        description: "Email added to supervisor whitelist.",
      });
      return response.data.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to add email.",
        variant: "destructive",
      });
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  },
);

export const removeAllowedSupervisor = createAsyncThunk(
  "users/removeAllowedSupervisor",
  async (id: string, thunkAPI) => {
    try {
      await users.removeAllowedSupervisor(id);
      toast({
        title: "Success",
        description: "Email removed from whitelist.",
      });
      return id;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to remove email.",
        variant: "destructive",
      });
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  },
);
