"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function SearchBar({ onSearch, placeholder = "Search reminders..." }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useKeyboardShortcut("k", () => {
    inputRef.current?.focus();
  }, true);

  const debouncedSearch = useCallback(
    (value: string) => {
      const timer = setTimeout(() => {
        onSearch(value);
      }, 300);
      return () => clearTimeout(timer);
    },
    [onSearch]
  );

  useEffect(() => {
    const cleanup = debouncedSearch(query);
    return cleanup;
  }, [query, debouncedSearch]);

  const handleClear = () => {
    setQuery("");
    onSearch("");
  };

  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/60" />
      <Input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={`${placeholder} (Ctrl+K)`}
        className="pl-10 pr-10 bg-white/80 dark:bg-white/10 backdrop-blur-lg border-gray-200/50 dark:border-white/20 focus:ring-2 focus:ring-purple-500/50"
      />
      {query && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-white/10"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}

