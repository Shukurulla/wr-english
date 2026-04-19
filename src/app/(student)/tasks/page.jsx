"use client";

import { useState } from "react";
import { BookOpen, PenLine, ChevronRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMyAssignments } from "@/lib/api-hooks";
import Link from "next/link";

const filters = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Completed" },
  { key: "missed", label: "Missed" },
];

function getAssignmentStatus(assignment) {
  const now = new Date();
  const opensAt = new Date(assignment.opensAt);
  const dueAt = new Date(assignment.dueAt);
  const closesAt = assignment.closesAt ? new Date(assignment.closesAt) : dueAt;

  if (assignment.submissionStatus && assignment.submissionStatus !== "in_progress") {
    return "completed";
  }
  if (assignment.status === "completed" || assignment.status === "graded") {
    return "completed";
  }

  if (opensAt > now) return "upcoming";
  if (opensAt <= now && closesAt >= now) return "active";
  if (closesAt < now) return "missed";
  return "upcoming";
}

function formatDueDate(dateStr) {
  const d = new Date(dateStr);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

function StatusPill({ status }) {
  if (status === "completed") {
    return (
      <span className="text-xs font-semibold text-accent bg-[#ECFDF5] px-2.5 py-1 rounded-full">
        Done
      </span>
    );
  }
  if (status === "missed") {
    return (
      <span className="text-xs font-semibold text-[#B91C1C] bg-[#FEF2F2] px-2.5 py-1 rounded-full">
        Missed
      </span>
    );
  }
  return null;
}

function TasksSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="skeleton h-8 w-32" />
      <div className="flex gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton h-10 w-24 rounded-full" />
        ))}
      </div>
      <div className="space-y-2.5">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="skeleton h-[72px] rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export default function TasksPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const { data: assignments, isLoading, error } = useMyAssignments();

  if (isLoading) return <TasksSkeleton />;

  if (error) {
    return (
      <div className="space-y-5">
        <h1 className="text-2xl font-bold text-ink">Tests</h1>
        <div className="text-center py-12 text-muted">
          Failed to load tests. Please try again later.
        </div>
      </div>
    );
  }

  const tests = (assignments || []).map((assignment) => {
    const task = assignment.taskId;
    const status = getAssignmentStatus(assignment);
    return {
      id: assignment._id,
      name: task?.title || "Task",
      type: task?.type || "reading",
      status,
      dueDate: formatDueDate(assignment.dueAt),
      score: null,
      maxScore: task?.maxScore || 0,
      passed: null,
      assignment,
    };
  });

  const filtered =
    activeFilter === "all"
      ? tests
      : tests.filter((t) => t.status === activeFilter);

  const counts = {
    all: tests.length,
    active: tests.filter((t) => t.status === "active").length,
    upcoming: tests.filter((t) => t.status === "upcoming").length,
    completed: tests.filter((t) => t.status === "completed").length,
    missed: tests.filter((t) => t.status === "missed").length,
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-ink">Tests</h1>
        <p className="text-sm text-muted mt-1">All reading and writing tests</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors",
              activeFilter === f.key
                ? "bg-ink text-porcelain"
                : "bg-white border border-line text-muted hover:bg-mist"
            )}
          >
            {f.label}
            <span
              className={cn(
                "text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center",
                activeFilter === f.key
                  ? "bg-white/20 text-porcelain"
                  : "bg-mist text-muted"
              )}
            >
              {counts[f.key]}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-2.5">
        {filtered.map((test) => (
          <Link
            key={test.id}
            href={
              test.status === "completed"
                ? `/results`
                : `/tasks/${test.id}`
            }
            className="flex items-center gap-3 bg-white border border-line rounded-2xl p-4 hover:bg-mist/50 transition-colors"
          >
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                test.status === "active"
                  ? test.type === "reading"
                    ? "bg-[#EFF6FF] text-[#1D4ED8]"
                    : "bg-[#ECFDF5] text-accent"
                  : test.status === "completed"
                  ? "bg-[#ECFDF5] text-accent"
                  : test.status === "missed"
                  ? "bg-[#FEF2F2] text-[#B91C1C]"
                  : "bg-mist text-muted"
              )}
            >
              {test.type === "reading" ? (
                <BookOpen className="w-5 h-5" />
              ) : (
                <PenLine className="w-5 h-5" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-ink truncate">{test.name}</p>
              <p className="text-xs text-muted mt-0.5 flex items-center gap-1.5 capitalize">
                {test.type}
                <span className="text-line">|</span>
                <Clock className="w-3 h-3" />
                {test.dueDate}
              </p>
            </div>

            {test.status === "active" && (
              <Button size="sm" variant="accent">
                Start
              </Button>
            )}
            <StatusPill status={test.status} />
            {test.status === "upcoming" && (
              <ChevronRight className="w-5 h-5 text-faint shrink-0" />
            )}
          </Link>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted">
            No tests found for this filter.
          </div>
        )}
      </div>
    </div>
  );
}
