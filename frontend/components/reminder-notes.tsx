"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, X, Clock } from "lucide-react";
import { format } from "date-fns";
import { ReminderNote, ReminderNotesProps } from "@/lib/types";
import { STORAGE_KEYS } from "@/lib/constants";

export function ReminderNotes({ reminder, onNoteAdd }: ReminderNotesProps) {
  const [notes, setNotes] = useState<ReminderNote[]>([]);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNote, setNewNote] = useState("");

  // Load notes from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.REMINDER_NOTES(reminder.id.toString()));
    if (stored) {
      try {
        setNotes(JSON.parse(stored));
      } catch {
        setNotes([]);
      }
    }
  }, [reminder.id]);

  // Save notes to localStorage
  useEffect(() => {
    if (notes.length > 0) {
      localStorage.setItem(
        STORAGE_KEYS.REMINDER_NOTES(reminder.id.toString()),
        JSON.stringify(notes)
      );
    }
  }, [notes, reminder.id]);

  const handleAddNote = () => {
    if (!newNote.trim()) return;

    const note: ReminderNote = {
      id: Date.now().toString(),
      reminderId: reminder.id.toString(),
      content: newNote,
      createdAt: Date.now(),
      type: "note",
    };

    setNotes([note, ...notes]);
    setNewNote("");
    setIsAddingNote(false);
    onNoteAdd?.(reminder.id.toString(), newNote);
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes(notes.filter((n) => n.id !== noteId));
  };

  const getNoteTypeLabel = (type: string) => {
    switch (type) {
      case "completion":
        return "Completion";
      case "edit":
        return "Edit";
      default:
        return "Note";
    }
  };

  const getNoteTypeColor = (type: string) => {
    switch (type) {
      case "completion":
        return "bg-green-500/20 text-green-400";
      case "edit":
        return "bg-blue-500/20 text-blue-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <Card className="bg-white/90 dark:bg-white/10 backdrop-blur-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <FileText className="w-4 h-4" />
            Notes & History
          </CardTitle>
          {!isAddingNote && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsAddingNote(true)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Note
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isAddingNote && (
          <div className="space-y-2 p-3 bg-white/60 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10">
            <Textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a note about this reminder..."
              rows={3}
              className="bg-white/60 dark:bg-white/10 border-gray-300 dark:border-white/20"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddNote}>
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsAddingNote(false);
                  setNewNote("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {notes.length === 0 && !isAddingNote && (
          <div className="text-center py-6">
            <FileText className="w-12 h-12 text-gray-400 dark:text-white/40 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-white/40">
              No notes yet. Add a note to track your progress or thoughts.
            </p>
          </div>
        )}

        <div className="space-y-2">
          {notes.map((note) => (
            <div
              key={note.id}
              className="p-3 bg-white/60 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={`text-xs ${getNoteTypeColor(note.type)}`}
                  >
                    {getNoteTypeLabel(note.type)}
                  </Badge>
                  <span className="text-xs text-gray-500 dark:text-white/40 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {format(new Date(note.createdAt), "MMM dd, yyyy 'at' HH:mm")}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteNote(note.id)}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
              <p className="text-sm text-gray-700 dark:text-white/70 whitespace-pre-wrap">
                {note.content}
              </p>
            </div>
          ))}
        </div>

        {/* Auto-add completion note when reminder is completed */}
        {reminder.isCompleted && notes.length === 0 && (
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-sm text-green-400">
              This reminder was completed. Add a note to record what you accomplished!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
