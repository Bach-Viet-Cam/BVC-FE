import * as React from "react";
import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import { CheckIcon } from "lucide-react";
import { cn } from "@/shared/utils/cn";

export const Combobox = BaseCombobox.Root;
export const ComboboxInput = BaseCombobox.Input;
export const ComboboxClear = BaseCombobox.Clear;
export const ComboboxList = BaseCombobox.List;

type ComboboxItemProps = React.ComponentProps<typeof BaseCombobox.Item>;

export function ComboboxItem({ className, children, ...props }: ComboboxItemProps) {
  return (
    <BaseCombobox.Item
      {...props}
      className={cn(
        "grid cursor-default grid-cols-[1rem_1fr] items-center gap-2 rounded px-2 py-1.5 text-sm text-on-surface outline-none select-none",
        "data-highlighted:bg-primary data-highlighted:text-white",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
    >
      <BaseCombobox.ItemIndicator className="col-start-1">
        <CheckIcon className="size-4" />
      </BaseCombobox.ItemIndicator>
      <span className="col-start-2">{children}</span>
    </BaseCombobox.Item>
  );
}

type ComboboxPopupProps = React.ComponentProps<typeof BaseCombobox.Popup> & {
  positionerClassName?: string;
  emptyMessage?: string;
};

// Popup + scrolling list; `children` is the List render function or the items.
export function ComboboxPopup({
  className,
  positionerClassName,
  emptyMessage,
  children,
  ...props
}: ComboboxPopupProps) {
  return (
    <BaseCombobox.Portal>
      <BaseCombobox.Positioner className={cn("z-50 outline-none", positionerClassName)} sideOffset={6}>
        <BaseCombobox.Popup
          {...props}
          className={cn(
            "max-h-[min(320px,var(--available-height))] w-[max(var(--anchor-width),260px)] origin-[var(--transform-origin)] overflow-y-auto rounded-lg border border-outline-variant/40 bg-surface-container-lowest p-1 shadow-level-2 outline-none",
            "transition-[scale,opacity] duration-100",
            "data-starting-style:scale-[0.98] data-starting-style:opacity-0",
            "data-ending-style:scale-[0.98] data-ending-style:opacity-0",
            className
          )}
        >
          {emptyMessage && (
            <BaseCombobox.Empty className="px-2 py-1.5 text-sm text-on-surface-variant empty:hidden">
              {emptyMessage}
            </BaseCombobox.Empty>
          )}
          {children}
        </BaseCombobox.Popup>
      </BaseCombobox.Positioner>
    </BaseCombobox.Portal>
  );
}
