import { useMemo, useState } from "react";

import type {
  CharacterBuilderClassOption,
  CharacterBuilderSpellOption,
} from "../types/character-builder-types";

import {
  getCompactSpellDetail,
  getSpellLevelLabel,
  isCantrip,
  isLeveledSpell,
} from "../utils/spells";

type CharacterSpellsStepProps = {
  spells: CharacterBuilderSpellOption[];
  selectedClass: CharacterBuilderClassOption | undefined;
  selectedSpellKeys: string[];
  characterLevel: number;
  isLoading: boolean;
  error: string | null;
  onToggleSpell: (spellKey: string) => void;
};

type SpellTypeFilter = "all" | "cantrips" | "spells";

function normalizeCharacterLevel(level: number) {
  if (!Number.isFinite(level)) {
    return 1;
  }

  return Math.max(1, Math.min(20, Math.trunc(level)));
}

function getLevelProgression(
  selectedClass: CharacterBuilderClassOption | undefined,
  characterLevel: number,
) {
  const safeLevel = normalizeCharacterLevel(characterLevel);

  return selectedClass?.levelProgressions.find(
    (progression) => progression.level === safeLevel,
  );
}

function getHighestAvailableSpellLevel(
  progression:
    | CharacterBuilderClassOption["levelProgressions"][number]
    | null
    | undefined,
) {
  if (!progression) {
    return 0;
  }

  const spellSlotsByLevel = [
    progression.spellSlotsLevel1,
    progression.spellSlotsLevel2,
    progression.spellSlotsLevel3,
    progression.spellSlotsLevel4,
    progression.spellSlotsLevel5,
    progression.spellSlotsLevel6,
    progression.spellSlotsLevel7,
    progression.spellSlotsLevel8,
    progression.spellSlotsLevel9,
  ];

  for (let index = spellSlotsByLevel.length - 1; index >= 0; index -= 1) {
    if ((spellSlotsByLevel[index] ?? 0) > 0) {
      return index + 1;
    }
  }

  return 0;
}

function canUseSpellAtProgression({
  spell,
  progression,
}: {
  spell: CharacterBuilderSpellOption;
  progression:
    | CharacterBuilderClassOption["levelProgressions"][number]
    | null
    | undefined;
}) {
  if (!progression) {
    return false;
  }

  if (isCantrip(spell)) {
    return progression.cantripsKnown > 0;
  }

  const highestAvailableSpellLevel = getHighestAvailableSpellLevel(progression);

  return spell.level > 0 && spell.level <= highestAvailableSpellLevel;
}

function getSpellTitle(spell: CharacterBuilderSpellOption) {
  const description = spell.description ?? "Sem descrição cadastrada.";
  const components =
    spell.components.length > 0 ? spell.components.join(", ") : "não informado";
  const castingTime = spell.castingTime ?? "não informado";
  const range = spell.range ?? "não informado";
  const duration = spell.duration ?? "não informado";
  const ritualText = spell.isRitual ? "Sim" : "Não";
  const concentrationText = spell.requiresConcentration ? "Sim" : "Não";

  return `${spell.name}: ${description} Tipo: ${getSpellLevelLabel(
    spell.level,
  )}. Escola: ${
    spell.school
  }. Tempo de conjuração: ${castingTime}. Alcance: ${range}. Duração: ${duration}. Componentes: ${components}. Ritual: ${ritualText}. Concentração: ${concentrationText}. Features/efeitos avançados da magia: em breve. Filtro por classe e progressão de truques/magias por nível: em breve.`;
}

function getSpellSearchContent(spell: CharacterBuilderSpellOption) {
  return [
    spell.name,
    spell.description,
    spell.school,
    getSpellLevelLabel(spell.level),
    spell.castingTime,
    spell.range,
    spell.duration,
    spell.components.join(" "),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function filterSpellByType(
  spell: CharacterBuilderSpellOption,
  typeFilter: SpellTypeFilter,
) {
  if (typeFilter === "cantrips") {
    return isCantrip(spell);
  }

  if (typeFilter === "spells") {
    return isLeveledSpell(spell);
  }

  return true;
}
function getAvailableSpellsForClass({
  spells,
  selectedClass,
  characterLevel,
}: {
  spells: CharacterBuilderSpellOption[];
  selectedClass: CharacterBuilderClassOption | undefined;
  characterLevel: number;
}) {
  if (!selectedClass) {
    return [];
  }

  const safeLevel = normalizeCharacterLevel(characterLevel);
  const progression = getLevelProgression(selectedClass, safeLevel);

  const availableSpellKeys = new Set(
    selectedClass.classSpells
      .filter((classSpell) => classSpell.minimumClassLevel <= safeLevel)
      .map((classSpell) => classSpell.spellKey),
  );

  return spells.filter((spell) => {
    if (!availableSpellKeys.has(spell.key)) {
      return false;
    }

    return canUseSpellAtProgression({
      spell,
      progression,
    });
  });
}

function CharacterSpellCard({
  spell,
  isSelected,
  isDisabled,
  disabledReason,
  onToggleSpell,
}: {
  spell: CharacterBuilderSpellOption;
  isSelected: boolean;
  isDisabled: boolean;
  disabledReason: string;
  onToggleSpell: (spellKey: string) => void;
}) {
  const spellTitle = getSpellTitle(spell);
  const componentsText =
    spell.components.length > 0 ? spell.components.join(", ") : "—";

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={() => {
        if (!isDisabled) {
          onToggleSpell(spell.key);
        }
      }}
      className={[
        "w-full rounded-2xl border p-4 text-left shadow-[-4px_4px_0_rgba(0,0,0,0.25)] transition",
        isDisabled
          ? "cursor-not-allowed border-zinc-900 bg-zinc-950/30 opacity-55"
          : "hover:-translate-y-0.5",
        isSelected
          ? "border-forge-gold bg-forge-gold/10"
          : "border-zinc-800 bg-zinc-950/50 hover:border-forge-gold/50 hover:bg-forge-purple/15",
      ].join(" ")}
      title={isDisabled ? disabledReason : spellTitle}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-forge-gold/80">
              {getSpellLevelLabel(spell.level)}
            </p>

            <span
              className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-zinc-700 text-[10px] font-black text-zinc-500"
              title={spellTitle}
              aria-label={`Informação sobre ${spell.name}`}
            >
              i
            </span>

            {spell.requiresConcentration ? (
              <span
                className="rounded-full border border-purple-300/40 bg-purple-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-purple-200"
                title="Esta magia exige concentração."
              >
                Concentração
              </span>
            ) : null}

            {spell.isRitual ? (
              <span
                className="rounded-full border border-sky-300/40 bg-sky-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-sky-200"
                title="Esta magia pode ser conjurada como ritual."
              >
                Ritual
              </span>
            ) : null}

            {isSelected ? (
              <span
                className="rounded-full border border-forge-gold bg-forge-gold px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-black"
                title="Magia selecionada para o rascunho."
              >
                Selecionada
              </span>
            ) : null}
          </div>

          <h4
            className="mt-2 break-words text-[15px] font-black leading-tight text-zinc-100"
            title={spell.name}
          >
            {spell.name}
          </h4>

          <p
            className="mt-2 line-clamp-3 text-xs font-bold leading-relaxed text-zinc-400"
            title={spell.description ?? "Sem descrição cadastrada."}
          >
            {spell.description ?? "Sem descrição cadastrada."}
          </p>
        </div>
      </div>

      <div
        className="mt-4 grid gap-2 rounded-xl border border-forge-gold/25 bg-black/30 p-3 text-xs"
        title={spellTitle}
      >
        <div className="grid grid-cols-2 gap-2">
          <div className="min-w-0">
            <p className="text-[8px] font-black uppercase tracking-[0.1em] text-zinc-500">
              Escola
            </p>

            <p
              className="mt-1 break-words text-[10px] font-black leading-tight text-zinc-100"
              title={spell.school}
            >
              {spell.school}
            </p>
          </div>

          <div className="min-w-0">
            <p className="text-[8px] font-black uppercase tracking-[0.1em] text-zinc-500">
              Componentes
            </p>

            <p
              className="mt-1 break-words text-[10px] font-black leading-tight text-zinc-100"
              title={
                spell.components.length > 0
                  ? spell.components.join(", ")
                  : "Não informado"
              }
            >
              {componentsText}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 border-t border-forge-gold/10 pt-2">
          <div className="min-w-0">
            <p className="text-[8px] font-black uppercase tracking-[0.1em] text-zinc-500">
              Tempo
            </p>

            <p
              className="mt-1 break-words text-[10px] font-black leading-tight text-zinc-100"
              title={spell.castingTime ?? "Não informado"}
            >
              {getCompactSpellDetail(spell.castingTime ?? null)}
            </p>
          </div>

          <div className="min-w-0">
            <p className="text-[8px] font-black uppercase tracking-[0.1em] text-zinc-500">
              Alcance
            </p>

            <p
              className="mt-1 break-words text-[10px] font-black leading-tight text-zinc-100"
              title={spell.range ?? "Não informado"}
            >
              {getCompactSpellDetail(spell.range ?? null)}
            </p>
          </div>

          <div className="min-w-0">
            <p className="text-[8px] font-black uppercase tracking-[0.1em] text-zinc-500">
              Duração
            </p>

            <p
              className="mt-1 break-words text-[10px] font-black leading-tight text-zinc-100"
              title={spell.duration ?? "Não informado"}
            >
              {getCompactSpellDetail(spell.duration ?? null)}
            </p>
          </div>
        </div>
      </div>
    </button>
  );
}

export function CharacterSpellsStep({
  spells,
  selectedClass,
  selectedSpellKeys,
  characterLevel,
  isLoading,
  error,
  onToggleSpell,
}: CharacterSpellsStepProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<SpellTypeFilter>("all");
  const [schoolFilter, setSchoolFilter] = useState("all");

  const safeCharacterLevel = normalizeCharacterLevel(characterLevel);

  const availableSpells = useMemo(() => {
    return getAvailableSpellsForClass({
      spells,
      selectedClass,
      characterLevel: safeCharacterLevel,
    });
  }, [safeCharacterLevel, selectedClass, spells]);

  const spellSchools = useMemo(() => {
    return Array.from(
      new Set(availableSpells.map((spell) => spell.school)),
    ).sort((a, b) => a.localeCompare(b));
  }, [availableSpells]);

  const filteredSpells = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return availableSpells.filter((spell) => {
      const matchesType = filterSpellByType(spell, typeFilter);
      const matchesSchool =
        schoolFilter === "all" || spell.school === schoolFilter;
      const matchesSearch =
        normalizedSearch.length === 0 ||
        getSpellSearchContent(spell).includes(normalizedSearch);

      return matchesType && matchesSchool && matchesSearch;
    });
  }, [availableSpells, schoolFilter, searchTerm, typeFilter]);

  const filteredCantrips = filteredSpells.filter(isCantrip);
  const filteredLeveledSpells = filteredSpells.filter(isLeveledSpell);

  const spellsByLevel = filteredLeveledSpells.reduce<
    Record<number, CharacterBuilderSpellOption[]>
  >((groups, spell) => {
    groups[spell.level] = [...(groups[spell.level] ?? []), spell];

    return groups;
  }, {});

  const spellLevels = Object.keys(spellsByLevel)
    .map(Number)
    .sort((a, b) => a - b);

  const totalCantrips = availableSpells.filter(isCantrip).length;
  const totalLeveledSpells = availableSpells.filter(isLeveledSpell).length;
  const selectedClassName = selectedClass?.name ?? "classe não selecionada";
  const hasSelectedClass = Boolean(selectedClass);
  const hasAvailableSpellOptions = availableSpells.length > 0;

  const selectedSpells = availableSpells.filter((spell) =>
    selectedSpellKeys.includes(spell.key),
  );

  const unavailableSelectedSpells = spells.filter((spell) => {
    const isSelected = selectedSpellKeys.includes(spell.key);
    const isAvailable = availableSpells.some(
      (availableSpell) => availableSpell.key === spell.key,
    );

    return isSelected && !isAvailable;
  });

  const selectedCantrips = selectedSpells.filter(isCantrip);
  const selectedLeveledSpells = selectedSpells.filter(isLeveledSpell);
  const hasSelectedSpells = selectedSpells.length > 0;
  const hasUnavailableSelectedSpells = unavailableSelectedSpells.length > 0;

  const currentLevelProgression = getLevelProgression(
    selectedClass,
    safeCharacterLevel,
  );

  const cantripLimit = currentLevelProgression?.cantripsKnown ?? 0;

  const leveledSpellLimit = Math.max(
    currentLevelProgression?.spellsKnown ?? 0,
    currentLevelProgression?.spellsPrepared ?? 0,
  );

  const highestAvailableSpellLevel = getHighestAvailableSpellLevel(
    currentLevelProgression,
  );

  const hasReachedCantripLimit = selectedCantrips.length >= cantripLimit;
  const hasReachedLeveledSpellLimit =
    selectedLeveledSpells.length >= leveledSpellLimit;

  function getSpellSelectionState(spell: CharacterBuilderSpellOption) {
    const isSelected = selectedSpellKeys.includes(spell.key);

    if (isSelected) {
      return {
        isSelected,
        isDisabled: false,
        disabledReason: "",
      };
    }

    if (isCantrip(spell) && hasReachedCantripLimit) {
      return {
        isSelected,
        isDisabled: true,
        disabledReason: `Limite de ${cantripLimit} truque(s) atingido para ${selectedClassName}. Desmarque outro truque para escolher este.`,
      };
    }

    if (isLeveledSpell(spell) && hasReachedLeveledSpellLimit) {
      return {
        isSelected,
        isDisabled: true,
        disabledReason: `Limite de ${leveledSpellLimit} magia(s) atingido para ${selectedClassName}. Desmarque outra magia para escolher esta.`,
      };
    }

    return {
      isSelected,
      isDisabled: false,
      disabledReason: "",
    };
  }

  const hasActiveFilters =
    searchTerm.trim().length > 0 ||
    typeFilter !== "all" ||
    schoolFilter !== "all";

  const temporaryValidationTitle = hasSelectedSpells
    ? "Seleção dentro da progressão"
    : hasAvailableSpellOptions
      ? "Escolha as magias permitidas"
      : "Sem magias para esta classe";

  const temporaryValidationDescription = hasSelectedSpells
    ? `Você marcou ${selectedCantrips.length}/${cantripLimit} truque(s) e ${selectedLeveledSpells.length}/${leveledSpellLimit} magia(s) disponíveis para ${selectedClassName}. Ao atualizar o rascunho, essas escolhas são gravadas na ficha.`
    : hasAvailableSpellOptions
      ? `Esta classe pode escolher até ${cantripLimit} truque(s) e ${leveledSpellLimit} magia(s) no nível ${safeCharacterLevel}. Maior nível de magia permitido: ${highestAvailableSpellLevel || "nenhum"}.`
      : "A classe selecionada não possui magias disponíveis no nível inicial.";

  if (isLoading) {
    return (
      <div className="mt-5 rounded-2xl border border-forge-gold/20 bg-black/20 p-5 text-sm font-bold text-zinc-300">
        Carregando magias...
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

  if (spells.length === 0) {
    return (
      <div className="mt-5 rounded-2xl border border-zinc-800 bg-black/20 p-5 text-sm font-bold text-zinc-400">
        Nenhuma magia encontrada para este sistema.
      </div>
    );
  }

  return (
    <div className="mt-5 space-y-5">
      <div className="space-y-4">
        <div className="rounded-2xl border border-forge-gold/25 bg-[#16091d] p-4 shadow-[-5px_5px_0_rgba(0,0,0,0.28)]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-xs font-black uppercase tracking-[0.28em] text-forge-gold/80">
                  Grimório inicial
                </p>

                <span
                  className="flex h-4 w-4 items-center justify-center rounded-full border border-zinc-700 text-[10px] font-black text-zinc-500"
                  aria-label="Informação sobre magias"
                >
                  i
                </span>
              </div>

              <h3 className="mt-2 text-xl font-black text-zinc-100">
                Truques e magias da classe
              </h3>

              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-300">
                Esta lista mostra apenas as magias que a classe selecionada pode
                aprender no nível inicial. A validação de quantidade por nível
                entra no próximo passo.
              </p>
            </div>
          </div>

          <p
            className={[
              "mt-4 rounded-xl border px-3 py-2 text-xs font-bold",
              hasSelectedClass && hasAvailableSpellOptions
                ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-100"
                : "border-amber-400/20 bg-amber-300/10 text-amber-100",
            ].join(" ")}
            title="A lista de magias agora usa a relação ClassSpell cadastrada no seed."
          >
            Classe atual: {selectedClassName}.{" "}
            {hasAvailableSpellOptions
              ? `Magias disponíveis para esta classe no nível ${safeCharacterLevel}: ${availableSpells.length}.`
              : `Nenhuma magia disponível para esta classe no nível ${safeCharacterLevel}.`}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <div
            className="rounded-2xl border border-forge-gold/30 bg-black/25 p-4"
            title={`Total de truques disponíveis para ${selectedClassName}: ${totalCantrips}.`}
          >
            <p className="text-[9px] font-black uppercase tracking-[0.14em] text-zinc-500">
              Truques da classe
            </p>

            <p className="mt-2 text-2xl font-black leading-none text-forge-gold">
              {totalCantrips}
            </p>
          </div>

          <div
            className="rounded-2xl border border-purple-300/30 bg-purple-500/10 p-4"
            title={`Total de magias disponíveis para ${selectedClassName}: ${totalLeveledSpells}.`}
          >
            <p className="text-[9px] font-black uppercase tracking-[0.14em] text-zinc-500">
              Magias da classe
            </p>

            <p className="mt-2 text-2xl font-black leading-none text-purple-200">
              {totalLeveledSpells}
            </p>
          </div>

          <div
            className="rounded-2xl border border-forge-gold/30 bg-forge-gold/10 p-4"
            title={`Truques escolhidos: ${selectedCantrips.length} de ${cantripLimit} permitidos para ${selectedClassName}.`}
          >
            <p className="text-[9px] font-black uppercase tracking-[0.14em] text-zinc-500">
              Truques escolhidos
            </p>

            <p className="mt-2 text-2xl font-black leading-none text-forge-gold">
              {selectedCantrips.length}/{cantripLimit}
            </p>
          </div>

          <div
            className="rounded-2xl border border-purple-300/30 bg-purple-500/10 p-4"
            title={`Magias escolhidas: ${selectedLeveledSpells.length} de ${leveledSpellLimit} permitidas para ${selectedClassName}.`}
          >
            <p className="text-[9px] font-black uppercase tracking-[0.14em] text-zinc-500">
              Magias escolhidas
            </p>

            <p className="mt-2 text-2xl font-black leading-none text-purple-200">
              {selectedLeveledSpells.length}/{leveledSpellLimit}
            </p>
          </div>
        </div>

        {hasUnavailableSelectedSpells ? (
          <div
            className="rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-xs font-bold leading-relaxed text-amber-100 shadow-[-4px_4px_0_rgba(0,0,0,0.22)]"
            title="Estas magias estavam selecionadas no rascunho/ficha, mas não pertencem à classe atual segundo a tabela ClassSpell."
          >
            Existem {unavailableSelectedSpells.length} magia(s) selecionada(s)
            que não pertencem à classe atual:{" "}
            {unavailableSelectedSpells.map((spell) => spell.name).join(", ")}.
            Ao revisar a seleção, mantenha apenas magias disponíveis para{" "}
            {selectedClassName}.
          </div>
        ) : null}

        <div
          className={[
            "rounded-2xl border px-4 py-3 shadow-[-4px_4px_0_rgba(0,0,0,0.22)]",
            hasSelectedSpells
              ? "border-emerald-400/30 bg-emerald-500/10"
              : "border-zinc-700 bg-black/25",
          ].join(" ")}
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">
                  Validação temporária
                </p>

                <span
                  className="flex h-4 w-4 items-center justify-center rounded-full border border-zinc-700 text-[10px] font-black text-zinc-500"
                  aria-label="Informação sobre validação temporária de magias"
                >
                  i
                </span>
              </div>

              <p
                className={[
                  "mt-1 text-sm font-black",
                  hasSelectedSpells ? "text-emerald-100" : "text-zinc-200",
                ].join(" ")}
              >
                {temporaryValidationTitle}
              </p>

              <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                {temporaryValidationDescription}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:min-w-60">
              <div
                className="rounded-xl border border-forge-gold/20 bg-black/25 px-3 py-2 text-center"
                title="Quantidade de truques selecionados."
              >
                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-zinc-500">
                  Truques
                </p>

                <p className="mt-1 text-xl font-black text-forge-gold">
                  {selectedCantrips.length}/{cantripLimit}
                </p>
              </div>

              <div
                className="rounded-xl border border-purple-300/20 bg-black/25 px-3 py-2 text-center"
                title="Quantidade de magias de nível 1 ou maior selecionadas."
              >
                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-zinc-500">
                  Magias
                </p>

                <p className="mt-1 text-xl font-black text-purple-200">
                  {selectedLeveledSpells.length}/{leveledSpellLimit}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          className="rounded-2xl border border-zinc-800 bg-black/25 p-4"
          title="Use os filtros para encontrar magias por nome, tipo ou escola."
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_180px_180px]">
            <label className="block md:col-span-2 xl:col-span-1">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                Buscar
              </span>

              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar por nome, escola, nível..."
                className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950/70 px-3 py-2 text-sm font-bold text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-forge-gold/70"
              />
            </label>

            <label className="block">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                Tipo
              </span>

              <select
                value={typeFilter}
                onChange={(event) =>
                  setTypeFilter(event.target.value as SpellTypeFilter)
                }
                className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950/70 px-3 py-2 text-sm font-bold text-zinc-100 outline-none transition focus:border-forge-gold/70"
              >
                <option value="all">Todos</option>
                <option value="cantrips">Truques</option>
                <option value="spells">Magias</option>
              </select>
            </label>

            <label className="block">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                Escola
              </span>

              <select
                value={schoolFilter}
                onChange={(event) => setSchoolFilter(event.target.value)}
                className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950/70 px-3 py-2 text-sm font-bold text-zinc-100 outline-none transition focus:border-forge-gold/70"
              >
                <option value="all">Todas</option>
                {spellSchools.map((school) => (
                  <option key={school} value={school}>
                    {school}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <p
            className="mt-3 text-xs font-bold text-zinc-500"
            title={`Os filtros atuais exibem ${filteredSpells.length} de ${availableSpells.length} opções disponíveis para ${selectedClassName}. Truques visíveis: ${filteredCantrips.length}. Magias visíveis: ${filteredLeveledSpells.length}.`}
          >
            Exibindo {filteredSpells.length} de {availableSpells.length} opção
            {availableSpells.length === 1 ? "" : "ões"}.
            {hasActiveFilters
              ? " Limpe os filtros para ver todas as magias."
              : " Use os filtros para reduzir a lista quando ela crescer."}
          </p>
        </div>
      </div>

      {filteredSpells.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-black/20 p-5 text-sm font-bold text-zinc-400">
          {hasAvailableSpellOptions
            ? "Nenhuma magia encontrada com os filtros atuais."
            : `Nenhuma magia disponível para a classe selecionada no nível ${safeCharacterLevel}.`}
        </div>
      ) : null}

      {filteredCantrips.length > 0 ? (
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-forge-gold/80">
                Truques
              </p>

              <h4 className="text-lg font-black text-zinc-100">
                Magias de nível 0
              </h4>
            </div>

            <span
              className="rounded-full border border-forge-gold/30 bg-forge-gold/10 px-3 py-1 text-xs font-black text-forge-gold"
              title="Quantidade de truques visíveis depois dos filtros."
            >
              {filteredCantrips.length}
            </span>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {filteredCantrips.map((spell) => {
              const selectionState = getSpellSelectionState(spell);

              return (
                <CharacterSpellCard
                  key={spell.key}
                  spell={spell}
                  isSelected={selectionState.isSelected}
                  isDisabled={selectionState.isDisabled}
                  disabledReason={selectionState.disabledReason}
                  onToggleSpell={onToggleSpell}
                />
              );
            })}
          </div>
        </section>
      ) : null}

      {spellLevels.map((level) => (
        <section key={level} className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-purple-200">
                {getSpellLevelLabel(level)}
              </p>

              <h4 className="text-lg font-black text-zinc-100">
                Magias de {getSpellLevelLabel(level).toLowerCase()}
              </h4>
            </div>

            <span
              className="rounded-full border border-purple-300/30 bg-purple-500/10 px-3 py-1 text-xs font-black text-purple-200"
              title={`Quantidade de magias de nível ${level} visíveis depois dos filtros.`}
            >
              {spellsByLevel[level]?.length ?? 0}
            </span>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {spellsByLevel[level]?.map((spell) => {
              const selectionState = getSpellSelectionState(spell);

              return (
                <CharacterSpellCard
                  key={spell.key}
                  spell={spell}
                  isSelected={selectionState.isSelected}
                  isDisabled={selectionState.isDisabled}
                  disabledReason={selectionState.disabledReason}
                  onToggleSpell={onToggleSpell}
                />
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
