"use client";

import { useState } from "react";
import { Category, ReminderPriority, RecurrenceType, Reminder } from "@/lib/contract";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Filter, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getCategoryLabel, getPriorityLabel, getRecurrenceLabel } from "@/lib/contract";

interface AdvancedFiltersProps {
  reminders: Reminder[];
  onFilterChange: (filtered: Reminder[]) => void;
}

export function AdvancedFilters({ reminders, onFilterChange }: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Set<Category>>(new Set());
  const [selectedPriorities, setSelectedPriorities] = useState<Set<ReminderPriority>>(new Set());
  const [selectedRecurrenceTypes, setSelectedRecurrenceTypes] = useState<Set<RecurrenceType>>(new Set());
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "completed" | "overdue">("all");
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: "", end: "" });

  const applyFilters = () => {
    let filtered = [...reminders];

    // Status filter
    const now = Math.floor(Date.now() / 1000);
    if (statusFilter === "pending") {
      filtered = filtered.filter((r) => !r.isCompleted && Number(r.timestamp) > now);
    } else if (statusFilter === "completed") {
      filtered = filtered.filter((r) => r.isCompleted);
    } else if (statusFilter === "overdue") {
      filtered = filtered.filter((r) => !r.isCompleted && Number(r.timestamp) < now);
    }

    // Category filter
    if (selectedCategories.size > 0) {
      filtered = filtered.filter((r) => selectedCategories.has(r.category));
    }

    // Priority filter
    if (selectedPriorities.size > 0) {
      filtered = filtered.filter((r) => selectedPriorities.has(r.priority));
    }

    // Recurrence filter
    if (selectedRecurrenceTypes.size > 0) {
      filtered = filtered.filter((r) => selectedRecurrenceTypes.has(r.recurrenceType));
    }

    // Date range filter
    if (dateRange.start) {
      const start = Math.floor(new Date(dateRange.start).getTime() / 1000);
      filtered = filtered.filter((r) => Number(r.timestamp) >= start);
    }
    if (dateRange.end) {
      const end = Math.floor(new Date(dateRange.end).getTime() / 1000);
      filtered = filtered.filter((r) => Number(r.timestamp) <= end);
    }

    onFilterChange(filtered);
  };

  const clearFilters = () => {
    setSelectedCategories(new Set());
    setSelectedPriorities(new Set());
    setSelectedRecurrenceTypes(new Set());
    setStatusFilter("all");
    setDateRange({ start: "", end: "" });
    onFilterChange(reminders);
  };

  const hasActiveFilters =
    selectedCategories.size > 0 ||
    selectedPriorities.size > 0 ||
    selectedRecurrenceTypes.size > 0 ||
    statusFilter !== "all" ||
    dateRange.start ||
    dateRange.end;

  const toggleCategory = (category: Category) => {
    const newSet = new Set(selectedCategories);
    if (newSet.has(category)) {
      newSet.delete(category);
    } else {
      newSet.add(category);
    }
    setSelectedCategories(newSet);
  };

  const togglePriority = (priority: ReminderPriority) => {
    const newSet = new Set(selectedPriorities);
    if (newSet.has(priority)) {
      newSet.delete(priority);
    } else {
      newSet.add(priority);
    }
    setSelectedPriorities(newSet);
  };

  const toggleRecurrence = (type: RecurrenceType) => {
    const newSet = new Set(selectedRecurrenceTypes);
    if (newSet.has(type)) {
      newSet.delete(type);
    } else {
      newSet.add(type);
    }
    setSelectedRecurrenceTypes(newSet);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2">
              Active
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Advanced Filters</DialogTitle>
          <DialogDescription>
            Filter reminders by multiple criteria
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Status Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Status</label>
            <div className="flex gap-2 flex-wrap">
              {(["all", "pending", "completed", "overdue"] as const).map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Categories</label>
            <div className="flex gap-2 flex-wrap">
              {Object.values(Category)
                .filter((v) => typeof v === "number")
                .map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategories.has(cat as Category) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleCategory(cat as Category)}
                  >
                    {getCategoryLabel(cat as Category)}
                  </Button>
                ))}
            </div>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Priorities</label>
            <div className="flex gap-2 flex-wrap">
              {Object.values(ReminderPriority)
                .filter((v) => typeof v === "number")
                .map((pri) => (
                  <Button
                    key={pri}
                    variant={selectedPriorities.has(pri as ReminderPriority) ? "default" : "outline"}
                    size="sm"
                    onClick={() => togglePriority(pri as ReminderPriority)}
                  >
                    {getPriorityLabel(pri as ReminderPriority)}
                  </Button>
                ))}
            </div>
          </div>

          {/* Recurrence Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Recurrence</label>
            <div className="flex gap-2 flex-wrap">
              {Object.values(RecurrenceType)
                .filter((v) => typeof v === "number")
                .map((rec) => (
                  <Button
                    key={rec}
                    variant={selectedRecurrenceTypes.has(rec as RecurrenceType) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleRecurrence(rec as RecurrenceType)}
                  >
                    {getRecurrenceLabel(rec as RecurrenceType)}
                  </Button>
                ))}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="text-sm font-medium mb-2 block">Date Range</label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-500 dark:text-white/40 mb-1 block">Start Date</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="w-full px-3 py-2 bg-white/60 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-white/40 mb-1 block">End Date</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="w-full px-3 py-2 bg-white/60 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-md text-sm"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={clearFilters} variant="outline" className="flex-1">
              <X className="w-4 h-4 mr-2" />
              Clear All
            </Button>
            <Button onClick={applyFilters} className="flex-1">
              Apply Filters
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
