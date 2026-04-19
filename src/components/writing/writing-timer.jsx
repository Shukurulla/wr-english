"use client";
import { useState, useEffect, useRef } from "react";
import { cn, formatTimer } from "@/lib/utils";
import { toast } from "@/stores/toast";

export function WritingTimer({ startedAt, timeLimit, onExpire }) {
  const [remaining, setRemaining] = useState(() => {
    const elapsed = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
    return Math.max(0, timeLimit - elapsed);
  });
  const milestoneRef = useRef({ 300: false, 60: false, 30: false });

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
      const left = Math.max(0, timeLimit - elapsed);
      setRemaining(left);

      document.title = `${formatTimer(left)} — RW Platform`;

      if (left <= 300 && !milestoneRef.current[300]) {
        milestoneRef.current[300] = true;
        toast.info("5 daqiqa qoldi!");
      }
      if (left <= 60 && !milestoneRef.current[60]) {
        milestoneRef.current[60] = true;
        toast.error("1 minute left! Please finish.");
      }
      if (left <= 30 && !milestoneRef.current[30]) {
        milestoneRef.current[30] = true;
        toast.error("30 seconds left!");
      }

      if (left === 0) {
        clearInterval(interval);
        document.title = "RW Platform";
        onExpire?.();
      }
    }, 1000);
    return () => {
      clearInterval(interval);
      document.title = "RW Platform";
    };
  }, [startedAt, timeLimit, onExpire]);

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-mist rounded-full">
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full",
          remaining > 300
            ? "bg-accent"
            : remaining > 60
            ? "bg-amber-500"
            : "bg-red-500"
        )}
      />
      <span
        className={cn(
          "font-display text-[15px] font-medium tracking-tight tabular-nums",
          remaining <= 60 && remaining > 0 && "timer-pulse-fast",
          remaining <= 300 && remaining > 60 && "timer-pulse"
        )}
      >
        {formatTimer(remaining)}
      </span>
    </div>
  );
}
