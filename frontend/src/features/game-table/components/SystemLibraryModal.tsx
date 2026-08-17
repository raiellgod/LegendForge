import type {
  SystemLibrary,
  SystemLibraryEquipment,
  SystemLibrarySpell,
} from "@/features/game-table/types/game-table-types";

type SystemLibraryModalProps = {
  library: SystemLibrary | null;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
};

function getEquipmentSummary(item: SystemLibraryEquipment) {
  const summaryParts = [
    item.category,
    item.damageFormula ? `Dano ${item.damageFormula}` : null,
    typeof item.defense === "number" ? `Defesa +${item.defense}` : null,
    item.cost,
  ].filter(Boolean);

  return summaryParts.join(" · ");
}

function getSpellLevelLabel(level: number) {
  return level === 0 ? "Truque" : `Nível ${level}`;
}

function getSpellSummary(spell: SystemLibrarySpell) {
  return [
    getSpellLevelLabel(spell.level),
    spell.school,
    spell.castingTime,
    spell.range,
  ]
    .filter(Boolean)
    .join(" · ");
}

function SystemLibraryEquipmentPreview({
  item,
}: {
  item: SystemLibraryEquipment;
}) {
  return (
    <article className="rounded-xl border border-white/10 bg-black/30 p-3">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-forge-gold/25 bg-forge-purple/30 text-xs font-black uppercase text-forge-gold">
          {item.imageUrl ? (
            <span
              className="h-full w-full bg-cover bg-center"
              style={{ backgroundImage: `url(${item.imageUrl})` }}
              aria-hidden="true"
            />
          ) : (
            item.name.slice(0, 2)
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-white">
                {item.name}
              </p>

              <p className="mt-1 text-[9px] font-black uppercase tracking-[0.12em] text-white/35">
                {item.category}
              </p>
            </div>

            <span className="rounded-full border border-white/10 bg-black/30 px-2 py-1 text-[9px] font-black uppercase tracking-[0.08em] text-white/40">
              Item
            </span>
          </div>

          <p
            className="mt-2 line-clamp-2 text-xs font-semibold leading-relaxed text-white/55"
            title={item.description || "Sem descrição cadastrada."}
          >
            {item.description || "Sem descrição cadastrada."}
          </p>

          <p className="mt-2 text-[10px] font-bold leading-relaxed text-forge-gold/70">
            {getEquipmentSummary(item) || "Sem resumo mecânico."}
          </p>
        </div>
      </div>
    </article>
  );
}

function SystemLibrarySpellPreview({ spell }: { spell: SystemLibrarySpell }) {
  return (
    <article className="rounded-xl border border-white/10 bg-black/30 p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-white">{spell.name}</p>

          <p className="mt-1 text-[9px] font-black uppercase tracking-[0.12em] text-white/35">
            {getSpellLevelLabel(spell.level)} · {spell.school}
          </p>
        </div>

        <span className="rounded-full border border-white/10 bg-black/30 px-2 py-1 text-[9px] font-black uppercase tracking-[0.08em] text-white/40">
          Magia
        </span>
      </div>

      <p
        className="mt-2 line-clamp-2 text-xs font-semibold leading-relaxed text-white/55"
        title={spell.description || "Sem descrição cadastrada."}
      >
        {spell.description || "Sem descrição cadastrada."}
      </p>

      <p className="mt-2 text-[10px] font-bold leading-relaxed text-forge-gold/70">
        {getSpellSummary(spell)}
      </p>

      <p className="mt-1 text-[10px] font-semibold text-white/35">
        Componentes:{" "}
        {spell.components.length > 0 ? spell.components.join(", ") : "Nenhum"}
        {spell.requiresConcentration ? " · Concentração" : ""}
        {spell.isRitual ? " · Ritual" : ""}
      </p>
    </article>
  );
}

export function SystemLibraryModal({
  library,
  isLoading,
  error,
  onClose,
}: SystemLibraryModalProps) {
  const equipmentPreview = library?.equipment.slice(0, 6) ?? [];
  const spellPreview = library?.spells.slice(0, 6) ?? [];

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <section className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-forge-gold/30 bg-[#140918] shadow-[-8px_8px_0_rgba(0,0,0,0.45)]">
        <header className="border-b border-white/10 px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/40">
                Biblioteca do sistema
              </p>

              <h2 className="mt-1 text-xl font-black text-forge-gold">
                Conteúdo reutilizável
              </h2>

              <p className="mt-2 max-w-3xl text-xs font-semibold leading-relaxed text-white/55">
                Catálogo-base pertencente ao sistema da campanha. Nesta etapa,
                a biblioteca expõe itens e magias sem alterar o conteúdo
                original do sistema.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-sm font-black text-white/45 transition hover:border-forge-gold/40 hover:text-forge-gold"
              aria-label="Fechar biblioteca do sistema"
              title="Fechar biblioteca do sistema"
            >
              ×
            </button>
          </div>
        </header>

        <div className="overflow-y-auto px-5 py-5">
          {isLoading ? (
            <div className="rounded-xl border border-white/10 bg-black/25 px-4 py-8 text-center">
              <p className="text-sm font-black text-white">
                Carregando biblioteca do sistema...
              </p>
              <p className="mt-2 text-xs font-semibold text-white/40">
                Consultando itens e magias vinculados ao sistema da campanha.
              </p>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-4">
              <p className="text-sm font-black text-red-100">
                Não foi possível carregar a biblioteca.
              </p>
              <p className="mt-2 text-xs font-semibold leading-relaxed text-red-100/70">
                {error}
              </p>
            </div>
          ) : library ? (
            <div className="space-y-5">
              <section className="rounded-xl border border-forge-gold/20 bg-forge-gold/5 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-forge-gold/70">
                      Sistema atual
                    </p>
                    <p className="mt-1 text-base font-black text-white">
                      {library.system.name}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-white/40">
                      Versão {library.system.version}
                      {library.system.slug
                        ? ` · ${library.system.slug}`
                        : ""}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-forge-gold/25 bg-forge-gold/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-forge-gold">
                      {library.summary.equipmentCount} itens
                    </span>
                    <span className="rounded-full border border-forge-gold/25 bg-forge-gold/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-forge-gold">
                      {library.summary.spellCount} magias
                    </span>
                  </div>
                </div>
              </section>

              <div className="grid gap-5 lg:grid-cols-2">
                <section className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-forge-gold">
                        Itens
                      </p>
                      <p className="mt-1 text-xs font-semibold text-white/40">
                        Prévia do catálogo de equipamentos do sistema.
                      </p>
                    </div>

                    <span className="text-xs font-black text-white/35">
                      {library.summary.equipmentCount}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    {equipmentPreview.length > 0 ? (
                      equipmentPreview.map((item) => (
                        <SystemLibraryEquipmentPreview
                          key={item.id}
                          item={item}
                        />
                      ))
                    ) : (
                      <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-5 text-xs font-semibold text-white/40">
                        Nenhum equipamento cadastrado neste sistema.
                      </div>
                    )}
                  </div>

                  {library.equipment.length > equipmentPreview.length ? (
                    <p className="mt-3 text-center text-[10px] font-bold text-white/30">
                      Exibindo {equipmentPreview.length} de{" "}
                      {library.equipment.length}. A navegação completa será
                      aprofundada nas próximas etapas da Biblioteca.
                    </p>
                  ) : null}
                </section>

                <section className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-forge-gold">
                        Magias
                      </p>
                      <p className="mt-1 text-xs font-semibold text-white/40">
                        Prévia do grimório reutilizável do sistema.
                      </p>
                    </div>

                    <span className="text-xs font-black text-white/35">
                      {library.summary.spellCount}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    {spellPreview.length > 0 ? (
                      spellPreview.map((spell) => (
                        <SystemLibrarySpellPreview
                          key={spell.id}
                          spell={spell}
                        />
                      ))
                    ) : (
                      <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-5 text-xs font-semibold text-white/40">
                        Nenhuma magia cadastrada neste sistema.
                      </div>
                    )}
                  </div>

                  {library.spells.length > spellPreview.length ? (
                    <p className="mt-3 text-center text-[10px] font-bold text-white/30">
                      Exibindo {spellPreview.length} de {library.spells.length}.
                      A navegação completa será aprofundada nas próximas etapas
                      da Biblioteca.
                    </p>
                  ) : null}
                </section>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 bg-black/25 px-4 py-8 text-center">
              <p className="text-sm font-black text-white">
                Biblioteca ainda não carregada.
              </p>
              <p className="mt-2 text-xs font-semibold text-white/40">
                O conteúdo será carregado a partir do sistema vinculado à
                campanha.
              </p>
            </div>
          )}
        </div>

        <footer className="border-t border-white/10 px-5 py-3">
          <p className="text-[10px] font-semibold leading-relaxed text-white/30">
            A Biblioteca do Sistema é somente leitura nesta fase. Alterações em
            instâncias da campanha não devem modificar o conteúdo-base do
            sistema.
          </p>
        </footer>
      </section>
    </div>
  );
}
