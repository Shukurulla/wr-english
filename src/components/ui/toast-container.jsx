"use client";
import { useToastStore } from "@/stores/toast";
import { X, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const icons = { success: CheckCircle2, error: AlertTriangle, info: Info };
const colors = {
  success: "border-l-accent bg-white",
  error: "border-l-red-500 bg-white",
  info: "border-l-ink bg-white",
};
const iconColors = {
  success: "text-accent",
  error: "text-red-500",
  info: "text-ink",
};

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-3 w-80">
      {toasts.map((t) => {
        const Icon = icons[t.type] || Info;
        return (
          <div
            key={t.id}
            className={cn(
              "flex items-start gap-3 p-4 rounded-xl border border-line border-l-4 shadow-xl toast-enter",
              colors[t.type]
            )}
          >
            <Icon className={cn("w-5 h-5 shrink-0 mt-0.5", iconColors[t.type])} />
            <p className="text-sm flex-1 font-medium">{t.message}</p>
            <button
              onClick={() => removeToast(t.id)}
              className="shrink-0 p-0.5 rounded hover:bg-mist"
              aria-label="Yopish"
            >
              <X className="w-4 h-4 text-faint" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
