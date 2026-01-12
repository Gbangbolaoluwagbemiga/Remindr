// Shared type definitions

import { Reminder, UserStats } from "./contract";

export type ViewMode = 
  | "my" 
  | "public" 
  | "templates" 
  | "stats" 
  | "calendar" 
  | "achievements" 
  | "analytics" 
  | "leaderboard";

export interface ReminderNote {
  id: string;
  reminderId: string;
  content: string;
  createdAt: number;
  type: "note" | "completion" | "edit";
}

export interface FilterState {
  status: "all" | "pending" | "completed" | "overdue";
  categories: Set<number>;
  priorities: Set<number>;
  recurrenceTypes: Set<number>;
  dateRange: {
    start: string;
    end: string;
  };
}

export interface ReminderFilters {
  reminders: Reminder[];
  onFilterChange: (filtered: Reminder[]) => void;
}

export interface BatchOperationsProps {
  reminders: Reminder[];
  onSuccess?: () => void;
}

export interface ExportImportProps {
  reminders: Reminder[];
}

export interface ReminderNotesProps {
  reminder: Reminder;
  onNoteAdd?: (reminderId: string, note: string) => void;
}

export interface SnoozeDialogProps {
  reminderId: bigint;
  onSuccess?: () => void;
  currentSnoozeCount?: bigint;
  maxSnoozes?: bigint;
}

export interface AnalyticsDashboardProps {
  reminders: Reminder[] | undefined;
  userStats: UserStats | undefined;
}

export interface ReminderInsightsProps {
  reminders: Reminder[] | undefined;
  userStats: UserStats | undefined;
}

export interface CalendarViewProps {
  reminders: Reminder[];
  onReminderClick?: (reminder: Reminder) => void;
}
