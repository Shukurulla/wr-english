"use client";
import { cn } from "@/lib/utils";

export function MultipleChoice({ question, value, onChange, showResult }) {
  return (
    <div className="space-y-3">
      <p className="font-display text-lg leading-snug tracking-tight">{question.prompt}</p>
      <div className="space-y-2">
        {question.options.map((opt, i) => {
          const letter = String.fromCharCode(65 + i);
          const selected = value === letter;
          const correct = showResult && question.correctAnswer === letter;
          const wrong = showResult && selected && !correct;
          return (
            <label
              key={i}
              className={cn(
                "flex items-center justify-between p-4 rounded-[14px] border-2 cursor-pointer transition-all",
                selected && !showResult && "border-ink bg-mist",
                correct && "border-accent bg-accent-soft",
                wrong && "border-red-500 bg-red-50",
                !selected && !correct && !wrong && "border-line hover:border-faint bg-white"
              )}
            >
              <input
                type="radio"
                name={question._id}
                value={letter}
                checked={selected}
                onChange={() => onChange(letter)}
                disabled={showResult}
                className="sr-only"
              />
              <span className="text-[15px] font-medium">{opt}</span>
              {selected && !showResult && (
                <div className="w-[18px] h-[18px] rounded-full bg-ink text-white text-[11px] flex items-center justify-center font-bold">
                  ✓
                </div>
              )}
              {correct && (
                <div className="w-[18px] h-[18px] rounded-full bg-accent text-white text-[11px] flex items-center justify-center font-bold">
                  ✓
                </div>
              )}
            </label>
          );
        })}
      </div>
    </div>
  );
}

export function MatchingHeadings({ question, value, onChange }) {
  return (
    <div className="space-y-3">
      <p className="font-display text-lg leading-snug tracking-tight">{question.prompt}</p>
      <div className="space-y-2">
        {question.options.map((opt, i) => {
          const letter = String.fromCharCode(65 + i);
          const selected = value === letter;
          return (
            <button
              key={i}
              onClick={() => onChange(letter)}
              className={cn(
                "flex items-center justify-between w-full p-4 rounded-[14px] border-2 text-left transition-all",
                selected
                  ? "border-ink bg-mist"
                  : "border-line hover:border-faint bg-white"
              )}
            >
              <span className="text-[15px] font-medium">{opt}</span>
              {selected && (
                <div className="w-[18px] h-[18px] rounded-full bg-ink text-white text-[11px] flex items-center justify-center font-bold">
                  ✓
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function TrueFalseNotGiven({ question, value, onChange, showResult }) {
  const options = ["True", "False", "Not Given"];
  return (
    <div className="space-y-3">
      <p className="font-display text-lg leading-snug tracking-tight">{question.prompt}</p>
      <div className="flex flex-col gap-2">
        {options.map((opt) => {
          const selected = value === opt;
          const correct = showResult && question.correctAnswer === opt;
          const wrong = showResult && selected && !correct;
          return (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              disabled={showResult}
              className={cn(
                "p-4 rounded-[14px] border-2 text-[15px] font-medium text-left flex items-center justify-between transition-all",
                selected && !showResult && "border-ink bg-mist",
                correct && "border-accent bg-accent-soft",
                wrong && "border-red-500 bg-red-50",
                !selected && !correct && !wrong && "border-line hover:border-faint bg-white"
              )}
            >
              <span>{opt}</span>
              {selected && !showResult && (
                <div className="w-[18px] h-[18px] rounded-full bg-ink text-white text-[11px] flex items-center justify-center font-bold">
                  ✓
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
