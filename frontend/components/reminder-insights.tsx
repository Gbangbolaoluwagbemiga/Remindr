"use client";

import { useMemo } from "react";
import { Reminder, UserStats } from "@/lib/contract";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, TrendingUp, Calendar, Target } from "lucide-react";
import { format, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";

interface ReminderInsightsProps {
  reminders: Reminder[] | undefined;
  userStats: UserStats | undefined;
}

export function ReminderInsights({ reminders, userStats }: ReminderInsightsProps) {
  const insights = useMemo(() => {
    if (!reminders || !userStats) return null;

    const activeReminders = reminders.filter((r) => r.exists && !r.isCompleted);
    const completedReminders = reminders.filter((r) => r.exists && r.isCompleted);
    const totalCreated = Number(userStats.totalRemindersCreated);
    const totalCompleted = Number(userStats.totalRemindersCompleted);
    const completionRate = totalCreated > 0 ? (totalCompleted / totalCreated) * 100 : 0;

    // Most active day
    const dayCounts: Record<string, number> = {};
    reminders.forEach((r) => {
      if (r.exists) {
        const day = format(new Date(Number(r.createdAt) * 1000), "EEEE");
        dayCounts[day] = (dayCounts[day] || 0) + 1;
      }
    });
    const mostActiveDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

    // Most common category
    const categoryCounts: Record<number, number> = {};
    reminders.forEach((r) => {
      if (r.exists) {
        categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
      }
    });
    const mostCommonCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

    // This week's activity
    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);
    const thisWeekReminders = reminders.filter((r) => {
      if (!r.exists) return false;
      const createdDate = new Date(Number(r.createdAt) * 1000);
      return isWithinInterval(createdDate, { start: weekStart, end: weekEnd });
    });

    // High priority completion rate
    const highPriorityReminders = reminders.filter((r) => r.exists && r.priority === 2);
    const highPriorityCompleted = highPriorityReminders.filter((r) => r.isCompleted).length;
    const highPriorityRate =
      highPriorityReminders.length > 0
        ? (highPriorityCompleted / highPriorityReminders.length) * 100
        : 0;

    return {
      completionRate,
      mostActiveDay,
      mostCommonCategory,
      thisWeekCount: thisWeekReminders.length,
      highPriorityRate,
      streakDays: Number(userStats.streakDays),
      totalCreated,
      totalCompleted,
    };
  }, [reminders, userStats]);

  if (!insights) {
    return null;
  }

  const getInsightMessage = () => {
    const messages: string[] = [];

    if (insights.completionRate >= 80) {
      messages.push("🎯 Excellent completion rate! You're very consistent.");
    } else if (insights.completionRate >= 60) {
      messages.push("👍 Good completion rate. Keep it up!");
    } else {
      messages.push("💪 Try to complete more reminders to improve your rate.");
    }

    if (insights.streakDays >= 7) {
      messages.push(`🔥 Amazing ${insights.streakDays}-day streak! Don't break it!`);
    } else if (insights.streakDays >= 3) {
      messages.push(`✨ Nice ${insights.streakDays}-day streak! Keep going!`);
    }

    if (insights.highPriorityRate >= 90) {
      messages.push("⭐ You're great at completing high-priority reminders!");
    }

    if (insights.thisWeekCount > 5) {
      messages.push(`📅 Very active this week with ${insights.thisWeekCount} reminders!`);
    }

    return messages.length > 0 ? messages : ["Keep creating reminders to unlock more insights!"];
  };

  return (
    <Card className="bg-white/90 dark:bg-white/10 backdrop-blur-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-400" />
          Personalized Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-blue-500/10 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium">Completion Rate</span>
            </div>
            <p className="text-2xl font-bold">{insights.completionRate.toFixed(1)}%</p>
          </div>

          <div className="p-3 bg-purple-500/10 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium">Most Active Day</span>
            </div>
            <p className="text-lg font-bold">{insights.mostActiveDay}</p>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Insights
          </h4>
          <div className="space-y-1">
            {getInsightMessage().map((message, index) => (
              <p key={index} className="text-sm text-gray-700 dark:text-white/70">
                {message}
              </p>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xs text-gray-500 dark:text-white/40">Created</p>
              <p className="text-lg font-bold">{insights.totalCreated}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-white/40">Completed</p>
              <p className="text-lg font-bold text-green-400">{insights.totalCompleted}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-white/40">Streak</p>
              <p className="text-lg font-bold text-orange-400">{insights.streakDays}d</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
