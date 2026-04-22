"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { PageLoader } from "@/components/ui/spinner";
import { toast } from "@/stores/toast";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Clock,
  Maximize,
  RefreshCw,
  Flag,
  Play,
  HelpCircle,
  Trophy,
  AlertTriangle,
} from "lucide-react";

export default function TaskDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);
  const [conflictModalOpen, setConflictModalOpen] = useState(false);
  const [existingSubId, setExistingSubId] = useState("");
  const [existingStatus, setExistingStatus] = useState("in_progress");

  // The list endpoint returns virtual assignments whose _id is the taskId.
  // Fetch the task directly for full detail.
  const { data: task, isLoading } = useQuery({
    queryKey: ["task", id],
    queryFn: () => api.get(`/tasks/${id}`).then((r) => r.data),
    enabled: !!id,
  });

  const startMutation = useMutation({
    mutationFn: () => api.post("/submissions/start", { taskId: id }),
    onSuccess: (res) => {
      const sub = res?.data?.submission || res?.submission;
      const subId = sub?._id || "";
      router.push(`/tasks/${id}/work?submissionId=${subId}`);
    },
    onError: (err) => {
      const code = err?.error?.code || err?.response?.data?.error?.code;
      if (code === "CONFLICT") {
        const subId = err?.error?.details?.submission?._id;
        const status = err?.error?.details?.submission?.status;
        if (subId) {
          if (status && status !== "in_progress") {
            router.push(`/results/${subId}`);
            return;
          }
          setExistingSubId(subId);
          setExistingStatus(status || "in_progress");
          setConflictModalOpen(true);
        } else {
          router.push(`/tasks/${id}/work`);
        }
      } else {
        const msg = err?.error?.message || err?.response?.data?.error?.message || "Something went wrong";
        toast.error(msg);
      }
    },
  });

  const restartMutation = useMutation({
    mutationFn: () => api.post(`/submissions/${existingSubId}/restart`),
    onSuccess: (res) => {
      const sub = res?.data?.submission || res?.submission;
      const newSubId = sub?._id || "";
      router.push(`/tasks/${id}/work?submissionId=${newSubId}`);
    },
    onError: (err) => {
      const msg = err?.error?.message || err?.response?.data?.error?.message || "Failed to restart";
      toast.error(msg);
    }
  });

  if (isLoading) return <PageLoader />;
  if (!task) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <p className="text-[#B91C1C]">Task not found</p>
      </div>
    );
  }

  const isWriting = task.type === "writing";
  const timeMinutes = isWriting
    ? Math.floor((task.writing?.timeLimit || 1200) / 60)
    : 15;
  const questionCount = isWriting ? 1 : task.reading?.questions?.length || 0;
  const maxScore = task.maxScore ?? 0;

  const rules = [
    { icon: Clock, text: `Timer starts — ${timeMinutes} minutes, cannot be paused` },
    { icon: Maximize, text: "Fullscreen mode — leaving ends the test automatically" },
    { icon: RefreshCw, text: "Don't close the page — answers are auto-saved" },
    { icon: Flag, text: "Complaint available — within 24 hours of results" },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-28">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          aria-label="Back"
          className="w-10 h-10 rounded-xl border border-line bg-white flex items-center justify-center hover:bg-mist transition-colors"
        >
          <ArrowLeft className="w-4.5 h-4.5 text-ink" />
        </button>
        <h1 className="text-xl font-bold text-ink tracking-tight">Test Details</h1>
      </div>

      <div className="bg-ink dark:bg-zinc-800 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_top_right,_rgba(4,120,87,0.2)_0%,_transparent_70%)]" />

        <div className="relative z-10 space-y-4">
          <Badge variant={isWriting ? "success" : "info"} className={cn(
            "text-xs",
            isWriting
              ? "!bg-accent/20 !text-emerald-300"
              : "!bg-blue-500/20 !text-blue-300"
          )}>
            {isWriting ? "Writing" : "Reading"}
          </Badge>

          <h2 className="text-2xl font-display font-bold tracking-tight leading-tight">
            {task.title || "Test"}
          </h2>

          {task.semester && (
            <p className="text-white/50 text-sm">
              Semester {task.semester}
            </p>
          )}

          <div className="flex items-center gap-6 pt-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-white/40" />
              <span className="text-sm text-white/70">{timeMinutes} min</span>
            </div>
            {!isWriting && (
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-white/40" />
                <span className="text-sm text-white/70">{questionCount} questions</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-white/40" />
              <span className="text-sm text-white/70">{maxScore} pts max</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-faint px-1">
          Rules
        </p>

        <div className="space-y-2">
          {rules.map((rule, i) => (
            <div
              key={i}
              className="bg-white border border-line rounded-xl p-4 flex items-start gap-3.5"
            >
              <div className="w-9 h-9 rounded-xl bg-mist flex items-center justify-center shrink-0">
                <rule.icon className="w-4.5 h-4.5 text-muted" />
              </div>
              <p className="text-sm text-ink leading-relaxed pt-1.5">{rule.text}</p>
            </div>
          ))}
        </div>
      </div>

      <label className="flex items-start gap-3 cursor-pointer select-none bg-white border border-line rounded-xl p-4">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="w-4.5 h-4.5 rounded border-line text-accent focus:ring-accent focus:ring-offset-0 mt-0.5"
        />
        <span className="text-sm text-ink leading-relaxed">
          I understand and agree to the rules above
        </span>
      </label>

      <div className="fixed bottom-[88px] md:bottom-0 left-0 right-0 bg-porcelain/80 backdrop-blur-lg border-t border-line p-4 z-40 sm:static sm:bg-transparent sm:backdrop-blur-none sm:border-0 sm:p-0">
        <div className="max-w-2xl mx-auto">
          <Button
            onClick={() => startMutation.mutate()}
            loading={startMutation.isPending}
            disabled={!agreed}
            size="lg"
            className="w-full"
            icon={Play}
          >
            Start Test
          </Button>
        </div>
      </div>

      <Modal open={conflictModalOpen} onClose={() => setConflictModalOpen(false)} title="Test Already Started">
        <div className="space-y-4">
          <p className="text-muted text-sm leading-relaxed">
            You have an unfinished attempt for this test. The timer might have already expired if you started it a while ago.
          </p>
          <div className="flex flex-col gap-3 pt-2">
            <Button
              variant="primary"
              onClick={() => router.push(`/tasks/${id}/work?submissionId=${existingSubId}`)}
              className="w-full"
            >
              Resume Test
            </Button>
            <Button
              variant="secondary"
              onClick={() => restartMutation.mutate()}
              loading={restartMutation.isPending}
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            >
              Restart from Beginning
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
