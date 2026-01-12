"use client";

import { useState } from "react";
import { Category, ReminderPriority, RecurrenceType } from "@/lib/contract";
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
import { ReminderFilters, FilterState } from "@/lib/types";
import { filterRemindersByAdvanced } from "@/lib/reminder-utils";

export function AdvancedFilters({ reminders, onFilterChange }: ReminderFilters) {
  const [isOpen, setIsOpen] = useState(false);
  const [filterState, setFilterState] = useState<FilterState>({
    status: "all",
    categories: new Set(),
    priorities: new Set(),
    recurrenceTypes: new Set(),
    dateRange: { start: "", end: "" },
  });

  const applyFilters = () => {
    const filtered = filterRemindersByAdvanced(reminders, filterState);
    onFilterChange(filtered);
  };

  const clearFilters = () => {
    setFilterState({
      status: "all",
      categories: new Set(),
      priorities: new Set(),
      recurrenceTypes: new Set(),
      dateRange: { start: "", end: "" },
    });
    onFilterChange(reminders);
  };

  const hasActiveFilters =
    filterState.categories.size > 0 ||
    filterState.priorities.size > 0 ||
    filterState.recurrenceTypes.size > 0 ||
    filterState.status !== "all" ||
    filterState.dateRange.start ||
    filterState.dateRange.end;

  const toggleCategory = (category: Category) => {
    const newSet = new Set(filterState.categories);
    if (newSet.has(category)) {
      newSet.delete(category);
    } else {
      newSet.add(category);
    }
    setFilterState({ ...filterState, categories: newSet });
  };

  const togglePriority = (priority: ReminderPriority) => {
    const newSet = new Set(filterState.priorities);
    if (newSet.has(priority)) {
      newSet.delete(priority);
    } else {
      newSet.add(priority);
    }
    setFilterState({ ...filterState, priorities: newSet });
  };

  const toggleRecurrence = (type: RecurrenceType) => {
    const newSet = new Set(filterState.recurrenceTypes);
    if (newSet.has(type)) {
      newSet.delete(type);
    } else {
      newSet.add(type);
    }
    setFilterState({ ...filterState, recurrenceTypes: newSet });
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
                  variant={filterState.status === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterState({ ...filterState, status })}
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
                    variant={filterState.categories.has(cat as Category) ? "default" : "outline"}
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
                    variant={filterState.priorities.has(pri as ReminderPriority) ? "default" : "outline"}
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
                    variant={filterState.recurrenceTypes.has(rec as RecurrenceType) ? "default" : "outline"}
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
                  value={filterState.dateRange.start}
                  onChange={(e) => setFilterState({ ...filterState, dateRange: { ...filterState.dateRange, start: e.target.value } })}
                  className="w-full px-3 py-2 bg-white/60 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-white/40 mb-1 block">End Date</label>
                <input
                  type="date"
                  value={filterState.dateRange.end}
                  onChange={(e) => setFilterState({ ...filterState, dateRange: { ...filterState.dateRange, end: e.target.value } })}
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
