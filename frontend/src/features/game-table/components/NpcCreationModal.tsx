export type SimpleActorCreationDraft = {
  name: string;
  initials: string;
  description: string;
  portraitUrl: string;
  location: "TABLE" | "LIBRARY";
};

export function createEmptySimpleActorCreationDraft(): SimpleActorCreationDraft {
  return {
    name: "",
    initials: "",
    description: "",
    portraitUrl: "",
    location: "TABLE",
  };
}

type NpcCreationModalProps = {
  isOpen: boolean;
  draft: SimpleActorCreationDraft;
  isSaving: boolean;
  error: string | null;
  onChangeDraft: (draft: SimpleActorCreationDraft) => void;
  onSubmit: () => void | Promise<void>;
  onClose: () => void;
};

export function NpcCreationModal({
  isOpen,
  draft,
  isSaving,
  error,
  onChangeDraft,
  onSubmit,
  onClose,
}: NpcCreationModalProps) {
  if (!isOpen) {
    return null;
  }

  function updateDraft<K extends keyof SimpleActorCreationDraft>(
    key: K,
    value: SimpleActorCreationDraft[K],
  ) {
    onChangeDraft({
      ...draft,
      [key]: value,
    });
  }

  const canSubmit = Boolean(draft.name.trim()) && !isSaving;

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-forge-gold/35 bg-[#18091f] shadow-[-10px_10px_0_rgba(0,0,0,0.45)]">
        <header className="flex items-start justify-between gap-4 border-b border-forge-gold/20 px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-forge-gold/70">
              Criação de NPC
            </p>

            <h2 className="mt-2 text-2xl font-black text-zinc-100">
              Criar NPC da campanha
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-300">
              Crie um NPC simples como ator da campanha. Depois ele poderá ter
              token, ficar na mesa ou ser guardado na biblioteca.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-zinc-700 bg-zinc-950/70 px-3 py-2 text-sm font-bold text-zinc-300 transition hover:border-red-400/70 hover:text-red-200"
          >
            Fechar
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          {error ? (
            <p className="mb-4 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm font-bold text-red-200">
              {error}
            </p>
          ) : null}

          <div className="grid gap-4">
            <label className="block">
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-forge-gold/70">
                Nome do NPC
              </span>

              <input
                value={draft.name}
                onChange={(event) => updateDraft("name", event.target.value)}
                placeholder="Ex.: Talia, a informante"
                className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950/70 px-4 py-3 text-sm font-bold text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-forge-gold"
              />
            </label>

            <label className="block">
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-forge-gold/70">
                Iniciais
              </span>

              <input
                value={draft.initials}
                onChange={(event) =>
                  updateDraft("initials", event.target.value.slice(0, 3))
                }
                placeholder="Ex.: TA"
                maxLength={3}
                className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950/70 px-4 py-3 text-sm font-bold uppercase text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-forge-gold"
              />

              <p className="mt-2 text-xs font-semibold leading-relaxed text-zinc-500">
                Se deixar vazio, o sistema usa as iniciais do nome.
              </p>
            </label>

            <label className="block">
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-forge-gold/70">
                Descrição
              </span>

              <textarea
                value={draft.description}
                onChange={(event) =>
                  updateDraft("description", event.target.value)
                }
                placeholder="Resumo do papel do NPC na campanha."
                rows={4}
                className="mt-2 w-full resize-none rounded-xl border border-zinc-700 bg-zinc-950/70 px-4 py-3 text-sm font-semibold leading-relaxed text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-forge-gold"
              />
            </label>

            <label className="block">
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-forge-gold/70">
                URL do retrato
              </span>

              <input
                value={draft.portraitUrl}
                onChange={(event) =>
                  updateDraft("portraitUrl", event.target.value)
                }
                placeholder="Opcional por enquanto"
                className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950/70 px-4 py-3 text-sm font-bold text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-forge-gold"
              />

              <p className="mt-2 text-xs font-semibold leading-relaxed text-zinc-500">
                Upload direto do computador entra na 4.25.
              </p>
            </label>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-forge-gold/70">
                Destino inicial
              </p>

              <div className="mt-2 grid gap-3 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => updateDraft("location", "TABLE")}
                  className={`rounded-xl border p-4 text-left transition ${
                    draft.location === "TABLE"
                      ? "border-forge-gold bg-forge-gold/10 text-forge-gold"
                      : "border-zinc-700 bg-zinc-950/60 text-zinc-300 hover:border-forge-gold/60"
                  }`}
                >
                  <span className="block text-sm font-black">Mesa</span>
                  <span className="mt-2 block text-xs font-semibold leading-relaxed text-zinc-500">
                    O NPC aparece na aba Personagens e pode receber token.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => updateDraft("location", "LIBRARY")}
                  className={`rounded-xl border p-4 text-left transition ${
                    draft.location === "LIBRARY"
                      ? "border-forge-gold bg-forge-gold/10 text-forge-gold"
                      : "border-zinc-700 bg-zinc-950/60 text-zinc-300 hover:border-forge-gold/60"
                  }`}
                >
                  <span className="block text-sm font-black">Biblioteca</span>
                  <span className="mt-2 block text-xs font-semibold leading-relaxed text-zinc-500">
                    O NPC fica guardado para ser trazido à mesa depois.
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <footer className="flex items-center justify-between gap-4 border-t border-forge-gold/20 bg-black/30 px-6 py-4">
          <p className="text-xs font-semibold leading-relaxed text-zinc-500">
            NPCs são atores da campanha, não personagens de jogador.
          </p>

          <button
            type="button"
            disabled={!canSubmit}
            onClick={onSubmit}
            className="rounded-xl border border-forge-gold/50 bg-forge-purple px-4 py-2 text-sm font-black text-forge-gold transition hover:bg-[#4d0d63] disabled:cursor-not-allowed disabled:border-zinc-700 disabled:bg-zinc-900 disabled:text-zinc-600"
          >
            {isSaving ? "Criando..." : "Criar NPC"}
          </button>
        </footer>
      </div>
    </div>
  );
}