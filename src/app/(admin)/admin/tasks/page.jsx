"use client";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "@/lib/api-client";
import { PageLoader } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "@/stores/toast";
import { FolderOpen, Send } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminTasksPage() {
  const [showAssign, setShowAssign] = useState(false);
  const [typeFilter, setTypeFilter] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-tasks-all"],
    queryFn: () => api.get("/tasks?limit=100"),
  });

  if (isLoading) return <PageLoader />;
  const allTasks = data?.data || [];
  const tasks = typeFilter
    ? allTasks.filter((t) => t.type === typeFilter)
    : allTasks;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-[28px] font-semibold tracking-tight">
          {allTasks.length} tasks
        </h1>
        <Button icon={Send} onClick={() => setShowAssign(true)}>
          Assign to group
        </Button>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {[
          { v: "", l: `All ${allTasks.length}` },
          { v: "writing", l: `Writing ${allTasks.filter((t) => t.type === "writing").length}` },
          { v: "reading", l: `Reading ${allTasks.filter((t) => t.type === "reading").length}` },
        ].map((t) => (
          <button
            key={t.v}
            onClick={() => setTypeFilter(t.v)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
              typeFilter === t.v
                ? "bg-ink text-porcelain"
                : "bg-white border border-line text-muted"
            )}
          >
            {t.l}
          </button>
        ))}
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No tasks found"
          description="Use the seed script or create a task from the Tests page."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {tasks.map((t) => {
            const isWriting = t.type === "writing";
            return (
              <div key={t._id} className="card p-5">
                <div className="flex justify-between items-start mb-4">
                  <div
                    className={cn(
                      "w-9 h-9 rounded-[10px] flex items-center justify-center font-display text-sm font-medium",
                      isWriting ? "bg-ink text-porcelain" : "bg-mist text-ink"
                    )}
                  >
                    {isWriting ? "W" : "R"}
                  </div>
                  <Badge variant="neutral">{t.topic || t.type}</Badge>
                </div>
                <p className="font-display text-[17px] font-medium leading-snug tracking-tight mb-3.5 min-h-[44px]">
                  {t.title}
                </p>
                <div className="flex gap-4 pt-3 border-t border-line">
                  <div>
                    <p className="section-label text-[10px] mb-0">Semester</p>
                    <p className="font-display text-lg">{t.semester}</p>
                  </div>
                  <div>
                    <p className="section-label text-[10px] mb-0">Score</p>
                    <p className="font-display text-lg">{t.maxScore}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AssignModal open={showAssign} onClose={() => setShowAssign(false)} />
    </div>
  );
}

function AssignModal({ open, onClose }) {
  const [groupId, setGroupId] = useState("");
  const [taskType, setTaskType] = useState("reading");
  const [taskSemester, setTaskSemester] = useState(1);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [interval, setIntervalDays] = useState(7);

  const { data: groups } = useQuery({
    queryKey: ["admin-groups-for-assign"],
    queryFn: () => api.get("/groups?limit=100"),
    enabled: open,
  });

  const { data: tasks } = useQuery({
    queryKey: ["tasks-for-assign", taskType, taskSemester],
    queryFn: () => api.get(`/tasks?type=${taskType}&semester=${taskSemester}&limit=100`),
    enabled: open,
  });

  const mutation = useMutation({
    mutationFn: () => {
      const start = new Date(startDate);
      const items = selectedTasks.map((taskId, i) => {
        const opens = new Date(start);
        opens.setDate(opens.getDate() + i * interval);
        const due = new Date(opens);
        due.setDate(due.getDate() + interval);
        return { taskId, opensAt: opens.toISOString(), dueAt: due.toISOString() };
      });
      return api.post("/assignments/bulk", { groupId, semester: taskSemester, items });
    },
    onSuccess: (res) => {
      toast.success(`${res.data.created} tasks assigned`);
      if (res.data.errors?.length > 0) {
        toast.error(`${res.data.errors.length} errors`);
      }
      setSelectedTasks([]);
      onClose();
    },
    onError: (err) => toast.error(err?.error?.message || "Error"),
  });

  const ordinal = (n) => n === 1 ? "1st" : n === 2 ? "2nd" : n === 3 ? "3rd" : `${n}th`;
  const groupList = groups?.data || [];
  const taskList = tasks?.data || [];

  return (
    <Modal open={open} onClose={onClose} title="Assign tasks to group" size="lg">
      <div className="space-y-4 max-h-[70vh] overflow-y-auto">
        <div>
          <p className="section-label">Group</p>
          <select
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            className="w-full border border-line rounded-[10px] px-3 py-2.5 text-sm bg-white"
          >
            <option value="">Select a group...</option>
            {groupList.map((g) => (
              <option key={g._id} value={g._id}>
                {g.name} ({ordinal(g.course)} year, Sem {g.semester})
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 flex-wrap">
          {["reading", "writing"].map((t) => (
            <button
              key={t}
              onClick={() => {
                setTaskType(t);
                setSelectedTasks([]);
              }}
              className={cn(
                "px-3.5 py-2 rounded-[10px] border-2 text-[13px] font-semibold",
                taskType === t ? "border-ink bg-mist" : "border-line"
              )}
            >
              {t === "reading" ? "Reading" : "Writing"}
            </button>
          ))}
          <select
            value={taskSemester}
            onChange={(e) => {
              setTaskSemester(Number(e.target.value));
              setSelectedTasks([]);
            }}
            className="border border-line rounded-[10px] px-3 py-2 text-sm bg-white"
          >
            <option value={1}>Semester 1</option>
            <option value={2}>Semester 2</option>
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="section-label mb-0">Tasks</p>
            {taskList.length > 0 && (
              <button
                onClick={() =>
                  setSelectedTasks(
                    selectedTasks.length === taskList.length
                      ? []
                      : taskList.map((t) => t._id)
                  )
                }
                className="text-xs text-accent hover:underline font-medium"
              >
                {selectedTasks.length === taskList.length ? "Deselect all" : "Select all"}
              </button>
            )}
          </div>
          <div className="space-y-0.5 max-h-48 overflow-y-auto border border-line rounded-xl p-2">
            {taskList.map((t) => (
              <label
                key={t._id}
                className="flex items-center gap-2.5 p-2.5 hover:bg-mist rounded-lg cursor-pointer text-sm"
              >
                <input
                  type="checkbox"
                  checked={selectedTasks.includes(t._id)}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedTasks([...selectedTasks, t._id]);
                    else setSelectedTasks(selectedTasks.filter((id) => id !== t._id));
                  }}
                  className="rounded"
                />
                <span className="flex-1">
                  {t.order}. {t.title}
                </span>
                <Badge variant="neutral">{t.maxScore} pts</Badge>
              </label>
            ))}
            {taskList.length === 0 && (
              <p className="text-center text-faint py-3 text-sm">No tasks</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Start date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label="Interval (days)"
            type="number"
            min={1}
            value={interval}
            onChange={(e) => setIntervalDays(Number(e.target.value))}
          />
        </div>

        <p className="text-xs text-muted">
          {selectedTasks.length} selected. One opens every {interval} day{interval === 1 ? "" : "s"}.
        </p>

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            icon={Send}
            onClick={() => mutation.mutate()}
            loading={mutation.isPending}
            disabled={!groupId || selectedTasks.length === 0 || !startDate}
          >
            Assign ({selectedTasks.length})
          </Button>
        </div>
      </div>
    </Modal>
  );
}
