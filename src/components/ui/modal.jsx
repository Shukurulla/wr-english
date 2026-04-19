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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm modal-backdrop" onClick={onClose} />
      <div ref={contentRef} className={cn("relative bg-white rounded-2xl shadow-2xl w-full modal-content", widths[size])}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
          <h3 className="text-lg font-bold">{title}</h3>
          <button onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg hover:bg-mist transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
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
