import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { SuccessModal } from "../components/ui/SuccessModal";
import { authAPI } from "../services/authService";
import toast from "react-hot-toast";
import type { ApiError } from "../types";
import logo from "../assets/logo.png";

export const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Invalid or missing reset token");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);
    try {
      await authAPI.resetPassword(token, password);
      setShowSuccessModal(true);
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(
        apiError.response?.data?.message || "Failed to reset password"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-dark-100 mb-4">
            Invalid Reset Link
          </h2>
          <p className="text-dark-300 mb-6">
            This password reset link is invalid or has expired.
          </p>
          <Button onClick={() => navigate("/forgot-password")}>
            Request New Link
          </Button>
        </div>
      </div>
    );
  }

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
            Reset Password
          </h1>
          <p className="text-dark-300">Enter your new password</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              showPasswordToggle
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              showPasswordToggle
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
                Reset Password
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
        title="Password Reset Successful!"
        message="Your password has been successfully reset. You can now log in with your new password."
        buttonText="Go to Login"
        onButtonClick={() => {
          setShowSuccessModal(false);
          navigate("/login");
        }}
      />
    </div>
  );
};
