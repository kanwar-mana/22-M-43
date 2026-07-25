import apiClient from "./index";

const SESSION_BASE = "/sessions";

const CREATE_SESSION = `${SESSION_BASE}/create-session`;
const GET_SESSIONS = `${SESSION_BASE}/`;
const UPDATE_SESSION = (sessionId: string) =>
  `${SESSION_BASE}/update-session/${sessionId}`;
const DELETE_SESSION = (sessionId: string) =>
  `${SESSION_BASE}/delete-session/${sessionId}`;
const CHANGE_SESSION_ACTIVATION = (sessionId: string) =>
  `${SESSION_BASE}/change-activation/${sessionId}`;

export default {
  createSession(payload: any) {
    return apiClient.post(CREATE_SESSION, payload);
  },
  updateSession(sessionId: string, payload: any) {
    return apiClient.patch(UPDATE_SESSION(sessionId), payload);
  },
  getSessions() {
    return apiClient.get(GET_SESSIONS);
  },
  deleteSession(sessionId: string) {
    return apiClient.delete(DELETE_SESSION(sessionId));
  },
  changeActivation(sessionId: string) {
    return apiClient.patch(CHANGE_SESSION_ACTIVATION(sessionId));
  },
};
