import type { ReactNode } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { cn } from "@/shared/utils/cn";

interface PracticeBottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  className?: string;
}

// Bảng trượt từ dưới lên của các màn luyện tập (mobile); từ md thu gọn thành cột giữa 460px
export function PracticeBottomSheet({ open, onOpenChange, children, className }: PracticeBottomSheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-90 bg-bvc-ink/45 backdrop-blur-sm transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup
          className={cn(
            "fixed inset-x-0 bottom-0 z-100 mx-auto flex max-h-[92dvh] w-full max-w-[460px] flex-col rounded-t-[32px] bg-white text-bvc-ink",
            "transition-transform duration-300 data-ending-style:translate-y-full data-starting-style:translate-y-full",
            className
          )}
        >
          <div aria-hidden className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-bvc-border-strong" />
          {children}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export const PracticeSheetTitle = Dialog.Title;
export const PracticeSheetDescription = Dialog.Description;
export const PracticeSheetClose = Dialog.Close;
