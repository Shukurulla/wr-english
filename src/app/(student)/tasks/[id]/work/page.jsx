"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { X, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn, formatTimer } from "@/lib/utils";
import { useAnswerReading, useSubmitWriting, useSaveDraft } from "@/lib/api-hooks";
import api from "@/lib/api-client";
import { toast } from "@/stores/toast";

function Timer({ initialSeconds, onTimeUp }) {
  const [seconds, setSeconds] = useState(initialSeconds);
  useEffect(() => { setSeconds(initialSeconds); }, [initialSeconds]);
  useEffect(() => {
    if (seconds <= 0) return;
    const interval = setInterval(() => {
      setSeconds((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [seconds]);

  useEffect(() => {
    if (seconds === 0) {
      onTimeUp?.();
    }
  }, [seconds, onTimeUp]);
  const isLow = seconds < 120;
  return (
    <span className={cn("font-display text-lg font-bold tabular-nums", isLow ? "text-[#B91C1C]" : "text-ink")}>
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
            If you leave now, the test will automatically end with your current score.
          </p>
        </div>
        <div className="space-y-2.5 pt-2">
          <button onClick={onConfirm} className="w-full py-3.5 rounded-xl bg-[#B91C1C] text-white text-sm font-semibold hover:bg-red-700 transition-colors">
            Yes, leave and end test
          </button>
          <button onClick={onClose} className="w-full py-3.5 rounded-xl bg-mist text-muted text-sm font-semibold hover:bg-line transition-colors">
            Cancel &middot; Stay in test
          </button>
        </div>
      </div>
    </div>
  );
}

function ReadingView({ task, submission, onComplete, submitRef }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const answerReadingMutation = useAnswerReading();

  const questions = task?.reading?.questions || [];
  const passage = task?.reading?.passage || "";
  const passageTitle = task?.title || "Reading Passage";
  const totalQuestions = questions.length;
  const question = questions[current];
  const [showPassage, setShowPassage] = useState(true);

  if (!question) {
    return <div className="flex items-center justify-center h-full text-muted">No questions available.</div>;
  }

  const selectedAnswer = answers[question._id || question.id || current];
  const answeredCount = Object.values(answers).filter((v) => v != null && v !== "").length;

  const handleSubmit = () => {
    const formattedAnswers = questions.map((q, idx) => ({
      questionId: q._id || q.id || String(idx),
      answer: answers[q._id || q.id || idx] ?? "",
    }));
    answerReadingMutation.mutate(
      { id: submission._id, answers: formattedAnswers },
      {
        onSuccess: () => { toast.success("Answers submitted!"); onComplete?.(); },
        onError: (err) => { toast.error(err?.error?.message || err?.response?.data?.error?.message || "Failed to submit"); },
      }
    );
  };

  useEffect(() => {
    if (submitRef) submitRef.current = handleSubmit;
  }, [submitRef, answers]);

  return (
    <>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="lg:hidden mb-4">
            <button onClick={() => setShowPassage(!showPassage)} className="text-sm font-semibold text-accent flex items-center gap-1">
              {showPassage ? "Hide passage" : "Show passage"}
              <ChevronRight className={cn("w-4 h-4 transition-transform", showPassage && "rotate-90")} />
            </button>
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            <div className={cn("lg:block lg:sticky lg:top-0 lg:self-start lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:pr-4", showPassage ? "block" : "hidden")}>
              <div className="bg-white border border-line rounded-2xl p-5">
                <h3 className="text-base font-bold text-ink mb-3">{passageTitle}</h3>
                <div className="text-sm text-ink/80 leading-relaxed whitespace-pre-line">{passage}</div>
              </div>
            </div>
            <div>
              <div className="bg-white border border-line rounded-2xl p-5">
                <p className="text-xs text-faint font-semibold uppercase tracking-wide mb-1">
                  Question {current + 1} of {totalQuestions}
                </p>
                <p className="text-base font-semibold text-ink mb-4 leading-relaxed">{question.prompt}</p>
                {question.options?.length > 0 ? (
                  <div className="space-y-2.5">
                    {question.options.map((opt, i) => {
                      const key = question._id || question.id || current;
                      const isSelected = selectedAnswer === opt;
                      return (
                        <button key={i} onClick={() => setAnswers({ ...answers, [key]: opt })}
                          className={cn("w-full text-left p-3.5 rounded-xl border text-sm transition-all", isSelected ? "bg-ink text-porcelain border-ink" : "bg-white border-line hover:border-faint")}>
                          <span className="font-semibold mr-2">{String.fromCharCode(65 + i)}.</span> {opt}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <input type="text" value={selectedAnswer || ""} onChange={(e) => setAnswers({ ...answers, [question._id || question.id || current]: e.target.value })}
                    placeholder="Type your answer..." className="w-full p-3.5 rounded-xl border border-line text-sm focus:ring-2 focus:ring-accent focus:outline-none" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <footer className="h-16 bg-white border-t border-line px-4 flex items-center justify-between shrink-0">
        <Button variant="secondary" size="sm" onClick={() => setCurrent((c) => Math.max(0, c - 1))} disabled={current === 0} icon={ChevronLeft}>Prev</Button>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted">
            {answeredCount} / {totalQuestions} answered
          </span>
          <div className="flex gap-1">
            {questions.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className={cn("w-2.5 h-2.5 rounded-full transition-colors", i === current ? "bg-ink" : answers[questions[i]._id || questions[i].id || i] ? "bg-accent" : "bg-line")} />
            ))}
          </div>
        </div>
        {current < totalQuestions - 1 ? (
          <Button variant="primary" size="sm" onClick={() => setCurrent((c) => c + 1)} icon={ChevronRight}>Next</Button>
        ) : (
          <Button variant="accent" size="sm" onClick={handleSubmit} loading={answerReadingMutation.isPending}>
            Submit
          </Button>
        )}
      </footer>
    </>
  );
}

function WritingView({ task, submission, onComplete, submitRef }) {
  const initialText = submission?.writing?.text || "";
  const [text, setText] = useState(initialText);
  const [saveStatus, setSaveStatus] = useState("idle");
  const [pasteWarning, setPasteWarning] = useState(false);
  const pasteMetaRef = useRef([]);
  const lastSavedTextRef = useRef(initialText);

  const submitWritingMutation = useSubmitWriting();
  const saveDraftMutation = useSaveDraft();

  const instructions = task?.writing?.instructions || "Write your essay below.";
  const guidingQuestions = task?.writing?.guidingQuestions || [];
  const minWords = task?.writing?.minWords || 100;
  const maxWords = task?.writing?.maxWords || 500;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  useEffect(() => {
    const interval = setInterval(() => {
      if (text === lastSavedTextRef.current) return;
      if (!submission?._id) return;
      setSaveStatus("saving");
      saveDraftMutation.mutate(
        { id: submission._id, text },
        {
          onSuccess: () => {
            lastSavedTextRef.current = text;
            setSaveStatus("saved");
            setTimeout(() => setSaveStatus((s) => (s === "saved" ? "idle" : s)), 2000);
          },
          onError: () => setSaveStatus("error"),
        }
      );
    }, 15000);
    return () => clearInterval(interval);
  }, [text, submission?._id, saveDraftMutation]);

  const handlePaste = (e) => {
    const pasted = e.clipboardData?.getData("text") || "";
    if (pasted.length > 50) {
      setPasteWarning(true);
      setTimeout(() => setPasteWarning(false), 5000);
      pasteMetaRef.current.push({ at: new Date().toISOString(), chars: pasted.length });
    }
  };

  const handleSubmit = () => {
    submitWritingMutation.mutate(
      {
        id: submission._id,
        text,
        meta: { wordCount, pasteEvents: pasteMetaRef.current },
      },
      {
        onSuccess: () => { toast.success("Writing submitted!"); onComplete?.(); },
        onError: (err) => { toast.error(err?.error?.message || err?.response?.data?.error?.message || "Failed to submit"); },
      }
    );
  };

  useEffect(() => {
    if (submitRef) submitRef.current = handleSubmit;
  }, [submitRef, text]);

  const tooFew = wordCount < minWords;
  const tooMany = wordCount > maxWords;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5 pb-32">
        <div className="bg-white border border-line rounded-2xl p-5">
          <h2 className="text-base font-bold text-ink mb-3">Writing Task</h2>
          <p className="text-sm text-muted leading-relaxed whitespace-pre-line">{instructions}</p>
          {guidingQuestions.length > 0 && (
            <div className="mt-4 space-y-1.5">
              <p className="text-xs text-faint font-semibold uppercase tracking-wide">Guiding questions</p>
              {guidingQuestions.map((q, i) => (
                <div key={i} className="flex items-start gap-2.5 p-2.5 bg-mist rounded-[10px] text-sm">
                  <span className="text-faint font-semibold text-[11px]">{i + 1}</span>
                  <span>{q}</span>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-faint mt-3">Word limit: {minWords}–{maxWords} words</p>
        </div>

        {pasteWarning && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2 text-sm text-amber-800">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            Text pasted — metadata will be saved.
          </div>
        )}

        <div className="bg-white border border-line rounded-2xl p-5">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onPaste={handlePaste}
            placeholder="Start writing your essay here..."
            rows={16}
            className="w-full bg-transparent text-sm text-ink placeholder:text-faint focus:outline-none resize-none leading-relaxed"
          />
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-line flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <p className={cn("text-xs font-medium",
                tooFew ? "text-[#B45309]" : tooMany ? "text-[#B91C1C]" : "text-accent")}>
                {wordCount} / {minWords}–{maxWords} words
              </p>
              <span className="text-[11px] text-faint flex items-center gap-1">
                <span
                  className={cn("w-1.5 h-1.5 rounded-full",
                    saveStatus === "saved" ? "bg-accent" :
                    saveStatus === "saving" ? "bg-amber-400 animate-pulse" :
                    saveStatus === "error" ? "bg-red-500" : "bg-zinc-400")}
                />
                {saveStatus === "saved" ? "saved" :
                 saveStatus === "saving" ? "saving..." :
                 saveStatus === "error" ? "not saved" : "autosave on"}
              </span>
            </div>
            <Button variant="accent" size="md" onClick={handleSubmit}
              disabled={tooFew || tooMany || submitWritingMutation.isPending}
              loading={submitWritingMutation.isPending}>
              Submit writing
            </Button>
          </div>
          {tooFew && (
            <p className="text-[11px] text-[#B45309] mt-2">
              Write at least {minWords - wordCount} more words.
            </p>
          )}
          {tooMany && (
            <p className="text-[11px] text-[#B91C1C] mt-2">
              {wordCount - maxWords} words over the limit.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function WorkPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const assignmentId = params.id;

  const [exitOpen, setExitOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState(null);
  const [task, setTask] = useState(null);
  const [error, setError] = useState(null);
  const initCalled = useRef(false);

  const submissionId = searchParams.get("submissionId");

  useEffect(() => {
    if (initCalled.current) return;
    initCalled.current = true;

    async function init() {
      try {
        if (submissionId) {
          const res = await api.get(`/submissions/${submissionId}`);
          const sub = res.data;
          if (sub?.status && sub.status !== "in_progress") {
            router.push(`/results/${sub._id}`);
            return;
          }
          setSubmission(sub);
          setTask(sub.taskId);
        } else {
          try {
            const res = await api.post("/submissions/start", { assignmentId });
            const data = res.data;
            if (data.submission?.status && data.submission.status !== "in_progress") {
              router.push(`/results/${data.submission._id}`);
              return;
            }
            setSubmission(data.submission);
            setTask(data.task);
          } catch (startErr) {
            const code = startErr?.error?.code;
            if (code === "CONFLICT") {
              const details = startErr?.error?.details;
              if (details?.submission) {
                if (details.submission.status !== "in_progress") {
                  router.push(`/results/${details.submission._id}`);
                  return;
                }
                setSubmission(details.submission);
                setTask(details.task);
              } else {
                throw new Error("Could not resume test");
              }
            } else {
              throw startErr;
            }
          }
        }
      } catch (err) {
        const msg = err?.error?.message || err?.response?.data?.error?.message || err?.message || "Failed to load test";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [assignmentId, submissionId]);

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); e.returnValue = "Test is in progress."; };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  const handleExit = useCallback(() => { setExitOpen(false); router.push("/tasks"); }, [router]);
  const handleComplete = useCallback(() => {
    if (submission?._id) {
      router.push(`/results/${submission._id}`);
    } else {
      router.push("/results");
    }
  }, [router, submission]);
  const submitRef = useRef(null);

  const handleTimeUp = useCallback(() => {
    toast.error("Time's up! Submitting automatically...");
    if (submitRef.current) {
      submitRef.current();
    } else {
      handleComplete();
    }
  }, [handleComplete]);

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

  if (error || !submission || !task) {
    return (
      <div className="fixed inset-0 z-[100] bg-porcelain flex items-center justify-center">
        <div className="text-center space-y-4 max-w-sm px-4">
          <AlertTriangle className="w-12 h-12 text-[#B91C1C] mx-auto" />
          <p className="text-sm text-muted">{error || "Could not load test"}</p>
          <Button variant="secondary" onClick={() => router.push("/tasks")}>
            Back to Tests
          </Button>
        </div>
      </div>
    );
  }

  const isWriting = task.type === "writing";
  const timeLimit = task.writing?.timeLimit || 1200;

  return (
    <>
      <div className="fixed inset-0 z-[100] bg-porcelain flex flex-col">
        <header className="h-14 bg-white border-b border-line px-4 flex items-center justify-between shrink-0">
          <button onClick={() => setExitOpen(true)} className="w-10 h-10 rounded-xl hover:bg-mist flex items-center justify-center transition-colors" aria-label="Exit">
            <X className="w-5 h-5 text-ink" />
          </button>
          {isWriting ? (
            <Timer initialSeconds={timeLimit} onTimeUp={handleTimeUp} />
          ) : (
            <span className="font-display text-lg font-bold text-ink truncate max-w-[50%]">
              {task.title || "Reading Test"}
            </span>
          )}
          <div className="text-xs font-semibold text-muted">
            {isWriting ? "Writing" : "Reading"}
          </div>
        </header>

        {isWriting ? (
          <WritingView task={task} submission={submission} onComplete={handleComplete} submitRef={submitRef} />
        ) : (
          <ReadingView task={task} submission={submission} onComplete={handleComplete} submitRef={submitRef} />
        )}
      </div>

      <ExitModal open={exitOpen} onClose={() => setExitOpen(false)} onConfirm={handleExit} />
    </>
  );
}
