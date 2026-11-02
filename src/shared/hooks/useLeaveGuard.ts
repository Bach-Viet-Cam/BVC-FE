import { useEffect, useState } from "react";

// Form có bản nháp đưa hàm này ra ngoài (qua ref) để hộp xác nhận thoát gọi được
export interface DraftFormHandle {
  // false khi dữ liệu chưa hợp lệ hoặc lưu lỗi: form tự hiện lỗi, người dùng ở lại form
  saveDraft: () => Promise<boolean>;
}

interface LeaveGuardOptions {
  isDirty: boolean;
  // Có thì hộp xác nhận hiện thêm nút "Lưu bản nháp"
  onSaveDraft?: () => Promise<boolean>;
}

// Chặn thoát khi form đang nhập dở: guard(leave) hỏi lại trước khi chạy leave, và trình duyệt cảnh báo khi
// tải lại hoặc đóng tab. Truyền confirmProps vào <LeaveConfirmDialog />.
export function useLeaveGuard({ isDirty, onSaveDraft }: LeaveGuardOptions) {
  const [pendingLeave, setPendingLeave] = useState<(() => void) | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  useEffect(() => {
    if (!isDirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty]);

  const guard = (leave: () => void) => {
    if (isDirty) setPendingLeave(() => leave);
    else leave();
  };

  const finish = (shouldLeave: boolean) => {
    const leave = pendingLeave;
    setPendingLeave(null);
    if (shouldLeave) leave?.();
  };

  const saveDraft = onSaveDraft
    ? async () => {
        setIsSavingDraft(true);
        const isSaved = await onSaveDraft();
        setIsSavingDraft(false);
        finish(isSaved);
      }
    : undefined;

  return {
    guard,
    confirmProps: {
      open: pendingLeave !== null,
      isSavingDraft,
      onStay: () => finish(false),
      onLeave: () => finish(true),
      onSaveDraft: saveDraft,
    },
  };
}
