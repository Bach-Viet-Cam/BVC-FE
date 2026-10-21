import type { ComponentProps } from "react";
import { DialogPopup } from "@/shared/components/ui/dialog";
import { cn } from "@/shared/utils/cn";

type BvcDialogPopupProps = ComponentProps<typeof DialogPopup>;

// Primitive dialog dùng token Material; lớp này phủ lại theo hệ BVC (viền, không đổ bóng, bo 24px)
export function BvcDialogPopup({ className, ...props }: BvcDialogPopupProps) {
  return (
    <DialogPopup
      {...props}
      className={cn(
        "w-[calc(100%-32px)] max-w-[460px] gap-3.5 rounded-3xl border-bvc-border bg-white p-6 text-bvc-ink shadow-none sm:p-[30px]",
        className
      )}
    />
  );
}
