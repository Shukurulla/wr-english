"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Mail,
  FileText,
  Calendar,
  Clock,
  Send,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { HBar } from "@/components/ui/charts";
import { PageLoader } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { useUsers, useSubmissions, useGroups, useGroupSummary } from "@/lib/api-hooks";
import api from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";

function useUser(id) {
  return useQuery({
    queryKey: ["users", "single", id],
    queryFn: () => api.get(`/users/${id}`).then((r) => r?.data || null),
    enabled: !!id,
  });
}

export default function StudentProfilePage({ params }) {
  const { id } = use(params);

  const { data: student, isLoading: studentLoading } = useUser(id);
  const { data: groupsRes } = useGroups({ limit: 100 });
  const { data: subsRes, isLoading: subsLoading } = useSubmissions({ studentId: id, limit: 50 });

  const groups = groupsRes?.data ?? [];
  const submissions = subsRes?.data ?? [];

  // Find student's group
  const groupId = student?.studentInfo?.groupId;
  const resolvedGroupId = typeof groupId === "object" ? groupId?._id : groupId;
  const group = groups.find((g) => g._id === resolvedGroupId);
  const groupName = group?.name || groupId?.name || "—";

  // Get summary for student's group to find their scores
  const { data: summary } = useGroupSummary(resolvedGroupId);
  const studentSummary = useMemo(() => {
    if (!summary?.students) return null;
    return summary.students.find((s) => s.studentId === id);
  }, [summary, id]);

  const isLoading = studentLoading;

  if (isLoading) return <PageLoader />;

  if (!student) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-2 text-[13px] text-muted">
          <Link href="/admin/students" className="hover:text-ink transition-colors">Students</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-ink font-medium">Not Found</span>
        </div>
        <div className="bg-white border border-line rounded-2xl p-12 text-center">
          <p className="text-[15px] font-semibold text-ink mb-1">Student not found</p>
          <p className="text-[13px] text-muted">The student you are looking for does not exist.</p>
        </div>
      </div>
    );
  }

  const initials = (student.fullName || "??").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const overallScore = studentSummary?.totalScore ?? 0;
  const readingScore = studentSummary?.readingScore ?? 0;
  const writingScore = studentSummary?.writingScore ?? 0;
  const finalTestScore = studentSummary?.finalTestScore ?? 0;
  const passed = studentSummary?.passed ?? true;
  const completionRate = studentSummary?.completionRate ?? 0;

  const infoItems = [
    { icon: Calendar, label: "Email", value: student.email || "—" },
    { icon: Clock, label: "Group", value: groupName },
    { icon: Send, label: "Submissions", value: submissions.length },
    { icon: AlertCircle, label: "Status", value: passed ? "Passed" : "At Risk" },
  ];

  const skillBreakdown = [
    { label: "Reading", value: readingScore, max: 10, color: "#047857" },
    { label: "Writing", value: writingScore, max: 10, color: "#10B981" },
    { label: "Final Test", value: finalTestScore, max: 2, color: "#1D4ED8" },
  ];

  return (
    <div className="space-y-8">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-[13px] text-muted">
        <Link href="/admin/students" className="hover:text-ink transition-colors">Students</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-ink font-medium">{student.fullName}</span>
      </div>

      {/* Header */}
      <div className="flex items-end justify-between">
        <h1 className="text-3xl font-bold text-ink">{student.fullName}</h1>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" icon={Mail}>Send Message</Button>
          <Button variant="secondary" size="sm" icon={FileText}>Report</Button>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex gap-8 flex-col lg:flex-row">
        {/* Left column */}
        <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
          {/* Profile card */}
          <div className="bg-white border border-line rounded-2xl p-6">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-mist flex items-center justify-center text-2xl font-bold text-muted mb-4">
                {initials}
              </div>
              <h2 className="text-lg font-bold text-ink">{student.fullName}</h2>
              <p className="text-[13px] text-muted mt-1">{student.email}</p>
              <span className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 bg-accent-soft text-accent text-[12px] font-semibold rounded-full">
                {groupName}
              </span>
            </div>
            <div className="space-y-4 pt-4 border-t border-line">
              {infoItems.map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <item.icon className="w-4 h-4 text-faint" />
                    <span className="text-[13px] text-muted">{item.label}</span>
                  </div>
                  <span className="text-[13px] font-medium text-ink">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="flex-1 space-y-6">
          {/* Score card */}
          <div className="bg-white border border-line rounded-2xl p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-[13px] text-muted mb-1">Total Score</p>
                <div className="flex items-baseline gap-3">
                  <span className={cn("text-5xl font-display font-bold", passed ? "text-accent" : "text-[#B91C1C]")}>
                    {overallScore.toFixed(1)}
                  </span>
                  <span className="text-[14px] text-muted">/ 20</span>
                </div>
                <p className="text-[12px] mt-1 text-muted">
                  Completion: {Math.round(completionRate * 100)}%
                </p>
              </div>
              <span className={cn(
                "text-[11px] font-semibold uppercase px-3 py-1 rounded-full",
                passed ? "bg-accent-soft text-accent" : "bg-[#FEF2F2] text-[#B91C1C]"
              )}>
                {passed ? "Passed" : "Failed"}
              </span>
            </div>
            <div className="space-y-3">
              {skillBreakdown.map((skill) => (
                <div key={skill.label} className="flex items-center gap-4">
                  <span className="text-[13px] text-muted w-24">{skill.label}</span>
                  <div className="flex-1">
                    <HBar value={skill.value} max={skill.max} color={skill.color} height={8} />
                  </div>
                  <span className="text-[13px] font-semibold text-ink w-16 text-right">
                    {skill.value.toFixed(1)} / {skill.max}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Submissions history */}
          <div className="bg-white border border-line rounded-2xl p-6">
            <h2 className="text-[15px] font-bold text-ink mb-5">Submission History</h2>
            {subsLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              </div>
            ) : submissions.length === 0 ? (
              <p className="text-[13px] text-muted py-4 text-center">No submissions found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {submissions.map((sub) => {
                  const taskTitle = sub.assignmentId?.taskId?.title || sub.taskId?.title || "Test";
                  const taskType = sub.assignmentId?.taskId?.type || sub.taskId?.type || "";
                  const score = sub.score ?? sub.readingScore ?? null;
                  const isGraded = sub.status === "graded" || sub.status === "completed";
                  const isPassed = score !== null && score >= 6;

                  return (
                    <div
                      key={sub._id}
                      className="flex items-stretch gap-0 rounded-xl border border-line overflow-hidden hover:shadow-sm transition-shadow"
                    >
                      <div className={cn("w-1.5 flex-shrink-0", isPassed ? "bg-accent" : score !== null ? "bg-[#B91C1C]" : "bg-mist")} />
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-[13px] font-semibold text-ink">{taskTitle}</p>
                            <p className="text-[11px] text-faint mt-0.5">
                              {taskType} &middot; {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : ""}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {score !== null && (
                              <span className={cn(
                                "text-[15px] font-display font-bold",
                                isPassed ? "text-accent" : "text-[#B91C1C]"
                              )}>
                                {score.toFixed(1)}
                              </span>
                            )}
                            {isGraded ? (
                              isPassed ? (
                                <CheckCircle className="w-4 h-4 text-accent" />
                              ) : (
                                <XCircle className="w-4 h-4 text-[#B91C1C]" />
                              )
                            ) : (
                              <Clock className="w-4 h-4 text-muted" />
                            )}
                          </div>
                        </div>
                        <span className={cn(
                          "inline-block mt-2 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full",
                          sub.status === "graded" || sub.status === "completed"
                            ? "text-accent bg-accent-soft"
                            : sub.status === "pending"
                            ? "text-[#B45309] bg-[#FFFBEB]"
                            : "text-muted bg-mist"
                        )}>
                          {sub.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
