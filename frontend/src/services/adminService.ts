import api from "../lib/api";

export const adminAPI = {
  listFiles: async (page = 1, limit = 20) => {
    const response = await api.get(`/admin/files?page=${page}&limit=${limit}`);
    return response.data;
  },

  disableFile: async (fileId: string, reason: string) => {
    const response = await api.patch(`/admin/files/${fileId}/disable`, {
      reason,
    });
    return response.data;
  },

  enableFile: async (fileId: string) => {
    const response = await api.patch(`/admin/files/${fileId}/enable`);
    return response.data;
  },

  deleteFile: async (fileId: string) => {
    const response = await api.delete(`/admin/files/${fileId}`);
    return response.data;
  },
};
