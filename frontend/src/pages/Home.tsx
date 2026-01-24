import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield,
  Lock,
  Clock,
  Download,
  Eye,
  FileCheck,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

export const Home: React.FC = () => {
  const features = [
    {
      icon: Shield,
      title: "Three Security Levels",
      description:
        "Choose between Normal, Sensitive, and Very Sensitive file protection based on your needs.",
      color: "from-primary-500 to-primary-600",
    },
    {
      icon: Lock,
      title: "OTP Verification",
      description:
        "Very sensitive files require email verification and one-time passwords for maximum security.",
      color: "from-accent-500 to-accent-600",
    },
    {
      icon: Clock,
      title: "Time-Based Access",
      description:
        "Set precise link expiry times and control how long files remain accessible.",
      color: "from-primary-600 to-accent-500",
    },
    {
      icon: Download,
      title: "Download Control",
      description:
        "Prevent downloads for sensitive files while allowing secure online viewing.",
      color: "from-accent-600 to-primary-500",
    },
    {
      icon: Eye,
      title: "Offline Access Control",
      description:
        "Manage whether files can be saved for offline viewing through the website.",
      color: "from-primary-500 to-accent-600",
    },
    {
      icon: FileCheck,
      title: "Anonymous Uploads",
      description:
        "Upload files without registration, then claim them later when you create an account.",
      color: "from-accent-500 to-primary-600",
    },
  ];

  const securityLevels = [
    {
      icon: CheckCircle,
      name: "Normal File",
      description: "Free downloads and offline saves while link is active",
      features: [
        "Device download allowed",
        "Website offline save allowed",
        "Receiver controls offline duration",
        "Optional link expiry",
        "No OTP required",
      ],
      color: "from-green-500 to-green-600",
      useCase: "Perfect for: Assignments, general file sharing",
    },
    {
      icon: AlertTriangle,
      name: "Sensitive File",
      description: "View-only with controlled offline access until expiry",
      features: [
        "Device download disabled",
        "Website offline save enabled",
        "Sender controls expiry time",
        "Auto-delete at expiry",
        "No OTP required",
      ],
      color: "from-accent-500 to-accent-600",
      useCase: "Perfect for: Temporary private sharing, timed documents",
    },
    {
      icon: XCircle,
      name: "Very Sensitive File",
      description: "Maximum security with email verification and time window",
      features: [
        "Device download disabled",
        "Website offline save disabled",
        "OTP verification required",
        "Specific email only",
        "Fixed viewing duration",
      ],
      color: "from-red-500 to-red-600",
      useCase: "Perfect for: Confidential documents, single-viewer files",
    },
  ];

  return (
    <div className="min-h-screen">
      <section className="relative -mt-8 pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-float"></div>
          <div
            className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl animate-float"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl animate-float"
            style={{ animationDelay: "4s" }}
          ></div>
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-6xl md:text-7xl font-bold font-serif mb-6">
              <span className="gradient-text">Secure File Sharing</span>
              <br />
              <span className="text-dark-100">Redefined</span>
            </h1>
            <p className="text-xl md:text-2xl text-dark-300 mb-8 max-w-3xl mx-auto">
              Give senders precise control over how files are accessed, stored,
              and expired. Three security levels. Zero compromises.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button variant="primary" size="lg" icon={ArrowRight}>
                  Get Started Free
                </Button>
              </Link>
              <a href="#features">
                <Button variant="secondary" size="lg" icon={Shield}>
                  Explore Features
                </Button>
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-16"
          >
            <div className="glass-effect-light rounded-3xl p-8 premium-shadow max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold gradient-text mb-2">3</div>
                  <div className="text-dark-300">Security Levels</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold gradient-text mb-2">
                    100%
                  </div>
                  <div className="text-dark-300">Server Side Enforced</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold gradient-text mb-2">∞</div>
                  <div className="text-dark-300">Unlimited File Size </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="features" className="py-20 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold font-serif mb-4">
              <span className="gradient-text">Premium Features</span>
            </h2>
            <p className="text-xl text-dark-300 max-w-2xl mx-auto">
              Enterprise-grade security with consumer-friendly simplicity
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 premium-glow`}
                  >
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-dark-100 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-dark-300">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="security" className="py-20 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold font-serif mb-4">
              <span className="gradient-text">Three Security Levels</span>
            </h2>
            <p className="text-xl text-dark-300 max-w-2xl mx-auto">
              Choose the perfect balance between accessibility and protection
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {securityLevels.map((level, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <div
                    className={`w-16 h-16 rounded-xl bg-gradient-to-br ${level.color} flex items-center justify-center mb-4 premium-glow mx-auto`}
                  >
                    <level.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-center text-dark-100 mb-2">
                    {level.name}
                  </h3>
                  <p className="text-dark-300 text-center mb-6">
                    {level.description}
                  </p>
                  <ul className="space-y-3 mb-6">
                    {level.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-primary-400 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-dark-200">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto pt-4 border-t border-dark-800">
                    <p className="text-sm text-dark-400 italic">
                      {level.useCase}
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 relative">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold font-serif mb-4">
              <span className="gradient-text">How It Works</span>
            </h2>
            <p className="text-xl text-dark-300">
              Simple process, powerful security
            </p>
          </motion.div>

          <div className="space-y-8">
            {[
              {
                step: "01",
                title: "Upload Your File",
                description:
                  "Choose a file and select your desired security level. No registration required for basic uploads.",
              },
              {
                step: "02",
                title: "Configure Security",
                description:
                  "Set link expiry, allowed email (for very sensitive), and access duration. All rules enforced server-side.",
              },
              {
                step: "03",
                title: "Share Securely",
                description:
                  "Get a unique link to share. Recipients access files according to your exact specifications.",
              },
              {
                step: "04",
                title: "Auto-Enforcement",
                description:
                  "Backend automatically enforces all rules - expiry, downloads, offline access, and OTP verification.",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <div className="flex items-start">
                    <div className="text-5xl font-bold gradient-text font-serif mr-6">
                      {item.step}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-dark-100 mb-2">
                        {item.title}
                      </h3>
                      <p className="text-dark-300">{item.description}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-effect-light rounded-3xl p-12 premium-shadow"
          >
            <h2 className="text-4xl md:text-5xl font-bold font-serif mb-4">
              <span className="gradient-text">Ready to Get Started?</span>
            </h2>
            <p className="text-xl text-dark-300 mb-8">
              Join thousands who trust LinkDrop with their sensitive files
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button variant="primary" size="lg" icon={ArrowRight}>
                  Create Free Account
                </Button>
              </Link>
              <Link to="/upload">
                <Button variant="secondary" size="lg" icon={Shield}>
                  Upload Without Account
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
