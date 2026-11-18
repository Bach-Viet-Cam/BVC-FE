import { useEffect } from "react";
import { type RecordState } from "@/features/practice/types/practiceTypes";

const NATIVE_KEY_TARGETS = new Set(["INPUT", "TEXTAREA", "BUTTON", "SELECT", "A"]);

interface StudioShortcutsOptions {
  rec: RecordState;
  isEnabled: boolean;
  onStart: () => void;
  onCancelCount: () => void;
  onStop: () => void;
  onToggleTake: () => void;
  onDiscard: () => void;
}

// Phím tắt cùng kiểu trang hòa tấu: Space ghi/dừng/nghe lại, R thu lại. Không chiếm phím của nút, ô nhập và thanh tua.
export function useStudioShortcuts({
  rec,
  isEnabled,
  onStart,
  onCancelCount,
  onStop,
  onToggleTake,
  onDiscard,
}: StudioShortcutsOptions) {
  useEffect(() => {
    if (!isEnabled) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (NATIVE_KEY_TARGETS.has(target.tagName) || target.isContentEditable)) return;
      if (target?.getAttribute("role") === "slider") return;

      if (event.code === "Space") {
        event.preventDefault();
        if (rec === "idle") onStart();
        else if (rec === "countin") onCancelCount();
        else if (rec === "recording") onStop();
        else onToggleTake();
      } else if (event.code === "KeyR" && rec === "preview") {
        event.preventDefault();
        onDiscard();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [rec, isEnabled, onStart, onCancelCount, onStop, onToggleTake, onDiscard]);
}
