"use client";

import { motion } from "framer-motion";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-smooth-gradient relative overflow-hidden">
      <div className="relative z-10 container mx-auto px-4 py-12 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-7xl md:text-8xl font-bold bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            Remindr
          </h1>
        </div>
      </div>
    </div>
  );
}
