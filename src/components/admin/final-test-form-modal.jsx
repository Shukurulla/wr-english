"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useCreateFinalTest } from "@/lib/api-hooks";
import { toast } from "@/stores/toast";

const emptyQuestion = () => ({
  prompt: "",
  options: ["", "", "", ""],
  correctAnswerIndex: 0,
});

export function FinalTestFormModal({ open, onClose }) {
  const createMutation = useCreateFinalTest();
  const [form, setForm] = useState({
    semester: 1,
    academicYear: new Date().getFullYear() + "-" + (new Date().getFullYear() + 1),
    title: "",
    totalQuestions: 20,
    pointsPerQuestion: 0.1,
    timeLimit: 1200,
    isActive: true,
    questions: [emptyQuestion()],
  });
  const [errors, setErrors] = useState({});

  const reset = () => {
    setForm({
      semester: 1,
      academicYear: new Date().getFullYear() + "-" + (new Date().getFullYear() + 1),
      title: "",
      totalQuestions: 20,
      pointsPerQuestion: 0.1,
      timeLimit: 1200,
      isActive: true,
      questions: [emptyQuestion()],
    });
    setErrors({});
  };

  const addQuestion = () => {
    setForm({ ...form, questions: [...form.questions, emptyQuestion()] });
  };

  const removeQuestion = (idx) => {
    if (form.questions.length <= 1) return;
    setForm({ ...form, questions: form.questions.filter((_, i) => i !== idx) });
  };

  const updateQuestion = (idx, patch) => {
    const next = [...form.questions];
    next[idx] = { ...next[idx], ...patch };
    setForm({ ...form, questions: next });
  };

  const validate = () => {
    const e = {};
    if (!form.title || form.title.length < 2) e.title = "Title is required";
    if (!form.academicYear || form.academicYear.length < 4) e.academicYear = "Academic year is required";
    form.questions.forEach((q, i) => {
      if (!q.prompt) e[`q${i}`] = "Question prompt is empty";
      const filled = q.options.filter(Boolean);
      if (filled.length < 2) e[`q${i}_opts`] = "At least 2 options required";
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      toast.error("Please check the form");
      return;
    }
    try {
      await createMutation.mutateAsync({
        semester: Number(form.semester),
        academicYear: form.academicYear,
        title: form.title,
        totalQuestions: Number(form.totalQuestions),
        pointsPerQuestion: Number(form.pointsPerQuestion),
        timeLimit: Number(form.timeLimit),
        isActive: form.isActive,
        questions: form.questions.map((q) => ({
          prompt: q.prompt,
          options: q.options.filter(Boolean),
          correctAnswerIndex: Number(q.correctAnswerIndex),
        })),
      });
      toast.success("Final test created");
      reset();
      onClose();
    } catch (err) {
      toast.error(err?.error?.message || err?.response?.data?.error?.message || "Failed to create");
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="New Final Test" size="xl">
      <div className="space-y-5 max-h-[70vh] overflow-y-auto">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[1.2px] text-faint mb-1.5">
              Semester
            </label>
            <select
              value={form.semester}
              onChange={(e) => setForm({ ...form, semester: Number(e.target.value) })}
              className="select-base"
            >
              <option value={1}>Semester 1</option>
              <option value={2}>Semester 2</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[1.2px] text-faint mb-1.5">
              Academic Year
            </label>
            <input
              type="text"
              value={form.academicYear}
              onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
              className="input-base"
              placeholder="2025-2026"
            />
            {errors.academicYear && (
              <p className="text-xs text-red-500 mt-1">{errors.academicYear}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-[1.2px] text-faint mb-1.5">
            Test Title
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="input-base"
            placeholder="e.g. Semester 1 Final Test"
          />
          {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[1.2px] text-faint mb-1.5">
              Total questions
            </label>
            <input
              type="number"
              min="1"
              value={form.totalQuestions}
              onChange={(e) => setForm({ ...form, totalQuestions: Number(e.target.value) })}
              className="input-base"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[1.2px] text-faint mb-1.5">
              Points per question
            </label>
            <input
              type="number"
              step="0.05"
              min="0"
              value={form.pointsPerQuestion}
              onChange={(e) => setForm({ ...form, pointsPerQuestion: Number(e.target.value) })}
              className="input-base"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[1.2px] text-faint mb-1.5">
              Time limit (sec)
            </label>
            <input
              type="number"
              min="60"
              value={form.timeLimit}
              onChange={(e) => setForm({ ...form, timeLimit: Number(e.target.value) })}
              className="input-base"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-[11px] font-semibold uppercase tracking-[1.2px] text-faint">
              Questions ({form.questions.length})
            </label>
            <Button variant="secondary" size="sm" icon={Plus} onClick={addQuestion}>
              Add Question
            </Button>
          </div>
          <div className="space-y-3">
            {form.questions.map((q, idx) => (
              <div key={idx} className="bg-mist rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <span className="text-xs font-semibold text-faint uppercase">
                    Question {idx + 1}
                  </span>
                  {form.questions.length > 1 && (
                    <button
                      onClick={() => removeQuestion(idx)}
                      aria-label="Remove question"
                      className="text-[#B91C1C] hover:bg-red-50 p-1 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <textarea
                  value={q.prompt}
                  onChange={(e) => updateQuestion(idx, { prompt: e.target.value })}
                  rows={2}
                  className="input-base resize-y"
                  placeholder="Question prompt"
                />
                {errors[`q${idx}`] && (
                  <p className="text-xs text-red-500">{errors[`q${idx}`]}</p>
                )}
                <div className="space-y-2">
                  {q.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct_${idx}`}
                        checked={q.correctAnswerIndex === i}
                        onChange={() => updateQuestion(idx, { correctAnswerIndex: i })}
                        className="w-4 h-4"
                      />
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const opts = [...q.options];
                          opts[i] = e.target.value;
                          updateQuestion(idx, { options: opts });
                        }}
                        className="input-base flex-1"
                        placeholder={`Option ${String.fromCharCode(65 + i)}`}
                      />
                    </div>
                  ))}
                </div>
                {errors[`q${idx}_opts`] && (
                  <p className="text-xs text-red-500">{errors[`q${idx}_opts`]}</p>
                )}
                <p className="text-[11px] text-faint">
                  Select the correct answer using the radio buttons.
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-5 border-t border-line mt-5">
        <Button variant="secondary" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={handleSubmit}
          loading={createMutation.isPending}
        >
          Create
        </Button>
      </div>
    </Modal>
  );
}
