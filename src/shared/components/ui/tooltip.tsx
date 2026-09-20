import * as React from "react";
import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import { cn } from "@/shared/utils/cn";

export const TooltipProvider = BaseTooltip.Provider;
export const Tooltip = BaseTooltip.Root;
export const TooltipTrigger = BaseTooltip.Trigger;

type TooltipPopupProps = React.ComponentProps<typeof BaseTooltip.Popup>;

export function TooltipContent({ className, children, ...props }: TooltipPopupProps) {
  return (
    <BaseTooltip.Portal>
      <BaseTooltip.Positioner className="z-50 outline-none select-none" sideOffset={6}>
        <BaseTooltip.Popup
          {...props}
          className={cn(
            "max-w-xs rounded-md bg-inverse-surface px-2.5 py-1.5 text-xs font-medium text-inverse-on-surface shadow-level-1",
            "transition-[scale,opacity] duration-100",
            "data-starting-style:scale-[0.98] data-starting-style:opacity-0",
            "data-ending-style:scale-[0.98] data-ending-style:opacity-0",
            "data-instant:duration-0",
            className
          )}
        >
          {children}
        </BaseTooltip.Popup>
      </BaseTooltip.Positioner>
    </BaseTooltip.Portal>
  );
}
