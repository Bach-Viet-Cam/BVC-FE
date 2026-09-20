import * as React from "react";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { XIcon } from "lucide-react";
import { cn } from "@/shared/utils/cn";

export const Sheet = BaseDialog.Root;
export const SheetTrigger = BaseDialog.Trigger;

interface SheetPopupProps extends React.ComponentProps<typeof BaseDialog.Popup> {
  side?: "left" | "right";
}

export function SheetPopup({ side = "right", className, children, ...props }: SheetPopupProps) {
  return (
    <BaseDialog.Portal>
      <BaseDialog.Backdrop
        className={cn(
          "fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-sm",
          "transition-opacity duration-200",
          "data-starting-style:opacity-0 data-ending-style:opacity-0"
        )}
      />
      <BaseDialog.Popup
        {...props}
        className={cn(
          "fixed top-0 z-50 flex h-dvh w-full max-w-sm flex-col gap-4 overflow-y-auto",
          "border-outline-variant/30 bg-surface-container-lowest p-6 shadow-level-2",
          "transition-transform duration-200",
          side === "right" &&
            "right-0 rounded-l-lg border-l data-starting-style:translate-x-full data-ending-style:translate-x-full",
          side === "left" &&
            "left-0 rounded-r-lg border-r data-starting-style:-translate-x-full data-ending-style:-translate-x-full",
          className
        )}
      >
        {children}
        <BaseDialog.Close
          aria-label="Đóng"
          className="absolute top-4 right-4 rounded-md p-1 text-on-surface-variant transition-colors hover:bg-primary/5 hover:text-primary"
        >
          <XIcon className="size-4" />
        </BaseDialog.Close>
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  );
}

export const SheetTitle = BaseDialog.Title;
export const SheetDescription = BaseDialog.Description;
export const SheetClose = BaseDialog.Close;
