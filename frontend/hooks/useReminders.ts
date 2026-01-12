// Custom hook for reminder operations

import { useAccount, useReadContract, useChainId } from "wagmi";
import { REMINDR_ABI, Reminder, getContractAddress } from "@/lib/contract";

export function useUserReminders(enabled: boolean = true) {
  const { address } = useAccount();
  const chainId = useChainId();
  const contractAddress = getContractAddress(chainId);

  return useReadContract({
    address: contractAddress,
    abi: REMINDR_ABI,
    functionName: "getUserReminders",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && enabled,
    },
  }) as { 
    data: Reminder[] | undefined; 
    refetch: () => void;
    isLoading: boolean;
    isError: boolean;
  };
}

export function usePublicReminders(limit: bigint = BigInt(20), offset: bigint = BigInt(0), enabled: boolean = true) {
  const chainId = useChainId();
  const contractAddress = getContractAddress(chainId);

  return useReadContract({
    address: contractAddress,
    abi: REMINDR_ABI,
    functionName: "getPublicReminders",
    args: [limit, offset],
    query: {
      enabled,
    },
  }) as { 
    data: Reminder[] | undefined; 
    refetch: () => void;
    isLoading: boolean;
    isError: boolean;
  };
}

export function useUserStats(enabled: boolean = true) {
  const { address } = useAccount();
  const chainId = useChainId();
  const contractAddress = getContractAddress(chainId);

  return useReadContract({
    address: contractAddress,
    abi: REMINDR_ABI,
    functionName: "getUserStats",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && enabled,
    },
  }) as { 
    data: any | undefined;
    isLoading: boolean;
    isError: boolean;
  };
}
