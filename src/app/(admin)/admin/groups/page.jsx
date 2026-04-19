"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Users,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { PageLoader } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { useGroups, useCreateGroup, useUsers } from "@/lib/api-hooks";
import { toast } from "@/stores/toast";

export default function GroupsPage() {
  const [showModal, setShowModal] = useState(false);
  const [courseFilter, setCourseFilter] = useState("All Courses");
  const [courseOpen, setCourseOpen] = useState(false);
  const [form, setForm] = useState({ name: "", course: "", semester: "", academicYear: "", teacherId: "" });

  const { data: groupsRes, isLoading: groupsLoading } = useGroups({ limit: 100 });
  const { data: teachersRes } = useUsers({ role: "teacher", limit: 100 });
  const createGroup = useCreateGroup();

  const groups = groupsRes?.data ?? [];
  const teachers = teachersRes?.data ?? [];

  const courseOptions = ["All Courses", "1st Year", "2nd Year", "3rd Year", "4th Year"];
  const courseMap = { "1st Year": 1, "2nd Year": 2, "3rd Year": 3, "4th Year": 4 };

  const filteredGroups = courseFilter === "All Courses"
    ? groups
    : groups.filter((g) => g.course === courseMap[courseFilter]);

  const handleCreate = async () => {
    if (!form.name || !form.course || !form.semester || !form.teacherId) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      await createGroup.mutateAsync({
        name: form.name,
        course: parseInt(form.course),
        semester: parseInt(form.semester),
        academicYear: form.academicYear || new Date().getFullYear() + "-" + (new Date().getFullYear() + 1),
        teacherId: form.teacherId,
      });
      toast.success("Group created");
      setShowModal(false);
      setForm({ name: "", course: "", semester: "", academicYear: "", teacherId: "" });
    } catch (err) {
      toast.error(err?.error?.message || err?.response?.data?.error?.message || "Failed to create group");
    }
  };

  if (groupsLoading) return <PageLoader />;

  const ordinal = (n) => n === 1 ? "1st" : n === 2 ? "2nd" : n === 3 ? "3rd" : `${n}th`;

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted mb-1">Management</p>
          <h1 className="text-3xl font-bold text-ink">Groups</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Button variant="secondary" size="sm" onClick={() => setCourseOpen(!courseOpen)}>
              {courseFilter}
              <ChevronDown className="w-3.5 h-3.5 ml-1" />
            </Button>
            {courseOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-line rounded-xl shadow-lg py-1 z-20 min-w-[140px]">
                {courseOptions.map((c) => (
                  <button
                    key={c}
                    className={cn(
                      "w-full text-left px-4 py-2 text-[13px] hover:bg-mist transition-colors",
                      c === courseFilter && "font-semibold text-accent"
                    )}
                    onClick={() => { setCourseFilter(c); setCourseOpen(false); }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button variant="accent" size="sm" icon={Plus} onClick={() => setShowModal(true)}>
            New Group
          </Button>
        </div>
      </div>

      {filteredGroups.length === 0 ? (
        <div className="bg-white border border-line rounded-2xl p-12 text-center">
          <Users className="w-12 h-12 text-faint mx-auto mb-3" />
          <p className="text-[15px] font-semibold text-ink mb-1">No groups found</p>
          <p className="text-[13px] text-muted">Create a new group to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredGroups.map((g) => {
            const yearLabel = g.course ? `${ordinal(g.course)} year` : "—";
            const teacherName = g.teacherId?.fullName || "No teacher assigned";

            return (
              <div
                key={g._id}
                className="bg-white border border-line rounded-2xl p-6 hover:shadow-md hover:border-faint hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-accent-soft">
                      <Users className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-xl font-display font-bold text-ink">{g.name}</h3>
                      <p className="text-[12px] text-muted">
                        {yearLabel} &middot; Sem {g.semester}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <span className="text-[13px] text-muted">Teacher: {teacherName}</span>
                </div>

                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-[11px] text-muted uppercase tracking-wide">Year</p>
                      <p className="text-[14px] font-semibold text-ink">{g.academicYear || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-muted uppercase tracking-wide">Status</p>
                      <p className={cn("text-[14px] font-semibold", g.isActive ? "text-accent" : "text-[#B91C1C]")}>
                        {g.isActive ? "Active" : "Inactive"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-muted uppercase tracking-wide">Students</p>
                      <p className="text-[14px] font-semibold text-ink">{g.studentCount ?? 0}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/admin/groups/${g._id}`} className="flex-1">
                    <Button variant="accent" size="sm" className="w-full">Details</Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create New Group" size="md">
        <div className="space-y-5">
          <div>
            <label className="block text-[13px] font-medium text-ink mb-1.5">
              Group Name <span className="text-[#B91C1C]">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. EN-207"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-base"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-ink mb-1.5">
                Course <span className="text-[#B91C1C]">*</span>
              </label>
              <select
                value={form.course}
                onChange={(e) => setForm({ ...form, course: e.target.value })}
                className="select-base"
              >
                <option value="">Select course</option>
                {[1, 2, 3, 4, 5, 6].map((c) => (
                  <option key={c} value={c}>{ordinal(c)} year</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-medium text-ink mb-1.5">
                Semester <span className="text-[#B91C1C]">*</span>
              </label>
              <select
                value={form.semester}
                onChange={(e) => setForm({ ...form, semester: e.target.value })}
                className="select-base"
              >
                <option value="">Select semester</option>
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-ink mb-1.5">
              Teacher <span className="text-[#B91C1C]">*</span>
            </label>
            <select
              value={form.teacherId}
              onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
              className="select-base"
            >
              <option value="">Select teacher</option>
              {teachers.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.fullName}
                </option>
              ))}
            </select>
            {teachers.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">
                A teacher needs to be registered first.
              </p>
            )}
          </div>

          <div>
            <label className="block text-[13px] font-medium text-ink mb-1.5">Academic Year</label>
            <input
              type="text"
              placeholder="e.g. 2025-2026"
              value={form.academicYear}
              onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
              className="input-base"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-line">
          <Button variant="secondary" size="sm" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button
            variant="accent"
            size="sm"
            onClick={handleCreate}
            loading={createGroup.isPending}
            disabled={!form.name || !form.course || !form.semester || !form.teacherId}
          >
            Create
          </Button>
        </div>
      </Modal>
    </div>
  );
}
