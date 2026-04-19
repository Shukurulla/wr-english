"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Search,
  Download,
  Mail,
  Eye,
  AlertTriangle,
  TrendingDown,
  BookOpen,
  Users,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { useGroups, useGroupSummary } from "@/lib/api-hooks";

function FailedStudentsFromGroup({ group, onCollect }) {
  const { data: summary } = useGroupSummary(group._id);

  const failed = useMemo(() => {
    if (!summary?.students) return [];
    return summary.students
      .filter((s) => !s.passed)
      .map((s) => ({
        ...s,
        groupName: group.name,
        groupId: group._id,
      }));
  }, [summary, group]);

  // Report failed students up to parent
  useMemo(() => {
    onCollect(group._id, failed);
  }, [failed, group._id, onCollect]);

  return null;
}

export default function FailedStudentsPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [failedMap, setFailedMap] = useState({});

  const { data: groupsRes, isLoading: groupsLoading } = useGroups({ limit: 100 });
  const groups = groupsRes?.data ?? [];

  const handleCollect = useMemo(() => {
    return (groupId, students) => {
      setFailedMap((prev) => {
        if (JSON.stringify(prev[groupId]) === JSON.stringify(students)) return prev;
        return { ...prev, [groupId]: students };
      });
    };
  }, []);

  const allFailed = useMemo(() => {
    return Object.values(failedMap).flat();
  }, [failedMap]);

  const filteredStudents = useMemo(() => {
    let list = allFailed;
    if (search) {
      const s = search.toLowerCase();
      list = list.filter((st) =>
        (st.fullName || "").toLowerCase().includes(s) ||
        (st.groupName || "").toLowerCase().includes(s)
      );
    }
    if (activeFilter === "Score < 4.0") {
      list = list.filter((st) => (st.totalScore || 0) < 4);
    } else if (activeFilter === "Score 4.0-8.0") {
      list = list.filter((st) => (st.totalScore || 0) >= 4 && (st.totalScore || 0) < 8);
    } else if (activeFilter === "Score 8.0-12.0") {
      list = list.filter((st) => (st.totalScore || 0) >= 8 && (st.totalScore || 0) < 12);
    }
    return list;
  }, [allFailed, search, activeFilter]);

  const avgScore = useMemo(() => {
    if (!allFailed.length) return "0.0";
    const total = allFailed.reduce((s, st) => s + (st.totalScore || 0), 0);
    return (total / allFailed.length).toFixed(1);
  }, [allFailed]);

  const filters = ["All", "Score < 4.0", "Score 4.0-8.0", "Score 8.0-12.0"];

  const summaryCards = [
    { label: "Failed Students", value: allFailed.length.toString(), icon: AlertTriangle, color: "text-[#B91C1C]", bg: "bg-[#FEF2F2]" },
    { label: "Average Score", value: avgScore, icon: TrendingDown, color: "text-[#B91C1C]", bg: "bg-[#FEF2F2]" },
    { label: "Groups Affected", value: Object.keys(failedMap).filter((k) => failedMap[k].length > 0).length.toString(), icon: Users, color: "text-[#B45309]", bg: "bg-[#FFFBEB]" },
  ];

  if (groupsLoading) return <PageLoader />;

  return (
    <div className="space-y-8">
      {/* Hidden data collectors */}
      {groups.map((g) => (
        <FailedStudentsFromGroup key={g._id} group={g} onCollect={handleCollect} />
      ))}

      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-[13px] text-muted">
        <Link href="/admin/dashboard" className="hover:text-ink transition-colors">Dashboard</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-ink font-medium">Failed Students</span>
      </div>

      {/* Header */}
      <div className="flex items-end justify-between">
        <h1 className="text-3xl font-bold text-ink">Failed Students ({allFailed.length})</h1>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" icon={Download}>Excel</Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {summaryCards.map((card) => (
          <div key={card.label} className={cn("rounded-2xl border border-line p-5", card.bg)}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-white/60 flex items-center justify-center">
                <card.icon className={cn("w-4.5 h-4.5", card.color)} />
              </div>
              <span className="text-[13px] text-muted">{card.label}</span>
            </div>
            <p className={cn("text-2xl font-display font-bold", card.color)}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-faint" />
          <input
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 text-[13px] border border-line rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={cn(
                "px-3.5 py-2 text-[12px] font-medium rounded-lg transition-colors",
                activeFilter === f
                  ? "bg-ink text-white"
                  : "bg-mist text-muted hover:bg-line"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-line rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-line">
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted px-6 py-3.5">Student</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted px-4 py-3.5">Group</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted px-4 py-3.5">Reading</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted px-4 py-3.5">Writing</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted px-4 py-3.5">Total</th>
              <th className="text-right text-[11px] font-semibold uppercase tracking-wider text-muted px-6 py-3.5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-muted text-sm">
                  {allFailed.length === 0 ? "Loading failed students data..." : "No failed students matching your criteria."}
                </td>
              </tr>
            ) : (
              filteredStudents.map((s, i) => {
                const initials = (s.fullName || "??").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
                return (
                  <tr key={`${s.studentId}-${i}`} className="border-b border-line last:border-0 hover:bg-mist/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-mist flex items-center justify-center text-[11px] font-bold text-muted">
                          {initials}
                        </div>
                        <Link href={`/admin/students/${s.studentId}`} className="text-[13px] font-semibold text-[#1D4ED8] hover:underline">
                          {s.fullName || "Unknown"}
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-[13px] text-muted bg-mist rounded-lg px-2.5 py-1">{s.groupName}</span>
                    </td>
                    <td className="px-4 py-4 text-[13px] font-medium text-ink">{(s.readingScore ?? 0).toFixed(1)}</td>
                    <td className="px-4 py-4 text-[13px] font-medium text-ink">{(s.writingScore ?? 0).toFixed(1)}</td>
                    <td className="px-4 py-4">
                      <span className="text-[15px] font-display font-bold text-[#B91C1C]">{(s.totalScore ?? 0).toFixed(1)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/students/${s.studentId}`} className="p-2 rounded-lg hover:bg-mist transition-colors" title="View profile">
                          <Eye className="w-4 h-4 text-muted" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
