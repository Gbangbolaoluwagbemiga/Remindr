"use client";

import { useState } from "react";
import { REMINDR_ABI, getContractAddress } from "@/lib/contract";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CheckSquare, Trash2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useChainId } from "wagmi";
import { useContractWrite } from "@/hooks/useContractWrite";
import { BatchOperationsProps } from "@/lib/types";

export function BatchOperations({ reminders, onSuccess }: BatchOperationsProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isOpen, setIsOpen] = useState(false);
  const chainId = useChainId();
  const contractAddress = getContractAddress(chainId);
  
  const { writeContract, isLoading } = useContractWrite({
    onSuccess: () => {
      setSelectedIds(new Set());
      setIsOpen(false);
      onSuccess?.();
    },
    successMessage: `Successfully processed ${selectedIds.size} reminder(s)! 🎉`,
  });

  const activeReminders = reminders.filter((r) => r.exists && !r.isCompleted);

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    const allIds = new Set(activeReminders.map((r) => r.id.toString()));
    setSelectedIds(allIds);
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleBatchComplete = () => {
    if (selectedIds.size === 0) {
      toast.error("Please select at least one reminder");
      return;
    }

    const ids = Array.from(selectedIds).map((id) => BigInt(id));
    
    writeContract({
      address: contractAddress,
      abi: REMINDR_ABI,
      functionName: "batchCompleteReminders",
      args: [ids],
    });
  };

  const handleBatchDelete = () => {
    if (selectedIds.size === 0) {
      toast.error("Please select at least one reminder");
      return;
    }

    // Delete one by one (contract doesn't have batch delete)
    selectedIds.forEach((id) => {
      writeContract({
        address: contractAddress,
        abi: REMINDR_ABI,
        functionName: "deleteReminder",
        args: [BigInt(id)],
      });
    });
  };


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <CheckSquare className="w-4 h-4 mr-2" />
          Batch Operations
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Batch Operations</DialogTitle>
          <DialogDescription>
            Select multiple reminders to complete or delete them at once.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAll}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={clearSelection}>
                Clear
              </Button>
            </div>
            <p className="text-sm text-gray-600 dark:text-white/60">
              {selectedIds.size} selected
            </p>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {activeReminders.map((reminder) => {
              const isSelected = selectedIds.has(reminder.id.toString());
              return (
                <div
                  key={reminder.id.toString()}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    isSelected
                      ? "bg-blue-500/10 border-blue-500"
                      : "bg-white/50 dark:bg-white/5 border-gray-200 dark:border-white/10"
                  }`}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleSelection(reminder.id.toString())}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{reminder.title}</p>
                    <p className="text-xs text-gray-500 dark:text-white/40">
                      {new Date(Number(reminder.timestamp) * 1000).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {activeReminders.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-white/40">
                No active reminders to select
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-4 border-t">
            <Button
              onClick={handleBatchComplete}
              disabled={selectedIds.size === 0 || isLoading}
              className="flex-1"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Complete Selected ({selectedIds.size})
            </Button>
            <Button
              variant="destructive"
              onClick={handleBatchDelete}
              disabled={selectedIds.size === 0 || isLoading}
              className="flex-1"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Selected ({selectedIds.size})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
