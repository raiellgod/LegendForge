import { CharacterBuilderFieldLabel } from "./CharacterBuilderFieldLabel";

type CharacterBuilderTextInputProps = {
  label: string;
  value: string;
  placeholder: string;
  title?: string;
  onChange: (value: string) => void;
};

export function CharacterBuilderTextInput({
  label,
  value,
  placeholder,
  title,
  onChange,
}: CharacterBuilderTextInputProps) {
  return (
    <label className="block space-y-2">
      <CharacterBuilderFieldLabel title={title}>
        {label}
      </CharacterBuilderFieldLabel>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        title={title}
        className="w-full rounded-xl border border-zinc-700 bg-zinc-950/80 px-4 py-3 text-sm font-semibold text-zinc-100 outline-none transition placeholder:text-zinc-600 hover:border-forge-gold/40 focus:border-amber-300"
      />
    </label>
  );
}