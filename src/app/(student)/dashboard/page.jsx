"use client";

import { useAuthStore } from "@/stores/auth";
import { useMyGrades, useMyAssignments } from "@/lib/api-hooks";
import { Bell, BookOpen, PenLine, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function HBar({ value, max, color = "bg-accent" }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="h-2 rounded-full bg-white/20 overflow-hidden">
      <div
        className={`h-full rounded-full ${color} transition-all duration-500`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="skeleton h-8 w-48" />
        <div className="skeleton h-10 w-10 rounded-xl" />
      </div>
      <div className="skeleton h-48 rounded-[20px]" />
      <div className="skeleton h-6 w-32" />
      <div className="space-y-2.5">
        <div className="skeleton h-16 rounded-2xl" />
        <div className="skeleton h-16 rounded-2xl" />
      </div>
    </div>
  );
}

const DONE_STATUSES = new Set(["auto_graded", "ai_graded", "manual_review", "finalized"]);

export default function DashboardPage() {
  const { user } = useAuthStore();
  const firstName = user?.name?.split(" ")[0] || user?.fullName?.split(" ")[0] || "Student";

  const { data: grades, isLoading: gradesLoading } = useMyGrades();
  const { data: assignments, isLoading: assignmentsLoading } = useMyAssignments();

  const isLoading = gradesLoading || assignmentsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-ink">{firstName}</h1>
          <Link
            href="/notifications"
            className="relative p-2.5 rounded-xl bg-white border border-line hover:bg-mist transition-colors"
          >
            <Bell className="w-5 h-5 text-ink" />
          </Link>
        </div>
        <DashboardSkeleton />
      </div>
    );
  }

  const totalScore = grades?.totalScore ?? 0;
  const maxScore = grades?.maxScore ?? 20;
  const readingScore = grades?.readingScore ?? 0;
  const writingScore = grades?.writingScore ?? 0;
  const finalTestScore = grades?.finalTestScore ?? 0;
  const componentMax = maxScore / 2;

  // All tasks are always open. Show the ones the student hasn't finished yet.
  const openTasks = (assignments || [])
    .filter((a) => !a.submissionStatus || !DONE_STATUSES.has(a.submissionStatus))
    .slice(0, 5);

  const gradeItems = grades?.items || [];
  const recentGrade = gradeItems.length > 0 ? gradeItems[gradeItems.length - 1] : null;

  const recentAssignment = recentGrade
    ? (assignments || []).find(
        (a) => a._id === recentGrade.assignmentId || a.taskId?._id === recentGrade.taskId
      )
    : null;

  const recentResultName =
    recentGrade?.taskTitle ||
    recentAssignment?.taskId?.title ||
    "Completed task";
  const recentResultScore = recentGrade?.score ?? recentGrade?.finalScore ?? recentGrade?.initialScore ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">
          Hello, {firstName}
          <span className="ml-1" role="img" aria-label="wave">👋</span>
        </h1>
        <Link
          href="/notifications"
          className="relative p-2.5 rounded-xl bg-white border border-line hover:bg-mist transition-colors"
        >
          <Bell className="w-5 h-5 text-ink" />
        </Link>
      </div>

      <div className="bg-ink dark:bg-zinc-800 rounded-[20px] p-6 text-porcelain">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-faint mb-1">
          Current semester
        </p>
        <div className="flex items-end justify-between mb-5">
          <div>
            <span className="font-display text-5xl font-bold leading-none">
              {totalScore.toFixed(1)}
            </span>
            <span className="text-faint ml-1.5 text-sm">/ {maxScore.toFixed(1)}</span>
          </div>
          {grades?.passed !== undefined && (
            <span
              className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                grades.passed
                  ? "bg-emerald-900/60 text-emerald-300"
                  : "bg-red-900/60 text-red-300"
              }`}
            >
              {grades.passed ? "Passing" : "Below threshold"}
            </span>
          )}
        </div>
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="flex items-center gap-1.5 text-porcelain/80">
                <BookOpen className="w-3.5 h-3.5" /> Reading
              </span>
              <span className="font-semibold">
                {readingScore.toFixed(1)}
                <span className="text-faint font-normal"> / {componentMax.toFixed(1)}</span>
              </span>
            </div>
            <HBar value={readingScore} max={componentMax} color="bg-emerald-400" />
          </div>
          <div>
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="flex items-center gap-1.5 text-porcelain/80">
                <PenLine className="w-3.5 h-3.5" /> Writing
              </span>
              <span className="font-semibold">
                {writingScore.toFixed(1)}
                <span className="text-faint font-normal"> / {componentMax.toFixed(1)}</span>
              </span>
            </div>
            <HBar value={writingScore} max={componentMax} color="bg-sky-400" />
          </div>
          {finalTestScore > 0 && (
            <div className="pt-2 border-t border-white/10">
              <div className="flex items-center justify-between text-sm">
                <span className="text-porcelain/80">Final test</span>
                <span className="font-semibold">{finalTestScore.toFixed(1)} / 2.0</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-lg font-bold text-ink">Tests to take</h2>
          <Link href="/tasks" className="text-xs font-semibold text-accent hover:underline">
            See all
          </Link>
        </div>
        <div className="space-y-2.5">
          {openTasks.length === 0 && (
            <div className="text-center py-8 text-muted text-sm">
              No tests left. Great job!
            </div>
          )}
          {openTasks.map((a) => {
            const task = a.taskId;
            const taskType = task?.type || "reading";
            return (
              <div
                key={a._id}
                className="flex items-center gap-3 bg-white border border-line rounded-2xl p-4"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    taskType === "reading"
                      ? "bg-[#EFF6FF] text-[#1D4ED8]"
                      : "bg-[#ECFDF5] text-accent"
                  }`}
                >
                  {taskType === "reading" ? (
                    <BookOpen className="w-5 h-5" />
                  ) : (
                    <PenLine className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink truncate">
                    {task?.title || "Task"}
                  </p>
                  <p className="text-xs text-muted mt-0.5 capitalize">
                    {taskType}
                    {task?.semester ? ` · Semester ${task.semester}` : ""}
                  </p>
                </div>
                <Link href={`/tasks/${a._id}`}>
                  <Button size="sm" variant="accent">Start</Button>
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {recentGrade && (
        <section>
          <h2 className="text-lg font-bold text-ink mb-3">Recent result</h2>
          <Link
            href="/results"
            className="flex items-center gap-4 bg-white border border-line rounded-2xl p-4 hover:bg-mist transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] text-accent flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-ink">{recentResultName}</p>
              <p className="text-xs text-muted mt-0.5">Completed</p>
            </div>
            <span className="font-display text-2xl font-bold text-accent">
              {Number(recentResultScore).toFixed(1)}
            </span>
            <ChevronRight className="w-5 h-5 text-faint" />
          </Link>
        </section>
      )}
    </div>
  );
}
