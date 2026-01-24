import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Download,
  Trash2,
  Clock,
  HardDrive,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import {
  getAllOfflineFiles,
  deleteOfflineFile,
  deleteExpiredFiles,
  isFileExpired,
  getStorageEstimate,
  formatBytes,
  getTimeRemaining,
  type OfflineFile,
} from "../utils/indexedDB";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

export const OfflineFiles: React.FC = () => {
  const [files, setFiles] = useState<OfflineFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [storageInfo, setStorageInfo] = useState({
    usage: 0,
    quota: 0,
    percentage: 0,
  });
  const { user } = useAuthStore();

  const loadFiles = async () => {
    try {
      setIsLoading(true);

      await deleteExpiredFiles();

      const allFiles = await getAllOfflineFiles(user?._id);
      setFiles(allFiles);

      const storage = await getStorageEstimate();
      setStorageInfo(storage);
    } catch (error) {
      console.error("Failed to load offline files:", error);
      toast.error("Failed to load offline files");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleDeleteFile = async (id: string) => {
    try {
      await deleteOfflineFile(id);
      toast.success("File deleted");
      loadFiles();
    } catch (error) {
      console.error("Failed to delete file:", error);
      toast.error("Failed to delete file");
    }
  };

  const handleClearExpired = async () => {
    try {
      const count = await deleteExpiredFiles();
      if (count > 0) {
        toast.success(`Deleted ${count} expired file(s)`);
        loadFiles();
      } else {
        toast.success("No expired files to delete");
      }
    } catch (error) {
      console.error("Failed to clear expired files:", error);
      toast.error("Failed to clear expired files");
    }
  };

  const handleViewFile = async (file: OfflineFile) => {
    if (isFileExpired(file)) {
      toast.error("This file has expired and can no longer be accessed");
      return;
    }

    try {
      console.log("Viewing file:", {
        fileName: file.fileName,
        fileType: file.fileType,
        blobType: file.blob.type,
        blobSize: file.blob.size,
      });

      const blobToView = file.blob.type
        ? file.blob
        : new Blob([await file.blob.arrayBuffer()], { type: file.fileType });

      const url = URL.createObjectURL(blobToView);
      window.open(url, "_blank");

      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error("Failed to open file:", error);
      toast.error("Failed to open file");
    }
  };

  const handleDownloadFile = (file: OfflineFile) => {
    if (isFileExpired(file)) {
      toast.error("This file has expired and can no longer be accessed");
      return;
    }

    try {
      const url = URL.createObjectURL(file.blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.originalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Download started");
    } catch (error) {
      console.error("Failed to download file:", error);
      toast.error("Failed to download file");
    }
  };

  const activeFiles = files.filter((file) => !isFileExpired(file));
  const expiredFiles = files.filter((file) => isFileExpired(file));

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-dark-300">Loading offline files...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob"></div>
        <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-secondary-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              <HardDrive className="text-white" size={28} />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary-400 via-secondary-400 to-accent-400 bg-clip-text text-transparent">
              Offline Files
            </span>
          </h1>
          <p className="text-dark-300 text-lg max-w-2xl mx-auto">
            Access your files anytime, even without an internet connection
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  Storage Usage
                </h3>
                <p className="text-dark-300 text-sm">
                  {formatBytes(storageInfo.usage)} of{" "}
                  {formatBytes(storageInfo.quota)} used
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary-400">
                  {storageInfo.percentage.toFixed(1)}%
                </p>
              </div>
            </div>
            <div className="w-full bg-dark-700 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-500"
                style={{ width: `${Math.min(storageInfo.percentage, 100)}%` }}
              />
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-3 mb-8"
        >
          <Button onClick={loadFiles} variant="secondary">
            <RefreshCw size={18} />
            Refresh
          </Button>
          {expiredFiles.length > 0 && (
            <Button onClick={handleClearExpired} variant="secondary">
              <Trash2 size={18} />
              Clear Expired ({expiredFiles.length})
            </Button>
          )}
        </motion.div>

        {activeFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-4">
              Available Files ({activeFiles.length})
            </h2>
            <div className="grid gap-4">
              {activeFiles.map((file, index) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Card className="p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center flex-shrink-0">
                          <FileText className="text-primary-400" size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-white mb-1 truncate">
                            {file.originalName}
                          </h3>
                          <div className="flex flex-wrap gap-4 text-sm text-dark-300">
                            <span>{formatBytes(file.fileSize)}</span>
                            <span className="flex items-center gap-1">
                              <Clock size={14} />
                              Expires in: {getTimeRemaining(file.expiresAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          onClick={() => handleViewFile(file)}
                          variant="secondary"
                          size="sm"
                        >
                          <FileText size={16} />
                          View
                        </Button>
                        <Button
                          onClick={() => handleDownloadFile(file)}
                          variant="secondary"
                          size="sm"
                        >
                          <Download size={16} />
                          Download
                        </Button>
                        <Button
                          onClick={() => handleDeleteFile(file.id)}
                          variant="secondary"
                          size="sm"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {expiredFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-white mb-4">
              Expired Files ({expiredFiles.length})
            </h2>
            <div className="grid gap-4">
              {expiredFiles.map((file, index) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Card className="p-6 opacity-60">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-dark-700 flex items-center justify-center flex-shrink-0">
                          <AlertCircle className="text-dark-400" size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-dark-300 mb-1 truncate">
                            {file.originalName}
                          </h3>
                          <div className="flex flex-wrap gap-4 text-sm text-dark-400">
                            <span>{formatBytes(file.fileSize)}</span>
                            <span className="flex items-center gap-1 text-red-400">
                              <Clock size={14} />
                              Expired
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleDeleteFile(file.id)}
                        variant="secondary"
                        size="sm"
                      >
                        <Trash2 size={16} />
                        Delete
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {files.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-dark-700 flex items-center justify-center mx-auto mb-6">
                <HardDrive className="text-dark-400" size={40} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                No Offline Files
              </h3>
              <p className="text-dark-300 mb-6 max-w-md mx-auto">
                When you save files for offline access, they will appear here.
                You can access them anytime, even without an internet
                connection.
              </p>
              <Button onClick={() => (window.location.href = "/")}>
                Browse Files
              </Button>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};
