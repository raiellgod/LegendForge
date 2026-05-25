type CharacterReviewFactProps = {
  label: string;
  value: string;
  title?: string;
};

export function CharacterReviewFact({
  label,
  value,
  title,
}: CharacterReviewFactProps) {
  return (
    <div
      className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3"
      title={title ?? `${label}: ${value}`}
    >
      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-black leading-tight text-zinc-100">
        {value}
      </p>
    </div>
  );
}