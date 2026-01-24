import { create } from "zustand";
import { authAPI } from "../services/authService";

interface User {
  _id: string;
  email: string;
  fullName: string;
  role: string;
  isAnonymous: boolean;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<void>;
  claimAnonFiles: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<void>;
  fetchUser: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email: string, password: string) => {
    // Save anonymous token before clearing to preserve it for merging
    const anonToken = localStorage.getItem("anonAccessToken");

    // Clear any old auth data first to prevent stale token issues
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");

    const response = await authAPI.login({ email, password });
    const { user, accessToken } = response.data;

    // Set new token and user
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("user", JSON.stringify(user));

    // Restore anonymous token if it existed
    if (anonToken) {
      localStorage.setItem("anonAccessToken", anonToken);
    }

    set({ user, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    try {
      await authAPI.logout();
    } catch {
      // Ignore logout errors, clear local state anyway
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      set({ user: null, isAuthenticated: false });
    }
  },

  register: async (email: string, password: string, fullName: string) => {
    await authAPI.register({ email, password, fullName });
  },

  claimAnonFiles: async (email: string, password: string, fullName: string) => {
    const response = await authAPI.claimAnonFiles(email, password, fullName);
    const { user, accessToken } = response.data;

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("user", JSON.stringify(user));

    set({ user, isAuthenticated: true });
  },

  fetchUser: async () => {
    try {
      set({ isLoading: true });
      const response = await authAPI.getCurrentUser();
      const user = response.data.user;

      localStorage.setItem("user", JSON.stringify(user));
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      // Token is invalid or expired, clear everything
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      set({ user: null, isAuthenticated: false, isLoading: false });
      
    }
  },

  setUser: (user: User | null) => {
    set({ user, isAuthenticated: !!user });
  },
}));
