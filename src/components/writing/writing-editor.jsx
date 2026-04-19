"use client";
import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, CloudOff } from "lucide-react";

export function WritingEditor({ value, onChange, minWords, maxWords, onPaste, saveStatus }) {
  const [wordCount, setWordCount] = useState(0);
  const [pasteWarning, setPasteWarning] = useState(false);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setWordCount(value?.trim() ? value.trim().split(/\s+/).length : 0);
  }, [value]);

  useEffect(() => {
    const goOffline = () => setOnline(false);
    const goOnline = () => setOnline(true);
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    setOnline(navigator.onLine);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  const handlePaste = useCallback(
    (e) => {
      const pasted = e.clipboardData?.getData("text") || "";
      if (pasted.length > 50) {
        setPasteWarning(true);
        setTimeout(() => setPasteWarning(false), 5000);
        onPaste?.({ at: new Date(), chars: pasted.length });
      }
    },
    [onPaste]
  );

  const min = minWords || 0;
  const max = maxWords || 999;

  return (
    <div className="space-y-3">
      {!online && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2 text-sm text-amber-700">
          <CloudOff className="w-4 h-4 shrink-0" />
          You&apos;re offline. Text is saved locally.
        </div>
      )}

      {pasteWarning && (
        <div className="bg-mist border border-line rounded-xl p-3 flex items-center gap-2 text-sm text-muted">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
          Text pasted — metadata will be saved.
        </div>
      )}

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onPaste={handlePaste}
        className={cn(
          "w-full min-h-[50vh] rounded-none border-0 px-0 py-0 text-base leading-[1.75] font-display",
          "focus:ring-0 focus:outline-none resize-none",
          "placeholder:text-faint"
        )}
        placeholder="Start writing here..."
        autoFocus
      />

      <div className="fixed bottom-6 left-4 right-4 md:left-auto md:right-8 md:w-[400px] bg-ink/[0.94] text-porcelain backdrop-blur-xl rounded-[18px] p-3 pl-5 flex items-center gap-3 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.3)] z-40">
        <div className="flex-1">
          <p className="font-display text-xl font-normal tracking-tight">
            {wordCount}{" "}
            <span className="text-zinc-500 text-[13px] font-sans">/ {min}–{max}</span>
          </p>
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 mt-0.5">
            <span
              className={cn(
                "w-1.5 h-1.5 rounded-full",
                saveStatus === "saved"
                  ? "bg-accent"
                  : saveStatus === "error"
                  ? "bg-red-500"
                  : "bg-zinc-500"
              )}
            />
            {saveStatus === "saved"
              ? "auto-saved"
              : saveStatus === "saving"
              ? "saving..."
              : saveStatus === "error"
              ? "not saved"
              : ""}
          </div>
        </div>
      </div>
    </div>
  );
}
