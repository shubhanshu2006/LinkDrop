import React, { useEffect, useState } from "react";
import { Monitor, Smartphone, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

export const MobileBlocker: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
            const mobileRegex = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;

            const isMobileUA = mobileRegex.test(userAgent.toLowerCase());
            const isSmallScreen = window.innerWidth <= 1024; // Including tablets for higher security

            setIsMobile(isMobileUA || isSmallScreen);
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    if (isMobile) {
        return (
            <div className="fixed inset-0 z-[9999] bg-dark-950 flex items-center justify-center p-6 text-center overflow-hidden">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-dark-900 border border-dark-800 rounded-3xl p-10 shadow-2xl relative"
                >
                    {/* Decorative glows */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-primary-500/20 blur-[60px] pointer-events-none" />

                    <div className="bg-primary-500/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-primary-500/20">
                        <Monitor className="w-10 h-10 text-primary-500" />
                    </div>

                    <div className="flex items-center justify-center gap-2 mb-4 text-primary-400">
                        <AlertTriangle className="w-5 h-5" />
                        <span className="text-sm font-bold uppercase tracking-widest">Desktop Required</span>
                    </div>

                    <h1 className="text-3xl font-black text-white mb-6 leading-tight">
                        Security Protocol <br />
                        <span className="text-primary-500">Restricted Access</span>
                    </h1>

                    <p className="text-dark-300 text-lg mb-8 leading-relaxed">
                        To ensure maximum protection for sensitive files and prevent unauthorized screen captures, LinkDrop requires a desktop-class browser.
                    </p>

                    <div className="flex flex-col gap-4 text-left bg-dark-950/50 border border-dark-800 rounded-2xl p-6">
                        <div className="flex items-start gap-4">
                            <div className="bg-green-500/20 p-2 rounded-lg mt-1">
                                <Monitor className="w-5 h-5 text-green-500" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold">Safe Access</h3>
                                <p className="text-dark-400 text-sm">Please open this link on your Desktop or Laptop computer.</p>
                            </div>
                        </div>

                        <div className="h-px bg-dark-800" />

                        <div className="flex items-start gap-4 opacity-50">
                            <div className="bg-red-500/20 p-2 rounded-lg mt-1">
                                <Smartphone className="w-5 h-5 text-red-500" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold">Mobile Blocked</h3>
                                <p className="text-dark-400 text-sm">Mobile devices and tablets are restricted for security reasons.</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 pt-6 border-t border-dark-800">
                        <p className="text-dark-500 text-xs font-medium">SHIELD PROTECTION v2.0</p>
                    </div>
                </motion.div>
            </div>
        );
    }

    return <>{children}</>;
};
