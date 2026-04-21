"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, PenLine, ClipboardList, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMyGrades } from "@/lib/api-hooks";

function GradesSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="skeleton h-8 w-32" />
      <div className="skeleton h-32 rounded-2xl" />
      <div className="grid grid-cols-2 gap-3">
        <div className="skeleton h-24 rounded-2xl" />
        <div className="skeleton h-24 rounded-2xl" />
      </div>
      <div className="space-y-2.5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="skeleton h-16 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export default function GradesPage() {
  const [semester, setSemester] = useState("all");
  const queryParam = semester === "all" ? undefined : semester;
  const { data: grades, isLoading, error } = useMyGrades(queryParam);

  if (isLoading) return <GradesSkeleton />;

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-ink">Grades</h1>
        <div className="text-center py-12 text-muted">
          Failed to load grades. Please try again later.
        </div>
      </div>
    );
  }

  const totalScore = grades?.totalScore ?? 0;
  const maxScore = grades?.maxScore ?? 20;
  const readingScore = grades?.readingScore ?? 0;
  const writingScore = grades?.writingScore ?? 0;
  const finalTestScore = grades?.finalTestScore ?? 0;
  const readingMax = grades?.readingMax ?? maxScore / 2;
  const writingMax = grades?.writingMax ?? maxScore / 2;
  const finalTestMax = grades?.finalTestMax ?? 2;
  const items = grades?.items ?? [];
  const passed = grades?.passed ?? false;

  const semesterTabs = [
    { key: "all", label: "All" },
    { key: "1", label: "Semester 1" },
    { key: "2", label: "Semester 2" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Grades</h1>
        <p className="text-sm text-muted mt-1">Your scores across all tasks</p>
      </div>

      <div className="flex gap-2">
        {semesterTabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setSemester(t.key)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-semibold transition-colors",
              semester === t.key
                ? "bg-ink text-porcelain"
                : "bg-white border border-line text-muted hover:bg-mist"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-ink rounded-2xl p-6 text-porcelain">
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-faint mb-1">
              Total score
            </p>
            <p className="font-display text-5xl font-bold leading-none">
              {totalScore.toFixed(1)}
              <span className="text-faint text-sm font-normal ml-2">/ {maxScore.toFixed(1)}</span>
            </p>
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full",
              passed
                ? "bg-emerald-900/60 text-emerald-300"
                : "bg-red-900/60 text-red-300"
            )}
          >
            {passed ? "Passing" : "Below threshold (need 12)"}
          </span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-500", passed ? "bg-emerald-400" : "bg-amber-400")}
            style={{ width: `${Math.min(100, (totalScore / maxScore) * 100)}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <BreakdownCard
          icon={BookOpen}
          label="Reading"
          score={readingScore}
          max={readingMax}
          color="bg-[#EFF6FF] text-[#1D4ED8]"
        />
        <BreakdownCard
          icon={PenLine}
          label="Writing"
          score={writingScore}
          max={writingMax}
          color="bg-[#ECFDF5] text-accent"
        />
        <BreakdownCard
          icon={ClipboardList}
          label="Final test"
          score={finalTestScore}
          max={finalTestMax}
          color="bg-[#FEF3C7] text-[#B45309]"
        />
      </div>

      <section>
        <h2 className="text-lg font-bold text-ink mb-3">
          Per-task scores
          <span className="text-sm text-muted font-normal ml-2">({items.length})</span>
        </h2>

        {items.length === 0 ? (
          <div className="bg-white border border-line rounded-2xl py-12 text-center text-muted">
            <Award className="w-8 h-8 text-faint mx-auto mb-2" />
            <p className="text-sm">No grades yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => {
              const score = item.score ?? 0;
              const max = item.maxScore ?? 0;
              const pct = max > 0 ? (score / max) * 100 : 0;
              const didPass = max > 0 && score >= max * 0.5;
              const type = item.type || "reading";

              return (
                <div
                  key={item.assignmentId}
                  className="bg-white border border-line rounded-2xl p-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                        type === "reading"
                          ? "bg-[#EFF6FF] text-[#1D4ED8]"
                          : "bg-[#ECFDF5] text-accent"
                      )}
                    >
                      {type === "reading" ? (
                        <BookOpen className="w-4 h-4" />
                      ) : (
                        <PenLine className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink truncate">
                        {item.taskTitle || "Task"}
                      </p>
                      <p className="text-xs text-muted mt-0.5 capitalize">
                        Semester {item.semester} &middot; {type}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={cn(
                          "font-display text-lg font-bold",
                          didPass ? "text-accent" : "text-[#B91C1C]"
                        )}
                      >
                        {score.toFixed(1)}
                      </span>
                      <span className="text-xs text-faint ml-1">/ {max.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-mist rounded-full overflow-hidden mt-3">
                    <div
                      className={cn("h-full rounded-full", didPass ? "bg-accent" : "bg-[#B91C1C]")}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <div className="bg-white border border-line rounded-2xl p-4 text-center">
        <p className="text-sm text-muted">
          Disagree with a grade?{" "}
          <Link href="/results" className="text-accent font-semibold hover:underline">
            File a complaint
          </Link>
        </p>
      </div>
    </div>
  );
}

function BreakdownCard({ icon: Icon, label, score, max, color }) {
  const pct = max > 0 ? Math.min(100, (score / max) * 100) : 0;
  return (
    <div className="bg-white border border-line rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", color)}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-xs font-semibold text-muted uppercase tracking-wide">{label}</span>
      </div>
      <p className="font-display text-2xl font-bold text-ink">
        {Number(score).toFixed(1)}
        <span className="text-faint text-sm font-normal ml-1">/ {Number(max).toFixed(1)}</span>
      </p>
      <div className="h-1.5 bg-mist rounded-full overflow-hidden mt-2">
        <div className="h-full bg-accent rounded-full" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
