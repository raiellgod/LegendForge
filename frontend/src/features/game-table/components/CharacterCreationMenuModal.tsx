type CharacterCreationMenuModalProps = {
  isOpen: boolean;
  isGM: boolean;
  hasCharacterDraft: boolean;
  onClose: () => void;
  onStartNewCharacter: () => void;
  onContinueCharacterDraft: () => void;
  onStartNpcCreation: () => void;
  onStartCreatureCreation: () => void;
};

type CharacterCreationAction =
  | "new-character"
  | "continue-character-draft"
  | "npc"
  | "creature"
  | "bestiary"
  | "npc-template"
  | "direct-sheet";

type CharacterCreationOption = {
  action: CharacterCreationAction;
  title: string;
  description: string;
  label: string;
  isAvailable: boolean;
};

export function CharacterCreationMenuModal({
  isOpen,
  isGM,
  hasCharacterDraft,
  onClose,
  onStartNewCharacter,
  onContinueCharacterDraft,
  onStartNpcCreation,
  onStartCreatureCreation,
}: CharacterCreationMenuModalProps) {
  if (!isOpen) {
    return null;
  }

  const creationOptions: CharacterCreationOption[] = [
    {
      action: "new-character",
      title: "Novo personagem",
      description:
        "Inicie uma ficha nova do zero. Informações de outro personagem ou rascunho não serão carregadas neste fluxo.",
      label: "Disponível",
      isAvailable: true,
    },
    {
      action: "continue-character-draft",
      title: "Continuar rascunho",
      description: hasCharacterDraft
        ? "Retome a ficha de personagem salva anteriormente como rascunho. Fichas já finalizadas não são abertas no builder."
        : "Nenhum rascunho de personagem foi encontrado para você nesta campanha.",
      label: hasCharacterDraft ? "Disponível" : "Sem rascunho",
      isAvailable: hasCharacterDraft,
    },
    {
      action: "npc",
      title: "Criar NPC",
      description:
        "Crie um NPC próprio da campanha. A ficha mecânica completa virá depois com NpcSheet, atributos, perícias, magias, equipamentos e regras de combate.",
      label: isGM ? "Disponível" : "Somente Mestre",
      isAvailable: isGM,
    },
    {
      action: "creature",
      title: "Criar criatura/inimigo",
      description:
        "Crie uma criatura ou inimigo próprio da campanha. O bloco mecânico completo virá depois com bestiário, ações, ataques, vida, defesa e habilidades.",
      label: isGM ? "Disponível" : "Somente Mestre",
      isAvailable: isGM,
    },
    {
      action: "bestiary",
      title: "Importar do bestiário",
      description:
        "Escolha futuramente uma criatura pronta do bestiário do sistema, copie para a biblioteca da campanha e ajuste sua versão própria para esta aventura.",
      label: "Planejado",
      isAvailable: false,
    },
    {
      action: "npc-template",
      title: "NPC/template pronto",
      description:
        "Escolha futuramente um NPC pronto ou template narrativo, copie para a biblioteca da campanha e ajuste sua versão própria para esta aventura.",
      label: "Planejado",
      isAvailable: false,
    },
    {
      action: "direct-sheet",
      title: "Editar ficha diretamente",
      description:
        "Abra futuramente uma ficha vazia e preencha os campos manualmente, sem passar pelo assistente guiado.",
      label: "Planejado",
      isAvailable: false,
    },
  ];

  function handleSelectOption(action: CharacterCreationAction) {
    if (action === "new-character") {
      onStartNewCharacter();
      return;
    }

    if (action === "continue-character-draft") {
      onContinueCharacterDraft();
      return;
    }

    if (action === "npc") {
      onStartNpcCreation();
      return;
    }

    if (action === "creature") {
      onStartCreatureCreation();
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-forge-gold/35 bg-[#18091f] shadow-[-10px_10px_0_rgba(0,0,0,0.45)]">
        <div className="flex items-start justify-between gap-4 border-b border-forge-gold/20 px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-forge-gold/70">
              LegendForge
            </p>

            <h2 className="mt-2 text-2xl font-black text-zinc-100">
              O que deseja fazer?
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-300">
              Comece um personagem novo ou retome futuramente um rascunho
              existente. NPCs e criaturas continuam sendo opções exclusivas do
              Mestre.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-zinc-700 bg-zinc-950/70 px-3 py-2 text-sm font-bold text-zinc-300 transition hover:border-red-400/70 hover:text-red-200"
          >
            Fechar
          </button>
        </div>

        <div className="grid gap-4 p-6 md:grid-cols-2">
          {creationOptions.map((option) => (
            <button
              key={option.action}
              type="button"
              disabled={!option.isAvailable}
              onClick={() => handleSelectOption(option.action)}
              className={[
                "group relative min-h-40 rounded-2xl border p-5 text-left transition",
                "shadow-[-6px_6px_0_rgba(0,0,0,0.35)]",
                option.isAvailable
                  ? "border-forge-gold/45 bg-gradient-to-br from-zinc-950/95 to-[#2a1233] hover:-translate-y-0.5 hover:border-forge-gold hover:shadow-[-8px_8px_0_rgba(0,0,0,0.5)]"
                  : "cursor-not-allowed border-zinc-800 bg-zinc-950/50 opacity-55",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black text-zinc-100">
                    {option.title}
                  </h3>

                  <p className="mt-3 text-sm leading-relaxed text-zinc-300">
                    {option.description}
                  </p>
                </div>

                <span
                  className={[
                    "shrink-0 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em]",
                    option.isAvailable
                      ? "bg-forge-gold text-zinc-950"
                      : "bg-zinc-800 text-zinc-400",
                  ].join(" ")}
                >
                  {option.label}
                </span>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                <span className="text-xs font-bold uppercase tracking-[0.22em] text-zinc-500">
                  {option.isAvailable ? "Disponível agora" : "Indisponível"}
                </span>

                <span
                  className={[
                    "text-sm font-black",
                    option.isAvailable
                      ? "text-forge-gold group-hover:text-amber-200"
                      : "text-zinc-600",
                  ].join(" ")}
                >
                  {option.isAvailable ? "Entrar →" : "Em breve"}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
