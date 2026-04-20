"use client";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export function Modal({ open, onClose, title, children, size = "md" }) {
  const contentRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const handler = (e) => e.key === "Escape" && onCloseRef.current();
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    const timer = setTimeout(() => {
      contentRef.current?.querySelector("input, textarea, select, [tabindex]")?.focus();
    }, 100);
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
      clearTimeout(timer);
    };
  }, [open]);

  if (!open) return null;
  const widths = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-ink/60 backdrop-blur-sm modal-backdrop"
        onClick={onClose}
      />
      <div
        ref={contentRef}
        className={cn(
          "relative bg-white shadow-2xl w-full modal-content flex flex-col",
          // Full-height on mobile sheet, capped on desktop
          "max-h-[100dvh] sm:max-h-[calc(100dvh-2rem)]",
          "rounded-t-2xl sm:rounded-2xl",
          widths[size]
        )}
      >
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-line shrink-0">
          <h3 className="text-lg font-bold truncate pr-3">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg hover:bg-mist transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-5 sm:px-6 py-5 overflow-y-auto flex-1 min-h-0">
          {children}
        </div>
      </div>
    </div>
  );
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmText = "Confirm", variant = "primary", loading }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-muted mb-6 leading-relaxed">{message}</p>
      <div className="flex justify-end gap-3">
        <Button variant="secondary" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant={variant === "danger" ? "danger" : "primary"}
          size="sm"
          onClick={onConfirm}
          loading={loading}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
}
