import type {
  CharacterBuilderAncestryOption,
  CharacterBuilderBackgroundOption,
  CharacterBuilderLanguageOption,
} from "../types/character-builder-types";

type CharacterLanguagesStepProps = {
  languages: CharacterBuilderLanguageOption[];
  selectedLanguageKeys: string[];
  automaticLanguageKeys: string[];
  requiredLanguageChoiceCount: number;
  selectedAncestry: CharacterBuilderAncestryOption | undefined;
  selectedBackground: CharacterBuilderBackgroundOption | undefined;
  isLoading: boolean;
  error: string | null;
  onToggleLanguage: (languageKey: string) => void;
};

export function CharacterLanguagesStep({
  languages,
  selectedLanguageKeys,
  automaticLanguageKeys,
  requiredLanguageChoiceCount,
  selectedAncestry,
  selectedBackground,
  isLoading,
  error,
  onToggleLanguage,
}: CharacterLanguagesStepProps) {
  const automaticLanguageKeySet = new Set(automaticLanguageKeys);
  const selectedLanguageKeySet = new Set(selectedLanguageKeys);

  const automaticLanguages = automaticLanguageKeys
    .map((languageKey) => {
      return languages.find((language) => language.key === languageKey);
    })
    .filter((language): language is CharacterBuilderLanguageOption => {
      return Boolean(language);
    });

  const selectableLanguages = languages.filter((language) => {
    return !automaticLanguageKeySet.has(language.key);
  });

  const selectedChoiceCount = selectedLanguageKeys.length;
  const remainingChoiceCount = Math.max(
    0,
    requiredLanguageChoiceCount - selectedChoiceCount,
  );

  if (isLoading) {
    return (
      <div className="mt-5 rounded-2xl border border-forge-gold/20 bg-black/20 p-5 text-sm font-bold text-zinc-300">
        Carregando idiomas...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-5 rounded-2xl border border-red-400/30 bg-red-500/10 p-5 text-sm font-bold text-red-200">
        {error}
      </div>
    );
  }

  return (
    <div className="mt-5 space-y-5">
      <section className="rounded-2xl border border-forge-gold/20 bg-black/20 p-5 shadow-[-5px_5px_0_rgba(0,0,0,0.24)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-forge-gold">
              Idiomas automáticos
            </p>

            <h4 className="mt-2 text-xl font-black text-zinc-100">
              Origem cultural e antecedente
            </h4>

            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-400">
              Idiomas da ancestralidade e do antecedente entram como base do
              personagem. As escolhas extras vêm do antecedente.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-3 text-right">
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-500">
              Escolhas extras
            </p>

            <p className="mt-1 text-lg font-black text-forge-gold">
              {selectedChoiceCount}/{requiredLanguageChoiceCount}
            </p>

            <p className="mt-1 text-xs font-bold text-zinc-500">
              {remainingChoiceCount === 0
                ? "Limite preenchido"
                : `${remainingChoiceCount} restante(s)`}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <LanguageSourcePanel
            title="Ancestralidade"
            sourceName={selectedAncestry?.name ?? "Não definida"}
            languages={automaticLanguages.filter((language) => {
              return selectedAncestry?.languageKeys.includes(language.key);
            })}
            emptyMessage="Nenhum idioma automático cadastrado para a ancestralidade."
          />

          <LanguageSourcePanel
            title="Antecedente"
            sourceName={selectedBackground?.name ?? "Não definido"}
            languages={automaticLanguages.filter((language) => {
              return selectedBackground?.languageKeys.includes(language.key);
            })}
            emptyMessage="Nenhum idioma automático cadastrado para o antecedente."
          />
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-forge-gold/80">
              Escolhas extras
            </p>

            <h4 className="mt-2 text-lg font-black text-zinc-100">
              Escolha idiomas adicionais
            </h4>
          </div>

          {requiredLanguageChoiceCount === 0 ? (
            <span className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-zinc-400">
              Sem escolhas extras
            </span>
          ) : null}
        </div>

        {languages.length === 0 ? (
          <p className="mt-5 rounded-xl border border-zinc-800 bg-black/20 p-4 text-sm font-bold text-zinc-400">
            Nenhum idioma encontrado para este sistema.
          </p>
        ) : selectableLanguages.length === 0 ? (
          <p className="mt-5 rounded-xl border border-zinc-800 bg-black/20 p-4 text-sm font-bold text-zinc-400">
            Todos os idiomas disponíveis já são automáticos.
          </p>
        ) : (
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {selectableLanguages.map((language) => {
              const isSelected = selectedLanguageKeySet.has(language.key);
              const isLimitReached =
                !isSelected &&
                selectedChoiceCount >= requiredLanguageChoiceCount;

              return (
                <button
                  key={language.key}
                  type="button"
                  disabled={isLimitReached || requiredLanguageChoiceCount === 0}
                  onClick={() => {
                    onToggleLanguage(language.key);
                  }}
                  title={
                    language.description ??
                    "Idioma sem descrição cadastrada."
                  }
                  className={[
                    "rounded-2xl border p-4 text-left transition hover:-translate-y-0.5",
                    isSelected
                      ? "border-forge-gold bg-forge-gold/10 shadow-[-4px_4px_0_rgba(234,179,8,0.18)]"
                      : "border-zinc-800 bg-black/20 hover:border-forge-gold/50",
                    isLimitReached || requiredLanguageChoiceCount === 0
                      ? "cursor-not-allowed opacity-45 hover:translate-y-0 hover:border-zinc-800"
                      : "",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p
                        className={[
                          "text-base font-black",
                          isSelected ? "text-forge-gold" : "text-zinc-100",
                        ].join(" ")}
                      >
                        {language.name}
                      </p>

                      <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-zinc-400">
                        {language.description ??
                          "Sem descrição cadastrada."}
                      </p>
                    </div>

                    {isSelected ? (
                      <span className="rounded-full border border-forge-gold bg-forge-gold px-2 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-black">
                        Escolhido
                      </span>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function LanguageSourcePanel({
  title,
  sourceName,
  languages,
  emptyMessage,
}: {
  title: string;
  sourceName: string;
  languages: CharacterBuilderLanguageOption[];
  emptyMessage: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">
        {title}
      </p>

      <p className="mt-1 text-sm font-black text-zinc-100">{sourceName}</p>

      {languages.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {languages.map((language) => (
            <span
              key={language.key}
              className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-100"
              title={language.description ?? language.name}
            >
              {language.name}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-xs font-bold leading-relaxed text-zinc-500">
          {emptyMessage}
        </p>
      )}
    </div>
  );
}
