import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileText,
  Download,
  Eye,
  Lock,
  Shield,
  Clock,
  Mail,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";
import { Modal } from "../components/ui/Modal";
import { SuccessModal } from "../components/ui/SuccessModal";
import { DurationModal } from "../components/ui/DurationModal";
import { fileAPI } from "../services/fileService";
import { saveFileOffline } from "../utils/indexedDB";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import type { FileData, ApiError } from "../types";

export const FileView: React.FC = () => {
  const { fileId } = useParams<{ fileId: string }>();
  const [file, setFile] = useState<FileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [showOTPSentModal, setShowOTPSentModal] = useState(false);
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRequestingOTP, setIsRequestingOTP] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [clockOffset, setClockOffset] = useState<number>(0);
  const [openedWindow, setOpenedWindow] = useState<Window | null>(null);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (fileId) {
      setIsLoading(true);
      fetchFile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileId]);

  useEffect(() => {
    if (
      !file ||
      file.fileType !== "verySensitive" ||
      !file.accessEndsAt ||
      !file.otpVerifiedAt
    ) {
      return;
    }

    let interval: number;

    const checkExpiration = () => {
      const now = Date.now();
      const serverNow = now + clockOffset;
      const expiresAt = new Date(file.accessEndsAt!).getTime();
      const remaining = expiresAt - serverNow;

      if (remaining <= 0) {
        clearInterval(interval);

        if (openedWindow && !openedWindow.closed) {
          openedWindow.close();
        }

        toast.error("Access window has expired");
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 1000);
        return;
      }

      setTimeRemaining(remaining);
    };

    checkExpiration();

    interval = setInterval(checkExpiration, 1000);

    return () => clearInterval(interval);
  }, [file, navigate, openedWindow, clockOffset]);

  const fetchFile = async () => {
    try {
      const response = await fileAPI.getFile(fileId!);

      if (response.data.serverTime) {
        const offset =
          new Date(response.data.serverTime).getTime() - Date.now();
        setClockOffset(offset);
      }

      setFile(response.data.file);

      if (
        response.data.file.fileType === "verySensitive" &&
        !response.data.file.otpVerifiedAt
      ) {
        setShowOTPModal(true);
      }
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.response?.data?.message || "Failed to load file");
      navigate("/");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestOTP = async () => {
    setIsRequestingOTP(true);
    try {
      await fileAPI.requestOTP(fileId!);

      await fetchFile();
      setShowOTPSentModal(true);
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.response?.data?.message || "Failed to send OTP");
    } finally {
      setIsRequestingOTP(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setIsVerifying(true);
    try {
      const response = await fileAPI.verifyOTP(fileId!, otp);

      if (response.data.serverTime) {
        const offset =
          new Date(response.data.serverTime).getTime() - Date.now();
        setClockOffset(offset);
      }

      // Update file state with verification data using functional update
      setFile((prevFile) => {
        if (!prevFile) return prevFile;

        const updatedFile = {
          ...prevFile,
          otpVerifiedAt: new Date().toISOString(),
          isOpened: true,
          accessEndsAt: response.data.accessEndsAt,
        };

        return updatedFile;
      });

      toast.success("OTP verified! You can now access the file");
      setShowOTPModal(false);
      setOtp("");
      setIsVerifying(false);
    } catch (error) {
      console.error("OTP Verification Error:", error);
      const apiError = error as ApiError;
      toast.error(apiError.response?.data?.message || "Invalid OTP");
      setIsVerifying(false);
    }
  };

  const handleDownload = async () => {
    if (!file) {
      toast.error("File information not available");
      return;
    }
    try {
      const response = await fileAPI.downloadFile(fileId!);
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", file.originalName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Download started");
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.response?.data?.message || "Download failed");
    }
  };

  const handleViewFile = () => {
    if (!fileId) return;
    const apiUrl =
      import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";
    const fileUrl = `${apiUrl}/files/${fileId}`;
    const newWindow = window.open(fileUrl, "_blank");
    setOpenedWindow(newWindow);
  };

  const handleSaveOffline = () => {
    if (!file) {
      toast.error("File information not available");
      return;
    }

    if (file.fileType === "sensitive") {
      const now = Date.now();
      const expiryTime = new Date(file.linkExpiresAt).getTime();
      const durationInMinutes = Math.max(
        1,
        Math.floor((expiryTime - now) / (60 * 1000))
      );
      handleDurationConfirm(durationInMinutes);
    } else {
      setShowDurationModal(true);
    }
  };

  const handleDurationConfirm = async (durationInMinutes: number) => {
    if (!file) return;

    try {
      const response = await fileAPI.downloadFile(fileId!, "offline");

      const blob = response.data;

      console.log("Saving blob:", {
        blobType: blob.type,
        mimeType: file.mimeType,
        blobSize: blob.size,
      });

      await saveFileOffline(
        fileId!,
        file.originalName,
        file.mimeType,
        file.size,
        blob,
        durationInMinutes,
        user?._id
      );

      const durationText =
        durationInMinutes < 60
          ? `${durationInMinutes} minutes`
          : durationInMinutes < 1440
            ? `${Math.round(durationInMinutes / 60)} hour(s)`
            : `${Math.round(durationInMinutes / 1440)} day(s)`;

      toast.success(
        (t) => (
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="font-medium">File saved offline!</p>
              <p className="text-sm text-dark-300">
                Available for {durationText}
              </p>
            </div>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                navigate("/offline-files");
              }}
              className="px-3 py-1 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
            >
              View
            </button>
          </div>
        ),
        { duration: 6000 }
      );
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(
        apiError.response?.data?.message || "Failed to save file offline"
      );
    }
  };

  if (isLoading) {
    console.log("Rendering loading state");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-dark-300">Loading file...</p>
        </div>
      </div>
    );
  }

  if (!file) {
    console.log("File is null, returning null");
    return null;
  }

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
        >
          <Card>
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center premium-glow mx-auto mb-4">
                <FileText className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-dark-100 mb-2">
                {file.originalName}
              </h1>
              <p className="text-dark-400">
                {(file.size / 1024 / 1024).toFixed(2)} MB • {file.mimeType}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="glass-effect-light rounded-xl p-4">
                <div className="flex items-center mb-2">
                  <Shield className="w-5 h-5 text-primary-400 mr-2" />
                  <span className="text-dark-300 text-sm">Security Level</span>
                </div>
                <p className="text-dark-100 font-semibold capitalize">
                  {file.fileType === "verySensitive"
                    ? "Very Sensitive"
                    : file.fileType}
                </p>
              </div>

              <div className="glass-effect-light rounded-xl p-4">
                <div className="flex items-center mb-2">
                  <Clock className="w-5 h-5 text-primary-400 mr-2" />
                  <span className="text-dark-300 text-sm">Link Expires</span>
                </div>
                <p className="text-dark-100 font-semibold">
                  {new Date(file.linkExpiresAt).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {file.fileType === "verySensitive" ? (
                file.otpVerifiedAt ? (
                  <>
                    {file.accessEndsAt && timeRemaining > 0 ? (
                      <>
                        <div className="glass-effect-light rounded-xl p-4 mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-dark-300 text-sm">
                              Access Remaining
                            </span>
                            <Clock className="w-4 h-4 text-primary-400" />
                          </div>
                          <p className="text-dark-100 font-bold text-xl">
                            {Math.max(0, Math.floor(timeRemaining / 60000))}{" "}
                            minutes
                          </p>
                          <p className="text-xs text-dark-400 mt-1">
                            Expires at{" "}
                            {new Date(file.accessEndsAt).toLocaleTimeString()}
                          </p>
                        </div>
                        <Button
                          variant="primary"
                          size="lg"
                          icon={Eye}
                          onClick={handleViewFile}
                          className="w-full"
                        >
                          View File
                        </Button>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <Lock className="w-12 h-12 text-red-400 mx-auto mb-4" />
                        <p className="text-dark-200 font-semibold mb-2">
                          Access Window Expired
                        </p>
                        <p className="text-dark-400 text-sm">
                          The {file.openDuration}-minute access window has
                          ended.
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Lock className="w-12 h-12 text-dark-400 mx-auto mb-4" />
                    <p className="text-dark-300 mb-4">
                      This file requires OTP verification to access
                    </p>
                    {file.allowedEmail && (
                      <p className="text-sm text-dark-400 mb-4">
                        Email: {file.allowedEmail}
                      </p>
                    )}
                  </div>
                )
              ) : (
                <>
                  <Button
                    variant="secondary"
                    size="lg"
                    icon={Eye}
                    onClick={handleViewFile}
                    className="w-full"
                  >
                    View File
                  </Button>

                  {file.downloadAllowed && (
                    <Button
                      variant="primary"
                      size="lg"
                      icon={Download}
                      onClick={handleDownload}
                      className="w-full"
                    >
                      Download File
                    </Button>
                  )}

                  {file.offlineAllowed && (
                    <Button
                      variant="secondary"
                      size="lg"
                      icon={Eye}
                      onClick={handleSaveOffline}
                      className="w-full"
                    >
                      Save for Offline
                    </Button>
                  )}
                </>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      <Modal
        isOpen={showOTPModal}
        onClose={() => {
          setShowOTPModal(false);
          navigate("/");
        }}
        title="Verification Required"
      >
        <div className="text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center premium-glow mx-auto">
            <Lock className="w-8 h-8 text-white" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-dark-100 mb-2">
              Protected File
            </h3>
            <p className="text-dark-300">
              This file requires email verification
            </p>
          </div>

          {file.allowedEmail && (
            <div className="glass-effect-light rounded-xl p-4">
              <div className="flex items-center justify-center mb-2">
                <Mail className="w-5 h-5 text-primary-400 mr-2" />
                <span className="text-dark-300 text-sm">Allowed Email</span>
              </div>
              <p className="text-dark-100 font-semibold">{file.allowedEmail}</p>
            </div>
          )}

          <div>
            <Button
              variant="primary"
              onClick={handleRequestOTP}
              isLoading={isRequestingOTP}
              className="w-full mb-4"
            >
              Request OTP
            </Button>

            <Input
              label="Enter 6-digit OTP"
              type="text"
              placeholder="000000"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              maxLength={6}
            />

            <Button
              variant="primary"
              onClick={handleVerifyOTP}
              isLoading={isVerifying}
              disabled={otp.length !== 6}
              className="w-full mt-4"
            >
              Verify OTP
            </Button>
          </div>

          <p className="text-sm text-dark-400">OTP is valid for 5 minutes</p>
        </div>
      </Modal>

      <SuccessModal
        isOpen={showOTPSentModal}
        onClose={() => setShowOTPSentModal(false)}
        title="OTP Sent Successfully!"
        email={file?.allowedEmail}
        emailLabel="An OTP has been sent to:"
        message="A one-time password has been sent to your email. Please check your inbox and enter the 6-digit code to verify and access the file."
        buttonText="Continue"
        onButtonClick={() => setShowOTPSentModal(false)}
      />

      <DurationModal
        isOpen={showDurationModal}
        onClose={() => setShowDurationModal(false)}
        onConfirm={handleDurationConfirm}
        fileName={file?.originalName || ""}
      />
    </div>
  );
};
