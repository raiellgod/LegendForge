type JournalItem = {
  id: string;
  title: string;
  description: string;
  visibility: string;
  hiddenForPlayer?: boolean;
};

type JournalGroupSectionProps = {
  title: string;
  items: JournalItem[];
};

type TableJournalPanelProps = {
  isGM: boolean;
};

function JournalGroupSection({ title, items }: JournalGroupSectionProps) {
  const visibleItems = items.filter((item) => !item.hiddenForPlayer);

  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
        {title}
      </p>

      <div className="mt-3 space-y-2">
        {visibleItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className="w-full rounded-lg border border-white/10 bg-black/30 p-3 text-left transition hover:border-forge-gold/60 hover:bg-forge-purple/20"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-white">
                  {item.title}
                </p>

                <p className="mt-1 line-clamp-2 text-xs font-semibold leading-relaxed text-white/50">
                  {item.description}
                </p>
              </div>

              <span className="shrink-0 rounded-full border border-white/10 bg-black/30 px-2 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-white/45">
                {item.visibility}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export function TableJournalPanel({ isGM }: TableJournalPanelProps) {
  return (
    <section>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-black text-forge-gold">Diário</h2>

          <p className="mt-1 text-xs font-semibold text-white/55">
            Anotações, locais, pistas e documentos da aventura.
          </p>
        </div>

        {isGM ? (
          <button
            type="button"
            className="shrink-0 rounded-lg border border-forge-gold/50 px-3 py-2 text-[10px] font-black text-forge-gold transition hover:bg-forge-purple"
          >
            + Criar
          </button>
        ) : null}
      </div>

      <div className="mt-5 space-y-4">
        <JournalGroupSection
          title="Notas da mesa"
          items={[
            {
              id: "journal-note-1",
              title: "Resumo da última sessão",
              description:
                "O grupo chegou à Primeira Vigília e encontrou sinais de atividade estranha perto da muralha.",
              visibility: "Público",
            },
          ]}
        />

        <JournalGroupSection
          title="Locais"
          items={[
            {
              id: "journal-location-1",
              title: "Primeira Vigília",
              description:
                "Fortificação antiga usada como ponto de passagem entre as terras civilizadas e a região selvagem.",
              visibility: "Público",
            },
            {
              id: "journal-location-2",
              title: "Cripta sob a torre",
              description:
                "Local conhecido pelo mestre. Ainda não revelado aos jogadores.",
              visibility: isGM ? "GM" : "Oculto",
              hiddenForPlayer: !isGM,
            },
          ]}
        />

        <JournalGroupSection
          title="Pistas"
          items={[
            {
              id: "journal-clue-1",
              title: "Símbolo queimado",
              description:
                "Um símbolo escuro foi encontrado no portão norte. Ninguém reconheceu sua origem.",
              visibility: "Público",
            },
          ]}
        />

        <JournalGroupSection
          title="Documentos / PDFs"
          items={[
            {
              id: "journal-doc-1",
              title: "Contrato de escolta",
              description:
                "Documento entregue ao grupo antes da viagem para a Primeira Vigília.",
              visibility: "Público",
            },
          ]}
        />

        <JournalGroupSection
          title="Registro da sessão"
          items={[
            {
              id: "journal-log-1",
              title: "Sessão 01",
              description:
                "Registro inicial da campanha. Depois poderá guardar resumo, data e acontecimentos importantes.",
              visibility: "Público",
            },
          ]}
        />
      </div>
    </section>
  );
}