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

export const fileAPI = {
  uploadFile: async (data: UploadFileData) => {
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
  },

  getFile: async (fileId: string) => {
    const response = await api.get(`/files/${fileId}/info`);
    return response.data;
  },

  downloadFile: async (fileId: string, intent?: "download" | "offline") => {
    const params = intent ? `?intent=${intent}` : "";
    const response = await api.get(`/files/${fileId}/download${params}`, {
      responseType: "blob",
    });
    return response;
  },

  deleteFile: async (fileId: string) => {
    const response = await api.delete(`/files/${fileId}`);
    return response.data;
  },

  updateFileSettings: async (fileId: string, data: UpdateFileSettingsData) => {
    const response = await api.patch(`/files/${fileId}/settings`, data);
    return response.data;
  },

  listMyFiles: async () => {
    const response = await api.get("/files/my");
    return response.data;
  },

  requestOTP: async (fileId: string) => {
    const response = await api.post(`/files/${fileId}/request-otp`);
    return response.data;
  },

  verifyOTP: async (fileId: string, otp: string) => {
    const response = await api.post(`/files/${fileId}/verify-otp`, { otp });
    return response.data;
  },
};
