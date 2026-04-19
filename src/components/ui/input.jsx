"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

const inputBase = cn(
  "w-full rounded-[10px] border border-line px-3.5 py-2.5 text-sm bg-white transition-all duration-200",
  "focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none",
  "disabled:bg-mist disabled:cursor-not-allowed",
  "placeholder:text-faint"
);

export function Input({ label, error, helper, type, className, ...props }) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-[11px] font-semibold uppercase tracking-[1.2px] text-faint">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={isPassword && showPassword ? "text" : type}
          className={cn(
            inputBase,
            error && "border-red-500 focus:ring-red-500",
            isPassword && "pr-10",
            className
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-faint hover:text-ink transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {helper && !error && <p className="text-sm text-muted">{helper}</p>}
    </div>
  );
}

export function Textarea({ label, error, showCount, maxLength, value, className, ...props }) {
  const count = value?.length || 0;
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-[11px] font-semibold uppercase tracking-[1.2px] text-faint">
          {label}
        </label>
      )}
      <textarea
        value={value}
        className={cn(
          inputBase,
          "min-h-[120px] resize-y",
          error && "border-red-500 focus:ring-red-500",
          className
        )}
        {...props}
      />
      <div className="flex justify-between">
        {error ? <p className="text-sm text-red-500">{error}</p> : <span />}
        {showCount && (
          <span
            className={cn(
              "text-xs",
              count > (maxLength || Infinity) ? "text-red-500" : "text-faint"
            )}
          >
            {count}
            {maxLength && ` / ${maxLength}`}
          </span>
        )}
      </div>
    </div>
  );
}
