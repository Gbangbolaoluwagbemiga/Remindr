"use client";

import { useState, useRef } from "react";
import { Reminder } from "@/lib/contract";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Download, Upload, FileJson, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface ExportImportProps {
  reminders: Reminder[];
}

export function ExportImport({ reminders }: ExportImportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportToJSON = () => {
    const exportData = reminders
      .filter((r) => r.exists)
      .map((r) => ({
        id: r.id.toString(),
        title: r.title,
        description: r.description,
        timestamp: r.timestamp.toString(),
        isCompleted: r.isCompleted,
        category: r.category,
        priority: r.priority,
        tags: r.tags,
        recurrenceType: r.recurrenceType,
        createdAt: r.createdAt.toString(),
      }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `remindr-export-${format(new Date(), "yyyy-MM-dd")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Reminders exported to JSON! 📥");
  };

  const exportToCSV = () => {
    const headers = [
      "Title",
      "Description",
      "Date",
      "Status",
      "Category",
      "Priority",
      "Tags",
    ];
    const rows = reminders
      .filter((r) => r.exists)
      .map((r) => [
        r.title,
        r.description,
        new Date(Number(r.timestamp) * 1000).toISOString(),
        r.isCompleted ? "Completed" : "Pending",
        r.category.toString(),
        r.priority.toString(),
        r.tags.join("; "),
      ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `remindr-export-${format(new Date(), "yyyy-MM-dd")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Reminders exported to CSV! 📥");
  };

  const exportToiCal = () => {
    const icalEvents = reminders
      .filter((r) => r.exists && !r.isCompleted)
      .map((r) => {
        const startDate = new Date(Number(r.timestamp) * 1000);
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour default

        const formatDate = (date: Date) => {
          return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
        };

        return `BEGIN:VEVENT
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${r.title.replace(/,/g, "\\,")}
DESCRIPTION:${r.description.replace(/,/g, "\\,")}
STATUS:CONFIRMED
END:VEVENT`;
      })
      .join("\n");

    const icalContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Remindr//On-chain Reminders//EN
CALSCALE:GREGORIAN
${icalEvents}
END:VCALENDAR`;

    const blob = new Blob([icalContent], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `remindr-calendar-${format(new Date(), "yyyy-MM-dd")}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Calendar exported! Add to Google Calendar, Apple Calendar, etc. 📅");
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        if (Array.isArray(data)) {
          toast.success(`Imported ${data.length} reminders! (Note: You'll need to recreate them on-chain)`);
          console.log("Imported data:", data);
          // In a real implementation, you'd create reminders from this data
        } else {
          toast.error("Invalid file format");
        }
      } catch (error) {
        toast.error("Failed to parse file");
        console.error(error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export/Import
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg">
        <DialogHeader>
          <DialogTitle>Export & Import Reminders</DialogTitle>
          <DialogDescription>
            Export your reminders to various formats or import from a backup.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </h3>
            <div className="grid grid-cols-1 gap-2">
              <Button
                variant="outline"
                onClick={exportToJSON}
                className="justify-start"
              >
                <FileJson className="w-4 h-4 mr-2" />
                Export as JSON
              </Button>
              <Button
                variant="outline"
                onClick={exportToCSV}
                className="justify-start"
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Export as CSV
              </Button>
              <Button
                variant="outline"
                onClick={exportToiCal}
                className="justify-start"
              >
                <Download className="w-4 h-4 mr-2" />
                Export as iCal (.ics)
              </Button>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Import
            </h3>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full justify-start"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import from JSON
            </Button>
            <p className="text-xs text-gray-500 dark:text-white/40 mt-2">
              Note: Imported reminders need to be recreated on-chain
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
