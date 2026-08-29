import type { CharacterBuilderDraft } from "../types/character-builder-types";

import {
  countFilledAboutFields,
  getNarrativeSummary,
  getPersonalitySummary,
  getPhysicalSummary,
} from "../utils/about";

type CharacterAboutSummaryPanelProps = {
  draft: CharacterBuilderDraft;
};

export function CharacterAboutSummaryPanel({
  draft,
}: CharacterAboutSummaryPanelProps) {
  const filledAboutFields = countFilledAboutFields(draft);

  return (
    <section
      className="rounded-2xl border border-forge-gold/25 bg-[#140719] p-4"
      title="Resumo dos campos preenchidos na etapa Sobre."
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-forge-gold">
            Sobre
          </p>
        </div>

        <span className="rounded-full border border-forge-gold/30 bg-forge-gold/10 px-3 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-forge-gold">
          {filledAboutFields} campos
        </span>
      </div>

      <div className="mt-4 space-y-3">
        <div
          className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3"
          title={getNarrativeSummary(draft)}
        >
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-500">
            Identidade
          </p>

          <p className="mt-2 text-xs font-black leading-relaxed text-zinc-100">
            {getNarrativeSummary(draft)}
          </p>
        </div>

        <div
          className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3"
          title={getPhysicalSummary(draft)}
        >
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-500">
            Aparência
          </p>

          <p className="mt-2 text-xs font-black leading-relaxed text-zinc-100">
            {getPhysicalSummary(draft)}
          </p>
        </div>

        <div
          className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3"
          title={getPersonalitySummary(draft)}
        >
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-500">
            Personalidade
          </p>

          <p className="mt-2 text-xs font-black leading-relaxed text-zinc-100">
            {getPersonalitySummary(draft)}
          </p>
        </div>

        <div
          className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3"
          title={draft.backstory || "História ainda não preenchida."}
        >
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-500">
            História
          </p>

          <p className="mt-2 text-xs font-black leading-relaxed text-zinc-100">
            {draft.backstory || "Ainda sem história."}
          </p>
        </div>
      </div>
    </section>
  );
}