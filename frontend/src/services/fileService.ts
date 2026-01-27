import api from "../lib/api";

export interface UploadFileData {
  file: File;
  fileType: "normal" | "sensitive" | "verySensitive";
  linkExpiresAt: string;
  allowedEmail?: string;
  openDuration?: number;
}

export interface UpdateFileSettingsData {
  linkExpiresAt?: string;
  downloadAllowed?: boolean;
  offlineAllowed?: boolean;
}

const uploadFile = async (data: UploadFileData) => {
  const formData = new FormData();
  formData.append("file", data.file);
  formData.append("fileType", data.fileType);
  formData.append("linkExpiresAt", data.linkExpiresAt);

  if (data.allowedEmail) {
    formData.append("allowedEmail", data.allowedEmail);
  }

  if (data.openDuration) {
    formData.append("openDuration", data.openDuration.toString());
  }

  const response = await api.post("/files/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

const getFile = async (fileId: string) => {
  const response = await api.get(`/files/${fileId}/info`);
  return response.data;
};

const getFileContent = async (fileId: string) => {
  const response = await api.get(`/files/${fileId}`, {
    params: { intent: "view" },
    responseType: "blob",
  });
  return response;
};

const downloadFile = async (fileId: string, intent?: "download" | "offline") => {
  const params = intent ? `?intent=${intent}` : "";
  const response = await api.get(`/files/${fileId}/download${params}`, {
    responseType: "blob",
  });
  return response;
};

const deleteFile = async (fileId: string) => {
  const response = await api.delete(`/files/${fileId}`);
  return response.data;
};

const updateFileSettings = async (fileId: string, data: UpdateFileSettingsData) => {
  const response = await api.patch(`/files/${fileId}/settings`, data);
  return response.data;
};

const listMyFiles = async () => {
  const response = await api.get("/files/my");
  return response.data;
};

const requestOTP = async (fileId: string) => {
  const response = await api.post(`/files/${fileId}/request-otp`);
  return response.data;
};

const verifyOTP = async (fileId: string, otp: string) => {
  const response = await api.post(`/files/${fileId}/verify-otp`, { otp });
  return response.data;
};

export const fileAPI = {
  uploadFile,
  getFile,
  getFileContent,
  downloadFile,
  deleteFile,
  updateFileSettings,
  listMyFiles,
  requestOTP,
  verifyOTP,
};
