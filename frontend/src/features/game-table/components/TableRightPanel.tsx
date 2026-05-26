import type { ReactNode } from "react";

import type {
  RightPanelTab,
  RightTabItem,
} from "../types/game-table-types";

type TableRightPanelProps = {
  isOpen: boolean;
  activeTab: RightPanelTab;
  tabs: RightTabItem[];
  children: ReactNode;
  onChangeTab: (tab: RightPanelTab) => void;
  onClose: () => void;
};

function getRightTabTitle(tabId: RightPanelTab) {
  if (tabId === "chat") {
    return "Chat";
  }

  if (tabId === "rolls") {
    return "Rolagens";
  }

  if (tabId === "characters") {
    return "Personagens";
  }

  if (tabId === "journal") {
    return "Diário";
  }

  return "Mesa";
}

export function TableRightPanel({
  isOpen,
  activeTab,
  tabs,
  children,
  onChangeTab,
  onClose,
}: TableRightPanelProps) {
  return (
    <aside
      className={`flex min-h-0 flex-col overflow-hidden border-l border-forge-gold/25 bg-[#160a1b] transition-all duration-300 ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="flex shrink-0 items-center border-b border-forge-gold/25">
        <div className="flex min-w-0 flex-1">
          {tabs
            .filter((tab) => tab.visible)
            .map((tab) => {
              const isActive = activeTab === tab.id;
              const title = getRightTabTitle(tab.id);

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onChangeTab(tab.id)}
                  title={title}
                  aria-label={`Abrir aba ${title}`}
                  className={`min-w-0 flex-1 border-r border-white/10 px-1.5 py-3 text-xl font-black leading-none transition last:border-r-0 ${
                    isActive
                      ? "bg-forge-purple text-forge-gold"
                      : "bg-black/25 text-white/45 hover:text-forge-gold"
                  }`}
                >
                  <span className="block leading-none">{tab.label}</span>
                </button>
              );
            })}
        </div>

        <button
          type="button"
          onClick={onClose}
          title="Ocultar painel"
          className="flex h-full w-8 shrink-0 items-center justify-center border-l border-white/10 bg-black/25 text-sm font-black text-white/45 transition hover:text-forge-gold"
          aria-label="Ocultar painel"
        >
          ›
        </button>
      </div>

      {children}
    </aside>
  );
}