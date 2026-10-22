import { type ClassSummary } from "@/features/classes/types/classTypes";

interface ClassMultiSelectProps {
  classes: ClassSummary[];
  instrumentId: string;
  value: string[];
  onChange: (classIds: string[]) => void;
}

// Checkbox list of the lecturer's ACTIVE classes that study the selected instrument.
export function ClassMultiSelect({ classes, instrumentId, value, onChange }: ClassMultiSelectProps) {
  if (!instrumentId) {
    return <span className="text-[13px] text-bvc-muted">Chọn nhạc cụ trước để xem danh sách lớp.</span>;
  }
  const choices = classes.filter((item) => item.status === "ACTIVE" && item.instrument.id === instrumentId);
  if (choices.length === 0) {
    return <span className="text-[13px] text-bvc-muted">Không có lớp đang hoạt động nào học nhạc cụ này.</span>;
  }

  const toggle = (classId: string) =>
    onChange(value.includes(classId) ? value.filter((id) => id !== classId) : [...value, classId]);

  return (
    <div className="flex flex-col rounded-[13px] border border-bvc-border-strong px-[13px]">
      {choices.map((item) => (
        <label
          key={item.id}
          className="flex min-h-[44px] cursor-pointer items-center gap-[10px] border-t border-bvc-border text-[14px] first:border-t-0"
        >
          <input
            type="checkbox"
            checked={value.includes(item.id)}
            onChange={() => toggle(item.id)}
            className="size-[18px] accent-bvc-ink"
          />
          {item.name}
        </label>
      ))}
    </div>
  );
}
