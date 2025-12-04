"use client";

import { motion } from "framer-motion";
import { AppKitButton } from "@reown/appkit/react";
import { Bell, Sparkles } from "lucide-react";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-smooth-gradient relative overflow-hidden">
      <div className="relative z-10 container mx-auto px-4 py-12 max-w-7xl">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Bell className="w-16 h-16 text-yellow-400" />
            </motion.div>
            <h1 className="text-7xl md:text-8xl font-bold bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Remindr
            </h1>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-10 h-10 text-yellow-400" />
            </motion.div>
          </div>
          
          <p className="text-2xl md:text-3xl font-semibold text-gray-800 dark:text-white/90 mb-4">
            On-chain reminder system for wallet users
          </p>
          <p className="text-lg md:text-xl text-gray-600 dark:text-white/70 mb-8 max-w-2xl mx-auto">
            Never miss a governance vote, token unlock, or important date again. 
            Built with React, Next.js, and Solidity for the Web3 ecosystem.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <AppKitButton />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
