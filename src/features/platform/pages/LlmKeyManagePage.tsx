import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { LlmKeyDeleteDialog } from "@/features/platform/components/LlmKeyDeleteDialog";
import { LlmKeyFormDialog } from "@/features/platform/components/LlmKeyFormDialog";
import { useLlmKeys } from "@/features/platform/hooks/useLlmKeys";
import { LLM_PROVIDER_LABELS, type LlmKeyItem } from "@/features/platform/types/llmKeyTypes";
import { ActionButton } from "@/shared/components/bvc/ActionButton";
import { DesktopPageHeader } from "@/shared/components/bvc/DesktopPageHeader";
import { EmptyState } from "@/shared/components/bvc/EmptyState";
import { TeacherScreen } from "@/shared/components/bvc/TeacherScreen";

function statusLabel(item: LlmKeyItem): string {
  if (item.status === "invalid") return "Key không hợp lệ";
  if (item.status === "disabled") return "Đã tắt";
  if (item.cooldownUntil && new Date(item.cooldownUntil).getTime() > Date.now()) return "Đang nghỉ";
  return "Đang dùng";
}

function formatDate(value: string | null): string {
  return value ? new Date(value).toLocaleString("vi-VN") : "Chưa dùng";
}

export function LlmKeyManagePage() {
  const { items, loading, error, create, update, remove, reload } = useLlmKeys();
  const [editor, setEditor] = useState<{ item: LlmKeyItem | null } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LlmKeyItem | null>(null);

  return (
    <TeacherScreen>
      <DesktopPageHeader
        title="API key LLM"
        actions={
          <ActionButton onClick={() => setEditor({ item: null })}>
            <Plus size={17} aria-hidden />
            Thêm API key
          </ActionButton>
        }
      />
      <div className="mx-auto flex w-full max-w-[1360px] min-w-0 flex-col gap-6 px-[18px] py-6 md:px-8">
        <p className="max-w-[75ch] text-sm leading-relaxed text-bvc-muted">
          Hệ thống xoay vòng các key đang dùng của từng nhà cung cấp khi gọi mô hình AI, và tự chuyển sang nhà cung cấp khác khi nhà cung cấp hiện tại gặp lỗi máy chủ (5xx). Giá trị key không bao giờ hiển thị lại sau khi lưu.
        </p>
        {loading && items.length === 0 ? (
          <p role="status" className="py-12 text-center text-sm text-bvc-muted">
            Đang tải API key...
          </p>
        ) : error ? (
          <EmptyState
            title="Chưa tải được API key"
            description={error}
            actions={<ActionButton onClick={reload}>Thử lại</ActionButton>}
          />
        ) : items.length === 0 ? (
          <EmptyState title="Chưa có API key" description="Thêm API key đầu tiên để bật các tính năng AI." />
        ) : (
          <div className="overflow-x-auto rounded-[16px] border border-bvc-border-strong">
            <table className="w-full border-collapse text-left text-sm">
              <caption className="sr-only">Danh sách API key LLM và trạng thái sử dụng</caption>
              <thead className="border-b border-bvc-border-strong bg-bvc-surface">
                <tr>
                  {["Tên", "Nhà cung cấp", "Trạng thái", "Lần dùng cuối", "Lỗi cuối", "Thành công / Lỗi", "Thao tác"].map((label) => (
                    <th key={label} scope="col" className="px-4 py-3.5 text-xs font-semibold text-bvc-muted">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-bvc-border">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-bvc-surface/30">
                    <td className="px-4 py-4 font-semibold break-words text-bvc-ink">{item.name}</td>
                    <td className="px-4 py-4 text-bvc-ink">{LLM_PROVIDER_LABELS[item.provider] ?? item.provider}</td>
                    <td className="px-4 py-4 text-bvc-ink">{statusLabel(item)}</td>
                    <td className="px-4 py-4 text-bvc-muted">{formatDate(item.lastUsedAt)}</td>
                    <td className="px-4 py-4 text-bvc-muted">{item.lastErrorCode ?? "—"}</td>
                    <td className="font-bvc-mono px-4 py-4 text-bvc-ink">
                      {item.successCount} / {item.failCount}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <ActionButton
                          variant="secondary"
                          aria-label={`Sửa ${item.name}`}
                          onClick={() => setEditor({ item })}
                          className="min-h-11 px-3"
                        >
                          <Pencil size={15} aria-hidden />
                          Sửa
                        </ActionButton>
                        <ActionButton
                          variant="secondary"
                          aria-label={`Xóa ${item.name}`}
                          onClick={() => setDeleteTarget(item)}
                          className="min-h-11 px-3 text-bvc-error"
                        >
                          <Trash2 size={15} aria-hidden />
                          Xóa
                        </ActionButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <LlmKeyFormDialog
        isOpen={editor !== null}
        target={editor?.item ?? null}
        onOpenChange={(isOpen) => !isOpen && setEditor(null)}
        onCreate={create}
        onUpdate={update}
      />
      <LlmKeyDeleteDialog target={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={remove} />
    </TeacherScreen>
  );
}
