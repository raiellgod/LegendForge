import { ReactNode } from "react";

type CharacterReviewSectionProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function CharacterReviewSection({
  title,
  description,
  children,
}: CharacterReviewSectionProps) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-black/20 p-5 shadow-[-4px_4px_0_rgba(0,0,0,0.22)]">
      <div className="mb-4 border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2" title={description}>
          <h4 className="text-sm font-black uppercase tracking-[0.22em] text-forge-gold">
            {title}
          </h4>

          <span
            className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-zinc-700 text-[10px] font-black text-zinc-500"
            title={description}
            aria-label={`Informação sobre ${title}`}
          >
            i
          </span>
        </div>
      </div>

      <div className="space-y-3">{children}</div>
    </section>
  );
}