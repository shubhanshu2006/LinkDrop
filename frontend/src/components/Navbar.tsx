import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Menu,
  X,
  Shield,
  LayoutDashboard,
  HardDrive,
  Settings,
  LogOut,
  ChevronRight,
  Upload,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { Button } from "./ui/Button";
import logo from "../assets/logo.png";

export const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target.id === "features") setActiveSection("features");
            else if (entry.target.id === "security")
              setActiveSection("security");
            else setActiveSection("home");
          }
        });
      },
      { threshold: 0.5 } // Trigger when 50% visible
    );

    const observeSections = () => {
      const home = document.getElementById("home-hero");
      if (home) observer.observe(home);

      const features = document.getElementById("features");
      const security = document.getElementById("security");

      if (window.scrollY < 300) setActiveSection("home");

      if (features) observer.observe(features);
      if (security) observer.observe(security);
    };

    observeSections();

    const handleActiveScroll = () => {
      if (window.scrollY < 400) setActiveSection("home");
    };
    window.addEventListener("scroll", handleActiveScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("scroll", handleActiveScroll);
      observer.disconnect();
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/");
    setIsMenuOpen(false);
  };

  const handleNavClick = (path: string, isHash: boolean) => {
    if (isHash) {
      if (location.pathname !== "/") {
        navigate("/");
        setTimeout(() => {
          const id = path.substring(2);
          document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } else {
        const id = path.substring(2);
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate(path);
      window.scrollTo(0, 0);
    }
    setIsMenuOpen(false);
  };

  const navLinks = [
    { name: "Home", path: "/", isHash: false },
    { name: "Features", path: "/#features", isHash: true },
    { name: "Security", path: "/#security", isHash: true },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        scrolled
          ? "bg-dark-950/80 backdrop-blur-xl border-transparent py-4 md:py-4 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]"
          : "bg-dark-950/80 md:bg-transparent backdrop-blur-xl border-transparent py-4 md:py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 group">
            <motion.div
              whileHover={{ rotate: 10 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-primary-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <img
                src={logo}
                alt="LinkDrop"
                className="w-10 h-10 object-contain relative z-10"
              />
            </motion.div>
            <span className="text-2xl font-bold font-serif tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-primary-400 group-hover:to-accent-400 transition-all duration-300">
              LinkDrop
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-1 p-1 bg-white/5 backdrop-blur-md rounded-full border border-white/5 shadow-2xl">
            {[
              { name: "Home", id: "home" },
              { name: "Features", id: "features" },
              { name: "Security", id: "security" },
            ].map((link) => (
              <button
                key={link.name}
                onClick={() =>
                  handleNavClick(
                    link.id === "home" ? "/" : `/#${link.id}`,
                    link.id !== "home"
                  )
                }
                className={`relative px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeSection === link.id
                    ? "text-white shadow-[0_0_20px_rgba(236,72,153,0.3)]"
                    : "text-dark-300 hover:text-white hover:bg-white/5"
                }`}
              >
                {activeSection === link.id && (
                  <motion.div
                    layoutId="activePill"
                    className="absolute inset-0 bg-gradient-to-r from-primary-600 to-accent-600 rounded-full -z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{link.name}</span>
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="primary"
              size="sm"
              icon={Upload}
              onClick={() => navigate("/upload")}
              className="!bg-gradient-to-r !from-primary-600 !to-primary-700 !shadow-[0_0_15px_rgba(236,72,153,0.4)] hover:!shadow-[0_0_25px_rgba(236,72,153,0.6)] !border-none"
            >
              Upload
            </Button>

            <Button
              variant="secondary"
              size="sm"
              icon={HardDrive}
              onClick={() => navigate("/offline-files")}
              className="!bg-dark-800/80 !border-white/10 hover:!bg-dark-700 hover:!border-primary-500/50"
            >
              Saved Files
            </Button>

            <div className="w-px h-8 bg-gradient-to-b from-transparent via-white/10 to-transparent" />

            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center space-x-3 pl-2 pr-1 py-1 rounded-full hover:bg-white/5 transition-all duration-300 border border-transparent hover:border-white/5">
                  <span className="text-sm font-medium text-dark-100 max-w-[100px] truncate">
                    {user?.fullName?.split(" ")[0]}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg ring-2 ring-transparent group-hover:ring-primary-500/30 transition-all">
                    <User className="w-4 h-4 text-white" />
                  </div>
                </button>

                <div className="absolute right-0 mt-2 w-60 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right scale-95 group-hover:scale-100 pt-2">
                  <div className="glass-effect bg-dark-900/95 rounded-2xl p-2 shadow-2xl border border-white/10 backdrop-blur-xl">
                    <div className="px-4 py-3 border-b border-white/5 mb-2">
                      <p className="text-sm text-dark-400">Signed in as</p>
                      <p className="text-sm font-semibold text-white truncate">
                        {user?.email}
                      </p>
                    </div>

                    <button
                      onClick={() => navigate("/dashboard")}
                      className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-dark-200 hover:text-white hover:bg-white/5 rounded-xl transition-all group/item"
                    >
                      <LayoutDashboard className="w-4 h-4 group-hover/item:text-primary-400" />
                      <span>Dashboard</span>
                    </button>

                    {user?.role === "admin" && (
                      <button
                        onClick={() => navigate("/admin")}
                        className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-dark-200 hover:text-white hover:bg-white/5 rounded-xl transition-all group/item"
                      >
                        <Shield className="w-4 h-4 group-hover/item:text-accent-400" />
                        <span>Admin Console</span>
                      </button>
                    )}

                    <button
                      onClick={() => navigate("/settings")}
                      className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-dark-200 hover:text-white hover:bg-white/5 rounded-xl transition-all group/item"
                    >
                      <Settings className="w-4 h-4 group-hover/item:text-primary-400" />
                      <span>Settings</span>
                    </button>

                    <div className="h-px bg-white/5 my-2" />

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate("/login")}
                  className="text-sm font-medium text-dark-200 hover:text-white transition-colors"
                >
                  Log in
                </button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate("/register")}
                  className="!py-2 !px-5 !rounded-full shadow-lg shadow-primary-500/20"
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden relative z-50 p-2 text-dark-200 hover:text-white transition-colors"
          >
            <motion.div
              animate={{ rotate: isMenuOpen ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </motion.div>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="md:hidden absolute top-full left-0 right-0 bg-black border-b border-white/5 shadow-2xl overflow-hidden"
          >
            <div className="px-6 py-8 space-y-6">
              <div className="space-y-2">
                {navLinks.map((link) => (
                  <button
                    key={link.name}
                    onClick={() => handleNavClick(link.path, link.isHash)}
                    className="block w-full text-left text-lg font-medium text-dark-200 hover:text-white hover:bg-white/5 px-4 py-3 rounded-xl transition-all"
                  >
                    {link.name}
                  </button>
                ))}
              </div>

              <div className="h-px bg-white/5" />

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    navigate("/upload");
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center justify-center space-x-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all"
                >
                  <Upload className="w-5 h-5" />
                  <span>Upload</span>
                </button>
                <button
                  onClick={() => {
                    navigate("/offline-files");
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center justify-center space-x-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all"
                >
                  <HardDrive className="w-5 h-5" />
                  <span>Offline</span>
                </button>
              </div>

              {isAuthenticated ? (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center space-x-3 px-4 py-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">
                        {user?.fullName}
                      </p>
                      <p className="text-sm text-dark-400 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      navigate("/dashboard");
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 text-dark-200 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <LayoutDashboard className="w-5 h-5" />
                      <span>Dashboard</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-dark-500" />
                  </button>

                  <button
                    onClick={() => {
                      navigate("/settings");
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 text-dark-200 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <Settings className="w-5 h-5" />
                      <span>Settings</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-dark-500" />
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all mt-4"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4 pt-4">
                  <button
                    onClick={() => {
                      navigate("/login");
                      setIsMenuOpen(false);
                    }}
                    className="w-full py-3 text-dark-200 hover:text-white font-medium transition-colors"
                  >
                    Log in
                  </button>
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => {
                      navigate("/register");
                      setIsMenuOpen(false);
                    }}
                  >
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
