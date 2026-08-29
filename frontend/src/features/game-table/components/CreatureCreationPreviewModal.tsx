type CreatureCreationPreviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function CreatureCreationPreviewModal({
  isOpen,
  onClose,
}: CreatureCreationPreviewModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-red-400/35 bg-[#18091f] p-6 shadow-[-10px_10px_0_rgba(0,0,0,0.45)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-red-200/80">
              Criação de criatura
            </p>

            <h2 className="mt-2 text-2xl font-black text-zinc-100">
              Criar criatura/inimigo
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-zinc-300">
              Este fluxo será liberado após o formulário simples de NPC. A ideia
              é criar uma criatura da campanha com nome, iniciais, descrição,
              retrato opcional e destino inicial: mesa ou biblioteca.
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

        <div className="mt-5 rounded-xl border border-white/10 bg-black/25 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
            Origem futura
          </p>

          <p className="mt-2 text-xs font-semibold leading-relaxed text-white/55">
            Criaturas poderão ser criadas manualmente pelo mestre ou importadas
            futuramente do bestiário do sistema para a biblioteca da campanha.
          </p>
        </div>
      </div>
    </div>
  );
}