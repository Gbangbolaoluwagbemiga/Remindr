// Shared constants across the application

export const SNOOZE_OPTIONS = [
  { label: "5 minutes", seconds: 5 * 60 },
  { label: "15 minutes", seconds: 15 * 60 },
  { label: "1 hour", seconds: 60 * 60 },
  { label: "3 hours", seconds: 3 * 60 * 60 },
  { label: "1 day", seconds: 24 * 60 * 60 },
  { label: "3 days", seconds: 3 * 24 * 60 * 60 },
] as const;

export const ACHIEVEMENTS = [
  {
    id: 1,
    name: "First Reminder",
    description: "Created your first reminder!",
    icon: "🎯",
    color: "bg-blue-500",
  },
  {
    id: 2,
    name: "Getting Started",
    description: "Created 10 reminders!",
    icon: "🚀",
    color: "bg-green-500",
  },
  {
    id: 3,
    name: "Reminder Master",
    description: "Created 100 reminders!",
    icon: "👑",
    color: "bg-purple-500",
  },
  {
    id: 4,
    name: "Perfect Week",
    description: "7 day streak!",
    icon: "🔥",
    color: "bg-orange-500",
  },
  {
    id: 5,
    name: "Completionist",
    description: "Completed 50 reminders!",
    icon: "✅",
    color: "bg-emerald-500",
  },
  {
    id: 6,
    name: "Social Butterfly",
    description: "Shared 10 reminders!",
    icon: "🦋",
    color: "bg-pink-500",
  },
] as const;

export const MAX_SNOOZES = 5;
export const RECURRING_PROCESS_INTERVAL = 5 * 60 * 1000; // 5 minutes

export const STORAGE_KEYS = {
  TIMEZONE: "remindr-timezone",
  REMINDER_NOTES: (reminderId: string) => `reminder-notes-${reminderId}`,
} as const;
