"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
// Using native select for now
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import {
  RecurrenceType,
  Category,
  ReminderPriority,
  getRecurrenceLabel,
  getCategoryLabel,
  getPriorityLabel,
} from "@/lib/contract";

interface ReminderFormProps {
  title: string;
  description: string;
  dateTime: string;
  recurrenceType: RecurrenceType;
  recurrenceInterval: string;
  category: Category;
  priority: ReminderPriority;
  tags: string[];
  isPublic: boolean;
  templateId: bigint | null;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onDateTimeChange: (value: string) => void;
  onRecurrenceTypeChange: (value: RecurrenceType) => void;
  onRecurrenceIntervalChange: (value: string) => void;
  onCategoryChange: (value: Category) => void;
  onPriorityChange: (value: ReminderPriority) => void;
  onTagsChange: (tags: string[]) => void;
  onIsPublicChange: (value: boolean) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  isSubmitting: boolean;
  submitLabel?: string;
}

export function ReminderForm({
  title,
  description,
  dateTime,
  recurrenceType,
  recurrenceInterval,
  category,
  priority,
  tags,
  isPublic,
  templateId,
  onTitleChange,
  onDescriptionChange,
  onDateTimeChange,
  onRecurrenceTypeChange,
  onRecurrenceIntervalChange,
  onCategoryChange,
  onPriorityChange,
  onTagsChange,
  onIsPublicChange,
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel = "Create",
}: ReminderFormProps) {
  const [tagInput, setTagInput] = useState("");

  const addTag = () => {
    if (tagInput.trim() && tags.length < 10) {
      onTagsChange([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (index: number) => {
    onTagsChange(tags.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-white/80 mb-2 block">
          Title *
        </label>
        <Input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="e.g., Governance vote deadline"
          className="bg-white/60 dark:bg-white/10 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-white/40"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-white/80 mb-2 block">
          Description
        </label>
        <Textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Optional description or notes"
          rows={3}
          className="bg-white/60 dark:bg-white/10 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-white/40"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-white/80 mb-2 block">
          Date & Time *
        </label>
        <Input
          type="datetime-local"
          value={dateTime}
          onChange={(e) => onDateTimeChange(e.target.value)}
          className="bg-white/60 dark:bg-white/10 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-white/80 mb-2 block">
            Category
          </label>
          <select
            value={category.toString()}
            onChange={(e) => onCategoryChange(Number(e.target.value) as Category)}
            className="w-full px-3 py-2 bg-white/60 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-md text-gray-900 dark:text-white"
          >
            {Object.values(Category)
              .filter((v) => typeof v === "number")
              .map((cat) => (
                <option key={cat} value={cat.toString()}>
                  {getCategoryLabel(cat as Category)}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-white/80 mb-2 block">
            Priority
          </label>
          <select
            value={priority.toString()}
            onChange={(e) =>
              onPriorityChange(Number(e.target.value) as ReminderPriority)
            }
            className="w-full px-3 py-2 bg-white/60 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-md text-gray-900 dark:text-white"
          >
            {Object.values(ReminderPriority)
              .filter((v) => typeof v === "number")
              .map((pri) => (
                <option key={pri} value={pri.toString()}>
                  {getPriorityLabel(pri as ReminderPriority)}
                </option>
              ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-white/80 mb-2 block">
          Recurrence
        </label>
        <Select
          value={recurrenceType.toString()}
          onValueChange={(value) =>
            onRecurrenceTypeChange(Number(value) as RecurrenceType)
          }
        >
          <SelectTrigger className="bg-white/60 dark:bg-white/10 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.values(RecurrenceType)
              .filter((v) => typeof v === "number")
              .map((rec) => (
                <SelectItem key={rec} value={rec.toString()}>
                  {getRecurrenceLabel(rec as RecurrenceType)}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        {recurrenceType === RecurrenceType.Custom && (
          <Input
            type="number"
            value={recurrenceInterval}
            onChange={(e) => onRecurrenceIntervalChange(e.target.value)}
            placeholder="Interval in seconds"
            className="mt-2 bg-white/60 dark:bg-white/10 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white"
          />
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-white/80 mb-2 block">
          Tags ({tags.length}/10)
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
            placeholder="Add a tag"
            className="bg-white/60 dark:bg-white/10 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white"
          />
          <Button
            type="button"
            onClick={addTag}
            size="sm"
            disabled={!tagInput.trim() || tags.length >= 10}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {tag}
              <button
                onClick={() => removeTag(index)}
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
          onChange={(e) => onIsPublicChange(e.target.checked)}
          className="w-4 h-4"
        />
        <label
          htmlFor="isPublic"
          className="text-sm text-gray-700 dark:text-white/80"
        >
          Make this reminder public
        </label>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={onSubmit}
          disabled={!title || !dateTime || isSubmitting}
          className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
        >
          {isSubmitting ? "Processing..." : submitLabel}
        </Button>
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}
