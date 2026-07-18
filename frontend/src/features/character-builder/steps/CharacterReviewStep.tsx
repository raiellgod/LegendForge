import { ReactNode } from "react";

import type {
  CharacterAttributeKey,
  CharacterBuilderAncestryOption,
  CharacterBuilderBackgroundOption,
  CharacterBuilderClassOption,
  CharacterBuilderDraft,
  CharacterBuilderOptions,
  CharacterBuilderFeatureOption,
  CharacterBuilderLanguageOption,
  CharacterBuilderSkillOption,
  CharacterBuilderSpellOption,
} from "../types/character-builder-types";

import { CHARACTER_ATTRIBUTE_DEFINITIONS } from "../constants/character-builder-constants";

import { formatAttributeModifier } from "../utils/attributes";

import {
  countFilledAboutFields,
  getPersonalitySummary,
  getPhysicalSummary,
} from "../utils/about";

import { getSpellLevelLabel, isCantrip, isLeveledSpell } from "../utils/spells";

import {
  formatEquipmentWeight,
  getEquipmentMainInfo,
  getStartingEquipmentItemsFromDraft,
  getStartingGoldFromDraft,
} from "../utils/equipment";

import { getSkillCalculation } from "../utils/skills";

import { CharacterReviewSection } from "../review/CharacterReviewSection";
import { CharacterReviewFact } from "../review/CharacterReviewFact";
import { CharacterReviewTextBlock } from "../review/CharacterReviewTextBlock";
import { CharacterReviewVisualIdentity } from "../review/CharacterReviewVisualIdentity";

const characterAttributeKeys = new Set<string>([
  "strength",
  "dexterity",
  "constitution",
  "intelligence",
  "wisdom",
  "charisma",
]);

function isCharacterAttributeKey(key: string): key is CharacterAttributeKey {
  return characterAttributeKeys.has(key);
}

function getAttributeSourceBonus({
  attributeKey,
  selectedAncestry,
  selectedBackground,
}: {
  attributeKey: keyof CharacterBuilderDraft["attributes"];
  selectedAncestry: CharacterBuilderAncestryOption | undefined;
  selectedBackground: CharacterBuilderBackgroundOption | undefined;
}) {
  return (
    (selectedAncestry?.attributeBonuses[attributeKey] ?? 0) +
    (selectedBackground?.attributeBonuses[attributeKey] ?? 0)
  );
}

const proficiencyLabelsByKey: Record<string, string> = {
  "simple-weapons": "Armas simples",
  "martial-weapons": "Armas marciais",
  "hand-crossbow": "Besta de mão",
  "light-crossbow": "Besta leve",
  longsword: "Espada longa",
  rapier: "Rapieira",
  shortsword: "Espada curta",
  dagger: "Adaga",
  dart: "Dardo",
  sling: "Funda",
  quarterstaff: "Bastão",
  club: "Clava",
  javelin: "Azagaia",
  mace: "Maça",
  scimitar: "Cimitarra",
  sickle: "Foice curta",
  spear: "Lança",
  "light-armor": "Proteções leves",
  "medium-armor": "Proteções médias",
  "heavy-armor": "Proteções pesadas",
  shield: "Escudos",
  "musical-instrument": "Instrumentos musicais",
  "thieves-tools": "Ferramentas de ladrão",
  "herbalism-kit": "Kit de herbalismo",
};

function formatProficiencyKey(key: string) {
  return (
    proficiencyLabelsByKey[key] ??
    key
      .split("-")
      .filter(Boolean)
      .map((part) => {
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join(" ")
  );
}

function formatReviewSignedNumber(value: number) {
  return value > 0 ? `+${value}` : String(value);
}

function normalizeReviewClassLevel(level: number) {
  if (!Number.isFinite(level)) {
    return 1;
  }

  return Math.max(1, Math.min(20, Math.trunc(level)));
}

function getApplicableReviewFeatureChoiceGroups({
  options,
  classEntries,
  ancestryId,
  backgroundId,
}: {
  options: CharacterBuilderOptions;
  classEntries: CharacterBuilderDraft["classEntries"];
  ancestryId: string | null;
  backgroundId: string | null;
}) {
  return options.featureChoiceGroups
    .filter((choiceGroup) => {
      if (
        choiceGroup.ancestryId &&
        choiceGroup.ancestryId !== ancestryId
      ) {
        return false;
      }

      if (
        choiceGroup.backgroundId &&
        choiceGroup.backgroundId !== backgroundId
      ) {
        return false;
      }

      if (
        choiceGroup.classId &&
        !classEntries.some(
          (classEntry) =>
            classEntry.classId === choiceGroup.classId,
        )
      ) {
        return false;
      }

      if (
        choiceGroup.subclassId &&
        !classEntries.some(
          (classEntry) =>
            classEntry.subclassId === choiceGroup.subclassId,
        )
      ) {
        return false;
      }

      if (choiceGroup.levelProgressionId && choiceGroup.classId) {
        const matchingClassEntry = classEntries.find(
          (classEntry) =>
            classEntry.classId === choiceGroup.classId,
        );

        if (!matchingClassEntry) {
          return false;
        }

        const characterClass = options.classes.find(
          (currentClass) =>
            currentClass.id === choiceGroup.classId,
        );

        if (!characterClass) {
          return false;
        }

        const safeClassLevel = normalizeReviewClassLevel(
          matchingClassEntry.level,
        );

        const hasAvailableProgression =
          characterClass.levelProgressions.some(
            (progression) =>
              progression.level <= safeClassLevel,
          );

        if (!hasAvailableProgression) {
          return false;
        }
      }

      return true;
    })
    .sort((firstGroup, secondGroup) => {
      return (
        firstGroup.order - secondGroup.order ||
        firstGroup.name.localeCompare(
          secondGroup.name,
          "pt-BR",
        )
      );
    });
}

function getReviewKnownSpellLimitsByLevel({
  classEntries,
  classes,
}: {
  classEntries: CharacterBuilderDraft["classEntries"];
  classes: CharacterBuilderClassOption[];
}) {
  const limitsByLevel = new Map<number, number>();

  for (const classEntry of classEntries) {
    const classOption = classes.find(
      (currentClass) => currentClass.id === classEntry.classId,
    );

    if (!classOption) {
      continue;
    }

    const safeClassLevel = normalizeReviewClassLevel(classEntry.level);

    const progression = classOption.levelProgressions.find(
      (currentProgression) => currentProgression.level === safeClassLevel,
    );

    for (const spellLimit of progression?.spellLimits ?? []) {
      limitsByLevel.set(
        spellLimit.spellLevel,
        (limitsByLevel.get(spellLimit.spellLevel) ?? 0) +
          spellLimit.spellsKnown,
      );
    }
  }

  return limitsByLevel;
}

function getReviewSelectedSpellCountsByLevel(
  spells: CharacterBuilderSpellOption[],
) {
  const countsByLevel = new Map<number, number>();

  for (const spell of spells) {
    countsByLevel.set(spell.level, (countsByLevel.get(spell.level) ?? 0) + 1);
  }

  return countsByLevel;
}

function getReviewSpellChoiceStatuses({
  limitsByLevel,
  selectedCountsByLevel,
}: {
  limitsByLevel: Map<number, number>;
  selectedCountsByLevel: Map<number, number>;
}): CharacterReviewSpellChoiceStatus[] {
  return Array.from(limitsByLevel.entries())
    .filter(([, required]) => required > 0)
    .sort(
      ([firstSpellLevel], [secondSpellLevel]) =>
        firstSpellLevel - secondSpellLevel,
    )
    .map(([spellLevel, required]) => {
      const selected = selectedCountsByLevel.get(spellLevel) ?? 0;
      const missing = Math.max(0, required - selected);

      return {
        spellLevel,
        required,
        selected,
        missing,
        isComplete: missing === 0,
      };
    });
}

type CharacterReviewSpellChoiceStatus = {
  spellLevel: number;
  required: number;
  selected: number;
  missing: number;
  isComplete: boolean;
};

type CharacterReviewFeatureChoiceStatus = {
  groupId: string;
  groupName: string;
  groupDescription: string | null;
  required: number;
  selected: number;
  missing: number;
  isComplete: boolean;
  selectedFeatureNames: string[];
};

type CharacterReviewStepProps = {
  draft: CharacterBuilderDraft;
  options: CharacterBuilderOptions;
  selectedClass: CharacterBuilderClassOption | undefined;
  selectedAncestry: CharacterBuilderAncestryOption | undefined;
  selectedBackground: CharacterBuilderBackgroundOption | undefined;
};

export function CharacterReviewStep({
  draft,
  options,
  selectedClass,
  selectedAncestry,
  selectedBackground,
}: CharacterReviewStepProps) {
  const safeCharacterLevel = Number.isFinite(draft.level)
    ? Math.max(1, Math.min(20, Math.trunc(draft.level)))
    : 1;

  const selectedSkills = draft.skillKeys
    .map((skillKey) => {
      return options.skills.find((skill) => skill.key === skillKey);
    })
    .filter((skill): skill is CharacterBuilderSkillOption => Boolean(skill));

  const selectedSpells = draft.spellKeys
    .map((spellKey) => {
      return options.spells.find((spell) => spell.key === spellKey);
    })
    .filter((spell): spell is CharacterBuilderSpellOption => Boolean(spell));

  const selectedCantrips = selectedSpells.filter(isCantrip);
  const selectedLeveledSpells = selectedSpells.filter(isLeveledSpell);

  const startingEquipmentItems = getStartingEquipmentItemsFromDraft(
    draft,
    options,
  );

  const startingGold = getStartingGoldFromDraft(draft, options);

  const aboutFieldsCount = countFilledAboutFields(draft);

  const assignedAttributesCount = CHARACTER_ATTRIBUTE_DEFINITIONS.filter(
    (attribute) => draft.attributes[attribute.key] !== null,
  ).length;

  const suggestedBackgroundSkills =
    selectedBackground?.skillKeys
      .map((skillKey) => {
        return options.skills.find((skill) => skill.key === skillKey);
      })
      .filter((skill): skill is CharacterBuilderSkillOption =>
        Boolean(skill),
      ) ?? [];

  const automaticLanguageKeys = Array.from(
    new Set([
      ...(selectedAncestry?.languageKeys ?? []),
      ...(selectedBackground?.languageKeys ?? []),
    ]),
  );

  const automaticLanguages = automaticLanguageKeys
    .map((languageKey) => {
      return options.languages.find((language) => language.key === languageKey);
    })
    .filter((language): language is CharacterBuilderLanguageOption =>
      Boolean(language),
    );

  const selectedLanguages = draft.languageKeys
    .map((languageKey) => {
      return options.languages.find((language) => language.key === languageKey);
    })
    .filter((language): language is CharacterBuilderLanguageOption =>
      Boolean(language),
    );

  const requiredLanguageChoiceCount =
    selectedBackground?.languageChoiceCount ?? 0;

  const weaponProficiencyNames =
    selectedClass?.weaponProficiencyKeys.map(formatProficiencyKey) ?? [];

  const protectionProficiencyNames =
    selectedClass?.protectionProficiencyKeys.map(formatProficiencyKey) ?? [];

  const toolProficiencyNames =
    selectedClass?.toolProficiencyKeys.map(formatProficiencyKey) ?? [];

  const orderedClassEntries = [...draft.classEntries].sort(
    (firstEntry, secondEntry) => firstEntry.order - secondEntry.order,
  );

  const reviewClassEntries =
    orderedClassEntries.length > 0
      ? orderedClassEntries
      : selectedClass
        ? [
            {
              id: "primary",
              classId: selectedClass.id,
              className: selectedClass.name,
              subclassId: null,
              subclassName: null,
              level: safeCharacterLevel,
              isPrimary: true,
              order: 0,
            },
          ]
        : [];

  const knownSpellLimitsByLevel = getReviewKnownSpellLimitsByLevel({
    classEntries: reviewClassEntries,
    classes: options.classes,
  });

  const selectedSpellCountsByLevel =
    getReviewSelectedSpellCountsByLevel(selectedSpells);

  const spellChoiceStatuses = getReviewSpellChoiceStatuses({
    limitsByLevel: knownSpellLimitsByLevel,
    selectedCountsByLevel: selectedSpellCountsByLevel,
  });

  const pendingSpellChoiceStatuses = spellChoiceStatuses.filter(
    (choiceStatus) => !choiceStatus.isComplete,
  );

  const totalRequiredKnownSpells = spellChoiceStatuses.reduce(
    (totalRequired, choiceStatus) => totalRequired + choiceStatus.required,
    0,
  );

  const totalSelectedKnownSpells = spellChoiceStatuses.reduce(
    (totalSelected, choiceStatus) =>
      totalSelected + Math.min(choiceStatus.selected, choiceStatus.required),
    0,
  );

  const totalMissingKnownSpells = pendingSpellChoiceStatuses.reduce(
    (totalMissing, choiceStatus) => totalMissing + choiceStatus.missing,
    0,
  );

  const hasKnownSpellChoices = spellChoiceStatuses.length > 0;
  const hasPendingKnownSpellChoices = pendingSpellChoiceStatuses.length > 0;

    const applicableFeatureChoiceGroups =
    getApplicableReviewFeatureChoiceGroups({
      options,
      classEntries: reviewClassEntries,
      ancestryId: selectedAncestry?.id ?? null,
      backgroundId: selectedBackground?.id ?? null,
    });

  const featureChoiceStatuses: CharacterReviewFeatureChoiceStatus[] =
    applicableFeatureChoiceGroups.map((choiceGroup) => {
      const validSelections =
        draft.featureChoiceSelections.filter((selection) => {
          if (selection.choiceGroupId !== choiceGroup.id) {
            return false;
          }

          return choiceGroup.options.some(
            (option) =>
              option.feature.id === selection.featureId,
          );
        });

      const selectedFeatureNames = validSelections
        .map((selection) => {
          return choiceGroup.options.find(
            (option) =>
              option.feature.id === selection.featureId,
          )?.feature.name;
        })
        .filter((featureName): featureName is string => {
          return Boolean(featureName);
        });

      const selected = validSelections.length;
      const missing = Math.max(
        0,
        choiceGroup.choiceCount - selected,
      );

      return {
        groupId: choiceGroup.id,
        groupName: choiceGroup.name,
        groupDescription: choiceGroup.description,
        required: choiceGroup.choiceCount,
        selected,
        missing,
        isComplete: selected === choiceGroup.choiceCount,
        selectedFeatureNames,
      };
    });

  const pendingFeatureChoiceStatuses =
    featureChoiceStatuses.filter(
      (choiceStatus) => !choiceStatus.isComplete,
    );

  const totalRequiredFeatureChoices =
    featureChoiceStatuses.reduce(
      (totalRequired, choiceStatus) =>
        totalRequired + choiceStatus.required,
      0,
    );

  const totalSelectedFeatureChoices =
    featureChoiceStatuses.reduce(
      (totalSelected, choiceStatus) =>
        totalSelected +
        Math.min(
          choiceStatus.selected,
          choiceStatus.required,
        ),
      0,
    );

  const totalMissingFeatureChoices =
    pendingFeatureChoiceStatuses.reduce(
      (totalMissing, choiceStatus) =>
        totalMissing + choiceStatus.missing,
      0,
    );

  const hasFeatureChoiceGroups =
    featureChoiceStatuses.length > 0;

  const hasPendingFeatureChoices =
    pendingFeatureChoiceStatuses.length > 0;

  const classSummaryLabel =
    reviewClassEntries.length > 0
      ? reviewClassEntries
          .map((classEntry) => `${classEntry.className} ${classEntry.level}`)
          .join(" / ")
      : (selectedClass?.name ?? draft.className) || "Não definida";

  const subclassReviewRows = reviewClassEntries.map((classEntry) => {
    const characterClass = options.classes.find(
      (currentClass) => currentClass.id === classEntry.classId,
    );

    const subclassSelectionLevel =
      characterClass?.subclassSelectionLevel ?? null;

    const hasSubclassSelectionLevel =
      typeof subclassSelectionLevel === "number";

    const isSubclassUnlocked =
      hasSubclassSelectionLevel && classEntry.level >= subclassSelectionLevel;

    const hasSubclassOptions = (characterClass?.subclasses.length ?? 0) > 0;

    const isPending =
      isSubclassUnlocked && hasSubclassOptions && !classEntry.subclassId;

    return {
      id: classEntry.id,
      className: classEntry.className,
      classLevel: classEntry.level,
      subclassSelectionLevel,
      subclassName: classEntry.subclassName,
      hasSubclassSelectionLevel,
      isSubclassUnlocked,
      hasSubclassOptions,
      isPending,
      isPrimary: classEntry.isPrimary,
    };
  });

  const pendingSubclassCount = subclassReviewRows.filter(
    (row) => row.isPending,
  ).length;

  const constitutionSourceBonus = getAttributeSourceBonus({
    attributeKey: "constitution",
    selectedAncestry,
    selectedBackground,
  });

  const constitutionBaseValue = draft.attributes.constitution;

  const constitutionFinalValue =
    typeof constitutionBaseValue === "number"
      ? constitutionBaseValue + constitutionSourceBonus
      : null;

  const constitutionModifier =
    typeof constitutionFinalValue === "number"
      ? Math.floor((constitutionFinalValue - 10) / 2)
      : 0;

  const hitPointReviewRows = reviewClassEntries.map((classEntry) => {
    const classOption = options.classes.find(
      (currentClass) => currentClass.id === classEntry.classId,
    );

    const hitDie = classOption?.hitDie ?? null;

    const hitPointsPerLevel =
      typeof hitDie === "number" && hitDie > 0
        ? Math.max(1, hitDie + constitutionModifier)
        : 0;

    const totalHitPoints = hitPointsPerLevel * classEntry.level;

    return {
      id: classEntry.id,
      className: classEntry.className,
      level: classEntry.level,
      hitDie,
      hitPointsPerLevel,
      totalHitPoints,
      formula:
        typeof hitDie === "number" && hitDie > 0
          ? `${classEntry.level} × (d${hitDie} máximo ${hitDie} ${formatReviewSignedNumber(
              constitutionModifier,
            )} CON)`
          : "Dado de vida não cadastrado",
    };
  });

  const totalInitialHitPoints = hitPointReviewRows.reduce(
    (totalHitPoints, row) => totalHitPoints + row.totalHitPoints,
    0,
  );

  const predictedClassFeatureGroups = reviewClassEntries
    .map((classEntry) => {
      const classFeatures = options.features
        .filter((feature) => {
          const isClassFeature =
            feature.classId === classEntry.classId &&
            feature.subclassId === null;

          const isSubclassFeature =
            Boolean(classEntry.subclassId) &&
            feature.subclassId === classEntry.subclassId;

          const isUnlocked =
            typeof feature.level === "number"
              ? feature.level <= classEntry.level
              : true;

          return (isClassFeature || isSubclassFeature) && isUnlocked;
        })
        .sort((firstFeature, secondFeature) => {
          const firstLevel = firstFeature.level ?? 0;
          const secondLevel = secondFeature.level ?? 0;

          if (firstLevel !== secondLevel) {
            return firstLevel - secondLevel;
          }

          if (firstFeature.order !== secondFeature.order) {
            return firstFeature.order - secondFeature.order;
          }

          return firstFeature.name.localeCompare(secondFeature.name, "pt-BR");
        });

      return {
        id: classEntry.id,
        title: `${classEntry.className} ${classEntry.level}`,
        helper: classEntry.isPrimary ? "Classe principal" : "Classe adicional",
        features: classFeatures,
      };
    })
    .filter((group) => group.features.length > 0);

  const predictedAncestryFeatures = selectedAncestry
    ? options.features
        .filter((feature) => feature.ancestryId === selectedAncestry.id)
        .sort((firstFeature, secondFeature) => {
          const firstLevel = firstFeature.level ?? 0;
          const secondLevel = secondFeature.level ?? 0;

          if (firstLevel !== secondLevel) {
            return firstLevel - secondLevel;
          }

          if (firstFeature.order !== secondFeature.order) {
            return firstFeature.order - secondFeature.order;
          }

          return firstFeature.name.localeCompare(secondFeature.name, "pt-BR");
        })
    : [];

  const hasPredictedFeatures =
    predictedClassFeatureGroups.length > 0 ||
    predictedAncestryFeatures.length > 0;

  return (
    <div className="mt-5 space-y-5">
      <section className="rounded-2xl border border-forge-gold/25 bg-gradient-to-br from-[#211027] to-black/40 p-5 shadow-[-5px_5px_0_rgba(0,0,0,0.28)]">
        <div className="p-5">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-forge-gold">
              Revisão da ficha
            </p>

            <span
              className="flex h-5 w-5 items-center justify-center rounded-full border border-zinc-700 bg-black/30 text-[10px] font-black text-zinc-500"
              title="Confira os principais dados antes de finalizar a ficha."
              aria-label="Informação sobre revisão da ficha"
            >
              i
            </span>
          </div>

          <h3 className="mt-4 max-w-2xl text-2xl font-black leading-tight text-zinc-100">
            Confira {draft.name || "o personagem"} antes de finalizar
          </h3>
        </div>
      </section>

      <CharacterReviewVisualIdentity draft={draft} />

      <CharacterReviewSection
        title="Origem e caminho"
        description="Classe, ancestralidade, antecedente e nível atual do personagem."
      >
        <div className="grid gap-3 md:grid-cols-2">
          <CharacterReviewFact label="Classes" value={classSummaryLabel} />

          <CharacterReviewFact
            label="Ancestralidade"
            value={
              (selectedAncestry?.name ?? draft.ancestryName) || "Não definida"
            }
          />

          <CharacterReviewFact
            label="Antecedente"
            value={
              (selectedBackground?.name ?? draft.backgroundName) ||
              "Não definido"
            }
          />

          <CharacterReviewFact
            label="Nível"
            value={String(safeCharacterLevel)}
          />
        </div>
      </CharacterReviewSection>

      <CharacterReviewSection
        title="Subclasses"
        description="Estado da escolha de subclasse para cada classe do personagem."
      >
        <div
          className={[
            "rounded-xl border px-4 py-3",
            pendingSubclassCount > 0
              ? "border-amber-400/30 bg-amber-500/10"
              : "border-emerald-400/30 bg-emerald-500/10",
          ].join(" ")}
        >
          <p
            className={[
              "text-[10px] font-black uppercase tracking-[0.18em]",
              pendingSubclassCount > 0 ? "text-amber-200" : "text-emerald-200",
            ].join(" ")}
          >
            Estado das escolhas
          </p>

          <p className="mt-1 text-sm font-black text-zinc-100">
            {pendingSubclassCount > 0
              ? `${pendingSubclassCount} escolha(s) de subclasse pendente(s)`
              : "Nenhuma escolha de subclasse pendente"}
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {subclassReviewRows.map((row) => {
            const statusLabel = !row.hasSubclassSelectionLevel
              ? "Sem nível configurado"
              : !row.isSubclassUnlocked
                ? `Liberada no nível ${row.subclassSelectionLevel}`
                : !row.hasSubclassOptions
                  ? "Sem subclasses cadastradas"
                  : row.isPending
                    ? "Escolha pendente"
                    : (row.subclassName ?? "Subclasse escolhida");

            const helperText = !row.hasSubclassSelectionLevel
              ? "Esta classe ainda não possui um nível de seleção de subclasse configurado."
              : !row.isSubclassUnlocked
                ? `A classe está no nível ${row.classLevel}. A escolha será liberada no nível ${row.subclassSelectionLevel}.`
                : !row.hasSubclassOptions
                  ? "A classe alcançou o nível exigido, mas não possui subclasses disponíveis no sistema."
                  : row.isPending
                    ? "Volte à etapa Classe e escolha uma subclasse antes de finalizar."
                    : `Subclasse selecionada para ${row.className}.`;

            return (
              <article
                key={row.id}
                className={[
                  "rounded-xl border p-3",
                  row.isPending
                    ? "border-amber-400/30 bg-amber-500/10"
                    : row.isSubclassUnlocked &&
                        row.hasSubclassOptions &&
                        row.subclassName
                      ? "border-emerald-400/30 bg-emerald-500/10"
                      : "border-zinc-800 bg-zinc-950/60",
                ].join(" ")}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-zinc-100">
                      {row.className} {row.classLevel}
                    </p>

                    <p className="mt-1 text-[10px] font-black uppercase tracking-[0.14em] text-zinc-500">
                      {row.isPrimary ? "Classe principal" : "Classe adicional"}
                    </p>
                  </div>

                  <span
                    className={[
                      "rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em]",
                      row.isPending
                        ? "border-amber-400/30 bg-amber-500/15 text-amber-100"
                        : row.isSubclassUnlocked &&
                            row.hasSubclassOptions &&
                            row.subclassName
                          ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-100"
                          : "border-white/10 bg-black/20 text-zinc-500",
                    ].join(" ")}
                  >
                    {statusLabel}
                  </span>
                </div>

                <p className="mt-3 text-xs font-semibold leading-relaxed text-zinc-400">
                  {helperText}
                </p>
              </article>
            );
          })}
        </div>
      </CharacterReviewSection>

      <CharacterReviewSection
        title="Atributos"
        description="Valores distribuídos e modificadores calculados."
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {CHARACTER_ATTRIBUTE_DEFINITIONS.map((attribute) => {
            const value = draft.attributes[attribute.key];
            const sourceBonus = getAttributeSourceBonus({
              attributeKey: attribute.key,
              selectedAncestry,
              selectedBackground,
            });

            const finalValue =
              typeof value === "number" ? value + sourceBonus : null;

            return (
              <div
                key={attribute.key}
                className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3"
                title={attribute.description}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-500">
                      {attribute.shortName}
                    </p>

                    <p className="mt-1 text-sm font-black text-zinc-100">
                      {attribute.name}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-black leading-none text-forge-gold">
                      {finalValue ?? "—"}
                    </p>

                    <p className="mt-1 text-xs font-bold text-zinc-400">
                      {typeof value === "number" && sourceBonus !== 0
                        ? `base ${value} ${sourceBonus > 0 ? "+" : ""}${sourceBonus}`
                        : formatAttributeModifier(value)}
                    </p>

                    {typeof finalValue === "number" && sourceBonus !== 0 ? (
                      <p className="mt-1 text-xs font-bold text-zinc-500">
                        Mod. {formatAttributeModifier(finalValue)}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-xs font-bold text-zinc-500">
          {assignedAttributesCount}/6 atributos preenchidos.
        </p>
      </CharacterReviewSection>

      <CharacterReviewSection
        title="PV inicial previsto"
        description="Cálculo de pontos de vida usando o dado máximo de cada classe e o modificador de Constituição."
      >
        <div className="rounded-xl border border-forge-gold/25 bg-forge-gold/10 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-forge-gold">
            Total previsto
          </p>

          <p className="mt-1 text-2xl font-black text-zinc-100">
            {totalInitialHitPoints} PV
          </p>
        </div>
      </CharacterReviewSection>

      <CharacterReviewSection
        title="Features previstas"
        description="Recursos que devem aparecer na ficha final a partir das classes, subclasses e ancestralidade escolhidas."
      >
        {hasPredictedFeatures ? (
          <div className="space-y-4">
            {predictedClassFeatureGroups.map((group) => (
              <section
                key={group.id}
                className="rounded-xl border border-zinc-800 bg-black/20 p-3"
              >
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-forge-gold">
                    {group.title}
                  </p>

                  <p className="mt-1 text-xs font-bold text-zinc-500">
                    {group.helper}
                  </p>
                </div>

                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {group.features.map((feature) => (
                    <CharacterReviewFeatureCard
                      key={feature.id}
                      feature={feature}
                    />
                  ))}
                </div>
              </section>
            ))}

            {predictedAncestryFeatures.length > 0 ? (
              <section className="rounded-xl border border-zinc-800 bg-black/20 p-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-forge-gold">
                    Traços de ancestralidade
                  </p>

                  <p className="mt-1 text-xs font-bold text-zinc-500">
                    {selectedAncestry?.name ?? "Ancestralidade"}
                  </p>
                </div>

                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {predictedAncestryFeatures.map((feature) => (
                    <CharacterReviewFeatureCard
                      key={feature.id}
                      feature={feature}
                    />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        ) : (
          <CharacterReviewEmptyText>
            Nenhuma feature prevista para as escolhas atuais.
          </CharacterReviewEmptyText>
        )}
      </CharacterReviewSection>

            <CharacterReviewSection
        title="Escolhas de features"
        description="Estilos, técnicas e recursos opcionais que exigem uma decisão do jogador."
      >
        <div
          className={[
            "rounded-xl border px-4 py-3",
            !hasFeatureChoiceGroups
              ? "border-zinc-800 bg-zinc-950/50"
              : hasPendingFeatureChoices
                ? "border-amber-400/30 bg-amber-500/10"
                : "border-emerald-400/30 bg-emerald-500/10",
          ].join(" ")}
        >
          <p
            className={[
              "text-[10px] font-black uppercase tracking-[0.18em]",
              !hasFeatureChoiceGroups
                ? "text-zinc-500"
                : hasPendingFeatureChoices
                  ? "text-amber-200"
                  : "text-emerald-200",
            ].join(" ")}
          >
            Estado das escolhas
          </p>

          <p className="mt-1 text-sm font-black text-zinc-100">
            {!hasFeatureChoiceGroups
              ? "Esta combinação de fontes não possui escolhas opcionais de features."
              : hasPendingFeatureChoices
                ? `${totalMissingFeatureChoices} escolha(s) de feature pendente(s)`
                : "Nenhuma escolha de feature pendente"}
          </p>

          {hasFeatureChoiceGroups ? (
            <p className="mt-1 text-xs font-bold text-zinc-400">
              {totalSelectedFeatureChoices}/
              {totalRequiredFeatureChoices} escolhas preenchidas.
            </p>
          ) : null}
        </div>

        {hasFeatureChoiceGroups ? (
          <div className="grid gap-3 md:grid-cols-2">
            {featureChoiceStatuses.map((choiceStatus) => (
              <article
                key={choiceStatus.groupId}
                className={[
                  "rounded-xl border p-4",
                  choiceStatus.isComplete
                    ? "border-emerald-400/30 bg-emerald-500/10"
                    : "border-amber-400/30 bg-amber-500/10",
                ].join(" ")}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-black text-zinc-100">
                      {choiceStatus.groupName}
                    </p>

                    <p className="mt-1 text-xs font-bold leading-relaxed text-zinc-500">
                      {choiceStatus.groupDescription ??
                        "Grupo de escolhas opcionais."}
                    </p>
                  </div>

                  <span
                    className={[
                      "shrink-0 rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em]",
                      choiceStatus.isComplete
                        ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-100"
                        : "border-amber-400/30 bg-amber-500/15 text-amber-100",
                    ].join(" ")}
                  >
                    {choiceStatus.isComplete
                      ? "Completo"
                      : `Falta ${choiceStatus.missing}`}
                  </span>
                </div>

                <p className="mt-3 text-lg font-black text-zinc-100">
                  {choiceStatus.selected}/{choiceStatus.required}
                </p>

                {choiceStatus.selectedFeatureNames.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {choiceStatus.selectedFeatureNames.map(
                      (featureName) => (
                        <span
                          key={featureName}
                          className="rounded-full border border-forge-gold/30 bg-forge-gold/10 px-3 py-1 text-xs font-black text-forge-gold"
                        >
                          {featureName}
                        </span>
                      ),
                    )}
                  </div>
                ) : (
                  <p className="mt-3 text-xs font-semibold leading-relaxed text-amber-100">
                    Nenhuma opção escolhida para este grupo.
                  </p>
                )}

                {!choiceStatus.isComplete ? (
                  <p className="mt-3 text-xs font-semibold leading-relaxed text-amber-100">
                    Volte à etapa Features e complete esta escolha.
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        ) : null}
      </CharacterReviewSection>

      <CharacterReviewSection
        title="Perícias"
        description="Perícias treinadas e seus atributos-base."
      >
        {selectedSkills.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {selectedSkills.map((skill) => {
              const statKey = skill.stat.key;

              if (!isCharacterAttributeKey(statKey)) {
                const calculation = getSkillCalculation({
                  attributes: draft.attributes,
                  statKey,
                  isProficient: true,
                  level: safeCharacterLevel,
                });

                return (
                  <CharacterReviewFact
                    key={skill.key}
                    label={skill.stat.shortName}
                    value={`${skill.name} ${calculation.formattedTotal}`}
                    title={`Atributo: ${skill.stat.name}. Bônus de proficiência: ${calculation.formattedProficiencyBonus}.`}
                  />
                );
              }

              const sourceBonus = getAttributeSourceBonus({
                attributeKey: statKey,
                selectedAncestry,
                selectedBackground,
              });

              const currentAttributeValue = draft.attributes[statKey];

              const skillAttributes = {
                ...draft.attributes,
                [statKey]:
                  typeof currentAttributeValue === "number"
                    ? currentAttributeValue + sourceBonus
                    : currentAttributeValue,
              };

              const calculation = getSkillCalculation({
                attributes: skillAttributes,
                statKey,
                isProficient: true,
                level: safeCharacterLevel,
              });

              return (
                <CharacterReviewFact
                  key={skill.key}
                  label={skill.stat.shortName}
                  value={`${skill.name} ${calculation.formattedTotal}`}
                  title={`Atributo: ${skill.stat.name}. Bônus de proficiência: ${calculation.formattedProficiencyBonus}.`}
                />
              );
            })}
          </div>
        ) : (
          <CharacterReviewEmptyText>
            Nenhuma perícia escolhida.
          </CharacterReviewEmptyText>
        )}
      </CharacterReviewSection>

      <CharacterReviewSection
        title="Sugestões do antecedente"
        description="O antecedente apenas destaca caminhos narrativos. Essas perícias não são aplicadas automaticamente."
      >
        {suggestedBackgroundSkills.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {suggestedBackgroundSkills.map((skill) => (
              <CharacterReviewFact
                key={skill.key}
                label={skill.stat.shortName}
                value={skill.name}
                title={`Sugerida por ${selectedBackground?.name ?? "antecedente"}. Não conta como escolha automática.`}
              />
            ))}
          </div>
        ) : (
          <CharacterReviewEmptyText>
            Nenhuma sugestão de perícia cadastrada para este antecedente.
          </CharacterReviewEmptyText>
        )}
      </CharacterReviewSection>

      <CharacterReviewSection
        title="Proficiências da classe"
        description="Armas, proteções e ferramentas concedidas pela classe escolhida."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <CharacterReviewPillList
            title="Armas"
            values={weaponProficiencyNames}
            emptyMessage="Nenhuma proficiência de arma cadastrada."
          />

          <CharacterReviewPillList
            title="Proteções"
            values={protectionProficiencyNames}
            emptyMessage="Nenhuma proficiência de proteção cadastrada."
          />

          <CharacterReviewPillList
            title="Ferramentas"
            values={toolProficiencyNames}
            emptyMessage="Nenhuma proficiência de ferramenta cadastrada."
          />
        </div>
      </CharacterReviewSection>

      <CharacterReviewSection
        title="Idiomas"
        description="Idiomas automáticos da origem e idiomas extras escolhidos."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <CharacterReviewPillList
            title="Automáticos"
            values={automaticLanguages.map((language) => language.name)}
            emptyMessage="Nenhum idioma automático cadastrado."
          />

          <CharacterReviewPillList
            title={`Escolhas extras (${selectedLanguages.length}/${requiredLanguageChoiceCount})`}
            values={selectedLanguages.map((language) => language.name)}
            emptyMessage={
              requiredLanguageChoiceCount > 0
                ? "Nenhum idioma extra escolhido."
                : "Este antecedente não concede escolhas extras."
            }
          />
        </div>
      </CharacterReviewSection>

      <CharacterReviewSection
        title="Magias"
        description="Truques e magias conhecidas selecionadas para o personagem."
      >
        <div
          className={[
            "rounded-xl border px-4 py-3",
            !hasKnownSpellChoices
              ? "border-zinc-800 bg-zinc-950/50"
              : hasPendingKnownSpellChoices
                ? "border-amber-400/30 bg-amber-500/10"
                : "border-emerald-400/30 bg-emerald-500/10",
          ].join(" ")}
        >
          <p
            className={[
              "text-[10px] font-black uppercase tracking-[0.18em]",
              !hasKnownSpellChoices
                ? "text-zinc-500"
                : hasPendingKnownSpellChoices
                  ? "text-amber-200"
                  : "text-emerald-200",
            ].join(" ")}
          >
            Estado das escolhas
          </p>

          <p className="mt-1 text-sm font-black text-zinc-100">
            {!hasKnownSpellChoices
              ? "Esta combinação de classes não possui escolhas de magia conhecidas."
              : hasPendingKnownSpellChoices
                ? `${totalMissingKnownSpells} escolha(s) de magia pendente(s)`
                : "Nenhuma escolha de magia pendente"}
          </p>

          {hasKnownSpellChoices ? (
            <p className="mt-1 text-xs font-bold text-zinc-400">
              {totalSelectedKnownSpells}/{totalRequiredKnownSpells} escolhas
              preenchidas.
            </p>
          ) : null}
        </div>

        {hasKnownSpellChoices ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {spellChoiceStatuses.map((choiceStatus) => (
              <article
                key={choiceStatus.spellLevel}
                className={[
                  "rounded-xl border p-3",
                  choiceStatus.isComplete
                    ? "border-emerald-400/30 bg-emerald-500/10"
                    : "border-amber-400/30 bg-amber-500/10",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">
                      {getSpellLevelLabel(choiceStatus.spellLevel)}
                    </p>

                    <p className="mt-1 text-lg font-black text-zinc-100">
                      {choiceStatus.selected}/{choiceStatus.required}
                    </p>
                  </div>

                  <span
                    className={[
                      "rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em]",
                      choiceStatus.isComplete
                        ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-100"
                        : "border-amber-400/30 bg-amber-500/15 text-amber-100",
                    ].join(" ")}
                  >
                    {choiceStatus.isComplete
                      ? "Completo"
                      : `Falta ${choiceStatus.missing}`}
                  </span>
                </div>

                {!choiceStatus.isComplete ? (
                  <p className="mt-2 text-xs font-semibold leading-relaxed text-amber-100">
                    Volte à etapa Magias e complete as escolhas deste nível.
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <CharacterReviewSpellList
            title="Truques"
            spells={selectedCantrips}
            emptyMessage="Nenhum truque escolhido."
          />

          <CharacterReviewSpellList
            title="Magias"
            spells={selectedLeveledSpells}
            emptyMessage="Nenhuma magia escolhida."
          />
        </div>
      </CharacterReviewSection>

      <CharacterReviewSection
        title="Equipamentos iniciais"
        description="Itens e moedas que serão usados como inventário inicial."
      >
        <div className="rounded-xl border border-forge-gold/25 bg-forge-gold/10 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-forge-gold">
            Moedas iniciais
          </p>

          <p className="mt-1 text-xl font-black text-zinc-100">
            {startingGold} moedas
          </p>
        </div>

        {startingEquipmentItems.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {startingEquipmentItems.map((item) => {
              const equipmentItem = options.equipment.find(
                (currentItem) => currentItem.key === item.key,
              );

              const mainInfo = equipmentItem
                ? getEquipmentMainInfo(equipmentItem)
                : null;

              const title = equipmentItem
                ? `${equipmentItem.name}. ${
                    equipmentItem.description ?? "Sem descrição cadastrada."
                  } ${mainInfo ? `${mainInfo.label}: ${mainInfo.value}.` : ""} Peso: ${formatEquipmentWeight(
                    equipmentItem.weight,
                  )}.`
                : item.key;

              return (
                <div
                  key={`${item.source}-${item.key}`}
                  className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3"
                  title={title}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-zinc-100">
                        {equipmentItem?.name ?? item.key}
                      </p>

                      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.14em] text-zinc-500">
                        {item.source === "background"
                          ? "Antecedente"
                          : "Classe"}
                      </p>
                    </div>

                    <span className="rounded-full border border-zinc-700 bg-black/30 px-2 py-1 text-xs font-black text-zinc-200">
                      ×{item.quantity}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <CharacterReviewEmptyText>
            Nenhum item inicial. O personagem começará apenas com moedas.
          </CharacterReviewEmptyText>
        )}
      </CharacterReviewSection>

      <CharacterReviewSection
        title="Sobre"
        description="Identidade, aparência, personalidade, relações, história e notas."
      >
        <div className="grid gap-3 md:grid-cols-2">
          <CharacterReviewFact
            label="Alinhamento"
            value={draft.alignment || "Não definido"}
          />

          <CharacterReviewFact
            label="Estilo de vida"
            value={draft.lifestyle || "Não definido"}
          />

          <CharacterReviewFact
            label="Gênero"
            value={draft.gender || "Não definido"}
          />

          <CharacterReviewFact
            label="Campos preenchidos"
            value={`${aboutFieldsCount} campos`}
          />
        </div>

        <CharacterReviewTextBlock
          label="Aparência"
          value={getPhysicalSummary(draft)}
        />

        <div className="grid gap-3 md:grid-cols-2">
          <CharacterReviewTextBlock
            label="Personalidade"
            value={getPersonalitySummary(draft)}
          />

          <CharacterReviewTextBlock
            label="Vínculos"
            value={draft.bonds || "Vínculos ainda não preenchidos."}
          />

          <CharacterReviewTextBlock
            label="Ideais"
            value={draft.ideals || "Ideais ainda não preenchidos."}
          />

          <CharacterReviewTextBlock
            label="Defeitos"
            value={draft.flaws || "Defeitos ainda não preenchidos."}
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <CharacterReviewTextBlock
            label="Organizações"
            value={draft.organizations || "Organizações ainda não preenchidas."}
          />

          <CharacterReviewTextBlock
            label="Aliados"
            value={draft.allies || "Aliados ainda não preenchidos."}
          />

          <CharacterReviewTextBlock
            label="Inimigos"
            value={draft.enemies || "Inimigos ainda não preenchidos."}
          />

          <CharacterReviewTextBlock
            label="Outros vínculos"
            value={draft.otherNotes || "Outros vínculos ainda não preenchidos."}
          />
        </div>

        <CharacterReviewTextBlock
          label="História"
          value={draft.backstory || "História ainda não preenchida."}
        />

        <div className="grid gap-3 md:grid-cols-2">
          <CharacterReviewTextBlock
            label="Notas gerais"
            value={draft.notes || "Notas gerais ainda não preenchidas."}
          />

          <CharacterReviewTextBlock
            label="Notas do mestre"
            value={draft.gmNotes || "Notas do mestre ainda não preenchidas."}
          />
        </div>
      </CharacterReviewSection>
    </div>
  );
}

function CharacterReviewFeatureCard({
  feature,
}: {
  feature: CharacterBuilderFeatureOption;
}) {
  return (
    <article
      className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3"
      title={feature.description ?? "Sem descrição cadastrada."}
    >
      <p className="text-sm font-black text-forge-gold">{feature.name}</p>

      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.14em] text-zinc-500">
        {feature.level ? `Nível ${feature.level}` : "Sem nível"}
      </p>

      <p className="mt-2 whitespace-pre-wrap text-xs font-bold leading-relaxed text-zinc-400">
        {feature.description?.trim() || "Sem descrição cadastrada."}
      </p>
    </article>
  );
}

function CharacterReviewPillList({
  title,
  values,
  emptyMessage,
}: {
  title: string;
  values: string[];
  emptyMessage: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
        {title}
      </p>

      {values.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {values.map((value) => (
            <span
              key={value}
              className="rounded-full border border-forge-gold/25 bg-forge-gold/10 px-3 py-1 text-xs font-black text-forge-gold"
              title={value}
            >
              {value}
            </span>
          ))}
        </div>
      ) : (
        <CharacterReviewEmptyText>{emptyMessage}</CharacterReviewEmptyText>
      )}
    </div>
  );
}

function CharacterReviewSpellList({
  title,
  spells,
  emptyMessage,
}: {
  title: string;
  spells: CharacterBuilderSpellOption[];
  emptyMessage: string;
}) {
  if (spells.length === 0) {
    return (
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
          {title}
        </p>

        <CharacterReviewEmptyText>{emptyMessage}</CharacterReviewEmptyText>
      </div>
    );
  }

  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
        {title}
      </p>

      <div className="mt-2 space-y-2">
        {spells.map((spell) => (
          <div
            key={spell.key}
            className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3"
            title={`${spell.name}. ${spell.description ?? "Sem descrição cadastrada."}`}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-black leading-relaxed text-zinc-100">
                {spell.name}
              </p>

              <span className="shrink-0 rounded-full border border-forge-gold/25 bg-forge-gold/10 px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-forge-gold">
                {getSpellLevelLabel(spell.level)}
              </span>
            </div>

            <p className="mt-1 text-xs font-bold text-zinc-500">
              {spell.school}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CharacterReviewEmptyText({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/30 px-4 py-3 text-sm font-bold text-zinc-500">
      {children}
    </p>
  );
}
