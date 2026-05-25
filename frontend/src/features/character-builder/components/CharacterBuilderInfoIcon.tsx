type CharacterBuilderInfoIconProps = {
  title: string;
  ariaLabel?: string;
};

export function CharacterBuilderInfoIcon({
  title,
  ariaLabel = "Informação",
}: CharacterBuilderInfoIconProps) {
  return (
    <span
      className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-zinc-700 text-[10px] font-black text-zinc-500"
      title={title}
      aria-label={ariaLabel}
    >
      i
    </span>
  );
}