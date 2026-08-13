import type {
  CharacterBuilderBackgroundOption,
  CharacterBuilderClassOption,
  CharacterBuilderDraft,
  CharacterBuilderEquipmentDraftItem,
  CharacterBuilderEquipmentMode,
  CharacterBuilderEquipmentOption,
} from "../types/character-builder-types";

import {
  getBackgroundStartingEquipmentPlan,
  getClassStartingEquipmentPlan,
  getEquipmentMainInfo,
  getStartingEquipmentItemsFromDraft,
  getStartingGoldFromDraft,
} from "../utils/equipment";

function formatEquipmentMainInfo(
  mainInfo: string | { label: string; value: string },
) {
  if (typeof mainInfo === "string") {
    return mainInfo;
  }

  return `${mainInfo.label}: ${mainInfo.value}`;
}

type StartingEquipmentMetricCardProps = {
  label: string;
  value: string;
  title: string;
};

function StartingEquipmentMetricCard({
  label,
  value,
  title,
}: StartingEquipmentMetricCardProps) {
  return (
    <div
      className="rounded-2xl border border-forge-gold/30 bg-black/25 p-4"
      title={title}
    >
      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-black leading-none text-forge-gold">
        {value}
      </p>
    </div>
  );
}

type StartingEquipmentChoiceCardProps = {
  title: string;
  subtitle: string;
  description: string;
  mode: CharacterBuilderEquipmentMode;
  packageLabel: string;
  goldLabel: string;
  onChangeMode: (mode: CharacterBuilderEquipmentMode) => void;
};

function StartingEquipmentChoiceCard({
  title,
  subtitle,
  description,
  mode,
  packageLabel,
  goldLabel,
  onChangeMode,
}: StartingEquipmentChoiceCardProps) {
  return (
    <section
      className="rounded-2xl border border-zinc-800 bg-black/25 p-4 shadow-[-4px_4px_0_rgba(0,0,0,0.22)]"
      title={description}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-forge-gold/80">
            {title}
          </p>

          <h4 className="mt-2 text-lg font-black text-zinc-100">{subtitle}</h4>

          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
            {description}
          </p>
        </div>

        <span className="rounded-full border border-forge-gold/30 bg-forge-gold/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-forge-gold">
          {mode === "PACKAGE" ? "Pacote" : "Moedas"}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onChangeMode("PACKAGE")}
          className={[
            "rounded-xl border px-4 py-3 text-left transition",
            mode === "PACKAGE"
              ? "border-forge-gold bg-forge-gold/10 text-forge-gold"
              : "border-zinc-800 bg-zinc-950/50 text-zinc-300 hover:border-forge-gold/40 hover:bg-forge-gold/5",
          ].join(" ")}
          title={packageLabel}
        >
          <p className="text-[9px] font-black uppercase tracking-[0.16em] text-zinc-500">
            Receber pacote
          </p>

          <p className="mt-1 text-sm font-black">{packageLabel}</p>
        </button>

        <button
          type="button"
          onClick={() => onChangeMode("GOLD")}
          className={[
            "rounded-xl border px-4 py-3 text-left transition",
            mode === "GOLD"
              ? "border-forge-gold bg-forge-gold/10 text-forge-gold"
              : "border-zinc-800 bg-zinc-950/50 text-zinc-300 hover:border-forge-gold/40 hover:bg-forge-gold/5",
          ].join(" ")}
          title={goldLabel}
        >
          <p className="text-[9px] font-black uppercase tracking-[0.16em] text-zinc-500">
            Receber moedas
          </p>

          <p className="mt-1 text-sm font-black">{goldLabel}</p>
        </button>
      </div>
    </section>
  );
}

type StartingEquipmentReceiveCardProps = {
  title: string;
  items: CharacterBuilderEquipmentDraftItem[];
  proficiencies: string[];
  equipmentByKey: Map<string, CharacterBuilderEquipmentOption>;
  isMuted: boolean;
};

function StartingEquipmentReceiveCard({
  title,
  items,
  proficiencies,
  equipmentByKey,
  isMuted,
}: StartingEquipmentReceiveCardProps) {
  return (
    <section
      className={[
        "rounded-2xl border p-4 shadow-[-4px_4px_0_rgba(0,0,0,0.22)]",
        isMuted
          ? "border-zinc-900 bg-zinc-950/30 opacity-60"
          : "border-zinc-800 bg-black/25",
      ].join(" ")}
      title={
        isMuted
          ? "Este pacote não será recebido porque a opção de moedas está selecionada."
          : "Itens e proficiências recebidos por este pacote."
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-forge-gold/80">
            {title}
          </p>

          <h4 className="mt-2 text-lg font-black text-zinc-100">
            O personagem recebe
          </h4>
        </div>

        {isMuted ? (
          <span className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-zinc-500">
            Inativo
          </span>
        ) : null}
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.16em] text-zinc-500">
            Itens
          </p>

          <div className="mt-2 space-y-2">
            {items.length > 0 ? (
              items.map((item) => {
                const equipment = equipmentByKey.get(item.key);
                const mainInfo = equipment
                  ? formatEquipmentMainInfo(getEquipmentMainInfo(equipment))
                  : "Item ainda não cadastrado no catálogo.";

                return (
                  <div
                    key={`${item.source}-${item.key}`}
                    className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 py-2"
                    title={mainInfo}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="break-words text-sm font-black text-zinc-100">
                          {equipment?.name ?? item.key}
                        </p>

                        <p className="mt-1 text-[10px] font-bold leading-relaxed text-zinc-500">
                          {mainInfo}
                        </p>
                      </div>

                      <span className="shrink-0 rounded-full bg-zinc-800 px-2 py-1 text-[10px] font-black text-zinc-200">
                        x{item.quantity}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 py-3 text-xs font-bold text-zinc-500">
                Nenhum item neste pacote.
              </p>
            )}
          </div>
        </div>

        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.16em] text-zinc-500">
            Proficiências
          </p>

          <div className="mt-2 flex flex-wrap gap-2">
            {proficiencies.length > 0 ? (
              proficiencies.map((proficiency) => (
                <span
                  key={proficiency}
                  className="rounded-full border border-forge-gold/30 bg-forge-gold/10 px-3 py-1 text-[10px] font-black text-forge-gold"
                  title={proficiency}
                >
                  {proficiency}
                </span>
              ))
            ) : (
              <span className="rounded-full border border-zinc-800 bg-zinc-950/60 px-3 py-1 text-[10px] font-black text-zinc-500">
                Nenhuma proficiência
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

type CharacterEquipmentStepProps = {
  equipment: CharacterBuilderEquipmentOption[];
  selectedClass: CharacterBuilderClassOption | undefined;
  selectedBackground: CharacterBuilderBackgroundOption | undefined;
  draft: CharacterBuilderDraft;
  isLoading: boolean;
  error: string | null;
  onChangeEquipmentMode: (
    key: "classEquipmentMode" | "backgroundEquipmentMode",
    value: CharacterBuilderEquipmentMode,
  ) => void;
};

export function CharacterEquipmentStep({
  equipment,
  selectedClass,
  selectedBackground,
  draft,
  isLoading,
  error,
  onChangeEquipmentMode,
}: CharacterEquipmentStepProps) {
  const equipmentByKey = new Map(equipment.map((item) => [item.key, item]));
  const classPlan = getClassStartingEquipmentPlan(selectedClass);
  const backgroundPlan = getBackgroundStartingEquipmentPlan(selectedBackground);

  const previewItems = getStartingEquipmentItemsFromDraft(draft, {
    classes: selectedClass ? [selectedClass] : [],
    ancestries: [],
    backgrounds: selectedBackground ? [selectedBackground] : [],
    skills: [],
    spells: [],
    features: [],
    talents: [],
    featureChoiceGroups: [],
    equipment,
    languages: [],
  });

  const previewGold = getStartingGoldFromDraft(draft, {
    classes: selectedClass ? [selectedClass] : [],
    ancestries: [],
    backgrounds: selectedBackground ? [selectedBackground] : [],
    skills: [],
    spells: [],
    features: [],
    talents: [],
    featureChoiceGroups: [],
    equipment,
    languages: [],
  });

  const missingPreviewItemKeys = previewItems
    .map((item) => item.key)
    .filter((key) => !equipmentByKey.has(key));

  const classModeLabel =
    draft.classEquipmentMode === "PACKAGE" ? "Pacote" : "Moedas";

  const backgroundModeLabel =
    draft.backgroundEquipmentMode === "PACKAGE" ? "Pacote" : "Moedas";

  if (isLoading) {
    return (
      <div className="mt-5 rounded-2xl border border-forge-gold/20 bg-black/20 p-5 text-sm font-bold text-zinc-300">
        Carregando equipamento inicial...
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

  if (!selectedClass || !selectedBackground) {
    return (
      <div className="mt-5 rounded-2xl border border-amber-400/25 bg-amber-500/10 p-5 text-sm font-bold text-amber-100">
        Escolha classe e antecedente antes de definir equipamento inicial.
      </div>
    );
  }

  return (
    <div className="mt-5 space-y-5">
      <section
        className="overflow-hidden rounded-2xl border border-forge-gold/25 bg-gradient-to-br from-[#1b0b22] via-[#130719] to-black shadow-[-6px_6px_0_rgba(0,0,0,0.32)]"
        title="Esta etapa não é uma loja nem um catálogo livre. Aqui o personagem escolhe apenas equipamento inicial concedido pela classe e pelo antecedente. Itens gerais da campanha ficam para lojas, recompensas e inventário futuro."
      >
        <div className="grid gap-5 p-5 xl:grid-cols-[minmax(0,1fr)_220px] xl:items-center">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="flex h-5 w-5 items-center justify-center rounded-full border border-zinc-700 bg-black/30 text-[10px] font-black text-zinc-500"
                title="Você pode aceitar os pacotes iniciais recomendados pela classe e pelo antecedente, ou trocar uma dessas partes por moedas iniciais."
                aria-label="Informação sobre equipamento inicial"
              >
                i
              </span>
            </div>

            <h3 className="mt-3 max-w-2xl text-2xl font-black leading-tight text-zinc-100">
              Defina como {draft.name || "o personagem"} começa a aventura
            </h3>
          </div>

          <div className="grid gap-2">
            <StartingEquipmentMetricCard
              label="Classe"
              value={classModeLabel}
              title={`Escolha atual da classe: ${classModeLabel}.`}
            />

            <StartingEquipmentMetricCard
              label="Antecedente"
              value={backgroundModeLabel}
              title={`Escolha atual do antecedente: ${backgroundModeLabel}.`}
            />

            <StartingEquipmentMetricCard
              label="Moedas iniciais"
              value={previewGold.toString()}
              title={`${previewGold} moedas iniciais serão salvas na ficha.`}
            />
          </div>
        </div>
      </section>

      <div className="grid gap-4">
        <StartingEquipmentChoiceCard
          title="Classe"
          subtitle={classPlan.label}
          description={classPlan.description}
          mode={draft.classEquipmentMode}
          packageLabel="Pacote da classe"
          goldLabel={`${classPlan.gold} moedas`}
          onChangeMode={(mode) =>
            onChangeEquipmentMode("classEquipmentMode", mode)
          }
        />

        <StartingEquipmentChoiceCard
          title="Antecedente"
          subtitle={backgroundPlan.label}
          description={backgroundPlan.description}
          mode={draft.backgroundEquipmentMode}
          packageLabel="Pacote do antecedente"
          goldLabel={`${backgroundPlan.gold} moedas`}
          onChangeMode={(mode) =>
            onChangeEquipmentMode("backgroundEquipmentMode", mode)
          }
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <StartingEquipmentReceiveCard
          title="Pacote da classe"
          items={classPlan.items}
          proficiencies={classPlan.proficiencies}
          equipmentByKey={equipmentByKey}
          isMuted={draft.classEquipmentMode === "GOLD"}
        />

        <StartingEquipmentReceiveCard
          title="Pacote do antecedente"
          items={backgroundPlan.items}
          proficiencies={backgroundPlan.proficiencies}
          equipmentByKey={equipmentByKey}
          isMuted={draft.backgroundEquipmentMode === "GOLD"}
        />
      </div>

      {missingPreviewItemKeys.length > 0 ? (
        <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-xs font-bold leading-relaxed text-red-200">
          Alguns itens do pacote não foram encontrados no sistema:{" "}
          {missingPreviewItemKeys.join(", ")}. Rode o seed atualizado antes de
          testar a persistência.
        </p>
      ) : null}
    </div>
  );
}
