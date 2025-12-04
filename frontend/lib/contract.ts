// Remindr Contract Configuration
import remindrAbi from "./remindr-abi.json";

export const REMINDR_ABI = remindrAbi;

// Contract address on Base Mainnet (will need to be updated after redeployment)
export const REMINDR_ADDRESS =
  "0xfe4a4d81E4f0F17CA959b07D39Ab18493efc4B0C" as const;

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

// Enums matching the contract
export enum RecurrenceType {
  None = 0,
  Daily = 1,
  Weekly = 2,
  Monthly = 3,
  Yearly = 4,
  Custom = 5,
}

export enum ReminderCategory {
  Personal = 0,
  Governance = 1,
  DeFi = 2,
  NFT = 3,
  Token = 4,
  Airdrop = 5,
  Other = 6,
}

export enum Priority {
  Low = 0,
  Medium = 1,
  High = 2,
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
  category: ReminderCategory;
  priority: Priority;
  tags: string[];
  participants: string[];
  templateId: bigint;
}

export interface UserStats {
  totalRemindersCreated: bigint;
  totalRemindersCompleted: bigint;
  currentStreak: bigint;
  longestStreak: bigint;
  lastCompletionDate: bigint;
  reputationScore: bigint;
}

export interface Achievement {
  id: bigint;
  name: string;
  description: string;
  requirement: bigint;
  isActive: boolean;
}

export interface Template {
  id: bigint;
  name: string;
  title: string;
  description: string;
  category: ReminderCategory;
  isActive: boolean;
  usageCount: bigint;
}
