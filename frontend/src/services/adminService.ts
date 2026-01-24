import api from "../lib/api";

const listFiles = async (page = 1, limit = 20) => {
  const response = await api.get(`/admin/files?page=${page}&limit=${limit}`);
  return response.data;
};

const disableFile = async (fileId: string, reason: string) => {
  const response = await api.patch(`/admin/files/${fileId}/disable`, {
    reason,
  });
  return response.data;
};

const enableFile = async (fileId: string) => {
  const response = await api.patch(`/admin/files/${fileId}/enable`);
  return response.data;
};

const deleteFile = async (fileId: string) => {
  const response = await api.delete(`/admin/files/${fileId}`);
  return response.data;
};

export const adminAPI = {
  listFiles,
  disableFile,
  enableFile,
  deleteFile,
};
