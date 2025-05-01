"use client";

import { motion } from "framer-motion";
import { Github } from "lucide-react";

export default function Loader({ version }: { version: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-screen px-4 text-center bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-500">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          duration: 0.6,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className="flex flex-col sm:flex-row items-center gap-3"
      >
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-github-blue to-github-green bg-clip-text text-transparent">
          Welcome to iLoveGithub{" "}
          <span className="block sm:inline text-base sm:text-sm font-normal">
            v{version}
          </span>
        </h1>
      </motion.div>
    </div>
  );
}
