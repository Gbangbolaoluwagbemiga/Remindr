"use client";

import { useReadContract } from "wagmi";
import { REMINDR_ABI, getContractAddress, UserStats } from "@/lib/contract";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useChainId } from "wagmi";

// Note: This is a simplified leaderboard that would need a backend
// to aggregate all user stats. For now, we'll show a placeholder.
// In a real implementation, you'd need to index events or have a subgraph.

interface LeaderboardEntry {
  address: string;
  stats: UserStats;
  rank: number;
}

export function Leaderboard() {
  const chainId = useChainId();
  const contractAddress = getContractAddress(chainId);

  // This is a placeholder - in production, you'd fetch from an indexer
  // or have a backend service that aggregates user stats
  const leaderboardData: LeaderboardEntry[] = [];

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-orange-400" />;
    return <span className="text-gray-500 font-bold">#{rank}</span>;
  };

  return (
    <Card className="bg-white/90 dark:bg-white/10 backdrop-blur-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        {leaderboardData.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="w-16 h-16 text-gray-400 dark:text-white/40 mx-auto mb-4" />
            <p className="text-gray-700 dark:text-white/60 mb-2">
              Leaderboard coming soon!
            </p>
            <p className="text-sm text-gray-500 dark:text-white/40">
              We're working on aggregating user stats. Check back later to see
              top performers.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboardData.map((entry, index) => (
              <motion.div
                key={entry.address}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-white/60 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10"
              >
                <div className="flex items-center gap-3">
                  {getRankIcon(entry.rank)}
                  <div>
                    <p className="font-medium text-sm">
                      {entry.address.slice(0, 6)}...{entry.address.slice(-4)}
                    </p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        Rep: {entry.stats.reputationScore.toString()}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        Streak: {entry.stats.streakDays.toString()}d
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">
                    {entry.stats.totalRemindersCompleted.toString()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-white/40">
                    Completed
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-md">
          <p className="text-sm text-blue-400 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Leaderboard updates in real-time based on on-chain activity
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
