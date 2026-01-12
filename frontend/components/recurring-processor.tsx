"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { REMINDR_ABI, Reminder, getContractAddress } from "@/lib/contract";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, Zap, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useChainId } from "wagmi";

export function RecurringProcessor() {
  const { address } = useAccount();
  const chainId = useChainId();
  const contractAddress = getContractAddress(chainId);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastProcessed, setLastProcessed] = useState<Date | null>(null);

  const { data: reminders, refetch } = useReadContract({
    address: contractAddress,
    abi: REMINDR_ABI,
    functionName: "getUserReminders",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  }) as { data: Reminder[] | undefined; refetch: () => void };

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  // Auto-process recurring reminders every 5 minutes
  useEffect(() => {
    if (!address || !reminders) return;

    const processRecurring = async () => {
      const now = Math.floor(Date.now() / 1000);
      const recurringReminders = reminders.filter((r) => {
        if (!r.exists || r.isCompleted) return false;
        if (r.recurrenceType === 0) return false; // None
        if (Number(r.nextOccurrence) <= now && Number(r.timestamp) <= now) {
          return true;
        }
        return false;
      });

      if (recurringReminders.length > 0) {
        const ids = recurringReminders.map((r) => r.id);
        try {
          writeContract({
            address: contractAddress,
            abi: REMINDR_ABI,
            functionName: "processRecurringReminders",
            args: [ids],
          });
        } catch (error) {
          console.error("Error processing recurring reminders:", error);
        }
      }
    };

    // Process immediately if there are recurring reminders
    processRecurring();

    // Set up interval to check every 5 minutes
    const interval = setInterval(processRecurring, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [address, reminders, contractAddress, writeContract]);

  useEffect(() => {
    if (isConfirmed) {
      toast.success("Recurring reminders processed! 🔄");
      setLastProcessed(new Date());
      refetch();
    }
  }, [isConfirmed, refetch]);

  const handleManualProcess = () => {
    if (!reminders) return;

    const now = Math.floor(Date.now() / 1000);
    const recurringReminders = reminders.filter((r) => {
      if (!r.exists || r.isCompleted) return false;
      if (r.recurrenceType === 0) return false; // None
      if (Number(r.nextOccurrence) <= now && Number(r.timestamp) <= now) {
        return true;
      }
      return false;
    });

    if (recurringReminders.length === 0) {
      toast.info("No recurring reminders to process");
      return;
    }

    setIsProcessing(true);
    const ids = recurringReminders.map((r) => r.id);
    writeContract({
      address: contractAddress,
      abi: REMINDR_ABI,
      functionName: "processRecurringReminders",
      args: [ids],
    });
  };

  const recurringCount = reminders?.filter((r) => {
    if (!r.exists || r.isCompleted) return false;
    if (r.recurrenceType === 0) return false;
    const now = Math.floor(Date.now() / 1000);
    return Number(r.nextOccurrence) <= now && Number(r.timestamp) <= now;
  }).length || 0;

  return (
    <Card className="bg-white/80 dark:bg-white/10 backdrop-blur-lg">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="font-medium text-sm">Recurring Reminders</p>
              <p className="text-xs text-gray-500 dark:text-white/40">
                {recurringCount > 0
                  ? `${recurringCount} ready to process`
                  : "Auto-processing every 5 minutes"}
              </p>
            </div>
          </div>
          {recurringCount > 0 && (
            <Button
              size="sm"
              onClick={handleManualProcess}
              disabled={isPending || isConfirming || isProcessing}
            >
              <Zap className="w-4 h-4 mr-2" />
              Process Now
            </Button>
          )}
        </div>
        {lastProcessed && (
          <p className="text-xs text-gray-500 dark:text-white/40 mt-2">
            Last processed: {lastProcessed.toLocaleTimeString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
