import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileText,
  Trash2,
  Calendar,
  Copy,
  Upload,
  Shield,
  UserPlus,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { fileAPI } from "../services/fileService";
import { authAPI } from "../services/authService";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import type { FileData, ApiError } from "../types";

export const Dashboard: React.FC = () => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showMergePrompt, setShowMergePrompt] = useState(false);
  const [anonFileCount, setAnonFileCount] = useState(0);
  const [isMerging, setIsMerging] = useState(false);
  const { user } = useAuthStore();
  const isAnonymous = user?.isAnonymous;

  useEffect(() => {
    fetchFiles();
  }, []);

  // Separate effect for checking anonymous files that depends on user being loaded
  useEffect(() => {
    // Only check after user is loaded (not on initial mount when user is null)
    if (user !== null) {
      checkForAnonymousFiles();
    }
  }, [user]); // Re-run when user changes

  const checkForAnonymousFiles = async () => {
    // Don't show merge prompt for anonymous users
    if (isAnonymous) {
      return;
    }

    // Check if there's an anonymous token in localStorage
    const anonToken = localStorage.getItem("anonAccessToken");

    if (!anonToken) {
      return;
    }

    try {
      // Check if the anonymous user still exists and has files
      const response = await authAPI.checkAnonFiles(anonToken);

      if (response.data.hasFiles && response.data.anonymousUserExists) {
        setAnonFileCount(response.data.fileCount);
        setShowMergePrompt(true);
      } else {
        // Token is invalid or files already merged, remove it
        localStorage.removeItem("anonAccessToken");
      }
    } catch (error) {
      // If check fails, remove the token
      localStorage.removeItem("anonAccessToken");
    }
  };

  const handleMergeFiles = async () => {
    const anonToken = localStorage.getItem("anonAccessToken");
    if (!anonToken) {
      toast.error("No anonymous files found to merge");
      return;
    }

    setIsMerging(true);
    try {
      const response = await authAPI.mergeAnonFiles(anonToken);
      toast.success(response.message || "Files merged successfully!");
      localStorage.removeItem("anonAccessToken");
      setShowMergePrompt(false);
      setAnonFileCount(0);
      fetchFiles(); // Refresh the file list
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage =
        apiError.response?.data?.message || "Failed to merge files";

      // If files were already merged or anonymous user not found, clean up
      if (
        errorMessage.includes("not found") ||
        errorMessage.includes("already merged") ||
        errorMessage.includes("No files")
      ) {
        localStorage.removeItem("anonAccessToken");
        setShowMergePrompt(false);
        setAnonFileCount(0);
      }

      toast.error(errorMessage);
    } finally {
      setIsMerging(false);
    }
  };

  const handleDismissMerge = () => {
    localStorage.removeItem("anonAccessToken");
    setShowMergePrompt(false);
    setAnonFileCount(0);
  };

  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      const response = await fileAPI.listMyFiles();
      setFiles(response.data.files || []);
      setIsInitialLoad(false);
    } catch (error) {
      const apiError = error as ApiError;
      // Don't show errors on initial load (might be stale token)
      if (!isInitialLoad) {
        toast.error(apiError.response?.data?.message || "Failed to load files");
      }
      setIsInitialLoad(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = (fileId: string) => {
    const link = `${window.location.origin}/file/${fileId}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copied to clipboard!");
  };

  const handleDelete = async (fileId: string) => {
    if (!window.confirm("Are you sure you want to delete this file?")) {
      return;
    }

    try {
      await fileAPI.deleteFile(fileId);
      toast.success("File deleted successfully");
      // Refresh the file list after successful deletion
      await fetchFiles();
    } catch (error) {
      const apiError = error as ApiError;
      console.error("Delete error:", error);
      toast.error(apiError.response?.data?.message || "Failed to delete file");
    }
  };

  const getSecurityBadge = (fileType: string) => {
    const badges = {
      normal: { text: "Normal", color: "from-green-500 to-green-600" },
      sensitive: { text: "Sensitive", color: "from-accent-500 to-accent-600" },
      verySensitive: {
        text: "Very Sensitive",
        color: "from-red-500 to-red-600",
      },
    };

    const badge = badges[fileType as keyof typeof badges] || badges.normal;

    return (
      <span
        className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold text-white bg-gradient-to-r ${badge.color}`}
      >
        {badge.text}
      </span>
    );
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-500/20 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold font-serif mb-2">
                <span className="gradient-text">Dashboard</span>
              </h1>
              <p className="text-dark-300">Welcome back, {user?.fullName}!</p>
            </div>
            <Link to="/upload">
              <Button variant="primary" icon={Upload}>
                Upload New File
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-dark-400 text-sm mb-1">Total Files</p>
                  <p className="text-3xl font-bold gradient-text">
                    {files.length}
                  </p>
                </div>
                <FileText className="w-12 h-12 text-primary-400" />
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-dark-400 text-sm mb-1">Active Links</p>
                  <p className="text-3xl font-bold gradient-text">
                    {
                      files.filter(
                        (f) => new Date(f.linkExpiresAt) > new Date()
                      ).length
                    }
                  </p>
                </div>
                <Shield className="w-12 h-12 text-accent-400" />
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-dark-400 text-sm mb-1">Storage Used</p>
                  <p className="text-3xl font-bold gradient-text">
                    {(
                      files.reduce((acc, f) => acc + f.size, 0) /
                      1024 /
                      1024
                    ).toFixed(2)}{" "}
                    MB
                  </p>
                </div>
                <Calendar className="w-12 h-12 text-primary-500" />
              </div>
            </Card>
          </div>
        </motion.div>

        {/* Merge Anonymous Files Prompt */}
        {showMergePrompt && !isAnonymous && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-6"
          >
            <Card className="bg-gradient-to-r from-primary-500/10 to-secondary-500/10 border border-primary-500/30">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                  <FileText className="text-primary-400" size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-2">
                    Merge Anonymous Files
                  </h3>
                  <p className="text-dark-300 text-sm mb-3">
                    We detected {anonFileCount} file
                    {anonFileCount !== 1 ? "s" : ""} uploaded from a previous
                    anonymous session. Would you like to merge{" "}
                    {anonFileCount === 1 ? "it" : "them"} into your account?
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleMergeFiles}
                      disabled={isMerging}
                    >
                      {isMerging ? "Merging..." : "Merge Files"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDismissMerge}
                      disabled={isMerging}
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Anonymous User Notice - When they have files */}
        {isAnonymous && files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-6"
          >
            <Card className="bg-gradient-to-r from-red-500/10 to-accent-500/10 border border-red-500/30">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <UserPlus className="text-red-400" size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-2">
                    ⚠️ Important: Register to Keep Your Files
                  </h3>
                  <p className="text-dark-300 text-sm mb-3">
                    You're using an anonymous account. Your files will be{" "}
                    <strong className="text-red-400">permanently lost</strong>{" "}
                    when you close the browser or clear cookies. Register now to
                    save all your files!
                  </p>
                  <Link to="/register">
                    <Button variant="primary" size="sm">
                      Create Account Now
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Files List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-dark-300">Loading files...</p>
          </div>
        ) : files.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-dark-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-dark-100 mb-2">
                No files yet
              </h3>
              {isAnonymous ? (
                <>
                  <p className="text-dark-300 mb-4">
                    You're using an anonymous account. Your files will be lost
                    if you close the browser.
                  </p>
                  <p className="text-dark-300 mb-6 font-semibold">
                    Register now to keep your files permanently!
                  </p>
                  <Link to="/register">
                    <Button variant="primary" className="mb-3">
                      Create Account
                    </Button>
                  </Link>
                  <br />
                  <Link to="/upload">
                    <Button variant="secondary" icon={Upload}>
                      Upload File
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <p className="text-dark-300 mb-6">
                    Upload your first file to get started
                  </p>
                  <Link to="/upload">
                    <Button variant="primary" icon={Upload}>
                      Upload File
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </Card>
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
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-dark-100 mb-1 truncate">
                          {file.originalName}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          {getSecurityBadge(file.fileType)}
                          <span className="text-sm text-dark-400">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-dark-400">
                          <Calendar className="w-4 h-4 mr-1" />
                          Expires:{" "}
                          {new Date(file.linkExpiresAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Copy}
                        onClick={() => handleCopyLink(file._id)}
                      >
                        Copy Link
                      </Button>
                      <Link to={`/file/${file._id}`}>
                        <Button variant="secondary" size="sm">
                          View
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
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
    </div>
  );
};
