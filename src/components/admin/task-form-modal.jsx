"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useCreateTask, useUpdateTask } from "@/lib/api-hooks";
import { toast } from "@/stores/toast";

const empty = () => ({
  type: "reading",
  semester: 1,
  order: 1,
  title: "",
  topic: "",
  maxScore: 0.5,
  reading: {
    passage: "",
    questions: [
      {
        questionType: "multiple_choice",
        prompt: "",
        options: ["", "", "", ""],
        correctAnswer: "",
        points: 0.1,
      },
    ],
  },
  writing: {
    instructions: "",
    minWords: 100,
    maxWords: 250,
    timeLimit: 1200,
    rubric: { semester: 1, bands: [0, 0.25, 0.35, 0.5] },
    guidingQuestions: [""],
  },
});

export function TaskFormModal({ open, onClose, task = null }) {
  const isEdit = !!task;
  const [form, setForm] = useState(empty());
  const [errors, setErrors] = useState({});
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  useEffect(() => {
    if (open) {
      if (task) {
        setForm({
          type: task.type,
          semester: task.semester,
          order: task.order,
          title: task.title || "",
          topic: task.topic || "",
          maxScore: task.maxScore,
          reading: task.reading || empty().reading,
          writing: task.writing || empty().writing,
        });
      } else {
        setForm(empty());
      }
      setErrors({});
    }
  }, [open, task]);

  const isReading = form.type === "reading";

  const validate = () => {
    const e = {};
    if (!form.title || form.title.length < 2) e.title = "Title must be at least 2 characters";
    if (!form.order || form.order < 1) e.order = "Order must be 1 or higher";
    if (!form.maxScore || form.maxScore <= 0) e.maxScore = "Max score must be greater than 0";

    if (isReading) {
      if (!form.reading.passage || form.reading.passage.length < 10)
        e.passage = "Passage must be at least 10 characters";
      if (!form.reading.questions.length) e.questions = "At least one question required";
      form.reading.questions.forEach((q, i) => {
        if (!q.prompt) e[`q_${i}`] = `Question ${i + 1} is empty`;
      });
    } else {
      if (!form.writing.instructions || form.writing.instructions.length < 5)
        e.instructions = "Instructions must be at least 5 characters";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      toast.error("Please check the form");
      return;
    }
    const payload = {
      type: form.type,
      semester: Number(form.semester),
      order: Number(form.order),
      title: form.title,
      topic: form.topic || undefined,
      maxScore: Number(form.maxScore),
    };
    if (isReading) {
      payload.reading = {
        passage: form.reading.passage,
        questions: form.reading.questions.map((q) => ({
          questionType: q.questionType,
          prompt: q.prompt,
          options: q.questionType === "multiple_choice" ? q.options.filter(Boolean) : undefined,
          correctAnswer: q.correctAnswer,
          points: Number(q.points),
        })),
      };
    } else {
      payload.writing = {
        instructions: form.writing.instructions,
        minWords: Number(form.writing.minWords) || undefined,
        maxWords: Number(form.writing.maxWords) || undefined,
        timeLimit: Number(form.writing.timeLimit) || 1200,
        rubric: form.writing.rubric,
        guidingQuestions: form.writing.guidingQuestions.filter(Boolean),
      };
    }

    try {
      if (isEdit) {
        await updateTask.mutateAsync({ id: task._id, ...payload });
        toast.success("Task updated");
      } else {
        await createTask.mutateAsync(payload);
        toast.success("Task created");
      }
      onClose();
    } catch (err) {
      toast.error(err?.error?.message || err?.response?.data?.error?.message || "Failed to save");
    }
  };

  const addQuestion = () => {
    setForm({
      ...form,
      reading: {
        ...form.reading,
        questions: [
          ...form.reading.questions,
          {
            questionType: "multiple_choice",
            prompt: "",
            options: ["", "", "", ""],
            correctAnswer: "",
            points: 0.1,
          },
        ],
      },
    });
  };

  const removeQuestion = (idx) => {
    setForm({
      ...form,
      reading: {
        ...form.reading,
        questions: form.reading.questions.filter((_, i) => i !== idx),
      },
    });
  };

  const updateQuestion = (idx, patch) => {
    const next = [...form.reading.questions];
    next[idx] = { ...next[idx], ...patch };
    setForm({ ...form, reading: { ...form.reading, questions: next } });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Task" : "New Task"}
      size="xl"
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Type" error={errors.type}>
            <select
              value={form.type}
              disabled={isEdit}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="select-base"
            >
              <option value="reading">Reading</option>
              <option value="writing">Writing</option>
            </select>
          </FormField>
          <FormField label="Semester">
            <select
              value={form.semester}
              onChange={(e) => setForm({ ...form, semester: Number(e.target.value) })}
              className="select-base"
            >
              <option value={1}>Semester 1</option>
              <option value={2}>Semester 2</option>
            </select>
          </FormField>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <FormField label="Order" error={errors.order}>
            <input
              type="number"
              min="1"
              value={form.order}
              onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
              className="input-base"
            />
          </FormField>
          <FormField label="Max Score" error={errors.maxScore}>
            <input
              type="number"
              step="0.1"
              min="0"
              value={form.maxScore}
              onChange={(e) => setForm({ ...form, maxScore: Number(e.target.value) })}
              className="input-base"
            />
          </FormField>
          <FormField label="Topic (optional)">
            <input
              type="text"
              value={form.topic}
              onChange={(e) => setForm({ ...form, topic: e.target.value })}
              className="input-base"
              placeholder="e.g. Health"
            />
          </FormField>
        </div>

        <FormField label="Title" error={errors.title}>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="input-base"
            placeholder="Task title"
          />
        </FormField>

        {isReading ? (
          <>
            <FormField label="Reading passage" error={errors.passage}>
              <textarea
                value={form.reading.passage}
                onChange={(e) =>
                  setForm({ ...form, reading: { ...form.reading, passage: e.target.value } })
                }
                rows={8}
                className="input-base resize-y"
                placeholder="Paste the reading passage here..."
              />
            </FormField>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[11px] font-semibold uppercase tracking-[1.2px] text-faint">
                  Questions ({form.reading.questions.length})
                </label>
                <Button variant="secondary" size="sm" icon={Plus} onClick={addQuestion}>
                  Add Question
                </Button>
              </div>
              <div className="space-y-3">
                {form.reading.questions.map((q, idx) => (
                  <div key={idx} className="bg-mist rounded-xl p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-semibold text-faint uppercase">
                        Question {idx + 1}
                      </span>
                      {form.reading.questions.length > 1 && (
                        <button
                          onClick={() => removeQuestion(idx)}
                          aria-label="Remove question"
                          className="text-[#B91C1C] hover:bg-red-50 p-1 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <select
                        value={q.questionType}
                        onChange={(e) =>
                          updateQuestion(idx, {
                            questionType: e.target.value,
                            options:
                              e.target.value === "true_false_not_given"
                                ? ["True", "False", "Not Given"]
                                : q.options,
                          })
                        }
                        className="select-base"
                      >
                        <option value="multiple_choice">Multiple choice</option>
                        <option value="true_false_not_given">True / False / Not Given</option>
                        <option value="matching_headings">Matching headings</option>
                      </select>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={q.points}
                        onChange={(e) => updateQuestion(idx, { points: Number(e.target.value) })}
                        className="input-base"
                        placeholder="Points"
                      />
                    </div>
                    <textarea
                      value={q.prompt}
                      onChange={(e) => updateQuestion(idx, { prompt: e.target.value })}
                      rows={2}
                      className="input-base resize-y"
                      placeholder="Question prompt"
                    />
                    {errors[`q_${idx}`] && (
                      <p className="text-xs text-red-500">{errors[`q_${idx}`]}</p>
                    )}
                    {q.questionType === "multiple_choice" && (
                      <div className="space-y-2">
                        {q.options.map((opt, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`correct_${idx}`}
                              checked={q.correctAnswer === opt && opt !== ""}
                              onChange={() => updateQuestion(idx, { correctAnswer: opt })}
                              className="w-4 h-4"
                            />
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                const opts = [...q.options];
                                const oldVal = opts[i];
                                opts[i] = e.target.value;
                                updateQuestion(idx, {
                                  options: opts,
                                  correctAnswer:
                                    q.correctAnswer === oldVal ? e.target.value : q.correctAnswer,
                                });
                              }}
                              className="input-base flex-1"
                              placeholder={`Option ${String.fromCharCode(65 + i)}`}
                            />
                          </div>
                        ))}
                        <p className="text-[11px] text-faint">
                          Select the correct answer using the radio buttons.
                        </p>
                      </div>
                    )}
                    {q.questionType !== "multiple_choice" && (
                      <input
                        type="text"
                        value={q.correctAnswer || ""}
                        onChange={(e) => updateQuestion(idx, { correctAnswer: e.target.value })}
                        className="input-base"
                        placeholder="Correct answer"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <FormField label="Instructions" error={errors.instructions}>
              <textarea
                value={form.writing.instructions}
                onChange={(e) =>
                  setForm({ ...form, writing: { ...form.writing, instructions: e.target.value } })
                }
                rows={6}
                className="input-base resize-y"
                placeholder="Instructions shown to the student..."
              />
            </FormField>

            <div className="grid grid-cols-3 gap-3">
              <FormField label="Min words">
                <input
                  type="number"
                  min="0"
                  value={form.writing.minWords}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      writing: { ...form.writing, minWords: Number(e.target.value) },
                    })
                  }
                  className="input-base"
                />
              </FormField>
              <FormField label="Max words">
                <input
                  type="number"
                  min="0"
                  value={form.writing.maxWords}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      writing: { ...form.writing, maxWords: Number(e.target.value) },
                    })
                  }
                  className="input-base"
                />
              </FormField>
              <FormField label="Time limit (sec)">
                <input
                  type="number"
                  min="60"
                  value={form.writing.timeLimit}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      writing: { ...form.writing, timeLimit: Number(e.target.value) },
                    })
                  }
                  className="input-base"
                />
              </FormField>
            </div>

            <FormField label="Score bands (4 values, from 0 to max score)">
              <div className="grid grid-cols-4 gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <input
                    key={i}
                    type="number"
                    step="0.05"
                    min="0"
                    value={form.writing.rubric.bands[i] ?? 0}
                    onChange={(e) => {
                      const bands = [...form.writing.rubric.bands];
                      bands[i] = Number(e.target.value);
                      setForm({
                        ...form,
                        writing: {
                          ...form.writing,
                          rubric: { ...form.writing.rubric, bands },
                        },
                      });
                    }}
                    className="input-base"
                  />
                ))}
              </div>
            </FormField>
          </>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-5 border-t border-line mt-5">
        <Button variant="secondary" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={handleSubmit}
          loading={createTask.isPending || updateTask.isPending}
        >
          {isEdit ? "Save" : "Create"}
        </Button>
      </div>
    </Modal>
  );
}

function FormField({ label, error, children }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-[11px] font-semibold uppercase tracking-[1.2px] text-faint">
          {label}
        </label>
      )}
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
