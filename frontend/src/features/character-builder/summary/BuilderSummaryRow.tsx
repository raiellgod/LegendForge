type BuilderSummaryRowProps = {
  label: string;
  value: string;
};

export function BuilderSummaryRow({ label, value }: BuilderSummaryRowProps) {
  return (
    <div
      className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3"
      title={`${label}: ${value}`}
    >
      <span className="text-[10px] font-black uppercase tracking-[0.24em] text-zinc-500">
        {label}
      </span>

      <span className="text-right text-sm font-black text-zinc-100">
        {value}
      </span>
    </div>
  );
}