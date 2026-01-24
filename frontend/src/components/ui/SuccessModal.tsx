import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Mail } from "lucide-react";
import { Button } from "./Button";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  email?: string;
  emailLabel?: string;
  message: string;
  buttonText?: string;
  onButtonClick?: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  title,
  email,
  emailLabel = "A verification email has been sent to:",
  message,
  buttonText = "Continue",
  onButtonClick,
}) => {
  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick();
    } else {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-dark-900 rounded-2xl premium-shadow w-full max-w-md overflow-hidden"
            >
              <div className="flex flex-col items-center pt-8 pb-6 px-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-6 premium-glow"
                >
                  <CheckCircle
                    className="w-10 h-10 text-white"
                    strokeWidth={2.5}
                  />
                </motion.div>

                <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>

                {email && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="w-full bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-xl p-6 mb-4"
                  >
                    <div className="flex items-center justify-center mb-3">
                      <Mail className="w-8 h-8 text-red-400" />
                    </div>
                    <p className="text-dark-200 text-center text-sm mb-2">
                      {emailLabel}
                    </p>
                    <p className="text-red-300 text-center font-semibold text-lg">
                      {email}
                    </p>
                  </motion.div>
                )}

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-dark-300 text-center text-sm leading-relaxed mb-6 px-2"
                >
                  {message}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="w-full"
                >
                  <Button
                    onClick={handleButtonClick}
                    className="w-full bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white font-semibold py-3 text-lg"
                  >
                    {buttonText}
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
