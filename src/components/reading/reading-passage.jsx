export function ReadingPassage({ text }) {
  return (
    <article className="font-display text-sm leading-[1.55] text-ink">
      {text.split("\n").map((para, i) =>
        para.trim() ? <p key={i} className="mb-3">{para}</p> : null
      )}
    </article>
  );
}
