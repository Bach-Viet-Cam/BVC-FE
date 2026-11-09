import { X } from "lucide-react";
import { useLecturerLookup } from "@/features/classes/hooks/useLecturerLookup";
import { type Lecturer } from "@/features/classes/types/classTypes";
import { Chip } from "@/shared/components/bvc/Chip";
import { INPUT_CLASSES } from "@/shared/components/bvc/fieldStyles";
import { Combobox, ComboboxInput, ComboboxItem, ComboboxList, ComboboxPopup } from "@/shared/components/ui/combobox";

interface LecturerPickerProps {
  value: Lecturer[];
  onChange: (lecturers: Lecturer[]) => void;
  excludedIds?: string[];
  label: string;
  id: string;
  disabled?: boolean;
}

// Chọn nhiều giảng viên theo email: gợi ý lấy từ server, giảng viên đã chọn hiện thành chip phía dưới ô nhập
export function LecturerPicker({ value, onChange, excludedIds = [], label, id, disabled }: LecturerPickerProps) {
  const { results, isSearching, search } = useLecturerLookup();
  const hiddenIds = new Set([...excludedIds, ...value.map((lecturer) => lecturer.id)]);
  const suggestions = results.filter((lecturer) => !hiddenIds.has(lecturer.id));

  return (
    <div className="flex flex-col gap-2">
      <Combobox<Lecturer, true>
        multiple
        items={suggestions}
        value={value}
        onValueChange={(lecturers) => onChange(lecturers)}
        onInputValueChange={search}
        itemToStringLabel={(lecturer) => `${lecturer.fullName} · ${lecturer.email}`}
        isItemEqualToValue={(item, current) => item.id === current.id}
        filter={null}
        disabled={disabled}
      >
        <ComboboxInput
          id={id}
          aria-label={label}
          placeholder="Nhập email giảng viên để tìm"
          autoComplete="off"
          className={INPUT_CLASSES}
        />
        <ComboboxPopup emptyMessage={isSearching ? undefined : "Không tìm thấy giảng viên"}>
          <ComboboxList>
            {(lecturer: Lecturer) => (
              <ComboboxItem key={lecturer.id} value={lecturer}>
                {lecturer.fullName} · {lecturer.email}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxPopup>
      </Combobox>
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {value.map((lecturer) => (
            <li key={lecturer.id}>
              <Chip variant="tint">
                <span className="font-medium">{lecturer.fullName}</span>
                <span className="opacity-75">{lecturer.email}</span>
                <button
                  type="button"
                  aria-label={`Bỏ ${lecturer.fullName}`}
                  disabled={disabled}
                  onClick={() => onChange(value.filter((item) => item.id !== lecturer.id))}
                  className="inline-flex size-4 cursor-pointer items-center justify-center rounded-full hover:bg-black/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bvc-accent"
                >
                  <X size={12} aria-hidden="true" />
                </button>
              </Chip>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
