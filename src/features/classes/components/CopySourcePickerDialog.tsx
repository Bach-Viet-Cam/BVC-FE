import { useState } from "react";
import { classesApi } from "@/features/classes/api/classesApi";
import { SearchInput } from "@/features/classes/components/SearchInput";
import { FormDialog } from "@/shared/components/bvc/FormDialog";
import { useApiQuery } from "@/shared/hooks/useApiQuery";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";

interface CopySourcePickerDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (classId: string) => void;
  isLoading?: boolean;
}

const COPY_INFO =
  "Sẽ sao chép: mã lớp, mô tả, giảng viên cùng dạy và toàn bộ bài tập (nội dung, loại, bản nhạc, BPM, trạng thái). Không sao chép: sinh viên, bài nộp, lộ trình — lớp mới tự lấy lộ trình mới nhất của nhạc cụ.";

function PickerBody({ onSelect, isLoading: isSelecting }: { onSelect: (classId: string) => void; isLoading: boolean }) {
  const [search, setSearch] = useState("");
  const q = useDebouncedValue(search.trim());
  const { data, error, isLoading } = useApiQuery(
    JSON.stringify({ copySourceQuery: q }),
    async () => (await classesApi.listClasses({ status: "ALL", q: q || undefined, limit: 20 })).data.data
  );
  const items = data?.items ?? [];

  return (
    <div className="flex flex-col gap-4 px-6 pt-3 pb-6 sm:px-[30px]">
      <p className="rounded-[12px] bg-bvc-accent-tint p-[12px] text-[13px] font-medium text-bvc-accent-text">
        {COPY_INFO}
      </p>
      {isSelecting && <p className="text-[13.5px] font-medium text-bvc-muted">Đang tải lớp nguồn…</p>}
      <SearchInput id="copy-source-search" label="Tìm lớp theo mã" value={search} onChange={setSearch} />
      {error ? (
        <p role="alert" className="text-[13.5px] text-bvc-error">
          Tải danh sách lớp thất bại. Vui lòng thử lại.
        </p>
      ) : isLoading && !data ? (
        <p className="text-[13.5px] text-bvc-muted">Đang tải…</p>
      ) : items.length === 0 ? (
        <p className="text-[13.5px] text-bvc-muted">Không tìm thấy lớp nào</p>
      ) : (
        <ul className="flex flex-col gap-[8px]">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                disabled={isSelecting}
                onClick={() => onSelect(item.id)}
                className="flex w-full cursor-pointer flex-col gap-[2px] rounded-[16px] border border-bvc-border bg-white p-[14px] text-left text-bvc-ink hover:bg-bvc-soft disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="text-[14px] font-semibold">{item.name}</span>
                <span className="text-[12.5px] text-bvc-muted">{`${item.cohort} · ${item.instrument.name}`}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Lets the lecturer pick an existing class to copy into the new one.
export function CopySourcePickerDialog({ open, onClose, onSelect, isLoading = false }: CopySourcePickerDialogProps) {
  return (
    <FormDialog open={open} onClose={onClose} title="Sao chép từ lớp khác">
      {open ? <PickerBody onSelect={onSelect} isLoading={isLoading} /> : null}
    </FormDialog>
  );
}
