"use client";

import { motion } from "framer-motion";
import { AppKitButton } from "@reown/appkit/react";
import { Bell, Sparkles, Shield, Zap, Wallet, Globe, Smartphone, ExternalLink, Code, CheckCircle2, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-smooth-gradient relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-[32rem] h-[32rem] dark:bg-purple-600 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl dark:opacity-20 opacity-25 animate-blob"
          animate={{ x: [0, 100, 0], y: [0, 100, 0] }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-[32rem] h-[32rem] dark:bg-cyan-600 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl dark:opacity-18 opacity-25 animate-blob animation-delay-2000"
          animate={{ x: [0, -100, 0], y: [0, -100, 0] }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 md:py-16 max-w-7xl">
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

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <AppKitButton />
            </motion.div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/50">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Live
            </Badge>
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/50">
              <Code className="w-3 h-3 mr-1" />
              Solidity 0.8.20
            </Badge>
            <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/50">
              <Zap className="w-3 h-3 mr-1" />
              Next.js 16
            </Badge>
            <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/50">
              <Lock className="w-3 h-3 mr-1" />
              MIT License
            </Badge>
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.section
          id="features"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            ✨ Features
          </h2>
          <p className="text-center text-gray-600 dark:text-white/70 mb-12 text-lg">
            Everything you need to stay organized on-chain
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0 }}
              whileHover={{ scale: 1.05 }}
            >
              <Card className="bg-white/80 dark:bg-white/10 backdrop-blur-lg border-gray-200/50 dark:border-white/20 h-full hover:shadow-xl transition-shadow">
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
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <Card className="bg-white/80 dark:bg-white/10 backdrop-blur-lg border-gray-200/50 dark:border-white/20 h-full hover:shadow-xl transition-shadow">
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
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.05 }}
            >
              <Card className="bg-white/80 dark:bg-white/10 backdrop-blur-lg border-gray-200/50 dark:border-white/20 h-full hover:shadow-xl transition-shadow">
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
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
            >
              <Card className="bg-white/80 dark:bg-white/10 backdrop-blur-lg border-gray-200/50 dark:border-white/20 h-full hover:shadow-xl transition-shadow">
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
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
            >
              <Card className="bg-white/80 dark:bg-white/10 backdrop-blur-lg border-gray-200/50 dark:border-white/20 h-full hover:shadow-xl transition-shadow">
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
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.05 }}
            >
              <Card className="bg-white/80 dark:bg-white/10 backdrop-blur-lg border-gray-200/50 dark:border-white/20 h-full hover:shadow-xl transition-shadow">
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
            </motion.div>
          </div>
        </motion.section>

        {/* Smart Contract Section */}
        <section className="mb-20">
          <h2 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            🔗 Smart Contract
          </h2>
          <p className="text-center text-gray-600 dark:text-white/70 mb-8 text-lg">
            Deployed and verified on Base blockchain
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
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

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <Card className="bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-cyan-500/20 border-purple-500/50 dark:border-purple-500/30 backdrop-blur-lg">
            <CardContent className="p-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
                Ready to get started?
              </h2>
              <p className="text-lg text-gray-700 dark:text-white/80 mb-8 max-w-2xl mx-auto">
                Connect your wallet and start creating on-chain reminders today. 
                Never miss an important date again!
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block"
              >
                <AppKitButton />
              </motion.div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Tech Stack Section */}
        <section className="mb-20">
          <h2 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            🛠️ Tech Stack
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="bg-white/80 dark:bg-white/10 backdrop-blur-lg border-gray-200/50 dark:border-white/20">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                  <Code className="w-5 h-5 text-blue-400" />
                  Smart Contract
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-700 dark:text-white/80">
                  <li>• Solidity ^0.8.20</li>
                  <li>• Hardhat - Development environment</li>
                  <li>• Ethers.js - Blockchain interactions</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-white/80 dark:bg-white/10 backdrop-blur-lg border-gray-200/50 dark:border-white/20">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  Frontend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-700 dark:text-white/80">
                  <li>• Next.js 16 - React framework</li>
                  <li>• TypeScript - Type-safe development</li>
                  <li>• Wagmi + Viem - Ethereum interactions</li>
                  <li>• Reown AppKit - Wallet connection</li>
                  <li>• Tailwind CSS - Styling</li>
                  <li>• Framer Motion - Animations</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-20 text-center text-gray-600 dark:text-white/60"
        >
          <p className="mb-2">
            Built with ❤️ for the Web3 ecosystem
          </p>
          <p className="text-sm">
            Never miss an important date again. Stay organized, stay on-chain. 🔔
          </p>
        </motion.footer>
      </div>
    </div>
  );
}
