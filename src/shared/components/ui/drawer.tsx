import * as React from "react";
import { Drawer as BaseDrawer } from "@base-ui/react/drawer";
import { cn } from "@/shared/utils/cn";

export const Drawer = BaseDrawer.Root;
export const DrawerTrigger = BaseDrawer.Trigger;

type DrawerPopupProps = React.ComponentProps<typeof BaseDrawer.Popup>;

export function DrawerPopup({ className, children, ...props }: DrawerPopupProps) {
  return (
    <BaseDrawer.Portal>
      <BaseDrawer.Backdrop
        className={cn(
          "fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-sm",
          "transition-opacity duration-200",
          "data-starting-style:opacity-0 data-ending-style:opacity-0"
        )}
      />
      <BaseDrawer.Viewport
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 mx-auto flex w-full max-w-lg flex-col gap-4 overflow-y-auto",
          "rounded-t-xl border-t border-outline-variant/30 bg-surface-container-lowest p-6 shadow-level-2",
          "transition-transform duration-200",
          "data-starting-style:translate-y-full data-ending-style:translate-y-full",
          className
        )}
      >
        <BaseDrawer.Popup {...props}>{children}</BaseDrawer.Popup>
      </BaseDrawer.Viewport>
    </BaseDrawer.Portal>
  );
}

export const DrawerTitle = BaseDrawer.Title;
export const DrawerDescription = BaseDrawer.Description;
export const DrawerClose = BaseDrawer.Close;
