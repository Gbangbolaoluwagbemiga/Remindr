"use client";

import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import {
  REMINDR_ABI,
  REMINDR_ADDRESS,
  Reminder,
  RecurrenceType,
  Category,
  ReminderPriority,
  Template,
  UserStats,
  getRecurrenceLabel,
  getCategoryLabel,
  getPriorityLabel,
  getCategoryColor,
  getPriorityColor,
} from "@/lib/contract";
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
import { Badge } from "@/components/ui/badge";
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
  Users,
  Trophy,
  TrendingUp,
  FileText,
  Repeat,
  Tag,
  Eye,
  EyeOff,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useReminderNotifications } from "@/hooks/useReminderNotifications";
import { ReminderForm } from "@/components/reminder-form";
import { LandingPage } from "@/components/landing-page";
import { ReminderSkeletonList } from "@/components/reminder-skeleton";
import { StatsSkeleton } from "@/components/stats-skeleton";
import { ErrorBoundary } from "@/components/error-boundary";
import { SearchBar } from "@/components/search-bar";

type ViewMode = "my" | "public" | "templates" | "stats";

export default function Home() {
  const { address, isConnected } = useAccount();
  const { open } = useAppKit();
  const [viewMode, setViewMode] = useState<ViewMode>("my");
  const [selectedTemplate, setSelectedTemplate] = useState<bigint | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>(
    RecurrenceType.None
  );
  const [recurrenceInterval, setRecurrenceInterval] = useState("0");
  const [category, setCategory] = useState<Category>(Category.Other);
  const [priority, setPriority] = useState<ReminderPriority>(
    ReminderPriority.Medium
  );
  const [tags, setTags] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  const [editingId, setEditingId] = useState<bigint | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Read user reminders
  const { 
    data: reminders, 
    refetch,
    isLoading: isLoadingReminders,
    isError: isErrorReminders,
  } = useReadContract({
    address: REMINDR_ADDRESS,
    abi: REMINDR_ABI,
    functionName: "getUserReminders",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && viewMode === "my",
    },
  }) as { 
    data: Reminder[] | undefined; 
    refetch: () => void;
    isLoading: boolean;
    isError: boolean;
  };

  // Read public reminders
  const { 
    data: publicReminders, 
    refetch: refetchPublic,
    isLoading: isLoadingPublic,
    isError: isErrorPublic,
  } = useReadContract({
    address: REMINDR_ADDRESS,
    abi: REMINDR_ABI,
    functionName: "getPublicReminders",
    args: [BigInt(20), BigInt(0)],
    query: {
      enabled: viewMode === "public",
    },
  }) as { 
    data: Reminder[] | undefined; 
    refetch: () => void;
    isLoading: boolean;
    isError: boolean;
  };

  // Read templates
  const { data: templates } = useReadContract({
    address: REMINDR_ADDRESS,
    abi: REMINDR_ABI,
    functionName: "getTemplates",
    query: {
      enabled: viewMode === "templates",
    },
  }) as { data: Template[] | undefined };

  // Read user stats
  const { 
    data: userStats,
    isLoading: isLoadingStats,
    isError: isErrorStats,
  } = useReadContract({
    address: REMINDR_ADDRESS,
    abi: REMINDR_ABI,
    functionName: "getUserStats",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  }) as { 
    data: UserStats | undefined;
    isLoading: boolean;
    isError: boolean;
  };

  // Write contract hooks
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  // Refetch after successful transaction
  useEffect(() => {
    if (isConfirmed) {
      refetch();
      refetchPublic();
      resetForm();
      toast.success("Transaction confirmed! 🎉");
    }
  }, [isConfirmed, refetch, refetchPublic]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDateTime("");
    setRecurrenceType(RecurrenceType.None);
    setRecurrenceInterval("0");
    setCategory(Category.Other);
    setPriority(ReminderPriority.Medium);
    setTags([]);
    setIsPublic(false);
    setEditingId(null);
    setIsCreating(false);
    setSelectedTemplate(null);
  };

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
      args: [
        title,
        description || "",
        BigInt(timestamp),
        recurrenceType,
        BigInt(recurrenceInterval || "0"),
        isPublic,
        category,
        priority,
        tags,
        selectedTemplate || BigInt(0),
      ],
    });
  };

  const handleCreateFromTemplate = (template: Template) => {
    if (!dateTime) {
      const defaultTime = new Date();
      defaultTime.setTime(
        defaultTime.getTime() + Number(template.defaultDuration) * 1000
      );
      setDateTime(format(defaultTime, "yyyy-MM-dd'T'HH:mm"));
    }
    setTitle(template.title);
    setDescription(template.description);
    setCategory(template.category);
    setSelectedTemplate(template.id);
    setViewMode("my");
    toast.info(
      "Template loaded! Fill in the date/time and create your reminder."
    );
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
      args: [
        id,
        title,
        description || "",
        BigInt(timestamp),
        category,
        priority,
        tags,
      ],
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

  const handleAddParticipant = (id: bigint, participantAddress: string) => {
    if (
      !participantAddress ||
      !participantAddress.match(/^0x[a-fA-F0-9]{40}$/)
    ) {
      toast.error("Invalid address");
      return;
    }
    writeContract({
      address: REMINDR_ADDRESS,
      abi: REMINDR_ABI,
      functionName: "addParticipant",
      args: [id, participantAddress as `0x${string}`],
    });
    toast.info("Adding participant...");
  };

  const startEditing = (reminder: Reminder) => {
    setEditingId(reminder.id);
    setTitle(reminder.title);
    setDescription(reminder.description);
    setDateTime(
      format(new Date(Number(reminder.timestamp) * 1000), "yyyy-MM-dd'T'HH:mm")
    );
    setRecurrenceType(reminder.recurrenceType);
    setRecurrenceInterval(reminder.recurrenceInterval.toString());
    setCategory(reminder.category);
    setPriority(reminder.priority);
    setTags(reminder.tags);
    setIsPublic(reminder.isPublic);
    setViewMode("my");
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

  // Notification system
  const { permission, requestPermission, isSupported } =
    useReminderNotifications(reminders, isConnected);

  const displayReminders = viewMode === "public" ? publicReminders : reminders;
  
  // Filter reminders by search query
  const filteredReminders = displayReminders?.filter((r) => {
    if (!r.exists) return false;
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      r.title.toLowerCase().includes(query) ||
      r.description.toLowerCase().includes(query) ||
      r.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  }) || [];
  
  const activeReminders = filteredReminders.filter((r) => !r.isCompleted);
  const completedReminders = filteredReminders.filter((r) => r.isCompleted);
  const pendingReminders = activeReminders.filter((r) => !isPast(r.timestamp));
  const overdueReminders = activeReminders.filter((r) => isPast(r.timestamp));

  // Show landing page when not connected
  if (!isConnected) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="absolute top-4 right-4 z-20">
          <ThemeToggle />
        </div>
        <LandingPage />
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-smooth-gradient relative overflow-hidden transition-colors duration-500">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-[32rem] h-[32rem] dark:bg-purple-600 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl dark:opacity-20 opacity-25 animate-blob"
          animate={{ x: [0, 100, 0], y: [0, 100, 0] }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-[32rem] h-[32rem] dark:bg-cyan-600 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl dark:opacity-18 opacity-25 animate-blob animation-delay-2000"
          animate={{ x: [0, -100, 0], y: [0, -100, 0] }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-4 right-4 z-20"
        >
          <ThemeToggle />
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
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
            Advanced on-chain reminders with recurring, shared, and public
            features
          </p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-4"
          >
            <Badge
              variant="secondary"
              className="bg-green-500 dark:bg-green-500/20 text-white dark:text-green-300 border-green-600 dark:border-green-500/50 shadow-md px-3 py-1.5"
            >
              <div className="w-2 h-2 bg-white dark:bg-green-400 rounded-full mr-2 animate-pulse" />
              Connected
            </Badge>
            <span className="dark:text-white/60 text-gray-700 font-mono text-sm font-medium bg-white/60 dark:bg-white/10 px-3 py-1.5 rounded-md backdrop-blur-sm border border-gray-200 dark:border-white/20">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => open({ view: "Account" })}
            >
              Manage
            </Button>
          </motion.div>
        </motion.div>

            {/* View Mode Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-2 mb-6 justify-center flex-wrap"
            >
              {viewMode !== "stats" && viewMode !== "templates" && (
                <div className="w-full flex justify-center mb-4">
                  <SearchBar onSearch={setSearchQuery} />
                </div>
              )}
              <Button
                variant={viewMode === "my" ? "default" : "outline"}
                onClick={() => setViewMode("my")}
                className={
                  viewMode === "my"
                    ? "bg-gradient-to-r from-purple-500 to-pink-500"
                    : ""
                }
              >
                <Bell className="w-4 h-4 mr-2" />
                My Reminders
              </Button>
              <Button
                variant={viewMode === "public" ? "default" : "outline"}
                onClick={() => setViewMode("public")}
                className={
                  viewMode === "public"
                    ? "bg-gradient-to-r from-purple-500 to-pink-500"
                    : ""
                }
              >
                <Eye className="w-4 h-4 mr-2" />
                Public Feed
              </Button>
              <Button
                variant={viewMode === "templates" ? "default" : "outline"}
                onClick={() => setViewMode("templates")}
                className={
                  viewMode === "templates"
                    ? "bg-gradient-to-r from-purple-500 to-pink-500"
                    : ""
                }
              >
                <FileText className="w-4 h-4 mr-2" />
                Templates
              </Button>
              <Button
                variant={viewMode === "stats" ? "default" : "outline"}
                onClick={() => setViewMode("stats")}
                className={
                  viewMode === "stats"
                    ? "bg-gradient-to-r from-purple-500 to-pink-500"
                    : ""
                }
              >
                <Trophy className="w-4 h-4 mr-2" />
                Stats
              </Button>
            </motion.div>

            {/* User Stats Dashboard */}
            {viewMode === "stats" && isLoadingStats && (
              <StatsSkeleton />
            )}
            {viewMode === "stats" && isErrorStats && (
              <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                <CardContent className="p-6 text-center">
                  <p className="text-red-800 dark:text-red-200 mb-4">
                    Failed to load stats. Please try again.
                  </p>
                  <Button onClick={() => window.location.reload()}>
                    Reload
                  </Button>
                </CardContent>
              </Card>
            )}
            {viewMode === "stats" && userStats && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
              >
                <Card className="bg-white/80 dark:bg-white/10 backdrop-blur-lg">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600 dark:text-white/60">
                      Created
                    </p>
                    <p className="text-3xl font-bold">
                      {userStats.totalRemindersCreated.toString()}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-white/80 dark:bg-white/10 backdrop-blur-lg">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600 dark:text-white/60">
                      Completed
                    </p>
                    <p className="text-3xl font-bold text-green-400">
                      {userStats.totalRemindersCompleted.toString()}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-white/80 dark:bg-white/10 backdrop-blur-lg">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600 dark:text-white/60">
                      Streak
                    </p>
                    <p className="text-3xl font-bold text-yellow-400">
                      {userStats.streakDays.toString()} days
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-white/80 dark:bg-white/10 backdrop-blur-lg">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600 dark:text-white/60">
                      Reputation
                    </p>
                    <p className="text-3xl font-bold text-purple-400">
                      {userStats.reputationScore.toString()}/1000
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Templates View */}
            {viewMode === "templates" && templates && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
              >
                {templates.map((template) => (
                  <Card
                    key={template.id.toString()}
                    className="bg-white/80 dark:bg-white/10 backdrop-blur-lg hover:scale-105 transition-transform cursor-pointer"
                    onClick={() => handleCreateFromTemplate(template)}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        {template.title}
                      </CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Badge className={getCategoryColor(template.category)}>
                        {getCategoryLabel(template.category)}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </motion.div>
            )}

            {/* Stats Cards */}
            {viewMode !== "stats" && viewMode !== "templates" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
              >
                <Card className="bg-white/80 dark:bg-white/10 backdrop-blur-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-white/60">
                          Total
                        </p>
                        <p className="text-2xl font-bold">
                          {searchQuery 
                            ? filteredReminders.length 
                            : displayReminders?.filter((r) => r.exists).length || 0}
                        </p>
                      </div>
                      <Bell className="w-8 h-8 text-yellow-400" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white/80 dark:bg-white/10 backdrop-blur-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-white/60">
                          Pending
                        </p>
                        <p className="text-2xl font-bold text-blue-400">
                          {pendingReminders.length}
                        </p>
                      </div>
                      <Clock className="w-8 h-8 text-blue-400" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white/80 dark:bg-white/10 backdrop-blur-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-white/60">
                          Overdue
                        </p>
                        <p className="text-2xl font-bold text-red-400">
                          {overdueReminders.length}
                        </p>
                      </div>
                      <Zap className="w-8 h-8 text-red-400" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white/80 dark:bg-white/10 backdrop-blur-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-white/60">
                          Completed
                        </p>
                        <p className="text-2xl font-bold text-green-400">
                          {completedReminders.length}
                        </p>
                      </div>
                      <CheckCircle2 className="w-8 h-8 text-green-400" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Create/Edit Reminder Form */}
              {(viewMode === "my" || viewMode === "templates") && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="lg:col-span-1"
                >
                  <Card className="bg-white/90 dark:bg-white/10 backdrop-blur-lg border-gray-200/50 dark:border-white/20 shadow-2xl">
                    <CardHeader>
                      <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        {editingId ? "Edit Reminder" : "Create Reminder"}
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-white/60">
                        {editingId
                          ? "Update your reminder details"
                          : "Set a new on-chain reminder"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ReminderForm
                        title={title}
                        description={description}
                        dateTime={dateTime}
                        recurrenceType={recurrenceType}
                        recurrenceInterval={recurrenceInterval}
                        category={category}
                        priority={priority}
                        tags={tags}
                        isPublic={isPublic}
                        templateId={selectedTemplate}
                        onTitleChange={setTitle}
                        onDescriptionChange={setDescription}
                        onDateTimeChange={setDateTime}
                        onRecurrenceTypeChange={setRecurrenceType}
                        onRecurrenceIntervalChange={setRecurrenceInterval}
                        onCategoryChange={setCategory}
                        onPriorityChange={setPriority}
                        onTagsChange={setTags}
                        onIsPublicChange={setIsPublic}
                        onSubmit={
                          editingId
                            ? () => handleUpdateReminder(editingId)
                            : handleCreateReminder
                        }
                        onCancel={editingId ? resetForm : undefined}
                        isSubmitting={isPending || isConfirming || isCreating}
                        submitLabel={editingId ? "Update" : "Create"}
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Reminders List */}
              {viewMode !== "stats" && viewMode !== "templates" && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={
                    viewMode === "my" || viewMode === "templates"
                      ? "lg:col-span-2"
                      : "lg:col-span-3"
                  }
                >
                  <div className="space-y-4">
                    {(isLoadingReminders || (viewMode === "public" && isLoadingPublic)) && (
                      <ReminderSkeletonList count={3} />
                    )}
                    {((isErrorReminders && viewMode === "my") || (isErrorPublic && viewMode === "public")) && (
                      <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                        <CardContent className="p-6 text-center">
                          <p className="text-red-800 dark:text-red-200 mb-4">
                            Failed to load reminders. Please try again.
                          </p>
                          <Button onClick={() => viewMode === "my" ? refetch() : refetchPublic()}>
                            Retry
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                    {overdueReminders.length > 0 && (
                      <div>
                        <h2 className="text-xl font-semibold text-red-400 mb-3 flex items-center gap-2">
                          <Zap className="w-5 h-5" />
                          Overdue ({overdueReminders.length})
                        </h2>
                        <div className="space-y-3">
                          <AnimatePresence>
                            {overdueReminders.map((reminder) => (
                              <EnhancedReminderCard
                                key={reminder.id.toString()}
                                reminder={reminder}
                                onEdit={startEditing}
                                onComplete={handleCompleteReminder}
                                onDelete={handleDeleteReminder}
                                onAddParticipant={handleAddParticipant}
                                formatDate={formatDate}
                                getTimeUntil={getTimeUntil}
                                isPending={isPending || isConfirming}
                                variant="overdue"
                                currentAddress={address}
                              />
                            ))}
                          </AnimatePresence>
                        </div>
                      </div>
                    )}

                    {pendingReminders.length > 0 && (
                      <div>
                        <h2 className="text-xl font-semibold text-blue-400 mb-3 flex items-center gap-2">
                          <Clock className="w-5 h-5" />
                          Pending ({pendingReminders.length})
                        </h2>
                        <div className="space-y-3">
                          <AnimatePresence>
                            {pendingReminders.map((reminder) => (
                              <EnhancedReminderCard
                                key={reminder.id.toString()}
                                reminder={reminder}
                                onEdit={startEditing}
                                onComplete={handleCompleteReminder}
                                onDelete={handleDeleteReminder}
                                onAddParticipant={handleAddParticipant}
                                formatDate={formatDate}
                                getTimeUntil={getTimeUntil}
                                isPending={isPending || isConfirming}
                                variant="pending"
                                currentAddress={address}
                              />
                            ))}
                          </AnimatePresence>
                        </div>
                      </div>
                    )}

                    {completedReminders.length > 0 && (
                      <div>
                        <h2 className="text-xl font-semibold text-green-400 mb-3 flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5" />
                          Completed ({completedReminders.length})
                        </h2>
                        <div className="space-y-3">
                          <AnimatePresence>
                            {completedReminders.map((reminder) => (
                              <EnhancedReminderCard
                                key={reminder.id.toString()}
                                reminder={reminder}
                                onEdit={startEditing}
                                onComplete={handleCompleteReminder}
                                onDelete={handleDeleteReminder}
                                onAddParticipant={handleAddParticipant}
                                formatDate={formatDate}
                                getTimeUntil={getTimeUntil}
                                isPending={isPending || isConfirming}
                                variant="completed"
                                currentAddress={address}
                              />
                            ))}
                          </AnimatePresence>
                        </div>
                      </div>
                    )}

                    {(!displayReminders ||
                      displayReminders.filter((r) => r.exists).length ===
                        0) && (
                      <Card className="bg-white/90 dark:bg-white/10 backdrop-blur-lg">
                        <CardContent className="p-12 text-center">
                          <Bell className="w-16 h-16 text-gray-400 dark:text-white/40 mx-auto mb-4" />
                          <p className="text-gray-700 dark:text-white/60 text-lg">
                            No reminders yet
                          </p>
                          <p className="text-gray-500 dark:text-white/40 text-sm mt-2">
                            {viewMode === "public"
                              ? "No public reminders available"
                              : "Create your first reminder to get started!"}
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
      </div>
    </div>
  );
}

function EnhancedReminderCard({
  reminder,
  onEdit,
  onComplete,
  onDelete,
  onAddParticipant,
  formatDate,
  getTimeUntil,
  isPending,
  variant,
  currentAddress,
}: {
  reminder: Reminder;
  onEdit: (reminder: Reminder) => void;
  onComplete: (id: bigint) => void;
  onDelete: (id: bigint) => void;
  onAddParticipant: (id: bigint, address: string) => void;
  formatDate: (timestamp: bigint) => string;
  getTimeUntil: (timestamp: bigint) => string;
  isPending: boolean;
  variant: "pending" | "overdue" | "completed";
  currentAddress: string | undefined;
}) {
  const [showParticipantInput, setShowParticipantInput] = useState(false);
  const [participantAddress, setParticipantAddress] = useState("");

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

  const isOwner =
    reminder.owner.toLowerCase() === currentAddress?.toLowerCase();

  return (
    <motion.div
      id={`reminder-${reminder.id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      layout
    >
      <Card
        className={`bg-white/90 dark:bg-white/10 backdrop-blur-lg border-gray-200/50 dark:border-white/20 shadow-lg ${getVariantStyles()} transition-all hover:scale-[1.02]`}
      >
        <CardContent className="p-4">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <h3
                  className={`font-semibold text-gray-900 dark:text-white ${
                    variant === "completed" ? "line-through" : ""
                  }`}
                >
                  {reminder.title}
                </h3>
                {reminder.isPublic && (
                  <Badge variant="secondary" className="bg-blue-500/50">
                    <Eye className="w-3 h-3 mr-1" />
                    Public
                  </Badge>
                )}
                {reminder.isShared && (
                  <Badge variant="secondary" className="bg-purple-500/50">
                    <Users className="w-3 h-3 mr-1" />
                    Shared
                  </Badge>
                )}
                {reminder.recurrenceType !== RecurrenceType.None && (
                  <Badge variant="secondary" className="bg-green-500/50">
                    <Repeat className="w-3 h-3 mr-1" />
                    {getRecurrenceLabel(reminder.recurrenceType)}
                  </Badge>
                )}
                <Badge className={getCategoryColor(reminder.category)}>
                  {getCategoryLabel(reminder.category)}
                </Badge>
                <Badge className={getPriorityColor(reminder.priority)}>
                  {getPriorityLabel(reminder.priority)}
                </Badge>
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
                <p className="text-gray-700 dark:text-white/70 text-sm mb-3">
                  {reminder.description}
                </p>
              )}
              {reminder.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {reminder.tags.map((tag, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      <Tag className="w-2 h-2 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-white/60 flex-wrap">
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
                {reminder.participants.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {reminder.participants.length} participant
                    {reminder.participants.length > 1 ? "s" : ""}
                  </div>
                )}
              </div>
              {isOwner && reminder.isShared && showParticipantInput && (
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={participantAddress}
                    onChange={(e) => setParticipantAddress(e.target.value)}
                    placeholder="0x..."
                    className="flex-1 px-3 py-2 bg-white/60 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-md text-sm"
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      onAddParticipant(reminder.id, participantAddress);
                      setParticipantAddress("");
                      setShowParticipantInput(false);
                    }}
                  >
                    Add
                  </Button>
                </div>
              )}
            </div>
            {variant !== "completed" && isOwner && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onEdit(reminder)}
                  disabled={isPending}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                {reminder.isShared && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      setShowParticipantInput(!showParticipantInput)
                    }
                    disabled={isPending}
                  >
                    <Users className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onComplete(reminder.id)}
                  disabled={isPending}
                  className="text-green-400 hover:text-green-300"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete(reminder.id)}
                  disabled={isPending}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
            {variant === "completed" && isOwner && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(reminder.id)}
                disabled={isPending}
                className="text-red-400 hover:text-red-300"
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
