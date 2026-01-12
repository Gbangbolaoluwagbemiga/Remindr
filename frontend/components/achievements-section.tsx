"use client";

import { useAccount, useReadContract } from "wagmi";
import { REMINDR_ABI, Achievement, getContractAddress } from "@/lib/contract";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Lock, Unlock, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useChainId } from "wagmi";
import { ACHIEVEMENTS } from "@/lib/constants";

export function AchievementsSection() {
  const { address } = useAccount();
  const chainId = useChainId();
  const contractAddress = getContractAddress(chainId);

  // Read user achievements - we'll need to read from the mapping
  // Since there's no direct getter, we'll check each achievement ID
  const achievement1 = useReadContract({
    address: contractAddress,
    abi: REMINDR_ABI,
    functionName: "achievementUnlocked",
    args: address ? [address, BigInt(1)] : undefined,
    query: { enabled: !!address },
  });
  const achievement2 = useReadContract({
    address: contractAddress,
    abi: REMINDR_ABI,
    functionName: "achievementUnlocked",
    args: address ? [address, BigInt(2)] : undefined,
    query: { enabled: !!address },
  });
  const achievement3 = useReadContract({
    address: contractAddress,
    abi: REMINDR_ABI,
    functionName: "achievementUnlocked",
    args: address ? [address, BigInt(3)] : undefined,
    query: { enabled: !!address },
  });
  const achievement4 = useReadContract({
    address: contractAddress,
    abi: REMINDR_ABI,
    functionName: "achievementUnlocked",
    args: address ? [address, BigInt(4)] : undefined,
    query: { enabled: !!address },
  });
  const achievement5 = useReadContract({
    address: contractAddress,
    abi: REMINDR_ABI,
    functionName: "achievementUnlocked",
    args: address ? [address, BigInt(5)] : undefined,
    query: { enabled: !!address },
  });
  const achievement6 = useReadContract({
    address: contractAddress,
    abi: REMINDR_ABI,
    functionName: "achievementUnlocked",
    args: address ? [address, BigInt(6)] : undefined,
    query: { enabled: !!address },
  });
  
  const achievementChecks = [achievement1, achievement2, achievement3, achievement4, achievement5, achievement6];

  const unlockedAchievements = achievementChecks
    .map((check, index) => ({
      ...ACHIEVEMENTS[index],
      unlocked: check.data as boolean | undefined,
    }))
    .filter((achievement) => achievement.unlocked);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-6 h-6 text-yellow-400" />
        <h2 className="text-2xl font-bold">Achievements</h2>
        <Badge variant="secondary" className="ml-2">
          {unlockedAchievements.length}/{ACHIEVEMENTS.length}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ACHIEVEMENTS.map((achievement, index) => {
          const isUnlocked = achievementChecks[index]?.data as boolean | undefined;
          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`bg-white/80 dark:bg-white/10 backdrop-blur-lg border-2 transition-all ${
                  isUnlocked
                    ? "border-yellow-400 shadow-lg shadow-yellow-400/20"
                    : "border-gray-300 dark:border-white/20 opacity-60"
                }`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-full ${achievement.color} flex items-center justify-center text-2xl`}>
                      {isUnlocked ? achievement.icon : "🔒"}
                    </div>
                    {isUnlocked ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200 }}
                      >
                        <Unlock className="w-5 h-5 text-green-400" />
                      </motion.div>
                    ) : (
                      <Lock className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <CardTitle className="mt-2">{achievement.name}</CardTitle>
                  <CardDescription>{achievement.description}</CardDescription>
                </CardHeader>
                {isUnlocked && (
                  <CardContent>
                    <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Unlocked
                    </Badge>
                  </CardContent>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>

      {unlockedAchievements.length === 0 && (
        <Card className="bg-white/80 dark:bg-white/10 backdrop-blur-lg">
          <CardContent className="p-8 text-center">
            <Lock className="w-16 h-16 text-gray-400 dark:text-white/40 mx-auto mb-4" />
            <p className="text-gray-700 dark:text-white/60">
              No achievements unlocked yet. Start creating reminders to unlock your first achievement!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
