import type {
  CharacterBuilderAttributes,
  CharacterBuilderBackgroundOption,
  CharacterBuilderSkillOption,
} from "../types/character-builder-types";

import {
  formatNumberModifier,
  getProficiencyBonusByLevel,
  getSkillCalculation,
} from "../utils/skills";

type CharacterSkillsStepProps = {
  skills: CharacterBuilderSkillOption[];
  selectedBackground: CharacterBuilderBackgroundOption | undefined;
  attributes: CharacterBuilderAttributes;
  selectedSkillKeys: string[];
  requiredSkillChoiceCount: number;
  characterLevel: number;
  isLoading: boolean;
  error: string | null;
  onToggleSkill: (skillKey: string) => void;
};

function normalizeCharacterLevel(level: number) {
  if (!Number.isFinite(level)) {
    return 1;
  }

  return Math.max(1, Math.min(20, Math.trunc(level)));
}

export function CharacterSkillsStep({
  skills,
  selectedBackground,
  attributes,
  selectedSkillKeys,
  requiredSkillChoiceCount,
  characterLevel,
  isLoading,
  error,
  onToggleSkill,
}: CharacterSkillsStepProps) {
  const safeCharacterLevel = normalizeCharacterLevel(characterLevel);
  const suggestedSkillKeys = selectedBackground?.skillKeys ?? [];
  const selectedCount = selectedSkillKeys.length;
  const isComplete = selectedCount >= requiredSkillChoiceCount;
  const hasReachedSkillLimit = selectedCount >= requiredSkillChoiceCount;
  const proficiencyBonus = getProficiencyBonusByLevel(safeCharacterLevel);

  if (isLoading) {
    return (
      <div className="mt-5 rounded-2xl border border-forge-gold/20 bg-black/20 p-5 text-sm font-bold text-zinc-300">
        Carregando perícias...
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

  if (skills.length === 0) {
    return (
      <div className="mt-5 rounded-2xl border border-zinc-800 bg-black/20 p-5 text-sm font-bold text-zinc-400">
        Nenhuma perícia encontrada para este sistema.
      </div>
    );
  }

  return (
    <div className="mt-5 space-y-5">
      <div
        className="rounded-2xl border border-forge-gold/25 bg-[#16091d] p-4 shadow-[-5px_5px_0_rgba(0,0,0,0.28)]"
        title="Clique nas perícias para marcar seus treinamentos. O total soma o modificador do atributo-base com o bônus de proficiência quando a perícia está selecionada."
      >
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-forge-gold/80">
                Treinamentos
              </p>

              <span
                className="flex h-4 w-4 items-center justify-center rounded-full border border-zinc-700 text-[10px] font-black text-zinc-500"
                title="As perícias selecionadas recebem bônus de proficiência no total final."
                aria-label="Informação sobre perícias"
              >
                i
              </span>
            </div>

            <h3 className="mt-2 text-xl font-black text-zinc-100">
              Escolha suas perícias
            </h3>

            <p className="mt-2 max-w-3xl text-xs font-semibold leading-relaxed text-zinc-400">
              A classe define apenas a quantidade de perícias. Você pode escolher
              entre todas as perícias do sistema. O antecedente apenas destaca
              sugestões narrativas.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row xl:flex-col">
            <div
              className={[
                "min-w-28 rounded-xl border px-4 py-3",
                isComplete
                  ? "border-emerald-400/30 bg-emerald-500/10"
                  : "border-amber-400/25 bg-amber-300/10",
              ].join(" ")}
              title={`Selecionadas: ${selectedCount}. Necessárias: ${requiredSkillChoiceCount}.`}
            >
              <p className="text-[9px] font-black uppercase tracking-[0.14em] text-zinc-500">
                Selecionadas
              </p>

              <p
                className={[
                  "mt-1 text-2xl font-black leading-none",
                  isComplete ? "text-emerald-200" : "text-amber-100",
                ].join(" ")}
              >
                {selectedCount}/{requiredSkillChoiceCount}
              </p>
            </div>

            <div
              className="min-w-28 rounded-xl border border-forge-gold/30 bg-black/25 px-4 py-3"
              title={`Bônus de proficiência atual no nível ${safeCharacterLevel}: ${formatNumberModifier(
                proficiencyBonus,
              )}.`}
            >
              <p className="text-[9px] font-black uppercase tracking-[0.14em] text-zinc-500">
                Proficiência
              </p>

              <p className="mt-1 text-2xl font-black leading-none text-forge-gold">
                {formatNumberModifier(proficiencyBonus)}
              </p>
            </div>
          </div>
        </div>

        {selectedBackground ? (
          <div
            className="mt-4 rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-100"
            title={`Antecedente selecionado: ${selectedBackground.name}. As perícias destacadas são apenas sugestões.`}
          >
            Antecedente selecionado: {selectedBackground.name}. Perícias em
            verde são sugestões, não escolhas automáticas.
          </div>
        ) : (
          <div
            className="mt-4 rounded-xl border border-amber-400/25 bg-amber-300/10 px-4 py-3 text-sm font-bold text-amber-100"
            title="Escolha um antecedente para ver sugestões narrativas."
          >
            Sem antecedente selecionado.
          </div>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-1 xl:grid-cols-2">
        {skills.map((skill) => {
          const isSuggestedByBackground = suggestedSkillKeys.includes(
            skill.key,
          );

          const isSelected = selectedSkillKeys.includes(skill.key);
          const isDisabledByLimit = hasReachedSkillLimit && !isSelected;

          const skillCalculation = getSkillCalculation({
            attributes,
            statKey: skill.stat.key,
            isProficient: isSelected,
            level: safeCharacterLevel,
          });

          return (
            <button
              key={skill.id}
              type="button"
              disabled={isDisabledByLimit}
              onClick={() => {
                if (!isDisabledByLimit) {
                  onToggleSkill(skill.key);
                }
              }}
              className={[
                "rounded-2xl border p-4 text-left transition shadow-[-4px_4px_0_rgba(0,0,0,0.25)]",
                isDisabledByLimit
                  ? "cursor-not-allowed border-zinc-900 bg-zinc-950/30 opacity-45"
                  : isSelected
                    ? "border-forge-gold bg-forge-gold/10"
                    : isSuggestedByBackground
                      ? "border-emerald-400/45 bg-emerald-500/10"
                      : "border-zinc-800 bg-zinc-950/50 hover:border-forge-gold/40 hover:bg-forge-gold/5",
              ].join(" ")}
              title={
                isDisabledByLimit
                  ? `Limite de ${requiredSkillChoiceCount} perícias atingido. Desmarque uma perícia para escolher outra.`
                  : skill.description
                    ? `${skill.name}: ${skill.description}`
                    : `${skill.name}. Usa ${skill.stat.name} como atributo-base.`
              }
            >
              <div className="space-y-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p
                      className="text-[10px] font-black uppercase tracking-[0.22em] text-forge-gold/80"
                      title={`Atributo-base: ${skill.stat.name}`}
                    >
                      {skill.stat.shortName}
                    </p>

                    {skill.description ? (
                      <span
                        className="flex h-4 w-4 items-center justify-center rounded-full border border-zinc-700 text-[10px] font-black text-zinc-500"
                        title={skill.description}
                        aria-label={`Informação sobre ${skill.name}`}
                      >
                        i
                      </span>
                    ) : null}

                    {isSuggestedByBackground ? (
                      <span
                        className="rounded-full border border-emerald-400/50 bg-emerald-500/20 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-emerald-200"
                        title="Sugerida pelo antecedente selecionado"
                      >
                        Sugerida
                      </span>
                    ) : null}

                    {isSelected ? (
                      <span
                        className="rounded-full border border-forge-gold/60 bg-forge-gold/20 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-forge-gold"
                        title="Perícia selecionada"
                      >
                        Selecionada
                      </span>
                    ) : null}
                  </div>

                  <h4
                    className="mt-2 text-[15px] font-black leading-tight text-zinc-100"
                    title={skill.name}
                  >
                    {skill.name}
                  </h4>
                </div>

                <div
                  className="rounded-xl border border-forge-gold/30 bg-black/35 px-4 py-3"
                  title={`Cálculo: ${skill.stat.shortName} ${skillCalculation.formattedAttributeModifier} + Proficiência ${skillCalculation.formattedProficiencyBonus} = Total ${skillCalculation.formattedTotal}.`}
                >
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-zinc-500">
                        Base
                      </p>
                      <p className="mt-1 text-sm font-black leading-none text-zinc-100">
                        {skill.stat.shortName}
                      </p>
                    </div>

                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-zinc-500">
                        Mod.
                      </p>
                      <p className="mt-1 text-sm font-black leading-none text-zinc-100">
                        {skillCalculation.formattedAttributeModifier}
                      </p>
                    </div>

                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-zinc-500">
                        Prof.
                      </p>
                      <p
                        className={[
                          "mt-1 text-sm font-black leading-none",
                          isSelected ? "text-emerald-200" : "text-zinc-600",
                        ].join(" ")}
                      >
                        {skillCalculation.formattedProficiencyBonus}
                      </p>
                    </div>

                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-zinc-500">
                        Total
                      </p>
                      <p
                        className={[
                          "mt-1 text-base font-black leading-none",
                          isSelected ? "text-forge-gold" : "text-zinc-400",
                        ].join(" ")}
                      >
                        {skillCalculation.formattedTotal}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}