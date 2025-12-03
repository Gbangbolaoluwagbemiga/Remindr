"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface Reminder {
  id: bigint;
  owner: string;
  title: string;
  description: string;
  timestamp: bigint;
  isCompleted: boolean;
  exists: boolean;
  createdAt: bigint;
}

export function useReminderNotifications(
  reminders: Reminder[] | undefined,
  enabled: boolean = true
) {
  const [notifiedIds, setNotifiedIds] = useState<Set<string>>(new Set());
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Request notification permission on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission().then(setPermission);
      } else {
        setPermission(Notification.permission);
      }
    }
  }, []);

  // Check for due reminders
  useEffect(() => {
    if (!enabled || !reminders || reminders.length === 0) return;

    const checkReminders = () => {
      const now = Math.floor(Date.now() / 1000);

      reminders.forEach((reminder) => {
        if (
          !reminder.exists ||
          reminder.isCompleted ||
          notifiedIds.has(reminder.id.toString())
        ) {
          return;
        }

        const reminderTime = Number(reminder.timestamp);
        const timeDiff = reminderTime - now;

        // Check if reminder is due (within last 5 minutes or just passed)
        if (timeDiff <= 0 && timeDiff >= -300) {
          // Show browser notification
          if (permission === "granted") {
            try {
              // timestamp is not part of the standard NotificationOptions type
              // but some browsers support it, so we use type assertion
              const notification = new Notification("🔔 Remindr Alert", {
                body: reminder.description
                  ? `${reminder.title}\n${reminder.description}`
                  : reminder.title,
                icon: "/favicon.ico",
                badge: "/favicon.ico",
                tag: `reminder-${reminder.id}`,
                requireInteraction: true,
                timestamp: reminderTime * 1000,
              } as NotificationOptions & { timestamp?: number });

              notification.onclick = () => {
                window.focus();
                notification.close();
              };

              // Auto-close after 10 seconds
              setTimeout(() => notification.close(), 10000);
            } catch (error) {
              console.error("Error showing notification:", error);
            }
          }

          // Show toast notification
          toast(reminder.title, {
            description: reminder.description || "Your reminder is due!",
            icon: "🔔",
            duration: 10000,
            action: {
              label: "View",
              onClick: () => {
                // Scroll to reminder or focus on it
                const element = document.getElementById(
                  `reminder-${reminder.id}`
                );
                if (element) {
                  element.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  });
                  element.classList.add(
                    "ring-2",
                    "ring-yellow-400",
                    "ring-offset-2"
                  );
                  setTimeout(() => {
                    element.classList.remove(
                      "ring-2",
                      "ring-yellow-400",
                      "ring-offset-2"
                    );
                  }, 2000);
                }
              },
            },
          });

          // Mark as notified
          setNotifiedIds((prev) => new Set(prev).add(reminder.id.toString()));
        }
      });
    };

    // Check immediately
    checkReminders();

    // Check every 30 seconds
    checkIntervalRef.current = setInterval(checkReminders, 30000);

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [reminders, enabled, notifiedIds, permission]);

  // Clear notified IDs when reminders change (new reminders added)
  useEffect(() => {
    if (reminders) {
      const reminderIds = new Set(reminders.map((r) => r.id.toString()));
      setNotifiedIds((prev) => {
        const filtered = new Set<string>();
        prev.forEach((id) => {
          if (reminderIds.has(id)) {
            filtered.add(id);
          }
        });
        return filtered;
      });
    }
  }, [reminders?.length]);

  // Request notification permission
  const requestPermission = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm === "granted") {
        toast.success("Notifications enabled! 🔔");
      } else {
        toast.info(
          "Notifications were blocked. You can enable them in your browser settings."
        );
      }
    }
  };

  return {
    permission,
    requestPermission,
    isSupported: typeof window !== "undefined" && "Notification" in window,
  };
}
