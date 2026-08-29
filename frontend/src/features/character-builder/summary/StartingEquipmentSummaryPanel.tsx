import type {
  CharacterBuilderDraft,
  CharacterBuilderOptions,
} from "../types/character-builder-types";

import {
  getStartingEquipmentItemsFromDraft,
  getStartingGoldFromDraft,
} from "../utils/equipment";

type StartingEquipmentSummaryPanelProps = {
  draft: CharacterBuilderDraft;
  options: CharacterBuilderOptions;
};

export function StartingEquipmentSummaryPanel({
  draft,
  options,
}: StartingEquipmentSummaryPanelProps) {
  const startingItems = getStartingEquipmentItemsFromDraft(draft, options);
  const startingGold = getStartingGoldFromDraft(draft, options);

  return (
    <section
      className="rounded-2xl border border-forge-gold/25 bg-[#140719] p-4"
      title="Resumo do inventário inicial que será salvo na ficha."
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-forge-gold">
            Inventário inicial
          </p>

          <p className="mt-1 text-xs font-bold text-zinc-500">
            {startingGold} moedas
          </p>
        </div>

        <span className="rounded-full border border-forge-gold/30 bg-forge-gold/10 px-3 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-forge-gold">
          {startingItems.length} itens
        </span>
      </div>

      <div className="mt-4 space-y-2">
        {startingItems.length > 0 ? (
          startingItems.slice(0, 5).map((item) => (
            <div
              key={`${item.source}-${item.key}`}
              className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 py-2"
              title={`${item.key} x${item.quantity}`}
            >
              <div className="min-w-0">
                <p className="truncate text-xs font-black text-zinc-100">
                  {item.key}
                </p>

                <p className="mt-1 text-[9px] font-black uppercase tracking-[0.18em] text-zinc-500">
                  {item.source === "background" ? "Antecedente" : "Classe"}
                </p>
              </div>

              <span className="rounded-full bg-zinc-800 px-2 py-1 text-[10px] font-black text-zinc-200">
                x{item.quantity}
              </span>
            </div>
          ))
        ) : (
          <p className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 py-3 text-xs font-bold leading-relaxed text-zinc-500">
            Nenhum item inicial. O personagem começou com moedas ou ainda não
            tem pacote definido.
          </p>
        )}

        {startingItems.length > 5 ? (
          <p className="text-xs font-bold text-zinc-500">
            +{startingItems.length - 5} itens no inventário inicial.
          </p>
        ) : null}
      </div>
    </section>
  );
}