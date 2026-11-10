import { useState } from "react";
import { AssignmentKindTag } from "@/features/classes/components/AssignmentKindTag";
import { CopyAssignmentEditDialog } from "@/features/classes/components/CopyAssignmentEditDialog";
import { type CopyAssignmentRow } from "@/features/classes/types/classTypes";
import {
  type AssignmentContentPayload,
  type AssignmentSheetMusic,
} from "@/features/classes/types/teacherAssignmentTypes";
import { sheetMusicLabel } from "@/features/classes/utils/teacherAssignmentFormat";
import { cn } from "@/shared/utils/cn";

interface CopyAssignmentListProps {
  rows: CopyAssignmentRow[];
  instrumentMismatch: boolean;
  instrumentId: string;
  disabled: boolean;
  onToggle: (key: string) => void;
  onToggleAll: (checked: boolean) => void;
  onEdit: (key: string, content: AssignmentContentPayload, sheetMusic: AssignmentSheetMusic | null) => void;
}

const LINK_BUTTON =
  "cursor-pointer text-[13px] font-semibold text-bvc-ink underline disabled:cursor-not-allowed disabled:opacity-50";

export function CopyAssignmentList({
  rows,
  instrumentMismatch,
  instrumentId,
  disabled,
  onToggle,
  onToggleAll,
  onEdit,
}: CopyAssignmentListProps) {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const editingRow = rows.find((r) => r.key === editingKey) ?? null;
  const checkedCount = rows.filter((r) => r.checked).length;
  const allChecked = rows.length > 0 && checkedCount === rows.length;

  return (
    <section className="flex flex-col gap-[10px]">
      <div className="flex items-center justify-between gap-[12px]">
        <h3 className="text-[14px] font-bold text-bvc-ink">{`Bài tập sẽ sao chép (${checkedCount}/${rows.length})`}</h3>
        {rows.length > 0 && (
          <button type="button" disabled={disabled} onClick={() => onToggleAll(!allChecked)} className={LINK_BUTTON}>
            {allChecked ? "Bỏ chọn tất cả" : "Chọn tất cả"}
          </button>
        )}
      </div>

      {instrumentMismatch && (
        <p className="rounded-[12px] bg-bvc-accent-tint p-[12px] text-[13px] font-medium text-bvc-accent-text">
          Nhạc cụ khác lớp nguồn — một số bản nhạc có thể không dùng được.
        </p>
      )}

      {rows.length === 0 ? (
        <p className="text-[13.5px] text-bvc-muted">Lớp nguồn chưa có bài tập</p>
      ) : (
        <ul className="flex flex-col gap-[8px]">
          {rows.map((row) => (
            <li key={row.key} className="flex flex-col gap-[6px]">
              <div
                className={cn(
                  "flex items-start gap-[12px] rounded-[16px] p-[14px] text-bvc-ink",
                  row.error
                    ? "border border-bvc-error bg-white"
                    : row.checked
                      ? "border-2 border-bvc-ink bg-bvc-soft p-[13px]"
                      : "border border-bvc-border bg-white"
                )}
              >
                <button
                  type="button"
                  aria-pressed={row.checked}
                  aria-label={`Sao chép ${row.content.title}`}
                  disabled={disabled}
                  onClick={() => onToggle(row.key)}
                  className={cn(
                    "mt-[1px] flex size-[22px] shrink-0 cursor-pointer items-center justify-center rounded-[7px] text-[14px] font-extrabold",
                    row.checked ? "bg-bvc-ink text-white" : "border-[1.5px] border-bvc-faint text-transparent"
                  )}
                >
                  ✓
                </button>
                <div className="flex min-w-0 grow flex-col gap-[4px]">
                  <span className="text-[14px] font-semibold wrap-break-word">{row.content.title}</span>
                  <div className="flex flex-wrap items-center gap-[6px] text-[12.5px] text-bvc-muted">
                    <AssignmentKindTag kind={row.content.kind} />
                    <span>{row.status === "DRAFT" ? "Nháp" : "Đã đăng"}</span>
                    {row.sheetMusic && (
                      <span>
                        {row.sheetMusic.isAvailable
                          ? sheetMusicLabel(row.sheetMusic)
                          : `${sheetMusicLabel(row.sheetMusic)} (Không còn khả dụng)`}
                      </span>
                    )}
                    {row.content.requiredBpm !== null && <span>{`BPM ${row.content.requiredBpm}`}</span>}
                  </div>
                </div>
                <button
                  type="button"
                  aria-label={`Sửa ${row.content.title}`}
                  disabled={disabled}
                  onClick={() => setEditingKey(row.key)}
                  className={LINK_BUTTON}
                >
                  Sửa
                </button>
              </div>
              {row.error && (
                <p role="alert" className="text-[12.5px] font-medium text-bvc-error">
                  {row.error}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      <CopyAssignmentEditDialog
        row={editingRow}
        instrumentId={instrumentId}
        onClose={() => setEditingKey(null)}
        onApply={(content, sheetMusic) => {
          if (editingKey) onEdit(editingKey, content, sheetMusic);
          setEditingKey(null);
        }}
      />
    </section>
  );
}
