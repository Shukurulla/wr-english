const criteriaLabels = {
  taskResponse: "Task Response",
  coherenceCohesion: "Coherence & Cohesion",
  lexicalResource: "Lexical Resource",
  grammaticalRangeAccuracy: "Grammatical Range & Accuracy",
};

const BAND_LABELS_SEM1 = { 0.1: "Very Limited", 0.2: "Limited", 0.3: "Moderate", 0.4: "Good", 0.5: "Strong" };
const BAND_LABELS_SEM2 = { 0.2: "Very Limited", 0.4: "Limited", 0.6: "Moderate", 0.8: "Good", 1.0: "Strong" };

function getBandLabel(band, maxScore) {
  const labels = maxScore <= 0.5 ? BAND_LABELS_SEM1 : BAND_LABELS_SEM2;
  return labels[band] || "";
}

export function WritingResult({ submission }) {
  const ai = submission.writing?.aiEvaluation;
  if (!ai) return <p className="text-muted">AI baholash hali mavjud emas.</p>;

  const maxScore = submission.taskId?.maxScore || 0.5;
  const bandLabel = getBandLabel(ai.band, maxScore);

  return (
    <div className="space-y-5">
      {/* Score hero */}
      <div className="bg-ink dark:bg-zinc-800 text-porcelain rounded-3xl p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(4,120,87,0.35),transparent_60%)]" />
        <div className="relative">
          <p className="section-label text-zinc-500 mb-0">Umumiy ball</p>
          <p className="font-display text-[78px] leading-none font-normal tracking-tighter mt-2">
            {ai.band}
          </p>
          <p className="text-xs text-zinc-400 mt-1">/ {maxScore}</p>
          {bandLabel && (
            <span className="inline-block mt-3 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-zinc-300">
              {bandLabel}
            </span>
          )}
        </div>
      </div>

      {/* Criteria breakdown */}
      <div>
        {Object.entries(ai.criteria || {}).map(([key, c], i, arr) => {
          const critPct = maxScore > 0 ? (c.band / maxScore) * 100 : 0;
          return (
            <div
              key={key}
              className={`py-4 ${i < arr.length - 1 ? "border-b border-line" : ""}`}
            >
              <div className="flex items-end justify-between mb-1.5">
                <span className="text-[13px] font-semibold">{criteriaLabels[key] || key}</span>
                <div className="text-right">
                  <span className="font-display text-[22px] font-normal tracking-tight">
                    {c.band}
                  </span>
                  {getBandLabel(c.band, maxScore) && (
                    <span className="block text-[10px] text-muted leading-none mb-0.5">
                      {getBandLabel(c.band, maxScore)}
                    </span>
                  )}
                </div>
              </div>
              <div className="h-[3px] bg-mist rounded-full overflow-hidden mb-1.5">
                <div
                  className="h-full bg-accent rounded-full transition-all duration-500"
                  style={{ width: `${critPct}%` }}
                />
              </div>
              <p className="text-xs text-muted">{c.comment}</p>
            </div>
          );
        })}
      </div>

      {/* AI comment */}
      {ai.overallComment && (
        <div className="bg-accent-soft rounded-[14px] border border-accent/20 p-4">
          <p className="text-[11px] uppercase tracking-[1.5px] text-accent font-bold mb-1.5">
            AI xulosa
          </p>
          <p className="text-[13px] leading-relaxed text-emerald-900">
            {ai.overallComment}
          </p>
        </div>
      )}
    </div>
  );
}
