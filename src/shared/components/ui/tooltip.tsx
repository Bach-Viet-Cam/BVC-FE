import * as React from "react";
import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import { cn } from "@/shared/utils/cn";

export const TooltipProvider = BaseTooltip.Provider;
export const Tooltip = BaseTooltip.Root;
export const TooltipTrigger = BaseTooltip.Trigger;

export interface TooltipContentProps extends React.ComponentProps<typeof BaseTooltip.Popup> {
  side?: "top" | "bottom" | "left" | "right";
  sideOffset?: number;
}

export function TooltipContent({ className, children, side, sideOffset = 6, ...props }: TooltipContentProps) {
  return (
    <BaseTooltip.Portal>
      <BaseTooltip.Positioner className="z-50 outline-none select-none" side={side} sideOffset={sideOffset}>
        <BaseTooltip.Popup
          {...props}
          className={cn(
            "pointer-events-none max-w-xs rounded-md bg-inverse-surface px-2.5 py-1.5 text-xs font-medium text-inverse-on-surface shadow-level-1",
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

export function ActionTooltip({
  content,
  children,
  side = "top",
  delay = 150,
}: {
  content: React.ReactNode;
  children: React.ReactElement;
  side?: "top" | "bottom" | "left" | "right";
  delay?: number;
}) {
  if (!content) return children;
  return (
    <BaseTooltip.Root>
      <BaseTooltip.Trigger delay={delay} render={children} />
      <TooltipContent side={side}>{content}</TooltipContent>
    </BaseTooltip.Root>
  );
}
