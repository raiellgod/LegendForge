import type {
  CharacterBuilderClassOption,
  CharacterBuilderBackgroundOption,
  CharacterBuilderDraft,
  CharacterBuilderEquipmentDraftItem,
  CharacterBuilderEquipmentMode,
  CharacterBuilderEquipmentOption,
  CharacterBuilderOptions,
  StartingEquipmentPlan,
} from "../types/character-builder-types";

export const EQUIPMENT_CATEGORY_ORDER = [
  "WEAPON",
  "ARMOR",
  "SHIELD",
  "TOOL",
  "GEAR",
  "CONSUMABLE",
  "RELIC",
] as const;

export function getEquipmentCategoryLabel(category: string) {
  const labels: Record<string, string> = {
    WEAPON: "Arma",
    ARMOR: "Proteção",
    SHIELD: "Escudo",
    GEAR: "Item",
    TOOL: "Ferramenta",
    CONSUMABLE: "Consumível",
    RELIC: "Relíquia",
  };

  return labels[category] ?? category;
}

export function getEquipmentMainInfo(item: CharacterBuilderEquipmentOption) {
  if (item.damage) {
    return {
      label: "Dano",
      value: item.damage,
    };
  }

  if (item.defense !== null) {
    return {
      label: "Defesa",
      value: `+${item.defense}`,
    };
  }

  if (item.properties) {
    return {
      label: "Propriedades",
      value: item.properties,
    };
  }

  return {
    label: "Tipo",
    value: getEquipmentCategoryLabel(item.category),
  };
}

export function formatEquipmentWeight(weight: number | null) {
  if (weight === null) {
    return "—";
  }

  return `${weight} kg`;
}

export function getEquipmentCategoryDescription(category: string) {
  const descriptions: Record<string, string> = {
    WEAPON: "Armas usadas para ataques corpo a corpo ou à distância.",
    ARMOR:
      "Revestimentos e camadas defensivas aplicadas ao personagem sem definir a roupa visual.",
    SHIELD: "Proteções empunhadas para bloquear golpes e proteger posição.",
    TOOL: "Ferramentas usadas em testes, ofícios, reparos ou especialidades.",
    GEAR: "Itens gerais de exploração, sobrevivência e aventura.",
    CONSUMABLE:
      "Itens de uso limitado, como tônicos, poções e recursos gastos.",
    RELIC:
      "Objetos raros, instáveis ou misteriosos ligados a magia e tecnologia antiga.",
  };

  return descriptions[category] ?? "Equipamentos variados deste sistema.";
}

export function groupEquipmentByCategory(
  equipment: CharacterBuilderEquipmentOption[],
) {
  const categories = Array.from(
    new Set(equipment.map((item) => item.category)),
  ).sort((firstCategory, secondCategory) => {
    const firstIndex = EQUIPMENT_CATEGORY_ORDER.indexOf(
      firstCategory as (typeof EQUIPMENT_CATEGORY_ORDER)[number],
    );

    const secondIndex = EQUIPMENT_CATEGORY_ORDER.indexOf(
      secondCategory as (typeof EQUIPMENT_CATEGORY_ORDER)[number],
    );

    const normalizedFirstIndex =
      firstIndex === -1 ? EQUIPMENT_CATEGORY_ORDER.length : firstIndex;

    const normalizedSecondIndex =
      secondIndex === -1 ? EQUIPMENT_CATEGORY_ORDER.length : secondIndex;

    return normalizedFirstIndex - normalizedSecondIndex;
  });

  return categories.map((category) => ({
    category,
    label: getEquipmentCategoryLabel(category),
    description: getEquipmentCategoryDescription(category),
    items: equipment.filter((item) => item.category === category),
  }));
}

export function normalizeCharacterEquipmentMode(
  value?: string | null,
): CharacterBuilderEquipmentMode {
  return value === "GOLD" ? "GOLD" : "PACKAGE";
}

export function getCharacterEquipmentItemsFromEquipment(
  equipment?: Array<{
    quantity: number;
    source: string | null;
    notes: string | null;
    isEquipped: boolean;
    equipment: {
      key: string;
    };
  }> | null,
): CharacterBuilderEquipmentDraftItem[] {
  return (
    equipment?.map((sheetEquipment) => ({
      key: sheetEquipment.equipment.key,
      quantity: sheetEquipment.quantity,
      source: sheetEquipment.source === "background" ? "background" : "class",
      notes: sheetEquipment.notes ?? undefined,
      isEquipped: sheetEquipment.isEquipped,
    })) ?? []
  );
}

export function getClassStartingEquipmentPlan(
  selectedClass: CharacterBuilderClassOption | undefined,
): StartingEquipmentPlan {
  if (!selectedClass) {
    return {
      label: "Classe não selecionada",
      description:
        "Escolha uma classe para ver o pacote inicial e a alternativa em moedas.",
      gold: 0,
      items: [],
      proficiencies: [],
    };
  }

  const plans: Record<string, StartingEquipmentPlan> = {
    barbarian: {
      label: "Pacote do Bárbaro",
      description:
        "Um conjunto bruto para combate direto e exploração em regiões perigosas.",
      gold: 20,
      proficiencies: ["Armas marciais", "Armaduras leves", "Escudos"],
      items: [
        {
          key: "heavy-axe",
          quantity: 1,
          source: "class",
          notes: "Arma pesada inicial da classe",
          isEquipped: true,
        },
        {
          key: "short-spear",
          quantity: 1,
          source: "class",
          notes: "Arma simples de apoio e arremesso",
        },
        {
          key: "survival-kit",
          quantity: 1,
          source: "class",
          notes: "Pacote de sobrevivência",
        },
      ],
    },
    bard: {
      label: "Pacote do Bardo",
      description: "Equipamento leve para estrada, atuação e defesa básica.",
      gold: 20,
      proficiencies: ["Armas simples", "Instrumentos musicais", "Atuação"],
      items: [
        {
          key: "dagger",
          quantity: 1,
          source: "class",
          notes: "Arma leve inicial",
          isEquipped: true,
        },
        {
          key: "leather-armor",
          quantity: 1,
          source: "class",
          notes: "Proteção leve",
          isEquipped: true,
        },
        {
          key: "adventurer-pouch",
          quantity: 1,
          source: "class",
          notes: "Bolsa de viagem",
        },
      ],
    },
    rogue: {
      label: "Pacote do Ladino",
      description:
        "Ferramentas discretas para infiltração, mobilidade e sobrevivência urbana.",
      gold: 18,
      proficiencies: ["Armas simples", "Ferramentas de ladrão", "Furtividade"],
      items: [
        {
          key: "dagger",
          quantity: 2,
          source: "class",
          notes: "Armas leves iniciais",
          isEquipped: true,
        },
        {
          key: "leather-armor",
          quantity: 1,
          source: "class",
          notes: "Proteção leve",
          isEquipped: true,
        },
        {
          key: "thieves-tools",
          quantity: 1,
          source: "class",
          notes: "Ferramenta de classe",
        },
      ],
    },
    fighter: {
      label: "Pacote do Guerreiro",
      description: "Equipamento marcial equilibrado para linha de frente.",
      gold: 25,
      proficiencies: ["Armas simples", "Armas marciais", "Armaduras"],
      items: [
        {
          key: "longsword",
          quantity: 1,
          source: "class",
          notes: "Arma marcial inicial",
          isEquipped: true,
        },
        {
          key: "reinforced-mail",
          quantity: 1,
          source: "class",
          notes: "Armadura inicial",
          isEquipped: true,
        },
        {
          key: "simple-shield",
          quantity: 1,
          source: "class",
          notes: "Defesa inicial",
          isEquipped: true,
        },
      ],
    },
    technomancer: {
      label: "Pacote do Tecnomante",
      description:
        "Ferramentas e itens para reparos, improviso e tecnologia antiga.",
      gold: 22,
      proficiencies: ["Ferramentas tecnológicas", "Reparo", "Dispositivos"],
      items: [
        {
          key: "technomancer-tools",
          quantity: 1,
          source: "class",
          notes: "Ferramenta principal da classe",
        },
        {
          key: "field-tonic",
          quantity: 1,
          source: "class",
          notes: "Consumível inicial",
        },
        {
          key: "adventurer-pouch",
          quantity: 1,
          source: "class",
          notes: "Bolsa de componentes",
        },
      ],
    },
    necromancer: {
      label: "Pacote do Necromante",
      description:
        "Recursos sombrios e proteção mínima para um conjurador iniciante.",
      gold: 18,
      proficiencies: ["Armas simples", "Relíquias fúnebres", "Ocultismo"],
      items: [
        {
          key: "dagger",
          quantity: 1,
          source: "class",
          notes: "Arma simples inicial",
          isEquipped: true,
        },
        {
          key: "broken-relic",
          quantity: 1,
          source: "class",
          notes: "Foco narrativo inicial",
        },
        {
          key: "adventurer-pouch",
          quantity: 1,
          source: "class",
          notes: "Bolsa de componentes",
        },
      ],
    },
  };

  return (
    plans[selectedClass.key] ?? {
      label: `Pacote de ${selectedClass.name}`,
      description:
        "Pacote inicial genérico enquanto as regras específicas desta classe são refinadas.",
      gold: 15,
      proficiencies: [
        "Proficiências específicas da classe serão refinadas depois",
      ],
      items: [
        {
          key: "dagger",
          quantity: 1,
          source: "class",
          notes: "Arma simples inicial",
          isEquipped: true,
        },
        {
          key: "adventurer-pouch",
          quantity: 1,
          source: "class",
          notes: "Bolsa inicial",
        },
      ],
    }
  );
}

export function getBackgroundStartingEquipmentPlan(
  selectedBackground: CharacterBuilderBackgroundOption | undefined,
): StartingEquipmentPlan {
  if (!selectedBackground) {
    return {
      label: "Antecedente não selecionado",
      description:
        "Escolha um antecedente para ver os itens de origem e a alternativa em moedas.",
      gold: 0,
      items: [],
      proficiencies: [],
    };
  }

  const commonItemsByBackgroundKey: Record<
    string,
    CharacterBuilderEquipmentDraftItem[]
  > = {
    "alley-blade": [
      {
        key: "crowbar",
        quantity: 1,
        source: "background",
        notes: "Item do antecedente",
      },
      {
        key: "dagger",
        quantity: 1,
        source: "background",
        notes: "Item do antecedente",
      },
    ],
    "gutter-child": [
      {
        key: "thieves-tools",
        quantity: 1,
        source: "background",
        notes: "Ferramenta do antecedente",
      },
      {
        key: "dagger",
        quantity: 1,
        source: "background",
        notes: "Item do antecedente",
      },
    ],
    "relic-hunter": [
      {
        key: "crowbar",
        quantity: 1,
        source: "background",
        notes: "Ferramenta de exploração",
      },
      {
        key: "broken-relic",
        quantity: 1,
        source: "background",
        notes: "Relíquia inicial",
      },
    ],
    "frontier-walker": [
      {
        key: "survival-kit",
        quantity: 1,
        source: "background",
        notes: "Kit de fronteira",
      },
      {
        key: "shortbow",
        quantity: 1,
        source: "background",
        notes: "Arma de caça",
      },
    ],
    "collapse-survivor": [
      {
        key: "survival-kit",
        quantity: 1,
        source: "background",
        notes: "Kit de sobrevivente",
      },
      {
        key: "field-tonic",
        quantity: 1,
        source: "background",
        notes: "Consumível inicial",
      },
    ],
  };

  return {
    label: `Origem: ${selectedBackground.name}`,
    description:
      selectedBackground.description ??
      "Itens recebidos pela história do personagem antes da aventura.",
    gold: selectedBackground.startingGold,
    proficiencies: selectedBackground.toolNames,
    items: commonItemsByBackgroundKey[selectedBackground.key] ?? [
      {
        key: "adventurer-pouch",
        quantity: 1,
        source: "background",
        notes: `Item inicial de ${selectedBackground.name}`,
      },
    ],
  };
}

export function mergeStartingEquipmentItems(
  items: CharacterBuilderEquipmentDraftItem[],
) {
  const mergedItems = new Map<string, CharacterBuilderEquipmentDraftItem>();

  for (const item of items) {
    const currentItem = mergedItems.get(item.key);

    if (currentItem) {
      mergedItems.set(item.key, {
        ...currentItem,
        quantity: currentItem.quantity + item.quantity,
        isEquipped: currentItem.isEquipped || item.isEquipped,
      });

      continue;
    }

    mergedItems.set(item.key, item);
  }

  return Array.from(mergedItems.values());
}

export function getStartingEquipmentItemsFromDraft(
  draft: CharacterBuilderDraft,
  options: CharacterBuilderOptions,
) {
  const selectedClass = options.classes.find(
    (option) => option.id === draft.classId,
  );

  const selectedBackground = options.backgrounds.find(
    (option) => option.id === draft.backgroundId,
  );

  const classPlan = getClassStartingEquipmentPlan(selectedClass);
  const backgroundPlan = getBackgroundStartingEquipmentPlan(selectedBackground);

  return mergeStartingEquipmentItems([
    ...(draft.classEquipmentMode === "PACKAGE" ? classPlan.items : []),
    ...(draft.backgroundEquipmentMode === "PACKAGE"
      ? backgroundPlan.items
      : []),
  ]);
}

export function getStartingGoldFromDraft(
  draft: CharacterBuilderDraft,
  options: CharacterBuilderOptions,
) {
  const selectedClass = options.classes.find(
    (option) => option.id === draft.classId,
  );

  const selectedBackground = options.backgrounds.find(
    (option) => option.id === draft.backgroundId,
  );

  const classPlan = getClassStartingEquipmentPlan(selectedClass);
  const backgroundPlan = getBackgroundStartingEquipmentPlan(selectedBackground);

  return (
    (draft.classEquipmentMode === "GOLD" ? classPlan.gold : 0) +
    (draft.backgroundEquipmentMode === "GOLD" ? backgroundPlan.gold : 0)
  );
}
