"use client";

import Link from "next/link";
import { MessageSquare, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMyComplaints } from "@/lib/api-hooks";
import { Button } from "@/components/ui/button";

function ComplaintsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="skeleton h-8 w-40" />
      <div className="space-y-2.5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton h-28 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const cfg = {
    open: { label: "Under review", icon: Clock, className: "bg-[#FEF3C7] text-[#B45309]" },
    resolved: { label: "Resolved", icon: CheckCircle2, className: "bg-[#ECFDF5] text-accent" },
    rejected: { label: "Rejected", icon: XCircle, className: "bg-[#FEF2F2] text-[#B91C1C]" },
  }[status] || { label: status, icon: AlertCircle, className: "bg-mist text-muted" };

  const Icon = cfg.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full", cfg.className)}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function DecisionLabel({ decision }) {
  const map = {
    unchanged: "Score unchanged",
    increase: "Score increased",
    decrease: "Score decreased",
    increased: "Score increased",
    decreased: "Score decreased",
  };
  return <span className="font-semibold">{map[decision] || decision}</span>;
}

export default function ComplaintsPage() {
  const { data: complaints, isLoading, error } = useMyComplaints();

  if (isLoading) return <ComplaintsSkeleton />;

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-ink">Complaints</h1>
        <div className="text-center py-12 text-muted">
          Failed to load complaints.
        </div>
      </div>
    );
  }

  const list = complaints || [];

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Complaints</h1>
          <p className="text-sm text-muted mt-1">Complaints you filed about your grades</p>
        </div>
        <Link href="/results">
          <Button variant="primary" size="sm" icon={AlertCircle}>
            File new complaint
          </Button>
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="bg-white border border-line rounded-2xl py-14 text-center">
          <MessageSquare className="w-10 h-10 text-faint mx-auto mb-3" />
          <p className="text-sm font-semibold text-ink">No complaints yet</p>
          <p className="text-xs text-muted mt-1 max-w-xs mx-auto">
            If you disagree with a grade, you can file a complaint from the Results page.
          </p>
          <Link href="/results" className="inline-block mt-4">
            <Button variant="secondary" size="sm">
              Go to Results
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-2.5">
          {list.map((c) => {
            const submission = c.submissionId;
            const type = submission?.type || "reading";
            return (
              <div key={c._id} className="bg-white border border-line rounded-2xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-faint capitalize">
                      {type} task
                    </p>
                    <p className="text-sm font-semibold text-ink mt-0.5">
                      Score: {submission?.totalScore != null ? Number(submission.totalScore).toFixed(1) : "—"}
                    </p>
                  </div>
                  <StatusBadge status={c.status} />
                </div>

                <div className="bg-mist rounded-xl p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-faint mb-1">
                    Your complaint
                  </p>
                  <p className="text-sm text-ink leading-relaxed whitespace-pre-line">{c.reason}</p>
                </div>

                {c.resolution && (
                  <div className="bg-[#ECFDF5] border border-[#D1FAE5] rounded-xl p-3 space-y-1">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-accent">
                      Teacher response
                    </p>
                    <p className="text-sm text-ink">
                      Decision: <DecisionLabel decision={c.resolution.decision} />
                      {c.resolution.newScore != null && (
                        <span className="ml-1">
                          (new score: <span className="font-semibold">{Number(c.resolution.newScore).toFixed(1)}</span>)
                        </span>
                      )}
                    </p>
                    {c.resolution.teacherComment && (
                      <p className="text-sm text-muted leading-relaxed">
                        “{c.resolution.teacherComment}”
                      </p>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-faint pt-1">
                  <span>
                    Filed: {new Date(c.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                  {c.submissionId?._id && (
                    <Link href={`/results/${c.submissionId._id || c.submissionId}`} className="text-accent font-semibold hover:underline">
                      View submission
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
