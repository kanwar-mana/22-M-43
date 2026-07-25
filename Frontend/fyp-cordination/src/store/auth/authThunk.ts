import { createAsyncThunk } from "@reduxjs/toolkit";
import RepositoryFactory from "@/repository/RepositoryFactory";
import {
  LoginRequest,
  SignupRequest,
  UpdatePasswordRequest,
} from "@/types/auth.types";
import { toast } from "@/components/ui/use-toast";

const auth = RepositoryFactory.get("auth");

export const signup = createAsyncThunk(
  "auth/signup",
  async (payload: SignupRequest, thunkAPI) => {
    try {
      const response = await auth.signup(payload);
      toast({
        title: "Success!",
        description:
          response.data.message ||
          "Account created successfully. Please check your email to verify your account.",
      });
      return response.data;
    } catch (error: any) {
      console.log("Signup error:", error);
      toast({
        title: "Error",
        description:
          error?.response?.data?.message || "Signup failed. Please try again.",
        variant: "destructive",
      });
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  },
);

export const verifyEmail = createAsyncThunk(
  "auth/verifyEmail",
  async (payload: any, thunkAPI) => {
    try {
      const response = await auth.verifyEmail(payload);
      toast({
        title: "Success!",
        description:
          response.data.message ||
          "Email verified successfully. You can now log in.",
      });
      return response.data;
    } catch (error: any) {
      console.log("Email verification error:", error);
      toast({
        title: "Error",
        description:
          error?.response?.data?.message ||
          "Email verification failed. Please try again.",
        variant: "destructive",
      });
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  },
);

export const resendVerificationEmail = createAsyncThunk(
  "auth/resendVerification",
  async (payload: { email: string }, thunkAPI) => {
    try {
      const response = await auth.resendVerification(payload);
      toast({
        title: "Code Sent!",
        description:
          response.data.message ||
          "A new verification code has been sent to your email.",
      });
      return response.data;
    } catch (error: any) {
      console.log("Resend verification error:", error);
      toast({
        title: "Error",
        description:
          error?.response?.data?.message ||
          "Failed to resend verification code. Please try again.",
        variant: "destructive",
      });
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  },
);

export const login = createAsyncThunk(
  "auth/login",
  async (payload: LoginRequest, thunkAPI) => {
    try {
      const response = await auth.login(payload);

      // Backend should set httpOnly cookies for tokens
      // We only need to store user data in Redux
      const { user } = response.data.data || response.data;

      if (!user) {
        throw new Error("Invalid response: user data not found");
      }

      toast({
        title: "Success!",
        description: response.data.message || "Login successful!",
      });

      return { user };
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error.message ||
        "Login failed. Please try again.";

      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });

      return thunkAPI.rejectWithValue(errorMessage);
    }
  },
);

export const logout = createAsyncThunk("auth/logout", async (_, thunkAPI) => {
  try {
    await auth.logout();

    toast({
      title: "Success!",
      description: "Logged out successfully.",
    });

    return {};
  } catch (error: any) {
    // Even if the API call fails, we should clear local state
    console.error("Logout error:", error);

    toast({
      title: "Logout Failed",
      description: "Logout failed. Please try again.",
      variant: "destructive",
    });
  }
});

export const checkAuth = createAsyncThunk("auth/check", async (_, thunkAPI) => {
  try {
    const meRes = await auth.me();
    return { user: meRes.data.data.user };
  } catch (error: any) {
    const status = error?.response?.status;

    // Try to refresh token if 401/403
    if (status === 401 || status === 403) {
      try {
        await auth.refresh();
        const meRes = await auth.me();
        return { user: meRes.data.data.user };
      } catch (refreshError: any) {
        // Silently fail - user is not authenticated
        return thunkAPI.rejectWithValue("Not authenticated");
      }
    }

    // Silently fail for other errors
    return thunkAPI.rejectWithValue("Authentication check failed");
  }
});

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (payload: { email: string }, thunkAPI) => {
    try {
      const response = await auth.forgotPassword(payload);
      return response.data;
    } catch (error: any) {
      console.log("Forgot password error:", error);
      toast({
        title: "Error",
        description:
          error?.response?.data?.message ||
          "Failed to send password reset link. Please try again.",
        variant: "destructive",
      });
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  },
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (
    payload: { email: string; token: string; newPassword: string },
    thunkAPI,
  ) => {
    try {
      const response = await auth.resetPassword(payload);
      toast({
        title: "Success!",
        description:
          response.data.message ||
          "Password reset successfully. You can now log in with your new password.",
      });
      return response.data;
    } catch (error: any) {
      console.log("Reset password error:", error);
      toast({
        title: "Error",
        description:
          error?.response?.data?.message ||
          "Failed to reset password. Please try again.",
        variant: "destructive",
      });
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  },
);

export const updatePassword = createAsyncThunk(
  "auth/updatePassword",
  async (payload: UpdatePasswordRequest, thunkAPI) => {
    try {
      const response = await auth.updatePassword(payload);
      toast({
        title: "Success!",
        description: response.data.message || "Password updated successfully.",
      });
      return response.data;
    } catch (error: any) {
      console.log("Update password error:", error);
      toast({
        title: "Error",
        description:
          error?.response?.data?.message ||
          "Failed to update password. Please try again.",
        variant: "destructive",
      });
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  },
);
