"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn, formatTimer } from "@/lib/utils";
import api from "@/lib/api-client";
import { useSubmitFinalTest } from "@/lib/api-hooks";
import { toast } from "@/stores/toast";

function Timer({ seconds, onTimeUp }) {
  const isLow = seconds < 120;
  useEffect(() => {
    if (seconds === 0) onTimeUp?.();
  }, [seconds, onTimeUp]);
  return (
    <span className={cn("font-display text-lg font-bold tabular-nums",
      isLow ? "text-[#B91C1C]" : "text-ink")}>
      {formatTimer(seconds)}
    </span>
  );
}

function ExitModal({ open, onClose, onConfirm }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md p-6 space-y-4">
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-[#FFFBEB] flex items-center justify-center mb-3">
            <AlertTriangle className="w-7 h-7 text-[#B45309]" />
          </div>
          <h3 className="text-lg font-bold text-ink">Leave this test?</h3>
          <p className="text-sm text-muted mt-2 leading-relaxed">
            The test will be submitted with your current answers. You cannot restart.
          </p>
        </div>
        <div className="space-y-2.5 pt-2">
          <button onClick={onConfirm} className="w-full py-3.5 rounded-xl bg-[#B91C1C] text-white text-sm font-semibold hover:bg-red-700 transition-colors">
            Yes, finish test
          </button>
          <button onClick={onClose} className="w-full py-3.5 rounded-xl bg-mist text-muted text-sm font-semibold hover:bg-line transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FinalTestTakePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const attemptId = searchParams.get("attemptId");
  const semester = searchParams.get("semester") || "1";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentAttemptId, setCurrentAttemptId] = useState(attemptId);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [remaining, setRemaining] = useState(1200);
  const [exitOpen, setExitOpen] = useState(false);
  const submittedRef = useRef(false);
  const initCalled = useRef(false);
  const submitMutation = useSubmitFinalTest();

  useEffect(() => {
    if (initCalled.current) return;
    initCalled.current = true;

    async function init() {
      try {
        if (attemptId) {
          try {
            const res = await api.post("/final-test/start", null, { params: { semester } });
            setCurrentAttemptId(res.data.attempt._id);
            setQuestions(res.data.questions);
            const elapsed = Math.floor((Date.now() - new Date(res.data.attempt.startedAt).getTime()) / 1000);
            setRemaining(Math.max(0, (res.data.timeLimit || 1200) - elapsed));
          } catch (startErr) {
            if (startErr?.error?.code === "CONFLICT") {
              toast.error("Questions for an existing attempt cannot be fetched. Please contact your administrator.");
              router.push("/final-test");
              return;
            }
            throw startErr;
          }
        } else {
          const res = await api.post("/final-test/start", null, { params: { semester } });
          setCurrentAttemptId(res.data.attempt._id);
          setQuestions(res.data.questions);
          setRemaining(res.data.timeLimit || 1200);
        }
      } catch (err) {
        const msg = err?.error?.message || err?.response?.data?.error?.message || "Could not load the test";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [attemptId, semester, router]);

  useEffect(() => {
    if (loading || remaining <= 0) return;
    const interval = setInterval(() => {
      setRemaining((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [loading, remaining]);

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); e.returnValue = "Test is in progress."; };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  const handleSubmit = useCallback(() => {
    if (submittedRef.current || !currentAttemptId) return;
    submittedRef.current = true;

    const answersArr = questions.map((q) => ({
      questionId: q._id,
      selectedIndex: answers[q._id] ?? -1,
    }));

    submitMutation.mutate(
      { attemptId: currentAttemptId, answers: answersArr },
      {
        onSuccess: () => {
          toast.success("Test submitted!");
          router.push("/final-test");
        },
        onError: (err) => {
          submittedRef.current = false;
          toast.error(err?.error?.message || err?.response?.data?.error?.message || "Failed to submit");
        },
      }
    );
  }, [currentAttemptId, questions, answers, submitMutation, router]);

  const handleTimeUp = useCallback(() => {
    toast.error("Time's up! Submitting automatically...");
    handleSubmit();
  }, [handleSubmit]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] bg-porcelain flex items-center justify-center">
        <div className="text-center space-y-4">
          <Spinner size="lg" />
          <p className="text-sm text-muted">Loading test...</p>
        </div>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="fixed inset-0 z-[100] bg-porcelain flex items-center justify-center">
        <div className="text-center space-y-4 max-w-sm px-4">
          <AlertTriangle className="w-12 h-12 text-[#B91C1C] mx-auto" />
          <p className="text-sm text-muted">{error || "Could not load the test"}</p>
          <Button variant="secondary" onClick={() => router.push("/final-test")}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const q = questions[current];
  const selected = answers[q._id];
  const answeredCount = Object.keys(answers).length;

  return (
    <>
      <div className="fixed inset-0 z-[100] bg-porcelain flex flex-col">
        <header className="h-14 bg-white border-b border-line px-4 flex items-center justify-between shrink-0">
          <button onClick={() => setExitOpen(true)} className="w-10 h-10 rounded-xl hover:bg-mist flex items-center justify-center transition-colors" aria-label="Exit">
            <X className="w-5 h-5 text-ink" />
          </button>
          <Timer seconds={remaining} onTimeUp={handleTimeUp} />
          <div className="text-xs font-semibold text-muted">
            {answeredCount} / {questions.length}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-4 py-6">
            <div className="bg-white border border-line rounded-2xl p-5">
              <p className="text-xs text-faint font-semibold uppercase tracking-wide mb-1">
                Question {current + 1} of {questions.length}
              </p>
              <p className="text-base font-semibold text-ink mb-4 leading-relaxed">{q.prompt}</p>
              <div className="space-y-2.5">
                {q.options.map((opt, i) => {
                  const isSelected = selected === i;
                  return (
                    <button
                      key={i}
                      onClick={() => setAnswers({ ...answers, [q._id]: i })}
                      className={cn(
                        "w-full text-left p-3.5 rounded-xl border text-sm transition-all",
                        isSelected
                          ? "bg-ink text-porcelain border-ink"
                          : "bg-white border-line hover:border-faint"
                      )}
                    >
                      <span className="font-semibold mr-2">{String.fromCharCode(65 + i)}.</span> {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <footer className="h-16 bg-white border-t border-line px-4 flex items-center justify-between shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            disabled={current === 0}
            icon={ChevronLeft}
          >
            Prev
          </Button>
          <div className="flex gap-1 max-w-xs overflow-x-auto scrollbar-none">
            {questions.map((qq, i) => (
              <button
                key={qq._id}
                onClick={() => setCurrent(i)}
                className={cn(
                  "w-2.5 h-2.5 rounded-full transition-colors shrink-0",
                  i === current ? "bg-ink" : answers[qq._id] != null ? "bg-accent" : "bg-line"
                )}
              />
            ))}
          </div>
          {current < questions.length - 1 ? (
            <Button variant="primary" size="sm" onClick={() => setCurrent((c) => c + 1)} icon={ChevronRight}>
              Next
            </Button>
          ) : (
            <Button variant="accent" size="sm" onClick={handleSubmit} loading={submitMutation.isPending}>
              Submit
            </Button>
          )}
        </footer>
      </div>

      <ExitModal
        open={exitOpen}
        onClose={() => setExitOpen(false)}
        onConfirm={() => { setExitOpen(false); handleSubmit(); }}
      />
    </>
  );
}
