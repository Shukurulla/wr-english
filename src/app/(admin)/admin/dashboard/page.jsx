"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  FileText,
  AlertTriangle,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  ChevronDown,
  Download,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DonutChart, LineChart, HBar } from "@/components/ui/charts";
import { PageLoader } from "@/components/ui/spinner";
import { cn, timeAgo } from "@/lib/utils";
import { useUsers, useGroups, useComplaints, useSubmissions, useGroupSummary } from "@/lib/api-hooks";

const avatarColors = ["#047857", "#1D4ED8", "#B45309", "#7C3AED", "#0891B2", "#B91C1C"];

function GroupRankingItem({ group, semester }) {
  const sem = semester === "Semester 1" ? 1 : 2;
  const { data: summary } = useGroupSummary(group._id, sem);

  const passRate = useMemo(() => {
    if (!summary?.students?.length) return null;
    const passed = summary.students.filter((s) => s.passed).length;
    return Math.round((passed / summary.students.length) * 100);
  }, [summary]);

  const avgScore = useMemo(() => {
    if (!summary?.students?.length) return null;
    const total = summary.students.reduce((sum, s) => sum + (s.totalScore || 0), 0);
    return (total / summary.students.length).toFixed(1);
  }, [summary]);

  const pr = passRate ?? 0;

  return (
    <Link
      href={`/admin/groups/${group._id}`}
      className="flex items-center gap-4 group hover:bg-mist rounded-xl px-3 py-2.5 -mx-3 transition-colors"
    >
      <span className="text-[14px] font-semibold text-ink w-16">{group.name}</span>
      <div className="flex-1">
        <HBar value={pr} max={100} color={pr < 80 ? "#B45309" : "#047857"} height={6} />
      </div>
      <span className="text-[13px] font-semibold text-ink w-12 text-right">
        {passRate !== null ? `${passRate}%` : "—"}
      </span>
      <span className="text-[12px] text-muted w-10 text-right">{avgScore ?? "—"}</span>
      <ChevronRight className="w-4 h-4 text-faint group-hover:text-ink transition-colors" />
    </Link>
  );
}

export default function AdminDashboard() {
  const [semesterOpen, setSemesterOpen] = useState(false);
  const [semester, setSemester] = useState("Semester 1");

  const { data: studentsRes, isLoading: studentsLoading } = useUsers({ role: "student", limit: 1 });
  const { data: groupsRes, isLoading: groupsLoading } = useGroups({ limit: 100 });
  const { data: complaintsRes, isLoading: complaintsLoading } = useComplaints({ status: "open" });
  const { data: subsRes, isLoading: subsLoading } = useSubmissions({ limit: 10, page: 1 });

  const totalStudents = studentsRes?.meta?.total ?? 0;
  const groupsList = groupsRes?.data ?? [];
  const totalGroups = groupsList.length || groupsRes?.meta?.total || 0;
  const openComplaints = complaintsRes?.data?.length ?? 0;
  const recentSubmissions = subsRes?.data ?? [];

  const isLoading = studentsLoading || groupsLoading || complaintsLoading;

  if (isLoading) return <PageLoader />;

  const countBoxes = [
    {
      icon: Users,
      label: "Total Students",
      value: totalStudents.toLocaleString(),
      trend: null,
      trendUp: null,
      sub: `${totalGroups} groups`,
      hint: "List",
      href: "/admin/groups",
      bg: "bg-white",
      iconBg: "bg-mist",
    },
    {
      icon: FileText,
      label: "Total Groups",
      value: totalGroups.toString(),
      trend: null,
      trendUp: null,
      sub: semester,
      hint: "View",
      href: "/admin/groups",
      bg: "bg-white",
      iconBg: "bg-mist",
    },
    {
      icon: AlertTriangle,
      label: "Failed Students",
      value: "—",
      trend: null,
      trendUp: null,
      sub: "Score < 12",
      hint: "Who?",
      href: "/admin/failed",
      bg: "bg-[#FEF2F2]",
      iconBg: "bg-[#FECACA]",
      valueColor: "text-[#B91C1C]",
    },
    {
      icon: MessageSquare,
      label: "New Complaints",
      value: openComplaints.toString(),
      trend: null,
      trendUp: null,
      sub: "Unreviewed",
      hint: "Respond",
      href: "/admin/complaints",
      bg: "bg-[#FFFBEB]",
      iconBg: "bg-[#FDE68A]",
      valueColor: "text-[#B45309]",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted mb-1">Overview</p>
          <h1 className="text-3xl font-bold text-ink">Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Button variant="secondary" size="sm" onClick={() => setSemesterOpen(!semesterOpen)}>
              {semester}
              <ChevronDown className="w-3.5 h-3.5 ml-1" />
            </Button>
            {semesterOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-line rounded-xl shadow-lg py-1 z-20 min-w-[140px]">
                {["Semester 1", "Semester 2"].map((s) => (
                  <button
                    key={s}
                    className={cn(
                      "w-full text-left px-4 py-2 text-[13px] hover:bg-mist transition-colors",
                      s === semester && "font-semibold text-accent"
                    )}
                    onClick={() => { setSemester(s); setSemesterOpen(false); }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Count boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {countBoxes.map((box) => (
          <Link
            key={box.label}
            href={box.href}
            className={cn(
              "group relative rounded-2xl border border-line p-5 transition-all duration-200 hover:shadow-md hover:border-faint hover:-translate-y-0.5",
              box.bg
            )}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", box.iconBg)}>
                <box.icon className="w-5 h-5 text-muted" />
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted bg-mist rounded-full px-2.5 py-1 group-hover:bg-accent group-hover:text-white transition-colors">
                {box.hint}
                <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
            <p className="text-[13px] text-muted mb-1">{box.label}</p>
            <p className={cn("text-3xl font-display font-bold", box.valueColor || "text-ink")}>{box.value}</p>
            <div className="flex items-center gap-2 mt-2">
              {box.trend && (
                <span className={cn("inline-flex items-center gap-0.5 text-[12px] font-semibold", box.trendUp ? "text-accent" : "text-[#B91C1C]")}>
                  {box.trendUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {box.trend}
                </span>
              )}
              <span className="text-[12px] text-faint">{box.sub}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Stats */}
      <div className="bg-white border border-line rounded-2xl p-6">
        <h2 className="text-[15px] font-bold text-ink mb-6">Platform Stats</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <span className="text-[13px] text-muted">Total Students</span>
            <p className="text-[28px] font-bold text-ink mt-1">{totalStudents}</p>
          </div>
          <div>
            <span className="text-[13px] text-muted">Total Groups</span>
            <p className="text-[28px] font-bold text-ink mt-1">{totalGroups}</p>
          </div>
          <div>
            <span className="text-[13px] text-muted">Open Complaints</span>
            <p className="text-[28px] font-bold text-[#B45309] mt-1">{openComplaints}</p>
          </div>
        </div>
      </div>

      {/* Groups + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Groups ranking */}
        <div className="lg:col-span-3 bg-white border border-line rounded-2xl p-6">
          <h2 className="text-[15px] font-bold text-ink mb-5">Groups Ranking</h2>
          <div className="space-y-4">
            {groupsList.length === 0 && (
              <p className="text-[13px] text-muted py-4 text-center">No groups found.</p>
            )}
            {groupsList.map((g) => (
              <GroupRankingItem key={g._id} group={g} semester={semester} />
            ))}
          </div>
        </div>

        {/* Recent student activity — real submissions */}
        <div className="lg:col-span-2 bg-white border border-line rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[15px] font-bold text-ink">Recent Activity</h2>
            <span className="text-[11px] text-faint">Live</span>
          </div>
          {subsLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : recentSubmissions.length === 0 ? (
            <p className="text-[13px] text-muted py-4 text-center">No student activity yet.</p>
          ) : (
            <div className="space-y-1">
              {recentSubmissions.map((sub, i) => {
                const student = sub.studentId;
                const task = sub.taskId;
                const studentName = typeof student === "object" ? student.fullName : "Student";
                const studentId = typeof student === "object" ? student._id : student;
                const taskTitle = typeof task === "object" ? task.title : "Test";
                const taskType = typeof task === "object" ? task.type : sub.type;
                const initials = studentName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
                const avatarBg = avatarColors[(studentName.length + i) % avatarColors.length];

                const isPassed = sub.status === "auto_graded" || sub.status === "ai_graded" || sub.status === "finalized";
                const isInProgress = sub.status === "in_progress";
                const score = sub.totalScore;
                const hasScore = score != null && score > 0;

                let actionText = "started";
                if (isPassed && hasScore) actionText = "completed";
                else if (sub.status === "submitted") actionText = "submitted";
                else if (isInProgress) actionText = "is working on";

                const typeLabel = taskType === "writing" ? "Writing" : "Reading";
                const scoreColor = hasScore && score < 0.3 ? "text-[#B91C1C]" : "text-accent";

                return (
                  <div key={sub._id || i} className="flex items-start gap-3 py-2.5">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                      style={{ backgroundColor: avatarBg }}
                    >
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] leading-snug">
                        <Link href={`/admin/students/${studentId}`} className="font-semibold text-[#1D4ED8] hover:underline">
                          {studentName}
                        </Link>
                        <span className="text-muted"> — {actionText} </span>
                        <span className="text-muted">{typeLabel} · {taskTitle}</span>
                      </p>
                      <p className="text-[11px] text-faint mt-1">
                        {sub.updatedAt ? timeAgo(sub.updatedAt) : sub.createdAt ? timeAgo(sub.createdAt) : ""}
                      </p>
                    </div>
                    {hasScore && (
                      <span className={cn("font-display text-lg font-bold", scoreColor)}>
                        {score.toFixed(1)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
