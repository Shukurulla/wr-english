"use client";

import { useState } from "react";
import { BookOpen, PenLine, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMyAssignments } from "@/lib/api-hooks";
import Link from "next/link";

const DONE_STATUSES = new Set(["auto_graded", "ai_graded", "manual_review", "finalized"]);

const statusFilters = [
  { key: "all", label: "All" },
  { key: "available", label: "Available" },
  { key: "in_progress", label: "In progress" },
  { key: "completed", label: "Completed" },
];

function getTaskStatus(a) {
  const s = a.submissionStatus;
  if (!s) return "available";
  if (s === "in_progress") return "in_progress";
  if (DONE_STATUSES.has(s)) return "completed";
  return "available";
}

function TasksSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="skeleton h-8 w-48" />
      <div className="flex gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton h-10 w-24 rounded-full" />
        ))}
      </div>
      <div className="skeleton h-6 w-32 rounded" />
      <div className="space-y-2.5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton h-[72px] rounded-2xl" />
        ))}
      </div>
      <div className="skeleton h-6 w-32 rounded" />
      <div className="space-y-2.5">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="skeleton h-[72px] rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

function TaskCard({ test }) {
  const targetHref =
    test.status === "completed" && test.submissionId
      ? `/results/${test.submissionId}`
      : `/tasks/${test.id}`;

  return (
    <Link
      href={targetHref}
      className="flex items-center gap-3 bg-white border border-line rounded-2xl p-4 hover:bg-mist/50 transition-colors"
    >
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
          test.status === "completed"
            ? "bg-[#ECFDF5] text-accent"
            : test.type === "reading"
            ? "bg-[#EFF6FF] text-[#1D4ED8]"
            : "bg-[#ECFDF5] text-accent"
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
        <p className="text-xs text-muted mt-0.5 capitalize">{test.type}</p>
      </div>

      {test.status === "available" && (
        <Button size="sm" variant="accent">Start</Button>
      )}
      {test.status === "in_progress" && (
        <span className="text-xs font-semibold text-[#B45309] bg-[#FEF3C7] px-2.5 py-1 rounded-full">
          In progress
        </span>
      )}
      {test.status === "completed" && (
        <span className="text-xs font-semibold text-accent bg-[#ECFDF5] px-2.5 py-1 rounded-full">
          Done
        </span>
      )}
      <ChevronRight className="w-5 h-5 text-faint shrink-0" />
    </Link>
  );
}

function SemesterSection({ semester, tasks }) {
  if (tasks.length === 0) return null;
  return (
    <div className="space-y-2.5">
      <h2 className="text-sm font-bold text-muted uppercase tracking-widest px-1">
        {semester} semester
      </h2>
      {tasks.map((test) => (
        <TaskCard key={test.id} test={test} />
      ))}
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
        <h1 className="text-2xl font-bold text-ink">Self-study tasks</h1>
        <div className="text-center py-12 text-muted">
          Failed to load tasks. Please try again later.
        </div>
      </div>
    );
  }

  const tests = (assignments || []).map((assignment) => {
    const task = assignment.taskId;
    return {
      id: assignment._id,
      name: task?.title || "Task",
      type: task?.type || "reading",
      semester: task?.semester,
      status: getTaskStatus(assignment),
      submissionId: assignment.submissionId,
      maxScore: task?.maxScore || 0,
    };
  });

  const filtered =
    activeFilter === "all"
      ? tests
      : tests.filter((t) => t.status === activeFilter);

  const counts = {
    all: tests.length,
    available: tests.filter((t) => t.status === "available").length,
    in_progress: tests.filter((t) => t.status === "in_progress").length,
    completed: tests.filter((t) => t.status === "completed").length,
  };

  const sem1 = filtered.filter((t) => t.semester === 1);
  const sem2 = filtered.filter((t) => t.semester === 2);
  const noSemester = filtered.filter((t) => !t.semester);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-ink">Self-study tasks</h1>
        <p className="text-sm text-muted mt-1">Reading and writing tasks for both semesters</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {statusFilters.map((f) => (
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

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted">
          No tasks in this filter.
        </div>
      ) : (
        <div className="space-y-6">
          <SemesterSection semester={1} tasks={sem1} />
          <SemesterSection semester={2} tasks={sem2} />
          {noSemester.length > 0 && (
            <div className="space-y-2.5">
              {noSemester.map((test) => (
                <TaskCard key={test.id} test={test} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
