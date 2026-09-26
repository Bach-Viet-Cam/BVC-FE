import * as React from "react";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { XIcon } from "lucide-react";
import { cn } from "@/shared/utils/cn";

export const Dialog = BaseDialog.Root;
export const DialogTrigger = BaseDialog.Trigger;

type DialogPopupProps = React.ComponentProps<typeof BaseDialog.Popup>;

export function DialogPopup({ className, children, ...props }: DialogPopupProps) {
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
          "fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100dvh-3rem)] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col gap-4 overflow-y-auto",
          "rounded-lg border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-level-2",
          "transition-[scale,opacity] duration-200",
          "data-starting-style:scale-[0.98] data-starting-style:opacity-0",
          "data-ending-style:scale-[0.98] data-ending-style:opacity-0",
          className
        )}
      >
        {children}
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  );
}

type DialogTitleProps = React.ComponentProps<typeof BaseDialog.Title>;

export function DialogTitle({ className, ...props }: DialogTitleProps) {
  return <BaseDialog.Title {...props} className={cn("text-xl font-semibold text-on-surface", className)} />;
}

type DialogDescriptionProps = React.ComponentProps<typeof BaseDialog.Description>;

export function DialogDescription({ className, ...props }: DialogDescriptionProps) {
  return <BaseDialog.Description {...props} className={cn("text-sm text-on-surface-variant", className)} />;
}

type DialogCloseProps = React.ComponentProps<typeof BaseDialog.Close>;

export function DialogClose({ className, children, ...props }: DialogCloseProps) {
  if (children) {
    return (
      <BaseDialog.Close {...props} className={className}>
        {children}
      </BaseDialog.Close>
    );
  }
  return (
    <BaseDialog.Close
      {...props}
      aria-label="Đóng"
      className={cn(
        "absolute top-4 right-4 rounded-md p-1 text-on-surface-variant transition-colors",
        "hover:bg-primary/5 hover:text-primary",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        className
      )}
    >
      <XIcon className="size-4" />
    </BaseDialog.Close>
  );
}
