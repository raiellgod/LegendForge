import type { RightTabItem, SidebarItem } from "../types/game-table-types";

export function getToolbarItems({
  canSeeGmTools,
}: {
  canSeeGmTools: boolean;
}): SidebarItem[] {
  return [
    {
      id: "select",
      label: "Selecionar",
      icon: "↖",
      description: "Selecionar e interagir com elementos da mesa.",
      visible: true,
    },
    {
      id: "pan",
      label: "Mover visão",
      icon: "✋",
      description: "Mover a visão pelo mapa.",
      visible: true,
    },
    {
      id: "measure",
      label: "Medir",
      icon: "📏",
      description: "Medir distância no grid.",
      visible: true,
    },
    {
      id: "draw",
      label: "Desenhar",
      icon: "✎",
      description: "Desenhar marcações na cena.",
      visible: canSeeGmTools,
    },
    {
      id: "fog",
      label: "Névoa",
      icon: "◐",
      description: "Ocultar ou revelar áreas do mapa.",
      visible: canSeeGmTools,
    },
  ];
}

export function getRightTabs(): RightTabItem[] {
  return [
    {
      id: "chat",
      label: "💬",
      visible: true,
    },
    {
      id: "rolls",
      label: "🎲",
      visible: true,
    },
    {
      id: "characters",
      label: "♟",
      visible: true,
    },
    {
      id: "journal",
      label: "📖",
      visible: true,
    },
    {
      id: "settings",
      label: "⚙️",
      visible: true,
    },
  ];
}