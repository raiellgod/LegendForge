import type {
  DiceTerm,
  RollAdvantageState,
  RollResult,
} from "../types/game-table-types";

export function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function normalizeDiceExpression(expression: string) {
  return expression.toLowerCase().replace(/\s+/g, "").replace(/d%/g, "d100");
}

function normalizeAdvantageCount(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(20, Math.floor(value)));
}

function hasD20Term(expression: string) {
  const terms = expression.match(/[+-]?[^+-]+/g)?.filter(Boolean) ?? [];

  return terms.some((rawTerm) => {
    const term = rawTerm.replace(/^[+-]/, "");

    return /^(\d*)d20$/.test(term);
  });
}

function rollAdvantagePool(quantity: number) {
  const rolls = Array.from({ length: quantity }, () => {
    return Math.floor(Math.random() * 6) + 1;
  });

  return {
    rolls,
    highest: Math.max(...rolls),
  };
}

export function rollDiceExpression(
  expression: string,
  author: string,
  advantageState?: RollAdvantageState,
): RollResult {
  const normalizedExpression = normalizeDiceExpression(expression);

  if (!normalizedExpression) {
    throw new Error("Digite uma rolagem. Exemplo: 1d20 + 3");
  }

  const terms = normalizedExpression.match(/[+-]?[^+-]+/g)?.filter(Boolean) ?? [];

  if (terms.length === 0) {
    throw new Error("Digite uma rolagem válida.");
  }

  let total = 0;
  const breakdownParts: string[] = [];
  const displayParts: string[] = [];

  for (const rawTerm of terms) {
    const sign = rawTerm.startsWith("-") ? -1 : 1;
    const term = rawTerm.replace(/^[+-]/, "");

    if (!term) {
      continue;
    }

    if (/^\d+$/.test(term)) {
      const value = Number(term) * sign;

      total += value;
      breakdownParts.push(value >= 0 ? `+${value}` : String(value));
      displayParts.push(value >= 0 ? `+${value}` : String(value));

      continue;
    }

    if (term === "moeda" || term === "coin" || term === "caraoucoroa") {
      const value = Math.floor(Math.random() * 2);
      const face = value === 1 ? "Cara" : "Coroa";

      total += value * sign;
      breakdownParts.push(`Moeda [${face}]`);
      displayParts.push(face);

      continue;
    }

    const tensMatch = term.match(/^(\d*)d10t$/);

    if (tensMatch) {
      const quantity = tensMatch[1] ? Number(tensMatch[1]) : 1;

      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
        throw new Error("A quantidade de dados deve estar entre 1 e 100.");
      }

      const rolls = Array.from({ length: quantity }, () => {
        return Math.floor(Math.random() * 10) * 10;
      });

      const subtotal = rolls.reduce((sum, roll) => sum + roll, 0) * sign;
      const formattedRolls = rolls.map((roll) =>
        roll.toString().padStart(2, "0"),
      );

      total += subtotal;

      breakdownParts.push(
        `${sign < 0 ? "-" : ""}${quantity}d10 dezenas [${formattedRolls.join(
          ", ",
        )}]`,
      );

      displayParts.push(formattedRolls.join(", "));

      continue;
    }

    const match = term.match(/^(\d*)d(\d+)$/);

    if (!match) {
      throw new Error(
        "Use dados no formato XdY e modificadores numéricos. Exemplos: 1d20, 1d20+3, 3d4-1, d100, d10t, moeda.",
      );
    }

    const quantity = match[1] ? Number(match[1]) : 1;
    const sides = Number(match[2]);

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
      throw new Error("A quantidade de dados deve estar entre 1 e 100.");
    }

    if (!Number.isInteger(sides) || sides < 2 || sides > 1000) {
      throw new Error("O dado precisa ter entre 2 e 1000 lados.");
    }

    const rolls = Array.from({ length: quantity }, () => {
      return Math.floor(Math.random() * sides) + 1;
    });

    const subtotal = rolls.reduce((sum, roll) => sum + roll, 0) * sign;

    total += subtotal;

    breakdownParts.push(
      `${sign < 0 ? "-" : ""}${quantity}d${sides} [${rolls.join(", ")}]`,
    );
    displayParts.push(rolls.join(", "));
  }

  const advantages = normalizeAdvantageCount(advantageState?.advantages ?? 0);
  const disadvantages = normalizeAdvantageCount(
    advantageState?.disadvantages ?? 0,
  );

  const advantageBalance = advantages - disadvantages;

  if ((advantages > 0 || disadvantages > 0) && hasD20Term(normalizedExpression)) {
    breakdownParts.push(
      `Vantagens ${advantages} · Desvantagens ${disadvantages} · Saldo ${advantageBalance >= 0 ? "+" : ""}${advantageBalance}`,
    );

    if (advantageBalance !== 0) {
      const poolSize = Math.abs(advantageBalance);
      const advantagePool = rollAdvantagePool(poolSize);
      const advantageModifier =
        advantageBalance > 0 ? advantagePool.highest : -advantagePool.highest;

      total += advantageModifier;

      breakdownParts.push(
        advantageBalance > 0
          ? `Bônus de vantagem: maior de ${poolSize}d6 [${advantagePool.rolls.join(", ")}] = +${advantagePool.highest}`
          : `Penalidade de desvantagem: maior de ${poolSize}d6 [${advantagePool.rolls.join(", ")}] = -${advantagePool.highest}`,
      );
    } else {
      breakdownParts.push("Vantagens e desvantagens se anularam.");
    }
  }

  return {
    id: createId(),
    author,
    expression: normalizedExpression,
    total,
    displayResult: String(total),
    breakdown: breakdownParts.join(" + ").replace(/\+ -/g, "- "),
    createdAt: new Date(),
  };
}

export function buildExpressionFromTerms(terms: DiceTerm[]) {
  return terms
    .filter((term) => term.quantity > 0 && term.sides > 1)
    .map((term) => `${term.quantity}d${term.sides}`)
    .join(" + ");
}