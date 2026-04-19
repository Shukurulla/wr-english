"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList, AlertTriangle, Clock, CheckCircle2, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatTimer } from "@/lib/utils";
import { useMyFinalTestAttempt, useStartFinalTest } from "@/lib/api-hooks";
import { toast } from "@/stores/toast";

function FinalTestSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="skeleton h-8 w-48" />
      <div className="skeleton h-48 rounded-2xl" />
      <div className="skeleton h-32 rounded-2xl" />
    </div>
  );
}

export default function FinalTestLandingPage() {
  const [semester, setSemester] = useState("1");
  const { data: attempt, isLoading } = useMyFinalTestAttempt(semester);
  const startMutation = useStartFinalTest();
  const router = useRouter();

  if (isLoading) return <FinalTestSkeleton />;

  const isGraded = attempt?.status === "graded" || attempt?.isFinalized;
  const inProgress = attempt?.status === "in_progress";

  const handleStart = () => {
    startMutation.mutate(
      { semester: Number(semester) },
      {
        onSuccess: (res) => {
          const attemptId = res?.data?.attempt?._id || res?.attempt?._id;
          if (attemptId) {
            router.push(`/final-test/take?attemptId=${attemptId}&semester=${semester}`);
          } else {
            toast.error("Could not start the test");
          }
        },
        onError: (err) => {
          const code = err?.error?.code;
          if (code === "CONFLICT") {
            toast.error("You have already started this test");
            router.push(`/final-test/take?semester=${semester}`);
          } else {
            toast.error(err?.error?.message || "Could not start the test");
          }
        },
      }
    );
  };

  const handleContinue = () => {
    router.push(`/final-test/take?attemptId=${attempt._id}&semester=${semester}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Final Test</h1>
        <p className="text-sm text-muted mt-1">End-of-semester assessment</p>
      </div>

      <div className="flex gap-2">
        {["1", "2"].map((s) => (
          <button
            key={s}
            onClick={() => setSemester(s)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-semibold transition-colors",
              semester === s
                ? "bg-ink text-porcelain"
                : "bg-white border border-line text-muted hover:bg-mist"
            )}
          >
            Semester {s}
          </button>
        ))}
      </div>

      {!attempt && (
        <>
          <div className="bg-white border border-line rounded-2xl p-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#FEF3C7] text-[#B45309] flex items-center justify-center shrink-0">
                <ClipboardList className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-ink">Semester {semester} Final Test</h2>
                <p className="text-sm text-muted mt-1">Read the rules before you start.</p>
              </div>
            </div>

            <ul className="space-y-2 text-sm text-ink">
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-faint shrink-0 mt-0.5" />
                <span>Duration — <strong>20 minutes</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-faint shrink-0 mt-0.5" />
                <span><strong>20 questions</strong>, 0.1 points each (2 points total).</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-faint shrink-0 mt-0.5" />
                <span>You can attempt this <strong>only once</strong>. You cannot restart after starting.</span>
              </li>
            </ul>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold">Heads up</p>
              <p className="mt-1">Once started, you cannot close the page or navigate away. The test ends automatically when time runs out.</p>
            </div>
          </div>

          <Button
            variant="accent"
            size="lg"
            icon={PlayCircle}
            onClick={handleStart}
            loading={startMutation.isPending}
            className="w-full"
          >
            Start Test
          </Button>
        </>
      )}

      {inProgress && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-200 text-amber-800 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-ink">Test in progress</h3>
              <p className="text-sm text-muted">Resume your active attempt.</p>
            </div>
          </div>
          <Button variant="accent" size="md" onClick={handleContinue} className="w-full">
            Resume
          </Button>
        </div>
      )}

      {isGraded && (
        <div className="bg-white border border-line rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#ECFDF5] text-accent flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-ink">Test submitted</h3>
              <p className="text-sm text-muted">
                {attempt.submittedAt && new Date(attempt.submittedAt).toLocaleDateString("en-US", {
                  day: "numeric", month: "long", year: "numeric"
                })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-line">
            <div className="text-center">
              <p className="text-xs text-muted uppercase tracking-wide font-semibold">Score</p>
              <p className="font-display text-2xl font-bold text-accent mt-1">
                {(attempt.totalScore ?? 0).toFixed(1)}
                <span className="text-faint text-xs font-normal">/2.0</span>
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted uppercase tracking-wide font-semibold">Correct</p>
              <p className="font-display text-2xl font-bold text-ink mt-1">
                {attempt.correctCount ?? 0}
                <span className="text-faint text-xs font-normal">/20</span>
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted uppercase tracking-wide font-semibold">Time</p>
              <p className="font-display text-2xl font-bold text-ink mt-1">
                {attempt.timeSpentSec ? formatTimer(attempt.timeSpentSec) : "—"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
