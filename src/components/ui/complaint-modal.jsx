"use client";

import { useState } from "react";
import { BookOpen, PenLine, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCreateComplaint } from "@/lib/api-hooks";
import { toast } from "@/stores/toast";

export function ComplaintModal({ open, onClose, result }) {
  const [reason, setReason] = useState("");
  const createComplaint = useCreateComplaint();

  if (!open || !result) return null;

  const charCount = reason.length;
  const canSubmit = reason.length >= 20 && reason.length <= 1000 && !createComplaint.isPending;

  const handleSubmit = () => {
    if (!canSubmit) return;

    createComplaint.mutate(
      { submissionId: result.submissionId, reason },
      {
        onSuccess: () => {
          toast.success("Complaint submitted successfully");
          onClose();
          setReason("");
        },
        onError: (err) => {
          const msg =
            err?.response?.data?.error?.message ||
            err?.error?.message ||
            "Failed to submit complaint";
          toast.error(msg);
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-line sticky top-0 bg-white rounded-t-3xl sm:rounded-t-2xl z-10">
          <h3 className="text-lg font-bold text-ink">File a complaint</h3>
          <button onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg hover:bg-mist transition-colors">
            <X className="w-5 h-5 text-ink" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="flex items-center gap-3 bg-mist rounded-xl p-3">
            <div className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
              result.type === "reading" ? "bg-[#EFF6FF] text-[#1D4ED8]" : "bg-[#ECFDF5] text-accent"
            )}>
              {result.type === "reading" ? <BookOpen className="w-4 h-4" /> : <PenLine className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-ink truncate">{result.name}</p>
              <p className="text-xs text-muted capitalize">
                {result.type} &middot; Score: {result.score != null ? Number(result.score).toFixed(1) : "N/A"}
              </p>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-ink mb-1.5 block">
              Reason <span className="text-[#B91C1C]">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => {
                if (e.target.value.length <= 1000) setReason(e.target.value);
              }}
              placeholder="Describe your complaint in detail (minimum 20 characters)..."
              rows={4}
              className="w-full bg-white border border-line rounded-xl px-4 py-3 text-sm text-ink placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent resize-none"
            />
            <div className="flex justify-between mt-1.5">
              <p className={cn("text-[11px]", charCount < 20 ? "text-[#B91C1C]" : "text-accent")}>
                {charCount < 20
                  ? `${20 - charCount} more characters needed`
                  : "Ready"}
              </p>
              <p className="text-[11px] text-faint">{charCount}/1000</p>
            </div>
          </div>

          <div className="flex gap-2.5 bg-[#EFF6FF] border border-[#1D4ED8]/20 rounded-xl p-3.5">
            <Info className="w-4 h-4 text-[#1D4ED8] shrink-0 mt-0.5" />
            <p className="text-xs text-[#1D4ED8] leading-relaxed">
              Your teacher will review your complaint. The response will appear in the Complaints page.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" size="lg" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="lg"
              className="flex-1"
              disabled={!canSubmit}
              loading={createComplaint.isPending}
              onClick={handleSubmit}
            >
              Submit
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
