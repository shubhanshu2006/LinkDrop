import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User as UserIcon, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { SuccessModal } from "../components/ui/SuccessModal";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import type { ApiError } from "../types";
import logo from "../assets/logo.png";

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { register, claimAnonFiles, user } = useAuthStore();
  const navigate = useNavigate();
  const isAnonymous = user?.isAnonymous;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      if (isAnonymous) {
        await claimAnonFiles(
          formData.email,
          formData.password,
          formData.fullName
        );
        toast.success(
          "Account created and your anonymous files have been claimed!"
        );
        navigate("/dashboard");
      } else {
        await register(formData.email, formData.password, formData.fullName);

        setShowSuccessModal(true);
      }
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.response?.data?.message || "Registration failed");
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
            {isAnonymous ? "Claim Your Files" : "Join LinkDrop"}
          </h1>
          <p className="text-dark-300">
            {isAnonymous
              ? "Create an account to access your uploaded files"
              : "Secure file sharing with premium control"}
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Full Name"
              type="text"
              placeholder="John Doe"
              icon={UserIcon}
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              required
            />

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              icon={Mail}
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              showPasswordToggle
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              showPasswordToggle
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
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
                Create Account
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-dark-300">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary-400 hover:text-primary-300 font-semibold transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-dark-400 mt-6">
          By creating an account, you agree to our Terms of Service and Privacy
          Policy
        </p>
      </motion.div>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          navigate("/login");
        }}
        title="Registration Successful!"
        email={formData.email}
        message="Please check your inbox and click the verification link to activate your account. Don't forget to check your spam folder if you don't see the email."
        buttonText="Go to Login"
        onButtonClick={() => {
          setShowSuccessModal(false);
          navigate("/login");
        }}
      />
    </div>
  );
};
