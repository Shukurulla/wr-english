"use client";

import { useState } from "react";
import {
  BookOpen,
  PenLine,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMyGrades, useMyAssignments } from "@/lib/api-hooks";
import { ComplaintModal } from "@/components/ui/complaint-modal";

function ScoreChart({ data }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data, 5);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const w = 280;
  const h = 80;
  const padding = 8;

  const points = data.map((val, i) => {
    const x = padding + (i / (data.length - 1)) * (w - padding * 2);
    const y = h - padding - ((val - min) / range) * (h - padding * 2);
    return { x, y, val };
  });

  const pathD = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(" ");

  const areaD = `${pathD} L ${points[points.length - 1].x} ${h} L ${points[0].x} ${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-20">
      <defs>
        <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#047857" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#047857" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#scoreGrad)" />
      <path d={pathD} fill="none" stroke="#047857" strokeWidth="2" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="#047857" />
      ))}
    </svg>
  );
}

function ResultsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="skeleton h-8 w-32" />
        <div className="skeleton h-4 w-48 mt-2" />
      </div>
      <div className="skeleton h-32 rounded-2xl" />
      <div className="space-y-2.5">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="skeleton h-28 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export default function ResultsPage() {
  const [complaintResult, setComplaintResult] = useState(null);
  const { data: grades, isLoading: gradesLoading, error: gradesError } = useMyGrades();
  const { data: assignments, isLoading: assignmentsLoading } = useMyAssignments();

  const isLoading = gradesLoading || assignmentsLoading;

  if (isLoading) return <ResultsSkeleton />;

  if (gradesError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-ink">Results</h1>
          <p className="text-sm text-muted mt-1">All your test results</p>
        </div>
        <div className="text-center py-12 text-muted">
          Failed to load results. Please try again later.
        </div>
      </div>
    );
  }

  const gradeItems = grades?.items || [];

  const assignmentMap = {};
  (assignments || []).forEach((a) => {
    if (a._id) assignmentMap[a._id] = a;
    if (a.taskId?._id) assignmentMap[a.taskId._id] = a;
  });

  const results = gradeItems.map((grade) => {
    const assignment = assignmentMap[grade.assignmentId] || assignmentMap[grade.taskId];
    const task = assignment?.taskId;
    const score = grade.score ?? grade.finalScore ?? grade.initialScore ?? 0;
    const maxScore = grade.maxScore ?? task?.maxScore ?? 0;
    const passed = maxScore > 0 ? score >= maxScore * 0.5 : false;

    return {
      id: grade._id || grade.submissionId || grade.assignmentId,
      submissionId: grade.submissionId,
      name: grade.taskTitle || task?.title || "Task",
      type: grade.type || task?.type || "reading",
      score,
      maxScore,
      passed,
      isFinalized: grade.isFinalized,
    };
  });

  const scoreHistory = results
    .slice()
    .reverse()
    .map((r) => r.score)
    .filter((s) => s != null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Results</h1>
        <p className="text-sm text-muted mt-1">All your test results</p>
      </div>

      {scoreHistory.length >= 2 && (
        <div className="bg-white border border-line rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-faint">
              Score trend
            </p>
            <span className="font-display text-lg font-bold text-accent">
              {grades?.totalScore != null ? grades.totalScore.toFixed(1) : "0.0"}
            </span>
          </div>
          <ScoreChart data={scoreHistory} />
        </div>
      )}

      {grades && (
        <div className="bg-white border border-line rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-faint font-semibold uppercase tracking-wide">Total score</p>
            <p className="text-2xl font-display font-bold text-ink mt-1">
              {(grades.totalScore ?? 0).toFixed(1)}
              <span className="text-faint text-sm font-normal"> / {(grades.maxScore ?? 20).toFixed(1)}</span>
            </p>
          </div>
          <span
            className={cn(
              "text-xs font-semibold px-3 py-1.5 rounded-full",
              grades.passed
                ? "bg-[#ECFDF5] text-accent"
                : "bg-[#FEF2F2] text-[#B91C1C]"
            )}
          >
            {grades.passed ? "Passing" : "Below threshold"}
          </span>
        </div>
      )}

      <div className="space-y-2.5">
        {results.length === 0 && (
          <div className="text-center py-12 text-muted">
            No results yet. Complete some tests to see your scores here.
          </div>
        )}

        {results.map((result) => (
          <div
            key={result.id}
            className="bg-white border border-line rounded-2xl p-4"
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                  result.passed
                    ? "bg-[#ECFDF5] text-accent"
                    : "bg-[#FEF2F2] text-[#B91C1C]"
                )}
              >
                {result.type === "reading" ? (
                  <BookOpen className="w-5 h-5" />
                ) : (
                  <PenLine className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink truncate">
                  {result.name}
                </p>
                <p className="text-xs text-muted mt-0.5 capitalize">
                  {result.type}
                  {result.isFinalized === false && (
                    <span className="ml-1.5 text-[#B45309]">&middot; Pending review</span>
                  )}
                </p>
              </div>
              <span
                className={cn(
                  "font-display text-xl font-bold",
                  result.passed ? "text-accent" : "text-[#B91C1C]"
                )}
              >
                {Number(result.score).toFixed(1)}
              </span>
            </div>

            {result.submissionId && (
              <div className="flex gap-2 mt-3 pt-3 border-t border-line">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 text-ink hover:bg-mist"
                  onClick={() => window.location.href = `/results/${result.submissionId}`}
                >
                  View Details
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 text-[#B91C1C] hover:bg-[#FEF2F2]"
                  icon={AlertCircle}
                  onClick={() => setComplaintResult(result)}
                >
                  Complaint
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      <ComplaintModal
        open={!!complaintResult}
        onClose={() => setComplaintResult(null)}
        result={complaintResult}
      />
    </div>
  );
}
