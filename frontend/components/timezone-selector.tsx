"use client";

import { useState, useEffect } from "react";
import { COMMON_TIMEZONES, getUserTimezone, getTimezoneLabel } from "@/lib/timezone";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Globe, Check } from "lucide-react";
import { STORAGE_KEYS } from "@/lib/constants";

export function TimezoneSelector() {
  const [selectedTimezone, setSelectedTimezone] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Load from localStorage or use browser default
    const saved = localStorage.getItem(STORAGE_KEYS.TIMEZONE);
    if (saved) {
      setSelectedTimezone(saved);
    } else {
      const browserTz = getUserTimezone();
      setSelectedTimezone(browserTz);
      localStorage.setItem(STORAGE_KEYS.TIMEZONE, browserTz);
    }
  }, []);

  const handleSelect = (timezone: string) => {
    setSelectedTimezone(timezone);
    localStorage.setItem(STORAGE_KEYS.TIMEZONE, timezone);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Globe className="w-4 h-4 mr-2" />
          {selectedTimezone ? getTimezoneLabel(selectedTimezone).split(" ")[0] : "Timezone"}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Timezone</DialogTitle>
          <DialogDescription>
            Choose your timezone to display reminders in your local time
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 mt-4">
          {COMMON_TIMEZONES.map((tz) => (
            <button
              key={tz.timezone}
              onClick={() => handleSelect(tz.timezone)}
              className={`w-full text-left p-3 rounded-lg border transition-all ${
                selectedTimezone === tz.timezone
                  ? "bg-blue-500/10 border-blue-500"
                  : "bg-white/50 dark:bg-white/5 border-gray-200 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{tz.label}</p>
                  <p className="text-xs text-gray-500 dark:text-white/40 mt-1">
                    {tz.timezone}
                  </p>
                </div>
                {selectedTimezone === tz.timezone && (
                  <Check className="w-5 h-5 text-blue-500" />
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-md">
          <p className="text-xs text-blue-400">
            Your timezone preference is saved locally and will be used to display all reminder times.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function getStoredTimezone(): string {
  if (typeof window !== "undefined") {
    return localStorage.getItem(STORAGE_KEYS.TIMEZONE) || getUserTimezone();
  }
  return "UTC";
}
