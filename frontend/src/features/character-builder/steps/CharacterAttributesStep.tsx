import type {
  CharacterAttributeKey,
  CharacterBuilderAttributes,
} from "../types/character-builder-types";

import {
  CHARACTER_ATTRIBUTE_DEFINITIONS,
  STANDARD_ARRAY_ATTRIBUTE_VALUES,
} from "../constants/character-builder-constants";

import { formatAttributeModifier } from "../utils/attributes";

type CharacterAttributesStepProps = {
  attributes: CharacterBuilderAttributes;
  onChangeAttribute: (
    attributeKey: CharacterAttributeKey,
    value: number | null,
  ) => void;
  onResetAttributes: () => void;
};

export function CharacterAttributesStep({
  attributes,
  onChangeAttribute,
  onResetAttributes,
}: CharacterAttributesStepProps) {
  const selectedValues = CHARACTER_ATTRIBUTE_DEFINITIONS.map(
    (attribute) => attributes[attribute.key],
  ).filter((value): value is number => value !== null);

  const remainingValues = STANDARD_ARRAY_ATTRIBUTE_VALUES.filter(
    (value) => !selectedValues.includes(value),
  );

  const isComplete =
    selectedValues.length === STANDARD_ARRAY_ATTRIBUTE_VALUES.length;

  const statusTitle = isComplete
    ? "Distribuição completa. Você já pode seguir para a próxima etapa."
    : remainingValues.length > 0
      ? `Ainda faltam: ${remainingValues.join(", ")}`
      : "Revise a distribuição dos atributos.";

  return (
    <div className="mt-5 space-y-5">
      <div
        className="rounded-2xl border border-forge-gold/25 bg-[#16091d] p-4 shadow-[-5px_5px_0_rgba(0,0,0,0.28)]"
        title="Escolha onde cada valor será usado. Cada número pode entrar em apenas um atributo."
      >
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-forge-gold/80">
                Forja padrão
              </p>

              <span
                className="flex h-4 w-4 items-center justify-center rounded-full border border-zinc-700 text-[10px] font-black text-zinc-500"
                title="Distribua 15, 14, 13, 12, 10 e 8 sem repetir valores."
                aria-label="Informação sobre distribuição de atributos"
              >
                i
              </span>
            </div>

            <h3 className="mt-2 text-xl font-black text-zinc-100">
              Distribua seus valores de atributo
            </h3>
          </div>

          <div
            className="flex flex-wrap items-center gap-2"
            title={statusTitle}
          >
            {STANDARD_ARRAY_ATTRIBUTE_VALUES.map((value) => {
              const isUsed = selectedValues.includes(value);

              return (
                <span
                  key={value}
                  className={[
                    "rounded-xl border px-3 py-2 text-sm font-black",
                    isUsed
                      ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-200"
                      : "border-forge-gold/40 bg-forge-gold/10 text-forge-gold",
                  ].join(" ")}
                  title={
                    isUsed
                      ? `Valor ${value} já distribuído.`
                      : `Valor ${value} ainda disponível.`
                  }
                >
                  {value}
                </span>
              );
            })}

            <button
              type="button"
              onClick={onResetAttributes}
              title="Limpar distribuição de atributos"
              className="rounded-xl border border-zinc-700 bg-zinc-950/70 px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-zinc-300 transition hover:border-red-400/60 hover:text-red-200"
            >
              Limpar
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {CHARACTER_ATTRIBUTE_DEFINITIONS.map((attribute) => {
          const value = attributes[attribute.key];
          const modifier = formatAttributeModifier(value);

          return (
            <article
              key={attribute.key}
              className={[
                "rounded-2xl border bg-zinc-950/50 p-4 transition shadow-[-4px_4px_0_rgba(0,0,0,0.25)]",
                value === null
                  ? "border-zinc-800"
                  : "border-forge-gold/45 bg-forge-gold/5",
              ].join(" ")}
            >
              <div
                className="grid grid-cols-[minmax(0,1fr)_80px] items-start gap-3"
                title={attribute.description}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-forge-gold/80">
                      {attribute.shortName}
                    </p>

                    <span
                      className="flex h-4 w-4 items-center justify-center rounded-full border border-zinc-700 text-[10px] font-black text-zinc-500"
                      title={attribute.description}
                      aria-label={`Informação sobre ${attribute.name}`}
                    >
                      i
                    </span>
                  </div>

                  <h4
                    className="mt-1 whitespace-nowrap text-[13px] font-black leading-tight text-zinc-100"
                    title={attribute.name}
                  >
                    {attribute.name}
                  </h4>
                </div>

                <div
                  className="w-20 shrink-0 rounded-2xl border border-forge-gold/30 bg-black/35 px-2 py-2 text-center"
                  title={`${attribute.name}: valor ${
                    value ?? "não definido"
                  }, modificador ${modifier}`}
                >
                  <p className="text-[9px] font-black uppercase tracking-[0.16em] text-zinc-500">
                    Valor
                  </p>

                  <p className="text-xl font-black leading-none text-zinc-100">
                    {value ?? "—"}
                  </p>

                  <p className="mt-1 whitespace-nowrap text-[10px] font-black uppercase tracking-[0.08em] text-forge-gold">
                    Mod. {modifier}
                  </p>
                </div>
              </div>

              <div
                className="mt-4 grid grid-cols-6 gap-2"
                title={`Escolha um valor fixo para ${attribute.name}. Valores já usados em outros atributos ficam bloqueados.`}
              >
                {STANDARD_ARRAY_ATTRIBUTE_VALUES.map((optionValue) => {
                  const usedByOtherAttribute =
                    CHARACTER_ATTRIBUTE_DEFINITIONS.find((definition) => {
                      return (
                        definition.key !== attribute.key &&
                        attributes[definition.key] === optionValue
                      );
                    });

                  const isSelected = value === optionValue;
                  const isUnavailable = Boolean(usedByOtherAttribute);

                  return (
                    <button
                      key={optionValue}
                      type="button"
                      disabled={isUnavailable}
                      onClick={() =>
                        onChangeAttribute(attribute.key, optionValue)
                      }
                      className={[
                        "h-10 rounded-xl border text-sm font-black transition",
                        isSelected
                          ? "border-forge-gold bg-forge-gold text-zinc-950 shadow-[-3px_3px_0_rgba(0,0,0,0.35)]"
                          : isUnavailable
                            ? "cursor-not-allowed border-zinc-800 bg-black/20 text-zinc-700"
                            : "border-zinc-700 bg-black/30 text-zinc-200 hover:border-forge-gold/70 hover:bg-forge-gold/10 hover:text-forge-gold",
                      ].join(" ")}
                      title={
                        usedByOtherAttribute
                          ? `Já usado em ${usedByOtherAttribute.name}`
                          : `Escolher ${optionValue} para ${attribute.name}`
                      }
                    >
                      {optionValue}
                    </button>
                  );
                })}
              </div>

              {value !== null ? (
                <button
                  type="button"
                  onClick={() => onChangeAttribute(attribute.key, null)}
                  title={`Remover valor de ${attribute.name}`}
                  className="mt-3 text-[10px] font-black uppercase tracking-[0.16em] text-zinc-600 transition hover:text-red-300"
                >
                  Limpar
                </button>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}