import { CharacterBuilderFieldLabel } from "./CharacterBuilderFieldLabel";

type CharacterBuilderSelectOption = {
  value: string;
  label: string;
  title?: string;
};

type CharacterBuilderSelectProps = {
  label: string;
  value: string;
  placeholder: string;
  title?: string;
  options: CharacterBuilderSelectOption[];
  onChange: (value: string) => void;
};

export function CharacterBuilderSelect({
  label,
  value,
  placeholder,
  title,
  options,
  onChange,
}: CharacterBuilderSelectProps) {
  return (
    <label className="block space-y-2">
      <CharacterBuilderFieldLabel title={title}>
        {label}
      </CharacterBuilderFieldLabel>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        title={title}
        className="w-full rounded-xl border border-zinc-700 bg-zinc-950/80 px-4 py-3 text-sm font-semibold text-zinc-100 outline-none transition hover:border-forge-gold/40 focus:border-amber-300"
      >
        <option value="">{placeholder}</option>

        {options.map((option) => (
          <option key={option.value} value={option.value} title={option.title}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}