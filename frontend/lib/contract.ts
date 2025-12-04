// Remindr Contract ABI and Types
import remindrAbi from "./remindr_abi.json";

export const REMINDR_ABI = remindrAbi as any;

// Contract address on Base Mainnet (Updated with new enhanced contract)
export const REMINDR_ADDRESS =
  "0xdB80F03692e45dd0be64E54FBD3d824Fdb64e9f7" as const;

// Enums matching the contract
export enum RecurrenceType {
  None = 0,
  Daily = 1,
  Weekly = 2,
  Monthly = 3,
  Yearly = 4,
  Custom = 5,
}

export enum ReminderPriority {
  Low = 0,
  Medium = 1,
  High = 2,
}

export enum Category {
  Personal = 0,
  Governance = 1,
  DeFi = 2,
  NFT = 3,
  Airdrop = 4,
  TokenUnlock = 5,
  Other = 6,
}

// Type definitions
export interface Reminder {
  id: bigint;
  owner: string;
  title: string;
  description: string;
  timestamp: bigint;
  isCompleted: boolean;
  exists: boolean;
  createdAt: bigint;
  recurrenceType: RecurrenceType;
  recurrenceInterval: bigint;
  nextOccurrence: bigint;
  isPublic: boolean;
  isShared: boolean;
  participants: string[];
  category: Category;
  priority: ReminderPriority;
  tags: string[];
  templateId: bigint;
}

export interface UserStats {
  totalRemindersCreated: bigint;
  totalRemindersCompleted: bigint;
  totalRemindersShared: bigint;
  streakDays: bigint;
  longestStreak: bigint;
  lastActivityTimestamp: bigint;
  reputationScore: bigint;
}

export interface Achievement {
  id: bigint;
  name: string;
  description: string;
  requirement: bigint;
  isUnlocked: boolean;
  unlockedAt: bigint;
}

export interface Template {
  id: bigint;
  title: string;
  description: string;
  category: Category;
  defaultDuration: bigint;
  exists: boolean;
}

// Helper functions
export const getRecurrenceLabel = (type: RecurrenceType): string => {
  switch (type) {
    case RecurrenceType.None:
      return "One-time";
    case RecurrenceType.Daily:
      return "Daily";
    case RecurrenceType.Weekly:
      return "Weekly";
    case RecurrenceType.Monthly:
      return "Monthly";
    case RecurrenceType.Yearly:
      return "Yearly";
    case RecurrenceType.Custom:
      return "Custom";
    default:
      return "Unknown";
  }
};

export const getCategoryLabel = (category: Category): string => {
  switch (category) {
    case Category.Personal:
      return "Personal";
    case Category.Governance:
      return "Governance";
    case Category.DeFi:
      return "DeFi";
    case Category.NFT:
      return "NFT";
    case Category.Airdrop:
      return "Airdrop";
    case Category.TokenUnlock:
      return "Token Unlock";
    case Category.Other:
      return "Other";
    default:
      return "Unknown";
  }
};

export const getPriorityLabel = (priority: ReminderPriority): string => {
  switch (priority) {
    case ReminderPriority.Low:
      return "Low";
    case ReminderPriority.Medium:
      return "Medium";
    case ReminderPriority.High:
      return "High";
    default:
      return "Unknown";
  }
};

export const getCategoryColor = (category: Category): string => {
  switch (category) {
    case Category.Personal:
      return "bg-gray-500";
    case Category.Governance:
      return "bg-blue-500";
    case Category.DeFi:
      return "bg-green-500";
    case Category.NFT:
      return "bg-purple-500";
    case Category.Airdrop:
      return "bg-yellow-500";
    case Category.TokenUnlock:
      return "bg-orange-500";
    case Category.Other:
      return "bg-gray-400";
    default:
      return "bg-gray-300";
  }
};

export const getPriorityColor = (priority: ReminderPriority): string => {
  switch (priority) {
    case ReminderPriority.Low:
      return "bg-gray-400";
    case ReminderPriority.Medium:
      return "bg-yellow-400";
    case ReminderPriority.High:
      return "bg-red-400";
    default:
      return "bg-gray-300";
  }
};

// Base network configuration
export const base = {
  id: 8453,
  name: "Base",
  network: "base",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    public: { http: ["https://mainnet.base.org"] },
    default: { http: ["https://mainnet.base.org"] },
  },
  blockExplorers: {
    default: { name: "BaseScan", url: "https://basescan.org" },
  },
} as const;
