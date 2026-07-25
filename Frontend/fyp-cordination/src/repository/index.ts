import axios from "axios";

const baseDomain =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000/api/v1";

const apiClient = axios.create({
  baseURL: baseDomain,
  withCredentials: true,
});

// Interceptor to handle 401 Unauthorized and auto-refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't already retried this request
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== "/auth/refresh" &&
      originalRequest.url !== "/auth/login"
    ) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the token
        await axios.post(`${baseDomain}/auth/refresh`, {}, { withCredentials: true });
        
        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // If refresh fails, we can't do anything but reject
        // The UI will eventually push them to login
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
