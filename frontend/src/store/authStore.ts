import { create } from "zustand";
import api from "../services/api";
import { connectSocket, disconnectSocket } from "../services/websocket";
import { AuthState } from "../types";

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem("token") || null,
  isAuthenticated: !!localStorage.getItem("token"),
  isLoading: false,
  error: null,
  isInitialized: false,

  initialize: async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const data = await api.get("/auth/profile");
        set({
          user: data.data.user,
          token,
          isAuthenticated: true,
          isInitialized: true,
        });
        connectSocket();
      } catch (error: any) {
        localStorage.removeItem("token");
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isInitialized: true,
        });
      }
    } else {
      set({ isInitialized: true });
    }
  },

  register: async (email: string, password: string, organization: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.post("/auth/register", {
        email,
        password,
        company: organization,
      });
      const { user, token } = data.data;
      localStorage.setItem("token", token);
      set({ user, token, isAuthenticated: true, isLoading: false });
      connectSocket();
      return user;
    } catch (error: any) {
      set({
        error: error.response?.data?.error || error.message,
        isLoading: false,
      });
      throw error;
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.post("/auth/login", {
        email,
        password,
      });
      const { user, token } = data.data;
      localStorage.setItem("token", token);
      set({ user, token, isAuthenticated: true, isLoading: false });
      connectSocket();
      return user;
    } catch (error: any) {
      set({
        error: error.response?.data?.error || error.message,
        isLoading: false,
      });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null, isAuthenticated: false });
    disconnectSocket();
  },
}));
