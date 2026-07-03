import { ReactNode } from "react";

import type {
  CharacterAttributeKey,
  CharacterBuilderAncestryOption,
  CharacterBuilderBackgroundOption,
  CharacterBuilderClassOption,
  CharacterBuilderDraft,
  CharacterBuilderOptions,
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
      .filter((skill): skill is CharacterBuilderSkillOption => Boolean(skill)) ??
    [];

  const weaponProficiencyNames =
    selectedClass?.weaponProficiencyKeys.map(formatProficiencyKey) ?? [];

  const protectionProficiencyNames =
    selectedClass?.protectionProficiencyKeys.map(formatProficiencyKey) ?? [];

  const toolProficiencyNames =
    selectedClass?.toolProficiencyKeys.map(formatProficiencyKey) ?? [];

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
          <CharacterReviewFact
            label="Classe"
            value={(selectedClass?.name ?? draft.className) || "Não definida"}
          />

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
        title="Magias"
        description="Truques e magias selecionadas para o personagem."
      >
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
        description="Identidade, aparência, personalidade, história e notas."
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

        <CharacterReviewTextBlock
          label="Personalidade"
          value={getPersonalitySummary(draft)}
        />

        <CharacterReviewTextBlock
          label="História"
          value={draft.backstory || "História ainda não preenchida."}
        />
      </CharacterReviewSection>
    </div>
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
