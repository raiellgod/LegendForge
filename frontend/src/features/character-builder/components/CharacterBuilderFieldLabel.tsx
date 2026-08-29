type CharacterBuilderFieldLabelProps = {
  children: string;
  title?: string;
};

export function CharacterBuilderFieldLabel({
  children,
  title,
}: CharacterBuilderFieldLabelProps) {
  return (
    <span
      className="text-xs font-black uppercase tracking-[0.22em] text-zinc-500"
      title={title ?? children}
    >
      {children}
    </span>
  );
}