"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api-client";
import { PageLoader } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { toast } from "@/stores/toast";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "student",
    groupId: "",
  });

  const { data: groupsData } = useQuery({
    queryKey: ["groups-for-user-form"],
    queryFn: () => api.get("/groups?limit=100"),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", search, roleFilter, page],
    queryFn: () =>
      api.get(
        `/users?page=${page}&limit=20${search ? `&search=${search}` : ""}${roleFilter ? `&role=${roleFilter}` : ""}`
      ),
  });

  const handleToggleActive = async (userId, isActive) => {
    try {
      if (isActive) {
        await api.delete(`/users/${userId}`);
        toast.success("User deleted");
      } else {
        await api.patch(`/users/${userId}`, { isActive: true });
        toast.success("User activated");
      }
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (err) {
      toast.error(err?.error?.message || "Error");
    }
  };

  const createMutation = useMutation({
    mutationFn: () => {
      const payload = { ...form };
      if (form.role === "student" && form.groupId) {
        payload.studentInfo = { groupId: form.groupId };
      }
      delete payload.groupId;
      return api.post("/users", payload);
    },
    onSuccess: () => {
      toast.success("User created");
      setShowCreate(false);
      setForm({ fullName: "", email: "", password: "", role: "student", groupId: "" });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err) => toast.error(err?.error?.message || "Error"),
  });

  if (isLoading) return <PageLoader />;

  const users = data?.data || [];
  const meta = data?.meta || {};
  const roleLabels = { student: "Student", teacher: "Teacher", admin: "Admin" };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-[28px] font-semibold tracking-tight">
          {meta.total ?? 0} users
        </h1>
        <Button icon={Plus} onClick={() => setShowCreate(true)}>
          New User
        </Button>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {[
          { v: "", l: "All", c: meta.total },
          { v: "student", l: "Students" },
          { v: "teacher", l: "Teachers" },
          { v: "admin", l: "Admins" },
        ].map((t) => (
          <button
            key={t.v}
            onClick={() => {
              setRoleFilter(t.v);
              setPage(1);
            }}
            className={cn(
              "px-3.5 py-2 rounded-[10px] text-[13px] font-semibold flex items-center gap-2 transition-all",
              roleFilter === t.v
                ? "bg-ink text-porcelain"
                : "bg-white border border-line text-ink hover:bg-mist"
            )}
          >
            {t.l}
            {t.c != null && (
              <span className="text-[11px] text-faint">
                {t.c}
              </span>
            )}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 px-3.5 py-2 border border-line rounded-[10px] text-muted text-xs min-w-[200px]">
          <span>🔍</span>
          <input
            placeholder="Name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="bg-transparent outline-none flex-1 text-ink text-[13px]"
          />
        </div>
      </div>

      <div className="card divide-y divide-line">
        {users.map((u) => (
          <div key={u._id} className="flex items-center gap-4 p-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-300 to-zinc-400 flex items-center justify-center text-porcelain text-[11px] font-semibold shrink-0">
              {u.fullName?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold truncate">{u.fullName}</p>
              <p className="text-[11px] text-faint truncate">@{u.email?.split("@")[0]}</p>
            </div>
            <span
              className={cn(
                "text-[11px] font-bold uppercase tracking-wider",
                u.role === "teacher"
                  ? "text-accent"
                  : u.role === "admin"
                  ? "text-amber-600"
                  : "text-ink"
              )}
            >
              {roleLabels[u.role]}
            </span>
            <Badge variant={u.isActive ? "success" : "error"}>
              {u.isActive ? "Active" : "Inactive"}
            </Badge>
            <button
              onClick={() => handleToggleActive(u._id, u.isActive)}
              aria-label="Toggle active"
              className="text-faint text-base px-2"
            >
              ···
            </button>
          </div>
        ))}
      </div>

      {meta.totalPages > 1 && (
        <div className="flex justify-between items-center text-xs text-muted">
          <span>
            1-{users.length} · total {meta.total}
          </span>
          <div className="flex gap-1.5">
            {Array.from({ length: Math.min(meta.totalPages, 10) }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold",
                  page === i + 1
                    ? "bg-ink text-porcelain"
                    : "text-muted hover:bg-mist"
                )}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New User">
        <div className="space-y-4">
          <Input
            label="Full name"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <div>
            <p className="section-label">Role</p>
            <div className="flex gap-2">
              {["student", "teacher", "admin"].map((r) => (
                <button
                  key={r}
                  onClick={() => setForm({ ...form, role: r, groupId: "" })}
                  className={cn(
                    "px-3 py-2 rounded-[10px] border-2 text-[13px] font-semibold transition-all",
                    form.role === r ? "border-ink bg-mist" : "border-line"
                  )}
                >
                  {roleLabels[r]}
                </button>
              ))}
            </div>
          </div>
          {form.role === "student" && (
            <div>
              <p className="section-label">Group</p>
              <select
                value={form.groupId}
                onChange={(e) => setForm({ ...form, groupId: e.target.value })}
                className="w-full border border-line rounded-[10px] px-3 py-2.5 text-sm bg-white"
              >
                <option value="">Assign later</option>
                {(groupsData?.data || []).map((g) => (
                  <option key={g._id} value={g._id}>
                    {g.name} (Sem {g.semester}, {g.studentCount || 0} students)
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button onClick={() => createMutation.mutate()} loading={createMutation.isPending}>
              Create
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
