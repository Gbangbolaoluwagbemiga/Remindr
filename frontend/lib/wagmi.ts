"use client";

import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { base } from "./contract";

const projectId =
  process.env.NEXT_PUBLIC_REOWN_ID || "1db88bda17adf26df9ab7799871788c4";

// Create a metadata object - this is optional
const metadata = {
  name: "Remindr",
  description: "On-chain reminder system for wallet users",
  url:
    typeof window !== "undefined"
      ? window.location.origin
      : "https://remindr.xyz",
  icons: [],
};

// Create the Wagmi adapter
const wagmiAdapter = new WagmiAdapter({
  networks: [base],
  projectId,
});

// Create the AppKit instance
export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  networks: [base],
  projectId,
  metadata,
  features: {
    analytics: true,
  },
});

// Create a query client
const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
