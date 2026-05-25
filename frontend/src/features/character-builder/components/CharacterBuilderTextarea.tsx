import { CharacterBuilderFieldLabel } from "./CharacterBuilderFieldLabel";

type CharacterBuilderTextareaProps = {
  label: string;
  value: string;
  placeholder: string;
  title?: string;
  rows?: number;
  onChange: (value: string) => void;
};

export function CharacterBuilderTextarea({
  label,
  value,
  placeholder,
  title,
  rows = 4,
  onChange,
}: CharacterBuilderTextareaProps) {
  return (
    <label className="block space-y-2">
      <CharacterBuilderFieldLabel title={title}>
        {label}
      </CharacterBuilderFieldLabel>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        title={title}
        rows={rows}
        className="w-full resize-none rounded-xl border border-zinc-700 bg-zinc-950/80 px-4 py-3 text-sm font-semibold leading-relaxed text-zinc-100 outline-none transition placeholder:text-zinc-600 hover:border-forge-gold/40 focus:border-amber-300"
      />
    </label>
  );
}