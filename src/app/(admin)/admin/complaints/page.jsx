"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Clock,
  FileText,
  XCircle,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { PageLoader } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { useComplaints, useResolveComplaint } from "@/lib/api-hooks";
import { toast } from "@/stores/toast";

const statusStyles = {
  open: "bg-[#FFFBEB] text-[#B45309]",
  reviewing: "bg-[#EFF6FF] text-[#1D4ED8]",
  resolved: "bg-accent-soft text-accent",
  rejected: "bg-[#FEF2F2] text-[#B91C1C]",
};

const statusLabels = {
  open: "Open",
  reviewing: "Reviewing",
  resolved: "Resolved",
  rejected: "Rejected",
};

export default function ComplaintsPage() {
  const [activeTab, setActiveTab] = useState("open");
  const [reviewModal, setReviewModal] = useState(null);
  const [adminResponse, setAdminResponse] = useState("");
  const [decision, setDecision] = useState("unchanged");
  const [newScore, setNewScore] = useState("");

  const { data: allRes, isLoading } = useComplaints({});
  const resolveComplaint = useResolveComplaint();

  const allComplaints = allRes?.data ?? [];

  const tabCounts = useMemo(() => {
    const counts = { open: 0, reviewing: 0, resolved: 0, rejected: 0 };
    allComplaints.forEach((c) => {
      if (counts[c.status] !== undefined) counts[c.status]++;
    });
    return counts;
  }, [allComplaints]);

  const tabs = [
    { label: "Open", count: tabCounts.open, status: "open" },
    { label: "Reviewing", count: tabCounts.reviewing, status: "reviewing" },
    { label: "Resolved", count: tabCounts.resolved, status: "resolved" },
    { label: "Rejected", count: tabCounts.rejected, status: "rejected" },
  ];

  const filtered = allComplaints.filter((c) => c.status === activeTab);

  const openReview = (complaint) => {
    setReviewModal(complaint);
    setAdminResponse("");
    setDecision("unchanged");
    setNewScore("");
  };

  const handleResolve = async (complaintId, dec) => {
    const body = {
      id: complaintId,
      decision: dec,
      teacherComment: adminResponse || (dec === "unchanged" ? "Complaint reviewed - no change" : "Score adjusted"),
    };
    if (dec !== "unchanged" && newScore) {
      body.newScore = parseFloat(newScore);
    }
    try {
      await resolveComplaint.mutateAsync(body);
      toast.success("Complaint resolved");
      setReviewModal(null);
    } catch (err) {
      toast.error(err?.error?.message || err?.response?.data?.error?.message || "Failed to resolve");
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const mins = Math.floor(diffMs / 60000);
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hr ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted mb-1">Management</p>
        <h1 className="text-3xl font-bold text-ink">Complaints</h1>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.status}
            onClick={() => setActiveTab(tab.status)}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium rounded-xl transition-colors",
              activeTab === tab.status
                ? "bg-ink text-white"
                : "bg-mist text-muted hover:bg-line"
            )}
          >
            {tab.label}
            <span className={cn(
              "text-[11px] font-bold px-2 py-0.5 rounded-full",
              activeTab === tab.status
                ? "bg-white/20 text-white"
                : "bg-white text-muted"
            )}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map((c) => {
          const student = c.studentId || {};
          const studentName = student.fullName || "Unknown Student";
          const initials = studentName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
          const submission = c.submissionId || {};
          const taskName = submission.taskId?.title || submission.type || "Test";

          return (
            <div key={c._id} className="bg-white border border-line rounded-2xl p-6 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-mist flex items-center justify-center text-[12px] font-bold text-muted">
                    {initials}
                  </div>
                  <div>
                    <Link
                      href={`/admin/students/${student._id || ""}`}
                      className="text-[14px] font-semibold text-[#1D4ED8] hover:underline"
                    >
                      {studentName}
                    </Link>
                    <p className="text-[11px] text-faint mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(c.createdAt)}
                    </p>
                  </div>
                </div>
                <span className={cn("text-[11px] font-semibold uppercase tracking-wide px-3 py-1 rounded-full", statusStyles[c.status] || statusStyles.open)}>
                  {statusLabels[c.status] || c.status}
                </span>
              </div>

              <div className="flex items-center gap-2 text-[13px] text-muted mb-3">
                <FileText className="w-4 h-4" />
                <span>{taskName}</span>
                {submission.totalScore != null && (
                  <>
                    <span className="text-line">|</span>
                    <span>Score: <strong className="text-ink">{Number(submission.totalScore).toFixed(1)}</strong></span>
                  </>
                )}
              </div>

              <div className="bg-[#FAFAF7] border border-line rounded-xl p-4 mb-4">
                <p className="text-[14px] italic text-ink leading-relaxed">
                  &ldquo;{c.reason}&rdquo;
                </p>
              </div>

              {c.resolution?.teacherComment && (
                <div className="bg-[#ECFDF5] border border-[#D1FAE5] rounded-xl p-3 mb-4">
                  <p className="text-[12px] font-medium text-accent mb-1">Response</p>
                  <p className="text-[13px] text-ink">{c.resolution.teacherComment}</p>
                  {c.resolution.newScore != null && (
                    <p className="text-[12px] text-muted mt-1">
                      New score: <strong>{Number(c.resolution.newScore).toFixed(1)}</strong>
                    </p>
                  )}
                </div>
              )}

              {(c.status === "open" || c.status === "reviewing") && (
                <div className="flex items-center gap-3">
                  <Button
                    variant="danger"
                    size="sm"
                    icon={XCircle}
                    onClick={() => handleResolve(c._id, "unchanged")}
                    disabled={resolveComplaint.isPending}
                  >
                    Reject
                  </Button>
                  <Button variant="accent" size="sm" icon={CheckCircle} onClick={() => openReview(c)}>
                    Review
                  </Button>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="bg-white border border-line rounded-2xl p-12 text-center">
            <MessageSquare className="w-12 h-12 text-faint mx-auto mb-3" />
            <p className="text-[15px] font-semibold text-ink mb-1">No complaints here</p>
            <p className="text-[13px] text-muted">
              All {activeTab} complaints will appear in this section.
            </p>
          </div>
        )}
      </div>

      <Modal
        open={!!reviewModal}
        onClose={() => setReviewModal(null)}
        title="Review Complaint"
        size="lg"
      >
        {reviewModal && (
          <div className="space-y-5">
            <p className="text-[13px] text-muted">
              {reviewModal.studentId?.fullName || "Student"} &middot;{" "}
              {reviewModal.submissionId?.taskId?.title || "Test"}
            </p>

            <div>
              <label className="block text-[13px] font-medium text-ink mb-1.5">Decision</label>
              <div className="flex gap-3 flex-wrap">
                {[
                  { value: "unchanged", label: "Unchanged" },
                  { value: "increased", label: "Increase Score" },
                  { value: "decreased", label: "Decrease Score" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setDecision(opt.value)}
                    className={cn(
                      "px-4 py-2 text-[13px] font-medium rounded-xl border transition-colors",
                      decision === opt.value
                        ? "bg-ink text-white border-ink"
                        : "bg-white text-muted border-line hover:bg-mist"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {decision !== "unchanged" && (
              <div>
                <label className="block text-[13px] font-medium text-ink mb-1.5">New Score</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={newScore}
                  onChange={(e) => setNewScore(e.target.value)}
                  placeholder="Enter new score"
                  className="input-base"
                />
              </div>
            )}

            <div>
              <p className="text-[12px] font-medium text-muted mb-2 uppercase tracking-wide">
                Student&apos;s Explanation
              </p>
              <div className="bg-[#FAFAF7] border border-line rounded-xl p-4">
                <p className="text-[14px] italic text-ink leading-relaxed">
                  &ldquo;{reviewModal.reason}&rdquo;
                </p>
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-ink mb-1.5">
                Admin Response <span className="text-[#B91C1C]">*</span>
              </label>
              <textarea
                placeholder="Add a note for the student (min 5 characters)..."
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
                rows={3}
                className="input-base resize-y"
              />
              {adminResponse.length > 0 && adminResponse.length < 5 && (
                <p className="text-xs text-red-500 mt-1">At least 5 characters required</p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-line">
              <Button variant="secondary" size="sm" onClick={() => setReviewModal(null)}>
                Cancel
              </Button>
              <Button
                variant="accent"
                size="sm"
                icon={CheckCircle}
                onClick={() => handleResolve(reviewModal._id, decision)}
                disabled={resolveComplaint.isPending || adminResponse.length < 5}
                loading={resolveComplaint.isPending}
              >
                Submit Decision
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
