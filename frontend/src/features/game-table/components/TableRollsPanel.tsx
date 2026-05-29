import type { FormEvent } from "react";

import type {
  DiceTerm,
  RollResult,
  RollVisibility,
} from "../types/game-table-types";

type TableRollsPanelProps = {
  isGM: boolean;
  diceExpression: string;
  rollVisibility: RollVisibility;
  rollError: string;
  customDiceSides: number;
  isCustomDiceOpen: boolean;
  isDiceBuilderOpen: boolean;
  isAdvancedRollOpen: boolean;
  diceTerms: DiceTerm[];
  privateRolls: RollResult[];
  customExpression: string;
  lastRoll:
    | {
        result?: number;
        displayResult?: string;
        dice?: string;
        breakdown?: string;
      }
    | undefined;
  onChangeDiceExpression: (value: string) => void;
  onChangeRollVisibility: (value: RollVisibility) => void;
  onChangeCustomDiceSides: (value: number) => void;
  onToggleCustomDiceOpen: () => void;
  onToggleDiceBuilderOpen: () => void;
  onToggleAdvancedRollOpen: () => void;
  onRollExpression: (event: FormEvent<HTMLFormElement>) => void;
  onQuickRoll: (expression: string) => void;
  onRollCustomDice: () => void;
  onAddCustomDiceToBuilder: () => void;
  onAddDiceTerm: () => void;
  onRemoveDiceTerm: (id: string) => void;
  onChangeDiceTerm: (
    id: string,
    field: "quantity" | "sides",
    value: number,
  ) => void;
  onRollCustomBuilder: () => void;
  onRevealPrivateRoll: (roll: RollResult) => void;
  onRollMassNpcInitiative: () => void;
  diceOptions: number[];
  quickRolls: {
    id: string;
    label: string;
    expression: string;
    kind: "dice" | "tens" | "coin";
  }[];
};

export function TableRollsPanel({
  isGM,
  diceExpression,
  rollVisibility,
  rollError,
  customDiceSides,
  isCustomDiceOpen,
  isDiceBuilderOpen,
  isAdvancedRollOpen,
  diceTerms,
  privateRolls,
  customExpression,
  lastRoll,
  onChangeDiceExpression,
  onChangeRollVisibility,
  onChangeCustomDiceSides,
  onToggleCustomDiceOpen,
  onToggleDiceBuilderOpen,
  onToggleAdvancedRollOpen,
  onRollExpression,
  onQuickRoll,
  onRollCustomDice,
  onAddCustomDiceToBuilder,
  onAddDiceTerm,
  onRemoveDiceTerm,
  onChangeDiceTerm,
  onRollCustomBuilder,
  onRevealPrivateRoll,
  onRollMassNpcInitiative,
  diceOptions,
  quickRolls,
}: TableRollsPanelProps) {
  return (
    <section>
      <h2 className="text-base font-black text-forge-gold">Rolagens</h2>


      {isGM ? (
  <div className="mt-5 rounded-xl border border-forge-gold/25 bg-black/25 p-3 shadow-[-4px_4px_0_rgba(0,0,0,0.22)]">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-forge-gold">
          Ordem de iniciativa
        </p>
      </div>
    </div>

    <button
      type="button"
      onClick={onRollMassNpcInitiative}
      className="mt-3 w-full rounded-lg border border-forge-gold/40 bg-forge-gold/10 px-3 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-forge-gold transition hover:border-forge-gold hover:bg-forge-gold/20"
    >
      Rolar iniciativa da mesa
    </button>
  </div>
) : null}

      <form onSubmit={onRollExpression} className="mt-5 space-y-3">
        <label
          htmlFor="diceExpression"
          className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45"
        >
          Expressão
        </label>

        <input
          id="diceExpression"
          value={diceExpression}
          onChange={(event) => onChangeDiceExpression(event.target.value)}
          placeholder="Ex.: 1d20 + 2d4"
          className="h-11 w-full rounded-lg border border-white/15 bg-black/40 px-3 text-xs font-semibold text-white outline-none placeholder:text-white/35 focus:border-forge-gold"
        />

        {isGM ? (
          <div className="grid grid-cols-2 gap-2 rounded-lg border border-forge-gold/20 bg-black/25 p-1">
            <button
              type="button"
              onClick={() => onChangeRollVisibility("public")}
              className={`rounded-md px-2 py-2 text-[10px] font-black uppercase tracking-[0.16em] transition ${
                rollVisibility === "public"
                  ? "bg-forge-purple text-forge-gold"
                  : "text-white/45 hover:text-forge-gold"
              }`}
            >
              Pública
            </button>

            <button
              type="button"
              onClick={() => onChangeRollVisibility("private")}
              className={`rounded-md px-2 py-2 text-[10px] font-black uppercase tracking-[0.16em] transition ${
                rollVisibility === "private"
                  ? "bg-forge-purple text-forge-gold"
                  : "text-white/45 hover:text-forge-gold"
              }`}
            >
              Privada
            </button>
          </div>
        ) : null}

        {rollError ? (
          <p className="rounded-lg border border-red-500/50 bg-red-950/40 px-3 py-2 text-xs font-bold text-red-200">
            {rollError}
          </p>
        ) : null}

        <button
          type="submit"
          className="h-11 w-full rounded-lg border border-forge-gold bg-forge-purple text-xs font-black uppercase tracking-[0.16em] text-forge-gold transition hover:bg-[#4d0d63]"
        >
          Rolar expressão
        </button>
      </form>

      <div className="mt-5">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
          Rolagens rápidas
        </p>

        <div className="mt-3 grid grid-cols-3 gap-2">
          {quickRolls.map((roll) => (
            <button
              key={roll.id}
              type="button"
              onClick={() => onQuickRoll(roll.expression)}
              className="rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-xs font-black text-white/75 transition hover:border-forge-gold/70 hover:text-forge-gold"
            >
              {roll.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-white/10 bg-black/25">
        <button
          type="button"
          onClick={onToggleCustomDiceOpen}
          className="flex w-full items-center justify-between px-4 py-4 text-left transition hover:bg-white/5"
        >
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
              Dado personalizado
            </p>

            <p className="mt-1 text-xs font-semibold text-white/55">
              d3, d5, d30, d1000.
            </p>
          </div>

          <span className="text-lg font-black text-forge-gold">
            {isCustomDiceOpen ? "−" : "+"}
          </span>
        </button>

        {isCustomDiceOpen ? (
          <div className="border-t border-white/10 p-4">
            <p className="text-xs font-semibold text-white/55">
              Use para sistemas com dados fora do padrão.
            </p>

            <div className="mt-3 flex gap-2">
              <div className="flex h-10 items-center rounded-lg border border-white/15 bg-black/40 px-3 text-xs font-black text-white/40">
                d
              </div>

              <input
                id="customDiceSides"
                type="number"
                min={2}
                max={1000}
                value={customDiceSides}
                onChange={(event) =>
                  onChangeCustomDiceSides(Number(event.target.value))
                }
                aria-label="Quantidade de lados do dado personalizado"
                className="h-10 min-w-0 flex-1 rounded-lg border border-white/15 bg-black/40 px-3 text-xs font-bold text-white outline-none focus:border-forge-gold"
              />

              <button
                type="button"
                onClick={onRollCustomDice}
                className="rounded-lg border border-forge-gold bg-forge-purple px-4 text-xs font-black text-forge-gold transition hover:bg-[#4d0d63]"
              >
                Rolar
              </button>
            </div>

            <button
              type="button"
              onClick={onAddCustomDiceToBuilder}
              className="mt-3 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs font-bold text-white/65 transition hover:border-forge-gold/70 hover:text-forge-gold"
            >
              Adicionar ao construtor
            </button>
          </div>
        ) : null}
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-white/10 bg-black/25">
        <button
          type="button"
          onClick={onToggleDiceBuilderOpen}
          className="flex w-full items-center justify-between px-4 py-4 text-left transition hover:bg-white/5"
        >
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
              Construtor de rolagem
            </p>

            <p className="mt-1 text-xs font-semibold text-white/55">
              Monte combinações com vários dados.
            </p>
          </div>

          <span className="text-lg font-black text-forge-gold">
            {isDiceBuilderOpen ? "−" : "+"}
          </span>
        </button>

        {isDiceBuilderOpen ? (
          <div className="space-y-3 border-t border-white/10 p-4">
            {diceTerms.map((term) => (
              <div
                key={term.id}
                className="grid grid-cols-[1fr_1fr_auto] gap-2"
              >
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={term.quantity}
                  onChange={(event) =>
                    onChangeDiceTerm(
                      term.id,
                      "quantity",
                      Number(event.target.value),
                    )
                  }
                  aria-label="Quantidade de dados"
                  className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-xs font-bold text-white outline-none focus:border-forge-gold"
                />

                <select
                  value={term.sides}
                  onChange={(event) =>
                    onChangeDiceTerm(
                      term.id,
                      "sides",
                      Number(event.target.value),
                    )
                  }
                  aria-label="Tipo de dado"
                  className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-xs font-bold text-white outline-none focus:border-forge-gold"
                >
                  {diceOptions.map((sides) => (
                    <option key={sides} value={sides}>
                      d{sides}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => onRemoveDiceTerm(term.id)}
                  className="h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-xs font-black text-white/55 transition hover:border-red-400/70 hover:text-red-200"
                >
                  ×
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={onAddDiceTerm}
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs font-bold text-white/65 transition hover:border-forge-gold/70 hover:text-forge-gold"
            >
              + Adicionar dado
            </button>

            <div className="rounded-lg border border-forge-gold/20 bg-black/30 p-3">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
                Expressão gerada
              </p>

              <p className="mt-1 text-sm font-black text-forge-gold">
                {customExpression || "Nenhuma"}
              </p>
            </div>

            <button
              type="button"
              onClick={onRollCustomBuilder}
              className="h-11 w-full rounded-lg border border-forge-gold bg-forge-purple text-xs font-black uppercase tracking-[0.16em] text-forge-gold transition hover:bg-[#4d0d63]"
            >
              Rolar combinação
            </button>
          </div>
        ) : null}
      </div>

      {isGM ? (
        <div className="mt-5 overflow-hidden rounded-xl border border-white/10 bg-black/25">
          <button
            type="button"
            onClick={onToggleAdvancedRollOpen}
            className="flex w-full items-center justify-between px-4 py-4 text-left transition hover:bg-white/5"
          >
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
                Rolagens privadas
              </p>

              <p className="mt-1 text-xs font-semibold text-white/55">
                Revele rolagens ocultas quando quiser.
              </p>
            </div>

            <span className="text-lg font-black text-forge-gold">
              {isAdvancedRollOpen ? "−" : "+"}
            </span>
          </button>

          {isAdvancedRollOpen ? (
            <div className="space-y-3 border-t border-white/10 p-4">
              {privateRolls.length === 0 ? (
                <p className="text-xs font-semibold text-white/45">
                  Nenhuma rolagem privada ainda.
                </p>
              ) : (
                privateRolls.map((roll) => (
                  <div
                    key={roll.id}
                    className="rounded-lg border border-white/10 bg-black/30 p-3"
                  >
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
                      {roll.expression}
                    </p>

                    <p className="mt-1 text-2xl font-black text-forge-gold">
                      {roll.displayResult ?? roll.total}
                    </p>

                    <p className="text-xs font-semibold text-white/50">
                      {roll.breakdown}
                    </p>

                    <button
                      type="button"
                      onClick={() => onRevealPrivateRoll(roll)}
                      className="mt-3 w-full rounded-lg border border-forge-gold/60 bg-forge-purple px-3 py-2 text-xs font-black text-forge-gold transition hover:bg-[#4d0d63]"
                    >
                      Revelar no chat
                    </button>
                  </div>
                ))
              )}
            </div>
          ) : null}
        </div>
      ) : null}

      {lastRoll ? (
        <div className="mt-5 rounded-xl border border-forge-gold/30 bg-forge-purple/25 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
            Última rolagem pública
          </p>

          <p className="mt-2 text-4xl font-black text-forge-gold">
            {lastRoll.displayResult ?? lastRoll.result}
          </p>

          <p className="text-xs font-semibold text-white/55">{lastRoll.dice}</p>

          <p className="mt-1 text-xs font-semibold text-white/45">
            {lastRoll.breakdown}
          </p>
        </div>
      ) : null}
    </section>
  );
}
