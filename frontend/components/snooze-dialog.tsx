"use client";

import { useState } from "react";
import { REMINDR_ABI, getContractAddress } from "@/lib/contract";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { toast } from "sonner";
import { useChainId } from "wagmi";
import { useContractWrite } from "@/hooks/useContractWrite";
import { SNOOZE_OPTIONS, MAX_SNOOZES } from "@/lib/constants";
import { SnoozeDialogProps } from "@/lib/types";

export function SnoozeDialog({
  reminderId,
  onSuccess,
  currentSnoozeCount = BigInt(0),
  maxSnoozes = BigInt(MAX_SNOOZES),
}: SnoozeDialogProps) {
  const [open, setOpen] = useState(false);
  const chainId = useChainId();
  const contractAddress = getContractAddress(chainId);
  
  const { writeContract, isLoading } = useContractWrite({
    onSuccess: () => {
      setOpen(false);
      onSuccess?.();
    },
    successMessage: "Reminder snoozed! 🔔",
  });

  const canSnooze = currentSnoozeCount < maxSnoozes;

  const handleSnooze = (seconds: number) => {
    if (!canSnooze) {
      toast.error(`Maximum snooze limit reached (${maxSnoozes})`);
      return;
    }

    writeContract({
      address: contractAddress,
      abi: REMINDR_ABI,
      functionName: "snoozeReminder",
      args: [reminderId, BigInt(seconds)],
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          disabled={!canSnooze}
          className="text-blue-400 hover:text-blue-300"
          title={
            !canSnooze
              ? `Maximum snoozes reached (${maxSnoozes})`
              : "Snooze reminder"
          }
        >
          <Clock className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Snooze Reminder
          </DialogTitle>
          <DialogDescription>
            Choose how long to snooze this reminder. You have{" "}
            {Number(maxSnoozes) - Number(currentSnoozeCount)} snoozes remaining.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 mt-4">
          {SNOOZE_OPTIONS.map((option) => (
            <Button
              key={option.seconds}
              variant="outline"
              onClick={() => handleSnooze(option.seconds)}
              disabled={isLoading || !canSnooze}
              className="h-auto py-3 flex flex-col items-center gap-1"
            >
              <span className="font-semibold">{option.label}</span>
            </Button>
          ))}
        </div>
        {!canSnooze && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md">
            <p className="text-sm text-red-400">
              Maximum snooze limit reached. You cannot snooze this reminder
              again.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
