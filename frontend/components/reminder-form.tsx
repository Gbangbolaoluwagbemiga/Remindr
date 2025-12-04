"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Edit2 } from "lucide-react";
import {
  RecurrenceType,
  ReminderCategory,
  Priority,
  type Reminder,
} from "@/lib/contract";

interface ReminderFormProps {
  onSubmit: (data: ReminderFormData) => void;
  onCancel?: () => void;
  editingReminder?: Reminder | null;
  isLoading?: boolean;
  templates?: any[];
  onUseTemplate?: (templateId: number) => void;
}

export interface ReminderFormData {
  title: string;
  description: string;
  timestamp: number;
  recurrenceType: RecurrenceType;
  recurrenceInterval: number;
  isPublic: boolean;
  category: ReminderCategory;
  priority: Priority;
  tags: string[];
  templateId: number;
}

export function ReminderForm({
  onSubmit,
  onCancel,
  editingReminder,
  isLoading = false,
  templates = [],
  onUseTemplate,
}: ReminderFormProps) {
  const [title, setTitle] = useState(editingReminder?.title || "");
  const [description, setDescription] = useState(
    editingReminder?.description || ""
  );
  const [dateTime, setDateTime] = useState(
    editingReminder
      ? format(new Date(Number(editingReminder.timestamp) * 1000), "yyyy-MM-dd'T'HH:mm")
      : ""
  );
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>(
    editingReminder?.recurrenceType ?? RecurrenceType.None
  );
  const [recurrenceInterval, setRecurrenceInterval] = useState("0");
  const [isPublic, setIsPublic] = useState(editingReminder?.isPublic || false);
  const [category, setCategory] = useState<ReminderCategory>(
    editingReminder?.category ?? ReminderCategory.Personal
  );
  const [priority, setPriority] = useState<Priority>(
    editingReminder?.priority ?? Priority.Medium
  );
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(editingReminder?.tags || []);

  const format = (date: Date, format: string) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return format
      .replace("yyyy", String(year))
      .replace("MM", month)
      .replace("dd", day)
      .replace("HH", hours)
      .replace("mm", minutes);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dateTime) {
      return;
    }

    const timestamp = Math.floor(new Date(dateTime).getTime() / 1000);
    const interval =
      recurrenceType === RecurrenceType.Custom
        ? parseInt(recurrenceInterval) || 0
        : 0;

    onSubmit({
      title,
      description,
      timestamp,
      recurrenceType,
      recurrenceInterval: interval,
      isPublic,
      category,
      priority,
      tags,
      templateId: 0,
    });
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  return (
    <Card className="bg-white/90 dark:bg-white/10 backdrop-blur-lg border-gray-200/50 dark:border-white/20 shadow-2xl">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
          <Plus className="w-5 h-5" />
          {editingReminder ? "Edit Reminder" : "Create Reminder"}
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-white/60">
          {editingReminder
            ? "Update your reminder details"
            : "Set a new on-chain reminder"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Templates */}
          {templates.length > 0 && !editingReminder && (
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-white/80 mb-2 block">
                Quick Templates
              </label>
              <div className="flex flex-wrap gap-2">
                {templates.map((template) => (
                  <Button
                    key={template.id}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onUseTemplate?.(Number(template.id))}
                    className="text-xs"
                  >
                    {template.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-white/80 mb-2 block">
              Title *
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Governance vote deadline"
              className="bg-white/60 dark:bg-white/10 border-gray-300 dark:border-white/20"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-white/80 mb-2 block">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description or notes"
              rows={3}
              className="bg-white/60 dark:bg-white/10 border-gray-300 dark:border-white/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-white/80 mb-2 block">
                Date & Time *
              </label>
              <Input
                type="datetime-local"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                className="bg-white/60 dark:bg-white/10 border-gray-300 dark:border-white/20"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-white/80 mb-2 block">
                Category
              </label>
              <Select
                value={String(category)}
                onValueChange={(value) =>
                  setCategory(parseInt(value) as ReminderCategory)
                }
              >
                <SelectTrigger className="bg-white/60 dark:bg-white/10 border-gray-300 dark:border-white/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Personal</SelectItem>
                  <SelectItem value="1">Governance</SelectItem>
                  <SelectItem value="2">DeFi</SelectItem>
                  <SelectItem value="3">NFT</SelectItem>
                  <SelectItem value="4">Token</SelectItem>
                  <SelectItem value="5">Airdrop</SelectItem>
                  <SelectItem value="6">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-white/80 mb-2 block">
                Priority
              </label>
              <Select
                value={String(priority)}
                onValueChange={(value) =>
                  setPriority(parseInt(value) as Priority)
                }
              >
                <SelectTrigger className="bg-white/60 dark:bg-white/10 border-gray-300 dark:border-white/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Low</SelectItem>
                  <SelectItem value="1">Medium</SelectItem>
                  <SelectItem value="2">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-white/80 mb-2 block">
                Recurrence
              </label>
              <Select
                value={String(recurrenceType)}
                onValueChange={(value) =>
                  setRecurrenceType(parseInt(value) as RecurrenceType)
                }
              >
                <SelectTrigger className="bg-white/60 dark:bg-white/10 border-gray-300 dark:border-white/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">None</SelectItem>
                  <SelectItem value="1">Daily</SelectItem>
                  <SelectItem value="2">Weekly</SelectItem>
                  <SelectItem value="3">Monthly</SelectItem>
                  <SelectItem value="4">Yearly</SelectItem>
                  <SelectItem value="5">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {recurrenceType === RecurrenceType.Custom && (
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-white/80 mb-2 block">
                Custom Interval (seconds)
              </label>
              <Input
                type="number"
                value={recurrenceInterval}
                onChange={(e) => setRecurrenceInterval(e.target.value)}
                placeholder="e.g., 604800 for weekly"
                className="bg-white/60 dark:bg-white/10 border-gray-300 dark:border-white/20"
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-white/80 mb-2 block">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Add a tag and press Enter"
                className="bg-white/60 dark:bg-white/10 border-gray-300 dark:border-white/20"
              />
              <Button type="button" onClick={addTag} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-4 h-4"
            />
            <label
              htmlFor="isPublic"
              className="text-sm text-gray-700 dark:text-white/80"
            >
              Make this reminder public (visible in public feed)
            </label>
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={!title || !dateTime || isLoading}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            >
              {isLoading ? (
                "Processing..."
              ) : editingReminder ? (
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
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

