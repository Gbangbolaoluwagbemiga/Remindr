"use client";

import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { REMINDR_ABI, REMINDR_ADDRESS } from "@/lib/contract";
import { useState, useEffect } from "react";
import { useAppKit, AppKitButton } from "@reown/appkit/react";
import { format } from "date-fns";

interface Reminder {
  id: bigint;
  owner: string;
  title: string;
  description: string;
  timestamp: bigint;
  isCompleted: boolean;
  exists: boolean;
  createdAt: bigint;
}

export default function Home() {
  const { address, isConnected } = useAccount();
  const { open } = useAppKit();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [editingId, setEditingId] = useState<bigint | null>(null);

  // Read user reminders
  const { data: reminders, refetch } = useReadContract({
    address: REMINDR_ADDRESS,
    abi: REMINDR_ABI,
    functionName: "getUserReminders",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  }) as { data: Reminder[] | undefined; refetch: () => void };

  // Write contract hooks
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  // Refetch reminders after successful transaction
  useEffect(() => {
    if (isConfirmed) {
      refetch();
      setTitle("");
      setDescription("");
      setDateTime("");
      setEditingId(null);
    }
  }, [isConfirmed, refetch]);

  const handleCreateReminder = () => {
    if (!title || !dateTime) return;

    const timestamp = Math.floor(new Date(dateTime).getTime() / 1000);
    const now = Math.floor(Date.now() / 1000);

    if (timestamp <= now) {
      alert("Please select a future date and time");
      return;
    }

    writeContract({
      address: REMINDR_ADDRESS,
      abi: REMINDR_ABI,
      functionName: "createReminder",
      args: [title, description || "", BigInt(timestamp)],
    });
  };

  const handleUpdateReminder = (id: bigint) => {
    if (!title || !dateTime) return;

    const timestamp = Math.floor(new Date(dateTime).getTime() / 1000);
    const now = Math.floor(Date.now() / 1000);

    if (timestamp <= now) {
      alert("Please select a future date and time");
      return;
    }

    writeContract({
      address: REMINDR_ADDRESS,
      abi: REMINDR_ABI,
      functionName: "updateReminder",
      args: [id, title, description || "", BigInt(timestamp)],
    });
  };

  const handleCompleteReminder = (id: bigint) => {
    writeContract({
      address: REMINDR_ADDRESS,
      abi: REMINDR_ABI,
      functionName: "completeReminder",
      args: [id],
    });
  };

  const handleDeleteReminder = (id: bigint) => {
    if (confirm("Are you sure you want to delete this reminder?")) {
      writeContract({
        address: REMINDR_ADDRESS,
        abi: REMINDR_ABI,
        functionName: "deleteReminder",
        args: [id],
      });
    }
  };

  const startEditing = (reminder: Reminder) => {
    setEditingId(reminder.id);
    setTitle(reminder.title);
    setDescription(reminder.description);
    setDateTime(
      format(new Date(Number(reminder.timestamp) * 1000), "yyyy-MM-dd'T'HH:mm")
    );
  };

  const cancelEditing = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setDateTime("");
  };

  const formatDate = (timestamp: bigint) => {
    return format(
      new Date(Number(timestamp) * 1000),
      "MMM dd, yyyy 'at' HH:mm"
    );
  };

  const isPast = (timestamp: bigint) => {
    return Number(timestamp) * 1000 < Date.now();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📅 Remindr</h1>
          <p className="text-gray-600">On-chain reminders for your wallet</p>
        </div>

        {/* Wallet Connection */}
        {!isConnected ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-6">
              Connect your wallet to create and manage on-chain reminders
            </p>
            <AppKitButton />
          </div>
        ) : (
          <>
            {/* Create/Edit Reminder Form */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-semibold mb-4">
                {editingId ? "Edit Reminder" : "Create New Reminder"}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Governance vote deadline"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Optional description or notes"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={
                      editingId
                        ? () => handleUpdateReminder(editingId)
                        : handleCreateReminder
                    }
                    disabled={!title || !dateTime || isPending || isConfirming}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    {isPending || isConfirming
                      ? "Processing..."
                      : editingId
                      ? "Update Reminder"
                      : "Create Reminder"}
                  </button>
                  {editingId && (
                    <button
                      onClick={cancelEditing}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
                {isConfirmed && (
                  <p className="text-green-600 text-sm">
                    ✅ Transaction confirmed!
                  </p>
                )}
              </div>
            </div>

            {/* Reminders List */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Your Reminders</h2>
              {!reminders || reminders.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No reminders yet. Create your first one above!
                </p>
              ) : (
                <div className="space-y-4">
                  {reminders
                    .filter((r) => r.exists)
                    .sort((a, b) => {
                      if (a.isCompleted !== b.isCompleted) {
                        return a.isCompleted ? 1 : -1;
                      }
                      return Number(a.timestamp) - Number(b.timestamp);
                    })
                    .map((reminder) => (
                      <div
                        key={reminder.id.toString()}
                        className={`border rounded-lg p-4 ${
                          reminder.isCompleted
                            ? "bg-gray-50 border-gray-200"
                            : isPast(reminder.timestamp)
                            ? "bg-yellow-50 border-yellow-300"
                            : "bg-blue-50 border-blue-200"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3
                                className={`font-semibold ${
                                  reminder.isCompleted
                                    ? "line-through text-gray-500"
                                    : ""
                                }`}
                              >
                                {reminder.title}
                              </h3>
                              {reminder.isCompleted && (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                  Completed
                                </span>
                              )}
                              {!reminder.isCompleted &&
                                isPast(reminder.timestamp) && (
                                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                    Overdue
                                  </span>
                                )}
                            </div>
                            {reminder.description && (
                              <p className="text-gray-600 text-sm mb-2">
                                {reminder.description}
                              </p>
                            )}
                            <p className="text-sm text-gray-500">
                              📅 {formatDate(reminder.timestamp)}
                            </p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            {!reminder.isCompleted && (
                              <>
                                <button
                                  onClick={() => startEditing(reminder)}
                                  className="text-indigo-600 hover:text-indigo-800 text-sm"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() =>
                                    handleCompleteReminder(reminder.id)
                                  }
                                  disabled={isPending || isConfirming}
                                  className="text-green-600 hover:text-green-800 text-sm"
                                >
                                  Complete
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleDeleteReminder(reminder.id)}
                              disabled={isPending || isConfirming}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Connected Wallet Info */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Connected: <span className="font-mono">{address}</span>
              </p>
              <button
                onClick={() => open({ view: "Account" })}
                className="text-sm text-indigo-600 hover:text-indigo-800 mt-2"
              >
                Manage Wallet
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
