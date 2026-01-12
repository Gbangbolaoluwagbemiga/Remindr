// Custom hook for contract write operations with transaction handling

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { toast } from "sonner";
import { useEffect } from "react";

interface UseContractWriteOptions {
  onSuccess?: () => void;
  successMessage?: string;
  errorMessage?: string;
}

export function useContractWrite(options: UseContractWriteOptions = {}) {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  useEffect(() => {
    if (isConfirmed) {
      if (options.successMessage) {
        toast.success(options.successMessage);
      }
      options.onSuccess?.();
    }
  }, [isConfirmed, options]);

  useEffect(() => {
    if (error) {
      toast.error(options.errorMessage || "Transaction failed");
    }
  }, [error, options.errorMessage]);

  return {
    writeContract,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    isLoading: isPending || isConfirming,
    error,
  };
}
