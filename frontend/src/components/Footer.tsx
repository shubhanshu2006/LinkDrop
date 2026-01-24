import React from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  Heart,
  Shield,
  Upload,
  Lock,
  Github,
  Twitter,
  Linkedin,
} from "lucide-react";
import logo from "../assets/logo.png";

export const Footer: React.FC = () => {
  const scrollToSection = (sectionId: string) => {
    const target = document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.href = `/#${sectionId}`;
    }
  };

  return (
    <footer className="relative mt-20 border-t border-dark-800/50 bg-gradient-to-b from-dark-950 to-dark-950/95">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-accent-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/10 to-accent-500/10 flex items-center justify-center border border-primary-500/20">
                <img
                  src={logo}
                  alt="LinkDrop"
                  className="w-9 h-9 object-contain"
                />
              </div>
              <span className="text-2xl font-bold gradient-text font-serif tracking-tight">
                LinkDrop
              </span>
            </div>
            <p className="text-dark-300 text-base max-w-md mb-6 leading-relaxed">
              Secure file sharing with precise control over access, storage, and
              expiry. Three security levels. Zero compromises.
            </p>

            <div className="flex flex-wrap gap-3">
              <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                <Shield className="w-4 h-4 text-primary-400" />
                <span className="text-xs font-medium text-dark-200">
                  End-to-End Security
                </span>
              </div>
              <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                <Lock className="w-4 h-4 text-accent-400" />
                <span className="text-xs font-medium text-dark-200">
                  OTP Protection
                </span>
              </div>
              <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                <Upload className="w-4 h-4 text-primary-400" />
                <span className="text-xs font-medium text-dark-200">
                  Anonymous Upload
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">
              Product
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#top"
                  onClick={(e) => {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="text-dark-300 hover:text-primary-400 transition-colors text-sm flex items-center group cursor-pointer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-500/50 mr-2 group-hover:bg-primary-400 transition-colors"></span>
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#features"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("features");
                  }}
                  className="text-dark-300 hover:text-primary-400 transition-colors text-sm cursor-pointer flex items-center group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-500/50 mr-2 group-hover:bg-primary-400 transition-colors"></span>
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#security"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("security");
                  }}
                  className="text-dark-300 hover:text-primary-400 transition-colors text-sm cursor-pointer flex items-center group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-500/50 mr-2 group-hover:bg-primary-400 transition-colors"></span>
                  Security
                </a>
              </li>
              <li>
                <Link
                  to="/upload"
                  className="text-dark-300 hover:text-primary-400 transition-colors text-sm flex items-center group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-500/50 mr-2 group-hover:bg-primary-400 transition-colors"></span>
                  Upload File
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className="text-dark-300 hover:text-primary-400 transition-colors text-sm flex items-center group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-500/50 mr-2 group-hover:bg-primary-400 transition-colors"></span>
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">
              Get in Touch
            </h3>
            <div className="space-y-4">
              <a
                href="https://mail.google.com/mail/?view=cm&to=shubhanshus450@gmail.com"
                target="_blank"
                className="inline-flex items-center space-x-3 text-dark-300 hover:text-primary-400 transition-all group"
                rel="noopener noreferrer"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500/10 to-accent-500/10 border border-primary-500/20 group-hover:border-primary-500/40 flex items-center justify-center transition-all">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-dark-400">Email Us</p>
                  <p className="text-sm font-medium">Contact Support</p>
                </div>
              </a>

              <div className="pt-4">
                <p className="text-xs text-dark-400 mb-3 uppercase tracking-wider">
                  Follow Us
                </p>
                <div className="flex items-center space-x-3">
                  <a
                    href="https://github.com/shubhanshu2006"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary-500/40 flex items-center justify-center transition-all group"
                    aria-label="GitHub"
                  >
                    <Github className="w-4 h-4 text-dark-300 group-hover:text-primary-400 transition-colors" />
                  </a>
                  <a
                    href="https://x.com/shubhanshu__10"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary-500/40 flex items-center justify-center transition-all group"
                    aria-label="Twitter"
                  >
                    <Twitter className="w-4 h-4 text-dark-300 group-hover:text-primary-400 transition-colors" />
                  </a>
                  <a
                    href="https://www.linkedin.com/in/shubhanshu-singh-684131333/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary-500/40 flex items-center justify-center transition-all group"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="w-4 h-4 text-dark-300 group-hover:text-primary-400 transition-colors" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-dark-400 text-sm">
              © {new Date().getFullYear()} LinkDrop. All rights reserved.
            </p>

            <p className="text-dark-400 text-sm flex items-center">
              Made with{" "}
              <Heart
                className="w-4 h-4 mx-1.5 text-red-500 animate-pulse"
                fill="currentColor"
              />{" "}
              by
              <span className="ml-1 font-medium text-dark-200">
                Shubhanshu Singh
              </span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
