import { useAuthStore } from "../store/authStore";

/**
 * Custom hook to encapsulate authentication logic and state.
 * Prefer this over using useAuthStore directly in components.
 */
export const useAuth = () => {
  const store = useAuthStore();

  return {
    user: store.user,
    token: store.token,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    error: store.error,
    isInitialized: store.isInitialized,
    initialize: store.initialize,
    login: store.login,
    register: store.register,
    logout: store.logout,
  };
};
