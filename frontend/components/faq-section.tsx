"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "What is Remindr?",
    answer: "Remindr is a decentralized reminder application that stores your reminders on-chain using Base blockchain. Never miss a governance vote, token unlock, or important date again. Your reminders are permanently stored on the blockchain, ensuring they're always accessible and immutable.",
  },
  {
    question: "How does on-chain storage work?",
    answer: "When you create a reminder, it's stored permanently on the Base blockchain as a smart contract transaction. This ensures your reminders are immutable, transparent, and accessible from any wallet address. Each reminder is associated with your wallet address and can be retrieved at any time.",
  },
  {
    question: "Do I need to pay gas fees?",
    answer: "Yes, creating, updating, or deleting reminders requires gas fees on the Base network. However, Base is an L2 network with significantly lower gas fees compared to Ethereum mainnet. Reading reminders is free and doesn't require any transactions.",
  },
  {
    question: "Can I edit or delete my reminders?",
    answer: "Yes! You can edit or delete any reminder you've created. Only the owner of a reminder can modify or delete it, ensuring your data remains secure. Updates and deletions are also stored on-chain for full transparency.",
  },
  {
    question: "How do notifications work?",
    answer: "Remindr uses a hybrid notification system. The app checks your reminders every 30 seconds and sends browser notifications when a reminder is due. You'll also see in-app toast notifications. Make sure to enable browser notifications when prompted for the best experience.",
  },
  {
    question: "Which wallets are supported?",
    answer: "Remindr supports all wallets compatible with WalletConnect, including MetaMask, Coinbase Wallet, Trust Wallet, and many others through the Reown AppKit integration. Simply connect your preferred wallet to get started.",
  },
  {
    question: "Is my data private?",
    answer: "Your reminders are stored on-chain, which means they're publicly visible on the blockchain. However, they're associated with your wallet address, not personal information. You can choose to make reminders public or keep them private to your wallet.",
  },
  {
    question: "What networks are supported?",
    answer: "Currently, Remindr is deployed on Base Mainnet and Base Sepolia (testnet). The smart contract is also deployable on Celo networks. We recommend using Base Sepolia for testing and Base Mainnet for production use.",
  },
  {
    question: "Can I use Remindr on mobile?",
    answer: "Yes! Remindr is fully responsive and works perfectly on mobile devices. You can access it through your mobile browser and connect your mobile wallet (like MetaMask Mobile or Coinbase Wallet) to create and manage reminders on the go.",
  },
  {
    question: "What happens if I lose access to my wallet?",
    answer: "Since reminders are stored on-chain and associated with your wallet address, you'll need access to your wallet to manage them. Make sure to securely backup your wallet's seed phrase or private key. If you lose access, you won't be able to modify or delete your reminders, but they'll remain on the blockchain.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="mb-20">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <HelpCircle className="w-8 h-8 text-purple-400" />
          </motion.div>
          <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h2>
        </div>
        <p className="text-gray-600 dark:text-white/70 text-base sm:text-lg px-4">
          Everything you need to know about Remindr
        </p>
      </motion.div>

      <div className="max-w-3xl mx-auto space-y-4 px-4">
        {faqData.map((faq, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-white/80 dark:bg-white/10 backdrop-blur-lg border-gray-200/50 dark:border-white/20 overflow-hidden hover:shadow-lg transition-shadow">
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full p-6 text-left flex items-center justify-between hover:bg-white/50 dark:hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/50 rounded-lg"
              aria-expanded={openIndex === index}
              aria-controls={`faq-answer-${index}`}
            >
              <span className="font-semibold text-gray-900 dark:text-white pr-4">
                {faq.question}
              </span>
              <motion.div
                animate={{ rotate: openIndex === index ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-5 h-5 text-gray-500 dark:text-white/60 flex-shrink-0" />
              </motion.div>
            </button>
            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <CardContent id={`faq-answer-${index}`} className="pt-0 pb-6 px-6">
                    <p className="text-gray-600 dark:text-white/70 leading-relaxed">
                      {faq.answer}
                    </p>
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

