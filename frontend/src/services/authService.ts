import api from "../lib/api";

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
}

export const authAPI = {
  register: async (data: RegisterData) => {
    const response = await api.post("/auth/register", data);
    return response.data;
  },

  login: async (data: LoginData) => {
    const response = await api.post("/auth/login", data);
    return response.data;
  },

  logout: async () => {
    const response = await api.post("/auth/logout");
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  refreshToken: async () => {
    const response = await api.post("/auth/refresh-token");
    return response.data;
  },

  verifyEmail: async (token: string) => {
    const response = await api.get(`/auth/verify-email?token=${token}`);
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },

  resetPassword: async (token: string, password: string) => {
    const response = await api.post("/auth/reset-password", {
      token,
      password,
    });
    return response.data;
  },

  changePassword: async (data: ChangePasswordData) => {
    const response = await api.post("/auth/change-password", {
      currentPassword: data.oldPassword,
      newPassword: data.newPassword,
    });
    return response.data;
  },

  claimAnonFiles: async (email: string, password: string, fullName: string) => {
    const response = await api.post("/auth/claim-anon-files", {
      email,
      password,
      fullName,
    });
    return response.data;
  },

  checkAnonFiles: async (anonymousToken: string) => {
    const response = await api.post("/auth/check-anon-files", {
      anonymousToken,
    });
    return response.data;
  },

  mergeAnonFiles: async (anonymousToken: string) => {
    const response = await api.post("/auth/merge-anon-files", {
      anonymousToken,
    });
    return response.data;
  },
};
