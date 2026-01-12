"use client";

import { useState } from "react";
import { Reminder } from "@/lib/contract";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { motion } from "framer-motion";

interface CalendarViewProps {
  reminders: Reminder[];
  onReminderClick?: (reminder: Reminder) => void;
}

export function CalendarView({ reminders, onReminderClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get first day of week for the month
  const firstDayOfWeek = monthStart.getDay();
  const emptyDays = Array(firstDayOfWeek).fill(null);

  const getRemindersForDay = (day: Date) => {
    return reminders.filter((r) => {
      if (!r.exists || r.isCompleted) return false;
      const reminderDate = new Date(Number(r.timestamp) * 1000);
      return isSameDay(reminderDate, day);
    });
  };

  const getReminderColor = (reminder: Reminder) => {
    const now = Date.now();
    const reminderTime = Number(reminder.timestamp) * 1000;
    if (reminderTime < now) return "bg-red-500";
    if (reminder.priority === 2) return "bg-orange-500";
    if (reminder.priority === 1) return "bg-yellow-500";
    return "bg-blue-500";
  };

  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <Card className="bg-white/90 dark:bg-white/10 backdrop-blur-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Calendar View
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToNextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-white/60 mt-2">
          {format(currentDate, "MMMM yyyy")}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-center text-sm font-semibold text-gray-600 dark:text-white/60 py-2"
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {emptyDays.map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square" />
          ))}
          {daysInMonth.map((day) => {
            const dayReminders = getRemindersForDay(day);
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, currentDate);

            return (
              <motion.div
                key={day.toISOString()}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`aspect-square border border-gray-200 dark:border-white/20 rounded-md p-1 ${
                  isToday
                    ? "bg-blue-500/20 border-blue-500 dark:border-blue-400"
                    : "bg-white/50 dark:bg-white/5"
                } ${!isCurrentMonth ? "opacity-50" : ""}`}
              >
                <div
                  className={`text-xs font-medium mb-1 ${
                    isToday
                      ? "text-blue-600 dark:text-blue-400 font-bold"
                      : "text-gray-700 dark:text-white/70"
                  }`}
                >
                  {format(day, "d")}
                </div>
                <div className="space-y-0.5">
                  {dayReminders.slice(0, 3).map((reminder) => (
                    <motion.div
                      key={reminder.id.toString()}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`${getReminderColor(reminder)} text-white text-[10px] px-1 py-0.5 rounded truncate cursor-pointer hover:opacity-80`}
                      onClick={() => onReminderClick?.(reminder)}
                      title={reminder.title}
                    >
                      {reminder.title}
                    </motion.div>
                  ))}
                  {dayReminders.length > 3 && (
                    <div className="text-[10px] text-gray-500 dark:text-white/50 px-1">
                      +{dayReminders.length - 3} more
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
