"use client";

import type {
  CampaignActor,
  CreatureSheetReady,
  NpcCreatureReadyAction,
  NpcCreatureReadyAttack,
  NpcSheetReady,
} from "@/features/game-table/types/game-table-types";

type Sheet = NpcSheetReady | CreatureSheetReady;

export type NpcCreatureReadySheetRollRequest =
  | {
      kind: "check";
      author: string;
      label: string;
      modifier: number;
    }
  | {
      kind: "damage";
      author: string;
      label: string;
      expression: string;
    }
  | {
      kind: "effect";
      author: string;
      label: string;
      description: string;
    };

type NpcCreatureReadySheetViewProps = {
  actor: CampaignActor;
  sheet: Sheet;
  kind: "NPC" | "CREATURE";
  onRoll: (request: NpcCreatureReadySheetRollRequest) => void;
  onClose: () => void;
};

function getAbilityModifier(value: number) {
  return Math.floor((value - 10) / 2);
}

function formatModifier(value: number) {
  return value >= 0 ? `+${value}` : String(value);
}

function getResolvedStatValue(stat: Sheet["stats"][number]) {
  return stat.overrideValue ?? stat.baseValue + stat.bonusValue;
}

function getActionKindLabel(kind: NpcCreatureReadyAction["kind"]) {
  if (kind === "BONUS_ACTION") {
    return "Ações bônus";
  }

  if (kind === "REACTION") {
    return "Reações";
  }

  return "Ações";
}

function getAttackRange(attack: NpcCreatureReadyAttack) {
  if (attack.reach !== null) {
    return `alcance ${attack.reach} m`;
  }

  if (attack.normalRange !== null && attack.longRange !== null) {
    return `${attack.normalRange}/${attack.longRange} m`;
  }

  if (attack.normalRange !== null) {
    return `${attack.normalRange} m`;
  }

  return null;
}

export function NpcCreatureReadySheetView({
  actor,
  sheet,
  kind,
  onRoll,
  onClose,
}: NpcCreatureReadySheetViewProps) {
  const isCreature = kind === "CREATURE";
  const creatureSheet = isCreature ? (sheet as CreatureSheetReady) : null;
  const npcSheet = !isCreature ? (sheet as NpcSheetReady) : null;

  const sheetKindLabel = isCreature ? "Criatura" : "NPC";

  const dexterityStat =
    sheet.stats.find((stat) => stat.stat.key === "dexterity") ?? null;

  const initiativeBonus = dexterityStat
    ? getAbilityModifier(getResolvedStatValue(dexterityStat))
    : 0;

  function rollCheck(label: string, modifier: number) {
    onRoll({
      kind: "check",
      author: actor.name,
      label: `${actor.name} — ${label}`,
      modifier,
    });
  }

  function rollDamage(label: string, expression: string) {
    onRoll({
      kind: "damage",
      author: actor.name,
      label: `${actor.name} — ${label}`,
      expression,
    });
  }

  function publishEffect(label: string, description: string) {
    onRoll({
      kind: "effect",
      author: actor.name,
      label: `${actor.name} — ${label}`,
      description,
    });
  }

  const groupedActions = {
    ACTION: sheet.actions.filter((action) => action.kind === "ACTION"),
    BONUS_ACTION: sheet.actions.filter(
      (action) => action.kind === "BONUS_ACTION",
    ),
    REACTION: sheet.actions.filter((action) => action.kind === "REACTION"),
  };

  const defensesByKind = {
    RESISTANCE: sheet.defenses.filter(
      (defense) => defense.kind === "RESISTANCE",
    ),
    IMMUNITY: sheet.defenses.filter((defense) => defense.kind === "IMMUNITY"),
    VULNERABILITY: sheet.defenses.filter(
      (defense) => defense.kind === "VULNERABILITY",
    ),
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 px-4 py-5 backdrop-blur-sm">
      <div className="flex max-h-[94vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl border border-forge-gold/40 bg-[#120816] shadow-[-18px_18px_0_rgba(0,0,0,0.5)]">
        <header className="flex items-start justify-between gap-4 border-b border-forge-gold/25 bg-[#1a0d20] px-6 py-5">
          <div className="flex min-w-0 items-center gap-4">
            {sheet.portraitUrl || actor.portraitUrl ? (
              <div
                className="h-20 w-20 shrink-0 rounded-xl border border-forge-gold/40 bg-cover bg-center shadow-[-5px_5px_0_rgba(0,0,0,0.35)]"
                style={{
                  backgroundImage: `url(${sheet.portraitUrl ?? actor.portraitUrl})`,
                }}
                aria-hidden="true"
              />
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-forge-gold/40 bg-forge-purple/30 text-2xl font-black text-forge-gold">
                {actor.initials}
              </div>
            )}

            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/35">
                {isCreature ? "Ficha de criatura" : "Ficha de NPC"}
              </p>

              <h2 className="mt-1 truncate text-2xl font-black text-forge-gold">
                {actor.name}
              </h2>

              <p className="mt-2 text-xs font-semibold text-white/55">
                {isCreature
                  ? [
                      creatureSheet?.creatureType,
                      creatureSheet?.challengeRating
                        ? `CR ${creatureSheet.challengeRating}`
                        : null,
                      creatureSheet
                        ? `${creatureSheet.experienceReward} XP`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")
                  : [npcSheet?.role, npcSheet?.faction]
                      .filter(Boolean)
                      .join(" · ") || "NPC da campanha"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-2xl font-black text-white/40 transition hover:text-forge-gold"
            aria-label="Fechar ficha"
          >
            ×
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard label="CA" value={String(sheet.armorClass)} />
            <StatCard
              label="PV"
              value={`${sheet.hitPoints}/${sheet.maxHitPoints}`}
            />
            <StatCard label="PV temp." value={String(sheet.temporaryHp)} />
            <StatCard label="Desloc." value={`${sheet.speed} m`} />
            <StatCard label="Tamanho" value={sheet.size} />
          </section>

          <div className="mt-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-forge-gold/80">
                Testes e salvaguardas
              </p>
              <p className="mt-1 text-[10px] font-semibold text-white/30">
                Os atributos abaixo são controles de rolagem: use Teste ou Salv. diretamente na ficha.
              </p>
            </div>
          </div>

          <section className="mt-4 rounded-xl border border-forge-gold/25 bg-forge-gold/5 p-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-forge-gold">
                  Iniciativa
                </p>
                <p className="mt-1 text-xs font-semibold text-white/45">
                  Usa o modificador de Destreza desta ficha.
                </p>
              </div>

              <button
                type="button"
                onClick={() => rollCheck("Iniciativa", initiativeBonus)}
                className="rounded-lg border border-forge-gold/40 bg-forge-purple px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-forge-gold transition hover:bg-[#4d0d63]"
              >
                Rolar iniciativa {formatModifier(initiativeBonus)}
              </button>
            </div>
          </section>

          <section className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {sheet.stats.map((stat) => {
              const value = getResolvedStatValue(stat);
              const modifier = getAbilityModifier(value);
              const savingThrowModifier =
                stat.savingThrowOverride ??
                modifier + stat.savingThrowBonus;

              return (
                <div
                  key={stat.id}
                  className="rounded-xl border border-white/10 bg-black/25 px-3 py-3 text-center"
                >
                  <p className="text-[10px] font-black uppercase text-white/35">
                    {stat.stat.shortName}
                  </p>
                  <p className="mt-1 text-xl font-black text-forge-gold">
                    {value}
                  </p>
                  <p className="text-[10px] font-bold text-white/45">
                    {formatModifier(modifier)}
                    {stat.isSavingThrowProficient ? " · salv." : ""}
                  </p>

                  <div className="mt-3 grid gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        rollCheck(
                          `Teste de ${stat.stat.name}`,
                          modifier,
                        )
                      }
                      className="rounded-md border border-forge-gold/25 bg-forge-gold/5 px-2 py-1.5 text-[9px] font-black uppercase tracking-[0.08em] text-forge-gold transition hover:bg-forge-gold/10"
                    >
                      Teste
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        rollCheck(
                          `Salvaguarda de ${stat.stat.name}`,
                          savingThrowModifier,
                        )
                      }
                      className="rounded-md border border-white/10 bg-black/20 px-2 py-1.5 text-[9px] font-black uppercase tracking-[0.08em] text-white/55 transition hover:border-forge-gold/30 hover:text-forge-gold"
                    >
                      Salv. {formatModifier(savingThrowModifier)}
                    </button>
                  </div>
                </div>
              );
            })}
          </section>

          <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_360px]">
            <main className="space-y-5">
              {!isCreature &&
              (npcSheet?.ancestry ||
                npcSheet?.background ||
                (npcSheet?.classes?.length ?? 0) > 0) ? (
                <Section title="Origem e treinamento">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <TextDetail
                      label="Ancestralidade"
                      value={
                        [npcSheet?.ancestry?.name, npcSheet?.subAncestry?.name]
                          .filter(Boolean)
                          .join(" · ") || "—"
                      }
                    />
                    <TextDetail
                      label="Antecedente"
                      value={npcSheet?.background?.name ?? "—"}
                    />
                    <TextDetail
                      label="Níveis de classe"
                      value={String(
                        (npcSheet?.classes ?? []).reduce(
                          (total, entry) => total + entry.level,
                          0,
                        ) ?? 0,
                      )}
                    />
                  </div>

                  {(npcSheet?.classes?.length ?? 0) > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(npcSheet?.classes ?? []).map((classEntry) => (
                        <span
                          key={classEntry.id}
                          className="rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-[10px] font-black text-white/55"
                        >
                          {classEntry.characterClass.name} {classEntry.level}
                          {classEntry.subclass
                            ? ` · ${classEntry.subclass.name}`
                            : ""}
                          {classEntry.isPrimary ? " · principal" : ""}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </Section>
              ) : null}

              <Section title="Perícias">
                {sheet.skills.length > 0 ? (
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {sheet.skills.map((skill) => {
                      const relatedStat = sheet.stats.find(
                        (stat) => stat.stat.id === skill.skill.stat.id,
                      );
                      const relatedStatValue = relatedStat
                        ? getResolvedStatValue(relatedStat)
                        : 10;
                      const abilityModifier =
                        getAbilityModifier(relatedStatValue);
                      const skillModifier =
                        skill.overrideValue ??
                        abilityModifier + skill.bonusValue;

                      return (
                        <button
                          type="button"
                          key={skill.id}
                          onClick={() =>
                            rollCheck(
                              `Perícia: ${skill.skill.name}`,
                              skillModifier,
                            )
                          }
                          className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-left transition hover:border-forge-gold/35 hover:bg-forge-purple/20"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-xs font-black text-white/70">
                              {skill.skill.name}
                            </p>
                            <span className="text-xs font-black text-forge-gold">
                              {formatModifier(skillModifier)}
                            </span>
                          </div>
                          <p className="mt-1 text-[9px] font-bold uppercase text-white/30">
                            {skill.skill.stat.shortName}
                            {skill.expertiseLevel > 0 ? " · expertise" : ""}
                            {skill.isProficient ? " · proficiente" : ""}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyText>Nenhuma perícia especial.</EmptyText>
                )}
              </Section>

              <Section title="Traits">
                {sheet.traits.length > 0 ? (
                  <div className="space-y-3">
                    {sheet.traits.map((trait) => (
                      <TextBlock
                        key={trait.id}
                        title={trait.name}
                        text={trait.description}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyText>Nenhuma característica passiva.</EmptyText>
                )}
              </Section>

              <Section title="Ataques">
                {sheet.attacks.length > 0 ? (
                  <div className="space-y-3">
                    {sheet.attacks.map((attack) => {
                      const range = getAttackRange(attack);
                      const damage = attack.damageFormula
                        ? `${attack.damageFormula}${
                            attack.damageBonus === 0
                              ? ""
                              : ` ${attack.damageBonus > 0 ? "+" : ""}${attack.damageBonus}`
                          }${attack.damageType ? ` ${attack.damageType}` : ""}`
                        : null;

                      return (
                        <article
                          key={attack.id}
                          className="rounded-xl border border-red-400/15 bg-red-950/10 p-4"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <h4 className="text-sm font-black text-red-100">
                                {attack.name}
                              </h4>
                              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.08em] text-white/35">
                                {attack.attackType}
                                {range ? ` · ${range}` : ""}
                                {attack.target ? ` · ${attack.target}` : ""}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  rollCheck(
                                    `Ataque: ${attack.name}`,
                                    attack.attackBonus,
                                  )
                                }
                                className="rounded-lg border border-red-400/35 bg-red-500/10 px-2.5 py-1.5 text-[10px] font-black text-red-100 transition hover:bg-red-500/20"
                              >
                                Ataque {formatModifier(attack.attackBonus)}
                              </button>

                              {attack.damageFormula ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    rollDamage(
                                      `Dano: ${attack.name}`,
                                      `${attack.damageFormula}${
                                        attack.damageBonus === 0
                                          ? ""
                                          : attack.damageBonus > 0
                                            ? `+${attack.damageBonus}`
                                            : `${attack.damageBonus}`
                                      }`,
                                    )
                                  }
                                  className="rounded-lg border border-forge-gold/35 bg-forge-gold/10 px-2.5 py-1.5 text-[10px] font-black text-forge-gold transition hover:bg-forge-gold/20"
                                >
                                  Rolar dano
                                </button>
                              ) : null}

                              {attack.secondaryDamageFormula ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    rollDamage(
                                      `Dano adicional: ${attack.name}`,
                                      attack.secondaryDamageFormula!,
                                    )
                                  }
                                  className="rounded-lg border border-white/15 bg-black/25 px-2.5 py-1.5 text-[10px] font-black text-white/60 transition hover:border-forge-gold/30 hover:text-forge-gold"
                                >
                                  Dano adicional
                                </button>
                              ) : null}
                            </div>
                          </div>

                          {damage ? (
                            <p className="mt-3 text-xs font-black text-forge-gold">
                              Dano: {damage}
                            </p>
                          ) : null}

                          {attack.secondaryDamageFormula ? (
                            <p className="mt-1 text-xs font-bold text-white/55">
                              Dano adicional: {attack.secondaryDamageFormula}
                              {attack.secondaryDamageType
                                ? ` ${attack.secondaryDamageType}`
                                : ""}
                            </p>
                          ) : null}

                          {attack.onHit ? (
                            <p className="mt-2 whitespace-pre-wrap text-xs font-semibold leading-relaxed text-white/60">
                              {attack.onHit}
                            </p>
                          ) : null}
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyText>Nenhum ataque cadastrado.</EmptyText>
                )}
              </Section>

              {(
                ["ACTION", "BONUS_ACTION", "REACTION"] as const
              ).map((kindKey) => {
                const actions = groupedActions[kindKey];

                if (actions.length === 0) {
                  return null;
                }

                return (
                  <Section
                    key={kindKey}
                    title={getActionKindLabel(kindKey)}
                  >
                    <div className="space-y-3">
                      {actions.map((action) => {
                        const actionText = [
                          action.description,
                          action.recharge
                            ? `Recarga: ${action.recharge}`
                            : null,
                          action.maxUses !== null
                            ? `Usos: ${action.uses ?? 0}/${action.maxUses}`
                            : null,
                        ]
                          .filter(Boolean)
                          .join("\n");

                        return (
                          <article
                            key={action.id}
                            className="rounded-xl border border-white/10 bg-black/20 p-3"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <h4 className="text-sm font-black text-white/75">
                                {action.name}
                              </h4>
                              <button
                                type="button"
                                onClick={() =>
                                  publishEffect(
                                    `${sheetKindLabel} usa ${action.name}`,
                                    actionText,
                                  )
                                }
                                className="rounded-lg border border-forge-gold/25 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-[0.08em] text-forge-gold transition hover:bg-forge-gold/10"
                              >
                                Publicar ação
                              </button>
                            </div>
                            <p className="mt-2 whitespace-pre-wrap text-xs font-semibold leading-relaxed text-white/55">
                              {actionText}
                            </p>
                          </article>
                        );
                      })}
                    </div>
                  </Section>
                );
              })}

              <Section title="Multiataque">
                {sheet.multiattacks.length > 0 ? (
                  <div className="space-y-3">
                    {sheet.multiattacks.map((multiattack) => (
                      <article
                        key={multiattack.id}
                        className="rounded-xl border border-white/10 bg-black/20 p-4"
                      >
                        <h4 className="text-sm font-black text-white/75">
                          {multiattack.name}
                        </h4>
                        {multiattack.description ? (
                          <p className="mt-2 text-xs font-semibold leading-relaxed text-white/55">
                            {multiattack.description}
                          </p>
                        ) : null}
                        <div className="mt-3 flex flex-wrap gap-2">
                          {multiattack.entries.map((entry) => (
                            <span
                              key={entry.id}
                              className="rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-[10px] font-black text-white/55"
                            >
                              {entry.quantity}×{" "}
                              {entry.attack?.name ?? entry.action?.name ?? "Ação"}
                            </span>
                          ))}
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <EmptyText>Nenhum multiataque cadastrado.</EmptyText>
                )}
              </Section>

              <Section title="Magias / habilidades mágicas">
                {sheet.magicalAbilities.length > 0 ? (
                  <div className="space-y-3">
                    {sheet.magicalAbilities.map((ability) => {
                      const abilityTitle = ability.spell
                        ? `${ability.name} · ${ability.spell.name}`
                        : ability.name;
                      const abilityText = [
                        ability.description,
                        ability.attackBonus !== null
                          ? `Ataque mágico: ${formatModifier(ability.attackBonus)}`
                          : null,
                        ability.saveDc !== null
                          ? `CD: ${ability.saveDc}`
                          : null,
                        ability.damageFormula
                          ? `Dano: ${ability.damageFormula}${
                              ability.damageBonus === 0
                                ? ""
                                : ` ${ability.damageBonus > 0 ? "+" : ""}${ability.damageBonus}`
                            }${ability.damageType ? ` ${ability.damageType}` : ""}`
                          : null,
                        ability.recharge
                          ? `Recarga: ${ability.recharge}`
                          : null,
                      ]
                        .filter(Boolean)
                        .join("\n");

                      return (
                        <article
                          key={ability.id}
                          className="rounded-xl border border-purple-300/15 bg-purple-950/15 p-3"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <h4 className="text-sm font-black text-purple-100">
                              {abilityTitle}
                            </h4>

                            <div className="flex flex-wrap gap-2">
                              {ability.attackBonus !== null ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    rollCheck(
                                      `Ataque mágico: ${ability.name}`,
                                      ability.attackBonus!,
                                    )
                                  }
                                  className="rounded-lg border border-purple-300/30 bg-purple-500/10 px-2.5 py-1.5 text-[9px] font-black uppercase text-purple-100 transition hover:bg-purple-500/20"
                                >
                                  Ataque {formatModifier(ability.attackBonus)}
                                </button>
                              ) : null}

                              {ability.damageFormula ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    rollDamage(
                                      `Dano mágico: ${ability.name}`,
                                      `${ability.damageFormula}${
                                        ability.damageBonus === 0
                                          ? ""
                                          : ability.damageBonus > 0
                                            ? `+${ability.damageBonus}`
                                            : `${ability.damageBonus}`
                                      }`,
                                    )
                                  }
                                  className="rounded-lg border border-forge-gold/30 bg-forge-gold/10 px-2.5 py-1.5 text-[9px] font-black uppercase text-forge-gold transition hover:bg-forge-gold/20"
                                >
                                  Rolar dano
                                </button>
                              ) : null}

                              {ability.saveDc !== null || ability.description ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    publishEffect(
                                      `Habilidade: ${ability.name}`,
                                      abilityText,
                                    )
                                  }
                                  className="rounded-lg border border-white/15 bg-black/20 px-2.5 py-1.5 text-[9px] font-black uppercase text-white/55 transition hover:border-forge-gold/30 hover:text-forge-gold"
                                >
                                  Publicar
                                </button>
                              ) : null}
                            </div>
                          </div>

                          <p className="mt-2 whitespace-pre-wrap text-xs font-semibold leading-relaxed text-white/55">
                            {abilityText}
                          </p>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyText>Nenhuma habilidade mágica.</EmptyText>
                )}
              </Section>
            </main>

            <aside className="space-y-4">
              <Section title="Defesas">
                <DefenseList
                  label="Resistências"
                  items={defensesByKind.RESISTANCE}
                />
                <DefenseList
                  label="Imunidades"
                  items={defensesByKind.IMMUNITY}
                />
                <DefenseList
                  label="Vulnerabilidades"
                  items={defensesByKind.VULNERABILITY}
                />
              </Section>

              <Section title="Sentidos e idiomas">
                <div className="space-y-3">
                  <div>
                    <p className="text-[9px] font-black uppercase text-white/30">
                      Sentidos
                    </p>
                    <p className="mt-1 text-xs font-semibold leading-relaxed text-white/60">
                      {sheet.senses.length > 0
                        ? sheet.senses
                            .map((sense) =>
                              sense.range !== null
                                ? `${sense.name} ${sense.range} m`
                                : sense.name,
                            )
                            .join(", ")
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase text-white/30">
                      Idiomas
                    </p>
                    <p className="mt-1 text-xs font-semibold leading-relaxed text-white/60">
                      {sheet.languages.length > 0
                        ? sheet.languages
                            .map((entry) => entry.language.name)
                            .join(", ")
                        : "—"}
                    </p>
                  </div>
                </div>
              </Section>

              <Section title="Movimentos">
                <div className="grid grid-cols-2 gap-2">
                  <StatCard label="Terrestre" value={`${sheet.speed} m`} />
                  <StatCard
                    label="Escalada"
                    value={`${sheet.climbSpeed} m`}
                  />
                  <StatCard label="Natação" value={`${sheet.swimSpeed} m`} />
                  <StatCard label="Voo" value={`${sheet.flySpeed} m`} />
                  <StatCard
                    label="Escavação"
                    value={`${sheet.burrowSpeed} m`}
                  />
                </div>
              </Section>

              <Section title="Lore / comportamento">
                <div className="space-y-3 text-xs font-semibold leading-relaxed text-white/60">
                  {!isCreature && npcSheet?.personality ? (
                    <TextDetail
                      label="Personalidade"
                      value={npcSheet.personality}
                    />
                  ) : null}
                  {!isCreature && npcSheet?.motivation ? (
                    <TextDetail
                      label="Motivação"
                      value={npcSheet.motivation}
                    />
                  ) : null}
                  {isCreature && creatureSheet?.habitat ? (
                    <TextDetail
                      label="Habitat"
                      value={creatureSheet.habitat}
                    />
                  ) : null}
                  {sheet.behavior ? (
                    <TextDetail label="Comportamento" value={sheet.behavior} />
                  ) : null}
                  {sheet.tactics ? (
                    <TextDetail label="Táticas" value={sheet.tactics} />
                  ) : null}
                  {sheet.lore ? (
                    <TextDetail label="Lore" value={sheet.lore} />
                  ) : null}
                  {sheet.notes ? (
                    <TextDetail label="Notas" value={sheet.notes} />
                  ) : null}
                </div>
              </Section>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-white/10 bg-black/20 p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-forge-gold/75">
        {title}
      </p>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/25 px-3 py-3">
      <p className="text-[9px] font-black uppercase tracking-[0.12em] text-white/30">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-white">{value}</p>
    </div>
  );
}

function TextBlock({ title, text }: { title: string; text: string }) {
  return (
    <article className="rounded-xl border border-white/10 bg-black/20 p-3">
      <h4 className="text-sm font-black text-white/75">{title}</h4>
      <p className="mt-2 whitespace-pre-wrap text-xs font-semibold leading-relaxed text-white/55">
        {text}
      </p>
    </article>
  );
}

function EmptyText({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold italic text-white/35">{children}</p>
  );
}

function DefenseList({
  label,
  items,
}: {
  label: string;
  items: Sheet["defenses"];
}) {
  return (
    <div className="mb-3 last:mb-0">
      <p className="text-[9px] font-black uppercase text-white/30">{label}</p>
      <p className="mt-1 text-xs font-semibold leading-relaxed text-white/60">
        {items.length > 0
          ? items.map((item) => item.damageType).join(", ")
          : "—"}
      </p>
    </div>
  );
}

function TextDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[9px] font-black uppercase text-white/30">{label}</p>
      <p className="mt-1 whitespace-pre-wrap">{value}</p>
    </div>
  );
}
