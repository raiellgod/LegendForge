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
  isLoading: boolean;
  error: string | null;
  onToggleSpell: (spellKey: string) => void;
};

type SpellTypeFilter = "all" | "cantrips" | "spells";

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

function CharacterSpellCard({
  spell,
  isSelected,
  onToggleSpell,
}: {
  spell: CharacterBuilderSpellOption;
  isSelected: boolean;
  onToggleSpell: (spellKey: string) => void;
}) {
  const spellTitle = getSpellTitle(spell);
  const componentsText =
    spell.components.length > 0 ? spell.components.join(", ") : "—";

  return (
    <button
      type="button"
      onClick={() => onToggleSpell(spell.key)}
      className={[
        "w-full rounded-2xl border p-4 text-left shadow-[-4px_4px_0_rgba(0,0,0,0.25)] transition hover:-translate-y-0.5",
        isSelected
          ? "border-forge-gold bg-forge-gold/10"
          : "border-zinc-800 bg-zinc-950/50 hover:border-forge-gold/50 hover:bg-forge-purple/15",
      ].join(" ")}
      title={spellTitle}
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
  isLoading,
  error,
  onToggleSpell,
}: CharacterSpellsStepProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<SpellTypeFilter>("all");
  const [schoolFilter, setSchoolFilter] = useState("all");

  const spellSchools = useMemo(() => {
    return Array.from(new Set(spells.map((spell) => spell.school))).sort(
      (a, b) => a.localeCompare(b),
    );
  }, [spells]);

  const filteredSpells = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return spells.filter((spell) => {
      const matchesType = filterSpellByType(spell, typeFilter);
      const matchesSchool =
        schoolFilter === "all" || spell.school === schoolFilter;
      const matchesSearch =
        normalizedSearch.length === 0 ||
        getSpellSearchContent(spell).includes(normalizedSearch);

      return matchesType && matchesSchool && matchesSearch;
    });
  }, [schoolFilter, searchTerm, spells, typeFilter]);

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

  const totalCantrips = spells.filter(isCantrip).length;
  const totalLeveledSpells = spells.filter(isLeveledSpell).length;
  const selectedClassName = selectedClass?.name ?? "classe não selecionada";

  const selectedSpells = spells.filter((spell) =>
    selectedSpellKeys.includes(spell.key),
  );

  const selectedCantrips = selectedSpells.filter(isCantrip);
  const selectedLeveledSpells = selectedSpells.filter(isLeveledSpell);
  const hasSelectedSpells = selectedSpells.length > 0;

  const hasActiveFilters =
    searchTerm.trim().length > 0 ||
    typeFilter !== "all" ||
    schoolFilter !== "all";

  const temporaryValidationTitle = hasSelectedSpells
    ? "Seleção preparada"
    : "Etapa opcional por enquanto";

  const temporaryValidationDescription = hasSelectedSpells
    ? `Você marcou ${selectedCantrips.length} truque(s) e ${selectedLeveledSpells.length} magia(s). Ao atualizar o rascunho, essas escolhas são gravadas na ficha.`
    : "Nenhuma magia foi escolhida. A etapa continua liberada porque ainda não temos a progressão real por classe.";

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
        <div
          className="rounded-2xl border border-forge-gold/25 bg-[#16091d] p-4 shadow-[-5px_5px_0_rgba(0,0,0,0.28)]"
          title="Nesta etapa, truques e magias já aparecem separados. A seleção já pode ser persistida no rascunho; limites por classe e nível entram em uma etapa futura."
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-xs font-black uppercase tracking-[0.28em] text-forge-gold/80">
                  Grimório inicial
                </p>

                <span
                  className="flex h-4 w-4 items-center justify-center rounded-full border border-zinc-700 text-[10px] font-black text-zinc-500"
                  title="Truques são magias de nível 0. Magias são poderes de nível 1 ou maior. Seleção por classe vem em breve."
                  aria-label="Informação sobre magias"
                >
                  i
                </span>
              </div>

              <h3 className="mt-2 text-xl font-black text-zinc-100">
                Truques e magias do sistema
              </h3>

              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-300">
                Por enquanto esta lista mostra as magias do sistema. O filtro
                real por classe e a progressão de truques/magias por nível
                entram em uma etapa futura.
              </p>
            </div>
          </div>

          <p
            className="mt-4 rounded-xl border border-amber-400/20 bg-amber-300/10 px-3 py-2 text-xs font-bold text-amber-100"
            title="Mais tarde, esta etapa deve mostrar apenas magias que a classe selecionada pode aprender/conjurar."
          >
            Classe atual: {selectedClassName}. Filtro por classe: em breve.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <div
            className="rounded-2xl border border-forge-gold/30 bg-black/25 p-4"
            title={`Total de truques disponíveis no sistema atual: ${totalCantrips}.`}
          >
            <p className="text-[9px] font-black uppercase tracking-[0.14em] text-zinc-500">
              Truques disponíveis
            </p>

            <p className="mt-2 text-2xl font-black leading-none text-forge-gold">
              {totalCantrips}
            </p>
          </div>

          <div
            className="rounded-2xl border border-purple-300/30 bg-purple-500/10 p-4"
            title={`Total de magias disponíveis no sistema atual: ${totalLeveledSpells}.`}
          >
            <p className="text-[9px] font-black uppercase tracking-[0.14em] text-zinc-500">
              Magias disponíveis
            </p>

            <p className="mt-2 text-2xl font-black leading-none text-purple-200">
              {totalLeveledSpells}
            </p>
          </div>

          <div
            className="rounded-2xl border border-forge-gold/30 bg-forge-gold/10 p-4"
            title={`Truques escolhidos: ${selectedCantrips.length}. Limites por classe virão depois.`}
          >
            <p className="text-[9px] font-black uppercase tracking-[0.14em] text-zinc-500">
              Truques escolhidos
            </p>

            <p className="mt-2 text-2xl font-black leading-none text-forge-gold">
              {selectedCantrips.length}
            </p>
          </div>

          <div
            className="rounded-2xl border border-purple-300/30 bg-purple-500/10 p-4"
            title={`Magias escolhidas: ${selectedLeveledSpells.length}. Limites por classe virão depois.`}
          >
            <p className="text-[9px] font-black uppercase tracking-[0.14em] text-zinc-500">
              Magias escolhidas
            </p>

            <p className="mt-2 text-2xl font-black leading-none text-purple-200">
              {selectedLeveledSpells.length}
            </p>
          </div>
        </div>

        <div
          className={[
            "rounded-2xl border px-4 py-3 shadow-[-4px_4px_0_rgba(0,0,0,0.22)]",
            hasSelectedSpells
              ? "border-emerald-400/30 bg-emerald-500/10"
              : "border-zinc-700 bg-black/25",
          ].join(" ")}
          title="Validação temporária: esta etapa ainda não bloqueia avanço por quantidade de magias. Os limites reais virão da classe e do nível em uma etapa futura."
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">
                  Validação temporária
                </p>

                <span
                  className="flex h-4 w-4 items-center justify-center rounded-full border border-zinc-700 text-[10px] font-black text-zinc-500"
                  title="A etapa de Magias continua opcional por enquanto. Depois, a classe vai informar quantos truques e magias podem ser escolhidos por nível."
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
                  {selectedCantrips.length}
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
                  {selectedLeveledSpells.length}
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
            title={`Os filtros atuais exibem ${filteredSpells.length} de ${spells.length} opções totais. Truques visíveis: ${filteredCantrips.length}. Magias visíveis: ${filteredLeveledSpells.length}.`}
          >
            Exibindo {filteredSpells.length} de {spells.length} opção
            {spells.length === 1 ? "" : "ões"}.
            {hasActiveFilters
              ? " Limpe os filtros para ver todas as magias."
              : " Use os filtros para reduzir a lista quando ela crescer."}
          </p>
        </div>
      </div>

      {filteredSpells.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-black/20 p-5 text-sm font-bold text-zinc-400">
          Nenhuma magia encontrada com os filtros atuais.
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
            {filteredCantrips.map((spell) => (
              <CharacterSpellCard
                key={spell.id}
                spell={spell}
                isSelected={selectedSpellKeys.includes(spell.key)}
                onToggleSpell={onToggleSpell}
              />
            ))}
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
            {spellsByLevel[level]?.map((spell) => (
              <CharacterSpellCard
                key={spell.id}
                spell={spell}
                isSelected={selectedSpellKeys.includes(spell.key)}
                onToggleSpell={onToggleSpell}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}