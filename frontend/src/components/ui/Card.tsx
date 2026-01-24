import React from "react";
import { motion } from "framer-motion";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  hover = true,
}) => {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.02 } : {}}
      className={`card ${className}`}
    >
      {children}
    </motion.div>
  );
};
