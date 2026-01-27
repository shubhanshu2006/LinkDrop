import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Shield } from "lucide-react";
import { Button } from "../components/ui/Button";
import { fileAPI } from "../services/fileService";
import { FileSecurityWrapper } from "../components/FileSecurityWrapper";
import { FileRenderer } from "../components/FileRenderer";
import type { FileData, ApiError } from "../types";
import toast from "react-hot-toast";

export const FileViewer: React.FC = () => {
    const { fileId } = useParams<{ fileId: string }>();
    const [file, setFile] = useState<FileData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const offlineId = new URLSearchParams(location.search).get("offlineId");
    const [clockOffset, setClockOffset] = useState<number>(0);

    useEffect(() => {
        const fetchFileInfo = async () => {
            if (!fileId) return;
            try {
                const response = await fileAPI.getFile(fileId);
                setFile(response.data.file);

                if (response.data.serverTime) {
                    const offset = new Date(response.data.serverTime).getTime() - Date.now();
                    setClockOffset(offset);
                }

                // Security check: if verySensitive and not OTP verified, redirect back to info page
                if (!offlineId && response.data.file.fileType === "verySensitive" && !response.data.file.otpVerifiedAt) {
                    toast.error("OTP verification required");
                    navigate(`/file/${fileId}`);
                }
            } catch (error) {
                const apiError = error as ApiError;
                toast.error(apiError.response?.data?.message || "Failed to load file information");
                navigate("/");
            } finally {
                setIsLoading(false);
            }
        };

        fetchFileInfo();
    }, [fileId, navigate, offlineId]);

    // Handle auto-closure for verySensitive files
    useEffect(() => {
        if (!file || file.fileType !== "verySensitive" || !file.accessEndsAt) return;

        const checkExpiration = () => {
            const now = Date.now();
            const serverNow = now + clockOffset;
            const expiresAt = new Date(file.accessEndsAt!).getTime();

            if (serverNow >= expiresAt) {
                toast.error("Access window has expired");
                navigate(`/file/${fileId}`, { replace: true });
            }
        };

        const interval = setInterval(checkExpiration, 1000);
        return () => clearInterval(interval);
    }, [file, fileId, navigate, clockOffset]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-dark-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    if (!file) return null;

    const isProtected = file.fileType === "sensitive" || file.fileType === "verySensitive";

    return (
        <div className="min-h-screen bg-dark-950 text-dark-100 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="secondary"
                            size="sm"
                            icon={ArrowLeft}
                            onClick={() => navigate(offlineId ? "/offline-files" : `/file/${fileId}`)}
                        >
                            Back
                        </Button>
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold truncate max-w-md">
                                {file.originalName} {offlineId && "(Offline)"}
                            </h1>
                            <div className="flex items-center gap-2 text-dark-400 text-sm">
                                <Shield className={`w-4 h-4 ${isProtected ? "text-primary-400" : "text-green-400"}`} />
                                <span className="capitalize">{file.fileType} Security Level</span>
                            </div>
                        </div>
                    </div>

                    {isProtected && (
                        <div className="bg-primary-500/10 border border-primary-500/20 px-4 py-2 rounded-full hidden md:block">
                            <span className="text-primary-400 text-sm font-medium">
                                Shield Protocol Active - Screenshots & Right-click Protected
                            </span>
                        </div>
                    )}
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-dark-900 rounded-2xl border border-dark-800 shadow-2xl overflow-hidden relative"
                >
                    <FileSecurityWrapper isEnabled={isProtected}>
                        <div className="min-h-[60vh] flex flex-col">
                            <FileRenderer fileId={fileId!} mimeType={file.mimeType} offlineId={offlineId || undefined} />
                        </div>

                        {/* Watermark for protected files */}
                        {isProtected && (
                            <div className="absolute inset-0 pointer-events-none opacity-[0.03] select-none flex flex-wrap gap-20 p-20 items-center justify-center rotate-[-45deg]">
                                {Array.from({ length: 20 }).map((_, i) => (
                                    <span key={i} className="text-4xl font-black">{file.allowedEmail || "PROTECTED CONTENT"}</span>
                                ))}
                            </div>
                        )}
                    </FileSecurityWrapper>
                </motion.div>

                <div className="mt-8 text-center text-dark-400 text-sm">
                    <p>© {new Date().getFullYear()} LinkDrop Secure Viewer</p>
                    <p className="mt-2 italic">Remember: True security depends on responsible information handling.</p>
                </div>
            </div>
        </div>
    );
};
