"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  ChevronRight,
  BookOpen,
  PenLine,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTasks } from "@/lib/api-hooks";
import { TaskFormModal } from "@/components/admin/task-form-modal";

const typeFilters = [
  { key: "All", label: "All Types" },
  { key: "reading", label: "Reading" },
  { key: "writing", label: "Writing" },
];
const semesterFilters = [
  { key: "All", label: "All Semesters" },
  { key: "1", label: "Semester 1" },
  { key: "2", label: "Semester 2" },
];

export default function AdminTestsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [semesterFilter, setSemesterFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const limit = 50;

  const params = useMemo(() => {
    const p = { page, limit };
    if (typeFilter !== "All") p.type = typeFilter;
    if (semesterFilter !== "All") p.semester = semesterFilter;
    return p;
  }, [page, limit, typeFilter, semesterFilter]);

  const { data: tasksRes, isLoading } = useTasks(params);

  const allTasks = tasksRes?.data ?? [];
  const meta = tasksRes?.meta ?? {};

  const filtered = search
    ? allTasks.filter(
        (t) =>
          t.title?.toLowerCase().includes(search.toLowerCase()) ||
          t.topic?.toLowerCase().includes(search.toLowerCase())
      )
    : allTasks;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="section-label">Content</p>
          <h1 className="text-2xl font-bold tracking-tight">Self-study tasks</h1>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setCreateOpen(true)}>
          New Task
        </Button>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-1.5">
          {typeFilters.map((f) => (
            <button
              key={f.key}
              onClick={() => { setTypeFilter(f.key); setPage(1); }}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-semibold transition-colors",
                typeFilter === f.key
                  ? "bg-ink text-porcelain"
                  : "bg-mist text-muted hover:bg-line"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="w-px h-5 bg-line" />
        <div className="flex gap-1.5">
          {semesterFilters.map((f) => (
            <button
              key={f.key}
              onClick={() => { setSemesterFilter(f.key); setPage(1); }}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-semibold transition-colors",
                semesterFilter === f.key
                  ? "bg-ink text-porcelain"
                  : "bg-mist text-muted hover:bg-line"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-0">
        <div className="p-4 border-b border-line">
          <div className="flex items-center gap-2 bg-porcelain px-3 py-2 rounded-lg border border-line max-w-md">
            <Search className="w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search by title or topic..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm outline-none flex-1 placeholder:text-muted"
            />
          </div>
        </div>

        <div className="hidden lg:grid grid-cols-[2.5fr_1fr_1fr_1fr_50px] gap-3 px-5 py-2.5 text-[10px] uppercase tracking-widest text-faint font-semibold border-b border-line bg-porcelain">
          <div>Test</div>
          <div>Type</div>
          <div>Semester</div>
          <div>Max Score</div>
          <div></div>
        </div>

        {isLoading ? (
          <div className="py-12 flex justify-center">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-muted text-sm">
            No tests found. Click &ldquo;New Test&rdquo; to create one.
          </div>
        ) : (
          filtered.map((t) => {
            const isReading = t.type === "reading";
            return (
              <Link
                key={t._id}
                href={`/admin/tests/${t._id}`}
                className="flex lg:grid lg:grid-cols-[2.5fr_1fr_1fr_1fr_50px] gap-3 px-4 lg:px-5 py-3.5 items-center border-b border-line transition-colors hover:bg-mist/60"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1 lg:flex-none">
                  <div
                    className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                      isReading
                        ? "bg-[#EFF6FF] text-[#1D4ED8]"
                        : "bg-[#ECFDF5] text-accent"
                    )}
                  >
                    {isReading ? (
                      <BookOpen className="w-4 h-4" />
                    ) : (
                      <PenLine className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink truncate">{t.title}</p>
                    <p className="text-xs text-muted truncate mt-0.5 lg:hidden">
                      {isReading ? "Reading" : "Writing"} · Sem {t.semester} · {t.maxScore} pts
                    </p>
                    {t.topic && (
                      <p className="text-xs text-muted truncate mt-0.5 hidden lg:block">{t.topic}</p>
                    )}
                  </div>
                </div>

                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full w-fit hidden lg:inline-flex",
                    isReading
                      ? "bg-[#EFF6FF] text-[#1D4ED8]"
                      : "bg-[#ECFDF5] text-accent"
                  )}
                >
                  {isReading ? "Reading" : "Writing"}
                </span>

                <span className="text-sm text-muted hidden lg:inline">Semester {t.semester}</span>

                <span className="font-display text-lg font-medium hidden lg:inline">{t.maxScore}</span>

                <div className="flex justify-end shrink-0">
                  <ChevronRight className="w-4 h-4 text-faint" />
                </div>
              </Link>
            );
          })
        )}

        <div className="px-5 py-3 text-xs text-muted bg-porcelain flex items-center justify-between">
          <span>
            Showing {filtered.length} of {meta.total ?? filtered.length} tests
          </span>
          {meta.totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-2.5 py-1 rounded text-xs font-semibold bg-mist hover:bg-line disabled:opacity-40"
              >
                Prev
              </button>
              <span className="text-xs">{page} / {meta.totalPages}</span>
              <button
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-2.5 py-1 rounded text-xs font-semibold bg-mist hover:bg-line disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      <TaskFormModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
