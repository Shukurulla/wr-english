"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  Download,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Filter,
  GraduationCap,
  Users,
  Target,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sparkline } from "@/components/ui/charts";
import { PageLoader, TableSkeleton } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { useUsers, useGroups } from "@/lib/api-hooks";

export default function StudentsPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("All");
  const [page, setPage] = useState(1);
  const limit = 50;

  // Debounce search
  const debounceRef = useState(null);
  const handleSearch = useCallback((val) => {
    setSearch(val);
    if (debounceRef[0]) clearTimeout(debounceRef[0]);
    debounceRef[0] = setTimeout(() => {
      setDebouncedSearch(val);
      setPage(1);
    }, 400);
  }, [debounceRef]);

  const queryParams = useMemo(() => {
    const p = { role: "student", page, limit };
    if (debouncedSearch) p.search = debouncedSearch;
    if (selectedGroup !== "All") p.groupId = selectedGroup;
    return p;
  }, [page, limit, debouncedSearch, selectedGroup]);

  const { data: usersRes, isLoading: usersLoading } = useUsers(queryParams);
  const { data: groupsRes, isLoading: groupsLoading } = useGroups({ limit: 100 });

  const students = usersRes?.data ?? [];
  const meta = usersRes?.meta ?? {};
  const groups = groupsRes?.data ?? [];

  // Build group lookup
  const groupMap = useMemo(() => {
    const map = {};
    groups.forEach((g) => { map[g._id] = g.name; });
    return map;
  }, [groups]);

  const totalStudents = meta.total ?? students.length;

  const summaryCards = [
    { label: "Total Students", value: totalStudents.toString(), icon: GraduationCap, color: "text-ink", bg: "bg-mist" },
    { label: "Groups", value: groups.length.toString(), icon: Users, color: "text-[#1D4ED8]", bg: "bg-[#EFF6FF]" },
  ];

  const groupOptions = [{ _id: "All", name: "All" }, ...groups];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="section-label">Management</p>
          <h1 className="text-2xl font-bold tracking-tight">Students</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" icon={Download} onClick={() => {
            const header = "Name,Group,Email\n";
            const rows = students.map((s) => {
              const gName = s.studentInfo?.groupId
                ? (typeof s.studentInfo.groupId === "object" ? s.studentInfo.groupId.name : groupMap[s.studentInfo.groupId] || "")
                : "";
              return `"${s.fullName}","${gName}","${s.email}"`;
            }).join("\n");
            const blob = new Blob([header + rows], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "students.csv";
            a.click();
            URL.revokeObjectURL(url);
          }}>
            Export
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {summaryCards.map((c) => (
          <div key={c.label} className="card p-4">
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-3", c.bg)}>
              <c.icon className={cn("w-4 h-4", c.color)} />
            </div>
            <p className="text-xs text-muted font-medium mb-1">{c.label}</p>
            <p className={cn("text-2xl font-bold tracking-tight", c.color)}>{c.value}</p>
            {c.sub && <p className="text-[11px] text-muted mt-0.5">{c.sub}</p>}
          </div>
        ))}
      </div>

      {/* Filters + Search */}
      <div className="card p-0">
        <div className="p-4 border-b border-line flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1 flex items-center gap-2 bg-porcelain px-3 py-2 rounded-lg border border-line">
            <Search className="w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search students..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="bg-transparent text-sm outline-none flex-1 placeholder:text-muted"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {groupsLoading ? (
              <div className="skeleton h-8 w-48 rounded-full" />
            ) : (
              groupOptions.map((g) => (
                <button
                  key={g._id}
                  onClick={() => { setSelectedGroup(g._id); setPage(1); }}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors",
                    selectedGroup === g._id
                      ? "bg-ink text-porcelain"
                      : "bg-mist text-muted hover:bg-line"
                  )}
                >
                  {g.name}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Table header */}
        <div className="hidden lg:grid grid-cols-[2.5fr_1fr_1fr_50px] gap-3 px-5 py-2.5 text-[10px] uppercase tracking-widest text-faint font-semibold border-b border-line bg-porcelain">
          <div>Student</div>
          <div>Group</div>
          <div>Email</div>
          <div></div>
        </div>

        {/* Loading */}
        {usersLoading ? (
          <div className="py-8 flex justify-center">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Table rows */}
            {students.map((s) => {
              const groupName = s.studentInfo?.groupId
                ? (typeof s.studentInfo.groupId === "object" ? s.studentInfo.groupId.name : groupMap[s.studentInfo.groupId] || "—")
                : "—";
              const initials = (s.fullName || "??").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

              return (
                <Link
                  key={s._id}
                  href={`/admin/students/${s._id}`}
                  className="flex lg:grid lg:grid-cols-[2.5fr_1fr_1fr_50px] gap-3 px-4 lg:px-5 py-3.5 items-center border-b border-line transition-colors hover:bg-mist/60"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1 lg:flex-none">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0 bg-accent">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#1D4ED8] truncate">{s.fullName}</p>
                      <p className="text-xs text-muted truncate lg:hidden">
                        {groupName !== "—" && <span>{groupName} · </span>}
                        {s.email}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-muted hidden lg:inline truncate">{groupName}</span>
                  <span className="text-sm text-muted hidden lg:inline truncate">{s.email}</span>
                  <div className="flex justify-end shrink-0">
                    <ChevronRight className="w-4 h-4 text-faint" />
                  </div>
                </Link>
              );
            })}

            {students.length === 0 && (
              <div className="py-12 text-center text-muted text-sm">
                No students found matching your criteria.
              </div>
            )}
          </>
        )}

        {/* Footer with pagination */}
        <div className="px-5 py-3 text-xs text-muted bg-porcelain flex items-center justify-between">
          <span>Showing {students.length} of {totalStudents} students</span>
          {meta.totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1 rounded-lg bg-mist hover:bg-line disabled:opacity-40 transition-colors text-xs font-medium"
              >
                Prev
              </button>
              <span className="text-xs">Page {page} of {meta.totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page >= meta.totalPages}
                className="px-3 py-1 rounded-lg bg-mist hover:bg-line disabled:opacity-40 transition-colors text-xs font-medium"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
