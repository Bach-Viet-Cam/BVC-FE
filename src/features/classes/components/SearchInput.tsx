import { Search } from "lucide-react";

interface SearchInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function SearchInput({ id, label, value, onChange }: SearchInputProps) {
  return (
    <div className="flex min-w-0 grow items-center gap-[10px] rounded-[22px] border border-bvc-border-strong px-[14px] focus-within:border-bvc-accent">
      <Search size={18} strokeWidth={1.7} className="shrink-0 text-bvc-muted" aria-hidden="true" />
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        type="search"
        maxLength={100}
        placeholder={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-[44px] min-w-0 grow border-none bg-transparent text-[14px] text-bvc-ink outline-none"
      />
    </div>
  );
}
