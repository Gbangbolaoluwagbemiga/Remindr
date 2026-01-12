"use client";

import { useAccount, useReadContract } from "wagmi";
import { REMINDR_ABI, getContractAddress, Reminder, UserStats } from "@/lib/contract";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, PieChart, Activity } from "lucide-react";
import { useChainId } from "wagmi";
import { useMemo } from "react";

interface AnalyticsDashboardProps {
  reminders: Reminder[] | undefined;
  userStats: UserStats | undefined;
}

export function AnalyticsDashboard({ reminders, userStats }: AnalyticsDashboardProps) {
  const { address } = useAccount();
  const chainId = useChainId();
  const contractAddress = getContractAddress(chainId);

  const analytics = useMemo(() => {
    if (!reminders || !userStats) return null;

    const activeReminders = reminders.filter((r) => r.exists && !r.isCompleted);
    const completedReminders = reminders.filter((r) => r.exists && r.isCompleted);
    
    // Category breakdown
    const categoryCounts: Record<number, number> = {};
    reminders.forEach((r) => {
      if (r.exists) {
        categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
      }
    });

    // Priority breakdown
    const priorityCounts: Record<number, number> = {};
    reminders.forEach((r) => {
      if (r.exists && !r.isCompleted) {
        priorityCounts[r.priority] = (priorityCounts[r.priority] || 0) + 1;
      }
    });

    // Completion rate
    const totalCreated = Number(userStats.totalRemindersCreated);
    const totalCompleted = Number(userStats.totalRemindersCompleted);
    const completionRate = totalCreated > 0 ? (totalCompleted / totalCreated) * 100 : 0;

    // Overdue count
    const now = Math.floor(Date.now() / 1000);
    const overdueCount = activeReminders.filter(
      (r) => Number(r.timestamp) < now
    ).length;

    return {
      categoryCounts,
      priorityCounts,
      completionRate,
      overdueCount,
      totalCreated,
      totalCompleted,
      activeCount: activeReminders.length,
    };
  }, [reminders, userStats]);

  if (!analytics) {
    return (
      <Card className="bg-white/90 dark:bg-white/10 backdrop-blur-lg">
        <CardContent className="p-8 text-center">
          <Activity className="w-16 h-16 text-gray-400 dark:text-white/40 mx-auto mb-4" />
          <p className="text-gray-700 dark:text-white/60">Loading analytics...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white/80 dark:bg-white/10 backdrop-blur-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-white/60">Completion Rate</p>
                <p className="text-2xl font-bold text-green-400">
                  {analytics.completionRate.toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-white/10 backdrop-blur-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-white/60">Active</p>
                <p className="text-2xl font-bold text-blue-400">
                  {analytics.activeCount}
                </p>
              </div>
              <Activity className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-white/10 backdrop-blur-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-white/60">Overdue</p>
                <p className="text-2xl font-bold text-red-400">
                  {analytics.overdueCount}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-white/10 backdrop-blur-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-white/60">Total Created</p>
                <p className="text-2xl font-bold">
                  {analytics.totalCreated}
                </p>
              </div>
              <PieChart className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-white/90 dark:bg-white/10 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Category Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(analytics.categoryCounts).map(([category, count]) => {
                const total = Object.values(analytics.categoryCounts).reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? (count / total) * 100 : 0;
                return (
                  <div key={category} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700 dark:text-white/70">
                        Category {category}
                      </span>
                      <span className="font-semibold">{count}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 dark:bg-white/10 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Priority Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(analytics.priorityCounts).map(([priority, count]) => {
                const total = Object.values(analytics.priorityCounts).reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? (count / total) * 100 : 0;
                const priorityLabels = ["Low", "Medium", "High"];
                return (
                  <div key={priority} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700 dark:text-white/70">
                        {priorityLabels[Number(priority)] || `Priority ${priority}`}
                      </span>
                      <span className="font-semibold">{count}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          priority === "2"
                            ? "bg-red-500"
                            : priority === "1"
                            ? "bg-yellow-500"
                            : "bg-gray-500"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
