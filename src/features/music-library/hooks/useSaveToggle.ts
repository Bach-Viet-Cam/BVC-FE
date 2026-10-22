import { useCallback, useState } from "react";
import { toast } from "@/shared/components/ui/toast";
import { useViewerRole } from "@/shared/hooks/useViewerRole";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";
import { musicLibraryApi } from "@/features/music-library/api/musicLibraryApi";

type SaveTarget = "song" | "sheet";

interface ToggleOptions {
  target: SaveTarget;
  id: string;
  isSaved: boolean;
  // Cập nhật UI lạc quan; gọi lại với giá trị cũ nếu API lỗi
  onChange: (isSaved: boolean) => void;
}

const ACTIONS = {
  song: { save: musicLibraryApi.saveSong, unsave: musicLibraryApi.unsaveSong, noun: "bài hát" },
  sheet: { save: musicLibraryApi.saveSheet, unsave: musicLibraryApi.unsaveSheet, noun: "bản nhạc" },
};

export function useSaveToggle() {
  const role = useViewerRole();
  const [isGuestPromptOpen, setGuestPromptOpen] = useState(false);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  const toggle = useCallback(
    async ({ target, id, isSaved, onChange }: ToggleOptions) => {
      if (role === "guest") {
        setGuestPromptOpen(true);
        return;
      }
      const action = ACTIONS[target];
      setPendingIds((current) => new Set(current).add(id));
      onChange(!isSaved);
      try {
        await (isSaved ? action.unsave(id) : action.save(id));
        toast.success(isSaved ? `Đã bỏ lưu ${action.noun}` : `Đã lưu ${action.noun}`);
      } catch (error) {
        onChange(isSaved);
        toast.error("Không cập nhật được", getErrorMessage(error));
      } finally {
        setPendingIds((current) => {
          const next = new Set(current);
          next.delete(id);
          return next;
        });
      }
    },
    [role]
  );

  return {
    toggle,
    isPending: (id: string) => pendingIds.has(id),
    canSave: role === "student" || role === "guest",
    // Khách chưa có danh sách lưu: luôn hiện trạng thái chưa lưu dù dữ liệu trả về thế nào
    isSavedForViewer: (isSaved: boolean) => role !== "guest" && isSaved,
    isGuestPromptOpen,
    setGuestPromptOpen,
  };
}
