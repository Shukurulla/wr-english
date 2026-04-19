"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./api-client";

// ─── AUTH ────────────────────────────────────────────────────
export function useMe() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => api.get("/auth/me").then((r) => r.data),
    staleTime: 60_000,
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (body) => api.post("/auth/change-password", body),
  });
}

// ─── USERS (admin) ──────────────────────────────────────────
export function useUsers(params) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => api.get("/users", { params }).then((r) => r),
    keepPreviousData: true,
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => api.post("/users", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }) => api.patch(`/users/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

// ─── GROUPS ─────────────────────────────────────────────────
export function useGroups(params) {
  return useQuery({
    queryKey: ["groups", params],
    queryFn: () => api.get("/groups", { params }).then((r) => r),
  });
}

export function useGroupStudents(groupId) {
  return useQuery({
    queryKey: ["groups", groupId, "students"],
    queryFn: () => api.get(`/groups/${groupId}/students`).then((r) => r.data),
    enabled: !!groupId,
  });
}

export function useCreateGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => api.post("/groups", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["groups"] }),
  });
}

export function useUpdateGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }) => api.patch(`/groups/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["groups"] }),
  });
}

// ─── TASKS ──────────────────────────────────────────────────
export function useTasks(params) {
  return useQuery({
    queryKey: ["tasks", params],
    queryFn: () => api.get("/tasks", { params }).then((r) => r),
  });
}

export function useTask(id) {
  return useQuery({
    queryKey: ["tasks", id],
    queryFn: () => api.get(`/tasks/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => api.post("/tasks", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }) => api.patch(`/tasks/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/tasks/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useAddStudentsToGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, studentIds }) =>
      api.post(`/groups/${groupId}/students`, { studentIds }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["groups", vars.groupId, "students"] });
      qc.invalidateQueries({ queryKey: ["users"] });
      qc.invalidateQueries({ queryKey: ["groups"] });
    },
  });
}

export function useCreateFinalTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => api.post("/final-test/questions", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["final-tests"] }),
  });
}

// ─── ASSIGNMENTS ────────────────────────────────────────────
export function useMyAssignments() {
  return useQuery({
    queryKey: ["assignments", "my"],
    queryFn: () => api.get("/assignments/my").then((r) => r.data),
  });
}

export function useAssignments(params) {
  return useQuery({
    queryKey: ["assignments", params],
    queryFn: () => api.get("/assignments", { params }).then((r) => r),
  });
}

export function useCreateAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => api.post("/assignments", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assignments"] }),
  });
}

// ─── SUBMISSIONS ────────────────────────────────────────────
export function useStartSubmission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => api.post("/submissions/start", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["submissions"] }),
  });
}

export function useSubmission(id) {
  return useQuery({
    queryKey: ["submissions", id],
    queryFn: () => api.get(`/submissions/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useSubmissions(params) {
  return useQuery({
    queryKey: ["submissions", params],
    queryFn: () => api.get("/submissions", { params }).then((r) => r),
    enabled: !!params,
  });
}

export function useAnswerReading() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, answers }) =>
      api.post(`/submissions/${id}/answer-reading`, { answers }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["submissions"] });
      qc.invalidateQueries({ queryKey: ["grades"] });
    },
  });
}

export function useSubmitWriting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, text, meta }) =>
      api.post(`/submissions/${id}/submit-writing`, { text, meta }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["submissions"] });
      qc.invalidateQueries({ queryKey: ["grades"] });
    },
  });
}

export function useSaveDraft() {
  return useMutation({
    mutationFn: ({ id, text }) =>
      api.put(`/submissions/${id}/draft`, { text }),
  });
}

// ─── GRADES ─────────────────────────────────────────────────
export function useMyGrades(semester) {
  return useQuery({
    queryKey: ["grades", "my", semester],
    queryFn: () =>
      api.get("/grades/my", { params: semester ? { semester } : {} }).then((r) => r.data),
  });
}

export function useGroupGrades(groupId, semester) {
  return useQuery({
    queryKey: ["grades", "group", groupId, semester],
    queryFn: () =>
      api
        .get(`/grades/group/${groupId}`, { params: semester ? { semester } : {} })
        .then((r) => r.data),
    enabled: !!groupId,
  });
}

// ─── COMPLAINTS ─────────────────────────────────────────────
export function useMyComplaints() {
  return useQuery({
    queryKey: ["complaints", "my"],
    queryFn: () => api.get("/complaints/my").then((r) => r.data),
  });
}

export function useComplaints(params) {
  return useQuery({
    queryKey: ["complaints", params],
    queryFn: () => api.get("/complaints", { params }).then((r) => r),
    enabled: params !== undefined,
  });
}

export function useCreateComplaint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => api.post("/complaints", body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["complaints"] });
    },
  });
}

export function useResolveComplaint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }) => api.patch(`/complaints/${id}/resolve`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["complaints"] }),
  });
}

// ─── FINAL TEST ─────────────────────────────────────────────
export function useMyFinalTestAttempt(semester) {
  return useQuery({
    queryKey: ["final-test", "my-attempt", semester],
    queryFn: () =>
      api
        .get("/final-test/my-attempt", { params: semester ? { semester } : {} })
        .then((r) => r.data),
  });
}

export function useStartFinalTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params) => api.post("/final-test/start", null, { params }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["final-test"] }),
  });
}

export function useSubmitFinalTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => api.post("/final-test/submit", body),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["final-test"] }),
  });
}

export function useFinalTests() {
  return useQuery({
    queryKey: ["final-tests"],
    queryFn: () => api.get("/final-test").then((r) => r.data),
  });
}

// ─── REPORTS ────────────────────────────────────────────────
export function useGroupSummary(groupId, semester) {
  return useQuery({
    queryKey: ["reports", "group-summary", groupId, semester],
    queryFn: () =>
      api
        .get(`/reports/group/${groupId}/summary`, {
          params: semester ? { semester } : {},
        })
        .then((r) => r.data),
    enabled: !!groupId,
  });
}

export function useAssignmentStats(assignmentId) {
  return useQuery({
    queryKey: ["reports", "assignment-stats", assignmentId],
    queryFn: () =>
      api.get(`/reports/assignment/${assignmentId}/stats`).then((r) => r.data),
    enabled: !!assignmentId,
  });
}

// ─── ADMIN ──────────────────────────────────────────────────
export function useAuditLogs(params) {
  return useQuery({
    queryKey: ["audit-logs", params],
    queryFn: () => api.get("/admin/audit-logs", { params }).then((r) => r),
  });
}
