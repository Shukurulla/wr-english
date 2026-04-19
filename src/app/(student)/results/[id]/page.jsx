"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  ArrowLeft,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { useSubmission } from "@/lib/api-hooks";
import { ComplaintModal } from "@/components/ui/complaint-modal";

export default function ResultDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [complaintOpen, setComplaintOpen] = useState(false);

  const { data: submission, isLoading, error } = useSubmission(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="text-center py-12 text-muted">
        Failed to load result.
        <br />
        <Button variant="secondary" className="mt-4" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  const task = submission.taskId || {};
  const isReading = submission.type === "reading";

  const score = submission.totalScore ?? 0;
  const maxScore = task.maxScore ?? 20;

  let correctCount = 0;
  let totalQuestions = 0;
  let answers = [];
  let incorrectQuestions = [];

  if (isReading && submission.reading?.answers) {
    answers = submission.reading.answers;
    totalQuestions = answers.length;
    correctCount = answers.filter((a) => a.isCorrect).length;
    incorrectQuestions = answers
      .map((a, i) => (!a.isCorrect ? i + 1 : null))
      .filter((n) => n !== null);
  }

  const writingEval = submission.writing?.aiEvaluation;
  const aiFeedback = writingEval?.feedback || submission.reading?.feedback || null;

  const complaintResult = {
    submissionId: submission._id,
    name: task.title || "Task",
    type: submission.type,
    score: score,
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-8">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          aria-label="Back"
          className="w-10 h-10 rounded-xl border border-line bg-white flex items-center justify-center hover:bg-mist transition-colors"
        >
          <ArrowLeft className="w-4.5 h-4.5 text-ink" />
        </button>
        <h1 className="text-xl font-bold text-ink tracking-tight">Result</h1>
      </div>

      <div className="bg-ink rounded-2xl p-8 text-center text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_top_right,_rgba(4,120,87,0.2)_0%,_transparent_70%)]" />

        <div className="relative z-10">
          <p className="text-white/50 text-sm font-medium uppercase tracking-wide">
            Overall Score
          </p>
          <p className="text-[80px] leading-none font-display font-bold text-[#34D399] mt-2">
            {score.toFixed(1)}
          </p>
          <p className="text-white/60 text-sm mt-2">
            out of {maxScore.toFixed(1)}
          </p>
          <p className="text-white/80 text-base font-medium mt-4">{task.title}</p>
        </div>
      </div>

      {isReading && totalQuestions > 0 && (
        <div className="bg-white border border-line rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-base font-bold text-ink">Questions Breakdown</h2>
            <span className="text-sm text-muted">
              Correct:{" "}
              <span className="font-semibold text-ink">
                {correctCount} / {totalQuestions}
              </span>
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {answers.map((answer, i) => (
              <div
                key={i}
                className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-semibold ${
                  answer.isCorrect
                    ? "bg-[#ECFDF5] text-accent"
                    : "bg-[#FEF2F2] text-[#B91C1C]"
                }`}
                title={`Your answer: ${answer.studentAnswer}`}
              >
                {i + 1}
              </div>
            ))}
          </div>

          {incorrectQuestions.length > 0 && (
            <p className="text-sm text-muted">
              Incorrect questions: {incorrectQuestions.join(", ")}
            </p>
          )}
        </div>
      )}

      {aiFeedback && (
        <div className="bg-white border border-line rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-accent" />
            </div>
            <h2 className="text-base font-bold text-ink">AI Feedback</h2>
          </div>
          <p className="text-sm text-muted whitespace-pre-line leading-relaxed">
            {aiFeedback}
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <Button
          variant="secondary"
          size="lg"
          className="flex-1 text-[#B91C1C] hover:bg-[#FEF2F2] hover:border-[#B91C1C]/30"
          icon={AlertCircle}
          onClick={() => setComplaintOpen(true)}
        >
          Complaint
        </Button>
        <Button
          variant="secondary"
          size="lg"
          className="flex-1"
          onClick={() => router.push("/results")}
        >
          Back to Results
        </Button>
      </div>

      <ComplaintModal
        open={complaintOpen}
        onClose={() => setComplaintOpen(false)}
        result={complaintResult}
      />
    </div>
  );
}
