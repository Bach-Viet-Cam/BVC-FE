import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { vi } from "react-day-picker/locale";
import "react-day-picker/style.css";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";

// Text input masked as dd/MM/yyyy with a calendar popover; value and onChange use yyyy-MM-dd ("" when empty or invalid).
const toDisplay = (isoDate: string) => isoDate.split("-").reverse().join("/");

function parseDisplay(text: string): Date | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text);
  if (!match) return null;
  const [, day, month, year] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  const isReal = date.getFullYear() === Number(year) && date.getMonth() === Number(month) - 1 && date.getDate() === Number(day);
  return isReal ? date : null;
}

const pad = (value: number) => String(value).padStart(2, "0");
const toIso = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

function maskDate(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

interface DateInputProps {
  value: string;
  label: string;
  className: string;
  onChange: (isoDate: string) => void;
}

export function DateInput({ value, label, className, onChange }: DateInputProps) {
  const [text, setText] = useState(value ? toDisplay(value) : "");
  const [isOpen, setIsOpen] = useState(false);
  const selected = parseDisplay(text) ?? undefined;

  const handleText = (raw: string) => {
    const next = maskDate(raw);
    setText(next);
    const parsed = parseDisplay(next);
    onChange(parsed ? toIso(parsed) : "");
  };

  const handlePick = (date: Date | undefined) => {
    if (!date) return;
    setText(toDisplay(toIso(date)));
    onChange(toIso(date));
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <input
        inputMode="numeric"
        aria-label={label}
        placeholder="dd/MM/yyyy"
        value={text}
        onChange={(event) => handleText(event.target.value)}
        className={`${className} pr-10`}
      />
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger
          aria-label={`Chọn ${label.toLowerCase()}`}
          className="absolute top-1/2 right-1.5 flex size-[30px] -translate-y-1/2 cursor-pointer items-center justify-center rounded-[8px] text-bvc-muted transition-colors hover:bg-bvc-surface hover:text-bvc-ink"
        >
          <CalendarDays size={16} />
        </PopoverTrigger>
        <PopoverContent className="w-auto rounded-[14px] border-bvc-border bg-white p-2 shadow-lg [--rdp-accent-color:var(--color-bvc-ink)] [--rdp-accent-background-color:var(--color-bvc-surface)]">
          <DayPicker
            mode="single"
            locale={vi}
            weekStartsOn={1}
            selected={selected}
            defaultMonth={selected}
            onSelect={handlePick}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
