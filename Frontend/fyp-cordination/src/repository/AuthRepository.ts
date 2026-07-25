import { verify } from "crypto";
import apiClient from "./index";
import type {
  LoginRequest,
  SignupRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  AuthResponse,
  ApiResponse,
  User,
} from "@/types/auth.types";

const AUTH_BASE = "/auth";

const SIGNUP = `${AUTH_BASE}/signup`;
const LOGIN = `${AUTH_BASE}/login`;
const LOGOUT = `${AUTH_BASE}/logout`;
const ME = `${AUTH_BASE}/me`;
const REFRESH = `${AUTH_BASE}/refresh`;
const FORGOT_PASSWORD = `${AUTH_BASE}/forgot-password`;
const RESET_PASSWORD = `${AUTH_BASE}/reset-password`;
const UPDATE_PASSWORD = `${AUTH_BASE}/update-password`;



export default {
  signup(payload: SignupRequest) {
    return apiClient.post<AuthResponse>(SIGNUP, payload);
  },
  verifyEmail(payload: { email?: string; verificationCode?: string; token?: string }) {
    return apiClient.post<ApiResponse>(`${AUTH_BASE}/verify-email`, payload);
  },
  resendVerification(payload: { email: string }) {
    return apiClient.post<ApiResponse>(`${AUTH_BASE}/resend-verification`, payload);
  },

  me() {
    return apiClient.get<ApiResponse<{ user: User }>>(ME);
  },

  refresh() {
    return apiClient.post<ApiResponse<AuthResponse>>(REFRESH);
  },

  login(payload: LoginRequest) {
    return apiClient.post<AuthResponse>(LOGIN, payload);
  },

  logout() {
    return apiClient.post<ApiResponse>(LOGOUT);
  },

  forgotPassword(payload: ForgotPasswordRequest) {
    return apiClient.post<ApiResponse>(FORGOT_PASSWORD, payload);
  },

  resetPassword(payload: ResetPasswordRequest) {
    return apiClient.post<ApiResponse>(RESET_PASSWORD, payload);
  },

  updatePassword(payload: { currentPassword: string; newPassword: string }) {
    return apiClient.post<ApiResponse>(UPDATE_PASSWORD, payload);
  },

};
