import type { CharacterBuilderDraft } from "../types/character-builder-types";

type CharacterReviewVisualIdentityProps = {
  draft: CharacterBuilderDraft;
};

export function CharacterReviewVisualIdentity({
  draft,
}: CharacterReviewVisualIdentityProps) {
  const portraitUrl = draft.portraitUrl.trim();
  const tokenImageUrl = draft.tokenImageUrl.trim();

  return (
    <section className="rounded-2xl border border-zinc-800 bg-black/20 p-5 shadow-[-4px_4px_0_rgba(0,0,0,0.22)]">
      <div className="mb-4 border-b border-zinc-800 pb-4">
        <div
          className="flex items-center gap-2"
          title="Imagem, token e identidade visual do personagem."
        >
          <h4 className="text-sm font-black uppercase tracking-[0.22em] text-forge-gold">
            Identidade visual
          </h4>

          <span
            className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-zinc-700 text-[10px] font-black text-zinc-500"
            title="Imagem, token e identidade visual do personagem."
            aria-label="Informação sobre identidade visual"
          >
            i
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_120px]">
        <div className="space-y-3">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-500">
              Nome
            </p>

            <p className="mt-1 text-lg font-black leading-tight text-zinc-100">
              {draft.name || "Personagem sem nome"}
            </p>
          </div>

          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-500">
              Pronomes
            </p>

            <p className="mt-1 text-sm font-bold text-zinc-300">
              {draft.pronouns || "Não definidos"}
            </p>
          </div>

          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-500">
              Conceito
            </p>

            <p className="mt-1 line-clamp-4 text-sm font-bold leading-relaxed text-zinc-300">
              {draft.concept || "Conceito ainda não preenchido."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-1">
          <div
            className="aspect-square overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/70"
            title="Retrato do personagem"
          >
            {portraitUrl ? (
              <img
                src={portraitUrl}
                alt={`Retrato de ${draft.name || "personagem"}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center px-3 text-center text-[10px] font-black uppercase tracking-[0.18em] text-zinc-600">
                Sem retrato
              </div>
            )}
          </div>

          <div
            className="aspect-square overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/70"
            title="Token do personagem"
          >
            {tokenImageUrl ? (
              <img
                src={tokenImageUrl}
                alt={`Token de ${draft.name || "personagem"}`}
                className={
                  draft.tokenImageFit === "CONTAIN"
                    ? "h-full w-full object-contain"
                    : draft.tokenImageFit === "COVER"
                      ? "h-full w-full object-cover"
                      : "h-full w-full object-fill"
                }
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center px-3 text-center text-[10px] font-black uppercase tracking-[0.18em] text-zinc-600">
                Sem token
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}