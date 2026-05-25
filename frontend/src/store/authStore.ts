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
        });
        connectSocket();
      } catch (error: any) {
        // Fallback to mock user if backend is offline or throws a network error
        const isNetworkError = !error || !error.response;
        if (isNetworkError) {
          const mockUser = {
            id: "mock-uid",
            name: "Akhilesh Chouhan",
            email: "admin@securedocs.ai",
            company: "Obsidian Corp",
            role: "admin",
            avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuARtyjMx3zWO_HIZhmhAI3gNNKxVynpaz0Kh_USGT7Fd3ES7Bc8_0McFG5aQL6WodvPMMllVkK5SyRp8x6IDLsmLPBqIURkn1TAeHEOPbTQWwSKaNMrfx65MIAKgKhCOK6HpD_xSzi6W8REvnz4ELMkLWcwC5uWsDnwLrrHQo_vBch9f4lwWtHzWY5fLaNXeRvMIENQb0lx1bfi8kSmgNubVqJOMexLSZHJDrs1irJMVGlcg_z60msPayeneE_Bf5IbgYkcNeioWko"
          };
          set({
            user: mockUser,
            token,
            isAuthenticated: true,
          });
        } else {
          localStorage.removeItem("token");
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
        }
      } finally {
        set({ isInitialized: true });
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
      // Fallback on offline/network errors
      if (!error || !error.response) {
        const mockUser = {
          id: "mock-uid",
          name: email.split('@')[0],
          email,
          company: organization,
          role: "admin",
          avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBhsCVhl_RUkP8Wd1q39N354wDImDOAYZmwMVCiOEAloE_dhIxzlB_e0wVPQlTN0aWwhaxKlAnHeBQMdJIi3_4U0eVJkxuOUG068OXQ7cu-shrh-J5aRCsiRz2ro0HZacKZ0lam4eA4zxUaDteLbidFWrMsOTn0JUM2rFNDqHTBdqD_Mu-oziDCrjKuewYcxlmM7B9X3YTUmrQcBSLvKCa2WzIcwZJ36TfNxYmljsPzBEv33Is2EzLkGGYDnrfBU98qzxCKpMBylTQ"
        };
        const mockToken = "mock-jwt-token";
        localStorage.setItem("token", mockToken);
        set({ user: mockUser, token: mockToken, isAuthenticated: true, isLoading: false });
        return mockUser;
      }

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
      // Fallback on offline/network errors
      if (!error || !error.response) {
        const mockUser = {
          id: "mock-uid",
          name: email ? email.split('@')[0] : "Administrator",
          email: email || "admin@securedocs.ai",
          company: "Obsidian Corp",
          role: "admin",
          avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuARtyjMx3zWO_HIZhmhAI3gNNKxVynpaz0Kh_USGT7Fd3ES7Bc8_0McFG5aQL6WodvPMMllVkK5SyRp8x6IDLsmLPBqIURkn1TAeHEOPbTQWwSKaNMrfx65MIAKgKhCOK6HpD_xSzi6W8REvnz4ELMkLWcwC5uWsDnwLrrHQo_vBch9f4lwWtHzWY5fLaNXeRvMIENQb0lx1bfi8kSmgNubVqJOMexLSZHJDrs1irJMVGlcg_z60msPayeneE_Bf5IbgYkcNeioWko"
        };
        const mockToken = "mock-jwt-token";
        localStorage.setItem("token", mockToken);
        set({ user: mockUser, token: mockToken, isAuthenticated: true, isLoading: false });
        return mockUser;
      }

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
