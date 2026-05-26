import type { SidebarItem, ToolMode } from "../types/game-table-types";

type TableLeftToolbarProps = {
  isOpen: boolean;
  activeTool: ToolMode;
  toolbarItems: SidebarItem[];
  onClose: () => void;
  onChangeTool: (tool: ToolMode) => void;
};

export function TableLeftToolbar({
  isOpen,
  activeTool,
  toolbarItems,
  onClose,
  onChangeTool,
}: TableLeftToolbarProps) {
  return (
    <aside
      className={`relative flex flex-col items-center gap-3 overflow-hidden border-r border-forge-gold/25 bg-[#160a1b] py-4 transition-all duration-300 ${
        isOpen ? "px-3 opacity-100" : "px-0 opacity-0"
      }`}
    >
      <button
        type="button"
        onClick={onClose}
        title="Ocultar ferramentas"
        className="mb-1 flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-black/25 text-sm font-black text-white/45 transition hover:border-forge-gold/60 hover:text-forge-gold"
        aria-label="Ocultar ferramentas"
      >
        ‹
      </button>

      {toolbarItems
        .filter((item) => item.visible)
        .map((item) => {
          const isActive = activeTool === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChangeTool(item.id)}
              title={`${item.label} — ${item.description}`}
              className={`flex h-12 w-12 items-center justify-center rounded-xl border text-lg font-black transition ${
                isActive
                  ? "border-forge-gold bg-forge-purple text-forge-gold shadow-[-4px_4px_0_rgba(0,0,0,0.45)]"
                  : "border-white/10 bg-black/30 text-white/65 hover:border-forge-gold/70 hover:text-forge-gold"
              }`}
            >
              {item.icon}
            </button>
          );
        })}

      <div className="mt-auto flex flex-col items-center gap-2">
        <div className="h-px w-10 bg-white/10" />

        <button
          type="button"
          title="Configurações rápidas"
          className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-black/30 text-lg font-black text-white/65 transition hover:border-forge-gold/70 hover:text-forge-gold"
        >
          ⚙
        </button>
      </div>
    </aside>
  );
}