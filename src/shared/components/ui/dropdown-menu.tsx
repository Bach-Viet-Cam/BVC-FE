import * as React from "react";
import { Menu as BaseMenu } from "@base-ui/react/menu";
import { cn } from "@/shared/utils/cn";

export const DropdownMenu = BaseMenu.Root;
export const DropdownMenuTrigger = BaseMenu.Trigger;

type DropdownMenuItemProps = React.ComponentProps<typeof BaseMenu.Item>;

export function DropdownMenuItem({ className, ...props }: DropdownMenuItemProps) {
  return (
    <BaseMenu.Item
      {...props}
      className={cn(
        "flex cursor-default items-center gap-2 rounded px-2 py-1.5 text-sm text-on-surface outline-none select-none",
        "data-highlighted:bg-primary data-highlighted:text-white",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
    />
  );
}

type DropdownMenuPopupProps = React.ComponentProps<typeof BaseMenu.Popup>;

export function DropdownMenuContent({ className, children, ...props }: DropdownMenuPopupProps) {
  return (
    <BaseMenu.Portal>
      <BaseMenu.Positioner className="z-50 outline-none select-none" sideOffset={6}>
        <BaseMenu.Popup
          {...props}
          className={cn(
            "min-w-44 origin-[var(--transform-origin)] rounded-lg border border-outline-variant/40 bg-surface-container-lowest p-1 shadow-level-2 outline-none",
            "transition-[scale,opacity] duration-100",
            "data-starting-style:scale-[0.98] data-starting-style:opacity-0",
            "data-ending-style:scale-[0.98] data-ending-style:opacity-0",
            className
          )}
        >
          {children}
        </BaseMenu.Popup>
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  );
}

export const DropdownMenuSeparator = BaseMenu.Separator;
export const DropdownMenuGroup = BaseMenu.Group;
export const DropdownMenuGroupLabel = BaseMenu.GroupLabel;
