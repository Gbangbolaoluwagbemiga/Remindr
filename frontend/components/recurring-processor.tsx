"use client";

import { useState, useEffect } from "react";
import { REMINDR_ABI, getContractAddress } from "@/lib/contract";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, Zap } from "lucide-react";
import { toast } from "sonner";
import { useChainId } from "wagmi";
import { useUserReminders } from "@/hooks/useReminders";
import { useContractWrite } from "@/hooks/useContractWrite";
import { getRecurringRemindersReady } from "@/lib/reminder-utils";
import { RECURRING_PROCESS_INTERVAL } from "@/lib/constants";

export function RecurringProcessor() {
  const chainId = useChainId();
  const contractAddress = getContractAddress(chainId);
  const [lastProcessed, setLastProcessed] = useState<Date | null>(null);

  const { data: reminders, refetch } = useUserReminders();
  
  const { writeContract, isLoading } = useContractWrite({
    onSuccess: () => {
      setLastProcessed(new Date());
      refetch();
    },
    successMessage: "Recurring reminders processed! 🔄",
  });

  // Auto-process recurring reminders
  useEffect(() => {
    if (!reminders) return;

    const processRecurring = () => {
      const readyReminders = getRecurringRemindersReady(reminders);
      if (readyReminders.length > 0) {
        const ids = readyReminders.map((r) => r.id);
        writeContract({
          address: contractAddress,
          abi: REMINDR_ABI,
          functionName: "processRecurringReminders",
          args: [ids],
        });
      }
    };

    processRecurring();
    const interval = setInterval(processRecurring, RECURRING_PROCESS_INTERVAL);
    return () => clearInterval(interval);
  }, [reminders, contractAddress, writeContract]);

  const handleManualProcess = () => {
    if (!reminders) return;

    const readyReminders = getRecurringRemindersReady(reminders);
    if (readyReminders.length === 0) {
      toast.info("No recurring reminders to process");
      return;
    }

    const ids = readyReminders.map((r) => r.id);
    writeContract({
      address: contractAddress,
      abi: REMINDR_ABI,
      functionName: "processRecurringReminders",
      args: [ids],
    });
  };

  const recurringCount = reminders ? getRecurringRemindersReady(reminders).length : 0;

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
              disabled={isLoading}
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
