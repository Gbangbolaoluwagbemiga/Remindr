// Timezone utilities for Remindr

export interface TimezoneInfo {
  timezone: string;
  offset: number; // in minutes
  label: string;
}

export const COMMON_TIMEZONES: TimezoneInfo[] = [
  { timezone: "UTC", offset: 0, label: "UTC (Coordinated Universal Time)" },
  { timezone: "America/New_York", offset: -300, label: "EST/EDT (Eastern Time)" },
  { timezone: "America/Chicago", offset: -360, label: "CST/CDT (Central Time)" },
  { timezone: "America/Denver", offset: -420, label: "MST/MDT (Mountain Time)" },
  { timezone: "America/Los_Angeles", offset: -480, label: "PST/PDT (Pacific Time)" },
  { timezone: "Europe/London", offset: 0, label: "GMT/BST (London)" },
  { timezone: "Europe/Paris", offset: 60, label: "CET/CEST (Paris)" },
  { timezone: "Asia/Tokyo", offset: 540, label: "JST (Tokyo)" },
  { timezone: "Asia/Shanghai", offset: 480, label: "CST (Shanghai)" },
  { timezone: "Asia/Dubai", offset: 240, label: "GST (Dubai)" },
  { timezone: "Australia/Sydney", offset: 660, label: "AEDT/AEST (Sydney)" },
  { timezone: "America/Sao_Paulo", offset: -180, label: "BRT/BRST (São Paulo)" },
];

export function getUserTimezone(): string {
  if (typeof window !== "undefined") {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
  return "UTC";
}

export function getTimezoneOffset(timezone: string): number {
  try {
    const now = new Date();
    const utcDate = new Date(now.toLocaleString("en-US", { timeZone: "UTC" }));
    const tzDate = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
    return (tzDate.getTime() - utcDate.getTime()) / (1000 * 60); // in minutes
  } catch {
    return 0;
  }
}

export function convertToUTC(timestamp: number, timezone: string): number {
  const offset = getTimezoneOffset(timezone);
  return timestamp - offset * 60; // Convert minutes to seconds
}

export function convertFromUTC(timestamp: number, timezone: string): number {
  const offset = getTimezoneOffset(timezone);
  return timestamp + offset * 60; // Convert minutes to seconds
}

export function formatDateInTimezone(
  timestamp: number,
  timezone: string,
  format: "full" | "date" | "time" = "full"
): string {
  try {
    const date = new Date(timestamp * 1000);
    const options: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
    };

    if (format === "full") {
      options.dateStyle = "medium";
      options.timeStyle = "short";
    } else if (format === "date") {
      options.dateStyle = "medium";
    } else if (format === "time") {
      options.timeStyle = "short";
    }

    return new Intl.DateTimeFormat("en-US", options).format(date);
  } catch {
    return new Date(timestamp * 1000).toLocaleString();
  }
}

export function getTimezoneLabel(timezone: string): string {
  const found = COMMON_TIMEZONES.find((tz) => tz.timezone === timezone);
  return found ? found.label : timezone;
}
