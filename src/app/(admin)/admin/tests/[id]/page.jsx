"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import {
  ChevronRight,
  FileText,
  Target,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { BarChart, HBar } from "@/components/ui/charts";
import { PageLoader } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { useTask, useSubmissions, useGroups, useGroupSummary } from "@/lib/api-hooks";

function GroupComparisonRow({ group, taskId }) {
  // We don't have a per-task per-group endpoint, so show general group info
  const { data: summary } = useGroupSummary(group._id);

  const stats = useMemo(() => {
    if (!summary?.students) return { passed: 0, total: 0, avg: 0 };
    const total = summary.students.length;
    const passed = summary.students.filter((s) => s.passed).length;
    const totalScore = summary.students.reduce((s, st) => s + (st.totalScore || 0), 0);
    const avg = total > 0 ? totalScore / total : 0;
    return { passed, total, avg: avg.toFixed(1) };
  }, [summary]);

  const pct = stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0;

  return (
    <div className="flex items-center gap-4">
      <Link href={`/admin/groups/${group._id}`} className="text-[14px] font-semibold text-ink w-16 hover:text-[#1D4ED8] transition-colors">
        {group.name}
      </Link>
      <div className="flex-1">
        <HBar value={pct} max={100} color={pct < 80 ? "#B45309" : "#047857"} height={8} />
      </div>
      <span className="text-[13px] text-muted w-20 text-right">{stats.passed}/{stats.total} passed</span>
      <span className="text-[13px] font-semibold text-ink w-10 text-right">{stats.avg}</span>
    </div>
  );
}

export default function TestDetailPage({ params }) {
  const { id } = use(params);

  const { data: task, isLoading: taskLoading } = useTask(id);
  const { data: subsRes, isLoading: subsLoading } = useSubmissions({ taskId: id, limit: 500 });
  const { data: groupsRes } = useGroups({ limit: 100 });

  const submissions = subsRes?.data ?? [];
  const groups = groupsRes?.data ?? [];

  const isLoading = taskLoading;

  if (isLoading) return <PageLoader />;

  if (!task) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-2 text-[13px] text-muted">
          <Link href="/admin/tasks" className="hover:text-ink transition-colors">Tests</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-ink font-medium">Not Found</span>
        </div>
        <div className="bg-white border border-line rounded-2xl p-12 text-center">
          <p className="text-[15px] font-semibold text-ink mb-1">Task not found</p>
          <p className="text-[13px] text-muted">The task you are looking for does not exist.</p>
        </div>
      </div>
    );
  }

  const taskName = task.title || `${task.type || "Task"} ${task.taskNumber || ""}`;
  const totalSubmissions = submissions.length;
  const gradedSubmissions = submissions.filter((s) => s.status === "graded" || s.status === "completed");
  const scores = gradedSubmissions.map((s) => s.score ?? s.readingScore ?? 0).filter((s) => s > 0);
  const avgScore = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : "—";
  const highest = scores.length > 0 ? Math.max(...scores).toFixed(1) : "—";
  const failedCount = scores.filter((s) => s < 6).length;

  // Build histogram data
  const histogramBuckets = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const histogramLabels = ["1-2", "2-3", "3-4", "4-5", "5-6", "6-7", "7-8", "8-9", "9-10", "10"];
  scores.forEach((s) => {
    const idx = Math.min(9, Math.max(0, Math.floor(s) - 1));
    histogramBuckets[idx]++;
  });

  const countBoxes = [
    {
      label: "Submitted",
      value: totalSubmissions.toString(),
      icon: FileText,
      color: "text-ink",
      bg: "bg-mist",
    },
    {
      label: "Average Score",
      value: avgScore,
      icon: Target,
      color: "text-accent",
      bg: "bg-accent-soft",
    },
    {
      label: "Highest",
      value: highest,
      icon: TrendingUp,
      color: "text-accent",
      bg: "bg-accent-soft",
    },
    {
      label: "Failed",
      value: failedCount.toString(),
      icon: AlertTriangle,
      color: "text-[#B91C1C]",
      bg: "bg-[#FEF2F2]",
    },
  ];

  // Writing criteria from submissions (if available)
  const criteriaKeys = ["taskAchievement", "coherenceCohesion", "lexicalResource", "grammaticalRange"];
  const criteriaLabels = ["Task Achievement", "Coherence & Cohesion", "Lexical Resource", "Grammatical Range"];
  const criteriaAvg = criteriaKeys.map((key, i) => {
    const vals = gradedSubmissions
      .map((s) => s.writingEvaluation?.[key] || s.criteria?.[key])
      .filter((v) => v != null && v > 0);
    const avg = vals.length > 0 ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : null;
    return { label: criteriaLabels[i], value: avg };
  });
  const hasCriteria = criteriaAvg.some((c) => c.value !== null);

  return (
    <div className="space-y-8">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-[13px] text-muted">
        <Link href="/admin/tasks" className="hover:text-ink transition-colors">Tests</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-ink font-medium">{taskName}</span>
      </div>

      {/* Header */}
      <h1 className="text-3xl font-bold text-ink">{taskName}</h1>

      {/* Count boxes */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {countBoxes.map((box) => (
          <div key={box.label} className="bg-white border border-line rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", box.bg)}>
                <box.icon className={cn("w-4.5 h-4.5", box.color)} />
              </div>
              <span className="text-[13px] text-muted">{box.label}</span>
            </div>
            <p className={cn("text-2xl font-display font-bold", box.color)}>{box.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Histogram */}
        <div className="bg-white border border-line rounded-2xl p-6">
          <h2 className="text-[15px] font-bold text-ink mb-5">Score Distribution</h2>
          {scores.length > 0 ? (
            <BarChart
              data={histogramBuckets}
              width={500}
              height={200}
              color="#047857"
              xLabels={histogramLabels}
            />
          ) : (
            <p className="text-[13px] text-muted py-8 text-center">No scored submissions yet.</p>
          )}
        </div>

        {/* Criteria breakdown */}
        <div className="bg-white border border-line rounded-2xl p-6">
          <h2 className="text-[15px] font-bold text-ink mb-5">Criteria Breakdown</h2>
          {hasCriteria ? (
            <div className="space-y-5 pt-2">
              {criteriaAvg.filter((c) => c.value !== null).map((c) => (
                <div key={c.label}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[13px] text-muted">{c.label}</span>
                    <span className="text-[14px] font-display font-bold text-ink">{c.value}</span>
                  </div>
                  <HBar value={parseFloat(c.value)} max={10} color={parseFloat(c.value) < 7 ? "#B45309" : "#047857"} height={8} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-muted py-8 text-center">Criteria data not available for this task type.</p>
          )}
        </div>
      </div>

      {/* Groups comparison */}
      <div className="bg-white border border-line rounded-2xl p-6">
        <h2 className="text-[15px] font-bold text-ink mb-5">Groups Overview</h2>
        {groups.length === 0 ? (
          <p className="text-[13px] text-muted py-4 text-center">No groups found.</p>
        ) : (
          <div className="space-y-4">
            {groups.map((g) => (
              <GroupComparisonRow key={g._id} group={g} taskId={id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
