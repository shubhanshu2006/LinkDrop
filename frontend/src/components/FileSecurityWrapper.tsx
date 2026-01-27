import React, { useEffect, useState } from "react";

interface FileSecurityWrapperProps {
    children: React.ReactNode;
    isEnabled: boolean;
}

export const FileSecurityWrapper: React.FC<FileSecurityWrapperProps> = ({
    children,
    isEnabled,
}) => {
    const [isBlurred, setIsBlurred] = useState(false);
    const [isForcedBlurred, setIsForcedBlurred] = useState(false);

    useEffect(() => {
        if (!isEnabled) return;

        let blurTimeout: any;

        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };

        const triggerForceBlur = () => {
            setIsForcedBlurred(true);
            navigator.clipboard.writeText("Content Protected");

            if (blurTimeout) clearTimeout(blurTimeout);
            blurTimeout = setTimeout(() => {
                setIsForcedBlurred(false);
            }, 5000); // 5 seconds of protection
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            // Prevent Print Screen
            if (e.key === "PrintScreen" || e.key === "Meta") {
                triggerForceBlur();
                return false;
            }

            // Prevent Ctrl+S, Ctrl+P, Ctrl+U, Ctrl+Shift+I, F12, Ctrl+C (Copy), Ctrl+V (Paste)
            if (
                (e.ctrlKey && (e.key === "s" || e.key === "p" || e.key === "u" || e.key === "c" || e.key === "v")) ||
                (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "C" || e.key === "J")) ||
                e.key === "F12"
            ) {
                e.preventDefault();
                return false;
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === "PrintScreen") {
                triggerForceBlur();
            }
        };

        const handleBlur = () => {
            setIsBlurred(true);
            navigator.clipboard.writeText("Content Protected");
        };

        const handleFocus = () => {
            setIsBlurred(false);
        };

        const handleVisibilityChange = () => {
            if (document.hidden) {
                setIsBlurred(true);
                navigator.clipboard.writeText("Content Protected");
            } else {
                setIsBlurred(false);
            }
        };

        const preventPaste = (e: ClipboardEvent) => {
            e.preventDefault();
            return false;
        };

        const preventCopy = (e: ClipboardEvent) => {
            e.preventDefault();
            navigator.clipboard.writeText("Content Protected");
            return false;
        };

        const handleBeforePrint = () => {
            setIsBlurred(true);
        };

        window.addEventListener("contextmenu", handleContextMenu);
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        window.addEventListener("blur", handleBlur);
        window.addEventListener("focus", handleFocus);
        window.addEventListener("paste", preventPaste);
        window.addEventListener("copy", preventCopy);
        window.addEventListener("beforeprint", handleBeforePrint);
        document.addEventListener("visibilitychange", handleVisibilityChange);

        // Disable dragging globally for images
        const handleDragStart = (e: DragEvent) => {
            if ((e.target as HTMLElement).tagName === "IMG") {
                e.preventDefault();
            }
        };
        window.addEventListener("dragstart", handleDragStart);

        return () => {
            window.removeEventListener("contextmenu", handleContextMenu);
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
            window.removeEventListener("blur", handleBlur);
            window.removeEventListener("focus", handleFocus);
            window.removeEventListener("paste", preventPaste);
            window.removeEventListener("copy", preventCopy);
            window.removeEventListener("beforeprint", handleBeforePrint);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("dragstart", handleDragStart);
            if (blurTimeout) clearTimeout(blurTimeout);
        };
    }, [isEnabled]);

    if (!isEnabled) return <>{children}</>;

    const activeBlur = isBlurred || isForcedBlurred;

    return (
        <div className="relative w-full h-full select-none" onContextMenu={(e) => e.preventDefault()}>
            <style>{`
        @media print {
          body { display: none !important; }
        }
        .security-blur {
          filter: blur(40px) grayscale(100%);
          transition: filter 0.2s ease;
          pointer-events: none;
          user-select: none;
        }
        .security-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(10, 10, 10, 0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          color: white;
          text-align: center;
          padding: 20px;
          backdrop-filter: blur(10px);
        }
        img {
          -webkit-user-drag: none;
          -khtml-user-drag: none;
          -moz-user-drag: none;
          -o-user-drag: none;
        }
      `}</style>

            <div className={activeBlur ? "security-blur" : ""}>
                {children}
            </div>

            {activeBlur && (
                <div className="security-overlay">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">Content Protected</h2>
                        <p>{isForcedBlurred ? "System key or screenshot detected. Protection active for 5 seconds." : "Please focus the window to view the sensitive file."}</p>
                    </div>
                </div>
            )}
        </div>
    );
};
