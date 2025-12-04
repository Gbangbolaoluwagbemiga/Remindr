"use client";

import { motion } from "framer-motion";
import { AppKitButton } from "@reown/appkit/react";
import { Bell, Sparkles, Shield, Zap, Wallet, Globe, Smartphone, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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

        {/* Features Section */}
        <section className="mb-20">
          <h2 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            ✨ Features
          </h2>
          <p className="text-center text-gray-600 dark:text-white/70 mb-12 text-lg">
            Everything you need to stay organized on-chain
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-white/80 dark:bg-white/10 backdrop-blur-lg border-gray-200/50 dark:border-white/20">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-blue-400" />
                </div>
                <CardTitle className="text-gray-900 dark:text-white">
                  On-chain Storage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 dark:text-white/70">
                  Reminders stored permanently on Base blockchain
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-white/10 backdrop-blur-lg border-gray-200/50 dark:border-white/20">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-yellow-400" />
                </div>
                <CardTitle className="text-gray-900 dark:text-white">
                  Gas Optimized
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 dark:text-white/70">
                  Efficient smart contract design
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-white/10 backdrop-blur-lg border-gray-200/50 dark:border-white/20">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-4">
                  <Bell className="w-6 h-6 text-purple-400" />
                </div>
                <CardTitle className="text-gray-900 dark:text-white">
                  Smart Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 dark:text-white/70">
                  Browser notifications + in-app toast alerts
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-white/10 backdrop-blur-lg border-gray-200/50 dark:border-white/20">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-4">
                  <Wallet className="w-6 h-6 text-green-400" />
                </div>
                <CardTitle className="text-gray-900 dark:text-white">
                  Wallet Integration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 dark:text-white/70">
                  Reown (WalletConnect) AppKit for easy connection
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-white/10 backdrop-blur-lg border-gray-200/50 dark:border-white/20">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-cyan-400" />
                </div>
                <CardTitle className="text-gray-900 dark:text-white">
                  Multi-chain Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 dark:text-white/70">
                  Deployable on Base and Celo networks
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-white/10 backdrop-blur-lg border-gray-200/50 dark:border-white/20">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-4">
                  <Smartphone className="w-6 h-6 text-pink-400" />
                </div>
                <CardTitle className="text-gray-900 dark:text-white">
                  Responsive Design
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 dark:text-white/70">
                  Works perfectly on desktop and mobile
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Smart Contract Section */}
        <section className="mb-20">
          <h2 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            🔗 Smart Contract
          </h2>
          <p className="text-center text-gray-600 dark:text-white/70 mb-8 text-lg">
            Deployed and verified on Base blockchain
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card className="bg-white/80 dark:bg-white/10 backdrop-blur-lg border-gray-200/50 dark:border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Globe className="w-5 h-5 text-blue-400" />
                  Base Mainnet
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-mono text-sm text-gray-700 dark:text-white/80 mb-4 break-all">
                  0xfe4a4d81E4f0F17CA959b07D39Ab18493efc4B0C
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  asChild
                >
                  <a
                    href="https://basescan.org/address/0xfe4a4d81E4f0F17CA959b07D39Ab18493efc4B0C"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on Explorer
                    <ExternalLink className="ml-2 w-4 h-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-white/10 backdrop-blur-lg border-gray-200/50 dark:border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Globe className="w-5 h-5 text-blue-400" />
                  Base Sepolia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-mono text-sm text-gray-700 dark:text-white/80 mb-4 break-all">
                  0x8Eec6d38AB8fd67A13787C7dF79B953d4FD1810C
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  asChild
                >
                  <a
                    href="https://sepolia.basescan.org/address/0x8Eec6d38AB8fd67A13787C7dF79B953d4FD1810C"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on Explorer
                    <ExternalLink className="ml-2 w-4 h-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
