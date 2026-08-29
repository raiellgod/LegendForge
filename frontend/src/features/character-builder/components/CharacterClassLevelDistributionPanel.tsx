import type { CharacterBuilderDraft } from "@/features/character-builder/types/character-builder-types";

type CharacterClassLevelDistributionPanelProps = {
  classEntries: CharacterBuilderDraft["classEntries"];
  totalLevel: number;
  onChangeClassEntryLevel?: (
    classEntryId: string,
    nextLevel: number,
  ) => void;
  onSetPrimaryClassEntry?: (
    classEntryId: string,
  ) => void;
};

export function CharacterClassLevelDistributionPanel({
  classEntries,
  totalLevel,
  onChangeClassEntryLevel,
  onSetPrimaryClassEntry,
}: CharacterClassLevelDistributionPanelProps) {
  const orderedClassEntries = [
    ...classEntries,
  ].sort(
    (firstEntry, secondEntry) =>
      firstEntry.order - secondEntry.order,
  );

  const classEntriesTotalLevel =
    orderedClassEntries.reduce(
      (currentTotal, classEntry) =>
        currentTotal + classEntry.level,
      0,
    );

  const distributionStatus =
    orderedClassEntries.length === 0
      ? "Nenhuma classe definida"
      : classEntriesTotalLevel === totalLevel
        ? "Distribuição válida"
        : `Distribuição incompleta: ${classEntriesTotalLevel}/${totalLevel}`;

  const isDistributionValid =
    orderedClassEntries.length > 0 &&
    classEntriesTotalLevel === totalLevel;

  const distributionStyles =
    orderedClassEntries.length === 0
      ? {
          border: "border-white/10",
          background: "bg-black/25",
          text: "text-zinc-400",
          badge:
            "border-white/10 bg-black/20 text-zinc-500",
        }
      : isDistributionValid
        ? {
            border:
              "border-emerald-400/30",
            background:
              "bg-emerald-500/10",
            text: "text-emerald-100",
            badge:
              "border-emerald-400/30 bg-emerald-500/15 text-emerald-100",
          }
        : {
            border:
              "border-amber-400/30",
            background:
              "bg-amber-500/10",
            text: "text-amber-100",
            badge:
              "border-amber-400/30 bg-amber-500/15 text-amber-100",
          };

  return (
    <section
      className={[
        "rounded-2xl border p-4 shadow-[-4px_4px_0_rgba(0,0,0,0.22)]",
        distributionStyles.border,
        distributionStyles.background,
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-forge-gold">
            Distribuição de níveis
          </p>

          <p
            className={[
              "mt-2 text-xs font-semibold leading-relaxed",
              distributionStyles.text,
            ].join(" ")}
          >
            {distributionStatus}
          </p>
        </div>

        <span
          className={[
            "rounded-lg border px-2 py-1 text-xs font-black",
            distributionStyles.badge,
          ].join(" ")}
        >
          {classEntriesTotalLevel}/{totalLevel}
        </span>
      </div>

      <div className="mt-4 grid gap-2">
        {orderedClassEntries.length > 0 ? (
          orderedClassEntries.map(
            (classEntry) => (
              <div
                key={classEntry.id}
                className="rounded-xl border border-white/10 bg-zinc-950/50 px-3 py-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="break-words text-sm font-black text-zinc-100">
                      {classEntry.className}
                    </p>

                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span
                        className={[
                          "rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.12em]",
                          classEntry.isPrimary
                            ? "border-forge-gold/40 bg-forge-gold/15 text-forge-gold"
                            : "border-white/10 bg-black/20 text-zinc-500",
                        ].join(" ")}
                      >
                        {classEntry.isPrimary
                          ? "Classe principal"
                          : "Classe adicional"}
                      </span>

                      {orderedClassEntries.length >
                        1 &&
                      !classEntry.isPrimary &&
                      onSetPrimaryClassEntry ? (
                        <button
                          type="button"
                          onClick={() =>
                            onSetPrimaryClassEntry(
                              classEntry.id,
                            )
                          }
                          className="rounded-full border border-white/10 bg-black/20 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] text-zinc-400 transition hover:border-forge-gold/40 hover:text-forge-gold"
                          title={`Definir ${classEntry.className} como classe principal`}
                        >
                          Tornar principal
                        </button>
                      ) : null}
                    </div>
                  </div>

                  {onChangeClassEntryLevel ? (
                    <label className="w-24 shrink-0">
                      <span className="sr-only">
                        Nível de{" "}
                        {classEntry.className}
                      </span>

                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={classEntry.level}
                        onChange={(event) => {
                          const nextLevel =
                            Math.max(
                              1,
                              Math.min(
                                20,
                                Number(
                                  event.target
                                    .value,
                                ) || 1,
                              ),
                            );

                          onChangeClassEntryLevel(
                            classEntry.id,
                            nextLevel,
                          );
                        }}
                        className="h-9 w-full rounded-lg border border-forge-gold/30 bg-black/35 px-2 text-right text-xs font-black text-forge-gold outline-none transition focus:border-forge-gold"
                        title={`Nível de ${classEntry.className}`}
                      />
                    </label>
                  ) : (
                    <span className="shrink-0 text-sm font-black text-forge-gold">
                      Nível {classEntry.level}
                    </span>
                  )}
                </div>
              </div>
            ),
          )
        ) : (
          <p className="rounded-xl border border-dashed border-white/10 bg-black/20 px-3 py-2 text-xs font-bold text-zinc-500">
            Escolha uma classe para iniciar a
            distribuição.
          </p>
        )}
      </div>

      <button
        type="button"
        disabled
        className="mt-4 w-full cursor-not-allowed rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-zinc-600"
        title="Use os cards da etapa Classe para adicionar outra classe ao personagem."
      >
        + Use os cards abaixo para adicionar
        classe
      </button>
    </section>
  );
}