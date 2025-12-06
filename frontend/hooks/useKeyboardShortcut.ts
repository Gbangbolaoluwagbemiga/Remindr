import { useEffect } from "react";

export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  ctrlKey = false,
  shiftKey = false
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === key &&
        event.ctrlKey === ctrlKey &&
        event.shiftKey === shiftKey
      ) {
        event.preventDefault();
        callback();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [key, callback, ctrlKey, shiftKey]);
}

