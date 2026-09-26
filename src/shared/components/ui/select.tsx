import * as React from "react";
import { Select as BaseSelect } from "@base-ui/react/select";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { cn } from "@/shared/utils/cn";

export const Select = BaseSelect.Root;

type SelectTriggerProps = React.ComponentProps<typeof BaseSelect.Trigger>;

export function SelectTrigger({ className, children, ...props }: SelectTriggerProps) {
  return (
    <BaseSelect.Trigger
      {...props}
      className={cn(
        "flex w-full items-center justify-between gap-2 rounded-md border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm text-on-surface",
        "transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
    >
      {children}
      <BaseSelect.Icon>
        <ChevronDownIcon className="size-4 shrink-0 text-on-surface-variant" />
      </BaseSelect.Icon>
    </BaseSelect.Trigger>
  );
}

export const SelectValue = BaseSelect.Value;
export const SelectLabel = BaseSelect.Label;

type SelectItemProps = React.ComponentProps<typeof BaseSelect.Item>;

export function SelectItem({ className, children, ...props }: SelectItemProps) {
  return (
    <BaseSelect.Item
      {...props}
      className={cn(
        "grid cursor-default grid-cols-[1rem_1fr] items-center gap-2 rounded px-2 py-1.5 text-sm text-on-surface outline-none select-none",
        "data-highlighted:bg-primary data-highlighted:text-white",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
    >
      <BaseSelect.ItemIndicator className="col-start-1">
        <CheckIcon className="size-4" />
      </BaseSelect.ItemIndicator>
      <BaseSelect.ItemText className="col-start-2">{children}</BaseSelect.ItemText>
    </BaseSelect.Item>
  );
}

type SelectPopupProps = React.ComponentProps<typeof BaseSelect.Popup>;

export function SelectPopup({ className, children, ...props }: SelectPopupProps) {
  return (
    <BaseSelect.Portal>
      <BaseSelect.Positioner className="z-50 outline-none select-none" sideOffset={6}>
        <BaseSelect.Popup
          {...props}
          className={cn(
            "min-w-[var(--anchor-width)] origin-[var(--transform-origin)] rounded-lg border border-outline-variant/40 bg-surface-container-lowest p-1 shadow-level-2 outline-none",
            "transition-[scale,opacity] duration-100",
            "data-starting-style:scale-[0.98] data-starting-style:opacity-0",
            "data-ending-style:scale-[0.98] data-ending-style:opacity-0",
            className
          )}
        >
          <BaseSelect.ScrollUpArrow className="flex h-5 w-full cursor-default items-center justify-center text-on-surface-variant">
            <ChevronUpIcon className="size-4" />
          </BaseSelect.ScrollUpArrow>
          <BaseSelect.List className="max-h-[var(--available-height)] overflow-y-auto py-1">{children}</BaseSelect.List>
          <BaseSelect.ScrollDownArrow className="flex h-5 w-full cursor-default items-center justify-center text-on-surface-variant">
            <ChevronDownIcon className="size-4" />
          </BaseSelect.ScrollDownArrow>
        </BaseSelect.Popup>
      </BaseSelect.Positioner>
    </BaseSelect.Portal>
  );
}
