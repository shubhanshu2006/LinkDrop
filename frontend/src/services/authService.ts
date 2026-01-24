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

const register = async (data: RegisterData) => {
  const response = await api.post("/auth/register", data);
  return response.data;
};

const login = async (data: LoginData) => {
  const response = await api.post("/auth/login", data);
  return response.data;
};

const logout = async () => {
  const response = await api.post("/auth/logout");
  return response.data;
};

const getCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

const refreshToken = async () => {
  const response = await api.post("/auth/refresh-token");
  return response.data;
};

const verifyEmail = async (token: string) => {
  const response = await api.get(`/auth/verify-email?token=${token}`);
  return response.data;
};

const forgotPassword = async (email: string) => {
  const response = await api.post("/auth/forgot-password", { email });
  return response.data;
};

const resetPassword = async (token: string, password: string) => {
  const response = await api.post("/auth/reset-password", {
    token,
    password,
  });
  return response.data;
};

const changePassword = async (data: ChangePasswordData) => {
  const response = await api.post("/auth/change-password", {
    currentPassword: data.oldPassword,
    newPassword: data.newPassword,
  });
  return response.data;
};

const claimAnonFiles = async (email: string, password: string, fullName: string) => {
  const response = await api.post("/auth/claim-anon-files", {
    email,
    password,
    fullName,
  });
  return response.data;
};

const checkAnonFiles = async (anonymousToken: string) => {
  const response = await api.post("/auth/check-anon-files", {
    anonymousToken,
  });
  return response.data;
};

const mergeAnonFiles = async (anonymousToken: string) => {
  const response = await api.post("/auth/merge-anon-files", {
    anonymousToken,
  });
  return response.data;
};

export const authAPI = {
  register,
  login,
  logout,
  getCurrentUser,
  refreshToken,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  claimAnonFiles,
  checkAnonFiles,
  mergeAnonFiles,
};
