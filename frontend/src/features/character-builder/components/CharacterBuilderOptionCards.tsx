import type { CharacterBuilderSelectableOption } from "@/features/character-builder/types/character-builder-types";

import { CharacterBuilderInfoIcon } from "@/features/character-builder/components/CharacterBuilderInfoIcon";

type CharacterBuilderOptionCardsProps<
  TOption extends CharacterBuilderSelectableOption,
> = {
  title: string;
  description: string;
  options: TOption[];
  isLoading: boolean;
  error: string | null;
  emptyMessage: string;
  selectedId: string;
  selectedIds?: string[];
  selectedLabel?: string;
  getOptionName?: (option: TOption) => string;
  getOptionTitle?: (option: TOption) => string;
  getOptionSelectionKind?: (
    option: TOption,
  ) => "primary" | "additional" | null;
  getSelectedLabel?: (option: TOption) => string;
  onSelect: (option: TOption) => void;
};

export function CharacterBuilderOptionCards<
  TOption extends CharacterBuilderSelectableOption,
>({
  title,
  description,
  options,
  isLoading,
  error,
  emptyMessage,
  selectedId,
  selectedIds = [],
  selectedLabel = "Selecionado",
  getOptionName,
  getOptionTitle,
  getOptionSelectionKind,
  getSelectedLabel,
  onSelect,
}: CharacterBuilderOptionCardsProps<TOption>) {
  if (isLoading) {
    return (
      <div className="mt-5 rounded-2xl border border-forge-gold/20 bg-black/20 p-5 text-sm font-bold text-zinc-300">
        Carregando opções...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-5 rounded-2xl border border-red-400/30 bg-red-500/10 p-5 text-sm font-bold text-red-200">
        {error}
      </div>
    );
  }

  if (options.length === 0) {
    return (
      <div className="mt-5 rounded-2xl border border-zinc-800 bg-black/20 p-5 text-sm font-bold text-zinc-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="mt-5 space-y-4">
      <div className="flex items-center gap-2" title={description}>
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-forge-gold/80">
          {title}
        </p>

        <span
          className="flex h-4 w-4 items-center justify-center rounded-full border border-zinc-700 text-[10px] font-black text-zinc-500"
          title={description}
          aria-label={`Informação sobre ${title}`}
        >
          i
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {options.map((option) => {
          const optionSelectionKind =
            getOptionSelectionKind?.(option) ??
            (selectedId === option.id || selectedIds.includes(option.id)
              ? "primary"
              : null);

          const isSelected = Boolean(optionSelectionKind);

          const currentSelectedLabel =
            getSelectedLabel?.(option) ?? selectedLabel;

          const optionDescription =
            option.description ?? "Sem descrição cadastrada.";

          const optionName = getOptionName?.(option) ?? option.name;

          const titleText =
            getOptionTitle?.(option) ??
            `${optionName}: ${optionDescription}`;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option)}
              title={titleText}
              className={[
                "group min-h-28 rounded-2xl border p-4 text-left transition hover:-translate-y-0.5",
                optionSelectionKind === "primary"
                  ? "border-forge-gold bg-forge-gold/10 shadow-[-4px_4px_0_rgba(234,179,8,0.20)]"
                  : optionSelectionKind === "additional"
                    ? "border-zinc-500/60 bg-zinc-800/50 shadow-[-4px_4px_0_rgba(113,113,122,0.18)] hover:border-zinc-400"
                    : "border-forge-gold/15 bg-zinc-950/50 hover:border-forge-gold/70 hover:bg-forge-purple/20",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4
                      className={[
                        "text-base font-black leading-tight",
                        isSelected
                          ? "text-forge-gold"
                          : "text-zinc-100 group-hover:text-forge-gold",
                      ].join(" ")}
                      title={optionName}
                    >
                      {optionName}
                    </h4>

                    <CharacterBuilderInfoIcon
                      title={titleText}
                      ariaLabel={`Informação sobre ${optionName}`}
                    />
                  </div>
                </div>

                {isSelected ? (
                  <span
                    className={[
                      "shrink-0 rounded-full border px-2 py-1 text-[9px] font-black uppercase tracking-[0.16em]",
                      optionSelectionKind === "additional"
                        ? "border-zinc-400/50 bg-zinc-700 text-zinc-100"
                        : "border-forge-gold bg-forge-gold text-black",
                    ].join(" ")}
                    title="Opção selecionada"
                  >
                    {currentSelectedLabel}
                  </span>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}