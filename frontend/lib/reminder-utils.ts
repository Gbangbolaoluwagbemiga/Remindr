// Utility functions for reminder operations

import { Reminder } from "./contract";
import { FilterState } from "./types";

/**
 * Filter reminders by search query
 */
export function filterRemindersBySearch(
  reminders: Reminder[],
  searchQuery: string
): Reminder[] {
  if (!searchQuery) return reminders;
  
  const query = searchQuery.toLowerCase();
  return reminders.filter((r) => {
    if (!r.exists) return false;
    return (
      r.title.toLowerCase().includes(query) ||
      r.description.toLowerCase().includes(query) ||
      r.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  });
}

/**
 * Filter reminders by advanced filters
 */
export function filterRemindersByAdvanced(
  reminders: Reminder[],
  filters: FilterState
): Reminder[] {
  let filtered = [...reminders];
  const now = Math.floor(Date.now() / 1000);

  // Status filter
  if (filters.status === "pending") {
    filtered = filtered.filter((r) => !r.isCompleted && Number(r.timestamp) > now);
  } else if (filters.status === "completed") {
    filtered = filtered.filter((r) => r.isCompleted);
  } else if (filters.status === "overdue") {
    filtered = filtered.filter((r) => !r.isCompleted && Number(r.timestamp) < now);
  }

  // Category filter
  if (filters.categories.size > 0) {
    filtered = filtered.filter((r) => filters.categories.has(r.category));
  }

  // Priority filter
  if (filters.priorities.size > 0) {
    filtered = filtered.filter((r) => filters.priorities.has(r.priority));
  }

  // Recurrence filter
  if (filters.recurrenceTypes.size > 0) {
    filtered = filtered.filter((r) => filters.recurrenceTypes.has(r.recurrenceType));
  }

  // Date range filter
  if (filters.dateRange.start) {
    const start = Math.floor(new Date(filters.dateRange.start).getTime() / 1000);
    filtered = filtered.filter((r) => Number(r.timestamp) >= start);
  }
  if (filters.dateRange.end) {
    const end = Math.floor(new Date(filters.dateRange.end).getTime() / 1000);
    filtered = filtered.filter((r) => Number(r.timestamp) <= end);
  }

  return filtered;
}

/**
 * Categorize reminders by status
 */
export function categorizeReminders(reminders: Reminder[]) {
  const now = Math.floor(Date.now() / 1000);
  
  const active = reminders.filter((r) => r.exists && !r.isCompleted);
  const completed = reminders.filter((r) => r.exists && r.isCompleted);
  const pending = active.filter((r) => Number(r.timestamp) > now);
  const overdue = active.filter((r) => Number(r.timestamp) < now);

  return { active, completed, pending, overdue };
}

/**
 * Check if reminder is past due
 */
export function isPastDue(timestamp: bigint): boolean {
  return Number(timestamp) * 1000 < Date.now();
}

/**
 * Get reminder color based on status and priority
 */
export function getReminderColor(reminder: Reminder): string {
  const now = Date.now();
  const reminderTime = Number(reminder.timestamp) * 1000;
  
  if (reminderTime < now) return "bg-red-500";
  if (reminder.priority === 2) return "bg-orange-500";
  if (reminder.priority === 1) return "bg-yellow-500";
  return "bg-blue-500";
}

/**
 * Get reminders ready for recurring processing
 */
export function getRecurringRemindersReady(reminders: Reminder[]): Reminder[] {
  const now = Math.floor(Date.now() / 1000);
  
  return reminders.filter((r) => {
    if (!r.exists || r.isCompleted) return false;
    if (r.recurrenceType === 0) return false; // None
    return Number(r.nextOccurrence) <= now && Number(r.timestamp) <= now;
  });
}
