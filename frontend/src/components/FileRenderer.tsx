import React, { useEffect, useState } from "react";
import { fileAPI } from "../services/fileService";
import { FileText, AlertCircle } from "lucide-react";
import { getOfflineFile } from "../utils/indexedDB";

interface FileRendererProps {
    fileId: string;
    mimeType: string;
    offlineId?: string;
    onLoad?: () => void;
}

export const FileRenderer: React.FC<FileRendererProps> = ({
    fileId,
    mimeType,
    offlineId,
    onLoad,
}) => {
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchFile = async () => {
            try {
                setIsLoading(true);
                let blob: Blob;

                if (offlineId) {
                    const offlineData = await getOfflineFile(offlineId);
                    if (!offlineData) throw new Error("Offline file not found");
                    blob = offlineData.blob;
                } else {
                    const response = await fileAPI.getFileContent(fileId);
                    blob = response.data;
                }

                const url = URL.createObjectURL(blob);
                setBlobUrl(url);
                onLoad?.();
            } catch (err) {
                console.error("Error fetching file:", err);
                setError("Failed to load file content.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchFile();

        return () => {
            if (blobUrl) {
                URL.revokeObjectURL(blobUrl);
            }
        };
    }, [fileId]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-red-500">
                <AlertCircle className="w-12 h-12 mb-4" />
                <p>{error}</p>
            </div>
        );
    }

    if (!blobUrl) return null;

    if (mimeType.startsWith("image/")) {
        return (
            <div className="flex justify-center p-4">
                <img
                    src={blobUrl}
                    alt="Shared file"
                    className="max-w-full h-auto rounded-lg shadow-2xl pointer-events-none"
                    draggable={false}
                />
            </div>
        );
    }

    if (mimeType === "application/pdf") {
        return (
            <div className="w-full h-[80vh] bg-dark-900 rounded-lg overflow-hidden">
                <iframe
                    src={`${blobUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                    className="w-full h-full border-none"
                    title="PDF Viewer"
                />
            </div>
        );
    }

    if (mimeType.startsWith("text/")) {
        return (
            <div className="p-8 bg-dark-900 rounded-lg shadow-xl overflow-auto max-h-[80vh]">
                <iframe
                    src={blobUrl}
                    className="w-full h-[60vh] bg-white text-black"
                    title="Text Viewer"
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center p-20 text-dark-300">
            <FileText className="w-16 h-16 mb-4" />
            <p className="text-xl font-semibold mb-2">Preview Not Available</p>
            <p>This file type ({mimeType}) cannot be previewed in the secure viewer.</p>
        </div>
    );
};
