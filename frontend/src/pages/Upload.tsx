import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Upload as UploadIcon,
  FileText,
  X,
  Calendar,
  Mail,
  Clock,
  Shield,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Copy,
  Share2,
  UserPlus,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";
import { Modal } from "../components/ui/Modal";
import { fileAPI } from "../services/fileService";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import type { ApiError } from "../types";

export const Upload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<
    "normal" | "sensitive" | "verySensitive"
  >("normal");
  const [linkExpiresAt, setLinkExpiresAt] = useState("");
  const [allowedEmail, setAllowedEmail] = useState("");
  const [openDuration, setOpenDuration] = useState("60");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isAnonymous = user?.isAnonymous;

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast.error("Please select a file");
      return;
    }

    if (!linkExpiresAt) {
      toast.error("Please set link expiry time");
      return;
    }

    if (fileType === "verySensitive" && (!allowedEmail || !openDuration)) {
      toast.error(
        "Email and open duration are required for very sensitive files"
      );
      return;
    }

    setIsUploading(true);
    try {
      const response = await fileAPI.uploadFile({
        file,
        fileType,
        linkExpiresAt,
        allowedEmail: fileType === "verySensitive" ? allowedEmail : undefined,
        openDuration:
          fileType === "verySensitive" ? parseInt(openDuration) : undefined,
      });

      const fileId = response.data.fileId;
      const link = `${window.location.origin}/file/${fileId}`;

      setShareLink(link);
      setShowShareModal(true);

      toast.success("File uploaded successfully!");

      navigator.clipboard.writeText(link);
      toast.success("Share link copied to clipboard!");
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.response?.data?.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const securityLevels = [
    {
      id: "normal" as const,
      icon: CheckCircle,
      name: "Normal",
      description: "Free downloads and offline access",
      color: "from-green-500 to-green-600",
      features: ["Download allowed", "Offline save allowed", "Flexible expiry"],
    },
    {
      id: "sensitive" as const,
      icon: AlertTriangle,
      name: "Sensitive",
      description: "View-only with time limits",
      color: "from-accent-500 to-accent-600",
      features: ["No downloads", "Offline until expiry", "Auto-delete"],
    },
    {
      id: "verySensitive" as const,
      icon: XCircle,
      name: "Very Sensitive",
      description: "Maximum security with OTP",
      color: "from-red-500 to-red-600",
      features: ["Email verified only", "Time window", "No offline"],
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-500/20 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold font-serif mb-4">
            <span className="gradient-text">Upload & Secure</span>
          </h1>
          <p className="text-xl text-dark-300">
            Choose your security level and share with confidence
          </p>
        </motion.div>

        {isAnonymous && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="bg-gradient-to-r from-accent-500/10 to-primary-500/10 border border-accent-500/30">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-accent-500/20 flex items-center justify-center flex-shrink-0">
                  <UserPlus className="text-accent-400" size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-2">
                    Register to Keep Your Files Forever
                  </h3>
                  <p className="text-dark-300 text-sm mb-3">
                    You're uploading anonymously. Register now to access all
                    your files from the dashboard and keep them permanently!
                  </p>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate("/register")}
                  >
                    Create Account
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
                isDragging
                  ? "border-primary-500 bg-primary-500/10"
                  : "border-dark-700 hover:border-dark-600"
              }`}
            >
              {file ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <FileText className="w-16 h-16 text-primary-400" />
                  </div>
                  <div>
                    <p className="text-xl font-semibold text-dark-100">
                      {file.name}
                    </p>
                    <p className="text-dark-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    icon={X}
                    onClick={() => setFile(null)}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <UploadIcon className="w-16 h-16 text-dark-400" />
                  </div>
                  <div>
                    <p className="text-xl font-semibold text-dark-100 mb-2">
                      Drop your file here
                    </p>
                    <p className="text-dark-400 mb-4">or</p>
                    <label className="cursor-pointer">
                      <span className="btn-primary inline-block">
                        Browse Files
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>
          </Card>

          <div>
            <h3 className="text-2xl font-bold text-dark-100 mb-4 flex items-center">
              <Shield className="w-6 h-6 mr-2 text-primary-400" />
              Select Security Level
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {securityLevels.map((level) => (
                <motion.div
                  key={level.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div
                    onClick={() => setFileType(level.id)}
                    className={`cursor-pointer rounded-xl p-6 transition-all duration-300 ${
                      fileType === level.id
                        ? "glass-effect border-2 border-primary-500 premium-glow"
                        : "glass-effect border border-dark-800 hover:border-dark-700"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-lg bg-gradient-to-br ${level.color} flex items-center justify-center mb-3`}
                    >
                      <level.icon className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-lg font-bold text-dark-100 mb-2">
                      {level.name}
                    </h4>
                    <p className="text-sm text-dark-300 mb-3">
                      {level.description}
                    </p>
                    <ul className="space-y-1">
                      {level.features.map((feature, idx) => (
                        <li
                          key={idx}
                          className="text-xs text-dark-400 flex items-center"
                        >
                          <CheckCircle className="w-3 h-3 mr-1 text-primary-400" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <Card>
            <h3 className="text-2xl font-bold text-dark-100 mb-6">
              Configuration
            </h3>
            <div className="space-y-5">
              <Input
                label="Link Expires At"
                type="datetime-local"
                icon={Calendar}
                value={linkExpiresAt}
                onChange={(e) => setLinkExpiresAt(e.target.value)}
                required
                min={new Date().toISOString().slice(0, 16)}
              />

              {fileType === "verySensitive" && (
                <>
                  <Input
                    label="Allowed Email"
                    type="email"
                    icon={Mail}
                    placeholder="receiver@example.com"
                    value={allowedEmail}
                    onChange={(e) => setAllowedEmail(e.target.value)}
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium text-dark-200 mb-2">
                      <Clock className="w-4 h-4 inline mr-2" />
                      Open Duration (minutes)
                    </label>
                    <input
                      type="number"
                      className="input-field"
                      value={openDuration}
                      onChange={(e) => setOpenDuration(e.target.value)}
                      min="1"
                      max="1440"
                      required
                    />
                    <p className="mt-1 text-sm text-dark-400">
                      File will auto-close after this duration once OTP is
                      verified
                    </p>
                  </div>
                </>
              )}
            </div>
          </Card>

          <div className="flex justify-center">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              icon={UploadIcon}
              isLoading={isUploading}
              disabled={!file}
            >
              Upload & Generate Link
            </Button>
          </div>
        </form>

        <Modal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          title="File Uploaded Successfully!"
          size="lg"
        >
          <div className="space-y-6">
            <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
              <p className="text-green-300">
                Your file has been uploaded and is ready to share!
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">
                Share Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="input-field flex-1 font-mono text-sm"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <Button
                  variant="secondary"
                  icon={Copy}
                  onClick={() => {
                    navigator.clipboard.writeText(shareLink);
                    toast.success("Link copied!");
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>

            {isAnonymous && (
              <div className="p-4 bg-accent-500/10 border border-accent-500/30 rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-accent-400" />
                  <h3 className="font-semibold text-accent-300">
                    Important: Claim Your Files
                  </h3>
                </div>
                <p className="text-dark-300 text-sm">
                  You uploaded this file anonymously. To access it later and
                  manage all your files:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-sm text-dark-300 ml-2">
                  <li>Save this link somewhere safe</li>
                  <li>Create an account to claim your anonymous uploads</li>
                  <li>Access all your files from the Dashboard</li>
                </ol>
                <Button
                  variant="primary"
                  className="w-full mt-2"
                  onClick={() => {
                    setShowShareModal(false);
                    navigate("/register");
                  }}
                  icon={UserPlus}
                >
                  Create Account & Claim Files
                </Button>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  setShowShareModal(false);

                  setFile(null);
                  setFileType("normal");
                  setLinkExpiresAt("");
                  setAllowedEmail("");
                  setOpenDuration("60");
                }}
              >
                Upload Another
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => {
                  window.open(shareLink, "_blank");
                }}
                icon={Share2}
              >
                View File
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};
