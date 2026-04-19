"use client";

import { useState, useMemo } from "react";
import { Search, UserPlus, Check } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUsers, useAddStudentsToGroup } from "@/lib/api-hooks";
import { toast } from "@/stores/toast";

export function AddStudentsModal({ open, onClose, groupId, groupName, existingStudentIds = [] }) {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [onlyUngrouped, setOnlyUngrouped] = useState(true);
  const addMutation = useAddStudentsToGroup();

  const { data: usersRes, isLoading } = useUsers({
    role: "student",
    limit: 100,
    ...(search ? { search } : {}),
  });

  const students = usersRes?.data ?? [];
  const existingSet = useMemo(() => new Set(existingStudentIds), [existingStudentIds]);

  const filtered = useMemo(() => {
    return students.filter((s) => {
      if (existingSet.has(s._id)) return false;
      if (onlyUngrouped) {
        const g = s.studentInfo?.groupId;
        const gid = typeof g === "object" ? g?._id : g;
        if (gid) return false;
      }
      return true;
    });
  }, [students, existingSet, onlyUngrouped]);

  const toggle = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleAdd = async () => {
    if (selectedIds.size === 0) {
      toast.error("Select at least one student");
      return;
    }
    try {
      await addMutation.mutateAsync({
        groupId,
        studentIds: Array.from(selectedIds),
      });
      toast.success(`${selectedIds.size} student${selectedIds.size > 1 ? "s" : ""} added`);
      setSelectedIds(new Set());
      onClose();
    } catch (err) {
      toast.error(err?.error?.message || err?.response?.data?.error?.message || "Failed to add");
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={`Add students to ${groupName || "group"}`} size="lg">
      <div className="space-y-4">
        <div className="flex items-center gap-2 bg-porcelain px-3 py-2 rounded-lg border border-line">
          <Search className="w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm outline-none flex-1 placeholder:text-muted"
            autoFocus
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
          <input
            type="checkbox"
            checked={onlyUngrouped}
            onChange={(e) => setOnlyUngrouped(e.target.checked)}
            className="w-4 h-4 rounded"
          />
          Only show students without a group
        </label>

        <div className="border border-line rounded-xl max-h-[50vh] overflow-y-auto">
          {isLoading ? (
            <div className="py-8 text-center text-sm text-muted">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted">
              {search ? "Nothing found" : "No students to add"}
            </div>
          ) : (
            filtered.map((s) => {
              const selected = selectedIds.has(s._id);
              const currentGroup = s.studentInfo?.groupId;
              const gName = typeof currentGroup === "object" ? currentGroup?.name : null;
              const initials = (s.fullName || "??")
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();

              return (
                <button
                  key={s._id}
                  onClick={() => toggle(s._id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 border-b border-line last:border-0 text-left transition-colors",
                    selected ? "bg-accent-soft" : "hover:bg-mist"
                  )}
                >
                  <div
                    className={cn(
                      "w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors",
                      selected ? "bg-accent border-accent" : "bg-white border-line"
                    )}
                  >
                    {selected && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 bg-accent">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink truncate">{s.fullName}</p>
                    <p className="text-xs text-muted truncate">{s.email}</p>
                  </div>
                  {gName && (
                    <span className="text-[10px] text-muted bg-mist px-2 py-0.5 rounded-full">
                      {gName}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-line">
          <span className="text-sm text-muted">{selectedIds.size} selected</span>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={UserPlus}
              onClick={handleAdd}
              disabled={selectedIds.size === 0}
              loading={addMutation.isPending}
            >
              Add ({selectedIds.size})
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
