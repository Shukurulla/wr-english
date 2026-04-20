"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Users,
  TrendingUp,
  Target,
  AlertTriangle,
  Edit3,
  Download,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/spinner";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import { useGroupStudents, useGroupSummary, useGroups, useUpdateGroup } from "@/lib/api-hooks";
import { AddStudentsModal } from "@/components/admin/add-students-modal";
import { toast } from "@/stores/toast";

const ordinal = (n) => n === 1 ? "1st" : n === 2 ? "2nd" : n === 3 ? "3rd" : `${n}th`;

function EditGroupModal({ open, onClose, group }) {
  const [name, setName] = useState(group?.name || "");
  const [course, setCourse] = useState(group?.course?.toString() || "1");
  const [semester, setSemester] = useState(group?.semester?.toString() || "1");
  const updateGroup = useUpdateGroup();

  const handleSave = async () => {
    try {
      await updateGroup.mutateAsync({
        id: group._id,
        name,
        course: parseInt(course),
        semester: parseInt(semester),
      });
      toast.success("Group updated");
      onClose();
    } catch (e) {
      toast.error(e?.error?.message || e?.response?.data?.error?.message || "Failed to update group");
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit Group" size="md">
      <div className="space-y-4">
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-[1.2px] text-faint mb-1.5">
            Group Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-base"
            placeholder="e.g. T-201"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[1.2px] text-faint mb-1.5">
              Course
            </label>
            <select value={course} onChange={(e) => setCourse(e.target.value)} className="select-base">
              {[1, 2, 3, 4, 5, 6].map((c) => (
                <option key={c} value={c}>{ordinal(c)} year</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[1.2px] text-faint mb-1.5">
              Semester
            </label>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="select-base"
            >
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
            </select>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-5 border-t border-line mt-5">
        <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
        <Button variant="primary" size="sm" onClick={handleSave} loading={updateGroup.isPending}>
          Save Changes
        </Button>
      </div>
    </Modal>
  );
}

function exportCSV(studentsList, groupName) {
  const header = "Name,Reading,Writing,Total,Status\n";
  const rows = studentsList.map((s) =>
    `"${s.name}",${s.reading.toFixed(1)},${s.writing.toFixed(1)},${s.total.toFixed(1)},${s.passed ? "Passed" : "Failed"}`
  ).join("\n");
  const blob = new Blob([header + rows], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${groupName || "group"}-students.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function GroupDetailPage({ params }) {
  const { id } = use(params);
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const { data: groupsRes } = useGroups({ limit: 100 });
  const { data: students, isLoading: studentsLoading } = useGroupStudents(id);
  const { data: summary, isLoading: summaryLoading } = useGroupSummary(id);

  const group = useMemo(() => {
    const groups = groupsRes?.data ?? [];
    return groups.find((g) => g._id === id);
  }, [groupsRes, id]);

  const groupName = group?.name || id;
  const yearLabel = group?.course ? `${ordinal(group.course)} year` : "";

  const summaryStudents = summary?.students ?? [];

  const stats = useMemo(() => {
    if (!summaryStudents.length) return { count: 0, avg: "0.0", passRate: 0, atRisk: 0 };
    const count = summaryStudents.length;
    const totalScore = summaryStudents.reduce((s, st) => s + (st.totalScore || 0), 0);
    const avg = totalScore / count;
    const passed = summaryStudents.filter((s) => s.passed).length;
    const passRate = Math.round((passed / count) * 100);
    const atRisk = count - passed;
    return { count, avg: avg.toFixed(1), passRate, atRisk };
  }, [summaryStudents]);

  const isLoading = studentsLoading || summaryLoading;

  if (isLoading) return <PageLoader />;

  const scoreLookup = {};
  summaryStudents.forEach((s) => { scoreLookup[s.studentId] = s; });

  const studentsList = (students ?? []).map((s) => {
    const scores = scoreLookup[s._id] || {};
    return {
      _id: s._id,
      name: scores.fullName || s.fullName,
      reading: scores.readingScore ?? 0,
      writing: scores.writingScore ?? 0,
      total: scores.totalScore ?? 0,
      passed: scores.passed ?? true,
      completionRate: scores.completionRate ?? 0,
      avatar: (s.fullName || "??").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase(),
    };
  });

  const countBoxes = [
    { label: "Students", value: stats.count, icon: Users, color: "text-ink", bg: "bg-mist" },
    { label: "Average Score", value: stats.avg, icon: Target, color: "text-accent", bg: "bg-accent-soft" },
    { label: "Pass Rate", value: `${stats.passRate}%`, icon: TrendingUp, color: "text-accent", bg: "bg-accent-soft" },
    { label: "At Risk", value: stats.atRisk, icon: AlertTriangle, color: "text-[#B91C1C]", bg: "bg-[#FEF2F2]" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 text-[13px] text-muted">
        <Link href="/admin/groups" className="hover:text-ink transition-colors">Groups</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-ink font-medium">{groupName}</span>
      </div>

      <div className="flex items-end justify-between flex-wrap gap-3">
        <h1 className="text-3xl font-bold text-ink">
          {groupName}{" "}
          {yearLabel && <span className="text-muted font-normal text-lg">&middot; {yearLabel}</span>}
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="primary" size="sm" icon={UserPlus} onClick={() => setAddOpen(true)}>
            Add Students
          </Button>
          <Button variant="secondary" size="sm" icon={Download} onClick={() => exportCSV(studentsList, groupName)}>
            Export
          </Button>
          <Button variant="secondary" size="sm" icon={Edit3} onClick={() => setEditOpen(true)}>
            Edit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {countBoxes.map((box) => (
          <div key={box.label} className="bg-white border border-line rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", box.bg)}>
                <box.icon className={cn("w-4 h-4", box.color)} />
              </div>
              <span className="text-[13px] text-muted">{box.label}</span>
            </div>
            <p className={cn("text-2xl font-display font-bold", box.color)}>{box.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-line rounded-2xl p-6">
          <h2 className="text-[15px] font-bold text-ink mb-5">Score Summary</h2>
          <div className="space-y-4">
            {[
              { l: "Total Tasks", v: summary?.totalTasks ?? "—" },
              { l: "Students", v: stats.count },
              { l: "Pass Rate", v: `${stats.passRate}%`, c: "text-accent" },
              { l: "Average Score", v: stats.avg },
            ].map((r) => (
              <div key={r.l} className="flex items-center justify-between py-2 border-b border-line last:border-0">
                <span className="text-[13px] text-muted">{r.l}</span>
                <span className={cn("text-[15px] font-bold", r.c || "text-ink")}>{r.v}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white border border-line rounded-2xl p-6">
          <h2 className="text-[15px] font-bold text-ink mb-5">Completion Rates</h2>
          {studentsList.length === 0 ? (
            <p className="text-[13px] text-muted py-4 text-center">No students in this group.</p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {studentsList.map((s) => (
                <div key={s._id} className="flex items-center gap-3">
                  <span className="text-[13px] text-muted w-32 truncate">{s.name}</span>
                  <div className="flex-1 h-2 bg-mist rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full" style={{ width: `${Math.min(100, (s.completionRate || 0) * 100)}%` }} />
                  </div>
                  <span className="text-[12px] font-medium text-ink w-10 text-right">{Math.round((s.completionRate || 0) * 100)}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-line rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-line flex items-center justify-between">
          <h2 className="text-[15px] font-bold text-ink">Students</h2>
          <Button variant="ghost" size="sm" icon={UserPlus} onClick={() => setAddOpen(true)}>
            Add
          </Button>
        </div>
        {studentsList.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <Users className="w-10 h-10 text-faint mx-auto" />
            <p className="text-muted text-sm">No students in this group yet.</p>
            <Button variant="primary" size="sm" icon={UserPlus} onClick={() => setAddOpen(true)}>
              Add the first student
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted px-4 md:px-6 py-3">Student</th>
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted px-3 md:px-4 py-3">Reading</th>
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted px-3 md:px-4 py-3">Writing</th>
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted px-3 md:px-4 py-3">Total</th>
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted px-3 md:px-4 py-3">Status</th>
                  <th className="px-4 md:px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {studentsList.map((s) => (
                  <tr key={s._id} className={cn("border-b border-line last:border-0 hover:bg-mist/50 transition-colors", !s.passed && "bg-[#FEF2F2] hover:bg-[#FEE2E2]")}>
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0", !s.passed ? "bg-[#FECACA] text-[#B91C1C]" : "bg-mist text-muted")}>
                          {s.avatar}
                        </div>
                        <Link href={`/admin/students/${s._id}`} className="text-[13px] font-semibold text-[#1D4ED8] hover:underline whitespace-nowrap">{s.name}</Link>
                      </div>
                    </td>
                    <td className="px-3 md:px-4 py-4 text-[13px] font-medium text-ink whitespace-nowrap">{s.reading.toFixed(1)}</td>
                    <td className="px-3 md:px-4 py-4 text-[13px] font-medium text-ink whitespace-nowrap">{s.writing.toFixed(1)}</td>
                    <td className="px-3 md:px-4 py-4 whitespace-nowrap">
                      <span className={cn("text-[14px] font-display font-bold", !s.passed ? "text-[#B91C1C]" : "text-ink")}>{s.total.toFixed(1)}</span>
                    </td>
                    <td className="px-3 md:px-4 py-4 whitespace-nowrap">
                      <span className={cn("text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full", s.passed ? "bg-accent-soft text-accent" : "bg-[#FEF2F2] text-[#B91C1C]")}>
                        {s.passed ? "Passed" : "Failed"}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-right">
                      <Link href={`/admin/students/${s._id}`}><ChevronRight className="w-4 h-4 text-faint hover:text-ink transition-colors inline-block" /></Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {group && (
        <EditGroupModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          group={group}
        />
      )}

      <AddStudentsModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        groupId={id}
        groupName={groupName}
        existingStudentIds={(students ?? []).map((s) => s._id)}
      />
    </div>
  );
}
