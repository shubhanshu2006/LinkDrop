import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { SuccessModal } from "../components/ui/SuccessModal";
import { authAPI } from "../services/authService";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import type { ApiError } from "../types";
import logo from "../assets/logo.png";

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await authAPI.forgotPassword(email);
      setShowSuccessModal(true);
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(
        apiError.response?.data?.message || "Failed to send reset link"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-500/20 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center premium-glow mx-auto mb-4 p-2"
          >
            <img
              src={logo}
              alt="LinkDrop"
              className="w-full h-full object-contain"
            />
          </motion.div>
          <h1 className="text-4xl font-bold gradient-text font-serif mb-2">
            Forgot Password?
          </h1>
          <p className="text-dark-300">We'll send you a reset link</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                icon={ArrowRight}
                isLoading={isLoading}
              >
                Send Reset Link
              </Button>
            </div>
          </form>
        </div>
      </motion.div>

     
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          navigate("/login");
        }}
        title="Reset Link Sent!"
        email={email}
        emailLabel="A password reset email has been sent to:"
        message="We've sent a password reset link to your email. Please check your inbox and click the link to reset your password. The link will expire in 1 hour."
        buttonText="Okay"
        onButtonClick={() => {
          setShowSuccessModal(false);
          navigate("/login");
        }}
      />
    </div>
  );
};
