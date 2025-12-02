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
import { format, formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  Plus,
  CheckCircle2,
  Trash2,
  Edit2,
  Sparkles,
  Zap,
  Wallet,
  Bell,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

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
  const [isCreating, setIsCreating] = useState(false);

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
      setIsCreating(false);
      toast.success("Transaction confirmed! 🎉");
    }
  }, [isConfirmed, refetch]);

  const handleCreateReminder = () => {
    if (!title || !dateTime) {
      toast.error("Please fill in title and date/time");
      return;
    }

    const timestamp = Math.floor(new Date(dateTime).getTime() / 1000);
    const now = Math.floor(Date.now() / 1000);

    if (timestamp <= now) {
      toast.error("Please select a future date and time");
      return;
    }

    setIsCreating(true);
    writeContract({
      address: REMINDR_ADDRESS,
      abi: REMINDR_ABI,
      functionName: "createReminder",
      args: [title, description || "", BigInt(timestamp)],
    });
  };

  const handleUpdateReminder = (id: bigint) => {
    if (!title || !dateTime) {
      toast.error("Please fill in title and date/time");
      return;
    }

    const timestamp = Math.floor(new Date(dateTime).getTime() / 1000);
    const now = Math.floor(Date.now() / 1000);

    if (timestamp <= now) {
      toast.error("Please select a future date and time");
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
    toast.info("Marking reminder as completed...");
  };

  const handleDeleteReminder = (id: bigint) => {
    writeContract({
      address: REMINDR_ADDRESS,
      abi: REMINDR_ABI,
      functionName: "deleteReminder",
      args: [id],
    });
    toast.info("Deleting reminder...");
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

  const getTimeUntil = (timestamp: bigint) => {
    return formatDistanceToNow(new Date(Number(timestamp) * 1000), {
      addSuffix: true,
    });
  };

  const isPast = (timestamp: bigint) => {
    return Number(timestamp) * 1000 < Date.now();
  };

  const activeReminders =
    reminders?.filter((r) => r.exists && !r.isCompleted) || [];
  const completedReminders =
    reminders?.filter((r) => r.exists && r.isCompleted) || [];
  const pendingReminders = activeReminders.filter((r) => !isPast(r.timestamp));
  const overdueReminders = activeReminders.filter((r) => isPast(r.timestamp));

  return (
    <div className="min-h-screen dark:bg-gradient-to-br dark:from-indigo-950 dark:via-purple-950 dark:to-teal-800 bg-gradient-to-br from-indigo-50 via-purple-50 to-cyan-100 relative overflow-hidden transition-colors duration-500">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"
          animate={{
            x: [0, 100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 dark:bg-cyan-500 bg-cyan-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"
          animate={{
            x: [0, -100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-80 h-80 dark:bg-teal-500 bg-teal-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"
          animate={{
            x: [0, 50, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        {/* Theme Toggle - Top Right */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="absolute top-4 right-4 z-20"
        >
          <ThemeToggle />
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Bell className="w-12 h-12 text-yellow-400" />
            </motion.div>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Remindr
            </h1>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-8 h-8 text-yellow-400" />
            </motion.div>
          </div>
          <p className="text-xl text-gray-700 dark:text-white/80 mb-6">
            Never miss a governance vote, token unlock, or important date again
          </p>

          {/* Wallet Connection - Prominent */}
          {!isConnected ? (
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="flex items-center gap-2 dark:text-white/60 text-gray-600 mb-2">
                <Wallet className="w-5 h-5" />
                <span>Connect your wallet to get started</span>
              </div>
              <div className="scale-125">
                <AppKitButton />
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center gap-4"
            >
              <Badge
                variant="secondary"
                className="bg-green-500/20 text-green-300 border-green-500/50"
              >
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                Connected
              </Badge>
              <span className="dark:text-white/60 text-gray-600 font-mono text-sm">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => open({ view: "Account" })}
                className="dark:text-white/80 dark:hover:text-white text-gray-700 hover:text-gray-900"
              >
                Manage
              </Button>
            </motion.div>
          )}
        </motion.div>

        {isConnected && (
          <>
            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
            >
              <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white/60">Total</p>
                      <p className="text-2xl font-bold">
                        {reminders?.filter((r) => r.exists).length || 0}
                      </p>
                    </div>
                    <Bell className="w-8 h-8 text-yellow-400" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white/60">Pending</p>
                      <p className="text-2xl font-bold text-blue-400">
                        {pendingReminders.length}
                      </p>
                    </div>
                    <Clock className="w-8 h-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white/60">Overdue</p>
                      <p className="text-2xl font-bold text-red-400">
                        {overdueReminders.length}
                      </p>
                    </div>
                    <Zap className="w-8 h-8 text-red-400" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white/60">Completed</p>
                      <p className="text-2xl font-bold text-green-400">
                        {completedReminders.length}
                      </p>
                    </div>
                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Create Reminder Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="lg:col-span-1"
              >
                <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Plus className="w-5 h-5" />
                      {editingId ? "Edit Reminder" : "Create Reminder"}
                    </CardTitle>
                    <CardDescription className="text-white/60">
                      {editingId
                        ? "Update your reminder details"
                        : "Set a new on-chain reminder"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-white/80 mb-2 block">
                        Title *
                      </label>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Governance vote deadline"
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-white/80 mb-2 block">
                        Description
                      </label>
                      <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Optional description or notes"
                        rows={3}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-white/80 mb-2 block">
                        Date & Time *
                      </label>
                      <Input
                        type="datetime-local"
                        value={dateTime}
                        onChange={(e) => setDateTime(e.target.value)}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={
                          editingId
                            ? () => handleUpdateReminder(editingId)
                            : handleCreateReminder
                        }
                        disabled={
                          !title ||
                          !dateTime ||
                          isPending ||
                          isConfirming ||
                          isCreating
                        }
                        className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
                      >
                        {isPending || isConfirming || isCreating ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                            />
                            Processing...
                          </>
                        ) : editingId ? (
                          <>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Update
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Create
                          </>
                        )}
                      </Button>
                      {editingId && (
                        <Button
                          variant="outline"
                          onClick={cancelEditing}
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Reminders List */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="lg:col-span-2 space-y-4"
              >
                {/* Overdue Reminders */}
                {overdueReminders.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold text-red-400 mb-3 flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Overdue ({overdueReminders.length})
                    </h2>
                    <div className="space-y-3">
                      <AnimatePresence>
                        {overdueReminders.map((reminder) => (
                          <ReminderCard
                            key={reminder.id.toString()}
                            reminder={reminder}
                            onEdit={startEditing}
                            onComplete={handleCompleteReminder}
                            onDelete={handleDeleteReminder}
                            formatDate={formatDate}
                            getTimeUntil={getTimeUntil}
                            isPending={isPending || isConfirming}
                            variant="overdue"
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                )}

                {/* Pending Reminders */}
                {pendingReminders.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold text-blue-400 mb-3 flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Pending ({pendingReminders.length})
                    </h2>
                    <div className="space-y-3">
                      <AnimatePresence>
                        {pendingReminders.map((reminder) => (
                          <ReminderCard
                            key={reminder.id.toString()}
                            reminder={reminder}
                            onEdit={startEditing}
                            onComplete={handleCompleteReminder}
                            onDelete={handleDeleteReminder}
                            formatDate={formatDate}
                            getTimeUntil={getTimeUntil}
                            isPending={isPending || isConfirming}
                            variant="pending"
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                )}

                {/* Completed Reminders */}
                {completedReminders.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold text-green-400 mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      Completed ({completedReminders.length})
                    </h2>
                    <div className="space-y-3">
                      <AnimatePresence>
                        {completedReminders.map((reminder) => (
                          <ReminderCard
                            key={reminder.id.toString()}
                            reminder={reminder}
                            onEdit={startEditing}
                            onComplete={handleCompleteReminder}
                            onDelete={handleDeleteReminder}
                            formatDate={formatDate}
                            getTimeUntil={getTimeUntil}
                            isPending={isPending || isConfirming}
                            variant="completed"
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {(!reminders ||
                  reminders.filter((r) => r.exists).length === 0) && (
                  <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                    <CardContent className="p-12 text-center">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Bell className="w-16 h-16 text-white/40 mx-auto mb-4" />
                      </motion.div>
                      <p className="text-white/60 text-lg">No reminders yet</p>
                      <p className="text-white/40 text-sm mt-2">
                        Create your first reminder to get started!
                      </p>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ReminderCard({
  reminder,
  onEdit,
  onComplete,
  onDelete,
  formatDate,
  getTimeUntil,
  isPending,
  variant,
}: {
  reminder: Reminder;
  onEdit: (reminder: Reminder) => void;
  onComplete: (id: bigint) => void;
  onDelete: (id: bigint) => void;
  formatDate: (timestamp: bigint) => string;
  getTimeUntil: (timestamp: bigint) => string;
  isPending: boolean;
  variant: "pending" | "overdue" | "completed";
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case "overdue":
        return "bg-red-500/20 border-red-500/50";
      case "completed":
        return "bg-green-500/20 border-green-500/50 opacity-75";
      default:
        return "bg-blue-500/20 border-blue-500/50";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      layout
    >
      <Card
        className={`bg-white/10 backdrop-blur-lg border-white/20 ${getVariantStyles()} transition-all hover:scale-[1.02]`}
      >
        <CardContent className="p-4">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3
                  className={`font-semibold text-white ${
                    variant === "completed" ? "line-through" : ""
                  }`}
                >
                  {reminder.title}
                </h3>
                {variant === "overdue" && (
                  <Badge
                    variant="destructive"
                    className="bg-red-500/50 text-red-100"
                  >
                    Overdue
                  </Badge>
                )}
                {variant === "completed" && (
                  <Badge className="bg-green-500/50 text-green-100">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Done
                  </Badge>
                )}
              </div>
              {reminder.description && (
                <p className="text-white/70 text-sm mb-3">
                  {reminder.description}
                </p>
              )}
              <div className="flex items-center gap-4 text-sm text-white/60">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(reminder.timestamp)}
                </div>
                {variant !== "completed" && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {getTimeUntil(reminder.timestamp)}
                  </div>
                )}
              </div>
            </div>
            {variant !== "completed" && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onEdit(reminder)}
                  disabled={isPending}
                  className="text-white/80 hover:text-white hover:bg-white/10"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onComplete(reminder.id)}
                  disabled={isPending}
                  className="text-green-400 hover:text-green-300 hover:bg-green-500/20"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete(reminder.id)}
                  disabled={isPending}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
            {variant === "completed" && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(reminder.id)}
                disabled={isPending}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
