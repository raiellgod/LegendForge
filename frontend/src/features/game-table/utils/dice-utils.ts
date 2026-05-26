import type { DiceTerm, RollResult } from "../types/game-table-types";

export function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function normalizeDiceExpression(expression: string) {
  return expression.toLowerCase().replace(/\s+/g, "").replace(/d%/g, "d100");
}

export function rollDiceExpression(
  expression: string,
  author: string,
): RollResult {
  const normalizedExpression = normalizeDiceExpression(expression);

  if (!normalizedExpression) {
    throw new Error("Digite uma rolagem. Exemplo: 1d20 + 3d4");
  }

  const terms = normalizedExpression.split("+").filter(Boolean);

  if (terms.length === 0) {
    throw new Error("Digite uma rolagem válida.");
  }

  let total = 0;
  const breakdownParts: string[] = [];
  const displayParts: string[] = [];

  for (const term of terms) {
    if (term === "moeda" || term === "coin" || term === "caraoucoroa") {
      const value = Math.floor(Math.random() * 2);
      const face = value === 1 ? "Cara" : "Coroa";

      total += value;
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

      const subtotal = rolls.reduce((sum, roll) => sum + roll, 0);
      const formattedRolls = rolls.map((roll) =>
        roll.toString().padStart(2, "0"),
      );

      total += subtotal;

      breakdownParts.push(
        `${quantity}d10 dezenas [${formattedRolls.join(", ")}]`,
      );

      displayParts.push(formattedRolls.join(", "));

      continue;
    }

    const match = term.match(/^(\d*)d(\d+)$/);

    if (!match) {
      throw new Error(
        "Use apenas dados no formato XdY. Exemplos: 1d20, 3d4, d100, d10t, moeda.",
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

    const subtotal = rolls.reduce((sum, roll) => sum + roll, 0);

    total += subtotal;

    breakdownParts.push(`${quantity}d${sides} [${rolls.join(", ")}]`);
    displayParts.push(rolls.join(", "));
  }

  return {
    id: createId(),
    author,
    expression: normalizedExpression,
    total,
    displayResult: displayParts.length === 1 ? displayParts[0] : undefined,
    breakdown: breakdownParts.join(" + "),
    createdAt: new Date(),
  };
}

export function buildExpressionFromTerms(terms: DiceTerm[]) {
  return terms
    .filter((term) => term.quantity > 0 && term.sides > 1)
    .map((term) => `${term.quantity}d${term.sides}`)
    .join(" + ");
}