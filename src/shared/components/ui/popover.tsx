import * as React from "react";
import { Popover as BasePopover } from "@base-ui/react/popover";
import { cn } from "@/shared/utils/cn";

export const Popover = BasePopover.Root;
export const PopoverTrigger = BasePopover.Trigger;
export const PopoverTitle = BasePopover.Title;
export const PopoverDescription = BasePopover.Description;
export const PopoverClose = BasePopover.Close;

type PopoverPopupProps = React.ComponentProps<typeof BasePopover.Popup>;

export function PopoverContent({ className, children, ...props }: PopoverPopupProps) {
  return (
    <BasePopover.Portal>
      <BasePopover.Positioner className="z-50 outline-none select-none" sideOffset={8}>
        <BasePopover.Popup
          {...props}
          className={cn(
            "w-72 origin-[var(--transform-origin)] rounded-lg border border-outline-variant/40 bg-surface-container-lowest p-4 shadow-level-2 outline-none",
            "transition-[scale,opacity] duration-100",
            "data-starting-style:scale-[0.98] data-starting-style:opacity-0",
            "data-ending-style:scale-[0.98] data-ending-style:opacity-0",
            className
          )}
        >
          {children}
          <BasePopover.Arrow className="flex data-[side=bottom]:top-[-8px] data-[side=left]:right-[-13px] data-[side=left]:rotate-90 data-[side=right]:left-[-13px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-8px] data-[side=top]:rotate-180">
            <svg width="20" height="10" viewBox="0 0 20 10" fill="none">
              <path
                d="M9.66437 2.60207L4.80758 6.97318C4.07308 7.63423 3.11989 8 2.13172 8H0V10H20V8H18.5349C17.5468 8 16.5936 7.63423 15.8591 6.97318L11.0023 2.60207C10.622 2.2598 10.0447 2.25979 9.66437 2.60207Z"
                className="fill-surface-container-lowest"
              />
              <path
                d="M8.99542 1.85876C9.75604 1.17425 10.9106 1.17422 11.6713 1.85878L16.5281 6.22989C17.0788 6.72568 17.7936 7.00001 18.5349 7.00001L15.89 7L11.0023 2.60207L9.66437 2.60207L4.77734 7L2.13172 7.00001C2.87296 7.00001 3.58773 6.72568 4.13842 6.22989L8.99542 1.85876Z"
                className="fill-outline-variant/40"
              />
            </svg>
          </BasePopover.Arrow>
        </BasePopover.Popup>
      </BasePopover.Positioner>
    </BasePopover.Portal>
  );
}
