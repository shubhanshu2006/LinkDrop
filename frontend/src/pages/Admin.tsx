import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Ban, CheckCircle, Trash2, Eye } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Modal } from "../components/ui/Modal";
import { Input } from "../components/ui/Input";
import { adminAPI } from "../services/adminService";
import toast from "react-hot-toast";
import type { FileData, ApiError } from "../types";

export const Admin: React.FC = () => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [disableReason, setDisableReason] = useState("");
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    console.log("Admin component mounted");
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      console.log("Fetching admin files...");
      setIsLoading(true);
      setHasError(false);
      const response = await adminAPI.listFiles();
      console.log("Admin files response:", response);

      const filesList =
        response.data?.data?.files || response.data?.files || [];
      console.log("Parsed files:", filesList);
      setFiles(filesList);
    } catch (error) {
      const apiError = error as ApiError;
      console.error("Admin files error:", error);
      setHasError(true);
      toast.error(apiError.response?.data?.message || "Failed to load files");
      setFiles([]); // Set empty array on error to show empty state
    } finally {
      setIsLoading(false);
      console.log("Loading finished");
    }
  };

  const handleDisable = async () => {
    if (!selectedFile || !disableReason) {
      toast.error("Please provide a reason");
      return;
    }

    try {
      await adminAPI.disableFile(selectedFile._id, disableReason);
      toast.success("File disabled successfully");
      setShowDisableModal(false);
      setDisableReason("");
      fetchFiles();
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.response?.data?.message || "Failed to disable file");
    }
  };

  const handleEnable = async (fileId: string) => {
    try {
      await adminAPI.enableFile(fileId);
      toast.success("File enabled successfully");
      fetchFiles();
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.response?.data?.message || "Failed to enable file");
    }
  };

  const handleDelete = async (fileId: string) => {
    if (
      !window.confirm("Are you sure you want to permanently delete this file?")
    ) {
      return;
    }

    try {
      await adminAPI.deleteFile(fileId);
      toast.success("File deleted permanently");
      fetchFiles();
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.response?.data?.message || "Failed to delete file");
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-dark-950">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold font-serif mb-2">
            <span className="gradient-text">Admin Panel</span>
          </h1>
          <p className="text-dark-300">Manage and moderate files</p>
        </motion.div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-dark-300">Loading files...</p>
          </div>
        ) : hasError ? (
          <div className="text-center py-12">
            <div className="glass-effect rounded-2xl p-12 max-w-md mx-auto">
              <div className="text-red-500 mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-dark-100 mb-2">
                Failed to Load Files
              </h3>
              <p className="text-dark-400 mb-4">
                There was an error loading the files. Please check the console
                for details.
              </p>
              <Button variant="primary" onClick={fetchFiles}>
                Try Again
              </Button>
            </div>
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-12">
            <div className="glass-effect rounded-2xl p-12 max-w-md mx-auto">
              <FileText className="w-16 h-16 text-dark-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-dark-100 mb-2">
                No Files Found
              </h3>
              <p className="text-dark-400">
                There are no files in the system yet.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {files.map((file, index) => (
              <motion.div
                key={file._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card hover={false}>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-dark-100 mb-1">
                          {file.originalName}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="text-sm px-2 py-1 rounded bg-dark-800 text-dark-300">
                            {file.fileType}
                          </span>
                          {file.isDisabled && (
                            <span className="text-sm px-2 py-1 rounded bg-red-500/20 text-red-400">
                              Disabled
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-dark-400">
                          Owner:{" "}
                          {typeof file.owner === "string"
                            ? file.owner
                            : file.owner?.fullName ||
                              file.owner?.email ||
                              "Anonymous"}
                        </div>

                        {file.disabledReason && (
                          <div className="text-sm text-red-400 mt-1">
                            Reason: {file.disabledReason}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Eye}
                        onClick={() =>
                          window.open(`/file/${file._id}`, "_blank")
                        }
                      >
                        View
                      </Button>
                      {file.isDisabled ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={CheckCircle}
                          onClick={() => handleEnable(file._id)}
                        >
                          Enable
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Ban}
                          onClick={() => {
                            setSelectedFile(file);
                            setShowDisableModal(true);
                          }}
                        >
                          Disable
                        </Button>
                      )}
                      <Button
                        variant="danger"
                        size="sm"
                        icon={Trash2}
                        onClick={() => handleDelete(file._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={showDisableModal}
        onClose={() => {
          setShowDisableModal(false);
          setDisableReason("");
        }}
        title="Disable File"
      >
        <div className="space-y-4">
          <p className="text-dark-300">
            You are about to disable:{" "}
            <strong>{selectedFile?.originalName}</strong>
          </p>
          <Input
            label="Reason for disabling"
            placeholder="Enter reason..."
            value={disableReason}
            onChange={(e) => setDisableReason(e.target.value)}
          />
          <div className="flex space-x-3">
            <Button variant="danger" onClick={handleDisable} className="flex-1">
              Disable File
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setShowDisableModal(false);
                setDisableReason("");
              }}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
